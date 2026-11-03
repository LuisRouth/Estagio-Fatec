// ====================================================================
// ENDPOINT: ANEXO DE COMPROVANTE PIX DA TRANSAÇÃO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/canteen/transactions/[id]/proof
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const proofSchema = z.object({
  proof_image_url: z.string().min(1, 'A URL ou imagem do comprovante é obrigatória'),
  pix_end_to_end_id: z.string().max(100).optional().nullable(),
  notes: z.string().max(250).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/canteen/transactions/[id]/proof
 * Anexa o comprovante de pagamento Pix e submete o pedido para conferência (EM_ANALISE).
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
        { success: false, error: 'Dados do comprovante inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updated = await db.transactions.updateStatus(id, 'EM_ANALISE', {
      proofImageUrl: parsed.data.proof_image_url,
      endToEndId: parsed.data.pix_end_to_end_id || undefined,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : 'Comprovante submetido pelo aluno.',
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_PROOF_ATTACHED',
      entity_name: 'canteen_transactions',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Comprovante anexado com sucesso! Transação enviada para análise e validação OCR.',
        data: updated,
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

