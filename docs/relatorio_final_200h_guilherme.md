# RELATÓRIO INDIVIDUAL CONSOLIDADO DE ESTÁGIO SUPERVISIONADO (200H) — GUILHERME
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Guilherme  
**Carga Horária Total Comprovada:** **200 horas** (Sprint 1: 66h | Sprint 2: 67h | Sprint 3: 67h)  
**Período Total:** 27 de Outubro a 16 de Novembro de 2026  
**Papel no Projeto:** Líder de Infraestrutura DevOps (Vercel/Supabase), Inteligência Artificial (Google Gemini SDK) e Quality Assurance (QA)  

---

## 1. SÍNTESE EXECUTIVA
O discente **Guilherme** conduziu a infraestrutura DevOps (Vercel região `gru1`, Supabase e CI/CD GitHub Actions), o desenvolvimento das capacidades de Inteligência Artificial (OCR/Visão Computacional de comprovantes Pix e Motor RAG "Zero Alucinação" ancorado na matriz curricular) e a garantia de qualidade (Vitest, Playwright E2E, testes de carga/estresse e documentação ERS/Trello).

---

## 2. QUADRO CONSOLIDADO DE HORAS E EVIDÊNCIAS TÉCNICAS (200H)

| Sprint | Período | Horas | Atividades Executadas | Evidências Técnicas no Repositório |
| :--- | :---: | :---: | :--- | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Configuração Vercel + Supabase + `.env.example`, Conectividade Google Gemini SDK, Esteira Vitest/Playwright, CI/CD GitHub Actions, Especificação ERS (IEEE 830) e Quadro Trello. | [`vercel.json`](../vercel.json), [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml), [`.env.example`](../.env.example), [`docs/devops_vercel_supabase.md`](./devops_vercel_supabase.md), [`docs/especificacao_requisitos.md`](./especificacao_requisitos.md), [`docs/quadro_trello_equipe.md`](./quadro_trello_equipe.md), [`docs/relatorio_estagio_sprint1_guilherme.md`](./relatorio_estagio_sprint1_guilherme.md) |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Pipeline OCR/Visão Computacional Multimodal para Comprovantes Pix (`analyzePixReceiptPipeline`), integração com `/api/canteen/transactions/[id]/proof` e testes de integração de checkout da cantina. | [`src/lib/gemini.ts`](../src/lib/gemini.ts), [`src/app/api/ai/status/route.ts`](../src/app/api/ai/status/route.ts), [`tests/unit/canteen_checkout_integration.test.ts`](../tests/unit/canteen_checkout_integration.test.ts), [`tests/unit/gemini.test.ts`](../tests/unit/gemini.test.ts), [`docs/relatorio_estagio_sprint2_guilherme.md`](./relatorio_estagio_sprint2_guilherme.md) |
| **Sprint 3** | 10/11 a 16/11/2026 | **67h** | Motor IA RAG ("Zero Alucinação") sobre o acervo e matriz curricular (`src/lib/rag-engine.ts`), Testes de Usabilidade Mobile (`390x844`), Bateria E2E completa (Compra e Estudo), Teste de Estresse/Carga simultânea e Validação de Acurácia IA/OCR. | [`src/lib/rag-engine.ts`](../src/lib/rag-engine.ts), [`src/app/api/ai/rag/route.ts`](../src/app/api/ai/rag/route.ts), [`docs/motor_rag_zero_alucinacao.md`](./motor_rag_zero_alucinacao.md), [`tests/unit/rag_engine.test.ts`](../tests/unit/rag_engine.test.ts), [`tests/e2e/portal.spec.ts`](../tests/e2e/portal.spec.ts), [`docs/relatorio_usabilidade_mobile_e_qa_guilherme.md`](./relatorio_usabilidade_mobile_e_qa_guilherme.md), [`docs/relatorio_estagio_sprint3_guilherme.md`](./relatorio_estagio_sprint3_guilherme.md) |
| **TOTAL** | **27/10 a 16/11/2026** | **200h** | **100% da carga horária cumprida** | **Esteira `run_all_tests.js` (54/54), `test_gemini.js` (10/10), `rag_engine.test.ts` (25/25), `gemini.test.ts` (7/7), E2E Playwright e Teste de Carga** |

---

## 3. DECLARAÇÃO DE CONCLUSÃO E ASSINATURAS
* **Discente:** Guilherme — *Data: ___/___/2026*  
* **Docente Orientador:** Prof. Orlando — *Data: ___/___/2026*  
