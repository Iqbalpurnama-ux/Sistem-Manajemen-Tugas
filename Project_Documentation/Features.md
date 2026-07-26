# Features Lifecycle & Matrix (Project BesokAja)

Dokumen ini membedah fitur-fitur yang ada, mengklasifikasikannya berdasarkan fase peluncuran (MVP hingga Future Vision), dan menganalisis nilai (Business Impact) serta biaya teknis (Effort/Complexity) dari sudut pandang *Chief Technology Officer (CTO)* dan *Product Manager*.

## 1. Analisis Metrik Prioritas

| Fitur | Tujuan & Benefit | Kompleksitas Teknis | Impact | Fase Rilis | Alasan (CTO Note) |
|---|---|---|---|---|---|
| **Otentikasi Kredensial & Sosial** | Memungkinkan akses privat. | Rendah (Supabase Auth) | Kritis | **✅ MVP** | Fondasi keamanan data. |
| **Manajemen Tugas Dasar (CRUD)** | Menyimpan data tugas (Teks, Prioritas, Tgl). | Sedang | Kritis | **✅ MVP** | Fungsionalitas inti aplikasi. Tanpa ini, aplikasi tidak berguna. |
| **Upload File Tugas & Download** | Memusatkan *file* di satu wadah. | Tinggi | Tinggi | **✅ MVP** | Pembeda utama (Value Proposition) dibanding ToDo list biasa. |
| **Automasi Email Reminder** | Mengingatkan *user* tanpa disuruh. | Sangat Tinggi (Cron) | Tinggi | **✅ MVP** | Fondasi *Smart App*. Dibutuhkan Edge Function untuk efisiensi biaya. |
| **Sistem Labeling (Kategori)** | Klasifikasi *task* (*work*, *study*). | Sedang (Tabel Pivot) | Sedang | **🚀 Phase 2** | Fitur penting tapi MVP bisa berjalan tanpa ini. |
| **Dark Mode & Tema** | Kenyamanan mata. | Sedang | Rendah | **🚀 Phase 2** | *Nice to have*. Butuh waktu ekstensi variabel warna Claymorphism. |
| **Pencarian Global (Global Search)** | Mencari *task* yang sudah lama tertumpuk. | Sedang | Tinggi | **🚀 Phase 2** | Krusial jika tugas sudah banyak. |
| **Kolaborasi / Pendelegasian (Assign)** | Mengubah aplikasi personal menjadi sistem tim. | Sangat Tinggi | Tinggi | **🌟 Phase 3** | Mengubah arsitektur *RLS security*. Risiko tinggi jika masuk ke MVP. |
| **WhatsApp Notifications** | Notifikasi lebih *real-time* dibanding email. | Sangat Tinggi | Sedang | **🌟 Phase 3** | Butuh infrastruktur non-serverless (VPS/Gateway pihak ke-3) yg rawan *block*. |
| **Google Calendar Sync** | Memusatkan jadwal di alat *default user*. | Tinggi (OAuth API) | Tinggi | **🌟 Phase 3** | Ketergantungan API eksternal yang ketat. |

## 2. Fitur Tambahan Usulan CTO (Dievaluasi)
Sebagai CTO, saya telah meninjau daftar "Ide Fitur Panjang" dari manajemen. Beberapa ide sangat bagus untuk retensi, sementara lainnya *overkill* untuk skala ini. 

*Berikut adalah fitur usulan baru (baru ditambahkan dalam proses desain) yang langsung didorong ke **🚀 Phase 2** karena perbandingan Effort vs Impact-nya sangat bagus:*

- **Recycle Bin (Soft Delete):** *Effort* sangat kecil (hanya menambah filter `WHERE deleted_at IS NULL`), tetapi mencegah kemarahan *user* akibat salah tekan (UX Impact besar).
- **Audit Log (Activity Timeline):** *Effort* rendah. Setiap Server Actions tinggal memicu *Insert* ke tabel `activity_logs`. Sangat bermanfaat jika ada fitur kolaborasi di masa depan ("Siapa yang mengubah *deadline*?").
- **Pomodoro Timer Terintegrasi:** *Effort* sedang (Full Frontend State). Pengguna sangat menyukainya karena mereka bisa mengunci waktu untuk fokus pada satu tugas.

*Dan berikut adalah fitur yang **DITOLAK** atau di-freeze untuk diimplementasikan di masa depan:*
- ❌ **Socket Server Sendiri (Realtime Custom):** *Alasan teknis:* Kita menargetkan *Serverless*. Mengelola soket sendiri butuh mesin konstan. Jika butuh realtime, kita *wajib* menggunakan fitur Supabase Realtime bawaan PostgreSQL.
- ❌ **Worker 24 Jam untuk Scraping / Gateway Lokal:** *Alasan teknis:* Menghancurkan pilar *Serverless First* kita dan menambah biaya Ops. Semua harus di-*trigger* lewat Cron atau Event, bukan *long-polling*.

## 3. Matriks RICE (Reach, Impact, Confidence, Effort) - MVP
*Metode perhitungan prioritas internal:*
- *Auth System:* R: 10, I: 10, C: 10, E: 2 -> Score 500 (Paling Utama)
- *CRUD Task:* R: 10, I: 10, C: 9, E: 3 -> Score 300 
- *Email Reminder:* R: 8, I: 9, C: 7, E: 5 -> Score 100
- *File Attachments:* R: 6, I: 7, C: 8, E: 6 -> Score 56

*(Kesimpulan: Selesaikan modul Auth dan CRUD terlebih dahulu secara sempurna sebelum membangun sistem notifikasi).*
