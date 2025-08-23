import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { DocumentSignatureEventService } from './document-signature-event.service';

export interface SignatureAddedEvent {
  documentId: string;
  signer: string;
  role: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface SignatureVerifiedEvent {
  documentId: string;
  signer: string;
  isValid: boolean;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

@Injectable()
export class BlockchainEventListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainEventListenerService.name);
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private isListening = false;

  // ABI mínimo para los eventos que necesitamos
  private readonly CONTRACT_ABI = [
    "event SignatureAdded(uint256 indexed documentId, address indexed signer, bytes32 role)",
    "event SignatureVerified(uint256 indexed documentId, address indexed signer, bool isValid)"
  ];

  constructor(
    private configService: ConfigService,
    private documentSignatureEventService: DocumentSignatureEventService,
  ) {}

  async onModuleInit() {
    await this.initializeBlockchainConnection();
    await this.startListening();
  }

  async onModuleDestroy() {
    await this.stopListening();
  }

  private async initializeBlockchainConnection() {
    try {
      // Configurar conexión a Avalanche Fuji Testnet
      const rpcUrl = this.configService.get<string>('AVALANCHE_C_CHAIN_RPC') || 
                     'https://api.avax-test.network/ext/bc/C/rpc';
      
      const contractAddress = this.configService.get<string>('DOCUMENT_SIGNATURE_MANAGER_ADDRESS');
      
      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        this.logger.warn('⚠️  Contract address not configured or is null address. Event listening disabled.');
        this.logger.warn('📝 Please deploy DocumentSignatureManager.sol and update DOCUMENT_SIGNATURE_MANAGER_ADDRESS in .env');
        this.logger.warn('🔧 Use Foundry: forge script script/DeployDocumentSignatureManager.s.sol --rpc-url fuji --broadcast');
        return;
      }

      // Inicializar provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Verificar conexión
      const network = await this.provider.getNetwork();
      this.logger.log(`Connected to Avalanche Fuji Testnet: ${network.name} (${network.chainId})`);

      // Verificar que la dirección contiene código (es un contrato)
      const code = await this.provider.getCode(contractAddress);
      if (code === '0x') {
        this.logger.warn(`⚠️  No contract found at address: ${contractAddress}`);
        this.logger.warn('📝 Please verify the contract is deployed on Fuji Testnet');
        return;
      }

      // Inicializar contrato
      this.contract = new ethers.Contract(
        contractAddress,
        this.CONTRACT_ABI,
        this.provider
      );

      this.logger.log(`DocumentSignatureManager contract initialized at: ${contractAddress}`);
    } catch (error) {
      this.logger.error(`Failed to initialize blockchain connection: ${error.message}`);
      throw error;
    }
  }

  private async startListening() {
    if (!this.contract || this.isListening) {
      return;
    }

    try {
      this.isListening = true;
      
      // Escuchar evento SignatureAdded
      this.contract.on('SignatureAdded', async (documentId, signer, role, event) => {
        try {
          const signatureAddedEvent: SignatureAddedEvent = {
            documentId: documentId.toString(),
            signer: signer,
            role: ethers.hexlify(role),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: Date.now()
          };

          this.logger.log(`📝 SignatureAdded Event: Document ${documentId}, Signer ${signer}`);
          
          // Procesar el evento
          await this.documentSignatureEventService.handleSignatureAdded(signatureAddedEvent);
        } catch (error) {
          this.logger.error(`Error processing SignatureAdded event: ${error.message}`);
        }
      });

      // Escuchar evento SignatureVerified
      this.contract.on('SignatureVerified', async (documentId, signer, isValid, event) => {
        try {
          const signatureVerifiedEvent: SignatureVerifiedEvent = {
            documentId: documentId.toString(),
            signer: signer,
            isValid: isValid,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: Date.now()
          };

          this.logger.log(`✅ SignatureVerified Event: Document ${documentId}, Valid: ${isValid}`);
          
          // Procesar el evento
          await this.documentSignatureEventService.handleSignatureVerified(signatureVerifiedEvent);
        } catch (error) {
          this.logger.error(`Error processing SignatureVerified event: ${error.message}`);
        }
      });

      // Escuchar errores del provider
      this.provider.on('error', (error) => {
        this.logger.error(`Provider error: ${error.message}`);
      });

      this.logger.log('🔗 Blockchain event listening started successfully');
      
      // Obtener el último bloque para logging
      const latestBlock = await this.provider.getBlockNumber();
      this.logger.log(`📊 Latest block number: ${latestBlock}`);

    } catch (error) {
      this.logger.error(`Failed to start event listening: ${error.message}`);
      this.isListening = false;
      throw error;
    }
  }

  private async stopListening() {
    if (!this.contract || !this.isListening) {
      return;
    }

    try {
      // Remover todos los listeners
      this.contract.removeAllListeners('SignatureAdded');
      this.contract.removeAllListeners('SignatureVerified');
      this.provider.removeAllListeners('error');
      
      this.isListening = false;
      this.logger.log('🔌 Blockchain event listening stopped');
    } catch (error) {
      this.logger.error(`Error stopping event listening: ${error.message}`);
    }
  }

  // Método para obtener eventos históricos
  async getHistoricalEvents(fromBlock: number, toBlock?: number) {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const filter = {
        address: await this.contract.getAddress(),
        fromBlock: fromBlock,
        toBlock: toBlock || 'latest'
      };

      this.logger.log(`🔍 Fetching historical events from block ${fromBlock} to ${toBlock || 'latest'}`);

      // Obtener eventos SignatureAdded
      const signatureAddedFilter = this.contract.filters.SignatureAdded();
      const signatureAddedEvents = await this.contract.queryFilter(signatureAddedFilter, fromBlock, toBlock);

      // Obtener eventos SignatureVerified
      const signatureVerifiedFilter = this.contract.filters.SignatureVerified();
      const signatureVerifiedEvents = await this.contract.queryFilter(signatureVerifiedFilter, fromBlock, toBlock);

      this.logger.log(`📚 Found ${signatureAddedEvents.length} SignatureAdded and ${signatureVerifiedEvents.length} SignatureVerified events`);

      return {
        signatureAdded: signatureAddedEvents,
        signatureVerified: signatureVerifiedEvents
      };
    } catch (error) {
      this.logger.error(`Error fetching historical events: ${error.message}`);
      throw error;
    }
  }

  // Método para verificar la salud de la conexión
  async checkConnectionHealth(): Promise<boolean> {
    try {
      if (!this.provider) {
        return false;
      }

      await this.provider.getBlockNumber();
      return true;
    } catch (error) {
      this.logger.error(`Connection health check failed: ${error.message}`);
      return false;
    }
  }

  // Getters para información de estado
  getConnectionStatus() {
    return {
      isConnected: !!this.provider,
      isListening: this.isListening,
      contractAddress: this.contract?.target || null,
      rpcUrl: this.provider?._getConnection()?.url || null
    };
  }
}
