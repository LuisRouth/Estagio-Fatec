# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> Portal Integrado FATEC Rio Claro — Suíte E2E & Usabilidade Mobile >> 7. Jornada Completa de Estudo: Repositório -> Filtros -> Assistente IA RAG -> Vitrine de TCCs
- Location: tests\e2e\portal.spec.ts:114:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/ILP-113/i).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/ILP-113/i).first() with timeout 15000ms
  - waiting for getByText(/ILP-113/i).first()

```

```yaml
- banner:
  - link "Logotipo Oficial FATEC - Faculdade de Tecnologia Logotipo Oficial Centro Paula Souza":
    - /url: /
    - img "Logotipo Oficial FATEC - Faculdade de Tecnologia"
    - img "Logotipo Oficial Centro Paula Souza"
- complementary:
  - text: Portal FATEC Rio Claro Inteligência Artificial & Gestão ESG
  - navigation:
    - link "Início":
      - /url: /
    - link "Mural de Avisos":
      - /url: /avisos
    - link "Cantina Discente":
      - /url: /cantina
    - link "Repositório Acadêmico":
      - /url: /repositorio
    - link "Vitrine de Projetos":
      - /url: /vitrine
- main:
  - text: Central Didática Unificada IA & Gestão ESG
  - heading "Repositório Acadêmico & Acervo Didático" [level=1]
  - paragraph: Acesso centralizado a notas de aula, códigos no GitHub, apostilas e roteiros de laboratório organizados rigorosamente pela matriz curricular oficial do PPC da FATEC Rio Claro.
  - button "Publicar Material / Anexo":
    - img
    - text: Publicar Material / Anexo
  - button "Acervo Didático Geral (0)":
    - img
    - text: Acervo Didático Geral (0)
  - img
  - text: Assistente Acadêmico Inteligente Somente fontes verificadas
  - paragraph: Consulte apostilas, resumos e fontes das disciplinas sem precisar folhear arquivo por arquivo.
  - button "Ocultar Assistente":
    - text: Ocultar Assistente
    - img
  - text: "Sugestões de Dúvidas Acadêmicas:"
  - button "Aprendemos linguagem de programação no curso de IA?"
  - button "Há disciplina de Inglês no curso de IA?"
  - button "Onde estudar material sobre Banco de Dados?"
  - button "Para criar uma aplicação de rotas de entrega de mercadorias, quais matérias e materiais devo estudar?"
  - 'textbox "Digite sua dúvida acadêmica (ex: Aprendemos linguagem de programação no curso de IA?)"': O que aprendemos em Python no 1º semestre de IA?
  - button "Pesquisando no Acervo..." [disabled]
  - button "Todos os Cursos 67"
  - button "Inteligência Artificial (38)"
  - button "Gestão ESG (29)"
  - textbox "Buscar disciplina, código, título ou tag..."
  - text: "Semestre:"
  - button "Todos"
  - button "1º Sem"
  - button "2º Sem"
  - button "3º Sem"
  - button "4º Sem"
  - text: "Tipo:"
  - button "Todos"
  - button "Apostilas"
  - button "Códigos"
  - button "Slides"
  - button "Datasets"
  - button "Expandir Grade Curricular por Semestres 67 Disciplinas Oficiais":
    - img
    - text: Expandir Grade Curricular por Semestres
    - button "67 Disciplinas Oficiais"
    - img
  - text: Carregando materiais do acervo acadêmico...
- contentinfo:
  - img "Logotipo Oficial FATEC - Faculdade de Tecnologia"
  - img "Logotipo Oficial Centro Paula Souza"
  - paragraph: Portal Integrado FATEC Rio Claro. Ambiente digital para os estudantes dos cursos de Inteligência Artificial e Gestão ESG. Faculdade de Tecnologia de Rio Claro — Prof. Álvares Gracioli.
  - text: Sistemas Institucionais
  - list:
    - listitem:
      - link "SIGA Aluno (Acesso ao Sistema Acadêmico)":
        - /url: https://siga.cps.sp.gov.br/sigaaluno/applogin.aspx
    - listitem:
      - link "Portal Centro Paula Souza":
        - /url: https://www.cps.sp.gov.br/
    - listitem:
      - link "Vestibular FATEC":
        - /url: https://www.vestibularfatec.com.br
    - listitem:
      - link "Site FATEC Rio Claro":
        - /url: https://fatecrioclaro.cps.sp.gov.br/
  - text: "Unidade FATEC Rio Claro Av. 46, 177 - Santa Cruz Rio Claro - SP, CEP 13500-000 Telefone: (19) 3524-7474 E-mail: contato@fatecrioclaro.edu.br Portal Acadêmico dos Estudantes • FATEC Rio Claro • Centro Paula Souza Termos de Uso • Contato da Coordenação • Suporte ao Estudante"
- button "FATEC Rio Claro":
  - img "FATEC Rio Claro"
