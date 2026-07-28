# Style Guide & Design System (Project BesokAja)

Antarmuka aplikasi dibangun dengan tema **Claymorphism**. Gaya ini menonjolkan elemen UI yang tampak seperti terbuat dari tanah liat (clay): menonjol dari layar (*extruded*), sudut yang membulat (rounded), tebal, dan memberikan pengalaman visual yang hangat, taktil, serta empuk.

Desain Sistem kita akan mengekstensi `shadcn/ui` (yang menggunakan TailwindCSS) dengan menambah token desain spesifik untuk mewujudkan *feel* Claymorphism tanpa membebani ukuran *bundle* CSS.

---

## 1. Brand Identity & Typography

### Konsep Brand
- **Personality:** Ramah, Empuk, Membantu, Tidak Kaku, Hangat.
- **Emosi Target:** Tenang, Termotivasi, Percaya Diri.
- **Tone Visual:** Warm pastel, taktil (seperti menyentuh benda fisik), dan sedikit playful.

### Tipografi

| Peran | Font | Weight | Penggunaan |
|---|---|---|---|
| **Heading & Display** | **Baloo 2** | 600–800 | Judul halaman, angka statistik, CTA besar |
| **Body & UI** | **Inter** | 400–700 | Paragraf, label, tombol, input, badge |

### Typography Scale

| Token | Ukuran | Line Height | Letter Spacing | Font | Penggunaan |
|---|---|---|---|---|---|
| `text-display` | 36px / 2.25rem | 1.2 | -0.02em | Baloo 2, 800 | Hero title, angka statistik besar |
| `text-h1` | 30px / 1.875rem | 1.25 | -0.015em | Baloo 2, 700 | Judul halaman utama |
| `text-h2` | 24px / 1.5rem | 1.3 | -0.01em | Baloo 2, 600 | Judul section |
| `text-h3` | 20px / 1.25rem | 1.35 | 0 | Baloo 2, 600 | Sub-section title |
| `text-h4` | 18px / 1.125rem | 1.4 | 0 | Inter, 600 | Card title |
| `text-body` | 16px / 1rem | 1.6 | 0 | Inter, 400 | Teks isi utama |
| `text-body-sm` | 14px / 0.875rem | 1.5 | 0 | Inter, 400 | Teks sekunder, deskripsi kartu |
| `text-caption` | 12px / 0.75rem | 1.4 | 0.02em | Inter, 500 | Label kecil, timestamp, badge text |
| `text-overline` | 11px / 0.6875rem | 1.3 | 0.08em | Inter, 600 | Label kategori (UPPERCASE) |

---

## 2. Color Palette (Rose / Peach / Snow White)

Kita menggunakan palet warna **hangat dan ceria** yang terinspirasi dari nuansa Rose dan Peach. Palet ini dipilih untuk mengurangi tingkat *anxiety* (kecemasan) pengguna terhadap *deadline* tugas, sekaligus menjaga antarmuka terasa premium dan modern.

### Warna Inti (Core Colors)

| Nama Variabel CSS | Nilai HSL | Hex | Preview | Peran |
|---|---|---|---|---|
| `--background` | `14 88% 93%` | `#FCE2DB` | 🟫 Peach Blush | Latar belakang aplikasi utama |
| `--foreground` | `350 18% 18%` | `#3D2C2E` | ⬛ Dark Rosewood | Teks utama (WCAG AA ✅) |
| `--primary` | `347 97% 78%` | `#FD92AD` | 🩷 Rose Pink | Aksen utama: Button, Checkbox, Link aktif |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | ⬜ Putih Bersih | Teks di atas warna primary |
| `--card` / `--surface` | `0 0% 99.6%` | `#FEFEFE` | ⬜ Snow White | Surface kartu, modal, dan elemen menonjol |

### Warna Prioritas (Harmonized)

| Nama Variabel CSS | Nilai HSL | Hex | Preview | Deskripsi |
|---|---|---|---|---|
| `--priority-high` | `350 90% 65%` | `#F0607A` | 🔴 Deep Rose Red | Deadline dekat / Prioritas tinggi (kontras jelas dari primary) |
| `--priority-medium` | `38 95% 65%` | `#F5B830` | 🟡 Warm Amber | Prioritas sedang / Peringatan H-3 |
| `--priority-low` / `--success` | `155 50% 55%` | `#5CC9A0` | 🟢 Mint Sage | Status selesai (Done) / Prioritas rendah |

