from datetime import datetime
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.schemas.chatbot import ChatbotRequest, ChatbotResponse, ConversationOut, MessageOut
from app.services.ai_service import AIService
from app.auth import decode_access_token
from app.models.usuario import User
from app.models.conversacion import Conversation, Message

router = APIRouter()


def _obtener_usuario_opcional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Extrae el usuario si se envió un token JWT válido en el header, sin bloquear si es visitante."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("id_usuario") or payload.get("id")
    if not user_id:
        return None
    return db.query(User).filter(User.id_usuario == user_id).first()


@router.post("/message", response_model=ChatbotResponse)
@router.post("/message/", response_model=ChatbotResponse)
def enviar_mensaje(
    req: ChatbotRequest,
    db: Session = Depends(get_db),
    usuario_actual: Optional[User] = Depends(_obtener_usuario_opcional),
):
    """
    Procesa un mensaje de usuario a través del servicio de Inteligencia Artificial (OpenAI / Gemini)
    o el motor de conocimiento contextual de PCortes con datos en vivo de la BD,
    y persiste la interacción en las tablas 'conversaciones' y 'mensajes'.
    """
    nombre_cliente = usuario_actual.nombres if usuario_actual else None
    historial_dicts = [{"role": m.role, "content": m.content} for m in req.historial]

    # Generar respuesta con IA
    respuesta, sugerencias, proveedor = AIService.responder(
        mensaje=req.mensaje,
        historial=historial_dicts,
        db=db,
        user_nombre=nombre_cliente,
    )

    # Persistir en base de datos (tablas conversaciones y mensajes)
    id_conversacion = req.id_conversacion
    conversacion = None
    if id_conversacion:
        conversacion = db.query(Conversation).filter(Conversation.id_conversacion == id_conversacion).first()

    if not conversacion:
        titulo_auto = (req.mensaje[:60] + "...") if len(req.mensaje) > 60 else req.mensaje
        conversacion = Conversation(
            id_usuario=usuario_actual.id_usuario if usuario_actual else None,
            titulo=titulo_auto,
            fecha_creacion=datetime.utcnow(),
            ultimo_mensaje=datetime.utcnow(),
            estado="Activa",
        )
        db.add(conversacion)
        db.flush()

    # Guardar mensaje del usuario
    msg_user = Message(
        id_conversacion=conversacion.id_conversacion,
        rol="user",
        contenido=req.mensaje,
        fecha_hora=datetime.utcnow(),
    )
    db.add(msg_user)

    # Guardar respuesta del asistente
    msg_bot = Message(
        id_conversacion=conversacion.id_conversacion,
        rol="assistant",
        contenido=respuesta,
        proveedor=proveedor,
        fecha_hora=datetime.utcnow(),
    )
    db.add(msg_bot)

    conversacion.ultimo_mensaje = datetime.utcnow()
    db.commit()

    return ChatbotResponse(
        respuesta=respuesta,
        sugerencias=sugerencias,
        proveedor=proveedor,
        id_conversacion=conversacion.id_conversacion,
    )


@router.get("/conversaciones", response_model=List[ConversationOut])
@router.get("/conversaciones/", response_model=List[ConversationOut])
def listar_conversaciones(
    db: Session = Depends(get_db),
    usuario_actual: Optional[User] = Depends(_obtener_usuario_opcional),
):
    """
    Lista las conversaciones registradas. Si el usuario está autenticado,
    los administradores/empleados ven todas y los clientes ven solo las suyas.
    """
    query = db.query(Conversation)
    if usuario_actual:
        rol_nombre = usuario_actual.rol.nombre if usuario_actual.rol else "Cliente"
        if rol_nombre.lower() not in ["administrador", "empleado"]:
            query = query.filter(Conversation.id_usuario == usuario_actual.id_usuario)
    else:
        query = query.filter(Conversation.id_usuario == None)

    conversaciones = query.order_by(Conversation.ultimo_mensaje.desc()).limit(50).all()
    resultado = []
    for c in conversaciones:
        resultado.append(ConversationOut(
            id_conversacion=c.id_conversacion,
            id_usuario=c.id_usuario,
            titulo=c.titulo,
            fecha_creacion=c.fecha_creacion,
            ultimo_mensaje=c.ultimo_mensaje,
            estado=c.estado,
            total_mensajes=len(c.mensajes),
        ))
    return resultado


@router.get("/conversaciones/{id_conversacion}/mensajes", response_model=List[MessageOut])
def obtener_mensajes_conversacion(
    id_conversacion: int,
    db: Session = Depends(get_db),
):
    """Retorna el historial de mensajes de una conversación específica."""
    conv = db.query(Conversation).filter(Conversation.id_conversacion == id_conversacion).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversación no encontrada.")
    return conv.mensajes


@router.get("/sugerencias")
@router.get("/sugerencias/")
def obtener_sugerencias():
    """Retorna sugerencias iniciales para iniciar la conversación."""
    return {
        "sugerencias": [
            "¿Qué computadores tienen disponibles?",
            "¿Cómo puedo comprar en línea?",
            "¿Qué servicios técnicos ofrecen?",
            "¿Cómo radicar una PQR?",
            "Horarios y canales de atención",
        ]
    }
