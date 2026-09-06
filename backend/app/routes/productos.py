from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Product
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut
from app.schemas.usuario import StatusUpdate

router = APIRouter()

@router.get("", response_model=List[ProductoOut])
def get_productos(all: bool = Query(True), db: Session = Depends(get_db)):
    query = db.query(Product)
    if not all:
        query = query.filter(Product.estado == "Activo")
    return query.all()

@router.get("/{id}", response_model=ProductoOut)
def get_producto(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@router.post("", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def create_producto(data: ProductoCreate, db: Session = Depends(get_db)):
    new_product = Product(**data.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/{id}", response_model=ProductoOut)
def update_producto(id: int, data: ProductoUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product

@router.patch("/{id}/estado", response_model=ProductoOut)
@router.patch("/{id}/status", response_model=ProductoOut)
def change_producto_estado(id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    product.estado = data.estado
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{id}")
def delete_producto(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    db.delete(product)
    db.commit()
    return {"success": True, "message": "Producto eliminado exitosamente"}
