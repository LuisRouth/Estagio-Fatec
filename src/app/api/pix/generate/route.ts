// ====================================================================
// ENDPOINT: GERADOR DE PAYLOAD PIX DINÂMICO (EMV BANCO CENTRAL)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/pix/generate
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePixPayload, generateTxId } from '@/lib/pix';
import { SECURITY_HEADERS, sanitizeInput } from '@/lib/security';

const pixGenerateSchema = z.object({
  amount: z.number().positive('O valor deve ser maior que zero (mínimo R$ 0,01)'),
  txid: z.string().max(25).regex(/^[a-zA-Z0-9]+$/, 'O txid deve ser alfanumérico sem caracteres especiais').optional(),
  pixKey: z.string().max(77).optional(),
  merchantName: z.string().max(25).optional(),
  merchantCity: z.string().max(15).optional(),
  description: z.string().max(40).optional(),
});

/**
 * POST /api/pix/generate
 * Gera Payload EMV e QR Code oficial do Banco Central para qualquer valor e chave.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = pixGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos.', errors: parsed.error.flatten().fieldErrors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { amount, txid, pixKey, merchantName, merchantCity, description } = parsed.data;

    const result = generatePixPayload({
      amount: Number(amount.toFixed(2)),
      txid: txid || generateTxId('FAT'),
      pixKey,
      merchantName,
      merchantCity,
      description: description ? sanitizeInput(description) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao gerar Pix EMV:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Falha ao gerar payload Pix.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

