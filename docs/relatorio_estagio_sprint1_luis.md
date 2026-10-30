# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Luis  
**Carga Horária Desta Etapa (Sprint 1):** 66 horas (Total acumulado: 66h / Meta global: 200h)  
**Período de Execução:** 27 de Outubro a 02 de Novembro de 2026  
**Papel no Projeto:** Engenharia Frontend, UI/UX Design, Acessibilidade e Arquitetura Multiplataforma PWA  

---

## 1. INTRODUÇÃO E CONTEXTO ACADÊMICO-PROFISSIONAL

O presente relatório técnico-científico consolida as atividades de engenharia de software e design de interfaces executadas pelo discente **Luis** durante a **Sprint 1** do projeto institucional do **Portal Integrado da FATEC Rio Claro**. A iniciativa visa suprir uma lacuna histórica de comunicação e autoatendimento entre a unidade e seus alunos, estruturando uma plataforma unificada e multiplataforma para atender integralmente às turmas de:
1. **Inteligência Artificial (Período Matutino)** — com ênfase em dados, algoritmos, modelos preditivos e tecnologia de ponta;
2. **Gestão Empresarial / Gestão ESG (Período Noturno)** — com foco estratégico em sustentabilidade socioambiental, governança corporativa, economia circular e conformidade ética.

Sob a orientação docente do **Prof. Orlando**, o projeto foi estruturado com equivalência ao marco de estágio supervisionado de **200 horas**, distribuído em 3 sprints avaliativas (~66 horas por integrante por sprint). O foco desta primeira sprint residiu na **pesquisa de experiência do usuário (UX Research)**, estruturação do **Design System institucional autêntico**, implementação da **arquitetura responsiva resiliente**, eliminação de problemas de estabilidade visual (*Cumulative Layout Shift*) e criação dos fluxos completos de **autenticação segura e navegação acadêmica**.

---

## 2. FUNDAMENTAÇÃO TEÓRICA E DIRETRIZES DE DESIGN

### 2.1. Inclusão e Empatia Curricular: A Simbiose entre IA e ESG
Um dos principais desafios de design identificados foi a necessidade de evitar uma interface excessivamente "fria" ou puramente tecnicista (estilo cyberpunk/matrix), o que geraria um forte sentimento de exclusão e não-pertencimento aos discentes do curso de Gestão ESG. 

Para solucionar essa dicotomia, foi concebido o conceito de **Design Biofílico e Tecnológico**:
* **Equilíbrio Cromático:** Integração do **Azul Tecnológico Institucional (`#0284c7`)**, que remete a sistemas analíticos e clareza de dados, com o **Verde Esmeralda Ecológico (`#059669`)**, simbolizando sustentabilidade, recursos renováveis e responsabilidade ambiental.
* **Superfícies Orgânicas (Eco-Tech):** Eliminação de quadriculados rígidos de engenharia em favor de **curvas de nível topográficas suaves** e um **grafo dinâmico simbiótico**, onde partículas ecológicas e dados tecnológicos interagem harmonicamente em tempo real com envoltório toroidal contínuo (sem perdas de partículas nas bordas).
* **Legibilidade e Sobriedade:** Fundo em tons claros (`#f8fafc`), evitando a poluição visual e garantindo conforto ergonômico prolongado tanto para leitura diurna de notas de aula quanto para consultas rápidas nos intervalos noturnos.

### 2.2. Acessibilidade Digital e Padrões Web (WCAG 2.1 AA e e-MAG)
A interface foi projetada observando os critérios de acessibilidade do Modelo de Acessibilidade em Governo Eletrônico (e-MAG) e do W3C (WCAG 2.1 AA):
* Contraste cromático estrito entre tipografia (`#0f172a` e `#334155`) e superfícies translúcidas com efeito *glassmorphism* (`backdrop-filter: blur(16px)`);
* Suporte nativo ao modo de Alto Contraste para alunos com baixa acuidade visual;
* Elementos dinâmicos com atributos de acessibilidade (`aria-hidden="true"` para animações de fundo, `aria-label` para controles de paginação e navegação por teclado);
* Mecanismos de saída e retorno universal: inclusão de botão direto de retorno à home nas telas de login e cadastro discente sem necessidade de autenticação prévia.

---

## 3. DISCRIMINAÇÃO DETALHADA DAS ATIVIDADES E CARGA HORÁRIA (66 HORAS)

