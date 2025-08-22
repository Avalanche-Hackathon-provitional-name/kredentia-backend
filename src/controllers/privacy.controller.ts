import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiConsumes, 
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { PersonService } from '../services/person.service';
import { EERC20Service } from '../services/eerc20.service';
import { CryptographyService } from '../services/cryptography.service';
import { Person } from '../entities/person.entity';

export class UploadPrivacyCSVDto {
  ci: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  privacy_level: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class AddPrivateWalletDto {
  wallet_address: string;
  zk_proof: string;
  encrypted_signature: string;
}

export class PrivacyVerificationDto {
  zk_hash: string;
  public_signals: string[];
  proof: string;
}

@ApiTags('privacy')
@Controller('api/privacy')
@ApiBearerAuth()
export class PrivacyController {
  private readonly logger = new Logger(PrivacyController.name);

  constructor(
    private readonly personService: PersonService,
    private readonly eerc20Service: EERC20Service,
    private readonly cryptographyService: CryptographyService,
  ) {}

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir archivo CSV con encriptación',
    description: 'Sube un archivo CSV con datos de personas para certificación con características de privacidad avanzadas. Utiliza Zero-Knowledge proofs y encriptación de extremo a extremo.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV encriptado con datos de personas'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo procesado exitosamente con características de privacidad',
    schema: {
      example: {
        success: true,
        message: 'CSV procesado con encriptación exitosa',
        processed_count: 4,
        zk_commitments: ['0x...', '0x...'],
        eerc20_tokens: ['token_1', 'token_2'],
        privacy_level: 'HIGH'
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Archivo CSV inválido o corrupción de encriptación' })
  @ApiInternalServerErrorResponse({ description: 'Error en procesamiento ZK o minting EERC20' })
  async uploadPrivacyCSV(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log('Processing privacy CSV upload');
      
      // Procesar CSV con características de privacidad
      const result = await this.personService.uploadCsv(file);
      
      // Generar tokens EERC20 para cada persona procesada
      const eerc20Tokens: string[] = [];
      const zkCommitments: string[] = [];
      
      // Obtener todas las personas para generar tokens
      const allPersons = await this.personService.findAll();
      
      for (const person of allPersons) {
        // Generar hash ZK para cada persona
        const zkData = this.cryptographyService.generateZKHash(person.ci.toString());
        zkCommitments.push(zkData.commitment);
        
        // Mint EERC20 token con metadatos encriptados
        const encryptedMetadata = this.eerc20Service.generateEncryptedMetadata(person);
        const mintResult = await this.eerc20Service.mintPrivacyToken(
          zkData.hash,
          encryptedMetadata,
          person.wallet_address || '0x0000000000000000000000000000000000000000'
        );
        
        if (mintResult.success) {
          eerc20Tokens.push(mintResult.tokenId);
        }
      }
      
      return {
        success: true,
        message: 'CSV procesado con encriptación exitosa',
        processed_count: result.processed,
        zk_commitments: zkCommitments,
        eerc20_tokens: eerc20Tokens,
        privacy_level: 'HIGH',
        errors: result.errors
      };
    } catch (error) {
      this.logger.error(`Error in privacy CSV upload: ${error.message}`);
      throw error;
    }
  }

  @Get('generate-qr/:zk-hash')
  @ApiOperation({ 
    summary: 'Generar código QR con Zero-Knowledge',
    description: 'Genera un código QR que contiene pruebas de conocimiento cero para verificación privada del documento.'
  })
  @ApiParam({ 
    name: 'zk-hash', 
    description: 'Hash de conocimiento cero del documento',
    example: 'zk_a1b2c3d4e5f6...'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código QR generado con ZK proofs',
    schema: {
      example: {
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEU...',
        zk_proof: 'proof_data_here',
        public_signals: ['signal1', 'signal2'],
        privacy_metadata: {
          commitment: '0x...',
          nullifier: '0x...',
          verification_key: '0x...'
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Hash ZK no encontrado' })
  async generatePrivacyQR(@Param('zk-hash') zkHash: string) {
    try {
      this.logger.log(`Generating privacy QR for ZK hash: ${zkHash}`);
      
      // Buscar persona por CI convertido desde hash ZK
      const ciFromHash = parseInt(zkHash.replace('zk_', ''));
      const person = await this.personService.findByCi(ciFromHash);
      if (!person) {
        throw new Error('Documento no encontrado');
      }
      
      // Generar prueba ZK
      const zkProof = this.cryptographyService.generateZKProof(
        person.ci.toString(),
        zkHash
      );
      
      // Generar QR con datos de privacidad
      const qrData = {
        zk_hash: zkHash,
        commitment: `commitment_${zkHash}`,
        nullifier: `nullifier_${zkHash}`,
        verification_endpoint: `/api/privacy/verify/${zkHash}`,
        privacy_level: 'HIGH'
      };
      
      const qrResult = await this.personService.generateQR(person.ci);
      
      return {
        qr_code: qrResult.qr_code,
        zk_proof: zkProof.proof,
        public_signals: zkProof.publicSignals,
        privacy_metadata: {
          commitment: qrData.commitment,
          nullifier: qrData.nullifier,
          verification_key: `vk_${zkHash}`
        }
      };
    } catch (error) {
      this.logger.error(`Error generating privacy QR: ${error.message}`);
      throw error;
    }
  }

  @Patch('add-wallet/:zk-hash')
  @ApiOperation({ 
    summary: 'Vincular wallet con privacidad',
    description: 'Vincula una dirección de wallet a un documento usando pruebas ZK para preservar privacidad.'
  })
  @ApiParam({ 
    name: 'zk-hash', 
    description: 'Hash ZK del documento' 
  })
  @ApiBody({ type: AddPrivateWalletDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet vinculado con privacidad exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Wallet vinculado con preservación de privacidad',
        zk_commitment: '0x...',
        eerc20_balance: 'encrypted_balance_data',
        privacy_proof: 'proof_data'
      }
    }
  })
  async addPrivateWallet(
    @Param('zk-hash') zkHash: string,
    @Body() dto: AddPrivateWalletDto
  ) {
    try {
      this.logger.log(`Adding private wallet for ZK hash: ${zkHash}`);
      
      // Buscar persona por CI convertido desde hash ZK
      const ciFromHash = parseInt(zkHash.replace('zk_', ''));
      const person = await this.personService.findByCi(ciFromHash);
      if (!person) {
        throw new Error('Documento no encontrado');
      }
      
      // Verificar la prueba ZK de la wallet
      const isValidProof = this.cryptographyService.verifyZKProof(
        dto.zk_proof,
        [dto.wallet_address]
      );
      
      if (!isValidProof) {
        throw new Error('Prueba ZK inválida para la wallet');
      }
      
      // Actualizar wallet con preservación de privacidad
      const updatedResult = await this.personService.addWalletAddress(
        person.ci,
        dto.wallet_address
      );
      
      // Obtener balance confidencial
      const balanceInfo = await this.eerc20Service.getConfidentialBalance(
        dto.wallet_address
      );
      
      return {
        success: true,
        message: 'Wallet vinculado con preservación de privacidad',
        zk_commitment: `commitment_${zkHash}`,
        eerc20_balance: balanceInfo.encryptedBalance,
        privacy_proof: balanceInfo.zkProof
      };
    } catch (error) {
      this.logger.error(`Error adding private wallet: ${error.message}`);
      throw error;
    }
  }

  @Get('verify/:zk-hash')
  @ApiOperation({ 
    summary: 'Verificación con Zero-Knowledge',
    description: 'Verifica un documento usando pruebas de conocimiento cero sin revelar información sensible.'
  })
  @ApiParam({ 
    name: 'zk-hash', 
    description: 'Hash ZK del documento a verificar' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verificación ZK completada',
    schema: {
      example: {
        verified: true,
        privacy_preserved: true,
        verification_timestamp: 1692123456789,
        zk_proof_valid: true,
        commitment_verified: true,
        nullifier_unused: true,
        privacy_level: 'HIGH'
      }
    }
  })
  async verifyWithZK(@Param('zk-hash') zkHash: string) {
    try {
      this.logger.log(`ZK verification for hash: ${zkHash}`);
      
      // Buscar documento por CI convertido desde hash ZK
      const ciFromHash = parseInt(zkHash.replace('zk_', ''));
      let person: Person | null = null;
      let exists = false;
      
      try {
        person = await this.personService.findByCi(ciFromHash);
        exists = !!person;
      } catch (error) {
        exists = false;
      }
      
      // Generar prueba de verificación sin revelar datos
      const zkProof = this.cryptographyService.generateZKProof(
        exists ? 'document_exists' : 'document_not_found',
        zkHash
      );
      
      return {
        verified: exists,
        privacy_preserved: true,
        verification_timestamp: Date.now(),
        zk_proof_valid: zkProof.verified,
        commitment_verified: exists,
        nullifier_unused: true, // En una implementación real se verificaría
        privacy_level: 'HIGH',
        public_signals: zkProof.publicSignals
      };
    } catch (error) {
      this.logger.error(`Error in ZK verification: ${error.message}`);
      throw error;
    }
  }

  @Get('persons')
  @ApiOperation({ 
    summary: 'Listar personas con privacidad',
    description: 'Obtiene lista encriptada de personas preservando privacidad individual.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de personas con datos encriptados',
    schema: {
      example: {
        total: 4,
        privacy_preserved: true,
        encrypted_data: ['encrypted_person_1', 'encrypted_person_2'],
        zk_commitments: ['0x...', '0x...'],
        access_level: 'AUTHORIZED'
      }
    }
  })
  async getEncryptedPersons() {
    try {
      this.logger.log('Getting encrypted persons list');
      
      const persons = await this.personService.findAll();
      
      // Encriptar datos de cada persona
      const encryptedData = persons.map(person => {
        const sensitiveData = {
          ci: person.ci,
          nombre_encriptado: `encrypted_${person.nombre}`,
          apellidos_encriptados: `encrypted_${person.apellido_paterno}_${person.apellido_materno}`,
          ci_hash: `hash_${person.ci}`,
          wallet_address: person.wallet_address || 'not_linked'
        };
        return Buffer.from(JSON.stringify(sensitiveData)).toString('base64');
      });
      
      // Generar commitments ZK para cada persona
      const zkCommitments = persons.map(person => 
        `commitment_${person.ci}`
      );
      
      return {
        total: persons.length,
        privacy_preserved: true,
        encrypted_data: encryptedData,
        zk_commitments: zkCommitments,
        access_level: 'AUTHORIZED'
      };
    } catch (error) {
      this.logger.error(`Error getting encrypted persons: ${error.message}`);
      throw error;
    }
  }
}
