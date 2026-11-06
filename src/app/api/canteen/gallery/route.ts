import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function formatLabel(filename: string): string {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return nameWithoutExt
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function guessCategory(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('coca') || lower.includes('fanta') || lower.includes('suco') || lower.includes('agua') || lower.includes('minalba') || lower.includes('energetico') || lower.includes('xup') || lower.includes('refrigerante') || lower.includes('lata')) {
    return 'BEBIDA';
  }
  if (lower.includes('doce') || lower.includes('pacoquita') || lower.includes('pao_de_mel') || lower.includes('trento') || lower.includes('tortuguita') || lower.includes('chiclete') || lower.includes('bala') || lower.includes('teens') || lower.includes('drops') || lower.includes('chocolate')) {
    return 'DOCE';
  }
  if (lower.includes('coxinha') || lower.includes('esfiha') || lower.includes('esfira') || lower.includes('enrolad') || lower.includes('hamburguer') || lower.includes('bolinho') || lower.includes('pao_de_queijo') || lower.includes('hot_pocket') || lower.includes('salgado') || lower.includes('pastel') || lower.includes('pizza') || lower.includes('tranca') || lower.includes('batata')) {
    return 'SALGADO';
  }
  return 'OUTROS';
}

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');

    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ success: true, images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

    const images = files
      .filter((file) => validExts.includes(path.extname(file).toLowerCase()))
      .map((file) => {
        const fullPath = path.join(uploadDir, file);
        const stats = fs.statSync(fullPath);
        return {
          filename: file,
          path: `/images/products/${file}`,
          label: formatLabel(file),
          category: guessCategory(file),
          size: stats.size,
          mtime: stats.mtime,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

    return NextResponse.json({ success: true, images });
  } catch (error: any) {
    console.error('Erro ao listar galeria da cantina:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao ler imagens da galeria.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let filename = searchParams.get('filename');

    if (!filename) {
      try {
        const body = await req.json();
        filename = body?.filename;
      } catch {}
    }

    if (!filename) {
      return NextResponse.json({ success: false, error: 'Nome do arquivo não informado.' }, { status: 400 });
    }

    // Previne path traversal pegando apenas o basename
    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Arquivo não encontrado na galeria.' }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: `Imagem "${safeFilename}" removida com sucesso da galeria FATEC.`,
      filename: safeFilename,
    });
  } catch (error: any) {
    console.error('Erro ao remover imagem da galeria:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao remover imagem da galeria.' },
      { status: 500 }
    );
  }
}
