// ====================================================================
// ENDPOINT: CATÁLOGO DE PRODUTOS DA CANTINA (CANTINA DISCENTE)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: GET /api/canteen/products, POST /api/canteen/products
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';
import { ItemCategory } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(120),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(['DOCE', 'SALGADO', 'BEBIDA', 'CONGELADO', 'OUTRO'] as const, {
    errorMap: () => ({ message: 'Categoria inválida. Opções: DOCE, SALGADO, BEBIDA, CONGELADO, OUTRO.' }),
  }),
  price: z.number().positive('O preço deve ser maior que zero'),
  current_stock: z.number().int().min(0, 'O estoque não pode ser negativo'),
  min_stock_alert: z.number().int().min(0).default(5),
  image_url: z.string().optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  is_available: z.boolean().default(true),
});

/**
 * GET /api/canteen/products
 * Lista os produtos da cantina com suporte a busca e filtro por categoria.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as ItemCategory | null;
    const search = searchParams.get('search') ? sanitizeInput(searchParams.get('search')!) : undefined;
    const all = searchParams.get('all') === 'true';

    const session = await getCurrentSession();
    const canViewAll = all && (session?.role === 'CA_MEMBRO' || session?.role === 'ADMIN');

    const products = canViewAll
      ? await db.products.listAll({ category: category || undefined, search })
      : await db.products.listAvailable({ category: category || undefined, search });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        data: products,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao listar produtos da cantina:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao carregar produtos da cantina.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * POST /api/canteen/products
 * Cria um novo produto no catálogo (Apenas CA_MEMBRO e ADMIN)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.role !== 'CA_MEMBRO' && session.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Acesso restrito. Apenas membros do CA ou Administradores podem cadastrar produtos.' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados do produto inválidos.',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const product = await db.products.create({
      name: sanitizeInput(parsed.data.name),
      description: parsed.data.description ? sanitizeInput(parsed.data.description) : null,
      category: parsed.data.category,
      price: Number(parsed.data.price.toFixed(2)),
      current_stock: parsed.data.current_stock,
      min_stock_alert: parsed.data.min_stock_alert,
      image_url: parsed.data.image_url && parsed.data.image_url.trim() ? sanitizeInput(parsed.data.image_url.trim()) : null,
      barcode: parsed.data.barcode || null,
      is_available: parsed.data.is_available,
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_PRODUCT_CREATED',
      entity_name: 'canteen_products',
      entity_id: product.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: { name: product.name, price: product.price, initial_stock: product.current_stock },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Produto cadastrado com sucesso!',
        data: product,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar produto no catálogo.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

