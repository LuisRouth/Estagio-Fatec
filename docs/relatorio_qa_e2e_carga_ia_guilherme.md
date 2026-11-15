# RELATÓRIO DE EVIDÊNCIAS — DEVOPS, IA & QA (E2E, CARGA E ACURÁCIA)
**Projeto:** Portal Integrado dos Estudantes da FATEC Rio Claro  
**Responsável:** Guilherme (DevOps, IA & QA)  
**Data da Execução:** 15/11/2026  

---

## 1. Resumo Executivo

| Pilar Validado | Ferramenta / Script | Resultado Observado | Status |
| :--- | :--- | :--- | :---: |
| **Esteira Unificada QA** | `npm test` (`scripts/run_all_tests.js`) | **54/54** verificações aprovadas | ✅ |
| **Conectividade & OCR Gemini** | `npm run test:gemini` (`scripts/test_gemini.js`) | **10/10** verificações aprovadas (`MOCK_FALLBACK`) | ✅ |
| **Tipagem Estática** | `npm run typecheck` (`tsc --noEmit`) | **0 erros** | ✅ |
| **Build de Produção** | `npm run build` (`next build`) | **50 páginas/rotas** compiladas | ✅ |
| **Acurácia Motor IA RAG** | `npx vitest run tests/unit/rag_engine.test.ts` | **25/25** testes aprovados (**100%**) | ✅ |
| **Acurácia OCR Pix & Gemini** | `npx vitest run tests/unit/gemini.test.ts` | **7/7** testes aprovados (**100%**) | ✅ |
| **Suíte Unitária Completa** | `npm run test:unit` (`vitest run`) | **55/57** aprovados (2 falhas em testes legados não-IA) | ⚠️ |
| **Teste de Estresse / Carga** | `load_test.mjs` (`next start`, `USE_MOCK_DB=true`) | **890/890** reqs `HTTP 200` (**0% erro**) | ✅ |
| **Testes E2E (Playwright)** | `npx playwright test --project=chromium-desktop` | **4/7** aprovados (3 falhas: 2 seletores + 1 timeout Supabase) | ⚠️ |

---

## 2. Resultados do Teste de Estresse / Carga (Acessos Simultâneos)

Executado contra o servidor de produção (`next start`) com `USE_MOCK_DB=true` e `GEMINI_FALLBACK_MOCK=true`:

| Cenário | Concorrência | Total Reqs | RPS (req/s) | p50 | p95 | p99 | Status HTTP |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1. Catálogo Cantina (`GET /api/canteen/products`) | 50 alunos | 250 | **81,14** | 362,3 ms | 1723,0 ms | 1783,5 ms | `200`: 250 |
| 2. Repositório (`GET /api/materials`) | 50 alunos | 250 | **166,51** | 266,4 ms | 343,4 ms | 377,5 ms | `200`: 250 |
| 3. Motor IA RAG (`POST /api/ai/rag`) | 30 alunos | 90 | **94,88** | 250,3 ms | 409,6 ms | 438,4 ms | `200`: 90 |
| 4. Pico Extremo (`GET /api/health`) | 100 alunos | 300 | **161,53** | 394,3 ms | 1226,9 ms | 1247,0 ms | `200`: 300 |

---

## 3. Validação de Acurácia da IA (RAG + OCR Pix)

* **Motor RAG (`tests/unit/rag_engine.test.ts` — 25/25):**
  * Validação de 100% dos códigos da matriz curricular oficial (`ILP-113`, `ING-297/298`, `IBD-040/041`, etc.) sem códigos inventados.
  * Bloqueio correto de domínios fora de escopo (Construção Civil, Medicina/Odontologia) sem exibição de cards falsos.
  * Separação estrita entre disciplinas dos cursos de **IA** e **Gestão ESG**.
* **Leitura de Comprovantes Pix (`tests/unit/gemini.test.ts` — 7/7):**
  * Aprovação automática (`APROVADO_IA`) quando o valor coincide com o pedido e extração do End-to-End ID.
  * Processamento multimodal Base64 (`GEMINI_VISION_MULTIMODAL`).
  * Detecção de divergência de valor (`DIVERGENTE`) e encaminhamento de ilegíveis (`REQUER_REVISAO_CA`).

---

## 4. Achados e Pontos de Atenção Identificados (Sem Modificar Motor IA ou Estrutura)

1. **Timeout no Banco Cloud durante E2E:** Com `USE_MOCK_DB=false` no `.env.local`, o `POST /api/auth/login` falhou por timeout ao consultar o PostgreSQL/Supabase (`src/lib/db.ts:884`).
2. **Divergências em 2 Testes Unitários Existentes:**
   * `tests/unit/canteen_pix.test.ts`: espera `FATTESTE123` no payload Pix, porém `src/lib/pix.ts` gera `62070503***`.
   * `tests/unit/db_rbac.test.ts`: busca `guilherme.devops@aluno.cps.sp.gov.br`, porém `src/lib/db.ts` cadastra `guilherme.dev@aluno.cps.sp.gov.br`.
3. **Seletores E2E Legados em `tests/e2e/portal.spec.ts`:**
   * Teste 1 (`getByRole('button', { name: /Gestão ESG/i })`) encontra 2 botões na Home (strict mode).
   * Teste 2 espera o texto `Utilize seu e-mail institucional oficial` no login.
4. **Rate Limiting em `/api/ai/rag`:** A rota não possui `checkRateLimit()` configurado, diferentemente de `/api/canteen/checkout` e `/api/auth/login`.
