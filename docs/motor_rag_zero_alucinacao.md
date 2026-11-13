# Motor de IA RAG "Zero Alucinação" — Repositório Acadêmico

> Responsável técnico: Guilherme (IA & QA). Código: `src/lib/rag-engine.ts`, `src/lib/curriculum.ts`, adaptador em `src/lib/gemini.ts`, endpoint `POST /api/ai/rag`.

## 1. Por que o motor antigo alucinava (análise de causa-raiz)

| # | Causa | Efeito observado |
|---|-------|------------------|
| 1 | Existia uma "base de conhecimento" escrita à mão com **PDFs, repositórios GitHub e ementas fictícios** (ex.: `fatec-rc/ia-python-sem1`). | Cards/links para materiais que nunca existiram (erro 404 ao abrir). |
| 2 | Respostas "prontas" por assunto (matemática, banco de dados, programação, rotas, ESG, inglês) com **códigos de disciplina e conteúdos inventados** (`ICD-010`, `IAL-010`, `IPE-010`…) que **não existem na matriz** do portal, além de descrições de ementa não verificadas. | Respostas "bonitas", porém erradas; contradição com a Grade Curricular exibida no próprio site. |
| 3 | Busca lexical frouxa (`includes` de substring, qualquer pontuação > 0 virava "fonte"). | "Construção civil" retornava *Projetos Ágeis IV*. |
| 4 | Sem validação de escopo (a unidade só tem IA e Gestão ESG) e sem tolerância a erro de digitação. | Tentava responder o que está fora do escopo; "cursoo" quebrava a busca. |
| 5 | O LLM, quando ativo, recebia instruções que **mandavam citar** disciplinas/códigos que ele não via nas fontes. | Alucinação induzida pelo próprio prompt. |

## 2. Princípios da nova arquitetura

1. **Fontes de verdade únicas e verificáveis**
   * Matriz curricular oficial: `src/lib/curriculum.ts` (a mesma usada na tela do Repositório).
   * Materiais **realmente cadastrados e aprovados** (Repositório Acadêmico e Vitrine de Projetos).
2. **O texto da resposta é montado por código a partir desses dados.** Nenhum modelo generativo escreve a resposta exibida ao aluno.
3. **Gemini (opcional) só classifica a intenção**: escolhe IDs de uma lista fechada (`CONCEPT_CATALOG` / `RECIPE_CATALOG`); qualquer ID fora da lista é descartado. Só é chamado quando a busca determinística não entendeu a pergunta.
4. **Nada é citado se não existir**: códigos de disciplinas são validados por teste automatizado contra a matriz; cards só aparecem para materiais reais; duplicados são removidos.
5. **Honestidade explícita**
   * Fora do escopo (ex.: construção civil, medicina) → informa que a unidade só tem IA e Gestão ESG, sem cards.
   * Sem correspondência → "Não compreendi…", pede para reformular e dá exemplos, sem cards.
   * Disciplina sem material cadastrado → aviso de indisponibilidade.
   * Ementa só é mostrada se um docente cadastrou o material; caso contrário o assistente informa que o portal só tem nome/código/semestre/carga horária.
6. **Cruzamento lógico (trilhas de projeto)**: receitas curadas (`RECIPE_CATALOG`) descrevem a *necessidade* de cada etapa do projeto e apontam disciplinas **reais**; incluem aviso de suficiência e leituras complementares externas (ex.: APIs de mapas, OR-Tools). A matriz não tem disciplina de desenvolvimento web nem de PLN — o assistente avisa isso.
7. **Definições universais** (ex.: significado de ESG, escopos 1/2/3) vêm de um glossário mínimo e são **sempre rotuladas** como "não extraídas de material do acervo".

## 3. Pipeline de uma pergunta

```
pergunta
  ├─ escopo institucional? ── sim ─▶ "Só temos IA e Gestão ESG" (sem cards)
  ├─ normalização (acentos, plural, letras repetidas, stop words) + tolerância a erros de digitação
  ├─ filtros implícitos: curso (IA/ESG) e semestre ("3º semestre")
  ├─ conceitos + disciplinas citadas (códigos validados na matriz)
  ├─ trilha de projeto (verbo "criar/desenvolver…" + receita)
  ├─ material citado pelo nome (ex.: "DWH Saúde RC")
  ├─ disciplinas relacionadas + materiais reais (aulas / projetos)
  ├─ listagem da grade por curso/semestre
  └─ nada confiável ─▶ "Não compreendi…" + exemplos (sem cards)
        └─ (opcional) Gemini classifica a intenção em IDs da lista fechada e a busca é refeita
```

## 4. Testes que impedem regressão

* `tests/unit/rag_engine.test.ts` (25 testes): integridade dos códigos, ausência de documentos fictícios no corpus, construção civil, inglês com "cursoo", banco de dados, matemática ("Cálculo" inexistente na matriz), trilha de rotas, perguntas sem sentido, busca por projeto real, ausência de cards sem material.
* `tests/e2e/portal.spec.ts`: o endpoint `/api/ai/rag` precisa citar `ILP-113` (matriz real) para Python no 1º semestre.

## 5. Como melhorar as respostas (sem arriscar alucinação)

O assistente é tão detalhado quanto o acervo. Para respostas mais ricas, **docentes devem cadastrar o plano de ensino / apostila de cada disciplina** no Repositório Acadêmico, informando corretamente *Disciplina*, *Curso* e *Semestre*. O motor passa a citar esse material automaticamente, com descrição e links reais.

