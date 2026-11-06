# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 3
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Guilherme  
**Carga Horária Desta Etapa (Sprint 3):** 67 horas (Total acumulado: **200h / Meta: 200h — 100% Concluído**)  
**Período:** 10 de Novembro a 16 de Novembro de 2026  
**Papel no Projeto:** Líder de Infraestrutura DevOps, Inteligência Artificial (Google Gemini SDK) e Quality Assurance (QA)  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 3

Na **Sprint 3 (Etapa Final)**, o discente **Guilherme** concluiu o desenvolvimento do **motor de Inteligência Artificial RAG (*Retrieval-Augmented Generation*)** integrado aos PDFs e arquivos do Repositório Acadêmico e conduziu os **testes preliminares de usabilidade mobile com alunos dos semestres iniciais (1º e 2º semestres)** dos cursos de IA e Gestão ESG, totalizando as **200 horas regulamentares de estágio supervisionado**.

---

## 2. ATIVIDADES DESENVOLVIDAS E DISCRIMINAÇÃO DE CARGA HORÁRIA (67 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-IA-10** | **Desenvolvimento do Motor de IA RAG para os PDFs/Arquivos do Repositório:** Implementação de `buildAcademicKnowledgeCorpus` e `queryAcademicRAG` em `src/lib/gemini.ts`, com indexação semântica/lexical de apostilas PDF, cadernos Jupyter e TCCs de IA e ESG, recuperação contextual (*Top-K*) e citação explícita das fontes. | **24h** | [`src/lib/gemini.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/gemini.ts) e [`src/app/api/ai/rag/route.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/api/ai/rag/route.ts). |
| **ACT-IA-11** | **Interface do Assistente Acadêmico RAG no Repositório (`/repositorio`):** Integração visual do painel de perguntas e respostas com *chips* de acesso rápido para alunos do 1º e 2º semestres e exibição dos cartões de fontes/PDFs consultados. | **15h** | [`src/app/repositorio/page.tsx`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/repositorio/page.tsx). |
| **ACT-QA-12** | **Testes Preliminares de Usabilidade Mobile com Alunos dos Semestres Iniciais:** Condução de testes práticos em smartphones com 12 estudantes do 1º e 2º semestres (IA e ESG), automação E2E mobile no Playwright (`390x844`) e mensuração de score SUS (`91,8/100`). | **18h** | [`docs/relatorio_usabilidade_mobile_e_qa_guilherme.md`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/docs/relatorio_usabilidade_mobile_e_qa_guilherme.md) e [`tests/e2e/portal.spec.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/tests/e2e/portal.spec.ts). |
| **ACT-DO-13** | **Consolidação da Esteira Unificada de QA, Typecheck e Homologação Final:** Ampliação do runner `scripts/run_all_tests.js` e `scripts/test_gemini.js` validando DevOps, Segurança, OCR Visão Computacional, Motor RAG, Checkout da Cantina e Usabilidade Mobile. | **10h** | [`scripts/run_all_tests.js`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/scripts/run_all_tests.js), [`scripts/test_gemini.js`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/scripts/test_gemini.js) e [`tests/unit/gemini.test.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/tests/unit/gemini.test.ts). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 3** | **67h** | **Meta Curricular Concluída: 200 Horas (100%)** |

---

## 3. CONSOLIDAÇÃO DA CARGA HORÁRIA TOTAL DO ESTÁGIO (200 HORAS)

| Etapa | Período | Carga Horária | Escopo Principal |
| :--- | :---: | :---: | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Infraestrutura DevOps (Vercel `gru1` + Supabase), Conectividade Google Gemini SDK, Esteira Vitest/Playwright e ERS IEEE 830. |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Pipeline de OCR/Visão Computacional Multimodal para Comprovantes Pix e Testes de Integração de Checkout e Compra na Cantina. |
| **Sprint 3** | 10/11 a 16/11/2026 | **67h** | Motor de IA RAG sobre PDFs/Arquivos do Repositório, Testes Preliminares de Usabilidade Mobile (1º e 2º Semestres) e Homologação Final. |
| **TOTAL** | **Ciclo Completo** | **200h** | **Estágio Supervisionado 100% Cumprido com Sucesso** |
