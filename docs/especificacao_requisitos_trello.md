# DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE (ERS) & QUADRO TRELLO DA EQUIPE
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Meta: 200 horas por integrante)  
**Docente Orientador:** Prof. Orlando  
**Engenheiro Responsável pelo Documento:** Guilherme (Inteligência Artificial, DevOps & QA)  
**Equipe Técnica:**
* **Cesar:** Arquitetura Backend, Segurança da Informação e Banco de Dados
* **Luis:** Engenharia Frontend, UI/UX Design, Acessibilidade e PWA Multiplataforma
* **Guilherme:** Inteligência Artificial (Google Gemini SDK), DevOps (Vercel/Supabase) e QA/Testes

---

## PARTE 1 — ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE (PADRÃO IEEE 830 / ISO 29148)

### 1.1. Escopo e Visão do Produto
O **Portal Integrado FATEC Rio Claro** é uma plataforma web progressiva (PWA) concebida a partir de pesquisa quantitativa e qualitativa realizada com **38 discentes** dos cursos de **Inteligência Artificial (Matutino)** e **Gestão Empresarial / ESG (Noturno)**. O sistema soluciona três gargalos críticos da comunidade acadêmica:
1. **Gestão Transparente da Cantina Discente (*Honest Market*):** Digitalização do autoatendimento, cálculo automático de carrinho, geração de Pix dinâmico e validação inteligente de comprovantes via IA (Google Gemini Vision/OCR).
2. **Repositório Acadêmico e Vitrine de Projetos:** Centralização de apostilas, slides, códigos-fonte, datasets e projetos integradores/TCCs organizados por curso e semestre (1º ao 6º).
3. **Comunicação Institucional e Centro Acadêmico (CA):** Mural unificado de avisos oficiais, prazos acadêmicos e integração rápida com o portal SIGA CPS.

---

### 1.2. Requisitos Funcionais (RF)

#### Eixo A: Autenticação, Perfis e Controle de Acesso (RBAC)
| ID | Requisito Funcional | Prioridade | Responsável Principal | Status (Sprint 1) |
| :--- | :--- | :---: | :---: | :---: |
| **RF-01** | **Cadastro Institucional Discente:** Permitir o registro de estudantes exigindo e-mail institucional (`@aluno.cps.sp.gov.br` ou `@fatec.sp.gov.br`), RA, seleção de curso (`IA` ou `ESG`), semestre vigente e senha forte. | Alta | Cesar / Luis | ✅ Concluído |
| **RF-02** | **Autenticação Segura via JWT & Cookies HttpOnly:** Autenticar usuários via `/api/auth/login` com emissão de token JWT assinado (HS256) e transporte em cookie `HttpOnly`. | Alta | Cesar | ✅ Concluído |
| **RF-03** | **Controle de Acesso Baseado em Papéis (RBAC):** Restringir rotas e operações conforme os perfis `ALUNO`, `CA_MEMBRO`, `PROFESSOR` e `ADMIN` via Middleware Edge (`src/middleware.ts`). | Alta | Cesar | ✅ Concluído |
| **RF-04** | **Consulta de Sessão e Logout:** Disponibilizar verificação de sessão ativa (`/api/auth/me`) e invalidação imediata do cookie de autenticação (`/api/auth/logout`). | Média | Cesar / Luis | ✅ Concluído |

