from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

roles_permisos = Table(
    "roles_permisos",
    Base.metadata,
    Column("rol_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permiso_id", Integer, ForeignKey("permisos.id", ondelete="CASCADE"), primary_key=True)
)

class Permission(Base):
    __tablename__ = "permisos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)

    roles = relationship("Role", secondary=roles_permisos, back_populates="permisos")
