-- ==============================================================================
-- SCHEMA MIGRATION: PERFIL, SEGURANÇA, ACESSIBILIDADE E AUDITORIA (SPRINT 3 / FATEC RC)
-- ==============================================================================

-- 1. Ampliação da tabela users com e-mail de recuperação e flags de verificação
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_email VARCHAR(180);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- 2. Tabela de Verificação de E-mails com Código OTP e Link Token
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(180) NOT NULL,
  recovery_email VARCHAR(180),
  verification_code VARCHAR(6) NOT NULL,
  token VARCHAR(64) NOT NULL,
  purpose VARCHAR(40) NOT NULL DEFAULT 'ACCOUNT_ACTIVATION', -- 'ACCOUNT_ACTIVATION', 'EMAIL_CHANGE'
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verif_lookup 
ON email_verifications (email, verification_code, expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verif_recov 
ON email_verifications (recovery_email, verification_code);

-- 3. Tabela de Trilha de Auditoria de Segurança e Alterações de Perfil
CREATE TABLE IF NOT EXISTS user_security_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL, -- 'PASSWORD_CHANGE', 'PRIMARY_EMAIL_CHANGE', 'RECOVERY_EMAIL_CHANGE', 'PROFILE_UPDATE'
  field_name VARCHAR(80) NOT NULL,
  old_value_masked TEXT,
  new_value_masked TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user_time 
ON user_security_audit (user_id, created_at DESC);

-- 4. Tabela de Preferências de Acessibilidade & Interface (Persistência por Login)
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
  font_size VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'normal', 'comfort', 'large'
  reduce_motion BOOLEAN NOT NULL DEFAULT FALSE,
  feed_filter VARCHAR(20) NOT NULL DEFAULT 'my_course', -- 'my_course', 'all'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Ampliação de announcements para segmentação por semestre
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_semester INTEGER CHECK (target_semester BETWEEN 1 AND 6);

-- 6. Tabela de Notificações e Entrega Direcionada de Comunicados aos Usuários
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_announcement UNIQUE (user_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notif_feed 
ON user_notifications (user_id, is_read, created_at DESC);

