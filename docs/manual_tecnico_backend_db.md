# MANUAL TÉCNICO DE ENGENHARIA DE BACKEND & BANCO DE DADOS
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Meta: 200 Horas)  
**Docente Orientador:** Prof. Orlando  
**Autor Principal:** Cesar (Líder de Arquitetura Backend, Banco de Dados & Segurança da Informação)  
**Versão:** 3.0 — Versão Final Homologada (Novembro de 2026)  

---

## 1. VISÃO GERAL DA ARQUITETURA BACKEND

O backend do *Portal Integrado FATEC Rio Claro* foi projetado sobre a arquitetura moderna do **Next.js 15 (App Router)** utilizando **Route Handlers Serverless**, garantindo baixa latência na região de São Paulo (`gru1` — Vercel Serverless Functions) e conexão resiliente ao banco de dados relacional **PostgreSQL** hospedado no Supabase (`sa-east-1`).

```mermaid
flowchart TD
    Client["📱 Dispositivos Discentes & Docentes (Web/PWA)"] -->|HTTPS / TLS 1.3| Edge["🛡️ Edge Middleware (RBAC & OWASP Headers)"]
    Edge -->|Validação de Sessão| Handlers["⚙️ API REST Route Handlers (/api/*)"]
    Handlers -->|Sanitização & Rate Limiting| SecurityLib["🔐 Security Engine (src/lib/security.ts)"]
    Handlers -->|EMV TLV & CRC-16| PixLib["💳 Pix Engine (src/lib/pix.ts)"]
    Handlers -->|Pooler pg.Pool (ACID)| DataLayer["🗄️ Camada de Acesso a Dados Híbrida (src/lib/db.ts)"]
    DataLayer -->|Transações Parametrizadas| Postgres["🐘 PostgreSQL Database (Supabase Cloud)"]
    DataLayer -->|Seed Determinístico| MockDB["💾 In-Memory Mock (Dev & CI/CD Offline)"]
```

---

## 2. DICIONÁRIO DE DADOS RELACIONAL (POSTGRESQL DDL)

O banco de dados relacional é composto por **8 entidades centrais**, estruturadas para garantir integridade referencial estrita e zero inconsistências contábeis.

### 2.1. Tabela `users` (Discentes, Membros do CA e Docentes)
Armazena as identidades institucionais autenticadas.
* `id` (UUID, PK): Identificador único gerado via `gen_random_uuid()`.
* `name` (VARCHAR 150, NOT NULL): Nome completo do usuário.
* `email` (VARCHAR 180, UNIQUE, NOT NULL): E-mail institucional obrigatório (`@aluno.cps.sp.gov.br`).
* `ra` (VARCHAR 30, UNIQUE, NULL): Registro Acadêmico do discente.
* `password_hash` (VARCHAR 255, NOT NULL): Hash criptográfico modular gerado com Bcrypt (10 salt rounds).
* `role` (user_role, NOT NULL): Papel RBAC (`ALUNO`, `CA_MEMBRO`, `PROFESSOR`, `ADMIN`).
* `course` (course_type, NOT NULL): Curso de matrícula (`IA` ou `ESG`).
* `semester` (INTEGER, CHECK 1 a 6): Semestre letivo.
* `is_active` (BOOLEAN, DEFAULT TRUE): Flag de ativação da conta.
* `created_at` / `updated_at` (TIMESTAMPTZ): Registro temporal auditado por trigger.

