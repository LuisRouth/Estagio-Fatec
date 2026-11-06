// ====================================================================
// ENDPOINT: COMUNICADO INDIVIDUAL (DETALHES, EDIÇÃO & EXCLUSÃO)
// Rota: GET, PUT, DELETE /api/announcements/[id]
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const linkSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(100),
  url: z.string().min(1),
});

const attachmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  url: z.string().min(1),
  type: z.enum(['IMAGEM', 'DOCUMENTO']).default('DOCUMENTO'),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(4).max(200).optional(),
  content: z.string().min(5).optional(),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const).optional(),
  target_course: z.enum(['IA', 'ESG'] as const).optional().nullable(),
  target_semester: z.number().int().min(1).max(4).optional().nullable(),
  banner_type: z.enum(['PADRAO_AZUL', 'PADRAO_VERDE', 'PADRAO_ROXO', 'PADRAO_AMBAR', 'PADRAO_GRAFITE', 'CUSTOM'] as const).optional().nullable(),
  image_url: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  link_label: z.string().optional().nullable(),
  links: z.array(linkSchema).optional().nullable(),
  attachments: z.array(attachmentSchema).optional().nullable(),
  author_role: z.string().optional().nullable(),
  is_pinned: z.boolean().optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/announcements/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const announcement = await db.announcements.findById(id);

    if (!announcement) {
      return NextResponse.json(
        { success: false, error: 'Comunicado não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: announcement },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao buscar comunicado:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar dados do comunicado.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * PUT /api/announcements/[id]
 * Edição de comunicado (CA, Professores e Administradores)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PROFESSOR' && session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Apenas professores, membros do CA ou administradores podem editar comunicados.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const existing = await db.announcements.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Comunicado não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = updateAnnouncementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos para atualização.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updated = await db.announcements.update(id, {
      ...(parsed.data.title ? { title: sanitizeInput(parsed.data.title) } : {}),
      ...(parsed.data.content ? { content: sanitizeInput(parsed.data.content) } : {}),
      ...(parsed.data.priority ? { priority: parsed.data.priority } : {}),
      ...(parsed.data.target_course !== undefined ? { target_course: parsed.data.target_course } : {}),
      ...(parsed.data.target_semester !== undefined ? { target_semester: parsed.data.target_semester } : {}),
      ...(parsed.data.banner_type !== undefined ? { banner_type: parsed.data.banner_type } : {}),
      ...(parsed.data.image_url !== undefined ? { image_url: parsed.data.image_url ? sanitizeInput(parsed.data.image_url) : null } : {}),
      ...(parsed.data.link_url !== undefined ? { link_url: parsed.data.link_url ? sanitizeInput(parsed.data.link_url) : null } : {}),
      ...(parsed.data.link_label !== undefined ? { link_label: parsed.data.link_label ? sanitizeInput(parsed.data.link_label) : null } : {}),
      ...(parsed.data.links !== undefined ? { links: parsed.data.links || [] } : {}),
      ...(parsed.data.attachments !== undefined ? { attachments: parsed.data.attachments || [] } : {}),
      ...(parsed.data.author_role !== undefined ? { author_role: parsed.data.author_role ? sanitizeInput(parsed.data.author_role) : null } : {}),
      ...(parsed.data.is_pinned !== undefined ? { is_pinned: parsed.data.is_pinned } : {}),
      ...(parsed.data.expires_at !== undefined ? { expires_at: parsed.data.expires_at } : {}),
    });

    return NextResponse.json(
      { success: true, message: 'Comunicado atualizado com sucesso.', data: updated },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao atualizar comunicado:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao atualizar comunicado.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * DELETE /api/announcements/[id]
 * Exclusão de comunicado (CA e Administradores)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN' && session.role !== 'PROFESSOR')) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Apenas membros do CA ou administradores podem excluir avisos.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const existing = await db.announcements.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Comunicado não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const deleted = await db.announcements.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Falha ao excluir comunicado.' },
        { status: 500, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Comunicado removido com sucesso do mural.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao excluir comunicado:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao excluir comunicado.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
