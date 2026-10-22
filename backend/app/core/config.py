"""Configurações da aplicação, lidas de variáveis de ambiente ou do arquivo .env."""

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Radar INPI — Acompanhamento de PI no INPI"
    api_prefix: str = "/api"

    # SQLite no MVP. Para PostgreSQL, basta trocar a URL:
    # postgresql+psycopg://usuario:senha@host:5432/pi_inpi
    database_url: str = "sqlite:///./pi_inpi.db"

    # JWT — em produção, defina JWT_SECRET_KEY no .env com um valor longo e aleatório.
    jwt_secret_key: str = "dev-secret-troque-em-producao"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8

    # Origens (frontends) autorizadas a chamar a API pelo navegador.
    # No .env: CORS_ORIGINS=http://localhost:5173,https://radar.instituicao.edu.br
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        # Aceita lista separada por vírgulas; remove espaços e barra final ("http://x/" == "http://x").
        if isinstance(value, str):
            value = value.split(",")
        if isinstance(value, list):
            return [str(origin).strip().rstrip("/") for origin in value if str(origin).strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
