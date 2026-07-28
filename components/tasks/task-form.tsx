'use client'

import React, { useState, useTransition } from 'react'
import { createTask, editTask } from '@/lib/actions/tasks'
import { getOrCreateCategory } from '@/lib/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, CalendarIcon } from 'lucide-react'
import type { TaskWithCategory } from '@/components/tasks/task-card'

interface TaskFormProps {
  onClose: () => void
  initialData?: TaskWithCategory
}

export function TaskForm({ onClose, initialData }: TaskFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  // Controlled inputs for custom logic
  const [categoryName, setCategoryName] = useState(initialData?.category?.name || '')
  const [priority, setPriority] = useState(initialData?.priority || 'Medium')
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    
    startTransition(async () => {
      let categoryId = ''
      
      // Handle Hybrid Category
      if (categoryName.trim()) {
        const catResult = await getOrCreateCategory(categoryName)
        if (!catResult.success || !catResult.data) {
          setError(catResult.error || 'Gagal memproses kategori')
          return
        }
        categoryId = catResult.data.id
      }
      
      // Append category_id if exists
      if (categoryId) {
        formData.set('category_id', categoryId)
      }

      // Create or Edit Task
      const result = initialData 
        ? await editTask(initialData.id, formData)
        : await createTask(formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={isPending ? undefined : onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative bg-[var(--clay)] w-full max-w-lg rounded-[var(--r-lg)] p-[24px] sm:p-[32px] animate-in fade-in zoom-in-95 duration-300" style={{ boxShadow: '20px 20px 40px var(--shadow-dark), -20px -20px 40px var(--shadow-light)' }}>
        <h2 className="text-[22px] font-heading font-[700] text-[var(--ink)] mb-[24px]">{initialData ? 'Edit Tugas' : 'Tambah Tugas Baru'}</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-[600] text-[var(--ink-soft)]" htmlFor="title">Judul Tugas <span className="text-[var(--blossom-dark)]">*</span></label>
            <Input 
              id="title" 
              name="title" 
              required 
              defaultValue={initialData?.title}
              placeholder="Apa yang perlu diselesaikan?" 
              className="rounded-[var(--r-sm)] bg-[var(--clay-raised)] border-none h-[48px] px-[16px] focus-visible:ring-2 focus-visible:ring-[var(--blossom)] text-[var(--ink)] font-heading font-[600] text-[15px]"
              style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <div className="flex flex-col gap-[8px] relative">
              <label className="text-[13px] font-[600] text-[var(--ink-soft)]" htmlFor="priority">Prioritas</label>
              
              {/* Custom Dropdown UI */}
              <div 
                onClick={() => !isPending && setIsPriorityOpen(!isPriorityOpen)}
                className="w-full h-[48px] px-[16px] rounded-[var(--r-sm)] bg-[var(--clay-raised)] flex items-center justify-between text-[var(--ink)] cursor-pointer font-[600]"
                style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
              >
                <span>
                  {priority === 'High' ? 'High (Tinggi)' : priority === 'Medium' ? 'Medium (Sedang)' : 'Low (Rendah)'}
                </span>
                <ChevronDown size={18} className={`transition-transform text-[var(--ink-soft)] ${isPriorityOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isPriorityOpen && (
                <div className="absolute top-[80px] left-0 w-full bg-[var(--clay-raised)] rounded-[var(--r-sm)] z-20 overflow-hidden flex flex-col border-[2px] border-white" style={{ boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)' }}>
                  {(['High', 'Medium', 'Low'] as const).map(p => (
                    <div 
                      key={p} 
                      onClick={() => { setPriority(p); setIsPriorityOpen(false) }}
                      className={`px-[16px] py-[12px] cursor-pointer font-[600] text-[14px] hover:bg-white/70 transition-colors ${priority === p ? 'text-[var(--blossom-dark)] bg-white/40' : 'text-[var(--ink)]'}`}
                    >
                      {p === 'High' ? 'High (Tinggi)' : p === 'Medium' ? 'Medium (Sedang)' : 'Low (Rendah)'}
                    </div>
                  ))}
                </div>
              )}
              {/* Hidden input to pass value to FormData */}
              <input type="hidden" name="priority" value={priority} />
            </div>

            <div className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-[600] text-[var(--ink-soft)]" htmlFor="deadline">Tenggat Waktu</label>
              <div className="relative">
                <Input 
                  id="deadline" 
                  name="deadline" 
                  type="datetime-local" 
                  defaultValue={initialData?.deadline ? new Date(new Date(initialData.deadline).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : undefined} 
                  className="rounded-[var(--r-sm)] bg-[var(--clay-raised)] border-none h-[48px] px-[16px] focus-visible:ring-2 focus-visible:ring-[var(--blossom)] text-[var(--ink)] font-[600] w-full css-date-input"
                  style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
                  disabled={isPending}
                />
                <CalendarIcon size={18} className="absolute right-[16px] top-[15px] text-[var(--blossom)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-[600] text-[var(--ink-soft)]" htmlFor="category">Kategori (Opsional)</label>
            <Input 
              id="category" 
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Contoh: Kuliah, Pekerjaan" 
              className="rounded-[var(--r-sm)] bg-[var(--clay-raised)] border-none h-[48px] px-[16px] focus-visible:ring-2 focus-visible:ring-[var(--blossom)] text-[var(--ink)] font-[500]"
              style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
              disabled={isPending}
            />
            <p className="text-[12px] text-[var(--ink-faint)] mt-[2px] font-[600]">
              Ketik nama kategori baru atau yang sudah ada.
            </p>
          </div>

          {error && (
            <div className="p-[12px] text-[13px] font-[600] text-[var(--blossom-dark)] bg-[var(--blossom-soft)] rounded-[var(--r-sm)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-[12px] mt-[16px]">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isPending}
              className="h-[46px] px-[20px] rounded-[var(--r-md)] font-[700] text-[var(--ink-soft)] hover:bg-[var(--white)] transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="h-[46px] px-[24px] rounded-[var(--r-md)] font-[700] text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] hover:brightness-110 active:scale-95 transition-all"
              style={{ boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)' }}
            >
              {isPending ? 'Menyimpan...' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
