# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 3

**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando Saraiva Jr.  
**Discente / Estagiário:** Luis Otavio  
**Carga Horária Desta Etapa (Sprint 3):** 67 horas (Total acumulado: **200h / Meta: 200h — 100% Concluído**)  
**Período:** 10 de Novembro a 18 de Novembro de 2026  
**Papel no Projeto:** Liderança de Engenharia Frontend, UI/UX Design Simbiótico (IA/ESG), Acessibilidade Digital (Alto Contraste) e PWA Multiplataforma  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 3

O presente relatório documenta as entregas de engenharia frontend, experiência do usuário (UX) e integração funcional realizadas pelo discente **Luis Otavio** durante a **Sprint 3 (Etapa Final)** do *Portal Integrado dos Estudantes da FATEC Rio Claro*.

Nesta etapa conclusiva, o foco concentrou-se em consolidar os fluxos de uso real da plataforma em produção (Vercel + Supabase), unificando a experiência da **Cantina Discente** (loja, extrato de consumo e conferência administrativa de caixa), evoluindo o **Repositório Acadêmico** e a **Vitrine de Projetos/TCCs** com upload direto de arquivos locais e links dinâmicos, além de homologar a **responsividade mobile** e o modo de **Alto Contraste** em toda a aplicação.

---

## 2. DISCRIMINAÇÃO DE ATIVIDADES E CARGA HORÁRIA (67 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-FE-11** | **Unificação da Cantina Discente e Painel de Gestão (`/cantina`, `/cantina/admin`):** Integração do componente de Extrato de Consumo (`CanteenStatementView`) diretamente na página da Cantina, botão contextual dinâmico entre Gestão de Estoque e Conferência de Pedidos/Caixa (`?tab=orders`), suporte completo ao modo Alto Contraste nos formulários, tabelas e cards de métricas, e polimento dos fluxos de conferência Pix. | **19h** | [`src/app/cantina/page.tsx`](../src/app/cantina/page.tsx), [`src/app/cantina/admin/page.tsx`](../src/app/cantina/admin/page.tsx), [`src/components/canteen/CanteenStatementView.tsx`](../src/components/canteen/CanteenStatementView.tsx) |
| **ACT-FE-12** | **Evolução do Repositório Acadêmico e Grade Curricular Oficial (`/repositorio`):** Implementação da grade expansível do PPC oficial (4 semestres de IA e Gestão ESG), seletor de cores e capas personalizadas, upload direto de arquivos do computador (URL assinada até 25 MB no Supabase Storage com fallback local), visualizador embutido de PDFs e imagens na própria página (`FilePreviewModal`), fluxo de moderação com versionamento (`pending_edit` mantendo a versão anterior publicada até reaprovação pelo CA/Admin), suporte a links complementares dinâmicos e conexão em tempo real na Home (`/`). | **18h** | [`src/app/repositorio/page.tsx`](../src/app/repositorio/page.tsx), [`src/components/ui/FilePreviewModal.tsx`](../src/components/ui/FilePreviewModal.tsx), [`src/app/page.tsx`](../src/app/page.tsx), [`src/lib/curriculum.ts`](../src/lib/curriculum.ts), [`scripts/import_classroom_materials.js`](../scripts/import_classroom_materials.js) |
| **ACT-FE-13** | **Vitrine Interativa de Projetos e TCCs (`/vitrine`) e Gestão Administrativa (`/admin/usuarios`, `/configuracoes`):** Aprimoramento da Vitrine com separação clara entre repositório GitHub principal, links complementares (demos, dashboards), upload direto de PDFs/slides do computador nos anexos, visualização embutida de documentos e moderação de edições pendentes; implementação das telas administrativas de contas e preferências do aluno. | **16h** | [`src/app/vitrine/page.tsx`](../src/app/vitrine/page.tsx), [`src/app/api/materials/[id]/route.ts`](../src/app/api/materials/[id]/route.ts), [`src/app/admin/usuarios/page.tsx`](../src/app/admin/usuarios/page.tsx), [`src/app/configuracoes/page.tsx`](../src/app/configuracoes/page.tsx) |
| **ACT-FE-14** | **Responsividade Mobile, Acessibilidade e Polimento UI/UX:** Ajustes de layout para dispositivos móveis (`390x844`), carrossel horizontal na tela inicial, padronização de iconografia em SVG puro, validação de alto contraste no `globals.css` e homologação contínua com a esteira de testes automatizados (54/54 aprovados). | **14h** | [`src/components/layout/AppLayout.tsx`](../src/components/layout/AppLayout.tsx), [`src/app/globals.css`](../src/app/globals.css), [`tests/e2e/portal.spec.ts`](../tests/e2e/portal.spec.ts) |
| **TOTAL** | **Carga Horária Cumprida na Sprint 3** | **67h** | **Meta Curricular Concluída: 200 Horas (100%)** |

