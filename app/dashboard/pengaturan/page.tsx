import { Settings, Construction } from 'lucide-react'

export default function PengaturanPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <Settings size={28} className="text-[var(--blossom)]" /> Pengaturan
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center p-[40px_20px] sm:p-[80px_20px] clay rounded-[var(--r-lg)] text-center animate-in fade-in duration-500">
        <div className="w-[100px] h-[100px] rounded-full bg-[var(--clay-raised)] flex items-center justify-center text-[var(--ink-faint)] mb-[24px]" style={{ boxShadow: 'inset 4px 4px 10px rgba(255,255,255,0.8), 5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
          <Construction size={40} strokeWidth={2.5} />
        </div>
        <h3 className="text-[22px] font-heading font-[800] text-[var(--ink)] mb-[12px]">Sedang Dalam Perbaikan</h3>
        <p className="text-[15px] font-[600] text-[var(--ink-soft)] max-w-[350px] mx-auto leading-relaxed">
          Halaman pengaturan sistem masih dalam tahap pengembangan. Di sini Anda akan bisa mengubah tema warna, notifikasi, dan preferensi akun Anda kelak.
        </p>
      </div>
    </div>
  )
}
