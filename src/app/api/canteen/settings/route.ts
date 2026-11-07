// ====================================================================
// ENDPOINT: CONFIGURAÇÕES DA CANTINA (NOTIFICAÇÕES & CAIXA)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, POST /api/canteen/settings
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { ApiResponse } from '@/lib/types';

/**
 * GET /api/canteen/settings
 * Retorna as configurações ativas da cantina (e-mail e WhatsApp para notificações).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Autenticação necessária.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const isAuthorized = session.role === 'ADMIN' || session.role === 'CA_MEMBRO' || session.can_validate_canteen;
    if (!isAuthorized) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Acesso negado às configurações da cantina.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const settings = await db.canteenSettings.getAll();

    return NextResponse.json<ApiResponse<{ settings: Record<string, string> }>>(
      {
        success: true,
        data: { settings },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao carregar configurações da cantina:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Falha ao buscar configurações.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/canteen/settings
 * Atualiza e-mail, telefone/WhatsApp de notificação e preferências.
 * Exclusivo para ADMIN e CA_MEMBRO.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'CA_MEMBRO')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Apenas Administradores ou Membros do CA podem alterar as configurações.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { notification_email, notification_whatsapp, auto_notify_email, auto_notify_whatsapp } = body;

    const updates: Record<string, string> = {};

    if (notification_email !== undefined) {
      updates.notification_email = sanitizeInput(notification_email.trim().toLowerCase());
    }
    if (notification_whatsapp !== undefined) {
      updates.notification_whatsapp = sanitizeInput(notification_whatsapp.replace(/\D/g, ''));
    }
    if (auto_notify_email !== undefined) {
      updates.auto_notify_email = auto_notify_email ? 'true' : 'false';
    }
    if (auto_notify_whatsapp !== undefined) {
      updates.auto_notify_whatsapp = auto_notify_whatsapp ? 'true' : 'false';
    }

    await db.canteenSettings.setMany(updates);

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_SETTINGS_UPDATED',
      entity_name: 'canteen_settings',
      entity_id: 'general',
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: updates,
    });

    const refreshed = await db.canteenSettings.getAll();

    return NextResponse.json<ApiResponse<{ settings: Record<string, string> }>>(
      {
        success: true,
        message: 'Configurações de notificação da cantina atualizadas com sucesso!',
        data: { settings: refreshed },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao atualizar configurações da cantina:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Falha ao salvar configurações.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

