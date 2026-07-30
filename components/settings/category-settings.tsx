'use client'

import React, { useState, useTransition } from 'react'
import { updateCategory, deleteCategory } from '@/lib/actions/settings'
import { Input } from '@/components/ui/input'
import { Tags, Trash2, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'

// Preset colors suitable for the app's aesthetic
const PRESET_COLORS = [
  '#FFB5C5', // Default blossom
  '#F1699C', // Deep pink
  '#B48DF0', // Purple
  '#89C4F4', // Light blue
  '#A2D5AB', // Sage green
  '#FDE3A7', // Marigold yellow
  '#F3C623', // Bright orange
  '#D2D7D3'  // Silver/Grey
]

export function CategorySettings({ categories }: { categories: any[] }) {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Edit State
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')

  const handleEdit = (cat: any) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color || '#FFB5C5')
  }

  const handleSave = async (id: string) => {
    if (!editName.trim()) return
    
    startTransition(async () => {
      const res = await updateCategory(id, editName, editColor)
      if (res.success) {
        setEditingId(null)
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Tugas yang terhubung akan kehilangan label kategorinya.')) return
    
    startTransition(async () => {
      const res = await deleteCategory(id)
      if (!res.success) {
        alert(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex items-center gap-[12px] mb-[8px]">
        <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#F1699C]/20 to-[var(--blossom)]/20 flex items-center justify-center text-[var(--blossom-dark)]">
          <Tags size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-[18px] font-heading font-[800] text-[var(--ink)]">Manajemen Kategori</h3>
          <p className="text-[13px] font-[600] text-[var(--ink-soft)]">Ubah warna atau hapus kategori yang tidak lagi digunakan</p>
        </div>
      </div>

      <div className="flex flex-col gap-[16px]">
        {categories.length === 0 ? (
          <div className="p-[20px] text-center border-2 border-dashed border-[var(--shadow-dark)] rounded-[var(--r-md)] text-[var(--ink-soft)] font-[600] text-[14px]">
            Belum ada kategori yang dibuat.
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] p-[16px] bg-[var(--clay-raised)] rounded-[var(--r-md)] transition-all" style={{ boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)' }}>
              
              {editingId === cat.id ? (
                <div className="flex-1 flex flex-col gap-[12px]">
                  <Input 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-[40px] bg-white border-none text-[14px] font-[600] text-[var(--ink)]"
                  />
                  <div className="flex flex-wrap gap-[8px]">
                    {PRESET_COLORS.map(color => (
                      <div 
                        key={color}
                        onClick={() => setEditColor(color)}
                        className={`w-[24px] h-[24px] rounded-full cursor-pointer transition-transform ${editColor === color ? 'scale-125 ring-2 ring-offset-2 ring-[var(--ink)]' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Link href={`/dashboard?category=${cat.id}`} className="flex items-center gap-[12px] group cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-[16px] h-[16px] rounded-full shadow-sm border-[2px] border-white group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color || '#FFB5C5' }}></div>
                  <span className="font-[700] text-[15px] text-[var(--ink)] group-hover:text-[var(--blossom-dark)] transition-colors">{cat.name}</span>
                </Link>
              )}

              <div className="flex items-center gap-[8px] self-end sm:self-auto">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => setEditingId(null)} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center bg-[var(--shadow-light)] text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] transition-colors">
                      <X size={16} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleSave(cat.id)} disabled={isPending} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-500 hover:text-white transition-colors">
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(cat)} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center bg-white/50 text-[var(--ink-soft)] hover:text-blue-500 hover:bg-white transition-colors" style={{ boxShadow: '2px 2px 5px var(--shadow-dark)' }}>
                      <Edit2 size={15} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} disabled={isPending} className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center bg-white/50 text-[var(--ink-soft)] hover:text-red-500 hover:bg-white transition-colors" style={{ boxShadow: '2px 2px 5px var(--shadow-dark)' }}>
                      <Trash2 size={15} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
