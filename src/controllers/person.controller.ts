import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UploadedFile,
    UseInterceptors,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
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
    ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { PersonService } from '../services/person.service';
import { UpdateWalletDto } from '../dto/person.dto';
import { 
    UploadCsvResponseDto, 
    QRResponseDto, 
    WalletResponseDto, 
    PersonResponseDto,
    ErrorResponseDto 
} from '../dto/response.dto';

@ApiTags('persons')
@Controller('api/persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir archivo CSV',
    description: 'Sube un archivo CSV con datos de personas para certificar. El archivo debe contener las columnas: ci, nombre, apellido_paterno, apellido_materno.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV con datos de personas'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'CSV procesado exitosamente',
    type: UploadCsvResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Archivo CSV inválido o datos incorrectos',
    type: ErrorResponseDto
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Error interno del servidor',
    type: ErrorResponseDto
  })
  async uploadCsv(@UploadedFile() file: Express.Multer.File) {
    return this.personService.uploadCsv(file);
  }

  @Get('generate-qr/:ci')
  @ApiOperation({ 
    summary: 'Generar código QR',
    description: 'Genera un código QR que contiene el hash SHA-256 del CI y el CI original para verificación segura.'
  })
  @ApiParam({ 
    name: 'ci', 
    description: 'Número de Cédula de Identidad',
    example: 9090909,
    type: 'integer'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'QR generado exitosamente',
    type: QRResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Persona no encontrada',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'CI inválido o error generando QR',
    type: ErrorResponseDto
  })
  async generateQR(@Param('ci', ParseIntPipe) ci: number) {
    return this.personService.generateQR(ci);
  }

  @Patch('add-wallet-address/:ci')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Agregar dirección de wallet',
    description: 'Asocia una dirección de wallet Ethereum al registro de una persona específica.'
  })
  @ApiParam({ 
    name: 'ci', 
    description: 'Número de Cédula de Identidad',
    example: 9090909,
    type: 'integer'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet address agregada exitosamente',
    type: WalletResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Persona no encontrada',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Formato de wallet address inválido',
    type: ErrorResponseDto
  })
  async addWalletAddress(
    @Param('ci', ParseIntPipe) ci: number,
    @Body() updateWalletDto: UpdateWalletDto,
  ) {
    return this.personService.addWalletAddress(ci, updateWalletDto.wallet_address);
  }

  @Get(':ci')
  @ApiOperation({ 
    summary: 'Obtener persona por CI',
    description: 'Obtiene los datos de una persona específica usando su Cédula de Identidad.'
  })
  @ApiParam({ 
    name: 'ci', 
    description: 'Número de Cédula de Identidad',
    example: 9090909,
    type: 'integer'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Persona encontrada',
    type: PersonResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'Persona no encontrada',
    type: ErrorResponseDto
  })
  async getPersonByCi(@Param('ci', ParseIntPipe) ci: number) {
    return this.personService.findByCi(ci);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas las personas',
    description: 'Obtiene una lista de todas las personas registradas en el sistema.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de personas',
    type: [PersonResponseDto]
  })
  async getAllPersons() {
    return this.personService.findAll();
  }
}
