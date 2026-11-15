# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 3
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Luis  
**Carga Horária Desta Etapa (Sprint 3):** 67 horas (Total acumulado: **200h / Meta: 200h — 100% Concluído**)  
**Período:** 10 de Novembro a 16 de Novembro de 2026  
**Papel no Projeto:** Engenharia Frontend, UI/UX Design Simbiótico (IA/ESG), Acessibilidade Digital e PWA Multiplataforma  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 3

O presente relatório documenta as atividades finais de engenharia frontend desenvolvidas pelo discente **Luis** durante a **Sprint 3 (Etapa Final)** do *Portal Integrado dos Estudantes da FATEC Rio Claro*. O foco desta etapa foi consolidar os módulos de vitrine acadêmica, gestão administrativa da cantina e de usuários, acessibilidade e responsividade PWA, completando as **200 horas regulamentares de estágio supervisionado**.

---

## 2. DISCRIMINAÇÃO DE ATIVIDADES E CARGA HORÁRIA (67 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-FE-11** | **Vitrine Interativa de Projetos e TCCs (`/vitrine`):** Implementação da interface de exibição de projetos integradores e TCCs dos cursos de IA e Gestão ESG com cards responsivos, filtros e visualização de detalhes. | **18h** | [`src/app/vitrine/page.tsx`](../src/app/vitrine/page.tsx) |
| **ACT-FE-12** | **Painel Administrativo da Cantina e Conferência de Caixa (`/cantina/admin`):** Construção da aba de conferência de pedidos Pix, baixa de pagamentos e gestão de produtos/estoque para membros do Centro Acadêmico. | **19h** | [`src/app/cantina/admin/page.tsx`](../src/app/cantina/admin/page.tsx) |
| **ACT-FE-13** | **Interface de Gestão de Usuários e Configurações (`/admin/usuarios`, `/configuracoes`):** Desenvolvimento das telas administrativas de contas discentes (alteração de cargo/status e redefinição de senha) e preferências do aluno. | **16h** | [`src/app/admin/usuarios/page.tsx`](../src/app/admin/usuarios/page.tsx), [`src/app/configuracoes/page.tsx`](../src/app/configuracoes/page.tsx) |
| **ACT-FE-14** | **Homologação de Responsividade Mobile, Acessibilidade e Polimento UI/UX:** Ajustes de contraste, navegação por teclado, zero CLS e validação visual em viewport mobile (`390x844`) integrada à esteira de QA. | **14h** | [`src/components/layout/AppLayout.tsx`](../src/components/layout/AppLayout.tsx), [`tests/e2e/portal.spec.ts`](../tests/e2e/portal.spec.ts) |
| **TOTAL** | **Carga Horária Cumprida na Sprint 3** | **67h** | **Meta Curricular Concluída: 200 Horas (100%)** |

---

## 3. CONSOLIDAÇÃO DA CARGA HORÁRIA TOTAL DO ESTÁGIO (200 HORAS)

| Etapa | Período | Carga Horária | Escopo Principal |
| :--- | :---: | :---: | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Pesquisa de UX, Identidade Visual FATEC/CPS, Mascote Galo Widget, Design System IA/ESG (Zero CLS) e Layout PWA (`/` , `/login`, `/cadastro`). |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Cantina Discente (`/cantina`), Checkout Pix Dinâmico, Repositório Acadêmico (`/repositorio`) e Painel `/historico`. |
| **Sprint 3** | 10/11 a 16/11/2026 | **67h** | Vitrine de TCCs (`/vitrine`), Painel Administrativo da Cantina (`/cantina/admin`), Gestão de Usuários (`/admin/usuarios`) e Homologação Mobile/UI. |
| **TOTAL** | **Ciclo Completo** | **200h** | **Estágio Supervisionado 100% Cumprido com Sucesso** |
