from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.servicio import Service
from app.schemas.servicio import ServicioCreate, ServicioUpdate, ServicioOut
from app.schemas.usuario import StatusUpdate

router = APIRouter()

@router.get("", response_model=List[ServicioOut])
def get_servicios(all: bool = Query(True), db: Session = Depends(get_db)):
    query = db.query(Service)
    if not all:
        query = query.filter(Service.estado == "Activo")
    return query.all()

@router.get("/{id}", response_model=ServicioOut)
def get_servicio(id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return service

@router.post("", response_model=ServicioOut, status_code=status.HTTP_201_CREATED)
def create_servicio(data: ServicioCreate, db: Session = Depends(get_db)):
    new_service = Service(**data.model_dump())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.put("/{id}", response_model=ServicioOut)
def update_servicio(id: int, data: ServicioUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)
    return service

@router.patch("/{id}/estado", response_model=ServicioOut)
@router.patch("/{id}/status", response_model=ServicioOut)
def change_servicio_estado(id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    service.estado = data.estado
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id}")
def delete_servicio(id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    db.delete(service)
    db.commit()
    return {"success": True, "message": "Servicio eliminado exitosamente"}
