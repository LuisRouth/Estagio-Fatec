// ====================================================================
// ENDPOINT: REGISTRO DE USUÁRIO (POST /api/auth/register)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, sanitizeUser } from '@/lib/auth';
import { validatePasswordStrength, sanitizeInput, SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse, SafeUser } from '@/lib/types';

const RegisterSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres').max(150),
  email: z.string().email('E-mail institucional inválido').max(180),
  ra: z.string().min(5, 'O RA deve ter no mínimo 5 dígitos').max(20).optional(),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  course: z.enum(['IA', 'ESG'], { errorMap: () => ({ message: 'Selecione o curso Inteligência Artificial (IA) ou Gestão ESG' }) }),
  semester: z.number().int().min(1).max(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = RegisterSchema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      parseResult.error.errors.forEach((err) => {
        const field = err.path.join('.');
        fieldErrors[field] = fieldErrors[field] || [];
        fieldErrors[field].push(err.message);
      });

      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Dados cadastrais inválidos', errors: fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { name, email, ra, password, course, semester } = parseResult.data;

    // Validação estrita de força da senha
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: strength.message },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRa = ra ? sanitizeInput(ra) : null;
    const cleanName = sanitizeInput(name);

    // Verificar se o e-mail já existe
    const existingEmail = await db.users.findByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Este e-mail institucional já se encontra cadastrado no portal.' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // Verificar se o RA já existe
    if (cleanRa) {
      const existingRa = await db.users.findByRa(cleanRa);
      if (existingRa) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Este RA já se encontra vinculado a outro estudante.' },
          { status: 409, headers: SECURITY_HEADERS }
        );
      }
    }

    // Criptografar senha com Bcrypt
    const password_hash = await hashPassword(password);

    // Criar usuário com papel padrão ALUNO
    const newUser = await db.users.create({
      name: cleanName,
      email: cleanEmail,
      ra: cleanRa,
      password_hash,
      role: 'ALUNO',
      course,
      semester,
      is_active: true,
    });

    // Registrar evento de auditoria
    await db.audit.log({
      user_id: newUser.id,
      action: 'USER_REGISTERED',
      entity_name: 'users',
      entity_id: newUser.id,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent'),
      payload: { email: cleanEmail, course, semester },
    });

    return NextResponse.json<ApiResponse<SafeUser>>(
      {
        success: true,
        message: 'Cadastro realizado com sucesso! Você já pode efetuar login.',
        data: sanitizeUser(newUser),
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API Register Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao processar o cadastro discente.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
