# Project Roadmap & Prioritization

## Strategi Prioritisasi (MoSCoW & Impact vs Effort)
Dalam membangun produk tingkat Enterprise yang dapat dirawat oleh satu *developer*, manajemen ruang lingkup (*scope*) adalah prioritas mutlak. Kita menggunakan pendekatan MoSCoW (*Must Have, Should Have, Could Have, Won't Have*) digabung dengan analisis *Impact vs Effort*.

### ✅ Phase 1: Minimum Viable Product (MVP) - (Bulan 1-2)
**Fokus:** Fondasi Aplikasi, Manajemen Tugas Inti, *Storage*, dan Automasi Dasar.
- [x] Otentikasi Pengguna (Supabase Auth - Email/Password & Google)
- [x] CRUD Tugas (Judul, Deskripsi, Kategori/Label, Prioritas, Datetime Deadline)
- [x] *Upload* & *Download File* (Integrasi Supabase Storage, Limit 5MB)
- [x] Implementasi RLS (Row Level Security) untuk privasi data
- [x] UI/UX Dasar dengan tema *Claymorphism* (shadcn/ui modifikasi)
- [x] *Email Notification System* (Supabase Edge Function + `pg_cron` + Resend)

### 🚀 Phase 2: Produktivitas Lanjutan & Retensi (Bulan 3-4)
**Fokus:** Memperbaiki retensi (*retention*) melalui *user experience* dan wawasan produktivitas.
- [ ] *Sub-task* / *Checklist* di dalam tugas
- [ ] Dashboard Statistik (Grafik tugas selesai vs terlambat, *Completion Rate*)
- [ ] Pencarian Global (Global Search) dengan filter tingkat lanjut
- [ ] Mode Gelap (*Dark Mode*) dengan palet warna khusus Claymorphism
- [ ] *Recycle Bin* (Soft Delete) untuk mencegah data terhapus permanen karena kecelakaan
- [ ] *Export Data* (PDF/Excel)

### 🌟 Phase 3: Skalabilitas & Kolaborasi (SaaS Ready) - (Bulan 5-6)
**Fokus:** Monetisasi, kerja sama tim, dan opsi *enterprise*.
- [ ] Sinkronisasi dengan Google Calendar
- [ ] Pendelegasian (Assign) tugas antar pengguna (*Collaboration*)
- [ ] Notifikasi WhatsApp (Memerlukan infrastruktur berbayar tambahan: Fonnte/Wablas/Twilio)
- [ ] Opsi Tugas Berulang (*Recurring Tasks*)
- [ ] Log Audit Aktivitas Pengguna (Audit Trail)

### 🔮 Future Vision (AI & Automasi Lanjutan)
**Fokus:** Mengubah alat menjadi asisten pintar.
- [ ] **AI Smart Reminder:** AI menentukan waktu terbaik mengirim email berdasarkan pola buka (*open rate*) tiap *user*.
- [ ] **AI Weekly Summary:** Ringkasan produktivitas yang di-*generate* menggunakan LLM.
- [ ] **Natural Language Task Creation:** ("Ingatkan saya presentasi laporan keuangan minggu depan jam 9 pagi beserta file laporan.pdf").

## Sprint Planning (Phase 1)
- **Sprint 1 (Minggu 1):** Inisialisasi Repositori, *Setup* Next.js, Supabase, Tailwind, & shadcn/ui. Skema Database & RLS siap di-deploy.
- **Sprint 2 (Minggu 2):** Implementasi Auth (*Login/Register*) & Halaman Dashboard Dasar.
- **Sprint 3 (Minggu 3):** Pengembangan Fitur CRUD Tasks (termasuk *Client-side form validation* dengan Zod & *Server Actions*).
- **Sprint 4 (Minggu 4):** Integrasi *Upload File* ke Supabase Storage dan tabel `Attachments`.
- **Sprint 5 (Minggu 5):** Pengembangan *Edge Functions* untuk Automasi Email + Konfigurasi `pg_cron` dan Resend.
- **Sprint 6 (Minggu 6):** UI Polish (Claymorphism), E2E Testing, Bug Fixing, *Production Deployment* ke Vercel.
