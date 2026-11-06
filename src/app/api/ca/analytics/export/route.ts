// ====================================================================
// ENDPOINT: EXPORTAÇÃO DE EXTRATO FINANCEIRO DA CANTINA (CSV)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/ca/analytics/export
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, checkRateLimit } from '@/lib/security';

/**
 * GET /api/ca/analytics/export
 * Exporta o extrato completo de compras e faturamento da cantina em formato CSV
 * para prestação de contas do Centro Acadêmico e auditoria contábil.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas membros do CA e Administradores podem exportar relatórios.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'api_general');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Muitas solicitações de exportação. Aguarde alguns segundos.' },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

    const csvContent = await db.analytics.exportFinancialCsv();

    // Log de auditoria da exportação
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_FINANCIAL_REPORT_EXPORTED',
      entity_name: 'canteen_transactions',
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    const nowStr = new Date().toISOString().split('T')[0];
    const filename = `prestacao_contas_cantina_fatec_rc_${nowStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        ...rateCheck.headers,
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar CSV financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao exportar extrato financeiro da cantina.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

