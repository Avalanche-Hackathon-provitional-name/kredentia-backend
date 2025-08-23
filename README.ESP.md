# Kredentia Backend - Edición Privacidad 🔒

<p align="center">
  <img src="https://img.shields.io/badge/Hack2Build-Edici%C3%B3n%20Privacidad-4A90E2?style=for-the-badge&logo=avalanche&logoColor=white" alt="Hack2Build Edición Privacidad" />
  <img src="https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white" alt="Avalanche" />
  <img src="https://img.shields.io/badge/EERC20-4A90E2?style=for-the-badge&logo=ethereum&logoColor=white" alt="EERC20" />
  <img src="https://img.shields.io/badge/Conocimiento--Cero-🛡️-green?style=for-the-badge" alt="Conocimiento Cero" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="WebSocket" />
</p>

## 🎯 Hack2Build: Edición Privacidad - Plataforma de Certificación de Documentos

Kredentia es una **plataforma avanzada de certificación de documentos** construida para el **Avalanche Hack2Build: Edición Privacidad**. Aprovecha **tokens de privacidad EERC20**, **pruebas de Conocimiento Cero**, **notificaciones WebSocket en tiempo real**, y **transacciones confidenciales** para proporcionar privacidad sin precedentes en la verificación de documentos.

### 🔐 **Características Centradas en Privacidad**

- **🛡️ Verificación de Documentos con Conocimiento Cero** - Verifica documentos sin revelar información sensible
- **⛓️ Tokens de Privacidad EERC20** - Tokens ERC20 mejorados con características de privacidad integradas
- **🔒 Transacciones Confidenciales** - Todas las transferencias de tokens preservan la privacidad del usuario
- **📊 Procesamiento CSV Encriptado** - Carga masiva de documentos con encriptación de extremo a extremo
- **🔍 Generación QR Anónima** - Códigos QR con pruebas de Conocimiento Cero embebidas
- **💼 Integración de Wallet Privada** - Vincula wallets preservando el anonimato
- **🔔 Notificaciones en Tiempo Real** - Sistema WebSocket para updates instantáneos
- **🏔️ Avalanche Fuji Testnet** - Integración completa con la red de pruebas de Avalanche

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js (v18 o superior)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd kredentia-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run start:dev
```

### 🌐 Puntos de Acceso

- **Servidor API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Base de Datos**: Archivo SQLite (`database.sqlite`)
- **WebSocket**: ws://localhost:3000 (Notificaciones en tiempo real)
- **Avalanche Fuji**: https://api.avax-test.network/ext/bc/C/rpc

## 🔔 **Sistema de Notificaciones en Tiempo Real**

Kredentia incluye un **sistema completo de notificaciones WebSocket** que proporciona actualizaciones en tiempo real para todas las operaciones de privacidad y EERC20.

### **Características WebSocket:**
- **🏠 Gestión de Salas**: Usuarios pueden unirse a salas específicas
- **⚡ Notificaciones Instantáneas**: Updates inmediatos de transacciones
- **📊 Estadísticas en Vivo**: Métricas en tiempo real
- **🔒 Notificaciones Privadas**: Comunicación segura por usuario
- **🪙 Events EERC20**: Notificaciones de minting, transferencias, verificaciones

### **Eventos WebSocket Disponibles:**
```typescript
// Eventos de Privacidad
'document_uploaded'     // Documento cargado con éxito
'qr_generated'         // QR código generado
'wallet_linked'        // Wallet vinculada
'document_verified'    // Documento verificado

// Eventos EERC20
'token_minted'         // Token EERC20 creado
'token_transferred'    // Token transferido
'balance_updated'      // Balance actualizado
'metadata_updated'     // Metadatos actualizados

