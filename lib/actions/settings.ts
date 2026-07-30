'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileName(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: name })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function updateCategory(id: string, name: string, color: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, color })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure security

  if (error) {
    console.error('Error updating category:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure security

  if (error) {
    console.error('Error deleting category:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
