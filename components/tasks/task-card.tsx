'use client'

import React, { useState, useOptimistic, useTransition } from 'react'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, Trash2, Check, Pencil, FileText, Image as ImageIcon, X, Loader2, UploadCloud, Archive, ArchiveRestore } from 'lucide-react'
import { TaskForm } from './task-form'
import { FileDropzone } from './file-dropzone'
import { createClient } from '@/utils/supabase/client'
import { saveAttachment, toggleArchiveTask } from '@/lib/actions/tasks'
import { createPortal } from 'react-dom'
import { useEffect } from 'react'

export type TaskWithCategory = {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'To-Do' | 'Done'
  is_archived: boolean
  deadline: string | null
  category: { name: string; color: string } | null
  attachments?: {
    id: string
    file_name: string
    storage_path: string
    mime_type: string
    file_size: number
  }[]
}

export function TaskCard({ task }: { task: TaskWithCategory }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(task.status)
  const [isEditing, setIsEditing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isOpeningAttachment, setIsOpeningAttachment] = useState(false)
  const [isUploadingReport, setIsUploadingReport] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cachedUrl, setCachedUrl] = useState<string | null>(null)
  
  // Ref to track if a prefetch is already inflight to avoid duplicate calls
  const prefetchPromiseRef = React.useRef<Promise<string | null> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  function handleArchive() {
    startTransition(async () => {
      await toggleArchiveTask(task.id, !task.is_archived)
    })
  }

  async function getUrl(attachment: NonNullable<TaskWithCategory['attachments']>[0]) {
    if (cachedUrl) return cachedUrl
    if (prefetchPromiseRef.current) return prefetchPromiseRef.current

    const promise = (async () => {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('task_attachments')
        .createSignedUrl(attachment.storage_path, 120)

      if (data?.signedUrl) {
        setCachedUrl(data.signedUrl)
        setTimeout(() => setCachedUrl(null), 110000) // Clear cache before expiry
        return data.signedUrl
      }
      return null
    })()

    prefetchPromiseRef.current = promise
    const result = await promise
    prefetchPromiseRef.current = null
    return result
  }

  function handlePrefetch(attachment: NonNullable<TaskWithCategory['attachments']>[0]) {
    if (!cachedUrl && !prefetchPromiseRef.current) {
      getUrl(attachment).catch(() => {}) // Silently fail on prefetch
    }
  }

  async function handleAttachmentClick(attachment: NonNullable<TaskWithCategory['attachments']>[0]) {
    setIsOpeningAttachment(true)
    try {
      const url = await getUrl(attachment)
      if (!url) throw new Error('Gagal mendapatkan akses berkas')

      if (attachment.mime_type.startsWith('image/')) {
        setPreviewImage(url)
      } else {
        window.open(url, '_blank')
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan')
    } finally {
      setIsOpeningAttachment(false)
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

          {(() => {
            const attachment = task.attachments?.[0]
            if (!attachment) return null
            return (
              <button 
                onClick={() => handleAttachmentClick(attachment)}
                onMouseEnter={() => handlePrefetch(attachment)}
                disabled={isOpeningAttachment}
                className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[var(--r-sm)] bg-[var(--clay-raised)] hover:bg-white/60 transition-colors border-[1px] border-white/50 text-[var(--ink)] cursor-pointer disabled:opacity-50"
                style={{ boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)' }}
              >
                {isOpeningAttachment ? (
                  <Loader2 size={14} className="animate-spin text-[var(--ink-soft)]" />
                ) : attachment.mime_type.startsWith('image/') ? (
                  <ImageIcon size={14} className="text-[var(--blossom)]" />
                ) : (
                  <FileText size={14} className="text-[#F1699C]" />
                )}
                <span className="max-w-[100px] truncate">{attachment.file_name}</span>
              </button>
            )
          })()}
        </div>
      </div>

      {/* Task Side (Actions) */}
      <div className="flex items-center gap-[6px] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setIsUploadingReport(true)}
          disabled={isPending}
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-[var(--blossom-dark)] transition-colors"
          title="Upload Laporan"
        >
          <UploadCloud size={15} />
        </button>
        {(isDone || task.is_archived) && (
          <button 
            onClick={handleArchive}
            disabled={isPending}
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-orange-500 transition-colors"
            title={task.is_archived ? "Kembalikan dari Arsip" : "Simpan ke Arsip"}
          >
            {task.is_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
          </button>
        )}
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
      
      {/* Image Preview Modal */}
      {mounted && previewImage && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-[var(--blossom-soft)] transition-colors"
            >
              <X size={32} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-[var(--r-md)] shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            />
          </div>
        </div>,
        document.body
      )}

      {/* Upload Report Modal */}
      {mounted && isUploadingReport && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setIsUploadingReport(false)}>
          <div className="bg-[var(--bg)] p-6 rounded-[var(--r-md)] w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsUploadingReport(false)}
              className="absolute top-4 right-4 text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="font-heading font-semibold text-[18px] text-[var(--ink)] mb-4">Upload Laporan Tugas</h3>
            <FileDropzone 
              initialAttachment={task.attachments?.[0]}
              onUploadSuccess={async (data) => {
                const res = await saveAttachment(task.id, data)
                if (res.success) {
                  setIsUploadingReport(false)
                } else {
                  alert(res.error)
                }
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
