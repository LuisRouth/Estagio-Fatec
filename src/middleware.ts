// ====================================================================
// MIDDLEWARE DE SEGURANÇA E PROTEÇÃO DE ROTAS (RBAC)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/lib/auth';
import { JWTPayload } from '@/lib/types';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'fatec_rio_claro_super_secure_jwt_secret_key_2026_cesar_dev_token';
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

// Rotas públicas que não exigem token
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/_next',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Liberar rotas públicas
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  // 2. Extrair token do Cookie ou Header
  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // 3. Rotas da API protegidas
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Token de autenticação não fornecido.' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
        issuer: 'fatec-rio-claro-portal',
        audience: 'fatec-students',
      });
      const user = payload as unknown as JWTPayload;

      // 4. Verificação de Papéis (RBAC)
      // Rotas administrativas exclusivas
      if (pathname.startsWith('/api/admin') && user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Recurso restrito a administradores.' },
          { status: 403 }
        );
      }

      // Rotas restritas ao Centro Acadêmico e Administração
      if (pathname.startsWith('/api/ca') && user.role !== 'ADMIN' && user.role !== 'CA_MEMBRO') {
        return NextResponse.json(
          { success: false, error: 'Acesso negado. Recurso restrito à gestão do Centro Acadêmico.' },
          { status: 403 }
        );
      }

      // Injeta os dados decodificados do usuário nos headers para os Route Handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user-id', user.sub);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-user-email', user.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação inválido ou expirado.' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
