-- ══════════════════════════════════════════════════════════════
-- GEOSISTE v9 — SCHEMA SUPABASE COMPLET
-- Exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ─── UTILISATEURS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  pass TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO users (name, email, pass, role) VALUES ('Admin', 'admin@geosiste.com', 'geosiste2024', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ─── PROSPECTS / CRM ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospects (
  id BIGSERIAL PRIMARY KEY,
  nm TEXT NOT NULL,
  co TEXT DEFAULT 'FR',
  em TEXT DEFAULT '',
  wa TEXT DEFAULT '',
  ig TEXT DEFAULT '',
  st TEXT DEFAULT 'new',
  tg TEXT[] DEFAULT '{}',
  sc INT DEFAULT 50,
  ca NUMERIC DEFAULT 0,
  nt TEXT DEFAULT '',
  ints JSONB DEFAULT '[]',
  notes_vocales JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by BIGINT REFERENCES users(id)
);

-- ─── HISTORIQUE ENVOIS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS send_history (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT REFERENCES prospects(id),
  prospect_name TEXT,
  channel TEXT NOT NULL,
  message TEXT,
  template TEXT,
  email_account TEXT,
  ig_account TEXT,
  user_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RELANCES / FOLLOWUPS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS followups (
  id BIGSERIAL PRIMARY KEY,
  prospect_id BIGINT REFERENCES prospects(id),
  prospect_name TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  note TEXT DEFAULT '',
  channel TEXT DEFAULT 'email',
  done BOOLEAN DEFAULT FALSE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TEMPLATES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'email',
  lang TEXT DEFAULT 'fr',
  body TEXT NOT NULL,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CA MENSUEL ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ca_monthly (
  id BIGSERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year INT NOT NULL,
  ca NUMERIC DEFAULT 0,
  UNIQUE(month, year)
);

-- ─── COMPTES EMAIL ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_accounts (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  label TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  user_id BIGINT REFERENCES users(id)
);

-- ─── COMPTES INSTAGRAM ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS ig_accounts (
  id BIGSERIAL PRIMARY KEY,
  handle TEXT NOT NULL,
  label TEXT DEFAULT '',
  active BOOLEAN DEFAULT TRUE,
  user_id BIGINT REFERENCES users(id)
);

-- ─── NOTIFICATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  type TEXT DEFAULT 'info',
  msg TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CONFIG ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- ─── RLS POLICIES ────────────────────────────────────────────
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE send_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ig_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

-- Policies ouvertes (à resserrer en production)
CREATE POLICY "allow_all" ON prospects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON send_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON followups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON email_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ig_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON ca_monthly FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON config FOR ALL USING (true) WITH CHECK (true);

-- ─── INDEX ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(st);
CREATE INDEX IF NOT EXISTS idx_prospects_country ON prospects(co);
CREATE INDEX IF NOT EXISTS idx_send_history_prospect ON send_history(prospect_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ══════════════════════════════════════════════════════════════
-- TERMINÉ — Votre base Geosiste v9 est prête !
-- ══════════════════════════════════════════════════════════════
