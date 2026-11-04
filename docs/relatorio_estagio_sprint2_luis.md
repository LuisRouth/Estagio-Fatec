# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 2 (EM ANDAMENTO)
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Luis  
**Status da Sprint 2:** Em Execução (Início em 03/11/2026)  
**Carga Horária Registrada Até o Momento:** 6 horas cumpridas (Total acumulado: 72h / Meta global: 200h)  
**Período de Execução:** 03 de Novembro a 09 de Novembro de 2026  
**Papel no Projeto:** Engenharia Frontend, UI/UX Design, Acessibilidade Digital e Arquitetura Multiplataforma PWA  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 2 (ETAPA INICIAL)

Nesta abertura da **Sprint 2** (iniciada em 03/11/2026), o discente **Luis** focou na estabilização de interface, eliminação de bugs visuais críticos e construção do fluxo de onboarding com verificação de e-mail institucional. 

O trabalho inicial desta sprint concentrou-se na **resolução de débitos de usabilidade**, no **ajuste fino do modo de alto contraste** e na preparação do ambiente para receber as telas operacionais da Cantina Discente e do Repositório Acadêmico.

As atividades deste primeiro dia englobaram:
1. **Unificação de Perfil e Configurações:** Eliminação de redundâncias, criando uma tela única com abas (*Perfil Acadêmico*, *Segurança* e *Acessibilidade*);
2. **Correção do Alto Contraste:** Ajuste nos cartões de login, cadastro e verificação (removendo fundos brancos no tema escuro) e eliminação do flash branco transitório ao mudar de abas;
3. **Tela de Verificação de E-mail Institucional:** Animação vetorial suave em SVG (envelope e credencial acadêmica), simulação de validação discente e retenção total dos dados preenchidos no botão "Voltar e Corrigir";
4. **Header Fixo e Microinterações:** Cabeçalho persistente com engrenagens cinemáticas interconectadas no menu do aluno e correção de warnings de renderização do React.

---

## 2. ATIVIDADES REALIZADAS NO DIA 03/11/2026 (6 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-FE-07** | **Unificação de Perfil e Configurações:** Criação de navegação por abas em `/configuracoes`, unindo identificação discente, gestão de semestre letivo e preferências de acessibilidade. | **1,5h** | [`src/app/configuracoes/page.tsx`](file:///c:/Users/a/OneDrive/Documentos/GitHub/Estagio-Fatec/src/app/configuracoes/page.tsx). |
| **ACT-FE-08** | **Correções de Alto Contraste e Flash Branco:** Ajuste dos cartões escuros no login/cadastro/verificação, remoção de quebras de linha no menu e script pré-render no `<head>` para navegação sem piscadas. | **1,5h** | [`src/app/globals.css`](file:///c:/Users/a/OneDrive/Documentos/GitHub/Estagio-Fatec/src/app/globals.css), [`src/app/layout.tsx`](file:///c:/Users/a/OneDrive/Documentos/GitHub/Estagio-Fatec/src/app/layout.tsx). |
| **ACT-FE-09** | **Tela de Verificação de E-mail e Animação:** Construção de `/verificar-email`, animação vetorial do envelope, retenção de formulário com `sessionStorage` e simulação de ativação direta à Home. | **1,5h** | [`src/components/auth/EmailVerificationScreen.tsx`](file:///c:/Users/a/OneDrive/Documentos/GitHub/Estagio-Fatec/src/components/auth/EmailVerificationScreen.tsx). |
| **ACT-FE-10** | **Header Fixo, Engrenagens e Resolução de Warnings:** `position: fixed` no cabeçalho, engrenagens azuis em sincronia, padronização em 260px e desacoplamento de eventos de renderização. | **1,5h** | [`src/components/layout/AppLayout.tsx`](file:///c:/Users/a/OneDrive/Documentos/GitHub/Estagio-Fatec/src/components/layout/AppLayout.tsx). |
| **TOTAL** | **Horas Realizadas no 1º Dia da Sprint 2** | **6h** | **Sprint 2 em andamento (Meta da Sprint: ~67h)** |

---

## 3. PRÓXIMAS ATIVIDADES PLANEJADAS PARA A SPRINT 2 (RESTANTE DA SEMANA)

* **Tela da Cantina Discente (`/cantina`):** Interface de carrinho interativo, renderização dinâmica de QR Code Pix e envio de comprovante;
* **Filtros do Repositório Acadêmico (`/repositorio`):** Busca por semestre e curso (`IA` / `ESG`);
* **Consolidação final da carga horária da Sprint 2** ao longo dos próximos dias úteis.
