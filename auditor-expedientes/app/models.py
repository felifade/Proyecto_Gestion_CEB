from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Configuration(Base):
    __tablename__ = "configuracion"
    
    id = Column(Integer, primary_key=True, index=True)
    ruta_expedientes = Column(String, nullable=True)
    ruta_lista_cotejo = Column(String, nullable=True)
    mapeo_columnas = Column(Text, nullable=True) # JSON string representation
    gemini_api_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Criteria(Base):
    __tablename__ = "criterios_cotejo"
    
    id = Column(Integer, primary_key=True, index=True)
    criterio = Column(String, index=True)
    tipo = Column(String, nullable=True)
    peso = Column(Float, default=1.0)
    documento_esperado = Column(String, nullable=True)
    activo = Column(Boolean, default=True)

class Expediente(Base):
    __tablename__ = "expedientes"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_carpeta = Column(String, index=True)
    ruta_relativa = Column(String, unique=True, index=True)
    anio = Column(String, index=True, default="General")
    google_drive_folder_id = Column(String, index=True, nullable=True)
    fecha_deteccion = Column(DateTime, default=datetime.utcnow)
    fecha_analisis = Column(DateTime, nullable=True)
    estado_analisis = Column(String, default="Pendiente") # Pendiente, Analizando, Completado, Error
    porcentaje_cumplimiento = Column(Float, default=0.0)
    resultado_global = Column(String, default="Sin analizar") # Cumple, Cumple parcialmente, No cumple, Sin analizar
    error_mensaje = Column(Text, nullable=True)
    
    documentos = relationship("Documento", back_populates="expediente", cascade="all, delete-orphan")
    resultados = relationship("ResultadoAuditoria", back_populates="expediente", cascade="all, delete-orphan")

class Documento(Base):
    __tablename__ = "documentos_expediente"
    
    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"))
    nombre_archivo = Column(String, index=True)
    ruta_relativa = Column(String)
    tipo_archivo = Column(String) # pdf, xlsx, docx, etc.
    tamano_bytes = Column(Integer)
    texto_extraido = Column(Text, nullable=True) # Cache text for Gemini
    paginas_totales = Column(Integer, default=0)
    google_drive_file_id = Column(String, index=True, nullable=True)

    expediente = relationship("Expediente", back_populates="documentos")

class ResultadoAuditoria(Base):
    __tablename__ = "resultados_auditoria"
    
    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"))
    criterio_id = Column(Integer, ForeignKey("criterios_cotejo.id"))
    estado = Column(String) # Cumple, Cumple parcialmente, No cumple, No aplica
    observacion = Column(Text, nullable=True)
    evidencia_documento = Column(String, nullable=True)
    evidencia_pagina = Column(Integer, nullable=True)
    evidencia_texto = Column(Text, nullable=True)
    fecha_auditoria = Column(DateTime, default=datetime.utcnow)

    expediente = relationship("Expediente", back_populates="resultados")
    criterio = relationship("Criteria")
