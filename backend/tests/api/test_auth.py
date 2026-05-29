import pytest
from fastapi.testclient import TestClient


class TestLogin:
    def test_login_exitoso_propietario(self, client: TestClient, propietario_creds):
        resp = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["rol"] == "propietario"
        assert data["user"]["finca_id"] == propietario_creds["finca_id"]

    def test_login_password_incorrecto(self, client: TestClient, propietario_creds):
        resp = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": "wrongpassword",
        })
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Credenciales incorrectas"

    def test_login_email_inexistente_no_revela_existencia(self, client: TestClient):
        resp = client.post("/api/v1/auth/login", json={
            "email": "noexiste@finca.com",
            "password": "cualquiera",
        })
        assert resp.status_code == 401
        assert resp.json()["detail"] == "Credenciales incorrectas"

    def test_login_operario_exitoso(self, client: TestClient, operario_creds):
        resp = client.post("/api/v1/auth/login", json={
            "email": operario_creds["email"],
            "password": operario_creds["password"],
        })
        assert resp.status_code == 200
        assert resp.json()["user"]["rol"] == "operario"


class TestRefresh:
    def test_refresh_retorna_nuevos_tokens(self, client: TestClient, propietario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        refresh_token = login.json()["refresh_token"]

        resp = client.post(
            "/api/v1/auth/refresh",
            headers={"Authorization": f"Bearer {refresh_token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_access_token_rechazado_en_refresh(self, client: TestClient, propietario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        access_token = login.json()["access_token"]

        # El access token no debe funcionar en /refresh (tipo incorrecto)
        resp = client.post(
            "/api/v1/auth/refresh",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert resp.status_code == 401

    def test_token_invalido_retorna_401(self, client: TestClient):
        resp = client.post(
            "/api/v1/auth/refresh",
            headers={"Authorization": "Bearer token.invalido.aqui"},
        )
        assert resp.status_code == 401


class TestChangePassword:
    def test_cambiar_password_exitoso(self, client: TestClient, propietario_creds):
        # Login inicial
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        token = login.json()["access_token"]

        # Cambiar contraseña
        resp = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": propietario_creds["password"], "new_password": "NuevaClave456!"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

        # Verificar que la nueva contraseña funciona
        new_login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": "NuevaClave456!",
        })
        assert new_login.status_code == 200

        # Restaurar contraseña original para no romper otros tests
        new_token = new_login.json()["access_token"]
        client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "NuevaClave456!", "new_password": propietario_creds["password"]},
            headers={"Authorization": f"Bearer {new_token}"},
        )

    def test_cambiar_password_actual_incorrecta(self, client: TestClient, propietario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        token = login.json()["access_token"]

        resp = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "incorrecta", "new_password": "NuevaClave456!"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 400

    def test_sin_token_retorna_403(self, client: TestClient):
        resp = client.post(
            "/api/v1/auth/change-password",
            json={"current_password": "algo", "new_password": "otracosa123"},
        )
        assert resp.status_code == 403


class TestMe:
    def test_get_me_propietario(self, client: TestClient, propietario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        token = login.json()["access_token"]

        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == propietario_creds["email"]
        assert data["rol"] == "propietario"

    def test_get_me_operario(self, client: TestClient, operario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": operario_creds["email"],
            "password": operario_creds["password"],
        })
        token = login.json()["access_token"]

        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["rol"] == "operario"

    def test_token_de_refresco_rechazado_en_me(self, client: TestClient, propietario_creds):
        login = client.post("/api/v1/auth/login", json={
            "email": propietario_creds["email"],
            "password": propietario_creds["password"],
        })
        refresh_token = login.json()["refresh_token"]

        resp = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {refresh_token}"},
        )
        assert resp.status_code == 401
