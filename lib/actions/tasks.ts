'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Judul tugas minimal 3 karakter').max(100, 'Judul terlalu panjang'),
  priority: z.enum(['Low', 'Medium', 'High']),
  deadline: z.string().optional(),
  category_id: z.string().uuid('Kategori tidak valid').optional().nullable(),
})

export type TaskActionResponse = {
  success: boolean
  message?: string
  error?: string
}

export async function createTask(formData: FormData): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    
    // Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' }
    }

    // Self-healing: Pastikan profil user ada di public.profiles sebelum membuat relasi
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url
    }, { onConflict: 'id' })

    // Parse Data
    const rawData = {
      title: formData.get('title'),
      priority: formData.get('priority') || 'Medium',
      deadline: formData.get('deadline') || undefined,
      category_id: formData.get('category_id') || undefined,
    }

    // Validasi Zod
    const validated = CreateTaskSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Insert ke Database
    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: validated.data.title,
        priority: validated.data.priority,
        deadline: validated.data.deadline || null,
        category_id: validated.data.category_id || null,
        status: 'To-Do'
      })

    if (error) {
      console.error('Create Task Error:', error.message)
      return { success: false, error: 'Gagal menyimpan tugas ke server.' }
    }

    // Refresh UI
    revalidatePath('/dashboard')
    
    return { success: true, message: 'Tugas berhasil ditambahkan' }
  } catch (err) {
    console.error('Server Action Error:', err)
    return { success: false, error: 'Terjadi kesalahan sistem internal.' }
  }
}

export async function editTask(taskId: string, formData: FormData): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Sesi berakhir' }

    const rawData = {
      title: formData.get('title'),
      priority: formData.get('priority') || 'Medium',
      deadline: formData.get('deadline') || undefined,
      category_id: formData.get('category_id') || undefined,
    }

    const validated = CreateTaskSchema.safeParse(rawData)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    const { error } = await supabase
      .from('tasks')
      .update({
        title: validated.data.title,
        priority: validated.data.priority,
        deadline: validated.data.deadline || null,
        category_id: validated.data.category_id || null,
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) return { success: false, error: 'Gagal mengubah tugas' }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/kalender')
    return { success: true, message: 'Tugas berhasil diubah' }
  } catch (err) {
    return { success: false, error: 'Terjadi kesalahan sistem' }
  }
}

export async function updateTaskStatus(taskId: string, newStatus: 'To-Do' | 'Done'): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .eq('user_id', user.id) // Security check ekstra

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Gagal mengubah status tugas' }
  }
}

export async function deleteTask(taskId: string): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Untuk MVP kita pakai hard delete dulu sesuai request "penghapusan (Delete) tugas" di Tasks.md
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, message: 'Tugas dihapus' }
  } catch (err) {
    return { success: false, error: 'Gagal menghapus tugas' }
  }
}