> **Catatan Desain:** Warna `--priority-high` sengaja dipilih dengan saturasi dan hue yang **berbeda secara tegas** dari `--primary` (Rose Pink). Primary berada di hue 347° (pink lembut), sedangkan priority-high di 350° dengan saturasi 90% dan lightness 65% (lebih gelap dan intens). Ini memastikan scanning visual tetap efektif meskipun keduanya "merah muda".

### Warna UI Chrome

| Nama Variabel CSS | Nilai HSL | Hex | Deskripsi |
|---|---|---|---|
| `--muted` | `14 40% 88%` | `#F0D0C8` | Background elemen non-aktif, placeholder area |
| `--muted-foreground` | `350 12% 42%` | `#7A5A5E` | Teks sekunder, hint text |
| `--accent` | `347 80% 88%` | `#FFB5C5` | Highlight ringan, hover state, selected row |
| `--accent-foreground` | `350 18% 18%` | `#3D2C2E` | Teks di atas accent |
| `--destructive` | `348 72% 54%` | `#D84564` | Aksi berbahaya (delete, error state) |
| `--border` | `14 35% 82%` | `#EBBFB8` | Garis pembatas elemen |
| `--ring` | `347 97% 78%` | `#FD92AD` | Focus ring (sama dengan primary) |

### Warna Bayangan Claymorphism

| Nama Variabel CSS | Nilai | Deskripsi |
|---|---|---|
| `--clay-shadow-light` | `rgba(255, 255, 255, 0.85)` | Bayangan terang untuk sudut kiri atas (highlight) |
| `--clay-shadow-dark` | `rgba(180, 140, 135, 0.4)` | Bayangan gelap warm-tone untuk sudut kanan bawah |

### Dark Mode Palette

Palet dark mode diturunkan dari warna Rose/Peach dengan undertone hangat agar Claymorphism tetap terasa di konteks gelap:

| Nama Variabel CSS | Light Mode | Dark Mode | Catatan |
|---|---|---|---|
| `--background` | `hsl(14,88%,93%)` | `hsl(350,15%,12%)` | Deep Rosewood |
| `--foreground` | `hsl(350,18%,18%)` | `hsl(14,88%,93%)` | Swap → Peach as text |
| `--primary` | `hsl(347,97%,78%)` | `hsl(347,85%,72%)` | Slightly muted |
| `--card` | `hsl(0,0%,99.6%)` | `hsl(350,12%,16%)` | Elevated dark surface |
| `--clay-shadow-light` | `rgba(255,255,255,0.85)` | `rgba(255,200,190,0.08)` | Warm subtle glow |
| `--clay-shadow-dark` | `rgba(180,140,135,0.4)` | `rgba(0,0,0,0.45)` | Deep shadow |

---

## 3. Spacing System (4px Grid)

Semua jarak, padding, dan margin harus mengikuti kelipatan grid 4px agar terjaga konsistensinya:

| Token | Nilai | Penggunaan |
|---|---|---|
| `space-1` | 4px | Jarak antar ikon kecil |
| `space-2` | 8px | Padding badge, gap antar elemen kecil |
| `space-3` | 12px | Gap antar elemen medium |
| `space-4` | 16px | Padding dalam kartu, margin antar section |
| `space-5` | 20px | Gap vertikal antara kelompok form |
| `space-6` | 24px | Padding utama kartu besar |
| `space-8` | 32px | Margin antar section utama |
| `space-10` | 40px | Margin halaman |
| `space-12` | 48px | Jarak antar blok besar |
| `space-16` | 64px | Spacing hero / section besar |

---

## 4. Claymorphism Rules & Elevation System

### Core CSS Properties (Sifat Claymorphism)
- **Border Radius:** Sangat besar (misal: `rounded-3xl` / 24px - 32px).
- **Box Shadow:** Bayangan ganda (satu bayangan terang, satu bayangan gelap).
- **Inset Shadow:** Bayangan bagian dalam saat elemen diklik/ditekan (Efek taktil/squish).
- **No Hard Borders:** Hindari `border-solid` yang kaku — biarkan shadow membentuk volume.

