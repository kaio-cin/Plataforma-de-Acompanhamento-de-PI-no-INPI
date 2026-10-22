from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Asset, AssetType, User
from app.seed import DEMO_ASSETS, DEMO_USERS, seed


def test_seed_cria_usuarios_e_ativos(db_session: Session) -> None:
    seed(db_session)

    assert db_session.scalar(select(func.count(User.id))) == len(DEMO_USERS)
    assert db_session.scalar(select(func.count(Asset.id))) == len(DEMO_ASSETS)


def test_seed_e_idempotente(db_session: Session) -> None:
    seed(db_session)
    seed(db_session)

    assert db_session.scalar(select(func.count(User.id))) == len(DEMO_USERS)
    assert db_session.scalar(select(func.count(Asset.id))) == len(DEMO_ASSETS)


def test_seed_preserva_ativos_cadastrados(db_session: Session) -> None:
    seed(db_session)
    db_session.add(
        Asset(
            title="Ativo cadastrado pelo usuário",
            asset_type=AssetType.PATENTE,
            process_number="BR 10 2025 000001-0",
            deposit_date=date(2025, 1, 2),
            status="Depositado",
            authors="Fulano",
        )
    )
    db_session.commit()

    seed(db_session)

    assert db_session.scalar(select(func.count(Asset.id))) == len(DEMO_ASSETS) + 1


def test_seed_vincula_autora_aos_ativos_dela(db_session: Session) -> None:
    seed(db_session)

    autora = db_session.scalar(select(User).where(User.email == "fernanda.costa@instituicao.edu.br"))
    assert {asset.process_number for asset in autora.assets} == {"BR 10 2023 001234-5", "BR 51 2023 004512-7"}
