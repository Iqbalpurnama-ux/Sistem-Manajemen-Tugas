'use client'

import React, { useState } from 'react'
import { ProfileSettings } from './profile-settings'
import { CategorySettings } from './category-settings'
import { User, Tags } from 'lucide-react'

export function SettingsTabs({ profile, email, categories }: { profile: any, email: string, categories: any[] }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'category'>('profile')

  return (
    <div className="flex flex-col gap-[32px] max-w-[800px] mx-auto w-full">
      {/* Tab Navigation */}
      <div className="flex bg-[var(--clay-raised)] p-[6px] rounded-full gap-[8px]" style={{ boxShadow: 'inset 3px 3px 8px var(--shadow-dark), inset -3px -3px 8px var(--shadow-light)' }}>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-[8px] h-[44px] rounded-full text-[14px] font-[700] transition-all duration-300 ${activeTab === 'profile' ? 'bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] text-white shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] scale-[1.02]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
        >
          <User size={18} strokeWidth={2.5} /> Profil Saya
        </button>
        <button 
          onClick={() => setActiveTab('category')}
          className={`flex-1 flex items-center justify-center gap-[8px] h-[44px] rounded-full text-[14px] font-[700] transition-all duration-300 ${activeTab === 'category' ? 'bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] text-white shadow-[4px_4px_10px_var(--shadow-dark),-4px_-4px_10px_var(--shadow-light)] scale-[1.02]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'}`}
        >
          <Tags size={18} strokeWidth={2.5} /> Kategori Tugas
        </button>
      </div>

      {/* Tab Content */}
      <div className="clay p-[24px] sm:p-[40px] rounded-[var(--r-lg)] bg-[var(--clay)]" style={{ boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)' }}>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'profile' ? (
            <ProfileSettings profile={profile} email={email} />
          ) : (
            <CategorySettings categories={categories} />
          )}
        </div>
      </div>
    </div>
  )
}
