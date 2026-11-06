import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const logs = await db.securityAudit.listByUser(sessionUser.id, 20);

    return NextResponse.json<ApiResponse>(
      { success: true, data: logs },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao consultar histórico de segurança:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao consultar auditoria.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

