"""Ponto de entrada da API. Execute com: uvicorn app.main:app --reload"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import init_db
from app.routes import assets, auth, health


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Garante que as tabelas existam antes de atender a primeira requisição.
    init_db()
    yield


def create_app(cors_origins: list[str] | None = None) -> FastAPI:
    """Monta a aplicação. `cors_origins` substitui a configuração (usado nos testes)."""
    app = FastAPI(
        title=settings.app_name,
        description="API para gestão e acompanhamento de patentes e programas de computador junto ao INPI.",
        version="0.1.0",
        lifespan=lifespan,
    )

    # O frontend roda em outra origem (Vite em :5173) e se autentica com o cabeçalho
    # Authorization (JWT), sem cookies — por isso allow_credentials fica desligado.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins if cors_origins is not None else settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        max_age=600,
    )

    app.include_router(health.router, prefix=settings.api_prefix)
    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(assets.router, prefix=settings.api_prefix)
    return app


app = create_app()
