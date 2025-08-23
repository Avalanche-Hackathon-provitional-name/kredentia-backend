# Deployment en Google Cloud Platform (GCP)

Esta guía te ayudará a desplegar tu aplicación Kredentia Backend en Google Cloud Platform usando Cloud Run.

## Prerequisitos

1. **Google Cloud SDK instalado**
   ```bash
   # En Ubuntu/Debian
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # En macOS
   brew install --cask google-cloud-sdk
   ```

2. **Docker instalado y funcionando**
   ```bash
   docker --version
   ```

3. **Proyecto de GCP creado**
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un nuevo proyecto o selecciona uno existente
   - Anota el Project ID

## Configuración Inicial

1. **Autenticarte con Google Cloud**
   ```bash
   gcloud auth login
   gcloud config set project TU-PROJECT-ID
   ```

2. **Habilitar las APIs necesarias**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Métodos de Deployment

### Método 1: Script Automático (Recomendado)

1. **Edita el script de deployment**
   ```bash
   # Edita deploy-gcp.sh y cambia PROJECT_ID por tu Project ID real
   nano deploy-gcp.sh
   ```

2. **Ejecuta el script**
   ```bash
   ./deploy-gcp.sh
   ```

### Método 2: Comandos Manuales

1. **Configurar autenticación de Docker**
   ```bash
   gcloud auth configure-docker
   ```

2. **Construir la imagen**
   ```bash
   docker build -t gcr.io/TU-PROJECT-ID/kredentia-backend:latest .
   ```

3. **Subir la imagen**
   ```bash
   docker push gcr.io/TU-PROJECT-ID/kredentia-backend:latest
   ```

4. **Desplegar en Cloud Run**
   ```bash
   gcloud run deploy kredentia-backend \
     --image=gcr.io/TU-PROJECT-ID/kredentia-backend:latest \
     --platform=managed \
     --region=us-central1 \
     --allow-unauthenticated \
     --port=8080 \
     --memory=1Gi \
     --cpu=1 \
     --max-instances=10 \
     --set-env-vars="NODE_ENV=production,PORT=8080"
   ```

### Método 3: Google Cloud Build (CI/CD)

1. **Conectar tu repositorio GitHub**
   - Ve a Cloud Build en la consola de GCP
   - Conecta tu repositorio de GitHub
   - Crea un trigger que use `cloudbuild.yaml`

2. **El deployment se ejecutará automáticamente** en cada push al repositorio

## Configuración de Variables de Entorno

Para configurar variables de entorno en Cloud Run:

```bash
gcloud run services update kredentia-backend \
  --region=us-central1 \
  --set-env-vars="JWT_SECRET=tu-secreto,AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc"
```

## Configuración de Base de Datos

### Opción 1: SQLite (Actual)
- Los datos se almacenan en el contenedor
- **Nota**: Los datos se perderán al reiniciar el contenedor

### Opción 2: Cloud SQL (Recomendado para producción)
1. **Crear instancia de Cloud SQL**
   ```bash
   gcloud sql instances create kredentia-db \
     --database-version=POSTGRES_13 \
     --region=us-central1 \
     --tier=db-f1-micro
   ```

2. **Configurar variables de entorno**
   ```bash
   gcloud run services update kredentia-backend \
     --region=us-central1 \
     --set-env-vars="DATABASE_TYPE=postgres,DATABASE_HOST=127.0.0.1,DATABASE_PORT=5432"
   ```

## Monitoreo y Logs

1. **Ver logs en tiempo real**
   ```bash
   gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=kredentia-backend" --location=us-central1
   ```

2. **Metrics en Cloud Monitoring**
   - Ve a Monitoring en la consola de GCP
   - Configura alertas para CPU, memoria y errores

## Consideraciones de Seguridad

1. **Autenticación**: Actualmente está configurado como `--allow-unauthenticated`
   - Para producción, considera usar IAM authentication

2. **HTTPS**: Cloud Run proporciona HTTPS automáticamente

3. **Secretos**: Usa Google Secret Manager para datos sensibles
   ```bash
   echo -n "mi-secreto" | gcloud secrets create jwt-secret --data-file=-
   ```

## Troubleshooting

### Error: "Image not found"
```bash
# Verifica que la imagen exista
gcloud container images list --repository=gcr.io/TU-PROJECT-ID
```

### Error: "Service timeout"
```bash
# Aumenta el timeout
gcloud run services update kredentia-backend \
  --region=us-central1 \
  --timeout=300
```

### Error: "Out of memory"
```bash
# Aumenta la memoria
gcloud run services update kredentia-backend \
  --region=us-central1 \
  --memory=2Gi
```

## URLs Útiles

- **Consola de GCP**: https://console.cloud.google.com
- **Cloud Run**: https://console.cloud.google.com/run
- **Container Registry**: https://console.cloud.google.com/gcr
- **Cloud Build**: https://console.cloud.google.com/cloud-build

## Costos Estimados

Cloud Run tiene un tier gratuito generoso:
- 2 millones de requests por mes
- 400,000 GB-segundos de memoria
- 200,000 vCPU-segundos

Para más detalles: https://cloud.google.com/run/pricing
