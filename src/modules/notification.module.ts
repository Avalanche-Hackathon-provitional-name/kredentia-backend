import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../services/notification.service';
import { BlockchainEventListenerService } from '../services/blockchain-event-listener.service';
import { DocumentSignatureEventService } from '../services/document-signature-event.service';
import { NotificationController } from '../controllers/notification.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    BlockchainEventListenerService,
    DocumentSignatureEventService,
  ],
  exports: [
    NotificationService,
    BlockchainEventListenerService,
    DocumentSignatureEventService,
  ],
})
export class NotificationModule {}
