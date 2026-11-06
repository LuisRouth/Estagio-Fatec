# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 3
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Cesar  
**Carga Horária Desta Etapa (Sprint 3):** 67 horas (Total acumulado: **200h / Meta: 200h — 100% Concluído**)  
**Período:** 10 de Novembro a 16 de Novembro de 2026  
**Papel no Projeto:** Líder de Arquitetura Backend, Banco de Dados e Segurança da Informação  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 3

O presente relatório documenta as atividades de engenharia de software desenvolvidas pelo discente **Cesar** durante a **Sprint 3 (Etapa Final)** do projeto do *Portal Integrado da FATEC Rio Claro*. O foco desta fase foi consolidar a maturidade da plataforma nos pilares de **Business Intelligence (Analytics), Alta Performance de Banco de Dados, Hardening de Segurança OWASP e Documentação Técnica de Engenharia**, atingindo a meta curricular de **200 horas de estágio supervisionado**.

---

## 2. DISCRIMINAÇÃO DE ATIVIDADES E CARGA HORÁRIA (67 HORAS)

| ID | Atividade Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-13** | **Endpoints Analíticos do Centro Acadêmico (BI & Finanças):** Implementação das rotas `/api/ca/analytics/financial`, `/api/ca/analytics/products`, `/api/ca/analytics/audit` e `/api/ca/analytics/export` com cálculo de receita agregada, ticket médio, taxa de conversão de pagamentos e ranking de itens mais vendidos. | **16h** | Diretório [`src/app/api/ca/analytics/`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/ca/analytics/) e [`src/lib/db.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/db.ts). |
| **ACT-14** | **Exportação Contábil e Prestação de Contas da Cantina:** Desenvolvimento do serviço de exportação de dados tabulares em formato CSV em conformidade com as diretrizes do Centro Acadêmico da FATEC, contendo metadados de compra, itens discriminados e status de liquidação Pix. | **8h** | Rota [`/api/ca/analytics/export`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/ca/analytics/export/route.ts). |
| **ACT-15** | **Hardening de Segurança OWASP, Anti-SQLi e Sanitização XSS:** Refatoração da biblioteca de segurança com sanitização profunda recursiva de objetos, prevenção de wildcard DoS em buscas SQL e reforço das políticas de Content-Security-Policy (CSP) e cabeçalhos de proteção. | **12h** | [`src/lib/security.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/security.ts). |
| **ACT-16** | **Implementação de Rate Limiting por Tipo de Operação:** Configuração de controle de tráfego com janelas temporais específicas para login (5 req/min), checkout da cantina (10 req/min), uploads de arquivos (5 req/min) e endpoints analíticos com resposta `HTTP 429`. | **10h** | Rotas de API e [`src/lib/security.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/security.ts). |
| **ACT-17** | **Otimização de Consultas com Índices e EXPLAIN ANALYZE:** Criação do script de índices compostos, parciais e GIN (`database/optimization_indexes.sql`) e redação do relatório de benchmarking demonstrando redução de custo de I/O e ganho de até 45x na velocidade das buscas. | **11h** | [`database/optimization_indexes.sql`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/database/optimization_indexes.sql) e [`docs/analise_planos_execucao_explain.md`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/docs/analise_planos_execucao_explain.md). |
| **ACT-18** | **Elaboração da Seção de Backend do Manual Técnico e Suíte de Testes:** Redação do manual completo de arquitetura, dicionário de dados relacional e contratos REST, além da elaboração da suíte de testes automatizados da Sprint 3 (`scripts/test_sprint3_cesar.js`). | **10h** | [`docs/manual_tecnico_backend_db.md`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/docs/manual_tecnico_backend_db.md) e [`scripts/test_sprint3_cesar.js`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/scripts/test_sprint3_cesar.js). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 3** | **67h** | **Meta Curricular Concluída: 200 Horas (100%)** |

---

## 3. CONSOLIDAÇÃO DA CARGA HORÁRIA TOTAL DO ESTÁGIO (200 HORAS)

| Etapa | Período | Carga Horária | Escopo Principal |
| :--- | :---: | :---: | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Levantamento de Requisitos, Modelagem DER (8 tabelas), DDL PostgreSQL, Autenticação Bcrypt, JWT HttpOnly e RBAC. |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Módulos Centrais: Catálogo Honest Market, Estoque Não-Negativo, Motor Pix Dinâmico EMV (BACEN), Checkout e Repositório TCC. |
| **Sprint 3** | 10/11 a 16/11/2026 | **67h** | Endpoints Analíticos do CA (BI), Hardening OWASP, Rate Limiting, Otimização de Consultas (EXPLAIN) e Manual Técnico. |
| **TOTAL** | **Ciclo Completo** | **200h** | **Estágio Supervisionado 100% Cumprido com Sucesso** |

---

## 4. RESULTADOS TÉCNICOS E IMPACTO INSTITUCIONAL

1. **Gestão Transparente para o Centro Acadêmico:** O módulo analítico permite à gestão discente acompanhar em tempo real o faturamento da cantina, antecipar reposições de estoque e exportar extratos em CSV para prestação de contas.
2. **Defesa em Profundidade contra Ameaças Cibernéticas:** O portal está protegido contra as principais vulnerabilidades do OWASP Top 10, com sanitização estrita, rate limiting distribuído por ação e isolamento de privilégios RBAC.
3. **Escalabilidade Garantida por Índices Especializados:** Os benchmarks demonstraram que as operações de busca e relatórios respondem em tempo sub-milissegundo (< 1ms), atendendo com folga ao requisito de latência de 300ms mesmo nos picos dos intervalos.
4. **Documentação de Engenharia de Nível Profissional:** O manual técnico consolidado e o histórico de migrações garantem manutenibilidade a longo prazo para as futuras turmas dos cursos de IA e Gestão ESG da FATEC Rio Claro.

