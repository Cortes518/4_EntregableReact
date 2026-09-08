from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)

    usuarios = relationship("User", back_populates="rol")
    permisos = relationship("Permission", secondary="roles_permisos", back_populates="roles")
