// ====================================================================
// ENDPOINT: GERAÇÃO DE URL ASSINADA PARA UPLOAD DIRETO (ATÉ 25 MB)
// Evita o limite de 4.5 MB de payload das funções Serverless da Vercel
// Rota: POST /api/materials/upload-url
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput, checkRateLimit } from '@/lib/security';

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.ipynb',
  '.zip',
  '.py',
  '.docx',
  '.pptx',
  '.csv',
  '.json',
  '.png',
  '.jpg',
  '.jpeg',
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const CONTENT_TYPE_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.ipynb': 'application/x-ipynb+json',
  '.zip': 'application/zip',
  '.py': 'text/x-python',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.csv': 'text/csv',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária para realizar upload de arquivos.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const rateCheck = checkRateLimit(session.sub, 'materials_upload');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Limite de uploads excedido. Aguarde ${rateCheck.retryAfter}s antes de enviar outro arquivo.` },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

    const body = await req.json();
    const filename = typeof body.filename === 'string' ? body.filename : '';
    const sizeBytes = typeof body.sizeBytes === 'number' ? body.sizeBytes : 0;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Informe o nome do arquivo ("filename").' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (sizeBytes > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Arquivo excede o limite máximo permitido de 25MB.' },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    const ext = path.extname(filename).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensão não permitida (${ext}). Extensões aceitas: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const isRealSupabase =
      supabaseUrl.startsWith('https://') &&
      !supabaseUrl.includes('[PROJECT-REF]') &&
      supabaseServiceKey.length > 20 &&
      !supabaseServiceKey.includes('sua_chave');

    if (!isRealSupabase) {
      return NextResponse.json(
        {
          success: false,
          fallbackLocal: true,
          error: 'Supabase Storage não configurado neste ambiente.',
        },
        { status: 503, headers: SECURITY_HEADERS }
      );
    }

    const safeBaseName = sanitizeInput(path.basename(filename, ext))
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalFileName = `${safeBaseName}_${uniqueSuffix}${ext}`;
    const bucket = 'materials';

    const headers = {
      Authorization: `Bearer ${supabaseServiceKey}`,
      apikey: supabaseServiceKey,
      'Content-Type': 'application/json',
    };

    // Garante que o bucket público existe
    let signRes = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${finalFileName}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });

    if (signRes.status === 404 || signRes.status === 400) {
      await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: bucket, name: bucket, public: true }),
      });

      signRes = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${finalFileName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
    }

    if (!signRes.ok) {
      const errText = await signRes.text().catch(() => '');
      return NextResponse.json(
        {
          success: false,
          error: `Falha ao gerar URL assinada no Supabase Storage (HTTP ${signRes.status}). ${errText}`.trim(),
        },
        { status: 502, headers: SECURITY_HEADERS }
      );
    }

    const signData = await signRes.json();
    const signedPath = signData.url || '';
    const signedUploadUrl = signedPath.startsWith('http')
      ? signedPath
      : `${supabaseUrl}/storage/v1${signedPath.startsWith('/') ? '' : '/'}${signedPath}`;

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${finalFileName}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          signedUploadUrl,
          publicUrl,
          fileName: finalFileName,
          contentType: CONTENT_TYPE_MAP[ext] || 'application/octet-stream',
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao gerar URL assinada de upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao preparar upload.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
