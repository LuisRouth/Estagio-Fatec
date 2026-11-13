// ====================================================================
// ENDPOINT: UPLOAD DE ARQUIVOS DE MATERIAIS DIDÁTICOS E TCC
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/materials/upload
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
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

/**
 * POST /api/materials/upload
 * Processa upload seguro de arquivos acadêmicos (multipart/form-data ou Base64).
 */
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

    const contentType = req.headers.get('content-type') || '';

    let fileName = '';
    let buffer: Buffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'Nenhum arquivo enviado no campo "file".' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Arquivo excede o limite máximo permitido de 25MB.' },
          { status: 413, headers: SECURITY_HEADERS }
        );
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Suporte a payload JSON Base64 (ideal para pipelines e testes)
      const body = await req.json();
      if (!body.filename || !body.content_base64) {
        return NextResponse.json(
          { success: false, error: 'Envie "filename" e "content_base64" no corpo da requisição.' },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      fileName = body.filename;
      buffer = Buffer.from(body.content_base64, 'base64');

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Arquivo excede o limite de 25MB.' },
          { status: 413, headers: SECURITY_HEADERS }
        );
      }
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Extensão de arquivo não permitida (${ext}). Extensões aceitas: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Sanitizar o nome do arquivo para prevenir path traversal
    const safeBaseName = sanitizeInput(path.basename(fileName, ext))
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalFileName = `${safeBaseName}_${uniqueSuffix}${ext}`;

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const isRealSupabase =
      supabaseUrl.startsWith('https://') &&
      !supabaseUrl.includes('[PROJECT-REF]') &&
      supabaseServiceKey.length > 20 &&
      !supabaseServiceKey.includes('sua_chave');

    let fileUrl = '';
    let storageProvider: 'supabase' | 'local' = 'local';

    if (isRealSupabase) {
      const bucket = 'materials';
      const contentTypeMap: Record<string, string> = {
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

      const uploadEndpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${finalFileName}`;
      const uploadBody = new Uint8Array(buffer);
      let storageRes = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
          'Content-Type': contentTypeMap[ext] || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: uploadBody,
      });

      // Se o bucket ainda não existir, cria automaticamente como público e tenta novamente
      if (storageRes.status === 404 || storageRes.status === 400) {
        await fetch(`${supabaseUrl}/storage/v1/bucket`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: bucket, name: bucket, public: true }),
        });

        storageRes = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
            'Content-Type': contentTypeMap[ext] || 'application/octet-stream',
            'x-upsert': 'true',
          },
          body: uploadBody,
        });
      }

      if (!storageRes.ok) {
        const errText = await storageRes.text().catch(() => '');
        return NextResponse.json(
          {
            success: false,
            error: `Falha ao enviar arquivo para o Supabase Storage (HTTP ${storageRes.status}). ${errText}`.trim(),
          },
          { status: 502, headers: SECURITY_HEADERS }
        );
      }

      fileUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${finalFileName}`;
      storageProvider = 'supabase';
    } else if (process.env.VERCEL === '1') {
      return NextResponse.json(
        {
          success: false,
          error:
            'Armazenamento em nuvem não configurado no servidor. Configure SUPABASE_SERVICE_ROLE_KEY na Vercel ou informe uma URL externa válida.',
        },
        { status: 503, headers: SECURITY_HEADERS }
      );
    } else {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'materials');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, finalFileName);
      fs.writeFileSync(filePath, buffer);
      fileUrl = `/uploads/materials/${finalFileName}`;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Arquivo enviado com sucesso.',
        data: {
          fileUrl,
          fileName: finalFileName,
          originalName: fileName,
          sizeBytes: buffer.length,
          extension: ext,
          storageProvider,
        },
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro no upload de material:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar upload.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

