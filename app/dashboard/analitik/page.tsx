import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, Ghost } from 'lucide-react'

export default async function AnalitikPage() {
  const supabase = await createClient()

  // Pastikan user sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError && (authError.message.toLowerCase().includes('fetch') || (authError as any).status === 0 || (authError as any).status >= 500)) {
    throw new Error('Koneksi terputus. Gagal memverifikasi sesi.')
  }
  if (!user) redirect('/login')

  // Fetch semua tugas untuk dikalkulasi
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, priority, status,
      category:categories(name, color)
    `)
    .eq('user_id', user.id)

  const totalTasks = tasks?.length || 0
  const completedTasks = tasks?.filter(t => t.status === 'Done').length || 0
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriority = tasks?.filter(t => t.priority === 'High' && t.status !== 'Done').length || 0
  const mediumPriority = tasks?.filter(t => t.priority === 'Medium' && t.status !== 'Done').length || 0
  const lowPriority = tasks?.filter(t => t.priority === 'Low' && t.status !== 'Done').length || 0

  // Menghitung distribusi kategori
  const categoryCount: Record<string, { count: number, color: string }> = {}
  tasks?.forEach(t => {
    if (t.category) {
      const cat = t.category as any
      const name = cat.name
      if (!categoryCount[name]) {
        categoryCount[name] = { count: 0, color: cat.color || 'var(--blossom)' }
      }
      categoryCount[name].count++
    }
  })

  const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1].count - a[1].count)

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <BarChart3 size={28} className="text-[var(--blossom)]" /> Analitik Produktivitas
        </h2>
      </div>

      {totalTasks === 0 ? (
        // Opsi Tampilan Kosong (Empty State)
        <div className="flex flex-col items-center justify-center p-[40px_20px] sm:p-[80px_20px] clay rounded-[var(--r-lg)] text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-[100px] h-[100px] rounded-full bg-[var(--clay-raised)] flex items-center justify-center text-[var(--blossom)] mb-[24px] animate-bounce" style={{ boxShadow: 'inset 4px 4px 10px rgba(255,255,255,0.8), 5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
            <Ghost size={48} strokeWidth={2} />
          </div>
          <h3 className="text-[22px] font-heading font-[800] text-[var(--ink)] mb-[12px]">Hening Sekali di Sini...</h3>
          <p className="text-[15px] font-[600] text-[var(--ink-soft)] max-w-[300px] mx-auto leading-relaxed">
            Belum ada data tugas yang bisa dianalisis. Buat beberapa tugas dan mari lihat angka produktivitasmu meroket!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[32px]">
          
          {/* Progress Bar Keseluruhan */}
          <div className="clay p-[28px] rounded-[var(--r-lg)] flex flex-col gap-[20px]" style={{ boxShadow: '5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-[4px]">
                <h3 className="text-[16px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[8px]">
                  <TrendingUp size={20} className="text-[var(--blossom-dark)]" /> Tingkat Penyelesaian
                </h3>
                <p className="text-[13px] font-[600] text-[var(--ink-soft)]">Total {totalTasks} tugas dibuat</p>
              </div>
              <div className="text-[32px] font-[800] font-heading text-[var(--blossom-dark)]">
                {completionRate}%
              </div>
            </div>

            <div className="w-full h-[24px] bg-[var(--clay-raised)] rounded-full p-[4px] relative overflow-hidden" style={{ boxShadow: 'inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light)' }}>
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#F1699C] to-[var(--blossom)] transition-all duration-1000 ease-out"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-[13px] font-[700]">
              <span className="flex items-center gap-[6px] text-[#6BCB9F]">
                <CheckCircle2 size={16} /> {completedTasks} Selesai
              </span>
              <span className="flex items-center gap-[6px] text-[var(--ink-soft)]">
                <AlertCircle size={16} /> {pendingTasks} Menunggu
              </span>
            </div>
          </div>

          {/* Grid Cards for Priority & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            
            {/* Prioritas Card */}
            <div className="clay p-[24px] rounded-[var(--r-lg)] flex flex-col gap-[20px]">
              <h3 className="text-[16px] font-[800] font-heading text-[var(--ink)]">Tugas Berjalan (Berdasarkan Prioritas)</h3>
              
              <div className="flex flex-col gap-[12px]">
                {/* High */}
                <div className="flex items-center justify-between p-[12px_16px] bg-[var(--clay-raised)] rounded-[12px]" style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.6), 2px 2px 6px var(--shadow-dark), -2px -2px 6px var(--shadow-light)' }}>
                  <div className="flex items-center gap-[10px] font-[700] text-[#F1699C] text-[14px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#F1699C] shadow-[0_0_8px_#F1699C]"></div>
                    Prioritas Tinggi
                  </div>
                  <div className="font-[800] text-[var(--ink)] text-[16px]">{highPriority}</div>
                </div>

                {/* Medium */}
                <div className="flex items-center justify-between p-[12px_16px] bg-[var(--clay-raised)] rounded-[12px]" style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.6), 2px 2px 6px var(--shadow-dark), -2px -2px 6px var(--shadow-light)' }}>
                  <div className="flex items-center gap-[10px] font-[700] text-[#FFB067] text-[14px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#FFB067] shadow-[0_0_8px_#FFB067]"></div>
                    Prioritas Sedang
                  </div>
                  <div className="font-[800] text-[var(--ink)] text-[16px]">{mediumPriority}</div>
                </div>

                {/* Low */}
                <div className="flex items-center justify-between p-[12px_16px] bg-[var(--clay-raised)] rounded-[12px]" style={{ boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.6), 2px 2px 6px var(--shadow-dark), -2px -2px 6px var(--shadow-light)' }}>
                  <div className="flex items-center gap-[10px] font-[700] text-[#6BCB9F] text-[14px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#6BCB9F] shadow-[0_0_8px_#6BCB9F]"></div>
                    Prioritas Rendah
                  </div>
                  <div className="font-[800] text-[var(--ink)] text-[16px]">{lowPriority}</div>
                </div>
              </div>
            </div>

            {/* Kategori Card */}
            <div className="clay p-[24px] rounded-[var(--r-lg)] flex flex-col gap-[20px]">
              <h3 className="text-[16px] font-[800] font-heading text-[var(--ink)]">Distribusi Kategori</h3>
              
              <div className="flex flex-col gap-[16px] overflow-y-auto max-h-[220px] no-scrollbar pr-[4px]">
                {sortedCategories.length > 0 ? sortedCategories.map(([name, data]) => {
                  const percentage = Math.round((data.count / totalTasks) * 100)
                  return (
                    <div key={name} className="flex flex-col gap-[6px]">
                      <div className="flex items-center justify-between text-[13px] font-[700]">
                        <span className="text-[var(--ink-soft)]">{name}</span>
                        <span className="text-[var(--ink)]">{data.count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-[8px] bg-[var(--clay-raised)] rounded-full overflow-hidden" style={{ boxShadow: 'inset 1px 1px 3px var(--shadow-dark), inset -1px -1px 3px var(--shadow-light)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: data.color }}></div>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="flex-1 flex items-center justify-center text-[13px] font-[600] text-[var(--ink-faint)] italic py-[40px]">
                    Belum ada kategori yang digunakan
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
