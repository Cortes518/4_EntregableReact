import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import engine, Base, SessionLocal
from app.models import Role, User, Product, Service
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

            # Poblar Usuario Admin por defecto si no existen usuarios
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
