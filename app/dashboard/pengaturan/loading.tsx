import { Loader2 } from 'lucide-react'

export default function GenericLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="w-10 h-10 text-[var(--blossom)] animate-spin mb-4" />
      <p className="text-[var(--ink-soft)] font-[500] animate-pulse">Memuat data...</p>
    </div>
  )
}
