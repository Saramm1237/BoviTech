#!/bin/bash
set -e

echo "==> Verificando conexion a DB..."
python -c "from app.core.database import engine; conn = engine.connect(); conn.close(); print('DB OK')"

echo "==> Ejecutando migraciones..."
alembic upgrade head

echo "==> Iniciando servidor en puerto ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
