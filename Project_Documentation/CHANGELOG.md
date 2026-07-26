# Changelog (Version History)

Seluruh perubahan penting pada proyek BesokAja (*Sistem Informasi Manajemen Tugas Terintegrasi Berbasis Web*) akan dicatat dalam format dokumen ini. Penomoran rilis mengacu pada skema *Semantic Versioning (SemVer)* (`MAJOR.MINOR.PATCH`).

## [Unreleased] - (MVP Development Phase)

*(Bagian ini berisi rancangan yang sedang diusahakan sebelum peluncuran resmi ke publik).*

### Added (Penambahan)
- **Dokumentasi Utama:** Menyelesaikan pembuatan dokumentasi *CTO-Level* (PRD, Arsitektur, Skema DB, Style Guide, Risiko).
- **Core Stack:** Menetapkan inisialisasi tumpukan teknologi Next.js App Router, Tailwind, dan shadcn/ui.
- **Supabase Integration:** Merancang skema PostgreSQL dengan arsitektur relasional `tasks`, `attachments`, `labels`.
- **Row Level Security (RLS):** Kebijakan mitigasi pengamanan di lapisan Database Supabase untuk privasi *multitenancy*.
- **UI Design System:** Spesifikasi tema visual *Claymorphism* di dalam konfigurasi Tailwind (bayangan, radius bulat, gradien pastel).
- **Automated Workflow:** Integrasi logika Resend Email dan spesifikasi `pg_cron` untuk *backend job*.

### Changed (Perubahan dari Ide Awal)
- **Migrasi Cron:** Mengubah rencana awal Vercel Cron (Terbatas 1/hari) menjadi Supabase Edge Functions yang ditenagai oleh Native PostgreSQL Cron (`pg_cron`) (Skalabilitas Tinggi).
- **Penyimpanan (Storage):** Memisahkan tautan berkas tugas (file) menjadi tabel `attachments` yang relasional (1:N) agar *user* bisa menyimpan lebih dari satu file per tugas, menghilangkan batasan 1 URL per baris (single column blob).

### Removed (Dihapus/Ditolak pada MVP)
- **Self-Hosted WhatsApp Gateway (Baileys/WA-Web):** Ditolak dari MVP karena bertentangan dengan arsitektur *Serverless First*. Pengelolaan infrastruktur ini membutuhkan NodeJS yang berjalan non-stop 24 Jam (VPS). Ditunda ke fase lanjutan (Phase 3).
- **Custom WebSocket (Realtime):** Dihapus karena menambah kerumitan infrastruktur (Vercel merupakan serverless yang tidak ideal untuk long-polling socket). Komunikasi reaktif antar komponen klien/server diredam dengan *Next.js revalidatePath()*.

---
*(Dokumen ini akan terus di-update ke versi `v1.0.0` sesaat setelah produksi di-deploy di Vercel).*
