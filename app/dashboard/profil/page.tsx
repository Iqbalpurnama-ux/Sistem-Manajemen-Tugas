import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, LogOut, Mail, Award, Settings } from 'lucide-react'
import { signOutAction } from '@/app/login/actions'

export default async function ProfilPage() {
  const supabase = await createClient()

  // Pastikan user sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    if (authError.message.toLowerCase().includes('fetch') || (authError as any).status === 0 || (authError as any).status >= 500) {
      throw new Error('Koneksi terputus. Gagal memverifikasi sesi.')
    }
  }

  if (!user) {
    redirect('/login')
  }

  // Fetch profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <User size={28} className="text-[var(--blossom)]" /> Profil Saya
        </h2>
      </div>

      <div className="clay p-[32px] sm:p-[40px] flex flex-col sm:flex-row items-center gap-[32px] rounded-[var(--r-lg)]" style={{ boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)' }}>
        
        {/* Avatar */}
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] flex items-center justify-center text-white text-[48px] font-heading font-[800] shrink-0 relative" style={{ boxShadow: 'inset 4px 4px 10px rgba(255,255,255,0.4), 6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full p-[4px]" />
          ) : (
            (profile?.full_name || user.email || '?').charAt(0).toUpperCase()
          )}
          
          <div className="absolute bottom-[4px] right-[4px] w-[28px] h-[28px] bg-[var(--clay)] rounded-full flex items-center justify-center border-2 border-white text-[var(--blossom-dark)]">
            <Award size={14} strokeWidth={3} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-[28px] font-[800] font-heading text-[var(--ink)] leading-none mb-[8px]">
            {profile?.full_name || 'Pengguna Tanpa Nama'}
          </h3>
          <p className="text-[15px] font-[600] text-[var(--ink-soft)] flex items-center justify-center sm:justify-start gap-[8px] mb-[20px]">
            <Mail size={16} /> {user.email}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-[12px]">
            <button className="px-[20px] py-[12px] rounded-full text-[14px] font-[700] bg-[var(--clay-raised)] text-[var(--ink)] hover:text-[var(--blossom)] transition-colors flex items-center gap-[8px]" style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.8), 3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
              <Settings size={16} /> Pengaturan Akun
            </button>
            <form action={signOutAction}>
              <button type="submit" className="px-[20px] py-[12px] rounded-full text-[14px] font-[700] text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-[8px]" style={{ boxShadow: '3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
                <LogOut size={16} /> Keluar Aplikasi
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
