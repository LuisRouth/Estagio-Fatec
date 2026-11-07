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
        Recebemos uma solicitação de ativação de conta ${institutionalEmail ? `para o e-mail institucional <strong>${institutionalEmail}</strong>` : ''} no Portal da FATEC Rio Claro.
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

export interface CanteenOrderAlertParams {
  to: string;
  orderId: string;
  txid?: string;
  studentName: string;
  studentRa?: string | null;
  studentEmail: string;
  studentCourse?: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  createdAt?: string;
  adminUrl?: string;
}

/**
 * Dispara e-mail de alerta imediato para o conferente da cantina quando um novo pedido Pix é criado.
 */
export async function sendCanteenOrderAlertToConferente(params: CanteenOrderAlertParams): Promise<EmailSendResult> {
  const { to, orderId, studentName, studentRa, studentEmail, studentCourse, totalAmount, items, adminUrl } = params;
  const from = process.env.SMTP_FROM || `"Cantina FATEC Rio Claro" <${process.env.SMTP_USER || 'noreply@fatec.sp.gov.br'}>`;
  const transporter = getTransporter();

  const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://estagio-fatec.vercel.app');
  const targetAdminUrl = adminUrl || `${baseUrl}/cantina/admin`;

  const formattedTotal = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
  const subject = `🔔 Novo Pedido Cantina: ${studentName} - ${formattedTotal} (Aguardando Pix)`;

  const itemsRows = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 12px; font-size: 14px; color: #1e293b;">${item.name}</td>
        <td style="padding: 10px 12px; font-size: 14px; color: #64748b; text-align: center;">${item.quantity}x</td>
        <td style="padding: 10px 12px; font-size: 14px; color: #64748b; text-align: right;">R$ ${item.unitPrice.toFixed(2).replace('.', ',')}</td>
        <td style="padding: 10px 12px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">R$ ${item.subtotal.toFixed(2).replace('.', ',')}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Pedido Cantina - FATEC Rio Claro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #b91c1c; padding: 22px; text-align: center; color: #ffffff; }
    .content { padding: 26px 24px; }
    .badge { display: inline-block; padding: 4px 10px; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; border-radius: 999px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 18px; }
    .total-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0; }
    .btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">🛒 Cantina Discente FATEC Rio Claro</h2>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">Aviso de Novo Pedido Gerado via Pix</p>
    </div>
    <div class="content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <span class="badge">AGUARDANDO CONFERÊNCIA PIX</span>
        <span style="font-size: 12px; color: #64748b;">ID: #${orderId.slice(-8).toUpperCase()}</span>
      </div>

      <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; line-height: 1.6;">
        <strong style="color: #0f172a; font-size: 14px;">Dados do Aluno Comprador:</strong><br>
        👤 <strong>Nome:</strong> ${studentName}<br>
        📧 <strong>E-mail:</strong> ${studentEmail}<br>
        ${studentRa ? `🎓 <strong>RA:</strong> ${studentRa}<br>` : ''}
        ${studentCourse ? `📚 <strong>Curso:</strong> ${studentCourse}<br>` : ''}
      </div>

      <table class="table">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">
            <th style="padding: 8px 12px;">Produto</th>
            <th style="padding: 8px 12px; text-align: center;">Qtd</th>
            <th style="padding: 8px 12px; text-align: right;">Unitário</th>
            <th style="padding: 8px 12px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="total-box">
        <span style="font-size: 13px; color: #15803d; font-weight: 600;">VALOR TOTAL A CONFERIR NO EXTRATO BANCÁRIO:</span>
        <div style="font-size: 28px; font-weight: 800; color: #166534; margin-top: 4px;">${formattedTotal}</div>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${targetAdminUrl}" class="btn">Abrir Painel & Dar Baixa no Pedido</a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 14px;">
        Após verificar a entrada do Pix no aplicativo do banco, acerte a baixa no painel para liberar a retirada.
      </p>
    </div>
  </div>
