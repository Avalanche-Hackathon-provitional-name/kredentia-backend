import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from '../entities/person.entity';
import { PersonService } from '../services/person.service';
import { PrivacyController } from '../controllers/privacy.controller';
import { EERC20Controller } from '../controllers/eerc20.controller';
import { CryptographyService } from '../services/cryptography.service';
import { EERC20Service } from '../services/eerc20.service';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  controllers: [PrivacyController, EERC20Controller],
  providers: [PersonService, CryptographyService, EERC20Service],
  exports: [PersonService, CryptographyService, EERC20Service],
})
export class PrivacyModule {}
