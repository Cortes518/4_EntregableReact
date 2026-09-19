from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Sale(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_factura = Column(String(30), unique=True, index=True, nullable=False)
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True) # Operador/Empleado que registró
    subtotal = Column(Float, nullable=False, default=0.0)
    descuento = Column(Float, nullable=False, default=0.0)
    impuesto = Column(Float, nullable=False, default=0.0) # IVA
    total = Column(Float, nullable=False, default=0.0)
    fecha_hora = Column(DateTime, default=datetime.utcnow, nullable=False)
    metodo_pago = Column(String(50), default="Efectivo", nullable=False) # Efectivo, Tarjeta, Transferencia, PSE
    estado = Column(String(30), default="Completada", nullable=False) # Completada, Pendiente, Cancelada
    notas = Column(Text, nullable=True)

    # Relaciones
    cliente = relationship("User", foreign_keys=[id_cliente], backref="compras")
    usuario_operador = relationship("User", foreign_keys=[id_usuario], backref="ventas_operadas")
    detalles = relationship("SaleDetail", back_populates="venta", cascade="all, delete-orphan", lazy="joined")
