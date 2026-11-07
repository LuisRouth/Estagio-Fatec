import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SECURITY_HEADERS, checkRateLimit } from '@/lib/security';
import { ApiResponse } from '@/lib/types';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(ip, 'auth_register');
    if (!rateCheck.allowed) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Aguarde um minuto antes de solicitar um novo código.' },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    let email = body.email;
    const recoveryEmail = body.recoveryEmail ? body.recoveryEmail.toLowerCase().trim() : null;

    // Se não passou e-mail, tenta pegar do usuário autenticado
    let userId = body.userId;
    if (!email) {
      const sessionUser = await getSessionUser();
      if (sessionUser) {
        email = sessionUser.email;
        userId = sessionUser.id;
      }
    }

    if (!email) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'E-mail institucional obrigatório para envio do código de verificação.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const isValidDomain =
      cleanEmail.endsWith('@aluno.cps.sp.gov.br') || cleanEmail.endsWith('@fatec.sp.gov.br');

    if (!isValidDomain) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'O e-mail principal deve ser institucional obrigatório (@aluno.cps.sp.gov.br ou @fatec.sp.gov.br).',
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Na criação da conta, o e-mail de recuperação é obrigatório
    if (body.purpose === 'ACCOUNT_ACTIVATION' && !recoveryEmail) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'E-mail de segurança/recuperação é obrigatório para envio do código de ativação.',
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (recoveryEmail && !/\S+@\S+\.\S+/.test(recoveryEmail)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'E-mail de recuperação informado possui formato inválido.',
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Se não tiver userId, busca usuário cadastrado
    if (!userId) {
      const existingUser = await db.users.findByEmail(cleanEmail);
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    const verification = await db.verifications.create(
      userId,
      cleanEmail,
      body.purpose || 'ACCOUNT_ACTIVATION',
      recoveryEmail
    );

    // O código é enviado obrigatoriamente ao e-mail de recuperação se fornecido
    const targetRecipient = recoveryEmail || cleanEmail;

    // Dispara e-mail real via SMTP com template FATEC
    const emailResult = await sendVerificationEmail({
      to: targetRecipient,
      code: verification.verificationCode,
      institutionalEmail: cleanEmail,
    });

    console.log(`[VERIFICAÇÃO DE E-MAIL] Código gerado para conta ${cleanEmail}. Destino do e-mail: ${targetRecipient}. Enviado via SMTP: ${emailResult.sent}`);

    // NUNCA retorna o código de 6 dígitos no payload JSON para o navegador
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          email: cleanEmail,
          targetRecipient,
          expiresInMinutes: 15,
          sentViaSmtp: emailResult.sent,
        },
        message: emailResult.sent
          ? `Código de confirmação enviado com sucesso para ${targetRecipient}.`
          : `Código de verificação gerado. Verifique a caixa de entrada de ${targetRecipient}.`,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao enviar verificação de e-mail:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao despachar código de verificação.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
