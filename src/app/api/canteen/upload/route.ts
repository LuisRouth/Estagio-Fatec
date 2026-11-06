import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

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
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : '.jpg');
    const safeBase = file.name
      .replace(ext, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const filename = `${safeBase}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/images/products/${filename}`,
      filename,
    });
  } catch (error: any) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar o upload da imagem.' },
      { status: 500 }
    );
  }
}
