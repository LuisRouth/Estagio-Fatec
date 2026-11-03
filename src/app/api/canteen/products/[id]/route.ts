// ====================================================================
// ENDPOINT: DETALHES, ATUALIZAÇÃO E REMOÇÃO DE PRODUTO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET, PUT, DELETE /api/canteen/products/[id]
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const updateProductSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['DOCE', 'SALGADO', 'BEBIDA', 'CONGELADO', 'OUTRO'] as const).optional(),
  price: z.number().positive().optional(),
  current_stock: z.number().int().min(0).optional(),
  min_stock_alert: z.number().int().min(0).optional(),
  image_url: z.string().url().or(z.string().startsWith('/')).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  is_available: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/canteen/products/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await db.products.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar detalhes do produto.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * PUT /api/canteen/products/[id]
 * Atualiza campos cadastrais de um produto (Apenas CA_MEMBRO e ADMIN)
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada. Apenas CA e Administradores podem atualizar produtos.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const payloadToUpdate: any = { ...parsed.data };
    if (payloadToUpdate.name) payloadToUpdate.name = sanitizeInput(payloadToUpdate.name);
    if (payloadToUpdate.description) payloadToUpdate.description = sanitizeInput(payloadToUpdate.description);
    if (payloadToUpdate.price !== undefined) payloadToUpdate.price = Number(payloadToUpdate.price.toFixed(2));

    const updated = await db.products.update(id, payloadToUpdate);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado para atualização.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_PRODUCT_UPDATED',
      entity_name: 'canteen_products',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: payloadToUpdate,
    });

    return NextResponse.json(
      { success: true, message: 'Produto atualizado com sucesso.', data: updated },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar dados do produto.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * DELETE /api/canteen/products/[id]
 * Remove um produto do catálogo (Apenas CA_MEMBRO e ADMIN)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Permissão negada. Apenas CA e Administradores podem excluir produtos.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const deleted = await db.products.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado para exclusão.' },
        { status: 404, headers: SECURITY_HEADERS }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_PRODUCT_DELETED',
      entity_name: 'canteen_products',
      entity_id: id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
    });

    return NextResponse.json(
      { success: true, message: 'Produto removido com sucesso.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar produto do catálogo.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

