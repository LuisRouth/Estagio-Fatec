// ====================================================================
// ENDPOINT: CONTROLE E AJUSTE DE ESTOQUE DA CANTINA
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: PATCH /api/canteen/products/[id]/stock
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const stockSchema = z.object({
  quantity_delta: z.number().int().optional(),
  new_stock: z.number().int().min(0, 'O estoque não pode ser negativo').optional(),
  reason: z.string().max(200).optional(),
}).refine((data) => data.quantity_delta !== undefined || data.new_stock !== undefined, {
  message: 'Informe quantity_delta (incremento/decremento) ou new_stock (novo valor absoluto).',
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/canteen/products/[id]/stock
 * Reposição ou ajuste manual de estoque com auditoria (Apenas CA_MEMBRO e ADMIN)
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada. Apenas CA e Administradores podem ajustar o estoque.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = stockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros de estoque inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { quantity_delta, new_stock, reason } = parsed.data;

    const result = await db.products.updateStock(id, {
      quantityDelta: quantity_delta,
      exactStock: new_stock,
    });

    if (!result.product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_STOCK_ADJUSTED',
      entity_name: 'canteen_products',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: {
        product_name: result.product.name,
        quantity_delta,
        new_stock: result.product.current_stock,
        low_stock_alert: result.lowStockAlert,
        reason: reason ? sanitizeInput(reason) : 'Ajuste operacional de rotina',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Estoque atualizado com sucesso.',
        data: {
          id: result.product.id,
          name: result.product.name,
          current_stock: result.product.current_stock,
          min_stock_alert: result.product.min_stock_alert,
          lowStockAlert: result.lowStockAlert,
        },
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao ajustar estoque:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao atualizar estoque do produto.' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }
}