// Eventos de Sistema
'user_joined_room'     // Usuario se unió a sala
'user_left_room'       // Usuario salió de sala
'stats_updated'        // Estadísticas actualizadas
```

## 📡 Endpoints de API Completos (19 Endpoints Implementados)

### 🔒 **Endpoints de Privacidad**
| Método | Endpoint | Descripción | Nivel de Privacidad |
|--------|----------|-------------|---------------------|
| `POST` | `/privacy/upload-csv` | Subir CSV encriptado con validación ZK | 🔒 Alto |
| `GET` | `/privacy/generate-qr/:ci_hash` | Generar QR privado con pruebas ZK | 🔒 Alto |
| `PATCH` | `/privacy/add-wallet/:ci_hash` | Vincular dirección de wallet confidencial | 🔒 Alto |
| `GET` | `/privacy/verify/:ci_hash` | Verificación de documento con conocimiento cero | 🔒 Alto |
| `GET` | `/privacy/persons` | Obtener lista encriptada de personas (autorizado) | 🔒 Medio |

### 🪙 **Endpoints EERC20 (Enhanced ERC20)**
| Método | Endpoint | Descripción | Funcionalidad |
|--------|----------|-------------|---------------|
| `POST` | `/eerc20/mint` | Acuñar tokens de privacidad para documentos | Crear token EERC20 |
| `GET` | `/eerc20/balance/:address` | Obtener balance confidencial de tokens | Consultar balance |
| `POST` | `/eerc20/transfer` | Transferir tokens de forma confidencial | Transferencia privada |
| `GET` | `/eerc20/metadata/:tokenId` | Obtener metadatos encriptados del token | Metadatos seguros |
| `POST` | `/eerc20/verify` | Verificar propiedad de token con ZK | Verificación ZK |
| `GET` | `/eerc20/transactions/:address` | Historial de transacciones encriptado | Historial privado |

### 🔔 **Endpoints de Notificaciones WebSocket**
| Método | Endpoint | Descripción | Tiempo Real |
|--------|----------|-------------|-------------|
| `GET` | `/notifications/stats` | Estadísticas de notificaciones en tiempo real | ⚡ WebSocket |
| `POST` | `/notifications/send` | Enviar notificación a usuario específico | ⚡ WebSocket |
| `GET` | `/notifications/rooms` | Listar salas activas de WebSocket | ⚡ WebSocket |
| `POST` | `/notifications/join-room/:roomId` | Unirse a sala de notificaciones | ⚡ WebSocket |
| `POST` | `/notifications/leave-room/:roomId` | Salir de sala de notificaciones | ⚡ WebSocket |
| `GET` | `/notifications/user/:userId` | Obtener notificaciones de usuario | ⚡ WebSocket |

### 📊 **Endpoints de Gestión**
| Método | Endpoint | Descripción | Funcionalidad |
|--------|----------|-------------|---------------|
| `GET` | `/persons` | Listar todas las personas registradas | Gestión básica |
| `POST` | `/persons` | Crear nueva persona en el sistema | Registro manual |

## 🔧 Configuración Avalanche Fuji Testnet

### Variables de Entorno

Crear un archivo `.env`:

```env
# Configuración de Base de Datos
DB_TYPE=sqlite
DB_DATABASE=database.sqlite

# Configuración de Aplicación
PORT=3000
NODE_ENV=development

# Configuración Avalanche Fuji Testnet
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
AVALANCHE_NETWORK_NAME=Avalanche Fuji Testnet

# Configuración WebSocket
WEBSOCKET_CORS_ORIGIN=http://localhost:3001
WEBSOCKET_PORT=3000

# Configuración CORS
CORS_ORIGIN=http://localhost:3001
CORS_METHODS=GET,HEAD,PUT,PATCH,POST,DELETE
CORS_CREDENTIALS=true

# Configuración de Privacidad
ENCRYPTION_KEY=your-256-bit-encryption-key-here
ZK_SALT=your-zk-salt-here

# Configuración EERC20 (Preparado para contratos reales)
EERC20_CONTRACT_ADDRESS=0x... # Cuando se desplieguen los contratos
DOCUMENT_MANAGER_ADDRESS=0x... # Dirección del contrato DocumentSignatureManager
```

### 🏔️ **Configuración Específica de Avalanche Fuji:**

```typescript
// Configuración de red para desarrollo
export const AVALANCHE_FUJI_CONFIG = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  blockExplorerUrl: 'https://testnet.snowtrace.io/',
  nativeCurrency: {
    symbol: 'AVAX',
    decimals: 18
  },
  faucet: 'https://faucet.avax.network/'
};
```

## 🛠️ Desarrollo

```bash
# Modo desarrollo con recarga automática
npm run start:dev

