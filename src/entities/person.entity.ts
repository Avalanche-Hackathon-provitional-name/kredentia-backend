import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('persons')
export class Person {
  @ApiProperty({
    description: 'Número de Cédula de Identidad (Primary Key)',
    example: 9090909
  })
  @PrimaryColumn()
  ci: number;

  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan'
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Apellido paterno',
    example: 'Pérez'
  })
  @Column()
  apellido_paterno: string;

  @ApiProperty({
    description: 'Apellido materno',
    example: 'García'
  })
  @Column()
  apellido_materno: string;

  @ApiProperty({
    description: 'Dirección de wallet Ethereum (opcional)',
    example: '0x1234567890123456789012345678901234567890',
    nullable: true
  })
  @Column({ nullable: true })
  wallet_address: string;
}
