-- ====================================================================
-- BANCO DE DADOS: PORTAL INTEGRADO FATEC RIO CLARO
-- DISCIPLINA: Estágio Curricular Supervisionado (Prof. Orlando)
-- RESPONSÁVEL: Cesar (Backend, Banco de Dados & Segurança)
-- SPRINT 1: Modelagem Relacional & DDL PostgreSQL
-- ====================================================================

-- Habilitar extensão para geração de UUIDv4 criptograficamente seguro
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- TIPOS ENUMERADOS (ENUMS)
-- ====================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ALUNO', 'CA_MEMBRO', 'PROFESSOR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE course_type AS ENUM ('IA', 'ESG');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_category AS ENUM ('DOCE', 'SALGADO', 'BEBIDA', 'CONGELADO', 'OUTRO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'EM_ANALISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE announcement_priority AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- TABELA 1: USUÁRIOS (Discentes, Membros do CA e Docentes)
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    ra VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'ALUNO',
    course course_type NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 6),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_course_sem ON users(course, semester);

-- ====================================================================
-- TABELA 2: PRODUTOS DA CANTINA (HONEST MARKET)
-- ====================================================================
CREATE TABLE IF NOT EXISTS canteen_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    category item_category NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_alert INTEGER NOT NULL DEFAULT 5,
    image_url TEXT,
    barcode VARCHAR(50),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON canteen_products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON canteen_products(is_available);

-- ====================================================================
-- TABELA 3: TRANSAÇÕES DA CANTINA (HISTÓRICO & CONTROLE PIX)
-- ====================================================================
CREATE TABLE IF NOT EXISTS canteen_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount > 0),
    status transaction_status NOT NULL DEFAULT 'PENDENTE',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'PIX',
    pix_copy_paste TEXT,
    pix_qr_code_url TEXT,
    pix_end_to_end_id VARCHAR(100),
    proof_image_url TEXT,
    notes TEXT,
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trans_user ON canteen_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_trans_status ON canteen_transactions(status);
CREATE INDEX IF NOT EXISTS idx_trans_created ON canteen_transactions(created_at DESC);

-- ====================================================================
-- TABELA 4: ITENS DA TRANSAÇÃO DA CANTINA
-- ====================================================================
CREATE TABLE IF NOT EXISTS canteen_transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES canteen_transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES canteen_products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trans_items_tx ON canteen_transaction_items(transaction_id);

-- ====================================================================
-- TABELA 5: SUGESTÕES DE PRODUTOS PARA A CANTINA
-- ====================================================================
CREATE TABLE IF NOT EXISTS canteen_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(120) NOT NULL,
    brand VARCHAR(100),
    category item_category,
    reason TEXT,
    votes_count INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'EM_ANALISE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- TABELA 6: REPOSITÓRIO ACADÊMICO & VITRINE DE PROJETOS/TCC
-- ====================================================================
CREATE TABLE IF NOT EXISTS academic_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(120) NOT NULL,
    course course_type NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 6),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    material_type VARCHAR(50) NOT NULL DEFAULT 'SLIDE', -- 'SLIDE', 'APOSTILA', 'CODIGO', 'TCC', 'DATASET'
    file_url TEXT NOT NULL,
    github_url TEXT,
    tags VARCHAR(255),
    download_count INTEGER NOT NULL DEFAULT 0,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_course_sem ON academic_materials(course, semester);
CREATE INDEX IF NOT EXISTS idx_materials_subject ON academic_materials(subject);

-- ====================================================================
-- TABELA 7: COMUNICAÇÃO & AVISOS (CENTRO ACADÊMICO E COORDENAÇÃO)
-- ====================================================================
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority announcement_priority NOT NULL DEFAULT 'MEDIA',
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_course course_type, -- NULL = Todos os cursos
    target_semester INTEGER,  -- NULL = Todos os semestres
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned, created_at DESC);

-- ====================================================================
-- TABELA 8: AUDITORIA DE SEGURANÇA E CONFORMIDADE
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- ====================================================================
-- TRIGGER AUTOMÁTICO: ATUALIZAÇÃO DO CAMPO UPDATED_AT
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON canteen_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON canteen_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_materials_updated_at BEFORE UPDATE ON academic_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
