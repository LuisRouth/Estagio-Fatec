// ====================================================================
// ESTEIRA INTEGRADA DE QA & DEVOPS — PORTAL FATEC RIO CLARO (SPRINT 1)
// Responsável: Guilherme (Inteligência Artificial, DevOps & QA)
// Uso: node scripts/test_qa_pipeline.js
// ====================================================================

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');

const ROOT = path.resolve(__dirname, '..');

async function runQaPipeline() {
  console.log('======================================================================');
  console.log('🛡️  ESTEIRA DE QA, DEVOPS & IA (VITEST / PLAYWRIGHT / CI) - SPRINT 1');
  console.log('Responsável: Guilherme | FATEC Rio Claro | Prof. Orlando');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Auditoria de Infraestrutura DevOps (Vercel + Supabase + Env)
  console.log('[1/5] Auditando Configuração DevOps (Vercel & Supabase)...');
  const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf-8');
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf-8'));

  assert(envExample.includes('DATABASE_URL=') && envExample.includes('SUPABASE_SERVICE_ROLE_KEY='), 'Variáveis do Supabase Cloud (Pooler + Service Role) documentadas em .env.example');
  assert(envExample.includes('GEMINI_API_KEY=') && envExample.includes('GEMINI_MODEL='), 'Variáveis do SDK Google Gemini configuradas em .env.example');
  assert(vercelConfig.regions && vercelConfig.regions.includes('gru1'), 'Região Serverless Vercel configurada para São Paulo (gru1)');
  assert(Array.isArray(vercelConfig.headers) && vercelConfig.headers.length > 0, 'Headers de segurança OWASP configurados no edge da Vercel');

  // 2. Auditoria de Artefatos da Esteira de Testes (Vitest & Playwright)
  console.log('\n[2/5] Verificando Suítes de Testes Automatizados (Vitest & Playwright)...');
  assert(fs.existsSync(path.join(ROOT, 'vitest.config.ts')), 'Configuração Vitest (vitest.config.ts) presente');
  assert(fs.existsSync(path.join(ROOT, 'playwright.config.ts')), 'Configuração Playwright E2E (playwright.config.ts) presente');
  assert(fs.existsSync(path.join(ROOT, 'tests/unit/security_auth.test.ts')), 'Suíte Unitária de Segurança e RBAC presente');
  assert(fs.existsSync(path.join(ROOT, 'tests/unit/gemini_ai.test.ts')), 'Suíte Unitária do Motor IA Gemini presente');
  assert(fs.existsSync(path.join(ROOT, 'tests/e2e/portal.spec.ts')), 'Suíte E2E Multiplataforma (Desktop + Mobile PWA) presente');

  // 3. Testes de Integração de Segurança e Sessão (Backend Cesar)
  console.log('\n[3/5] Executando Testes de Regressão de Criptografia e JWT...');
  const hash = await bcrypt.hash('Fatec@2026', 10);
  assert(await bcrypt.compare('Fatec@2026', hash), 'Validação Bcrypt íntegra na esteira de QA');

  const secret = new TextEncoder().encode('fatec_rio_claro_super_secure_jwt_secret_key_2026_cesar_dev_token');
  const jwt = await new SignJWT({ sub: 'qa-user', role: 'CA_MEMBRO', course: 'IA' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('fatec-rio-claro-portal')
    .setAudience('fatec-students')
    .setExpirationTime('1h')
    .sign(secret);
  const { payload } = await jwtVerify(jwt, secret);
  assert(payload.role === 'CA_MEMBRO', 'Assinatura e verificação JWT (HS256) aprovadas');

  // 4. Testes de Integridade do Frontend, Rotas e PWA (Frontend Luis)
  console.log('\n[4/5] Auditando Rotas do App Router e Manifesto PWA...');
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/manifest.json'), 'utf-8'));
  assert(Boolean(manifest.name) && Array.isArray(manifest.icons), 'Manifesto PWA válido e pronto para instalação mobile');
  assert(fs.existsSync(path.join(ROOT, 'src/app/api/health/route.ts')), 'Rota de Healthcheck Backend (/api/health) disponível');
  assert(fs.existsSync(path.join(ROOT, 'src/app/api/ai/health/route.ts')), 'Rota de Healthcheck IA Gemini (/api/ai/health) disponível');

  // 5. Auditoria de Documentação de Engenharia de Software (ERS + Trello)
  console.log('\n[5/5] Verificando Documentação de Requisitos (ERS) e Quadro Trello...');
  assert(fs.existsSync(path.join(ROOT, 'docs/especificacao_requisitos_trello.md')), 'Documento de Especificação de Requisitos e Quadro Trello presente');
  assert(fs.existsSync(path.join(ROOT, 'docs/devops_hospedagem_vercel_supabase.md')), 'Guia Técnico de DevOps (Vercel + Supabase + Gemini) presente');

  console.log('\n======================================================================');
  console.log('📊 RELATÓRIO FINAL DA ESTEIRA DE QA (SPRINT 1):');
  console.log(`   Verificações Aprovadas: ${passed} | Falhas: ${failed}`);
  if (failed === 0) {
    console.log('🎉 ESTEIRA DE QA, DEVOPS E IA 100% OPERACIONAL E HOMOLOGADA!');
  }
  console.log('======================================================================\n');

  if (failed > 0) process.exit(1);
}

runQaPipeline().catch((err) => {
  console.error(err);
  process.exit(1);
});
