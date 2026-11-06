import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SECURITY_HEADERS, checkRateLimit } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'auth_login');
    if (!rateCheck.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Muitas tentativas de verificação. Aguarde um minuto.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'E-mail e código de verificação são obrigatórios.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const result = await db.verifications.verify(email, code);

    if (!result.valid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error || 'Código inválido ou expirado.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'E-mail institucional verificado com sucesso! Conta autenticada.',
        data: { email, verified: true },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao validar código.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

