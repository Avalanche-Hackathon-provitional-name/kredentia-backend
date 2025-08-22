import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonDto {
  @ApiProperty({
    description: 'Número de Cédula de Identidad',
    example: 9090909,
    type: 'integer'
  })
  @IsNumber()
  @IsNotEmpty()
  ci: number;

  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Apellido paterno',
    example: 'Pérez',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  apellido_paterno: string;

  @ApiProperty({
    description: 'Apellido materno',
    example: 'García',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  apellido_materno: string;
}

export class UpdateWalletDto {
  @ApiProperty({
    description: 'Dirección de la wallet Ethereum',
    example: '0x1234567890123456789012345678901234567890',
    pattern: '^0x[a-fA-F0-9]{40}$'
  })
  @IsString()
  @IsNotEmpty()
  wallet_address: string;
}

export class QRRequestDto {
  @ApiProperty({
    description: 'Número de Cédula de Identidad para generar QR',
    example: 9090909,
    type: 'integer'
  })
  @IsNumber()
  @IsNotEmpty()
  ci: number;
}
