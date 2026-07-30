import { Settings } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsTabs } from '@/components/settings/settings-tabs'

export default async function PengaturanPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  return (
    <div className="flex-1 w-full flex flex-col gap-[24px]">
      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[24px] font-[800] font-heading text-[var(--ink)] flex items-center gap-[10px]">
          <Settings size={28} className="text-[var(--blossom)]" /> Pengaturan
        </h2>
      </div>

      <div className="pt-[16px]">
        <SettingsTabs 
          profile={profile} 
          email={user.email || ''} 
          categories={categories || []} 
        />
      </div>
    </div>
  )
}
