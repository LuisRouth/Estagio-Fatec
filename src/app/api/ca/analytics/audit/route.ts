// ====================================================================
// ENDPOINT: RELATÓRIO ANALÍTICO DA TRILHA DE AUDITORIA (CA & ADMIN)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/ca/analytics/audit
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, checkRateLimit } from '@/lib/security';

/**
 * GET /api/ca/analytics/audit
 * Retorna métricas consolidadas da trilha de auditoria e eventos críticos de segurança.
 * Acesso restrito a CA_MEMBRO e ADMIN.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas membros do CA e Administradores podem auditar logs.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'api_general');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Limite de requisições excedido. Aguarde alguns segundos.' },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const report = await db.analytics.getAuditReport(limit);

    return NextResponse.json(
      {
        success: true,
        data: report,
      },
      { status: 200, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
    );
  } catch (error: any) {
    console.error('Erro ao buscar auditoria analítica:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao recuperar relatório analítico de auditoria.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

