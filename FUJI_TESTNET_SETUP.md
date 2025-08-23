# 🏔️ Configuración para Avalanche Fuji Testnet

## 📋 **Información de Red**

| Parámetro | Valor |
|-----------|-------|
| **Network Name** | Avalanche Fuji Testnet |
| **Network ID** | 43113 |
| **Chain ID** | 43113 |
| **RPC URL** | https://api.avax-test.network/ext/bc/C/rpc |
| **Currency Symbol** | AVAX |
| **Explorer** | https://testnet.snowtrace.io/ |

## 🔧 **Configuración de MetaMask**

### Agregar Red Fuji a MetaMask:
1. Abrir MetaMask
2. Ir a **Settings** → **Networks** → **Add Network**
3. Completar los siguientes datos:

```
Network Name: Avalanche Fuji Testnet
New RPC URL: https://api.avax-test.network/ext/bc/C/rpc
Chain ID: 43113
Currency Symbol: AVAX
Block Explorer URL: https://testnet.snowtrace.io/
```

## 💰 **Obtener AVAX Testnet**

### Faucet Oficial de Avalanche:
1. Visitar: https://faucet.avax.network/
2. Conectar wallet (MetaMask, Core, etc.)
3. Seleccionar red **Fuji (C-Chain)**
4. Solicitar 2 AVAX testnet gratuitos
5. Confirmar transacción

### Faucets Alternativos:
- **ChainLink Faucet**: https://faucets.chain.link/fuji
- **Alchemy Faucet**: https://www.alchemy.com/faucets/avalanche-fuji

## 🚀 **Desplegar Contrato en Fuji con Foundry**

### 1. Preparar el Entorno Foundry
```bash
# Instalar Foundry (si no está instalado)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Inicializar proyecto Foundry (si es necesario)
forge init documento-signature-manager
cd documento-signature-manager
```

### 2. Configuración de Foundry
```toml
# foundry.toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.19"

[rpc_endpoints]
fuji = "https://api.avax-test.network/ext/bc/C/rpc"

[etherscan]
fuji = { key = "${SNOWTRACE_API_KEY}", url = "https://api.testnet.snowtrace.io/api" }
```

### 3. Variables de Entorno para Foundry
```bash
# .env (en el directorio del contrato)
PRIVATE_KEY=0xtu_private_key_aqui
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
SNOWTRACE_API_KEY=tu_api_key_opcional
```

### 4. Script de Despliegue Foundry
```solidity
// script/DeployDocumentSignatureManager.s.sol
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/DocumentSignatureManager.sol";

contract DeployDocumentSignatureManager is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(privateKey);
        
        DocumentSignatureManager dsm = new DocumentSignatureManager();
        
        vm.stopBroadcast();
        
        console.log("DocumentSignatureManager deployed to:", address(dsm));
        console.log("Network: Fuji Testnet");
        console.log("Chain ID: 43113");
    }
}
```

### 5. Ejecutar Despliegue con Foundry
```bash
# Compilar contrato
forge build

# Desplegar en Fuji Testnet
forge script script/DeployDocumentSignatureManager.s.sol:DeployDocumentSignatureManager \
    --rpc-url $FUJI_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --chain-id 43113

# O usando el alias de red
forge script script/DeployDocumentSignatureManager.s.sol:DeployDocumentSignatureManager \
    --rpc-url fuji \
    --private-key $PRIVATE_KEY \
    --broadcast
```

### 6. Verificar Contrato (Opcional)
```bash
# Verificar en Snowtrace
forge verify-contract \
    --chain-id 43113 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") \
    --etherscan-api-key $SNOWTRACE_API_KEY \
    --compiler-version v0.8.19+commit.7dd6d404 \
    DEPLOYED_CONTRACT_ADDRESS \
    src/DocumentSignatureManager.sol:DocumentSignatureManager
```

## 🔍 **Verificación en Explorer**

Una vez desplegado, verifica tu contrato en:
- **Snowtrace Testnet**: https://testnet.snowtrace.io/
- Buscar por dirección del contrato
- Ver transacciones y eventos

## ⚙️ **Actualizar Kredentia Backend**

### 1. Actualizar .env
```bash
# Actualizar con la dirección real del contrato desplegado
AVALANCHE_C_CHAIN_RPC=https://api.avax-test.network/ext/bc/C/rpc
DOCUMENT_SIGNATURE_MANAGER_ADDRESS=0xTU_CONTRATO_DESPLEGADO_AQUI
```

### 2. Reiniciar Servidor
```bash
npm run start:dev
```

### 3. Verificar Conexión
```bash
# Verificar estado de blockchain
curl -X GET http://localhost:3000/notifications/blockchain/status
```

## 🧪 **Testing en Fuji**

### 1. Interactuar con Contrato
```javascript
// Ejemplo de interacción desde frontend
const provider = new ethers.providers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');
const contract = new ethers.Contract(contractAddress, abi, signer);

// Agregar firma
await contract.addSignature(documentId, role);

// Verificar firma
await contract.verifySignature(documentId, signer);
```

### 2. Monitorear Eventos
```bash
# Ver logs del backend
npm run start:dev

# Verificar eventos capturados
curl -X GET http://localhost:3000/notifications/stats
```

## 🚨 **Troubleshooting**

### Error: Insufficient AVAX
- **Solución**: Obtener más AVAX del faucet
- **Mínimo requerido**: ~0.1 AVAX para despliegue

### Error: Wrong Chain ID
- **Solución**: Verificar que MetaMask esté en Fuji (43113)
- **Comando**: `await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xa869' }] })`

### Error: RPC Connection Failed
- **Solución**: Verificar URL del RPC
- **Alternativa**: `https://rpc.ankr.com/avalanche_fuji`

### Error: Contract Not Found
- **Solución**: Verificar que la dirección del contrato sea correcta
- **Verificar**: En https://testnet.snowtrace.io/

## 📋 **Checklist de Configuración**

- [ ] ✅ MetaMask configurado con red Fuji
- [ ] ✅ AVAX testnet obtenidos del faucet
- [ ] ✅ Contrato DocumentSignatureManager desplegado
- [ ] ✅ Dirección del contrato actualizada en .env
- [ ] ✅ Servidor Kredentia reiniciado
- [ ] ✅ Conexión blockchain verificada
- [ ] ✅ Eventos de prueba funcionando

## 🎯 **Beneficios de usar Fuji Testnet**

1. **🆓 Gratis**: No requiere AVAX real
2. **⚡ Rápido**: Tiempos de bloque similares a mainnet
3. **🔧 Testing**: Entorno seguro para pruebas
4. **🌐 Público**: Accesible para demo y hackathon
5. **📊 Explorer**: Transacciones visibles en Snowtrace
6. **🤝 Interoperabilidad**: Compatible con herramientas de mainnet
