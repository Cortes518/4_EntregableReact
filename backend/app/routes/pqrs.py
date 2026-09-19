from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.pqr import PQR
from app.models.usuario import User
from app.schemas.pqr import PQRCreate, PQRUpdate, PQRResponse

router = APIRouter()


def _pqr_to_response(pqr: PQR) -> PQRResponse:
    """Convierte un modelo PQR a su schema de respuesta con nombre del cliente."""
    cliente_nombre = ""
    if pqr.cliente:
        cliente_nombre = f"{pqr.cliente.nombres} {pqr.cliente.apellidos or ''}".strip()
    return PQRResponse(
        id_pqr=pqr.id_pqr,
        tipo=pqr.tipo,
        asunto=pqr.asunto,
        descripcion=pqr.descripcion,
        estado=pqr.estado,
        id_cliente=pqr.id_cliente,
        fecha_creacion=pqr.fecha_creacion,
        fecha_respuesta=pqr.fecha_respuesta,
        respuesta=pqr.respuesta,
        cliente_nombre=cliente_nombre,
    )


@router.post("", response_model=PQRResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PQRResponse, status_code=status.HTTP_201_CREATED)
def crear_pqr(
    pqr_in: PQRCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crear una nueva PQR. Cualquier usuario autenticado puede crear.
    """
    mapa_tipos = {
        "petición": "Petición",
        "peticion": "Petición",
        "queja": "Queja",
        "reclamo": "Reclamo",
        "sugerencia": "Sugerencia",
    }
    tipo_normalizado = mapa_tipos.get(pqr_in.tipo.strip().lower())
    if not tipo_normalizado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo inválido. Debe ser: Petición, Queja, Reclamo o Sugerencia.",
        )

    nueva_pqr = PQR(
        tipo=tipo_normalizado,
        asunto=pqr_in.asunto.strip(),
        descripcion=pqr_in.descripcion.strip(),
        estado="Pendiente",
        id_cliente=current_user.id_usuario,
        fecha_creacion=datetime.utcnow(),
    )

    db.add(nueva_pqr)
    db.commit()
    db.refresh(nueva_pqr)
    return _pqr_to_response(nueva_pqr)


@router.get("", response_model=List[PQRResponse])
@router.get("/", response_model=List[PQRResponse])
def listar_pqrs(
    tipo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Listar PQRs. Admin/Empleado ven todas, Cliente solo las suyas.
    """
    query = db.query(PQR)

    # Clientes solo ven sus PQRs
    if current_user.id_rol == 3:
        query = query.filter(PQR.id_cliente == current_user.id_usuario)

    if tipo:
        query = query.filter(PQR.tipo == tipo)
    if estado:
        query = query.filter(PQR.estado == estado)

    pqrs = query.order_by(PQR.fecha_creacion.desc()).all()
    return [_pqr_to_response(p) for p in pqrs]


@router.get("/{id_pqr}", response_model=PQRResponse)
def obtener_pqr(
    id_pqr: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Obtener detalle de una PQR por ID."""
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada.")

    # Clientes solo ven las suyas
    if current_user.id_rol == 3 and pqr.id_cliente != current_user.id_usuario:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta PQR.")

    return _pqr_to_response(pqr)


@router.put("/{id_pqr}", response_model=PQRResponse)
def actualizar_pqr(
    id_pqr: int,
    pqr_in: PQRUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrador", "Empleado"])),
):
    """
    Actualizar estado y/o respuesta de una PQR. Solo Admin/Empleado.
    """
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada.")

    estados_validos = ["Pendiente", "Recibida", "En Proceso", "Respondida", "Resuelta", "Cerrada"]
    if pqr_in.estado and pqr_in.estado not in estados_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}",
        )

    if pqr_in.estado:
        # Mapear a los nombres canónicos del requerimiento 16
        estado_map = {
            "Recibida": "Pendiente",
            "Resuelta": "Respondida",
        }
        pqr.estado = estado_map.get(pqr_in.estado, pqr_in.estado)
    if pqr_in.respuesta:
        pqr.respuesta = pqr_in.respuesta
        pqr.fecha_respuesta = datetime.utcnow()

    db.commit()
    db.refresh(pqr)
    return _pqr_to_response(pqr)


@router.delete("/{id_pqr}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pqr(
    id_pqr: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrador"])),
):
    """Eliminar una PQR. Solo Admin."""
    pqr = db.query(PQR).filter(PQR.id_pqr == id_pqr).first()
    if not pqr:
        raise HTTPException(status_code=404, detail="PQR no encontrada.")

    db.delete(pqr)
    db.commit()
    return None
