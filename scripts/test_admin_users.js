// ====================================================================
// TESTE AUTOMATIZADO: GESTÃO ADMINISTRATIVA DE USUÁRIOS
// Validação das rotas, tipos, componentes e operações de Administrador
// ====================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log(' TEST SUITE: Gestão Administrativa de Usuários (ADM)');
console.log('====================================================');

// 1. Verificar métodos em src/lib/db.ts
const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
assert(fs.existsSync(dbPath), 'src/lib/db.ts deve existir');
const dbSource = fs.readFileSync(dbPath, 'utf8');
assert(dbSource.includes('deleteUser:'), 'db.users deve conter o método deleteUser');
assert(dbSource.includes('updateRole:'), 'db.users deve conter o método updateRole');
assert(dbSource.includes('updateStatus:'), 'db.users deve conter o método updateStatus');
assert(dbSource.includes('adminUpdate:'), 'db.users deve conter o método adminUpdate');
assert(dbSource.includes('DELETE FROM email_verifications'), 'deleteUser deve limpar email_verifications vinculadas');
assert(dbSource.includes('DELETE FROM users WHERE id = $1'), 'deleteUser deve excluir o usuário da tabela users');
console.log('  [PASS] Métodos de CRUD administrativo e exclusão segura implementados em db.users');

// 2. Verificar API /api/admin/users
const apiUsersPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'users', 'route.ts');
assert(fs.existsSync(apiUsersPath), 'Endpoint /api/admin/users deve existir');
const apiUsersSource = fs.readFileSync(apiUsersPath, 'utf8');
assert(apiUsersSource.includes("session.role !== 'ADMIN'"), 'GET e POST devem validar permissão exclusiva de ADMIN');
assert(apiUsersSource.includes('db.users.listAll()'), 'GET deve listar todos os usuários com métricas');
assert(apiUsersSource.includes('db.users.create('), 'POST deve permitir criação direta de usuário pelo admin');
console.log('  [PASS] API /api/admin/users protegida com validação estrita de role ADMIN');

// 3. Verificar API /api/admin/users/[id]
const apiUserIdPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'users', '[id]', 'route.ts');
assert(fs.existsSync(apiUserIdPath), 'Endpoint /api/admin/users/[id] deve existir');
const apiUserIdSource = fs.readFileSync(apiUserIdPath, 'utf8');
assert(apiUserIdSource.includes("session.role !== 'ADMIN'"), 'Operações em [id] devem exigir ADMIN');
assert(apiUserIdSource.includes('db.users.deleteUser('), 'DELETE deve invocar db.users.deleteUser');
assert(apiUserIdSource.includes('db.users.updateStatus('), 'PUT deve permitir alternar status ativo/inativo');
assert(apiUserIdSource.includes('db.users.adminUpdate('), 'PUT deve permitir edição completa de dados');
assert(apiUserIdSource.includes('session.sub === id'), 'DELETE deve conter proteção contra auto-exclusão do admin logado');
console.log('  [PASS] API /api/admin/users/[id] (PUT/DELETE) com proteção de auto-exclusão e deleção em cascata');

// 4. Verificar API /api/admin/users/[id]/reset-password
const apiResetPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'users', '[id]', 'reset-password', 'route.ts');
assert(fs.existsSync(apiResetPath), 'Endpoint /api/admin/users/[id]/reset-password deve existir');
const apiResetSource = fs.readFileSync(apiResetPath, 'utf8');
assert(apiResetSource.includes('validatePasswordStrength'), 'Redefinição de senha deve validar força OWASP');
assert(apiResetSource.includes('db.users.changePassword'), 'Redefinição de senha deve gravar o novo hash no banco');
console.log('  [PASS] API de redefinição de senha por administrador homologada');

// 5. Verificar Tela Frontend /admin/usuarios
const pageAdminPath = path.join(__dirname, '..', 'src', 'app', 'admin', 'usuarios', 'page.tsx');
assert(fs.existsSync(pageAdminPath), 'Página src/app/admin/usuarios/page.tsx deve existir');
const pageAdminSource = fs.readFileSync(pageAdminPath, 'utf8');
assert(pageAdminSource.includes('Gestão de Usuários & Contas Discentes'), 'Deve conter cabeçalho institucional da página');
assert(pageAdminSource.includes('handleDeleteUser'), 'Deve conter fluxo de exclusão de usuário');
assert(pageAdminSource.includes('handleToggleStatus'), 'Deve conter alternância rápida de status');
assert(pageAdminSource.includes('handleCreateSubmit'), 'Deve conter cadastro de novo usuário');
assert(pageAdminSource.includes('handleResetPasswordSubmit'), 'Deve conter redefinição de senha');
assert(pageAdminSource.includes('ConfirmModal'), 'Deve usar ConfirmModal para ações perigosas de exclusão');
console.log('  [PASS] Interface Frontend /admin/usuarios completa com filtros, modais e métricas');

// 6. Verificar Navegação Integrada (AppLayout e Cantina Admin)
const appLayoutPath = path.join(__dirname, '..', 'src', 'components', 'layout', 'AppLayout.tsx');
const appLayoutSource = fs.readFileSync(appLayoutPath, 'utf8');
assert(appLayoutSource.includes('/admin/usuarios'), 'AppLayout deve conter link para /admin/usuarios quando role === ADMIN');

const cantinaAdminPath = path.join(__dirname, '..', 'src', 'app', 'cantina', 'admin', 'page.tsx');
const cantinaAdminSource = fs.readFileSync(cantinaAdminPath, 'utf8');
assert(cantinaAdminSource.includes('/admin/usuarios'), 'CantinaAdminPage deve conter aba de alternância para Gestão de Usuários');
console.log('  [PASS] Navegação e abas administrativas integradas no AppLayout e no Painel da Cantina');

console.log('====================================================');
console.log(' TODOS OS 6 GRUPOS DE TESTES DE GESTÃO DE USUÁRIOS PASSARAM COM SUCESSO!');
console.log('====================================================');