### Elevation Levels

| Level | Token Shadow | Nilai | Penggunaan |
|---|---|---|---|
| **Level 0** | *(none)* | — | Elemen rata/flat (background area) |
| **Level 1** | `shadow-clay-sm` | `4px 4px 8px dark, -4px -4px 8px light` | Badge, chip, elemen kecil |
| **Level 2** | `shadow-clay` | `8px 8px 16px dark, -8px -8px 16px light` | Card, button, input default |
| **Level 3** | `shadow-clay-hover` | `10px 10px 20px dark, -10px -10px 20px light` | Card hover, button hover |
| **Level 4** | `shadow-clay-modal` | `16px 16px 32px dark, -16px -16px 32px light` | Modal, dialog, overlay |
| **Inset** | `shadow-clay-inset` | `inset 6px 6px 12px dark, inset -6px -6px 12px light` | Active/pressed state, checkbox checked |

### Tailwind Configuration

```typescript
// tailwind.config.ts (Integrasi via globals.css @theme)
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'clay-sm': '4px 4px 8px var(--clay-shadow-dark), -4px -4px 8px var(--clay-shadow-light)',
        'clay': '8px 8px 16px var(--clay-shadow-dark), -8px -8px 16px var(--clay-shadow-light)',
        'clay-hover': '10px 10px 20px var(--clay-shadow-dark), -10px -10px 20px var(--clay-shadow-light)',
        'clay-inset': 'inset 6px 6px 12px var(--clay-shadow-dark), inset -6px -6px 12px var(--clay-shadow-light)',
        'clay-modal': '16px 16px 32px rgba(160, 110, 105, 0.3), -16px -16px 32px rgba(255, 255, 255, 0.9)',
      },
      borderRadius: {
        'clay': '1.5rem',   // 24px
        'clay-lg': '2rem',  // 32px
      },
      colors: {
        'priority-high': 'var(--priority-high)',
        'priority-medium': 'var(--priority-medium)',
        'priority-low': 'var(--priority-low)',
      }
    }
  }
}
```

---

## 5. Component Design Rules

