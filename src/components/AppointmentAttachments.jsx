import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Paperclip, Eye, Upload, Loader2, ChevronDown, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'

const BUCKET = 'service-task-attachments'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// "October 24, 2026 9:00 AM"
function formatUploadedAt(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} at ${timePart}`
}

function formatRole(role) {
  if (!role) return 'Unknown role'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function AppointmentAttachments({
  appointmentId,
  canUpload = true,
  maxFiles = 10,
}) {
  const inputRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])

  // ==========================================
  // LOAD ATTACHMENTS
  // ==========================================
  const loadFiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('service_task_attachments')
      .select(
        'id, file_name, file_path, file_type, file_size, uploaded_by_name, uploaded_by_role, created_at'
      )
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Load attachments error:', error)
      toast.error('Unable to load attachments.')
    } else {
      setFiles(data || [])
    }

    setLoading(false)
  }, [appointmentId])

  // Load on mount so the count shows even while collapsed
  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // ==========================================
  // LIVE UPDATES
  // When an admin or technician uploads a file,
  // it appears without refreshing the page.
  // ==========================================
  useEffect(() => {
    const channel = supabase
      .channel(`appointment-attachments-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_task_attachments',
          filter: `appointment_id=eq.${appointmentId}`,
        },
        () => {
          loadFiles()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [appointmentId, loadFiles])

  // ==========================================
  // VIEW
  // ==========================================
  const handleView = async (file) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.file_path, 60)

    if (error || !data?.signedUrl) {
      console.error('View attachment error:', error)
      toast.error('Unable to open attachment.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  // ==========================================
  // UPLOAD (one or many files)
  // ==========================================
  const handleUpload = async (e) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = ''

    if (!selected.length) return

    const slotsLeft = maxFiles - files.length

    if (slotsLeft <= 0) {
      toast.error(`You can only have ${maxFiles} attachments.`)
      return
    }

    const batch = selected.slice(0, slotsLeft)

    if (selected.length > slotsLeft) {
      toast(
        `Only ${slotsLeft} more file${slotsLeft > 1 ? 's' : ''} can be added. Extra files were skipped.`
      )
    }

    // Validate every file first
    const validFiles = batch.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (!isImage && !isVideo) {
        toast.error(`${file.name}: only images and videos are allowed.`)
        return false
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: must not exceed 50MB.`)
        return false
      }

      return true
    })

    if (!validFiles.length) return

    // First attachment on an appointment must be a vehicle photo
    if (files.length === 0 && !validFiles[0].type.startsWith('image/')) {
      toast.error('The first attachment must be a vehicle photo.')
      return
    }

    setUploading(true)
    let successCount = 0

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) throw new Error('You must be logged in.')

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      for (let index = 0; index < validFiles.length; index++) {
        const file = validFiles[index]
        let uploadedPath = null

        try {
          const safeName = (file.name || 'attachment')
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_+/g, '_')

          const filePath = `${user.id}/${appointmentId}/${Date.now()}-${index}-${safeName}`

          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, { cacheControl: '3600', upsert: false })

          if (uploadError) throw uploadError
          uploadedPath = filePath

          const { error: insertError } = await supabase
            .from('service_task_attachments')
            .insert([
              {
                appointment_id: appointmentId,
                file_name: file.name,
                file_path: filePath,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: user.id,
                uploaded_by_name: profile.name,
                uploaded_by_role: profile.role,
              },
            ])

          if (insertError) throw insertError

          successCount++
        } catch (fileError) {
          console.error('Upload attachment error:', fileError)

          // Don't leave an orphan file in storage
          if (uploadedPath) {
            await supabase.storage.from(BUCKET).remove([uploadedPath])
          }

          toast.error(
            `${file.name}: ${fileError?.message || 'upload failed.'}`
          )
        }
      }

      if (successCount > 0) {
        toast.success(
          successCount === 1
            ? 'Attachment uploaded.'
            : `${successCount} attachments uploaded.`
        )
      }

      await loadFiles()
    } catch (error) {
      console.error('Upload attachment error:', error)
      toast.error(error?.message || 'Failed to upload attachment.')
    } finally {
      setUploading(false)
    }
  }

  const canAddMore = canUpload && files.length < maxFiles

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
          <Paperclip className="h-4 w-4" />
          Attachments
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-500">
            {files.length}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-2 border-t border-slate-200 p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading attachments...
            </div>
          ) : files.length === 0 ? (
            <p className="text-xs text-slate-500">No attachments yet.</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{file.file_name}</span>
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    Uploaded by{' '}
                    <span className="font-semibold text-slate-700">
                      {file.uploaded_by_name || 'Unknown user'}
                    </span>
                    {' • '}
                    {formatRole(file.uploaded_by_role)}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span>{formatUploadedAt(file.created_at)}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleView(file)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
              </div>
            ))
          )}

          {canAddMore && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Add attachments ({files.length} / {maxFiles})
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}