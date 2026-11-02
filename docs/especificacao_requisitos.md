# DOCUMENTO DE ESPECIFICAÇÃO DE REQUISITOS DE SOFTWARE (ERS / SRS)
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Meta: 200 Horas)  
**Docente Orientador:** Prof. Orlando  
**Engenheiro Responsável (QA, Requisitos & IA):** Guilherme  
**Equipe de Engenharia:** Cesar (Backend, BD & Segurança), Luis (Frontend, UI/UX & PWA) e Guilherme (DevOps, IA & QA)  
**Versão:** 1.0 — Sprint 1 (02 de Novembro de 2026)  

---

## 1. INTRODUÇÃO E PROPÓSITO DO DOCUMENTO

Este **Documento de Especificação de Requisitos de Software (ERS)**, elaborado em conformidade com as boas práticas da Engenharia de Software (padrão IEEE 830 / ISO/IEC/IEEE 29148), define integralmente os requisitos funcionais, não-funcionais, regras de negócio e critérios de aceite do **Portal Integrado dos Estudantes da FATEC Rio Claro**.

A especificação foi fundamentada nos dados empíricos coletados por meio de **pesquisa diagnóstica com 38 estudantes** dos cursos de **Superior de Tecnologia em Inteligência Artificial (Período Matutino)** e **Superior de Tecnologia em Gestão Empresarial / ESG (Período Noturno)** da FATEC Rio Claro.

---

## 2. DIAGNÓSTICO DO PROBLEMA E ESCOPO DO PRODUTO

### 2.1. Dores Identificadas na Pesquisa Discente (N = 38 Alunos)
1. **Gestão Manual e Fragilidade na Cantina Discente (*Honest Market*):** O autoatendimento nos intervalos dependia de anotações manuais ou conferência informal de Pix, ocasionando esquecimentos de registro, dúvidas sobre preços atualizados, falta de controle de estoque em tempo real e sobrecarga para o Centro Acadêmico (CA).
2. **Dispersão de Materiais Acadêmicos:** Slides, apostilas, listas de exercícios, datasets de IA e estudos de caso de ESG ficavam espalhados em grupos de mensagens, drives pessoais e e-mails, dificultando a revisão para avaliações do 1º ao 4º semestre.
3. **Ruído na Comunicação Institucional:** Avisos urgentes da Coordenação, Secretaria e Centro Acadêmico perdiam-se em meio a conversas informais.
4. **Identidade e Pertencimento Dual (IA + ESG):** Necessidade de uma plataforma que representasse simultaneamente o rigor analítico/tecnológico de **Inteligência Artificial** e os valores de sustentabilidade, governança e responsabilidade socioambiental de **Gestão ESG**.

---

## 3. PERFIS DE USUÁRIO (ATORES E CONTROLE DE ACESSO RBAC)

| Papel (Role) | Descrição do Perfil | Permissões Principais no Sistema |
| :--- | :--- | :--- |
| **`ALUNO`** | Estudantes regularmente matriculados nos cursos de IA ou Gestão ESG (1º ao 4º semestre vigentes, expansível até o 6º). | Consultar catálogo da cantina, realizar pedidos via Pix, anexar comprovante para validação OCR, baixar materiais acadêmicos, ler avisos e enviar sugestões de produtos. |
| **`CA_MEMBRO`** | Integrantes eleitos do Centro Acadêmico responsáveis pela Cantina Discente e comunicação estudantil. | Todas as permissões de `ALUNO` + cadastrar/atualizar estoque e preços da cantina, auditar transações Pix retidas pela IA (`REQUER_REVISAO_CA`), emitir comunicados discentes. |
| **`PROFESSOR`** | Docentes e Coordenadores de Curso (ex.: Prof. Orlando). | Publicar e aprovar materiais didáticos (slides, apostilas, códigos, TCCs), emitir comunicados oficiais de alta prioridade segmentados por curso e semestre. |
| **`ADMIN`** | Administradores técnicos da plataforma. | Gestão completa de usuários, alteração de papéis RBAC, consulta aos logs de auditoria (`audit_logs`) e monitoramento de saúde da nuvem (`/api/health` e `/api/ai/status`). |

