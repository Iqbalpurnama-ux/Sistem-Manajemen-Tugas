# Product Requirement Document (PRD)

## 1. Product Overview
Sistem Informasi Manajemen Tugas Terintegrasi Berbasis Web yang memecahkan masalah desentralisasi tugas dan berkas melalui antarmuka yang modern, *cloud storage* (Supabase), dan sistem notifikasi proaktif.

## 2. Problem Statement
Individu (Mahasiswa, Freelancer, Pekerja Profesional) sering kali menggunakan banyak aplikasi terpisah (ToDo List, Google Drive, Alarm) untuk mengerjakan suatu proyek. Desentralisasi ini menyebabkan seringnya *deadline* terlewat dan berkas tercecer, sehingga menurunkan efisiensi kerja.

## 3. Objectives
Membangun satu *platform* terpadu yang memusatkan manajemen tugas dengan manajemen *file* yang diiringi oleh notifikasi otomatis agar pengguna dapat lebih fokus mengeksekusi pekerjaan, bukan mengelolanya.

## 4. User Persona
- **Mahasiswa (Budi):** Sering berganti-ganti *device*. Membutuhkan *reminder* tugas kuliah dan wadah untuk menyimpan PDF bahan bacaan per mata kuliah. **Pain Point:** Sering lupa tenggat waktu pengumpulan tugas.
- **Freelancer (Sari):** Membutuhkan pengelompokan tugas berdasarkan Klien (Label). Membutuhkan penyimpanan aset desain (*.zip*) per proyek. **Pain Point:** Berkas *invoice* atau *brief* dari klien sering tercecer di WhatsApp.
- **Pekerja Profesional/Manager (Toni):** Membutuhkan visibilitas tinggi terhadap *deadline* mendesak. **Pain Point:** *Overwhelmed* dengan tumpukan *task*.

## 5. User Journey
1. **Onboarding:** Pengguna mendaftar dengan integrasi *Magic Link* atau OAuth (Google) dari Supabase Auth.
2. **Task Creation:** Pengguna membuat tugas. *Input* judul, prioritas, *deadline*, dan *upload* beberapa berkas sekaligus.
3. **Automated Monitoring:** Sistem mengambil alih. Ketika H-1 dari *deadline* tercapai, sistem memvalidasi bahwa tugas belum 'Selesai'.
4. **Intervention:** Email dikirimkan ke pengguna. Pengguna mengklik *link* di email yang langsung membuka detail *task* di aplikasi.
5. **Completion:** Pengguna mengunduh *file* referensi, mengerjakan tugas, lalu mengubah status menjadi `Done`.

## 6. Functional Requirements (MVP)
- **FR1 (Auth):** Sistem harus bisa meregistrasi, mengotentikasi, dan mengelola *session* pengguna secara aman (JWT via Supabase).
- **FR2 (CRUD Task):** Sistem wajib menyediakan modul pembuatan, pembacaan, pembaruan, dan penghapusan tugas secara reaktif (tanpa *reload* halaman).
- **FR3 (File Upload):** Sistem wajib menerima unggahan *.pdf*, *.docx*, *.zip* (maksimal 5MB) dan menyimpannya di Supabase Storage.
- **FR4 (Automated Notification):** Cron Job via Edge Function yang mengecek *deadline* dan mengirim Email via Resend secara *idempotent* (mencegah pengiriman ganda).

## 7. Non-Functional Requirements
- **NFR1 (Security):** Data *Tasks* dan *Attachments* wajib dilindungi dengan PostgreSQL Row Level Security (RLS). Pengguna A tidak boleh bisa mengakses *URL file* Pengguna B.
- **NFR2 (Performance):** Skor *Lighthouse* minimum 90 untuk *Performance*, *Accessibility*, dan *SEO*.
- **NFR3 (Scalability):** Arsitektur sistem *stateless* (Next.js) dan *serverless* agar bisa melayani ribuan pengguna konstan tanpa intervensi manual (DevOps *zero-touch*).

## 8. Business Rules & Edge Cases
- **Rule 1:** Satu tugas bisa memiliki 0 atau >1 berkas pendukung (tabel `Attachments`).
- **Rule 2:** Jika tugas di-*delete*, record pada `Attachments` juga dihapus (*Cascade*), diikuti fungsi *trigger* untuk menghapus *file* fisik di Storage (menghemat biaya *cloud*).
- **Edge Case:** Bagaimana jika pengguna mengubah *deadline* tugas yang pengingatnya sudah terkirim?
  *Solusi:* Reset *record* di tabel `Notifications_Log` terkait task tersebut jika selisih *deadline* baru berbeda > 24 jam.
