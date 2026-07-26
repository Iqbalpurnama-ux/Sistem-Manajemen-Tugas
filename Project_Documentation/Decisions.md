# Architecture Decision Records (ADRs) - Project BesokAja

Dokumen ini mencatat semua keputusan teknis besar (Architectural Decisions) yang diambil selama perancangan dan pengembangan aplikasi. Tujuannya adalah agar *developer* di masa depan memahami "Mengapa" suatu teknologi atau pola dipilih.

## ADR 001: Pemilihan Framework Frontend & Backend
**Status:** Diterima (Accepted)
**Konteks:** Kita membutuhkan *framework* yang mendukung *Serverless*, SEO, dan skalabilitas tinggi tanpa konfigurasi *build* rumit.
**Keputusan:** Menggunakan **Next.js (App Router)**.
**Alasan:**
- Mendukung *React Server Components* (RSC) untuk meminimalisir *client-side JavaScript*.
- Ekosistem *Server Actions* menyederhanakan *backend logic* tanpa butuh *endpoint* API (REST) yang panjang.
- Mudah di-deploy ke Vercel dengan *Zero-Configuration*.

## ADR 002: Manajemen Database & Otentikasi
**Status:** Diterima (Accepted)
**Konteks:** Penggunaan VPS dengan *Dockerized PostgreSQL* dinilai terlalu merepotkan untuk proyek yang dikelola satu orang, namun kita tetap butuh struktur *relational data*.
**Keputusan:** Menggunakan **Supabase**.
**Alasan:**
- Menyediakan PostgreSQL tulen dengan PostgREST API yang instan.
- Sistem Otentikasi bawaan yang mulus (*Magic Link* & OAuth).
- Mendukung perlindungan akses tingkat sel (Row Level Security) yang tidak dimiliki *NoSQL* seperti Firebase dengan kedalaman *query SQL*.

## ADR 003: Solusi Automasi Pengingat (Cron Job)
**Status:** Diterima (Accepted)
**Konteks:** Vercel *Hobby Tier* hanya mengizinkan 1 Cron Job per hari, padahal notifikasi *deadline* butuh dicek setidaknya 1 jam sekali.
**Keputusan:** Memindahkan eksekusi Cron ke **Supabase `pg_cron`** dikombinasikan dengan **Edge Functions**.
**Alasan:**
- `pg_cron` mampu memanggil *webhook/Edge Functions* lebih sering tanpa hambatan *tier* Vercel.
- Pemisahan beban kerja *background task* ini membuat UI/UX Next.js tidak terpengaruh jika proses *fetch* data lama.

## ADR 004: Penanganan Upload File Besar
**Status:** Diterima (Accepted)
**Konteks:** Vercel memiliki limit 10 detik *timeout* pada *Serverless Function*. File PDF/ZIP di atas 2MB bisa gagal diunggah lewat API Next.js pada jaringan yang lambat.
**Keputusan:** **Direct Client-to-Storage Uploads** menggunakan Supabase JS Client.
**Alasan:**
- Data tidak melewati *server* Vercel sama sekali. Next.js hanya mengurus metadata dan nama berkas setelah *upload* sukses. Ini menghilangkan risiko *Timeout* secara absolut.

## ADR 005: Penolakan Integrasi WhatsApp untuk MVP
**Status:** Ditolak Sementara (Rejected for MVP)
**Konteks:** Manajemen meminta integrasi gateway WhatsApp tidak resmi (seperti Baileys).
**Keputusan:** Ditunda hingga *Phase 3* / Menggunakan layanan pihak ketiga resmi.
**Alasan:**
- Menjalankan Baileys memerlukan arsitektur *long-running* Node.js, yang bertentangan dengan pilar *Serverless First* kita. Hal ini akan menambah biaya operasional infrastruktur (VPS) secara mendadak.
