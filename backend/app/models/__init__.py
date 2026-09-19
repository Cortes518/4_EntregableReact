from app.models.rol import Role
from app.models.permiso import Permission, roles_permisos
from app.models.categoria import Category
from app.models.usuario import User
from app.models.producto import Product
from app.models.servicio import Service
from app.models.venta import Sale
from app.models.detalle_venta import SaleDetail
from app.models.pqr import PQR
from app.models.conversacion import Conversation, Message

__all__ = [
    "Role",
    "Permission",
    "roles_permisos",
    "Category",
    "User",
    "Product",
    "Service",
    "Sale",
    "SaleDetail",
    "PQR",
    "Conversation",
    "Message",
]

