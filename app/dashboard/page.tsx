import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TaskList } from '@/components/tasks/task-list'
import { TaskWithCategory } from '@/components/tasks/task-card'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, q?: string }>
}) {
  const resolvedParams = await searchParams
  const categoryFilter = resolvedParams?.category
  const searchQuery = resolvedParams?.q
  
  const supabase = await createClient()

  // Pastikan user sudah login
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError) {
    // Jika error karena masalah jaringan/koneksi terputus, lemparkan error agar ditangkap oleh error.tsx
    if (authError.message.toLowerCase().includes('fetch') || authError?.status === 0 || (authError?.status && authError.status >= 500)) {
      throw new Error('Koneksi terputus. Gagal memverifikasi sesi.')
    }
  }

  if (!user) {
    redirect('/login')
  }

  // Fetch tugas & relasi kategorinya
  let query = supabase
    .from('tasks')
    .select(`
      id,
      title,
      priority,
      status,
      is_archived,
      deadline,
      category:categories(name, color),
      attachments(id, file_name, storage_path, mime_type, file_size)
    `)
    .eq('user_id', user.id)
    
  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter)
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data: tasks, error: fetchError } = await query.order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching tasks:', fetchError.message)
    // Bisa lempar error ke Error Boundary nanti
  }

  // Cast type karena tanpa auto-generated Supabase types, TS menganggap join adalah array
  const formattedTasks = (tasks as unknown) as TaskWithCategory[]

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <TaskList tasks={formattedTasks || []} />
    </div>
  )
}
