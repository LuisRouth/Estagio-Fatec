# Portal Integrado dos Estudantes — FATEC Rio Claro

Plataforma unificada para discentes e docentes dos cursos de **Inteligência Artificial (Matutino)** e **Gestão Empresarial / ESG (Noturno)** da Faculdade de Tecnologia de Rio Claro (FATEC Rio Claro — Centro Paula Souza).

Projeto desenvolvido para a disciplina de **Estágio Curricular Supervisionado** (Docente Orientador: **Prof. Orlando**).

---

## 👥 Equipe de Desenvolvimento

* 👨‍💻 **Cesar** — Arquitetura Backend, Modelagem de Banco de Dados PostgreSQL & Segurança da Informação (OWASP, JWT, Pix EMV)
* 🎨 **Luis** — Engenharia Frontend, UI/UX Design Simbiótico (IA/ESG), Acessibilidade & PWA
* 🤖 **Guilherme** — Infraestrutura DevOps (Vercel/Supabase), Inteligência Artificial (Google Gemini SDK) & Gestão de QA

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* **Node.js** v18+ ou v20+ instalado.
* Terminal (PowerShell, Bash ou CMD).

### 2. Instalação das Dependências
```bash
npm install
```

### 3. Executando o Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor iniciará em: **[http://localhost:3000](http://localhost:3000)**.

---

## 🌐 Rotas e Páginas da Aplicação

| Rota | Descrição |
| :--- | :--- |
| **`/`** | **Página Inicial:** Hero Carrossel interativo, alternador de cursos (IA & ESG), avisos fixados e atalho ao SIGA. |
| **`/login`** | **Autenticação:** Login seguro via cookie `HttpOnly` com JWT criptografado e rate limiting. |
| **`/cadastro`** | **Auto-Cadastro:** Validador de domínio institucional (`@aluno.cps.sp.gov.br`) e medidor de força de senha em tempo real. |
| **`/cantina`** | **Cantina Discente (*Honest Market*):** Catálogo de produtos, autoatendimento e pagamento autônomo via Pix. |
| **`/historico`** | **Extrato do Aluno:** Histórico de compras na cantina, status de pagamentos e comprovantes. |
| **`/repositorio`** | **Repositório Didático:** Slides, apostilas, códigos e datasets filtrados por curso e semestre. |
| **`/vitrine`** | **Vitrine de TCCs:** Galeria de projetos interdisciplinares e trabalhos de conclusão de curso. |
| **`/avisos`** | **Mural de Comunicados:** Avisos oficiais da Coordenação, Secretaria e Centro Acadêmico. |

---

## 🔑 Credenciais de Teste Pré-Configuradas (Seed)

> **Senha padrão para todos os usuários de teste:** `Fatec@2026`

| Perfil / Papel (RBAC) | Nome | E-mail de Acesso | Curso / Semestre |
| :--- | :--- | :--- | :--- |
| **Administrador (`ADMIN`)** | Cesar Administrador | `cesar.admin@aluno.cps.sp.gov.br` | IA (4º Semestre) |
| **Centro Acadêmico (`CA_MEMBRO`)** | Luis Desenvolvedor | `luis.dev@aluno.cps.sp.gov.br` | IA (4º Semestre) |
| **Centro Acadêmico (`CA_MEMBRO`)** | Guilherme DevOps | `guilherme.devops@aluno.cps.sp.gov.br` | IA (4º Semestre) |
| **Docente / Coordenador (`PROFESSOR`)** | Prof. Orlando | `orlando.docente@aluno.cps.sp.gov.br` | IA (Docente) |
| **Discente Regular (`ALUNO`)** | Mariana ESG Silva | `mariana.esg@aluno.cps.sp.gov.br` | ESG (2º Semestre) |

---

## 🧪 Como Executar os Testes Automatizados

O projeto conta com esteiras completas de testes unitários, testes de integração e diagnóstico:

```bash
# 1. Executar a esteira unificada completa (QA, DevOps, Segurança, IA e Módulos Centrais)
npm test

# 2. Executar a suíte técnica de Cesar da Sprint 2 (Pix EMV, Estoque, Checkout, Extrato e TCC)
npm run test:sprint2

# 3. Executar os testes de autenticação e criptografia da Sprint 1
npm run test:backend

# 4. Testar conectividade com o SDK do Google Gemini (OCR Pix e Diagnóstico)
npm run test:gemini

# 5. Verificação estrita de tipagem TypeScript (Zero erros)
npm run typecheck

# 6. Gerar build de produção para homologação
npm run build
```

---

## 📡 Principais Endpoints da API REST

* **Autenticação:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`
* **Cantina & Produtos:** `GET /api/canteen/products`, `POST /api/canteen/products`, `PATCH /api/canteen/products/[id]/stock`
* **Checkout & Pix Dinâmico:** `POST /api/canteen/checkout`, `POST /api/pix/generate`, `POST /api/pix/validate`
* **Histórico & Transações:** `GET /api/canteen/history`, `GET /api/canteen/transactions`, `POST /api/canteen/transactions/[id]/proof`
* **Repositório & TCC:** `GET /api/materials`, `POST /api/materials`, `POST /api/materials/upload`, `POST /api/materials/[id]/download`
* **Saúde & Diagnóstico:** `GET /api/health`, `GET /api/ai/status`

