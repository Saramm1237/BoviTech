import pytest
from fastapi.testclient import TestClient


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


class TestCrearAnimal:
    def test_propietario_crea_animal_201(self, client: TestClient, propietario_token):
        resp = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-A001", "nombre": "Valentina", "raza": "Holstein"},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["numero_arete"] == "TEST-A001"
        assert data["activo"] is True
        assert "id" in data
        assert "finca_id" in data

    def test_operario_crea_animal_403(self, client: TestClient, operario_token):
        resp = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-OPTEST"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 403
        assert "propietario" in resp.json()["detail"]

    def test_arete_duplicado_409(self, client: TestClient, propietario_token):
        client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-DUP"},
            headers=auth(propietario_token),
        )
        resp = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-DUP"},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 409
        assert "arete" in resp.json()["detail"]

    def test_finca_id_no_viene_del_body(self, client: TestClient, propietario_token):
        resp = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-FINCA", "finca_id": "00000000-0000-0000-0000-000000000000"},
            headers=auth(propietario_token),
        )
        # Debe ignorar el finca_id del body
        assert resp.status_code == 201
        assert resp.json()["finca_id"] != "00000000-0000-0000-0000-000000000000"

    def test_sin_token_retorna_403(self, client: TestClient):
        resp = client.post("/api/v1/animales", json={"numero_arete": "X"})
        assert resp.status_code == 403


class TestListarAnimales:
    def test_lista_solo_animales_propios(self, client: TestClient, propietario_token):
        resp = client.get("/api/v1/animales", headers=auth(propietario_token))
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_lista_solo_activos_por_defecto(self, client: TestClient, propietario_token):
        resp = client.get("/api/v1/animales", headers=auth(propietario_token))
        assert all(a["activo"] for a in resp.json())

    def test_operario_puede_listar(self, client: TestClient, operario_token):
        resp = client.get("/api/v1/animales", headers=auth(operario_token))
        assert resp.status_code == 200

    def test_incluye_inactivos_con_flag(self, client: TestClient, propietario_token):
        resp = client.get(
            "/api/v1/animales",
            params={"solo_activos": False},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 200


class TestObtenerAnimal:
    def test_get_animal_existente(self, client: TestClient, propietario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-GET-001"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.get(f"/api/v1/animales/{animal_id}", headers=auth(propietario_token))
        assert resp.status_code == 200
        assert resp.json()["id"] == animal_id

    def test_animal_otra_finca_retorna_404(self, client: TestClient, propietario_token):
        resp = client.get(
            "/api/v1/animales/00000000-0000-0000-0000-000000000000",
            headers=auth(propietario_token),
        )
        assert resp.status_code == 404


class TestActualizarAnimal:
    def test_patch_actualiza_campos(self, client: TestClient, propietario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-PATCH-001", "nombre": "Antigua"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.patch(
            f"/api/v1/animales/{animal_id}",
            json={"nombre": "Nueva"},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 200
        assert resp.json()["nombre"] == "Nueva"
        assert resp.json()["numero_arete"] == "TEST-PATCH-001"  # no cambia

    def test_operario_no_puede_editar(self, client: TestClient, propietario_token, operario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-PATCH-PERM"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.patch(
            f"/api/v1/animales/{animal_id}",
            json={"nombre": "Intento"},
            headers=auth(operario_token),
        )
        assert resp.status_code == 403


class TestDarDeBaja:
    def test_delete_soft_delete_204(self, client: TestClient, propietario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-BAJA-001"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.delete(
            f"/api/v1/animales/{animal_id}",
            headers=auth(propietario_token),
        )
        assert resp.status_code == 204

        # Verificar que no aparece en lista de activos
        lista = client.get("/api/v1/animales", headers=auth(propietario_token))
        ids_activos = [a["id"] for a in lista.json()]
        assert animal_id not in ids_activos

    def test_delete_con_motivo(self, client: TestClient, propietario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-BAJA-002"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.delete(
            f"/api/v1/animales/{animal_id}",
            params={"baja_motivo": "venta"},
            headers=auth(propietario_token),
        )
        assert resp.status_code == 204

    def test_operario_no_puede_dar_baja(self, client: TestClient, propietario_token, operario_token):
        crear = client.post(
            "/api/v1/animales",
            json={"numero_arete": "TEST-BAJA-003"},
            headers=auth(propietario_token),
        )
        animal_id = crear.json()["id"]
        resp = client.delete(
            f"/api/v1/animales/{animal_id}",
            headers=auth(operario_token),
        )
        assert resp.status_code == 403
