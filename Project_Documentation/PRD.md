# Product Requirement Document (PRD)

## 1. Product Overview
Sistem Informasi Manajemen Tugas Terintegrasi Berbasis Web yang memecahkan masalah desentralisasi tugas dan berkas melalui antarmuka yang modern (tema Claymorphism), *cloud storage* (Supabase), dan sistem notifikasi proaktif.

**Nama Produk:** BesokAja
**Versi Dokumen:** 2.0
**Tanggal Terakhir Diperbarui:** Juli 2026

---

## 2. Problem Statement
Individu (Mahasiswa, Freelancer, Pekerja Profesional) sering kali menggunakan banyak aplikasi terpisah (ToDo List, Google Drive, Alarm) untuk mengerjakan suatu proyek. Desentralisasi ini menyebabkan seringnya *deadline* terlewat dan berkas tercecer, sehingga menurunkan efisiensi kerja.

**Dampak:**
- 62% mahasiswa pernah melewatkan setidaknya satu deadline per semester (sumber: riset internal).
- Rata-rata pekerja menghabiskan ~30 menit/hari mencari file yang tersebar di berbagai platform.

---

## 3. Objectives
Membangun satu *platform* terpadu yang memusatkan manajemen tugas dengan manajemen *file* yang diiringi oleh notifikasi otomatis agar pengguna dapat lebih fokus mengeksekusi pekerjaan, bukan mengelolanya.

---

## 4. User Persona

### Persona 1: Mahasiswa (Budi, 21 tahun)
- **Goals:** Tidak melewatkan deadline tugas kuliah, menyimpan bahan bacaan per mata kuliah di satu tempat.
- **Frustrations:** Sering lupa tenggat, file tersebar di WhatsApp/Drive/Laptop, menggunakan 3+ aplikasi berbeda.
- **Scenarios:**
  - Budi membuat tugas "Kumpul Laporan Praktikum" dengan deadline 3 hari lagi, melampirkan template PDF.
  - Pada H-1, Budi menerima email pengingat otomatis beserta link ke tugas di BesokAja.
  - Budi membuka BesokAja, mengunduh template, mengerjakan, lalu mengubah status menjadi "Done".

### Persona 2: Freelancer (Sari, 28 tahun)
- **Goals:** Mengelompokkan tugas berdasarkan klien, menyimpan aset desain dan invoice terpusat.
- **Frustrations:** File invoice/brief dari klien tercecer di WhatsApp, sulit melacak tugas per proyek.
- **Scenarios:**
  - Sari membuat tugas "Revisi Logo Klien ABC" dengan prioritas High, melampirkan file .zip brief.
  - Dashboard menampilkan kartu berwarna merah (priority-high) sehingga Sari langsung fokus ke tugas tersebut.

### Persona 3: Pekerja Profesional / Manager (Toni, 35 tahun)
- **Goals:** Visibilitas tinggi terhadap deadline yang mendesak, executive summary produktivitas.
- **Frustrations:** Overwhelmed dengan tumpukan task, tidak tahu mana yang harus diprioritaskan.
- **Scenarios:**
  - Toni melihat dashboard dengan filter prioritas "High" — hanya 3 tugas urgent yang muncul.
  - Statistik menunjukkan 85% completion rate minggu ini, memotivasi Toni.

---

## 5. User Journey (Happy Path)
1. **Onboarding:** Pengguna mendaftar dengan integrasi *Magic Link* atau OAuth (Google) dari Supabase Auth.
2. **Task Creation:** Pengguna membuat tugas. *Input* judul, prioritas, *deadline*, dan *upload* beberapa berkas sekaligus.
3. **Automated Monitoring:** Sistem mengambil alih. Ketika H-1 dari *deadline* tercapai, sistem memvalidasi bahwa tugas belum 'Selesai'.
4. **Intervention:** Email dikirimkan ke pengguna. Pengguna mengklik *link* di email yang langsung membuka detail *task* di aplikasi.
5. **Completion:** Pengguna mengunduh *file* referensi, mengerjakan tugas, lalu mengubah status menjadi `Done`.

---

## 6. Functional Requirements (MVP)

### FR1: Otentikasi Pengguna (Auth)
**Deskripsi:** Sistem harus bisa meregistrasi, mengotentikasi, dan mengelola *session* pengguna secara aman (JWT via Supabase).

**Acceptance Criteria:**
- [ ] Pengguna baru dapat mendaftar menggunakan Email (Magic Link) atau Google OAuth.
- [ ] Setelah verifikasi berhasil, profil otomatis dibuat di tabel `profiles` (Trigger DB).
- [ ] Session JWT disimpan sebagai HTTP-only cookie (bukan localStorage).
- [ ] Pengguna yang belum login ter-redirect ke `/login` saat mengakses halaman terproteksi.
- [ ] Token expired menampilkan pesan "Sesi Anda telah berakhir" dan redirect ke login, bukan white screen.

