# 🔔 Servicios de Notificaciones Blockchain - Kredentia

## 📋 Descripción General

Este módulo implementa un sistema completo de escucha de eventos blockchain y notificaciones en tiempo real para el contrato `DocumentSignatureManager.sol` en Avalanche Fuji Testnet.

## 🏗️ Arquitectura

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (WS)     │◄───┤  NotificationService │◄───┤   BlockchainEvent   │
│                     │    │    (Socket.IO)      │    │   ListenerService   │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      ▲                           ▲
                                      │                           │
                           ┌─────────────────────┐     ┌─────────────────────┐
                           │ DocumentSignature   │     │   Avalanche         │
                           │   EventService      │     │ Fuji Testnet RPC    │
                           └─────────────────────┘     └─────────────────────┘
```

## 🔧 Servicios Implementados

### 1. **BlockchainEventListenerService**
- **Propósito**: Conecta con Avalanche Fuji Testnet y escucha eventos del contrato
- **Eventos Monitoreados**:
  - `SignatureAdded(documentId, signer, role)`
  - `SignatureVerified(documentId, signer, isValid)`
- **Características**:
  - Conexión automática al iniciar la aplicación
  - Reconexión automática en caso de fallos
  - Obtención de eventos históricos
  - Health check de conexión

### 2. **DocumentSignatureEventService**
- **Propósito**: Procesa los eventos capturados y los transforma en notificaciones
- **Funcionalidades**:
  - Decodificación de roles desde bytes32
  - Validación de integridad de eventos
  - Formateo de direcciones Ethereum
  - Generación de mensajes descriptivos

### 3. **NotificationService (WebSocket Gateway)**
- **Propósito**: Maneja conexiones WebSocket y envía notificaciones en tiempo real
- **Características**:
  - Soporte para múltiples clientes simultáneos
  - Rooms por usuario y documento
  - Estadísticas de conexiones
  - Notificaciones dirigidas y broadcasts

### 4. **NotificationController**
- **Propósito**: API REST para gestión de notificaciones y estadísticas
- **Endpoints Principales**:
  - `GET /notifications/stats` - Estadísticas de conexiones
  - `POST /notifications/test` - Enviar notificación de prueba
  - `GET /notifications/blockchain/status` - Estado de blockchain
  - `GET /notifications/blockchain/events/historical` - Eventos históricos

## 🔌 Conexión WebSocket

### Frontend Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  query: {
    userId: '0x1234567890123456789012345678901234567890', // Dirección Ethereum
    documentIds: ['123', '456', '789'] // IDs de documentos a seguir
  }
});

// Escuchar eventos de firma
socket.on('document_signature_event', (notification) => {
  console.log('Nueva notificación:', notification);
  // notification.type: 'signature_added' | 'signature_verified'
  // notification.documentId: string
  // notification.signer: string
  // notification.message: string
});

// Confirmación de conexión
socket.on('connection_established', (data) => {
  console.log('Conectado:', data.message);
});
```

### Tipos de Eventos WebSocket
1. **`document_signature_event`** - Eventos de firma de documentos
2. **`general_notification`** - Notificaciones generales del sistema
3. **`user_notification`** - Notificaciones específicas del usuario
4. **`document_notification`** - Notificaciones específicas del documento

## ⚙️ Configuración

### Variables de Entorno (.env)
```bash
# Avalanche Fuji Testnet Configuration
AVALANCHE_C_CHAIN_RPC=https://api.avax-test.network/ext/bc/C/rpc
DOCUMENT_SIGNATURE_MANAGER_ADDRESS=0x0000000000000000000000000000000000000000

# Frontend Configuration  
FRONTEND_URL=http://localhost:3000
```

### Configuración del Contrato
1. Desplegar el contrato `DocumentSignatureManager.sol` en Avalanche Fuji Testnet
2. Actualizar `DOCUMENT_SIGNATURE_MANAGER_ADDRESS` en `.env`
3. Reiniciar el servidor

