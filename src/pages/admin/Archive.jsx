import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCheck,
  Download,
  Eye,
  FileText,
  FolderArchive,
  HardHat,
  Inbox,
  Lock,
  MessageCircle,
  Paperclip,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  User,
  Wrench,
  X,
  RotateCcw,
  Car,
  Hash,
  CircleAlert,
  LoaderCircle,
  Send,
  UserRound,
  Clock3,
  Ban,
  MapPin,
  ShieldX,
  MessageSquareWarning,
  CircleX,
  Globe,
  Globe2,
  Store,
  Fuel,
  BatteryCharging,
  Cog,
  Sparkles,
} from 'lucide-react'

/* =========================================================
   CONSTANTS
========================================================= */

const APPOINTMENTS_PER_PAGE = 10

/*
  Tailwind needs full literal class names, so every theme
  is written out in full here.
*/
const THEMES = {
  slate: {
    card: 'to-slate-50 shadow-[0_8px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]',
    active: 'border-slate-900 ring-2 ring-slate-200',
    idle: 'border-slate-200',
    blob: 'bg-slate-100',
    bar: 'from-slate-400 via-slate-700 to-slate-400',
    dot: 'bg-slate-500 shadow-[0_0_0_4px_rgba(100,116,139,0.10)]',
    text: 'text-slate-500',
    icon: 'from-gray-800 to-gray-950 shadow-[0_8px_20px_rgba(15,23,42,0.22)]',
    chipIcon: 'bg-gray-100 text-gray-700',
  },
  emerald: {
    card: 'to-emerald-50/40 shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:shadow-[0_14px_35px_rgba(16,185,129,0.12)]',
    active: 'border-emerald-500 ring-2 ring-emerald-100',
    idle: 'border-emerald-100',
    blob: 'bg-emerald-100',
    bar: 'from-emerald-400 via-green-500 to-emerald-400',
    dot: 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]',
    text: 'text-emerald-600',
    icon: 'from-emerald-400 to-green-600 shadow-[0_8px_20px_rgba(16,185,129,0.22)]',
    chipIcon: 'bg-green-100 text-green-700',
  },
  blue: {
    card: 'to-blue-50/40 shadow-[0_8px_30px_rgba(59,130,246,0.06)] hover:shadow-[0_14px_35px_rgba(59,130,246,0.12)]',
    active: 'border-blue-500 ring-2 ring-blue-100',
    idle: 'border-blue-100',
    blob: 'bg-blue-100',
    bar: 'from-blue-400 via-sky-500 to-blue-400',
    dot: 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.10)]',
    text: 'text-blue-600',
    icon: 'from-blue-500 to-sky-600 shadow-[0_8px_20px_rgba(59,130,246,0.22)]',
    chipIcon: 'bg-blue-100 text-blue-700',
  },
  amber: {
    card: 'to-amber-50/50 shadow-[0_8px_30px_rgba(245,158,11,0.07)] hover:shadow-[0_14px_35px_rgba(245,158,11,0.14)]',
    active: 'border-amber-500 ring-2 ring-amber-100',
    idle: 'border-amber-100',
    blob: 'bg-amber-100',
    bar: 'from-amber-400 via-yellow-500 to-amber-400',
    dot: 'bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.10)]',
    text: 'text-amber-600',
    icon: 'from-amber-400 to-yellow-500 shadow-[0_8px_20px_rgba(245,158,11,0.22)]',
    chipIcon: 'bg-amber-100 text-amber-700',
  },
  orange: {
    card: 'to-orange-50/40 shadow-[0_8px_30px_rgba(249,115,22,0.06)] hover:shadow-[0_14px_35px_rgba(249,115,22,0.12)]',
    active: 'border-orange-500 ring-2 ring-orange-100',
    idle: 'border-orange-100',
    blob: 'bg-orange-100',
    bar: 'from-orange-400 via-amber-500 to-orange-400',
    dot: 'bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.10)]',
    text: 'text-orange-600',
    icon: 'from-orange-400 to-red-500 shadow-[0_8px_20px_rgba(249,115,22,0.22)]',
    chipIcon: 'bg-orange-100 text-orange-700',
  },
  red: {
    card: 'to-rose-50/40 shadow-[0_8px_30px_rgba(220,38,38,0.06)] hover:shadow-[0_14px_35px_rgba(220,38,38,0.12)]',
    active: 'border-red-500 ring-2 ring-red-100',
    idle: 'border-red-100',
    blob: 'bg-red-100',
    bar: 'from-red-400 via-rose-600 to-red-400',
    dot: 'bg-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.10)]',
    text: 'text-red-600',
    icon: 'from-red-500 to-rose-700 shadow-[0_8px_20px_rgba(220,38,38,0.22)]',
    chipIcon: 'bg-red-100 text-red-700',
  },
}

/* =========================================================
   SMALL HELPERS
========================================================= */

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Not available'

  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) return 'Not available'

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

function formatTime(time) {
  if (!time) return 'N/A'

  return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDateOnly(value) {
  if (!value) return 'N/A'

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)

  if (!year || !month || !day) return String(value)

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 'completed' | 'cancelled' | 'rejected' | other
function getState(appointment) {
  if (appointment.status === 'cancelled') {
    return appointment.rejected_at ? 'rejected' : 'cancelled'
  }
  return appointment.status
}

function getEligibilityStyle(value) {
  const v = (value || 'pending').toLowerCase()

  if (['eligible', 'approved', 'accepted', 'supported'].includes(v)) {
    return {
      label: 'Eligible',
      badge: 'border-green-200 bg-green-100 text-green-700',
      dot: 'bg-green-500',
    }
  }

  if (['not_eligible', 'ineligible', 'rejected', 'unsupported'].includes(v)) {
    return {
      label: 'Not Eligible',
      badge: 'border-red-200 bg-red-100 text-red-700',
      dot: 'bg-red-500',
    }
  }

  if (['needs_review', 'review', 'manual_review'].includes(v)) {
    return {
      label: 'Needs Review',
      badge: 'border-amber-200 bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    }
  }

  return {
    label: 'Pending',
    badge: 'border-gray-200 bg-gray-100 text-gray-700',
    dot: 'bg-gray-500',
  }
}

// Works whether confidence is stored as 0-1 or 0-100
function formatConfidence(value) {
  if (value === null || value === undefined || value === '') return null

  const n = Number(value)
  if (Number.isNaN(n)) return null

  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n))
}

/* =========================================================
   SHARED INFO GROUP (same look for every group of fields)
========================================================= */