**Success Metrics:**
- Registration-to-Login conversion rate ≥ 90%.
- Auth error rate < 1%.

---

### FR2: Manajemen Tugas (CRUD)
**Deskripsi:** Sistem wajib menyediakan modul pembuatan, pembacaan, pembaruan, dan penghapusan tugas secara reaktif (tanpa *reload* halaman).

**Acceptance Criteria:**
- [ ] Form pembuatan tugas menerima input: Judul (min 3 karakter), Deskripsi (opsional), Kategori (opsional), Prioritas (Low/Medium/High), Deadline (datetime, wajib isi).
- [ ] Tugas baru langsung muncul di dashboard tanpa reload (via `revalidatePath`).
- [ ] Status tugas dapat diubah (To-Do → In Progress → Done) melalui checkbox atau dropdown.
- [ ] Tugas yang dihapus masuk ke Soft Delete (`deleted_at` timestamp), bukan hard delete.
- [ ] Validasi input menggunakan Zod di sisi server (Server Action).
- [ ] Dashboard menampilkan tugas terfilter (`WHERE deleted_at IS NULL`) diurutkan berdasarkan deadline terdekat.

**Success Metrics:**
- Waktu pembuatan tugas ≤ 10 detik (dari klik "Tambah" sampai tugas muncul).
- Zero data loss dari operasi CRUD.

---

### FR3: Upload & Download File
**Deskripsi:** Sistem wajib menerima unggahan *.pdf*, *.docx*, *.zip* (maksimal 5MB) dan menyimpannya di Supabase Storage.

**Acceptance Criteria:**
- [ ] Pengguna dapat meng-upload file melalui drag-and-drop atau tombol "Pilih File".
- [ ] Validasi tipe file (whitelist: `.pdf`, `.docx`, `.zip`, `.png`, `.jpg`) di sisi klien DAN server.
- [ ] Validasi ukuran file (≤ 5MB) di sisi klien DAN server.
- [ ] Upload dilakukan **langsung dari client ke Supabase Storage** (bukan melewati Vercel) untuk menghindari timeout.
- [ ] Progress indicator ditampilkan selama upload berlangsung.
- [ ] Satu tugas dapat memiliki 0 atau lebih lampiran (relasi 1:N via tabel `attachments`).
- [ ] File hanya dapat diunduh oleh pemilik tugas (RLS pada Storage Bucket).
- [ ] File yang di-download menggunakan Signed URL temporal (expire dalam 1 jam).

**Success Metrics:**
- Upload success rate ≥ 98% pada koneksi 3G.
- Tidak ada file orphan (file tanpa task_id) setelah 30 hari.

---

### FR4: Notifikasi Email Otomatis
**Deskripsi:** Cron Job via Edge Function yang mengecek *deadline* dan mengirim Email via Resend secara *idempotent* (mencegah pengiriman ganda).

**Acceptance Criteria:**
- [ ] `pg_cron` men-trigger Supabase Edge Function setiap 1 jam.
- [ ] Edge Function mengambil tugas dengan `status != 'Done'` DAN `deadline <= NOW() + INTERVAL '1 day'`.
- [ ] Sebelum mengirim email, Edge Function mengecek tabel `notifications_log` untuk memastikan belum pernah mengirim pengingat tahap tersebut (H-3, H-1, H-0).
- [ ] Jika belum terkirim, email dikirim via Resend API dengan template yang berisi judul tugas, deadline, dan link ke tugas.
- [ ] Setelah berhasil kirim, record dicatat di `notifications_log` dengan status `sent`.
- [ ] Jika gagal, dicatat dengan status `failed` (untuk retry di iterasi berikutnya).
- [ ] Satu tugas TIDAK akan pernah mendapat lebih dari 1 email per tahap pengingat.

**Success Metrics:**
- Email delivery rate ≥ 95%.
- Duplicate email rate = 0%.
- Email masuk ke Inbox (bukan Spam) ≥ 90%.

---

## 7. Non-Functional Requirements

- **NFR1 (Security):** Data *Tasks* dan *Attachments* wajib dilindungi dengan PostgreSQL Row Level Security (RLS). Pengguna A tidak boleh bisa mengakses *URL file* Pengguna B.
- **NFR2 (Performance):** Skor *Lighthouse* minimum 90 untuk *Performance*, *Accessibility*, dan *SEO*. Time to Interactive (TTI) < 1.5 detik (P90).
- **NFR3 (Scalability):** Arsitektur sistem *stateless* (Next.js) dan *serverless* agar bisa melayani ribuan pengguna konstan tanpa intervensi manual (DevOps *zero-touch*).
- **NFR4 (Reliability):** Uptime target 99.9%. Failure rate notifikasi email < 1%.

