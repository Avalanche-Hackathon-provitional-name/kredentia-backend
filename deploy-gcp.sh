# Script para deployment en Google Cloud Platform
# Ejecuta este script para hacer deploy de tu aplicación

#!/bin/bash

# Configuración
PROJECT_ID="tu-project-id"  # Cambia esto por tu Project ID de GCP
SERVICE_NAME="kredentia-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Iniciando deployment de Kredentia Backend en GCP..."

# Verificar que gcloud esté configurado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK no está instalado. Instálalo desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar que Docker esté funcionando
if ! docker info &> /dev/null; then
    echo "❌ Docker no está funcionando. Asegúrate de que Docker esté ejecutándose."
    exit 1
fi

# Configurar el proyecto
echo "📋 Configurando proyecto: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Habilitar las APIs necesarias
echo "🔧 Habilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configurar Docker para usar gcloud como helper de credenciales
echo "🐳 Configurando autenticación de Docker..."
gcloud auth configure-docker

# Build y push de la imagen
echo "🏗️ Construyendo imagen Docker..."
docker build -t $IMAGE_NAME:latest .

echo "📤 Subiendo imagen a Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy a Cloud Run
echo "🚀 Desplegando en Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image=$IMAGE_NAME:latest \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --port=8080 \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --set-env-vars="NODE_ENV=production,PORT=8080" \
    --timeout=300

# Obtener la URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform=managed --region=$REGION --format="value(status.url)")

echo "✅ ¡Deployment completado!"
echo "🌐 Tu aplicación está disponible en: $SERVICE_URL"
echo "📚 Documentación Swagger en: $SERVICE_URL/api"
echo ""
echo "📊 Para ver logs en tiempo real:"
echo "gcloud logging tail \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --location=$REGION"
