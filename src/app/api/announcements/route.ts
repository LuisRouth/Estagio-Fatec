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

const announcementSchema = z.object({
  title: z.string().min(4, 'O título deve ter no mínimo 4 caracteres').max(200),
  content: z.string().min(5, 'O conteúdo do aviso deve ser detalhado'),
  priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const),
  target_course: z.enum(['IA', 'ESG'] as const).optional().nullable(),
  target_semester: z.number().int().min(1).max(6).optional().nullable(),
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
    const course = searchParams.get('course') as CourseType | null;
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr ? parseInt(semesterStr, 10) : undefined;

    const announcements = await db.announcements.listActive({
      course: course || undefined,
      semester,
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
      target_course: parsed.data.target_course || null,
      target_semester: parsed.data.target_semester || null,
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

