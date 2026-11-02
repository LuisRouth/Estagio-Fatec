# MANUAL DE INFRAESTRUTURA DEVOPS, NUVEM (VERCEL + SUPABASE), IA GEMINI & QA
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Prof. Orlando)  
**Engenheiro Responsável:** Guilherme (DevOps, Inteligência Artificial & Quality Assurance)  
**Data:** 02/11/2026 — Sprint 1  

---

## 1. ARQUITETURA DE HOSPEDAGEM E AMBIENTES EM NUVEM

A infraestrutura do **Portal Integrado da FATEC Rio Claro** foi desenhada sob o paradigma *Cloud-Native Serverless*, garantindo custo zero de manutenção para o Centro Acadêmico, escalabilidade elástica nos horários de pico (intervalos das turmas de IA Matutino e Gestão ESG Noturno) e alta disponibilidade:

```mermaid
flowchart LR
    subgraph Cliente["Dispositivos dos Alunos (Web / PWA)"]
        Browser["Navegador Desktop / Mobile PWA"]
    end

    subgraph GitHub["GitHub (Versionamento & CI/CD)"]
        Repo["Repositório Estagio-Fatec"]
        Actions["GitHub Actions (Vitest + Playwright + Gemini Check)"]
    end

    subgraph Vercel["Vercel Cloud (Região gru1 - São Paulo)"]
        Edge["Next.js Middleware (RBAC + OWASP Headers)"]
        API["Route Handlers (/api/auth, /api/ai, /api/health)"]
        SSR["App Router UI (Zero CLS / Eco-Tech)"]
    end

    subgraph Supabase["Supabase Cloud (sa-east-1)"]
        Pooler["Supavisor Connection Pooler (:6543)"]
        PG[("PostgreSQL 16 (8 Tabelas ACID)")]
    end

    subgraph GoogleCloud["Google AI Studio"]
        Gemini["Google Gemini SDK (gemini-2.5-flash)"]
    end

    Browser -->|HTTPS / TLS 1.3| Edge
    Edge --> SSR
    Edge --> API
    Repo --> Actions
    Actions -->|Deploy Automático| Vercel
    API -->|Pool SSL| Pooler --> PG
    API -->|OCR Pix & Resumos| Gemini
```

---

## 2. CONFIGURAÇÃO DO SUPABASE (BANCO DE DADOS POSTGRESQL)

### 2.1. Criação do Projeto e Região
1. Acesse o painel do **Supabase** (`https://supabase.com/dashboard`) e crie o projeto **`portal-fatec-rioclaro`**.
2. Selecione a região **`South America (São Paulo - sa-east-1)`** para garantir latência inferior a `15ms` em conjunto com a Vercel (`gru1`).
3. Defina uma senha forte para o banco de dados PostgreSQL e salve-a para compor a `DATABASE_URL`.

### 2.2. Strings de Conexão (Connection Pooling vs Direct)
Em ambientes Serverless como a Vercel, funções de API abrem e fecham conexões rapidamente. Por isso, configuramos duas URLs em [`.env.example`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/.env.example):
* **`DATABASE_URL` (Porta `6543` — Transaction Mode via Supavisor):** Utilizada pela aplicação em produção (`src/lib/db.ts`) com `?pgbouncer=true`.
* **`DIRECT_URL` (Porta `5432` — Session Mode):** Utilizada exclusivamente pelos scripts de migração (`npm run db:migrate`) e carga inicial (`npm run db:seed`).

### 2.3. Execução do DDL e Carga Inicial (Seed)
Com o `.env.local` apontando para o Supabase (e `USE_MOCK_DB="false"`), execute:
```powershell
npm run db:migrate
npm run db:seed
```
> Alternativamente, o conteúdo de [`database/schema.sql`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/database/schema.sql) e [`database/seed.sql`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/database/seed.sql) pode ser colado e executado diretamente no **SQL Editor** do painel do Supabase.

---

## 3. CONFIGURAÇÃO DA VERCEL (HOSPEDAGEM E VARIÁVEIS DE AMBIENTE)

### 3.1. Vinculação com o Repositório GitHub
1. No painel da **Vercel** (`https://vercel.com/new`), importe o repositório `Estagio-Fatec`.
2. O arquivo [`vercel.json`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/vercel.json) na raiz do projeto configura automaticamente:
   * **Framework Preset:** `Next.js`
   * **Região de Execução Serverless:** `gru1` (São Paulo, Brasil)
   * **Timeouts:** `30s` para rotas `/api/ai/*` (OCR com Google Gemini) e `15s` para as demais rotas REST.
   * **Headers Globais OWASP:** `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` e `Permissions-Policy`.

