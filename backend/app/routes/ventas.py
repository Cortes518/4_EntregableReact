from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

from app.database import get_db
from app.dependencies import get_current_user, require_roles
from app.models.venta import Sale

from app.models.detalle_venta import SaleDetail
from app.models.usuario import User
from app.models.producto import Product
from app.models.servicio import Service
from app.schemas.venta import (
    SaleCreate,
    SaleResponse,
    DailyReportResponse,
)

router = APIRouter()

def generar_numero_factura(db: Session) -> str:
    """Genera un número de factura correlativo único: FAC-YYYYMMDD-0001"""
    hoy_str = datetime.utcnow().strftime("%Y%m%d")
    prefijo = f"FAC-{hoy_str}"
    
    # Contar cuántas facturas se han creado hoy
    count_hoy = db.query(Sale).filter(Sale.numero_factura.like(f"{prefijo}-%")).count()
    siguiente_num = count_hoy + 1
    return f"{prefijo}-{siguiente_num:04d}"

@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def crear_venta(
    venta_in: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Registra una nueva venta de productos y/o servicios.
    Deduce automáticamente el stock si la venta está completada.
    """
    if not venta_in.items or len(venta_in.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La venta debe incluir al menos un producto o servicio.",
        )

    # Validar cliente
    cliente = db.query(User).filter(User.id_usuario == venta_in.id_cliente).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El cliente con ID {venta_in.id_cliente} no existe.",
        )

    # Operador (si no viene explícito, asignar el usuario actual autenticado si es admin/empleado)
    id_operador = venta_in.id_usuario
    if not id_operador and current_user.id_rol in [1, 2]:
        id_operador = current_user.id_usuario

    subtotal_calculado = 0.0
    detalles_a_crear = []

    # Validar stock y preparar detalles
    for item in venta_in.items:
        item_subtotal = round(item.cantidad * item.precio_unitario, 2)
        subtotal_calculado += item_subtotal

        if item.tipo_item == "producto":
            if not item.id_producto:
                raise HTTPException(status_code=400, detail="Falta id_producto para ítem de tipo producto.")
            prod = db.query(Product).filter(Product.id == item.id_producto).first()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Producto ID {item.id_producto} no encontrado.")
            
            # Validar stock disponible
            if venta_in.estado == "Completada":
                if prod.stock < item.cantidad:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente para '{prod.nombre}'. Disponible: {prod.stock}, Solicitado: {item.cantidad}",
                    )
                prod.stock -= item.cantidad

        elif item.tipo_item == "servicio":
            if not item.id_servicio:
                raise HTTPException(status_code=400, detail="Falta id_servicio para ítem de tipo servicio.")
            serv = db.query(Service).filter(Service.id == item.id_servicio).first()
            if not serv:
                raise HTTPException(status_code=404, detail=f"Servicio ID {item.id_servicio} no encontrado.")

        detalle = SaleDetail(
            tipo_item=item.tipo_item,
            id_producto=item.id_producto,
            id_servicio=item.id_servicio,
            nombre_item=item.nombre_item,
            cantidad=item.cantidad,
            precio_unitario=item.precio_unitario,
            subtotal=item_subtotal,
        )
        detalles_a_crear.append(detalle)

    # Cálculo final
    total_calculado = round(subtotal_calculado - venta_in.descuento + venta_in.impuesto, 2)
    if total_calculado < 0:
        total_calculado = 0.0

    numero_fac = generar_numero_factura(db)

    nueva_venta = Sale(
        numero_factura=numero_fac,
        id_cliente=venta_in.id_cliente,
        id_usuario=id_operador,
        subtotal=subtotal_calculado,
        descuento=venta_in.descuento,
        impuesto=venta_in.impuesto,
        total=total_calculado,
        fecha_hora=datetime.utcnow(),
        metodo_pago=venta_in.metodo_pago,
        estado=venta_in.estado,
        notas=venta_in.notas,
        detalles=detalles_a_crear,
    )

    db.add(nueva_venta)
    db.commit()
    db.refresh(nueva_venta)
    return nueva_venta

@router.get("", response_model=List[SaleResponse])
@router.get("/", response_model=List[SaleResponse])
def listar_ventas(
    fecha_inicio: Optional[str] = Query(None, description="Fecha inicio YYYY-MM-DD"),
    fecha_fin: Optional[str] = Query(None, description="Fecha fin YYYY-MM-DD"),
    fecha: Optional[str] = Query(None, description="Fecha exacta YYYY-MM-DD"),
    cliente_busqueda: Optional[str] = Query(None, description="Nombre o documento del cliente"),
    id_cliente: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    valor_min: Optional[float] = Query(None),
    valor_max: Optional[float] = Query(None),
    numero_factura: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Historial de ventas con filtros múltiples por fecha, cliente, estado, valor y factura.
    """
    query = db.query(Sale).join(Sale.cliente)

    if numero_factura:
        query = query.filter(Sale.numero_factura.ilike(f"%{numero_factura}%"))

    if estado:
        query = query.filter(Sale.estado == estado)

    if id_cliente:
        query = query.filter(Sale.id_cliente == id_cliente)

    if cliente_busqueda:
        busq = f"%{cliente_busqueda}%"
        query = query.filter(
            or_(
                User.nombres.ilike(busq),
                User.apellidos.ilike(busq),
                User.numero_documento.ilike(busq),
                User.email.ilike(busq),
            )
        )

    if fecha:
        try:
            f_d = datetime.strptime(fecha, "%Y-%m-%d").date()
            query = query.filter(func.date(Sale.fecha_hora) == f_d)
        except ValueError:
            pass

    if fecha_inicio:
        try:
            f_ini = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            query = query.filter(func.date(Sale.fecha_hora) >= f_ini)
        except ValueError:
            pass

    if fecha_fin:
        try:
            f_end = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            query = query.filter(func.date(Sale.fecha_hora) <= f_end)
        except ValueError:
            pass

    if valor_min is not None:
        query = query.filter(Sale.total >= valor_min)

    if valor_max is not None:
        query = query.filter(Sale.total <= valor_max)

    # Si es cliente, solo ve sus propias compras
    if current_user.id_rol == 3:
        query = query.filter(Sale.id_cliente == current_user.id_usuario)

    ventas = query.order_by(Sale.fecha_hora.desc()).all()
    return ventas

@router.get("/reporte-diario", response_model=DailyReportResponse)
def reporte_diario_ventas(
    fecha: Optional[str] = Query(None, description="Fecha YYYY-MM-DD. Por defecto hoy."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Genera el consolidado diario de ventas para una fecha específica.
    """
    if not fecha:
        target_date = datetime.utcnow().date()
        fecha_str = target_date.strftime("%Y-%m-%d")
    else:
        try:
            target_date = datetime.strptime(fecha, "%Y-%m-%d").date()
            fecha_str = fecha
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Utilice YYYY-MM-DD.")

    ventas = (
        db.query(Sale)
        .filter(func.date(Sale.fecha_hora) == target_date)
        .order_by(Sale.fecha_hora.asc())
        .all()
    )

    total_ventas = len(ventas)
    total_recaudado = sum(v.total for v in ventas if v.estado == "Completada")
    total_descuentos = sum(v.descuento for v in ventas if v.estado == "Completada")
    total_impuestos = sum(v.impuesto for v in ventas if v.estado == "Completada")

    prod_count = 0
    serv_count = 0
    for v in ventas:
        if v.estado == "Completada":
            for d in v.detalles:
                if d.tipo_item == "producto":
                    prod_count += d.cantidad
                elif d.tipo_item == "servicio":
                    serv_count += d.cantidad

    return DailyReportResponse(
        fecha=fecha_str,
        total_ventas=total_ventas,
        total_recaudado=round(total_recaudado, 2),
        total_descuentos=round(total_descuentos, 2),
        total_impuestos=round(total_impuestos, 2),
        total_productos_vendidos=prod_count,
        total_servicios_vendidos=serv_count,
        ventas=ventas,
    )

@router.get("/mis-compras", response_model=List[SaleResponse])
def mis_compras(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retorna el historial de compras y facturas del cliente autenticado.
    """
    ventas = (
        db.query(Sale)
        .filter(Sale.id_cliente == current_user.id_usuario)
        .order_by(Sale.fecha_hora.desc())
        .all()
    )
    return ventas

@router.get("/factura/{numero_factura}", response_model=SaleResponse)
def obtener_factura_por_numero(
    numero_factura: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Consulta una factura específica por su número único (e.g. FAC-20260918-0001).
    """
    venta = db.query(Sale).filter(Sale.numero_factura == numero_factura).first()
    if not venta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la factura {numero_factura}.",
        )

    # Si es cliente, solo puede consultar sus propias facturas
    if current_user.id_rol == 3 and venta.id_cliente != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta factura.",
        )

    return venta

@router.get("/{id_venta}", response_model=SaleResponse)
def obtener_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Obtiene los detalles completos de una venta por ID.
    """
    venta = db.query(Sale).filter(Sale.id_venta == id_venta).first()
    if not venta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Venta no encontrada.",
        )

    if current_user.id_rol == 3 and venta.id_cliente != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta venta.",
        )

    return venta
