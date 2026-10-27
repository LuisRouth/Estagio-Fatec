# Portal Integrado FATEC Rio Claro

**Projeto de Estágio Curricular Supervisionado**  
**Orientador:** Prof. Orlando  
**Equipe:**
- **Cesar:** Arquitetura Backend, Segurança e Banco de Dados
- **Luis:** Engenharia Frontend, UI/UX Design e PWA Multiplataforma
- **Guilherme:** Inteligência Artificial, DevOps e QA / Testes

---

## 🎯 Sobre o Projeto

Plataforma web unificada e multiplataforma desenvolvida para atender às demandas discentes dos cursos de **Inteligência Artificial (Matutino)** e **Gestão ESG (Noturno)** da FATEC Rio Claro, estruturada sobre três eixos:
1. **Cantina Discente (*Honest Market*):** Catálogo atualizado em tempo real, geração de chave Pix com valor dinâmico, validação inteligente de comprovante e histórico pessoal.
2. **Repositório Acadêmico & Vitrine de Projetos:** Centralização de notas de aula, códigos-fonte, datasets e exibição de TCCs e projetos práticos.
3. **Comunicação Institucional & CA:** Painel unificado de avisos e prazos críticos.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js v20+ ou v24+
* Git / GitHub Desktop

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```
*Por padrão, o portal opera em modo híbrido (`USE_MOCK_DB=true`), permitindo testes imediatos de autenticação e dados sem necessidade de instalar um banco PostgreSQL local.*

### 4. Executando os Testes do Backend (Sprint 1)
```bash
node scripts/test_backend.js
```

### 5. Iniciando o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse no navegador: `http://localhost:3000`

---

## 📚 Documentação do Projeto

* [Plano Mestre de Projeto e Matriz de 200h](docs/relatorio_estagio_sprint1_cesar.md)
* [Diagrama Entidade-Relacionamento e Dicionário de Dados](database/der.md)
* [Especificação de Arquitetura, Segurança e Hospedagem](docs/arquitetura_seguranca.md)
* [Relatório Individual de Atividades - Cesar (Sprint 1)](docs/relatorio_estagio_sprint1_cesar.md)

---
*Observação: Conforme diretrizes institucionais, todos os commits e sincronizações no GitHub são realizados manualmente pelos integrantes da equipe via GitHub Desktop.*