# ⚡ Foundry Quick Commands para Kredentia

## 🛠️ **Setup Rápido**

### 1. Instalar Foundry
```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verificar instalación
forge --version
cast --version
anvil --version
```

### 2. Configurar Proyecto
```bash
# Si es proyecto nuevo
forge init document-signature-manager
cd document-signature-manager

# Si es proyecto existente
forge install
```

## 🔧 **Configuración foundry.toml**
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
fuji = "https://api.avax-test.network/ext/bc/C/rpc"
mainnet = "https://api.avax.network/ext/bc/C/rpc"

[etherscan]
fuji = { key = "${SNOWTRACE_API_KEY}", url = "https://api.testnet.snowtrace.io/api" }
mainnet = { key = "${SNOWTRACE_API_KEY}", url = "https://api.snowtrace.io/api" }
```

## 🔑 **Variables de Entorno (.env)**
```bash
# Wallet Configuration
PRIVATE_KEY=0xtu_private_key_de_deployer
DEPLOYER_ADDRESS=0xtu_direccion_publica

# Network Configuration
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc

# Explorer API (opcional para verificación)
SNOWTRACE_API_KEY=tu_api_key_de_snowtrace
```

## 🚀 **Comandos de Despliegue**

### Compilar
```bash
# Compilar todos los contratos
forge build

# Compilar con optimización
forge build --optimize --optimizer-runs 200

# Ver dependencias
forge tree
```

### Desplegar a Fuji
```bash
# Comando básico
forge create src/DocumentSignatureManager.sol:DocumentSignatureManager \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY

# Con verificación automática
forge create src/DocumentSignatureManager.sol:DocumentSignatureManager \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY \
    --verify \
    --etherscan-api-key $SNOWTRACE_API_KEY

# Usando script
forge script script/DeployDocumentSignatureManager.s.sol \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify
```

## 🧪 **Testing y Verificación**

### Testing Local
```bash
# Ejecutar tests
forge test

# Test con verbosidad
forge test -vvvv

# Test específico
forge test --match-test testSignatureAdded

# Test con cobertura
forge coverage
```

### Interactuar con Contrato
```bash
# Llamar función view
cast call 0xCONTRATO_ADDRESS "verifySignature(uint256,address)(bool)" 123 0xSIGNER_ADDRESS --rpc-url fuji

# Enviar transacción
cast send 0xCONTRATO_ADDRESS "addSignature(uint256,bytes32)" 123 0x534947484552 \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY

# Ver eventos
cast logs --from-block 1000000 --to-block latest \
    --address 0xCONTRATO_ADDRESS \
    "SignatureAdded(uint256,address,bytes32)" \
    --rpc-url fuji
```

### Verificar Contrato Manual
```bash
# Verificar en Snowtrace
forge verify-contract \
    --chain-id 43113 \
    --num-of-optimizations 200 \
    --watch \
    --etherscan-api-key $SNOWTRACE_API_KEY \
    --compiler-version v0.8.19+commit.7dd6d404 \
    0xCONTRATO_ADDRESS \
    src/DocumentSignatureManager.sol:DocumentSignatureManager
```

## 📊 **Utilities y Debugging**

### Analizar Transacciones
```bash
# Ver detalles de transacción
cast tx 0xTRANSACTION_HASH --rpc-url fuji

# Ver receipt
cast receipt 0xTRANSACTION_HASH --rpc-url fuji

# Decodificar input data
cast 4byte-decode 0xDATA_AQUI
```

### Obtener Información de Red
```bash
# Último bloque
cast block-number --rpc-url fuji

# Información de bloque
cast block latest --rpc-url fuji

# Balance de AVAX
cast balance 0xTU_ADDRESS --rpc-url fuji

# Nonce actual
cast nonce 0xTU_ADDRESS --rpc-url fuji
```

### Conversiones Útiles
```bash
# Wei a Ether
cast to-unit 1000000000000000000 ether

# Ether a Wei  
cast to-wei 1 ether

# String a bytes32
cast --format-bytes32-string "SIGNER"

# bytes32 a string
cast --to-ascii 0x534947484552
```

## 🎯 **Workflow Completo para Kredentia**

### 1. Deploy DocumentSignatureManager
```bash
# Crear y desplegar
forge create src/DocumentSignatureManager.sol:DocumentSignatureManager \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY \
    --verify

# Output esperado:
# Deployed to: 0x1234567890123456789012345678901234567890
# Transaction hash: 0xabcdef...
```

### 2. Actualizar Backend Kredentia
```bash
# En el archivo .env del backend
DOCUMENT_SIGNATURE_MANAGER_ADDRESS=0x1234567890123456789012345678901234567890
```

### 3. Probar Interacción
```bash
# Agregar firma de prueba
cast send 0x1234567890123456789012345678901234567890 \
    "addSignature(uint256,bytes32)" \
    42 \
    0x534947484552 \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY

# Ver eventos en Snowtrace
echo "Check events at: https://testnet.snowtrace.io/address/0x1234567890123456789012345678901234567890"
```

## ⚠️ **Troubleshooting Común**

### Error: "Insufficient funds"
```bash
# Verificar balance
cast balance $DEPLOYER_ADDRESS --rpc-url fuji

# Obtener AVAX testnet
echo "Get testnet AVAX: https://faucet.avax.network/"
```

### Error: "Contract verification failed"
```bash
# Verificar manualmente
forge verify-contract --help

# Ver en explorer
echo "Manual verification: https://testnet.snowtrace.io/verifyContract"
```

### Error: "Private key format"
```bash
# Formato correcto (con 0x prefix)
export PRIVATE_KEY=0x1234567890abcdef...

# Sin 0x prefix también funciona
export PRIVATE_KEY=1234567890abcdef...
```

## 📱 **Comandos de Una Línea**

```bash
# Deploy completo con verificación
forge create src/DocumentSignatureManager.sol:DocumentSignatureManager --rpc-url fuji --private-key $PRIVATE_KEY --verify --etherscan-api-key $SNOWTRACE_API_KEY

# Test completo
forge test -vvvv --gas-report

# Ver eventos en tiempo real
cast logs --follow --address 0xCONTRATO "SignatureAdded(uint256,address,bytes32)" --rpc-url fuji
```
