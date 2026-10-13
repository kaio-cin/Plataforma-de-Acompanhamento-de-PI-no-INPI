# Plataforma de Acompanhamento de PI no INPI

MVP de um sistema para gestão e acompanhamento de **patentes** e **programas de computador** junto ao INPI, voltado aos Núcleos de Inovação Tecnológica (NITs). O objetivo é substituir a consulta manual às publicações da Revista da Propriedade Industrial (RPI) por coleta automática, cruzamento com os processos cadastrados e alertas de prazo.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic 2 |
| Banco | SQLite no MVP (pronto para migrar para PostgreSQL via `DATABASE_URL`) |
| Autenticação | JWT (`python-jose`) + hash bcrypt (`passlib`) |
| Frontend | React 19 + Vite, Tailwind CSS v4, React Router |

## Estrutura

```
backend/
  app/
    core/        # configurações (variáveis de ambiente)
    database/    # engine, sessão e Base do SQLAlchemy
    models/      # models ORM
    schemas/     # schemas Pydantic (entrada/saída da API)
    routes/      # routers do FastAPI
    main.py      # criação da aplicação, CORS e registro das rotas
  requirements.txt
frontend/
  src/
    api/         # cliente HTTP e chamadas à API
    components/  # componentes reutilizáveis de UI
    layouts/     # casca da aplicação (sidebar + cabeçalho)
    pages/       # telas (login, painel, cadastro)
    context/     # estado global (sessão do usuário)
    hooks/       # hooks customizados
```

## Como rodar

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # ajuste JWT_SECRET_KEY
uvicorn app.main:app --reload
```

A API sobe em `http://localhost:8000` e a documentação interativa (Swagger) fica em `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Referências

O arquivo `prototipo aprimorado (1).html` é o protótipo navegável usado como referência de UI/UX e regras de negócio. O código do sistema não reaproveita o HTML/CSS dele.
