'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function loginWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return redirect(`/login?message=${encodeURIComponent('Masukkan alamat email yang valid')}&type=error`)
  }

  const supabase = await createClient()

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('Magic Link Error:', error.message)
    const errMsg = error.message === '{}' 
      ? 'Terlalu banyak permintaan atau jaringan bermasalah. Tunggu beberapa saat.' 
      : (error.message || 'Gagal mengirim Magic Link')
    return redirect(`/login?message=${encodeURIComponent(errMsg)}&type=error`)
  }

  return redirect(`/login?message=${encodeURIComponent('Cek email Anda untuk tautan masuk!')}&type=success`)
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('Google OAuth Error:', error.message)
    return redirect(`/login?message=${encodeURIComponent('Google Login gagal: ' + error.message)}&type=error`)
  }

  if (data.url) {
    redirect(data.url)
  }

  return redirect(`/login?message=${encodeURIComponent('Gagal mendapatkan URL Google. Pastikan Google OAuth sudah dikonfigurasi di Supabase.')}&type=error`)
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
