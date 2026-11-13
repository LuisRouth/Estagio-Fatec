// ====================================================================
// ENDPOINT: MOTOR DE IA RAG (RETRIEVAL-AUGMENTED GENERATION) DO REPOSITÓRIO
// Rota: GET /api/ai/rag | POST /api/ai/rag
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { queryAcademicRAG, buildAcademicKnowledgeCorpus } from '@/lib/gemini';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { ApiResponse, CourseType, RAGQueryResult } from '@/lib/types';

const ragRequestSchema = z.object({
  question: z.string().min(3, 'A pergunta deve conter pelo menos 3 caracteres.').max(600),
  course: z.enum(['IA', 'ESG', 'TODOS']).optional().default('TODOS'),
  semester: z.number().int().min(1).max(6).nullable().optional(),
  topK: z.number().int().min(1).max(6).optional().default(3),
});

/**
 * GET /api/ai/rag
 * Retorna metadados sobre o índice RAG dos PDFs/arquivos do Repositório Acadêmico
 */
export async function GET() {
  try {
    const materials = await db.materials.list({ onlyApproved: true });
    const corpus = buildAcademicKnowledgeCorpus(materials);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Motor de IA RAG do Repositório Acadêmico FATEC Rio Claro operacional.',
        data: {
          indexedDocumentsCount: corpus.length,
          coursesSupported: ['IA', 'ESG'],
          semestersSupported: [1, 2, 3, 4],
          sampleQuestions: [
            'Há disciplina de Inglês no curso de IA?',
            'Onde estudar Banco de Dados?',
            'Quais disciplinas existem no 3º semestre de IA?',
            'Para criar uma aplicação de rotas de entrega, quais matérias devo estudar?',
          ],
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API AI RAG GET Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro ao consultar status do índice RAG.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/ai/rag
 * Responde dúvidas dos alunos com base nos PDFs, apostilas, códigos e TCCs do Repositório
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ragRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Parâmetros inválidos para consulta RAG.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { question, course, semester, topK } = parsed.data;
    const cleanQuestion = sanitizeInput(question);

    const materials = await db.materials.list({ onlyApproved: true });
    const ragResult = await queryAcademicRAG(
      {
        question: cleanQuestion,
        course: course as CourseType | 'TODOS',
        semester: semester ?? null,
        topK,
      },
      materials
    );

    return NextResponse.json<ApiResponse<RAGQueryResult>>(
      {
        success: true,
        message: `Consulta RAG processada com base em ${ragResult.sources.length} arquivo(s) do repositório.`,
        data: ragResult,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('[API AI RAG POST Error]:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Falha ao processar consulta no motor de IA RAG.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
