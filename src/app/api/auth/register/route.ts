// ====================================================================
// ENDPOINT: REGISTRO DE USUÁRIO (POST /api/auth/register)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, sanitizeUser } from '@/lib/auth';
import { validatePasswordStrength, sanitizeInput, SECURITY_HEADERS, checkRateLimit } from '@/lib/security';
import { ApiResponse, SafeUser } from '@/lib/types';

const RegisterSchema = z.object({
  name: z.string().min(3).max(150),
  email: z
    .string()
    .email('Formato de e-mail institucional inválido')
    .max(180)
    .refine(
      (email) => {
        const clean = email.toLowerCase().trim();
        return clean.endsWith('@aluno.cps.sp.gov.br') || clean.endsWith('@fatec.sp.gov.br');
      },
      {
        message: 'O cadastro requer e-mail discente oficial padrão (@aluno.cps.sp.gov.br) ou institucional (@fatec.sp.gov.br).',
      }
    ),
  recoveryEmail: z
    .string()
    .email('Formato de e-mail de recuperação/pessoal inválido')
    .max(180),
  ra: z.string().min(5).max(20).optional(),
  password: z.string().min(8),
  course: z.enum(['IA', 'ESG']),
  semester: z.number().int().min(1).max(4),
  verificationCode: z.string().length(6, 'O código de confirmação deve ter exatamente 6 dígitos numéricos.'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'auth_register');
    if (!rateCheck.allowed) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Muitas tentativas de cadastro a partir deste endereço. Tente novamente em ${rateCheck.retryAfter}s.`,
        },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

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
        { success: false, error: 'Dados cadastrais inválidos ou incompletos', errors: fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { name, email, recoveryEmail, ra, password, course, semester, verificationCode } = parseResult.data;

    // Validação estrita de força da senha
    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: strength.message },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRecoveryEmail = recoveryEmail.toLowerCase().trim();
    const cleanRa = ra ? sanitizeInput(ra) : null;
    const cleanName = sanitizeInput(name);

    // 1. Validar se o código de 6 dígitos enviado ao e-mail de recuperação é verídico e vigente
    const verifCheck = await db.verifications.verify(cleanRecoveryEmail, verificationCode);
    if (!verifCheck.valid) {
      // Fallback: verifica pelo institucional caso registrado sob o institucional
      const verifCheckInst = await db.verifications.verify(cleanEmail, verificationCode);
      if (!verifCheckInst.valid) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Código de verificação incorreto ou expirado. Verifique a mensagem recebida no seu e-mail de recuperação.',
          },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }
    }

    // 2. Verificar se o e-mail institucional já existe
    const existingEmail = await db.users.findByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Este e-mail institucional já se encontra cadastrado no portal.' },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    // 3. Verificar se o RA já existe
    if (cleanRa) {
      const existingRa = await db.users.findByRa(cleanRa);
      if (existingRa) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Este RA já se encontra vinculado a outro estudante.' },
          { status: 409, headers: SECURITY_HEADERS }
        );
      }
    }

    // 4. Criptografar senha com Bcrypt
    const password_hash = await hashPassword(password);

    // 5. Criar usuário com papel padrão ALUNO e e-mail já confirmado
    const newUser = await db.users.create({
      name: cleanName,
      email: cleanEmail,
      recovery_email: cleanRecoveryEmail,
      is_email_verified: true,
      email_verified_at: new Date().toISOString(),
      ra: cleanRa,
      password_hash,
      role: 'ALUNO',
      course,
      semester,
      is_active: true,
    });

    // 6. Registrar evento de auditoria
    await db.audit.log({
      user_id: newUser.id,
      action: 'USER_REGISTERED',
      entity_name: 'users',
      entity_id: newUser.id,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent'),
      payload: { email: cleanEmail, recoveryEmail: cleanRecoveryEmail, course, semester },
    });

    return NextResponse.json<ApiResponse<SafeUser>>(
      {
        success: true,
        message: 'Conta criada e e-mail validado com sucesso! Você já pode efetuar login.',
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
