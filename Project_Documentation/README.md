# Project OUTBREAK: Sistem Informasi Manajemen Tugas Terintegrasi Berbasis Web

## Ringkasan Project
Project OUTBREAK adalah aplikasi manajemen tugas berbasis web yang dirancang khusus untuk memenuhi kebutuhan produktivitas personal tingkat tinggi. Sistem ini menggabungkan manajemen tugas tradisional dengan integrasi *cloud storage* (Supabase Storage) dan notifikasi cerdas otomatis. Dibangun dengan pendekatan *Serverless First*, aplikasi ini sangat *scalable*, aman, dan siap untuk berevolusi menjadi produk SaaS (Software as a Service) skala besar (Enterprise Ready).

## Stack Teknologi
- **Framework Frontend/Backend:** Next.js (App Router)
- **Bahasa Pemrograman:** TypeScript
- **Styling & UI:** TailwindCSS, shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
- **Storage:** Supabase Storage
- **Automasi (Cron):** Supabase `pg_cron` & Edge Functions (menggantikan Vercel Cron untuk efisiensi batas tier gratis)
- **Email Service:** Resend Email
- **Deployment:** Vercel

## Struktur Folder (Berdasarkan Feature-Driven Architecture)
```text
/
├── app/
│   ├── (auth)/             # Halaman terkait otentikasi (login, register)
│   ├── (dashboard)/        # Halaman utama aplikasi (tasks, analytics)
│   ├── api/                # API Routes (Next.js serverless functions)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # Komponen shadcn/ui yang sudah dimodifikasi dengan tema Claymorphism
│   ├── tasks/              # Komponen spesifik untuk manajemen tugas
│   └── shared/             # Komponen global (Navbar, Sidebar)
├── lib/
│   ├── supabase/           # Konfigurasi Supabase Client & SSR
│   ├── utils.ts            # Helper/Utility functions
│   └── validations.ts      # Skema Zod untuk validasi data
├── supabase/
│   ├── migrations/         # Script SQL migrasi database & RLS
│   └── functions/          # Supabase Edge Functions (untuk Notifikasi Email)
├── public/                 # Static assets
└── docs/                   # Dokumentasi proyek (Single Source of Truth)
```

## Cara Development
1. **Clone repository & Install dependencies:**
   ```bash
   git clone <repo_url>
   cd outbreak
   npm install
   ```
2. **Setup Environment Variables:**
   Buat file `.env.local` dan isi dengan konfigurasi Supabase & Resend (lihat `Deployment.md`).
3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
4. **Supabase Local Development (Opsional namun direkomendasikan):**
   ```bash
   npx supabase start
   ```

## Cara Deployment
Proyek ini dirancang untuk di-*deploy* menggunakan **Vercel** dengan arsitektur *Zero-Config*. Anda hanya perlu menghubungkan repositori GitHub ke Vercel Dashboard dan memasukkan *Environment Variables* terkait. Untuk detail langkah, lihat `docs/Deployment.md`.
