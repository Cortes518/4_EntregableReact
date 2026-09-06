from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import User
from app.models.rol import Role
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest
from app.schemas.usuario import UsuarioOut
from app.auth import verify_password, get_password_hash, create_access_token
from app.dependencies import get_current_user
import random

router = APIRouter()

def serialize_user(user: User) -> dict:
    rol_nombre = user.rol.nombre if user.rol else "Cliente"
    return {
        "id_usuario": user.id_usuario,
        "nombres": user.nombres,
        "apellidos": user.apellidos or "",
        "tipo_documento": user.tipo_documento or "CC",
        "numero_documento": user.numero_documento or "",
        "direccion": user.direccion or "",
        "telefono": user.telefono or "",
        "email": user.email,
        "id_rol": user.id_rol,
        "rol_nombre": rol_nombre,
        "estado": user.estado or "Activo",
        "foto": user.foto,
        "fecha_registro": user.fecha_registro
    }

@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    
    if user.estado == "Inactivo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario se encuentra inactiva"
        )

    rol_nombre = user.rol.nombre if user.rol else "Cliente"

    access_token = create_access_token(
        user_email=user.email,
        user_role=rol_nombre,
        user_id=user.id_usuario
    )

    return {
        "success": True,
        "token": access_token,
        "usuario": serialize_user(user)
    }

@router.post("/register")
@router.post("/registro")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )

    if data.numero_documento and data.numero_documento.strip():
        existing_doc = db.query(User).filter(User.numero_documento == data.numero_documento).first()
        if existing_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de documento ya se encuentra registrado"
            )

    role = db.query(Role).filter(Role.id == data.id_rol).first()
    role_id = role.id if role else 3

    hashed_password = get_password_hash(data.password)

    new_user = User(
        nombres=data.nombres,
        apellidos=data.apellidos,
        tipo_documento=data.tipo_documento,
        numero_documento=data.numero_documento,
        direccion=data.direccion,
        telefono=data.telefono,
        email=data.email,
        password=hashed_password,
        id_rol=role_id,
        estado="Activo"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "Usuario registrado exitosamente",
        "usuario": serialize_user(new_user)
    }

@router.get("/perfil", response_model=UsuarioOut)
def get_perfil(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe una cuenta registrada con este correo electrónico"
        )
    
    code = f"PC-{random.randint(10000, 99999)}"
    nombre_completo = f"{user.nombres} {user.apellidos}".strip() or user.nombres

    return {
        "success": True,
        "message": f"Se ha generado el proceso ficticio de recuperación para {data.email}",
        "correoFicticio": {
            "remitente": "soporte@pcortes.com",
            "expiraEn": "15 minutos",
            "destinatario": user.email,
            "nombreUsuario": nombre_completo,
            "asunto": "Recuperación de Contraseña - Plataforma PCortes",
            "pasos": [
                "1. Copia el Código de Seguridad Temporal simulado.",
                "2. Haz clic en 'Simular Restablecimiento y Volver'.",
                "3. Inicia sesión con tus credenciales en la plataforma."
            ],
            "codigoSeguridad": code
        }
    }