| ID | Atividade Técnica Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-FE-01** | **Pesquisa de UX e Análise Estatística do Formulário Discente:** Tabulação e análise quantitativa e qualitativa das 38 respostas dos alunos de IA e ESG coletadas via Forms. Mapeamento de dores com a cantina (esquecimento de anotação, divergência de preços, falta de histórico) e dispersão de materiais de estudo entre diferentes plataformas. | **12h** | Matriz de requisitos de UI, personas acadêmicas e jornadas de usuário documentadas. |
| **ACT-FE-02** | **Identidade Visual Oficial e Padronização de Brand Assets:** Tratamento e integração dos logotipos oficiais da FATEC Rio Claro e do Centro Paula Souza (CPS) em formatos de alta resolução, processamento em canal alfa transparente da logo geométrica do Galo Tecnológico e remoção de poluição visual. | **10h** | `src/components/brand/LogoFatec.tsx`, `src/components/brand/GaloWidget.tsx` e assets em `public/brand/`. |
| **ACT-FE-03** | **Design System Simbiótico e Estabilização de Layout (Zero CLS):** Desenvolvimento de tokens CSS nativos, padronização da altura mínima do Hero Carrossel para eliminação de saltos de layout (*Cumulative Layout Shift*), botões táteis e cards interativos. | **12h** | `src/app/globals.css`, `src/app/page.tsx` e biblioteca de variáveis CSS. |
| **ACT-FE-04** | **Arquitetura de Layout Multiplataforma e PWA:** Construção da estrutura `AppLayout` com Header institucional fixo, Sidebar desacoplada com scroll independente para evitar quebras em telas longas, menu gaveta (*drawer*) mobile, rodapé integrado com links oficiais e ecossistema PWA completo (`manifest.json`, favicons dedicados e metadados no `RootLayout`). | **14h** | `src/components/layout/AppLayout.tsx`, `public/manifest.json` e `src/app/layout.tsx`. |
| **ACT-FE-05** | **Fundo Dinâmico Simbiótico e Gráficos Interativos (Canvas + SVG):** Criação de animação em Canvas com envoltório toroidal e densidade ampliada (~80 nós IA/ESG), animação em dois eixos independentes para giro fluido contínuo de 360° do capelo acadêmico e física de partículas no widget do galo com queda de penas SVG em 3D. | **8h** | `src/components/layout/EcoTechBackground.tsx` e `src/components/home/HeroVisualWidget.tsx`. |
| **ACT-FE-06** | **Interfaces de Autenticação, Navegação e Unificação dos Cards:** Telas de Login e Cadastro (com seleção de curso IA/ESG, restrição semestral 1º a 4º e retorno universal), padronização visual dos botões de ação e unificação dos estados neutros informativos (*empty states*) para Mural de Avisos, Cantina Discente e Repositório Acadêmico na Home. | **10h** | Rotas em `src/app/`, tratamento de erros 404/500 e tipagem estrita com TypeScript. |
| **TOTAL** | **Carga Horária Total Cumprida na Sprint 1** | **66h** | **Cumprimento do Marco Parcial (66h / 200h)** |

---

## 4. METODOLOGIA DE DESENVOLVIMENTO E ARQUITETURA TÉCNICA

### 4.1. Stack Tecnológica
* **Framework:** Next.js (App Router) com React 18 e TypeScript em modo estrito (`strict: true`);
* **Estilização:** CSS Moderno com variáveis nativas, propriedades de *backdrop-filter*, transições cúbicas e layout flexível/grid;
* **Autenticação e Segurança de Formulários:** Sanitização de entradas, validação de e-mail com regex institucional `@aluno.cps.sp.gov.br`, validação de curso (`IA` ou `ESG`) e limitação aos semestres vigentes de 1 a 4;
* **Resiliência de Rotas:** Criação preventiva de páginas e layouts para todas as rotas da barra lateral (`/`, `/avisos`, `/cantina`, `/repositorio`, `/vitrine`, `/historico`), impedindo falhas de navegação (erros 404).

