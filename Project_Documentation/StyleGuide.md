# Style Guide & Design System (Project OUTBREAK)

Antarmuka aplikasi dibangun dengan tema **Claymorphism**. Gaya ini menonjolkan elemen UI yang tampak seperti terbuat dari tanah liat (clay): menonjol dari layar (*extruded*), sudut yang membulat (rounded), tebal, dan memberikan pengalaman visual yang hangat, taktil, serta empuk.

Desain Sistem kita akan mengekstensi `shadcn/ui` (yang menggunakan TailwindCSS) dengan menambah token desain spesifik untuk mewujudkan *feel* Claymorphism tanpa membebani ukuran *bundle* CSS.

## 1. Brand Identity & Typography
- **Konsep:** Ramah, Empuk, Membantu, Tidak Kaku.
- **Font Utama (Heading & Angka/Statistik):** **Baloo 2** (Tebal, membulat).
- **Font Sekunder (Body & UI Element):** **Inter** (Bersih, keterbacaan tinggi pada layar padat teks).

## 2. Color Palette (Pastel HSL Tokens)
Kita menggunakan palet warna yang ceria dan menenangkan untuk mengurangi tingkat *anxiety* (kecemasan) pengguna terhadap *deadline* tugas.

| Nama Variabel CSS | Nilai Warna | Deskripsi |
|---|---|---|
| `--background` | `230 40% 95%` (#EBEAF5) | Latar belakang aplikasi utama (Light Lavender) |
| `--foreground` | `230 30% 20%` (#242742) | Teks utama, memastikan rasio kontras WCAG yang tinggi |
| `--primary` | `249 81% 71%` (#8C7CF0) | Aksen utama (Indigo/Ungu Terang) untuk Button, Checkbox aktif |
| `--primary-foreground` | `0 0% 100%` (#FFFFFF) | Teks di atas warna primary |
| `--priority-high` | `13 100% 72%` (#FF8F71) | Coral untuk peringatan / deadline dekat / prioritas tinggi |
| `--priority-medium` | `39 100% 69%` (#FFC960) | Kuning-Karamel untuk prioritas sedang / peringatan H-3 |
| `--priority-low/done`| `162 55% 55%` (#4FCDA8) | Mint untuk status selesai (Done) atau prioritas rendah |
| `--clay-shadow-light` | `rgba(255, 255, 255, 0.8)` | Bayangan terang untuk sudut kiri atas |
| `--clay-shadow-dark` | `rgba(180, 190, 210, 0.5)` | Bayangan gelap untuk sudut kanan bawah |

## 3. Claymorphism Rules & Tailwind Configuration

**Core CSS Utility (Sifat Claymorphism):**
- **Border Radius:** Sangat besar (misal: `rounded-3xl` / 24px - 32px).
- **Box Shadow:** Bayangan ganda (satu bayangan terang, satu bayangan gelap).
- **Inset Shadow:** Bayangan bagian dalam saat elemen diklik/ditekan (Efek taktil/squish).

*Konfigurasi pada `tailwind.config.ts`:*
```typescript
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        // Clay UI Dasar (Floating)
        'clay': '8px 8px 16px var(--clay-shadow-dark), -8px -8px 16px var(--clay-shadow-light)',
        // Clay UI Ditekan (Inset/Taktil)
        'clay-inset': 'inset 6px 6px 12px var(--clay-shadow-dark), inset -6px -6px 12px var(--clay-shadow-light)',
        // Clay UI Elevasi Tinggi (Modal)
        'clay-modal': '12px 12px 24px rgba(130, 140, 160, 0.4), -12px -12px 24px rgba(255,255,255, 0.9)',
      },
      borderRadius: {
        'clay': '1.5rem',  // 24px
        'clay-lg': '2rem', // 32px
      }
    }
  }
}
```

## 4. Component Design Rules
- **Buttons (`<Button>`):** Memiliki `shadow-clay` secara default, dan `shadow-clay-inset` saat state `:active` atau `onClick`. Hindari garis tepi keras (border solid), biarkan bayangan membentuk struktur elemen.
- **Cards (`<Card>`):** Sebagai kontainer tugas, menggunakan warna sedikit lebih terang dari background utama dengan `shadow-clay`. Saat di-hover, kartu sedikit naik `translate-y-[-2px]` dengan animasi transisi yang mulus.
- **Checkbox:** Bentuk lingkaran/kotak sangat bulat, memberi kesan 'kancing' yang empuk untuk ditekan (inset shadow).
- **Empty States:** Menggunakan ilustrasi 3D berestetika tanah liat pastel yang ceria dan satu paragraf teks memotivasi.

## 5. Micro Interactions
- **Transisi State:** Semua perubahan warna (hover, aktif, error) menggunakan durasi transisi `duration-300` agar terasa organik (tidak instan dan mengagetkan).
- **Notifikasi Berhasil (Toast):** Melayang dari bagian bawah halaman (slide up) berbentuk pil (pill-shaped) tebal dengan sentuhan animasi pantul (*bounce* / *spring*).

## 6. Accessibility & Responsiveness
- **Contrast Check:** Meski pastel, elemen berlabel 'bahaya/penting' (High Priority) harus jelas bagi pengguna *color-blind*. Gunakan kombinasi Icon dan Warna, bukan sekadar Warna.
- **Mobile First:** Sudut Claymorphism yang bulat sangat memakan ruang (padding) layar. Pada *viewport* kecil (`< 768px`), shadow dan radius akan sedikit diminimalisir agar tidak menutupi visibilitas konten utama (Teks Tugas).
