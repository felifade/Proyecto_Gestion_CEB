#!/bin/bash
# Script de inicio para macOS - Auditor de Expedientes
# Al hacer doble clic en el Finder, se abrirá la terminal y ejecutará este script.

# Cambiar al directorio donde reside este script
cd "$(dirname "$0")"

echo "=================================================="
echo "      Iniciando Auditor de Expedientes            "
echo "=================================================="

# Comprobar si el entorno virtual existe, de lo contrario instalarlo
if [ ! -d ".venv" ]; then
    echo "El entorno virtual no existe. Ejecutando instalación..."
    chmod +x install.sh
    ./install.sh
fi

# Activar entorno virtual
echo "Activando entorno virtual..."
source .venv/bin/activate

# Abrir el navegador en el puerto 8000 en segundo plano
echo "Abriendo la interfaz gráfica en tu navegador..."
sleep 1.5 && open "http://localhost:8000" &

# Iniciar servidor Uvicorn en primer plano
echo "Arrancando el servidor web de FastAPI..."
uvicorn app.main:app --port 8000
