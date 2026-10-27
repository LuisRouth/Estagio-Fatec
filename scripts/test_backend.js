// ====================================================================
// SUÍTE DE TESTES UNITÁRIOS DO BACKEND (SPRINT 1 - CESAR)
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Uso: node scripts/test_backend.js
// ====================================================================

const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');

async function runTestSuite() {
  console.log('===========================================================');
  console.log('🧪 TESTES DE SEGURANÇA E MOTOR DE AUTENTICAÇÃO - SPRINT 1');
  console.log('Responsável: Cesar | FATEC Rio Claro | Prof. Orlando');
  console.log('===========================================================\n');

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

  // 1. Teste de Criptografia de Senha (Bcrypt + Salt)
  console.log('[1/4] Testando Criptografia de Senha (Bcrypt)...');
  const plainPassword = 'Fatec@Password2026';
  const hash = await bcrypt.hash(plainPassword, 10);
  assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Hash no formato padrão modular crypt Bcrypt');
  assert(await bcrypt.compare(plainPassword, hash), 'Senha original confere com o hash gerado');
  assert(!(await bcrypt.compare('SenhaIncorreta123!', hash)), 'Senha incorreta é rejeitada');

  // 2. Teste de Validador de Força de Senha
  console.log('\n[2/4] Testando Regras de Senha Forte...');
  function testPasswordStrength(pass) {
    if (pass.length < 8) return false;
    if (!/[A-Z]/.test(pass)) return false;
    if (!/[a-z]/.test(pass)) return false;
    if (!/[0-9]/.test(pass)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) return false;
    return true;
  }
  assert(!testPasswordStrength('123456'), 'Rejeita senha curta simples');
  assert(!testPasswordStrength('senhasemnumero!'), 'Rejeita senha sem maiúscula e número');
  assert(testPasswordStrength('Fatec@2026'), 'Aprova senha com maiúscula, minúscula, número e símbolo');

  // 3. Teste de Emissão e Verificação de Token JWT (Jose)
  console.log('\n[3/4] Testando Assinatura e Decodificação de JWT...');
  const secretKey = new TextEncoder().encode('fatec_rio_claro_super_secure_jwt_secret_key_2026_cesar_dev_token');
  const mockUser = {
    sub: 'user-uuid-12345',
    name: 'Cesar Estudante',
    email: 'cesar@fatec.sp.gov.br',
    role: 'ADMIN',
    course: 'IA',
    semester: 4,
  };

  const token = await new SignJWT(mockUser)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('fatec-rio-claro-portal')
    .setAudience('fatec-students')
    .sign(secretKey);

  assert(typeof token === 'string' && token.split('.').length === 3, 'Token JWT estruturado em 3 partes (Header.Payload.Signature)');

  const { payload } = await jwtVerify(token, secretKey, {
    issuer: 'fatec-rio-claro-portal',
    audience: 'fatec-students',
  });

  assert(payload.sub === mockUser.sub, 'Claim "sub" preservado no token');
  assert(payload.role === 'ADMIN', 'Claim de papel RBAC "role" preservado no token');
  assert(payload.course === 'IA', 'Claim de curso preservado');

  // 4. Teste de Sanitização contra Injeção Básica
  console.log('\n[4/4] Testando Sanitização de Entradas...');
  function sanitize(input) {
    return input.trim().replace(/[<>]/g, '').slice(0, 1000);
  }
  const dangerousInput = ' <script>alert("hack")</script> Cesar ';
  const sanitized = sanitize(dangerousInput);
  assert(!sanitized.includes('<') && !sanitized.includes('>'), 'Caracteres < e > removidos para proteção XSS');
  assert(sanitized.includes('Cesar'), 'Dados válidos mantidos');

  console.log('\n===========================================================');
  console.log(`📊 RESULTADO FINAL DOS TESTES DO BACKEND:`);
  console.log(`   Sucessos: ${passed} | Falhas: ${failed}`);
  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  }
  console.log('===========================================================\n');
}

runTestSuite().catch(console.error);
