const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const targetEmail = 'cesar.bovo@aluno.cps.sp.gov.br';
  console.log(`Buscando dados associados a: ${targetEmail}`);

  const userRes = await pool.query(
    'SELECT id, name, email, ra, role, course, semester, is_email_verified, created_at FROM users WHERE LOWER(email) = LOWER($1)',
    [targetEmail]
  );
  console.log('1. Tabela users:', userRes.rows);

  const verifRes = await pool.query(
    'SELECT id, user_id, email, verification_code, purpose, expires_at, created_at FROM email_verifications WHERE LOWER(email) = LOWER($1)',
    [targetEmail]
  );
  console.log('2. Tabela email_verifications:', verifRes.rows);

  // Se houver registros, vamos apagar conforme solicitado pelo usuário
  if (verifRes.rows.length > 0) {
    const delVerif = await pool.query(
      'DELETE FROM email_verifications WHERE LOWER(email) = LOWER($1) RETURNING id',
      [targetEmail]
    );
    console.log(`-> Deletados ${delVerif.rowCount} registros de email_verifications.`);
  }

  if (userRes.rows.length > 0) {
    const userId = userRes.rows[0].id;
    await pool.query('DELETE FROM user_security_audit WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_notifications WHERE user_id = $1', [userId]);
    const delUser = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [userId]);
    console.log(`-> Deletado usuário ${delUser.rows[0].email} (${delUser.rows[0].id}) de users.`);
  } else {
    console.log('-> Nenhum registro encontrado na tabela users para este e-mail.');
  }

  await pool.end();
}

main().catch(console.error);

