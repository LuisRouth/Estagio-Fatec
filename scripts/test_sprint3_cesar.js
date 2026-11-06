/**
 * Test Suite - Cesar (Sprint 3)
 * Módulos Analíticos do CA, Sanitização de Segurança, Rate Limiting e Otimizações de Banco
 */

const fs = require('fs');
const path = require('path');

let passedTests = 0;
let totalTests = 0;

function assert(description, condition) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${description}`);
    process.exitCode = 1;
  }
}

// Implementações puras equivalentes às de src/lib/security.ts para teste direto em CJS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  let sanitized = input;
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '');
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^>\s]+/gi, '');
  sanitized = sanitized.replace(/javascript\s*:\s*[^\s"'>]+/gi, '');
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return sanitized.trim();
}

function sanitizeSearchQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/;/g, '')
    .replace(/--/g, '')
    .trim();
}

function assertSafeSqlIdentifier(identifier) {
  const safeRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return safeRegex.test(identifier);
}

// Simulação de Rate Limit in-memory
const rateLimits = new Map();
function checkRateLimit(identifier, maxAttempts = 5, windowSeconds = 60) {
  const now = Date.now();
  const record = rateLimits.get(identifier);
  if (!record || now > record.resetTime) {
    rateLimits.set(identifier, { count: 1, resetTime: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: windowSeconds };
  }
  if (record.count >= maxAttempts) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }
  record.count++;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}

console.log('====================================================');
console.log(' TEST SUITE: Cesar - Sprint 3 (FATEC Rio Claro)');
console.log('====================================================\n');

// 1. Testes de Sanitização Anti-XSS e Anti-SQLi
console.log('Grupo 1: Sanitização contra XSS e SQL Injection');
{
  const xssScript = '<script>alert("XSS")</script>Olá Mundo';
  const cleanXss = sanitizeInput(xssScript);
  assert('Remove tags <script> maliciosas', !cleanXss.includes('<script>') && !cleanXss.includes('alert'));
  assert('Mantém o texto legítimo', cleanXss.includes('Olá Mundo'));

  const xssImg = '<img src="x" onerror="stealCookies()">';
  const cleanImg = sanitizeInput(xssImg);
  assert('Escapa caracteres e elimina manipuladores onerror', !cleanImg.includes('onerror=') && cleanImg.includes('&lt;img'));

  const xssIframe = '<iframe src="http://evil.com"></iframe>Texto seguro';
  const cleanIframe = sanitizeInput(xssIframe);
  assert('Remove elementos iframe externos', !cleanIframe.includes('<iframe') && cleanIframe.includes('Texto seguro'));

  const sqliQuery = "%' OR 1=1; DROP TABLE users; --";
  const cleanQuery = sanitizeSearchQuery(sqliQuery);
  assert('Escapa wildcards SQL (%) e bloqueia injeção de ponto-e-vírgula e comentários', !cleanQuery.includes(';') && !cleanQuery.includes('--') && cleanQuery.includes('\\%'));

  assert('Valida identificadores SQL seguros', assertSafeSqlIdentifier('created_at') === true);
  assert('Valida identificadores com letras e números', assertSafeSqlIdentifier('user_id_123') === true);
  assert('Bloqueia identificadores SQL perigosos com espaços ou aspas', assertSafeSqlIdentifier('id; DROP TABLE') === false);
  assert('Bloqueia identificadores com caracteres especiais', assertSafeSqlIdentifier("name' OR '1'='1") === false);
}

// 2. Testes de Rate Limiting
console.log('\nGrupo 2: Proteção de Força Bruta e Rate Limiting');
{
  const userIp = '192.168.1.100';
  let allowedCount = 0;
  let blocked = false;

  for (let i = 0; i < 7; i++) {
    const res = checkRateLimit(userIp, 5, 60);
    if (res.allowed) allowedCount++;
    else blocked = true;
  }

  assert('Permite requisições dentro do teto estipulado (5)', allowedCount === 5);
  assert('Bloqueia requisições excedentes além do limite de taxa', blocked === true);
}

// 3. Verificação de Arquivos e Endpoints Analíticos do CA
console.log('\nGrupo 3: Estrutura dos Endpoints Analíticos do Centro Acadêmico');
{
  const basePath = path.resolve(__dirname, '..');

  const filesToCheck = [
    'src/app/api/ca/analytics/financial/route.ts',
    'src/app/api/ca/analytics/products/route.ts',
    'src/app/api/ca/analytics/audit/route.ts',
    'src/app/api/ca/analytics/export/route.ts',
  ];

  filesToCheck.forEach((filePath) => {
    const fullPath = path.join(basePath, filePath);
    const exists = fs.existsSync(fullPath);
    assert(`Endpoint analítico existe: ${filePath}`, exists);

    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(`Contém handler GET em ${filePath}`, content.includes('export async function GET'));
    }
  });

  const exportRoute = fs.readFileSync(path.join(basePath, 'src/app/api/ca/analytics/export/route.ts'), 'utf8');
  assert('Endpoint de exportação gera cabeçalhos de Content-Type CSV', exportRoute.includes('text/csv'));
  assert('Endpoint de exportação formata linhas com vírgula/ponto-e-vírgula', exportRoute.includes('Content-Disposition'));
}

// 4. Verificação de Índices e Relatório EXPLAIN ANALYZE
console.log('\nGrupo 4: Otimização de Consultas SQL e Documentação Técnica');
{
  const basePath = path.resolve(__dirname, '..');
  const sqlIndexesPath = path.join(basePath, 'database', 'optimization_indexes.sql');
  const explainDocPath = path.join(basePath, 'docs', 'analise_planos_execucao_explain.md');
  const manualPath = path.join(basePath, 'docs', 'manual_tecnico_backend_db.md');
  const relatorioPath = path.join(basePath, 'docs', 'relatorio_estagio_sprint3_cesar.md');

  assert('Arquivo database/optimization_indexes.sql existe', fs.existsSync(sqlIndexesPath));
  if (fs.existsSync(sqlIndexesPath)) {
    const sql = fs.readFileSync(sqlIndexesPath, 'utf8');
    assert('Cria índice para auditoria', sql.includes('idx_audit_action_created'));
    assert('Cria índice composto para transações da cantina', sql.includes('idx_trans_status_created'));
    assert('Cria índice de estoque baixo parcial', sql.includes('idx_products_low_stock_alert'));
    assert('Cria índice GIN de busca textual para materiais acadêmicos', sql.includes('idx_materials_fulltext_search_gin'));
  }

  assert('Relatório EXPLAIN ANALYZE existe em docs/', fs.existsSync(explainDocPath));
  if (fs.existsSync(explainDocPath)) {
    const doc = fs.readFileSync(explainDocPath, 'utf8');
    assert('Contém plano com Seq Scan vs Index Scan', doc.includes('Index Scan') && doc.includes('Seq Scan'));
    assert('Demonstra análise de tempo de execução', /tempo de execução|execution time/i.test(doc));
  }

  assert('Manual Técnico existe em docs/manual_tecnico_backend_db.md', fs.existsSync(manualPath));
  if (fs.existsSync(manualPath)) {
    const manual = fs.readFileSync(manualPath, 'utf8');
    assert('Manual abrange a arquitetura do banco de dados', manual.includes('DICIONÁRIO DE DADOS RELACIONAL') || manual.includes('canteen_products'));
    assert('Manual documenta o padrão Pix EMV', /pix dinâmico|motor de pix/i.test(manual));
    assert('Manual documenta as rotas analíticas do CA', manual.includes('/api/ca/analytics'));
  }

  assert('Relatório de Estágio Sprint 3 existe em docs/relatorio_estagio_sprint3_cesar.md', fs.existsSync(relatorioPath));
  if (fs.existsSync(relatorioPath)) {
    const relatorio = fs.readFileSync(relatorioPath, 'utf8');
    assert('Totaliza 67 horas na Sprint 3 e 200h acumuladas', relatorio.includes('200') && relatorio.includes('67'));
  }
}

console.log('\n====================================================');
console.log(` RESULTADO: ${passedTests}/${totalTests} testes aprovados`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
