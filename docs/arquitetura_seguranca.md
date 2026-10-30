# ARQUITETURA TÉCNICA, SEGURANÇA E HOSPEDAGEM
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Disciplina:** Estágio Curricular Supervisionado (Prof. Orlando)  
**Engenheiro Responsável:** Cesar (Backend, Banco de Dados & Segurança)  
**Data:** 27/10/2026 — Sprint 1  

---

## 1. ESCOLHA DE TECNOLOGIAS E JUSTIFICATIVAS TÉCNICAS

### A. Linguagem de Programação: TypeScript (Node.js 24 LTS)
* **Por que TypeScript?** Adiciona tipagem estática e interfaces rigorosas sobre o JavaScript, prevenindo bugs em tempo de compilação. Permite que os contratos de API (`src/lib/types/index.ts`) sejam compartilhados diretamente entre Cesar (Backend), Luis (Frontend) e Guilherme (IA/QA), eliminando desalinhamentos de dados.
* **Manutenibilidade:** Código autodocumentado, facilidade de refatoração e suporte nativo nas principais IDEs.

### B. Framework: Next.js (App Router / Route Handlers)
* **Padrão de Arquitetura:** Backend modular orientado a Route Handlers com suporte nativo a Middleware de borda (Edge).
* **Interoperabilidade:** Facilita a integração do frontend desenvolvido por Luis no mesmo repositório ou consumo via chamadas REST padrão.

### C. Banco de Dados: PostgreSQL
* **Justificativa:** Banco de dados relacional líder de mercado, robusto e compatível com propriedades ACID (Atomicidade, Consistência, Isolamento, Durabilidade). Essencial para a integridade de transações financeiras e controle de estoque da cantina discente (autoatendimento discente).
* **Extensões Utilizadas:** `pgcrypto` para geração nativa de UUIDv4.
* **Modo Híbrido (Desenvolvimento Cooperativo):** Foi implementada uma camada de abstração em `src/lib/db.ts` que permite operar com PostgreSQL nativo ou em memória (*Mock Seed*) para que a equipe execute os testes localmente sem dependência de infraestrutura externa imediata.

---

## 2. PILARES DE SEGURANÇA DA INFORMAÇÃO

O sistema foi desenhado seguindo as diretrizes OWASP (*Open Web Application Security Project*):

1. **Criptografia de Senhas (Bcrypt):**
   * Nenhuma senha trafega em texto plano no banco de dados.
   * Utilização da biblioteca `bcryptjs` com custo de salt 10 (fator de trabalho balanceado entre segurança e desempenho).
2. **Tokens JWT com Criptografia WebCrypto (Jose):**
   * Emissão de JSON Web Tokens assinados com chave secreta de alta entropia (HS256).
   * Transporte via **Cookies HttpOnly** (`SameSite=Lax`, `Secure` em produção), impedindo que códigos maliciosos JavaScript (XSS) tenham acesso ao token.
3. **Controle de Acesso Baseado em Papéis (RBAC - Role-Based Access Control):**
   * Níveis de permissão rigorosamente separados em: `ALUNO`, `CA_MEMBRO`, `PROFESSOR` e `ADMIN`.
   * Interceptação automática de rotas via `src/middleware.ts`.
4. **Proteção contra Força Bruta (Rate Limiting):**
   * Implementado em `src/lib/security.ts` com limite de 5 tentativas consecutivas de login por IP a cada 60 segundos.
5. **Sanitização de Dados e Validação de Esquemas (Zod):**
   * Validação rigorosa de todos os corpos de requisição na camada de entrada antes de qualquer processamento de negócio.
6. **Headers de Segurança HTTP (OWASP):**
   * `X-Content-Type-Options: nosniff`
   * `X-Frame-Options: DENY` (anti-Clickjacking)
   * `X-XSS-Protection: 1; mode=block`
   * `Referrer-Policy: strict-origin-when-cross-origin`

---

## 3. PLANO DE HOSPEDAGEM E INFRAESTRUTURA EM NUVEM

* **Camada de Aplicação (Backend e Frontend):** **Vercel**
  * Suporte nativo a Next.js e TypeScript.
  * Certificados SSL automáticos (HTTPS obrigatório).
  * Escalabilidade automática sem servidor (Serverless Functions).
* **Camada de Banco de Dados:** **Supabase Cloud (PostgreSQL)**
  * Instância PostgreSQL em nuvem de alta disponibilidade.
  * Backups automáticos diários.
  * Painel administrativo integrado para auditoria da comissão discente.
* **Ambiente de Versionamento:** **GitHub + GitHub Desktop**
  * Fluxo com commits manuais realizados pelos integrantes para preservar rastreabilidade acadêmica.
