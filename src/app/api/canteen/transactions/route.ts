// ====================================================================
// ENDPOINT: LISTAGEM GERAL DE TRANSAÇÕES DA CANTINA
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/canteen/transactions
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { TransactionStatus } from '@/lib/types';

/**
 * GET /api/canteen/transactions
 * Lista transações da cantina. Alunos veem apenas as suas próprias;
 * CA_MEMBRO e ADMIN veem todas as transações para auditoria e conferência.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Autenticação obrigatória.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as TransactionStatus | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const isPrivileged = session.role === 'CA_MEMBRO' || session.role === 'ADMIN';
    const userIdFilter = isPrivileged ? searchParams.get('user_id') || undefined : session.sub;

    const transactions = await db.transactions.listAll({
      userId: userIdFilter,
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        count: transactions.length,
        data: transactions,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar transações da cantina.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

