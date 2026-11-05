# RELATÓRIO INDIVIDUAL DE ATIVIDADES DE ESTÁGIO SUPERVISIONADO — SPRINT 2
**Instituição:** Faculdade de Tecnologia de Rio Claro — FATEC Rio Claro  
**Curso:** Superior de Tecnologia em Inteligência Artificial  
**Disciplina:** Estágio Curricular Supervisionado  
**Docente Orientador:** Prof. Orlando  
**Discente / Estagiário:** Luis  
**Carga Horária da Sprint 2:** 67 horas cumpridas (Total acumulado: 133h / Meta: 200h)  
**Período de Execução:** 03 de Novembro a 09 de Novembro de 2026  
**Papel no Projeto:** Engenharia Frontend, UI/UX Design, Acessibilidade Digital e PWA Multiplataforma  

---

## 1. INTRODUÇÃO E OBJETIVO DA SPRINT 2

A presente etapa documenta o ciclo de desenvolvimento das **funcionalidades centrais da interface (Módulos Core)** do *Portal Integrado da FATEC Rio Claro*, sob responsabilidade do discente **Luis**.

O foco da Sprint 2 foi transformar a fundação do design system em módulos de interação real para os discentes dos cursos de **Inteligência Artificial (Matutino)** e **Gestão ESG (Noturno)**, atendendo diretamente aos quatro gargalos apontados no levantamento com 38 discentes:
1. **Cantina Discente (*Honest Market*):** Catálogo dinâmico com fotos, badges de estoque em tempo real, carrinho de compras e filtros por categoria;
2. **Checkout Express & Pix Dinâmico:** Modal de checkout conectado à API BACEN (EMV) com renderização de QR Code instantâneo, botão "Copiar Chave" e formulário de submissão do comprovante/E2E;
3. **Repositório Acadêmico Unificado:** Interface de busca e acervo com filtros combinados (curso IA/ESG, semestre 1º ao 4º, formato do material) e modal para envio/upload de materiais didáticos e projetos de TCC;
4. **Painel discente "Meu Histórico":** Extrato financeiro pessoal, métricas de consumo consolidado e rastreabilidade dos pedidos pagos na cantina discente.

---

## 2. DISCRIMINAÇÃO DETALHADA DAS ATIVIDADES E CARGA HORÁRIA (67 HORAS)

| ID | Atividade Realizada | Horas | Evidência / Artefato Produzido |
| :--- | :--- | :---: | :--- |
| **ACT-FE-07** | **Design e Implementação do Catálogo da Cantina Discente:** Construção da interface em `/cantina` com grade responsiva de produtos, badges de estoque em tempo real (disponível, baixa quantidade e esgotado), busca instantânea, filtragem por categorias e drawer de carrinho móvel. | **18h** | [`src/app/cantina/page.tsx`](file:///C:/Users/LUISOTAVIOROUTHDASIL/Documents/GitHub/Estagio-Fatec/src/app/cantina/page.tsx). |
| **ACT-FE-08** | **Modal de Checkout Express e Integração com Pix Dinâmico:** Desenvolvimento do modal de checkout com integração à rota `/api/canteen/checkout`, renderização de QR Code Pix gerado sob demanda, botão Copia-e-Cola e envio de comprovante bancário/E2E. | **16h** | [`src/app/cantina/page.tsx`](file:///C:/Users/LUISOTAVIOROUTHDASIL/Documents/GitHub/Estagio-Fatec/src/app/cantina/page.tsx). |
| **ACT-FE-09** | **Interface do Repositório Acadêmico e Vitrine de TCC:** Construção da página `/repositorio` com seleção visual por curso (IA/ESG) e semestre (1º a 4º), listagem por categorias de materiais (Apostilas, Códigos, Slides, TCCs, Datasets), contabilizador de downloads e modal completo de publicação discente. | **17h** | [`src/app/repositorio/page.tsx`](file:///C:/Users/LUISOTAVIOROUTHDASIL/Documents/GitHub/Estagio-Fatec/src/app/repositorio/page.tsx). |
| **ACT-FE-10** | **Painel "Meu Histórico" de Consumo:** Desenvolvimento de `/historico` com cards de totais consumidos, pedidos aprovados e pendentes, listagem detalhada dos itens de cada transação Pix e acompanhamento de auditoria discente. | **16h** | [`src/app/historico/page.tsx`](file:///C:/Users/LUISOTAVIOROUTHDASIL/Documents/GitHub/Estagio-Fatec/src/app/historico/page.tsx). |
| **TOTAL** | **Carga Horária Cumprida na Sprint 2** | **67h** | **Total Acumulado: 133h / Meta: 200h (66,5% concluído)** |

---

## 3. RESULTADOS TÉCNICOS ALCANÇADOS NA SPRINT 2

1. **Ciclo de Compra Autônomo Completo:** O aluno pode acessar a cantina, escolher os produtos, conferir o estoque no expositor digital, gerar a cobrança Pix com o valor exato no padrão BACEN e anexar a autenticação.
2. **Centralização Didática Efetiva:** Os alunos de IA e ESG agora possuem um único ponto de consulta para cadernos Jupyter (`.ipynb`), apostilas e slides, com links integrados aos repositórios do GitHub.
3. **Controle Financeiro Discente:** Transparência completa no extrato discente em `/historico`, garantindo conformidade com os princípios da disciplina e do orientador Prof. Orlando.
4. **Homologação Técnica de Build e QA:** Compilação limpa em todas as 29 rotas da aplicação Next.js e 29 testes automatizados aprovados na suíte de testes.

---

## 4. PRÓXIMOS PASSOS (SPRINT 3 — 10/11 A 16/11/2026)
* Dashboard Administrativo do Centro Acadêmico (gestão de catálogo, aprovação de materiais e auditoria financeira);
* Testes de ponta a ponta (E2E) com Playwright e otimização Lighthouse (score > 90);
* Conclusão dos relatórios finais de 200h para homologação da banca do Prof. Orlando.

---
**Assinatura do Discente:** Luis  
**Visto do Orientador:** Prof. Orlando
