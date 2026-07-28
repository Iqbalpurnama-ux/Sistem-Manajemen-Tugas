<div align="center">
  <img src="https://img.icons8.com/color/96/000000/task--v1.png" alt="Logo" width="80" height="80">
  <h1 align="center">Project BesokAja</h1>
  <p align="center">
    <strong>Sistem Informasi Manajemen Tugas Terintegrasi Berbasis Web</strong>
    <br />
    Dilengkapi Fitur Cloud Storage & Notifikasi Email Otomatis
  </p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

## 🌟 Latar Belakang & Deskripsi
**BesokAja** adalah Sistem Informasi Manajemen Tugas yang dirancang untuk mengatasi tantangan dalam pengorganisasian tugas, manajemen *deadline*, dan penyimpanan dokumen akademik/pekerjaan secara terpusat. 

Berbeda dengan aplikasi *to-do list* konvensional, sistem ini mengimplementasikan pendekatan berbasis *cloud* terstruktur dengan nilai jual utama: **Otomatisasi pengingat tugas** dan **Manajemen berkas terintegrasi**. Dibungkus dalam antarmuka UI/UX modern bertema **Claymorphism**.

## ✨ Fitur Utama
- 📝 **Manajemen Tugas Inti (CRUD):** Parameter lengkap meliputi Judul, Deskripsi, Kategori, Prioritas (Low, Medium, High), dan *Deadline*.
- 📁 **Manajemen Berkas Terintegrasi:** Unggah (PDF, DOCX, ZIP) langsung ke Supabase Storage secara aman. Satu tugas dapat memuat banyak lampiran!
- 🔔 **Notifikasi Otomatis (Email):** Sistem *Smart Reminder* yang berjalan dengan *pg_cron* dan *Edge Functions* untuk mengecek *deadline* dan menembak pesan ke *Resend API* tanpa spam (idempotent).
- 🎨 **Claymorphism UI:** Tema antarmuka taktil yang membal, bersudut membulat ekstrem dengan palet warna pastel *Lavender*, *Indigo*, dan *Coral*.
- 🛡️ **Keamanan Kelas Enterprise:** Data diisolasi penuh menggunakan *Row Level Security* (RLS) PostgreSQL; pengguna tidak dapat melihat atau memanipulasi *tasks* milik orang lain.

## 🛠️ Arsitektur & Tech Stack
Proyek ini mengadopsi model **Serverless First** untuk menjamin skalabilitas tinggi dan *Zero-Ops*:
- **Frontend & Server Actions:** Next.js (React.js, App Router, TypeScript)
- **Styling:** TailwindCSS v4 + shadcn/ui
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
- **Storage:** Supabase Storage (Bucket)
- **Automasi Notifikasi:** Supabase Edge Functions + `pg_cron` + Resend Email API
- **Deployment:** Vercel Edge Network

## 🚀 Rencana Pengembangan Lanjutan (Roadmap)
- Integrasi Gateway WhatsApp (sebagai opsi pengganti email).
- Fitur *Sub-task* / *Checklist* bertingkat.
- Dashboard analitik untuk tren produktivitas.

## 💻 Cara Menjalankan Proyek (Local Development)

1. **Clone repository:**
   ```bash
   git clone https://github.com/Iqbalpurnama-ux/Sistem-Manajemen-Tugas.git
   cd Sistem-Manajemen-Tugas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Buat file `.env.local` pada root directory dan isi kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---
*Dokumentasi komprehensif proyek (PRD, Arsitektur, Skema DB) dapat diakses pada folder `Project_Documentation` di dalam repositori ini.*
