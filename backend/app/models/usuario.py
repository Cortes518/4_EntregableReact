from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_rol = Column(Integer, ForeignKey("roles.id"), nullable=False, default=3) # 1: Admin, 2: Empleado, 3: Cliente
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=True)
    tipo_documento = Column(String(50), nullable=True, default="CC")
    numero_documento = Column(String(50), nullable=True, index=True)
    direccion = Column(String(200), nullable=True)
    telefono = Column(String(50), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False) # Contraseña encriptada (password_hash)
    foto = Column(String(255), nullable=True)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo
    ultimo_acceso = Column(DateTime, nullable=True)
    fecha_registro = Column(DateTime, server_default=func.now())
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now())

    rol = relationship("Role", back_populates="usuarios")
