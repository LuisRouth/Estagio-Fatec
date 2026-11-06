// ====================================================================
// ENDPOINT: UPLOAD DE ANEXOS E DOCUMENTOS DO MURAL DE AVISOS
// Responsável: Cesar (Backend, Banco de Dados & Segurança) & Luis (Frontend UI/UX)
// Rota: POST /api/announcements/upload
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput, checkRateLimit } from '@/lib/security';

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.zip',
]);

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

/**
 * POST /api/announcements/upload
 * Permite anexar arquivos físicos (PDF, imagens, documentos do Office) aos comunicados oficiais.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PROFESSOR' && session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Apenas professores, membros do CA ou administradores podem anexar arquivos aos comunicados.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const rateCheck = checkRateLimit(session.sub, 'materials_upload');
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Muitos uploads em sequência. Aguarde ${rateCheck.retryAfter}s para anexar outro arquivo.` },
        { status: 429, headers: { ...SECURITY_HEADERS, ...rateCheck.headers } }
      );
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Envio inválido. Utilize multipart/form-data com o campo "file".' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

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
        { success: false, error: 'O arquivo excede o limite máximo institucional de 25MB.' },
        { status: 413, headers: SECURITY_HEADERS }
      );
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de arquivo não permitido (${ext}). Tipos suportados: PDF, DOCX, XLSX, PPTX, PNG, JPG, WEBP, TXT, ZIP.`,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Sanitiza o nome base
    const baseName = sanitizeInput(path.basename(originalName, ext))
      .replace(/[^a-zA-Z0-9_\-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const finalFileName = `anexo_${baseName}_${uniqueSuffix}${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'announcements');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadsDir, finalFileName);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/announcements/${finalFileName}`;
    const detectedType: 'IMAGEM' | 'DOCUMENTO' = IMAGE_EXTENSIONS.has(ext) ? 'IMAGEM' : 'DOCUMENTO';

    return NextResponse.json(
      {
        success: true,
        message: 'Arquivo anexado com sucesso.',
        data: {
          url: fileUrl,
          title: originalName,
          filename: finalFileName,
          sizeBytes: buffer.length,
          type: detectedType,
        },
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro no upload de anexo de comunicado:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar upload do anexo.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
