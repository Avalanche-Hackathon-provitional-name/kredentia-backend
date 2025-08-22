import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  // Usar SQLite por defecto para desarrollo
  return {
    type: 'sqlite',
    database: configService.get('SQLITE_DATABASE', 'kredentia.db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false, // Reducir logs para mejor rendimiento
  } as TypeOrmModuleOptions;
};
