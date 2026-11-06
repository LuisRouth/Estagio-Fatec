// ====================================================================
// TESTES DE INTEGRAÇÃO: FLUXO COMPLETO DE CHECKOUT, COMPRA NA CANTINA & OCR PIX
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';
import { generatePixPayload, validatePixPayload, generateTxId } from '@/lib/pix';
import { analyzePixReceiptPipeline } from '@/lib/gemini';

describe('Testes de Integração — Fluxo de Checkout, Compra na Cantina & Conferência OCR Pix', () => {
  const testStudentId = 'a0000000-0000-0000-0000-000000000005'; // Mariana ESG (2º Semestre)

  it('1. Fluxo Completo Aprovado: Checkout -> Baixa de Estoque -> Pix EMV -> Conferência OCR/Visão -> Status PAGO -> Extrato', async () => {
    const availableProducts = await db.products.listAvailable();
    expect(availableProducts.length).toBeGreaterThan(0);

    const product = availableProducts.find((p) => p.current_stock >= 3) || availableProducts[0];
    const initialStock = product.current_stock;
    const quantity = 2;
    const expectedTotal = Number((product.price * quantity).toFixed(2));

    // Etapa A: Gerar cobrança Pix Dinâmica no padrão BACEN EMV
    const txid = generateTxId('FAT');
    const pixData = generatePixPayload({
      amount: expectedTotal,
      txid,
      description: `Compra Integrada ${txid}`,
    });

    const pixCheck = validatePixPayload(pixData.payload);
    expect(pixCheck.isValid).toBe(true);
    expect(pixCheck.amount).toBe(expectedTotal);

    // Etapa B: Criar transação de Checkout com baixa atômica de estoque
    const transaction = await db.transactions.create(
      {
        user_id: testStudentId,
        user_name: 'Mariana ESG Silva',
        user_email: 'mariana.esg@aluno.cps.sp.gov.br',
        total_amount: expectedTotal,
        status: 'PENDENTE',
        payment_method: 'PIX',
        pix_copy_paste: pixData.payload,
        pix_qr_code_url: pixData.qrCodeUrl,
      },
      [
        {
          productId: product.id,
          quantity,
          unitPrice: product.price,
          productName: product.name,
        },
      ],
      true
    );

    expect(transaction.id).toBeDefined();
    expect(transaction.status).toBe('PENDENTE');

    const stockAfterCheckout = await db.products.findById(product.id);
    expect(stockAfterCheckout?.current_stock).toBe(initialStock - quantity);

    // Etapa C: Aluno envia comprovante Pix (Pipeline de Visão Computacional + OCR)
    const simulatedVisionReceiptBase64 = Buffer.from(
      `COMPROVANTE PIX BANCO CENTRAL - Favorecido: FATEC RIO CLARO CA - Valor pago: R$ ${expectedTotal
        .toFixed(2)
        .replace('.', ',')} - ID: E18236120202611061945abcdef12345`,
      'utf8'
    ).toString('base64');

    const ocrAnalysis = await analyzePixReceiptPipeline({
      imageBase64: `data:image/png;base64,${simulatedVisionReceiptBase64}`,
      expectedAmount: expectedTotal,
      expectedMerchant: 'FATEC RIO CLARO CA',
    });

    expect(ocrAnalysis.isValidReceipt).toBe(true);
    expect(ocrAnalysis.amountMatches).toBe(true);
    expect(ocrAnalysis.status).toBe('APROVADO_IA');

    // Etapa D: Atualização automática de status para PAGO (RN-03)
    const targetStatus = ocrAnalysis.status === 'APROVADO_IA' ? 'PAGO' : 'EM_ANALISE';
    const updatedTx = await db.transactions.updateStatus(transaction.id, targetStatus, {
      endToEndId: ocrAnalysis.transactionId || undefined,
      notes: ocrAnalysis.analysisNotes,
    });

    expect(updatedTx?.status).toBe('PAGO');
    expect(updatedTx?.pix_end_to_end_id).toBe('E18236120202611061945abcdef12345');

    // Etapa E: Verificar consolidação no extrato financeiro do aluno (/api/canteen/history)
    const statement = await db.transactions.getStudentStatement(testStudentId);
    expect(statement.summary.paidCount).toBeGreaterThanOrEqual(1);
    expect(statement.summary.totalSpent).toBeGreaterThanOrEqual(expectedTotal);
  });

  it('2. Fluxo com Divergência de Valor: Comprovante com valor menor deve ficar retido em EM_ANALISE (RN-04)', async () => {
    const availableProducts = await db.products.listAvailable();
    const product = availableProducts.find((p) => p.current_stock >= 2) || availableProducts[0];
    const orderTotal = Number(product.price.toFixed(2));

    const tx = await db.transactions.create(
      {
        user_id: testStudentId,
        total_amount: orderTotal,
        status: 'PENDENTE',
        payment_method: 'PIX',
        pix_copy_paste: '000201...',
      },
      [{ productId: product.id, quantity: 1, unitPrice: product.price, productName: product.name }],
      true
    );

    const wrongAmount = Number((orderTotal - 1.0).toFixed(2));
    const ocrDivergent = await analyzePixReceiptPipeline({
      receiptText: `COMPROVANTE PIX - Valor: R$ ${wrongAmount.toFixed(2).replace('.', ',')} - ID: E99999999202611061200xyz98765432`,
      expectedAmount: orderTotal,
    });

    expect(ocrDivergent.amountMatches).toBe(false);
    expect(ocrDivergent.status).toBe('DIVERGENTE');

    const targetStatus = ocrDivergent.status === 'APROVADO_IA' ? 'PAGO' : 'EM_ANALISE';
    const updated = await db.transactions.updateStatus(tx.id, targetStatus, {
      notes: ocrDivergent.analysisNotes,
    });

    expect(updated?.status).toBe('EM_ANALISE');
  });

  it('3. Fluxo de Cancelamento no Checkout: Deve estornar/repor automaticamente as unidades no estoque', async () => {
    const availableProducts = await db.products.listAvailable();
    const product = availableProducts.find((p) => p.current_stock >= 3) || availableProducts[0];
    const stockBefore = product.current_stock;

    const tx = await db.transactions.create(
      {
        user_id: testStudentId,
        total_amount: product.price * 2,
        status: 'PENDENTE',
        payment_method: 'PIX',
      },
      [{ productId: product.id, quantity: 2, unitPrice: product.price, productName: product.name }],
      true
    );

    const stockDuringPending = (await db.products.findById(product.id))!.current_stock;
    expect(stockDuringPending).toBe(stockBefore - 2);

    // Aluno clicou em "Voltar ao Carrinho" cancelando o checkout pendente
    const cancelled = await db.transactions.updateStatus(tx.id, 'CANCELADO');
    expect(cancelled?.status).toBe('CANCELADO');

    const stockAfterCancel = (await db.products.findById(product.id))!.current_stock;
    expect(stockAfterCancel).toBe(stockBefore);
  });
});
