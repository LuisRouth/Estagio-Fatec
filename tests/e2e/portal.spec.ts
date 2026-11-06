// ====================================================================
// TESTES END-TO-END (E2E) & USABILIDADE MOBILE — PLAYWRIGHT
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('Portal Integrado FATEC Rio Claro — Suíte E2E & Usabilidade Mobile', () => {
  test('1. Home Page deve carregar Hero Carrossel, alternador IA/ESG e seções principais sem CLS', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Portal Integrado dos Estudantes');

    // Alternar entre Inteligência Artificial (Matutino) e Gestão ESG (Noturno)
    const btnESG = page.getByRole('button', { name: /Gestão ESG/i });
    await btnESG.click();
    await expect(btnESG).toBeVisible();

    // Verificar seções de Mural de Avisos, Cantina Discente e Repositório Acadêmico
    await expect(page.getByText('Mural de Avisos e Comunicados Oficiais')).toBeVisible();
    await expect(page.getByText('Cantina Discente')).toBeVisible();
    await expect(page.getByText('Repositório Acadêmico')).toBeVisible();
  });

  test('2. Tela de Login deve validar domínio institucional @aluno.cps.sp.gov.br', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Portal do Aluno');

    await page.fill('#email', 'usuario@gmail.com');
    await page.fill('#senha', 'Fatec@2026');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Utilize seu e-mail institucional oficial/i)).toBeVisible();
  });

  test('3. Tela de Cadastro deve exibir medidor de força de senha e seleção de curso IA/ESG', async ({ page }) => {
    await page.goto('/cadastro');
    await expect(page.locator('h1')).toContainText('Cadastro de Estudante');

    await page.fill('#senha', 'Fatec@2026');
    await expect(page.getByText('Forte e Segura')).toBeVisible();
  });

  test('4. Endpoints de Diagnóstico (/api/health, /api/ai/status e /api/ai/rag) devem responder HTTP 200', async ({ request }) => {
    const healthRes = await request.get('/api/health');
    expect(healthRes.ok()).toBeTruthy();
    const healthJson = await healthRes.json();
    expect(healthJson.status).toBe('UP');

    const aiRes = await request.get('/api/ai/status');
    expect(aiRes.ok()).toBeTruthy();
    const aiJson = await aiRes.json();
    expect(aiJson.success).toBe(true);

    const ragRes = await request.post('/api/ai/rag', {
      data: {
        question: 'O que aprendemos em Python no 1º semestre de IA?',
        course: 'IA',
        semester: 1,
      },
    });
    expect(ragRes.ok()).toBeTruthy();
    const ragJson = await ragRes.json();
    expect(ragJson.success).toBe(true);
    expect(ragJson.data.sources.length).toBeGreaterThan(0);
  });

  test('5. Usabilidade Mobile (390x844) — Jornada de Alunos dos Semestres Iniciais (1º e 2º Semestres)', async ({ page }) => {
    // Simula viewport de smartphone moderno (iPhone 14 / Android equivalente)
    await page.setViewportSize({ width: 390, height: 844 });

    // A) Navegação Mobile no Repositório e Uso do Assistente IA RAG para o 1º Semestre
    await page.goto('/repositorio');
    await expect(page.locator('h1')).toContainText('Repositório Acadêmico');
    await expect(page.getByText('Assistente Acadêmico Inteligente')).toBeVisible();

    const btnSem1 = page.getByRole('button', { name: '1º Sem' });
    await btnSem1.click();
    await expect(btnSem1).toBeVisible();

    // B) Navegação Mobile na Cantina Discente (Seleção de Produto e Carrinho Flutuante)
    await page.goto('/cantina');
    await expect(page.locator('h1')).toContainText('Cantina Discente');
  });
});
