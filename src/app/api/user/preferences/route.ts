import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { SECURITY_HEADERS } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const preferences = await db.preferences.get(sessionUser.id);
    return NextResponse.json<ApiResponse>(
      { success: true, data: preferences },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao buscar preferências:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao consultar preferências.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso não autorizado.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { highContrast, fontSize, reduceMotion, feedFilter } = body;

    const saved = await db.preferences.upsert(sessionUser.id, {
      highContrast: highContrast !== undefined ? Boolean(highContrast) : undefined,
      fontSize,
      reduceMotion: reduceMotion !== undefined ? Boolean(reduceMotion) : undefined,
      feedFilter,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: saved,
        message: 'Preferências de acessibilidade e interface salvas na sua conta!',
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao salvar preferências:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Erro interno ao salvar preferências.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

