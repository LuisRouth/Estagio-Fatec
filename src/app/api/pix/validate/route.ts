// ====================================================================
// ENDPOINT: VALIDADOR E DECODIFICADOR DE PIX EMV (BANCO CENTRAL)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Rota: POST /api/pix/validate
// ====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validatePixPayload } from '@/lib/pix';
import { SECURITY_HEADERS } from '@/lib/security';

const validateSchema = z.object({
  payload: z.string().min(20, 'Payload Pix deve conter no mínimo 20 caracteres'),
});

/**
 * POST /api/pix/validate
 * Valida a integridade do checksum CRC16 e decodifica as tags EMV de um payload Pix.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Payload Pix ausente ou malformatado.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const validation = validatePixPayload(parsed.data.payload.trim());

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error || 'Payload Pix inválido ou com CRC16 incorreto.',
          data: validation,
        },
        { status: 422, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payload Pix válido e íntegro segundo o padrão Banco Central do Brasil.',
        data: validation,
      },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    console.error('Erro ao validar Pix:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao validar payload Pix.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

