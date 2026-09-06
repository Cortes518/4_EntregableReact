from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.usuario import UsuarioOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    nombres: str
    apellidos: Optional[str] = ""
    tipo_documento: Optional[str] = "CC"
    numero_documento: Optional[str] = ""
    direccion: Optional[str] = ""
    telefono: Optional[str] = ""
    email: EmailStr
    password: str
    confirmPassword: Optional[str] = None
    id_rol: Optional[int] = 3

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class LoginResponse(BaseModel):
    success: bool = True
    token: str
    usuario: UsuarioOut
