from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversaciones"

    id_conversacion = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="SET NULL"), nullable=True)
    session_id = Column(String(100), index=True, nullable=True)
    titulo = Column(String(150), default="Consulta con Asistente Virtual", nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    ultimo_mensaje = Column(DateTime, default=datetime.utcnow, nullable=False)
    estado = Column(String(20), default="Activa", nullable=False)  # Activa, Cerrada

    # Relaciones
    usuario = relationship("User", backref="conversaciones_chatbot")
    mensajes = relationship("Message", back_populates="conversacion", cascade="all, delete-orphan", order_by="Message.fecha_hora")


class Message(Base):
    __tablename__ = "mensajes"

    id_mensaje = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_conversacion = Column(Integer, ForeignKey("conversaciones.id_conversacion", ondelete="CASCADE"), nullable=False)
    rol = Column(String(20), nullable=False)  # 'user' o 'assistant'
    contenido = Column(Text, nullable=False)
    proveedor = Column(String(30), nullable=True)  # 'gemini', 'openai', 'knowledge_engine'
    fecha_hora = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    conversacion = relationship("Conversation", back_populates="mensajes")
