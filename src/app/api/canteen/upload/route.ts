import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // =========================================================================
    // CASO 1: DOWNLOAD DIRETO DE LINK WEB (JSON: { url, customName })
    // =========================================================================
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { url, customName } = body;

      if (!url || typeof url !== 'string') {
        return NextResponse.json({ success: false, error: 'URL da imagem não fornecida.' }, { status: 400 });
      }

      // Baixa a imagem da Web
      const remoteRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!remoteRes.ok) {
        return NextResponse.json(
          { success: false, error: `Não foi possível baixar a imagem da URL (HTTP ${remoteRes.status}).` },
          { status: 400 }
        );
      }

      const mimeType = remoteRes.headers.get('content-type') || '';
      let ext = '.jpg';
      if (mimeType.includes('png') || url.toLowerCase().endsWith('.png')) ext = '.png';
      else if (mimeType.includes('webp') || url.toLowerCase().endsWith('.webp')) ext = '.webp';
      else if (mimeType.includes('gif') || url.toLowerCase().endsWith('.gif')) ext = '.gif';

      const buffer = Buffer.from(await remoteRes.arrayBuffer());

      // Define o nome de arquivo com base no nome digitado pelo usuário
      let baseCandidate = customName;
      if (!baseCandidate) {
        try {
          baseCandidate = path.basename(new URL(url).pathname).replace(/\.[^/.]+$/, '');
        } catch {
          baseCandidate = 'produto_web';
        }
      }
      const safeBase = sanitizeFilename(baseCandidate || 'produto_web') || 'produto';
      const filename = `${safeBase}${ext}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/images/products/${filename}`,
        filename,
        message: `Imagem web salva com sucesso como "${filename}"!`,
      });
    }

    // =========================================================================
    // CASO 2: UPLOAD DE ARQUIVO LOCAL (MULTIPART FORM DATA)
    // =========================================================================
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customNameInput = (formData.get('customName') as string | null) || '';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido. Envie apenas imagens JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. O limite máximo é de 5MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalExt = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg');

    // Se o usuário especificou um nome personalizado, usa o nome que ele deixou!
    // Se não, usa o nome original do arquivo sanitizado (sem adicionar timestamp aleatório!)
    const rawName = customNameInput.trim() || file.name.replace(originalExt, '');
    const safeBase = sanitizeFilename(rawName) || 'foto_produto';
    const filename = `${safeBase}${originalExt}`;

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/images/products/${filename}`,
      filename,
      message: `Foto enviada e salva com sucesso como "${filename}"!`,
    });
  } catch (error: any) {
    console.error('Erro no processamento da imagem da cantina:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar a imagem do produto.' },
      { status: 500 }
    );
  }
}
