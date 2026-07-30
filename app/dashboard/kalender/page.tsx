import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar as CalendarIcon, Inbox } from 'lucide-react'
import { TaskCard } from '@/components/tasks/task-card'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function KalenderPage() {
  const supabase = await createClient()

  // Pastikan user sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError && (authError.message.toLowerCase().includes('fetch') || (authError as any).status === 0 || (authError as any).status >= 500)) {
    throw new Error('Koneksi terputus. Gagal memverifikasi sesi.')
  }
  if (!user) redirect('/login')

  // Fetch tugas & relasi kategorinya yang punya deadline
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      id, title, priority, status, deadline,
      category:categories(name, color),
      attachments(id, file_name, storage_path, mime_type, file_size)
    `)
    .eq('user_id', user.id)
    .not('deadline', 'is', null)
    .order('deadline', { ascending: true })

  // Group tasks by Date (String format YYYY-MM-DD)
  const groupedTasks: Record<string, any[]> = {}
  
  if (tasks) {
    tasks.forEach(task => {
      const dateStr = task.deadline.split('T')[0]
      if (!groupedTasks[dateStr]) groupedTasks[dateStr] = []
      groupedTasks[dateStr].push(task)
    })
  }

  const sortedDates = Object.keys(groupedTasks).sort()

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <CalendarIcon size={28} className="text-[var(--blossom)]" /> Agenda Saya
        </h2>
      </div>

      <div className="flex flex-col gap-[40px]">
        {sortedDates.length === 0 ? (
          <div className="p-12 text-center clay flex flex-col items-center justify-center gap-4 rounded-[var(--r-lg)]">
             <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#F1699C]/20 to-[var(--blossom)]/20 flex items-center justify-center text-[var(--blossom-dark)] mb-2" style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}>
               <Inbox size={32} strokeWidth={2.5} />
             </div>
             <p className="font-heading font-bold text-xl text-[var(--ink)]">Kalender Kosong</p>
             <p className="text-sm font-[500] text-[var(--ink-soft)] max-w-[250px] leading-relaxed">
               Belum ada tugas dengan tenggat waktu. Tambahkan tenggat waktu pada tugas Anda untuk melihatnya di sini!
             </p>
          </div>
        ) : (
          sortedDates.map(dateStr => {
            const dateObj = parseISO(dateStr)
            let dateLabel = format(dateObj, 'EEEE, d MMMM yyyy', { locale: id })
            
            if (isToday(dateObj)) dateLabel = 'Hari Ini'
            else if (isTomorrow(dateObj)) dateLabel = 'Besok'

            return (
              <div key={dateStr} className="flex flex-col gap-[16px]">
                <div className="flex items-center gap-[12px]">
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[var(--shadow-dark)] opacity-30"></div>
                  <h3 className="text-[15px] font-[800] text-[var(--ink)] tracking-wide bg-[var(--clay-raised)] px-[16px] py-[6px] rounded-full" style={{ boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.8), 3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
                    {dateLabel}
                  </h3>
                  <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[var(--shadow-dark)] opacity-30"></div>
                </div>
                
                <div className="flex flex-col gap-[16px]">
                  {groupedTasks[dateStr].map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
