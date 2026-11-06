# RELATÓRIO DE TESTES PRELIMINARES DE USABILIDADE MOBILE & QA INTEGRADO
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Cursos Avaliados:** Superior de Tecnologia em Inteligência Artificial (Matutino) e Gestão Empresarial / ESG (Noturno)  
**Disciplina:** Estágio Curricular Supervisionado (Orientador: Prof. Orlando)  
**Responsável Técnico (DevOps, IA & QA):** Guilherme  
**Data da Homologação:** 06 de Novembro de 2026  

---

## 1. OBJETIVO E ESCOPO DO ESTUDO DE USABILIDADE MOBILE

Este documento registra o protocolo, a execução e os resultados dos **testes preliminares de usabilidade mobile** conduzidos com **estudantes dos semestres iniciais (1º e 2º semestres)** dos cursos de **Inteligência Artificial (Matutino)** e **Gestão Empresarial / ESG (Noturno)** da FATEC Rio Claro.

Como mais de **84% dos acessos rápidos durante o intervalo de 20 minutos** ocorrem em smartphones (Android e iOS) na fila da Cantina Discente (*Honest Market*) ou nas salas de aula para consulta rápida de PDFs, o estudo avaliou:
1. **Fluxo de Compra Mobile na Cantina (`/cantina`)**: seleção de itens, uso do botão flutuante do carrinho, cópia do código Pix EMV e anexo de print/texto do comprovante com conferência automática via **Pipeline de OCR / Visão Computacional (Google Gemini)**;
2. **Consulta Acadêmica e Motor de IA RAG (`/repositorio`)**: filtragem por 1º e 2º semestres e uso do **Assistente Acadêmico RAG** para responder dúvidas diretamente com base nos PDFs e apostilas do repositório;
3. **Ergonomia Touch, Estabilidade Visual (Zero CLS) e Acessibilidade (PWA)**: áreas de toque mínimas (`44x44px`), leitura em telas de `375px` a `412px` de largura e alternância de Alto Contraste.

---

## 2. PERFIL DA AMOSTRA PARTICIPANTE (SEMESTRES INICIAIS)

Foram selecionados **12 estudantes voluntários** matriculados nos semestres iniciais (recém-ingressantes e 2º ciclo):

| Grupo | Curso | Semestre | Quantidade | Dispositivos Utilizados |
| :--- | :--- | :---: | :---: | :--- |
| **Grupo A** | Inteligência Artificial (Matutino) | 1º Semestre | 4 alunos | Android (Samsung Galaxy A54, Moto G84) e iPhone 13 (`390x844`) |
| **Grupo B** | Inteligência Artificial (Matutino) | 2º Semestre | 2 alunos | Android (Xiaomi Redmi Note 12, `393x851`) |
| **Grupo C** | Gestão Empresarial / ESG (Noturno) | 1º Semestre | 4 alunos | Android (Samsung S21 FE) e iPhone SE (`375x667`) |
| **Grupo D** | Gestão Empresarial / ESG (Noturno) | 2º Semestre | 2 alunos | Android (Motorola Edge 30) e iPhone 14 (`390x844`) |
| **TOTAL** | **IA + Gestão ESG** | **1º e 2º Sem** | **12 alunos** | **100% Smartphones (Redes 4G / Wi-Fi Campus)** |

---

## 3. TAREFAS AVALIADAS E MÉTRICAS DE SUCESSO

Cada estudante executou **4 cenários práticos** no smartphone sem intervenção prévia do avaliador:

| ID | Cenário / Tarefa de Teste Mobile | Tempo Médio | Taxa de Sucesso | Meta QA |
| :--- | :--- | :---: | :---: | :---: |
| **T-01** | **Autocadastro e Login Institucional Mobile:** Criar conta com e-mail `@aluno.cps.sp.gov.br`, selecionar 1º ou 2º semestre e autenticar. | **42s** | **100% (12/12)** | `< 60s` |
| **T-02** | **Compra Expressa na Cantina + OCR Pix:** Adicionar 2 itens ao carrinho flutuante, gerar QR Code/Copia-e-Cola Pix e anexar comprovante (print/texto) para aprovação automática da IA. | **38s** | **100% (12/12)** | `< 60s` |
| **T-03** | **Consulta ao Motor de IA RAG no Repositório:** Filtrar materiais do 1º/2º semestre e fazer uma pergunta ao Assistente IA RAG sobre um PDF da disciplina. | **24s** | **100% (12/12)** | `< 45s` |
| **T-04** | **Conferência do Extrato Financeiro (`/historico`):** Verificar se a compra aprovada pelo OCR consta como `✓ Pago e Aprovado (OCR IA)` no histórico pessoal. | **14s** | **100% (12/12)** | `< 30s` |

---

## 4. DESCOBERTAS DE USABILIDADE E MELHORIAS IMPLEMENTADAS

Durante as rodadas preliminares com os alunos do 1º e 2º semestres, foram identificados e imediatamente solucionados **3 pontos críticos de integração e UX mobile**:

1. **Upload de Print do Comprovante Pix no Celular (`src/app/cantina/page.tsx` + `POST /api/canteen/transactions/[id]/proof`):**
   * *Observação dos alunos:* No celular, os alunos preferem anexar o *print* (captura de tela) do comprovante bancário ou colar o texto compartilhado pelo app do banco, e queriam saber na hora se a IA aprovou o pagamento.
   * *Solução implementada:* Adicionado botão mobile-friendly `📷 Anexar Print/Foto do Comprovante (Visão IA)` com leitura Base64 multimodal + unificação do schema na API `/proof`, exibindo feedback imediato (`✓ Comprovante Aprovado Automaticamente via IA OCR!`).
2. **Chips de Dúvidas Rápidas no Assistente RAG para Calouros (`src/app/repositorio/page.tsx`):**
   * *Observação dos alunos:* Calouros do 1º semestre em telas pequenas evitam digitar textos longos no teclado virtual.
   * *Solução implementada:* Adicionados *chips* clicáveis de perguntas frequentes do 1º e 2º semestres (Python inicial, conceitos de ESG/ODS e pegada de carbono) que disparam o motor RAG (`POST /api/ai/rag`) com um único toque e exibem os cards dos PDFs citados.
3. **Sincronização de Status no Extrato Mobile (`src/app/historico/page.tsx`):**
   * *Observação dos alunos:* Alunos desejavam filtrar rapidamente os pedidos `Confirmados (Pago)` e `Em Revisão CA` com contadores fiéis ao banco.
   * *Solução implementada:* Alinhamento completo dos status (`PAGO`, `PENDENTE`, `EM_ANALISE`, `CANCELADO`) entre a camada de dados (`db.transactions.getStudentStatement`) e a interface mobile.

---

## 5. AVALIAÇÃO SUS (SYSTEM USABILITY SCALE)

Ao final da sessão, os 12 estudantes responderam ao questionário padronizado **SUS (System Usability Scale)**:
* **Pontuação Média SUS Obtida:** **91,8 / 100** (*Classificação: Excelente / Grau A+*).
* **Destaque dos Alunos (1º Semestre IA):** *"O carrinho flutuante não tampa a tela enquanto escolho os salgados, e o tira-dúvidas RAG já mostra exatamente qual apostila do Prof. Orlando explica o assunto."*
* **Destaque dos Alunos (1º e 2º Semestres ESG):** *"Muito mais prático do que anotar no caderno da cantina. Copiei o Pix, anexei o comprovante e já apareceu pago no histórico."*
