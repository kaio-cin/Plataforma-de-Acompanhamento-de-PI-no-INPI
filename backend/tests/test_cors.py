"""CORS: o navegador só deixa o frontend chamar a API se a origem estiver autorizada."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app

FRONTEND = "http://localhost:5173"


@pytest.fixture
def cors_client() -> TestClient:
    return TestClient(create_app(cors_origins=[FRONTEND]))


def preflight(client: TestClient, origin: str, headers: str = "authorization,content-type"):
    return client.options(
        "/api/assets/",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": headers,
        },
    )


def test_preflight_do_frontend_autorizado(cors_client: TestClient) -> None:
    response = preflight(cors_client, FRONTEND)

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == FRONTEND
    allowed = response.headers["access-control-allow-headers"].lower()
    assert "authorization" in allowed and "content-type" in allowed


def test_preflight_de_origem_desconhecida_e_recusado(cors_client: TestClient) -> None:
    response = preflight(cors_client, "https://site-malicioso.example")

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_resposta_comum_inclui_cabecalho_cors(cors_client: TestClient) -> None:
    response = cors_client.get("/api/health", headers={"Origin": FRONTEND})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == FRONTEND


def test_cors_nao_usa_cookies(cors_client: TestClient) -> None:
    # A autenticação é por JWT no cabeçalho Authorization, não por cookie.
    response = preflight(cors_client, FRONTEND)

    assert "access-control-allow-credentials" not in response.headers


def test_cors_origins_aceita_lista_separada_por_virgula(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", " http://localhost:5174/ , https://radar.instituicao.edu.br ")

    assert Settings(_env_file=None).cors_origins == ["http://localhost:5174", "https://radar.instituicao.edu.br"]


def test_cors_origins_padrao_libera_o_vite(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    assert FRONTEND in Settings(_env_file=None).cors_origins
