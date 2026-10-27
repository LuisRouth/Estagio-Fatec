// ====================================================================
// SCRIPT DE CARGA DE DADOS (SEED) NO POSTGRESQL
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Uso: npm run db:seed
// ====================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runSeed() {
  console.log('--- INICIANDO SEED DO BANCO DE DADOS FATEC RIO CLARO ---');

  if (process.env.USE_MOCK_DB === 'true' && !process.env.DATABASE_URL) {
    console.log('[INFO] Modo Mock ativo (.env.local com USE_MOCK_DB=true).');
    console.log('[INFO] O banco em memória já é pré-carregado automaticamente pelo src/lib/db.ts.');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    console.log('[1/2] Conectando ao banco de dados...');
    const client = await pool.connect();

    console.log('[2/2] Inserindo dados iniciais (seed.sql)...');
    await client.query(sql);
    client.release();

    console.log('✓ Carga de dados (Seed) concluída com sucesso!');
  } catch (error) {
    console.error('✗ Erro ao executar seed:', error.message);
  } finally {
    await pool.end();
  }
}

runSeed();
