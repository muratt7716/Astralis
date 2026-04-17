-- ########################################################
-- VOIDSIGHT MİSTİK REHBER - TAM VE GÜVENLİ VERİTABANI ŞEMASI
-- ########################################################

-- 1. PROFILES (Kullanıcı Kozmik ve Kişisel Profili)
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

-- EĞER TABLO ZATEN VARSA EKSİK SÜTUNLARI EKLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "selected_guide_id" TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'tr';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS "daily_horoscope" JSONB DEFAULT '{}'::jsonb;

-- 2. CONVERSATIONS (Sohbet Oturumları)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  guide_id TEXT NOT NULL,
  context_summary TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MESSAGES (Sohbet Geçmişi)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')), 
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEMORIES (Mistik Hafıza)
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  fact TEXT NOT NULL,
  importance INTEGER DEFAULT 1,
  tags TEXT[],
  last_referenced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERACTION_LOGS (Kullanıcı Davranış Analizi)
CREATE TABLE IF NOT EXISTS public.interaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ########################################################
-- GÜVENLİK AYARLARI (RLS)
-- ########################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;

-- Politikaları Sıfırla ve Yeniden Kur (Idempotent)
DROP POLICY IF EXISTS "Profiles: users can view/update own" ON public.profiles;
CREATE POLICY "Profiles: users can view/update own" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Conversations: users can manage own" ON public.conversations;
CREATE POLICY "Conversations: users can manage own" ON public.conversations FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Messages: users can view own" ON public.messages;
CREATE POLICY "Messages: users can view own" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Messages: users can insert own" ON public.messages;
CREATE POLICY "Messages: users can insert own" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Memories: users can view own" ON public.memories;
CREATE POLICY "Memories: users can view own" ON public.memories FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs: users can view own" ON public.interaction_logs;
CREATE POLICY "Logs: users can view own" ON public.interaction_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs: users can insert own" ON public.interaction_logs;
CREATE POLICY "Logs: users can insert own" ON public.interaction_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
