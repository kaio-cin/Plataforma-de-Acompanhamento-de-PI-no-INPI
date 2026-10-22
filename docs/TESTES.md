# Testes do Radar INPI — MVP

Documento de registro dos testes do MVP (Etapas 1 a 5): o que é testado, com quais ferramentas, como executar e o que ainda não está coberto.

**Última execução completa:** 21/10/2026, commit `18887c0`.

## 1. Resumo

| Suíte | Ferramenta | Onde fica | Casos | Resultado | Tempo |
| --- | --- | --- | --- | --- | --- |
| Backend (API) | pytest + TestClient do FastAPI | `backend/tests/` | 33 | ✅ 33 passaram | ~25 s |
| Unitários do frontend | Vitest | `frontend/src/**/*.test.js` | 32 | ✅ 32 passaram | < 1 s |
| Ponta a ponta (E2E) | Playwright + Chromium | `frontend/e2e/` | 8 | ✅ 8 passaram | ~22 s |
| Análise estática | oxlint | `frontend/src/` | — | ✅ sem avisos | < 1 s |
| Build de produção | Vite | `frontend/` | — | ✅ concluído | < 1 s |

**Total: 73 testes automatizados, todos passando.** As suítes foram executadas no ambiente de desenvolvimento (Linux, Python 3.13, Node 22) e também no Windows, com Python 3.14.

## 2. Ferramentas utilizadas