# Construir la aplicación
npm run build

# Ejecutar pruebas
npm run test

# Ejecutar pruebas e2e
npm run test:e2e

# Verificar cobertura de pruebas
npm run test:cov

# Linting y formato
npm run lint
npm run format
```

## 📊 Esquema de Base de Datos

### Entidad Person
- `id`: Clave primaria auto-generada
- `ci`: Número de cédula de identidad (único)
- `ci_hash`: Hash SHA-256 del CI para privacidad
- `nombre`: Primer nombre
- `apellido_paterno`: Apellido paterno
- `apellido_materno`: Apellido materno
- `wallet_address`: Wallet blockchain asociado (opcional)
- `created_at`: Marca de tiempo de creación
- `updated_at`: Marca de tiempo de última actualización

## 📚 Documentación de la API

Visita `http://localhost:3000/api` para documentación completa de Swagger con:

- **Pruebas interactivas** de todos los 19 endpoints
- **Esquemas de solicitud/respuesta** detallados
- **Ejemplos de payloads** para EERC20 y privacidad
- **Documentación WebSocket** con eventos disponibles
- **Configuración de Avalanche** para development y production

### 🔍 **Ejemplos de Uso con Swagger:**

#### **1. Subir CSV con Documentos:**
```bash
POST /privacy/upload-csv
Content-Type: multipart/form-data

# Archivo CSV con estructura:
ci,nombre,apellido_paterno,apellido_materno
12345678,Juan,Pérez,González
87654321,María,López,Martínez
```

#### **2. Mint Token EERC20:**
```bash
POST /eerc20/mint
Content-Type: application/json

{
  "to": "0x742d35Cc6634C0532925a3b8D2b...",
  "document_hash": "sha256_hash_of_document",
  "metadata": {
    "document_type": "identity_card",
    "privacy_level": "HIGH"
  }
}
```

#### **3. Conectar a WebSocket:**
```javascript
import io from 'socket.io-client';

const socket = io('ws://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado a WebSocket');
  socket.emit('join_room', 'privacy_notifications');
});

socket.on('document_uploaded', (data) => {
  console.log('Documento subido:', data);
});

socket.on('token_minted', (data) => {
  console.log('Token EERC20 creado:', data);
});
```

## 🧪 Pruebas

El proyecto incluye pruebas integrales:

- **Pruebas Unitarias**: Pruebas de servicio y controlador
- **Pruebas de Integración**: Pruebas de API de extremo a extremo
- **Pruebas WebSocket**: Pruebas de notificaciones en tiempo real
- **Pruebas de Privacidad**: Validación de encriptación y ZK proofs
- **Pruebas EERC20**: Simulación de operaciones de tokens

```bash
# Ejecutar todas las pruebas
npm run test

# Pruebas específicas de WebSocket
npm run test -- --grep "WebSocket"

# Pruebas específicas de EERC20
npm run test -- --grep "EERC20"

# Pruebas específicas de Privacidad
npm run test -- --grep "Privacy"
```

## 🔮 Integraciones Futuras EERC20 y Privacidad

### **🚀 Roadmap de Implementación:**

#### **Fase 1: Smart Contracts Reales (Q1 2025)**
- **🔒 Contratos Inteligentes EERC20**: Contratos de tokens con privacidad mejorada en Avalanche
- **🛡️ Motor ZK Real**: Implementación de zk-SNARKs y zk-STARKs
- **📊 IPFS Integration**: Almacenamiento descentralizado de metadatos

