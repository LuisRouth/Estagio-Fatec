# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Guilherme  
**Carga Horária Desta Etapa (Sprint 1):** 66 horas (Total acumulado: 66h / Meta: 200h)  
**Período:** 27 de Outubro a 02 de Novembro de 2026  
**Papel no Projeto:** Líder de Infraestrutura DevOps, Inteligência Artificial (Google Gemini SDK), Quality Assurance (QA) e Engenharia de Requisitos  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 1

O presente relatório técnico-acadêmico documenta as atividades de engenharia de software, infraestrutura em nuvem, inteligência artificial e garantia de qualidade executadas pelo discente **Guilherme** durante a **Sprint 1** do projeto institucional do **Portal Integrado da FATEC Rio Claro**.

Em sinergia direta com a arquitetura de backend e segurança desenvolvida por **Cesar** e a engenharia de interface multiplataforma construída por **Luis**, o foco desta etapa consistiu em estabelecer:
1. A **infraestrutura DevOps e preparação de nuvem** na **Vercel** (região `gru1` São Paulo) e **Supabase Cloud PostgreSQL** (`sa-east-1`), incluindo o pipeline de Integração Contínua (CI/CD) via GitHub Actions;
2. A **integração e validação de conectividade com o SDK do Google Gemini (`gemini-2.5-flash`)**, preparando o motor de visão computacional/OCR para auditoria automatizada de comprovantes Pix da Cantina Discente (*Honest Market*);
3. A **esteira de testes automatizados (Vitest e Playwright)** cobrindo testes unitários, de integração e End-to-End (E2E);
4. A formalização do **Documento de Especificação de Requisitos de Software (ERS / IEEE 830)** e a estruturação do **Quadro Trello Ágil (Scrum/Kanban)** da equipe.

---

## 2. ATIVIDADES DESENVOLVIDAS E DISCRIMINAÇÃO DE CARGA HORÁRIA (66 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-QA-01** | **Engenharia de Requisitos e Mapeamento de Regras de Negócio (ERS):** Consolidação das 38 respostas do formulário discente dos cursos de IA (Matutino) e Gestão ESG (Noturno) em 18 Requisitos Funcionais (RF-01 a RF-18), 12 Requisitos Não-Funcionais (RNF-01 a RNF-12), Regras de Negócio e Matriz de Rastreabilidade. | **12h** | [`docs/especificacao_requisitos.md`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/docs/especificacao_requisitos.md). |
| **ACT-QA-02** | **Planejamento Ágil e Estruturação do Quadro Trello da Equipe:** Criação das raias Kanban, etiquetas por especialidade, distribuição das 3 Sprints (200h por integrante) e checklists rastreáveis para Cesar, Luis e Guilherme. | **6h** | [`docs/quadro_trello_equipe.md`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/docs/quadro_trello_equipe.md). |
| **ACT-DO-03** | **Configuração de Hospedagem Cloud (Vercel + Supabase) e Variáveis de Ambiente:** Definição de [`vercel.json`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/vercel.json) (região `gru1`, headers OWASP e timeouts serverless), padronização de segredos em [`.env.example`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/.env.example) (Connection Pooler Supavisor porta `6543` e Direct porta `5432`) e restauração dos contratos globais em [`src/lib/types/index.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/types/index.ts). | **14h** | [`.env.example`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/.env.example), [`vercel.json`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/vercel.json) e [`docs/devops_vercel_supabase.md`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/docs/devops_vercel_supabase.md). |
| **ACT-IA-04** | **Integração com o SDK do Google Gemini e Motor Preliminar de OCR Pix:** Implementação do serviço [`src/lib/gemini.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/gemini.ts), rota de diagnóstico `GET/POST /api/ai/status` e script de validação de conectividade e extração de comprovantes Pix (`APROVADO_IA`, `DIVERGENTE`, `REQUER_REVISAO_CA`). | **16h** | [`src/lib/gemini.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/gemini.ts), [`src/app/api/ai/status/route.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/api/ai/status/route.ts) e [`scripts/test_gemini.js`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/scripts/test_gemini.js). |
| **ACT-QA-05** | **Definição da Esteira de Testes Automatizados (Vitest, Playwright e CI/CD):** Configuração do Vitest para testes unitários/integração, Playwright para testes E2E multi-dispositivo, runner unificado de QA e pipeline automatizado no GitHub Actions. | **18h** | [`vitest.config.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/vitest.config.ts), [`playwright.config.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/playwright.config.ts), [`tests/`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/tests/), [`scripts/run_all_tests.js`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/scripts/run_all_tests.js) e [`.github/workflows/ci-cd.yml`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/.github/workflows/ci-cd.yml). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 1** | **66h** | **Meta Parcial Atingida (66h / 200h)** |

---

## 3. RESULTADOS TÉCNICOS ALCANÇADOS

1. **Ambiente Cloud Padronizado (Vercel + Supabase):** Infraestrutura documentada e parametrizada para operação híbrida (desenvolvimento local sem bloqueios via Mock e produção PostgreSQL ACID com Connection Pooling na região de São Paulo).
2. **Conectividade Google Gemini SDK Validada:** O portal conta com integração estruturada ao modelo `gemini-2.5-flash`, endpoint de verificação de saúde (`/api/ai/status`) e lógica de conciliação de comprovantes Pix da Cantina Discente.
3. **Esteira de Qualidade 100% Automatizada:** As suítes de testes validam regras de segurança OWASP, emissão de tokens JWT, conectividade e OCR de IA, integridade de rotas e fluxos de interface (Vitest + Playwright + GitHub Actions).
4. **Governança e Rastreabilidade de Engenharia:** Todos os requisitos levantados com os 38 estudantes de IA e Gestão ESG estão formalmente mapeados a artefatos de código, casos de teste e cartões no Quadro Trello da equipe.

---

## 4. PRÓXIMOS PASSOS (SPRINT 2 — 03/11 A 09/11/2026)

Na Sprint 2, o discente Guilherme atuará nas seguintes frentes:
* Integração do motor OCR multimodal do Google Gemini com o fluxo real de upload de comprovantes Pix na tela da Cantina Discente;
* Ampliação da cobertura de testes E2E no Playwright para o checkout completo de compras e filtros do Repositório Acadêmico;
* Acompanhamento das métricas de deploy contínuo e latência dos endpoints na Vercel e Supabase.
