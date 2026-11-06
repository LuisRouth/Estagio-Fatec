import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse, CourseType } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();

    // Se o usuário estiver autenticado, entrega feed personalizado com alertas gerais + curso + semestre
    if (sessionUser) {
      const feed = await db.notifications.getFeedForUser(
        sessionUser.id,
        sessionUser.course as CourseType,
        sessionUser.semester
      );
      return NextResponse.json<ApiResponse>(
        { success: true, data: feed },
        { headers: SECURITY_HEADERS }
      );
    }

    // Se anônimo, retorna apenas comunicados gerais públicos
    const publicAnnouncements = await db.announcements.listAll();
    const formatted = publicAnnouncements.map((a) => ({
      id: a.id,
      announcementId: a.id,
      title: a.title,
      content: a.content,
      priority: a.priority,
      targetCourse: a.target_course,
      targetSemester: null,
      isRead: false,
      createdAt: a.created_at,
    }));

    return NextResponse.json<ApiResponse>(
      { success: true, data: formatted },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao buscar feed de comunicados segmentados:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao consultar avisos.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