#### **Fase 2: Frontend de Privacidad (Q2 2025)**
- **🖥️ Frontend de Privacidad**: React/Next.js con componentes de conocimiento cero
- **💼 Wallet Integration**: MetaMask, WalletConnect, y wallets nativos de Avalanche
- **📊 Dashboard Analytics**: Analytics de verificación que preserva privacidad

#### **Fase 3: Escalabilidad Cross-Chain (Q3 2025)**
- **⛓️ Múltiples Cadenas de Privacidad**: Soporte para Ethereum, Polygon, BSC
- **🌉 Bridge de Privacidad**: Transferencias de tokens EERC20 cross-chain
- **🔐 Encriptación Homomórfica**: Computación sobre datos encriptados

#### **Fase 4: Enterprise y Gobierno (Q4 2025)**
- **👤 Autenticación Anónima**: Verificación de identidad con conocimiento cero
- **💼 Privacidad Empresarial**: Gestión confidencial de documentos B2B
- **🏛️ Integración Gubernamental**: APIs para instituciones públicas

## 📝 Formato de Archivo CSV

Estructura CSV esperada para carga masiva:

```csv
ci,nombre,apellido_paterno,apellido_materno
12345678,Juan,Pérez,González
87654321,María,López,Martínez
11223344,Ana,Rodríguez,Silva
55667788,Carlos,Mamani,Quispe
99887766,Lucía,Vargas,Morales
```

### **Validaciones de CSV:**
- **CI único**: No se permiten cédulas duplicadas
- **Formato correcto**: Todos los campos son obligatorios
- **Caracteres válidos**: Solo letras y números permitidos
- **Límite de registros**: Máximo 1000 registros por archivo

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea tu rama de característica (`git checkout -b feature/caracteristica-increible`)
3. Confirma tus cambios (`git commit -m 'Agregar alguna característica increíble'`)
4. Empuja a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request

### **Guidelines de Contribución:**
- **Código**: Seguir estándares de TypeScript y NestJS
- **Tests**: Agregar pruebas para nueva funcionalidad
- **Documentación**: Actualizar README y documentación Swagger
- **Privacidad**: Considerar implicaciones de privacidad en cualquier cambio

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ve el archivo [LICENSE](LICENSE) para detalles.

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico:**
- **🖥️ NestJS v11**: Framework Node.js de grado empresarial
- **📊 TypeORM**: ORM poderoso para operaciones de base de datos
- **✅ Class Validator**: Validación robusta de entrada
- **📚 Swagger/OpenAPI**: Documentación y pruebas de API
- **💾 SQLite**: Solución de base de datos liviana para desarrollo
- **🔔 Socket.IO**: WebSocket library para notificaciones en tiempo real
- **🏔️ Avalanche SDK**: Integración nativa con Avalanche blockchain
- **🔐 crypto-js**: Biblioteca de criptografía para privacidad
- **🛡️ snarkjs**: Zero-Knowledge proofs (preparado para implementación)

### **Patrones de Diseño Implementados:**
- **🏗️ Module Pattern**: Organización modular de funcionalidades
- **🔧 Service Layer**: Separación de lógica de negocio
- **🛡️ Guard Pattern**: Validación y autorización
- **🔄 Observer Pattern**: WebSocket notifications
- **🎭 Strategy Pattern**: Múltiples algoritmos de encriptación
- **🏭 Factory Pattern**: Creación de tokens EERC20

### **Principios SOLID Aplicados:**
- **S** - Single Responsibility: Cada servicio tiene una responsabilidad única
- **O** - Open/Closed: Extensible sin modificar código existente
- **L** - Liskov Substitution: Interfaces intercambiables
- **I** - Interface Segregation: Interfaces específicas y pequeñas
- **D** - Dependency Inversion: Dependencias invertidas con inyección

---

<p align="center">
  <strong>🔒 Kredentia: Certificación de Documentos con Privacidad Total</strong>
</p>

<p align="center">
  <em>Construido para Avalanche Hack2Build: Privacy Edition</em>
</p>

<p align="center">
  <strong>🪙 EERC20 • 🛡️ Zero-Knowledge • 🔔 WebSocket • 🏔️ Avalanche</strong>
</p>
