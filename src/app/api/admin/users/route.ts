// ====================================================================
// ENDPOINT ADMINISTRATIVO: GESTÃO DE USUÁRIOS & CONTAS DISCENTES
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/admin/users, POST /api/admin/users
// Acesso: Exclusivo ADMIN
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput, validatePasswordStrength } from '@/lib/security';
import { CourseType, UserRole, ApiResponse } from '@/lib/types';

/**
 * GET /api/admin/users
 * Lista todos os usuários cadastrados com métricas, busca e filtros.
 * Requer permissão ADMIN.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado. Efetue login como Administrador.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado. Apenas administradores podem gerenciar usuários.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase().trim();
    const roleFilter = searchParams.get('role') as UserRole | null;
    const courseFilter = searchParams.get('course') as CourseType | null;
    const semesterFilter = searchParams.get('semester');
    const statusFilter = searchParams.get('status'); // 'ativos', 'inativos'
    const verifiedFilter = searchParams.get('verified'); // 'verificados', 'pendentes'

    const allUsers = await db.users.listAll();

    // Cálculo das métricas globais antes da filtragem
    const stats = {
      total: allUsers.length,
      active: allUsers.filter((u) => u.is_active).length,
      inactive: allUsers.filter((u) => !u.is_active).length,
      verified: allUsers.filter((u) => u.is_email_verified).length,
      unverified: allUsers.filter((u) => !u.is_email_verified).length,
      iaCount: allUsers.filter((u) => u.course === 'IA').length,
      esgCount: allUsers.filter((u) => u.course === 'ESG').length,
      adminCount: allUsers.filter((u) => u.role === 'ADMIN').length,
      caCount: allUsers.filter((u) => u.role === 'CA_MEMBRO').length,
      studentCount: allUsers.filter((u) => u.role === 'ALUNO').length,
      professorCount: allUsers.filter((u) => u.role === 'PROFESSOR').length,
    };

    // Aplicação dos filtros
    let filteredUsers = allUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          (u.recovery_email && u.recovery_email.toLowerCase().includes(search)) ||
          (u.ra && u.ra.toLowerCase().includes(search))
      );
    }

    if (roleFilter && roleFilter !== ('TODOS' as any)) {
      filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
    }

    if (courseFilter && courseFilter !== ('TODOS' as any)) {
      filteredUsers = filteredUsers.filter((u) => u.course === courseFilter);
    }

    if (semesterFilter && semesterFilter !== 'TODOS') {
      const sem = parseInt(semesterFilter, 10);
      if (!isNaN(sem)) {
        filteredUsers = filteredUsers.filter((u) => u.semester === sem);
      }
    }

    if (statusFilter === 'ativos') {
      filteredUsers = filteredUsers.filter((u) => u.is_active);
    } else if (statusFilter === 'inativos') {
      filteredUsers = filteredUsers.filter((u) => !u.is_active);
    }

    if (verifiedFilter === 'verificados') {
      filteredUsers = filteredUsers.filter((u) => u.is_email_verified);
    } else if (verifiedFilter === 'pendentes') {
      filteredUsers = filteredUsers.filter((u) => !u.is_email_verified);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          users: filteredUsers,
          stats,
          currentUserRole: session.role,
          currentUserId: session.sub,
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao listar usuários (ADMIN):', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao consultar lista administrativa de usuários.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/admin/users
 * Criação direta de conta de usuário pelo Administrador.
 * Requer permissão ADMIN.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado. Apenas administradores podem cadastrar novos usuários diretamente.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const name = sanitizeInput(body.name || '').trim();
    const email = (body.email || '').toLowerCase().trim();
    const recoveryEmail = body.recoveryEmail ? sanitizeInput(body.recoveryEmail).toLowerCase().trim() : null;
    const ra = body.ra ? sanitizeInput(body.ra).trim() : null;
    const role: UserRole = body.role || 'ALUNO';
    const course: CourseType = body.course === 'ESG' ? 'ESG' : 'IA';
    const semester = parseInt(body.semester || '1', 10);
    const password = body.password || '';
    const isEmailVerified = Boolean(body.isEmailVerified ?? true);
    const isActive = Boolean(body.isActive ?? true);

    if (!name || name.length < 3) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Nome completo obrigatório (mínimo 3 caracteres).' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!email.endsWith('@aluno.cps.sp.gov.br') && !email.endsWith('@fatec.sp.gov.br')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'E-mail institucional obrigatório (@aluno.cps.sp.gov.br ou @fatec.sp.gov.br).' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Verificar se e-mail já existe
    const existing = await db.users.findByEmail(email);
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Já existe uma conta cadastrada com este e-mail institucional.' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Se RA foi fornecido, validar se já existe
    if (ra) {
      const existingRa = await db.users.findByRa(ra);
      if (existingRa) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Já existe uma conta cadastrada com este Registro Acadêmico (RA).' },
          { status: 409, headers: SECURITY_HEADERS }
        );
      }
    }

    // Validação de senha
    if (!password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'A senha de acesso é obrigatória.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: passwordValidation.message || 'Senha fraca.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.users.create({
      name,
      email,
      recovery_email: recoveryEmail,
      ra,
      password_hash: passwordHash,
      role,
      course,
      semester: Math.min(Math.max(semester, 1), 4),
      is_active: isActive,
      is_email_verified: isEmailVerified,
    });

    // Auditoria
    await db.securityAudit.log({
      userId: newUser.id,
      changedBy: session.sub,
      action: 'ADMIN_USER_UPDATE',
      fieldName: 'user_created_by_admin',
      oldValueMasked: '(NOVO)',
      newValueMasked: `${name} (${email}) - ${role}`,
    });

    const { password_hash: _, ...safeUser } = newUser;

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: safeUser,
        message: `Usuário ${name} cadastrado com sucesso pelo administrador.`,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao cadastrar usuário via ADMIN:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao cadastrar usuário.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
