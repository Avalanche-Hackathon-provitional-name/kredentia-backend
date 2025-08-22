import { ApiProperty } from '@nestjs/swagger';
import { Person } from '../entities/person.entity';

export class UploadCsvResponseDto {
  @ApiProperty({
    description: 'Mensaje de resultado del procesamiento',
    example: 'Procesamiento de CSV completado'
  })
  message: string;

  @ApiProperty({
    description: 'Número de registros procesados exitosamente',
    example: 5
  })
  processed: number;

  @ApiProperty({
    description: 'Lista de errores encontrados durante el procesamiento',
    example: ['CI 1234567: Ya existe en la base de datos'],
    type: [String]
  })
  errors: string[];
}

export class QRResponseDto {
  @ApiProperty({
    description: 'Código QR en formato base64',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
  })
  qr_code: string;

  @ApiProperty({
    description: 'Hash SHA-256 del CI',
    example: '7b52009b64fd0a2a49e6d8a939753077792b0554b7d3d9c1d7b6b2d6f6a5d4c3'
  })
  hash: string;

  @ApiProperty({
    description: 'Número de CI original',
    example: 9090909
  })
  ci: number;
}

export class PersonResponseDto {
  @ApiProperty({
    description: 'Número de Cédula de Identidad',
    example: 9090909
  })
  ci: number;

  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan'
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido paterno',
    example: 'Pérez'
  })
  apellido_paterno: string;

  @ApiProperty({
    description: 'Apellido materno',
    example: 'García'
  })
  apellido_materno: string;

  @ApiProperty({
    description: 'Dirección de wallet (puede ser null)',
    example: '0x1234567890123456789012345678901234567890',
    nullable: true
  })
  wallet_address: string | null;
}

export class WalletResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Wallet address agregada exitosamente'
  })
  message: string;

  @ApiProperty({
    description: 'Datos actualizados de la persona',
    type: PersonResponseDto
  })
  person: PersonResponseDto;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 404
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2025-01-23T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Ruta del endpoint',
    example: '/api/persons/generate-qr/9999999'
  })
  path: string;

  @ApiProperty({
    description: 'Método HTTP',
    example: 'GET'
  })
  method: string;

  @ApiProperty({
    description: 'Lista de mensajes de error',
    example: ['Persona con CI 9999999 no encontrada']
  })
  message: string[];

  @ApiProperty({
    description: 'Descripción del error',
    example: 'Persona con CI 9999999 no encontrada'
  })
  error: string;
}
