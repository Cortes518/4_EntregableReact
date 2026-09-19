import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Resolver URL de base de datos para entorno local o nube (Railway / Docker)
raw_db_url = (os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL") or "").strip()
# Descartar si el valor es un placeholder literal no resuelto (como "MYSQL_URL") o no contiene "://"
if raw_db_url and "://" in raw_db_url and not raw_db_url.startswith("sqlite"):
    # Normalizar esquema para compatibilidad con PyMySQL
    if raw_db_url.startswith("mysql://"):
        DATABASE_URL = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
    else:
        DATABASE_URL = raw_db_url
    DB_NAME = os.getenv("MYSQL_DATABASE") or os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME", "proyecto_react")
    DB_HOST = os.getenv("MYSQL_HOST") or os.getenv("MYSQLHOST") or os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("MYSQL_PORT") or os.getenv("MYSQLPORT") or os.getenv("DB_PORT", "3306")
else:
    # Variables de entorno individuales según la guía del instructor (o Railway MYSQLHOST/PORT/USER/PASSWORD)
    DB_HOST = os.getenv("MYSQL_HOST") or os.getenv("MYSQLHOST") or os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("MYSQL_PORT") or os.getenv("MYSQLPORT") or os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("MYSQL_DATABASE") or os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME", "proyecto_react")
    DB_USER = os.getenv("MYSQL_USER") or os.getenv("MYSQLUSER") or os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD", "")
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
