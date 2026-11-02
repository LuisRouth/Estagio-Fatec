// ====================================================================
// TESTES UNITÁRIOS DO MÓDULO GOOGLE GEMINI SDK & OCR PIX (VITEST)
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import {
  getGeminiConfig,
  testGeminiConnectivity,
  validatePixReceiptWithGemini,
  summarizeAcademicMaterial,
} from '@/lib/gemini';

describe('Módulo de Inteligência Artificial — Google Gemini SDK (src/lib/gemini.ts)', () => {
  it('deve carregar a configuração padrão do modelo Gemini', () => {
    const config = getGeminiConfig();
    expect(config.model).toMatch(/^gemini-/);
    expect(typeof config.fallbackEnabled).toBe('boolean');
  });

  it('deve validar a conectividade com o serviço Gemini (Live ou Mock Fallback)', async () => {
    const status = await testGeminiConnectivity();
    expect(status.connected).toBe(true);
    expect(['LIVE_API', 'MOCK_FALLBACK']).toContain(status.mode);
    expect(status.latencyMs).toBeGreaterThan(0);
  });

  it('deve aprovar comprovante Pix válido quando o valor extraído coincide com o esperado', async () => {
    const receipt =
      'COMPROVANTE PIX - Valor: R$ 5,50 - Destinatário: CA FATEC RIO CLARO - ID: E12345678202611021200abcdefghijk';
    const result = await validatePixReceiptWithGemini(receipt, 5.5);
    expect(result.isValidReceipt).toBe(true);
    expect(result.amountMatches).toBe(true);
    expect(result.status).toBe('APROVADO_IA');
  });

  it('deve sinalizar DIVERGENTE quando o valor do comprovante difere do total da compra', async () => {
    const receipt = 'COMPROVANTE DE PAGAMENTO PIX - Valor pago: R$ 4,50';
    const result = await validatePixReceiptWithGemini(receipt, 10.0);
    expect(result.amountMatches).toBe(false);
    expect(result.status).toBe('DIVERGENTE');
  });

  it('deve encaminhar para revisão do CA quando o comprovante está vazio ou ilegível', async () => {
    const result = await validatePixReceiptWithGemini('', 6.0);
    expect(result.isValidReceipt).toBe(false);
    expect(result.status).toBe('REQUER_REVISAO_CA');
  });

  it('deve gerar resumo contextualizado para materiais dos cursos de IA e Gestão ESG', async () => {
    const iaSummary = await summarizeAcademicMaterial(
      'Redes Neurais Convolucionais',
      'Arquiteturas de visão computacional aplicadas a OCR.',
      'IA'
    );
    expect(iaSummary.summary).toContain('IA');
    expect(iaSummary.tags.length).toBeGreaterThan(0);

    const esgSummary = await summarizeAcademicMaterial(
      'Relatórios de Sustentabilidade GRI',
      'Métricas ambientais, sociais e de governança corporativa.',
      'ESG'
    );
    expect(esgSummary.summary).toContain('ESG');
  });
});
