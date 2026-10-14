from fastapi.testclient import TestClient

from app.core.security import decode_access_token
from tests.conftest import PASSWORD, auth_header


def test_login_nit_retorna_token_com_perfil(client: TestClient, users) -> None:
    response = client.post("/api/auth/login", json={"email": "nit@teste.edu.br", "password": PASSWORD})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"] == {"id": users["nit"].id, "email": "nit@teste.edu.br", "role": "NIT"}
    assert decode_access_token(body["access_token"])["role"] == "NIT"


def test_login_autor_retorna_perfil_autor(client: TestClient, users) -> None:
    response = client.post("/api/auth/login", json={"email": "autora@teste.edu.br", "password": PASSWORD})

    assert response.status_code == 200
    assert response.json()["user"]["role"] == "AUTOR"


def test_login_ignora_maiusculas_no_email(client: TestClient, users) -> None:
    response = client.post("/api/auth/login", json={"email": "NIT@Teste.edu.br", "password": PASSWORD})

    assert response.status_code == 200


def test_login_com_senha_errada_retorna_401(client: TestClient, users) -> None:
    response = client.post("/api/auth/login", json={"email": "nit@teste.edu.br", "password": "errada"})

    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos."


def test_login_com_email_inexistente_retorna_mesma_mensagem(client: TestClient, users) -> None:
    response = client.post("/api/auth/login", json={"email": "ninguem@teste.edu.br", "password": PASSWORD})

    assert response.status_code == 401
    assert response.json()["detail"] == "E-mail ou senha incorretos."


def test_login_via_formulario_oauth2(client: TestClient, users) -> None:
    response = client.post("/api/auth/token", data={"username": "nit@teste.edu.br", "password": PASSWORD})

    assert response.status_code == 200
    assert response.json()["user"]["role"] == "NIT"


def test_me_retorna_usuario_logado(client: TestClient, users) -> None:
    response = client.get("/api/auth/me", headers=auth_header(client, "autora@teste.edu.br"))

    assert response.status_code == 200
    assert response.json()["email"] == "autora@teste.edu.br"


def test_me_sem_token_retorna_401(client: TestClient) -> None:
    assert client.get("/api/auth/me").status_code == 401


def test_me_com_token_invalido_retorna_401(client: TestClient) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer token-falso"})

    assert response.status_code == 401
