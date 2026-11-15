# RELATÓRIO INDIVIDUAL CONSOLIDADO DE ESTÁGIO SUPERVISIONADO (200H) — CESAR
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Cesar  
**Carga Horária Total Comprovada:** **200 horas** (Sprint 1: 66h | Sprint 2: 67h | Sprint 3: 67h)  
**Período Total:** 27 de Outubro a 16 de Novembro de 2026  
**Papel no Projeto:** Líder de Arquitetura Backend, Banco de Dados PostgreSQL e Segurança da Informação  

---

## 1. SÍNTESE EXECUTIVA
O discente **Cesar** atuou na arquitetura backend, modelagem de dados relacional (PostgreSQL/Supabase), segurança da informação (OWASP Top 10) e integração financeira (Pix EMV padrão Banco Central) do *Portal Integrado dos Estudantes da FATEC Rio Claro*, atendendo às turmas de **Inteligência Artificial (Matutino)** e **Gestão ESG (Noturno)**.

---

## 2. QUADRO CONSOLIDADO DE HORAS E EVIDÊNCIAS TÉCNICAS (200H)

| Sprint | Período | Horas | Atividades Executadas | Evidências Técnicas no Repositório |
| :--- | :---: | :---: | :--- | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Modelagem DER (8 tabelas), DDL PostgreSQL + Seed, Motor de Autenticação Bcrypt + JWT (`jose`) em cookies HttpOnly, Middleware RBAC, Endpoints de Auth/Health e Testes Backend. | [`database/der.md`](../database/der.md), [`database/schema.sql`](../database/schema.sql), [`database/seed.sql`](../database/seed.sql), [`src/lib/auth.ts`](../src/lib/auth.ts), [`src/middleware.ts`](../src/middleware.ts), [`scripts/test_backend.js`](../scripts/test_backend.js), [`docs/relatorio_estagio_sprint1_cesar.md`](./relatorio_estagio_sprint1_cesar.md) |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | CRUD do Catálogo da Cantina e controle de estoque não-negativo, Motor Pix Dinâmico EMV (TLV + CRC-16/CCITT-FALSE), Checkout ACID, Histórico/Extrato do Aluno e APIs do Repositório/TCC/Avisos. | [`src/lib/pix.ts`](../src/lib/pix.ts), [`src/app/api/canteen/`](../src/app/api/canteen/), [`src/app/api/pix/`](../src/app/api/pix/), [`src/app/api/materials/`](../src/app/api/materials/), [`src/app/api/announcements/`](../src/app/api/announcements/), [`scripts/test_sprint2_cesar.js`](../scripts/test_sprint2_cesar.js), [`docs/relatorio_estagio_sprint2_cesar.md`](./relatorio_estagio_sprint2_cesar.md) |
| **Sprint 3** | 10/11 a 16/11/2026 | **67h** | Endpoints Analíticos do Centro Acadêmico (Financeiro, Produtos, Auditoria e Exportação CSV), Hardening XSS/SQLi, Rate Limiting por rota, Índices SQL (`optimization_indexes.sql`), Análise `EXPLAIN ANALYZE` e Manual Técnico. | [`src/app/api/ca/analytics/`](../src/app/api/ca/analytics/), [`src/lib/security.ts`](../src/lib/security.ts), [`database/optimization_indexes.sql`](../database/optimization_indexes.sql), [`docs/analise_planos_execucao_explain.md`](./analise_planos_execucao_explain.md), [`docs/manual_tecnico_backend_db.md`](./manual_tecnico_backend_db.md), [`scripts/test_sprint3_cesar.js`](../scripts/test_sprint3_cesar.js), [`docs/relatorio_estagio_sprint3_cesar.md`](./relatorio_estagio_sprint3_cesar.md) |
| **TOTAL** | **27/10 a 16/11/2026** | **200h** | **100% da carga horária cumprida** | **Suítes `test:backend`, `test:sprint2`, `test:sprint3` e `tests/unit/security.test.ts`** |

---

## 3. DECLARAÇÃO DE CONCLUSÃO E ASSINATURAS
* **Discente:** Cesar — *Data: ___/___/2026*  
* **Docente Orientador:** Prof. Orlando — *Data: ___/___/2026*  
