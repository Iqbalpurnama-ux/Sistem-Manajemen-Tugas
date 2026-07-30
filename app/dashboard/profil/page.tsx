import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { User, LogOut, Mail, Award, Settings, CheckCircle2, ListTodo } from 'lucide-react'
import { signOutAction } from '@/app/login/actions'
import Link from 'next/link'

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

  // Fetch quick stats
  const { data: tasks } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', user.id)
    
  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'Done').length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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
          {(user?.user_metadata?.avatar_url || profile?.avatar_url) ? (
            <img src={user?.user_metadata?.avatar_url || profile?.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full p-[4px]" />
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
            <Link href="/dashboard/pengaturan">
              <button className="px-[20px] py-[12px] rounded-full text-[14px] font-[700] bg-[var(--clay-raised)] text-[var(--ink)] hover:text-[var(--blossom)] transition-colors flex items-center gap-[8px]" style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.8), 3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
                <Settings size={16} /> Pengaturan Akun
              </button>
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="px-[20px] py-[12px] rounded-full text-[14px] font-[700] text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-[8px]" style={{ boxShadow: '3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
                <LogOut size={16} /> Keluar Aplikasi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
        <div className="clay p-[24px] rounded-[var(--r-md)] flex items-center gap-[20px]" style={{ boxShadow: '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#89C4F4] to-[#4A90E2] flex items-center justify-center text-white" style={{ boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.5)' }}>
            <ListTodo size={28} />
          </div>
          <div>
            <div className="text-[28px] font-heading font-[800] text-[var(--ink)] leading-none">{totalTasks}</div>
            <div className="text-[13px] font-[600] text-[var(--ink-soft)] mt-[4px]">Total Tugas Dibuat</div>
          </div>
        </div>
        
        <div className="clay p-[24px] rounded-[var(--r-md)] flex items-center gap-[20px]" style={{ boxShadow: '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#A2D5AB] to-[#39A96B] flex items-center justify-center text-white relative" style={{ boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.5)' }}>
            <CheckCircle2 size={28} />
            {completionRate === 100 && (
               <div className="absolute -top-[5px] -right-[5px] text-yellow-400">
                 <Award size={20} fill="currentColor" />
               </div>
            )}
          </div>
          <div>
            <div className="text-[28px] font-heading font-[800] text-[var(--ink)] leading-none">{completedTasks} <span className="text-[16px] text-[var(--ink-faint)]">({completionRate}%)</span></div>
            <div className="text-[13px] font-[600] text-[var(--ink-soft)] mt-[4px]">Tugas Selesai</div>
          </div>
        </div>
      </div>

    </div>
  )
}
