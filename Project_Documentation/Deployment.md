# Deployment & Infrastructure Strategy (Vercel)

Proyek ini wajib dan dioptimalkan secara ketat untuk berjalan (deploy) di atas arsitektur **Vercel** untuk Frontend/API dan **Supabase** untuk Database/Backend (Serverless). Strategi "Zero Ops" ini memastikan satu *developer* bisa menangani produk dengan keandalan Enterprise.

## 1. Environment & Variables
Aplikasi menggunakan tiga tingkatan lingkungan (*environment*), masing-masing diisolasi kuncinya (Keys).

- **Development:** *Localhost* (Komputer Developer). Terhubung ke *Supabase Local* atau basis data dev.
- **Preview (Staging):** Dihasilkan secara otomatis oleh Vercel (Auto-URL) saat terjadi Git *Pull Request* atau *Push* ke branch selain `main`. Sangat aman untuk uji coba QA sebelum digabung (*merge*).
- **Production:** Terhubung ke *Custom Domain* (misal: `app.outbreak.com`). Menggunakan Database Supabase Produksi dengan data ril.

### Daftar Environment Variables yang Wajib Ada di Vercel:
```text
# --- SUPABASE CONFIG ---
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# (Hanya digunakan di rute sangat rahasia / Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SECRET_KEY]

# --- RESEND CONFIG ---
RESEND_API_KEY=re_[YOUR_RESEND_KEY]
NEXT_PUBLIC_APP_URL=https://app.outbreak.com
```

## 2. CI/CD & Deployment Flow
1. Developer commit ke *branch* `feature/task-ui`.
2. Push ke GitHub. Vercel webhook mendeteksi perubahan dan membangun **Preview Deployment**.
3. Sistem secara otomatis menjalankan *Build Script* (`npm run build`). Jika terdapat kesalahan TypeScript atau peringatan ESLint (Zod/Props mismatch), *build* akan digagalkan (**Fail-Safe**).
4. Jika sukses, Vercel memberikan tautan unik (contoh: `outbreak-ui-hsh234.vercel.app`) untuk diuji oleh tim QA / Diri sendiri.
5. Developer melakukan *Merge* Pull Request ke *branch* `main`.
6. Vercel secara otomatis membangun *Production Deployment* (Zero downtime). Pengguna akhir akan mendapatkan pembaruan seketika (*Instant Rollout*).

## 3. Rollback Strategy
- Jika terdapat *bug* kritikal yang lolos ke *Production* (seperti rute gagal dimuat, atau komponen rusak), tidak perlu melakukan perbaikan paksa yang terburu-buru (*hotfix rushing*).
- Vercel mendukung fitur **Instant Rollback**. Masuk ke Vercel Dashboard -> Pilih *Deployment* sebelumnya yang stabil -> Klik **"Promote to Production"**. Aplikasi akan kembali ke versi sebelumnya dalam hitungan milidetik.
- **Database Rollback:** Supabase Pro tier menyediakan *Point In Time Recovery (PITR)*. Kita dapat memutar kembali isi database ke menit spesifik (contoh: Kemarin jam 10:45) jika tabel rusak akibat *query error*.

## 4. Konfigurasi Edge & Caching (Vercel)
Karena arsitektur menggunakan Server Actions, rute seperti dasbor bersifat dinamis.
- Agar tidak mengonsumsi biaya pembacaan (Read Ops) yang tidak wajar ke Supabase, aset statis, font, dan gambar akan di- *cache* oleh Vercel Edge Network.
- Jika ada *update* dari Supabase (misal, tugas baru disisipkan), *Server Action* memanggil `revalidatePath('/dashboard')` yang seketika menghapus *cache* HTML lama Vercel dan men- *generate* ulang data terkini, memadukan performa *static site* dengan kesegaran aplikasi *realtime*.
