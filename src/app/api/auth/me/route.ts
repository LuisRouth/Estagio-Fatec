// ====================================================================
// ENDPOINT: PERFIL DO USUÁRIO ATUAL (GET /api/auth/me)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME, sanitizeUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse, SafeUser } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    // Busca token pelo cookie HttpOnly ou Header Authorization Bearer
    let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Sessão não autenticada.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Token expirado ou inválido.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const user = await db.users.findById(payload.sub);
    if (!user || !user.is_active) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado ou inativo.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json<ApiResponse<SafeUser>>(
      {
        success: true,
        data: sanitizeUser(user),
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API Auth Me Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Falha ao recuperar sessão.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
