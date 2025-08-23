import { Controller, Get, Post, Body, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { BlockchainEventListenerService } from '../services/blockchain-event-listener.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private notificationService: NotificationService,
    private blockchainEventListenerService: BlockchainEventListenerService,
  ) {}

  @Get('stats')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de conexiones WebSocket',
    description: 'Retorna información sobre las conexiones activas, usuarios conectados y suscripciones'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalConnections: { type: 'number', example: 15 },
        authenticatedUsers: { type: 'number', example: 12 },
        anonymousUsers: { type: 'number', example: 3 },
        documentSubscriptions: { type: 'number', example: 45 },
        averageConnectionTime: { type: 'number', example: 120 }
      }
    }
  })
  getConnectionStats() {
    try {
      const stats = this.notificationService.getConnectionStats();
      this.logger.log(`📊 Connection stats requested: ${JSON.stringify(stats)}`);
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error getting connection stats: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('clients')
  @ApiOperation({ 
    summary: 'Obtener lista de clientes conectados',
    description: 'Retorna información detallada sobre todos los clientes WebSocket conectados'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de clientes obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'socket_123' },
              userId: { type: 'string', example: '0x1234...5678' },
              documentCount: { type: 'number', example: 3 },
              connectedAt: { type: 'string', format: 'date-time' },
              connectionDuration: { type: 'number', example: 300 }
            }
          }
        }
      }
    }
  })
  getConnectedClients() {
    try {
      const clients = this.notificationService.getConnectedClients();
      this.logger.log(`👥 Connected clients list requested: ${clients.length} clients`);
      return {
        success: true,
        data: clients,
        count: clients.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error getting connected clients: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('test')
  @ApiOperation({ 
    summary: 'Enviar notificación de prueba',
    description: 'Envía una notificación de prueba a todos los clientes conectados para testing'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación de prueba enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  async sendTestNotification() {
    try {
      const result = await this.notificationService.broadcastTestNotification();
      this.logger.log(`🧪 Test notification sent: ${result}`);
      
      return {
        success: result,
        message: result ? 'Test notification sent successfully' : 'Failed to send test notification',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error sending test notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('user/:userId')
  @ApiOperation({ 
    summary: 'Enviar notificación a usuario específico',
    description: 'Envía una notificación personalizada a un usuario específico conectado'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario (dirección Ethereum)', example: '0x1234567890123456789012345678901234567890' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'info' },
        message: { type: 'string', example: 'Su documento ha sido actualizado' },
        data: { type: 'object', example: { documentId: '123', status: 'updated' } }
      },
      required: ['type', 'message']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        targetUser: { type: 'string' }
      }
    }
  })
  async sendUserNotification(
    @Param('userId') userId: string,
    @Body() notificationData: { type: string; message: string; data?: any }
  ) {
    try {
      const result = await this.notificationService.emitUserNotification(
        userId,
        notificationData.type,
        notificationData.message,
        notificationData.data
      );

      this.logger.log(`👤 User notification sent to ${userId}: ${notificationData.type}`);
      
      return {
        success: result,
        message: result ? 'User notification sent successfully' : 'Failed to send user notification',
        targetUser: userId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error sending user notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('document/:documentId')
  @ApiOperation({ 
    summary: 'Enviar notificación a documento específico',
    description: 'Envía una notificación a todos los usuarios suscritos a un documento específico'
  })
  @ApiParam({ name: 'documentId', description: 'ID del documento', example: '123' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'document_update' },
        message: { type: 'string', example: 'El documento ha sido modificado' },
        data: { type: 'object', example: { action: 'updated', modifier: '0x1234...5678' } }
      },
      required: ['type', 'message']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        targetDocument: { type: 'string' }
      }
    }
  })
  async sendDocumentNotification(
    @Param('documentId') documentId: string,
    @Body() notificationData: { type: string; message: string; data?: any }
  ) {
    try {
      const result = await this.notificationService.emitDocumentNotification(
        documentId,
        notificationData.type,
        notificationData.message,
        notificationData.data
      );

      this.logger.log(`📄 Document notification sent to ${documentId}: ${notificationData.type}`);
      
      return {
        success: result,
        message: result ? 'Document notification sent successfully' : 'Failed to send document notification',
        targetDocument: documentId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error sending document notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('broadcast')
  @ApiOperation({ 
    summary: 'Enviar notificación general (broadcast)',
    description: 'Envía una notificación a todos los clientes conectados'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'system_announcement' },
        message: { type: 'string', example: 'Mantenimiento programado en 30 minutos' },
        data: { type: 'object', example: { priority: 'high', category: 'maintenance' } }
      },
      required: ['type', 'message']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Broadcast enviado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        recipientCount: { type: 'number' }
      }
    }
  })
  async broadcastNotification(
    @Body() notificationData: { type: string; message: string; data?: any }
  ) {
    try {
      const result = await this.notificationService.emitGeneralNotification(
        notificationData.type,
        notificationData.message,
        notificationData.data
      );

      const stats = this.notificationService.getConnectionStats();
      
      this.logger.log(`📢 Broadcast notification sent: ${notificationData.type} to ${stats.totalConnections} clients`);
      
      return {
        success: result,
        message: result ? 'Broadcast notification sent successfully' : 'Failed to send broadcast notification',
        recipientCount: stats.totalConnections,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error sending broadcast notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('blockchain/status')
  @ApiOperation({ 
    summary: 'Obtener estado de la conexión blockchain',
    description: 'Retorna el estado actual del servicio de escucha de eventos blockchain'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de blockchain obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            isConnected: { type: 'boolean' },
            isListening: { type: 'boolean' },
            contractAddress: { type: 'string' },
            rpcUrl: { type: 'string' },
            healthCheck: { type: 'boolean' }
          }
        }
      }
    }
  })
  async getBlockchainStatus() {
    try {
      const connectionStatus = this.blockchainEventListenerService.getConnectionStatus();
      const healthCheck = await this.blockchainEventListenerService.checkConnectionHealth();
      
      const status = {
        ...connectionStatus,
        healthCheck
      };

      this.logger.log(`🔗 Blockchain status requested: ${JSON.stringify(status)}`);
      
      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error getting blockchain status: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('blockchain/events/historical')
  @ApiOperation({ 
    summary: 'Obtener eventos históricos del blockchain',
    description: 'Retorna eventos históricos del contrato DocumentSignatureManager desde un bloque específico'
  })
  @ApiQuery({ name: 'fromBlock', description: 'Número de bloque inicial', example: 12345678 })
  @ApiQuery({ name: 'toBlock', description: 'Número de bloque final (opcional)', required: false, example: 12345700 })
  @ApiResponse({ 
    status: 200, 
    description: 'Eventos históricos obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            signatureAdded: { type: 'array' },
            signatureVerified: { type: 'array' }
          }
        },
        fromBlock: { type: 'number' },
        toBlock: { type: 'number' }
      }
    }
  })
  async getHistoricalEvents(
    @Query('fromBlock') fromBlock: string,
    @Query('toBlock') toBlock?: string
  ) {
    try {
      const fromBlockNum = parseInt(fromBlock);
      const toBlockNum = toBlock ? parseInt(toBlock) : undefined;

      if (isNaN(fromBlockNum)) {
        return {
          success: false,
          error: 'Invalid fromBlock parameter',
          timestamp: new Date().toISOString()
        };
      }

      const events = await this.blockchainEventListenerService.getHistoricalEvents(
        fromBlockNum,
        toBlockNum
      );

      this.logger.log(`📚 Historical events requested: ${fromBlockNum} to ${toBlockNum || 'latest'}`);
      
      return {
        success: true,
        data: events,
        fromBlock: fromBlockNum,
        toBlock: toBlockNum || 'latest',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Error getting historical events: ${error.message}`);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
