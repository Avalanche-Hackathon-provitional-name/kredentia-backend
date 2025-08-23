# Multi-stage Dockerfile para aplicación NestJS
# Optimizado para GCP Cloud Run

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Instala herramientas necesarias para compilación y Python
RUN apk add --no-cache python3 make g++ sqlite

# Copia los archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instala todas las dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copia el código fuente
COPY src/ ./src/

# Construye la aplicación
RUN npm run build

# Limpia las devDependencies después del build
RUN npm prune --omit=dev

# Stage 2: Production stage
FROM node:18-alpine AS production

# Instala dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Crea un usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Establece el directorio de trabajo
WORKDIR /app

# Copia las dependencias de producción del stage anterior
COPY --from=builder /app/node_modules ./node_modules

# Copia los archivos construidos
COPY --from=builder /app/dist ./dist

# Copia archivos de configuración necesarios
COPY package*.json ./

# Crea el directorio para la base de datos SQLite
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app

# Cambia al usuario no-root
USER nestjs

# Expone el puerto (GCP Cloud Run usa PORT del entorno)
EXPOSE 8080

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=8080

# Healthcheck para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:$PORT/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Comando para ejecutar la aplicación
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
