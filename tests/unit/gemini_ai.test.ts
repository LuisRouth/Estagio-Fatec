// ====================================================================
// SUÍTE DE TESTES UNITÁRIOS (VITEST): SDK GOOGLE GEMINI & OCR PIX
// Responsável: Guilherme (Inteligência Artificial, DevOps & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import {
  getGeminiConfig,
  isValidGeminiKeyFormat,
  testGeminiConnectivity,
  analyzePixReceiptPreview,
} from '@/lib/gemini';

describe('Integração SDK Google Gemini & Validação Inteligente Pix', () => {
  it('deve validar o formato de chaves de API do Google AI Studio', () => {
    expect(isValidGeminiKeyFormat('')).toBe(false);
    expect(isValidGeminiKeyFormat('sua_chave_api_google_gemini_aqui')).toBe(false);
    expect(isValidGeminiKeyFormat('AIzaSyD-ExemploChaveValidaFatecRioClaro2026')).toBe(true);
  });

  it('deve carregar configuração híbrida do Gemini com valores seguros por padrão', () => {
    const config = getGeminiConfig();
    expect(config.model).toContain('gemini');
    expect(config.maxOutputTokens).toBeGreaterThan(0);
  });

  it('deve atestar conectividade com o motor Gemini (Live ou Hybrid Mock)', async () => {
    const health = await testGeminiConnectivity();
    expect(health.connected).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(1);
    expect(health.sampleResponse.length).toBeGreaterThan(0);
  });

  it('deve aprovar comprovante Pix válido da Cantina Honest Market', async () => {
    const receiptText =
      'Comprovante de Pagamento PIX - Valor: R$ 9,50 - Destinatário: Centro Academico Fatec Rio Claro - E182361202026110112345678901';
    const result = await analyzePixReceiptPreview({
      ocrRawText: receiptText,
      expectedAmount: 9.5,
    });

    expect(result.isValidReceipt).toBe(true);
    expect(result.amountMatches).toBe(true);
    expect(result.recommendedStatus).toBe('PAGO');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it('deve sinalizar EM_ANALISE quando o valor do comprovante Pix divergir do pedido', async () => {
    const receiptText =
      'Comprovante PIX - Valor: R$ 4,00 - Destinatário: Centro Academico Fatec Rio Claro';
    const result = await analyzePixReceiptPreview({
      ocrRawText: receiptText,
      expectedAmount: 10.0,
    });

    expect(result.isValidReceipt).toBe(false);
    expect(result.amountMatches).toBe(false);
    expect(result.recommendedStatus).toBe('EM_ANALISE');
  });
});
