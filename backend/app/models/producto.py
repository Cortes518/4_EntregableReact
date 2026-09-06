from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base

class Product(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo
