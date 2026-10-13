"""Ponto de entrada da API. Execute com: uvicorn app.main:app --reload"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import init_db
from app.routes import health


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    # Garante que as tabelas existam antes de atender a primeira requisição.
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description="API para gestão e acompanhamento de patentes e programas de computador junto ao INPI.",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix=settings.api_prefix)
    return app


app = create_app()
