// ====================================================================
// ENDPOINT: MURAL DE AVISOS INSTITUCIONAIS (CARD #S2-C2)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, POST /api/announcements
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { CourseType } from '@/lib/types';

const linkSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Rótulo obrigatório').max(100),
  url: z.string().url('URL inválida').or(z.string().min(1)),
});

const attachmentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Título obrigatório').max(150),
  url: z.string().min(1, 'URL ou caminho obrigatório'),
  type: z.enum(['IMAGEM', 'DOCUMENTO']).default('DOCUMENTO'),
});

const announcementSchema = z.object({
  title: z.string().min(4, 'O título deve ter no mínimo 4 caracteres').max(200),
  content: z.string().min(5, 'O conteúdo do aviso deve ser detalhado'),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const),
  target_course: z.enum(['IA', 'ESG'] as const).optional().nullable(),
  target_semester: z.number().int().min(1).max(4).optional().nullable(),
  banner_type: z.enum(['PADRAO_AZUL', 'PADRAO_VERDE', 'PADRAO_ROXO', 'PADRAO_AMBAR', 'PADRAO_GRAFITE', 'CUSTOM'] as const).optional().nullable(),
  image_url: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  link_label: z.string().optional().nullable(),
  links: z.array(linkSchema).optional().nullable(),
  attachments: z.array(attachmentSchema).optional().nullable(),
  author_role: z.string().optional().nullable(),
  is_pinned: z.boolean().default(false),
  expires_at: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/announcements
 * Lista avisos ativos com ordenação prioritária de fixados.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseParam = searchParams.get('course');
    const course = (courseParam && courseParam !== 'TODOS' ? courseParam : undefined) as CourseType | undefined;
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr && semesterStr !== '0' ? parseInt(semesterStr, 10) : undefined;
    const search = searchParams.get('search') ? sanitizeInput(searchParams.get('search')!) : undefined;

    const announcements = await db.announcements.listActive({
      course,
      semester,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        count: announcements.length,
        data: announcements,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao listar avisos:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao buscar comunicados da instituição.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/announcements
 * Publicação de novo comunicado oficial (Docentes, CA e Administradores).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'PROFESSOR' && session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Apenas professores, membros do CA ou administradores podem emitir comunicados.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados do comunicado inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const announcement = await db.announcements.create({
      title: sanitizeInput(parsed.data.title),
      content: sanitizeInput(parsed.data.content),
      priority: parsed.data.priority,
      author_id: session.sub,
      author_name: session.name,
      author_role: parsed.data.author_role || (session.role === 'ADMIN' ? 'Administração FATEC' : session.role === 'CA_MEMBRO' ? 'Centro Acadêmico (CA)' : 'Corpo Docente FATEC'),
      target_course: parsed.data.target_course || null,
      target_semester: parsed.data.target_semester || null,
      banner_type: parsed.data.banner_type || 'PADRAO_AZUL',
      image_url: parsed.data.image_url ? sanitizeInput(parsed.data.image_url) : null,
      link_url: parsed.data.link_url ? sanitizeInput(parsed.data.link_url) : null,
      link_label: parsed.data.link_label ? sanitizeInput(parsed.data.link_label) : null,
      links: parsed.data.links || [],
      attachments: parsed.data.attachments || [],
      is_pinned: parsed.data.is_pinned,
      expires_at: parsed.data.expires_at || null,
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'ANNOUNCEMENT_PUBLISHED',
      entity_name: 'announcements',
      entity_id: announcement.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: { title: announcement.title, target_course: announcement.target_course, target_semester: announcement.target_semester },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Comunicado publicado com sucesso no mural.',
        data: announcement,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao publicar comunicado:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao publicar comunicado.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
