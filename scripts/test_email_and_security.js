const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE: Email Service & Security Verification');
console.log('====================================================');

// 1. Verificar se src/lib/email.ts existe e exporta sendVerificationEmail
const emailModulePath = path.join(__dirname, '..', 'src', 'lib', 'email.ts');
assert(fs.existsSync(emailModulePath), 'src/lib/email.ts deve existir');
const emailSource = fs.readFileSync(emailModulePath, 'utf8');
assert(emailSource.includes('sendVerificationEmail'), 'Deve exportar a função sendVerificationEmail');
assert(emailSource.includes('SMTP_HOST'), 'Deve ler configurações de SMTP');
assert(emailSource.includes('Portal FATEC Rio Claro'), 'Deve conter template visual FATEC');
console.log('  [PASS] Serviço de e-mail src/lib/email.ts configurado com template FATEC e suporte SMTP');

// 2. Verificar que devVerificationCode, devCodeHint e otpDevHint NÃO existem em nenhum arquivo src/
function checkNoLeaks(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git') checkNoLeaks(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      assert(!content.includes('devVerificationCode'), `Vazamento de devVerificationCode encontrado em: ${full}`);
      assert(!content.includes('devCodeHint'), `Vazamento de devCodeHint encontrado em: ${full}`);
      assert(!content.includes('otpDevHint'), `Vazamento de otpDevHint encontrado em: ${full}`);
    }
  }
}
checkNoLeaks(path.join(__dirname, '..', 'src'));
console.log('  [PASS] Zero vazamentos de código de verificação no código-fonte e nas telas (src/)');

// 3. Verificar que botão de simulação/bypass foi 100% expurgado de EmailVerificationScreen.tsx
const verifScreenPath = path.join(__dirname, '..', 'src', 'components', 'auth', 'EmailVerificationScreen.tsx');
const verifScreenSource = fs.readFileSync(verifScreenPath, 'utf8');
assert(!verifScreenSource.includes('handleSimulateVerification'), 'handleSimulateVerification deve ser removido');
assert(!verifScreenSource.includes('Validar com 1 Clique'), 'Botão de bypass com 1 clique deve ser removido');
assert(verifScreenSource.includes('recoveryEmail'), 'Tela de verificação deve suportar e-mail de recuperação');
console.log('  [PASS] Botão de bypass/simulação removido com sucesso; verificação estrita mantida');

// 4. Verificar que a API /api/auth/register exige recoveryEmail e verificationCode
const registerApiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'auth', 'register', 'route.ts');
const registerApiSource = fs.readFileSync(registerApiPath, 'utf8');
assert(registerApiSource.includes('recoveryEmail'), 'API de registro deve exigir recoveryEmail');
assert(registerApiSource.includes('verificationCode'), 'API de registro deve exigir verificationCode');
assert(registerApiSource.includes('db.verifications.verify'), 'API de registro deve validar o código no banco antes de criar usuário');
console.log('  [PASS] API de registro protege a criação da conta exigindo e-mail de recuperação e código OTP correto');

// 5. Verificar que os inputs de senha possuem botão de alternar visibilidade (showSenha / showPassword)
const cadastroPath = path.join(__dirname, '..', 'src', 'app', 'cadastro', 'page.tsx');
const cadastroSource = fs.readFileSync(cadastroPath, 'utf8');
assert(cadastroSource.includes('showSenha'), 'Cadastro deve conter estado showSenha');
assert(cadastroSource.includes('showConfirmSenha'), 'Cadastro deve conter estado showConfirmSenha');
assert(cadastroSource.includes('recoveryEmail'), 'Cadastro deve conter estado recoveryEmail');
console.log('  [PASS] Tela de Cadastro possui e-mail de recuperação obrigatório e alternância de visibilidade de senha');

const configPath = path.join(__dirname, '..', 'src', 'app', 'configuracoes', 'page.tsx');
const configSource = fs.readFileSync(configPath, 'utf8');
assert(configSource.includes('showCurrentPassword'), 'Configurações deve conter estado showCurrentPassword');
assert(configSource.includes('showNewPassword'), 'Configurações deve conter estado showNewPassword');
assert(configSource.includes('showConfirmPassword'), 'Configurações deve conter estado showConfirmPassword');
console.log('  [PASS] Tela de Configurações possui alternância de visibilidade para Senha Atual, Nova Senha e Confirmação');

console.log('====================================================');
console.log(' TODOS OS 6 GRUPOS DE TESTES DE SEGURANÇA FORAM APROVADOS!');
console.log('====================================================');