| Ferramenta | Versão | Para que é usada |
| --- | --- | --- |
| [pytest](https://docs.pytest.org/) | 9.1.1 | Executor dos testes do backend: fixtures, descoberta de testes e relatório. |
| TestClient do FastAPI (Starlette) | FastAPI 0.143 | Faz requisições HTTP à API em memória, sem subir servidor. |
| [httpx2](https://pypi.org/project/httpx2/) | 2.13.1 | Cliente HTTP usado internamente pelo TestClient. |
| SQLite em memória (`sqlite://` + `StaticPool`) | SQLAlchemy 2.1.4 | Banco novo e isolado para cada teste do backend; nenhum teste toca o `pi_inpi.db`. |
| [Vitest](https://vitest.dev/) | 5.0.5 | Testes unitários do frontend, com a mesma configuração do Vite. |
| `vi.stubGlobal` / `vi.fn` (Vitest) | — | Simulam `fetch` e `localStorage` para testar o cliente HTTP sem rede nem navegador. |
| [Playwright](https://playwright.dev/) (`@playwright/test`) | 1.64.1 | Testes ponta a ponta: sobe API e frontend e controla um navegador real. |
| Chromium (via Playwright) | — | Navegador onde os testes E2E rodam (perfil “Desktop Chrome”, locale pt-BR, fuso America/Fortaleza). |
| [oxlint](https://oxc.rs/docs/guide/usage/linter) | 1.88 | Análise estática do código React (regras de hooks, componentes). |
| Vite | 8.3.4 | `npm run build` confirma que o frontend compila para produção. |
| Swagger UI (`/docs`) | — | Testes manuais exploratórios da API durante o desenvolvimento. |

Dependências de teste ficam separadas das de produção: `backend/requirements-dev.txt` (pytest, httpx2) e `devDependencies` do `frontend/package.json` (vitest, @playwright/test).

## 3. Estratégia

Os testes seguem três camadas, das mais rápidas e numerosas às mais completas:

1. **Unitários do frontend (Vitest):** funções puras e o cliente HTTP, isolados da interface. Rodam em menos de um segundo.
2. **API (pytest):** cada rota é chamada por HTTP contra um banco SQLite em memória recriado a cada teste. Cobrem regras de negócio, permissões por perfil, validações e CORS.
3. **Ponta a ponta (Playwright):** o sistema inteiro rodando de verdade — API, banco, frontend e navegador — percorrendo os fluxos como um usuário faria.

**Isolamento dos testes ponta a ponta.** O `frontend/playwright.config.js` sobe servidores próprios, sem interferir nos de desenvolvimento:

| | Desenvolvimento | Testes E2E |
| --- | --- | --- |
| API | `localhost:8000` | `localhost:8001` |
| Frontend | `localhost:5173` | `localhost:5174` |
| Banco | `backend/pi_inpi.db` | `backend/e2e.db`, recriado com `python -m app.seed --reset` a cada execução |
| CORS liberado para | `localhost:5173` | `localhost:5174` (via `CORS_ORIGINS`) |

Os servidores de teste são encerrados ao final da execução. O cenário de cadastro gera um número de processo único, então a suíte pode rodar várias vezes seguidas.

## 4. Testes do backend (`backend/tests/`)

### 4.1 Autenticação — `test_auth.py` (9 testes) · US01, US02

| Teste | O que verifica |
| --- | --- |
| `test_login_nit_retorna_token_com_perfil` | Login do NIT retorna JWT válido com o perfil `NIT` no token e os dados do usuário. |
| `test_login_autor_retorna_perfil_autor` | Login de autor retorna perfil `AUTOR`. |
| `test_login_ignora_maiusculas_no_email` | `NIT@Teste.edu.br` funciona igual a `nit@teste.edu.br`. |
| `test_login_com_senha_errada_retorna_401` | Senha errada → 401 com “E-mail ou senha incorretos.” |
| `test_login_com_email_inexistente_retorna_mesma_mensagem` | E-mail inexistente devolve a mesma mensagem da senha errada (não revela quais e-mails existem). |
| `test_login_via_formulario_oauth2` | A rota `/api/auth/token`, usada pelo botão Authorize do Swagger, também autentica. |
| `test_me_retorna_usuario_logado` | `/api/auth/me` identifica o dono do token. |
| `test_me_sem_token_retorna_401` | Sem token → 401. |
| `test_me_com_token_invalido_retorna_401` | Token forjado → 401. |

### 4.2 Ativos — `test_assets.py` (14 testes) · US03, US04, US06, US07

| Teste | O que verifica |
| --- | --- |
| `test_nit_lista_todos_os_ativos` | O NIT vê a carteira inteira. |
| `test_listagem_vem_ordenada_por_deposito_mais_recente` | A lista vem do depósito mais recente para o mais antigo. |
| `test_autor_lista_apenas_os_proprios_ativos` | O autor vê só os ativos vinculados a ele. |
| `test_listagem_sem_login_retorna_401` | A listagem exige login. |
| `test_nit_cadastra_ativo_e_numero_do_processo_e_normalizado` | Cadastro retorna 201 e padroniza `br 10  2025   000999-9` → `BR 10 2025 000999-9`. |
| `test_ativo_cadastrado_aparece_na_listagem` | O ativo novo aparece na listagem. |
| `test_cadastro_com_autor_vinculado_aparece_para_o_autor` | Ao vincular um autor pelo e-mail, o ativo passa a aparecer para ele. |
| `test_author_email_vazio_e_tratado_como_sem_autor` | Campo de autor em branco (como o formulário envia) é aceito como “sem autor”. |
| `test_autor_nao_pode_cadastrar_ativo` | Perfil AUTOR recebe 403 ao tentar cadastrar. |
| `test_processo_duplicado_retorna_409` | Número de processo já cadastrado → 409 com mensagem clara. |
| `test_autor_inexistente_retorna_422` | Vincular e-mail que não existe → 422. |
| `test_vincular_usuario_nit_como_autor_retorna_422` | Só usuários com perfil AUTOR podem ser vinculados. |
| `test_natureza_invalida_retorna_422` | Natureza fora de “Patente” / “Programa de Computador” → 422. |
| `test_data_de_deposito_no_futuro_retorna_422` | Data de depósito futura → 422. |

### 4.3 CORS e configuração — `test_cors.py` (6 testes) · Etapa 5

| Teste | O que verifica |
| --- | --- |
| `test_preflight_do_frontend_autorizado` | O navegador pode chamar a API a partir do frontend autorizado, com os cabeçalhos `Authorization` e `Content-Type`. |
| `test_preflight_de_origem_desconhecida_e_recusado` | Um site desconhecido é recusado (400, sem cabeçalho de permissão). |
| `test_resposta_comum_inclui_cabecalho_cors` | Respostas normais trazem o cabeçalho `Access-Control-Allow-Origin`. |
| `test_cors_nao_usa_cookies` | `allow_credentials` desligado: a autenticação é por JWT, não por cookie. |
| `test_cors_origins_aceita_lista_separada_por_virgula` | `CORS_ORIGINS` no `.env` aceita vários endereços, ignorando espaços e barra final. |
| `test_cors_origins_padrao_libera_o_vite` | Sem configuração, o padrão libera `http://localhost:5173`. |

### 4.4 Dados de demonstração — `test_seed.py` (4 testes)

| Teste | O que verifica |
| --- | --- |
| `test_seed_cria_usuarios_e_ativos` | O seed cria os 3 usuários e os 5 ativos de exemplo. |
| `test_seed_e_idempotente` | Rodar duas vezes não duplica nada. |
| `test_seed_preserva_ativos_cadastrados` | Ativos cadastrados pelo usuário não são apagados pelo seed. |
| `test_seed_vincula_autora_aos_ativos_dela` | A autora de exemplo fica vinculada aos 2 processos dela. |

## 5. Testes unitários do frontend (`frontend/src/`)

### 5.1 Cliente HTTP — `src/api/client.test.js` (7 testes)

| Teste | O que verifica |
| --- | --- |
| envia o token JWT salvo e o corpo em JSON | Cabeçalho `Authorization: Bearer …`, `Content-Type` e corpo corretos. |
| não envia token em rotas públicas | O login não carrega token antigo. |
| transforma o `detail` do FastAPI em mensagem (409) | Erros da API viram mensagens legíveis. |
| mapeia erros de validação do Pydantic (422) para cada campo | Cada erro vai para o campo certo do formulário (ex.: `deposit_date`). |
| avisa os ouvintes quando a sessão expira (401) | Token expirado encerra a sessão. |
| não trata senha errada no login como sessão expirada | O 401 do login não dispara o logout automático. |
| explica quando a API está fora do ar | Falha de rede vira “Não foi possível conectar ao servidor…”. |

### 5.2 Regras dos ativos — `src/utils/assets.test.js` (17 testes)

| Grupo | O que verifica |
| --- | --- |
| `statusTone` (10) | Cor de cada situação: Exigência técnica → laranja; Indeferido → vermelho; Deferida, Concedido e Registrado → verde; Depositado e Em sigilo → neutro; Em exame e Publicado → azul. Inclui o caso “Indeferido” não ser confundido com “Deferido”. |
| `summarizeAssets` (3) | Contagens dos cards do painel (total, patentes, programas, exigem ação, concluídos), inclusive com carteira vazia. |
| Busca na carteira (4) | Ignora acentos e maiúsculas; encontra por processo, inventor, natureza ou situação; exige todos os termos; busca vazia mostra tudo. |

### 5.3 Formatação — `src/utils/format.test.js` (8 testes)

| Grupo | O que verifica |
| --- | --- |
| `formatDate` (3) | `2023-03-12` → `12 mar 2023`; **não volta um dia por causa do fuso horário** (erro clássico de `new Date("AAAA-MM-DD")` no Brasil); travessão quando não há data. |
| `todayIso` (1) | “Hoje” usa a data local, não a de UTC (testado às 23h30 com relógio simulado). |
| Nomes a partir do e-mail (4) | `fernanda.costa@…` → “Fernanda Costa”, iniciais “FC”, saudação “Olá, Fernanda”; e-mail sem separador é mostrado como está. |

## 6. Testes ponta a ponta (`frontend/e2e/fluxo-principal.spec.js`)

Cobrem o requisito da Etapa 5: **o usuário faz login → é redirecionado ao painel → vê os ativos do banco → cadastra um novo ativo.**

| # | Grupo | Cenário | Passos e verificações |
| --- | --- | --- | --- |
| 1 | Autenticação | sem sessão, qualquer página leva ao login | Abrir `/ativos/novo` sem login redireciona para `/login`. |
| 2 | Autenticação | senha errada mostra mensagem de erro | Mensagem “E-mail ou senha incorretos.” e permanece no login. |
| 3 | Autenticação | a sessão sobrevive ao recarregar e termina ao sair | F5 mantém o usuário logado; “Sair” no menu encerra, e `/` volta a pedir login. |
| 4 | Painel do NIT | mostra indicadores e os ativos vindos da API | 5 linhas na tabela; cards com 5 / 3 / 2 / 1; dados vindos do banco. |
| 5 | Painel do NIT | busca, abas e filtros reduzem a lista | Busca “irrigacao” (sem acento) → 1; aba “Exigem ação” → 1; desmarcar “Patente” → 2. |
| 6 | Cadastro | valida campos obrigatórios e recusa processo duplicado | Salvar vazio destaca 4 campos; número já existente mostra o erro 409 no campo. |
| 7 | Cadastro | ativo cadastrado aparece no painel e para a autora vinculada | Cadastro completo → volta ao painel com aviso de sucesso, 6 linhas e o ativo no topo com o número normalizado; depois, logada como a autora, ela vê o novo processo. |
| 8 | Visão do inventor | vê só os próprios processos e não acessa o cadastro | “Olá, Fernanda”, apenas os processos dela, sem botão de cadastro; `/ativos/novo` redireciona para `/`. |

Em caso de falha, o Playwright guarda captura de tela e *trace* em `frontend/test-results/` (fora do git).

## 7. Verificações manuais durante o desenvolvimento

Além das suítes automatizadas, cada etapa foi verificada no navegador real (Chromium controlado por scripts Playwright), com capturas de tela analisadas a cada rodada:

| Etapa | O que foi verificado |
| --- | --- |
| 1 — Setup | `/api/health` responde, Swagger em `/docs`, preflight CORS para o Vite, build do frontend. |
| 2 — Modelagem | Criação das tabelas; restrições no banco (e-mail e processo únicos, perfil e natureza válidos, chave estrangeira, `ON DELETE SET NULL`). |
| 3 — API | Seed, login dos dois perfis, listagem filtrada por perfil e cadastro via `curl` com a API rodando. |
| 4 — Frontend | Fluxo completo nas telas; mensagens de erro 409 e 422; tela em 1280 px e em celular (390 px), sem rolagem lateral. |
| Redesign Radar INPI | Login, carteira, cadastro, “Meus ativos”, menu do usuário, **tema claro e escuro**, gaveta do menu no celular. |

**Problemas encontrados e corrigidos com essas verificações:**

- Data de depósito podia aparecer um dia antes (fuso UTC) → formatação sem `new Date` + teste dedicado.
- Tabela espremida no celular → lista em cartões abaixo de 768 px.
- Etiqueta “em breve” cortava “Glossário de despachos” na barra lateral → itens movidos para uma seção “Em breve”.
- Coluna da barra lateral não chegava ao fim de páginas longas → fundo aplicado à coluna inteira.
- Avisos do oxlint sobre `setState` dentro de efeitos → lógica movida para os eventos que causam a mudança.
- `npm install` parado após instalar (consulta de auditoria) → documentado o uso de `--no-audit --no-fund`.

## 8. Rastreabilidade: histórias de usuário × testes

| História | Backend | Frontend (unit.) | E2E |
| --- | --- | --- | --- |
| US01/US02 — Login com perfil | `test_auth.py` (9) | `client.test.js` (token, 401) | cenários 1, 2, 3 |
| US03 — Autor vê só os próprios ativos | `test_autor_lista_apenas_os_proprios_ativos`, `test_autor_nao_pode_cadastrar_ativo` | — | cenários 7, 8 |
| US04 — Cadastro de ativo | 9 testes de cadastro em `test_assets.py` | `client.test.js` (409, 422) | cenários 6, 7 |
| US06 — Carteira com indicadores | `test_nit_lista_todos_os_ativos`, ordenação | `assets.test.js` | cenários 4, 5 |
| US07 — Vínculo de autor | vínculo, autor inexistente, autor NIT, e-mail vazio | — | cenário 7 |
| Etapa 5 — Integração e CORS | `test_cors.py` (6) | `client.test.js` (API fora do ar) | todos (API ↔ frontend reais) |

## 9. Como executar

**Backend** — em `backend`, com o ambiente virtual ativo:

```powershell
pip install -r requirements-dev.txt
pytest
```

**Unitários do frontend** — em `frontend`:

```powershell
npm install --no-audit --no-fund
npm test
```

**Ponta a ponta** — em `frontend` (requer as dependências do backend instaladas em `backend\.venv`):

```powershell
npx playwright install chromium   # só na primeira vez
npm run test:e2e                  # ou npm run test:e2e:ui para acompanhar visualmente
```

**Análise estática e build:**

```powershell
npm run lint
npm run build
```

## 10. Limitações e próximos passos

- **Integração contínua:** os testes ainda são rodados manualmente. Próximo passo: um workflow do GitHub Actions rodando as três suítes a cada push.
- **Navegadores:** o E2E roda só no Chromium. Firefox e WebKit podem ser ativados no `playwright.config.js`.
- **Componentes React:** a interface é coberta pelo E2E, mas não há testes isolados de componentes (ex.: React Testing Library).
- **Banco:** os testes usam SQLite; a migração para PostgreSQL deve vir acompanhada de uma rodada da suíte do backend contra ele.
- **Acessibilidade e desempenho:** não há verificação automatizada (ex.: axe-core, Lighthouse).
- **Leitura da RPI (Step 3):** quando o parser dos XMLs do INPI for implementado, ele deve ter testes com arquivos XML reais de exemplo, cobrindo cada código de despacho e o cálculo de prazos.
