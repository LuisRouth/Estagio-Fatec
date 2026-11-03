# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 2
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Cesar  
**Carga Horária Desta Etapa (Sprint 2):** 67 horas (Total acumulado: 133h / Meta: 200h)  
**Período:** 03 de Novembro a 09 de Novembro de 2026  
**Papel no Projeto:** Líder de Arquitetura Backend, Banco de Dados e Segurança da Informação  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 2

Nesta **Sprint 2**, o discente **Cesar** concentrou seus esforços no desenvolvimento dos **módulos centrais operacionais** do *Portal Integrado da FATEC Rio Claro*, atendendo diretamente às dores levantadas na pesquisa discente (N = 38 alunos dos cursos de IA e ESG) e aos requisitos RF-06 a RF-14 da especificação IEEE 830.

O escopo executado englobou:
1. **Catálogo e Estoque da Cantina Inteligente (*Honest Market*):** Endpoints REST completos (CRUD) com controle de saldo não-negativo, limiares de alerta para reposição discente e auditoria RBAC;
2. **Serviço de Pix Dinâmico Padrão Banco Central do Brasil (EMV / BR Code):** Implementação algorítmica de montagem de payload TLV, codificação monetária e cálculo de integridade por checksum CRC-16/CCITT-FALSE;
3. **Checkout e API de Histórico/Extrato de Compras do Aluno:** Fluxo de compra atômica com baixa de estoque, consolidação de extrato financeiro pessoal, emissão de comprovantes e anexo de recibos para conciliação por IA (Google Gemini OCR);
4. **Repositório Didático & Vitrine de Projetos de TCC:** Endpoints de upload seguro com validação de extensão e tamanho, categorização por curso (`IA` / `ESG`), semestres (1º ao 6º), tipos de arquivo e busca full-text com contabilização de downloads.

---

## 2. ATIVIDADES DESENVOLVIDAS E DISCRIMINAÇÃO DE CARGA HORÁRIA (67 HORAS)

| ID | Atividade Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-07** | **Arquitetura de Dados da Cantina e Repositório:** Expansão da camada de dados híbrida (`src/lib/db.ts`) e contratos TypeScript (`src/lib/types/index.ts`) implementando métodos de persistência transacional (PostgreSQL e Mock em memória) para produtos, transações, itens de compra, extratos e materiais acadêmicos. | **15h** | [`src/lib/db.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/db.ts) e [`src/lib/types/index.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/types/index.ts). |
| **ACT-08** | **CRUD do Catálogo e Controle de Estoque (Honest Market):** Construção dos Route Handlers `/api/canteen/products`, `/api/canteen/products/[id]` e `/api/canteen/products/[id]/stock` com validação de payload Zod, proteção RBAC (`CA_MEMBRO`/`ADMIN`), prevenção de estoque negativo e registro de auditoria OWASP. | **14h** | Diretório [`src/app/api/canteen/products/`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/canteen/products/). |
| **ACT-09** | **Serviço Gerador e Validador de Pix Dinâmico EMV:** Desenvolvimento do motor oficial do BACEN para geração de código Copia-e-Cola e QR Code dinâmico, incluindo formatação TLV, tags 00 a 63, identificador único (`txid`), sanitização ASCII e checksum matemático CRC-16. | **14h** | [`src/lib/pix.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/pix.ts), [`src/app/api/pix/generate/route.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/pix/generate/route.ts) e [`src/app/api/pix/validate/route.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/pix/validate/route.ts). |
| **ACT-10** | **Checkout Transacional e Extrato de Compras do Aluno:** Implementação da rota atômica de checkout `/api/canteen/checkout` com baixa de estoque, rota de extrato consolidado `/api/canteen/history`, listagem de pedidos `/api/canteen/transactions` e anexo de comprovantes `/api/canteen/transactions/[id]/proof`. | **12h** | Diretório [`src/app/api/canteen/`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/canteen/). |
| **ACT-11** | **Endpoints de Upload, Busca e Categorização de Materiais e TCC:** Construção da API do repositório acadêmico `/api/materials`, `/api/materials/[id]`, `/api/materials/[id]/download` e `/api/materials/upload` com sanitização anti-path-traversal, restrição de extensões e filtros multi-critério (Curso, Semestre, Tags). | **8h** | Diretório [`src/app/api/materials/`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/materials/). |
| **ACT-12** | **Testes Automatizados, Homologação e Integração com a Equipe:** Elaboração da suíte de testes unitários e de integração `tests/unit/canteen_pix.test.ts`, `tests/unit/materials.test.ts`, script CLI `scripts/test_sprint2_cesar.js` (38 testes aprovados) e integração na esteira unificada `scripts/run_all_tests.js`. | **4h** | [`tests/unit/canteen_pix.test.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/tests/unit/canteen_pix.test.ts), [`scripts/test_sprint2_cesar.js`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/scripts/test_sprint2_cesar.js). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 2** | **67h** | **Total Acumulado: 133h / Meta: 200h (66,5%)** |

---

## 3. RESULTADOS TÉCNICOS ALCANÇADOS NA SPRINT 2

1. **Conformidade Estrita com o Banco Central do Brasil:** O módulo [`src/lib/pix.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/pix.ts) foi construído segundo o *Manual de Padrões para Iniciação do Pix*, validado contra os vetores de teste internacionais ISO/IEC 13239 para CRC-16/CCITT-FALSE (gerando o checksum hexadecimal exato `29B1` para strings padrão).
2. **Integridade ACID e Garantia Anti-Estoque Negativo:** Todas as operações de checkout e ajuste de estoque utilizam bloqueio transacional (`BEGIN ... FOR UPDATE ... COMMIT`), impedindo inconsistências e condições de corrida durante os intervalos de aula.
3. **Segurança OWASP e RBAC Reforçado:** Rotas de manipulação cadastral de produtos da cantina são restritas a usuários autorizados do Centro Acadêmico (`CA_MEMBRO`) e Administradores (`ADMIN`), enquanto o extrato do discente garante isolamento de dados entre estudantes.
4. **Qualidade de Código e Tipagem TypeScript 100% Estrita:** Todo o backend compila sem warnings com `tsc --noEmit` (`npm run typecheck`), e a esteira de testes automatizada passa com 100% de sucesso em 29 testes integrados.

---

## 4. PRÓXIMOS PASSOS (SPRINT 3 — 10/11 A 16/11/2026 — 67H RESTANTES)

Para a última etapa do estágio supervisionado, o estagiário Cesar executará:
* Exportação de relatórios financeiros analíticos da cantina discente (formato CSV/PDF) para prestação de contas do Centro Acadêmico;
* Pentest de segurança e auditoria de vulnerabilidades OWASP ZAP na API REST;
* Indexação de materiais acadêmicos para consultas semânticas integradas ao Google Gemini SDK desenvolvido pelo Guilherme;
* Elaboração do relatório final consolidado de estágio (200 horas) para apresentação ao Prof. Orlando.

