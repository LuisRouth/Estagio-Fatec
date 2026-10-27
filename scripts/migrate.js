// ====================================================================
// SCRIPT DE MIGRAÇÃO DO BANCO DE DADOS POSTGRESQL
// Responsável: Cesar (Backend, Banco de Dados & Segurança)
// Uso: npm run db:migrate
// ====================================================================

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('--- INICIANDO MIGRAÇÃO DO BANCO DE DADOS FATEC RIO CLARO ---');

  if (process.env.USE_MOCK_DB === 'true' && !process.env.DATABASE_URL) {
    console.log('[INFO] Modo Mock ativo (.env.local com USE_MOCK_DB=true).');
    console.log('[INFO] A aplicação funciona com banco em memória para desenvolvimento.');
    console.log('[INFO] Para migrar banco real, configure DATABASE_URL com a URL do PostgreSQL/Supabase.');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[1/2] Conectando ao banco de dados...');
    const client = await pool.connect();

    console.log('[2/2] Executando DDL (schema.sql)...');
    await client.query(sql);
    client.release();

    console.log('✓ Migração concluída com sucesso! Tabelas, índices e triggers criados.');
  } catch (error) {
    console.error('✗ Erro ao executar migração:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
