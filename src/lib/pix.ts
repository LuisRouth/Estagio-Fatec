// ====================================================================
// SERVIÇO GERADOR DE PIX DINÂMICO (PADRÃO BANCO CENTRAL DO BRASIL - EMV)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Especificação: Manual de Padrões para Iniciação do Pix / BR Code (EMVCo MPM)
// ====================================================================

import type { PixPayloadParams, PixPayloadResult, PixValidationResult } from './types/index';

// Constantes do Padrão Pix do Banco Central
const PIX_GUI = 'br.gov.bcb.pix';
const DEFAULT_PIX_KEY = process.env.PIX_MERCHANT_KEY || 'ca.fatec.rc@aluno.cps.sp.gov.br';
const DEFAULT_MERCHANT_NAME = 'FATEC RIO CLARO CA';
const DEFAULT_MERCHANT_CITY = 'RIO CLARO';

/**
 * Remove acentuação e caracteres incompatíveis com o charset ASCII do EMV
 */
export function normalizeAscii(str: string, maxLength?: number): string {
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s.,\-_@]/g, '')
    .trim()
    .toUpperCase();
  return maxLength ? normalized.slice(0, maxLength) : normalized;
}

/**
 * Formata um campo no padrão EMV TLV (Tag-Length-Value)
 * Tag: 2 dígitos
 * Length: 2 dígitos decimais indicando o tamanho do valor
 * Value: Conteúdo da tag
 */
