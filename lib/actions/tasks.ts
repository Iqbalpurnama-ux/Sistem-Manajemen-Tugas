'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Judul tugas minimal 3 karakter').max(100, 'Judul terlalu panjang'),
  priority: z.enum(['Low', 'Medium', 'High']),
  deadline: z.string().optional(),
  category_id: z.string().uuid('Kategori tidak valid').optional().nullable(),
  description: z.string().max(1000, 'Deskripsi terlalu panjang').optional().nullable(),
})

const AttachmentSchema = z.object({
  file_name: z.string().max(255),
  storage_path: z.string(),
  mime_type: z.string().regex(/^[\w\-]+\/[\w\-\+\.]+$/, 'Tipe file tidak valid'),
  file_size: z.number().max(10 * 1024 * 1024, 'Ukuran file maks 10MB')
})

const UUID_SCHEMA = z.string().uuid('ID tidak valid')

export type TaskActionResponse = {
  success: boolean
  message?: string
  error?: string
}

export async function createTask(formData: FormData): Promise<TaskActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' }
    }

    // Self-healing: Pastikan profil user ada sebelum membuat relasi
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url
    }, { onConflict: 'id' })

    // Rate Limiting: Max 20 tasks per minute per user
    const rateLimitRes = await rateLimit({ id: `create-task-${user.id}`, limit: 20, windowMs: 60000 })
    if (!rateLimitRes.success) {
      logger.warn('Rate limit exceeded for createTask', { userId: user.id })
      return { success: false, error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' }
    }

    const rawData = {
      title: formData.get('title'),
      priority: formData.get('priority') || 'Medium',
      deadline: formData.get('deadline') || undefined,
      category_id: formData.get('category_id') || undefined,
      description: formData.get('description') || undefined,
    }

    const validated = CreateTaskSchema.safeParse(rawData)
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    // Parse & Validate Attachment Data (server-side)
    let attachmentData = null
    const attachmentStr = formData.get('attachment')
    if (attachmentStr && typeof attachmentStr === 'string') {
      try {
        const parsed = JSON.parse(attachmentStr)
        const validAttachment = AttachmentSchema.safeParse(parsed)
        if (validAttachment.success) {
          attachmentData = validAttachment.data
        } else {
          console.error("Invalid attachment data:", validAttachment.error)
        }
      } catch (e) {
        console.error("Failed to parse attachment", e)
      }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: validated.data.title,
        priority: validated.data.priority,
        deadline: validated.data.deadline || null,
        category_id: validated.data.category_id || null,
        description: validated.data.description || null,
        status: 'To-Do'
      })
      .select()
      .single()

    if (error || !task) {
      logger.error('Create Task Error', { error: error?.message })
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
      if (attError) logger.error('Create Attachment Error', { error: attError.message })
    }

    revalidatePath('/dashboard')
    return { success: true, message: 'Tugas berhasil ditambahkan' }
  } catch (err) {
    logger.error('Error creating task', { error: err })
    return { success: false, error: 'Terjadi kesalahan sistem internal.' }
  }
}

export async function editTask(taskId: string, formData: FormData): Promise<TaskActionResponse> {
  try {
    // Validate taskId is a proper UUID
    const idValidation = UUID_SCHEMA.safeParse(taskId)
    if (!idValidation.success) {
      return { success: false, error: 'ID tugas tidak valid' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Sesi berakhir' }

    const rawData = {
      title: formData.get('title'),
      priority: formData.get('priority') || 'Medium',
      deadline: formData.get('deadline') || undefined,
      category_id: formData.get('category_id') || undefined,
      description: formData.get('description') || undefined,
    }

    const validated = CreateTaskSchema.safeParse(rawData)
    if (!validated.success) return { success: false, error: validated.error.issues[0].message }

    // Parse & Validate Attachment Data (server-side)
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
        description: validated.data.description || null,
      })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) return { success: false, error: 'Gagal mengubah tugas' }

    const removeAttachment = formData.get('remove_attachment') === 'true'
    
    if (newAttachmentData || removeAttachment) {
      const { data: existing } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
      
      if (existing) {
        await supabase.storage.from('task_attachments').remove([existing.storage_path])
        
        if (newAttachmentData) {
          await supabase.from('attachments').update({
            file_name: newAttachmentData.file_name,
            storage_path: newAttachmentData.storage_path,
            mime_type: newAttachmentData.mime_type,
            file_size: newAttachmentData.file_size
          }).eq('id', existing.id)
        } else if (removeAttachment) {
          await supabase.from('attachments').delete().eq('id', existing.id)
        }
      } else if (newAttachmentData) {
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
    const idValidation = UUID_SCHEMA.safeParse(taskId)
    if (!idValidation.success) return { success: false, error: 'ID tidak valid' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { success: false, error: 'Gagal mengubah status tugas' }
  }
}

export async function deleteTask(taskId: string): Promise<TaskActionResponse> {
  try {
    const idValidation = UUID_SCHEMA.safeParse(taskId)
    if (!idValidation.success) return { success: false, error: 'ID tidak valid' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: existingAtt } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
    if (existingAtt) {
      await supabase.storage.from('task_attachments').remove([existingAtt.storage_path])
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/arsip')
    return { success: true, message: 'Tugas dihapus' }
  } catch (err) {
    return { success: false, error: 'Gagal menghapus tugas' }
  }
}

export async function saveAttachment(taskId: string, attachmentData: { file_name: string, storage_path: string, mime_type: string, file_size: number }): Promise<TaskActionResponse> {
  try {
    const idValidation = UUID_SCHEMA.safeParse(taskId)
    if (!idValidation.success) return { success: false, error: 'ID tidak valid' }

    // Validate attachment data server-side
    const validAttachment = AttachmentSchema.safeParse(attachmentData)
    if (!validAttachment.success) {
      return { success: false, error: validAttachment.error.issues[0].message }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: existing } = await supabase.from('attachments').select('*').eq('task_id', taskId).single()
    if (existing) {
      await supabase.storage.from('task_attachments').remove([existing.storage_path])
      await supabase.from('attachments').update({
        file_name: validAttachment.data.file_name,
        storage_path: validAttachment.data.storage_path,
        mime_type: validAttachment.data.mime_type,
        file_size: validAttachment.data.file_size
      }).eq('id', existing.id)
    } else {
      await supabase.from('attachments').insert({
        task_id: taskId,
        user_id: user.id,
        file_name: validAttachment.data.file_name,
        storage_path: validAttachment.data.storage_path,
        mime_type: validAttachment.data.mime_type,
        file_size: validAttachment.data.file_size
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
    const idValidation = UUID_SCHEMA.safeParse(taskId)
    if (!idValidation.success) return { success: false, error: 'ID tidak valid' }

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
    revalidatePath('/dashboard/arsip')
    return { success: true, message: isArchived ? 'Tugas dipindahkan ke arsip' : 'Tugas dikembalikan dari arsip' }
  } catch (err) {
    return { success: false, error: 'Gagal memperbarui status arsip tugas' }
  }
}
