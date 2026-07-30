'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export type Category = {
  id: string
  name: string
  color: string | null
}

export async function getOrCreateCategory(categoryName: string): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const name = categoryName.trim()
    if (!name) return { success: false, error: 'Nama kategori tidak boleh kosong' }

    const rateLimitRes = await rateLimit({ id: `create-category-${user.id}`, limit: 10, windowMs: 60000 })
    if (!rateLimitRes.success) {
      logger.warn('Rate limit exceeded for getOrCreateCategory', { userId: user.id })
      return { success: false, error: 'Terlalu banyak permintaan. Silakan tunggu sebentar.' }
    }

    // Self-healing: Pastikan profil user ada di public.profiles sebelum membuat relasi
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url
    }, { onConflict: 'id' })

    // Cek apakah kategori sudah ada
    const { data: existing, error: searchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .ilike('name', name)
      .maybeSingle()

    if (searchError) throw searchError

    if (existing) {
      return { success: true, data: existing }
    }

    // Jika belum ada, buat baru (Hybrid behavior)
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: name,
        color: '#FFB5C5' // Default warm accent color
      })
      .select('*')
      .single()

    if (insertError) throw insertError

    revalidatePath('/dashboard')
    return { success: true, data: newCategory }
  } catch (err) {
    logger.error('Category Action Error', { userId: 'unknown', error: err })
    return { success: false, error: 'Gagal memproses kategori' }
  }
}
