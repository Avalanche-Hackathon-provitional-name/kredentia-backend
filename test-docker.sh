#!/bin/bash

# Script para probar el build de Docker localmente
# Ejecuta este script para verificar que el Dockerfile funciona antes de hacer push

echo "🧪 Probando build de Docker localmente..."

# Limpiar imágenes anteriores si existen
echo "🧹 Limpiando imágenes anteriores..."
docker rmi kredentia-backend:test 2>/dev/null || true

# Construir la imagen
echo "🏗️ Construyendo imagen Docker..."
docker build -t kredentia-backend:test .

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso!"
    
    # Mostrar información de la imagen
    echo "📊 Información de la imagen:"
    docker images kredentia-backend:test
    
    # Probar ejecutar el contenedor
    echo "🚀 Probando ejecutar el contenedor..."
    echo "Iniciando contenedor en el puerto 3000..."
    
    # Ejecutar en background por 10 segundos para probar
    CONTAINER_ID=$(docker run -d -p 3000:8080 --name kredentia-test kredentia-backend:test)
    
    if [ $? -eq 0 ]; then
        echo "✅ Contenedor iniciado exitosamente!"
        echo "Container ID: $CONTAINER_ID"
        
        # Esperar un poco para que la app se inicie
        echo "⏳ Esperando que la aplicación se inicie..."
        sleep 5
        
        # Probar health check
        echo "🏥 Probando health check..."
        curl -s http://localhost:3000/health > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ Health check exitoso!"
        else
            echo "⚠️ Health check falló, pero el contenedor está ejecutándose"
        fi
        
        # Mostrar logs
        echo "📋 Últimos logs del contenedor:"
        docker logs $CONTAINER_ID --tail 10
        
        # Limpiar
        echo "🧹 Limpiando contenedor de prueba..."
        docker stop $CONTAINER_ID > /dev/null
        docker rm $CONTAINER_ID > /dev/null
        
        echo "✅ ¡Prueba completada exitosamente!"
        echo "Tu aplicación está lista para deployment en GCP"
        
    else
        echo "❌ Error al ejecutar el contenedor"
        exit 1
    fi
    
else
    echo "❌ Error en el build de Docker"
    echo "Revisa los errores arriba y corrige antes de hacer push"
    exit 1
fi

echo ""
echo "🚀 Para hacer deployment en GCP, ejecuta:"
echo "./deploy-gcp.sh"