function InfoGroup({ title, icon: Icon, header, iconBox, items }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${header}`}>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBox}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <p className="text-[11px] font-extrabold uppercase tracking-wider">
          {title}
        </p>
      </div>

      <dl className="divide-y divide-gray-100">
        {items.map(({ label, value, icon: ItemIcon, valueClass }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 px-4 py-2.5"
          >
            <dt className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <ItemIcon className="h-3.5 w-3.5" />
              {label}
            </dt>

            <dd
              className={`min-w-0 break-words text-right text-sm font-semibold text-gray-800 ${
                valueClass || ''
              }`}
            >
              {value || 'N/A'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function formatSource(value) {
  if (value === 'walkin') return 'Walk-in'
  if (value === 'online') return 'Online'
  return value || 'N/A'
}

/* =========================================================
   APPOINTMENT INFO GRID
   Customer | Vehicle | Service | Record
========================================================= */

function AppointmentInfoGrid({
  appointment,
  columns = 'grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4',
}) {
  const state = getState(appointment)

  const appointmentNumber = appointment.id
    ? `APPT-${String(appointment.id).padStart(6, '0')}`
    : 'N/A'

  const recordTone =
    state === 'completed'
      ? {
          header: 'border-green-100 bg-green-50 text-green-700',
          iconBox: 'bg-green-100 text-green-600',
        }
      : state === 'rejected'
      ? {
          header: 'border-red-100 bg-red-50 text-red-700',
          iconBox: 'bg-red-100 text-red-600',
        }
      : state === 'cancelled'
      ? {
          header: 'border-orange-100 bg-orange-50 text-orange-700',
          iconBox: 'bg-orange-100 text-orange-600',
        }
      : {
          header: 'border-gray-100 bg-gray-50 text-gray-700',
          iconBox: 'bg-gray-100 text-gray-600',
        }

  const timestampLabel =
    state === 'rejected'
      ? 'Rejected At'
      : state === 'cancelled'
      ? 'Cancelled At'
      : 'Completed At'

  const timestampValue =
    state === 'rejected'
      ? formatTimestamp(appointment.rejected_at)
      : state === 'cancelled'
      ? formatTimestamp(appointment.cancelled_at)
      : formatTimestamp(appointment.completed_at)

  const statusLabel =
    state === 'rejected'
      ? 'Rejected'
      : state === 'cancelled'
      ? 'Cancelled'
      : appointment.status
      ? appointment.status.replace('_', ' ')
      : 'N/A'

  return (
    <div className={`grid ${columns}`}>
      <InfoGroup
        title="Customer"
        icon={User}
        header="border-gray-100 bg-gray-50 text-gray-700"
        iconBox="bg-gray-200 text-gray-600"
        items={[
          { label: 'Name', value: appointment.customer_name, icon: User },
          {
            label: 'Phone',
            value:
              appointment.mobile_number ||
              appointment.phone ||
              'No phone number',
            icon: Phone,
            valueClass: 'break-all',
          },
          {
            label: 'Address',
            value: appointment.customer_address || 'No address provided',
            icon: MapPin,
          },
        ]}
      />

      <InfoGroup
        title="Vehicle"
        icon={Car}
        header="border-blue-100 bg-blue-50 text-blue-700"
        iconBox="bg-blue-100 text-blue-600"
        items={[
          { label: 'Vehicle', value: appointment.vehicle_model, icon: Car },
          { label: 'Plate Number', value: appointment.plate_number, icon: Hash },
          { label: 'Vehicle Type', value: appointment.vehicle_type, icon: Car },
          { label: 'Fuel Type', value: appointment.fuel_type, icon: Fuel },
          {
            label: 'Battery Voltage',
            value: appointment.battery_voltage,
            icon: BatteryCharging,
          },
          {
            label: 'Transmission',
            value: appointment.transmission_type,
            icon: Cog,
          },
        ]}
      />

      <InfoGroup
        title="Service"
        icon={Wrench}
        header="border-indigo-100 bg-indigo-50 text-indigo-700"
        iconBox="bg-indigo-100 text-indigo-600"
        items={[
          { label: 'Service', value: appointment.service_type, icon: Wrench },
          {
            label: 'Date Request',
            value: formatDateOnly(appointment.appointment_date),
            icon: CalendarDays,
          },
          {
            label: 'Time Request',
            value: formatTime(appointment.appointment_time),
            icon: Clock3,
          },
          {
            label: 'Booking Source',
            value: formatSource(appointment.booking_source),
            icon: Globe2,
          },
          {
            label: 'Assisted By',
            value: appointment.assisted_user?.name,
            icon: UserRound,
          },
        ]}
      />

      <InfoGroup
        title="Record"
        icon={FileText}
        header={recordTone.header}
        iconBox={recordTone.iconBox}
        items={[
          {
            label: 'Appointment No.',
            value: appointmentNumber,
            icon: Hash,
            valueClass: 'font-bold tracking-wide',
          },
          {
            label: 'Status',
            value: statusLabel,
            icon: Check,
            valueClass: 'capitalize',
          },
          { label: timestampLabel, value: timestampValue, icon: Clock3 },
          {
            label: 'Archived At',
            value: formatTimestamp(appointment.archived_at),
            icon: FolderArchive,
          },
        ]}
      />
    </div>
  )
}

/* =========================================================
   CANCELLATION / REJECTION REASON
========================================================= */

function StatusReasonPanel({ appointment, className = 'mt-4' }) {
  if (appointment?.status !== 'cancelled') return null

  const rejected = Boolean(appointment.rejected_at)
  const ReasonIcon = rejected ? ShieldX : Ban

  const tone = rejected
    ? {
        box: 'border-red-200 bg-red-50/60',
        icon: 'bg-red-100 text-red-600',
        label: 'text-red-600',
      }
    : {
        box: 'border-orange-200 bg-orange-50/60',
        icon: 'bg-orange-100 text-orange-600',
        label: 'text-orange-600',
      }

  return (
    <div className={`${className} rounded-xl border p-4 ${tone.box}`}>
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
        >
          <ReasonIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider ${tone.label}`}
          >
            <MessageSquareWarning className="h-3.5 w-3.5" />
            {rejected ? 'Rejection Reason' : 'Cancellation Reason'}
          </p>

          <p className="mt-1.5 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-700">
            {rejected
              ? appointment.rejection_reason || 'No rejection reason provided.'
              : appointment.cancellation_reason ||
                'No cancellation reason provided.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   AI VEHICLE DETECTION PANEL
========================================================= */

function AiDetectionPanel({
  appointment,
  bg = 'bg-gray-50/70',
  border = 'border-gray-100',
}) {
  if (!appointment) return null

  const eligibility = getEligibilityStyle(appointment.vehicle_eligibility)
  const confidence = formatConfidence(appointment.vehicle_detection_confidence)

  return (
    <div className={`rounded-xl border ${border} ${bg} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI Vehicle Detection
        </p>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${eligibility.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${eligibility.dot}`} />
          {eligibility.label}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Detection Confidence
          </p>
          <p className="text-xs font-bold text-gray-700">
            {confidence !== null ? `${confidence.toFixed(0)}%` : 'N/A'}
          </p>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${
              confidence === null
                ? 'bg-gray-300'
                : confidence >= 80
                ? 'bg-green-500'
                : confidence >= 50
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${confidence ?? 0}%` }}
          />
        </div>

        <p className="mt-3 break-words text-sm leading-6 text-gray-600">
          {appointment.vehicle_detection_message ||
            'No AI detection message available.'}
        </p>

        <p className="mt-2 text-[11px] text-gray-400">
          Detected: {formatTimestamp(appointment.vehicle_detected_at)}
        </p>
      </div>
    </div>
  )
}

/* =========================================================
   ARCHIVE PAGE
========================================================= */

export default function Archive() {

  const AUTO_DELETE_MONTHS = 2

function getAutoDeleteInfo(appointment) {
  if (!appointment?.archived_at) return null

  const deleteAt = new Date(appointment.archived_at)
  deleteAt.setMonth(deleteAt.getMonth() + AUTO_DELETE_MONTHS)

  const daysLeft = Math.ceil((deleteAt - new Date()) / (1000 * 60 * 60 * 24))

  return { deleteAt, daysLeft: Math.max(0, daysLeft) }
}
  const navigate = useNavigate()
  const location = useLocation()

  const appointmentsRef = useRef([])
const activeConversationRef = useRef(null)
const currentUserRef = useRef(null)
const processedAdminMessageIdsRef = useRef(new Set())

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedAppointment, setSelectedAppointment] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [attachments, setAttachments] = useState({})
  const [selectedAttachmentAppointment, setSelectedAttachmentAppointment] =
    useState(null)

  const [viewedAttachments, setViewedAttachments] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('viewedArchivedAttachments') || '{}'
      )
    } catch {
      return {}
    }
  })

  /* ---------- messaging state ---------- */

  /* ---------- messaging state ---------- */

const [currentUser, setCurrentUser] = useState(null)
const [selectedConversationAppointment, setSelectedConversationAppointment] =
  useState(null)
const [conversation, setConversation] = useState(null)
const [conversationMessages, setConversationMessages] = useState([])
const [messageReads, setMessageReads] = useState({})
const [messageText, setMessageText] = useState('')
const [loadingConversation, setLoadingConversation] = useState(false)
const [sendingMessage, setSendingMessage] = useState(false)
const [conversationError, setConversationError] = useState('')
const [unreadCounts, setUnreadCounts] = useState({})

/* ---------- messaging refs ---------- */

const messagesContainerRef = useRef(null)
const previousMessageCountRef = useRef(0)
const previousConversationIdRef = useRef(null)

const firstUnreadMessageIdRef = useRef(null)
const shouldScrollToFirstUnreadRef = useRef(false)
const shouldScrollToBottomRef = useRef(false)

  /* ---------- stats carousel / highlight ---------- */

  const [activeArchiveCard, setActiveArchiveCard] = useState(0)
  const archiveStatsScrollRef = useRef(null)
  const archiveScrollRafRef = useRef(null)
  const [highlightedAppointmentId, setHighlightedAppointmentId] =
    useState(null)

  const targetAppointmentId = location.state?.appointmentId

  /* =========================================================
     CURRENT USER
  ========================================================= */

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('Get current user error:', error)
        return
      }

      setCurrentUser(user || null)
    }

    loadCurrentUser()
  }, [])

  useEffect(() => {
  appointmentsRef.current = appointments
}, [appointments])

useEffect(() => {
  currentUserRef.current = currentUser
}, [currentUser])

useEffect(() => {
  activeConversationRef.current = {
    conversationId: conversation?.id || null,
    appointmentId: selectedConversationAppointment?.id || null,
  }
}, [conversation?.id, selectedConversationAppointment?.id])
  /* =========================================================
     FETCH ARCHIVED APPOINTMENTS
  ========================================================= */

  const fetchArchivedAppointments = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        technician:users!technician_id (
          id,
          name
        ),
        assisted_user:users!assisted_by (
          id,
          name
        )
      `
      )
      .eq('archived', true)
      .order('archived_at', { ascending: false })

    if (error) {
      console.error('Error fetching archived appointments:', error)
      setLoading(false)
      return
    }

    setAppointments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchArchivedAppointments()
  }, [location.state?.appointmentId])

  /* =========================================================
     ATTACHMENTS
  ========================================================= */

  const fetchAttachments = async (appointmentId) => {
    if (!appointmentId) return

    const { data, error } = await supabase
      .from('service_task_attachments')
      .select(
        `
        id,
        appointment_id,
        file_name,
        file_path,
        file_type,
        file_size,
        uploaded_by,
        uploaded_by_name,
        uploaded_by_role,
        created_at
      `
      )
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch archived attachments error:', error)
      return
    }

    setAttachments((current) => ({
      ...current,
      [appointmentId]: data || [],
    }))
  }

  useEffect(() => {
    if (!appointments.length) return

    const loadAttachments = async () => {
      for (const appointment of appointments) {
        await fetchAttachments(appointment.id)
      }
    }

    loadAttachments()
  }, [appointments])

  const viewAttachment = async (attachment) => {
    const { data, error } = await supabase.storage
      .from('service-task-attachments')
      .createSignedUrl(attachment.file_path, 60)

    if (error) {
      console.error('Attachment view error:', error)
      alert(`Unable to open attachment: ${error.message}`)
      return
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  async function downloadAttachment(attachment) {
    try {
      if (!attachment?.file_path) {
        alert('Attachment file path is missing.')
        return
      }

      const { data, error } = await supabase.storage
        .from('service-task-attachments')
        .download(attachment.file_path)

      if (error) {
        console.error('Download attachment error:', error)
        alert(`Failed to download file: ${error.message}`)
        return
      }

      if (!data) {
        alert('File could not be downloaded.')
        return
      }

      const url = URL.createObjectURL(data)

      const link = document.createElement('a')
      link.href = url
      link.download =
        attachment.file_name ||
        attachment.file_path.split('/').pop() ||
        'attachment'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('Download started.')
    } catch (error) {
      console.error('Unexpected download error:', error)
      alert('Failed to download attachment.')
    }
  }

  const deleteAttachment = async (attachment) => {
    const confirmed = window.confirm(
      `Delete "${attachment.file_name}" permanently?`
    )

    if (!confirmed) return

    const { error: storageError } = await supabase.storage
      .from('service-task-attachments')
      .remove([attachment.file_path])

    if (storageError) {
      console.error('Attachment storage delete error:', storageError)
      alert(`Failed to delete file: ${storageError.message}`)
      return
    }

    const { error: databaseError } = await supabase
      .from('service_task_attachments')
      .delete()
      .eq('id', attachment.id)

    if (databaseError) {
      console.error('Attachment database delete error:', databaseError)
      alert(
        `File removed from storage, but database record could not be deleted: ${databaseError.message}`
      )
      return
    }

    setAttachments((current) => ({
      ...current,
      [attachment.appointment_id]: (
        current[attachment.appointment_id] || []
      ).filter((item) => item.id !== attachment.id),
    }))
  }

  /* =========================================================
     WARRANTY HELPERS
  ========================================================= */

  const getWarrantyEnd = (appointment) => {
    if (appointment?.status !== 'completed' || !appointment?.completed_at) {
      return null
    }

    return new Date(
      new Date(appointment.completed_at).getTime() + 3 * 24 * 60 * 60 * 1000
    )
  }

  const isWarrantyExpired = (appointment) => {
    const warrantyEnd = getWarrantyEnd(appointment)
    if (!warrantyEnd) return false
    return new Date() > warrantyEnd
  }

  const canDisplayMessageComposer = (appointment) => {
    if (!appointment) return false

    if (
      appointment.status === 'confirmed' ||
      appointment.status === 'in_progress'
    ) {
      return true
    }

    if (appointment.status === 'completed' && appointment.completed_at) {
      return !isWarrantyExpired(appointment)
    }

    return false
  }

  /* =========================================================
     CONVERSATION HELPERS
  ========================================================= */

  const findConversationForAppointment = async (appointmentId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select(
        `
        id,
        created_at,
        updated_at,
        appointment_id,
        admin_last_read_at,
        customer_last_read_at,
        warranty_ends_at
      `
      )
      .eq('appointment_id', appointmentId)
      .maybeSingle()

    if (error) {
      console.error('Find appointment conversation error:', error)
      throw error
    }

    return data || null
  }

  const ensureConversationParticipant = async (conversationId, userId) => {
    if (!conversationId || !userId) return

    const { data: existing, error: existingError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .maybeSingle()

    if (existingError) {
      console.error('Check conversation participant error:', existingError)
      return
    }

    if (existing) return

    const { error } = await supabase.from('conversation_participants').insert({
      conversation_id: conversationId,
      user_id: userId,
    })

    if (error) {
      console.warn('Admin participant could not be added:', error.message)
    }
  }

  const calculateUnreadCount = (messages, reads, userId) => {
    if (!messages?.length || !userId) return 0

    return messages.filter(
      (message) =>
        message.sender_id !== userId &&
        !message.deleted_at &&
        !reads[message.id]
    ).length
  }

  const fetchUnreadCountForAppointment = async (appointment) => {
    if (!currentUser?.id || !appointment?.id) return

    try {
      const existingConversation = await findConversationForAppointment(
        appointment.id
      )

      if (!existingConversation) {
        setUnreadCounts((current) => ({ ...current, [appointment.id]: 0 }))
        return
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('id, sender_id, created_at, deleted_at')
        .eq('conversation_id', existingConversation.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Unread message fetch:', error.message)
        return
      }

      const messageIds = (messages || []).map((message) => message.id)
      const reads = {}

      if (messageIds.length) {
        const { data: readRows, error: readError } = await supabase
          .from('message_reads')
          .select('message_id, user_id, read_at')
          .eq('user_id', currentUser.id)
          .in('message_id', messageIds)

        if (readError) {
          console.warn('Unread read-state fetch:', readError.message)
        } else {
          ;(readRows || []).forEach((row) => {
            reads[row.message_id] = row
          })
        }
      }

      const count = calculateUnreadCount(messages || [], reads, currentUser.id)

      setUnreadCounts((current) => ({ ...current, [appointment.id]: count }))
    } catch (error) {
      console.error('Fetch unread count error:', error)
    }
  }

  /* Load all unread counts */
  useEffect(() => {
    if (!currentUser?.id || !appointments.length) return

    let cancelled = false

    const loadUnreadCounts = async () => {
      for (const appointment of appointments) {
        if (cancelled) return
        await fetchUnreadCountForAppointment(appointment)
      }
    }

    loadUnreadCounts()

    return () => {
      cancelled = true
    }
  }, [currentUser?.id, appointments])

 
  /* =========================================================
     OPEN CONVERSATION
  ========================================================= */

  const openConversation = async (appointment) => {
  if (!appointment) return

  /* ---------------------------------------------------------
     RESET MESSAGE VIEW STATE
  --------------------------------------------------------- */

  firstUnreadMessageIdRef.current = null
  shouldScrollToFirstUnreadRef.current = false
  shouldScrollToBottomRef.current = false

  previousMessageCountRef.current = 0
  previousConversationIdRef.current = null

  setSelectedConversationAppointment(appointment)
  setConversation(null)
  setConversationMessages([])
  setMessageReads({})
  setMessageText('')
  setConversationError('')
  setLoadingConversation(true)

  try {
    /* -------------------------------------------------------
       FIND CONVERSATION
    ------------------------------------------------------- */

    const existingConversation = await findConversationForAppointment(
      appointment.id
    )

    if (!existingConversation) {
      setConversationError('No conversation exists for this appointment.')
      setLoadingConversation(false)
      return
    }

    setConversation(existingConversation)

    /* -------------------------------------------------------
       ENSURE ADMIN IS A PARTICIPANT
    ------------------------------------------------------- */

    if (currentUser?.id) {
      await ensureConversationParticipant(
        existingConversation.id,
        currentUser.id
      )
    }

    /* -------------------------------------------------------
       LOAD MESSAGES
    ------------------------------------------------------- */

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(
        `
        id,
        conversation_id,
        sender_id,
        message,
        created_at,
        updated_at,
        deleted_at,
        deleted_by,
        reply_to_message_id
      `
      )
      .eq('conversation_id', existingConversation.id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Load conversation messages error:', messagesError)
      setConversationError(messagesError.message)
      setLoadingConversation(false)
      return
    }

    const loadedMessages = messages || []

    /* -------------------------------------------------------
       LOAD CURRENT ADMIN READ STATES
    ------------------------------------------------------- */

    const messageIds = loadedMessages.map((message) => message.id)
    const reads = {}

    if (currentUser?.id && messageIds.length) {
      const { data: readRows, error: readError } = await supabase
        .from('message_reads')
        .select('id, message_id, user_id, read_at')
        .eq('user_id', currentUser.id)
        .in('message_id', messageIds)

      if (readError) {
        console.error('Load message read states error:', readError)
      } else {
        ;(readRows || []).forEach((row) => {
          reads[row.message_id] = row
        })
      }
    }

    setMessageReads(reads)

    /* -------------------------------------------------------
       FIND FIRST UNREAD MESSAGE BEFORE MARKING AS READ
    ------------------------------------------------------- */

    if (currentUser?.id && loadedMessages.length) {
      const unreadMessages = loadedMessages.filter(
        (message) =>
          message.sender_id !== currentUser.id &&
          !message.deleted_at &&
          !reads[message.id]
      )

      if (unreadMessages.length) {
        /* -----------------------------------------------
           REMEMBER FIRST UNREAD MESSAGE
        ----------------------------------------------- */

        firstUnreadMessageIdRef.current = unreadMessages[0].id
        shouldScrollToFirstUnreadRef.current = true
        shouldScrollToBottomRef.current = false

        /* -----------------------------------------------
           MARK ALL CURRENTLY UNREAD MESSAGES AS READ
        ----------------------------------------------- */

        const now = new Date().toISOString()

        const rows = unreadMessages.map((message) => ({
          message_id: message.id,
          user_id: currentUser.id,
          read_at: now,
        }))

        const { error: markError } = await supabase
          .from('message_reads')
          .upsert(rows, {
            onConflict: 'message_id,user_id',
            ignoreDuplicates: true,
          })

        if (markError) {
          console.error('Mark conversation read error:', markError)

          /*
             Keep the first unread target even if the read
             operation fails.
          */
        } else {
          const updatedReads = { ...reads }

          unreadMessages.forEach((message) => {
            updatedReads[message.id] = {
              message_id: message.id,
              user_id: currentUser.id,
              read_at: now,
            }
          })

          setMessageReads(updatedReads)

          /* ---------------------------------------------
             UPDATE PARTICIPANT LAST READ
          --------------------------------------------- */

          await supabase
            .from('conversation_participants')
            .update({
              last_read_at: now,
            })
            .eq('conversation_id', existingConversation.id)
            .eq('user_id', currentUser.id)

          /* ---------------------------------------------
             CLEAR APPOINTMENT UNREAD BADGE
          --------------------------------------------- */

          setUnreadCounts((current) => ({
            ...current,
            [appointment.id]: 0,
          }))
        }
      } else {
        /* -----------------------------------------------
           NO UNREAD MESSAGES
           Open at the latest message.
        ----------------------------------------------- */

        shouldScrollToBottomRef.current = true

        setUnreadCounts((current) => ({
          ...current,
          [appointment.id]: 0,
        }))
      }
    } else {
      shouldScrollToBottomRef.current = true
    }

    /* -------------------------------------------------------
       NOW LOAD MESSAGES INTO STATE
    ------------------------------------------------------- */

    setConversationMessages(loadedMessages)
  } catch (error) {
    console.error('Open conversation error:', error)

    setConversationError(
      error.message || 'Unable to open conversation.'
    )
  } finally {
    setLoadingConversation(false)
  }
}

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = async () => {
  const text = messageText.trim()

  if (!text) return

  if (!conversation?.id) {
    alert('Conversation is not available.')
    return
  }

  if (!currentUser?.id) {
    alert('Your session could not be identified.')
    return
  }

  if (!selectedConversationAppointment) return

  if (!canDisplayMessageComposer(selectedConversationAppointment)) return

  setSendingMessage(true)

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        message: text,
      })
      .select(
        `
        id,
        conversation_id,
        sender_id,
        message,
        created_at,
        updated_at,
        deleted_at,
        deleted_by,
        reply_to_message_id
      `
      )
      .single()

    if (error) {
      console.error('Send message error:', error)
      alert(`Unable to send message: ${error.message}`)
      return
    }

    if (data) {
      setConversationMessages((current) =>
        current.some((message) => message.id === data.id)
          ? current
          : [...current, data]
      )

      /* ---------------------------------------------
         AFTER SENDING, SCROLL TO THE NEW MESSAGE
      --------------------------------------------- */

      shouldScrollToBottomRef.current = true
    }

    setMessageText('')

    await supabase
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)
  } finally {
    setSendingMessage(false)
  }
}

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const closeConversation = () => {
  firstUnreadMessageIdRef.current = null
  shouldScrollToFirstUnreadRef.current = false
  shouldScrollToBottomRef.current = false

  previousMessageCountRef.current = 0
  previousConversationIdRef.current = null

  setSelectedConversationAppointment(null)
  setConversation(null)
  setConversationMessages([])
  setMessageText('')
  setConversationError('')
  setMessageReads({})
}


  /* =========================================================
   REALTIME ADMIN ARCHIVE MESSAGE NOTIFICATIONS
========================================================= */
/* =========================================================
   REALTIME ADMIN ARCHIVE MESSAGE NOTIFICATIONS
========================================================= */

