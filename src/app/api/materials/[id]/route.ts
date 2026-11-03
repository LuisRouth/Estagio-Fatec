// ====================================================================
// ENDPOINT: DETALHES, ATUALIZAÇÃO E EXCLUSÃO DE MATERIAL ACADÊMICO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, PUT, DELETE /api/materials/[id]
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  subject: z.string().min(2).max(120).optional(),
  semester: z.number().int().min(1).max(6).optional(),
  github_url: z.string().url().or(z.string().startsWith('https://github.com')).optional().nullable(),
  tags: z.string().max(255).optional().nullable(),
  is_approved: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/materials/[id]
 * Detalhes do material com opção de contabilizar download.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const shouldIncrement = searchParams.get('download') === 'true';

    const material = await db.materials.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material acadêmico não localizado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    if (shouldIncrement) {
      await db.materials.incrementDownloadCount(id);
      material.download_count += 1;
    }

    return NextResponse.json(
      { success: true, data: material },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao buscar material:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar material acadêmico.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * PUT /api/materials/[id]
 * Atualiza dados do material (Autor, Professor ou Admin).
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const material = await db.materials.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const isAuthor = material.author_id === session.sub;
    const isPrivileged = session.role === 'PROFESSOR' || session.role === 'ADMIN';

    if (!isAuthor && !isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada. Apenas o autor, professores ou administradores podem editar este material.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updateData: any = { ...parsed.data };
    if (updateData.title) updateData.title = sanitizeInput(updateData.title);
    if (updateData.description) updateData.description = sanitizeInput(updateData.description);
    if (updateData.subject) updateData.subject = sanitizeInput(updateData.subject);

    // Apenas Professor ou Admin podem alterar status de aprovação
    if (updateData.is_approved !== undefined && !isPrivileged) {
      delete updateData.is_approved;
    }

    const updated = await db.materials.update(id, updateData);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'ACADEMIC_MATERIAL_UPDATED',
      entity_name: 'academic_materials',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    return NextResponse.json(
      { success: true, message: 'Material atualizado com sucesso.', data: updated },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar material.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * DELETE /api/materials/[id]
 * Remove material didático (Autor, Professor ou Admin).
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const material = await db.materials.findById(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: 'Material não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const isAuthor = material.author_id === session.sub;
    const isPrivileged = session.role === 'PROFESSOR' || session.role === 'ADMIN';

    if (!isAuthor && !isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada para excluir este material.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    await db.materials.delete(id);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'ACADEMIC_MATERIAL_DELETED',
      entity_name: 'academic_materials',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    return NextResponse.json(
      { success: true, message: 'Material removido com sucesso.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao remover material:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao excluir material.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

