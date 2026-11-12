// ====================================================================
// ENDPOINT: APROVAÇÃO RÁPIDA DE MATERIAL ACADÊMICO
// Rota: POST /api/materials/[id]/approve
// Responsável: Moderação Acadêmica (Professores, CA e Admin)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const isPrivileged = session.role === 'PROFESSOR' || session.role === 'ADMIN' || session.role === 'CA_MEMBRO';
    if (!isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada. Apenas moderadores podem aprovar materiais didáticos.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const material = await db.materials.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material acadêmico não localizado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const updated = await db.materials.update(id, { is_approved: true });
    return NextResponse.json(
      { success: true, message: 'Material aprovado com sucesso!', data: updated },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao aprovar material acadêmico:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao aprovar material.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

