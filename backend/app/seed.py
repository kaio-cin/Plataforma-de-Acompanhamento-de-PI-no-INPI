"""Popula o banco com usuários e ativos de demonstração.

Execute a partir da pasta backend:  python -m app.seed
Para recomeçar do zero (apaga tudo):  python -m app.seed --reset

Sem --reset é idempotente: registros que já existem (mesmo e-mail ou processo) são mantidos.
As senhas abaixo são apenas para desenvolvimento — nunca use este script em produção.
"""

import argparse
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.database.init_db import init_db
from app.models import Asset, AssetType, User, UserRole

DEMO_USERS = [
    {"email": "nit@instituicao.edu.br", "password": "nit12345", "role": UserRole.NIT},
    {"email": "fernanda.costa@instituicao.edu.br", "password": "autor12345", "role": UserRole.AUTOR},
    {"email": "joao.silva@instituicao.edu.br", "password": "autor12345", "role": UserRole.AUTOR},
]

DEMO_ASSETS = [
    {
        "title": "Sistema de irrigação automatizada por sensores",
        "asset_type": AssetType.PATENTE,
        "process_number": "BR 10 2023 001234-5",
        "deposit_date": date(2023, 3, 12),
        "status": "Em exame",
        "authors": "Fernanda Lima Costa, Rodrigo A. Nascimento",
        "author_email": "fernanda.costa@instituicao.edu.br",
    },
    {
        "title": "Software de gestão acadêmica — SIGA",
        "asset_type": AssetType.PROGRAMA_DE_COMPUTADOR,
        "process_number": "BR 51 2024 000871-2",
        "deposit_date": date(2024, 7, 4),
        "status": "Registrado",
        "authors": "João Pedro Silva",
        "author_email": "joao.silva@instituicao.edu.br",
    },
    {
        "title": "Processo de purificação de água por membranas",
        "asset_type": AssetType.PATENTE,
        "process_number": "BR 10 2022 009981-0",
        "deposit_date": date(2022, 9, 28),
        "status": "Exigência técnica",
        "authors": "Marina Alves, Carlos Henrique Rocha",
        "author_email": None,
    },
    {
        "title": "Aplicativo de monitoramento de safra — AgroTrack",
        "asset_type": AssetType.PROGRAMA_DE_COMPUTADOR,
        "process_number": "BR 51 2023 004512-7",
        "deposit_date": date(2023, 1, 15),
        "status": "Em análise",
        "authors": "Fernanda Lima Costa",
        "author_email": "fernanda.costa@instituicao.edu.br",
    },
    {
        "title": "Dispositivo de baixo custo para diagnóstico laboratorial",
        "asset_type": AssetType.PATENTE,
        "process_number": "BR 10 2021 015590-3",
        "deposit_date": date(2021, 11, 2),
        "status": "Deferida",
        "authors": "Ana Beatriz Moura, Paulo Sérgio Lima",
        "author_email": None,
    },
]


def seed(db: Session) -> None:
    users_by_email: dict[str, User] = {}
    for data in DEMO_USERS:
        user = db.scalar(select(User).where(User.email == data["email"]))
        if user is None:
            user = User(email=data["email"], hashed_password=hash_password(data["password"]), role=data["role"])
            db.add(user)
            print(f"  + usuário {data['email']} ({data['role'].value})")
        users_by_email[data["email"]] = user
    db.flush()

    for data in DEMO_ASSETS:
        if db.scalar(select(Asset.id).where(Asset.process_number == data["process_number"])) is not None:
            continue
        fields = {key: value for key, value in data.items() if key != "author_email"}
        db.add(Asset(**fields, author_user=users_by_email.get(data["author_email"] or "")))
        print(f"  + ativo {data['process_number']}")

    db.commit()


def reset_db() -> None:
    """Apaga todas as tabelas e as recria vazias."""
    import app.models  # noqa: F401  (registra as tabelas no metadata)

    Base.metadata.drop_all(bind=engine)
    init_db()


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Popula o banco com dados de demonstração.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="apaga TODOS os dados antes de popular (usado pelos testes ponta a ponta)",
    )
    args = parser.parse_args(argv)

    if args.reset:
        print("Apagando os dados existentes...")
        reset_db()
    else:
        init_db()
    print("Populando o banco com dados de demonstração...")
    with SessionLocal() as db:
        seed(db)
    print("Pronto. Logins de teste:")
    for data in DEMO_USERS:
        print(f"  {data['role'].value:<5}  {data['email']}  /  {data['password']}")


if __name__ == "__main__":
    main()
