// ====================================================================
// TESTES UNITÁRIOS E DE INTEGRAÇÃO: CANTINA, ESTOQUE & PIX EMV (SPRINT 2)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// ====================================================================

import { describe, it, expect } from 'vitest';
import {
  generatePixPayload,
  calculateCRC16,
  validatePixPayload,
  formatTLV,
  generateTxId,
  normalizeAscii,
} from '@/lib/pix';
import { db } from '@/lib/db';

describe('Serviço de Pix Dinâmico EMV - Padrão Banco Central (src/lib/pix.ts)', () => {
  it('deve calcular corretamente o CRC16-CCITT de vetores padrão', () => {
    // Vetor de teste clássico internacional ISO/IEC 13239
    const testCrc = calculateCRC16('123456789');
    expect(testCrc).toBe('29B1');
  });

  it('deve formatar campos TLV (Tag-Length-Value) com comprimento de 2 dígitos', () => {
    expect(formatTLV('00', '01')).toBe('000201');
    expect(formatTLV('58', 'BR')).toBe('5802BR');
    expect(formatTLV('53', '986')).toBe('5303986');
  });

  it('deve gerar txid alfanumérico com no máximo 25 caracteres', () => {
    const txid = generateTxId('FAT');
    expect(txid.length).toBeLessThanOrEqual(25);
    expect(/^[A-Z0-9]+$/.test(txid)).toBe(true);
    expect(txid.startsWith('FAT')).toBe(true);
  });

  it('deve normalizar caracteres especiais e remover acentos para padrão ASCII', () => {
    expect(normalizeAscii('FATEC São Paulo - Cantina')).toBe('FATEC SAO PAULO - CANTINA');
  });

  it('deve gerar payload Pix Dinâmico completo e válido segundo o BACEN', () => {
    const pix = generatePixPayload({
      amount: 15.50,
      description: 'Lanche Cantina',
      txid: 'FATTESTE123',
    });

    expect(pix.payload).toBeDefined();
    expect(pix.payload.startsWith('000201')).toBe(true);
    expect(pix.payload).toContain('br.gov.bcb.pix');
    expect(pix.payload).toContain('5303986'); // BRL
    expect(pix.payload).toContain('540515.50'); // Valor
    expect(pix.payload).toContain('5802BR'); // Brasil
    expect(pix.payload).toContain('FATTESTE123'); // txid
    expect(pix.payload).toContain('6304'); // CRC16 Tag

    // Validação reversa do payload gerado
    const validation = validatePixPayload(pix.payload);
    expect(validation.isValid).toBe(true);
    expect(validation.amount).toBe(15.50);
    expect(validation.txid).toBe('FATTESTE123');
    expect(validation.expectedCrc).toBe(validation.calculatedCrc);
  });

  it('deve rejeitar payload Pix corrompido ou com CRC adulterado', () => {
    const pix = generatePixPayload({ amount: 10.00 });
    const corrupted = pix.payload.slice(0, -4) + '0000'; // Troca CRC por 0000
    const validation = validatePixPayload(corrupted);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain('Checksum CRC16');
  });
});

describe('Controle de Produtos e Estoque da Cantina (src/lib/db.ts)', () => {
  it('deve criar um novo produto no catálogo com estoque inicial', async () => {
    const newProd = await db.products.create({
      name: 'Bolo de Cenoura Caseiro',
      description: 'Fatia embalada individualmente',
      category: 'DOCE',
      price: 4.00,
      current_stock: 10,
      min_stock_alert: 3,
      is_available: true,
    });

    expect(newProd.id).toBeDefined();
    expect(newProd.name).toBe('Bolo de Cenoura Caseiro');
    expect(newProd.current_stock).toBe(10);
  });

  it('deve atualizar estoque e disparar alerta de estoque baixo', async () => {
    // Localizar um produto existente
    const prods = await db.products.listAvailable();
    const target = prods[0];

    // Ajustar estoque para abaixo do limite de alerta
    const res = await db.products.updateStock(target.id, { exactStock: target.min_stock_alert });
    expect(res.product?.current_stock).toBe(target.min_stock_alert);
    expect(res.lowStockAlert).toBe(true);
  });

  it('deve impedir que o estoque fique negativo (RNF-08)', async () => {
    const prods = await db.products.listAvailable();
    const target = prods[0];

    await expect(
      db.products.updateStock(target.id, { quantityDelta: -(target.current_stock + 100) })
    ).rejects.toThrow(/Estoque insuficiente/);
  });
});

describe('Checkout e Extrato de Compras do Aluno (src/lib/db.ts)', () => {
  it('deve registrar transação de compra, gerar itens e calcular extrato do aluno', async () => {
    const studentId = 'a0000000-0000-0000-0000-000000000005'; // Mariana ESG
    const prods = await db.products.listAvailable();
    const p1 = prods[0];

    const initialStock = p1.current_stock;

    // Criar checkout com baixa de estoque
    const tx = await db.transactions.create(
      {
        user_id: studentId,
        total_amount: p1.price * 2,
        status: 'PENDENTE',
        payment_method: 'PIX',
        pix_copy_paste: '000201...',
      },
      [{ productId: p1.id, quantity: 2, unitPrice: p1.price, productName: p1.name }],
      true
    );

    expect(tx.id).toBeDefined();
    expect(tx.items?.length).toBe(1);
    expect(tx.items?.[0].quantity).toBe(2);

    // Conferir se o estoque foi debitado em 2 unidades
    const updatedProd = await db.products.findById(p1.id);
    expect(updatedProd?.current_stock).toBe(initialStock - 2);

    // Extrato consolidado do aluno
    const statement = await db.transactions.getStudentStatement(studentId);
    expect(statement.userId).toBe(studentId);
    expect(statement.transactions.length).toBeGreaterThanOrEqual(1);
    expect(statement.summary.totalTransactions).toBeGreaterThanOrEqual(1);
  });
});

