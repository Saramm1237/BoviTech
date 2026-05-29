from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Railway usa proxy público que requiere SSL; el internal no lo necesita
_url = settings.DATABASE_URL
_connect_args: dict = {}

if "railway.internal" not in _url and "localhost" not in _url and "127.0.0.1" not in _url:
    # Proxy público de Railway — deshabilitar verificación SSL estricta
    _connect_args = {"ssl": {"check_hostname": False, "verify_mode": 0}}

engine = create_engine(
    _url,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
