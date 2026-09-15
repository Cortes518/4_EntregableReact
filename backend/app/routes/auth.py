from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random

from app.database import get_db
from app.models.usuario import User
from app.models.rol import Role
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from app.schemas.usuario import UsuarioOut
from app.auth import verify_password, get_password_hash, create_access_token
from app.dependencies import get_current_user
from app.email import send_reset_code_email

router = APIRouter()

# Almacén en memoria de códigos de recuperación temporales
# { "email": { "code": "123456", "expires_at": datetime, "user_id": int } }
password_reset_codes = {}


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
    
    # Generar código numérico aleatorio de 6 dígitos
    code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    password_reset_codes[data.email.lower()] = {
        "code": code,
        "expires_at": expires_at,
        "user_id": user.id_usuario
    }

    nombre_completo = f"{user.nombres} {user.apellidos}".strip() or user.nombres

    # Enviar correo electrónico real mediante SMTP
    try:
        send_reset_code_email(to_email=user.email, user_name=nombre_completo, code=code)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inesperado al despachar el correo: {str(e)}"
        )

    return {
        "success": True,
        "message": f"Código de verificación enviado exitosamente a {data.email}. Por favor revisa tu bandeja de entrada o spam.",
        "email": user.email
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    email_key = data.email.lower()
    reset_entry = password_reset_codes.get(email_key)

    if not reset_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay una solicitud de recuperación activa para este correo o el código ya fue utilizado."
        )

    # Verificar expiración del código (15 minutos)
    if datetime.now(timezone.utc) > reset_entry["expires_at"]:
        password_reset_codes.pop(email_key, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de verificación ha expirado. Por favor solicita uno nuevo."
        )

    # Verificar coincidencia del código
    if reset_entry["code"].strip() != data.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de verificación ingresado es incorrecto."
        )

    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe tener al menos 8 caracteres."
        )

    user = db.query(User).filter(User.id_usuario == reset_entry["user_id"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )

    # Hashear nueva contraseña con bcrypt y actualizar en MySQL
    user.password = get_password_hash(data.new_password)
    db.commit()
    db.refresh(user)

    # Eliminar código temporal para evitar reuso
    password_reset_codes.pop(email_key, None)

    return {
        "success": True,
        "message": "¡Tu contraseña ha sido actualizada exitosamente! Ya puedes iniciar sesión con tu nueva contraseña."
    }