useEffect(() => {
  if (!currentUser?.id) return

  let mounted = true

  console.log(
    '💬 Starting ADMIN ARCHIVE MESSAGE REALTIME:',
    currentUser.id
  )

  const channel = supabase
    .channel(`admin-archive-messages-${currentUser.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async (payload) => {
        if (!mounted) return

        const newMessage = payload?.new

        if (!newMessage?.id || !newMessage?.conversation_id) {
          return
        }

        /* -------------------------------------------------
           PREVENT DUPLICATE PROCESSING
        ------------------------------------------------- */

        if (
          processedAdminMessageIdsRef.current.has(
            newMessage.id
          )
        ) {
          return
        }

        processedAdminMessageIdsRef.current.add(
          newMessage.id
        )

        const user = currentUserRef.current

        if (!user?.id) return

        /* -------------------------------------------------
           IGNORE CURRENT ADMIN'S OWN MESSAGE
        ------------------------------------------------- */

        if (
          String(newMessage.sender_id) ===
          String(user.id)
        ) {
          return
        }

        console.log(
          '💬 ADMIN ARCHIVE REALTIME NEW MESSAGE:',
          newMessage
        )

        /* -------------------------------------------------
           FIND APPOINTMENT
        ------------------------------------------------- */

        let appointment = null

        const activeConversation =
          activeConversationRef.current

        /* -----------------------------------------------
           FIRST: CHECK CURRENTLY OPEN CONVERSATION
        ----------------------------------------------- */

        if (
          String(
            activeConversation?.conversationId
          ) ===
          String(
            newMessage.conversation_id
          )
        ) {
          appointment =
            appointmentsRef.current.find(
              (item) =>
                String(item.id) ===
                String(
                  activeConversation.appointmentId
                )
            ) || null
        }

        /* -----------------------------------------------
           SECOND: LOOK UP CONVERSATION
        ----------------------------------------------- */

        if (!appointment) {
          const {
            data: conversationData,
            error: conversationError,
          } = await supabase
            .from('conversations')
            .select(`
              id,
              appointment_id
            `)
            .eq(
              'id',
              newMessage.conversation_id
            )
            .maybeSingle()

          if (conversationError) {
            console.error(
              'Admin archive realtime conversation lookup error:',
              conversationError
            )

            return
          }

          if (!conversationData?.appointment_id) {
            return
          }

          appointment =
            appointmentsRef.current.find(
              (item) =>
                String(item.id) ===
                String(
                  conversationData.appointment_id
                )
            ) || null
        }

        /* -------------------------------------------------
           NOT AN ARCHIVED APPOINTMENT
        ------------------------------------------------- */

        if (!appointment) {
          console.log(
            'ℹ️ Realtime message does not belong to a visible archived appointment.'
          )

          return
        }

        /* -------------------------------------------------
           CHECK IF CONVERSATION IS CURRENTLY OPEN
        ------------------------------------------------- */

        const isOpen =
          String(
            activeConversationRef.current?.conversationId
          ) ===
          String(
            newMessage.conversation_id
          )

        /* =================================================
           CONVERSATION IS OPEN
        ================================================= */

        if (isOpen) {
          console.log(
            '💬 Archive conversation is open. Adding and reading incoming message.'
          )

          /* ---------------------------------------------
             ADD MESSAGE TO OPEN CONVERSATION
          --------------------------------------------- */

          setConversationMessages((current) =>
            current.some(
              (message) =>
                message.id === newMessage.id
            )
              ? current
              : [...current, newMessage]
          )

          /* ---------------------------------------------
             MARK MESSAGE AS READ
          --------------------------------------------- */

          const readAt =
            new Date().toISOString()

          const {
            error: readError,
          } = await supabase
            .from('message_reads')
            .upsert(
              {
                message_id:
                  newMessage.id,
                user_id:
                  user.id,
                read_at:
                  readAt,
              },
              {
                onConflict:
                  'message_id,user_id',
                ignoreDuplicates:
                  true,
              }
            )

          if (readError) {
            console.error(
              'Admin archive realtime read error:',
              readError
            )

            return
          }

          /* ---------------------------------------------
             UPDATE LOCAL READ STATE
          --------------------------------------------- */

          setMessageReads((current) => ({
            ...current,
            [newMessage.id]: {
              message_id:
                newMessage.id,
              user_id:
                user.id,
              read_at:
                readAt,
            },
          }))

          /* ---------------------------------------------
             UPDATE PARTICIPANT LAST READ
          --------------------------------------------- */

          await supabase
            .from('conversation_participants')
            .update({
              last_read_at:
                readAt,
            })
            .eq(
              'conversation_id',
              newMessage.conversation_id
            )
            .eq(
              'user_id',
              user.id
            )

          /* ---------------------------------------------
             CLEAR UNREAD BADGE
          --------------------------------------------- */

          setUnreadCounts((current) => ({
            ...current,
            [appointment.id]: 0,
          }))

          /* ---------------------------------------------
             SCROLL TO NEW MESSAGE
          --------------------------------------------- */

          shouldScrollToBottomRef.current = true

          return
        }

        /* =================================================
           CONVERSATION IS CLOSED
        ================================================= */

        setUnreadCounts((current) => {
          const previousCount =
            Number(
              current[appointment.id] || 0
            )

          const nextCount =
            previousCount + 1

          console.log(
            '🔔 ADMIN ARCHIVE UNREAD COUNT UPDATED:',
            {
              appointmentId:
                appointment.id,
              previous:
                previousCount,
              next:
                nextCount,
            }
          )

          return {
            ...current,
            [appointment.id]:
              nextCount,
          }
        })
      }
    )
    .subscribe((status) => {
      console.log(
        '📡 ADMIN ARCHIVE MESSAGE REALTIME STATUS:',
        status
      )

      if (status === 'SUBSCRIBED') {
        console.log(
          '✅ ADMIN ARCHIVE MESSAGE REALTIME CONNECTED'
        )
      }

      if (status === 'CHANNEL_ERROR') {
        console.error(
          '❌ ADMIN ARCHIVE MESSAGE REALTIME CHANNEL ERROR'
        )
      }

      if (status === 'TIMED_OUT') {
        console.error(
          '❌ ADMIN ARCHIVE MESSAGE REALTIME TIMED OUT'
        )
      }
    })

  return () => {
    mounted = false

    console.log(
      '🧹 Removing ADMIN ARCHIVE MESSAGE REALTIME channel'
    )

    supabase.removeChannel(channel)
  }
}, [currentUser?.id])

/* =========================================================
   MESSAGE AUTO-SCROLL
========================================================= */

useEffect(() => {
  const conversationId = conversation?.id || null
  const messageCount = conversationMessages.length

  if (!conversationId) {
    previousMessageCountRef.current = 0
    previousConversationIdRef.current = null
    return
  }

  if (messageCount === 0) return

  const container = messagesContainerRef.current

  if (!container) return

  const conversationChanged =
    previousConversationIdRef.current !== conversationId

  const hasNewMessage =
    messageCount > previousMessageCountRef.current

  /* =======================================================
     OPENING A CONVERSATION
  ======================================================= */

  if (conversationChanged) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollContainer =
          messagesContainerRef.current

        if (!scrollContainer) return

        /* -----------------------------------------------
           FIRST PRIORITY:
           JUMP TO FIRST UNREAD MESSAGE
        ----------------------------------------------- */

        if (
          shouldScrollToFirstUnreadRef.current &&
          firstUnreadMessageIdRef.current
        ) {
          const unreadElement =
            document.getElementById(
              `archive-message-${firstUnreadMessageIdRef.current}`
            )

          if (unreadElement) {
            unreadElement.scrollIntoView({
              behavior: 'auto',
              block: 'center',
            })

            shouldScrollToFirstUnreadRef.current =
              false

            firstUnreadMessageIdRef.current =
              null

            shouldScrollToBottomRef.current =
              false

            return
          }
        }

        /* -----------------------------------------------
           NO UNREAD MESSAGE:
           OPEN AT THE LATEST MESSAGE
        ----------------------------------------------- */

        if (shouldScrollToBottomRef.current) {
          scrollContainer.scrollTop =
            scrollContainer.scrollHeight

          shouldScrollToBottomRef.current =
            false
        }
      })
    })
  }

  /* =======================================================
     NEW MESSAGE IN CURRENT CONVERSATION
  ======================================================= */

  else if (hasNewMessage) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const scrollContainer =
          messagesContainerRef.current

        if (!scrollContainer) return

        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        })

        shouldScrollToBottomRef.current =
          false
      })
    })
  }

  previousConversationIdRef.current =
    conversationId

  previousMessageCountRef.current =
    messageCount
}, [
  conversation?.id,
  conversationMessages.length,
])

  /* =========================================================
     COUNTERS
  ========================================================= */

  const countBy = (state, source) =>
    appointments.filter(
      (appointment) =>
        (!state || getState(appointment) === state) &&
        (!source || appointment.booking_source === source)
    ).length

  const STATS = [
    {
      key: 'all',
      label: 'Total Archived',
      description: 'All archived appointments',
      count: appointments.length,
      theme: 'slate',
      icon: FolderArchive,
    },
    {
      key: 'completed',
      label: 'Completed',
      description: 'Successfully completed services',
      count: countBy('completed'),
      theme: 'emerald',
      icon: Check,
    },
    {
      key: 'online_completed',
      label: 'Online Completed',
      description: 'Completed online bookings',
      count: countBy('completed', 'online'),
      theme: 'blue',
      icon: Globe,
    },
    {
      key: 'walkin_completed',
      label: 'Walk-in Completed',
      description: 'Completed walk-in bookings',
      count: countBy('completed', 'walkin'),
      theme: 'amber',
      icon: Store,
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      description: 'Cancelled appointments',
      count: countBy('cancelled'),
      theme: 'orange',
      icon: Ban,
    },
    {
      key: 'online_cancelled',
      label: 'Online Cancelled',
      description: 'Cancelled online bookings',
      count: countBy('cancelled', 'online'),
      theme: 'orange',
      icon: Globe,
    },
    {
      key: 'walkin_cancelled',
      label: 'Walk-in Cancelled',
      description: 'Cancelled walk-in bookings',
      count: countBy('cancelled', 'walkin'),
      theme: 'orange',
      icon: Store,
    },
    {
      key: 'rejected',
      label: 'Rejected',
      description: 'Rejected appointments',
      count: countBy('rejected'),
      theme: 'red',
      icon: ShieldX,
    },
    {
      key: 'online_rejected',
      label: 'Online Rejected',
      description: 'Rejected online bookings',
      count: countBy('rejected', 'online'),
      theme: 'red',
      icon: Globe,
    },
    {
      key: 'walkin_rejected',
      label: 'Walk-in Rejected',
      description: 'Rejected walk-in bookings',
      count: countBy('rejected', 'walkin'),
      theme: 'red',
      icon: Store,
    },
  ]

  const activeStat = STATS.find((stat) => stat.key === statusFilter) || STATS[0]
  const ActiveStatIcon = activeStat.icon

  /* =========================================================
     FILTERING
  ========================================================= */

  const matchesStatusFilter = (appointment) => {
    if (statusFilter === 'all') return true

    const parts = statusFilter.split('_')
    const source = parts.length === 2 ? parts[0] : null
    const state = parts.length === 2 ? parts[1] : parts[0]

    return (
      getState(appointment) === state &&
      (!source || appointment.booking_source === source)
    )
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const search = searchTerm.toLowerCase().trim()

    const matchesSearch =
      !search ||
      appointment.customer_name?.toLowerCase().includes(search) ||
      appointment.mobile_number?.toLowerCase().includes(search) ||
      appointment.phone?.toLowerCase().includes(search) ||
      appointment.service_type?.toLowerCase().includes(search) ||
      appointment.technician?.name?.toLowerCase().includes(search) ||
      appointment.technician_role?.toLowerCase().includes(search) ||
      appointment.plate_number?.toLowerCase().includes(search) ||
      appointment.fuel_type?.toLowerCase().includes(search) ||
      appointment.transmission_type?.toLowerCase().includes(search) ||
      appointment.battery_voltage?.toLowerCase().includes(search) ||
      appointment.vehicle_type?.toLowerCase().includes(search) ||
      `APPT-${String(appointment.id).padStart(6, '0')}`
        .toLowerCase()
        .includes(search) ||
      String(appointments.length - appointments.indexOf(appointment)).includes(
        search
      )

    const matchesDate =
      !dateFilter || appointment.appointment_date === dateFilter

    return matchesStatusFilter(appointment) && matchesSearch && matchesDate
  })

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    filteredAppointments.length / APPOINTMENTS_PER_PAGE
  )

  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * APPOINTMENTS_PER_PAGE,
    currentPage * APPOINTMENTS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter])

  /* =========================================================
     NOTIFICATION TARGET: GO TO PAGE
  ========================================================= */

  useEffect(() => {
    if (!targetAppointmentId || !appointments.length) return

    const targetId = Number(targetAppointmentId)

    const appointmentIndex = appointments.findIndex(
      (appointment) => Number(appointment.id) === targetId
    )

    if (appointmentIndex === -1) return

    setCurrentPage(Math.floor(appointmentIndex / APPOINTMENTS_PER_PAGE) + 1)
  }, [appointments, targetAppointmentId])

  /* =========================================================
     NOTIFICATION TARGET: SCROLL + HIGHLIGHT
  ========================================================= */

  useEffect(() => {
    if (!targetAppointmentId) return

    const targetId = Number(targetAppointmentId)

    const targetAppointment = paginatedAppointments.find(
      (appointment) => Number(appointment.id) === targetId
    )

    if (!targetAppointment) return

    requestAnimationFrame(() => {
      const element = document.getElementById(`archive-appointment-${targetId}`)

      if (!element) return

      setHighlightedAppointmentId(targetId)

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      navigate(location.pathname, { replace: true, state: {} })

      setTimeout(() => {
        setHighlightedAppointmentId(null)
      }, 3000)
    })
  }, [currentPage, paginatedAppointments, targetAppointmentId])

  /* =========================================================
     RESTORE / DELETE
  ========================================================= */

  const restoreAppointment = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to restore this appointment?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('appointments')
      .update({ archived: false })
      .eq('id', id)

    if (error) {
      console.error('Restore appointment error:', error)
      alert('Failed to restore appointment.')
      return
    }

    setAppointments((current) =>
      current.filter((appointment) => appointment.id !== id)
    )

    alert('Appointment restored successfully.')
  }

 const deleteAppointment = async (id) => {
  const confirmed = window.confirm(
    'Are you sure you want to permanently delete this archived appointment?'
  )
  if (!confirmed) return

  // 1. Get the file paths before anything is removed
  const { data: files, error: filesError } = await supabase
    .from('service_task_attachments')
    .select('id, file_path')
    .eq('appointment_id', id)

  if (filesError) {
    console.error('Fetch attachments before delete error:', filesError)
    alert('Failed to delete appointment.')
    return
  }

  // 2. Remove the actual files from storage
  const paths = (files || []).map((f) => f.file_path).filter(Boolean)

  if (paths.length) {
    const { error: storageError } = await supabase.storage
      .from('service-task-attachments')
      .remove(paths)

    if (storageError) {
      console.error('Storage delete error:', storageError)
      alert(`Failed to delete attachment files: ${storageError.message}`)
      return
    }
  }

  // 3. Remove attachment rows (harmless if cascade already handles it)
  await supabase
    .from('service_task_attachments')
    .delete()
    .eq('appointment_id', id)

  // 4. Delete the appointment
  const { error } = await supabase.from('appointments').delete().eq('id', id)

  if (error) {
    console.error('Delete appointment error:', error)
    alert('Failed to delete appointment.')
    return
  }

  setAppointments((current) => current.filter((a) => a.id !== id))
  setAttachments((current) => {
    const next = { ...current }
    delete next[id]
    return next
  })
}

  /* =========================================================
     MESSAGE BANNER DATA
  ========================================================= */

  const activeConversationWarrantyEnd = useMemo(
    () => getWarrantyEnd(selectedConversationAppointment),
    [selectedConversationAppointment]
  )

  const activeConversationWarrantyExpired = selectedConversationAppointment
    ? isWarrantyExpired(selectedConversationAppointment)
    : false

  const activeConversationCanSend = selectedConversationAppointment
    ? canDisplayMessageComposer(selectedConversationAppointment)
    : false

  /* =========================================================
     STATS CAROUSEL SCROLL HANDLER (mobile dots)
  ========================================================= */

  const handleArchiveStatsScroll = (e) => {
    const container = e.currentTarget

    if (archiveScrollRafRef.current) return

    archiveScrollRafRef.current = requestAnimationFrame(() => {
      const cards = Array.from(container.children)

      if (!cards.length) {
        archiveScrollRafRef.current = null
        return
      }

      const containerCenter = container.scrollLeft + container.clientWidth / 2

      let closestIndex = 0
      let closestDistance = Infinity

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(cardCenter - containerCenter)

        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveArchiveCard(Math.max(0, Math.min(STATS.length - 1, closestIndex)))
      archiveScrollRafRef.current = null
    })
  }

  useEffect(() => {
  const isModalOpen =
    !!selectedAppointment ||
    !!selectedAttachmentAppointment ||
    !!selectedConversationAppointment

  if (!isModalOpen) return

  const prevBody = document.body.style.overflow
  const prevHtml = document.documentElement.style.overflow

  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = prevBody
    document.documentElement.style.overflow = prevHtml
  }
}, [
  selectedAppointment,
  selectedAttachmentAppointment,
  selectedConversationAppointment,
])

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-3 px-3 sm:min-h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="hidden h-10 w-1 rounded-full bg-gray-800 sm:block" />

            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] ring-1 ring-gray-900/10 transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_28px_rgba(15,23,42,0.32)] active:scale-95 sm:h-11 sm:w-11">
              <FolderArchive className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-900 sm:text-xl">
                Archived Appointments
              </h1>

              <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
                View previous and archived customer appointments
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md sm:px-5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-7 flex flex-col gap-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 shadow-sm">
                Archive
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

              <span className="text-xs font-medium text-gray-400">
                Completed & Cancelled History
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Appointment Archive
            </h2>

            

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Review completed and cancelled appointments, customer
              information, assigned technicians, vehicle details, and service
              details.
            </p>

            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
  <Clock3 className="h-3.5 w-3.5" />
  Archived appointments are permanently deleted 2 months after archiving.
</p>
          </div>

          {/* =================================================
              ARCHIVE STATISTICS (mobile + desktop)
          ================================================= */}

          <div className="mb-2 sm:mb-4">
            <div
              ref={archiveStatsScrollRef}
              onScroll={handleArchiveStatsScroll}
              onWheel={(e) => {
                const container = e.currentTarget

                // Vertical mouse wheel -> horizontal scroll
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                  e.preventDefault()
                  container.scrollBy({ left: e.deltaY, behavior: 'auto' })
                }
              }}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-1 pb-4 pt-1 scrollbar-none touch-pan-x"
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollBehavior: 'smooth',
              }}
            >
              {STATS.map((stat) => {
                const theme = THEMES[stat.theme]
                const Icon = stat.icon
                const isActive = statusFilter === stat.key

                return (
                  <button
                    key={stat.key}
                    type="button"
                    onClick={() => setStatusFilter(stat.key)}
                    className={`group relative w-[86vw] min-w-[86vw] shrink-0 snap-center overflow-hidden rounded-[22px] border bg-gradient-to-br from-white via-white p-4 text-left ring-1 ring-black/[0.02] transition-all duration-200 hover:-translate-y-1 active:scale-[0.99] sm:w-[280px] sm:min-w-[280px] sm:snap-start sm:p-5 ${
                      theme.card
                    } ${isActive ? theme.active : theme.idle}`}
                  >
                    <div
                      className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-70 blur-2xl transition-all duration-300 group-hover:scale-125 ${theme.blob}`}
                    />

                    <div
                      className={`pointer-events-none absolute bottom-0 left-5 right-5 h-[3px] rounded-full bg-gradient-to-r opacity-80 ${theme.bar}`}
                    />

                    <div className="relative flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${theme.dot}`} />

                          <p
                            className={`text-[10px] font-black uppercase tracking-[0.16em] ${theme.text}`}
                          >
                            {stat.label}
                          </p>
                        </div>

                        <p className="mt-3 text-3xl font-black leading-none tracking-[-0.04em] text-slate-950">
                          {stat.count}
                        </p>

                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {stat.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br text-white transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14 ${theme.icon}`}
                      >
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.4} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Mobile dots (follow scroll position) */}
            <div className="mt-2 flex flex-col items-center sm:hidden">
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_3px_12px_rgba(15,23,42,0.06)]">
                {STATS.map((stat, index) => (
                  <button
                    key={stat.key}
                    type="button"
                    aria-label={`Go to archive statistic ${index + 1}`}
                    onClick={() => {
                      const card =
                        archiveStatsScrollRef.current?.children[index]

                      if (!card) return

                      card.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center',
                      })

                      setActiveArchiveCard(index)
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition-transform duration-200 active:scale-90"
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ease-out ${
                        activeArchiveCard === index
                          ? 'h-1.5 w-6 bg-slate-900'
                          : 'h-1.5 w-1.5 bg-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Swipe to explore
              </p>
            </div>

            {/* Desktop dots (follow active filter) */}
            <div className="mt-2 hidden flex-col items-center sm:flex">
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-[0_3px_12px_rgba(15,23,42,0.06)]">
                {STATS.map((stat) => (
                  <button
                    key={stat.key}
                    type="button"
                    aria-label={`Filter ${stat.label}`}
                    onClick={() => setStatusFilter(stat.key)}
                    className="flex h-5 w-5 items-center justify-center rounded-full active:scale-90"
                  >
                    <span
                      className={`block rounded-full transition-all duration-200 ${
                        statusFilter === stat.key
                          ? 'h-1.5 w-6 bg-slate-900'
                          : 'h-1.5 w-1.5 bg-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Select archive filter
              </p>
            </div>
          </div>

          {/* =================================================
              SEARCH + COUNT
          ================================================= */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-3 lg:max-w-3xl lg:flex-row">
              {/* SEARCH */}
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customer, plate number, appointment # / APPT #, service, fuel, transmission..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {/* DATE */}
              <div className="relative w-full max-w-[308px] sm:max-w-[320px] lg:w-56 lg:max-w-none">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block min-h-[48px] w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                  Clear Date
                </button>
              )}
            </div>

            {/* ACTIVE FILTER SUMMARY */}
            <div className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm lg:w-fit">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  THEMES[activeStat.theme].chipIcon
                }`}
              >
                <ActiveStatIcon className="h-5 w-5" />
              </div>

              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    statusFilter === 'all'
                      ? 'text-gray-400'
                      : THEMES[activeStat.theme].text
                  }`}
                >
                  {statusFilter === 'all' ? 'All Archived' : activeStat.label}
                </p>

                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {filteredAppointments.length}{' '}
                  {statusFilter === 'all'
                    ? filteredAppointments.length === 1
                      ? 'Appointment'
                      : 'Appointments'
                    : `${activeStat.label} ${
                        filteredAppointments.length === 1
                          ? 'Appointment'
                          : 'Appointments'
                      }`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 sm:h-16 sm:w-16">
              <LoaderCircle className="h-7 w-7 animate-spin sm:h-8 sm:w-8" />
            </div>

            <p className="font-semibold text-gray-700">
              Loading archived appointments...
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Please wait while we retrieve the archive.
            </p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500 sm:h-20 sm:w-20">
              <Inbox className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              No archived appointments
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
              Completed appointments that are archived will automatically appear
              here.
            </p>

            <button
              onClick={() => navigate('/admin')}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <Search className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              No matching appointments
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
              Try changing your search term, date, or status filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {paginatedAppointments.map((appointment) => {
              const state = getState(appointment)
              const isRejected = state === 'rejected'
              const isCancelled = state === 'cancelled'
              const appointmentNumber =
                appointments.length - appointments.indexOf(appointment)

              return (
                <div
                  key={appointment.id}
                  id={`archive-appointment-${appointment.id}`}
                  className={`group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${
                    highlightedAppointmentId === appointment.id
                      ? '!border-red-400 ring-4 ring-red-500/20 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]'
                      : ''
                  }`}
                >
                  {/* CARD HEADER */}

                  <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/70 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition group-hover:scale-105 sm:h-12 sm:w-12">
                        <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Archived Appointment
                        </p>

                        <h3 className="mt-1 truncate text-base font-bold text-gray-900 sm:text-lg">
                          {appointment.service_type || 'Service Appointment'}
                        </h3>

                        <p className="mt-1 text-xs text-gray-400">
                          Appointment #{appointmentNumber}
                        </p>
                      </div>
                    </div>

                    {(() => {
  const info = getAutoDeleteInfo(appointment)
  if (!info) return null

  const urgent = info.daysLeft <= 7

  return (
    <p
      className={`mt-1 flex items-center gap-1 text-xs font-semibold ${
        urgent ? 'text-red-600' : 'text-gray-400'
      }`}
    >
      <Clock3 className="h-3.5 w-3.5" />
      {info.daysLeft === 0
        ? 'Deletes today'
        : `Auto-deletes in ${info.daysLeft} day${info.daysLeft === 1 ? '' : 's'}`}
    </p>
  )
})()}

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                        state === 'completed'
                          ? 'border-green-200 bg-green-100 text-green-700'
                          : isRejected
                          ? 'border-red-200 bg-red-100 text-red-700'
                          : isCancelled
                          ? 'border-orange-200 bg-orange-100 text-orange-700'
                          : 'border-gray-200 bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          state === 'completed'
                            ? 'bg-green-500'
                            : isRejected
                            ? 'bg-red-500'
                            : isCancelled
                            ? 'bg-orange-500'
                            : 'bg-gray-500'
                        }`}
                      />

                      {isRejected
                        ? 'Rejected'
                        : isCancelled
                        ? 'Cancelled'
                        : appointment.status
                        ? appointment.status.replace('_', ' ')
                        : 'N/A'}
                    </span>
                  </div>

                  {/* MAIN INFORMATION */}

                  <div className="p-4 sm:p-6">

                    {/* CUSTOMER / VEHICLE / SERVICE / RECORD */}

                    <AppointmentInfoGrid appointment={appointment} />

                    {/* CANCELLATION / REJECTION REASON */}

                    <StatusReasonPanel
                      appointment={appointment}
                      className="mt-5"
                    />

                    {/* AI VEHICLE DETECTION */}

                    <div className="mt-5">
                      <AiDetectionPanel appointment={appointment} />
                    </div>

                    {/* BOTTOM INFORMATION */}

                    <div className="mt-5 grid grid-cols-1 gap-5 border-t border-gray-100 pt-5 lg:grid-cols-2">
                      {/* TECHNICIAN */}
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <HardHat className="h-3.5 w-3.5" />
                          Assigned Technician
                        </p>

                        {appointment.technician_id &&
                        appointment.technician?.name ? (
                          <div className="mt-2 flex items-center gap-3 rounded-xl bg-red-50/60 px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                              <HardHat className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words font-bold text-gray-900">
                                {appointment.technician.name}
                              </p>

                              {appointment.technician_role && (
                                <p className="mt-1 break-words text-xs font-semibold text-blue-600">
                                  Role: {appointment.technician_role}
                                </p>
                              )}

                              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-green-600">
                                <Check className="h-3.5 w-3.5" />
                                Assigned
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                              <HardHat className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-gray-500">
                                Not Assigned
                              </p>

                              <p className="mt-0.5 text-xs text-gray-400">
                                No technician was assigned.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* NOTES */}
                      <div>
                        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          <FileText className="h-3.5 w-3.5" />
                          Customer Notes
                        </p>

                        <div className="mt-2 rounded-xl bg-gray-50 px-4 py-3">
                          <p className="break-words text-sm leading-6 text-gray-600">
                            {appointment.notes ||
                              'No additional notes provided.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-gray-100 pt-5 sm:flex sm:flex-row sm:flex-wrap sm:justify-end">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md sm:w-auto sm:px-5"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>

                      <button
                        onClick={() => openConversation(appointment)}
                        className={`relative inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow-md sm:w-auto sm:px-5 ${
                          unreadCounts[appointment.id] > 0
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            : 'border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50'
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />

                        <span>Message Customer</span>

                        {unreadCounts[appointment.id] > 0 && (
                          <span className="relative flex h-6 min-w-6 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />

                            <span className="relative inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm">
                              {unreadCounts[appointment.id] > 99
                                ? '99+'
                                : unreadCounts[appointment.id]}
                            </span>
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const updatedViewed = {
                            ...viewedAttachments,
                            [appointment.id]: true,
                          }

                          setViewedAttachments(updatedViewed)

                          localStorage.setItem(
                            'viewedArchivedAttachments',
                            JSON.stringify(updatedViewed)
                          )

                          fetchAttachments(appointment.id)
                          setSelectedAttachmentAppointment(appointment)
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 hover:shadow-md sm:w-auto sm:px-5"
                      >
                        <Paperclip className="h-4 w-4" />
                        Attachments
                        {!viewedAttachments[appointment.id] &&
                          attachments[appointment.id]?.length > 0 && (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              {attachments[appointment.id].length}
                            </span>
                          )}
                      </button>

                      <button
                        onClick={() => restoreAppointment(appointment.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow-md sm:w-auto sm:px-5"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </button>

                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md sm:w-auto sm:px-5"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Appointment
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* =====================================================
            BOTTOM PAGINATION
        ===================================================== */}

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-900">
                {(currentPage - 1) * APPOINTMENTS_PER_PAGE + 1}
              </span>{' '}
              –{' '}
              <span className="font-semibold text-gray-900">
                {Math.min(
                  currentPage * APPOINTMENTS_PER_PAGE,
                  filteredAppointments.length
                )}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900">
                {filteredAppointments.length}
              </span>{' '}
              appointments
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <div className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-gray-900 px-3 text-sm font-bold text-white">
                {currentPage}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =====================================================
          VIEW APPOINTMENT DETAILS MODAL
      ===================================================== */}

      {selectedAppointment && (
<div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-4">          <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Archived Appointment
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-gray-900 sm:text-xl">
                  Appointment #{selectedAppointment.id}
                </h2>
              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition hover:bg-gray-300"
                aria-label="Close appointment details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {(() => {
                const modalState = getState(selectedAppointment)
                const modalRejected = modalState === 'rejected'

                return (
                  <>
                    <AppointmentInfoGrid
                      appointment={selectedAppointment}
                      columns="grid-cols-1 gap-3 sm:grid-cols-2"
                    />

                    <StatusReasonPanel appointment={selectedAppointment} />

                    <div className="mt-4">
                      <AiDetectionPanel
                        appointment={selectedAppointment}
                        bg="bg-gray-50"
                        border="border-gray-200"
                      />
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-red-50/50 p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <HardHat className="h-3.5 w-3.5" />
                        Assigned Technician
                      </p>

                      <p className="mt-2 break-words font-bold text-gray-900">
                        {selectedAppointment.technician?.name || 'Not assigned'}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 break-words text-sm font-semibold text-blue-600">
                        <Wrench className="h-3.5 w-3.5 shrink-0" />
                        Role:{' '}
                        {selectedAppointment.technician_role || 'Not assigned'}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Status
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                          modalState === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : modalState === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : modalState === 'cancelled'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {modalState === 'rejected'
                          ? 'rejected'
                          : selectedAppointment.status
                          ? selectedAppointment.status.replace('_', ' ')
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <FileText className="h-3.5 w-3.5" />
                        Customer Notes
                      </p>

                      <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                        {selectedAppointment.notes ||
                          'No additional notes provided.'}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="flex shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ATTACHMENT DETAILS MODAL
      ===================================================== */}

      {selectedAttachmentAppointment && (
<div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-4">          <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <Paperclip className="h-3.5 w-3.5" />
                  Service Attachments
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-gray-900 sm:text-xl">
                  Attachment Details
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Appointment #{selectedAttachmentAppointment.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedAttachmentAppointment(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600 transition hover:bg-gray-300"
                aria-label="Close attachments"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {attachments[selectedAttachmentAppointment.id]?.length > 0 ? (
                <div className="space-y-3">
                  {attachments[selectedAttachmentAppointment.id].map(
                    (attachment) => (
                      <div
                        key={attachment.id}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="flex items-start gap-2 text-sm font-bold text-gray-900">
                              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />

                              <span className="min-w-0 break-all">
                                {attachment.file_name}
                              </span>
                            </p>

                            <p className="mt-2 break-words text-xs text-gray-500">
                              {attachment.file_type || 'Unknown file type'}
                              {' • '}
                              {attachment.file_size
                                ? `${(attachment.file_size / 1024).toFixed(
                                    1
                                  )} KB`
                                : 'Size unavailable'}
                            </p>

                            <p className="mt-1 break-words text-xs text-gray-400">
                              Uploaded by{' '}
                              {attachment.uploaded_by_name || 'Unknown user'}
                              {' • '}
                              {attachment.uploaded_by_role || 'Unknown role'}
                            </p>

                            <p className="mt-1 break-words text-xs text-gray-400">
                              Uploaded{' '}
                              {attachment.created_at
                                ? formatTimestamp(attachment.created_at)
                                : 'Date unavailable'}
                            </p>
                          </div>

                          <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto">
                            <button
                              type="button"
                              onClick={() => viewAttachment(attachment)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 sm:px-3"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => downloadAttachment(attachment)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:px-3"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteAttachment(attachment)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 sm:px-3"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
                    <Paperclip className="h-5 w-5" />
                  </div>

                  <p className="text-sm font-semibold text-gray-700">
                    No attachments
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    No files were uploaded for this appointment.
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:justify-end sm:px-6 sm:py-4">
              <button
                onClick={() => setSelectedAttachmentAppointment(null)}
                className="w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MESSAGE MODAL
      ===================================================== */}

      {selectedConversationAppointment && (
<div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-5">          {/* FLOATING BACK BUTTON */}
          <button
            type="button"
            onClick={closeConversation}
            aria-label="Back to appointments"
            title="Back"
            className="fixed left-4 top-[220px] z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-[0_8px_25px_rgba(15,23,42,0.18)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 sm:left-5 md:left-6"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>

          <div className="flex h-[100dvh] w-full flex-col overflow-hidden rounded-none bg-white shadow-2xl sm:h-[92vh] sm:max-w-3xl sm:rounded-3xl">
            {/* MESSAGE HEADER */}

            <div className="shrink-0 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50">
              <div className="flex items-start justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm sm:h-12 sm:w-12">
                    <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />

                    {conversationMessages.some(
                      (message) =>
                        message.sender_id !== currentUser?.id &&
                        !messageReads[message.id] &&
                        !message.deleted_at
                    ) && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Service Conversation
                    </p>

                    <h2 className="truncate text-base font-bold text-gray-900 sm:text-xl">
                      {selectedConversationAppointment.customer_name ||
                        'Customer'}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      Service Team •{' '}
                      {selectedConversationAppointment.service_type ||
                        'Service Appointment'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeConversation}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                  aria-label="Close conversation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* WARRANTY BANNER */}

              {selectedConversationAppointment.status === 'completed' &&
                selectedConversationAppointment.completed_at && (
                  <div
                    className={`mx-4 mb-3 rounded-2xl border px-3 py-3 sm:mx-6 sm:mb-4 sm:px-4 ${
                      activeConversationWarrantyExpired
                        ? 'border-red-200 bg-red-50'
                        : 'border-emerald-200 bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          activeConversationWarrantyExpired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {activeConversationWarrantyExpired ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            activeConversationWarrantyExpired
                              ? 'text-red-800'
                              : 'text-emerald-800'
                          }`}
                        >
                          {activeConversationWarrantyExpired
                            ? 'Warranty messaging has ended'
                            : 'Warranty conversation is active'}
                        </p>

                        <p
                          className={`mt-1 text-xs leading-5 ${
                            activeConversationWarrantyExpired
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          Service completed:{' '}
                          <span className="font-semibold">
                            {formatTimestamp(
                              selectedConversationAppointment.completed_at
                            )}
                          </span>
                        </p>

                        <p
                          className={`text-xs leading-5 ${
                            activeConversationWarrantyExpired
                              ? 'text-red-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {activeConversationWarrantyEnd
                            ? `${
                                activeConversationWarrantyExpired
                                  ? 'Messaging ended: '
                                  : 'Messaging available until: '
                              }${formatTimestamp(activeConversationWarrantyEnd)}`
                            : ''}
                        </p>

                        {activeConversationWarrantyExpired && (
                          <p className="mt-1 flex items-start gap-1.5 text-xs font-semibold leading-5 text-red-700">
                            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            Previous messages remain available for viewing, but
                            new messages cannot be sent.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* NON-COMPLETED BANNER */}

              {selectedConversationAppointment.status !== 'completed' && (
                <div className="mx-4 mb-3 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3 sm:mx-6 sm:mb-4 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <MessageCircle className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-blue-800">
                        Service conversation available
                      </p>

                      <p className="text-xs leading-5 text-blue-700">
                        Messages are available while this appointment is active.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MESSAGES */}

<div
  ref={messagesContainerRef}
  className="min-h-0 flex-1 overflow-y-auto bg-[#f8f9fc] px-3 py-4 sm:px-6 sm:py-5"
>              {loadingConversation ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    </div>

                    <p className="font-semibold text-gray-700">
                      Loading conversation...
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Retrieving message history.
                    </p>
                  </div>
                </div>
              ) : conversationError ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-5 text-center sm:p-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <CircleAlert className="h-6 w-6" />
                    </div>

                    <p className="font-bold text-red-800">
                      Conversation unavailable
                    </p>

                    <p className="mt-2 break-words text-sm leading-6 text-red-700">
                      {conversationError}
                    </p>
                  </div>
                </div>
              ) : conversationMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="px-5 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                      <MessageCircle className="h-7 w-7" />
                    </div>

                    <p className="font-bold text-gray-700">No messages yet</p>

                    <p className="mt-1 text-sm text-gray-400">
                      Start the conversation with{' '}
                      {selectedConversationAppointment.customer_name ||
                        'the customer'}
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversationMessages.map((message, index) => {
                    const isMine = message.sender_id === currentUser?.id
                    const isDeleted = Boolean(message.deleted_at)
                    const read = Boolean(messageReads[message.id])

                    return (
                      <div
  id={`archive-message-${message.id}`}
  key={message.id || index}
  className={`flex ${
    isMine ? 'justify-end' : 'justify-start'
  }`}
>
                        <div className="max-w-[92%] sm:max-w-[75%]">
                          {!isMine && (
                            <div className="mb-1 ml-1 flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                <UserRound className="h-3.5 w-3.5" />
                              </div>

                              <span className="max-w-[200px] truncate text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {selectedConversationAppointment.customer_name ||
                                  'Customer'}
                              </span>
                            </div>
                          )}

                          {isMine && (
                            <div className="mb-1 mr-1 text-right">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                                Service Team
                              </span>
                            </div>
                          )}

                          <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${
                              isMine
                                ? 'rounded-br-md bg-indigo-600 text-white'
                                : 'rounded-bl-md border border-gray-200 bg-white text-gray-800'
                            } ${isDeleted ? 'opacity-60' : ''}`}
                          >
                            <p
                              className={`whitespace-pre-wrap break-words text-sm leading-6 ${
                                isDeleted ? 'italic' : ''
                              }`}
                            >
                              {isDeleted
                                ? 'This message was deleted.'
                                : message.message}
                            </p>
                          </div>

                          <div
                            className={`mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-400 ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span>
                              {message.created_at
                                ? formatTimestamp(message.created_at)
                                : ''}
                            </span>

                            {isMine && (
                              <span
                                className={`flex items-center gap-1 ${
                                  read
                                    ? 'font-bold text-blue-500'
                                    : 'text-gray-400'
                                }`}
                              >
                                {read ? (
                                  <>
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Read
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5" />
                                    Sent
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* COMPOSER */}

            <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-5">
              {activeConversationCanSend ? (
                <div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sendingMessage || !messageText.trim()}
                      className="order-first flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:gap-2 sm:px-4"
                      aria-label="Send message"
                    >
                      {sendingMessage ? (
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </button>

                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleMessageKeyDown}
                      rows={2}
                      disabled={sendingMessage}
                      placeholder={`Message ${
                        selectedConversationAppointment.customer_name ||
                        'customer'
                      }...`}
                      className="min-h-[52px] min-w-0 flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <p className="mt-2 hidden px-1 text-[10px] text-gray-400 sm:block">
                    Press Enter to send • Shift + Enter for a new line
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Lock className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-red-800">
                        Messaging is closed
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-red-700">
                        The warranty messaging period has ended. You can still
                        view the complete conversation history.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}