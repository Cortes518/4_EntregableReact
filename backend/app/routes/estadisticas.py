from typing import Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case

from app.database import get_db
from app.dependencies import get_current_user
from app.models.usuario import User
from app.models.producto import Product
from app.models.servicio import Service
from app.models.venta import Sale
from app.models.detalle_venta import SaleDetail
from app.models.pqr import PQR

router = APIRouter()


@router.get("/dashboard")
def dashboard_consolidado(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retorna indicadores consolidados del sistema para el dashboard.
    Admin/Empleado ven todo, Cliente ve solo sus datos.
    """
    if current_user.id_rol == 3:
        # Cliente: estadísticas personales
        total_compras = db.query(Sale).filter(Sale.id_cliente == current_user.id_usuario).count()
        gasto_total = (
            db.query(func.coalesce(func.sum(Sale.total), 0))
            .filter(Sale.id_cliente == current_user.id_usuario, Sale.estado == "Completada")
            .scalar()
        )
        ultima_compra = (
            db.query(Sale.fecha_hora)
            .filter(Sale.id_cliente == current_user.id_usuario)
            .order_by(Sale.fecha_hora.desc())
            .first()
        )
        mis_pqrs = db.query(PQR).filter(PQR.id_cliente == current_user.id_usuario).count()
        pqr_pendientes = (
            db.query(PQR)
            .filter(PQR.id_cliente == current_user.id_usuario, PQR.estado.in_(["Pendiente", "Recibida", "En Proceso"]))
            .count()
        )

        return {
            "total_compras": total_compras,
            "gasto_total": round(float(gasto_total), 2),
            "ultima_compra": ultima_compra[0].isoformat() if ultima_compra and ultima_compra[0] else None,
            "mis_pqrs": mis_pqrs,
            "pqr_pendientes": pqr_pendientes,
        }

    # Admin/Empleado: estadísticas globales
    total_usuarios = db.query(User).count()
    usuarios_activos = db.query(User).filter(User.estado == "Activo").count()
    total_productos = db.query(Product).count()
    total_servicios = db.query(Service).count()
    productos_bajo_stock = db.query(Product).filter(Product.stock <= 5).count()

    total_ventas = db.query(Sale).count()
    total_facturacion = (
        db.query(func.coalesce(func.sum(Sale.total), 0))
        .filter(Sale.estado == "Completada")
        .scalar()
    )
    ventas_completadas = db.query(Sale).filter(Sale.estado == "Completada").count()
    ventas_pendientes = db.query(Sale).filter(Sale.estado == "Pendiente").count()
    ventas_canceladas = db.query(Sale).filter(Sale.estado == "Cancelada").count()

    pqr_recibidas = db.query(PQR).count()
    pqr_pendientes = db.query(PQR).filter(PQR.estado.in_(["Pendiente", "Recibida", "En Proceso"])).count()

    return {
        "total_usuarios": total_usuarios,
        "usuarios_activos": usuarios_activos,
        "total_productos": total_productos,
        "total_servicios": total_servicios,
        "productos_bajo_stock": productos_bajo_stock,
        "total_ventas": total_ventas,
        "total_facturacion": round(float(total_facturacion), 2),
        "ventas_completadas": ventas_completadas,
        "ventas_pendientes": ventas_pendientes,
        "ventas_canceladas": ventas_canceladas,
        "pqr_recibidas": pqr_recibidas,
        "pqr_pendientes": pqr_pendientes,
    }


@router.get("/ventas-chart")
def ventas_chart(
    agrupacion: str = Query("dia", description="dia | semana | mes"),
    fecha_inicio: Optional[str] = Query(None, description="YYYY-MM-DD"),
    fecha_fin: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retorna datos de ventas agrupados por período para gráficos.
    Solo Admin/Empleado.
    """
    if current_user.id_rol == 3:
        raise HTTPException(status_code=403, detail="Acceso denegado para clientes.")

    # Definir rango de fechas por defecto (últimos 30 días)
    if fecha_fin:
        try:
            end_date = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        except ValueError:
            end_date = datetime.utcnow().date()
    else:
        end_date = datetime.utcnow().date()

    if fecha_inicio:
        try:
            start_date = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
        except ValueError:
            start_date = end_date - timedelta(days=30)
    else:
        start_date = end_date - timedelta(days=30)

    # Query base filtrada por rango
    ventas_query = (
        db.query(Sale)
        .filter(
            func.date(Sale.fecha_hora) >= start_date,
            func.date(Sale.fecha_hora) <= end_date,
            Sale.estado == "Completada",
        )
        .all()
    )

    # Agrupar datos
    agrupados = {}

    for v in ventas_query:
        if agrupacion == "mes":
            key = v.fecha_hora.strftime("%Y-%m")
        elif agrupacion == "semana":
            # Inicio de semana (lunes)
            iso = v.fecha_hora.isocalendar()
            key = f"{iso[0]}-S{iso[1]:02d}"
        else:  # dia
            key = v.fecha_hora.strftime("%Y-%m-%d")

        if key not in agrupados:
            agrupados[key] = {
                "ventas_count": 0,
                "ventas_total": 0.0,
                "productos_vendidos": 0,
                "servicios_vendidos": 0,
            }

        agrupados[key]["ventas_count"] += 1
        agrupados[key]["ventas_total"] += float(v.total)

        for d in v.detalles:
            if d.tipo_item == "producto":
                agrupados[key]["productos_vendidos"] += d.cantidad
            elif d.tipo_item == "servicio":
                agrupados[key]["servicios_vendidos"] += d.cantidad

    # Ordenar por clave cronológica
    labels = sorted(agrupados.keys())

    return {
        "labels": labels,
        "ventas_count": [agrupados[k]["ventas_count"] for k in labels],
        "ventas_total": [round(agrupados[k]["ventas_total"], 2) for k in labels],
        "productos_vendidos": [agrupados[k]["productos_vendidos"] for k in labels],
        "servicios_vendidos": [agrupados[k]["servicios_vendidos"] for k in labels],
    }


@router.get("/mis-estadisticas")
def mis_estadisticas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Estadísticas personales del cliente autenticado.
    """
    total_compras = db.query(Sale).filter(Sale.id_cliente == current_user.id_usuario).count()
    gasto_total = (
        db.query(func.coalesce(func.sum(Sale.total), 0))
        .filter(Sale.id_cliente == current_user.id_usuario, Sale.estado == "Completada")
        .scalar()
    )
    ultima_compra = (
        db.query(Sale.fecha_hora)
        .filter(Sale.id_cliente == current_user.id_usuario)
        .order_by(Sale.fecha_hora.desc())
        .first()
    )

    # Compras por mes (últimos 6 meses)
    seis_meses = datetime.utcnow() - timedelta(days=180)
    compras_recientes = (
        db.query(Sale)
        .filter(
            Sale.id_cliente == current_user.id_usuario,
            Sale.estado == "Completada",
            Sale.fecha_hora >= seis_meses,
        )
        .all()
    )

    gastos_por_mes = {}
    for c in compras_recientes:
        key = c.fecha_hora.strftime("%Y-%m")
        gastos_por_mes[key] = gastos_por_mes.get(key, 0) + float(c.total)

    labels = sorted(gastos_por_mes.keys())

    mis_pqrs = db.query(PQR).filter(PQR.id_cliente == current_user.id_usuario).count()
    pqr_pendientes = (
        db.query(PQR)
        .filter(PQR.id_cliente == current_user.id_usuario, PQR.estado.in_(["Recibida", "En Proceso"]))
        .count()
    )

    return {
        "total_compras": total_compras,
        "gasto_total": round(float(gasto_total), 2),
        "ultima_compra": ultima_compra[0].isoformat() if ultima_compra and ultima_compra[0] else None,
        "mis_pqrs": mis_pqrs,
        "pqr_pendientes": pqr_pendientes,
        "gastos_mensuales": {
            "labels": labels,
            "valores": [round(gastos_por_mes[k], 2) for k in labels],
        },
    }