#### Eixo B: Cantina Discente (*Honest Market*) & Validação IA
| ID | Requisito Funcional | Prioridade | Responsável Principal | Status (Sprint 1) |
| :--- | :--- | :---: | :---: | :---: |
| **RF-05** | **Catálogo de Produtos em Tempo Real:** Listar itens disponíveis na cantina separados por categoria (`DOCE`, `SALGADO`, `BEBIDA`, `CONGELADO`, `OUTRO`) com preço e saldo de estoque. | Alta | Cesar / Luis | 🔄 Base Pronta / Sprint 2 |
| **RF-06** | **Geração de Cobrança Pix Dinâmica:** Calcular o valor total dos itens selecionados pelo aluno e gerar payload Pix Copia-e-Cola (padrão EMV Banco Central) e QR Code em tela. | Alta | Cesar / Luis | 📅 Sprint 2 |
| **RF-07** | **Validação Inteligente de Comprovante Pix via IA (Google Gemini):** Analisar o comprovante enviado pelo aluno extraindo valor pago, destinatário (`Centro Academico Fatec Rio Claro`), data/hora e identificador `EndToEndId`, aprovando automaticamente (`PAGO`) ou retendo para revisão (`EM_ANALISE`). | Alta | Guilherme | 🔄 Motor SDK Pronto / Sprint 2 |
| **RF-08** | **Baixa Automática e Alerta de Estoque Mínimo:** Deduzir a quantidade comprada de `current_stock` após confirmação e sinalizar itens com `current_stock <= min_stock_alert` para o CA. | Média | Cesar | 📅 Sprint 2 |
| **RF-09** | **Histórico Pessoal de Compras e Caixinha de Sugestões:** Permitir ao estudante visualizar seu extrato de compras e votar/sugerir novos produtos para a cantina. | Média | Luis / Cesar | 📅 Sprint 2 / 3 |

#### Eixo C: Repositório Acadêmico, Assistente IA & Mural de Avisos
| ID | Requisito Funcional | Prioridade | Responsável Principal | Status (Sprint 1) |
| :--- | :--- | :---: | :---: | :---: |
| **RF-10** | **Repositório de Materiais Didáticos por Curso e Semestre:** Permitir busca, filtragem e download de materiais (`SLIDE`, `APOSTILA`, `CODIGO`, `TCC`, `DATASET`) segmentados entre IA e ESG. | Alta | Luis / Cesar | 📅 Sprint 2 |
| **RF-11** | **Vitrine de Projetos Acadêmicos:** Exibir projetos práticos e repositórios GitHub desenvolvidos pelos alunos da FATEC Rio Claro. | Média | Luis | 📅 Sprint 3 |
| **RF-12** | **Mural de Avisos Prioritários:** Publicar e destacar comunicados oficiais com níveis de prioridade (`BAIXA`, `MEDIA`, `ALTA`, `URGENTE`) e fixação no topo (`is_pinned`). | Alta | Cesar / Luis | 🔄 Base Pronta / Sprint 2 |
| **RF-13** | **Assistente Acadêmico Inteligente (Gemini):** Oferecer suporte contextualizado via IA para dúvidas sobre materiais e organização de estudos dos cursos de IA e ESG. | Média | Guilherme | 📅 Sprint 3 |
| **RF-14** | **Trilha de Auditoria (Audit Logs):** Registrar em banco de dados todas as operações críticas (logins, aprovações de comprovantes, alterações de estoque) com IP e timestamp. | Alta | Cesar | ✅ Concluído |

---

### 1.3. Requisitos Não-Funcionais (RNF)

