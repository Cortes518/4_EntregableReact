from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import User
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioOut, StatusUpdate
from app.auth import get_password_hash
from app.routes.auth import serialize_user

router = APIRouter()

@router.get("", response_model=List[UsuarioOut])
def get_usuarios(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [serialize_user(u) for u in users]

@router.get("/{id}", response_model=UsuarioOut)
def get_usuario(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_usuario == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_user(user)

@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
@router.post("/registro", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
def create_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="El correo electrónico ya se encuentra registrado")
    
    if data.numero_documento and data.numero_documento.strip():
        existing_doc = db.query(User).filter(User.numero_documento == data.numero_documento).first()
        if existing_doc:
            raise HTTPException(status_code=400, detail="El número de documento ya se encuentra registrado")

    new_user = User(
        nombres=data.nombres,
        apellidos=data.apellidos,
        tipo_documento=data.tipo_documento,
        numero_documento=data.numero_documento,
        direccion=data.direccion,
        telefono=data.telefono,
        email=data.email,
        password=get_password_hash(data.password),
        id_rol=data.id_rol,
        estado=data.estado or "Activo"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return serialize_user(new_user)

@router.put("/{id}", response_model=UsuarioOut)
def update_usuario(id: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_usuario == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.password = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return serialize_user(user)

@router.patch("/{id}/estado", response_model=UsuarioOut)
@router.patch("/{id}/status", response_model=UsuarioOut)
def change_usuario_estado(id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_usuario == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user.estado = data.estado
    db.commit()
    db.refresh(user)
    return serialize_user(user)

@router.delete("/{id}")
def delete_usuario(id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_usuario == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(user)
    db.commit()
    return {"success": True, "message": "Usuario eliminado exitosamente"}
