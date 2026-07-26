# Development Backlog & Tasks (Project BesokAja)

Dokumen ini adalah *Single Source of Truth* untuk *Developer* (atau Anda sendiri) dalam mengeksekusi iterasi (*Sprint*) tanpa harus kebingungan "Apa selanjutnya?".

## 🎯 Sprint 1: Arsitektur Dasar & Environment (Estimasi: 4 Hari)
- [ ] **T1.1:** Setup Repositori Git dan Inisialisasi Next.js App Router (TypeScript, TailwindCSS).
- [ ] **T1.2:** Konfigurasi Vercel CLI / Hubungkan repositori GitHub ke Vercel untuk aktivasi jalur *Preview Deployment*.
- [ ] **T1.3:** Pembuatan Project di Supabase. Ekspor API Keys dan pasang pada *environment variables* lokal & Vercel.
- [ ] **T1.4:** Modifikasi konfigurasi `tailwind.config.ts` dan eksekusi integrasi dasar `shadcn/ui` untuk komponen *Button*, *Input*, *Toast*. Tambahkan token bayangan (shadow) *Claymorphism*.
- [ ] **T1.5:** Implementasi Layout Utama Next.js (`layout.tsx`) beserta navigasi (Header/Sidebar).

## 🔒 Sprint 2: Database & Sistem Keamanan Auth (Estimasi: 5 Hari)
- [ ] **T2.1:** Desain Skema PostgreSQL di Supabase (Pembuatan Tabel `profiles`, `tasks`, `attachments`, `notifications_log`).
- [ ] **T2.2:** Menulis Script RLS (Row Level Security) untuk seluruh tabel di atas.
- [ ] **T2.3:** Implementasi Supabase Auth di Next.js (Server-Side Authentication / `@supabase/ssr`).
- [ ] **T2.4:** Pembuatan Halaman Login/Register dan implementasi *Magic Link* flow.
- [ ] **T2.5:** Pembuatan Supabase Trigger Function (`handle_new_user`) agar saat mendaftar, *record* langsung terbuat di tabel `profiles`.

## 🛠️ Sprint 3: Manajemen Tugas Inti (Estimasi: 6 Hari)
- [ ] **T3.1:** Pembuatan Komponen *TaskCard* dan *Dashboard List*.
- [ ] **T3.2:** Implementasi Server Actions Next.js untuk membuat dan membaca tugas (`createTask`, `getTasks`).
- [ ] **T3.3:** Form Pembuatan Tugas dengan validasi *Client-Side* menggunakan Zod & React Hook Form.
- [ ] **T3.4:** Fitur merubah status tugas (*Update*), dari *To-Do* ke *Done* via *Checkbox*.
- [ ] **T3.5:** Implementasi penghapusan halus (*Soft Delete*) dan filter query pada *dashboard*.

## 📂 Sprint 4: Manajemen Penyimpanan (Estimasi: 4 Hari)
- [ ] **T4.1:** Membuat Supabase Storage Bucket `task_files`.
- [ ] **T4.2:** Menulis RLS spesifik untuk *Bucket* (Hanya *authenticated user* yang dapat mengunggah, hanya pemilik *task* yang bisa mengunduh).
- [ ] **T4.3:** Membangun antarmuka UI *FileDropzone* untuk proses unggah (Upload) berkas secara asinkronus dengan indikator progresi (loading).
- [ ] **T4.4:** Modifikasi *Server Action* di Next.js untuk menyimpan `file_url` hasil *upload* ke tabel `attachments`.

## 🤖 Sprint 5: Automasi Email & Penutupan MVP (Estimasi: 5 Hari)
- [ ] **T5.1:** Integrasi akun Resend Email (Verifikasi domain / SPF / DKIM).
- [ ] **T5.2:** Membuat skrip Supabase Edge Functions (`/notify-task`) yang menarik data *deadline* dan menembak Resend API.
- [ ] **T5.3:** Konfigurasi *trigger* `pg_cron` di PostgreSQL Supabase agar memanggil *Edge Function* tersebut setiap jam.
- [ ] **T5.4:** Logika verifikasi pada Edge Function agar *email* tidak dikirim berulang (Cek ke tabel `notifications_log`).
- [ ] **T5.5:** *End-to-End Testing* (Manual) dari *login* hingga *email* diterima. Pemolesan UI akhir (*Claymorphism Polish*).

## *Keterangan Atribut Backlog (Untuk referensi)*
- **Priority:** Must Have / MVP
- **Dependency:** (Misal, T2.2 tidak bisa berjalan sebelum T2.1).
- **Status:** Diupdate menjadi `[x]` saat sudah berjalan di *Production*.
