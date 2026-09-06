from pydantic import BaseModel
from typing import Optional

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    precio: float
    stock: int = 0
    estado: str = "Activo"

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    estado: Optional[str] = None

class ProductoOut(ProductoBase):
    id: int

    class Config:
        from_attributes = True
