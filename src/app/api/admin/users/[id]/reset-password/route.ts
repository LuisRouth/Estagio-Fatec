// ====================================================================
// ENDPOINT ADMINISTRATIVO: REDEFINIÇÃO DE SENHA POR ADMINISTRADOR
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/admin/users/[id]/reset-password
// Acesso: Exclusivo ADMIN
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { SECURITY_HEADERS, validatePasswordStrength } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado. Apenas administradores podem redefinir senhas.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const newPassword = body.newPassword || '';

    const targetUser = await db.users.findById(id);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: validation.message || 'A nova senha não atende aos requisitos de segurança.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const newHash = await hashPassword(newPassword);
    const success = await db.users.changePassword(id, newHash, session.sub);

    if (!success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Falha ao gravar nova senha no banco de dados.' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `Senha de acesso para ${targetUser.name} redefinida com sucesso pelo administrador.`,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao redefinir senha via ADMIN:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao redefinir senha.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
