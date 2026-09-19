from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SaleDetail(Base):
    __tablename__ = "detalles_venta"

    id_detalle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta", ondelete="CASCADE"), nullable=False)
    tipo_item = Column(String(20), nullable=False) # 'producto' o 'servicio'
    id_producto = Column(Integer, ForeignKey("productos.id"), nullable=True)
    id_servicio = Column(Integer, ForeignKey("servicios.id"), nullable=True)
    nombre_item = Column(String(150), nullable=False)
    cantidad = Column(Integer, default=1, nullable=False)
    precio_unitario = Column(Float, nullable=False, default=0.0)
    subtotal = Column(Float, nullable=False, default=0.0)

    # Relaciones
    venta = relationship("Sale", back_populates="detalles")
    producto = relationship("Product", foreign_keys=[id_producto])
    servicio = relationship("Service", foreign_keys=[id_servicio])
