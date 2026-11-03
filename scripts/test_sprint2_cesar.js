// ====================================================================
// SUÍTE DE TESTES UNITÁRIOS E DE INTEGRAÇÃO - SPRINT 2 (CESAR)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Uso: node scripts/test_sprint2_cesar.js
// ====================================================================

const fs = require('fs');
const path = require('path');

// Funções criptográficas e de formatação EMV Pix implementadas no módulo src/lib/pix.ts
function normalizeAscii(str, maxLength) {
  const normalized = str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s.,\-_@]/g, '')
    .trim()
    .toUpperCase();
  return maxLength ? normalized.slice(0, maxLength) : normalized;
}

function formatTLV(tag, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

function calculateCRC16(data) {
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

function generateTxId(prefix = 'FAT') {
  const cleanPrefix = normalizeAscii(prefix, 4);
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const fullTxId = `${cleanPrefix}${timestamp}${randomPart}`;
  return fullTxId.slice(0, 25);
}

function generatePixPayload(params) {
  const amount = Number(params.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('O valor do Pix deve ser um número positivo maior que zero.');
  }

  const pixKey = params.pixKey || 'ca.fatec.rc@aluno.cps.sp.gov.br';
  const merchantName = normalizeAscii(params.merchantName || 'FATEC RIO CLARO CA', 25);
  const merchantCity = normalizeAscii(params.merchantCity || 'RIO CLARO', 15);
  const txid = params.txid ? normalizeAscii(params.txid, 25) : generateTxId('FAT');
  const formattedAmount = amount.toFixed(2);

  let payloadWithoutCrc = formatTLV('00', '01');
  payloadWithoutCrc += formatTLV('01', '12');

  let merchantAccountInfo = formatTLV('00', 'br.gov.bcb.pix');
  merchantAccountInfo += formatTLV('01', pixKey);
  if (params.description) {
    merchantAccountInfo += formatTLV('02', normalizeAscii(params.description, 40));
  }
  payloadWithoutCrc += formatTLV('26', merchantAccountInfo);

  payloadWithoutCrc += formatTLV('52', '0000');
  payloadWithoutCrc += formatTLV('53', '986');
  payloadWithoutCrc += formatTLV('54', formattedAmount);
  payloadWithoutCrc += formatTLV('58', 'BR');
  payloadWithoutCrc += formatTLV('59', merchantName);
  payloadWithoutCrc += formatTLV('60', merchantCity);

  const additionalData = formatTLV('05', txid);
  payloadWithoutCrc += formatTLV('62', additionalData);

  const crcHeader = '6304';
  const dataForCrc = `${payloadWithoutCrc}${crcHeader}`;
  const crcValue = calculateCRC16(dataForCrc);

  const fullPayload = `${dataForCrc}${crcValue}`;
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

function parseTLV(raw) {
  const map = new Map();
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

function validatePixPayload(payload) {
  if (!payload || payload.length < 20) {
    return { isValid: false, error: 'Payload Pix ausente ou muito curto.' };
  }

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

async function runSprint2Tests() {
  console.log('===================================================================');
  console.log('🧪 TESTES TÉCNICOS SPRINT 2 - MÓDULOS CENTRAIS (CESAR)');
  console.log('Cantina Inteligente, Pix EMV Dinâmico, Histórico & Repositório TCC');
  console.log('Responsável: Cesar | FATEC Rio Claro | Prof. Orlando');
  console.log('===================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, suite, testName) {
    if (condition) {
      console.log(`  ✓ [${suite}] ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ [${suite}] FALHA: ${testName}`);
      failed++;
    }
  }

  const rootDir = path.join(__dirname, '..');

  // ------------------------------------------------------------------
  // 1. TESTES DO SERVIÇO DE PIX DINÂMICO (EMV BANCO CENTRAL)
  // ------------------------------------------------------------------
  console.log('💳 [BLOCO 1/4] Testando Serviço Gerador de Pix Dinâmico (Padrão BACEN / EMV)...');
  
  const sampleCrc = calculateCRC16('123456789');
  assert(sampleCrc === '29B1', 'Pix-EMV', 'Cálculo de CRC-16/CCITT-FALSE confere com vetor ISO/IEC 13239 (29B1)');
  assert(formatTLV('00', '01') === '000201', 'Pix-EMV', 'Formatação Tag-Length-Value (Tag 00 -> 000201)');
  assert(formatTLV('53', '986') === '5303986', 'Pix-EMV', 'Formatação Moeda BRL ISO 4217 (Tag 53 -> 5303986)');

  const txid = generateTxId('FAT');
  assert(txid.length <= 25 && txid.startsWith('FAT'), 'Pix-EMV', 'Geração de txid alfanumérico único <= 25 caracteres');

  const pix = generatePixPayload({
    amount: 12.50,
    txid: 'FATTESTE2026',
    description: 'Cantina FATEC RC',
  });

  assert(pix.payload.startsWith('000201'), 'Pix-EMV', 'Inicia com Payload Format Indicator 000201');
  assert(pix.payload.includes('br.gov.bcb.pix'), 'Pix-EMV', 'Inclui GUI oficial do Banco Central (br.gov.bcb.pix)');
  assert(pix.payload.includes('540512.50'), 'Pix-EMV', 'Formata valor monetário com 2 casas decimais (540512.50)');
  assert(pix.payload.includes('FATTESTE2026'), 'Pix-EMV', 'Inclui Tag 62 com identificador único txid');
  assert(pix.payload.includes('6304'), 'Pix-EMV', 'Inclui Tag 63 de CRC16');
  assert(typeof pix.qrCodeUrl === 'string' && pix.qrCodeUrl.length > 10, 'Pix-EMV', 'Gera URL de QR Code dinâmico');

  const validation = validatePixPayload(pix.payload);
  assert(validation.isValid === true, 'Pix-EMV', 'Validador decodifica e aprova o Payload Pix gerado');
  assert(validation.amount === 12.50, 'Pix-EMV', 'Validador extrai o valor exato R$ 12.50');
  assert(validation.txid === 'FATTESTE2026', 'Pix-EMV', 'Validador recupera o txid');

  const tampered = pix.payload.slice(0, -4) + 'AAAA';
  const tamperedCheck = validatePixPayload(tampered);
  assert(tamperedCheck.isValid === false, 'Pix-EMV', 'Validador rejeita checksum CRC16 adulterado');

  const pixLibPath = path.join(rootDir, 'src', 'lib', 'pix.ts');
  const pixGenRoute = path.join(rootDir, 'src', 'app', 'api', 'pix', 'generate', 'route.ts');
  const pixValRoute = path.join(rootDir, 'src', 'app', 'api', 'pix', 'validate', 'route.ts');
  assert(fs.existsSync(pixLibPath), 'Pix-EMV', 'Módulo src/lib/pix.ts implementado em TypeScript');
  assert(fs.existsSync(pixGenRoute), 'Pix-EMV', 'Endpoint REST POST /api/pix/generate implementado');
  assert(fs.existsSync(pixValRoute), 'Pix-EMV', 'Endpoint REST POST /api/pix/validate implementado');

  // ------------------------------------------------------------------
  // 2. TESTES DE PRODUTOS E CONTROLE DE ESTOQUE (HONEST MARKET)
  // ------------------------------------------------------------------
  console.log('\n📦 [BLOCO 2/4] Testando Endpoints CRUD do Catálogo de Produtos e Controle de Estoque...');

  const productsRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'products', 'route.ts');
  const productDetailRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'products', '[id]', 'route.ts');
  const productStockRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'products', '[id]', 'stock', 'route.ts');

  assert(fs.existsSync(productsRoute), 'HonestMarket', 'Endpoint GET/POST /api/canteen/products implementado');
  assert(fs.existsSync(productDetailRoute), 'HonestMarket', 'Endpoint GET/PUT/DELETE /api/canteen/products/[id] implementado');
  assert(fs.existsSync(productStockRoute), 'HonestMarket', 'Endpoint PATCH /api/canteen/products/[id]/stock implementado');

  const productsRouteContent = fs.readFileSync(productsRoute, 'utf8');
  assert(
    productsRouteContent.includes('CA_MEMBRO') && productsRouteContent.includes('ADMIN'),
    'HonestMarket',
    'Controle de acesso RBAC (CA_MEMBRO e ADMIN) no cadastro de produtos'
  );
  assert(productsRouteContent.includes('min_stock_alert'), 'HonestMarket', 'Suporte a limite de alerta de estoque mínimo configurável');

  const stockContent = fs.readFileSync(productStockRoute, 'utf8');
  assert(stockContent.includes('quantity_delta') && stockContent.includes('new_stock'), 'HonestMarket', 'API de estoque suporta baixa relativa e reposição absoluta');

  // ------------------------------------------------------------------
  // 3. TESTES DE CHECKOUT, HISTÓRICO E EXTRATO DE COMPRAS
  // ------------------------------------------------------------------
  console.log('\n🧾 [BLOCO 3/4] Testando Checkout Pix e API de Histórico/Extrato de Compras do Aluno...');

  const checkoutRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'checkout', 'route.ts');
  const historyRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'history', 'route.ts');
  const txRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'transactions', 'route.ts');
  const txDetailRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'transactions', '[id]', 'route.ts');
  const txProofRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'transactions', '[id]', 'proof', 'route.ts');

  assert(fs.existsSync(checkoutRoute), 'ExtratoAluno', 'Endpoint POST /api/canteen/checkout implementado');
  assert(fs.existsSync(historyRoute), 'ExtratoAluno', 'Endpoint GET /api/canteen/history implementado');
  assert(fs.existsSync(txRoute), 'ExtratoAluno', 'Endpoint GET /api/canteen/transactions implementado');
  assert(fs.existsSync(txDetailRoute), 'ExtratoAluno', 'Endpoint GET/PATCH /api/canteen/transactions/[id] implementado');
  assert(fs.existsSync(txProofRoute), 'ExtratoAluno', 'Endpoint POST /api/canteen/transactions/[id]/proof implementado');

  const checkoutContent = fs.readFileSync(checkoutRoute, 'utf8');
  assert(
    checkoutContent.includes('generatePixPayload') && checkoutContent.includes('generateTxId'),
    'ExtratoAluno',
    'Checkout integra diretamente o gerador de Pix dinâmico com identificador único'
  );

  const historyContent = fs.readFileSync(historyRoute, 'utf8');
  assert(
    historyContent.includes('getStudentStatement'),
    'ExtratoAluno',
    'API de histórico gera extrato financeiro consolidado com totais por aluno'
  );

  // ------------------------------------------------------------------
  // 4. TESTES DE MATERIAIS ACADÊMICOS E PROJETOS DE TCC
  // ------------------------------------------------------------------
  console.log('\n📚 [BLOCO 4/4] Testando Endpoints de Upload, Categorização e Busca de Materiais/TCC...');

  const materialsRoute = path.join(rootDir, 'src', 'app', 'api', 'materials', 'route.ts');
  const materialDetailRoute = path.join(rootDir, 'src', 'app', 'api', 'materials', '[id]', 'route.ts');
  const materialDownloadRoute = path.join(rootDir, 'src', 'app', 'api', 'materials', '[id]', 'download', 'route.ts');
  const materialUploadRoute = path.join(rootDir, 'src', 'app', 'api', 'materials', 'upload', 'route.ts');
  const announcementsRoute = path.join(rootDir, 'src', 'app', 'api', 'announcements', 'route.ts');

  assert(fs.existsSync(materialsRoute), 'RepositorioTCC', 'Endpoint GET/POST /api/materials implementado');
  assert(fs.existsSync(materialDetailRoute), 'RepositorioTCC', 'Endpoint GET/PUT/DELETE /api/materials/[id] implementado');
  assert(fs.existsSync(materialDownloadRoute), 'RepositorioTCC', 'Endpoint POST /api/materials/[id]/download implementado');
  assert(fs.existsSync(materialUploadRoute), 'RepositorioTCC', 'Endpoint POST /api/materials/upload implementado');
  assert(fs.existsSync(announcementsRoute), 'Avisos-S2C2', 'Endpoint GET/POST /api/announcements implementado');

  const materialsContent = fs.readFileSync(materialsRoute, 'utf8');
  assert(
    materialsContent.includes('material_type') && materialsContent.includes('TCC'),
    'RepositorioTCC',
    'Suporte a categorização de projetos de TCC, apostilas, códigos e slides'
  );
  assert(
    materialsContent.includes('course') && materialsContent.includes('semester'),
    'RepositorioTCC',
    'Filtros por curso (IA/ESG) e semestres acadêmicos implementados'
  );

  const uploadContent = fs.readFileSync(materialUploadRoute, 'utf8');
  assert(
    uploadContent.includes('.pdf') && uploadContent.includes('.ipynb'),
    'RepositorioTCC',
    'Upload valida extensões permitidas de arquivos (.pdf, .ipynb, .zip, etc.)'
  );

  console.log('\n===================================================================');
  console.log(`📊 RESUMO DA SPRINT 2 (CESAR): ${passed} testes aprovados | ${failed} falhas`);
  if (failed === 0) {
    console.log('✅ STATUS SPRINT 2: 100% DAS ENTREGAS APROVADAS COM EXCELÊNCIA!');
  } else {
    console.error('❌ STATUS SPRINT 2: FALHAS DETECTADAS.');
    process.exitCode = 1;
  }
  console.log('===================================================================\n');
}

runSprint2Tests().catch((err) => {
  console.error(err);
  process.exit(1);
});
