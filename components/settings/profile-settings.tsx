'use client'

import React, { useState, useTransition } from 'react'
import { updateProfileName } from '@/lib/actions/settings'
import { Input } from '@/components/ui/input'
import { User, Check, X } from 'lucide-react'

export function ProfileSettings({ profile, email }: { profile: any, email: string }) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(profile?.full_name || '')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSave = () => {
    if (!name.trim()) return

    setStatus('idle')
    startTransition(async () => {
      const res = await updateProfileName(name)
      if (res.success) {
        setStatus('success')
        setMessage('Profil berhasil diperbarui')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        setStatus('error')
        setMessage(res.error || 'Gagal memperbarui profil')
      }
    })
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center gap-[12px] mb-[8px]">
        <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#F1699C]/20 to-[var(--blossom)]/20 flex items-center justify-center text-[var(--blossom-dark)]">
          <User size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-[18px] font-heading font-[800] text-[var(--ink)]">Informasi Dasar</h3>
          <p className="text-[13px] font-[600] text-[var(--ink-soft)]">Perbarui nama tampilan Anda di aplikasi</p>
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label className="text-[13px] font-[600] text-[var(--ink-soft)]">Email Akun (Tidak dapat diubah)</label>
        <Input 
          value={email} 
          disabled 
          className="rounded-[var(--r-sm)] bg-[var(--shadow-light)]/30 border-none h-[48px] px-[16px] text-[var(--ink-faint)] font-[600]"
        />
      </div>

      <div className="flex flex-col gap-[8px]">
        <label className="text-[13px] font-[600] text-[var(--ink-soft)]">Nama Lengkap</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          className="rounded-[var(--r-sm)] bg-[var(--clay-raised)] border-none h-[48px] px-[16px] focus-visible:ring-2 focus-visible:ring-[var(--blossom)] text-[var(--ink)] font-[600]"
          style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
          disabled={isPending}
        />
      </div>

      {status !== 'idle' && (
        <div className={`p-[12px] rounded-[var(--r-sm)] flex items-center gap-[8px] text-[13px] font-[600] ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status === 'success' ? <Check size={16} /> : <X size={16} />} {message}
        </div>
      )}

      <div className="flex justify-end pt-[16px]">
        <button 
          onClick={handleSave}
          disabled={isPending || name === profile?.full_name}
          className="h-[46px] px-[24px] rounded-[var(--r-md)] font-[700] text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] disabled:opacity-50 transition-all cursor-pointer hover:brightness-110 active:scale-95 flex items-center gap-[8px]"
          style={{ boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)' }}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  )
}
