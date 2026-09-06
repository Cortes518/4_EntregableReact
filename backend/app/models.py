from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)

    usuarios = relationship("User", back_populates="rol")


class Category(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), unique=True, nullable=False)
    descripcion = Column(Text, nullable=True)

    productos = relationship("Product", back_populates="categoria")
    servicios = relationship("Service", back_populates="categoria")


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
    password = Column(String(255), nullable=False) # Hashing seguro (bcrypt)
    foto = Column(String(255), nullable=True)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo
    ultimo_acceso = Column(DateTime, nullable=True)
    fecha_registro = Column(DateTime, server_default=func.now())
    fecha_actualizacion = Column(DateTime, server_default=func.now(), onupdate=func.now())

    rol = relationship("Role", back_populates="usuarios")


class Product(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True, default=1)
    id_usuario_registro = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, default=1)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo

    categoria = relationship("Category", back_populates="productos")


class Service(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True, default=3)
    id_usuario_registro = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, default=1)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo

    categoria = relationship("Category", back_populates="servicios")
