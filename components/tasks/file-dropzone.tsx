'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type AttachmentData = {
  file_name: string
  storage_path: string
  mime_type: string
  file_size: number
}

interface FileDropzoneProps {
  onUploadSuccess: (data: AttachmentData) => void
  onRemove?: () => void
  initialAttachment?: AttachmentData | null
  disabled?: boolean
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileDropzone({ onUploadSuccess, onRemove, initialAttachment, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [attachment, setAttachment] = useState<AttachmentData | null>(initialAttachment || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // AbortController for cancel
  const abortControllerRef = useRef<AbortController | null>(null)

  const validateFile = (f: File) => {
    if (f.size > MAX_SIZE) {
      return 'Ukuran file maksimal 10MB.'
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Hanya mendukung gambar (JPG/PNG) dan PDF.'
    }
    return null
  }

  const handleUpload = async (selectedFile: File) => {
    const error = validateFile(selectedFile)
    if (error) {
      setStatus('error')
      setErrorMessage(error)
      return
    }

    setFile(selectedFile)
    setStatus('uploading')
    setProgress(0)
    setErrorMessage('')

    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi tidak valid')

      const ext = selectedFile.name.split('.').pop()
      const uuid = crypto.randomUUID()
      const filePath = `${user.id}/${uuid}.${ext}`

      // Simulasi progress (karena supabase-js v2 standar belum mengekspos onUploadProgress dengan mudah, 
      // kita buat simulasi UI yang cepat jika file kecil, dan kita bisa implement TUS untuk file besar,
      // tapi untuk MVP 10MB, upload standar sudah cukup).
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 15, 90))
      }, 200)

      const { data, error: uploadError } = await supabase.storage
        .from('task_attachments')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      clearInterval(progressInterval)

      if (uploadError) {
        throw uploadError
      }

      setProgress(100)
      setStatus('success')
      
      const attData: AttachmentData = {
        file_name: selectedFile.name,
        storage_path: data.path,
        mime_type: selectedFile.type,
        file_size: selectedFile.size
      }
      
      setAttachment(attData)
      onUploadSuccess(attData)

    } catch (err: unknown) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengunggah berkas')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && status !== 'uploading') setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || status === 'uploading') return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    setAttachment(null)
    setStatus('idle')
    setProgress(0)
    if (onRemove) onRemove()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (attachment && status !== 'uploading') {
    const isImage = attachment.mime_type.startsWith('image/')
    return (
      <div className="flex flex-col gap-[8px]">
        <label className="text-[13px] font-[600] text-[var(--ink-soft)]">Lampiran</label>
        <div className="p-[16px] rounded-[var(--r-md)] bg-[var(--clay-raised)] flex items-center justify-between border-[2px] border-white/50" style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}>
          <div className="flex items-center gap-[12px] min-w-0">
            <div className="w-[40px] h-[40px] shrink-0 rounded-[8px] bg-[var(--blossom-soft)] flex items-center justify-center text-[var(--blossom-dark)]">
              {isImage ? <ImageIcon size={20} /> : <FileIcon size={20} />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-[600] text-[var(--ink)] truncate">{attachment.file_name}</span>
              <span className="text-[12px] font-[500] text-[var(--ink-faint)]">{formatBytes(attachment.file_size)}</span>
            </div>
          </div>
          {!disabled && (
            <button type="button" onClick={removeFile} className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-white/50 text-[var(--ink-soft)] hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[13px] font-[600] text-[var(--ink-soft)]">Lampiran (Opsional, PDF/IMG max 10MB)</label>
      
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => status === 'idle' || status === 'error' ? fileInputRef.current?.click() : undefined}
        className={`relative w-full rounded-[var(--r-md)] border-[2px] border-dashed p-[24px] flex flex-col items-center justify-center transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed border-[var(--ink-faint)] bg-[var(--clay)]' :
          isDragging ? 'border-[var(--blossom)] bg-[var(--blossom-soft)]' : 
          'border-[var(--ink-faint)] hover:border-[var(--blossom-dark)] bg-[var(--clay-raised)] cursor-pointer'
        }`}
        style={{ boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)' }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept={ALLOWED_TYPES.join(',')} 
          className="hidden" 
          disabled={disabled || status === 'uploading'}
        />

        {status === 'idle' && (
          <>
            <UploadCloud size={32} className="text-[var(--ink-faint)] mb-[12px]" />
            <p className="text-[14px] font-[600] text-[var(--ink)] text-center">
              Klik atau tarik berkas ke sini
            </p>
            <p className="text-[12px] font-[500] text-[var(--ink-soft)] text-center mt-[4px]">
              Mendukung PNG, JPG, PDF
            </p>
          </>
        )}

        {status === 'uploading' && (
          <div className="w-full flex flex-col items-center">
            <p className="text-[14px] font-[600] text-[var(--ink)] mb-[12px]">Mengunggah... {progress}%</p>
            <div className="w-full max-w-[200px] h-[6px] bg-white/50 rounded-full overflow-hidden" style={{ boxShadow: 'inset 1px 1px 3px var(--shadow-dark)' }}>
              <div 
                className="h-full bg-[var(--blossom-dark)] transition-all duration-200 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={32} className="text-red-500 mb-[12px]" />
            <p className="text-[14px] font-[600] text-red-500 text-center mb-[8px]">{errorMessage}</p>
            <Button type="button" size="sm" variant="outline" className="h-[32px] text-[12px] border-red-500 text-red-500 hover:bg-red-50">
              Coba Lagi
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
