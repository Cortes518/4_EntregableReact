from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class PQR(Base):
    __tablename__ = "pqrs"

    id_pqr = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(String(50), nullable=False)  # Petición, Queja, Reclamo, Sugerencia
    asunto = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    estado = Column(String(50), default="Pendiente", nullable=False)  # Pendiente, En Proceso, Respondida, Cerrada
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_respuesta = Column(DateTime, nullable=True)
    respuesta = Column(Text, nullable=True)

    # Relación con usuario
    cliente = relationship("User", backref="pqrs", foreign_keys=[id_cliente])
