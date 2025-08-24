# Solución a Errores de Build en GCP

Este documento explica los problemas encontrados durante el build en Google Cloud Platform y sus soluciones.

## Error Original

```
npm error code E404
npm error 404 Not Found - GET https://registry.npmjs.org/@avalanche%2favalanche-js - Not found
npm error 404  '@avalanche/avalanche-js@^3.17.0' is not in this registry.
```

## Problemas Identificados y Soluciones

### 1. Dependencia Incorrecta de Avalanche ❌➡️✅

**Problema**: `@avalanche/avalanche-js` no existe en npm
**Solución**: Usar `@avalabs/avalanchejs` (paquete oficial)

```json
// Antes (incorrecto)
"@avalanche/avalanche-js": "^3.17.0"

// Después (correcto)
"@avalabs/avalanchejs": "^5.0.0"
```

### 2. Comando npm Deprecado ❌➡️✅

**Problema**: `npm ci --only=production` está deprecado
**Solución**: Usar `npm ci --omit=dev`

```dockerfile
# Antes (deprecado)
RUN npm ci --only=production

# Después (correcto)
RUN npm ci --omit=dev
```

### 3. Dependencia Circom Problemática ❌➡️✅

**Problema**: `circom@^2.1.8` está deprecado y es una herramienta de compilación, no una dependencia de runtime
**Solución**: Remover de dependencies (mantener circomlib y snarkjs para runtime)

```json
// Removido
"circom": "^2.1.8"

// Mantenido para runtime ZK
"circomlib": "^2.0.5",
"snarkjs": "^0.7.4"
```

### 4. Proceso de Build Optimizado ❌➡️✅

**Problema**: Las dependencias nativas necesitan devDependencies para compilarse
**Solución**: Instalar todas las dependencias, hacer build, luego limpiar devDependencies

```dockerfile
# Nuevo proceso optimizado
RUN npm ci && npm cache clean --force
COPY src/ ./src/
RUN npm run build
RUN npm prune --omit=dev
```

## Archivos Modificados

1. **package.json**: Corrección de dependencias
2. **Dockerfile**: Optimización del proceso de build
3. **src/app.controller.ts**: Agregado endpoint `/health`
4. **test-docker.sh**: Script para probar builds localmente

## Verificación del Fix

Para verificar que el fix funciona:

```bash
# Probar localmente
./test-docker.sh

# Verificar en GCP
# El próximo push debería construir exitosamente
```

## Dependencias Finales Relacionadas con Blockchain/ZK

```json
{
  "ethers": "^6.13.0",
  "web3": "^4.11.0",
  "@avalabs/avalanchejs": "^5.0.0",
  "circomlib": "^2.0.5",
  "snarkjs": "^0.7.4",
  "node-forge": "^1.3.1",
  "tweetnacl": "^1.0.3",
  "bcryptjs": "^2.4.3"
}
```

## Health Check

El contenedor ahora incluye un endpoint de health check:

```bash
curl http://localhost:8080/health
# Respuesta: {"status":"ok","timestamp":"2025-08-23T05:42:54.192Z"}
```

## Próximos Pasos

1. ✅ Fix aplicado y pusheado
2. 🔄 GCP debería construir exitosamente ahora
3. 🚀 Una vez que el build pase, el deployment estará listo

## Comandos Útiles para Debugging

```bash
# Ver logs de Cloud Build
gcloud builds list

# Ver logs específicos de un build
gcloud builds log BUILD_ID

# Probar imagen localmente
docker run -p 3000:8080 gcr.io/PROJECT_ID/kredentia-backend:latest
```
