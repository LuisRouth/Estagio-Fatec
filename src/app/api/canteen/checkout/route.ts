// ====================================================================
// ENDPOINT: CHECKOUT DA CANTINA COM GERAÇÃO DE PIX DINÂMICO
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/canteen/checkout
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';
import { generatePixPayload, generateTxId } from '@/lib/pix';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'ID do produto é obrigatório'),
      quantity: z.number().int().positive('Quantidade deve ser no mínimo 1'),
    })
  ).min(1, 'O carrinho deve conter pelo menos um produto'),
  notes: z.string().max(300).optional(),
});

/**
 * POST /api/canteen/checkout
 * Cria um pedido, calcula o total, gera o payload Pix EMV dinâmico e debita o estoque.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Autenticação necessária para realizar compras na cantina.' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Pedido inválido.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { items: requestedItems, notes } = parsed.data;

    // 1. Validar disponibilidade e preços de cada produto
    const detailedItems: Array<{ productId: string; quantity: number; unitPrice: number; productName: string }> = [];
    let totalAmount = 0;

    for (const reqItem of requestedItems) {
      const product = await db.products.findById(reqItem.productId);
      if (!product || !product.is_available) {
        return NextResponse.json(
          { success: false, error: `Produto não disponível: ${reqItem.productId}` },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      if (product.current_stock < reqItem.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Estoque insuficiente para "${product.name}". Solicitado: ${reqItem.quantity}, Disponível: ${product.current_stock}.`,
          },
          { status: 400, headers: SECURITY_HEADERS }
        );
      }

      const unitPrice = Number(product.price);
      totalAmount += unitPrice * reqItem.quantity;

      detailedItems.push({
        productId: product.id,
        quantity: reqItem.quantity,
        unitPrice,
        productName: product.name,
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));
    if (totalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'O valor total do pedido deve ser maior que zero.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // 2. Gerar txid único e Payload Pix Dinâmico padrão BACEN
    const txid = generateTxId('FAT');
    const pixResult = generatePixPayload({
      amount: totalAmount,
      txid,
      description: `Cantina FATEC Pedido ${txid.slice(-6)}`,
    });

    // 3. Persistir a transação e seus itens na camada de dados com baixa de estoque
    const transaction = await db.transactions.create(
      {
        user_id: session.sub,
        user_name: session.name,
        user_email: session.email,
        total_amount: totalAmount,
        status: 'PENDENTE',
        payment_method: 'PIX',
        pix_copy_paste: pixResult.payload,
        pix_qr_code_url: pixResult.qrCodeUrl,
        notes: notes ? sanitizeInput(notes) : null,
      },
      detailedItems,
      true // Baixa de estoque automática
    );

    // 4. Auditoria de segurança
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await db.audit.log({
      user_id: session.sub,
      action: 'CANTEEN_CHECKOUT_CREATED',
      entity_name: 'canteen_transactions',
      entity_id: transaction.id,
      ip_address: ip,
      user_agent: req.headers.get('user-agent'),
      payload: {
        total_amount: totalAmount,
        txid,
        items_count: detailedItems.length,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pedido realizado com sucesso! Efetue o pagamento via Pix no valor exato.',
        data: {
          transactionId: transaction.id,
          txid,
          totalAmount,
          pixCopyPaste: pixResult.payload,
          qrCodeUrl: pixResult.qrCodeUrl,
          merchantName: pixResult.merchantName,
          merchantCity: pixResult.merchantCity,
          pixKey: pixResult.pixKey,
          items: transaction.items,
          status: transaction.status,
          createdAt: transaction.created_at,
        },
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro no checkout da cantina:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao processar checkout.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

