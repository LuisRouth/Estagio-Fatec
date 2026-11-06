// ====================================================================
// ENDPOINT: RELATÓRIO ANALÍTICO FINANCEIRO DA CANTINA (CA & ADMIN)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/ca/analytics/financial
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, checkRateLimit } from '@/lib/security';

/**
 * GET /api/ca/analytics/financial
 * Retorna faturamento consolidado, receita por período, ticket médio e categorias.
 * Acesso restrito via RBAC para CA_MEMBRO e ADMIN.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas membros do CA ou Administradores têm acesso ao faturamento analítico.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'api_general');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Muitas consultas analíticas simultâneas. Aguarde alguns segundos.' },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const financial = await db.analytics.getFinancial({ startDate, endDate });

    return NextResponse.json(
      {
        success: true,
        data: financial,
      },
      { status: 200, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
    );
  } catch (error: any) {
    console.error('Erro ao gerar relatório financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao processar relatório financeiro do Centro Acadêmico.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

