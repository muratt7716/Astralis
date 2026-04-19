-- ########################################################
-- RLS FIX — Tüm tabloların güvenlik politikalarını düzelt
-- Bu dosyayı Supabase SQL Editor'de çalıştır
-- ########################################################

-- ========================================================
-- 1. PROFILES — Kayıt sırasında INSERT hatası düzeltmesi
-- ========================================================
-- Eski politikayı kaldır (ALL = SELECT+INSERT+UPDATE+DELETE tek politika)
DROP POLICY IF EXISTS "Profiles: users can view/update own" ON public.profiles;

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Profiles: select own"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Profiles: update own"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Kullanıcılar kendi profillerini oluşturabilir (kayıt sırasında)
CREATE POLICY "Profiles: insert own"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Servis rolü (supabaseAdmin) tam erişim — API route'lar için
DROP POLICY IF EXISTS "Profiles: service role full access" ON public.profiles;
CREATE POLICY "Profiles: service role full access"
ON public.profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ========================================================
-- 2. CONVERSATIONS — Tam CRUD erişimi
-- ========================================================
DROP POLICY IF EXISTS "Conversations: users can manage own" ON public.conversations;

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

DROP POLICY IF EXISTS "Conversations: service role full access" ON public.conversations;
CREATE POLICY "Conversations: service role full access"
ON public.conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ========================================================
-- 3. MESSAGES — SELECT, INSERT, UPDATE, DELETE
-- ========================================================
DROP POLICY IF EXISTS "Messages: users can view own" ON public.messages;
DROP POLICY IF EXISTS "Messages: users can insert own" ON public.messages;

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

DROP POLICY IF EXISTS "Messages: service role full access" ON public.messages;
CREATE POLICY "Messages: service role full access"
ON public.messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ========================================================
-- 4. MEMORIES — service_role erişimi ekle
-- ========================================================
DROP POLICY IF EXISTS "Memories: users can view own" ON public.memories;

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

DROP POLICY IF EXISTS "Memories: service role full access" ON public.memories;
CREATE POLICY "Memories: service role full access"
ON public.memories FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ========================================================
-- 5. INTERACTION_LOGS — service_role erişimi ekle
-- ========================================================
DROP POLICY IF EXISTS "Logs: users can view own" ON public.interaction_logs;
DROP POLICY IF EXISTS "Logs: users can insert own" ON public.interaction_logs;

CREATE POLICY "Logs: select own"
ON public.interaction_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Logs: insert own"
ON public.interaction_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Logs: service role full access" ON public.interaction_logs;
CREATE POLICY "Logs: service role full access"
ON public.interaction_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- ========================================================
-- 6. PROFIL OLUŞTURMA TRİGGER'I (kayıt sırasında otomatik profil)
-- ========================================================
-- Bu fonksiyon yeni kullanıcı oluşturulduğunda otomatik profil kaydı açar
-- SECURITY DEFINER ile çalışır, RLS bypass eder
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

-- Trigger'ı oluştur (varsa yeniden oluştur)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