---

## 8. Assumptions & Dependencies

### Assumptions
- Pengguna memiliki akses internet yang stabil (minimum 3G) untuk upload file.
- Pengguna memiliki akun email aktif untuk menerima notifikasi dan Magic Link.
- Supabase Free Tier mampu menangani beban awal (≤ 500 pengguna aktif per bulan).
- Vercel Free Tier cukup untuk traffic awal (100GB bandwidth/bulan).

### Dependencies
| Dependency | Provider | Risiko Jika Gagal |
|---|---|---|
| Database & Auth | Supabase | Aplikasi tidak bisa berjalan sama sekali |
| Hosting & Serverless | Vercel | Aplikasi tidak bisa diakses |
| Email Service | Resend | Notifikasi otomatis tidak terkirim |
| DNS & Domain | Cloudflare / Custom | Email masuk spam jika SPF/DKIM tidak dikonfigurasi |

---

## 9. Out of Scope (MVP)

### A. Tidak di MVP, Tapi Direncanakan di Phase Berikutnya

Fitur-fitur berikut **bukan bagian MVP** tetapi sudah masuk roadmap pengembangan lanjutan. Lihat `Features.md` dan `Roadmap.md` untuk detail prioritas dan timeline.

| Fitur | Fase Rencana | Alasan Ditunda |
|---|---|---|
| 🚀 Sub-task / Checklist di dalam tugas | Phase 2 | MVP cukup dengan tugas flat (tanpa hierarki) |
| 🚀 Dashboard Statistik (grafik, chart) | Phase 2 | Membutuhkan akumulasi data historis dulu |
| 🚀 Pencarian Global / Filter | Phase 2 | Krusial saat tugas banyak, tapi MVP bisa berjalan tanpa ini |
| 🚀 Dark Mode toggle di UI | Phase 2 | CSS sudah disiapkan, tinggal menambah toggle UI |
| 🚀 Sistem Labeling / Tagging | Phase 2 | MVP menggunakan kolom `category` (text) sederhana |
| 🚀 Export Data (PDF/Excel) | Phase 2 | *Nice to have*, bukan kebutuhan inti |
| 🚀 Recycle Bin (Soft Delete UI) | Phase 2 | Logika `deleted_at` sudah direncanakan, UI belum |
| 🌟 Kolaborasi / Assign tugas ke pengguna lain | Phase 3 | Mengubah arsitektur RLS secara drastis |
| 🌟 Google Calendar Sync | Phase 3 | Ketergantungan API eksternal yang ketat |
| 🌟 Notifikasi WhatsApp | Phase 3 | Butuh infrastruktur non-serverless (VPS) |
| 🌟 Tugas Berulang (Recurring Tasks) | Phase 3 | Membutuhkan scheduler tambahan |

### B. Benar-Benar Di Luar Ruang Lingkup (Tidak Direncanakan Dalam Waktu Dekat)

Fitur-fitur berikut **tidak ada dalam roadmap** saat ini dan hanya akan dipertimbangkan jika produk berkembang ke skala SaaS/Enterprise:

- ❌ AI-powered features (Smart Reminder, Weekly Summary, NLP Task Creation) — *Lihat `FutureIdeas.md`*
- ❌ Mobile native app (iOS/Android) — fokus di responsive web
- ❌ Gamification (XP, Health Bar) — *Lihat `FutureIdeas.md`*
- ❌ Webhooks / REST API publik untuk integrasi pihak ketiga
- ❌ Self-hosted WhatsApp Gateway (Baileys) — ditolak karena bertentangan dengan arsitektur Serverless

---

## 10. Business Rules & Edge Cases

- **Rule 1:** Satu tugas bisa memiliki 0 atau >1 berkas pendukung (tabel `Attachments`).
- **Rule 2:** Jika tugas di-*delete*, record pada `Attachments` juga dihapus (*Cascade*), diikuti fungsi *trigger* untuk menghapus *file* fisik di Storage (menghemat biaya *cloud*).
- **Rule 3:** Tugas dengan status "Done" tidak akan menerima email pengingat lebih lanjut.
- **Rule 4:** Deadline yang sudah lewat tidak mengubah status otomatis — pengguna harus secara manual menyelesaikan atau mengarsipkan tugas.

**Edge Case:** Bagaimana jika pengguna mengubah *deadline* tugas yang pengingatnya sudah terkirim?
*Solusi:* Reset *record* di tabel `Notifications_Log` terkait task tersebut jika selisih *deadline* baru berbeda > 24 jam.

**Edge Case:** Bagaimana jika pengguna upload file 5MB pada jaringan sangat lambat?
*Solusi:* Upload langsung ke Supabase Storage dari client (bukan melalui Vercel), dengan progress indicator dan retry mechanism.
