import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DocumentSignatureNotification } from './document-signature-event.service';

export interface ConnectedClient {
  id: string;
  userId?: string;
  documentIds?: string[];
  connectedAt: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationService.name);
  private connectedClients = new Map<string, ConnectedClient>();

  // Manejar nueva conexión
  handleConnection(client: Socket) {
    try {
      const clientInfo: ConnectedClient = {
        id: client.id,
        userId: client.handshake.query.userId as string,
        documentIds: this.parseDocumentIds(client.handshake.query.documentIds as string),
        connectedAt: new Date(),
      };

      this.connectedClients.set(client.id, clientInfo);

      this.logger.log(`🔌 Client connected: ${client.id} (User: ${clientInfo.userId || 'anonymous'})`);
      this.logger.log(`👥 Total connected clients: ${this.connectedClients.size}`);

      // Enviar confirmación de conexión
      client.emit('connection_established', {
        clientId: client.id,
        timestamp: new Date().toISOString(),
        message: 'Conectado al servicio de notificaciones de Kredentia'
      });

      // Unirse a room específicos si hay documentIds
      if (clientInfo.documentIds && clientInfo.documentIds.length > 0) {
        clientInfo.documentIds.forEach(docId => {
          client.join(`document_${docId}`);
          this.logger.log(`📄 Client ${client.id} joined document room: ${docId}`);
        });
      }

      // Unirse a room de usuario si está autenticado
      if (clientInfo.userId) {
        client.join(`user_${clientInfo.userId}`);
        this.logger.log(`👤 Client ${client.id} joined user room: ${clientInfo.userId}`);
      }

    } catch (error) {
      this.logger.error(`Error handling client connection: ${error.message}`);
      client.disconnect();
    }
  }

  // Manejar desconexión
  handleDisconnect(client: Socket) {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      
      if (clientInfo) {
        this.logger.log(`🔌 Client disconnected: ${client.id} (User: ${clientInfo.userId || 'anonymous'})`);
        this.connectedClients.delete(client.id);
      }

      this.logger.log(`👥 Total connected clients: ${this.connectedClients.size}`);
    } catch (error) {
      this.logger.error(`Error handling client disconnection: ${error.message}`);
    }
  }

  // Emitir evento de firma de documento
  async emitDocumentSignatureEvent(notification: DocumentSignatureNotification) {
    try {
      this.logger.log(`📤 Emitting document signature event: ${notification.type} for document ${notification.documentId}`);

      // Emitir a todos los clientes conectados
      this.server.emit('document_signature_event', notification);

      // Emitir específicamente al room del documento
      this.server.to(`document_${notification.documentId}`).emit('document_signature_event', notification);

      // Emitir al signer si está conectado (usando su dirección como userId)
      this.server.to(`user_${notification.signer}`).emit('document_signature_event', notification);

      // Logging detallado
      this.logger.log(`✅ Notification sent successfully:
        - Type: ${notification.type}
        - Document: ${notification.documentId}
        - Signer: ${notification.signer}
        - Message: ${notification.message}
        - Connected clients: ${this.connectedClients.size}`);

      return true;
    } catch (error) {
      this.logger.error(`Error emitting document signature event: ${error.message}`);
      return false;
    }
  }

  // Emitir notificación general
  async emitGeneralNotification(type: string, message: string, data?: any) {
    try {
      const notification = {
        type,
        message,
        data,
        timestamp: new Date().toISOString(),
      };

      this.server.emit('general_notification', notification);
      this.logger.log(`📢 General notification sent: ${type} - ${message}`);

      return true;
    } catch (error) {
      this.logger.error(`Error emitting general notification: ${error.message}`);
      return false;
    }
  }

  // Emitir notificación a usuario específico
  async emitUserNotification(userId: string, type: string, message: string, data?: any) {
    try {
      const notification = {
        type,
        message,
        data,
        timestamp: new Date().toISOString(),
        targetUser: userId,
      };

      this.server.to(`user_${userId}`).emit('user_notification', notification);
      this.logger.log(`👤 User notification sent to ${userId}: ${type} - ${message}`);

      return true;
    } catch (error) {
      this.logger.error(`Error emitting user notification: ${error.message}`);
      return false;
    }
  }

  // Emitir notificación a documento específico
  async emitDocumentNotification(documentId: string, type: string, message: string, data?: any) {
    try {
      const notification = {
        type,
        message,
        data,
        timestamp: new Date().toISOString(),
        targetDocument: documentId,
      };

      this.server.to(`document_${documentId}`).emit('document_notification', notification);
      this.logger.log(`📄 Document notification sent to ${documentId}: ${type} - ${message}`);

      return true;
    } catch (error) {
      this.logger.error(`Error emitting document notification: ${error.message}`);
      return false;
    }
  }

  // Obtener estadísticas de conexiones
  getConnectionStats() {
    const stats = {
      totalConnections: this.connectedClients.size,
      authenticatedUsers: Array.from(this.connectedClients.values()).filter(c => c.userId).length,
      anonymousUsers: Array.from(this.connectedClients.values()).filter(c => !c.userId).length,
      documentSubscriptions: 0,
      averageConnectionTime: 0,
    };

    // Calcular suscripciones a documentos
    Array.from(this.connectedClients.values()).forEach(client => {
      if (client.documentIds) {
        stats.documentSubscriptions += client.documentIds.length;
      }
    });

    // Calcular tiempo promedio de conexión
    if (stats.totalConnections > 0) {
      const now = new Date();
      const totalTime = Array.from(this.connectedClients.values())
        .reduce((sum, client) => sum + (now.getTime() - client.connectedAt.getTime()), 0);
      stats.averageConnectionTime = Math.round(totalTime / stats.totalConnections / 1000); // en segundos
    }

    return stats;
  }

  // Obtener lista de clientes conectados
  getConnectedClients() {
    return Array.from(this.connectedClients.values()).map(client => ({
      id: client.id,
      userId: client.userId,
      documentCount: client.documentIds?.length || 0,
      connectedAt: client.connectedAt,
      connectionDuration: Math.round((new Date().getTime() - client.connectedAt.getTime()) / 1000),
    }));
  }

  // Utilidades privadas
  private parseDocumentIds(documentIdsParam: string | undefined): string[] | undefined {
    if (!documentIdsParam) {
      return undefined;
    }

    try {
      // Puede ser un string separado por comas o un JSON array
      if (documentIdsParam.startsWith('[')) {
        return JSON.parse(documentIdsParam);
      } else {
        return documentIdsParam.split(',').map(id => id.trim()).filter(id => id.length > 0);
      }
    } catch (error) {
      this.logger.warn(`Failed to parse documentIds: ${documentIdsParam}`);
      return undefined;
    }
  }

  // Método para testing y debugging
  async broadcastTestNotification() {
    const testNotification: DocumentSignatureNotification = {
      type: 'signature_added',
      documentId: 'test_document_123',
      signer: '0x1234567890123456789012345678901234567890',
      role: 'SIGNER',
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      blockNumber: 12345678,
      timestamp: Date.now(),
      message: 'Test notification from Kredentia backend'
    };

    return await this.emitDocumentSignatureEvent(testNotification);
  }
}
