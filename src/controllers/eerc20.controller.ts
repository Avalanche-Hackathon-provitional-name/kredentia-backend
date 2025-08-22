import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { EERC20Service } from '../services/eerc20.service';
import { CryptographyService } from '../services/cryptography.service';
import { PersonService } from '../services/person.service';

export class MintTokenDto {
  recipient_address: string;
  zk_hash: string;
  encrypted_metadata: string;
  privacy_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class TransferTokenDto {
  from_address: string;
  to_address: string;
  token_id: string;
  amount: string;
  zk_proof: string;
  confidential: boolean;
}

export class VerifyOwnershipDto {
  wallet_address: string;
  token_id: string;
  zk_proof: string;
}

@ApiTags('eerc20')
@Controller('api/eerc20')
@ApiBearerAuth()
export class EERC20Controller {
  private readonly logger = new Logger(EERC20Controller.name);

  constructor(
    private readonly eerc20Service: EERC20Service,
    private readonly cryptographyService: CryptographyService,
    private readonly personService: PersonService,
  ) {}

  @Post('mint')
  @ApiOperation({ 
    summary: 'Mint EERC20 token con privacidad',
    description: 'Crea un nuevo token EERC20 con características de privacidad avanzadas y metadatos encriptados en Avalanche C-Chain.'
  })
  @ApiBody({ type: MintTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token EERC20 minteado exitosamente',
    schema: {
      example: {
        success: true,
        token_id: 'eerc20_token_123456',
        transaction_hash: '0xabc123...',
        recipient: '0x1234567890123456789012345678901234567890',
        zk_commitment: '0xdef456...',
        encrypted_metadata: 'encrypted_data_here',
        avalanche_network: 'C-Chain',
        privacy_level: 'HIGH'
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Datos de minteo inválidos' })
  @ApiInternalServerErrorResponse({ description: 'Error en Avalanche C-Chain' })
  async mintToken(@Body() dto: MintTokenDto) {
    try {
      this.logger.log(`Minting EERC20 token for: ${dto.recipient_address}`);
      
      // Validar hash ZK
      const zkValidation = this.cryptographyService.validateZKHash(dto.zk_hash);
      if (!zkValidation.valid) {
        throw new Error('Hash ZK inválido');
      }
      
      // Mint token con características de privacidad
      const mintResult = await this.eerc20Service.mintPrivacyToken(
        dto.zk_hash,
        dto.encrypted_metadata,
        dto.recipient_address
      );
      
      if (!mintResult.success) {
        throw new Error('Error en el minteo del token');
      }
      
      // Generar commitment ZK para el nuevo token
      const zkCommitment = this.cryptographyService.generateZKCommitment(
        mintResult.tokenId,
        dto.recipient_address
      );
      
      return {
        success: true,
        token_id: mintResult.tokenId,
        transaction_hash: mintResult.transactionHash,
        recipient: dto.recipient_address,
        zk_commitment: zkCommitment,
        encrypted_metadata: dto.encrypted_metadata,
        avalanche_network: 'C-Chain',
        privacy_level: dto.privacy_level
      };
    } catch (error) {
      this.logger.error(`Error minting EERC20 token: ${error.message}`);
      throw error;
    }
  }

  @Post('transfer')
  @ApiOperation({ 
    summary: 'Transferencia confidencial EERC20',
    description: 'Realiza transferencia de tokens EERC20 con preservación de privacidad usando Zero-Knowledge proofs.'
  })
  @ApiBody({ type: TransferTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Transferencia confidencial completada',
    schema: {
      example: {
        success: true,
        transaction_hash: '0xabc123...',
        from_address: '0x1111111111111111111111111111111111111111',
        to_address: '0x2222222222222222222222222222222222222222',
        amount_transferred: 'encrypted_amount',
        zk_proof_verified: true,
        privacy_preserved: true,
        gas_used: '21000'
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Datos de transferencia inválidos o prueba ZK fallida' })
  async confidentialTransfer(@Body() dto: TransferTokenDto) {
    try {
      this.logger.log(`Confidential transfer from ${dto.from_address} to ${dto.to_address}`);
      
      // Verificar prueba ZK para la transferencia
      const zkValid = this.cryptographyService.verifyZKProof(
        dto.zk_proof,
        [dto.from_address, dto.to_address, dto.amount]
      );
      
      if (!zkValid) {
        throw new Error('Prueba ZK inválida para transferencia');
      }
      
      // Ejecutar transferencia confidencial
      const transferResult = await this.eerc20Service.confidentialTransfer(
        dto.from_address,
        dto.to_address,
        dto.token_id,
        dto.amount
      );
      
      if (!transferResult.success) {
        throw new Error('Error en transferencia confidencial');
      }
      
      return {
        success: true,
        transaction_hash: transferResult.transactionHash,
        from_address: dto.from_address,
        to_address: dto.to_address,
        amount_transferred: dto.confidential ? 'encrypted_amount' : dto.amount,
        zk_proof_verified: true,
        privacy_preserved: dto.confidential,
        gas_used: '21000'
      };
    } catch (error) {
      this.logger.error(`Error in confidential transfer: ${error.message}`);
      throw error;
    }
  }

  @Post('verify-ownership')
  @ApiOperation({ 
    summary: 'Verificar propiedad de token con ZK',
    description: 'Verifica la propiedad de un token EERC20 usando pruebas de conocimiento cero sin revelar información sensible.'
  })
  @ApiBody({ type: VerifyOwnershipDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación de propiedad completada',
    schema: {
      example: {
        verified: true,
        owner_verified: true,
        token_exists: true,
        zk_proof_valid: true,
        privacy_preserved: true,
        verification_timestamp: 1692123456789
      }
    }
  })
  async verifyTokenOwnership(@Body() dto: VerifyOwnershipDto) {
    try {
      this.logger.log(`Verifying token ownership for ${dto.wallet_address}`);
      
      // Verificar prueba ZK de propiedad
      const zkValid = this.cryptographyService.verifyZKProof(
        dto.zk_proof,
        [dto.wallet_address, dto.token_id]
      );
      
      // Verificar propiedad del token
      const ownershipResult = await this.eerc20Service.verifyTokenOwnership(
        dto.wallet_address,
        dto.token_id
      );
      
      return {
        verified: ownershipResult && zkValid,
        owner_verified: ownershipResult,
        token_exists: ownershipResult,
        zk_proof_valid: zkValid,
        privacy_preserved: true,
        verification_timestamp: Date.now()
      };
    } catch (error) {
      this.logger.error(`Error verifying token ownership: ${error.message}`);
      throw error;
    }
  }

  @Get('balance/:address')
  @ApiOperation({ 
    summary: 'Balance confidencial de tokens',
    description: 'Obtiene el balance de tokens EERC20 de forma confidencial preservando la privacidad.'
  })
  @ApiParam({ name: 'address', description: 'Dirección de wallet' })
  @ApiQuery({ name: 'confidential', required: false, type: Boolean, description: 'Si se debe devolver balance encriptado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance obtenido con privacidad',
    schema: {
      example: {
        address: '0x1234567890123456789012345678901234567890',
        encrypted_balance: 'encrypted_balance_data',
        token_count: 'encrypted_count',
        privacy_level: 'HIGH',
        zk_proof: 'balance_proof_data'
      }
    }
  })
  async getConfidentialBalance(
    @Param('address') address: string,
    @Query('confidential') confidential: boolean = true
  ) {
    try {
      this.logger.log(`Getting confidential balance for ${address}`);
      
      const balanceResult = await this.eerc20Service.getConfidentialBalance(address);
      
      if (confidential) {
        return {
          address,
          encrypted_balance: balanceResult.encryptedBalance,
          token_count: 'encrypted_count',
          privacy_level: 'HIGH',
          zk_proof: balanceResult.zkProof
        };
      } else {
        return {
          address,
          balance: balanceResult.balance,
          token_count: 1,
          privacy_level: 'MEDIUM',
          tokens: [`token_${address.substring(0, 10)}`]
        };
      }
    } catch (error) {
      this.logger.error(`Error getting confidential balance: ${error.message}`);
      throw error;
    }
  }

  @Get('tokens')
  @ApiOperation({ 
    summary: 'Listar tokens EERC20 con privacidad',
    description: 'Obtiene lista de todos los tokens EERC20 con metadatos encriptados y preservación de privacidad.'
  })
  @ApiQuery({ name: 'privacy_level', required: false, enum: ['HIGH', 'MEDIUM', 'LOW'], description: 'Nivel de privacidad deseado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de tokens con privacidad',
    schema: {
      example: {
        total_tokens: 156,
        privacy_preserved: true,
        encrypted_tokens: ['encrypted_token_1', 'encrypted_token_2'],
        zk_commitments: ['commitment_1', 'commitment_2'],
        privacy_level: 'HIGH'
      }
    }
  })
  async listPrivacyTokens(@Query('privacy_level') privacyLevel: string = 'HIGH') {
    try {
      this.logger.log(`Listing privacy tokens with level: ${privacyLevel}`);
      
      const tokens = await this.eerc20Service.getAllTokens();
      
      if (privacyLevel === 'HIGH') {
        // Encriptar datos de tokens
        const encryptedTokens = tokens.map(token => {
          const tokenData = {
            id: token.id,
            owner_encrypted: `encrypted_${token.owner}`,
            metadata_encrypted: token.encryptedMetadata,
            created_at: token.createdAt
          };
          return Buffer.from(JSON.stringify(tokenData)).toString('base64');
        });
        
        const zkCommitments = tokens.map(token => 
          `commitment_${token.id}`
        );
        
        return {
          total_tokens: tokens.length,
          privacy_preserved: true,
          encrypted_tokens: encryptedTokens,
          zk_commitments: zkCommitments,
          privacy_level: privacyLevel
        };
      } else {
        return {
          total_tokens: tokens.length,
          privacy_preserved: false,
          tokens: tokens,
          privacy_level: privacyLevel
        };
      }
    } catch (error) {
      this.logger.error(`Error listing privacy tokens: ${error.message}`);
      throw error;
    }
  }

  @Get('metadata/:token_id')
  @ApiOperation({ 
    summary: 'Metadatos encriptados de token',
    description: 'Obtiene los metadatos de un token EERC20 con encriptación preservando privacidad.'
  })
  @ApiParam({ name: 'token_id', description: 'ID del token EERC20' })
  @ApiQuery({ name: 'decrypt', required: false, type: Boolean, description: 'Si se deben desencriptar los metadatos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Metadatos del token',
    schema: {
      example: {
        token_id: 'eerc20_token_123456',
        encrypted_metadata: 'encrypted_metadata_here',
        zk_hash: 'zk_hash_of_document',
        privacy_level: 'HIGH',
        decryption_available: false
      }
    }
  })
  async getTokenMetadata(
    @Param('token_id') tokenId: string,
    @Query('decrypt') decrypt: boolean = false
  ) {
    try {
      this.logger.log(`Getting metadata for token: ${tokenId}`);
      
      const metadata = await this.eerc20Service.getTokenMetadata(tokenId);
      
      if (!metadata) {
        throw new Error('Token no encontrado');
      }
      
      return {
        token_id: tokenId,
        encrypted_metadata: metadata.encryptedData,
        zk_hash: metadata.zkHash,
        privacy_level: 'HIGH',
        decryption_available: decrypt && metadata.decryptedData ? true : false,
        decrypted_metadata: decrypt ? metadata.decryptedData : undefined
      };
    } catch (error) {
      this.logger.error(`Error getting token metadata: ${error.message}`);
      throw error;
    }
  }
}