| ID | Categoria | Descrição e Critério de Aceitação Mensurável | Responsável |
| :--- | :--- | :--- | :---: |
| **RNF-01** | **Segurança (OWASP)** | Senhas armazenadas exclusivamente com hash `Bcrypt` (salt rounds = 10) e verificação em tempo constante. | Cesar |
| **RNF-02** | **Proteção Anti-Abuso** | *Rate Limiting* ativo em memória bloqueando IPs após 5 tentativas malsucedidas de login em janela de 60 segundos, além de sanitização contra XSS (`sanitizeInput`). | Cesar / Guilherme |
| **RNF-03** | **Estabilidade Visual (Zero CLS)** | *Cumulative Layout Shift* (CLS) igual a `0.00` na página inicial, garantindo alturas mínimas fixas no carrossel Hero (`minHeight: 6.2rem` e `4.8rem`). | Luis |
| **RNF-04** | **Acessibilidade (WCAG 2.1 AA / e-MAG)** | Modo de Alto Contraste nativo, navegação completa por teclado, atributos `aria-label` e paleta biofílica inclusiva para alunos de IA (`#0284c7`) e ESG (`#059669`). | Luis |
| **RNF-05** | **Multiplataforma PWA** | Manifesto Web (`manifest.json`), ícones `192px`/`512px` e `apple-touch-icon` permitindo instalação em Android, iOS e Desktop. | Luis |
| **RNF-06** | **Resiliência Híbrida (Offline-First Dev)** | O sistema deve operar tanto conectado ao PostgreSQL/Supabase e Google Gemini Live quanto em modo simulado (`USE_MOCK_DB=true` e `USE_MOCK_AI=true`), impedindo bloqueios entre a equipe. | Cesar / Guilherme |
| **RNF-07** | **Hospedagem e Latência Cloud** | Execução Serverless na Vercel na região de São Paulo (`gru1`) conectada ao Supabase (`sa-east-1`) via Transaction Pooler (porta `6543`) com HTTPS obrigatório. | Guilherme |
| **RNF-08** | **Qualidade e Testes Automatizados** | Cobertura de testes automatizados com Vitest (unitários), Playwright (E2E Desktop/Mobile) e pipeline CI/CD no GitHub Actions validando cada build. | Guilherme |

---

### 1.4. Regras de Negócio (RN)
* **RN-01 (Exclusividade Institucional):** Apenas e-mails pertencentes aos domínios oficiais do Centro Paula Souza (`@aluno.cps.sp.gov.br` ou `@fatec.sp.gov.br`) podem criar conta de estudante.
* **RN-02 (Integridade de Estoque):** Nenhuma transação pode reduzir o campo `current_stock` de um produto para um valor menor que zero (`CHECK (current_stock >= 0)`).
* **RN-03 (Dupla Verificação de Comprovantes):** Comprovantes Pix cujo grau de confiança da análise OCR via Google Gemini seja inferior a `90%` (`0.90`) ou cujo valor divirja do total do pedido recebem automaticamente o status `EM_ANALISE` para conferência humana de um membro do CA (`CA_MEMBRO` ou `ADMIN`).
* **RN-04 (Governança de Versionamento):** Todos os commits e sincronizações oficiais são revisados pela esteira de testes automatizados (`npm run test:qa`) e registrados pelos integrantes da equipe.

---

## PARTE 2 — QUADRO TRELLO DA EQUIPE (GESTÃO ÁGIL KANBAN — 200 HORAS)

### 2.1. Estrutura de Colunas (Listas do Quadro Trello)
O quadro Trello do projeto (**"Portal Integrado FATEC Rio Claro — Estágio 200h"**) está estruturado em 5 listas operacionais:
1. 📌 ** Diretrizes, Documentação & Recursos Fixos** *(Cards de referência da equipe)*
2. ✅ **Sprint 1 — Concluído (27/10 a 02/11/2026 | 66h/integrante)** *(Fundação Backend, UI/UX PWA, DevOps, IA SDK & QA)*
3. 🚀 **Sprint 2 — Planejado / Próxima Etapa (03/11 a 09/11/2026 | 67h/integrante)** *(Cantina Honest Market, Pix Dinâmico, OCR Gemini & Repositório)*
4. 🧪 **Em Revisão / Homologação QA** *(Gate de testes Vitest + Playwright antes de merge na `main`)*
5. 🎯 **Sprint 3 — Backlog Futuro (10/11 a 16/11/2026 | 67h/integrante)** *(Vitrine de Projetos, Assistente IA, Cache PWA Offline, Painel Admin CA & Relatório Final)*

