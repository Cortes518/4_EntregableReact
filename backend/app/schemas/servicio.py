from pydantic import BaseModel
from typing import Optional

class ServicioBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    precio: float
    estado: str = "Activo"

class ServicioCreate(ServicioBase):
    pass

class ServicioUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    estado: Optional[str] = None

class ServicioOut(ServicioBase):
    id: int

    class Config:
        from_attributes = True
