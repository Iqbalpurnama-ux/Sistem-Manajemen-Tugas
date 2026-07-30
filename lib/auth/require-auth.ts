import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Shared auth helper — call at the top of every Server Component / Server Action
 * to avoid repeating the same auth-check boilerplate across the codebase.
 *
 * @throws Error when the Supabase server is unreachable (status >= 500)
 * @redirects to /login when the user is not authenticated
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    const isServerError =
      authError.message.toLowerCase().includes('fetch') ||
      (authError as any).status === 0 ||
      ((authError as any).status && (authError as any).status >= 500)

    if (isServerError) {
      throw new Error('Koneksi terputus. Gagal memverifikasi sesi.')
    }
  }

  if (!user) {
    redirect('/login')
  }

  return { supabase, user: user! }
}
