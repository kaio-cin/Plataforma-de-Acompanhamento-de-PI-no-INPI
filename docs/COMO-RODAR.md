# Como rodar o Radar INPI no VS Code (do zero)

Guia para quem nunca instalou nada: dos programas necessários até o sistema aberto no navegador. As instruções são para **Windows**; quem usa macOS ou Linux encontra as diferenças na seção 9.

📄 **Versão para imprimir ou compartilhar:** [`COMO-RODAR.pdf`](COMO-RODAR.pdf).

**Tempo estimado:** 20 a 30 minutos na primeira vez. Depois disso, rodar o sistema leva menos de um minuto.

---

## 1. Instalar os programas

Instale nesta ordem, com as opções padrão, exceto onde estiver indicado.

| Programa | Para quê | Onde baixar |
| --- | --- | --- |
| **Git** | Baixar o projeto do GitHub | https://git-scm.com/download/win |
| **Python 3.11 ou mais recente** (recomendado 3.13 ou 3.14) | Rodar a API (backend) | https://www.python.org/downloads/ |
| **Node.js LTS** (22 ou mais recente) | Rodar o site (frontend) | https://nodejs.org/ (botão "LTS") |
| **Visual Studio Code** | Editor onde tudo acontece | https://code.visualstudio.com/ |

> ⚠️ **No instalador do Python**, na primeira tela, marque **"Add python.exe to PATH"** e deixe marcada a opção do **"py launcher"** antes de clicar em *Install Now*. Sem isso, os comandos abaixo não funcionam.

### Conferir a instalação

Abra o **PowerShell** (menu Iniciar → "PowerShell") e rode, um por vez:

```powershell
git --version
py --version
node --version
npm --version
```

Cada comando deve responder com um número de versão. O `py --version` precisa mostrar **3.11 ou mais**, e o `node --version`, **v22 ou mais**. Se algum disser "não é reconhecido", reinstale esse programa e **feche e abra o PowerShell de novo**.

---

## 2. Baixar o projeto e abrir no VS Code

1. Abra o VS Code.
2. Aperte **Ctrl+Shift+P**, digite **`Git: Clone`** e pressione Enter.
3. Cole o endereço do repositório no GitHub (botão verde **Code** → aba HTTPS → copiar). Por exemplo:
   `https://github.com/kaio-cin/Plataforma-de-Acompanhamento-de-PI-no-INPI.git`
4. Escolha uma pasta no computador (por exemplo, `Documentos`) e, quando perguntado, clique em **Abrir**.
5. Se aparecer *"Você confia nos autores dos arquivos desta pasta?"*, clique em **Sim, confio**.

> Recebeu o projeto em um `.zip`? Extraia o zip e use **Arquivo → Abrir Pasta…** na pasta extraída (a que contém `backend`, `frontend` e `README.md`).

### Extensões recomendadas

Ao abrir o projeto, o VS Code mostra no canto inferior direito: *"Este workspace tem recomendações de extensões"*. Clique em **Instalar**. São elas:

| Extensão | Para quê |
| --- | --- |
| Python (Microsoft) | Entender o código do backend e escolher o ambiente Python |
| Tailwind CSS IntelliSense | Sugestões de classes de estilo no frontend |
| Oxc | Apontar erros no código JavaScript |
| Vitest | Rodar os testes do frontend pela barra lateral |
| Playwright Test for VS Code | Rodar os testes ponta a ponta pela barra lateral |

As extensões ajudam, mas não são obrigatórias para rodar o sistema.

---

## 3. Preparar o projeto (só na primeira vez)

Escolha **uma** das opções.

### Opção A — Pelas tarefas do VS Code (mais fácil)

1. Aperte **Ctrl+Shift+P** → digite **`Tasks: Run Task`** → Enter.
2. Escolha **`1. Instalar dependências (primeira vez)`**.

O VS Code abre um terminal e faz, em sequência: cria o ambiente Python (`backend/.venv`), instala os pacotes do backend, instala os pacotes do site e cria os dados de demonstração. Espere aparecer a lista **"Logins de teste"** no final. Se algum passo falhar, a sequência para e mostra o erro (veja a seção 8).