### 2.2. Padrão de Etiquetas (Labels do Trello)
* 🟦 **[BACKEND & DB - CESAR]** — APIs REST, PostgreSQL/Supabase, Segurança OWASP, JWT/RBAC.
* 🟩 **[FRONTEND & UX - LUIS]** — Componentes React/Next.js, Design System IA/ESG, Acessibilidade WCAG, PWA.
* 🟪 **[IA, DEVOPS & QA - GUILHERME]** — Google Gemini SDK, OCR Pix, Hospedagem Vercel/Supabase, Vitest/Playwright, ERS.
* 🟥 **[PRIORIDADE CRÍTICA / BLOQUEANTE]** — Tarefa caminho crítico da Sprint.

---

### 2.3. Detalhamento dos Cartões por Sprint e Integrante

#### ✅ LISTA 1: SPRINT 1 — CONCLUÍDO (66h por integrante = 198h totais da equipe)

| Card ID | Título do Cartão no Trello | Etiqueta / Responsável | Checklist de Entregáveis Concluídos | Carga Horária |
| :--- | :--- | :--- | :--- | :---: |
| **CARD-101** | Modelagem DER, DDL PostgreSQL e Camada Híbrida de Dados | 🟦 **Cesar** | `[x]` Analisar dataset de 38 respostas discentes<br>`[x]` Modelar DER com 8 tabelas (`database/der.md`)<br>`[x]` Criar `schema.sql` e `seed.sql` (IA e ESG)<br>`[x]` Implementar `src/lib/db.ts` (Pool + Mock) | **38h** |
| **CARD-102** | Motor de Segurança OWASP, Autenticação JWT/Bcrypt e Rotas Auth | 🟦 **Cesar** | `[x]` Hash Bcrypt (salt 10) e JWT `jose` (`src/lib/auth.ts`)<br>`[x]` Rate Limiter + Sanitização XSS (`src/lib/security.ts`)<br>`[x]` Middleware RBAC (`src/middleware.ts`)<br>`[x]` Endpoints `/api/auth/*` e `/api/health` | **28h** |
| **CARD-103** | UX Research, Identidade Visual FATEC/CPS e Design System Simbiótico | 🟩 **Luis** | `[x]` Tabular pesquisa UX e personas IA/ESG<br>`[x]` Refinar `LogoFatec.tsx` e `GaloWidget.tsx` com física 3D<br>`[x]` Criar paleta Eco-Tech (`#0284c7` / `#059669`) e `EcoTechBackground.tsx`<br>`[x]` Eliminar CLS no Hero Carrossel | **34h** |
| **CARD-104** | Arquitetura AppLayout, PWA Multiplataforma e Fluxos de Login/Cadastro | 🟩 **Luis** | `[x]` Implementar `AppLayout.tsx` (Sidebar + Drawer + Alto Contraste)<br>`[x]` Configurar `manifest.json` e ícones PWA<br>`[x]` Construir telas de Login/Cadastro e estados neutros da Home | **32h** |
| **CARD-105** | Infraestrutura DevOps (Vercel + Supabase) e Conectividade SDK Google Gemini | 🟪 **Guilherme** | `[x]` Configurar `vercel.json` (região `gru1` e headers OWASP)<br>`[x]` Mapear variáveis Vercel, Supabase Pooler e Gemini em `.env.example`<br>`[x]` Implementar `src/lib/gemini.ts` e rota `/api/ai/health`<br>`[x]` Criar script de validação `scripts/test_gemini.js` | **34h** |
| **CARD-106** | Esteira de Testes Automatizados (Vitest / Playwright / CI) + ERS & Trello | 🟪 **Guilherme** | `[x]` Configurar `vitest.config.ts` e `playwright.config.ts`<br>`[x]` Criar suítes unitárias (`tests/unit/*`) e E2E (`tests/e2e/*`)<br>`[x]` Criar runner `scripts/test_qa_pipeline.js` e workflow `.github/workflows/ci-qa.yml`<br>`[x]` Redigir ERS (IEEE 830) e Quadro Trello (`docs/especificacao_requisitos_trello.md`) | **32h** |

