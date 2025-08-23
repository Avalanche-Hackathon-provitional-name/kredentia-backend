import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SignatureAddedEvent, SignatureVerifiedEvent } from './blockchain-event-listener.service';

export interface DocumentSignatureNotification {
  type: 'signature_added' | 'signature_verified';
  documentId: string;
  signer: string;
  role?: string;
  isValid?: boolean;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  message: string;
}

@Injectable()
export class DocumentSignatureEventService {
  private readonly logger = new Logger(DocumentSignatureEventService.name);

  constructor(
    private notificationService: NotificationService,
  ) {}

  async handleSignatureAdded(event: SignatureAddedEvent) {
    try {
      this.logger.log(`Processing SignatureAdded event for document ${event.documentId}`);

      // Decodificar el rol desde bytes32 a string
      const roleString = this.decodeRole(event.role);

      // Crear notificación para el frontend
      const notification: DocumentSignatureNotification = {
        type: 'signature_added',
        documentId: event.documentId,
        signer: event.signer,
        role: roleString,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.timestamp,
        message: `Nueva firma agregada al documento ${event.documentId} por ${this.formatAddress(event.signer)} como ${roleString}`
      };

      // Emitir notificación en tiempo real
      await this.notificationService.emitDocumentSignatureEvent(notification);

      // Aquí podrías agregar lógica adicional como:
      // - Guardar en base de datos
      // - Enviar emails
      // - Actualizar estado del documento
      // - Etc.

      this.logger.log(`✅ SignatureAdded event processed successfully for document ${event.documentId}`);
      
      return notification;
    } catch (error) {
      this.logger.error(`Error handling SignatureAdded event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async handleSignatureVerified(event: SignatureVerifiedEvent) {
    try {
      this.logger.log(`Processing SignatureVerified event for document ${event.documentId}`);

      // Crear notificación para el frontend
      const notification: DocumentSignatureNotification = {
        type: 'signature_verified',
        documentId: event.documentId,
        signer: event.signer,
        isValid: event.isValid,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.timestamp,
        message: `Firma ${event.isValid ? 'verificada exitosamente' : 'falló la verificación'} para el documento ${event.documentId} del firmante ${this.formatAddress(event.signer)}`
      };

      // Emitir notificación en tiempo real
      await this.notificationService.emitDocumentSignatureEvent(notification);

      // Aquí podrías agregar lógica adicional como:
      // - Actualizar estado de verificación en BD
      // - Alertas de seguridad si isValid = false
      // - Logging de auditoría
      // - Etc.

      this.logger.log(`✅ SignatureVerified event processed successfully for document ${event.documentId}`);
      
      return notification;
    } catch (error) {
      this.logger.error(`Error handling SignatureVerified event: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Métodos utilitarios
  private decodeRole(roleBytes: string): string {
    try {
      // Convertir bytes32 a string
      const roleHex = roleBytes.startsWith('0x') ? roleBytes.slice(2) : roleBytes;
      const roleBuffer = Buffer.from(roleHex, 'hex');
      
      // Remover bytes nulos al final
      const roleString = roleBuffer.toString('utf8').replace(/\0/g, '');
      
      return roleString || 'UNKNOWN_ROLE';
    } catch (error) {
      this.logger.warn(`Failed to decode role ${roleBytes}: ${error.message}`);
      return 'UNKNOWN_ROLE';
    }
  }

  private formatAddress(address: string): string {
    if (!address || address.length < 10) {
      return address;
    }
    
    // Formato: 0x1234...5678
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Método para obtener estadísticas de eventos
  async getEventStatistics(documentId?: string) {
    // Este método podría conectarse a una base de datos para obtener estadísticas
    // Por ahora retorna un objeto básico
    return {
      documentId: documentId || 'all',
      totalSignatures: 0,
      totalVerifications: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
      lastActivity: null
    };
  }

  // Método para obtener el historial de eventos de un documento
  async getDocumentEventHistory(documentId: string) {
    try {
      this.logger.log(`Fetching event history for document ${documentId}`);
      
      // Aquí implementarías la lógica para obtener el historial desde BD
      // Por ahora retorna un array vacío
      return [];
    } catch (error) {
      this.logger.error(`Error fetching document event history: ${error.message}`);
      throw error;
    }
  }

  // Método para validar la integridad de un evento
  private validateEvent(event: SignatureAddedEvent | SignatureVerifiedEvent): boolean {
    try {
      // Validaciones básicas
      if (!event.documentId || !event.signer || !event.transactionHash) {
        return false;
      }

      // Validar formato de dirección Ethereum
      if (!/^0x[a-fA-F0-9]{40}$/.test(event.signer)) {
        return false;
      }

      // Validar formato de hash de transacción
      if (!/^0x[a-fA-F0-9]{64}$/.test(event.transactionHash)) {
        return false;
      }

      // Validar que el número de bloque sea positivo
      if (event.blockNumber <= 0) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Event validation error: ${error.message}`);
      return false;
    }
  }
}
