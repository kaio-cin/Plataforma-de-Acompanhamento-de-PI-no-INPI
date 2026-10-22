# Radar INPI — Plataforma de Acompanhamento de PI no INPI

MVP de um sistema para gestão e acompanhamento de **patentes** e **programas de computador** junto ao INPI, voltado aos Núcleos de Inovação Tecnológica (NITs). O objetivo é substituir a consulta manual às publicações da Revista da Propriedade Industrial (RPI) por coleta automática, cruzamento com os processos cadastrados e alertas de prazo.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2, Pydantic 2 |
| Banco | SQLite no MVP (pronto para migrar para PostgreSQL via `DATABASE_URL`) |
| Autenticação | JWT (`python-jose`) + hash bcrypt (`passlib`) |
| Frontend | React 19 + Vite, Tailwind CSS v4, React Router |
| Design | Design system do Radar INPI: Manrope + IBM Plex Mono, tema claro e escuro |

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
    api/         # cliente HTTP (fetch + JWT) e chamadas à API
    components/  # componentes reutilizáveis (ui/ tem botões, campos, abas, chips…)
    layouts/     # casca da aplicação (barra lateral, barra superior, menu do usuário)
    pages/       # telas: login, carteira, meus ativos, cadastro
    context/     # sessão do usuário (AuthProvider)
    hooks/       # useAuth, useAssets, useTheme
    utils/       # formatação e regras de apresentação dos ativos
    config.js    # nome do produto e da instituição
    index.css    # design tokens (cores claro/escuro, tipografia, raios, sombras)
docs/
  prototipo-radar-inpi.html  # protótipo navegável de referência
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

A aplicação abre em `http://localhost:5173`. Com a API rodando e o seed executado, entre com uma das contas de demonstração (em modo de desenvolvimento, a tela de login tem atalhos que entram direto com elas).

| Tela | Rota | Perfil |
| --- | --- | --- |
| Login | `/login` | público |
| Carteira de ativos (indicadores, abas, filtros e tabela) | `/` | NIT |
| Meus ativos | `/` | AUTOR |
| Cadastro de ativo | `/ativos/novo` | NIT |

A busca da barra superior (atalho `/`) filtra a carteira por título, processo, inventor, natureza ou situação. O tema escuro fica no menu do usuário. Alertas, calendário, tarefas, relatórios e glossário aparecem no menu como "em breve": dependem da leitura da RPI e de etapas futuras.

Se a API estiver em outro endereço, copie `frontend/.env.example` para `frontend/.env.local` e ajuste `VITE_API_URL`.

## Referências

O arquivo `docs/prototipo-radar-inpi.html` é o protótipo navegável do Radar INPI, usado como referência de UI/UX, arquitetura de informação e regras de negócio (abra no navegador; ele carrega React e fontes de CDN). O código do sistema não reaproveita o HTML/CSS dele: os tokens e componentes foram reconstruídos em React + Tailwind.
