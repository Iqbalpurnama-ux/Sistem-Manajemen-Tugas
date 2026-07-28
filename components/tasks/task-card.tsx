'use client'

import React, { useState, useOptimistic, useTransition } from 'react'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, Trash2, Check, Pencil } from 'lucide-react'
import { TaskForm } from './task-form'

export type TaskWithCategory = {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'To-Do' | 'Done'
  deadline: string | null
  category: { name: string; color: string } | null
}

export function TaskCard({ task }: { task: TaskWithCategory }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(task.status)
  const [isEditing, setIsEditing] = useState(false)

  function handleCheck() {
    const newStatus = optimisticStatus === 'Done' ? 'To-Do' : 'Done'
    
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      await updateTaskStatus(task.id, newStatus)
    })
  }

  function handleDelete() {
    if (confirm('Hapus tugas ini?')) {
      startTransition(async () => {
        await deleteTask(task.id)
      })
    }
  }

  const isDone = optimisticStatus === 'Done'

  // Map priorities to badge styling based on user HTML reference
  const badgeClass = {
    'High': 'badge-high',
    'Medium': 'badge-mid',
    'Low': 'badge-low'
  }[task.priority]

  const badgeText = {
    'High': 'Prioritas Tinggi',
    'Medium': 'Prioritas Sedang',
    'Low': 'Prioritas Rendah'
  }[task.priority]

  return (
    <div className="p-[18px_22px] flex items-center gap-[18px] transition-transform duration-[0.15s] hover:-translate-y-[3px] clay group">
      
      {/* Checkbox */}
      <button 
        onClick={handleCheck}
        disabled={isPending}
        className={`w-[30px] h-[30px] rounded-[10px] shrink-0 cursor-pointer flex items-center justify-center transition-all duration-[0.12s] ${isDone ? 'bg-gradient-to-br from-[#6BCB9F] to-[var(--sage)] text-white' : 'bg-[var(--clay-raised)] text-transparent'}`}
        style={isDone ? { boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.15)' } : { boxShadow: '3px 3px 7px var(--shadow-dark), -3px -3px 7px var(--shadow-light)' }}
      >
        <Check size={16} strokeWidth={3} />
      </button>

      {/* Task Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[10px] flex-wrap">
          <span className={`text-[15.5px] font-[600] font-heading ${isDone ? 'line-through text-[var(--ink-faint)]' : 'text-[var(--ink)]'}`}>
            {task.title}
          </span>
          {isDone ? (
            <span className="badge badge-done">Selesai</span>
          ) : (
            <span className={`badge ${badgeClass}`}>{badgeText}</span>
          )}
        </div>
        
        <div className="flex items-center gap-[14px] mt-[8px] text-[12.5px] text-[var(--ink-soft)] font-[600] flex-wrap">
          {task.deadline && (
            <span className="flex items-center gap-[6px]">
              <Clock size={14} /> {format(new Date(task.deadline), 'd MMM, HH:mm', { locale: id })}
            </span>
          )}
          
          {task.category && (
            <span className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full" style={{ background: task.category.color || 'var(--lilac)' }}></span>
              {task.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Task Side (Actions) */}
      <div className="flex items-center gap-[6px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-[var(--blossom-dark)] transition-colors"
          title="Edit Tugas"
        >
          <Pencil size={15} />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-red-500 transition-colors"
          title="Hapus Tugas"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {isEditing && <TaskForm onClose={() => setIsEditing(false)} initialData={task} />}
    </div>
  )
}
