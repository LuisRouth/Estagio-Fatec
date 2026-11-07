// ====================================================================
// ENDPOINT ADMINISTRATIVO: OPERAÇÕES EM USUÁRIO ESPECÍFICO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: PUT /api/admin/users/[id], DELETE /api/admin/users/[id]
// Acesso: Exclusivo ADMIN
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { CourseType, UserRole, ApiResponse } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/admin/users/[id]
 * Atualiza dados, cargo ou status de ativação de um usuário.
 * Requer permissão ADMIN.
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado. Apenas administradores podem atualizar contas de usuários.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const targetUser = await db.users.findById(id);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    // 1. Ação rápida: Alternar Status Ativo / Inativo
    if (body.action === 'toggle_status') {
      const newStatus = Boolean(body.isActive);
      try {
        const updated = await db.users.updateStatus(id, newStatus, session.sub);
        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: updated,
            message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
          },
          { headers: SECURITY_HEADERS }
        );
      } catch (err: any) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: err.message || 'Erro ao alterar status do usuário.' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    // 2. Ação rápida: Alterar Cargo (Role)
    if (body.action === 'change_role') {
      const newRole = body.role as UserRole;
      if (!['ALUNO', 'CA_MEMBRO', 'PROFESSOR', 'ADMIN'].includes(newRole)) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Cargo (role) inválido.' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
      try {
        const updated = await db.users.updateRole(id, newRole, session.sub);
        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: updated,
            message: `Cargo do usuário alterado para ${newRole} com sucesso.`,
          },
          { headers: SECURITY_HEADERS }
        );
      } catch (err: any) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: err.message || 'Erro ao alterar cargo do usuário.' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    // 3. Ação rápida: Atribuir ou Revogar Privilégio de Conferente/Caixa da Cantina
    if (body.action === 'toggle_canteen_privilege') {
      const newPrivilege = Boolean(body.canValidateCanteen);
      try {
        const updated = await db.users.adminUpdate(
          id,
          { can_validate_canteen: newPrivilege },
          session.sub
        );
        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: updated,
            message: `Privilégio de conferente da cantina ${newPrivilege ? 'atribuído' : 'revogado'} com sucesso.`,
          },
          { headers: SECURITY_HEADERS }
        );
      } catch (err: any) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: err.message || 'Erro ao atualizar privilégio da cantina.' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    // 4. Atualização Completa de Dados pelo Administrador
    const name = body.name ? sanitizeInput(body.name).trim() : undefined;
    const email = body.email ? body.email.toLowerCase().trim() : undefined;
    const recovery_email = body.recoveryEmail !== undefined ? (body.recoveryEmail ? sanitizeInput(body.recoveryEmail).toLowerCase().trim() : null) : undefined;
    const ra = body.ra !== undefined ? (body.ra ? sanitizeInput(body.ra).trim() : null) : undefined;
    const role = body.role as UserRole | undefined;
    const course = body.course as CourseType | undefined;
    const semester = body.semester !== undefined ? parseInt(body.semester, 10) : undefined;
    const is_active = body.isActive !== undefined ? Boolean(body.isActive) : undefined;
    const is_email_verified = body.isEmailVerified !== undefined ? Boolean(body.isEmailVerified) : undefined;
    const can_validate_canteen = body.canValidateCanteen !== undefined ? Boolean(body.canValidateCanteen) : undefined;
    const phone = body.phone !== undefined ? (body.phone ? sanitizeInput(body.phone).trim() : null) : undefined;

    if (email && !email.endsWith('@aluno.cps.sp.gov.br') && !email.endsWith('@fatec.sp.gov.br')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'E-mail institucional deve terminar em @aluno.cps.sp.gov.br ou @fatec.sp.gov.br' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    try {
      const updated = await db.users.adminUpdate(
        id,
        {
          name,
          email,
          recovery_email,
          ra,
          role,
          course,
          semester,
          is_active,
          is_email_verified,
          can_validate_canteen,
          phone,
        },
        session.sub
      );

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: updated,
          message: 'Dados do usuário atualizados com sucesso.',
        },
        { headers: SECURITY_HEADERS }
      );
    } catch (err: any) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: err.message || 'Erro ao atualizar dados do usuário.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }
  } catch (error: any) {
    console.error('Erro ao atualizar usuário via ADMIN:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao processar atualização do usuário.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Exclusão definitiva de um usuário e desvinculação em cascata segura.
 * Requer permissão ADMIN.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado. Apenas administradores podem excluir contas de usuários.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const { id } = await params;

    // Proteção de segurança: Administrador não pode deletar a si próprio enquanto conectado
    if (session.sub === id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Por segurança, você não pode excluir a sua própria conta enquanto estiver conectado com ela.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const targetUser = await db.users.findById(id);
    if (!targetUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const result = await db.users.deleteUser(id, session.sub);
    if (!result.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: result.error || 'Não foi possível excluir o usuário.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: `A conta do discente ${targetUser.name} (${targetUser.email}) foi excluída com sucesso do banco de dados. O e-mail agora está livre para novos cadastros.`,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao excluir usuário via ADMIN:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao excluir conta do usuário.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

