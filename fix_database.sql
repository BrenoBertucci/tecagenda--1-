-- ============================================
-- FIX COMPLETO DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE (para testar)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view active users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Clients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Technicians can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Clients can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update appointment status" ON appointments;
DROP POLICY IF EXISTS "Clients can review own appointments" ON reviews;
DROP POLICY IF EXISTS "All can view reviews" ON reviews;
DROP POLICY IF EXISTS "Technicians can reply to reviews" ON reviews;
DROP POLICY IF EXISTS "Technicians can manage own schedule" ON schedules;
DROP POLICY IF EXISTS "Clients can view technician schedules" ON schedules;
DROP POLICY IF EXISTS "Public Access" ON users;
DROP POLICY IF EXISTS "Public Access" ON appointments;
DROP POLICY IF EXISTS "Public Access" ON reviews;
DROP POLICY IF EXISTS "Public Access" ON schedules;

-- 3. GARANTIR QUE AS COLUNAS EXISTAM
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE schedules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. CRIAR/RECRIAR FUNÇÃO DE TRIGGER PARA CRIAR USUÁRIO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, avatar_url, created_at, updated_at)
  VALUES (
    new.id::text,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'CLIENT'),
    new.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RECRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. CRIAR VIEWS (se não existirem)
CREATE OR REPLACE VIEW appointment_details AS
SELECT 
  a.id,
  a.client_id,
  COALESCE(c.name, 'Cliente Desconhecido') as client_name,
  a.tech_id,
  COALESCE(t.name, 'Técnico Desconhecido') as tech_name,
  a.date,
  a.time,
  a.device_model,
  a.issue_description,
  a.status,
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN users c ON a.client_id = c.id AND c.deleted_at IS NULL
LEFT JOIN users t ON a.tech_id = t.id AND t.deleted_at IS NULL
WHERE a.deleted_at IS NULL;

CREATE OR REPLACE VIEW technician_reviews AS
SELECT 
  r.id,
  r.client_id,
  COALESCE(c.name, 'Cliente Desconhecido') as client_name,
  r.tech_id,
  COALESCE(t.name, 'Técnico Desconhecido') as tech_name,
  r.rating,
  r.comment,
  r.tags,
  r.reply_text,
  r.reply_at,
  r.created_at
FROM reviews r
LEFT JOIN users c ON r.client_id = c.id AND c.deleted_at IS NULL
LEFT JOIN users t ON r.tech_id = t.id AND t.deleted_at IS NULL
WHERE r.deleted_at IS NULL;

-- 7. GARANTIR CONSTRAINT DE EMAIL ÚNICO
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- PRONTO! Agora você pode testar o registro e login sem RLS
-- Quando tudo estiver funcionando, podemos reativar o RLS com políticas corretas
