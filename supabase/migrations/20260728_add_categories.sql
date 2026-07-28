-- Migrasi: Menambahkan Tabel Kategori (Hybrid Category)
-- Berdasarkan keputusan arsitektur Phase 1 (Sprint 3)

-- 1. Buat tabel categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#FFB5C5',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name) -- Mencegah kategori dengan nama yang sama per user
);

-- 2. Aktifkan RLS untuk categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own categories"
ON public.categories FOR ALL
USING (auth.uid() = user_id);

-- 3. Modifikasi tabel tasks
-- Mengubah kolom 'category' (TEXT) menjadi 'category_id' (UUID FK)
-- Karena ini database baru (belum ada production data kritis), kita drop kolom lama
ALTER TABLE public.tasks DROP COLUMN IF EXISTS category;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
