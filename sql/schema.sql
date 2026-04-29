-- ########################################################
-- VOIDSIGHT / ASTRALIS — TAM VERİTABANI ŞEMASI + RLS FIX
-- Supabase SQL Editor'de bu dosyayı tek seferde çalıştır
-- ########################################################

-- ========================================================
-- FAZ 3: pgvector Eklentisi (embedding sütunundan önce)
-- ========================================================
CREATE EXTENSION IF NOT EXISTS vector;


-- ========================================================
-- 1. PROFILES (Kullanıcı Kozmik ve Kişisel Profili)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  
  -- Doğum Verileri
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_city TEXT,
  birth_country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  
  -- Kişisel Bağlam
  gender TEXT,
  relationship_status TEXT,
  life_focus TEXT,
  
  -- Kozmik Özet
  sun_sign TEXT,
  rising_sign TEXT,
  moon_sign TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eksik sütunları ekle (varsa atla)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "selected_guide_id" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'tr';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "daily_horoscope" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "is_premium" BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_chart_summary JSONB DEFAULT NULL;

-- Premium / Ödeme Alanları
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Lemon Squeezy (eski — geriye uyumluluk)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lemon_squeezy_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lemon_squeezy_subscription_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;

-- Shopier (aktif ödeme sistemi)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS shopier_order_id TEXT;

COMMENT ON COLUMN public.profiles.subscription_type IS 'monthly | lifetime | NULL';
COMMENT ON COLUMN public.profiles.subscription_end_date IS 'monthly abonelik bitiş tarihi; lifetime için NULL';
COMMENT ON COLUMN public.profiles.shopier_order_id IS 'Son Shopier sipariş ID — idempotency kontrolü için';


-- ========================================================
-- 2. CONVERSATIONS (Sohbet Oturumları)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guide_id TEXT NOT NULL,
  context_summary JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAZ 4: Persona drift profili (her kullanıcı×rehber ikilisine özel ton kalibrasyonu)
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS drift_profile JSONB
  DEFAULT '{"tone_depth": 0.5, "humor_frequency": 0.5, "challenge_level": 0.3}'::jsonb;


-- ========================================================
-- 3. MESSAGES (Sohbet Geçmişi)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ========================================================
-- 4. MEMORIES (Mistik Hafıza — Karakter Bazlı)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guide_id TEXT NOT NULL DEFAULT 'melisa',
  category TEXT NOT NULL,
  fact TEXT NOT NULL,
  importance INTEGER DEFAULT 1,
  tags TEXT[],
  last_referenced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS guide_id TEXT NOT NULL DEFAULT 'melisa';

-- FAZ 3: Semantic memory — embedding kolonu ve importance float'a çeviri
ALTER TABLE public.memories ALTER COLUMN importance TYPE float4;
ALTER TABLE public.memories ADD COLUMN IF NOT EXISTS embedding vector(768);


-- ========================================================
-- 5. INTERACTION_LOGS (Kullanıcı Davranış Analizi)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.interaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interaction_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;


-- ========================================================
-- 6. CONVERSATION_TOPICS (FAZ 4 — Konuşma Graf)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.conversation_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guide_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, guide_id, topic)
);


-- ########################################################
-- GÜVENLİK AYARLARI (RLS) — GÜNCEL & EKSİKSİZ
-- ########################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_topics ENABLE ROW LEVEL SECURITY;


-- ── PROFILES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Profiles: users can view/update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: service role full access" ON public.profiles;

CREATE POLICY "Profiles: select own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles: insert own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: service role full access"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── CONVERSATIONS ─────────────────────────────────────────
DROP POLICY IF EXISTS "Conversations: users can manage own" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: select own" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: insert own" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: update own" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: delete own" ON public.conversations;
DROP POLICY IF EXISTS "Conversations: service role full access" ON public.conversations;

CREATE POLICY "Conversations: select own"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Conversations: insert own"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Conversations: update own"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Conversations: delete own"
  ON public.conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Conversations: service role full access"
  ON public.conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── MESSAGES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Messages: users can view own" ON public.messages;
DROP POLICY IF EXISTS "Messages: users can insert own" ON public.messages;
DROP POLICY IF EXISTS "Messages: select own" ON public.messages;
DROP POLICY IF EXISTS "Messages: insert own" ON public.messages;
DROP POLICY IF EXISTS "Messages: service role full access" ON public.messages;

CREATE POLICY "Messages: select own"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Messages: insert own"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
  );

CREATE POLICY "Messages: service role full access"
  ON public.messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── MEMORIES ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Memories: users can view own" ON public.memories;
DROP POLICY IF EXISTS "Memories: select own" ON public.memories;
DROP POLICY IF EXISTS "Memories: insert own" ON public.memories;
DROP POLICY IF EXISTS "Memories: update own" ON public.memories;
DROP POLICY IF EXISTS "Memories: service role full access" ON public.memories;