- alert
```

# Test source

```ts
  32  |     await expect(page.getByText(/Utilize seu e-mail institucional oficial/i)).toBeVisible();
  33  |   });
  34  | 
  35  |   test('3. Tela de Cadastro deve exibir medidor de força de senha e seleção de curso IA/ESG', async ({ page }) => {
  36  |     await page.goto('/cadastro');
  37  |     await expect(page.locator('h1')).toContainText('Cadastro de Estudante');
  38  | 
  39  |     await page.fill('#senha', 'Fatec@2026');
  40  |     await expect(page.getByText('Forte e Segura')).toBeVisible();
  41  |   });
  42  | 
  43  |   test('4. Endpoints de Diagnóstico (/api/health, /api/ai/status e /api/ai/rag) devem responder HTTP 200', async ({ request }) => {
  44  |     const healthRes = await request.get('/api/health');
  45  |     expect(healthRes.ok()).toBeTruthy();
  46  |     const healthJson = await healthRes.json();
  47  |     expect(healthJson.status).toBe('UP');
  48  | 
  49  |     const aiRes = await request.get('/api/ai/status');
  50  |     expect(aiRes.ok()).toBeTruthy();
  51  |     const aiJson = await aiRes.json();
  52  |     expect(aiJson.success).toBe(true);
  53  | 
  54  |     const ragRes = await request.post('/api/ai/rag', {
  55  |       data: {
  56  |         question: 'O que aprendemos em Python no 1º semestre de IA?',
  57  |         course: 'IA',
  58  |         semester: 1,
  59  |       },
  60  |     });
  61  |     expect(ragRes.ok()).toBeTruthy();
  62  |     const ragJson = await ragRes.json();
  63  |     expect(ragJson.success).toBe(true);
  64  |     expect(ragJson.data.answer).toContain('ILP-113'); // resposta ancorada na matriz curricular real
  65  |     expect(Array.isArray(ragJson.data.sources)).toBe(true); // cards só existem se houver material cadastrado
  66  |   });
  67  | 
  68  |   test('5. Usabilidade Mobile (390x844) — Jornada de Alunos dos Semestres Iniciais (1º e 2º Semestres)', async ({ page }) => {
  69  |     // Simula viewport de smartphone moderno (iPhone 14 / Android equivalente)
  70  |     await page.setViewportSize({ width: 390, height: 844 });
  71  | 
  72  |     // A) Navegação Mobile no Repositório e Uso do Assistente IA RAG para o 1º Semestre
  73  |     await page.goto('/repositorio');
  74  |     await expect(page.locator('h1')).toContainText('Repositório Acadêmico');
  75  |     await expect(page.getByText('Assistente Acadêmico Inteligente')).toBeVisible();
  76  | 
  77  |     const btnSem1 = page.getByRole('button', { name: '1º Sem' });
  78  |     await btnSem1.click();
  79  |     await expect(btnSem1).toBeVisible();
  80  | 
  81  |     // B) Navegação Mobile na Cantina Discente (Seleção de Produto e Carrinho Flutuante)
  82  |     await page.goto('/cantina');
  83  |     await expect(page.locator('h1')).toContainText('Cantina Discente');
  84  |   });
  85  | 
  86  |   test('6. Jornada Completa de Compra: Login -> Cantina -> Carrinho -> Checkout Pix -> Histórico', async ({ page }) => {
  87  |     // 1. Login com aluno seedado
  88  |     await page.goto('/login');
  89  |     await page.fill('#email', 'lucas.mendes@aluno.cps.sp.gov.br');
  90  |     await page.fill('#senha', 'Fatec@2026');
  91  |     await page.click('button[type="submit"]');
  92  |     await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  93  | 
  94  |     // 2. Acessar a Cantina e adicionar um produto disponível ao carrinho
  95  |     await page.goto('/cantina');
  96  |     await expect(page.locator('h1')).toContainText('Cantina Discente');
  97  |     const addButtons = page.getByRole('button', { name: /\+ Adicionar/i });
  98  |     await expect(addButtons.first()).toBeVisible({ timeout: 15000 });
  99  |     await addButtons.first().click();
  100 | 
  101 |     // 3. Finalizar pedido e gerar Pix Dinâmico
  102 |     const checkoutBtn = page.getByRole('button', { name: /Finalizar e Gerar Pix/i });
  103 |     await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
  104 |     await checkoutBtn.click();
  105 | 
  106 |     // 4. Verificar geração do Pix Copia-e-Cola no modal de checkout
  107 |     await expect(page.getByText(/Pix Copia e Cola|QR Code|Aguardando Pagamento/i).first()).toBeVisible({ timeout: 15000 });
  108 | 
  109 |     // 5. Conferir registro no Histórico de compras
  110 |     await page.goto('/historico');
  111 |     await expect(page.locator('h1')).toContainText(/Histórico/i);
  112 |   });
  113 | 
  114 |   test('7. Jornada Completa de Estudo: Repositório -> Filtros -> Assistente IA RAG -> Vitrine de TCCs', async ({ page }) => {
  115 |     // 1. Acessar Repositório Acadêmico e aplicar filtros de curso e semestre
  116 |     await page.goto('/repositorio');
  117 |     await expect(page.locator('h1')).toContainText('Repositório Acadêmico');
  118 |     await page.getByRole('button', { name: '1º Sem' }).click();
  119 | 
  120 |     // 2. Abrir o Assistente Acadêmico Inteligente (RAG) e realizar pergunta
  121 |     const toggleRagBtn = page.getByRole('button', { name: /Consultar via IA|Ocultar Assistente/i });
  122 |     if (await toggleRagBtn.isVisible()) {
  123 |       const text = await toggleRagBtn.textContent();
  124 |       if (text && text.includes('Consultar via IA')) {
  125 |         await toggleRagBtn.click();
  126 |       }
  127 |     }
  128 |     const ragInput = page.getByPlaceholder(/Digite sua dúvida acadêmica/i);
  129 |     await expect(ragInput).toBeVisible({ timeout: 10000 });
  130 |     await ragInput.fill('O que aprendemos em Python no 1º semestre de IA?');
  131 |     await page.getByRole('button', { name: /Perguntar ao Assistente/i }).click();
> 132 |     await expect(page.getByText(/ILP-113/i).first()).toBeVisible({ timeout: 15000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  133 | 
  134 |     // 3. Navegar para Vitrine de TCCs
  135 |     await page.goto('/vitrine');
  136 |     await expect(page.locator('h1')).toContainText(/Vitrine/i);
  137 |   });
  138 | });
  139 | 
```