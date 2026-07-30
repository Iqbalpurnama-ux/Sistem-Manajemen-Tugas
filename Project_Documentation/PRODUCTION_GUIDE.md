# 🚀 Production Deployment Guide — BesokAja

## 1. Environment Variables

Pastikan semua env var berikut dikonfigurasi di Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=       # dari Supabase Project Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # dari Supabase Project Settings → API
NEXT_PUBLIC_APP_URL=            # URL production Anda, contoh: https://besokaja.vercel.app
RESEND_API_KEY=                 # dari resend.com dashboard
```

## 2. Supabase Database Migrations

Jalankan migration berikut di Supabase SQL Editor (Production):

```sql
-- Pastikan schema.sql sudah diterapkan
-- Lalu jalankan semua file di supabase/migrations/ secara berurutan:
-- 1. supabase/migrations/20260728_add_categories.sql
-- 2. supabase/migrations/20260730064406_update_notifications_and_cron.sql
-- 3. supabase/migrations/20260730_add_attachments.sql
-- 4. supabase/migrations/20260730_add_performance_indexes.sql  <-- BARU
```

## 3. Supabase Edge Function Deployment

Deploy email reminder function ke Supabase:

```bash
supabase functions deploy cron-email-reminder --project-ref YOUR_PROJECT_REF
```

Tambahkan secret di Supabase Dashboard → Edge Functions → Secrets:
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL` → URL production Anda

## 4. Supabase Storage

Pastikan bucket `task_attachments` dibuat dengan:
- Public: ❌ (Private bucket)
- File size limit: 10MB
- Allowed mime types: image/*, application/pdf, text/*

## 5. Google OAuth

Di Supabase Dashboard → Authentication → Providers → Google:
- Tambahkan URL production ke "Redirect URLs": `https://your-domain.com/auth/callback`
- Update Google Cloud Console OAuth Client dengan origin dan redirect URI baru

## 6. Production Checklist

```
CRITICAL ✅:
[x] URL email tidak lagi menggunakan localhost:3000
[x] Security headers ditambahkan (next.config.ts)
[x] Database indexes dibuat (migration baru)
[x] Memory leak setTimeout diperbaiki (task-card.tsx)
[x] XSS di email template diperbaiki (sanitizeHtml)
[x] ARIA labels ditambahkan ke semua tombol ikon
[x] next/image digunakan untuk semua avatar
[x] Server-side file type validation
[x] UUID validation di semua server actions
[x] Contrast ratio diperbaiki (WCAG AA compliant)
[x] Skip link untuk keyboard navigation
[x] GitHub Actions CI workflow

DEPLOYMENT:
[ ] Deploy ke Vercel dengan environment variables yang benar
[ ] Jalankan database migrations di production
[ ] Deploy edge function ke Supabase production
[ ] Verifikasi domain Resend email
[ ] Test email reminder di production
[ ] Test Google OAuth di production
[ ] Jalankan Lighthouse audit (target score >= 90)
```
