import { Archive, Inbox } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TaskWithCategory, TaskCard } from '@/components/tasks/task-card'

export default async function ArsipPage() {
  const supabase = await createClient()

  // Pastikan user sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch tugas yang sudah diarsipkan
  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      priority,
      status,
      is_archived,
      deadline,
      description,
      category:categories(name, color),
      attachments(id, file_name, storage_path, mime_type, file_size)
    `)
    .eq('user_id', user.id)
    .eq('is_archived', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (fetchError) {
    console.error('Error fetching archived tasks:', fetchError.message)
  }

  const archivedTasks = (tasks as unknown) as TaskWithCategory[] || []

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <Archive size={28} className="text-[var(--blossom)]" /> Arsip Tugas
        </h2>
      </div>

      <div className="flex flex-col gap-[20px]">
        {archivedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-[40px_20px] sm:p-[80px_20px] clay rounded-[var(--r-lg)] text-center animate-in fade-in duration-500">
            <div className="w-[100px] h-[100px] rounded-full bg-[var(--clay-raised)] flex items-center justify-center text-[var(--ink-faint)] mb-[24px]" style={{ boxShadow: 'inset 4px 4px 10px rgba(255,255,255,0.8), 5px 5px 15px var(--shadow-dark), -5px -5px 15px var(--shadow-light)' }}>
              <Inbox size={40} strokeWidth={2.5} />
            </div>
            <h3 className="text-[22px] font-heading font-[800] text-[var(--ink)] mb-[12px]">Gudang Arsip Kosong</h3>
            <p className="text-[15px] font-[600] text-[var(--ink-soft)] max-w-[350px] mx-auto leading-relaxed">
              Belum ada tugas yang Anda simpan di sini. Selesaikan tugas di dasbor dan klik ikon arsip untuk menyimpannya.
            </p>
          </div>
        ) : (
          archivedTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
