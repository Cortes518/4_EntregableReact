from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Service(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_categoria = Column(Integer, ForeignKey("categorias.id"), nullable=True, default=3)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True, default=6)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    estado = Column(String(20), nullable=False, default="Activo")

    categoria = relationship("Category", back_populates="servicios")
    usuario = relationship("User", back_populates="servicios")
