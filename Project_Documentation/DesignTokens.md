# Design Tokens Reference (Project BesokAja)

Dokumen ini adalah referensi teknis lengkap untuk semua *design tokens* — warna, tipografi, spacing, shadow, radius, dan animasi — yang digunakan di seluruh aplikasi. Setiap token dipetakan dari **CSS Variable** → **Tailwind Class** → **Komponen**.

---

## 1. Color Tokens

### Core Brand

| CSS Variable | Tailwind Class | Light Mode | Dark Mode | Komponen |
|---|---|---|---|---|
| `--background` | `bg-background` | `hsl(14,88%,93%)` #FCE2DB | `hsl(350,15%,12%)` | Body, page background |
| `--foreground` | `text-foreground` | `hsl(350,18%,18%)` #3D2C2E | `hsl(14,88%,93%)` | Semua teks utama |
| `--primary` | `bg-primary`, `text-primary` | `hsl(347,97%,78%)` #FD92AD | `hsl(347,85%,72%)` | Button, checkbox active, link, ring |
| `--primary-foreground` | `text-primary-foreground` | `#FFFFFF` | `hsl(350,15%,10%)` | Teks di atas primary |
| `--card` | `bg-card` | `hsl(0,0%,99.6%)` #FEFEFE | `hsl(350,12%,16%)` | Card, modal, surface |
| `--card-foreground` | `text-card-foreground` | `hsl(350,18%,18%)` | `hsl(14,60%,90%)` | Teks di dalam card |

### Priority & Status

| CSS Variable | Tailwind Class | Light Mode | Dark Mode | Komponen |
|---|---|---|---|---|
| `--priority-high` | `bg-priority-high`, `text-priority-high` | `hsl(350,90%,65%)` #F0607A | `hsl(350,80%,60%)` | Badge High, card left border |
| `--priority-medium` | `bg-priority-medium`, `text-priority-medium` | `hsl(38,95%,65%)` #F5B830 | `hsl(38,85%,58%)` | Badge Medium |
| `--priority-low` | `bg-priority-low`, `text-priority-low` | `hsl(155,50%,55%)` #5CC9A0 | `hsl(155,45%,48%)` | Badge Low, checkbox Done |
| `--success` | `bg-success`, `text-success` | `hsl(155,50%,55%)` #5CC9A0 | `hsl(155,45%,48%)` | Toast success, Done state |
| `--destructive` | `bg-destructive`, `text-destructive` | `hsl(348,72%,54%)` #D84564 | `hsl(348,65%,50%)` | Delete button, error toast |

### UI Chrome

| CSS Variable | Tailwind Class | Light Mode | Dark Mode | Komponen |
|---|---|---|---|---|
| `--muted` | `bg-muted` | `hsl(14,40%,88%)` #F0D0C8 | `hsl(350,10%,22%)` | Disabled bg, skeleton |
| `--muted-foreground` | `text-muted-foreground` | `hsl(350,12%,42%)` #7A5A5E | `hsl(14,30%,65%)` | Hint text, timestamps |
| `--accent` | `bg-accent` | `hsl(347,80%,88%)` #FFB5C5 | `hsl(347,40%,25%)` | Hover row, selected item |
| `--accent-foreground` | `text-accent-foreground` | `hsl(350,18%,18%)` | `hsl(14,60%,90%)` | Teks di atas accent |
| `--border` | `border-border` | `hsl(14,35%,82%)` #EBBFB8 | `hsl(350,10%,22%)` | Garis pemisah, input border |
| `--input` | `bg-input` | `hsl(14,35%,82%)` | `hsl(350,10%,22%)` | Input field border |
| `--ring` | `ring-ring` | `hsl(347,97%,78%)` #FD92AD | `hsl(347,85%,72%)` | Focus ring |

---

## 2. Shadow Tokens (Claymorphism)

| CSS Variable | Tailwind Class | Nilai | Penggunaan |
|---|---|---|---|
| `--shadow-clay-sm` | `shadow-clay-sm` | `4px 4px 8px dark, -4px -4px 8px light` | Badge, chip, elemen kecil |
| `--shadow-clay` | `shadow-clay` | `8px 8px 16px dark, -8px -8px 16px light` | Card, button, input (default) |
| `--shadow-clay-hover` | `shadow-clay-hover` | `10px 10px 20px dark, -10px -10px 20px light` | Card hover, button hover |
| `--shadow-clay-inset` | `shadow-clay-inset` | `inset 6px 6px 12px dark, inset -6px -6px 12px light` | Active/pressed, checkbox checked |
| `--shadow-clay-modal` | `shadow-clay-modal` | `16px 16px 32px dark, -16px -16px 32px light` | Modal, dialog, floating elements |

### Shadow Source Variables

| CSS Variable | Light Mode | Dark Mode |
|---|---|---|
| `--clay-shadow-light` | `rgba(255, 255, 255, 0.85)` | `rgba(255, 200, 190, 0.08)` |
| `--clay-shadow-dark` | `rgba(180, 140, 135, 0.4)` | `rgba(0, 0, 0, 0.45)` |

---

## 3. Radius Tokens