### 2.2. Tabela `canteen_products` (Catálogo Honest Market)
Itens disponíveis para autoatendimento nos intervalos.
* `id` (UUID, PK): Identificador do produto.
* `name` (VARCHAR 120, NOT NULL): Nome comercial do item.
* `description` (TEXT): Informações nutricionais ou descrição discente.
* `category` (item_category, NOT NULL): `DOCE`, `SALGADO`, `BEBIDA`, `CONGELADO`, `OUTRO`.
* `price` (DECIMAL 10,2, CHECK >= 0): Preço unitário de venda.
* `current_stock` (INTEGER, CHECK >= 0): Saldo físico disponível. A constraint impede estoque negativo (RNF-08).
* `min_stock_alert` (INTEGER, DEFAULT 5): Ponto de pedido para alerta automático de reposição.
* `image_url` (TEXT): Caminho da fotografia do item.
* `barcode` (VARCHAR 50): Código EAN/GTIN para leitura óptica.
* `is_available` (BOOLEAN, DEFAULT TRUE): Disponibilidade para exibição no catálogo.

### 2.3. Tabela `canteen_transactions` (Histórico & Controle Pix)
Transações financeiras de autoatendimento discente.
* `id` (UUID, PK): Identificador único do pedido.
* `user_id` (UUID, FK -> users): Estudante pagador.
* `total_amount` (DECIMAL 10,2, CHECK > 0): Valor exato consolidado do pedido.
* `status` (transaction_status): `PENDENTE`, `PAGO`, `CANCELADO`, `EM_ANALISE`.
* `payment_method` (VARCHAR 30, DEFAULT 'PIX'): Modalidade de pagamento.
* `pix_copy_paste` (TEXT): Payload EMV oficial do Banco Central (Copia-e-Cola).
* `pix_qr_code_url` (TEXT): URL / Data URI da imagem renderizada do QR Code.
* `pix_end_to_end_id` (VARCHAR 100): Código identificador bancário E2E extraído pelo OCR Gemini.
* `proof_image_url` (TEXT): Imagem do comprovante Pix anexada pelo discente.
* `validated_by` (UUID, FK -> users): Usuário do CA ou IA que aprovou o pagamento.

### 2.4. Tabela `canteen_transaction_items` (Itens do Pedido)
Discriminação atômica dos produtos contidos em cada transação.
* `id` (UUID, PK): Identificador do item.
* `transaction_id` (UUID, FK -> canteen_transactions ON DELETE CASCADE).
* `product_id` (UUID, FK -> canteen_products ON DELETE RESTRICT).
* `quantity` (INTEGER, CHECK > 0): Unidades adquiridas.
* `unit_price` (DECIMAL 10,2): Preço praticado no momento da compra.
* `subtotal` (DECIMAL 10,2): Coluna calculada automaticamente (`quantity * unit_price`).

### 2.5. Tabela `academic_materials` (Repositório Didático & Vitrine TCC)
Materiais acadêmicos, datasets, códigos e trabalhos de graduação.
* `id` (UUID, PK): Identificador do arquivo.
* `title` (VARCHAR 200, NOT NULL): Título didático do trabalho.
* `description` (TEXT): Resumo técnico.
* `subject` (VARCHAR 120, NOT NULL): Disciplina curricular associada.
* `course` (course_type, NOT NULL): Segmentação (`IA` ou `ESG`).
* `semester` (INTEGER, CHECK 1 a 6): Semestre correspondente.
* `author_id` (UUID, FK -> users): Discente ou docente autor.
* `material_type` (VARCHAR 50): `SLIDE`, `APOSTILA`, `CODIGO`, `TCC`, `DATASET`.
* `file_url` (TEXT, NOT NULL): Caminho do arquivo seguro (`/uploads/materials/...`).
* `github_url` (TEXT): Link para o repositório oficial no GitHub.
* `tags` (VARCHAR 255): Termos-chave normalizados para busca.
* `download_count` (INTEGER, DEFAULT 0): Métrica de engajamento do material.
* `is_approved` (BOOLEAN, DEFAULT TRUE): Moderação docente.

### 2.6. Demais Entidades Auxiliares
* `announcements`: Mural institucional com prioridade (`BAIXA`, `MEDIA`, `ALTA`, `URGENTE`) e expiração.
* `canteen_suggestions`: Caixinha discente de sugestão de novos lanches e votação.
* `audit_logs`: Trilha imutável de eventos de conformidade (IP, User-Agent, Ação e Payload JSONB).

