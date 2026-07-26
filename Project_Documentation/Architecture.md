# Software Architecture (Project BesokAja)

## 1. High Level Architecture

Project BesokAja mengadopsi arsitektur *Serverless*, yang berarti tidak ada server konvensional (VPS) yang perlu dikelola secara konstan. Semua beban komputasi didistribusikan ke Vercel (Frontend & Serverless Functions) dan Supabase (Database, Auth, Storage, Edge Functions).

```mermaid
graph TD
    Client[Web Browser / Mobile Web]
    Vercel[Vercel Edge Network]
    NextApp[Next.js App Router]
    SBA[Supabase Auth]
    SBD[Supabase PostgreSQL]
    SBS[Supabase Storage]
    SBE[Supabase Edge Functions]
    Resend[Resend API]

    Client <-->|HTTPS / Server Actions| Vercel
    Vercel <--> NextApp
    
    NextApp -->|JWT| SBA
    NextApp -->|SQL Queries| SBD
    NextApp -->|Upload/Download| SBS
    
    SBD -->|pg_cron trigger| SBE
    SBE -->|Kirim Email| Resend
    Resend -->|Email Notification| Client
```

## 2. Layer Architecture (Next.js App Router)
Aplikasi memisahkan *Client Components* dan *Server Components* secara tegas untuk performa optimal.
- **Data Layer:** Supabase Database dengan Row Level Security (RLS). Tidak ada API terpisah yang meng-koneksikan DB ke *client* selain *Server Actions* Next.js.
- **Logic Layer (Backend):** *Server Actions* di Next.js menangani validasi (*Zod*) dan mutasi data (CRUD) di sisi server sebelum men-generate UI.
- **Presentation Layer (Frontend):** *React Server Components* (RSC) untuk mengambil data awal dengan sangat cepat, digabung dengan *Client Components* (hanya jika membutuhkan interaktivitas seperti *hooks*, *onClick*, atau animasi framer-motion).
- **Background Task Layer:** Supabase `pg_cron` secara periodik men-*trigger* Supabase Edge Functions. Ini memisahkan beban *background cron* dari Next.js sepenuhnya, menghindari batasan limit *timeout* Vercel (10 detik pada free tier) dan memusatkan komputasi yang berat secara efisien.

## 3. Data Flow: Task Creation
```mermaid
sequenceDiagram
    participant U as User
    participant CC as Client Component (Form)
    participant SA as Server Action (Next.js)
    participant SB as Supabase
    participant Storage as Supabase Storage

    U->>CC: Mengisi form & memilih file
    CC->>CC: Validasi Zod (Client-side)
    CC->>SA: Submit (Judul, Teks, File)
    SA->>Storage: Upload File (Jika ada)
    Storage-->>SA: Return URL/Path file
    SA->>SB: Insert ke tabel Tasks & Attachments
    SB-->>SA: Return Success (Task ID)
    SA-->>CC: Revalidate Path (Refresh Data)
    CC-->>U: Menampilkan pesan sukses & Update UI
```

## 4. Notification Flow (Automated Email)
Penggunaan Supabase native `pg_cron` jauh lebih andal dan murah dibandingkan Vercel Cron untuk penggunaan gratis/startup.
```mermaid
sequenceDiagram
    participant DB as pg_cron (Supabase DB)
    participant Edge as Supabase Edge Function
    participant DBTable as Tabel Tasks & Notifications_Log
    participant Resend as Resend API
    participant User as Email Pengguna

    loop Setiap 1 Jam
        DB->>Edge: Trigger eksekusi /api/notify
        Edge->>DBTable: Cek task mendekati deadline (belum terkirim)
        DBTable-->>Edge: Return array of Tasks
        opt Jika ada task
            Edge->>Resend: POST email payload
            Resend-->>Edge: Status OK (Email Queued)
            Edge->>User: Email Diterima
            Edge->>DBTable: Insert log ke Notifications_Log (Cegah ganda)
        end
    end
```

## 5. Justifikasi Pilihan Arsitektur (CTO Notes)
- **Kenapa bukan Vercel Cron?** Vercel Hobby tier hanya membolehkan 1 *cron job* per hari. Untuk pengingat H-1 atau H-3, pengecekan per jam jauh lebih presisi. Supabase memiliki `pg_cron` bawaan yang dapat menjalankan eksekusi lebih sering tanpa *upgrade* berbayar secara prematur.
- **Kenapa Server Actions (Next.js 14+)?** Mengurangi kerumitan pembuatan API route tradisional (REST) dan menghindari masalah state management global berkat kemampuan `revalidatePath()`.
- **Kenapa menggunakan Supabase Storage dan bukan S3?** Supabase Storage mempermudah konfigurasi RLS (Row Level Security), sehingga kita dapat menerapkan aturan bahwa *User* hanya dapat mengunduh berkas yang berhubungan dengan tugas milik mereka. Hal ini sulit dilakukan jika database dan file storage berada di provider terpisah.
