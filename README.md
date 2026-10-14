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
    core/        # configurações e segurança (hash de senha, JWT)
    database/    # engine, sessão, Base do SQLAlchemy e criação das tabelas
    models/      # models ORM (User, Asset)
    schemas/     # schemas Pydantic (entrada/saída da API)
    services/    # regras de negócio, independentes do HTTP
    routes/      # routers do FastAPI e dependências de autenticação
    seed.py      # dados de demonstração
    main.py      # criação da aplicação, CORS e registro das rotas
  tests/         # testes automatizados (pytest)
  requirements.txt
  requirements-dev.txt
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
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env             # ajuste JWT_SECRET_KEY
uvicorn app.main:app --reload
```

A API sobe em `http://localhost:8000` e a documentação interativa (Swagger) fica em `http://localhost:8000/docs`.

#### Dados de demonstração

Com o ambiente virtual ativo, dentro de `backend`:

```bash
python -m app.seed
```

O comando cria 5 ativos de exemplo e os usuários abaixo (pode ser executado mais de uma vez):

| Perfil | E-mail | Senha |
| --- | --- | --- |
| NIT | `nit@instituicao.edu.br` | `nit12345` |
| AUTOR | `fernanda.costa@instituicao.edu.br` | `autor12345` |
| AUTOR | `joao.silva@instituicao.edu.br` | `autor12345` |

No Swagger, clique em **Authorize**, informe o e-mail no campo `username` e a senha para testar as rotas protegidas.

#### Testes

```bash
pip install -r requirements-dev.txt
pytest
```

### Rotas da API

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | público | Login com JSON `{email, password}`; retorna JWT e perfil |
| `POST` | `/api/auth/token` | público | Mesmo login via formulário OAuth2 (usado pelo Swagger) |
| `GET` | `/api/auth/me` | autenticado | Dados do usuário logado |
| `GET` | `/api/assets/` | autenticado | NIT vê todos os ativos; AUTOR vê só os vinculados a ele |
| `POST` | `/api/assets/` | NIT | Cadastra um ativo, opcionalmente vinculando um autor pelo e-mail |

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Referências

O arquivo `prototipo aprimorado (1).html` é o protótipo navegável usado como referência de UI/UX e regras de negócio. O código do sistema não reaproveita o HTML/CSS dele.