### 4.2. Eliminação de Erros Estruturais e Otimizações de UX
Durante os testes de usabilidade e homologação visual, foram solucionados problemas técnicos de alta relevância:
1. **Mitigação de Cumulative Layout Shift (CLS) no Carrossel:** Anteriormente, o primeiro slide possuía mais linhas de texto que os demais, provocando uma dilatação vertical do card que empurrava o restante da página (Mural e Cantina) a cada troca de slide. O problema foi sanado com o estabelecimento de alturas mínimas ergonômicas (`minHeight: 6.2rem` para títulos e `4.8rem` para descrições), mantendo o card do Hero 100% estável.
2. **Controle de Tempo e Reset Reativo do Carrossel:** O ciclo de auto-slide foi calibrado para 9 segundos (tempo ideal para leitura confortável dos resumos), com implementação do gatilho `slideTimerKey`, que reinicia o temporizador do zero instantaneamente se o usuário navegar de forma manual pelos controles (`‹`, `›` ou marcadores).
3. **Desacoplamento Cinemático do Capelo Acadêmico:** O salto do capelo apresentava uma parada indesejada em 180° (ponta-cabeça) devido à aplicação de curvas cúbicas em keyframes intermediários. A animação foi decomposta em dois eixos paralelos: subida/descida vertical (`capTossVertical`) e rotação contínua direta de 0° a 360° (`capSpinFull`), eliminando qualquer travamento.
4. **Física Dinâmica de Queda no Mascote Institucional:** Implementação do componente `GaloWidget`, fixado no canto inferior esquerdo e estruturado em quadrado de cantos arredondados (`borderRadius: 12px`). Ao ser clicado, dispara penas com morfologia anatômica de ave em SVG e queda com oscilação 3D em perspectiva (`rotateY`), gerando trajetórias com direção e rotação aleatórias para evitar padronização estática.
5. **Padronização Visual e Unificação dos Cards da Home:** Harmonização dos botões de ação no cabeçalho dos cards com a classe `.btn-primary` e unificação dos containers de estado neutro (*empty state*) com borda tracejada e mensagens institucionais para o Mural de Avisos, Cantina Discente e Repositório Acadêmico, consolidando uma linguagem visual rigorosamente coesa na página inicial.
6. **Implementação de PWA e Identidade da Aba do Navegador:** Configuração do manifesto oficial do aplicativo web (`manifest.json`) com tema e cores institucionais (`#0284c7`), orientação vertical e suporte a ícones maskable (192px e 512px), além do favicon oficial do Galo FATEC integrado aos metadados do Next.js e ícone de toque para dispositivos Apple iOS (`apple-touch-icon.png`).

---

## 5. RESULTADOS ALCANÇADOS NA SPRINT 1

1. **Plataforma Totalmente Navegável e Estável:** O discente pode circular fluidamente entre as seções do portal sem nenhuma interrupção, solavanco de layout ou tela em branco;
2. **Hero Carrossel Dinâmico e Polido:** Transições estáveis a cada 9 segundos, sem quebras visuais e com widgets interativos táteis em SVG puro;
3. **Mural e Cantina Prontos para Consumo de API:** Telas estruturadas com estados neutros profissionais (*empty states* informativos), preparadas para receber a sincronização de dados do backend desenvolvido pelo colega Cesar;
4. **Alinhamento Institucional com o SIGA:** Inclusão do link oficial e direto para o login do SIGA Aluno (`https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx`) no rodapé e na central de acesso;
5. **Identidade Visual Autêntica:** Mascote e símbolos acadêmicos refinados, sem emojis amadores e com plena conformidade com as diretrizes do Centro Paula Souza;
6. **Prontidão para Instalação Multiplataforma (PWA):** O portal está habilitado com manifesto web e ícones responsivos, pronto para ser instalado como aplicativo nativo em smartphones Android/iOS e desktops.

---

## 6. CRONOGRAMA PROPOSITIVO PARA A SPRINT 2 (03/11 A 09/11/2026)
*(Atividades a serem executadas mediante alinhamento e autorização do discente Luis)*

* **Módulo Cantina Discente:** Integração com o catálogo dinâmico de produtos, exibição de imagens, cálculo de valor de compra e geração de QR Code Pix na tela;
* **Módulo Repositório Acadêmico:** Download de apostilas, roteiros e códigos organizados por semestre (1º ao 4º) e curso (IA / ESG);
* **Cache Offline PWA:** Configuração avançada de Service Workers com estratégias de cache para navegação offline das notas de aula;
* **Aprimoramentos de Acessibilidade:** Testes aprofundados com leitores de tela (NVDA/JAWS) e navegação integral por atalhos de teclado.

---

## 7. CONCLUSÃO

A Sprint 1 cumpriu integralmente os objetivos estabelecidos para as primeiras **66 horas** de estágio supervisionado do discente Luis. O portal atingiu um patamar de maturidade visual, técnica e funcional pronto para produção, com respeito irrestrito à identidade da FATEC Rio Claro, inclusão plena dos estudantes de IA e ESG e adesão aos mais rigorosos padrões de engenharia de software e usabilidade web.

