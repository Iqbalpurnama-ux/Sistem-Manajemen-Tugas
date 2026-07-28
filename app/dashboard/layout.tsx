import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, CheckSquare, Tags, Settings, LogOut, ClipboardList, Search, User, Calendar, BarChart3, Archive } from 'lucide-react'
import { signOutAction } from '@/app/login/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: categories } = user ? await supabase.from('categories').select('*').eq('user_id', user.id).order('name') : { data: null }

  return (
    <>
      {/* Background Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <div className="w-full min-h-screen py-[16px] px-[16px] sm:py-[28px] sm:px-[36px] relative z-[1] flex justify-center">
        <div className="flex w-full max-w-[1600px] gap-[20px] sm:gap-[36px] relative">
          
          {/* GHOST SIDEBAR (Holds the space in the flex layout) */}
          <div className="hidden md:block w-[280px] shrink-0"></div>

          {/* SIDEBAR (Desktop) - FIXED OVERLAY */}
          <aside className="clay hidden md:flex flex-col w-[280px] h-[calc(100vh-56px)] fixed top-[28px] z-[40]">
            <div className="p-[26px_20px_20px]">
              <div className="flex items-center gap-[14px] text-[24px] font-[800] text-[var(--blossom-dark)] font-heading">
                <div className="w-[48px] h-[48px] rounded-[16px] bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] flex items-center justify-center text-white" style={{
                  boxShadow: '5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light), inset 2px 2px 4px rgba(255,255,255,0.5)'
                }}>
                  <ClipboardList size={26} strokeWidth={2.5} />
                </div>
                BesokAja
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-[20px] pb-[10px] flex flex-col gap-[30px]">
              <nav className="flex flex-col gap-[10px]">
                <Link href="/dashboard" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[700] text-[15px] cursor-pointer transition-all hover:bg-[var(--clay-raised)] hover:text-[var(--blossom-dark)] hover:clay-tight">
                  <Home size={20} strokeWidth={2.5} /> Dashboard
                </Link>
                <Link href="/dashboard" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[600] text-[15px] text-[var(--ink-soft)] cursor-pointer hover:text-[var(--blossom-dark)] hover:bg-white/50 transition-all">
                  <CheckSquare size={20} /> Semua Tugas
                </Link>
                <Link href="/dashboard/kalender" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[600] text-[15px] text-[var(--ink-soft)] cursor-pointer hover:text-[var(--blossom-dark)] hover:bg-white/50 transition-all">
                  <Calendar size={20} /> Kalender
                </Link>
                <Link href="/dashboard/analitik" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[600] text-[15px] text-[var(--ink-soft)] cursor-pointer hover:text-[var(--blossom-dark)] hover:bg-white/50 transition-all">
                  <BarChart3 size={20} /> Analitik
                </Link>
                
                <div className="w-full h-[1px] bg-[var(--shadow-dark)] opacity-50 my-[8px]"></div>

                <Link href="/dashboard/arsip" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[600] text-[15px] text-[var(--ink-soft)] cursor-pointer hover:text-[var(--blossom-dark)] hover:bg-white/50 transition-all">
                  <Archive size={20} /> Arsip
                </Link>
                <Link href="/dashboard/pengaturan" className="flex items-center gap-[14px] p-[14px_18px] rounded-[var(--r-sm)] font-[600] text-[15px] text-[var(--ink-soft)] cursor-pointer hover:text-[var(--blossom-dark)] hover:bg-white/50 transition-all">
                  <Settings size={20} /> Pengaturan
                </Link>
              </nav>

              {categories && categories.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <div className="text-[12px] uppercase tracking-[.08em] text-[var(--ink-faint)] font-[800] p-[0_4px_4px]">Kategori</div>
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center gap-[12px] text-[14px] font-[600] text-[var(--ink-soft)] p-[10px_12px] rounded-[14px] cursor-pointer hover:bg-white/60 transition-colors">
                      <span className="w-[12px] h-[12px] rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: cat.color || 'var(--blossom)' }}></span> {cat.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Motivation Widget (Scrolls naturally) */}
              <div className="mt-auto pt-[20px]">
                <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[var(--blossom)] to-[#E8447F] p-[16px] text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.4),_3px_3px_10px_rgba(214,110,150,0.3)]">
                  <div className="absolute top-[-10px] right-[-10px] text-white/20 rotate-12">
                    <ClipboardList size={72} strokeWidth={2} />
                  </div>
                  <h4 className="text-[13px] font-[800] font-heading mb-[4px] relative z-10 flex items-center gap-[6px]">
                    💡 Tips Hari Ini
                  </h4>
                  <p className="text-[11.5px] font-[600] leading-relaxed text-white/95 relative z-10">
                    Selesaikan tugas tersulitmu di pagi hari, sisanya akan terasa lebih mudah! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Profile & Logout (Sleek Design) */}
            <div className="mx-[20px] mb-[24px] mt-[20px] pt-[20px] border-t border-[var(--shadow-dark)] flex items-center justify-between gap-[10px]">
               <Link href="/dashboard/profil" className="flex items-center gap-[12px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#B48DF0] to-[var(--lilac)] flex items-center justify-center font-[800] text-white text-[15px] shrink-0" style={{ boxShadow: '2px 2px 6px var(--shadow-dark), inset 2px 2px 4px rgba(255,255,255,0.4)' }}>
                    {(user?.user_metadata?.full_name || user?.email || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <div className="text-[13.5px] font-[800] text-[var(--ink)] truncate leading-tight mb-[2px]">
                      {user?.user_metadata?.full_name || 'Pengguna'}
                    </div>
                    <div className="text-[11.5px] font-[600] text-[var(--ink-soft)] truncate leading-tight">
                      {user?.email}
                    </div>
                  </div>
               </Link>
               <form action={signOutAction} className="shrink-0">
                  <button type="submit" title="Keluar" className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-[var(--ink-soft)] bg-white/40 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <LogOut size={18} strokeWidth={2.5} />
                  </button>
               </form>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 flex flex-col gap-[20px] sm:gap-[28px] w-full min-w-0 pb-[100px] md:pb-[80px]">
            {/* HEADER (Floating Clay) */}
            <div className="flex items-center justify-between p-[18px_20px] sm:p-[24px_36px] clay">
              <div className="flex flex-col gap-[2px]">
                <h2 className="text-[20px] sm:text-[26px] font-[800] text-[var(--ink)] font-heading flex items-center gap-[6px]">
                  Selamat datang, {user?.user_metadata?.full_name?.split(' ')[0] || 'Pengguna'}. <span className="animate-wave origin-bottom-right inline-block">👋</span>
                </h2>
                <p className="text-[12px] sm:text-[14.5px] text-[var(--ink-soft)] font-[600]">Pantau tugas aktifmu hari ini</p>
              </div>
              <div className="flex items-center gap-[16px] sm:gap-[24px]">
                <div className="hidden sm:flex items-center gap-[12px] py-[12px] px-[28px] text-[var(--ink-soft)] text-[14.5px] font-[600] w-[300px] rounded-full bg-[var(--clay-raised)] focus-within:ring-[3px] ring-[var(--blossom-soft)] transition-all cursor-text" style={{ boxShadow: 'inset 4px 4px 10px var(--shadow-dark), inset -4px -4px 10px var(--shadow-light)' }}>
                  <Search size={18} strokeWidth={2.5} className="text-[var(--blossom)] shrink-0" /> 
                  <input type="text" placeholder="Cari tugas..." className="bg-transparent border-none outline-none w-full text-[var(--ink)] placeholder:text-[var(--ink-faint)] font-[600]" />
                </div>
                <div className="md:hidden w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#B48DF0] to-[var(--lilac)] flex items-center justify-center font-[800] text-white text-[15px] cursor-pointer shrink-0" style={{
                  boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)'
                }}>
                  <Search size={20} />
                </div>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[var(--clay)]/95 backdrop-blur-xl border-t border-[var(--shadow-light)] p-[12px_24px] pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-between items-center z-[50]" style={{ boxShadow: '0 -4px 20px rgba(214,110,150,0.15)' }}>
        <Link href="/dashboard" className="flex flex-col items-center gap-[4px] text-[var(--blossom-dark)] cursor-pointer">
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-[800]">Home</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center gap-[4px] text-[var(--ink-soft)] hover:text-[var(--blossom-dark)] cursor-pointer transition-colors">
          <CheckSquare size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-[700]">Tugas</span>
        </Link>
        <Link href="/dashboard/kalender" className="flex flex-col items-center gap-[4px] text-[var(--ink-soft)] hover:text-[var(--blossom-dark)] cursor-pointer transition-colors relative">
          <Calendar size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-[700]">Kalender</span>
          <span className="absolute top-[-2px] right-[-4px] w-[8px] h-[8px] rounded-full bg-[var(--blossom)] border-2 border-white"></span>
        </Link>
        <Link href="/dashboard/profil" className="flex flex-col items-center gap-[4px] text-[var(--ink-soft)] hover:text-[var(--blossom-dark)] cursor-pointer transition-colors">
          <User size={22} strokeWidth={2.5} />
          <span className="text-[10px] font-[700]">Profil</span>
        </Link>
      </nav>
    </>
  )
}
