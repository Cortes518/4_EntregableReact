from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Esquema para un ítem al crear una venta
class SaleItemCreate(BaseModel):
    tipo_item: str # 'producto' o 'servicio'
    id_producto: Optional[int] = None
    id_servicio: Optional[int] = None
    nombre_item: str
    cantidad: int = 1
    precio_unitario: float

# Esquema para registrar una venta completa
class SaleCreate(BaseModel):
    id_cliente: int
    id_usuario: Optional[int] = None # Operador (opcional si es compra cliente web)
    items: List[SaleItemCreate]
    metodo_pago: str = "Efectivo"
    descuento: float = 0.0
    impuesto: float = 0.0 # Porcentaje o valor fijo
    estado: str = "Completada"
    notas: Optional[str] = None

# Esquema para responder un detalle de venta
class SaleDetailResponse(BaseModel):
    id_detalle: int
    id_venta: int
    tipo_item: str
    id_producto: Optional[int] = None
    id_servicio: Optional[int] = None
    nombre_item: str
    cantidad: int
    precio_unitario: float
    subtotal: float

    class Config:
        from_attributes = True

# Datos simplificados del cliente / usuario para factura
class UserSummary(BaseModel):
    id_usuario: int
    nombres: str
    apellidos: str
    email: str
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None

    class Config:
        from_attributes = True

# Esquema completo de respuesta de venta / factura
class SaleResponse(BaseModel):
    id_venta: int
    numero_factura: str
    id_cliente: int
    id_usuario: Optional[int] = None
    subtotal: float
    descuento: float
    impuesto: float
    total: float
    fecha_hora: datetime
    metodo_pago: str
    estado: str
    notas: Optional[str] = None
    cliente: Optional[UserSummary] = None
    usuario_operador: Optional[UserSummary] = None
    detalles: List[SaleDetailResponse] = []

    class Config:
        from_attributes = True

# Esquema para el reporte diario consolidado
class DailyReportResponse(BaseModel):
    fecha: str
    total_ventas: int
    total_recaudado: float
    total_descuentos: float
    total_impuestos: float
    total_productos_vendidos: int
    total_servicios_vendidos: int
    ventas: List[SaleResponse]

    class Config:
        from_attributes = True