</body>
</html>`;

  const textContent = `NOVO PEDIDO CANTINA FATEC - AGUARDANDO PIX\n\nAluno: ${studentName} (${studentEmail})\nValor Total: ${formattedTotal}\nPedido: #${orderId}\n\nAcesse o painel para conferir e dar baixa: ${targetAdminUrl}`;

  if (!transporter) {
    console.warn(`[EMAIL SENDER] SMTP não configurado. Alerta da cantina para ${to} ignorado.`);
    return { sent: false, error: 'SMTP não configurado.' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[EMAIL SENDER] Erro ao enviar alerta da cantina para ${to}:`, err);
    return { sent: false, error: err.message };
  }
}

export interface CanteenPaymentConfirmationParams {
  to: string;
  studentName: string;
  orderId: string;
  totalAmount: number;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  validatedBy?: string;
}

/**
 * Dispara e-mail para o discente comprador informando que seu pagamento Pix foi confirmado e o pedido liberado.
 */
export async function sendCanteenPaymentConfirmationToStudent(params: CanteenPaymentConfirmationParams): Promise<EmailSendResult> {
  const { to, studentName, orderId, totalAmount, items } = params;
  const from = process.env.SMTP_FROM || `"Cantina FATEC Rio Claro" <${process.env.SMTP_USER || 'noreply@fatec.sp.gov.br'}>`;
  const transporter = getTransporter();

  const formattedTotal = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;
  const subject = `🎉 Pagamento Confirmado: Pedido #${orderId.slice(-8).toUpperCase()} - Cantina FATEC`;

  const itemsRows = (items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 10px 12px; font-size: 14px; color: #1e293b;">${item.name}</td>
        <td style="padding: 10px 12px; font-size: 14px; color: #64748b; text-align: center;">${item.quantity}x</td>
        <td style="padding: 10px 12px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">R$ ${item.subtotal.toFixed(2).replace('.', ',')}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pagamento Confirmado - Cantina FATEC</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #15803d; padding: 24px; text-align: center; color: #ffffff; }
    .content { padding: 28px 24px; }
    .success-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 18px; text-align: center; margin-bottom: 22px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 14px; margin-bottom: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2 style="margin: 0; font-size: 22px;">✅ Pagamento Confirmado!</h2>
      <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">Cantina Discente - FATEC Rio Claro</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; color: #334155; margin-top: 0;">
        Olá, <strong>${studentName}</strong>! Seu pagamento Pix foi conferido e baixado com sucesso.
      </p>

      <div class="success-box">
        <span style="font-size: 13px; color: #166534; font-weight: 600;">CÓDIGO DO PEDIDO LIBERADO:</span>
        <div style="font-size: 26px; font-weight: 800; color: #15803d; letter-spacing: 1px; margin-top: 4px;">
          #${orderId.slice(-8).toUpperCase()}
        </div>
        <div style="font-size: 13px; color: #15803d; margin-top: 6px;">
          Valor Pago: <strong>${formattedTotal}</strong>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 18px; border-left: 4px solid #16a34a;">
        <strong style="color: #0f172a; font-size: 13px;">Como retirar seus produtos:</strong>
        <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">
          Dirija-se ao balcão da cantina na FATEC e informe o seu nome ou o código do pedido <strong>#${orderId.slice(-8).toUpperCase()}</strong>.
        </p>
      </div>

      ${
        itemsRows
          ? `
      <table class="table">
        <thead>
          <tr style="background: #f1f5f9; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;">
            <th style="padding: 8px 12px;">Item</th>
            <th style="padding: 8px 12px; text-align: center;">Qtd</th>
            <th style="padding: 8px 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>`
          : ''
      }

      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
        Obrigado por apoiar a Cantina Discente da FATEC Rio Claro!<br>
        Guarde este e-mail como seu comprovante oficial de retirada.
      </div>
    </div>
  </div>
</body>
</html>`;

  const textContent = `PAGAMENTO CONFIRMADO - CANTINA FATEC\n\nOlá, ${studentName}!\nSeu pedido #${orderId.slice(-8).toUpperCase()} no valor de ${formattedTotal} foi confirmado e está pronto para retirada no balcão da cantina.\n\nObrigado!`;

  if (!transporter) {
    console.warn(`[EMAIL SENDER] SMTP não configurado. Confirmação para ${to} pausada.`);
    return { sent: false, error: 'SMTP não configurado.' };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`[EMAIL SENDER] Erro ao enviar confirmação para ${to}:`, err);
    return { sent: false, error: err.message };
  }
}

