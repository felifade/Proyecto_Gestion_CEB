from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class ConfigurationSchema(BaseModel):
    ruta_expedientes: str
    ruta_lista_cotejo: str
    mapeo_columnas: Dict[str, str]
    gemini_api_key: Optional[str] = None

    class Config:
        from_attributes = True

class AuditResultResponse(BaseModel):
    criterio_id: int
    estado: str # Cumple, Cumple parcialmente, No cumple, No aplica
    observacion: str
    evidencia_documento: Optional[str] = None
    evidencia_pagina: Optional[int] = None
    evidencia_texto: Optional[str] = None
