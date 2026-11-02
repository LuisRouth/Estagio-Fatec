// ====================================================================
// VERIFICADOR DE PIPELINE CI/CD (PRE-DEPLOY CHECK)
// Responsável: Guilherme (DevOps, IA & QA)
// ====================================================================

const { execSync } = require('child_process');

console.log('🔍 Executando verificação completa de pré-deploy (CI/CD)...\n');
execSync('node scripts/test_gemini.js', { stdio: 'inherit' });
execSync('node scripts/run_all_tests.js', { stdio: 'inherit' });
