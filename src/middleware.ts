// ====================================================================
// MIDDLEWARE DE SEGURANÇA E CONTROLE DE ACESSO BASEADO EM PAPÉIS (RBAC)
// Projeto: Portal Integrado FATEC Rio Claro
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { UserRole } from '@/lib/types';

// Mapa de rotas protegidas por papel mínimo requerido
const PROTECTED_ROUTES: { prefix: string; allowedRoles: UserRole[] }[] = [
  { prefix: '/api/admin', allowedRoles: ['ADMIN'] },
  { prefix: '/api/ca', allowedRoles: ['CA_MEMBRO', 'ADMIN'] },
  { prefix: '/api/professor', allowedRoles: ['PROFESSOR', 'ADMIN'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Aplicar headers de segurança OWASP em todas as respostas
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Verificar se a rota exige controle RBAC
  const matchedRoute = PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix));
  if (!matchedRoute) {
    return response;
  }

  let token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Acesso não autorizado. Autenticação obrigatória.' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: 'Sessão inválida ou expirada.' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }

  if (!matchedRoute.allowedRoles.includes(payload.role)) {
    return NextResponse.json(
      { success: false, error: 'Permissão insuficiente (RBAC) para acessar este recurso.' },
      { status: 403, headers: SECURITY_HEADERS }
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|brand/|icon-).*)'],
};
