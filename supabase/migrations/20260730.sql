-- Migrasi: Menambahkan Tabel Attachments dan Konfigurasi Storage Bucket

-- 1. Membuat Storage Bucket 'task_attachments' (Private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('task_attachments', 'task_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Mengaktifkan RLS untuk storage.objects pada bucket ini
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task_attachments' AND auth.uid() = owner);

CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task_attachments' AND auth.uid() = owner);

CREATE POLICY "Users can update their own attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'task_attachments' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'task_attachments' AND auth.uid() = owner);

-- 3. Membuat tabel public.attachments (Pastikan bersih)
DROP TABLE IF EXISTS public.attachments CASCADE;

CREATE TABLE public.attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Mengaktifkan RLS untuk tabel attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own attachments"
ON public.attachments FOR ALL
USING (auth.uid() = user_id);
