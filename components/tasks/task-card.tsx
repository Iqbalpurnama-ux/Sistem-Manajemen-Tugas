'use client'

import React, { useState, useOptimistic, useTransition, useEffect, useRef, useCallback } from 'react'
import { updateTaskStatus, deleteTask } from '@/lib/actions/tasks'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock, Trash2, Check, Pencil, FileText, Image as ImageIcon, X, Loader2, UploadCloud, Archive, ArchiveRestore, MoreVertical } from 'lucide-react'
import { TaskForm } from './task-form'
import { FileDropzone } from './file-dropzone'
import { createClient } from '@/utils/supabase/client'
import { saveAttachment, toggleArchiveTask } from '@/lib/actions/tasks'
import { createPortal } from 'react-dom'

// Signed URL constants
const SIGNED_URL_EXPIRY_SECONDS = 120
const SIGNED_URL_CACHE_DURATION_MS = 110_000

export type TaskWithCategory = {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'To-Do' | 'Done'
  is_archived: boolean
  deadline: string | null
  description?: string | null
  category: { name: string; color: string } | null
  attachments?: {
    id: string
    file_name: string
    storage_path: string
    mime_type: string
    file_size: number
  }[]
}

// Delete confirmation modal component
function ConfirmDeleteModal({ taskTitle, onConfirm, onCancel, isPending }: {
  taskTitle: string
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return createPortal(
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div 
        className="bg-[var(--clay)] p-[28px] rounded-[var(--r-lg)] w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '20px 20px 40px var(--shadow-dark), -20px -20px 40px var(--shadow-light)' }}
      >
        <div className="w-[52px] h-[52px] rounded-full bg-red-100 flex items-center justify-center mx-auto mb-[16px]">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 id="delete-dialog-title" className="text-[18px] font-heading font-[800] text-[var(--ink)] text-center mb-[8px]">Hapus Tugas?</h3>
        <p className="text-[14px] font-[600] text-[var(--ink-soft)] text-center mb-[24px] leading-relaxed">
          Tugas <span className="font-[700] text-[var(--ink)]">"{taskTitle}"</span> akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="flex gap-[12px]">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-[46px] rounded-[var(--r-md)] font-[700] text-[var(--ink-soft)] bg-[var(--clay-raised)] hover:bg-white transition-colors"
            style={{ boxShadow: '3px 3px 8px var(--shadow-dark), -3px -3px 8px var(--shadow-light)' }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-[46px] rounded-[var(--r-md)] font-[700] text-white bg-gradient-to-br from-red-400 to-red-600 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isPending ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Ref to track if a prefetch is already inflight to avoid duplicate calls
  const prefetchPromiseRef = useRef<Promise<string | null> | null>(null)
  // Ref to track the cache cleanup timer for proper cleanup
  const cacheTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      // Cleanup timer on unmount to prevent memory leak
      if (cacheTimerRef.current) {
        clearTimeout(cacheTimerRef.current)
      }
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!showMobileMenu) return
    const handler = (e: MouseEvent) => {
      setShowMobileMenu(false)
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showMobileMenu])

  function handleCheck() {
    const newStatus = optimisticStatus === 'Done' ? 'To-Do' : 'Done'
    startTransition(async () => {
      setOptimisticStatus(newStatus)
      await updateTaskStatus(task.id, newStatus)
    })
  }

  function handleDeleteClick() {
    setShowDeleteConfirm(true)
    setShowMobileMenu(false)
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      await deleteTask(task.id)
      setShowDeleteConfirm(false)
    })
  }

  function handleArchive() {
    setShowMobileMenu(false)
    startTransition(async () => {
      await toggleArchiveTask(task.id, !task.is_archived)
    })
  }

  const getUrl = useCallback(async (attachment: NonNullable<TaskWithCategory['attachments']>[0]) => {
    if (cachedUrl) return cachedUrl
    if (prefetchPromiseRef.current) return prefetchPromiseRef.current

    const promise = (async () => {
      const supabase = createClient()
      const { data } = await supabase.storage
        .from('task_attachments')
        .createSignedUrl(attachment.storage_path, SIGNED_URL_EXPIRY_SECONDS)

      if (data?.signedUrl) {
        setCachedUrl(data.signedUrl)
        // Store timer ref so we can clear it on unmount
        cacheTimerRef.current = setTimeout(() => setCachedUrl(null), SIGNED_URL_CACHE_DURATION_MS)
        return data.signedUrl
      }
      return null
    })()

    prefetchPromiseRef.current = promise
    const result = await promise
    prefetchPromiseRef.current = null
    return result
  }, [cachedUrl])

  function handlePrefetch(attachment: NonNullable<TaskWithCategory['attachments']>[0]) {
    if (!cachedUrl && !prefetchPromiseRef.current) {
      getUrl(attachment).catch(() => {})
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
        aria-label={isDone ? `Tandai "${task.title}" sebagai belum selesai` : `Tandai "${task.title}" sebagai selesai`}
        className={`w-[30px] h-[30px] rounded-[10px] shrink-0 cursor-pointer flex items-center justify-center transition-all duration-[0.12s] ${isDone ? 'bg-gradient-to-br from-[#6BCB9F] to-[var(--sage)] text-white' : 'bg-[var(--clay-raised)] text-transparent'}`}
        style={isDone ? { boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.15)' } : { boxShadow: '3px 3px 7px var(--shadow-dark), -3px -3px 7px var(--shadow-light)' }}
      >
        <Check size={16} strokeWidth={3} aria-hidden="true" />
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
            <span className="flex items-center gap-[6px]" aria-label={`Tenggat: ${format(new Date(task.deadline), 'd MMM, HH:mm', { locale: id })}`}>
              <Clock size={14} aria-hidden="true" /> {format(new Date(task.deadline), 'd MMM, HH:mm', { locale: id })}
            </span>
          )}
          
          {task.category && (
            <span className="flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full" style={{ background: task.category.color || 'var(--lilac)' }} aria-hidden="true"></span>
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
                aria-label={`Buka lampiran: ${attachment.file_name}`}
                className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[var(--r-sm)] bg-[var(--clay-raised)] hover:bg-white/60 transition-colors border-[1px] border-white/50 text-[var(--ink)] cursor-pointer disabled:opacity-50"
                style={{ boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)' }}
              >
                {isOpeningAttachment ? (
                  <Loader2 size={14} className="animate-spin text-[var(--ink-soft)]" aria-hidden="true" />
                ) : attachment.mime_type.startsWith('image/') ? (
                  <ImageIcon size={14} className="text-[var(--blossom)]" aria-hidden="true" />
                ) : (
                  <FileText size={14} className="text-[#F1699C]" aria-hidden="true" />
                )}
                <span className="max-w-[100px] truncate">{attachment.file_name}</span>
              </button>
            )
          })()}
        </div>
      </div>

      {/* Task Actions — Always visible on mobile via MoreVertical, hover on desktop */}
      <div className="flex items-center gap-[6px] shrink-0">
        {/* Desktop actions (hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsUploadingReport(true)}
            disabled={isPending}
            aria-label="Upload laporan tugas"
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-[var(--blossom-dark)] transition-colors"
          >
            <UploadCloud size={15} aria-hidden="true" />
          </button>
          {(isDone || task.is_archived) && (
            <button 
              onClick={handleArchive}
              disabled={isPending}
              aria-label={task.is_archived ? `Kembalikan "${task.title}" dari arsip` : `Simpan "${task.title}" ke arsip`}
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-orange-500 transition-colors"
            >
              {task.is_archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
            </button>
          )}
          <button 
            onClick={() => setIsEditing(true)}
            disabled={isPending}
            aria-label={`Edit tugas "${task.title}"`}
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-[var(--blossom-dark)] transition-colors"
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
          <button 
            onClick={handleDeleteClick}
            disabled={isPending}
            aria-label={`Hapus tugas "${task.title}"`}
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Mobile actions — always visible via dropdown */}
        <div className="sm:hidden relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMobileMenu(v => !v) }}
            aria-label="Aksi tugas"
            aria-expanded={showMobileMenu}
            aria-haspopup="menu"
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[var(--ink-soft)] cursor-pointer bg-[var(--clay-raised)] clay-tight"
          >
            <MoreVertical size={16} aria-hidden="true" />
          </button>

          {showMobileMenu && (
            <div 
              role="menu"
              className="absolute right-0 top-[42px] bg-[var(--clay-raised)] rounded-[var(--r-md)] z-[30] flex flex-col min-w-[160px] overflow-hidden"
              style={{ boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                role="menuitem"
                onClick={() => { setIsUploadingReport(true); setShowMobileMenu(false) }}
                className="flex items-center gap-[10px] px-[16px] py-[12px] text-[13px] font-[600] text-[var(--ink)] hover:bg-white/70 transition-colors"
              >
                <UploadCloud size={15} aria-hidden="true" /> Upload Laporan
              </button>
              <button 
                role="menuitem"
                onClick={() => { setIsEditing(true); setShowMobileMenu(false) }}
                className="flex items-center gap-[10px] px-[16px] py-[12px] text-[13px] font-[600] text-[var(--ink)] hover:bg-white/70 transition-colors"
              >
                <Pencil size={15} aria-hidden="true" /> Edit Tugas
              </button>
              {(isDone || task.is_archived) && (
                <button 
                  role="menuitem"
                  onClick={handleArchive}
                  className="flex items-center gap-[10px] px-[16px] py-[12px] text-[13px] font-[600] text-orange-500 hover:bg-white/70 transition-colors"
                >
                  {task.is_archived ? <ArchiveRestore size={15} aria-hidden="true" /> : <Archive size={15} aria-hidden="true" />}
                  {task.is_archived ? 'Kembalikan' : 'Arsipkan'}
                </button>
              )}
              <button 
                role="menuitem"
                onClick={handleDeleteClick}
                className="flex items-center gap-[10px] px-[16px] py-[12px] text-[13px] font-[600] text-red-500 hover:bg-white/70 transition-colors border-t border-[var(--shadow-dark)]/20"
              >
                <Trash2 size={15} aria-hidden="true" /> Hapus Tugas
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing && <TaskForm onClose={() => setIsEditing(false)} initialData={task} />}
      
      {/* Delete Confirmation Modal */}
      {mounted && showDeleteConfirm && (
        <ConfirmDeleteModal
          taskTitle={task.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
          isPending={isPending}
        />
      )}

      {/* Image Preview Modal */}
      {mounted && previewImage && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" 
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Preview gambar lampiran"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <button 
              onClick={() => setPreviewImage(null)}
              aria-label="Tutup preview gambar"
              className="absolute -top-10 right-0 text-white hover:text-[var(--blossom-soft)] transition-colors"
            >
              <X size={32} aria-hidden="true" />
            </button>
            <img 
              src={previewImage} 
              alt={`Preview lampiran tugas: ${task.title}`}
              className="max-w-full max-h-[85vh] object-contain rounded-[var(--r-md)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Upload Report Modal */}
      {mounted && isUploadingReport && createPortal(
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" 
          onClick={() => setIsUploadingReport(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div className="bg-[var(--bg)] p-6 rounded-[var(--r-md)] w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsUploadingReport(false)}
              aria-label="Tutup dialog upload"
              className="absolute top-4 right-4 text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <h3 id="upload-modal-title" className="font-heading font-semibold text-[18px] text-[var(--ink)] mb-4">Upload Laporan Tugas</h3>
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