---

## 3. CATÁLOGO COMPLETO DE ENDPOINTS REST (API REFERENCE)

| Rota | Método | Papel Mínimo (RBAC) | Descrição e Ação |
| :--- | :---: | :---: | :--- |
| **`/api/auth/register`** | `POST` | Público | Auto-cadastro discente com e-mail `@aluno.cps.sp.gov.br`. |
| **`/api/auth/login`** | `POST` | Público | Autenticação Bcrypt com emissão de JWT HttpOnly. |
| **`/api/auth/logout`** | `POST` | Autenticado | Revogação de sessão e destruição do cookie. |
| **`/api/auth/me`** | `GET` | Autenticado | Retorna claims do usuário logado a partir do token. |
| **`/api/canteen/products`** | `GET` | Público | Lista catálogo da cantina filtrado por categoria/busca. |
| **`/api/canteen/products`** | `POST` | `CA_MEMBRO`/`ADMIN` | Cadastro de novos produtos no estoque. |
| **`/api/canteen/products/[id]`** | `GET/PUT/DEL` | `CA_MEMBRO`/`ADMIN` | Detalhes, atualização de preços e remoção de itens. |
| **`/api/canteen/products/[id]/stock`**| `PATCH` | `CA_MEMBRO`/`ADMIN` | Ajuste manual ou reposição com checagem de estoque baixo. |
| **`/api/canteen/checkout`** | `POST` | `ALUNO` | Cria pedido atômico com débito de estoque e emissão Pix. |
| **`/api/canteen/history`** | `GET` | `ALUNO` | Extrato consolidado de compras e total gasto pelo aluno. |
| **`/api/canteen/transactions`** | `GET` | `ALUNO`/`CA` | Listagem geral de transações auditadas da cantina. |
| **`/api/canteen/transactions/[id]`** | `GET/PATCH` | `ALUNO`/`CA` | Consulta individual e deliberação de status de pagamento. |
| **`/api/canteen/transactions/[id]/proof`**| `POST` | `ALUNO` | Anexo de comprovante Pix para análise do CA e IA Gemini. |
| **`/api/pix/generate`** | `POST` | Público | Gerador sob demanda de payload Pix EMV oficial. |
| **`/api/pix/validate`** | `POST` | Público | Validador algorítmico de integridade e checksum CRC-16. |
| **`/api/ca/analytics/financial`** | `GET` | `CA_MEMBRO`/`ADMIN` | Faturamento total, ticket médio e receita por período. |
| **`/api/ca/analytics/products`** | `GET` | `CA_MEMBRO`/`ADMIN` | Ranking dos produtos mais vendidos e alertas de reposição. |
| **`/api/ca/analytics/audit`** | `GET` | `CA_MEMBRO`/`ADMIN` | Relatório analítico da trilha de auditoria e incidentes. |
| **`/api/ca/analytics/export`** | `GET` | `CA_MEMBRO`/`ADMIN` | Exportação de extrato contábil da cantina em CSV. |
| **`/api/materials`** | `GET/POST` | Autenticado | Busca multi-critério e upload de materiais didáticos e TCC. |
| **`/api/materials/[id]`** | `GET/PUT/DEL` | Autor/Docente | Consulta de material, edição de metadados e exclusão. |
| **`/api/materials/[id]/download`** | `POST` | Autenticado | Incremento atômico de contagem de downloads. |
| **`/api/materials/upload`** | `POST` | Autenticado | Upload de arquivos com restrição de extensões e 25MB. |
| **`/api/announcements`** | `GET/POST` | `PROFESSOR`/`CA` | Mural de avisos com ordenação prioritária de fixados. |
| **`/api/health`** | `GET` | Público | Diagnóstico de disponibilidade do banco de dados. |

