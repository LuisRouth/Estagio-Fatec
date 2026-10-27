// ====================================================================
// ENDPOINT: LOGOUT & INVALIDAÇÃO DE SESSÃO (POST /api/auth/logout)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function POST() {
  const response = NextResponse.json<ApiResponse>(
    {
      success: true,
      message: 'Sessão encerrada com sucesso.',
    },
    { status: 200, headers: SECURITY_HEADERS }
  );

  // Expira e remove o cookie HttpOnly
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
