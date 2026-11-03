// ====================================================================
// ENDPOINT: DETALHES E ATUALIZAÇÃO DE TRANSAÇÃO DA CANTINA
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, PATCH /api/canteen/transactions/[id]
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const updateStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'PAGO', 'CANCELADO', 'EM_ANALISE'] as const),
  proof_image_url: z.string().optional().nullable(),
  pix_end_to_end_id: z.string().max(100).optional().nullable(),
  notes: z.string().max(300).optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/canteen/transactions/[id]
 * Retorna o extrato detalhado de uma transação específica.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const transaction = await db.transactions.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // Apenas o próprio aluno que comprou ou CA/Admin podem visualizar o extrato detalhado
    const isOwner = transaction.user_id === session.sub;
    const isPrivileged = session.role === 'CA_MEMBRO' || session.role === 'ADMIN';

    if (!isOwner && !isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado a este comprovante.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar detalhes da compra.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * PATCH /api/canteen/transactions/[id]
 * Atualiza status da transação (ex: PAGO, CANCELADO, EM_ANALISE).
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const existingTx = await db.transactions.findById(id);
    if (!existingTx) {
      return NextResponse.json(
        { success: false, error: 'Transação não encontrada.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const isOwner = existingTx.user_id === session.sub;
    const isPrivileged = session.role === 'CA_MEMBRO' || session.role === 'ADMIN';

    // Aluno comum só pode solicitar análise anexando comprovante (status EM_ANALISE)
    if (!isPrivileged) {
      if (!isOwner || parsed.data.status !== 'EM_ANALISE') {
        return NextResponse.json(
          { success: false, error: 'Apenas membros do CA podem alterar status para PAGO ou CANCELADO.' },
          { status: 403, headers: SECURITY_HEADERS }
        );
      }
    }

    const updated = await db.transactions.updateStatus(id, parsed.data.status, {
      validatedBy: isPrivileged ? session.sub : undefined,
      proofImageUrl: parsed.data.proof_image_url || undefined,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : undefined,
      endToEndId: parsed.data.pix_end_to_end_id || undefined,
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_TRANSACTION_STATUS_UPDATED',
      entity_name: 'canteen_transactions',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: {
        old_status: existingTx.status,
        new_status: parsed.data.status,
        updated_by_role: session.role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Status da transação alterado para ${parsed.data.status}.`,
        data: updated,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar status da transação:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao atualizar transação.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

