# RELATÓRIO GERAL CONSOLIDADO DE ESTÁGIO SUPERVISIONADO (200H) — LUIS OTAVIO

**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando Saraiva Jr.  
**Discente / Estagiário:** Luis Otavio  
**Carga Horária Total Comprovada:** **200 horas** (Sprint 1: 66h | Sprint 2: 67h | Sprint 3: 67h)  
**Período Total:** 27 de Outubro a 18 de Novembro de 2026  
**Papel no Projeto:** Líder de Engenharia Frontend, UI/UX Design Simbiótico (IA/ESG), Acessibilidade Digital e PWA Multiplataforma  

---

## 1. SÍNTESE EXECUTIVA

Ao longo das **200 horas** do Estágio Supervisionado, o discente **Luis Otavio** foi responsável pela concepção visual, experiência do usuário (UI/UX), acessibilidade e implementação completa das interfaces web do *Portal Integrado dos Estudantes da FATEC Rio Claro* em **Next.js (React/TypeScript)**.

O trabalho abrangeu desde o levantamento inicial de requisitos com os discentes e a criação do Design System institucional até a entrega de módulos completos em produção (Vercel + Supabase): **Página Inicial integrada**, **Mural de Comunicados Oficiais**, **Cantina Discente com Pix Dinâmico e Extrato**, **Painel Administrativo do Centro Acadêmico**, **Repositório Acadêmico estruturado pela matriz PPC**, **Vitrine de Projetos e TCCs**, **Gestão de Usuários** e **Configurações de Acessibilidade**.

---

## 2. ENTREGAS REALIZADAS POR MÓDULO DO PORTAL

### 2.1. Identidade Visual, Layout PWA e Acessibilidade
- **Estrutura Base e Navegação (`AppLayout`):** Barra lateral responsiva, cabeçalho fixo com identificação de perfil, alternância instantânea de **Modo Alto Contraste** e fundo dinâmico simbiótico (`EcoTechBackground` / `NeuralBackground`) representando os cursos de Inteligência Artificial e Gestão ESG.
- **Identidade Institucional e Mascote:** Criação de componentes visuais da FATEC Rio Claro, logo institucional e widget interativo do mascote Galo.
- **Experiência Mobile:** Adaptação completa das grades, modais, barras de filtro e carrossel horizontal da Home para telas móveis (`390x844`), utilizando exclusivamente iconografia vetorial SVG.

### 2.2. Autenticação, Página Inicial e Mural de Avisos
- **Fluxo de Acesso (`/login`, `/cadastro`):** Telas responsivas de autenticação institucional com validação visual de senha forte e feedback de erros em tempo real.
- **Página Inicial (`/`) Conectada:** Carrossel institucional interativo, exibição em destaque dos comunicados oficiais prioritários e seção conectada ao Repositório Acadêmico com filtro rápido por curso (`IA` / `ESG`).
- **Mural de Comunicados (`/avisos`):** Cards de avisos com filtros por curso e prioridade, modal de leitura detalhada, seletor de cores/capas, anexos e links dinâmicos restritos a perfis autorizados (`ADMIN`, `CA_MEMBRO`, `PROFESSOR`).

### 2.3. Cantina Discente, Pagamento Pix e Gestão do CA
- **Loja Virtual e Autoatendimento (`/cantina`):** Catálogo interativo com busca, categorias, controle visual de estoque disponível, carrinho flutuante/lateral e modal de checkout com QR Code Pix EMV, Pix Copia-e-Cola, envio de comprovante (OCR via IA) e acompanhamento de confirmação em tempo real.
- **Extrato Integrado (`CanteenStatementView`):** Visualização unificada do extrato de compras do aluno diretamente dentro da Cantina, com métricas de consumo e filtros por status (`PENDENTE`, `PAGO`, `CANCELADO`).
- **Painel de Gestão da Cantina (`/cantina/admin`):** Área restrita ao Centro Acadêmico e Secretaria com abas para **Catálogo & Estoque** (cadastro/edição de produtos, reposição rápida e galeria de imagens), **Conferência de Pedidos & Caixa** (baixa manual de pagamentos Pix e abertura direta via `?tab=orders`) e **Configurações de Notificações**.

