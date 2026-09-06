from sqlalchemy import Column, Integer, String, Float, Text
from app.database import Base

class Service(Base):
    __tablename__ = "servicios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio = Column(Float, nullable=False)
    estado = Column(String(20), nullable=False, default="Activo") # Activo / Inactivo
