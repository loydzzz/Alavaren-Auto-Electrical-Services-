import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'

import {
  Megaphone,
  Plus,
  Search,
  Image as ImageIcon,
  Video,
  Users,
  User,
  Wrench,
  ShieldCheck,
  CalendarDays,
  Clock3,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  X,
  Upload,
  FileImage,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'

// Works on http://, older iOS, and every browser
const makeId = () => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch (e) {}
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

// iPhone files can have an empty file.type, uppercase extensions,
// or .heic/.mov names, so detect them safely.
const getExtension = (file, type) => {
  const fromName = file.name?.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : ''

  const fromMime = (file.type || '').split('/')[1]?.toLowerCase()

  if (fromName === 'jpeg') return 'jpg'
  if (fromName) return fromName
  if (fromMime === 'quicktime') return 'mov'
  if (fromMime) return fromMime
  return type === 'video' ? 'mp4' : 'jpg'
}

const getContentType = (file, ext, type) => {
  if (file.type) return file.type
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
  }
  return map[ext] || (type === 'video' ? 'video/mp4' : 'image/jpeg')
}

// Resizes to max 1920px and converts any photo (HEIC, PNG, big JPG) to JPEG
const compressImage = (file, maxSize = 1920, quality = 0.85) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) return resolve(file)

          const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '')
          resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        quality
      )
    }

    // If the browser can't decode it, fall back to the original file
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
export default function Announcements() {
  // =========================================================
  // STATE
  // =========================================================

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] =
    useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [mediaType, setMediaType] = useState('image')
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)

  const [audience, setAudience] = useState([
    'customer',
    'technician',
    'admin',
  ])

  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')

  const [status, setStatus] = useState('draft')

  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [search, setSearch] = useState('')

  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)

  // =========================================================
  // FETCH ANNOUNCEMENTS
  // =========================================================

  const fetchAnnouncements = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Error fetching announcements:',
        error
      )
    } else {
      setAnnouncements(data || [])
    }

    setLoading(false)
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // =========================================================
  // AUDIENCE TOGGLE
  // =========================================================

  const toggleAudience = (role) => {
    setAudience((current) => {
      if (current.includes(role)) {
        return current.filter(
          (item) => item !== role
        )
      }

      return [...current, role]
    })
  }

  // =========================================================
  // FILE VALIDATION
  // =========================================================

  const validateFile = (file, type) => {
  if (!file) return false

  const maxImageSize = 10 * 1024 * 1024
  const maxVideoSize = 50 * 1024 * 1024 // Supabase free plan limit is 50MB per file

  const name = (file.name || '').toLowerCase()
  const imageExt = /\.(jpe?g|png|webp|gif|heic|heif)$/.test(name)
  const videoExt = /\.(mp4|mov|webm|m4v)$/.test(name)

  if (type === 'image') {
    if (!file.type.startsWith('image/') && !imageExt) {
      alert('Please select a valid image file.')
      return false
    }
    if (file.size > maxImageSize) {
      alert('Image is too large. Maximum size is 10MB.')
      return false
    }
  }

  if (type === 'video') {
    if (!file.type.startsWith('video/') && !videoExt) {
      alert('Please select a valid video file.')
      return false
    }
    if (file.size > maxVideoSize) {
      alert('Video is too large. Maximum size is 50MB.')
      return false
    }
  }

  return true
}

  // =========================================================
  // MEDIA SELECTION
  // =========================================================

 const selectMedia = async (file) => {
  if (!file) return

  let finalFile = file

  if (mediaType === 'image') {
    const looksLikeImage =
      file.type.startsWith('image/') ||
      /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name || '')

    if (!looksLikeImage) {
      alert('Please select a valid image file.')
      return
    }

    if (file.size > 30 * 1024 * 1024) {
      alert('Image is too large. Maximum original size is 30MB.')
      return
    }

    // Keep GIFs as they are (compressing would remove the animation)
    if (!file.type.includes('gif')) {
      setProcessing(true)
      finalFile = await compressImage(file)
      setProcessing(false)
    }
  }

  if (!validateFile(finalFile, mediaType)) return

  if (mediaPreview?.startsWith('blob:')) {
    URL.revokeObjectURL(mediaPreview)
  }

  setMediaFile(finalFile)
  setMediaPreview(URL.createObjectURL(finalFile))
}

  // =========================================================
  // FILE INPUT
  // =========================================================

  const handleMediaChange = (event) => {
    const file =
      event.target.files?.[0]

    selectMedia(file)
  }

  // =========================================================
  // DRAG & DROP
  // =========================================================

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragActive(false)

    const file =
      event.dataTransfer.files?.[0]

    selectMedia(file)
  }

  // =========================================================
  // REMOVE SELECTED MEDIA
  // =========================================================

  const removeSelectedMedia = () => {
    if (mediaPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview)
    }

    setMediaFile(null)

    if (editingAnnouncement?.media_url) {
      setMediaPreview(
        editingAnnouncement.media_url
      )
    } else {
      setMediaPreview(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =========================================================
  // MEDIA TYPE CHANGE
  // =========================================================

  const changeMediaType = (type) => {
    setMediaType(type)

    if (mediaFile) {
      setMediaFile(null)
    }

    if (
      !editingAnnouncement ||
      !editingAnnouncement.media_url
    ) {
      setMediaPreview(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    if (mediaPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreview)
    }

    setEditingAnnouncement(null)

    setTitle('')
    setDescription('')

    setMediaType('image')
    setMediaFile(null)
    setMediaPreview(null)

    setAudience([
      'customer',
      'technician',
      'admin',
    ])

    setStartsAt('')
    setEndsAt('')

    setStatus('draft')

    setDragActive(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (saving) return

    resetForm()
    setShowForm(false)
  }

  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  // =========================================================
  // UPLOAD MEDIA
  // =========================================================

  const uploadMedia = async () => {
  if (!mediaFile) return null

  const fileExtension = getExtension(mediaFile, mediaType)
  const fileName = `${makeId()}.${fileExtension}`
  const filePath = `${mediaType}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('announcement-media')
    .upload(filePath, mediaFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: getContentType(mediaFile, fileExtension, mediaType),
    })

  if (uploadError) throw uploadError

  const { data: publicUrlData } = supabase.storage
    .from('announcement-media')
    .getPublicUrl(filePath)

  return publicUrlData.publicUrl
}

  // =========================================================
  // CREATE ANNOUNCEMENT
  // =========================================================

  const handleCreateAnnouncement = async (
    event
  ) => {
    event.preventDefault()

    if (!title.trim()) {
      alert(
        'Please enter an announcement title.'
      )
      return
    }

    if (audience.length === 0) {
      alert(
        'Please select at least one audience.'
      )
      return
    }

    if (
      startsAt &&
      endsAt &&
      new Date(startsAt) >=
        new Date(endsAt)
    ) {
      alert(
        'End date/time must be after the start date/time.'
      )
      return
    }

    setSaving(true)

    try {
      // =====================================================
      // GET CURRENT ADMIN
      // =====================================================

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser()

      if (!user) {
        throw new Error(
          'You are not logged in.'
        )
      }

      // =====================================================
      // UPLOAD MEDIA
      // =====================================================

      let mediaUrl = null

      if (mediaFile) {
        mediaUrl =
          await uploadMedia()
      }

      // =====================================================
      // SAVE ANNOUNCEMENT
      // =====================================================

      const {
        error,
      } =
        await supabase
          .from('announcements')
          .insert({
            title:
              title.trim(),

            description:
              description.trim() ||
              null,

            media_type:
              mediaFile
                ? mediaType
                : null,

            media_url:
              mediaUrl,

            audience,

            status,

            starts_at:
              startsAt
                ? new Date(
                    startsAt
                  ).toISOString()
                : null,

            ends_at:
              endsAt
                ? new Date(
                    endsAt
                  ).toISOString()
                : null,

            created_by:
              user.id,
          })

      if (error) {
        throw error
      }

      alert(
        'Announcement created successfully!'
      )

      closeForm()

      await fetchAnnouncements()

    } catch (error) {
      console.error(
        'Create announcement error:',
        error
      )

      alert(
        error.message ||
        'Failed to create announcement.'
      )
    } finally {
      setSaving(false)
    }
  }

  // =========================================================
  // START EDITING
  // =========================================================

  const startEditing = (
    announcement
  ) => {
    setEditingAnnouncement(
      announcement
    )

    setTitle(
      announcement.title || ''
    )

    setDescription(
      announcement.description || ''
    )

    setMediaType(
      announcement.media_type ||
      'image'
    )

    setMediaFile(null)

    setMediaPreview(
      announcement.media_url ||
      null
    )

    setAudience(
      Array.isArray(
        announcement.audience
      )
        ? announcement.audience
        : []
    )

    // =====================================================
    // START DATE
    // =====================================================

    if (announcement.starts_at) {
      const startDate =
        new Date(
          announcement.starts_at
        )

      const localStart =
        new Date(
          startDate.getTime() -
            startDate.getTimezoneOffset() *
              60000
        )
          .toISOString()
          .slice(0, 16)

      setStartsAt(localStart)
    } else {
      setStartsAt('')
    }

    // =====================================================
    // END DATE
    // =====================================================

    if (announcement.ends_at) {
      const endDate =
        new Date(
          announcement.ends_at
        )

      const localEnd =
        new Date(
          endDate.getTime() -
            endDate.getTimezoneOffset() *
              60000
        )
          .toISOString()
          .slice(0, 16)

      setEndsAt(localEnd)
    } else {
      setEndsAt('')
    }

    setStatus(
      announcement.status ||
      'draft'
    )

    setShowForm(true)
  }

  // =========================================================
  // UPDATE ANNOUNCEMENT
  // =========================================================

  const handleUpdateAnnouncement =
    async (event) => {
      event.preventDefault()

      if (!editingAnnouncement) {
        return
      }

      if (!title.trim()) {
        alert(
          'Please enter an announcement title.'
        )
        return
      }

      if (audience.length === 0) {
        alert(
          'Please select at least one audience.'
        )
        return
      }

      if (
        startsAt &&
        endsAt &&
        new Date(startsAt) >=
          new Date(endsAt)
      ) {
        alert(
          'End date/time must be after the start date/time.'
        )
        return
      }

      setSaving(true)

      try {
        // ===================================================
        // OLD MEDIA
        // ===================================================

        const oldMediaUrl =
          editingAnnouncement.media_url ||
          null

        let mediaUrl =
          oldMediaUrl

        let finalMediaType =
          editingAnnouncement.media_type ||
          null

        let newMediaUploaded =
          false

        // ===================================================
        // NEW MEDIA
        // ===================================================

        if (mediaFile) {
          mediaUrl =
            await uploadMedia()

          finalMediaType =
            mediaType

          newMediaUploaded =
            true
        }

        // ===================================================
        // UPDATE DATABASE
        // ===================================================

        const {
          error,
        } =
          await supabase
            .from('announcements')
            .update({
              title:
                title.trim(),

              description:
                description.trim() ||
                null,

              media_type:
                finalMediaType,

              media_url:
                mediaUrl,

              audience,

              status,

              starts_at:
                startsAt
                  ? new Date(
                      startsAt
                    ).toISOString()
                  : null,

              ends_at:
                endsAt
                  ? new Date(
                      endsAt
                    ).toISOString()
                  : null,

              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'id',
              editingAnnouncement.id
            )

        if (error) {
          throw error
        }

        // ===================================================
        // DELETE OLD MEDIA
        // ===================================================

        if (
          newMediaUploaded &&
          oldMediaUrl &&
          oldMediaUrl !== mediaUrl
        ) {
          const oldStoragePath =
            getStoragePathFromUrl(
              oldMediaUrl
            )

          if (oldStoragePath) {
            const {
              error:
                deleteStorageError,
            } =
              await supabase.storage
                .from(
                  'announcement-media'
                )
                .remove([
                  oldStoragePath,
                ])

            if (
              deleteStorageError
            ) {
              console.error(
                'Old media cleanup failed:',
                deleteStorageError
              )
            } else {
              console.log(
                '🗑️ Old announcement media deleted:',
                oldStoragePath
              )
            }
          }
        }

        alert(
          'Announcement updated successfully!'
        )

        closeForm()

        await fetchAnnouncements()

      } catch (error) {
        console.error(
          'Update announcement error:',
          error
        )

        alert(
          error.message ||
          'Failed to update announcement.'
        )
      } finally {
        setSaving(false)
      }
    }

  // =========================================================
  // DELETE ANNOUNCEMENT
  // =========================================================

  const deleteAnnouncement =
    async (announcement) => {
      const confirmed =
        window.confirm(
          `Delete "${announcement.title}"? This will also remove its media file.`
        )

      if (!confirmed) {
        return
      }

      try {
        // ===================================================
        // DELETE DATABASE ROW
        // ===================================================

        const {
          error,
        } =
          await supabase
            .from('announcements')
            .delete()
            .eq(
              'id',
              announcement.id
            )

        if (error) {
          throw error
        }

        // ===================================================
        // DELETE MEDIA
        // ===================================================

        if (
          announcement.media_url
        ) {
          const storagePath =
            getStoragePathFromUrl(
              announcement.media_url
            )

          if (storagePath) {
            const {
              error:
                storageError,
            } =
              await supabase.storage
                .from(
                  'announcement-media'
                )
                .remove([
                  storagePath,
                ])

            if (
              storageError
            ) {
              console.error(
                'Storage cleanup failed:',
                storageError
              )
            } else {
              console.log(
                '🗑️ Announcement media deleted:',
                storagePath
              )
            }
          }
        }

        await fetchAnnouncements()

      } catch (error) {
        console.error(
          'Delete announcement error:',
          error
        )

        alert(
          error.message ||
          'Failed to delete announcement.'
        )
      }
    }

  // =========================================================
  // TOGGLE PUBLISH
  // =========================================================

  const togglePublish = async (
    announcement
  ) => {
    const newStatus =
      announcement.status ===
      'published'
        ? 'draft'
        : 'published'

    const {
      error,
    } =
      await supabase
        .from('announcements')
        .update({
          status:
            newStatus,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          announcement.id
        )

    if (error) {
      console.error(
        'Publish error:',
        error
      )

      alert(
        'Failed to update announcement.'
      )

      return
    }

    await fetchAnnouncements()
  }

  // =========================================================
  // STORAGE PATH
  // =========================================================

  const getStoragePathFromUrl =
    (mediaUrl) => {
      if (!mediaUrl) {
        return null
      }

      const marker =
        '/storage/v1/object/public/announcement-media/'

      const markerIndex =
        mediaUrl.indexOf(marker)

      if (markerIndex === -1) {
        console.error(
          '❌ Invalid announcement media URL:',
          mediaUrl
        )

        return null
      }

      const storagePath =
        mediaUrl.substring(
          markerIndex +
            marker.length
        )

      return decodeURIComponent(
        storagePath
      )
    }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return 'Not scheduled'
    }

    return new Date(
      date
    ).toLocaleString(
      'en-PH',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    )
  }

  // =========================================================
  // FILE SIZE
  // =========================================================

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) return ''

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  // =========================================================
  // FILTER
  // =========================================================

  const filteredAnnouncements =
    announcements.filter(
      (announcement) => {
        const query =
          search
            .trim()
            .toLowerCase()

        if (!query) {
          return true
        }

        return (
          announcement.title
            ?.toLowerCase()
            .includes(query) ||
          announcement.description
            ?.toLowerCase()
            .includes(query)
        )
      }
    )

  // =========================================================
  // STATS
  // =========================================================

  const totalCount =
    announcements.length

  const publishedCount =
    announcements.filter(
      (item) =>
        item.status ===
        'published'
    ).length

  const draftCount =
    announcements.filter(
      (item) =>
        item.status ===
        'draft'
    ).length

  // =========================================================
  // AUDIENCE CONFIG
  // =========================================================

  const audienceConfig = {
    customer: {
      label: 'Customers',
      icon: User,
      color:
        'text-blue-600 bg-blue-50 border-blue-100',
    },

    technician: {
      label: 'Technicians',
      icon: Wrench,
      color:
        'text-orange-600 bg-orange-50 border-orange-100',
    },

    admin: {
      label: 'Admins',
      icon: ShieldCheck,
      color:
        'text-purple-600 bg-purple-50 border-purple-100',
    },
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PREMIUM HEADER
      ===================================================== */}

      <div className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-slate-950
        via-blue-950
        to-indigo-900
        px-4
        sm:px-6
        lg:px-8
        py-7
        sm:py-9
      ">

        <div className="
          absolute
          -top-24
          -right-24
          w-72
          h-72
          rounded-full
          bg-blue-500/20
          blur-3xl
        " />

        <div className="
          absolute
          -bottom-32
          left-1/3
          w-80
          h-80
          rounded-full
          bg-indigo-500/10
          blur-3xl
        " />

        <div className="
          relative
          max-w-7xl
          mx-auto
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-6
        ">

          <div>

            <div className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-white/10
              border
              border-white/10
              text-blue-200
              text-xs
              font-medium
              mb-4
            ">
              <Sparkles size={14} />

              Communication Center
            </div>

            <h1 className="
              text-2xl
              sm:text-3xl
              lg:text-4xl
              font-bold
              text-white
              tracking-tight
            ">
              Announcements
            </h1>

            <p className="
              text-blue-100/70
              mt-2
              max-w-xl
              text-sm
              sm:text-base
            ">
              Create and control what customers,
              technicians, and administrators
              see across their dashboards.
            </p>

          </div>


          <button
            onClick={openCreateForm}
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2
              bg-white
              text-slate-900
              px-5
              py-3
              rounded-xl
              font-semibold
              shadow-lg
              shadow-black/10
              hover:bg-blue-50
              active:scale-[0.98]
              transition
            "
          >

            <Plus
              size={19}
              className="
                group-hover:rotate-90
                transition-transform
              "
            />

            Create Announcement

          </button>

        </div>

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-8
        py-6
      ">

        {/* ===================================================
            STATS
        =================================================== */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-3
          gap-4
          mb-6
        ">

          <StatCard
            icon={Megaphone}
            label="Total"
            value={totalCount}
            color="blue"
          />

          <StatCard
            icon={CheckCircle2}
            label="Published"
            value={publishedCount}
            color="green"
          />

          <StatCard
            icon={AlertCircle}
            label="Drafts"
            value={draftCount}
            color="amber"
          />

        </div>


        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-3
          sm:p-4
          mb-5
          shadow-sm
          flex
          flex-col
          sm:flex-row
          gap-3
          sm:items-center
          sm:justify-between
        ">

          <div className="
            relative
            flex-1
          ">

            <Search
              size={18}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search announcements..."
              className="
                w-full
                pl-10
                pr-4
                py-2.5
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                text-sm
                outline-none
                focus:bg-white
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/10
                transition
              "
            />

          </div>


          <button
            onClick={fetchAnnouncements}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-200
              text-slate-600
              text-sm
              font-medium
              hover:bg-slate-50
              transition
            "
          >
            <RefreshCw size={16} />

            Refresh
          </button>

        </div>


        {/* ===================================================
            LIST
        =================================================== */}

{/* ===================================================
    LIST
=================================================== */}

{loading ? (
  <div className="grid gap-4">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-4
          animate-pulse
        "
      >
        <div
          className="
            h-44
            sm:h-52
            bg-slate-100
            rounded-xl
            mb-4
          "
        />

        <div
          className="
            h-4
            bg-slate-100
            rounded
            w-2/3
            mt-3
          "
        />
      </div>
    ))}
  </div>
) : filteredAnnouncements.length === 0 ? (
  <div
    className="
      bg-white
      border
      border-slate-200
      rounded-3xl
      py-16
      px-6
      text-center
      shadow-sm
    "
  >
    <div
      className="
        w-16
        h-16
        mx-auto
        rounded-2xl
        bg-blue-50
        text-blue-600
        flex
        items-center
        justify-center
        mb-4
      "
    >
      <Megaphone size={28} />
    </div>

    <h2
      className="
        text-lg
        font-bold
        text-slate-900
      "
    >
      {search
        ? 'No announcements found'
        : 'No announcements yet'}
    </h2>

    <p
      className="
        text-slate-500
        mt-1
        max-w-md
        mx-auto
      "
    >
      {search
        ? 'Try a different search term.'
        : 'Create your first announcement to communicate with your dashboard users.'}
    </p>

    {!search && (
      <button
        onClick={openCreateForm}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          px-4
          py-2.5
          rounded-xl
          bg-blue-600
          text-white
          font-semibold
          text-sm
          hover:bg-blue-700
        "
      >
        <Plus size={17} />
        Create Announcement
      </button>
    )}
  </div>
) : (
  <div className="grid gap-5">
    {filteredAnnouncements.map((announcement) => (
      <AnnouncementCard
        key={announcement.id}
        announcement={announcement}
        audienceConfig={audienceConfig}
        onEdit={startEditing}
        onPublish={togglePublish}
        onDelete={deleteAnnouncement}
        formatDate={formatDate}
      />
    ))}
  </div>
)}



      </div>


      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showForm && (

        <div className="
          fixed
          inset-0
          z-[100]
          bg-slate-950/70
          backdrop-blur-sm
          p-3
          sm:p-5
          flex
          items-center
          justify-center
        ">

          <div className="
            bg-white
            w-full
            max-w-3xl
            max-h-[94vh]
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
            flex
            flex-col
          ">

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="
              px-5
              sm:px-7
              py-5
              border-b
              border-slate-100
              flex
              items-center
              justify-between
              gap-4
              flex-shrink-0
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  w-11
                  h-11
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                  text-white
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-blue-500/20
                ">
                  <Megaphone size={21} />
                </div>

                <div>

                  <h2 className="
                    font-bold
                    text-slate-900
                    text-lg
                    sm:text-xl
                  ">
                    {editingAnnouncement
                      ? 'Edit Announcement'
                      : 'Create Announcement'}
                  </h2>

                  <p className="
                    text-xs
                    sm:text-sm
                    text-slate-500
                  ">
                    Control exactly who sees this
                    announcement.
                  </p>

                </div>

              </div>


              <button
                onClick={closeForm}
                disabled={saving}
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:text-slate-700
                  hover:bg-slate-100
                  transition
                "
              >
                <X size={19} />
              </button>

            </div>


            {/* ===============================================
                FORM
            =============================================== */}

            <form
              onSubmit={
                editingAnnouncement
                  ? handleUpdateAnnouncement
                  : handleCreateAnnouncement
              }
              className="
                overflow-y-auto
                p-5
                sm:p-7
                space-y-6
              "
            >

              {/* =============================================
                  TITLE
              ============================================= */}

              <FormSection
                label="Announcement title"
                required
              >

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. 10% Service Discount"
                  className="
                    input-premium
                  "
                />

              </FormSection>


              {/* =============================================
                  DESCRIPTION
              ============================================= */}

              <FormSection
                label="Description"
              >

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Write the message your users should see..."
                  rows={4}
                  className="
                    input-premium
                    resize-none
                  "
                />

              </FormSection>


              {/* =============================================
                  MEDIA TYPE
              ============================================= */}

              <FormSection
                label="Announcement media"
              >

                <div className="
                  grid
                  grid-cols-2
                  gap-3
                  mb-4
                ">

                  <MediaTypeButton
                    active={
                      mediaType === 'image'
                    }
                    icon={ImageIcon}
                    title="Image"
                    description="JPG, PNG, WEBP"
                    onClick={() =>
                      changeMediaType(
                        'image'
                      )
                    }
                  />

                  <MediaTypeButton
                    active={
                      mediaType === 'video'
                    }
                    icon={Video}
                    title="Video"
                    description="MP4, WEBM, MOV"
                    onClick={() =>
                      changeMediaType(
                        'video'
                      )
                    }
                  />

                </div>


                <div
                  onDragOver={
                    handleDragOver
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                  onDrop={
                    handleDrop
                  }
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className={`
                    relative
                    border-2
                    border-dashed
                    rounded-2xl
                    p-5
                    sm:p-8
                    text-center
                    cursor-pointer
                    transition-all
                    ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/40'
                    }
                  `}
                >

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={
                      mediaType ===
                      'image'
                        ? 'image/*'
                        : 'video/*'
                    }
                    onChange={
                      handleMediaChange
                    }
                    className="hidden"
                  />


                  {!mediaPreview ? (

                    <>

                      <div className="
                        w-14
                        h-14
                        mx-auto
                        rounded-2xl
                        bg-blue-50
                        text-blue-600
                        flex
                        items-center
                        justify-center
                        mb-3
                      ">

                        <Upload size={25} />

                      </div>

                      <p className="
                        font-semibold
                        text-slate-800
                      ">
                        Drop your{' '}
                        {mediaType}{' '}
                        here
                      </p>

                      <p className="
                        text-sm
                        text-slate-500
                        mt-1
                      ">
                        or click to browse
                      </p>

                      <p className="
                        text-xs
                        text-slate-400
                        mt-3
                      ">
                        {mediaType ===
                        'image'
                          ? 'Maximum 10MB'
                          : 'Maximum 100MB'}
                      </p>

                    </>

                  ) : (

                    <div
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      className="
                        relative
                        overflow-hidden
                        rounded-xl
                        bg-slate-950
                      "
                    >

                      {mediaType === 'image' ? (
  <img
    src={mediaPreview}
    alt="Preview"
    onError={(e) => {
      e.currentTarget.style.display = 'none'
      alert('This image format cannot be previewed. On your iPhone go to Settings → Camera → Formats → Most Compatible, then try again.')
    }}
    className="w-full max-h-[360px] object-contain"
  />
) : (
  <video
    src={mediaPreview}
    controls
    playsInline
    muted
    preload="metadata"
    className="w-full max-h-[360px]"
  />
)}

                      <button
                        type="button"
                        onClick={
                          removeSelectedMedia
                        }
                        className="
                          absolute
                          top-3
                          right-3
                          w-9
                          h-9
                          rounded-xl
                          bg-black/70
                          text-white
                          flex
                          items-center
                          justify-center
                          hover:bg-red-600
                          transition
                        "
                      >
                        <X size={17} />
                      </button>

                    </div>

                  )}

                </div>
{processing && (
  <p className="mt-3 text-sm text-blue-600 flex items-center gap-2">
    <Loader2 size={15} className="animate-spin" />
    Optimizing image...
  </p>
)}

                {mediaFile && (

                  <div className="
                    mt-3
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-xl
                    bg-slate-50
                    border
                    border-slate-100
                  ">

                    {mediaType ===
                    'image' ? (
                      <FileImage
                        size={18}
                        className="text-blue-600"
                      />
                    ) : (
                      <PlayCircle
                        size={18}
                        className="text-purple-600"
                      />
                    )}

                    <div className="
                      min-w-0
                      flex-1
                    ">

                      <p className="
                        text-sm
                        font-medium
                        text-slate-700
                        truncate
                      ">
                        {mediaFile.name}
                      </p>

                      <p className="
                        text-xs
                        text-slate-400
                        mt-0.5
                      ">
                        {formatFileSize(
                          mediaFile.size
                        )}
                      </p>

                    </div>

                    <CheckCircle2
                      size={18}
                      className="text-green-500"
                    />

                  </div>

                )}

              </FormSection>


              {/* =============================================
                  AUDIENCE
              ============================================= */}

              <FormSection
                label="Who can see this?"
                hint="Select one or more dashboard roles."
              >

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-3
                  gap-3
                ">

                  {[
                    {
                      value:
                        'customer',
                      label:
                        'Customers',
                      icon: User,
                    },

                    {
                      value:
                        'technician',
                      label:
                        'Technicians',
                      icon: Wrench,
                    },

                    {
                      value:
                        'admin',
                      label:
                        'Admins',
                      icon:
                        ShieldCheck,
                    },
                  ].map(
                    (item) => {

                      const Icon =
                        item.icon

                      const active =
                        audience.includes(
                          item.value
                        )

                      return (
                        <button
                          key={
                            item.value
                          }
                          type="button"
                          onClick={() =>
                            toggleAudience(
                              item.value
                            )
                          }
                          className={`
                            relative
                            p-4
                            rounded-2xl
                            border
                            text-left
                            transition-all
                            ${
                              active
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }
                          `}
                        >

                          {active && (
                            <CheckCircle2
                              size={17}
                              className="
                                absolute
                                top-3
                                right-3
                                text-blue-600
                              "
                            />
                          )}

                          <div className={`
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            mb-3
                            ${
                              active
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }
                          `}>

                            <Icon
                              size={18}
                            />

                          </div>

                          <p className="
                            font-semibold
                            text-sm
                            text-slate-800
                          ">
                            {item.label}
                          </p>

                          <p className="
                            text-xs
                            text-slate-400
                            mt-1
                          ">
                            Dashboard access
                          </p>

                        </button>
                      )
                    }
                  )}

                </div>

              </FormSection>


              {/* =============================================
                  SCHEDULE
              ============================================= */}

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <FormSection
                  label="Start date & time"
                >

                  <div className="relative">

                    <CalendarDays
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="datetime-local"
                      value={
                        startsAt
                      }
                      onChange={(
                        event
                      ) =>
                        setStartsAt(
                          event.target
                            .value
                        )
                      }
                      className="
                        input-premium
                        pl-10
                      "
                    />

                  </div>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1.5
                  ">
                    Philippines time
                  </p>

                </FormSection>


                <FormSection
                  label="End date & time"
                >

                  <div className="relative">

                    <Clock3
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="datetime-local"
                      value={
                        endsAt
                      }
                      onChange={(
                        event
                      ) =>
                        setEndsAt(
                          event.target
                            .value
                        )
                      }
                      className="
                        input-premium
                        pl-10
                      "
                    />

                  </div>

                  <p className="
                    text-xs
                    text-slate-400
                    mt-1.5
                  ">
                    Leave empty for no expiration
                  </p>

                </FormSection>

              </div>


              {/* =============================================
                  STATUS
              ============================================= */}

              <FormSection
                label="Publication status"
              >

                <div className="
                  grid
                  grid-cols-2
                  gap-3
                ">

                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        'draft'
                      )
                    }
                    className={`
                      p-4
                      rounded-2xl
                      border
                      text-left
                      transition
                      ${
                        status ===
                        'draft'
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }
                    `}
                  >

                    <div className="
                      flex
                      items-center
                      gap-2
                      mb-1
                    ">

                      <EyeOff
                        size={17}
                        className="
                          text-amber-600
                        "
                      />

                      <span className="
                        font-semibold
                        text-sm
                      ">
                        Draft
                      </span>

                    </div>

                    <p className="
                      text-xs
                      text-slate-400
                    ">
                      Only admins can manage it.
                    </p>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setStatus(
                        'published'
                      )
                    }
                    className={`
                      p-4
                      rounded-2xl
                      border
                      text-left
                      transition
                      ${
                        status ===
                        'published'
                          ? 'border-green-400 bg-green-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }
                    `}
                  >

                    <div className="
                      flex
                      items-center
                      gap-2
                      mb-1
                    ">

                      <Eye
                        size={17}
                        className="
                          text-green-600
                        "
                      />

                      <span className="
                        font-semibold
                        text-sm
                      ">
                        Published
                      </span>

                    </div>

                    <p className="
                      text-xs
                      text-slate-400
                    ">
                      Visible to selected roles.
                    </p>

                  </button>

                </div>

              </FormSection>


              {/* =============================================
                  FOOTER
              ============================================= */}

              <div className="
                sticky
                bottom-0
                -mx-5
                sm:-mx-7
                px-5
                sm:px-7
                py-4
                bg-white/95
                backdrop-blur
                border-t
                border-slate-100
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={
                    closeForm
                  }
                  disabled={saving}
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    text-slate-600
                    font-medium
                    hover:bg-slate-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    py-2.5
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-blue-500/20
                    hover:from-blue-700
                    hover:to-indigo-700
                    disabled:opacity-50
                  "
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="
                          animate-spin
                        "
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />

                      {editingAnnouncement
                        ? 'Update Announcement'
                        : 'Create Announcement'}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}


// =============================================================
// FORM SECTION
// =============================================================

function FormSection({
  label,
  hint,
  required,
  children,
}) {
  return (
    <div>

      <div className="mb-2">

        <label className="
          block
          text-sm
          font-semibold
          text-slate-800
        ">

          {label}

          {required && (
            <span className="
              text-red-500
              ml-1
            ">
              *
            </span>
          )}

        </label>

        {hint && (
          <p className="
            text-xs
            text-slate-400
            mt-1
          ">
            {hint}
          </p>
        )}

      </div>

      {children}

    </div>
  )
}


// =============================================================
// MEDIA TYPE BUTTON
// =============================================================

function MediaTypeButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        p-4
        rounded-2xl
        border
        text-left
        transition-all
        ${
          active
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }
      `}
    >

      <div className="
        flex
        items-center
        gap-3
      ">

        <div className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          ${
            active
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500'
          }
        `}>

          <Icon size={18} />

        </div>

        <div>

          <p className="
            font-semibold
            text-sm
            text-slate-800
          ">
            {title}
          </p>

          <p className="
            text-xs
            text-slate-400
            mt-0.5
          ">
            {description}
          </p>

        </div>

      </div>

    </button>
  )
}


// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  const colors = {
    blue:
      'bg-blue-50 text-blue-600',
    green:
      'bg-green-50 text-green-600',
    amber:
      'bg-amber-50 text-amber-600',
  }

  return (
    <div className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      p-4
      shadow-sm
      flex
      items-center
      gap-4
    ">

      <div className={`
        w-11
        h-11
        rounded-xl
        flex
        items-center
        justify-center
        ${colors[color]}
      `}>

        <Icon size={20} />

      </div>

      <div>

        <p className="
          text-xs
          font-medium
          text-slate-400
          uppercase
          tracking-wider
        ">
          {label}
        </p>

        <p className="
          text-2xl
          font-bold
          text-slate-900
          mt-0.5
        ">
          {value}
        </p>

      </div>

    </div>
  )
}


// =============================================================
// ANNOUNCEMENT CARD
// =============================================================

function AnnouncementCard({
  announcement,
  audienceConfig,
  onEdit,
  onPublish,
  onDelete,
  formatDate,
}) {
  return (
    <div className="
      group
      bg-white
      border
      border-slate-200
      rounded-2xl
      overflow-hidden
      shadow-sm
      hover:shadow-lg
      hover:border-slate-300
      transition-all
    ">

      <div className="
        flex
        flex-col
        lg:flex-row
      ">

        {/* ===================================================
            MEDIA
        =================================================== */}

        <div className="
          relative
          w-full
          lg:w-72
          xl:w-80
          flex-shrink-0
          bg-slate-950
          min-h-[190px]
          lg:min-h-[220px]
        ">

          {announcement.media_url ? (

            announcement.media_type ===
            'video' ? (

              <video
                src={
                  announcement.media_url
                }
                muted
                playsInline
                controls
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />

            ) : (

              <img
                src={
                  announcement.media_url
                }
                alt={
                  announcement.title
                }
                className="
                  absolute
                  inset-0
                  w-full
                  h-full
                  object-cover
                "
              />

            )

          ) : (

            <div className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              text-slate-500
            ">

              <ImageIcon
                size={30}
              />

              <span className="
                text-xs
                mt-2
              ">
                No media
              </span>

            </div>

          )}


          {/* MEDIA BADGE */}

          {announcement.media_url && (
            <div className="
              absolute
              top-3
              left-3
              px-2.5
              py-1.5
              rounded-lg
              bg-black/60
              backdrop-blur-md
              text-white
              text-xs
              font-medium
              flex
              items-center
              gap-1.5
            ">

              {announcement.media_type ===
              'video' ? (
                <Video size={13} />
              ) : (
                <ImageIcon size={13} />
              )}

              {announcement.media_type ===
              'video'
                ? 'VIDEO'
                : 'IMAGE'}

            </div>
          )}

        </div>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="
          flex-1
          min-w-0
          p-5
          sm:p-6
        ">

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-start
            sm:justify-between
            gap-3
          ">

            <div className="min-w-0">

              <div className="
                flex
                flex-wrap
                items-center
                gap-2
                mb-2
              ">

                <span className={`
                  inline-flex
                  items-center
                  gap-1.5
                  px-2.5
                  py-1
                  rounded-full
                  text-xs
                  font-semibold
                  ${
                    announcement.status ===
                    'published'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }
                `}>

                  {announcement.status ===
                  'published' ? (
                    <Eye size={12} />
                  ) : (
                    <EyeOff size={12} />
                  )}

                  {announcement.status ===
                  'published'
                    ? 'Published'
                    : 'Draft'}

                </span>

              </div>


              <h2 className="
                text-lg
                sm:text-xl
                font-bold
                text-slate-900
                break-words
              ">
                {announcement.title}
              </h2>

            </div>


            <div className="
              flex
              items-center
              gap-2
              flex-shrink-0
            ">

              <button
                onClick={() =>
                  onEdit(
                    announcement
                  )
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-slate-200
                  text-slate-500
                  flex
                  items-center
                  justify-center
                  hover:bg-blue-50
                  hover:text-blue-600
                  hover:border-blue-200
                  transition
                "
                title="Edit"
              >
                <Edit3 size={16} />
              </button>


              <button
                onClick={() =>
                  onDelete(
                    announcement
                  )
                }
                className="
                  w-9
                  h-9
                  rounded-xl
                  border
                  border-red-100
                  text-red-500
                  flex
                  items-center
                  justify-center
                  hover:bg-red-50
                  transition
                "
                title="Delete"
              >
                <Trash2 size={16} />
              </button>

            </div>

          </div>


          {/* DESCRIPTION */}

          <p className="
            text-sm
            text-slate-500
            mt-3
            line-clamp-3
            whitespace-pre-line
          ">
            {announcement.description ||
              'No description provided.'}
          </p>


          {/* AUDIENCE */}

          <div className="
            flex
            flex-wrap
            gap-2
            mt-4
          ">

            <div className="
              flex
              items-center
              gap-1.5
              text-xs
              font-medium
              text-slate-500
              mr-1
            ">
              <Users size={14} />

              Audience
            </div>

            {announcement.audience?.map(
              (role) => {

                const config =
                  audienceConfig[
                    role
                  ]

                if (!config) {
                  return null
                }

                const Icon =
                  config.icon

                return (
                  <span
                    key={role}
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-1.5
                      rounded-lg
                      border
                      text-xs
                      font-medium
                      ${config.color}
                    `}
                  >

                    <Icon
                      size={12}
                    />

                    {config.label}

                  </span>
                )
              }
            )}

          </div>


          {/* SCHEDULE */}

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
            mt-5
            pt-4
            border-t
            border-slate-100
          ">

            <div className="
              flex
              items-start
              gap-2.5
            ">

              <CalendarDays
                size={16}
                className="
                  text-blue-500
                  mt-0.5
                  flex-shrink-0
                "
              />

              <div>

                <p className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-slate-400
                  font-semibold
                ">
                  Starts
                </p>

                <p className="
                  text-xs
                  sm:text-sm
                  text-slate-600
                  mt-0.5
                ">
                  {formatDate(
                    announcement.starts_at
                  )}
                </p>

              </div>

            </div>


            <div className="
              flex
              items-start
              gap-2.5
            ">

              <Clock3
                size={16}
                className="
                  text-indigo-500
                  mt-0.5
                  flex-shrink-0
                "
              />

              <div>

                <p className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  text-slate-400
                  font-semibold
                ">
                  Ends
                </p>

                <p className="
                  text-xs
                  sm:text-sm
                  text-slate-600
                  mt-0.5
                ">
                  {announcement.ends_at
                    ? formatDate(
                        announcement.ends_at
                      )
                    : 'No expiration'}
                </p>

              </div>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="
            flex
            flex-wrap
            gap-2
            mt-5
          ">

            <button
              onClick={() =>
                onPublish(
                  announcement
                )
              }
              className={`
                inline-flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-xl
                text-xs
                sm:text-sm
                font-semibold
                border
                transition
                ${
                  announcement.status ===
                  'published'
                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                    : 'border-green-200 text-green-700 hover:bg-green-50'
                }
              `}
            >

              {announcement.status ===
              'published' ? (
                <>
                  <EyeOff size={15} />

                  Unpublish
                </>
              ) : (
                <>
                  <Eye size={15} />

                  Publish
                </>
              )}

            </button>


            <button
              onClick={() =>
                onEdit(
                  announcement
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-xl
                text-xs
                sm:text-sm
                font-semibold
                border
                border-slate-200
                text-slate-600
                hover:bg-slate-50
                transition
              "
            >

              <Edit3 size={15} />

              Edit

            </button>

          </div>

        </div>

      </div>

    </div>
  )
}