---

## 4. REQUISITOS FUNCIONAIS (RF)

### 4.1. Módulo de Autenticação, Perfis e Segurança (Auth & RBAC)
* **RF-01 — Cadastro Discente Institucional:** O sistema deve permitir o cadastro de estudantes informando Nome Completo, E-mail Institucional obrigatório (`@aluno.cps.sp.gov.br`), RA (opcional), Curso (`IA` ou `ESG`), Semestre (`1` a `4`) e Senha Forte.
* **RF-02 — Validação de Força de Senha em Tempo Real:** O formulário de cadastro e a API devem exigir senhas com no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e caractere especial, exibindo indicador visual de força (*Fraca*, *Média*, *Forte e Segura*).
* **RF-03 — Login Seguro com Sessão JWT HttpOnly:** O sistema deve autenticar usuários via `POST /api/auth/login`, validando o hash Bcrypt e emitindo um token JWT (`HS256`) armazenado em cookie `HttpOnly` com validade de 7 dias.
* **RF-04 — Controle de Acesso Baseado em Papéis (RBAC):** O sistema deve restringir rotas administrativas e operacionais de acordo com o papel do usuário (`ALUNO`, `CA_MEMBRO`, `PROFESSOR`, `ADMIN`) via middleware de borda (`src/middleware.ts`).
* **RF-05 — Trilha de Auditoria (Audit Logs):** Toda operação crítica (sucesso/falha de login, novo registro, baixa de estoque, aprovação de pagamento) deve ser gravada na tabela `audit_logs` com timestamp, IP, User-Agent e payload JSON.

### 4.2. Módulo Cantina Discente (*Honest Market* & Pagamento Pix)
* **RF-06 — Catálogo Digital de Produtos:** O sistema deve listar os itens disponíveis na cantina discente categorizados em `BEBIDA`, `SALGADO`, `DOCE`, `CONGELADO` e `OUTRO`, exibindo preço unitário e disponibilidade em estoque.
* **RF-07 — Carrinho e Checkout Autônomo via Pix:** O estudante deve poder selecionar múltiplos produtos no intervalo, visualizar o valor total exato da compra e gerar o código Pix Copia-e-Cola / QR Code oficial do Centro Acadêmico.
* **RF-08 — Validação Automatizada de Comprovante Pix via IA (OCR Gemini):** O sistema deve processar o comprovante de pagamento enviado pelo estudante utilizando o SDK do **Google Gemini (`gemini-2.5-flash`)**, extraindo o valor pago e o código End-to-End (E2E) para aprovar automaticamente (`APROVADO_IA`) quando o valor coincidir com o pedido ou sinalizar divergência (`DIVERGENTE` / `REQUER_REVISAO_CA`).
* **RF-09 — Controle de Estoque e Alertas de Reposição:** Ao confirmar uma transação como `PAGO`, o sistema deve deduzir a quantidade do estoque (`current_stock`) e destacar itens que atingirem o limite mínimo (`min_stock_alert`).
* **RF-10 — Histórico Pessoal de Compras:** O estudante deve poder consultar seu histórico de pedidos realizados na cantina (`/historico`), com status (`PENDENTE`, `PAGO`, `EM_ANALISE`, `CANCELADO`).
* **RF-11 — Caixinha de Sugestões de Produtos:** Os estudantes devem poder sugerir e votar em novos produtos para reposição na cantina (`canteen_suggestions`).

