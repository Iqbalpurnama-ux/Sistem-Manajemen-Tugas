# UI Components Library (Project BesokAja)

Aplikasi dibangun di atas pondasi `shadcn/ui` (Radix UI + TailwindCSS) yang telah dimodifikasi (overridden) agar sesuai dengan desain **Claymorphism**. Pendekatan *headless UI* ini memastikan bahwa meskipun tampilannya kustom (bulat dan membal), elemen tetap memiliki standar aksesibilitas web (WAI-ARIA) yang sempurna.

## 1. Daftar Komponen Inti

### `ClayButton`
Komponen tombol standar untuk tindakan utama.
- **Purpose:** Memulai mutasi data, submit form, dan navigasi (CTA).
- **Props Khusus:** `variant: 'default' | 'danger' | 'success' | 'ghost'`, `size: 'sm' | 'md' | 'lg' | 'icon'`, `isLoading: boolean`.
- **State:** *Idle*, *Hover* (sedikit terangkat), *Active* (efek `clay-inset` shadow yang memberi ilusi ditekan ke dalam), *Loading* (disabled, icon putar), *Disabled* (abu-abu, tanpa shadow).
- **Accessibility:** Didukung *focus-visible* dari Radix, kompatibel dengan *screen-reader*, aria-label.

### `TaskCard`
Komponen *card* spesifik untuk menampilkan suatu tugas.
- **Purpose:** Menyajikan ringkasan tugas (Judul, prioritas, jumlah lampiran, checkbox penyelesaian) di halaman *Dashboard*.
- **Props:** `task: TaskObject`, `onCheck: (id) => void`, `onClick: (id) => void` (untuk membuka modal detail).
- **Variant:** Warna latar belakang kartu sedikit berubah tergantung *Priority* (merah muda untuk prioritas tinggi) atau batas waktu (*red tint* jika sisa < 24 jam).
- **Micro-Interaction:** Saat kursor (hover) menyentuh *card*, muncul tombol untuk *delete* atau *edit* secara halus (*fade in*).

### `ClayCheckbox`
Pengganti *input type checkbox* tradisional.
- **Purpose:** Menandai tugas sebagai selesai (*Done*).
- **State:** *Checked* (Warna hijau mint, inset shadow), *Unchecked* (Warna putih, ekstrusi shadow).
- **Animation:** Saat ditekan, ikon cek (ceklis) membesar sesaat (*spring scale up*) lalu kembali normal, dan teks tugas di sebelahnya dicoret (strikethrough) dengan animasi.

### `FileDropzone`
Area seret dan lepas (*drag & drop*) untuk melampirkan berkas.
- **Purpose:** Menerima input berkas dari pengguna.
- **State:** *Idle* (Garis putus-putus bulat tebal), *DragActive* (Warna berubah biru pastel, inset shadow seolah tertarik ke dalam), *Uploading* (Menampilkan *progress bar* melingkar), *Error* (Menampilkan teks merah tebal jika melebihi limit ukuran).

### `StatusPill` / `Badge`
Penanda visual untuk label dan prioritas.
- **Purpose:** Identifikasi visual cepat saat melakukan pemindaian (scanning) mata pada daftar tugas.
- **Variant:** Sesuai warna label tugas. Berbentuk elips sempurna (rounded-full).

### `Toast` / `Snackbar`
Notifikasi mengambang (floating).
- **Purpose:** Memberikan umpan balik instan atas suatu operasi (e.g. "Tugas Berhasil Disimpan").
- **Animasi:** Muncul dari bagian bawah ke tengah (Slide Up), memiliki bayangan tebal yang mengambang ekstrim. Otomatis hilang dalam 3 detik, kecuali kursor berada di atasnya (pause on hover).

## 2. Aturan Penggunaan Komponen (Component Rules)
- **Hindari Elemen Datar:** Jika sebuah elemen dirancang untuk dapat diklik (interaktif), ia **wajib** memiliki volume visual (shadow 3D/Clay). Elemen yang benar-benar rata (flat) secara psikologis mengisyaratkan bahwa itu hanyalah teks atau elemen pasif.
- **Konsistensi Radius:** Semua komponen (bahkan input *text field*) wajib menggunakan radius sudut minimal `1rem` (16px) hingga `2rem` (32px) agar tema membulatnya tidak rusak oleh sudut tajam yang tiba-tiba.
- **Aksesibilitas Warna (Contrast):** Jika menggunakan `variant='danger'` (warna latar belakang pastel merah/koral), teks di dalamnya harus tetap jelas (seperti *dark gray* atau `#242742`), jangan memaksa teks berwarna putih jika tidak memenuhi skor kontras WCAG 2.1 (AA).
