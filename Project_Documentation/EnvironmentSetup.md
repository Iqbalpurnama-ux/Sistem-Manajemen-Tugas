# Environment Setup Guide (Project BesokAja)

Panduan lengkap untuk menyiapkan *development environment* dari nol hingga bisa menjalankan aplikasi di localhost.

---

## 1. Prerequisites (Persyaratan Sistem)

| Software | Versi Minimum | Cara Install |
|---|---|---|
| **Node.js** | v18.17+ (LTS) | [nodejs.org](https://nodejs.org/) atau `nvm install --lts` |
| **npm** | v9+ | Bundled dengan Node.js |
| **Git** | v2.30+ | [git-scm.com](https://git-scm.com/) |
| **VS Code** | Terbaru | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Browser** | Chrome/Edge (DevTools) | Untuk testing responsif |

### VS Code Extensions (Direkomendasikan)

| Extension | Fungsi |
|---|---|
| **Tailwind CSS IntelliSense** | Autocomplete class Tailwind + CSS variables |
| **ESLint** | Linting TypeScript/React |
| **Prettier** | Code formatting |
| **Mermaid Markdown** | Preview diagram Mermaid di markdown |
| **Supabase** | Integrasi langsung ke Supabase dashboard |

---

## 2. Clone & Install

```bash
# 1. Clone repository
git clone <repo_url>
cd besokaja

# 2. Install dependencies
npm install

# 3. Verifikasi instalasi
npm run dev
# Buka http://localhost:3000 — harus muncul halaman default
```

---

## 3. Environment Variables

Buat file `.env.local` di root project. **JANGAN** commit file ini ke Git (sudah ada di `.gitignore`).

```env
# ============================================
# SUPABASE CONFIG
# ============================================

# URL project Supabase Anda (ditemukan di Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co

# Anon Key — aman untuk di-expose ke client (dilindungi RLS)
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# Service Role Key — RAHASIA! Hanya digunakan di server/Edge Functions
# Bypass RLS — JANGAN pernah expose ke client
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SECRET_SERVICE_ROLE_KEY]

# ============================================
# RESEND EMAIL CONFIG (untuk notifikasi)
# ============================================

# API Key dari dashboard Resend (resend.com)
RESEND_API_KEY=re_[YOUR_RESEND_KEY]

# URL publik aplikasi (untuk link di email)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# OPTIONAL — DEVELOPMENT ONLY
# ============================================

# Jika menggunakan Supabase Local (docker)
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[LOCAL_ANON_KEY]
```

### Cara Mendapatkan Kunci Supabase

1. Buka [app.supabase.com](https://app.supabase.com/).
2. Pilih project Anda (atau buat baru).
3. Navigasi ke **Settings → API**.
4. Salin:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### Cara Mendapatkan Kunci Resend

1. Buka [resend.com](https://resend.com/) dan daftar/masuk.
2. Navigasi ke **API Keys** → **Create API Key**.
3. Salin key yang dimulai dengan `re_` → `RESEND_API_KEY`.
4. (Opsional) Setup domain kustom di Resend untuk SPF/DKIM agar email tidak masuk spam.

---

## 4. Setup Database (Supabase)

### Opsi A: Supabase Cloud (Direkomendasikan untuk development cepat)

1. Buka project Supabase → **SQL Editor**.
2. Salin seluruh isi file `supabase/schema.sql`.
3. Jalankan (Execute). Ini akan membuat:
   - Custom Types (`task_priority`, `task_status`)
   - Tabel `profiles`, `tasks`, `attachments`, `notifications_log`
   - RLS Policies untuk semua tabel
   - Triggers (`update_modified_column`, `handle_new_user`)
4. Verifikasi: Buka **Table Editor** — pastikan 4 tabel sudah terbuat.

### Opsi B: Supabase Local (Docker)

```bash
# Pastikan Docker Desktop sudah berjalan
npx supabase init    # Hanya sekali
npx supabase start   # Jalankan Supabase lokal

# Output akan menampilkan URL dan Keys lokal
# Gunakan ini di .env.local untuk development
```

### Setup Supabase Auth

1. Buka **Authentication → Providers** di Supabase Dashboard.
2. Aktifkan **Email** (Magic Link sudah aktif by default).
3. Untuk Google OAuth:
   - Buat OAuth credentials di [Google Cloud Console](https://console.cloud.google.com/).
   - Masukkan **Client ID** dan **Client Secret** di Supabase → Authentication → Providers → Google.
   - Tambahkan redirect URL: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`.

### Setup Supabase Storage

1. Buka **Storage** di Supabase Dashboard.
2. Buat bucket baru: **`task_files`** (Private).
3. Tambahkan RLS policy pada bucket:

```sql
-- Hanya authenticated users yang bisa upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task_files');

-- Hanya pemilik file yang bisa download (via task ownership)
CREATE POLICY "Users can download own task files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task_files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 5. Menjalankan Development Server

```bash
# Jalankan Next.js dev server
npm run dev

# Buka di browser:
# http://localhost:3000          → Landing page
# http://localhost:3000/login    → Halaman login
# http://localhost:3000/dashboard → Dashboard (perlu login)
```

### Testing Responsif

Gunakan Chrome DevTools (F12) → Toggle Device Toolbar:
- **iPhone SE:** 375 x 667px
- **iPhone 14:** 390 x 844px
- **iPad:** 768 x 1024px
- **Desktop:** 1280 x 800px
- **Wide:** 1440 x 900px

---

## 6. Troubleshooting Umum

### ❌ Error: "Invalid API Key" saat login
**Solusi:** Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di `.env.local` benar. Restart dev server setelah mengubah `.env.local`.

### ❌ Error: "User not found in profiles"
**Solusi:** Trigger `handle_new_user` mungkin belum dijalankan. Buka SQL Editor Supabase dan jalankan bagian trigger dari `schema.sql`.

### ❌ Error: "RLS policy violation"
**Solusi:** Pastikan semua RLS policies sudah dijalankan. Cek di Supabase Dashboard → Authentication → Policies.

### ❌ Halaman login redirect loop
**Solusi:** Cek `middleware.ts` — pastikan path `/login` dan `/auth/*` tidak termasuk dalam matcher yang di-protect.

### ❌ Font Baloo 2 tidak muncul
**Solusi:** Pastikan `layout.tsx` mengimport font dari `next/font/google` dan CSS variable `--font-heading` terdaftar.

### ❌ Shadow Claymorphism tidak terlihat
**Solusi:** Cek `globals.css` — pastikan CSS variables `--clay-shadow-light` dan `--clay-shadow-dark` terdefinisi di `:root`. Pastikan `@theme inline` block di CSS memiliki `--shadow-clay`.

### ❌ npm run build gagal (TypeScript errors)
**Solusi:** Jalankan `npx tsc --noEmit` untuk melihat error spesifik. Perbaiki sebelum build.