### 3.2. Matriz de Variáveis de Ambiente na Vercel
Em **Project Settings → Environment Variables** na Vercel, cadastre as seguintes variáveis para os ambientes `Production`, `Preview` e `Development`:

| Variável | Escopo | Descrição Técnica | Valor em Produção (Vercel) |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Todos | Modo de otimização do runtime | `production` |
| `USE_MOCK_DB` | Dev / Prod | Ativa banco em memória (`true`) ou PostgreSQL real (`false`) | `false` (Prod) / `true` (Preview sem DB) |
| `DATABASE_URL` | Server | URL PostgreSQL Supabase (Pooler porta `6543`) | `postgresql://postgres.[REF]:[PASS]@...` |
| `DIRECT_URL` | Server | URL direta Supabase (Porta `5432` para migrations) | `postgresql://postgres.[REF]:[PASS]@...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client/Server | Endpoint REST público do projeto Supabase | `https://[PROJECT-REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/Server | Chave pública anônima (RLS) do Supabase | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | Chave administrativa de backend do Supabase | `eyJhbGciOiJIUzI1Ni...` |
| `JWT_SECRET` | Server Only | Chave secreta HS256 para assinatura de tokens JWT | Hash aleatório de 64+ caracteres |
| `GEMINI_API_KEY` | Server Only | Chave de API do Google AI Studio (SDK Gemini) | `AIzaSy...` |
| `GEMINI_MODEL` | Server Only | Modelo generativo multimodal utilizado no OCR | `gemini-2.5-flash` |
| `GEMINI_FALLBACK_MOCK` | Server Only | Mantém resiliência caso a cota gratuita seja atingida | `true` |

---

## 4. CONFIGURAÇÃO E TESTE DO SDK DO GOOGLE GEMINI

O módulo de IA foi implementado em [`src/lib/gemini.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/gemini.ts) e exposto via endpoint REST em [`src/app/api/ai/status/route.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/api/ai/status/route.ts).

### 4.1. Como Obter e Configurar a Chave de API
1. Acesse o **Google AI Studio** (`https://aistudio.google.com/app/apikey`) com a conta do projeto.
2. Gere uma API Key e defina `GEMINI_API_KEY="AIzaSy..."` no arquivo `.env.local` e no painel da Vercel.
3. Execute o script de verificação de conectividade:
```powershell
npm run test:gemini
```

### 4.2. Funcionalidades de IA Implementadas
* **Ping de Conectividade e Latência (`testGeminiConnectivity`):** Realiza handshake com o modelo `gemini-2.5-flash` via `@google/genai` (ou endpoint REST `v1beta`) e mede o tempo de resposta em milissegundos.
* **Auditoria OCR de Comprovantes Pix (`validatePixReceiptWithGemini`):** Analisa o comprovante enviado pelo aluno na Cantina Discente, extrai valor monetário (`R$`), identificador End-to-End (`E...`) do Banco Central e classifica automaticamente em `APROVADO_IA`, `DIVERGENTE` ou `REQUER_REVISAO_CA`.
* ** Assistente de Resumo Acadêmico (`summarizeAcademicMaterial`):** Gera sínteses e tags de indexação para apostilas e códigos das turmas de **IA (Matutino)** e **Gestão ESG (Noturno)**.

---

## 5. ESTEIRA DE TESTES AUTOMATIZADOS (VITEST + PLAYWRIGHT + CI/CD)

A estratégia de **Quality Assurance (QA)** segue a Pirâmide de Testes Automatizados:

| Camada da Pirâmide | Ferramenta / Runner | Comando | Escopo de Validação |
| :--- | :--- | :--- | :--- |
| **1. Testes Unitários** | **Vitest** / Node Runner | `npm run test:unit` / `npm test` | Força de senha, sanitização XSS, Rate Limiter, tokens JWT (`jose`), Bcrypt e motor OCR Gemini (`tests/unit/`). |
| **2. Testes de Integração** | **Vitest** + Mock/PG DB | `npm run test:backend` / `npm run test:gemini` | Repositório híbrido `src/lib/db.ts`, perfis RBAC (`ALUNO`, `CA_MEMBRO`, `PROFESSOR`, `ADMIN`) e conectividade SDK Gemini. |
| **3. Testes End-to-End (E2E)** | **Playwright** | `npm run test:e2e` | Jornadas reais no navegador Chromium Desktop e Mobile PWA Android (`tests/e2e/portal.spec.ts`). |
| **4. Pipeline CI/CD** | **GitHub Actions** | Push / Pull Request | Executa `.github/workflows/ci-cd.yml` validando TypeScript, Segurança, IA Gemini e Build Next.js. |
