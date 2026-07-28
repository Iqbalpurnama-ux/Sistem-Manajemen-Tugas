'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-[40px] min-h-[60vh]">
      <div className="clay flex flex-col items-center justify-center text-center p-[40px] max-w-[480px] w-full" style={{ borderRadius: 'var(--r-xl)' }}>
        <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center text-red-500 mb-[24px]" style={{ boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.05), inset -4px -4px 10px rgba(255,255,255,1)' }}>
          <AlertCircle size={40} strokeWidth={2} />
        </div>
        
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] mb-[12px]">
          Ups! Terjadi Kesalahan
        </h2>
        
        <p className="text-[14px] font-[500] text-[var(--ink-soft)] leading-relaxed mb-[32px]">
          Kami kesulitan mengambil data tugas Anda. Koneksi internet mungkin terputus atau server sedang sibuk.
        </p>

        <button
          onClick={() => reset()}
          className="flex items-center gap-[10px] bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] text-white font-[700] text-[15px] px-[32px] py-[16px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          style={{ boxShadow: '6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light), inset 2px 2px 4px rgba(255,255,255,0.4)' }}
        >
          <RefreshCw size={20} strokeWidth={2.5} />
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