### Opção B — Pelo terminal

Abra o terminal do VS Code com **Ctrl+'** (ou menu **Terminal → Novo Terminal**). Ele abre na pasta do projeto.

**Libere a execução de scripts do PowerShell** (uma única vez no computador; confirme com `S`):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Backend:**

```powershell
cd backend
py -3 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed
cd ..
```

Depois do `Activate.ps1`, a linha do terminal passa a começar com **`(.venv)`**. Se não começar, não continue: veja a seção 8.

**Frontend:**

```powershell
cd frontend
npm install --no-audit --no-fund
cd ..
```

O `npm install` leva cerca de 1 minuto. A opção `--no-audit` evita que ele fique parado no final, consultando a internet.

**Configuração (opcional):** o sistema funciona sem configurar nada. Para mudar a chave de segurança ou o banco, copie `backend\.env.example` para `backend\.env` e edite.

---

## 4. Rodar o sistema (toda vez)

São **dois servidores** que precisam ficar rodando ao mesmo tempo: a **API** (porta 8000) e o **site** (porta 5173).

### Opção A — Atalho do VS Code

Aperte **Ctrl+Shift+B**. Ou: **Ctrl+Shift+P** → `Tasks: Run Task` → **`2. Rodar sistema (API + site)`**.

Abrem dois terminais lado a lado, um para cada servidor.

### Opção B — Dois terminais

**Terminal 1, a API:**

```powershell
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Pronto quando aparecer `Application startup complete.`

**Terminal 2, o site:** clique no **+** do painel de terminais para abrir outro e rode:

```powershell
cd frontend
npm run dev
```

Pronto quando aparecer `Local: http://localhost:5173/`.

### Parar

Clique em cada terminal e aperte **Ctrl+C** (ou clique no ícone de lixeira do terminal).

---

## 5. Usar o sistema

Abra **http://localhost:5173** no **Chrome ou Edge**. Evite o navegador embutido do VS Code, que às vezes mostra a página em branco.

| Endereço | O que é |
| --- | --- |
| http://localhost:5173 | **O sistema** (tela de login do Radar INPI) |
| http://localhost:8000/docs | Documentação interativa da API (Swagger) |
| http://localhost:8000 | A API em si; mostra `{"detail":"Not Found"}`, e isso é normal |

### Contas de teste

Na tela de login, os botões **Entrar como NIT** e **Entrar como inventora** entram direto. As credenciais são:

| Perfil | E-mail | Senha | O que vê |
| --- | --- | --- | --- |
| Equipe do NIT | `nit@instituicao.edu.br` | `nit12345` | Carteira completa, indicadores e cadastro de ativos |
| Inventora | `fernanda.costa@instituicao.edu.br` | `autor12345` | Só os próprios processos ("Meus ativos") |
| Inventor | `joao.silva@instituicao.edu.br` | `autor12345` | Só os próprios processos |

### Um roteiro rápido para conhecer

1. Entre como **NIT**: a carteira mostra 5 ativos e os cards 5 / 3 / 2 / 1.
2. Aperte **`/`** e digite `irrigacao` para ver a busca funcionando.
3. Clique em **Novo ativo**, cadastre um processo e vincule `fernanda.costa@instituicao.edu.br` como autor.
4. Clique no seu nome (canto superior direito) → **Sair** → **Entrar como inventora**: o processo novo aparece para ela.
5. No menu do usuário, experimente o **Tema escuro**.

**Para voltar aos dados originais:** pare a API e rode a tarefa **`Banco: recomeçar do zero (apaga tudo)`**, ou, no terminal do backend com o `.venv` ativo, `python -m app.seed --reset`.

---

## 6. Rodar os testes (opcional)

| Teste | Tarefa do VS Code | No terminal |
| --- | --- | --- |
| Backend | `Testes: backend` | Em `backend`, com o `.venv` ativo: `pip install -r requirements-dev.txt` e depois `pytest` |
| Frontend | `Testes: frontend (unitários)` | Em `frontend`: `npm test` |
| Ponta a ponta | `Testes: ponta a ponta` | Em `frontend`: `npx playwright install chromium` (só na primeira vez) e depois `npm run test:e2e` |

