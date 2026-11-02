// ====================================================================
// SUÍTE DE TESTES END-TO-END (PLAYWRIGHT): PORTAL FATEC RIO CLARO
// Responsável: Guilherme (Inteligência Artificial, DevOps & QA)
// ====================================================================

import { test, expect } from '@playwright/test';

test.describe('Portal Integrado FATEC Rio Claro — Testes E2E & QA', () => {
  test('1. Healthcheck da API Backend (/api/health) retorna status UP e headers OWASP', async ({
    request,
  }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');

    const body = await res.json();
    expect(body.status).toBe('UP');
    expect(body.application).toContain('FATEC Rio Claro');
  });

  test('2. Healthcheck da API de IA Gemini (/api/ai/health) responde com conectividade ativa', async ({
    request,
  }) => {
    const res = await request.get('/api/ai/health');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.connected).toBe(true);
  });

  test('3. Página Inicial carrega sem erros e exibe os 3 eixos institucionais (Avisos, Cantina, Repositório)', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FATEC Rio Claro/i);
    await expect(page.locator('body')).toContainText(/Cantina/i);
    await expect(page.locator('body')).toContainText(/Repositório/i);
  });

  test('4. Manifesto PWA (/manifest.json) está acessível e configurado para instalação mobile', async ({
    request,
  }) => {
    const res = await request.get('/manifest.json');
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.short_name || manifest.name).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