### 4.3. Módulo Acadêmico (Repositório Didático & Vitrine de Projetos)
* **RF-12 — Repositório Acadêmico Filtrado por Curso e Semestre:** O sistema deve disponibilizar materiais didáticos (`SLIDE`, `APOSTILA`, `CODIGO`, `DATASET`) organizados por curso (`IA` Matutino e `ESG` Noturno), semestre letivo e disciplina (`/repositorio`).
* **RF-13 — Vitrine de Projetos e TCCs:** O sistema deve oferecer um espaço (`/vitrine`) para exposição de projetos interdisciplinares, repositórios GitHub e trabalhos acadêmicos desenvolvidos pelos alunos da FATEC Rio Claro.
* **RF-14 — Resumo Inteligente e Indexação por IA:** O motor do Google Gemini deve auxiliar na geração de resumos executivos e tags temáticas para os materiais publicados no repositório acadêmico.

### 4.4. Módulo de Comunicação Institucional e Navegação
* **RF-15 — Mural de Avisos e Comunicados Oficiais:** O sistema deve exibir comunicados da Coordenação, Secretaria e Centro Acadêmico (`/avisos`) classificados por prioridade (`BAIXA`, `MEDIA`, `ALTA`, `URGENTE`), com suporte a fixação no topo (`is_pinned`) e segmentação por curso.
* **RF-16 — Hero Carrossel Interativo e Alternador de Cursos:** A página inicial (`/`) deve apresentar um carrossel dinâmico com pausa inteligente ao passar o mouse, reinício de temporizador ao navegar manualmente e alternador rápido entre os contextos de **Inteligência Artificial** e **Gestão ESG**.
* **RF-17 — Integração de Acesso Rápido ao SIGA:** O portal deve disponibilizar atalho oficial e direto para o portal SIGA Aluno do Centro Paula Souza (`https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx`).
* **RF-18 — Monitoramento de Saúde e Diagnóstico de IA:** O sistema deve expor os endpoints `GET /api/health` e `GET /api/ai/status` para monitoramento contínuo de disponibilidade do banco de dados e conectividade com o Google Gemini SDK.

---

## 5. REQUISITOS NÃO-FUNCIONAIS (RNF)

| ID | Categoria | Descrição e Métrica de Qualidade |
| :--- | :--- | :--- |
| **RNF-01** | **Segurança (Senhas)** | Nenhuma senha pode ser armazenada em texto plano; uso obrigatório de hash **Bcrypt** com custo mínimo de `10 salt rounds`. |
| **RNF-02** | **Segurança (Anti-Brute Force)** | As rotas de autenticação devem possuir **Rate Limiting** bloqueando IPs que excederem 5 tentativas consecutivas em uma janela de 60 segundos (`HTTP 429`). |
| **RNF-03** | **Segurança (OWASP Headers & XSS)** | Todas as respostas HTTP devem incluir headers de proteção (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) e sanitização de entradas contra XSS. |
| **RNF-04** | **Estabilidade Visual (Zero CLS)** | O *Cumulative Layout Shift* (CLS) na troca de slides do Hero Carrossel deve ser **0.00**, garantido por alturas mínimas padronizadas. |
| **RNF-05** | **Acessibilidade (WCAG 2.1 AA / e-MAG)** | A interface deve oferecer modo de **Alto Contraste** nativo, atributos `aria-label` em controles interativos e navegação livre com retorno universal à Home. |
| **RNF-06** | **Suporte Multiplataforma (PWA)** | O portal deve ser instalável como **Progressive Web App (PWA)** em Android, iOS e Desktop via `manifest.json` e ícones dedicados (192px e 512px). |
| **RNF-07** | **Design Simbiótico Eco-Tech** | A identidade visual deve harmonizar o Azul Tecnológico (`#0284c7` — IA) e o Verde Esmeralda (`#059669` — ESG) sobre superfícies claras de alta legibilidade. |
| **RNF-08** | **Confiabilidade de Dados (ACID)** | O banco de dados PostgreSQL no Supabase deve impedir estoque negativo (`CHECK (current_stock >= 0)`) e garantir integridade referencial nas transações. |
| **RNF-09** | **Resiliência Híbrida (Dev/CI)** | A camada de dados (`src/lib/db.ts`) e o motor de IA (`src/lib/gemini.ts`) devem suportar operação híbrida (Nuvem ou Mock determinístico) para execução offline de testes. |
| **RNF-10** | **Baixa Latência em Nuvem** | Hospedagem configurada na região de São Paulo (`gru1` na Vercel e `sa-east-1` no Supabase), mantendo tempo médio de resposta de API `< 300ms`. |
| **RNF-11** | **Qualidade de Código e Tipagem** | Projeto integralmente escrito em **TypeScript (`strict: true`)**, sem erros de compilação (`npm run typecheck`). |
| **RNF-12** | **Automação de Testes (QA)** | Cobertura de testes automatizados com **Vitest** (unitários/integração) e **Playwright** (E2E) integrados ao pipeline GitHub Actions. |

