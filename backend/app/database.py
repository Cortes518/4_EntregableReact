import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Variables de entorno individuales según la guía del instructor
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "proyecto_react")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

# Construcción de la URL de conexión a MySQL con PyMySQL
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
SQLITE_DB_PATH = os.path.join(BASE_DIR, "basedatos", "database.db")

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Probar conexión activa a MySQL en phpMyAdmin
    with engine.connect() as conn:
        pass
    print(f"[OK] Conectado exitosamente a la base de datos MySQL '{DB_NAME}' en {DB_HOST}:{DB_PORT}")
except Exception as e:
    print(f"[WARN] No se pudo conectar a MySQL ('{DB_NAME}'): {e}")
    print(f"[INFO] Usando base de datos alternativa SQLite en {SQLITE_DB_PATH}")
    DATABASE_URL = f"sqlite:///{SQLITE_DB_PATH}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