### 2.4. Repositório Acadêmico e Vitrine de Projetos
- **Repositório Acadêmico (`/repositorio`):** Organização rigorosa pelos **4 semestres oficiais** da matriz curricular (PPC) de Inteligência Artificial e Gestão ESG (`src/lib/curriculum.ts`), com explorador expansível de disciplinas, busca instantânea, assistente de estudos IA (RAG), seletor amplo de cores de capa, upload direto de arquivos do computador (até 25 MB), visualizador embutido de PDFs e imagens (`FilePreviewModal`), links complementares dinâmicos e fila de moderação com versionamento seguro (`pending_edit` mantendo a versão anterior no ar até reaprovação).
- **Vitrine de Projetos e TCCs (`/vitrine`):** Portfólio dedicado a projetos práticos e TCCs com separação clara entre repositório GitHub principal, links complementares (demos, dashboards), upload direto do computador nos anexos, visualização embutida de documentos e moderação de edições pendentes.

### 2.5. Administração e Configurações
- **Gestão de Contas (`/admin/usuarios`):** Painel administrativo para gerenciamento de usuários, alteração de cargos (`ALUNO`, `CA_MEMBRO`, `PROFESSOR`, `ADMIN`), ativação/inativação de contas e redefinição de senhas.
- **Configurações do Discente (`/configuracoes`):** Interface de preferências de acessibilidade e perfil do usuário.

---

## 3. QUADRO CONSOLIDADO DE HORAS E EVIDÊNCIAS TÉCNICAS (200H)

| Sprint | Período | Horas | Atividades Executadas | Evidências Técnicas no Repositório |
| :--- | :---: | :---: | :--- | :--- |
| **Sprint 1** | 27/10 a 02/11/2026 | **66h** | Pesquisa de UX discente, Identidade Visual FATEC/CPS e Mascote Galo, Design System Simbiótico (IA/ESG), Layout PWA, Home, Login, Cadastro e Mural de Avisos. | [`src/components/layout/AppLayout.tsx`](../src/components/layout/AppLayout.tsx), [`src/components/layout/EcoTechBackground.tsx`](../src/components/layout/EcoTechBackground.tsx), [`src/components/brand/`](../src/components/brand/), [`src/app/page.tsx`](../src/app/page.tsx), [`src/app/login/page.tsx`](../src/app/login/page.tsx), [`src/app/cadastro/page.tsx`](../src/app/cadastro/page.tsx), [`docs/relatorio_estagio_sprint1_luis.md`](./relatorio_estagio_sprint1_luis.md) |
| **Sprint 2** | 03/11 a 09/11/2026 | **67h** | Cantina Discente (`/cantina`) com carrinho dinâmico e Checkout Pix + QR Code, Repositório Acadêmico (`/repositorio`), Mural de Comunicados (`/avisos`) e Extrato de Consumo. | [`src/app/cantina/page.tsx`](../src/app/cantina/page.tsx), [`src/app/repositorio/page.tsx`](../src/app/repositorio/page.tsx), [`src/app/avisos/page.tsx`](../src/app/avisos/page.tsx), [`src/app/historico/page.tsx`](../src/app/historico/page.tsx), [`docs/relatorio_estagio_sprint2_luis.md`](./relatorio_estagio_sprint2_luis.md) |
| **Sprint 3** | 10/11 a 18/11/2026 | **67h** | Unificação do Extrato na Cantina, Painel Admin (`/cantina/admin`), Grade PPC e Moderação no Repositório, Vitrine de Projetos (`/vitrine`) com upload local, Gestão de Usuários (`/admin/usuarios`) e Homologação Mobile/Alto Contraste. | [`src/app/vitrine/page.tsx`](../src/app/vitrine/page.tsx), [`src/app/cantina/admin/page.tsx`](../src/app/cantina/admin/page.tsx), [`src/components/canteen/CanteenStatementView.tsx`](../src/components/canteen/CanteenStatementView.tsx), [`src/app/admin/usuarios/page.tsx`](../src/app/admin/usuarios/page.tsx), [`src/app/configuracoes/page.tsx`](../src/app/configuracoes/page.tsx), [`docs/relatorio_estagio_sprint3_luis.md`](./relatorio_estagio_sprint3_luis.md) |
| **TOTAL** | **27/10 a 18/11/2026** | **200h** | **100% da carga horária cumprida** | **TypeScript validado (`tsc --noEmit`), 54 testes automatizados aprovados e suíte E2E Playwright** |

---

## 4. DECLARAÇÃO DE CONCLUSÃO E ASSINATURAS

Declara-se que o discente **Luis Otavio** cumpriu integralmente as **200 horas** previstas para o Estágio Curricular Supervisionado com todas as entregas funcionais e documentais implementadas no repositório oficial do projeto.

* **Discente:** Luis Otavio — *Data: ___/___/2026*  
* **Docente Orientador:** Prof. Orlando Saraiva Jr. — *Data: ___/___/2026*  