CREATE POLICY "Memories: select own"
  ON public.memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Memories: insert own"
  ON public.memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Memories: update own"
  ON public.memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Memories: service role full access"
  ON public.memories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── INTERACTION_LOGS ──────────────────────────────────────
DROP POLICY IF EXISTS "Logs: users can view own" ON public.interaction_logs;
DROP POLICY IF EXISTS "Logs: users can insert own" ON public.interaction_logs;
DROP POLICY IF EXISTS "Logs: select own" ON public.interaction_logs;
DROP POLICY IF EXISTS "Logs: insert own" ON public.interaction_logs;
DROP POLICY IF EXISTS "Logs: service role full access" ON public.interaction_logs;

CREATE POLICY "Logs: select own"
  ON public.interaction_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Logs: insert own"
  ON public.interaction_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Logs: service role full access"
  ON public.interaction_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ── CONVERSATION_TOPICS ───────────────────────────────────
DROP POLICY IF EXISTS "Topics: select own" ON public.conversation_topics;
DROP POLICY IF EXISTS "Topics: service role full access" ON public.conversation_topics;

CREATE POLICY "Topics: select own"
  ON public.conversation_topics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Topics: service role full access"
  ON public.conversation_topics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ########################################################
-- PERFORMANS İNDEXLERİ
-- ########################################################

CREATE INDEX IF NOT EXISTS idx_conversations_user_guide
  ON public.conversations(user_id, guide_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_time
  ON public.messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_memories_user_guide
  ON public.memories(user_id, guide_id);

CREATE INDEX IF NOT EXISTS idx_interaction_logs_user
  ON public.interaction_logs(user_id, created_at DESC);

-- FAZ 3: pgvector IVFFlat kosinüs benzerliği indexi
CREATE INDEX IF NOT EXISTS memories_embedding_idx
  ON public.memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- FAZ 4: Conversation topics lookup
CREATE INDEX IF NOT EXISTS conversation_topics_user_guide_idx
  ON public.conversation_topics (user_id, guide_id);


-- ########################################################
-- KISITLAMALAR (CONSTRAINTS)
-- ########################################################

ALTER TABLE public.memories
  DROP CONSTRAINT IF EXISTS memories_user_guide_fact_unique;

ALTER TABLE public.memories
  ADD CONSTRAINT memories_user_guide_fact_unique
  UNIQUE (user_id, guide_id, fact);


-- ########################################################
-- RPC FONKSİYONLARI (FAZ 3 + FAZ 4)
-- ########################################################

-- FAZ 3: Semantic benzerlik araması (pgvector kosinüs mesafesi)
CREATE OR REPLACE FUNCTION search_memories_by_embedding(
  p_user_id uuid,
  p_guide_id text,
  p_embedding vector(768),
  p_limit int DEFAULT 5
)
RETURNS TABLE(category text, fact text, importance float4)
LANGUAGE sql
STABLE
AS $$
  SELECT category, fact, importance
  FROM memories
  WHERE user_id = p_user_id
    AND guide_id = p_guide_id
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;

-- FAZ 3: Memory decay — eski anıların önemi düşer, yeni referanslar önemi artırır
CREATE OR REPLACE FUNCTION decay_old_memories(
  p_threshold_date timestamptz,
  p_boost_date timestamptz
)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE memories
    SET importance = GREATEST(1, importance - 0.5)
    WHERE last_referenced_at < p_threshold_date;

  UPDATE memories
    SET importance = LEAST(5, importance + 0.2)
    WHERE last_referenced_at > p_boost_date;
$$;

-- FAZ 4: Konuşma konusu upsert (count increment)
CREATE OR REPLACE FUNCTION upsert_conversation_topic(
  p_user_id uuid,
  p_guide_id text,
  p_topic text
)
RETURNS void
LANGUAGE sql
AS $$
  INSERT INTO conversation_topics (user_id, guide_id, topic, message_count, last_seen_at)
  VALUES (p_user_id, p_guide_id, p_topic, 1, now())
  ON CONFLICT (user_id, guide_id, topic)
  DO UPDATE SET
    message_count = conversation_topics.message_count + 1,
    last_seen_at = now();
$$;


-- ########################################################
-- OTOMATİK PROFİL OLUŞTURMA TRİGGER'I
-- Yeni kullanıcı kayıt olduğunda profil kaydı otomatik açılır
-- SECURITY DEFINER: RLS'yi bypass eder, kayıt sırasında hata önler
-- ########################################################

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, birth_date)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Yeni Kullanıcı'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'birth_date')::DATE, '2000-01-01'::DATE)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ########################################################
-- 7. PWA_INSTALLS (Uygulama Yükleme Takibi)
-- Supabase SQL Editor'de ayrı çalıştırabilirsin.
-- ########################################################

CREATE TABLE IF NOT EXISTS public.pwa_installs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT
);

ALTER TABLE public.pwa_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PWA Installs: service role full access" ON public.pwa_installs;
CREATE POLICY "PWA Installs: service role full access"
  ON public.pwa_installs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pwa_installs_date
  ON public.pwa_installs(installed_at DESC);
