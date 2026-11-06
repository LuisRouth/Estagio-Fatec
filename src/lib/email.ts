import nodemailer from 'nodemailer';

export interface SendVerificationEmailParams {
  to: string;
  code: string;
  institutionalEmail?: string;
  verificationUrl?: string;
}

export interface EmailSendResult {
  sent: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string | false;
}

/**
 * Cria ou obtém o transporter do Nodemailer baseado nas variáveis de ambiente.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Dispara e-mail com código de verificação para o e-mail institucional do aluno/professor.
 */
export async function sendVerificationEmail({
  to,
  code,
  institutionalEmail,
  verificationUrl,
}: SendVerificationEmailParams): Promise<EmailSendResult> {
  const from = process.env.SMTP_FROM || `"Portal FATEC Rio Claro" <${process.env.SMTP_USER || 'noreply@fatec.sp.gov.br'}>`;
  const transporter = getTransporter();

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.NEXTAUTH_URL)
    : 'http://localhost:3000';

  const fullVerifyUrl = verificationUrl 
    ? (verificationUrl.startsWith('http') ? verificationUrl : `${baseUrl}${verificationUrl}`)
    : `${baseUrl}/verificar-email?code=${code}&email=${encodeURIComponent(to)}`;

  const subject = `Código de Confirmação: ${code} - Portal FATEC Rio Claro`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificação de E-mail - FATEC Rio Claro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #b91c1c; padding: 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #0f172a; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .code-box { background: #f8fafc; border: 2px dashed #b91c1c; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
    .code-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
    .code-number { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #b91c1c; font-family: monospace; }
    .expiry { font-size: 12px; color: #94a3b8; margin-top: 8px; }
    .btn-container { text-align: center; margin: 24px 0; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; font-size: 12px; color: #64748b; text-align: center; line-height: 1.5; }
    .warning { font-size: 12px; color: #dc2626; margin-top: 16px; font-style: italic; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Portal FATEC Rio Claro</h1>
      <p>Centro Paula Souza — Governo do Estado de São Paulo</p>
    </div>
    <div class="content">
      <div class="greeting">Olá, Aluno(a) FATEC!</div>
      <p class="text">
        Recebemos uma solicitação de ativação de conta ${institutionalEmail ? `para o e-mail institucional <strong>${institutionalEmail}</strong>` : ''} no Portal de Empregabilidade e Estágios da FATEC Rio Claro.
      </p>
      
      <div class="code-box">
        <div class="code-label">Seu Código de Confirmação</div>
        <div class="code-number">${code}</div>
        <div class="expiry">Válido por 15 minutos</div>
      </div>

      <p class="text" style="text-align: center; font-size: 13px;">
        Digite este código de 6 dígitos no portal para autenticar e ativar a sua conta institucional.
      </p>

      <div class="btn-container">
        <a href="${fullVerifyUrl}" class="btn">Validar Diretamente no Portal</a>
      </div>

      <p class="warning">
        ⚠️ Atenção: Se você não realizou esta solicitação, ignore este e-mail. Por motivos de segurança, nunca compartilhe este código com terceiros.
      </p>
    </div>
    <div class="footer">
      <strong>Faculdade de Tecnologia de Rio Claro</strong><br>
      Cursos Superiores de Tecnologia em Inteligência Artificial e Gestão ESG<br>
      Av. 46-A, 107 - Vila Alemã, Rio Claro - SP, 13506-745
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `Portal FATEC Rio Claro\n\nCódigo de Verificação de E-mail Institucional: ${code}\n\nE-mail de destino: ${to}\nEste código é válido por 15 minutos.\n\nOu acesse: ${fullVerifyUrl}\n\nSe você não solicitou este código, ignore esta mensagem.`;

  if (!transporter) {
    console.warn(`[EMAIL SENDER] Variáveis SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) não configuradas no ambiente. Disparo de e-mail para ${to} pausado pelo provedor. Código gerado: ${code}`);
    return {
      sent: false,
      error: 'Serviço SMTP não configurado no servidor (.env). Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS para envio em produção.',
    };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[EMAIL SENDER] E-mail enviado com sucesso para ${to}! ID: ${info.messageId}`);
    return {
      sent: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error(`[EMAIL SENDER] Falha no envio do e-mail para ${to}:`, err);
    return {
      sent: false,
      error: err.message || 'Falha ao conectar ao servidor SMTP de e-mails.',
    };
  }
}

