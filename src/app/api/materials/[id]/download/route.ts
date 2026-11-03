// ====================================================================
// ENDPOINT: CONTABILIZAÇÃO DE DOWNLOAD DE MATERIAL DIDÁTICO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/materials/[id]/download
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SECURITY_HEADERS } from '@/lib/security';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const material = await db.materials.findById(id);

    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const newCount = await db.materials.incrementDownloadCount(id);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: material.id,
          title: material.title,
          file_url: material.file_url,
          download_count: newCount,
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao registrar download:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao registrar download.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

