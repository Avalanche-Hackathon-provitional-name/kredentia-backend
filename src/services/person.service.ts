import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../entities/person.entity';
import { CreatePersonDto, UpdateWalletDto } from '../dto/person.dto';
import csv from 'csv-parser';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto-js';
import { Readable } from 'stream';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
    ) {}

    async uploadCsv(file: Express.Multer.File): Promise<{ message: string; processed: number; errors: string[] }> {
        if (!file) {
        throw new BadRequestException('No se proporcionó archivo CSV');
        }

        const results: CreatePersonDto[] = [];
        const errors: string[] = [];
        let processed = 0;

        return new Promise((resolve, reject) => {
        const stream = Readable.from(file.buffer.toString());
        
        stream
            .pipe(csv())
            .on('data', (data) => {
            try {
                const person: CreatePersonDto = {
                ci: parseInt(data.ci),
                nombre: data.nombre?.trim(),
                apellido_paterno: data.apellido_paterno?.trim(),
                apellido_materno: data.apellido_materno?.trim(),
                };

                // Validaciones básicas
                if (!person.ci || !person.nombre || !person.apellido_paterno || !person.apellido_materno) {
                errors.push(`Fila con CI ${data.ci}: Datos incompletos`);
                return;
                }

                results.push(person);
            } catch (error) {
                errors.push(`Error procesando fila con CI ${data.ci}: ${error.message}`);
            }
            })
            .on('end', async () => {
            try {
                // Guardar en base de datos
                for (const personData of results) {
                try {
                    const existingPerson = await this.personRepository.findOne({
                    where: { ci: personData.ci }
                    });

                    if (existingPerson) {
                    errors.push(`CI ${personData.ci}: Ya existe en la base de datos`);
                    continue;
                    }

                    await this.personRepository.save(personData);
                    processed++;
                } catch (dbError) {
                    errors.push(`Error guardando CI ${personData.ci}: ${dbError.message}`);
                }
                }

                resolve({
                message: 'Procesamiento de CSV completado',
                processed,
                errors
                });
            } catch (error) {
                reject(error);
            }
            })
            .on('error', (error) => {
            reject(new BadRequestException(`Error procesando CSV: ${error.message}`));
            });
        });
    }

    async generateQR(ci: number): Promise<{ qr_code: string; hash: string; ci: number }> {
        // Verificar que la persona existe
        const person = await this.personRepository.findOne({
        where: { ci }
        });

        if (!person) {
        throw new NotFoundException(`Persona con CI ${ci} no encontrada`);
        }

        // Generar hash del CI
        const hash = crypto.SHA256(ci.toString()).toString();

        // Crear datos para el QR
        const qrData = JSON.stringify({
        hash,
        ci
        });

        try {
        // Generar código QR
        const qrCode = await QRCode.toDataURL(qrData);

        return {
            qr_code: qrCode,
            hash,
            ci
        };
        } catch (error) {
        throw new BadRequestException(`Error generando QR: ${error.message}`);
        }
    }

    async addWalletAddress(ci: number, walletAddress: string): Promise<{ message: string; person: Person }> {
        const person = await this.personRepository.findOne({
        where: { ci }
        });

        if (!person) {
        throw new NotFoundException(`Persona con CI ${ci} no encontrada`);
        }

        // Validación básica de wallet address (Ethereum format)
        if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        throw new BadRequestException('Formato de wallet address inválido');
        }

        person.wallet_address = walletAddress;
        const updatedPerson = await this.personRepository.save(person);

        return {
        message: 'Wallet address agregada exitosamente',
        person: updatedPerson
        };
    }

    async findByCi(ci: number): Promise<Person> {
        const person = await this.personRepository.findOne({
        where: { ci }
        });

        if (!person) {
        throw new NotFoundException(`Persona con CI ${ci} no encontrada`);
        }

        return person;
    }

    async findAll(): Promise<Person[]> {
        return this.personRepository.find();
    }
}
