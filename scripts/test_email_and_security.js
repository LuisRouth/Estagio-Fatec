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

// 3. Verificar que os inputs de senha possuem botão de alternar visibilidade (showSenha / showPassword)
const cadastroPath = path.join(__dirname, '..', 'src', 'app', 'cadastro', 'page.tsx');
const cadastroSource = fs.readFileSync(cadastroPath, 'utf8');
assert(cadastroSource.includes('showSenha'), 'Cadastro deve conter estado showSenha');
assert(cadastroSource.includes('showConfirmSenha'), 'Cadastro deve conter estado showConfirmSenha');
console.log('  [PASS] Tela de Cadastro possui alternância de visibilidade para Senha e Confirmar Senha');

const configPath = path.join(__dirname, '..', 'src', 'app', 'configuracoes', 'page.tsx');
const configSource = fs.readFileSync(configPath, 'utf8');
assert(configSource.includes('showCurrentPassword'), 'Configurações deve conter estado showCurrentPassword');
assert(configSource.includes('showNewPassword'), 'Configurações deve conter estado showNewPassword');
assert(configSource.includes('showConfirmPassword'), 'Configurações deve conter estado showConfirmPassword');
console.log('  [PASS] Tela de Configurações possui alternância de visibilidade para Senha Atual, Nova Senha e Confirmação');

console.log('====================================================');
console.log(' TODOS OS 4 GRUPOS DE TESTES DE SEGURANÇA FORAM APROVADOS!');
console.log('====================================================');