---

#### 🚀 LISTA 2: SPRINT 2 — PRÓXIMA ETAPA (03/11 a 09/11/2026 | 67h por integrante)

| Card ID | Título do Cartão no Trello | Etiqueta / Responsável | Escopo Planejado para a Sprint 2 | Carga Horária |
| :--- | :--- | :--- | :--- | :---: |
| **CARD-201** | Endpoints da Cantina Discente, Transações e Gerador Pix EMV | 🟦 **Cesar** | `[ ]` Rotas `GET/POST /api/canteen/products` e `/api/canteen/transactions`<br>`[ ]` Geração de payload Pix Copia-e-Cola dinâmico com CRC16<br>`[ ]` Controle transacional de baixa de estoque no PostgreSQL | **35h** |
| **CARD-202** | APIs do Repositório Acadêmico e Mural de Avisos | 🟦 **Cesar** | `[ ]` Rotas `GET/POST /api/materials` com filtro por curso/semestre<br>`[ ]` Rotas `GET/POST /api/announcements` restritas a Professores/CA | **32h** |
| **CARD-203** | Interface Interativa da Cantina Honest Market e Checkout Pix | 🟩 **Luis** | `[ ]` Catálogo visual com filtro de categorias e carrinho reativo<br>`[ ]` Modal de pagamento Pix com QR Code, botão Copia-e-Cola e upload de comprovante | **35h** |
| **CARD-204** | Interface do Repositório Acadêmico e Mural Dinâmico | 🟩 **Luis** | `[ ]` Página `/repositorio` com filtros por curso (IA/ESG) e semestre (1º ao 4º)<br>`[ ]` Integração da Home e `/avisos` com os endpoints reais do backend | **32h** |
| **CARD-205** | Motor OCR Multimodal Google Gemini para Comprovantes Pix | 🟪 **Guilherme** | `[ ]` Endpoint `/api/ai/validate-receipt` com análise de imagem/PDF via Gemini Vision<br>`[ ]` Extração estruturada JSON (`valor`, `destinatário`, `EndToEndId`, `data`) e antifraude | **35h** |
| **CARD-206** | Testes de Integração de Pagamento, Storage Supabase e Deploy Preview | 🟪 **Guilherme** | `[ ]` Configurar bucket `receipts` e `materials` no Supabase Storage<br>`[ ]` Testes automatizados do fluxo completo de compra + OCR na esteira Vitest/Playwright | **32h** |

---

#### 🎯 LISTA 3: SPRINT 3 — BACKLOG FUTURO (10/11 a 16/11/2026 | 67h por integrante)

| Card ID | Título do Cartão no Trello | Etiqueta / Responsável | Escopo Planejado para a Sprint 3 | Carga Horária |
| :--- | :--- | :--- | :--- | :---: |
| **CARD-301** | Dashboard Administrativo do CA, Relatórios Financeiros e Auditoria | 🟦 **Cesar** | `[ ]` Endpoints de conciliação financeira da cantina e alertas de reposição<br>`[ ]` Visualização de `audit_logs` e fechamento de segurança | **67h** |
| **CARD-302** | Vitrine de Projetos, Histórico do Aluno, Service Worker Offline e WCAG | 🟩 **Luis** | `[ ]` Página `/vitrine` (TCCs e projetos GitHub) e `/historico` de compras<br>`[ ]` Cache offline PWA e auditoria final com leitores de tela | **67h** |
| **CARD-303** | Assistente Acadêmico IA, Testes de Carga/Segurança e Go-Live Produção | 🟪 **Guilherme** | `[ ]` Assistente de estudos Gemini integrado ao Repositório Acadêmico<br>`[ ]` Bateria final E2E Playwright, auditoria Lighthouse e publicação oficial na Vercel | **67h** |
