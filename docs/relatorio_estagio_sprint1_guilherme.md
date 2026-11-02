# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Guilherme  
**Carga Horária Desta Etapa (Sprint 1):** 66 horas (Total acumulado: 66h / Meta global: 200h)  
**Período de Execução:** 27 de Outubro a 02 de Novembro de 2026  
**Papel no Projeto:** Líder de Inteligência Artificial (Google Gemini SDK), Engenharia DevOps (Vercel & Supabase) e Garantia de Qualidade / QA (Vitest & Playwright)  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 1

O presente relatório técnico-acadêmico documenta as atividades executadas pelo discente **Guilherme** durante a **Sprint 1** do projeto **Portal Integrado da FATEC Rio Claro**, desenvolvido em equipe com os discentes **Cesar** (Backend, Banco de Dados & Segurança) e **Luis** (Frontend, UI/UX & PWA) sob orientação do **Prof. Orlando**.

Nesta primeira etapa (equivalente às primeiras **66 horas** do plano de 200 horas de estágio supervisionado), o trabalho concentrou-se em quatro pilares fundamentais para a sustentabilidade do ciclo de vida do software:
1. **Engenharia DevOps e Arquitetura de Hospedagem em Nuvem:** Parametrização do ambiente de deploy contínuo na **Vercel** (região `gru1` — São Paulo) e integração com o banco de dados **Supabase Cloud PostgreSQL** (via *Supavisor Transaction Pooler* na porta `6543` e conexão direta na porta `5432`);
2. **Integração e Conectividade com o SDK do Google Gemini:** Implementação do módulo de Inteligência Artificial (`src/lib/gemini.ts`), validação de chaves de API, endpoint de diagnóstico (`/api/ai/health`) e motor de pré-validação estruturada de comprovantes Pix (OCR da Cantina Discente *Honest Market*);
3. **Definição e Automação da Esteira de Testes (QA Pipeline):** Configuração dos frameworks **Vitest** (testes unitários e de contratos), **Playwright** (testes End-to-End multiplataforma Desktop e Mobile PWA), script integrador (`scripts/test_qa_pipeline.js`) e pipeline CI/CD no GitHub Actions (`.github/workflows/ci-qa.yml`);
4. **Engenharia de Requisitos e Gestão Ágil da Equipe:** Elaboração do **Documento de Especificação de Requisitos de Software (ERS — Padrão IEEE 830)** e estruturação completa do **Quadro Trello Kanban** das 3 Sprints do projeto.

---

## 2. DISCRIMINAÇÃO DETALHADA DAS ATIVIDADES E CARGA HORÁRIA (66 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-IA-01** | **Configuração de Hospedagem e Variáveis de Ambiente (Vercel & Supabase):** Definição da topologia Serverless em São Paulo (`gru1`), cabeçalhos de segurança de borda (OWASP), mapeamento de variáveis de ambiente para produção/preview e configuração de *Connection Pooling* do Supabase (`DATABASE_URL` e `DIRECT_URL`). | **14h** | [`vercel.json`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/vercel.json), [`.env.example`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/.env.example) e [`docs/devops_hospedagem_vercel_supabase.md`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/docs/devops_hospedagem_vercel_supabase.md). |
| **ACT-IA-02** | **Integração e Teste de Conectividade com o SDK Google Gemini:** Desenvolvimento do serviço `src/lib/gemini.ts` com suporte ao modelo `gemini-2.5-flash`, validação de formato de chaves (`AIza*`), fallback híbrido (`USE_MOCK_AI=true`) para desenvolvimento offline, rota `/api/ai/health` e contrato de análise OCR de comprovantes Pix. | **16h** | [`src/lib/gemini.ts`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/src/lib/gemini.ts), [`src/app/api/ai/health/route.ts`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/src/app/api/ai/health/route.ts) e [`scripts/test_gemini.js`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/scripts/test_gemini.js). |
| **ACT-IA-03** | **Arquitetura da Esteira de Testes Automatizados (Vitest & Playwright):** Configuração do Vitest para testes unitários de segurança/IA e do Playwright para testes E2E em navegadores Desktop e dispositivos móveis Android PWA (Pixel 7). | **14h** | [`vitest.config.ts`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/vitest.config.ts), [`playwright.config.ts`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/playwright.config.ts), [`tests/unit/`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/tests/unit/) e [`tests/e2e/portal.spec.ts`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/tests/e2e/portal.spec.ts). |
| **ACT-IA-04** | **Automação CI/CD e Runner de Regressão QA:** Criação do workflow de Integração Contínua no GitHub Actions e do executor unificado de auditoria de qualidade, criptografia, rotas e manifesto PWA. | **8h** | [`.github/workflows/ci-qa.yml`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/.github/workflows/ci-qa.yml) e [`scripts/test_qa_pipeline.js`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/scripts/test_qa_pipeline.js). |
| **ACT-IA-05** | **Documento de Especificação de Requisitos (ERS) e Quadro Trello:** Levantamento formal dos 14 Requisitos Funcionais, 8 Requisitos Não-Funcionais, 4 Regras de Negócio e modelagem completa dos cartões, etiquetas e checklists das 3 Sprints no Trello. | **14h** | [`docs/especificacao_requisitos_trello.md`](file:///C:/Users/guilh/Downloads/Estagio-Fatec-main/Estagio-Fatec-main/docs/especificacao_requisitos_trello.md). |
| **TOTAL** | **Carga Horária Total Cumprida na Sprint 1** | **66h** | **Meta Parcial Atingida (66h / 200h)** |

---

## 3. RESULTADOS TÉCNICOS ALCANÇADOS NA SPRINT 1

1. **Prontidão para Deploy Serverless e Banco em Nuvem:** O projeto conta com configuração declarativa na Vercel (`vercel.json`) e separação entre strings de conexão transacionais (porta `6543`) e de migração (porta `5432`) do Supabase, prevenindo gargalos de conexão em produção.
2. **Motor Google Gemini Resiliente e Testável:** Assim como a camada de banco de dados criada pelo Cesar, o módulo de IA (`src/lib/gemini.ts`) opera em **Modo Híbrido** (`LIVE_GEMINI_API` quando a chave `GEMINI_API_KEY` está configurada ou `HYBRID_MOCK_AI` para testes locais/CI), permitindo que toda a equipe valide fluxos de OCR da cantina sem interrupções.
3. **Pirâmide de Testes Automatizados:** Cobertura em três níveis — testes unitários (Segurança OWASP, Bcrypt, JWT, Rate Limit e Gemini SDK), auditoria de infraestrutura DevOps e testes E2E Playwright verificando a estabilidade visual e o manifesto PWA desenvolvido pelo Luis.
4. **Governança e Rastreabilidade Acadêmica:** Todos os requisitos extraídos da pesquisa com os 38 alunos de IA e ESG foram formalizados em padrão IEEE 830 e desdobrados em cartões rastreáveis no Quadro Trello da equipe.

---

## 4. PRÓXIMOS PASSOS (SPRINT 2 — 03/11 A 09/11/2026)

Na Sprint 2, o discente Guilherme atuará nas seguintes frentes:
* Implementação do endpoint `/api/ai/validate-receipt` com visão computacional multimodal do Google Gemini (`gemini-2.5-flash`) para leitura direta de imagens e PDFs de comprovantes Pix;
* Configuração dos buckets seguros no Supabase Storage para armazenamento de comprovantes e apostilas acadêmicas;
* Expansão da suíte E2E no Playwright para cobrir o fluxo completo de compra na Cantina *Honest Market* em integração com o backend do Cesar e o frontend do Luis.
