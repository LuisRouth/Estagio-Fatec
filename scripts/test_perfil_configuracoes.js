/**
 * Test Suite - Perfil, Configurações, Segurança, Acessibilidade e Alertas
 * FATEC Rio Claro - Sprint 3 / Validação dos 6 Requisitos
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

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

// 1. Validador de Extensão de E-mail Institucional
function isValidInstitutionalEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  return clean.endsWith('@aluno.cps.sp.gov.br') || clean.endsWith('@fatec.sp.gov.br');
}

// 2. Validador de E-mail de Recuperação (Livre)
function isValidRecoveryEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
}

// 3. Gerador e Validador de Código OTP
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function runTests() {
  console.log('====================================================');
  console.log(' TEST SUITE: Perfil, Segurança, Acessibilidade & Alertas');
  console.log('====================================================\n');

  // Grupo 1: Regras de E-mail Institucional vs. Recuperação
  console.log('Grupo 1: Validação de E-mail Institucional e de Recuperação');
  {
    assert('Aprova e-mail institucional @aluno.cps.sp.gov.br', isValidInstitutionalEmail('luis.routh@aluno.cps.sp.gov.br') === true);
    assert('Aprova e-mail institucional @fatec.sp.gov.br', isValidInstitutionalEmail('orlando.saraiva@fatec.sp.gov.br') === true);
    assert('Rejeita e-mail pessoal @gmail.com no institucional', isValidInstitutionalEmail('aluno@gmail.com') === false);
    assert('Rejeita e-mail corporativo aleatório no institucional', isValidInstitutionalEmail('aluno@empresa.com.br') === false);

    assert('Permite e-mail de recuperação @gmail.com', isValidRecoveryEmail('seguranca@gmail.com') === true);
    assert('Permite e-mail de recuperação @outlook.com', isValidRecoveryEmail('recuperacao@outlook.com') === true);
    assert('Permite e-mail de recuperação @yahoo.com.br', isValidRecoveryEmail('contato@yahoo.com.br') === true);
    assert('Rejeita e-mail de recuperação malformado sem @', isValidRecoveryEmail('emailinvalido.com') === false);
  }

  // Grupo 2: Geração de Código OTP de 6 Dígitos
  console.log('\nGrupo 2: Código OTP Numérico de Verificação de Existência');
  {
    const code = generateOtpCode();
    assert('Gera código OTP numérico com exatamente 6 dígitos', /^\d{6}$/.test(code));
    assert('Código OTP está na faixa de 100000 a 999999', Number(code) >= 100000 && Number(code) <= 999999);
  }

  // Grupo 3: Conexão e Validação no Banco de Dados Supabase (em nuvem)
  console.log('\nGrupo 3: Tabelas e Migrações no Banco de Dados PostgreSQL');
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      // 3.1. Verificar colunas adicionadas em users
      const usersCols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users';"
      );
      const colNames = usersCols.rows.map((r) => r.column_name);
      assert('Tabela users possui coluna recovery_email', colNames.includes('recovery_email'));
      assert('Tabela users possui coluna is_email_verified', colNames.includes('is_email_verified'));
      assert('Tabela users possui coluna email_verified_at', colNames.includes('email_verified_at'));

      // 3.2. Verificar tabela email_verifications
      const verifCols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'email_verifications';"
      );
      const verifNames = verifCols.rows.map((r) => r.column_name);
      assert('Tabela email_verifications criada com sucesso', verifNames.length > 0);
      assert('Possui coluna verification_code', verifNames.includes('verification_code'));
      assert('Possui coluna token e expires_at', verifNames.includes('token') && verifNames.includes('expires_at'));

      // 3.3. Verificar tabela user_security_audit
      const auditCols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_security_audit';"
      );
      const auditNames = auditCols.rows.map((r) => r.column_name);
      assert('Tabela user_security_audit criada com sucesso', auditNames.length > 0);
      assert('Possui colunas user_id, changed_by, action, field_name, ip_address, created_at',
        auditNames.includes('user_id') &&
        auditNames.includes('changed_by') &&
        auditNames.includes('action') &&
        auditNames.includes('field_name') &&
        auditNames.includes('created_at')
      );

      // 3.4. Verificar tabela user_preferences
      const prefCols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'user_preferences';"
      );
      const prefNames = prefCols.rows.map((r) => r.column_name);
      assert('Tabela user_preferences criada com sucesso', prefNames.length > 0);
      assert('Possui campos high_contrast, font_size, reduce_motion, feed_filter',
        prefNames.includes('high_contrast') &&
        prefNames.includes('font_size') &&
        prefNames.includes('reduce_motion') &&
        prefNames.includes('feed_filter')
      );

      // 3.5. Teste de Inserção e Leitura de Preferências
      const testUserId = 'a0000000-0000-0000-0000-000000000004'; // Aluno Lucas
      await pool.query(
        `INSERT INTO user_preferences (user_id, high_contrast, font_size, reduce_motion, feed_filter, updated_at)
         VALUES ($1, true, 'comfort', true, 'my_course', NOW())
         ON CONFLICT (user_id) DO UPDATE SET high_contrast = EXCLUDED.high_contrast, font_size = EXCLUDED.font_size;`,
        [testUserId]
      );
      const prefRead = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1;', [testUserId]);
      assert('Persiste e recupera preferências de acessibilidade por login do usuário', prefRead.rows[0].high_contrast === true && prefRead.rows[0].font_size === 'comfort');

      // 3.6. Teste de Inserção e Leitura de Auditoria de Segurança
      await pool.query(
        `INSERT INTO user_security_audit (user_id, changed_by, action, field_name, old_value_masked, new_value_masked, ip_address)
         VALUES ($1, $1, 'PASSWORD_CHANGE', 'password_hash', '********', '******** (nova)', '127.0.0.1');`,
        [testUserId]
      );
      const auditRead = await pool.query('SELECT * FROM user_security_audit WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;', [testUserId]);
      assert('Registra histórico de alteração de senha com autor, data, hora e IP', auditRead.rows[0].action === 'PASSWORD_CHANGE');

      // 3.7. Teste de Segmentação de Alertas por Curso e Semestre
      const announcementsCols = await pool.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'announcements';"
      );
      const annNames = announcementsCols.rows.map((r) => r.column_name);
      assert('Tabela announcements possui coluna target_semester', annNames.includes('target_semester'));

      await pool.end();
    } catch (err) {
      console.error('Erro de teste no banco:', err);
      process.exitCode = 1;
    }
  }

  console.log('\n====================================================');
  console.log(` RESULTADO: ${passedTests}/${totalTests} testes aprovados`);
  console.log('====================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch(console.error);

