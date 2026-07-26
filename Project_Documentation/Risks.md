# Risk Analysis & Mitigation (Project BesokAja)

Sebagai *Startup* atau proyek skala menengah yang dipelihara oleh sumber daya tunggal (Single Developer), kita harus memitigasi risiko secara brutal sejak awal.

## 1. Matriks Risiko

| Kategori Risiko | Deskripsi Skenario (Apa yang bisa salah?) | Dampak | Probabilitas | Strategi Mitigasi (Pencegahan & Solusi) |
|---|---|---|---|---|
| **Teknis (Infrastruktur)** | Vercel membatasi waktu eksekusi *Serverless Function* (Timeout > 10s) untuk proses unggah (upload) file berukuran besar. | Sangat Tinggi | Tinggi | Proses unggah file diubah menggunakan *Supabase JS Client* dari sisi *frontend* langsung menuju Storage Bucket menggunakan metode *Multipart Uploads*. Vercel API tidak digunakan untuk *proxying* file besar. |
| **Teknis (Automasi)** | *Cron Job* gagal menyala atau mengirim email ganda berulang-ulang ke pengguna yang menyebabkan keluhan/spam massal. | Tinggi | Sedang | Membuat tabel `notifications_log` di *database*. Edge Function **Wajib** mengecek tabel ini sebelum menembak Resend API. Jika *record* tahap 'H-1' dari Task_id tersebut sudah ada, proses otomatis dibatalkan (Idempotent). |
| **Bisnis (Biaya Cloud)** | Lonjakan *Traffic* dadakan (DDoS) atau *user abuse* pada unggah file yang menyebabkan tagihan Supabase / Resend melambung tinggi. | Tinggi | Rendah | Mengaktifkan perlindungan *Spend Cap* (Batas Belanja) di konsol Supabase (menghentikan layanan jika free/pro tier limit tercapai). Mengatur ukuran maksimal file pada RLS sebesar 5MB, serta pembatasan kecepatan (*Rate Limit*) dengan Upstash di Vercel Middleware. |
| **Keamanan (Data Breach)** | Pengguna meretas *Endpoint* API untuk melihat tugas, profil, atau mengunduh berkas privat (KTP/Tugas) pengguna lain. | Sangat Tinggi | Rendah | Tidak ada satupun *endpoint API* yang membaca langsung dari *database* tanpa autentikasi. Semua akses (baik UI maupun API eksternal) dibatasi penuh secara mutlak oleh *Row Level Security* (RLS) di lapisan PostgreSQL (Supabase). |
| **UX (Operasional)** | Email *reminder* yang dikirim masuk ke *Spam Folder* klien (Gmail/Yahoo), menyebabkan *user* komplain gagal diingatkan. | Sedang | Sedang | Menyiapkan domain kustom (contoh: `besokaja.com`) dan melakukan otentikasi domain tingkat tinggi di Resend (menambahkan *records* `DKIM`, `SPF`, dan `DMARC` pada penyedia DNS, misalnya Cloudflare) sebelum aplikasi digunakan untuk produksi ril. |
| **Vendor Lock-in (Teknis)** | Supabase atau Vercel tiba-tiba menaikkan harga langganan atau menghentikan layanan (Sunsetting). | Sedang | Sangat Rendah | Seluruh ekosistem Supabase bersifat *Open Source*. Jika terjadi masalah, infrastruktur Database dapat di-*host* mandiri (Self-hosting via Docker/VPS) karena intinya adalah PostgreSQL standar. Vercel dapat diganti dengan VPS yang menjalankan kontainer NodeJS standar jika sangat mendesak. |

## 2. Technical Debt Awareness
Saat ini, tidak ada *Technical Debt* (Utang Teknis) yang berarti karena proyek dirancang dari awal (Scratch). Namun, ada beberapa hal yang jika dibiarkan akan menjadi *Technical Debt* di masa depan:
- **Redundansi Kode UI:** Jika pengembang sering *copy-paste* utility class Tailwind (contohnya properti *Claymorphism* panjang), maka ini akan jadi sulit dirawat. **Mitigasi:** Ekstrak kelas-kelas tersebut menjadi *Utility Functions* (contoh: `cn()`) atau integrasikan langsung ke *Tailwind Config Theme*, serta gunakan *Reusable Components*.
- **Storage Terbengkalai:** Jika pengguna menghapus tugas, tetapi *file* fisiknya tidak ikut terhapus di *Bucket*. **Mitigasi:** Gunakan Trigger PostgreSQL (`ON DELETE CASCADE`) untuk memanggil API penghapusan objek di bucket Supabase Storage, mencegah *zombie files* memakan kuota *cloud* yang mahal.
