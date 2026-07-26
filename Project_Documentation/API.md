# API & Server Actions (Project BesokAja)

Berhubung sistem dibangun menggunakan Next.js App Router (>= v14), kita mengurangi penggunaan API Routes (endpoint berbasis `/api/v1/xyz`) secara signifikan. Sebagian besar mutasi data di-*handle* melalui **Server Actions** Next.js, sementara Supabase secara inheren melayani pembacaan data langsung (PostgREST API) secara efisien dan aman. 

Adapun beberapa endpoint eksternal yang di-*expose* digunakan untuk integrasi *Webhooks* dan *Cron Jobs*.

## 1. Next.js Server Actions (Data Mutation Layer)

Berikut adalah daftar fungsi *backend* utama yang dipanggil dari antarmuka pengguna:

### `createTask(formData: FormData)`
- **Tujuan:** Menyimpan data tugas baru dan mengunggah berkas yang dilampirkan.
- **Validasi (Zod):** 
  - `title`: minimal 3 karakter.
  - `due_date`: harus format *datetime* ISO yang valid.
  - `priority`: Enum (Low, Medium, High).
- **Proses:** 
  1. Melakukan *auth check* (`supabase.auth.getUser()`).
  2. Jika ada berkas, panggil *helper* upload file ke *Supabase Storage Bucket*.
  3. Sisipkan row di tabel `tasks`.
  4. Ambil `task_id` baru, sisipkan row di tabel `attachments`.
  5. Panggil `revalidatePath('/dashboard')` untuk me-*refresh* UI tanpa interupsi.
- **Keamanan:** Dilindungi RLS di Supabase, dan token diverifikasi di server.

### `updateTaskStatus(taskId: string, status: string)`
- **Tujuan:** Untuk mengubah status tugas (*To-Do*, *In Progress*, *Done*). Dipanggil oleh komponen antarmuka yang reaktif (seperti *checkbox* / drag & drop).
- **Proses:** Memperbarui field `status` dan `updated_at`. Jika status menjadi `Done`, sistem harus mematikan pengingat lebih lanjut untuk *task* tersebut.

### `softDeleteTask(taskId: string)`
- **Tujuan:** Menghapus tugas tanpa menghilangkan rekam jejak dari DB utama.
- **Proses:** Memperbarui kolom `deleted_at` dengan *timestamp* saat ini. View pada UI secara otomatis difilter (`WHERE deleted_at IS NULL`). Tugas yang berumur >30 hari di *Recycle Bin* akan dihapus permanen oleh *database cron function* berkala (Phase 2).

## 2. API Routes / Supabase Edge Functions (Eksternal)

Karena Notifikasi berjalan secara otomatis (*headless*), komponen ini dipisah menjadi Edge Function agar tidak membebani limit durasi Vercel Free Tier.

### `POST /functions/v1/cron-email-reminder`
*(Endpoint berada di infrastruktur Supabase Edge Functions, di-trigger oleh `pg_cron` setiap 1 jam)*

**Tujuan:** Mengecek *tasks* yang akan jatuh tempo dan mengirim pengingat via Email/Resend.
**Authentication:** Dibatasi oleh *Secret Key* / Bearer token yang hanya diketahui oleh Supabase Cron.

**Logic / Alur Kerja (Pseudocode):**
```javascript
1. Verify Authorization Header (Service Role Key)
2. Fetch Tasks (PostgreSQL Query):
   "SELECT id, user_id, title, due_date FROM tasks 
    WHERE status != 'Done' 
    AND deleted_at IS NULL 
    AND due_date <= NOW() + INTERVAL '1 day' -- Untuk H-1"
3. For Each Task:
   a. Check jika sudah ada record di 'notifications_log' untuk 'H-1'
   b. Jika belum, ambil 'email' dari 'profiles'
   c. Call Resend API:
      POST https://api.resend.com/emails
      Body: {
         to: user.email,
         subject: "[BesokAja Reminder] - Tugas Mendekati Deadline: " + task.title,
         html: "<p>Jangan lupa mengerjakan tugas ini...</p>"
      }
   d. Jika Resend sukses, INSERT record ke 'notifications_log' ('H-1', 'email', 'sent', NOW())
4. Return 200 OK, Summary Count
```

## 3. Error Handling & Standard Responses
Ketika Server Actions atau API mengembalikan error, sistem tidak membiarkan server *crash*. Setiap *exception* di-*wrap* dan dikembalikan dengan format Zod Error atau pesan manusiawi:

```typescript
// Format Response Standar
type ServerResponse<T> = {
  success: boolean;
  data?: T;
  error?: string | ZodIssue[];
  status_code: number;
};
```
Sisi klien (React) akan menggunakan komponen `Toast` (shadcn/ui) untuk mem-visualisasikan error secara elegan jika mutasi data gagal.
