import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BesokAja – Manajemen Tugas Cantik untuk Kamu",
    template: "%s | BesokAja",
  },
  description:
    "BesokAja adalah aplikasi manajemen tugas personal dengan desain Claymorphism yang estetis. Kelola tugas, deadline, dan laporan kerjamu dengan mudah dan menyenangkan.",
  keywords: ["manajemen tugas", "task manager", "to-do list", "produktivitas", "Indonesia"],
  authors: [{ name: "BesokAja" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "BesokAja – Manajemen Tugas Cantik untuk Kamu",
    description: "Kelola tugas, deadline, dan laporan kerjamu dengan mudah dan menyenangkan.",
    siteName: "BesokAja",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${baloo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {/* Skip to main content — for keyboard and screen reader users */}
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        <div className="flex flex-1 w-full">
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
