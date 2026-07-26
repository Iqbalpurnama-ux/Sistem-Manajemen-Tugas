# Security Architecture (Project BesokAja)

Keamanan aplikasi (terutama yang menangani berkas milik pengguna dan tenggat waktu produktivitas) adalah prioritas mutlak. Dokumen ini merangkum postur keamanan sistem berdasarkan standar OWASP Top 10 dan implementasi pengamanan secara terperinci.

## 1. Analisis Berdasarkan OWASP Top 10

| Risiko OWASP | Solusi & Mitigasi di Project BesokAja |
|---|---|
| **A01: Broken Access Control** | Diatasi dengan PostgreSQL Row Level Security (RLS) di Supabase. Sebuah query (meskipun dieksekusi tanpa filter *where clause* dari *client*) akan digagalkan oleh DB jika token pengguna tidak memiliki *ownership* terhadap row tersebut. |
| **A02: Cryptographic Failures** | Data transit dienkripsi via **HTTPS (TLS 1.2/1.3)** di Vercel. Password (Hash/Salt) dikelola sepenuhnya oleh Supabase Auth via `pgcrypto` sehingga kita tidak menyimpan *password plaintext*. |
| **A03: Injection (SQLi)** | Menggunakan Supabase JS Client dan *Parameterized Queries* via PostgREST. Input dari form selalu disanitasi dan tidak pernah dikonkat (concatenated) langsung ke query SQL. |
| **A04: Insecure Design** | Menerapkan prinsip *Least Privilege* sejak tahap arsitektur. Data hanya bisa dibaca/dimodifikasi dengan token otentikasi. Sistem notifikasi dipisahkan menjadi fungsi asinkron (Edge Functions) tanpa mengekspos rute eksekusi ke luar. |
| **A05: Security Misconfiguration** | Seluruh *Environment Variables* Vercel dienkripsi di *vault*. Menggunakan default parameter paling ketat pada Vercel deployment. |
| **A07: Identification & Authentication Failures** | Fitur proteksi *brute-force* otomatis dan perlindungan JWT bawaan Supabase (termasuk validasi masa kadaluarsa token, dan rotasi *Refresh Token*). |
| **A10: Server-Side Request Forgery (SSRF)** | Tidak ada fitur yang melakukan ping atau *fetch* rute eksternal berdasarkan input *user*. Upload *file* divalidasi MIME tipenya dan dieksekusi melalui URL Bucket terenkripsi, bukan di-fetch dari URI klien sewenang-wenang. |

## 2. Row Level Security (RLS) Implementation
Sistem menggunakan RLS secara ekstensif pada tabel `tasks`, `attachments`, `notifications_log`, dan bucket `Supabase Storage`.

- **Aturan Tasks:** Pengguna hanya dapat melakukan `SELECT`, `INSERT`, `UPDATE`, `DELETE` jika `auth.uid() = user_id`.
- **Aturan Storage (Attachments Bucket):** Kebijakan diatur agar pengguna yang belum *login* (anonim) tidak bisa mengakses berkas apa pun (Bucket bersifat Privat, bukan Publik). File diunduh menggunakan metode `createSignedUrl(path, expiresInSeconds)` dari Supabase, menghasilkan URL unik dan temporal, sehingga *link sharing* tidak sengaja terjadi.

## 3. Rate Limiting & DoS Protection
- **Vercel Edge Network Firewall:** Menahan *traffic flood* (DDoS) secara *default* dari jaringan CDN Cloudflare/Vercel.
- **Server Actions Rate Limiting:** Menggunakan mekanisme pencegahan di Next.js middleware (misal dengan dependensi `@upstash/ratelimit` di Fase 2) untuk membatasi aksi `createTask` atau `uploadFile` maksimal 10x per menit guna mencegah *spamming database/storage*.
- **Supabase API Quotas:** *Rate-limit* bawaan pada rute `/auth` mencegah serangan percobaan *login* massal.

## 4. Validasi Data & Eksekusi Skrip Lintas Situs (XSS)
- **Sanitasi Zod:** Segala data masuk divalidasi dengan struktur yang sangat kaku oleh library `zod` di Next.js Server Actions.
- **Auto-escaping React:** Karena sistem dibangun dengan Next.js / React, HTML entities secara otomatis disanitasi saat proses *rendering* DOM, menghilangkan vektor serangan DOM-based XSS secara bawaan.
- **File Upload Whitelist:** API Server Actions akan menolak ekstensi yang tidak diizinkan (`.exe`, `.sh`, `.php`) meskipun lolos dari lapisan klien, serta memverifikasi limit ukuran 5MB sebelum mulai meneruskan *stream* ke Supabase.

## 5. Manajemen Kredensial rahasia (Secrets)
- Kunci `SUPABASE_SERVICE_ROLE_KEY` (kunci superuser untuk memintas RLS) HANYA digunakan di dalam *Supabase Edge Functions* atau rute spesifik yang terisolasi dari jaringan publik. 
- Next.js Client Component hanya akan pernah memiliki akses ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 6. Backup & Recovery
- **Database Backup:** Di-handle oleh otomatisasi Supabase (PITR / Point-In-Time Recovery pada tier Pro/Enterprise kelak, dan harian pada tier gratis).
- **Soft Deletion:** Semua data tugas (`tasks`) hanya diberi stempel `deleted_at`, melindungi pengguna dari penghapusan fatal. Penghapusan permanen (Hard Delete) hanya dieksekusi asinkron melalui *cleanup script* untuk tugas yang terhapus > 30 hari.
