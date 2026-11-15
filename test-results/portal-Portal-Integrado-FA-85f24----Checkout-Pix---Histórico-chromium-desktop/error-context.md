# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.ts >> Portal Integrado FATEC Rio Claro — Suíte E2E & Usabilidade Mobile >> 6. Jornada Completa de Compra: Login -> Cantina -> Carrinho -> Checkout Pix -> Histórico
- Location: tests\e2e\portal.spec.ts:86:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - link "← Voltar ao Início" [ref=e5] [cursor=pointer]:
        - /url: /
      - generic [ref=e6]: FATEC Rio Claro
    - generic [ref=e7]:
      - generic [ref=e9]:
        - img "Logotipo Oficial FATEC - Faculdade de Tecnologia" [ref=e10]
        - img "Logotipo Oficial Centro Paula Souza" [ref=e12]
      - heading "Portal do Aluno" [level=1] [ref=e13]
      - paragraph [ref=e14]: Identifique-se com suas credenciais institucionais
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: E-mail Institucional
          - generic [ref=e19]: ✓ E-mail oficial verificado
        - textbox "E-mail Institucional" [ref=e20]:
          - /placeholder: "ex: seu.nome@aluno.cps.sp.gov.br"
          - text: lucas.mendes@aluno.cps.sp.gov.br
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: Senha de Acesso
          - link "Esqueceu a senha?" [ref=e24] [cursor=pointer]:
            - /url: /recuperar-senha
        - generic [ref=e25]:
          - textbox "Senha de Acesso" [ref=e26]:
            - /placeholder: Sua senha segura
            - text: Fatec@2026
          - button "Mostrar" [ref=e27] [cursor=pointer]
      - button "Validando acesso..." [disabled] [ref=e28]
    - generic [ref=e29]:
      - text: Primeiro acesso no campus?
      - link "Criar meu cadastro discente" [ref=e30] [cursor=pointer]:
        - /url: /cadastro
  - alert [ref=e31]
```

# Test source

```ts
  1   | // ====================================================================
  2   | // TESTES END-TO-END (E2E) & USABILIDADE MOBILE — PLAYWRIGHT
  3   | // Responsável: Guilherme (DevOps, IA & QA)
  4   | // ====================================================================
  5   | 
  6   | import { test, expect } from '@playwright/test';
  7   | 
  8   | test.describe('Portal Integrado FATEC Rio Claro — Suíte E2E & Usabilidade Mobile', () => {
  9   |   test('1. Home Page deve carregar Hero Carrossel, alternador IA/ESG e seções principais sem CLS', async ({ page }) => {
  10  |     await page.goto('/');
  11  |     await expect(page.locator('h1')).toContainText('Portal Integrado dos Estudantes');
  12  | 
  13  |     // Alternar entre Inteligência Artificial (Matutino) e Gestão ESG (Noturno)
  14  |     const btnESG = page.getByRole('button', { name: /Gestão ESG/i });
  15  |     await btnESG.click();
  16  |     await expect(btnESG).toBeVisible();
  17  | 
  18  |     // Verificar seções de Mural de Avisos, Cantina Discente e Repositório Acadêmico
  19  |     await expect(page.getByText('Mural de Avisos e Comunicados Oficiais')).toBeVisible();
  20  |     await expect(page.getByText('Cantina Discente')).toBeVisible();
  21  |     await expect(page.getByText('Repositório Acadêmico')).toBeVisible();
  22  |   });
  23  | 
  24  |   test('2. Tela de Login deve validar domínio institucional @aluno.cps.sp.gov.br', async ({ page }) => {
  25  |     await page.goto('/login');
  26  |     await expect(page.locator('h1')).toContainText('Portal do Aluno');
  27  | 
  28  |     await page.fill('#email', 'usuario@gmail.com');
  29  |     await page.fill('#senha', 'Fatec@2026');
  30  |     await page.click('button[type="submit"]');
  31  | 
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
> 92  |     await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 15000ms exceeded.
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
  132 |     await expect(page.getByText(/ILP-113/i).first()).toBeVisible({ timeout: 15000 });
  133 | 
  134 |     // 3. Navegar para Vitrine de TCCs
  135 |     await page.goto('/vitrine');
  136 |     await expect(page.locator('h1')).toContainText(/Vitrine/i);
  137 |   });
  138 | });
  139 | 
```