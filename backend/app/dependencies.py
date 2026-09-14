from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import User
from app.auth import decode_access_token

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials if credentials else None
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado. Acceso denegado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_email = payload["sub"]
    user = db.query(User).filter(User.email == user_email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario asociado al token no existe.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.estado == "Inactivo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta de usuario está inactiva.",
        )

    return user

def require_roles(roles_permitidos: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        rol_nombre = current_user.rol.nombre if current_user.rol else "Cliente"
        if rol_nombre not in roles_permitidos and rol_nombre.lower() not in [r.lower() for r in roles_permitidos]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(roles_permitidos)}"
            )
        return current_user
    return role_checker