| CSS Variable | Tailwind Class | Nilai | Penggunaan |
|---|---|---|---|
| `--radius-sm` | `rounded-sm` | `0.75rem` (12px) | Chip, small badge |
| `--radius-md` | `rounded-md` | `1rem` (16px) | Input, small button |
| `--radius-lg` / `--radius-clay` | `rounded-lg`, `rounded-clay` | `1.5rem` (24px) | Card, button, standard clay |
| `--radius-xl` / `--radius-clay-lg` | `rounded-xl`, `rounded-clay-lg` | `2rem` (32px) | Modal, large card |
| `--radius-2xl` | `rounded-2xl` | `2.5rem` (40px) | Hero section, large surfaces |
| *(full)* | `rounded-full` | `9999px` | Badge pill, avatar, FAB |

---

## 4. Typography Tokens

### Font Families

| CSS Variable | Tailwind Class | Font | Penggunaan |
|---|---|---|---|
| `--font-sans` | `font-sans` | Inter | Body, UI elements |
| `--font-heading` | `font-heading` | Baloo 2 | Heading, display numbers |

### Font Sizes

| Tailwind Class | Size | Line Height | Penggunaan |
|---|---|---|---|
| `text-xs` | 12px | 1.4 | Caption, timestamps |
| `text-sm` | 14px | 1.5 | Body small, card description |
| `text-base` | 16px | 1.6 | Body default |
| `text-lg` | 18px | 1.4 | Card title (h4) |
| `text-xl` | 20px | 1.35 | Sub-section (h3) |
| `text-2xl` | 24px | 1.3 | Section title (h2) |
| `text-3xl` | 30px | 1.25 | Page title (h1) |
| `text-4xl` | 36px | 1.2 | Display, hero stats |

### Font Weights

| Tailwind Class | Weight | Penggunaan |
|---|---|---|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | UI labels, caption |
| `font-semibold` | 600 | Card titles, nav items |
| `font-bold` | 700 | Page headings |
| `font-extrabold` | 800 | Display/hero text |

---

## 5. Spacing Tokens

Semua spacing mengikuti kelipatan 4px (Tailwind default scale):

| Tailwind Class | Nilai | Penggunaan Umum |
|---|---|---|
| `gap-1` / `p-1` | 4px | Antar ikon kecil |
| `gap-2` / `p-2` | 8px | Badge padding, gap kecil |
| `gap-3` / `p-3` | 12px | Gap medium |
| `gap-4` / `p-4` | 16px | Card padding (mobile), margin antar elemen |
| `gap-5` / `p-5` | 20px | Form group gap |
| `gap-6` / `p-6` | 24px | Card padding (desktop) |
| `gap-8` / `p-8` | 32px | Section margin |
| `gap-10` / `p-10` | 40px | Page margin |
| `gap-12` / `p-12` | 48px | Antar section besar |
| `gap-16` / `p-16` | 64px | Hero spacing |

---

## 6. Animation Tokens

| Token | CSS Transition | Penggunaan |
|---|---|---|
| `transition-fast` | `100ms ease-in` | Button press, toggle |
| `transition-normal` | `200ms ease-out` | Hover effects, tooltip |
| `transition-smooth` | `300ms cubic-bezier(0.4, 0, 0.2, 1)` | Color change, card hover, page transition |
| `transition-spring` | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Toast bounce, checkbox spring, FAB squish |
| `transition-slow` | `500ms ease-in-out` | Modal open/close, skeleton shimmer |

### Tailwind Usage

```html
<!-- Smooth hover transition -->
<div class="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">

<!-- Spring bounce animation -->
<div class="transition-transform duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]">
```

---

## 7. Responsive Breakpoints

| Tailwind Prefix | Min Width | Target Device |
|---|---|---|
| *(default)* | 0px | Mobile (320px+) — **base styles** |
| `sm:` | 640px | Mobile landscape, small tablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Desktop, tablet landscape |
| `xl:` | 1280px | Wide desktop |
| `2xl:` | 1536px | Ultra-wide |

### Responsive Adjustments

| Token | Mobile (default) | Tablet (`md:`) | Desktop (`lg:`) |
|---|---|---|---|
| Shadow | `shadow-clay-sm` | `shadow-clay` | `shadow-clay` |
| Card Padding | `p-4` | `p-5` | `p-6` |
| Border Radius | `rounded-md` (16px) | `rounded-lg` (24px) | `rounded-clay` (24px) |
| Grid Columns | 1 | 2 | 2-3 |
| Font Size (h1) | `text-2xl` | `text-3xl` | `text-3xl` |

---

## 8. Quick Reference: Common Patterns

### Clay Card
```html
<div class="bg-card rounded-clay shadow-clay p-4 md:p-6 
            transition-all duration-300 
            hover:shadow-clay-hover hover:-translate-y-0.5">
  <!-- Content -->
</div>
```

### Clay Button
```html
<button class="bg-primary text-primary-foreground 
               rounded-clay shadow-clay px-6 py-3 
               transition-all duration-200
               hover:shadow-clay-hover hover:-translate-y-0.5
               active:shadow-clay-inset active:translate-y-0">
  Simpan
</button>
```

### Clay Input
```html
<input class="bg-card rounded-clay shadow-clay-inset 
              border-none px-4 py-3 w-full
              focus:ring-2 focus:ring-ring
              placeholder:text-muted-foreground" />
```

### Priority Badge
```html
<span class="bg-priority-high/15 text-priority-high 
             rounded-full px-3 py-1 text-xs font-semibold">
  Tinggi
</span>
```
