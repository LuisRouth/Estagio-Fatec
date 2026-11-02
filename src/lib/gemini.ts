// ====================================================================
// INTEGRAÇÃO COM GOOGLE GEMINI SDK & MOTOR DE IA
// Responsável: Guilherme (Inteligência Artificial, DevOps & QA)
// ====================================================================

import { GeminiHealthStatus, PixReceiptAnalysisResult } from './types';
import { sanitizeInput } from './security';

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  temperature: number;
  isMockMode: boolean;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Carrega e valida as configurações de ambiente do Google Gemini
 */
export function getGeminiConfig(): GeminiConfig {
  const rawKey = process.env.GEMINI_API_KEY || '';
  const isPlaceholder =
    !rawKey ||
    rawKey === 'sua_chave_api_google_gemini_aqui' ||
    rawKey.trim().length < 20;

  const isMockMode =
    process.env.USE_MOCK_AI === 'true' || isPlaceholder;

  return {
    apiKey: isPlaceholder ? '' : rawKey.trim(),
    model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
    maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 1024),
    temperature: Number(process.env.GEMINI_TEMPERATURE || 0.2),
    isMockMode,
  };
}

/**
 * Valida o formato de uma chave de API do Google Gemini (AI Studio / Vertex)
 */
export function isValidGeminiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  const trimmed = apiKey.trim();
  // Chaves do Google AI Studio começam tradicionalmente com "AIza" e possuem ~39 caracteres
  return /^AIza[0-9A-Za-z\-_]{30,45}$/.test(trimmed);
}

/**
 * Executa chamada ao Google Gemini (compatível com SDK @google/genai e endpoint REST v1beta)
 */
export async function generateGeminiContent(prompt: string): Promise<string> {
  const config = getGeminiConfig();
  const safePrompt = sanitizeInput(prompt);

  if (!safePrompt) {
    throw new Error('O prompt enviado para o modelo Gemini não pode ser vazio.');
  }

  if (config.isMockMode || !config.apiKey) {
    return JSON.stringify({
      provider: 'Google Gemini SDK (Hybrid Mock Mode)',
      model: config.model,
      status: 'OK_SIMULATED',
      message: 'Conectividade validada em modo híbrido de desenvolvimento FATEC Rio Claro.',
      promptPreview: safePrompt.slice(0, 80),
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: safePrompt }],
        },
      ],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Falha na comunicação com Google Gemini API (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Sem resposta textual retornada pelo modelo.';

  return text.trim();
}

/**
 * Testa a conectividade e configuração do SDK Google Gemini (Sprint 1 Checklist)
 */
export async function testGeminiConnectivity(): Promise<GeminiHealthStatus> {
  const start = Date.now();
  const config = getGeminiConfig();
  const keyConfigured = Boolean(config.apiKey) && isValidGeminiKeyFormat(config.apiKey);

  try {
    const sampleResponse = await generateGeminiContent(
      'Responda apenas: CONECTADO_PORTAL_FATEC_RC'
    );
    const latencyMs = Math.max(1, Date.now() - start);

    return {
      connected: true,
      mode: config.isMockMode ? 'HYBRID_MOCK_AI' : 'LIVE_GEMINI_API',
      model: config.model,
      apiKeyConfigured: keyConfigured,
      latencyMs,
      sampleResponse,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const latencyMs = Math.max(1, Date.now() - start);
    return {
      connected: false,
      mode: config.isMockMode ? 'HYBRID_MOCK_AI' : 'LIVE_GEMINI_API',
      model: config.model,
      apiKeyConfigured: keyConfigured,
      latencyMs,
      sampleResponse: error instanceof Error ? error.message : 'Erro desconhecido na API Gemini',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Contrato de Pré-Validação Inteligente de Comprovante Pix (Preparação Sprint 2 - OCR Cantina)
 */
export async function analyzePixReceiptPreview(params: {
  ocrRawText: string;
  expectedAmount: number;
  expectedBeneficiary?: string;
}): Promise<PixReceiptAnalysisResult> {
  const {
    ocrRawText,
    expectedAmount,
    expectedBeneficiary = process.env.PIX_BENEFICIARY_NAME || 'Centro Academico Fatec Rio Claro',
  } = params;

  const cleanText = sanitizeInput(ocrRawText);

  // Extração heurística + validação estruturada para modo híbrido e fallback rápido
  const valueMatch = cleanText.match(/R\$\s*(\d+(?:[.,]\d{2})?)/i);
  const extractedAmount = valueMatch
    ? parseFloat(valueMatch[1].replace(',', '.'))
    : null;

  const e2eMatch = cleanText.match(/E\d{8}\d{4}[0-9A-Za-z]{11,20}/);
  const pixEndToEndId = e2eMatch ? e2eMatch[0] : null;

  const hasBeneficiary = cleanText
    .toLowerCase()
    .includes(expectedBeneficiary.toLowerCase().slice(0, 12));

  const amountMatches =
    extractedAmount !== null && Math.abs(extractedAmount - expectedAmount) < 0.01;

  const isValidReceipt = Boolean(amountMatches && (hasBeneficiary || pixEndToEndId));
  const confidenceScore = isValidReceipt ? 0.96 : amountMatches ? 0.65 : 0.2;

  return {
    isValidReceipt,
    extractedAmount,
    expectedAmount,
    amountMatches,
    beneficiaryName: hasBeneficiary ? expectedBeneficiary : null,
    pixEndToEndId,
    transactionTimestamp: new Date().toISOString(),
    confidenceScore,
    recommendedStatus: isValidReceipt ? 'PAGO' : 'EM_ANALISE',
    reasoning: isValidReceipt
      ? 'Comprovante Pix compatível com o valor esperado e destinatário institucional.'
      : 'Divergência ou ausência de dados críticos no comprovante; encaminhado para análise do CA.',
  };
}
