from datetime import date

import pytest
from fastapi.testclient import TestClient


TODAY = date.today().isoformat()


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def animal_id(client, propietario_token):
    resp = client.post(
        "/api/v1/animales",
        json={"numero_arete": "SES-TEST-001", "nombre": "Lechera"},
        headers=auth(propietario_token),
    )
    return resp.json()["id"]


class TestCrearSesion:
    def test_crear_sesion_manana_201(self, client: TestClient, operario_token):
        resp = client.post(
            "/api/v1/sesiones",
            json={"fecha": TODAY, "turno": "manana"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["turno"] == "manana"
        assert data["fecha"] == TODAY

    def test_crear_sesion_duplicada_409(self, client: TestClient, operario_token):
        # La sesión de mañana ya fue creada en el test anterior
        resp = client.post(
            "/api/v1/sesiones",
            json={"fecha": TODAY, "turno": "manana"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 409
        assert "mañana" in resp.json()["detail"]

    def test_crear_sesion_tarde_independiente(self, client: TestClient, operario_token):
        resp = client.post(
            "/api/v1/sesiones",
            json={"fecha": TODAY, "turno": "tarde"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 201

    def test_turno_invalido_422(self, client: TestClient, operario_token):
        resp = client.post(
            "/api/v1/sesiones",
            json={"fecha": TODAY, "turno": "noche"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 422


class TestListarSesiones:
    def test_listar_con_filtro_fecha_turno(self, client: TestClient, operario_token):
        resp = client.get(
            "/api/v1/sesiones",
            params={"fecha": TODAY, "turno": "manana"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert all(s["turno"] == "manana" for s in data)


class TestRegistrosProduccion:
    @pytest.fixture(scope="class")
    def sesion_id(self, client, operario_token):
        resp = client.get(
            "/api/v1/sesiones",
            params={"fecha": TODAY, "turno": "manana"},
            headers=auth(operario_token),
        )
        return resp.json()[0]["id"]

    def test_registrar_produccion_201(self, client, operario_token, animal_id, sesion_id):
        resp = client.post(
            f"/api/v1/sesiones/{sesion_id}/registros",
            json=[{"animal_id": animal_id, "volumen_litros": 12.5}],
            headers=auth(operario_token),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert len(data) == 1
        assert float(data[0]["volumen_litros"]) == 12.5

    def test_registrar_animal_otra_finca_404(self, client, operario_token, sesion_id):
        resp = client.post(
            f"/api/v1/sesiones/{sesion_id}/registros",
            json=[{"animal_id": "00000000-0000-0000-0000-000000000000", "volumen_litros": 5.0}],
            headers=auth(operario_token),
        )
        assert resp.status_code == 404

    def test_registro_duplicado_409(self, client, operario_token, animal_id, sesion_id):
        resp = client.post(
            f"/api/v1/sesiones/{sesion_id}/registros",
            json=[{"animal_id": animal_id, "volumen_litros": 8.0}],
            headers=auth(operario_token),
        )
        assert resp.status_code == 409

    def test_lista_vacia_400(self, client, operario_token, sesion_id):
        resp = client.post(
            f"/api/v1/sesiones/{sesion_id}/registros",
            json=[],
            headers=auth(operario_token),
        )
        assert resp.status_code == 400

    def test_listar_registros_de_sesion(self, client, operario_token, sesion_id):
        resp = client.get(
            f"/api/v1/sesiones/{sesion_id}/registros",
            headers=auth(operario_token),
        )
        assert resp.status_code == 200
        assert len(resp.json()) >= 1


class TestTendenciaProduccion:
    def test_get_tendencia_30d(self, client, propietario_token, animal_id):
        resp = client.get(
            f"/api/v1/animales/{animal_id}/produccion",
            params={"periodo": "30d"},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        if data:
            assert "fecha" in data[0]
            assert "total_litros" in data[0]

    def test_animal_otra_finca_404(self, client, propietario_token):
        resp = client.get(
            "/api/v1/animales/00000000-0000-0000-0000-000000000000/produccion",
            headers=auth(propietario_token),
        )
        assert resp.status_code == 404