export function formatTLV(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Cálculo do Checksum CRC-16/CCITT-FALSE (Polinômio 0x1021, Init 0xFFFF)
 * Exigido pelo Banco Central e EMVCo na Tag 63.
 */
export function calculateCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera um identificador único de transação (txid) compatível com Pix
 * Tamanho máximo permitido pelo BACEN: 25 caracteres alfanuméricos sem espaços
 */
export function generateTxId(prefix = 'FAT'): string {
  const cleanPrefix = normalizeAscii(prefix, 4);
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const fullTxId = `${cleanPrefix}${timestamp}${randomPart}`;
  return fullTxId.slice(0, 25);
}

/**
 * Gera o payload completo do Pix Dinâmico (Copia-e-Cola) no formato EMV padrão Banco Central
 */
export function generatePixPayload(params: PixPayloadParams): PixPayloadResult {
  const amount = Number(params.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('O valor do Pix deve ser um número positivo maior que zero.');
  }

  const pixKey = params.pixKey || DEFAULT_PIX_KEY;
  const merchantName = normalizeAscii(params.merchantName || DEFAULT_MERCHANT_NAME, 25);
  const merchantCity = normalizeAscii(params.merchantCity || DEFAULT_MERCHANT_CITY, 15);
  const txid = params.txid ? normalizeAscii(params.txid, 25) : generateTxId('FAT');
  const formattedAmount = amount.toFixed(2);

  // Tag 00: Payload Format Indicator (Fixo: "01")
  let payloadWithoutCrc = formatTLV('00', '01');

  // Tag 01: Point of Initiation Method (12 = Dinâmico / uso único por transação)
  payloadWithoutCrc += formatTLV('01', '12');

  // Tag 26: Merchant Account Information - Pix
  // Subtag 00: GUI do BACEN ("br.gov.bcb.pix")
  // Subtag 01: Chave Pix do recebedor
  // Subtag 02: Descrição opcional da transação
  let merchantAccountInfo = formatTLV('00', PIX_GUI);
  merchantAccountInfo += formatTLV('01', pixKey);
  if (params.description) {
    const cleanDesc = normalizeAscii(params.description, 40);
    merchantAccountInfo += formatTLV('02', cleanDesc);
  }
  payloadWithoutCrc += formatTLV('26', merchantAccountInfo);

  // Tag 52: Merchant Category Code (0000 = Padrão)
  payloadWithoutCrc += formatTLV('52', '0000');

  // Tag 53: Transaction Currency (986 = Real BRL segundo ISO 4217)
  payloadWithoutCrc += formatTLV('53', '986');

  // Tag 54: Transaction Amount (Valor com 2 casas decimais)
  payloadWithoutCrc += formatTLV('54', formattedAmount);

  // Tag 58: Country Code (BR)
  payloadWithoutCrc += formatTLV('58', 'BR');

  // Tag 59: Merchant Name (Nome do recebedor / Centro Acadêmico)
  payloadWithoutCrc += formatTLV('59', merchantName);

  // Tag 60: Merchant City (Cidade do recebedor)
  payloadWithoutCrc += formatTLV('60', merchantCity);

  // Tag 62: Additional Data Field Template
  // Subtag 05: Reference Label / txid identificador único
  const additionalData = formatTLV('05', txid);
  payloadWithoutCrc += formatTLV('62', additionalData);

  // Tag 63: CRC16 (Header '6304' para inclusão no cálculo do CRC)
  const crcHeader = '6304';
  const dataForCrc = `${payloadWithoutCrc}${crcHeader}`;
  const crcValue = calculateCRC16(dataForCrc);

  const fullPayload = `${dataForCrc}${crcValue}`;

  // URL para exibição de QR Code no frontend
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullPayload)}`;

  return {
    payload: fullPayload,
    txid,
    amount,
    pixKey,
    merchantName,
    merchantCity,
    qrCodeUrl,
  };
}

/**
 * Decodifica tags TLV de um payload Pix
 */
export function parseTLV(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  let i = 0;
  while (i < raw.length) {
    if (i + 4 > raw.length) break;
    const tag = raw.substring(i, i + 2);
    const len = parseInt(raw.substring(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    const valStart = i + 4;
    const valEnd = valStart + len;
    if (valEnd > raw.length) break;
    const val = raw.substring(valStart, valEnd);
    map.set(tag, val);
    i = valEnd;
  }
  return map;
}

/**
 * Validador e decodificador de integridade de Payload Pix EMV
 */
export function validatePixPayload(payload: string): PixValidationResult {
  if (!payload || payload.length < 20) {
    return { isValid: false, error: 'Payload Pix ausente ou muito curto.' };
  }

  // Verificar se termina com a tag 63
  const crcTagIndex = payload.lastIndexOf('6304');
  if (crcTagIndex === -1 || crcTagIndex !== payload.length - 8) {
    return { isValid: false, error: 'Tag 63 (CRC16) ausente ou mal formatada.' };
  }

  const dataForCrc = payload.substring(0, crcTagIndex + 4);
  const expectedCrc = payload.substring(crcTagIndex + 4).toUpperCase();
  const calculatedCrc = calculateCRC16(dataForCrc);

  if (expectedCrc !== calculatedCrc) {
    return {
      isValid: false,
      error: `Checksum CRC16 inválido. Esperado: ${expectedCrc}, Calculado: ${calculatedCrc}`,
      expectedCrc,
      calculatedCrc,
    };
  }

  const tags = parseTLV(payload);
  const formatIndicator = tags.get('00');
  const merchantInfoRaw = tags.get('26') || '';
  const merchantTags = parseTLV(merchantInfoRaw);

  const pixKey = merchantTags.get('01');
  const description = merchantTags.get('02');
  const amountStr = tags.get('54');
  const amount = amountStr ? parseFloat(amountStr) : undefined;
  const merchantName = tags.get('59');
  const merchantCity = tags.get('60');

  const additionalRaw = tags.get('62') || '';
  const additionalTags = parseTLV(additionalRaw);
  const txid = additionalTags.get('05');

  return {
    isValid: true,
    payloadFormatIndicator: formatIndicator,
    pixKey,
    description,
    merchantName,
    merchantCity,
    amount,
    txid,
    expectedCrc,
    calculatedCrc,
  };
}
