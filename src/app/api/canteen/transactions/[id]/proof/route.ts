// ====================================================================
// ENDPOINT: ANEXO E CONFERÊNCIA AUTOMÁTICA (OCR / VISÃO) DE COMPROVANTE PIX
// Responsável: Cesar (Backend & BD) e Guilherme (Pipeline OCR/Visão Gemini)
// Rota: POST /api/canteen/transactions/[id]/proof
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { analyzePixReceiptPipeline } from '@/lib/gemini';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { TransactionStatus } from '@/lib/types';

// Schema unificado compatível tanto com o contrato Backend (proof_image_url / pix_end_to_end_id)
// quanto com o contrato Frontend/Multimodal (receiptText / e2eId / receiptImageBase64)
const proofSchema = z
  .object({
    proof_image_url: z.string().optional().nullable(),
    pix_end_to_end_id: z.string().max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    receiptText: z.string().max(3000).optional().nullable(),
    e2eId: z.string().max(100).optional().nullable(),
    receiptImageBase64: z.string().optional().nullable(),
    receiptImageMimeType: z.string().max(50).optional().nullable(),
  })
  .refine(
    (data) =>
      Boolean(
        (data.proof_image_url && data.proof_image_url.trim()) ||
          (data.receiptText && data.receiptText.trim()) ||
          (data.receiptImageBase64 && data.receiptImageBase64.trim()) ||
          (data.pix_end_to_end_id && data.pix_end_to_end_id.trim()) ||
          (data.e2eId && data.e2eId.trim())
      ),
    {
      message: 'Informe o texto/código E2E ou envie a imagem do comprovante Pix.',
      path: ['proof_image_url'],
    }
  );

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/canteen/transactions/[id]/proof
 * Anexa o comprovante Pix, executa o pipeline de OCR/Visão Computacional (Google Gemini)
 * e aprova automaticamente (PAGO) quando o valor confere (RN-03) ou encaminha para EM_ANALISE (RN-04).
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const tx = await db.transactions.findById(id);
    if (!tx) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Apenas o proprietário da transação ou CA/Admin
    if (tx.user_id !== session.sub && session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Permissão negada para alterar esta transação.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = proofSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados do comprovante inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const {
      proof_image_url,
      pix_end_to_end_id,
      notes,
      receiptText,
      e2eId,
      receiptImageBase64,
      receiptImageMimeType,
    } = parsed.data;

    // Executa o pipeline de OCR / Visão Computacional para conferência automática do comprovante
    const ocrResult = await analyzePixReceiptPipeline({
      receiptText: receiptText || notes || proof_image_url || '',
      imageBase64: receiptImageBase64 || null,
      imageMimeType: receiptImageMimeType || 'image/png',
      proofImageUrl: proof_image_url || null,
      expectedAmount: Number(tx.total_amount),
      expectedMerchant: 'FATEC RIO CLARO CA',
    });

    // Regra de Negócio RN-03 e RN-04:
    // Se o pipeline OCR/Visão aprovar com valor exato (APROVADO_IA), liquida automaticamente como 'PAGO'.
    // Caso contrário (REQUER_REVISAO_CA ou DIVERGENTE), retém como 'EM_ANALISE' para auditoria do CA.
    const targetStatus: TransactionStatus = ocrResult.status === 'APROVADO_IA' ? 'PAGO' : 'EM_ANALISE';

    const resolvedE2E =
      pix_end_to_end_id ||
      e2eId ||
      ocrResult.transactionId ||
      undefined;

    const resolvedProofUrl =
      proof_image_url ||
      (receiptImageBase64 ? 'data:image/receipt-ocr-verified' : undefined) ||
      (receiptText ? `ocr://text-receipt/${resolvedE2E || 'submitted'}` : undefined);

    const resolvedNotes = notes
      ? sanitizeInput(notes)
      : ocrResult.analysisNotes;

    const updated = await db.transactions.updateStatus(id, targetStatus, {
      proofImageUrl: resolvedProofUrl,
      endToEndId: resolvedE2E,
      notes: resolvedNotes,
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: targetStatus === 'PAGO' ? 'CANTEEN_PROOF_APPROVED_BY_AI_OCR' : 'CANTEEN_PROOF_ATTACHED',
      entity_name: 'canteen_transactions',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: {
        ocrStatus: ocrResult.status,
        ocrMethod: ocrResult.ocrMethod,
        extractedAmount: ocrResult.extractedAmount,
        expectedAmount: ocrResult.expectedAmount,
        targetStatus,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          targetStatus === 'PAGO'
            ? `Pagamento aprovado automaticamente via IA OCR! ${ocrResult.analysisNotes}`
            : `Comprovante anexado com sucesso! ${ocrResult.analysisNotes}`,
        data: updated,
        ocr: ocrResult,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao anexar comprovante:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao anexar comprovante de pagamento.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
