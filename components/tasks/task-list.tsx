'use client'

import React, { useState, useEffect } from 'react'
import { TaskCard, TaskWithCategory } from './task-card'
import dynamic from 'next/dynamic'
import { Bell, Inbox, Plus, Layers, Loader2 } from 'lucide-react'

const TaskForm = dynamic(() => import('./task-form').then(mod => mod.TaskForm), {
  loading: () => <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[var(--blossom)]" /></div>
})

interface TaskListProps {
  tasks: TaskWithCategory[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setIsFormOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const [filter, setFilter] = useState<'Semua' | 'To-Do' | 'Done'>('Semua')

  const activeTasks = tasks.filter(t => !t.is_archived)
  const toDos = activeTasks.filter(t => t.status === 'To-Do')
  const done = activeTasks.filter(t => t.status === 'Done')

  const filteredTasks = activeTasks.filter(task => {
    if (filter === 'Semua') return true
    return task.status === filter
  })

  return (
    <>
      <div className="flex items-center gap-[18px] p-[20px_28px] bg-gradient-to-r from-[var(--blossom-soft)] to-[var(--lilac-soft)] rounded-[var(--r-lg)] relative z-[1]" style={{ boxShadow: '6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)' }}>
        <div className="w-[52px] h-[52px] rounded-[16px] shrink-0 bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] flex items-center justify-center text-white" style={{ boxShadow: '3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}>
          <Bell size={24} strokeWidth={2.5} />
        </div>
        <div>
          <b className="block text-[15px] font-[700] text-[var(--ink)]">Tugas Menunggu</b>
          <span className="text-[13px] text-[var(--ink-soft)] font-[600]">Kamu punya {toDos.length} tugas yang belum selesai hari ini.</span>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[24px]">
        <div className="p-[26px] flex items-center gap-[20px] clay">
          <div className="w-[72px] h-[72px] rounded-full shrink-0 flex items-center justify-center relative" style={{
            background: `conic-gradient(var(--blossom) 100%, rgba(61,36,54,0.08) 0)`,
            boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)'
          }}>
            <div className="absolute inset-[8px] rounded-full bg-[var(--clay)]" style={{ boxShadow: 'inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)' }}></div>
            <span className="relative z-[1] text-[var(--blossom-dark)]">
              <Layers size={22} strokeWidth={2.5} />
            </span>
          </div>
          <div>
            <div className="text-[28px] font-[700] font-heading leading-none text-[var(--ink)]">{activeTasks.length}</div>
            <div className="text-[13px] text-[var(--ink-soft)] font-[600] mt-[4px]">Total Tugas</div>
          </div>
        </div>
        <div className="p-[26px] flex items-center gap-[20px] clay">
          <div className="w-[72px] h-[72px] rounded-full shrink-0 flex items-center justify-center relative" style={{
            background: `conic-gradient(var(--sage) ${activeTasks.length > 0 ? Math.round((done.length / activeTasks.length) * 100) : 0}%, rgba(61,36,54,0.08) 0)`,
            boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)'
          }}>
            <div className="absolute inset-[8px] rounded-full bg-[var(--clay)]" style={{ boxShadow: 'inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)' }}></div>
            <span className="relative z-[1] font-heading font-[700] text-[15px] text-[var(--ink)]">{activeTasks.length > 0 ? Math.round((done.length / activeTasks.length) * 100) : 0}%</span>
          </div>
          <div>
            <div className="text-[28px] font-[700] font-heading leading-none text-[var(--ink)]">{done.length}</div>
            <div className="text-[13px] text-[var(--ink-soft)] font-[600] mt-[4px]">Selesai</div>
          </div>
        </div>
        <div className="p-[26px] flex items-center gap-[20px] clay">
          <div className="w-[72px] h-[72px] rounded-full shrink-0 flex items-center justify-center relative" style={{
            background: `conic-gradient(var(--marigold) ${toDos.length > 0 ? Math.round((activeTasks.filter(t => t.priority === 'High' && t.status === 'To-Do').length / toDos.length) * 100) : 0}%, rgba(61,36,54,0.08) 0)`,
            boxShadow: '4px 4px 10px var(--shadow-dark), -4px -4px 10px var(--shadow-light)'
          }}>
            <div className="absolute inset-[8px] rounded-full bg-[var(--clay)]" style={{ boxShadow: 'inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)' }}></div>
            <span className="relative z-[1] font-heading font-[700] text-[15px] text-[var(--ink)]">{toDos.length > 0 ? Math.round((activeTasks.filter(t => t.priority === 'High' && t.status === 'To-Do').length / toDos.length) * 100) : 0}%</span>
          </div>
          <div>
            <div className="text-[28px] font-[700] font-heading leading-none text-[var(--ink)]">{activeTasks.filter(t => t.priority === 'High' && t.status === 'To-Do').length}</div>
            <div className="text-[13px] text-[var(--ink-soft)] font-[600] mt-[4px]">Prioritas Tinggi</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-[8px_8px_0]">
        <h2 className="text-[20px] font-[700] font-heading text-[var(--ink)]">Tugas Anda</h2>
        <div className="flex gap-[10px]">
          <div 
            onClick={() => setFilter('Semua')}
            className={`text-[13px] font-[700] p-[8px_16px] rounded-[20px] cursor-pointer transition-all ${filter === 'Semua' ? 'text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)]' : 'text-[var(--ink-soft)] hover:bg-white/50'}`}
          >
            Semua
          </div>
          <div 
            onClick={() => setFilter('To-Do')}
            className={`text-[13px] font-[700] p-[8px_16px] rounded-[20px] cursor-pointer transition-all ${filter === 'To-Do' ? 'text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)]' : 'text-[var(--ink-soft)] hover:bg-white/50'}`}
          >
            Berjalan
          </div>
          <div 
            onClick={() => setFilter('Done')}
            className={`text-[13px] font-[700] p-[8px_16px] rounded-[20px] cursor-pointer transition-all ${filter === 'Done' ? 'text-white bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] shadow-[3px_3px_8px_var(--shadow-dark),-3px_-3px_8px_var(--shadow-light)]' : 'text-[var(--ink-soft)] hover:bg-white/50'}`}
          >
            Selesai
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[20px]">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center clay flex flex-col items-center justify-center gap-4">
             <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#F1699C]/20 to-[var(--blossom)]/20 flex items-center justify-center text-[var(--blossom-dark)] mb-2" style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}>
               <Inbox size={32} strokeWidth={2.5} />
             </div>
             <p className="font-heading font-bold text-xl text-[var(--ink)]">Belum ada tugas</p>
             <p className="text-sm font-[500] text-[var(--ink-soft)] max-w-[250px] leading-relaxed mb-2">
               {filter === 'Semua' ? 'Kanvas kosong! Mulai bangun produktivitas Anda dengan menambah tugas baru.' : 
                filter === 'To-Do' ? 'Bagus! Semua tugas sudah Anda selesaikan.' : 
                'Belum ada tugas yang selesai. Ayo kerjakan!'}
             </p>
             {filter === 'Semua' && (
               <button 
                 onClick={() => setIsFormOpen(true)}
                 className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-bold text-sm bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] hover:opacity-90 transition-opacity"
                 style={{ boxShadow: '3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}
               >
                 <Plus size={18} strokeWidth={3} />
                 <span>Buat Tugas Baru</span>
                 <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30 text-white font-sans">N</kbd>
               </button>
             )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button 
        onClick={() => setIsFormOpen(true)}
        className="fixed right-[40px] bottom-[40px] w-[64px] h-[64px] rounded-[22px] bg-gradient-to-br from-[#F1699C] to-[var(--blossom)] flex items-center justify-center text-white cursor-pointer z-[20] transition-transform active:scale-95 hover:-translate-y-1"
        style={{ boxShadow: '8px 8px 18px var(--shadow-dark), -8px -8px 16px var(--shadow-light), inset 2px 2px 4px rgba(255,255,255,0.4)' }}
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} />}
    </>
  )
}
