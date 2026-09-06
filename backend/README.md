# Backend - FastAPI + Base de Datos SQL + JWT

Carpeta correspondiente al Backend de la aplicación en FastAPI.

## Estructura
- `app/`: Contiene la lógica del servidor (rutas, esquemas, modelos, autenticación y conexión a BD).
  - `routes/`: Endpoints de la API (`auth.py`, `usuarios.py`, `productos.py`, `servicios.py`).
  - `auth.py`: Utilidades para JWT y hashing de contraseñas.
  - `database.py`: Conexión a la base de datos SQL.
  - `main.py`: Punto de entrada de FastAPI.
  - `models.py`: Modelos relacionales de SQLAlchemy.
  - `schemas.py`: Esquemas de validación de Pydantic.
- `basedatos/`: Archivos y scripts de la base de datos relacional.
