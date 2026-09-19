from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PQRCreate(BaseModel):
    tipo: str  # Petición, Queja, Reclamo, Sugerencia
    asunto: str
    descripcion: str


class PQRUpdate(BaseModel):
    estado: Optional[str] = None
    respuesta: Optional[str] = None


class PQRResponse(BaseModel):
    id_pqr: int
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    id_cliente: int
    fecha_creacion: datetime
    fecha_respuesta: Optional[datetime] = None
    respuesta: Optional[str] = None
    cliente_nombre: Optional[str] = None

    class Config:
        from_attributes = True
