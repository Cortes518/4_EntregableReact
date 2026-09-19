import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base, SessionLocal
from app.models import Role, User, Product, Service, Category
from app.auth import get_password_hash

from app.routes import auth, usuarios, productos, servicios, ventas, pqrs, estadisticas, chatbot

load_dotenv()


PROJECT_NAME = os.getenv("PROJECT_NAME", "PCortes API Fullstack")
API_V1_STR = os.getenv("API_V1_STR", "/api/v1")

app = FastAPI(
    title=PROJECT_NAME,
    openapi_url=f"{API_V1_STR}/openapi.json",
    docs_url=f"{API_V1_STR}/docs"
)

# Configurar middleware CORS para permitir peticiones HTTP/JSON desde React (Vite - puerto 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            # Poblar Roles si no existen
            if db.query(Role).count() == 0:
                roles = [
                    Role(id=1, nombre="Administrador"),
                    Role(id=2, nombre="Empleado"),
                    Role(id=3, nombre="Cliente")
                ]
                db.add_all(roles)
                db.commit()

            # Poblar Categorías si no existen
            if db.query(Category).count() == 0:
                categorias = [
                    Category(id=1, nombre="Computadores y Equipos", descripcion="Equipos Gamer, Workstations y All-in-One"),
                    Category(id=2, nombre="Accesorios y Componentes", descripcion="Periféricos, hardware y monitores"),
                    Category(id=3, nombre="Servicios Técnicos", descripcion="Mantenimiento, ensamble y reparación"),
                ]
                db.add_all(categorias)
                db.commit()

            # Poblar Usuario Admin por defecto si no existen usuarios
            admin_id = 1
            if db.query(User).count() == 0:
                admin_user = User(
                    id_usuario=1,
                    id_rol=1,
                    nombres="Juan Jose",
                    apellidos="Cortes ADMIN",
                    tipo_documento="CC",
                    numero_documento="1021926174",
                    direccion="Calle 100 # 15-20, Bogotá",
                    telefono="3237011356",
                    email="juanjocortes518@gmail.com",
                    password=get_password_hash("Juanyt518"),
                    estado="Activo"
                )
                db.add(admin_user)
                db.commit()
                admin_id = admin_user.id_usuario
            else:
                first_admin = db.query(User).filter(User.id_rol == 1).first() or db.query(User).first()
                if first_admin:
                    admin_id = first_admin.id_usuario

            # Poblar Productos por defecto si no existen
            if db.query(Product).count() == 0:
                productos_seed = [
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Gamer Ultra RTX 4090", descripcion="La máquina definitiva para gaming 4K con refrigeración líquida y RGB personalizable.", precio=8900000.0, stock=10, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="Workstation Pro AMD Threadripper", descripcion="Potencia extrema para diseño 3D, renderizado y edición de video profesional.", precio=7500000.0, stock=8, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="Gaming Setup RGB Completo", descripcion="Paquete todo incluido: torre, monitor curvo 240Hz, teclado y mouse mecánico.", precio=6200000.0, stock=12, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="Mini PC Gamer Portátil", descripcion="Compacto, silencioso y potente. Perfecto para espacios reducidos sin sacrificar rendimiento.", precio=4100000.0, stock=15, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Gamer Series RGB Pro", descripcion="Estética espectacular con GPU RTX 4070 y 32 GB DDR5 para dominar cualquier juego.", precio=5400000.0, stock=10, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC All-in-One Premium", descripcion="Diseño elegante con pantalla integrada 4K. Ideal para oficina y trabajo creativo.", precio=3800000.0, stock=14, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Streaming & Content Creator", descripcion="Optimizada para streaming en vivo con captura, edición y transmisión simultánea.", precio=5900000.0, stock=7, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Intel Core i9 Extreme", descripcion="Velocidad sin límites con el procesador más potente de Intel y 64 GB de RAM.", precio=8200000.0, stock=6, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Ryzen 9 7950X Edition", descripcion="16 núcleos de alto rendimiento para multitarea exigente y cargas de trabajo pesadas.", precio=7800000.0, stock=9, estado="Activo"),
                    Product(id_categoria=1, id_usuario=admin_id, nombre="PC Entrada Gamer", descripcion="La mejor relación calidad-precio para comenzar en el mundo del gaming competitivo.", precio=3200000.0, stock=20, estado="Activo"),
                ]
                db.add_all(productos_seed)
                db.commit()

            # Poblar Servicios Técnicos por defecto si no existen
            if db.query(Service).count() == 0:
                servicios_seed = [
                    Service(id_categoria=3, id_usuario=admin_id, nombre="Mantenimiento Preventivo y Limpieza", descripcion="Limpieza profunda de componentes, cambio de pasta térmica de alto rendimiento y optimización del sistema.", precio=120000.0, estado="Activo"),
                    Service(id_categoria=3, id_usuario=admin_id, nombre="Ensamble y Configuración Personalizada", descripcion="Armado profesional de PC con gestión de cables oculta, actualización de BIOS y pruebas de estrés térmico.", precio=180000.0, estado="Activo"),
                    Service(id_categoria=3, id_usuario=admin_id, nombre="Instalación y Optimización de Software", descripcion="Instalación de Sistema Operativo, drivers actualizados, antivirus y suite de productividad.", precio=90000.0, estado="Activo"),
                    Service(id_categoria=3, id_usuario=admin_id, nombre="Diagnóstico y Reparación de Hardware", descripcion="Revisión exhaustiva con instrumental de diagnóstico para detección de fallas electrónicas.", precio=80000.0, estado="Activo"),
                ]
                db.add_all(servicios_seed)
                db.commit()

        finally:
            db.close()
    except Exception as e:
        print(f"[WARN] No se pudo ejecutar el seed inicial: {e}")

# Routers — Auth, Usuarios, Productos, Servicios y Ventas bajo el prefijo versionado /api/v1/
app.include_router(auth.router, prefix=f"{API_V1_STR}/auth", tags=["Autenticación"])
app.include_router(usuarios.router, prefix=f"{API_V1_STR}/usuarios", tags=["Usuarios"])
app.include_router(productos.router, prefix=f"{API_V1_STR}/productos", tags=["Productos"])
app.include_router(servicios.router, prefix=f"{API_V1_STR}/servicios", tags=["Servicios"])
app.include_router(ventas.router, prefix=f"{API_V1_STR}/ventas", tags=["Ventas y Facturación"])
app.include_router(pqrs.router, prefix=f"{API_V1_STR}/pqrs", tags=["PQR"])
app.include_router(estadisticas.router, prefix=f"{API_V1_STR}/estadisticas", tags=["Estadísticas"])
app.include_router(chatbot.router, prefix=f"{API_V1_STR}/chatbot", tags=["Chatbot IA"])



@app.get("/")
def root():
    return {
        "message": f"Bienvenido a {PROJECT_NAME}",
        "docs": f"{API_V1_STR}/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=3000, reload=True)