A opção A da seção 3 já instala as dependências de teste do backend. Detalhes sobre cada teste estão em [`TESTES.md`](TESTES.md).

---

## 7. Atualizar o projeto depois

Quando houver mudanças no GitHub:

```powershell
git pull
```

Depois, rode de novo a tarefa **`1. Instalar dependências (primeira vez)`** (ou `pip install -r requirements.txt` no backend e `npm install --no-audit --no-fund` no frontend), para pegar pacotes novos, se houver.

---

## 8. Problemas comuns

| O que aparece | Causa | Solução |
| --- | --- | --- |
| `Could not find platform independent libraries` ou `No module named 'encodings'` | O comando `python` está abrindo **outro** Python do computador (ex.: o que vem com GTKWave/Icarus Verilog), porque o `.venv` não está ativo. | Ative o `.venv` (a linha deve começar com `(.venv)`) ou use as tarefas do VS Code. Para resolver de vez: em *Editar as variáveis de ambiente do sistema* → **Path**, mova a pasta do outro programa para baixo das do Python. |
| `a execução de scripts foi desabilitada neste sistema` | Política padrão do PowerShell. | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, uma vez. |
| `Não foi possível carregar o módulo '.venv'` | O `.venv` não existe na pasta atual (foi criado em outra pasta ou apagado). | Entre em `backend` e crie: `py -3 -m venv .venv`, ative e rode `pip install -r requirements.txt`. |
| `py` não é reconhecido | Python instalado sem o *py launcher*. | Reinstale o Python marcando "py launcher" e "Add python.exe to PATH". |
| `npm install` parado por vários minutos | Consulta de auditoria pela internet travada. | `Ctrl+C` e rode `npm install --no-audit --no-fund`. |
| `SyntaxError` com `<<<<<<< HEAD` | Marcas de conflito de *merge* do Git dentro de um arquivo. | Rode `git grep -n "<<<<<<<"` para achar os arquivos e substitua-os pela versão correta. |
| Página "não encontrada" em `localhost:8000` | Esse endereço é a API, que não tem página inicial. | Abra **`localhost:5173`**. |
| Erro 404 em `localhost:5173` | Falta `frontend\index.html` ou outro programa está na porta 5173. | Confira com `Test-Path frontend\index.html` e `netstat -ano \| findstr :5173`. |
| Página em branco | Navegador embutido do VS Code ou erro no site. | Abra no Chrome/Edge; se continuar, **F12 → Console** mostra o erro. |
| "Não foi possível conectar ao servidor" no login | A API não está rodando. | Suba a API (seção 4) e confira `localhost:8000/docs`. |
| "E-mail ou senha incorretos" com as contas de teste | Os dados de demonstração não foram criados. | Rode a tarefa `Banco: dados de demonstração` ou `python -m app.seed`. |
| Erro de tabela/coluna depois de atualizar o projeto | Banco criado por uma versão antiga. | Rode `python -m app.seed --reset` (apaga os dados). |
| Avisos `LF will be replaced by CRLF` no `git add` | Diferença de fim de linha entre Windows e Linux. | É só um aviso; o arquivo `.gitattributes` do projeto evita isso. |
| `Port 5173 is in use` | Outro `npm run dev` ainda rodando. | Feche o terminal antigo ou use o endereço que o Vite mostrar; se a porta mudar, inclua-a em `CORS_ORIGINS` no `backend\.env`. |

---

## 9. macOS e Linux

As diferenças estão só nos comandos do Python:

| Windows | macOS / Linux |
| --- | --- |
| `py -3 -m venv .venv` | `python3 -m venv .venv` |
| `.venv\Scripts\Activate.ps1` | `source .venv/bin/activate` |
| `copy .env.example .env` | `cp .env.example .env` |

Não é preciso o `Set-ExecutionPolicy`. As tarefas do VS Code já usam os comandos certos para cada sistema.
