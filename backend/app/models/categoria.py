from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Category(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)

    productos = relationship("Product", back_populates="categoria")
    servicios = relationship("Service", back_populates="categoria")
