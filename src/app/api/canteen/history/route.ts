// ====================================================================
// ENDPOINT: HISTÓRICO E EXTRATO DE COMPRAS DO ALUNO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/canteen/history
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { TransactionStatus } from '@/lib/types';

/**
 * GET /api/canteen/history
 * Retorna o extrato consolidado de compras do discente logado, com totais e itens detalhados.
 * Membros do CA e Administradores podem consultar o extrato de outros alunos via ?user_id=...
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Efetue login para visualizar o extrato de compras.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserIdParam = searchParams.get('user_id');
    const statusParam = searchParams.get('status') as TransactionStatus | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    // Aluno só pode consultar o próprio extrato; CA e Admin podem consultar qualquer aluno
    let targetUserId = session.sub;
    if (targetUserIdParam && (session.role === 'CA_MEMBRO' || session.role === 'ADMIN')) {
      targetUserId = targetUserIdParam;
    }

    const statement = await db.transactions.getStudentStatement(targetUserId);

    // Se houver filtro de status ou paginação
    let filteredTransactions = statement.transactions;
    if (statusParam) {
      filteredTransactions = filteredTransactions.filter((t) => t.status === statusParam);
    }
    if (offset > 0) {
      filteredTransactions = filteredTransactions.slice(offset);
    }
    if (limit > 0) {
      filteredTransactions = filteredTransactions.slice(0, limit);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          student: {
            id: targetUserId,
            name: session.sub === targetUserId ? session.name : statement.transactions[0]?.user_name || 'Estudante FATEC',
            course: session.sub === targetUserId ? session.course : undefined,
            semester: session.sub === targetUserId ? session.semester : undefined,
          },
          summary: statement.summary,
          transactions: filteredTransactions,
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao buscar extrato de compras:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao recuperar histórico de compras.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

