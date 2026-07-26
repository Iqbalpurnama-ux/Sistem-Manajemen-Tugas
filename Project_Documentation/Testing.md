# Quality Assurance & Testing Strategy (Project BesokAja)

Demi mempertahankan keandalan tinggi (99.9% uptime) dengan jumlah SDM yang terbatas (1 *Developer*), pengujian terotomatisasi merupakan sebuah keharusan. Dokumentasi ini memuat pedoman pengujian (testing) dari berbagai level (Unit, Integrasi, End-to-End, dan Keamanan).

## 1. Test Piramida Strategi
Dalam ekosistem Next.js App Router, komponen terbagi antara *Server* dan *Client*.
- **E2E Tests (20%):** Menggunakan **Playwright**. Mensimulasikan pengguna nyata (klik browser). (Menemukan masalah navigasi & *user flow*).
- **Integration Tests (30%):** Menguji Server Actions yang berinteraksi langsung dengan Supabase API (*Data Mocking*). (Menemukan masalah logika bisnis).
- **Unit Tests (50%):** Menggunakan **Vitest** atau **Jest** untuk fungsi utilitas (*helper*), skema *Zod validation*, dan kalkulasi tanggal. (Mudah ditulis, sangat cepat).

## 2. Checklist Pengujian Fungsional (Manual & UAT)
Walaupun ada pengujian otomatis, *User Acceptance Testing (UAT)* manual wajib dilakukan sebelum merilis fitur utama (Production Release).

### A. Skenario Otentikasi
- [ ] *Login* menggunakan kredensial salah menampilkan error toast yang jelas.
- [ ] Mengklik *Magic Link* dari email membuka sesi yang valid di *browser*.
- [ ] Saat *session* habis (expired), pengguna ter-redirect ke halaman login, bukan melihat layar *crash* putih (*White Screen of Death*).

### B. Skenario Manajemen Tugas & Keamanan RLS
- [ ] *User A* membuat tugas baru, tugas langsung muncul di layarnya.
- [ ] *User A* menyalin ID tugas dan mencoba *fetch* langsung menggunakan API/URL, harus berhasil.
- [ ] *User B* (*User ID* berbeda) mencoba melakukan API *Fetch* menggunakan ID tugas *User A*. Sistem (Supabase RLS) wajib mengembalikan error/array kosong.
- [ ] Mengunggah file PDF (3MB) berhasil dan status tersimpan di tabel lampiran.
- [ ] Mengunggah file (10MB) ditolak (limit ukuran).
- [ ] Mengunggah file berektensi bahaya (`.exe`, `.sh`) ditolak oleh *backend* Next.js walau ekstensi di-*rename* di sistem *client*.

### C. Skenario Cron & Notifikasi
- [ ] Menambahkan tugas yang *deadline*-nya dalam 23 jam ke depan.
- [ ] Memanipulasi jam / Memaksa eksekusi `pg_cron` secara manual di dasbor SQL Supabase.
- [ ] Memastikan satu buah email masuk ke *inbox*.
- [ ] Mengulangi eksekusi `pg_cron` kedua kalinya di jam yang sama. Memastikan **TIDAK ADA** email duplikat yang terkirim (Pencegahan Duplikasi bekerja).

## 3. Load Testing & Security Testing
Karena kita menggunakan ekosistem terkelola (Vercel & Supabase), *Stress Test* infrastruktur jaringan tidak diperlukan (sudah dijamin Vercel Cloudflare).
- **Rate Limit Testing:** Mencoba mengeksekusi rute API POST secara terus-menerus menggunakan *script loop* sederhana. Jika tidak ada mekanisme pertahanan yang mem-blok IP, tambahkan *Rate Limiter* (Upstash/Redis).
- **Pen-testing (OWASP ZAP):** Menjalankan *scanner* untuk menemukan injeksi vektor (meski *Surface Area* aplikasi ini sudah sangat ditekan karena menggunakan Server Actions, bukan GraphQL/REST API tradisional).
- **Dependency Audit:** Menjalankan perintah `npm audit` di proses CI/CD GitHub Actions untuk mencegah injeksi kerentanan dari paket pihak ketiga (Supply Chain Attack).
