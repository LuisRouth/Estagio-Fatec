import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { validatePasswordStrength, SECURITY_HEADERS, checkRateLimit } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'auth_login');
    if (!rateCheck.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Muitas tentativas recentes de alteração de senha.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Sessão expirada. Efetue login novamente.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Preencha a senha atual e a nova senha.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A confirmação não coincide com a nova senha digitada.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: strength.message || 'A senha não atende aos critérios de complexidade.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const user = await db.users.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const isValidCurrent = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidCurrent) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A senha atual informada está incorreta.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const userAgent = req.headers.get('user-agent') || 'Desconhecido';
    const newHash = await bcrypt.hash(newPassword, 10);

    await db.users.changePassword(user.id, newHash, sessionUser.id, { ip, userAgent });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Senha alterada com sucesso! Histórico de segurança atualizado.',
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao processar alteração de senha.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
