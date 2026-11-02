// ====================================================================
// ENDPOINT: DIAGNÓSTICO DE CONECTIVIDADE E OCR DO GOOGLE GEMINI SDK
// Rota: GET /api/ai/status | POST /api/ai/status
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { testGeminiConnectivity, validatePixReceiptWithGemini } from '@/lib/gemini';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function GET() {
  try {
    const connectivity = await testGeminiConnectivity();
    return NextResponse.json<ApiResponse<typeof connectivity>>(
      {
        success: connectivity.connected,
        message:
          connectivity.mode === 'LIVE_API'
            ? 'Conectividade ativa com a nuvem do Google Gemini SDK.'
            : 'Motor Gemini operacional em modo híbrido de QA (Mock Fallback).',
        data: connectivity,
      },
      { status: connectivity.connected ? 200 : 503, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API AI Status Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro ao verificar status do SDK Google Gemini.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { receiptText, expectedAmount } = body || {};

    if (!receiptText || typeof expectedAmount !== 'number') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Informe "receiptText" (string) e "expectedAmount" (number) para validar o comprovante Pix via IA.',
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const ocrResult = await validatePixReceiptWithGemini(receiptText, expectedAmount);

    return NextResponse.json<ApiResponse<typeof ocrResult>>(
      {
        success: true,
        message: ocrResult.analysisNotes,
        data: ocrResult,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API AI OCR Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Falha ao processar comprovante Pix com o motor de IA.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
