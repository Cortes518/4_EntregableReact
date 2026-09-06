from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    nombres: str
    apellidos: Optional[str] = ""
    tipo_documento: Optional[str] = "CC"
    numero_documento: Optional[str] = ""
    direccion: Optional[str] = ""
    telefono: Optional[str] = ""
    email: EmailStr
    id_rol: int = 3
    estado: str = "Activo"

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    id_rol: Optional[int] = None
    password: Optional[str] = None
    estado: Optional[str] = None

class StatusUpdate(BaseModel):
    estado: str # Activo / Inactivo

class UsuarioOut(UsuarioBase):
    id_usuario: int
    rol_nombre: Optional[str] = "Cliente"
    foto: Optional[str] = None
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True
