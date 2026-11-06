import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { sanitizeInput, SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado. Efetue login.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const user = await db.users.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Usuário não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const preferences = await db.preferences.get(user.id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            recoveryEmail: user.recovery_email || '',
            ra: user.ra,
            course: user.course,
            semester: user.semester,
            role: user.role,
            isEmailVerified: Boolean(user.is_email_verified),
            emailVerifiedAt: user.email_verified_at,
          },
          preferences,
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao consultar perfil:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao consultar perfil de usuário.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { name, course, semester, primaryEmail, recoveryEmail } = body;

    // Validação estrita do e-mail institucional principal
    if (primaryEmail) {
      const cleanEmail = primaryEmail.toLowerCase().trim();
      const isValidInstitution =
        cleanEmail.endsWith('@aluno.cps.sp.gov.br') || cleanEmail.endsWith('@fatec.sp.gov.br');

      if (!isValidInstitution) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error:
              'O e-mail institucional principal deve possuir obrigatoriamente a extensão @aluno.cps.sp.gov.br ou @fatec.sp.gov.br.',
          },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Desconhecido';

    const updated = await db.users.updateProfile(
      sessionUser.id,
      {
        name: name ? sanitizeInput(name) : undefined,
        course,
        semester: semester ? Number(semester) : undefined,
        primaryEmail,
        recoveryEmail: recoveryEmail !== undefined ? recoveryEmail?.trim() : undefined,
      },
      sessionUser.id,
      { ip, userAgent }
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: updated,
        message: 'Dados atualizados com sucesso e registrados na trilha de auditoria!',
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: error.message || 'Erro interno ao atualizar perfil.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

