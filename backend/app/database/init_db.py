"""Criação das tabelas do banco.

No MVP as tabelas são criadas a partir dos models (create_all). Ao migrar para
PostgreSQL ou começar a alterar o esquema com dados reais, o passo natural é
adotar o Alembic para versionar as migrações.
"""

from app.database.session import Base, engine


def init_db() -> None:
    # Importar os models registra as tabelas no metadata antes do create_all.
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
