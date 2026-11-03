// ====================================================================
// ENDPOINT: REPOSITÓRIO ACADÊMICO & VITRINE DE PROJETOS DE TCC
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, POST /api/materials
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { CourseType, MaterialType } from '@/lib/types';

const materialSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres').max(200),
  description: z.string().max(1000).optional().nullable(),
  subject: z.string().min(2, 'A disciplina é obrigatória').max(120),
  course: z.enum(['IA', 'ESG'] as const, {
    errorMap: () => ({ message: 'Curso inválido. Escolha IA ou ESG.' }),
  }),
  semester: z.number().int().min(1).max(6, 'Semestre deve ser entre 1 e 6'),
  material_type: z.enum(['SLIDE', 'APOSTILA', 'CODIGO', 'TCC', 'DATASET'] as const, {
    errorMap: () => ({ message: 'Tipo inválido. Opções: SLIDE, APOSTILA, CODIGO, TCC, DATASET.' }),
  }),
  file_url: z.string().min(1, 'A URL do arquivo é obrigatória'),
  github_url: z.string().url().or(z.string().startsWith('https://github.com')).optional().nullable(),
  tags: z.string().max(255).optional().nullable(),
  is_approved: z.boolean().optional(),
});

/**
 * GET /api/materials
 * Busca e categorização de materiais didáticos e projetos de TCC.
 * Suporta filtros por curso, semestre, tipo de material, disciplina e palavra-chave.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const course = searchParams.get('course') as CourseType | null;
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr ? parseInt(semesterStr, 10) : undefined;
    const materialType = (searchParams.get('type') || searchParams.get('material_type')) as MaterialType | null;
    const subject = searchParams.get('subject') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const onlyApproved = searchParams.get('all') !== 'true';

    const materials = await db.materials.list({
      course: course || undefined,
      semester,
      materialType: materialType || undefined,
      subject,
      search: search ? sanitizeInput(search) : undefined,
      onlyApproved,
    });

    return NextResponse.json(
      {
        success: true,
        count: materials.length,
        filters: { course, semester, material_type: materialType, subject, search },
        data: materials,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao listar materiais acadêmicos:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao buscar materiais acadêmicos.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/materials
 * Publicação de novo material didático ou projeto de TCC com categorização.
 * Disponível para Docentes, Alunos e Administradores autenticados.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado. Efetue login para publicar materiais.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = materialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados do material inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Regra de aprovação: Docentes e Admins têm aprovação imediata;
    // Alunos têm aprovação automática se for projeto de TCC para a vitrine
    const isAutoApproved =
      session.role === 'PROFESSOR' ||
      session.role === 'ADMIN' ||
      session.role === 'CA_MEMBRO' ||
      parsed.data.material_type === 'TCC';

    // Normalização das tags
    let cleanTags = parsed.data.tags || '';
    if (cleanTags) {
      cleanTags = cleanTags
        .split(',')
        .map((t) => sanitizeInput(t.trim().toLowerCase()))
        .filter(Boolean)
        .join(', ');
    }

    const material = await db.materials.create({
      title: sanitizeInput(parsed.data.title),
      description: parsed.data.description ? sanitizeInput(parsed.data.description) : null,
      subject: sanitizeInput(parsed.data.subject),
      course: parsed.data.course,
      semester: parsed.data.semester,
      author_id: session.sub,
      author_name: session.name,
      material_type: parsed.data.material_type,
      file_url: parsed.data.file_url,
      github_url: parsed.data.github_url || null,
      tags: cleanTags || null,
      is_approved: parsed.data.is_approved !== undefined ? parsed.data.is_approved : isAutoApproved,
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'ACADEMIC_MATERIAL_UPLOADED',
      entity_name: 'academic_materials',
      entity_id: material.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: {
        title: material.title,
        type: material.material_type,
        course: material.course,
        semester: material.semester,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Material acadêmico publicado e categorizado com sucesso!',
        data: material,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao cadastrar material:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar material didático.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

