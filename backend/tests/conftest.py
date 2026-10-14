"""Fixtures dos testes: banco SQLite em memória isolado por teste e cliente HTTP."""

from collections.abc import Iterator
from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (registra as tabelas no metadata)
from app.core.security import hash_password
from app.database import Base, get_db
from app.main import create_app
from app.models import Asset, AssetType, User, UserRole

PASSWORD = "senha-teste-123"


@pytest.fixture
def db_session() -> Iterator[Session]:
    # StaticPool mantém uma única conexão, para o banco em memória sobreviver entre sessões.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    event.listen(engine, "connect", lambda conn, _rec: conn.execute("PRAGMA foreign_keys=ON"))
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with TestingSession() as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(db_session: Session) -> Iterator[TestClient]:
    application = create_app()
    application.dependency_overrides[get_db] = lambda: db_session
    # Sem o "with", o lifespan (que criaria o banco real) não é executado.
    yield TestClient(application)


@pytest.fixture
def users(db_session: Session) -> dict[str, User]:
    created = {
        "nit": User(email="nit@teste.edu.br", hashed_password=hash_password(PASSWORD), role=UserRole.NIT),
        "autora": User(email="autora@teste.edu.br", hashed_password=hash_password(PASSWORD), role=UserRole.AUTOR),
        "outro_autor": User(email="outro@teste.edu.br", hashed_password=hash_password(PASSWORD), role=UserRole.AUTOR),
    }
    db_session.add_all(created.values())
    db_session.commit()
    return created


@pytest.fixture
def assets(db_session: Session, users: dict[str, User]) -> list[Asset]:
    created = [
        Asset(
            title="Patente da autora",
            asset_type=AssetType.PATENTE,
            process_number="BR 10 2023 000001-1",
            deposit_date=date(2023, 1, 10),
            status="Em exame",
            authors="Autora Teste",
            author_user=users["autora"],
        ),
        Asset(
            title="Software de outro autor",
            asset_type=AssetType.PROGRAMA_DE_COMPUTADOR,
            process_number="BR 51 2024 000002-2",
            deposit_date=date(2024, 5, 20),
            status="Registrado",
            authors="Outro Autor",
            author_user=users["outro_autor"],
        ),
        Asset(
            title="Patente sem autor vinculado",
            asset_type=AssetType.PATENTE,
            process_number="BR 10 2022 000003-3",
            deposit_date=date(2022, 8, 1),
            status="Deferida",
            authors="Equipe",
        ),
    ]
    db_session.add_all(created)
    db_session.commit()
    return created


def auth_header(client: TestClient, email: str, password: str = PASSWORD) -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}
