#!/bin/bash
# Script de instalación para macOS - Auditor de Expedientes

# Detener ante cualquier error
set -e

echo "=================================================="
echo "      Instalación de Auditor de Expedientes       "
echo "=================================================="

# 1. Comprobar versión de Python
echo "1. Comprobando requisitos del sistema..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 no está instalado."
    echo "Por favor, descarga e instala Python 3.12+ desde python.org o usa Homebrew: brew install python"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
echo "Python detectado: v$PYTHON_VERSION"

# 2. Crear el entorno virtual
echo "2. Creando entorno virtual (.venv)..."
if [ -d ".venv" ]; then
    echo "El entorno virtual ya existe. Omitiendo creación."
else
    python3 -m venv .venv
    echo "Entorno virtual creado."
fi

# 3. Activar entorno virtual e instalar dependencias
echo "3. Instalando dependencias en el entorno virtual..."
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Asegurar permisos para el script lanzador
echo "4. Configurando permisos del sistema..."
chmod +x Auditor_Expedientes.command

echo "=================================================="
echo "    ¡Instalación completada exitosamente!        "
echo "=================================================="
echo "Para iniciar la aplicación:"
echo "Haz doble clic sobre el archivo: Auditor_Expedientes.command"
echo "o ejecútalo desde terminal: ./Auditor_Expedientes.command"
echo "=================================================="
