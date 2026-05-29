from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401 — registra todos los modelos en Base.metadata
from app.core.database import get_db
from app.core.security import get_password_hash
from app.main import app
from app.models.base import Base
from app.models.finca import Finca
from app.models.usuario import Usuario

engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def finca_test():
    db = TestingSessionLocal()
    finca = Finca(id=str(uuid4()), nombre="Finca Los Pinos")
    db.add(finca)
    db.commit()
    db.refresh(finca)
    db.close()
    return finca


@pytest.fixture(scope="session")
def propietario_creds(finca_test):
    db = TestingSessionLocal()
    usuario = Usuario(
        id=str(uuid4()),
        finca_id=finca_test.id,
        email="propietario@bovitech.test",
        nombre="Carlos Ganadero",
        password_hash=get_password_hash("Segura123!"),
        rol="propietario",
    )
    db.add(usuario)
    db.commit()
    db.close()
    return {
        "email": "propietario@bovitech.test",
        "password": "Segura123!",
        "finca_id": finca_test.id,
        "user_id": usuario.id,
    }


@pytest.fixture(scope="session")
def operario_creds(finca_test):
    db = TestingSessionLocal()
    usuario = Usuario(
        id=str(uuid4()),
        finca_id=finca_test.id,
        email="operario@bovitech.test",
        nombre="Mario Operario",
        password_hash=get_password_hash("Segura123!"),
        rol="operario",
    )
    db.add(usuario)
    db.commit()
    db.close()
    return {
        "email": "operario@bovitech.test",
        "password": "Segura123!",
        "finca_id": finca_test.id,
        "user_id": usuario.id,
    }


@pytest.fixture(scope="session")
def propietario_token(client, propietario_creds):
    resp = client.post("/api/v1/auth/login", json={
        "email": propietario_creds["email"],
        "password": propietario_creds["password"],
    })
    return resp.json()["access_token"]


@pytest.fixture(scope="session")
def operario_token(client, operario_creds):
    resp = client.post("/api/v1/auth/login", json={
        "email": operario_creds["email"],
        "password": operario_creds["password"],
    })
    return resp.json()["access_token"]