---

## 4. MOTOR DE PIX DINÂMICO (PADRÃO BANCO CENTRAL DO BRASIL)

O serviço implementado em [`src/lib/pix.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/pix.ts) segue estritamente a especificação **EMVCo MPM (BR Code)**:

1. **Estrutura TLV (Tag-Length-Value):** Cada campo possui 2 dígitos de identificador seguidos de 2 dígitos decimais com o comprimento exato do valor.
2. **Tags Essenciais:**
   * `000201`: Payload Format Indicator ("01").
   * `010212`: Point of Initiation Method ("12" = Dinâmico / uso único por compra).
   * `26`: Informações do recebedor contendo GUI `br.gov.bcb.pix` (subtag 00) e Chave Pix do CA (subtag 01).
   * `52040000`: Merchant Category Code.
   * `5303986`: Moeda Real Brasileiro segundo ISO 4217 (`986`).
   * `54`: Valor monetário com duas casas decimais.
   * `5802BR`: Código de país do Brasil.
   * `59` e `60`: Nome do Centro Acadêmico e Cidade ("RIO CLARO") sanitizados em ASCII.
   * `62`: Identificador de transação único (`txid` subtag 05, máx 25 caracteres alfanuméricos).
   * `6304`: Tag do Checksum CRC-16.
3. **Cálculo de Checksum CRC-16/CCITT-FALSE:**
   O algoritmo processa a string inteira incluindo `6304` utilizando o polinômio `0x1021` e valor inicial `0xFFFF`, gerando 4 caracteres hexadecimais em caixa alta.

---

## 5. ARQUITETURA DE SEGURANÇA DA INFORMAÇÃO (OWASP TOP 10)

* **Proteção contra SQL Injection (A03):** 100% das consultas utilizam queries parametrizadas com placeholders posicionais (`$1, $2, ...`). Além disso, o utilitário `assertSafeSqlIdentifier` valida nomes de tabelas dinâmicas via expressão regular `^[a-zA-Z_][a-zA-Z0-9_]*$`.
* **Proteção contra XSS e Injeção de Scripts (A03):** Função `sanitizeInput` e `sanitizeObject` eliminam tags `<script>`, `<iframe>`, handlers `onload/onerror`, links `javascript:` e dados maliciosos recursivamente antes da persistência.
* **Autenticação Criptográfica e RBAC (A01 / A07):**
  * Senhas hasheadas via **Bcrypt** com custo mínimo de 10 salt rounds.
  * Tokens **JWT** criptografados com algoritmo simétrico `HS256` utilizando chave de 256 bits, armazenados em cookies `HttpOnly; Secure; SameSite=Lax`.
  * Middleware de borda intercepta todas as requisições em `/api/admin`, `/api/ca` e `/api/professor` validando o papel do usuário.
* **Mitigação de Ataques de Força Bruta e DoS (A04):** Rate limiting em memória com buckets isolados por tipo de operação (Login: 5 req/min; Checkout: 10 req/min; Uploads: 5 req/min) respondendo com cabeçalhos `X-RateLimit-*` e código `HTTP 429`.

---

## 6. GUIA DE DEPLOY, MIGRAÇÃO E MANUTENÇÃO

### 6.1. Migração do Banco de Dados
Para aplicar o DDL e triggers em um ambiente PostgreSQL novo:
```bash
npm run db:migrate
```
Para popular os dados iniciais de homologação (usuários e produtos seed):
```bash
npm run db:seed
```

### 6.2. Aplicação dos Índices de Otimização da Sprint 3
Para executar os índices compostos e GIN no PostgreSQL de produção:
```bash
# Executado via console SQL do Supabase ou psql
\i database/optimization_indexes.sql
```

### 6.3. Execução das Suítes de Teste
```bash
# Teste completo de QA
npm test

# Teste das rotas e motor de IA
npm run test:sprint2
npm run test:gemini
```

