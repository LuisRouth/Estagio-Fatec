-- ====================================================================
-- OTIMIZAÇÃO DE BANCO DE DADOS & ÍNDICES DE ALTA PERFORMANCE (SPRINT 3)
-- Disciplina: Estágio Curricular Supervisionado (Prof. Orlando)
-- Responsável: Cesar (Backend, Banco de Dados & Segurança)
-- Banco: PostgreSQL 15+ / Supabase
-- ====================================================================

-- 1. ÍNDICE COMPOSTO: CONSULTAS ANALÍTICAS FINANCEIRAS POR STATUS E DATA
-- Usado por: GET /api/ca/analytics/financial
-- Otimização: Acelera agregação de faturamento (SUM, COUNT) por período sem Sequential Scan.
CREATE INDEX IF NOT EXISTS idx_trans_status_created 
ON canteen_transactions(status, created_at DESC);

-- 2. ÍNDICE COMPOSTO: HISTÓRICO DISCENTE E EXTRATO COM ORDENAÇÃO TEMPORAL
-- Usado por: GET /api/canteen/history e GET /api/canteen/transactions
-- Otimização: Evita ordenação em memória (Sort Method: quicksort) para os extratos pessoais.
CREATE INDEX IF NOT EXISTS idx_trans_user_created 
ON canteen_transactions(user_id, created_at DESC);

-- 3. ÍNDICE COMPOSTO DE COBERTURA: RANKING DE PRODUTOS MAIS VENDIDOS
-- Usado por: GET /api/ca/analytics/products
-- Otimização: Permite Index-Only Scan para cálculo de unidades vendidas e subtotal por produto.
CREATE INDEX IF NOT EXISTS idx_trans_items_prod_qty_subtotal 
ON canteen_transaction_items(product_id, quantity, unit_price);

-- 4. ÍNDICE PARCIAL: ALERTA DE ESTOQUE BAIXO E CRÍTICO
-- Usado por: GET /api/canteen/products e controle em tempo real
-- Otimização: Indexa exclusivamente produtos ativos com saldo em alerta, reduzindo o tamanho do índice.
CREATE INDEX IF NOT EXISTS idx_products_low_stock_alert 
ON canteen_products(current_stock, min_stock_alert) 
WHERE is_available = TRUE;

-- 5. ÍNDICE GIN FULL-TEXT SEARCH: BUSCA AVANÇADA NO REPOSITÓRIO ACADÊMICO E TCC
-- Usado por: GET /api/materials?search=...
-- Otimização: Substitui buscas lentas com operador ILIKE '%...%' por busca vetorial lexematizada.
CREATE INDEX IF NOT EXISTS idx_materials_fulltext_search_gin 
ON academic_materials 
USING gin (to_tsvector('portuguese', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(subject, '') || ' ' || coalesce(tags, '')));

-- 6. ÍNDICE COMPOSTO: AUDITORIA DE EVENTOS CRÍTICOS DE SEGURANÇA
-- Usado por: GET /api/ca/analytics/audit
-- Otimização: Acelera filtragem de incidentes de segurança (ex: DELETED, BRUTE_FORCE, STOCK_ADJUSTED).
CREATE INDEX IF NOT EXISTS idx_audit_action_created 
ON audit_logs(action, created_at DESC);

-- ====================================================================
-- ESTATÍSTICAS E REINDEXAÇÃO DO POSTGRESQL
-- ====================================================================
ANALYZE canteen_transactions;
ANALYZE canteen_transaction_items;
ANALYZE canteen_products;
ANALYZE academic_materials;
ANALYZE audit_logs;

