# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Cesar  
**Carga Horária Desta Etapa (Sprint 1):** 66 horas (Total acumulado: 66h / Meta: 200h)  
**Período:** 27 de Outubro a 02 de Novembro de 2026  
**Papel no Projeto:** Líder de Arquitetura Backend, Banco de Dados e Segurança da Informação  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 1

O presente relatório documenta as atividades técnicas e acadêmicas desenvolvidas pelo discente **Cesar** durante a **Sprint 1** do projeto do *Portal Integrado da FATEC Rio Claro*. O foco desta fase foi estabelecer a fundação de engenharia de software da plataforma, garantindo os requisitos de **robustez, alta segurança, facilidade de manutenção e suporte multiplataforma** demandados pela pesquisa discente e pelas diretrizes da disciplina do Prof. Orlando.

---

## 2. ATIVIDADES DESENVOLVIDAS E DISCRIMINAÇÃO DE CARGA HORÁRIA (66 HORAS)

| ID | Atividade Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-01** | **Levantamento e Análise dos Requisitos de Dados:** Análise do formulário e dataset com 38 respostas discentes, identificando a necessidade de controle estrito da cantina (*Honest Market*), centralização de notas de aula e avisos institucionais. | **10h** | Seção de requisitos do projeto e matriz de entidades. |
| **ACT-02** | **Modelagem Conceitual e Lógica do Banco de Dados (DER):** Criação do Diagrama Entidade-Relacionamento contemplando 8 tabelas centrais, chaves estrangeiras, restrições de integridade e índices para alto desempenho. | **16h** | [`database/der.md`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/database/der.md) e [`database/schema.sql`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/database/schema.sql). |
| **ACT-03** | **Scripts DDL e Carga Inicial (Seed):** Elaboração do script SQL para PostgreSQL com triggers automáticos de timestamp, tipos enumerados (ENUMs) e dados iniciais realistas para os cursos de IA e ESG. | **12h** | [`database/schema.sql`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/database/schema.sql) e [`database/seed.sql`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/database/seed.sql). |
| **ACT-04** | **Arquitetura de Segurança, Criptografia e RBAC:** Implementação do motor de autenticação utilizando hash Bcrypt (salt rounds 10), emissão de tokens JWT criptografados (`jose`), cookies seguros HttpOnly e middleware de proteção de rotas por papel (`ALUNO`, `CA_MEMBRO`, `PROFESSOR`, `ADMIN`). | **16h** | [`src/lib/auth.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/auth.ts), [`src/lib/security.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/security.ts) e [`src/middleware.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/middleware.ts). |
| **ACT-05** | **Desenvolvimento dos Route Handlers da API REST:** Construção dos endpoints `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` e `/api/health` com validação de payload via Zod e rate limiting contra ataques de força bruta. | **8h** | Diretório [`src/app/api/`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/app/api/). |
| **ACT-06** | **Testes Unitários e Documentação Técnica:** Criação do script de validação de segurança e redação da documentação de arquitetura e instruções para os colegas de equipe (Luis e Guilherme). | **4h** | [`scripts/test_backend.js`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/scripts/test_backend.js) e [`docs/arquitetura_seguranca.md`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/docs/arquitetura_seguranca.md). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 1** | **66h** | **Meta Parcial Atingida (66h / 200h)** |

---

## 3. RESULTADOS TÉCNICOS ALCANÇADOS

1. **Camada de Dados Operacional:** O banco de dados PostgreSQL foi completamente modelado e validado, com suporte híbrido (banco em memória e conexão PostgreSQL nativa) para garantir o desenvolvimento contínuo dos demais integrantes.
2. **Segurança OWASP Integrada:** Mecanismos de proteção contra SQL Injection (consultas parametrizadas), XSS (sanitização e cookies HttpOnly), DoS/Força Bruta (rate limiting) e senhas fracas.
3. **Contratos Tipados em TypeScript:** Disponibilização de tipos estritos em [`src/lib/types/index.ts`](file:///c:/Users/fmsar/OneDrive/Documentos/GitHub/jogo_damas/Estagio-Fatec/src/lib/types/index.ts) para facilitar o desenvolvimento imediato do frontend pelo Luis e dos módulos de IA pelo Guilherme.

---

## 4. PRÓXIMOS PASSOS (SPRINT 2 — 03/11 A 09/11/2026)

Na Sprint 2, o discente Cesar avançará com as seguintes tarefas:
* Implementação dos endpoints do catálogo de produtos e baixa de estoque do *Honest Market*;
* Criação do serviço de geração de Pix dinâmico (Payload EMV padrão Banco Central);
* APIs para upload e recuperação de materiais acadêmicos;
* Integração com a validação OCR que será implementada pelo Guilherme.

---
**Assinatura do Discente:** Cesar  
**Visto do Orientador:** Prof. Orlando