---

## 3. DETALHAMENTO TÉCNICO DAS ENTREGAS DA SPRINT 3

### 3.1. Cantina Discente, Extrato Integrado e Conferência de Caixa
- **Fluxo Único de Consumo:** Os alunos passaram a consultar seu extrato em tempo real e histórico de pedidos Pix dentro da própria rota `/cantina`, alternando entre o cardápio e o extrato sem perder contexto.
- **Atalho Contextual para o Centro Acadêmico:** Na barra superior da Cantina, perfis autorizados (`ADMIN` e `CA_MEMBRO`) visualizam dinamicamente o botão *Gerenciar Estoque (CA / Secretaria)* na aba de cardápio e *Gerenciar Pedidos (Caixa)* na aba de extrato, abrindo diretamente a aba correspondente via query string (`?tab=products` / `?tab=orders`).
- **Padronização de Alto Contraste:** Os cards de métricas do caixa e tabelas administrativas receberam classes dedicadas em `globals.css` garantindo legibilidade total com Alto Contraste ativado ou desativado.

### 3.2. Repositório Acadêmico, Visualizador Embutido e Moderação Versionada
- **Matriz Curricular Oficial (PPC):** Estruturação rigorosa dos 4 semestres oficiais dos cursos de Inteligência Artificial e Gestão ESG em `src/lib/curriculum.ts`, permitindo filtrar materiais por semestre e disciplina com um clique.
- **Upload Local + Nuvem e Visualização na Página:** Implementação de envio direto de arquivos do computador (PDF, DOCX, PPTX, ZIP até 25 MB) via URL assinada, além do componente `FilePreviewModal` com suporte a leitura e folheamento de PDFs e zoom de imagens diretamente na página (com políticas `X-Frame-Options: SAMEORIGIN` e CSP adequadas).
- **Moderação Segura com Versionamento (`pending_edit`):** Quando um discente edita uma publicação já aprovada, a versão anterior permanece visível no ar enquanto a nova versão vai para a fila de moderação do CA/Admin, que pode aprovar a substituição ou descartar a edição sem perda de dados.
- **Acervo Real de IA:** Organização e importação automatizada de materiais didáticos das disciplinas de IA (1º, 3º e 4º semestres, incluindo Estágio e TCC), com disponibilização imediata de aulas selecionadas para o ambiente de produção na Vercel.

### 3.3. Vitrine de Projetos e Experiência na Página Inicial
- **Separação Semântica de Links na Vitrine:** Correção do fluxo de links para distinguir o repositório GitHub principal, links adicionais dinâmicos (Streamlit, dashboards, demos) e anexos documentais (PDFs, relatórios e slides com upload direto do computador).
- **Home Conectada e Responsiva:** Conexão da seção de Repositório Acadêmico na página inicial (`/`) diretamente à API de materiais, com filtro rápido por curso e carrossel horizontal otimizado para telas móveis.

---

## 4. CONSOLIDAÇÃO DA CARGA HORÁRIA TOTAL DO ESTÁGIO (200 HORAS)

| Etapa | Período | Carga Horária | Escopo Principal Entregue |
| :--- | :---: | :---: | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Pesquisa de UX, Identidade Visual FATEC/CPS, Mascote Galo Widget, Design System IA/ESG (Zero CLS) e Layout PWA (`/`, `/login`, `/cadastro`, `/avisos`). |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Cantina Discente (`/cantina`), Checkout Pix Dinâmico com QR Code e envio de comprovante OCR, Repositório Acadêmico (`/repositorio`) e histórico de consumo. |
| **Sprint 3** | 10/11 a 18/11/2026 | **67h** | Extrato integrado à Cantina, Painel Administrativo (`/cantina/admin`), Vitrine de Projetos (`/vitrine`) com upload local, Moderação e Grade PPC no Repositório, Gestão de Usuários (`/admin/usuarios`) e Homologação Mobile/Alto Contraste. |
| **TOTAL** | **Ciclo Completo** | **200h** | **Estágio Supervisionado 100% Cumprido e Homologado** |
