# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 2
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Guilherme  
**Carga Horária Desta Etapa (Sprint 2):** 67 horas (Total acumulado: 133h / Meta: 200h)  
**Período:** 03 de Novembro a 09 de Novembro de 2026  
**Papel no Projeto:** Líder de Infraestrutura DevOps, Inteligência Artificial (Google Gemini SDK) e Quality Assurance (QA)  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 2

Durante a **Sprint 2**, o discente **Guilherme** desenvolveu o **pipeline de OCR e Visão Computacional multimodal** para conferência automática de comprovantes Pix na Cantina Discente (*Honest Market*) e escreveu a **suíte de testes de integração para o fluxo completo de checkout e compra**, garantindo sinergia total com o backend de **Cesar** e o frontend de **Luis**.

---

## 2. ATIVIDADES DESENVOLVIDAS E DISCRIMINAÇÃO DE CARGA HORÁRIA (67 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-IA-06** | **Pipeline de OCR / Visão Computacional Multimodal para Comprovantes Pix:** Implementação de `analyzePixReceiptPipeline` e `parseBase64ImageInput` em `src/lib/gemini.ts`, suportando imagens Base64 (`inlineData` no Gemini Vision) e texto extraído para conferir automaticamente valor, data, recebedor e código E2E BACEN. | **22h** | [`src/lib/gemini.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/gemini.ts) e [`src/lib/types/index.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/lib/types/index.ts). |
| **ACT-IA-07** | **Integração End-to-End do OCR no Endpoint de Comprovantes e Modal da Cantina:** Evolução da rota `POST /api/canteen/transactions/[id]/proof` e do modal de checkout em `src/app/cantina/page.tsx` para aprovar automaticamente transações íntegras (`APROVADO_IA` -> `PAGO`, RN-03) ou reter divergências em `EM_ANALISE` (RN-04). | **18h** | [`src/app/api/canteen/transactions/[id]/proof/route.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/api/canteen/transactions/%5Bid%5D/proof/route.ts) e [`src/app/cantina/page.tsx`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/cantina/page.tsx). |
| **ACT-QA-08** | **Testes de Integração para o Fluxo de Checkout e Compra na Cantina:** Construção da suíte `tests/unit/canteen_checkout_integration.test.ts` cobrindo geração Pix EMV, baixa atômica de estoque, validação OCR/Visão de comprovante, transição para `PAGO`/`EM_ANALISE`, estorno de estoque em cancelamento e extrato em `/historico`. | **17h** | [`tests/unit/canteen_checkout_integration.test.ts`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/tests/unit/canteen_checkout_integration.test.ts). |
| **ACT-DO-09** | **Auditoria de Contratos de Integração Frontend-Backend e CI/CD:** Harmonização de tipos e payloads entre as rotas de extrato (`/api/canteen/history` e `src/app/historico/page.tsx`) e contadores do repositório (`src/app/repositorio/page.tsx`). | **10h** | [`src/app/historico/page.tsx`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/src/app/historico/page.tsx) e [`scripts/run_all_tests.js`](file:///c:/Users/guilh/Documents/GitHub/Estagio-Fatec/scripts/run_all_tests.js). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 2** | **67h** | **Total Acumulado: 133h / Meta: 200h (66,5%)** |
