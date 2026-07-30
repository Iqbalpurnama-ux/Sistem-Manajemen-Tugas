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

const AttachmentSchema = z.object({
  file_name: z.string(),
  storage_path: z.string(),
  mime_type: z.string(),
  file_size: z.number()
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

    // Parse Attachment Data
    let attachmentData = null
    const attachmentStr = formData.get('attachment')
    if (attachmentStr && typeof attachmentStr === 'string') {
      try {
        const parsed = JSON.parse(attachmentStr)
        const validAttachment = AttachmentSchema.safeParse(parsed)
        if (validAttachment.success) {
          attachmentData = validAttachment.data
        }
      } catch (e) {
        console.error("Failed to parse attachment", e)
      }
    }

    // Insert ke Database
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: validated.data.title,
        priority: validated.data.priority,
        deadline: validated.data.deadline || null,
        category_id: validated.data.category_id || null,
        status: 'To-Do'
      })
      .select()
      .single()

    if (error || !task) {
      console.error('Create Task Error:', error?.message)
      return { success: false, error: 'Gagal menyimpan tugas ke server.' }
    }

    if (attachmentData) {
      const { error: attError } = await supabase
        .from('attachments')
        .insert({
          task_id: task.id,
          user_id: user.id,
          file_name: attachmentData.file_name,
          storage_path: attachmentData.storage_path,
          mime_type: attachmentData.mime_type,
          file_size: attachmentData.file_size
        })
      if (attError) console.error('Create Attachment Error:', attError.message)
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

    // Parse Attachment Data
    let newAttachmentData = null
    const attachmentStr = formData.get('attachment')
    if (attachmentStr && typeof attachmentStr === 'string') {
      try {
        const parsed = JSON.parse(attachmentStr)
        const validAttachment = AttachmentSchema.safeParse(parsed)
        if (validAttachment.success) {
          newAttachmentData = validAttachment.data
        }
      } catch (e) {}
    }

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

    // Handle Attachment Replacement or Deletion
    const removeAttachment = formData.get('remove_attachment') === 'true'
    
    if (newAttachmentData || removeAttachment) {
      const { data: existing } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
      
      if (existing) {
        // Hapus file lama di storage
        await supabase.storage.from('task_attachments').remove([existing.storage_path])
        
        if (newAttachmentData) {
          // Update database row
          await supabase.from('attachments').update({
            file_name: newAttachmentData.file_name,
            storage_path: newAttachmentData.storage_path,
            mime_type: newAttachmentData.mime_type,
            file_size: newAttachmentData.file_size
          }).eq('id', existing.id)
        } else if (removeAttachment) {
          // Hapus dari database
          await supabase.from('attachments').delete().eq('id', existing.id)
        }
      } else if (newAttachmentData) {
        // Jika sebelumnya tidak ada attachment
        await supabase.from('attachments').insert({
          task_id: taskId,
          user_id: user.id,
          file_name: newAttachmentData.file_name,
          storage_path: newAttachmentData.storage_path,
          mime_type: newAttachmentData.mime_type,
          file_size: newAttachmentData.file_size
        })
      }
    }

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

    // Hapus attachment dari storage jika ada
    const { data: existingAtt } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
    if (existingAtt) {
      await supabase.storage.from('task_attachments').remove([existingAtt.storage_path])
    }

    // Untuk MVP kita pakai hard delete dulu sesuai request "penghapusan (Delete) tugas" di Tasks.md
    // Cascade akan otomatis menghapus record di tabel attachments
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

export async function saveAttachment(taskId: string, attachmentData: { file_name: string, storage_path: string, mime_type: string, file_size: number }): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: existing } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
    if (existing) {
      await supabase.storage.from('task_attachments').remove([existing.storage_path])
      await supabase.from('attachments').update({
        file_name: attachmentData.file_name,
        storage_path: attachmentData.storage_path,
        mime_type: attachmentData.mime_type,
        file_size: attachmentData.file_size
      }).eq('id', existing.id)
    } else {
      await supabase.from('attachments').insert({
        task_id: taskId,
        user_id: user.id,
        file_name: attachmentData.file_name,
        storage_path: attachmentData.storage_path,
        mime_type: attachmentData.mime_type,
        file_size: attachmentData.file_size
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/kalender')
    return { success: true, message: 'Laporan berhasil disimpan' }
  } catch (err) {
    return { success: false, error: 'Gagal menyimpan laporan' }
  }
}

export async function toggleArchiveTask(taskId: string, isArchived: boolean): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('tasks')
      .update({ is_archived: isArchived })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true, message: isArchived ? 'Tugas dipindahkan ke arsip' : 'Tugas dikembalikan dari arsip' }
  } catch (err) {
    return { success: false, error: 'Gagal memperbarui status arsip tugas' }
  }
}
