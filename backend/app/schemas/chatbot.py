from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str = Field(..., description="Rol del mensaje: 'user' o 'assistant'")
    content: str = Field(..., description="Texto del mensaje")


class ChatbotRequest(BaseModel):
    mensaje: str = Field(..., min_length=1, max_length=1500, description="Pregunta o mensaje del cliente")
    historial: Optional[List[ChatMessage]] = Field(default_factory=list, description="Historial de mensajes previos")
    id_conversacion: Optional[int] = Field(None, description="ID de la conversación existente (opcional)")


class ChatbotResponse(BaseModel):
    respuesta: str = Field(..., description="Respuesta generada para el usuario")
    sugerencias: List[str] = Field(default_factory=list, description="Preguntas o acciones sugeridas")
    proveedor: str = Field(..., description="Proveedor que atendió la consulta ('openai', 'gemini', 'knowledge_engine')")
    id_conversacion: Optional[int] = Field(None, description="ID de la conversación persistida en base de datos")


class MessageOut(BaseModel):
    id_mensaje: int
    id_conversacion: int
    rol: str
    contenido: str
    proveedor: Optional[str] = None
    fecha_hora: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id_conversacion: int
    id_usuario: Optional[int] = None
    titulo: str
    fecha_creacion: datetime
    ultimo_mensaje: datetime
    estado: str
    total_mensajes: Optional[int] = 0

    class Config:
        from_attributes = True