### 💰 Testnet AVAX para Fuji
Para obtener AVAX testnet gratuitos:
1. Visitar [Avalanche Faucet](https://faucet.avax.network/)
2. Conectar wallet (MetaMask, Core, etc.)
3. Solicitar AVAX testnet para desplegar contratos
4. Network ID: 43113 (Fuji Testnet)

## 📡 API Endpoints

### Estadísticas y Monitoring
```bash
# Obtener estadísticas de conexiones WebSocket
GET /notifications/stats

# Obtener clientes conectados
GET /notifications/clients

# Verificar estado de conexión blockchain
GET /notifications/blockchain/status
```

### Notificaciones Manuales
```bash
# Enviar notificación de prueba
POST /notifications/test

# Notificación a usuario específico
POST /notifications/user/:userId
{
  "type": "info",
  "message": "Tu documento ha sido actualizado",
  "data": { "documentId": "123" }
}

# Notificación a documento específico
POST /notifications/document/:documentId
{
  "type": "document_update", 
  "message": "El documento ha sido modificado"
}

# Broadcast a todos los conectados
POST /notifications/broadcast
{
  "type": "system_announcement",
  "message": "Mantenimiento programado en 30 minutos"
}
```

### Eventos Históricos
```bash
# Obtener eventos desde un bloque específico
GET /notifications/blockchain/events/historical?fromBlock=12345678&toBlock=12345700
```

## 🔍 Estructura de Notificaciones

### SignatureAdded Event
```typescript
{
  type: 'signature_added',
  documentId: '123',
  signer: '0x1234567890123456789012345678901234567890',
  role: 'SIGNER',
  transactionHash: '0xabcd...',
  blockNumber: 12345678,
  timestamp: 1703123456789,
  message: 'Nueva firma agregada al documento 123 por 0x1234...5678 como SIGNER'
}
```

### SignatureVerified Event
```typescript
{
  type: 'signature_verified',
  documentId: '123',
  signer: '0x1234567890123456789012345678901234567890',
  isValid: true,
  transactionHash: '0xabcd...',
  blockNumber: 12345678,
  timestamp: 1703123456789,
  message: 'Firma verificada exitosamente para el documento 123 del firmante 0x1234...5678'
}
```

## 🧪 Testing

### Probar Conexión WebSocket
```bash
# Usar curl para enviar notificación de prueba
curl -X POST http://localhost:3000/notifications/test
```

### Verificar Estado del Sistema
```bash
# Estado de blockchain
curl http://localhost:3000/notifications/blockchain/status

# Estadísticas de conexiones
curl http://localhost:3000/notifications/stats
```

## 📊 Monitoring y Logs

El sistema genera logs detallados:
- ✅ Conexión exitosa a Avalanche C-Chain
- 🔗 Inicio de escucha de eventos
- 📝 Eventos de firma capturados
- 🔌 Conexiones/desconexiones WebSocket
- 📤 Notificaciones enviadas
- ❌ Errores de conexión o procesamiento

## 🚀 Próximos Pasos

1. **Base de Datos**: Almacenar historial de eventos y notificaciones
2. **Autenticación**: Verificar identidad de usuarios WebSocket
3. **Rate Limiting**: Limitar frecuencia de notificaciones
4. **Push Notifications**: Integrar con Firebase/APNs
5. **Analytics**: Dashboard de métricas y estadísticas
6. **Filtros**: Permitir filtrar tipos de eventos por usuario

## 🔧 Troubleshooting

### Error: Contract address not configured
```
Solución: Configurar DOCUMENT_SIGNATURE_MANAGER_ADDRESS en .env
```

### Error: RPC connection failed
```
Solución: Verificar AVALANCHE_C_CHAIN_RPC URL en .env
```

### WebSocket no conecta
```
Solución: Verificar FRONTEND_URL y configuración CORS
```