---

## 6. REGRAS DE NEGÓCIO (RN)

* **RN-01 (Domínio Institucional):** Apenas e-mails terminados em `@aluno.cps.sp.gov.br` (ou contas docentes/administrativas autorizadas) podem concluir o auto-cadastro discente.
* **RN-02 (Semestralidade Vigente):** No cadastro discente, a seleção de semestre respeita a implantação vigente dos cursos na unidade (1º ao 4º semestre), enquanto o banco de dados já comporta expansão até o 6º semestre.
* **RN-03 (Conciliação Pix por IA):** Um pedido da Cantina Discente só tem seu status alterado automaticamente para `PAGO` pela IA se o comprovante contiver um identificador válido e o valor extraído apresentar diferença menor que `R$ 0,01` em relação ao total do pedido.
* **RN-04 (Auditoria Humana de Exceções):** Comprovantes com baixa legibilidade ou divergência de valor recebem status `EM_ANALISE` (`REQUER_REVISAO_CA`), ficando disponíveis para deliberação de um usuário com papel `CA_MEMBRO` ou `ADMIN`.

---

## 7. MATRIZ DE RASTREABILIDADE (REQUISITOS × ARTEFATOS × TESTES QA)

| Requisito | Módulo / Arquivo de Implementação | Responsável | Suíte de Teste Automatizado (QA) |
| :--- | :--- | :---: | :--- |
| **RF-01, RF-02, RNF-01** | `src/app/cadastro/page.tsx`, `src/app/api/auth/register/route.ts`, `src/lib/security.ts` | Cesar / Luis | `tests/unit/security.test.ts`, `tests/e2e/portal.spec.ts` |
| **RF-03, RF-04, RNF-02** | `src/app/login/page.tsx`, `src/app/api/auth/login/route.ts`, `src/lib/auth.ts`, `src/middleware.ts` | Cesar / Luis | `scripts/test_backend.js`, `tests/unit/security.test.ts` |
| **RF-05, RF-06, RNF-08** | `database/schema.sql`, `database/seed.sql`, `src/lib/db.ts` | Cesar | `tests/unit/db_rbac.test.ts` |
| **RF-08, RF-14, RF-18** | `src/lib/gemini.ts`, `src/app/api/ai/status/route.ts`, `scripts/test_gemini.js` | **Guilherme** | `tests/unit/gemini.test.ts`, `scripts/test_gemini.js` |
| **RF-15, RF-16, RNF-04** | `src/app/page.tsx`, `src/components/layout/AppLayout.tsx`, `src/components/home/HeroVisualWidget.tsx` | Luis | `tests/e2e/portal.spec.ts`, `scripts/run_all_tests.js` |
| **RNF-09, RNF-10, RNF-12** | `vercel.json`, `.env.example`, `.github/workflows/ci-cd.yml`, `vitest.config.ts`, `playwright.config.ts` | **Guilherme** | `scripts/run_all_tests.js`, `.github/workflows/ci-cd.yml` |