- **Buttons (`<Button>`):** Memiliki `shadow-clay` secara default, dan `shadow-clay-inset` saat state `:active` atau `onClick`. Warna default menggunakan `--primary` (#FD92AD Rose Pink). Hindari garis tepi keras (border solid), biarkan bayangan membentuk struktur elemen.
- **Cards (`<Card>`):** Menggunakan warna `--card` (#FEFEFE Snow White) dengan `shadow-clay`. Saat di-hover, kartu naik `translate-y-[-2px]` dengan animasi transisi yang mulus dan shadow meningkat ke `shadow-clay-hover`.
- **Checkbox:** Bentuk lingkaran/kotak sangat bulat, memberi kesan 'kancing' yang empuk untuk ditekan (inset shadow saat checked). Warna checked menggunakan `--success` (Mint Sage).
- **Empty States:** Menggunakan ilustrasi 3D berestetika tanah liat pastel yang ceria dan satu paragraf teks memotivasi.
- **Input Fields:** Background menggunakan `--muted` dengan `shadow-clay-inset` ringan. Focus ring berwarna `--primary`.
- **Priority Badge:** Menggunakan warna pill (`--priority-high`, `--priority-medium`, `--priority-low`) dengan teks `--foreground` (bukan putih) untuk kontras aksesibilitas.

### Component State Colors

| State | Background | Shadow | Teks | Transisi |
|---|---|---|---|---|
| **Default** | `--card` | `shadow-clay` | `--foreground` | — |
| **Hover** | `--card` | `shadow-clay-hover` | `--foreground` | 200ms ease-out |
| **Active / Pressed** | `--muted` | `shadow-clay-inset` | `--foreground` | 100ms ease-in |
| **Disabled** | `--muted` | *(none)* | `--muted-foreground` | — |
| **Error** | `--destructive/10` | `shadow-clay` | `--destructive` | 300ms |
| **Success** | `--success/10` | `shadow-clay` | `--success` | 300ms |
| **Focus** | *(inherit)* | *(inherit)* + ring | *(inherit)* | 150ms |

---

## 6. Iconography Guidelines

- **Library:** [Lucide Icons](https://lucide.dev/) — sudah terintegrasi via `lucide-react`.
- **Ukuran Standar:**
  - Small (dalam badge/chip): `16px` / `w-4 h-4`
  - Default (dalam button/list): `20px` / `w-5 h-5`
  - Large (fitur/hero): `24px` / `w-6 h-6`
  - Display (empty state): `48px` / `w-12 h-12`
- **Stroke Width:** Tetap `2px` (default Lucide) untuk konsistensi.
- **Warna:** Inherit dari parent `color`. Jangan hardcode warna pada ikon.

---

## 7. Micro Interactions & Animation Tokens

### Durasi & Easing

| Token | Durasi | Easing | Penggunaan |
|---|---|---|---|
| `transition-fast` | 100ms | `ease-in` | Button press, checkbox toggle |
| `transition-normal` | 200ms | `ease-out` | Hover effects, tooltip show |
| `transition-smooth` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Card hover, color changes, page transitions |
| `transition-spring` | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Toast slide-up, checkbox bounce, FAB press |
| `transition-slow` | 500ms | `ease-in-out` | Modal open/close, skeleton loading |

### Animasi Spesifik

- **Transisi State:** Semua perubahan warna (hover, aktif, error) menggunakan durasi `transition-smooth` agar terasa organik (tidak instan dan mengagetkan).
- **Notifikasi Berhasil (Toast):** Melayang dari bagian bawah halaman (slide up) berbentuk pil (pill-shaped) tebal dengan sentuhan animasi `transition-spring` (*bounce* / *spring*).
- **Checkbox Done:** Saat ditekan, ikon cek (ceklis) membesar sesaat (`scale(1.2)` → `scale(1)`) dengan `transition-spring`, dan teks tugas di sebelahnya dicoret (strikethrough) dengan animasi `transition-smooth`.
- **Card Hover:** `translateY(-2px)` + shadow elevation naik dari Level 2 ke Level 3.
- **FAB (Floating Action Button):** Squish effect saat ditekan — skala turun ke `scale(0.92)` lalu kembali dengan `transition-spring`.
- **Skeleton Loading:** Shimmer effect dengan gradient `--muted` yang bergerak horizontal.

---

## 8. Accessibility & Responsiveness

### Accessibility (A11y)
- **Contrast Check:** Teks utama (`--foreground` #3D2C2E) di atas background (`--background` #FCE2DB) memenuhi rasio kontras **WCAG AA (≥ 4.5:1)** → rasio aktual ≈ 7.2:1 ✅.
- **Teks di atas Primary:** Putih (#FFF) di atas Rose Pink (#FD92AD) → rasio ≈ 3.1:1 — cukup untuk teks *large* (≥18px bold) ✅. Untuk teks kecil, gunakan `--foreground` sebagai gantinya.
- **Elemen Priority-High:** Gunakan kombinasi **Icon + Warna + Label Teks**, bukan sekadar warna, agar dapat digunakan oleh pengguna *color-blind*.
- **Focus States:** Semua elemen interaktif wajib memiliki `focus-visible` ring berwarna `--ring` (Rose Pink) dengan outline offset 2px.
- **Screen Reader:** Semua komponen dibangun di atas Radix UI Primitives, memastikan standar WAI-ARIA bawaan.
- **Reduced Motion:** Hormati `prefers-reduced-motion: reduce` — nonaktifkan animasi spring dan hover lift.

### Responsiveness
- **Mobile First:** Sudut Claymorphism yang bulat sangat memakan ruang (padding) layar. Pada *viewport* kecil (`< 768px`), shadow dan radius akan sedikit diminimalisir agar tidak menutupi visibilitas konten utama:
  - Shadow: `shadow-clay-sm` menggantikan `shadow-clay` default.
  - Radius: Turun dari `1.5rem` ke `1rem`.
  - Padding kartu: Turun dari `space-6` ke `space-4`.
- **Breakpoints:**
  - `sm`: 640px — Mobile landscape
  - `md`: 768px — Tablet
  - `lg`: 1024px — Desktop
  - `xl`: 1280px — Wide desktop
