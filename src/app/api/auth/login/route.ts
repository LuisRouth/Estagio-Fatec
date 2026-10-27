// ====================================================================
// ENDPOINT: LOGIN & AUTENTICAÇÃO SEGURA (POST /api/auth/login)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { verifyPassword, generateToken, getAuthCookieOptions, sanitizeUser } from '@/lib/auth';
import { checkRateLimit, SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse, SafeUser } from '@/lib/types';

const LoginSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60);

    if (!rateCheck.allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Muitas tentativas de login consecutivas. Por motivos de segurança, tente novamente em ${rateCheck.retryAfter} segundos.`,
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parseResult = LoginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Por favor, informe e-mail e senha válidos.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { email, password } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // Buscar usuário pelo e-mail
    const user = await db.users.findByEmail(cleanEmail);

    if (!user || !user.password_hash) {
      // Audit log de falha de login (usuário não encontrado)
      await db.audit.log({
        user_id: null,
        action: 'LOGIN_FAILURE_USER_NOT_FOUND',
        entity_name: 'users',
        ip_address: ip,
        user_agent: req.headers.get('user-agent'),
        payload: { email: cleanEmail },
      });

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciais de acesso incorretas. Verifique seu e-mail e senha.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (!user.is_active) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Sua conta discente está inativa. Procure o Centro Acadêmico ou coordenação.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Verificar hash da senha via bcrypt
    const passwordMatch = await verifyPassword(password, user.password_hash);
    if (!passwordMatch) {
      // Audit log de senha incorreta
      await db.audit.log({
        user_id: user.id,
        action: 'LOGIN_FAILURE_BAD_PASSWORD',
        entity_name: 'users',
        entity_id: user.id,
        ip_address: ip,
        user_agent: req.headers.get('user-agent'),
      });

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Credenciais de acesso incorretas. Verifique seu e-mail e senha.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Gerar JWT seguro
    const token = await generateToken(user);
    const safeUser = sanitizeUser(user);

    // Registrar sucesso de login na auditoria
    await db.audit.log({
      user_id: user.id,
      action: 'LOGIN_SUCCESS',
      entity_name: 'users',
      entity_id: user.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    const response = NextResponse.json<ApiResponse<{ user: SafeUser; token: string }>>(
      {
        success: true,
        message: `Bem-vindo(a) de volta, ${user.name}!`,
        data: { user: safeUser, token },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );

    // Definir Cookie Seguro HttpOnly
    const cookieOpts = getAuthCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error) {
    console.error('[API Login Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao validar credenciais.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
