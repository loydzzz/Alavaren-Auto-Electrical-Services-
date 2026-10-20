import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useLocation} from 'react-router-dom'
import { FaBell, FaCalendarAlt, FaTrashAlt, FaCheck, } from 'react-icons/fa'
import {
  CarFront,
  Bell,
  Check,
  Trash2,
  CalendarDays,
  Wrench,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  Radio,
  MessageCircle,
  ClipboardList,
  Clock3,
  CircleCheckBig,
  LockKeyhole,
  Info,
  CircleX,
  Reply,
  X,
  LoaderCircle,
  Send,
  Settings,
  ArrowLeft,
} from 'lucide-react'



import AccountStatusCard from "./AccountStatuscard.jsx";
import AnnouncementBanner from '../../components/AnnouncementBanner'




// =========================================================
// DESIGN SYSTEM
// =========================================================

const RED = '#C0392B'
const RED_DARK = '#922B21'

// =========================================================
// APPOINTMENT PROGRESS HISTORY
// =========================================================

function AppointmentProgressHistory({
  history = [],
  appointment,
  attachments = [],
}) {


  if (!history || history.length === 0) {
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 bg-slate-50/80 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm">
            📋
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Progress History
            </p>

            <p className="mt-1 text-xs text-slate-500">
              No progress updates have been recorded yet.
            </p>
          </div>
        </div>
      </div>
    )
  }

  function getStatusStyle(status) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: '📋',
        }

      case 'confirmed':
        return {
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: '✓',
        }

      case 'in_progress':
        return {
          color: 'text-violet-700',
          bg: 'bg-violet-50',
          border: 'border-violet-200',
          icon: '🔧',
        }

      case 'completed':
        return {
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: '✓',
        }

      case 'rejected':
  return {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '✕',
  }

case 'cancelled':
  return {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: '⚠',
  }


      default:
        return {
          color: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: 'ℹ️',
        }
    }
  }

  function formatHistoryDate(date) {
    if (!date) return 'Date not available'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date not available'
    }

    return parsedDate.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-lg shadow-sm">
              📋
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Progress History
              </h4>

              <p className="mt-0.5 text-xs text-slate-500">
                A record of updates made to your appointment.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">
            {history.length} update{history.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-0">
         {history.map((item, index) => {
 const status = item.status?.toLowerCase()

const isRejected =
  status === 'cancelled' &&
  Boolean(appointment?.rejected_at)

const isCancelled =
  status === 'cancelled' &&
  !isRejected

const displayStatus =
  isRejected
    ? 'rejected'
    : isCancelled
      ? 'cancelled'
      : status

const style =
  getStatusStyle(displayStatus)

const rejectionReason =
  appointment?.rejection_reason?.trim() || ''

const cancellationReason =
  appointment?.cancellation_reason?.trim() || ''

const displayReason =
  isRejected
    ? rejectionReason
    : isCancelled
      ? cancellationReason
      : ''

const displayMessage =
  isRejected
    ? displayReason
      ? `Your appointment was rejected. Reason: ${displayReason}`
      : 'Your appointment was rejected.'
    : isCancelled
      ? displayReason
        ? `Your appointment was cancelled. Reason: ${displayReason}`
        : 'Your appointment was cancelled.'
      : item.message

const isLast =
  index === history.length - 1


  return (
    <div key={item.id} className="flex gap-4">

      {/* =================================================
          TIMELINE ICON
      ================================================= */}

      <div className="flex flex-col items-center">

        <div
          className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${style.border} ${style.bg}`}
        >
          <span className="text-sm">
            {isRejected ? '✕' : style.icon}
          </span>
        </div>

        {!isLast && (
          <div className="min-h-[55px] w-0.5 bg-gradient-to-b from-slate-200 to-slate-100" />
        )}

      </div>


      <div
        className={`min-w-0 flex-1 ${
          isLast ? 'pb-1' : 'pb-6'
        }`}
      >

        {/* =================================================
            STATUS + DATE
        ================================================= */}

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

          <span
  className={`inline-flex self-start rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${style.bg} ${style.color} ${style.border}`}
>
  {displayStatus?.replace('_', ' ') || 'Unknown'}
</span>


          <span className="text-[11px] text-slate-400">
            {formatHistoryDate(item.created_at)}
          </span>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-800">
  {displayMessage}
</p>


        {/* =================================================
            UPDATED BY
        ================================================= */}

        {(item.changed_by_name ||
          item.changed_by_role) && (

          <div className="mt-2 flex flex-wrap items-center gap-2">

            <span className="text-xs text-slate-400">
              Updated by
            </span>

            {item.changed_by_name && (
              <span className="text-xs font-bold text-slate-600">
                {item.changed_by_name}
              </span>
            )}

            {item.changed_by_role && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {item.changed_by_role}
              </span>
            )}

          </div>
        )}

      </div>

    </div>
  )
})}





        </div>
      </div>
    </div>
  )
}









// =========================================================
// CUSTOMER HOME
// =========================================================

export default function CustomerHome() {
  const navigate = useNavigate()
  const location = useLocation()
const processedCustomerNotificationIdsRef =
  useRef(new Set())


  // =========================================================
  // CUSTOMER
  // =========================================================

  const [appointments, setAppointments] = useState([])
  const [user, setUser] = useState(null)

  const [customerName, setCustomerName] = useState('')
  const [customerAvatar, setCustomerAvatar] = useState(null)
  const [customerRole, setCustomerRole] = useState('Customer')

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationSoundRef = useRef(null)

  const summaryScrollRef = useRef(null)
const [activeSummaryCard, setActiveSummaryCard] = useState(0)


  // =========================================================
  // APPOINTMENT PROGRESS HISTORY
  // =========================================================

  const [progressHistory, setProgressHistory] = useState({})

  // =========================================================
  // CUSTOMER MESSAGING
  // =========================================================

  const [currentAuthUserId, setCurrentAuthUserId] = useState(null)

  const [activeCustomerConversation, setActiveCustomerConversation] =
    useState(null)

  const [activeMessagingAppointment, setActiveMessagingAppointment] =
    useState(null)

  const [customerConversationMessages, setCustomerConversationMessages] =
    useState([])

  const [showCustomerMessaging, setShowCustomerMessaging] =
    useState(false)

  const [customerChatMessage, setCustomerChatMessage] =
    useState('')

  const [messagingAllowed, setMessagingAllowed] =
    useState(false)

  const [messagingEndAt, setMessagingEndAt] =
    useState(null)

  const [replyingToMessage, setReplyingToMessage] =
    useState(null)

  const [senderProfilesMap, setSenderProfilesMap] =
    useState({})

  const [messagingLoading, setMessagingLoading] =
    useState(false)

  const [sendingMessage, setSendingMessage] =
    useState(false)

  // =========================================================
  // UNREAD MESSAGE TRACKING
  // =========================================================

  const [unreadMessagesMap, setUnreadMessagesMap] = useState({})
  const messagesEndRef = useRef(null)
  const previousMessageCountRef = useRef(0)

const previousConversationIdRef = useRef(null)

  // =========================================================
  // CONVERSATION MAP
  // =========================================================

  const [
    appointmentConversationMap,
    setAppointmentConversationMap,
  ] = useState({})

  // =========================================================
  // STATUS COLORS
  // =========================================================

  const statusColor = {
    pending:
      'border-amber-200 bg-amber-50 text-amber-700',
    confirmed:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
    cancelled:
      'border-red-200 bg-red-50 text-red-700',
    completed:
      'border-blue-200 bg-blue-50 text-blue-700',
    in_progress:
      'border-violet-200 bg-violet-50 text-violet-700',
  }

  // =========================================================
  // UNREAD STORAGE HELPERS
  // =========================================================

  function getUnreadStorageKey(conversationId) {
    return `customer-message-read-${conversationId}`
  }

  function getLastReadMessageTime(conversationId) {
    if (!conversationId) return null

    try {
      return localStorage.getItem(
        getUnreadStorageKey(conversationId)
      )
    } catch {
      return null
    }
  }

  function saveLastReadMessageTime(conversationId, timestamp) {
    if (!conversationId || !timestamp) return

    try {
      localStorage.setItem(
        getUnreadStorageKey(conversationId),
        timestamp
      )
    } catch {
      // Ignore localStorage errors.
    }
  }

  function calculateUnreadMessages(messages, conversationId) {
    if (!conversationId || !currentAuthUserId) {
      return 0
    }

    const lastRead = getLastReadMessageTime(conversationId)

    return (messages || []).filter(message => {
      if (message.sender_id === currentAuthUserId) {
        return false
      }

      if (!lastRead) {
        return true
      }

      return (
        new Date(message.created_at).getTime() >
        new Date(lastRead).getTime()
      )
    }).length
  }

  function markConversationAsRead(conversationId, messages = []) {
    if (!conversationId) return

    const incomingMessages = (messages || []).filter(
      message => message.sender_id !== currentAuthUserId
    )

    if (incomingMessages.length > 0) {
      const latestMessage = incomingMessages
        .slice()
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        )
        .at(-1)

      if (latestMessage?.created_at) {
        saveLastReadMessageTime(
          conversationId,
          latestMessage.created_at
        )
      }
    } else {
      saveLastReadMessageTime(
        conversationId,
        new Date().toISOString()
      )
    }

    setUnreadMessagesMap(current => ({
      ...current,
      [conversationId]: 0,
    }))
  }
  // =========================================================
// MARK MESSAGE NOTIFICATIONS AS READ
// CUSTOMER-SIDE ONLY
// =========================================================

async function markMessageNotificationsAsRead(appointmentId) {
  if (!appointmentId || !currentAuthUserId) {
    return
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('recipient_id', currentAuthUserId)
      .eq('customer_id', currentAuthUserId)
      .eq('appointment_id', appointmentId)
      .eq('type', 'message')
      .eq('is_read', false)
      .select('id')

    if (error) {
      console.error(
        'Failed to mark message notifications as read:',
        error
      )

      return
    }

    if (!data?.length) {
      return
    }

    const readIds = new Set(
      data.map(notification => notification.id)
    )

    setNotifications(current =>
      current.map(notification =>
        readIds.has(notification.id)
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    )

    console.log(
      '✅ Customer message notifications marked as read:',
      data.length
    )
  } catch (error) {
    console.error(
      'Unexpected message notification read error:',
      error
    )
  }
}

  // =========================================================
  // LOAD CUSTOMER DATA
  // =========================================================

  async function loadCustomerData() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        return
      }

      setUser(authUser)
      setCurrentAuthUserId(authUser.id)

      // =====================================================
      // CUSTOMER PROFILE
      // =====================================================

      const {
        data: userData,
        error: userError,
      } = await supabase
        .from('users')
        .select('name, avatar_url, role')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error(
          'Customer profile loading error:',
          userError
        )
      }

      setCustomerName(userData?.name || '')
      setCustomerAvatar(userData?.avatar_url || null)

      setCustomerRole(
        userData?.role
          ? userData.role.charAt(0).toUpperCase() +
              userData.role.slice(1)
          : 'Customer'
      )

      // =====================================================
      // APPOINTMENTS
      // =====================================================

      const {
        data: appointmentData,
        error: appointmentError,
      } = await supabase
        .from('appointments')
        .select('*')
        .eq('customer_id', authUser.id)
        .order('appointment_date', {
          ascending: false,
        })

      if (appointmentError) {
        console.error(
          'Appointment loading error:',
          appointmentError
        )
      }

      setAppointments(appointmentData || [])

      // =====================================================
      // NOTIFICATIONS
      // =====================================================

      const {
        data: notifData,
        error: notificationError,
      } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', authUser.id)
        .order('created_at', {
          ascending: false,
        })

      if (notificationError) {
        console.error(
          'Notification loading error:',
          notificationError
        )
      }

      setNotifications(notifData || [])
    } catch (error) {
      console.error(
        'Customer dashboard loading error:',
        error
      )
    }
  }




  useEffect(() => {

  console.log(
    "🔊 Initializing CUSTOMER notification sound..."
  )

  const audio =
    new Audio("/sounds/notification.mp3")

  audio.volume = 0.1
  audio.preload = "auto"

  notificationSoundRef.current = audio

  console.log(
    "🔊 Customer notification sound ready:",
    audio.src
  )

  return () => {

    console.log(
      "🔇 Cleaning up customer notification sound."
    )

    audio.pause()

    notificationSoundRef.current = null
  }

}, [])





useEffect(() => {

  const unlockNotificationSound = () => {

    const sound =
      notificationSoundRef.current

    if (!sound) return

    sound.muted = true

    const unlockPromise = sound.play()

    if (unlockPromise !== undefined) {

      unlockPromise
        .then(() => {

          sound.pause()
          sound.currentTime = 0
          sound.muted = false

          console.log(
            "🔓 Customer notification sound unlocked."
          )

          document.removeEventListener(
            "click",
            unlockNotificationSound
          )

          document.removeEventListener(
            "touchstart",
            unlockNotificationSound
          )

          document.removeEventListener(
            "keydown",
            unlockNotificationSound
          )

        })
        .catch(() => {

          sound.muted = false

        })

    }

  }

  document.addEventListener(
    "click",
    unlockNotificationSound
  )

  document.addEventListener(
    "touchstart",
    unlockNotificationSound
  )

  document.addEventListener(
    "keydown",
    unlockNotificationSound
  )

  return () => {

    document.removeEventListener(
      "click",
      unlockNotificationSound
    )

    document.removeEventListener(
      "touchstart",
      unlockNotificationSound
    )

    document.removeEventListener(
      "keydown",
      unlockNotificationSound
    )

  }

}, [])






  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCustomerData()
  }, [])

  // =========================================================
// CUSTOMER APPOINTMENT REALTIME
// =========================================================

useEffect(() => {
  if (!user?.id) {
    console.log(
      '⏳ CUSTOMER appointment realtime waiting for user...'
    )
    return
  }

  const customerId = user.id

  console.log(
    '📡 Starting CUSTOMER appointment realtime:',
    customerId
  )

  const channel = supabase
    .channel(
      `customer-appointments-${customerId}`
    )

    // =====================================================
    // APPOINTMENT UPDATE
    // =====================================================

    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'appointments',
        filter: `customer_id=eq.${customerId}`,
      },
      payload => {
        console.log(
          '🚨 CUSTOMER APPOINTMENT UPDATE RECEIVED:',
          payload
        )

        console.log(
          '🔴 OLD STATUS:',
          payload.old?.status
        )

        console.log(
          '🟢 NEW STATUS:',
          payload.new?.status
        )

        setAppointments(currentAppointments =>
          currentAppointments.map(appointment =>
            appointment.id === payload.new.id
              ? {
                  ...appointment,
                  ...payload.new,
                }
              : appointment
          )
        )
      }
    )

    // =====================================================
    // NEW APPOINTMENT
    // =====================================================

    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments',
        filter: `customer_id=eq.${customerId}`,
      },
      payload => {
        console.log(
          '🆕 CUSTOMER APPOINTMENT INSERT:',
          payload.new
        )

        setAppointments(currentAppointments => {
          const exists =
            currentAppointments.some(
              appointment =>
                appointment.id ===
                payload.new.id
            )

          if (exists) {
            return currentAppointments
          }

          return [
            payload.new,
            ...currentAppointments,
          ]
        })
      }
    )

    // =====================================================
    // APPOINTMENT DELETE
    // =====================================================

    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'appointments',
        filter: `customer_id=eq.${customerId}`,
      },
      payload => {
        console.log(
          '🗑️ CUSTOMER APPOINTMENT DELETE:',
          payload.old
        )

        setAppointments(currentAppointments =>
          currentAppointments.filter(
            appointment =>
              appointment.id !== payload.old.id
          )
        )
      }
    )

   
    // =====================================================
    // SUBSCRIBE
    // =====================================================

    .subscribe(status => {
      console.log(
        '📡 CUSTOMER APPOINTMENT REALTIME STATUS:',
        status
      )

      if (status === 'SUBSCRIBED') {
        console.log(
          '✅ CUSTOMER APPOINTMENT REALTIME CONNECTED'
        )
      }

      if (status === 'CHANNEL_ERROR') {
        console.error(
          '❌ CUSTOMER APPOINTMENT REALTIME CHANNEL ERROR'
        )
      }

      if (status === 'TIMED_OUT') {
        console.error(
          '❌ CUSTOMER APPOINTMENT REALTIME TIMED OUT'
        )
      }
    })

  return () => {
    console.log(
      '🧹 Removing CUSTOMER appointment realtime channel'
    )

    supabase.removeChannel(channel)
  }

}, [user?.id])


useEffect(() => {
  console.log(
    '🟣 PROGRESS HISTORY STATE CHANGED:',
    progressHistory
  )
}, [progressHistory])

  // =========================================================
  // FETCH PROGRESS HISTORY
  // =========================================================

  async function loadProgressHistory() {
    if (!appointments.length) {
      setProgressHistory({})
      return
    }

    const appointmentIds = appointments.map(
      appointment => appointment.id
    )

    const {
      data,
      error,
    } = await supabase
      .from('appointment_progress_history')
      .select(`
        id,
        appointment_id,
        status,
        message,
        changed_by,
        changed_by_name,
        changed_by_role,
        created_at
      `)
      .in('appointment_id', appointmentIds)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      console.error(
        'Appointment Progress History Error:',
        error
      )

      return
    }

    const historyMap = {}

    ;(data || []).forEach(historyItem => {
      const appointmentId =
        historyItem.appointment_id

      if (!historyMap[appointmentId]) {
        historyMap[appointmentId] = []
      }

      historyMap[appointmentId].push(historyItem)
    })

    setProgressHistory(historyMap)
  }

  useEffect(() => {
    loadProgressHistory()
  }, [appointments])

  // =========================================================
  // LOAD UNREAD COUNTS
  // =========================================================

  async function loadUnreadMessageCounts() {
    if (!currentAuthUserId || !appointments.length) {
      return
    }

    try {
      const eligibleAppointments = appointments.filter(
        apt =>
          [
            'confirmed',
            'in_progress',
            'completed',
          ].includes(apt.status?.toLowerCase())
      )

      if (!eligibleAppointments.length) {
        setUnreadMessagesMap({})
        return
      }

      const appointmentIds = eligibleAppointments.map(
        apt => apt.id
      )

      const {
        data: conversations,
        error: conversationError,
      } = await supabase
        .from('conversations')
        .select('id, appointment_id')
        .in('appointment_id', appointmentIds)

      if (conversationError) {
        console.error(
          'Unread conversation lookup failed:',
          conversationError
        )
        return
      }

      if (!conversations?.length) {
        setUnreadMessagesMap({})
        return
      }

      const conversationIds = conversations.map(
        conversation => conversation.id
      )

      const {
        data: messages,
        error: messagesError,
      } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          created_at,
          deleted_at
        `)
        .in(
          'conversation_id',
          conversationIds
        )
        .order('created_at', {
          ascending: true,
        })

      if (messagesError) {
        console.error(
          'Unread message lookup failed:',
          messagesError
        )
        return
      }

      const unreadMap = {}

      conversations.forEach(conversation => {
        unreadMap[conversation.id] =
          calculateUnreadMessages(
            (messages || []).filter(
              message =>
                message.conversation_id ===
                conversation.id
            ),
            conversation.id
          )
      })

      setUnreadMessagesMap(unreadMap)
    } catch (error) {
      console.error(
        'Unread message count error:',
        error
      )
    }
  }

  useEffect(() => {
  if (!currentAuthUserId) return

  loadUnreadMessageCounts()

  const channel = supabase
    .channel(
      `message-unread-count-${currentAuthUserId}`
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      () => {
        loadUnreadMessageCounts()
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      },
      () => {
        loadUnreadMessageCounts()
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
      },
      () => {
        loadUnreadMessageCounts()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [
  currentAuthUserId,
  appointments,
])


  // =========================================================
  // NOTIFICATION COUNT
  // =========================================================

  const notificationCount =
    notifications.filter(
      n => !n.is_read
    ).length

  // =========================================================
  // UPCOMING APPOINTMENTS
  // =========================================================

  const upcomingAppointments =
    appointments.filter(
      apt =>
        [
          'pending',
          'confirmed',
          'in_progress',
        ].includes(
          apt.status?.toLowerCase()
        )
    ).length


  // =========================================================
  // TIME AGO
  // =========================================================

  function timeAgo(date) {
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Just now'
    }

    const seconds =
      Math.floor(
        (Date.now() - parsedDate.getTime()) /
          1000
      )

    if (seconds < 60) {
      return 'Just now'
    }

    const minutes =
      Math.floor(seconds / 60)

    if (minutes < 60) {
      return `${minutes} minute${
        minutes > 1 ? 's' : ''
      } ago`
    }

    const hours =
      Math.floor(minutes / 60)

    if (hours < 24) {
      return `${hours} hour${
        hours > 1 ? 's' : ''
      } ago`
    }

    const days =
      Math.floor(hours / 24)

    if (days === 1) {
      return 'Yesterday'
    }

    return `${days} days ago`
  }

  // =========================================================
  // CUSTOMER INITIALS
  // =========================================================

  const customerInitials =
    customerName
      ? customerName
          .split(' ')
          .filter(Boolean)
          .map(word => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'C'


  useEffect(() => {
  if (!showCustomerMessaging) {
    previousMessageCountRef.current = 0
    previousConversationIdRef.current = null
    return
  }

  // Wait until the message list is actually rendered
  if (messagingLoading) return

  if (!activeCustomerConversation?.id) return
  if (customerConversationMessages.length === 0) return

  const conversationId = activeCustomerConversation.id
  const currentMessageCount = customerConversationMessages.length

  const conversationChanged =
    previousConversationIdRef.current !== conversationId

  const hasNewMessage =
    currentMessageCount > previousMessageCountRef.current

  // OPENING / REOPENING CONVERSATION
  // INSTANTLY JUMP TO THE LATEST MESSAGE
  if (conversationChanged) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'end',
        })
      })
    })
  }

  // NEW MESSAGE WHILE ALREADY INSIDE THE CONVERSATION
  else if (hasNewMessage) {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        block: 'end',
      })
    })
  }

  previousConversationIdRef.current = conversationId
  previousMessageCountRef.current = currentMessageCount
}, [
  showCustomerMessaging,
  messagingLoading,                 // <-- added
  activeCustomerConversation?.id,
  customerConversationMessages.length,
])
  // =========================================================
  // PROGRESS STAGES
  // =========================================================

  const progressStages = [
    {
      key: 'pending',
      label: 'Pending',
      message:
        'Your appointment request has been received and is waiting for confirmation.',
      icon: '📋',
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      message:
        'Your appointment has been accepted and is ready for service.',
      icon: '📅',
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      message:
        'Your vehicle is currently being serviced by our technician.',
      icon: '🔧',
    },
    {
      key: 'completed',
      label: 'Completed',
      message:
        'Your vehicle service has been successfully completed.',
      icon: '✓',
    },
  ]

  function getProgressIndex(status) {
    return progressStages.findIndex(
      stage =>
        stage.key ===
        status?.toLowerCase()
    )
  }

  // =========================================================
  // APPOINTMENT MESSAGE
  // =========================================================

  function getAppointmentMessage(apt) {
    const status =
      apt.status?.toLowerCase()

    if (status === 'cancelled') {
      return 'This appointment was cancelled.'
    }

    if (status === 'pending') {
      return 'Your appointment request has been received and is waiting for confirmation.'
    }

    if (status === 'confirmed') {
      return 'Your appointment has been accepted and is ready for service.'
    }

    if (status === 'in_progress') {
      return 'Your vehicle is currently being serviced by our technician.'
    }

    if (status === 'completed') {
      return 'Your vehicle service has been successfully completed.'
    }

    return 'Appointment status updated.'
  }

  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  function formatDateTime(date) {
    if (!date) {
      return 'Not available'
    }

    const parsedDate = new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Not available'
    }

    return parsedDate.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // =========================================================
  // FORMAT TIME ONLY
  // =========================================================

  function formatTimeOnly(date) {
    if (!date) {
      return 'Not available'
    }

    const parsedDate =
      new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return 'Not available'
    }

    return parsedDate.toLocaleString(
      [],
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )
  }




  // =========================================================
  // FIND MESSAGING END TIME
  // =========================================================

  function getMessagingEndAt(apt) {
    if (!apt) {
      return null
    }

    const directEndFields = [
      'messaging_end_at',
      'message_end_at',
      'messaging_ends_at',
      'message_ends_at',
      'messaging_expires_at',
      'message_expires_at',
      'chat_end_at',
      'chat_ends_at',
      'appointment_end_at',
      'service_end_at',
    ]

    for (const field of directEndFields) {
      if (apt[field]) {
        const parsed =
          new Date(apt[field])

        if (
          !Number.isNaN(
            parsed.getTime()
          )
        ) {
          return parsed
        }
      }
    }

    const durationFields = [
      'messaging_duration_minutes',
      'message_duration_minutes',
      'appointment_duration_minutes',
      'service_duration_minutes',
      'duration_minutes',
    ]

    const durationField =
      durationFields.find(
        field =>
          apt[field] !== null &&
          apt[field] !== undefined &&
          apt[field] !== ''
      )

    if (
      durationField &&
      apt.appointment_date &&
      apt.appointment_time
    ) {
      const start =
        new Date(
          `${apt.appointment_date}T${apt.appointment_time}`
        )

      if (
        !Number.isNaN(
          start.getTime()
        )
      ) {
        const duration =
          Number(
            apt[durationField]
          )

        if (
          Number.isFinite(
            duration
          ) &&
          duration > 0
        ) {
          return new Date(
            start.getTime() +
              duration *
                60 *
                1000
          )
        }
      }
    }

    return null
  }

  // =========================================================
  // IS MESSAGING TIME EXPIRED
  // =========================================================

  function isMessagingExpired(endAt) {
    if (!endAt) {
      return false
    }

    return (
      new Date(endAt).getTime() <=
      Date.now()
    )
  }

  // =========================================================
  // MESSAGE STATUS
  // =========================================================

  function getAppointmentMessagingState(apt) {
    const status =
      apt.status?.toLowerCase()

    if (
      ![
        'confirmed',
        'in_progress',
        'completed',
      ].includes(status)
    ) {
      return {
        available: false,
        ended: false,
        endAt: null,
        label: 'Messaging unavailable',
        description:
          'Messaging will become available when this appointment is confirmed.',
      }
    }

    const endAt =
      getMessagingEndAt(apt)

    if (
      endAt &&
      isMessagingExpired(endAt)
    ) {
      return {
        available: false,
        ended: true,
        endAt,
        label: 'Messaging ended',
        description:
          `Messages are still available to view. Messaging ended on ${formatTimeOnly(
            endAt
          )}.`,
      }
    }

    return {
      available: true,
      ended: false,
      endAt,
      label: 'Messaging available',
      description: endAt
        ? `You can send messages until ${formatTimeOnly(
            endAt
          )}.`
        : 'You can send and view messages for this appointment.',
    }
  }

  // =========================================================
  // LOAD SENDER PROFILES
  // =========================================================

  async function loadSenderProfiles(messages) {
    const senderIds = [
      ...new Set(
        (messages || [])
          .map(msg => msg.sender_id)
          .filter(Boolean)
      ),
    ]

    if (!senderIds.length) {
      return
    }

    const {
      data: profiles,
      error,
    } = await supabase
      .from('users')
      .select(`
        id,
        name,
        username,
        role,
        avatar_url,
        last_seen
      `)
      .in('id', senderIds)

    if (error) {
      console.error(
        'Sender profile loading failed:',
        error
      )

      return
    }

    const profileMap = {}

    ;(profiles || []).forEach(
      profile => {
        profileMap[profile.id] =
          profile
      }
    )

    setSenderProfilesMap(
      currentProfiles => ({
        ...currentProfiles,
        ...profileMap,
      })
    )
  }

  // =========================================================
  // CHECK MESSAGING PERMISSION
  // =========================================================

  async function checkMessagingPermission(
    conversationId,
    appointment
  ) {
    let allowedByRpc = false

    const {
      data: allowed,
      error,
    } = await supabase.rpc(
      'can_send_appointment_message',
      {
        p_conversation_id:
          conversationId,
      }
    )

    if (error) {
      console.error(
        'Messaging authorization failed:',
        error
      )
    } else {
      allowedByRpc =
        allowed === true
    }

    const endAt =
      getMessagingEndAt(
        appointment
      )

    setMessagingEndAt(
      endAt
    )

    const expired =
      isMessagingExpired(
        endAt
      )

    setMessagingAllowed(
      allowedByRpc && !expired
    )

    return {
      allowed:
        allowedByRpc && !expired,
      endAt,
    }
  }

  // =========================================================
  // OPEN CUSTOMER APPOINTMENT CONVERSATION
  // =========================================================

  async function openCustomerAppointmentConversation(
    apt
  ) {
    try {
      if (!apt) {
        return
      }

      const status =
        apt.status?.toLowerCase()

      if (
        ![
          'confirmed',
          'in_progress',
          'completed',
        ].includes(status)
      ) {
        console.log(
          'Messaging unavailable for appointment:',
          apt.id,
          status
        )

        return
      }

      setMessagingLoading(true)
      setActiveMessagingAppointment(apt)
      setShowCustomerMessaging(true)
      setActiveCustomerConversation(null)
      setCustomerConversationMessages([])
      setReplyingToMessage(null)
      setMessagingAllowed(false)
      setMessagingEndAt(
        getMessagingEndAt(apt)
      )

      const {
        data: {
          user: authUser,
        },
        error: authError,
      } = await supabase.auth.getUser()

      if (
        authError ||
        !authUser
      ) {
        console.error(
          'Customer authentication failed:',
          authError
        )

        setMessagingLoading(false)
        return
      }

      setCurrentAuthUserId(
        authUser.id
      )

      const {
        data: conversation,
        error: conversationError,
      } = await supabase
        .from('conversations')
        .select('*')
        .eq(
          'appointment_id',
          apt.id
        )
        .maybeSingle()

      if (conversationError) {
        console.error(
          'Customer conversation lookup failed:',
          conversationError
        )

        setMessagingLoading(false)
        return
      }

      if (!conversation) {
        console.log(
          'No conversation exists for appointment:',
          apt.id
        )

        setMessagingLoading(false)
        return
      }

      setActiveCustomerConversation(
        conversation
      )

      const {
        data: messages,
        error: messagesError,
      } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          message,
          created_at,
          updated_at,
          deleted_at,
          deleted_by,
          reply_to_message_id
        `)
        .eq(
          'conversation_id',
          conversation.id
        )
        .order('created_at', {
          ascending: true,
        })

      if (messagesError) {
        console.error(
          'Customer message loading failed:',
          messagesError
        )

        setMessagingLoading(false)
        return
      }

      const loadedMessages =
        messages || []

      setCustomerConversationMessages(
        loadedMessages
      )

      await loadSenderProfiles(
        loadedMessages
      )

      await checkMessagingPermission(
        conversation.id,
        apt
      )

     markConversationAsRead(
  conversation.id,
  loadedMessages
)

await markMessageNotificationsAsRead(
  apt.id
)

setMessagingLoading(false)
    } catch (error) {
      console.error(
        'Unexpected customer conversation error:',
        error
      )

      setMessagingLoading(false)
    }
  }

  // =========================================================
  // REFRESH MESSAGE PERMISSION
  // =========================================================

  useEffect(() => {
    if (
      !showCustomerMessaging ||
      !activeCustomerConversation ||
      !activeMessagingAppointment
    ) {
      return
    }

    const refreshPermission =
      async () => {
        await checkMessagingPermission(
          activeCustomerConversation.id,
          activeMessagingAppointment
        )
      }

    refreshPermission()

    const interval =
      setInterval(
        refreshPermission,
        30 * 1000
      )

    return () => {
      clearInterval(interval)
    }
  }, [
    showCustomerMessaging,
    activeCustomerConversation,
    activeMessagingAppointment,
  ])

  // =========================================================
  // REALTIME CUSTOMER MESSAGES
  // =========================================================

  useEffect(() => {
    if (
      !activeCustomerConversation?.id
    ) {
      return
    }

    const conversationId =
      activeCustomerConversation.id

    const messageChannel =
      supabase
        .channel(
          `customer-conversation-${conversationId}`
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter:
              `conversation_id=eq.${conversationId}`,
          },
          async payload => {
            if (
              payload.eventType ===
              'INSERT'
            ) {
              const newMessage =
                payload.new

              setCustomerConversationMessages(
                currentMessages => {
                  const alreadyExists =
                    currentMessages.some(
                      message =>
                        message.id ===
                        newMessage.id
                    )

                  if (
                    alreadyExists
                  ) {
                    return currentMessages
                  }

                  return [
                    ...currentMessages,
                    newMessage,
                  ]
                }
              )

              await loadSenderProfiles([
                newMessage,
              ])

              if (
                newMessage.sender_id !==
                currentAuthUserId
              ) {
                markConversationAsRead(
                  conversationId,
                  [newMessage]
                )
              }

              return
            }

            if (
              payload.eventType ===
              'UPDATE'
            ) {
              setCustomerConversationMessages(
                currentMessages =>
                  currentMessages.map(
                    message =>
                      message.id ===
                      payload.new.id
                        ? {
                            ...message,
                            ...payload.new,
                          }
                        : message
                  )
              )

              return
            }

            if (
              payload.eventType ===
              'DELETE'
            ) {
              setCustomerConversationMessages(
                currentMessages =>
                  currentMessages.filter(
                    message =>
                      message.id !==
                      payload.old.id
                  )
              )
            }
          }
        )
        .subscribe()

    return () => {
      supabase.removeChannel(
        messageChannel
      )
    }
  }, [
    activeCustomerConversation?.id,
    currentAuthUserId,
  ])

  // =========================================================
  // GLOBAL REALTIME UNREAD MESSAGE LISTENER
  // =========================================================

  
useEffect(() => {
  if (!currentAuthUserId) {
    return
  }

  console.log(
    '💬 Starting CUSTOMER GLOBAL MESSAGE REALTIME:',
    currentAuthUserId
  )

  const unreadChannel = supabase
    .channel(
      `customer-global-message-unread-home-${currentAuthUserId}`
    )

    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      async payload => {
        const newMessage = payload?.new

        if (!newMessage?.id) {
          return
        }

        console.log(
          '💬 CUSTOMER REALTIME NEW MESSAGE:',
          newMessage
        )

        // ---------------------------------------------------
        // Ignore our own messages
        // ---------------------------------------------------

        if (
          String(newMessage.sender_id) ===
          String(currentAuthUserId)
        ) {
          return
        }

        // ---------------------------------------------------
        // Find the conversation
        // ---------------------------------------------------

        const {
          data: conversation,
          error: conversationError,
        } = await supabase
          .from('conversations')
          .select(
            'id, appointment_id'
          )
          .eq(
            'id',
            newMessage.conversation_id
          )
          .maybeSingle()

        if (
          conversationError ||
          !conversation
        ) {
          console.error(
            'Customer realtime conversation lookup failed:',
            conversationError
          )

          return
        }

        // ---------------------------------------------------
        // If this conversation is currently OPEN,
        // the conversation listener will handle it.
        // Do not create an unread count here.
        // ---------------------------------------------------

        if (
          String(
            activeCustomerConversation?.id
          ) ===
            String(conversation.id) &&
          showCustomerMessaging
        ) {
          console.log(
            '💬 Customer conversation is currently open. Skipping unread increment.'
          )

          return
        }

        // ---------------------------------------------------
        // IMMEDIATELY UPDATE UNREAD COUNT
        // ---------------------------------------------------
        //
        // IMPORTANT:
        // Do NOT call loadUnreadMessageCounts() here.
        //
        // That database reload was causing the count to
        // appear and then disappear/blink.
        // ---------------------------------------------------

        setUnreadMessagesMap(current => ({
          ...current,
          [conversation.id]:
            (Number(
              current[conversation.id]
            ) || 0) + 1,
        }))

        console.log(
          '✅ CUSTOMER UNREAD COUNT UPDATED IMMEDIATELY:',
          conversation.id
        )

        // ===================================================
        // CREATE CUSTOMER NOTIFICATION
        // ===================================================

        const {
          data: appointment,
          error: appointmentError,
        } = await supabase
          .from('appointments')
          .select(`
            id,
            appointment_number
          `)
          .eq(
            'id',
            conversation.appointment_id
          )
          .maybeSingle()

        if (appointmentError) {
          console.error(
            'Appointment lookup for notification failed:',
            appointmentError
          )

          return
        }

        if (!appointment) {
          return
        }

        // ---------------------------------------------------
        // Find sender name
        // ---------------------------------------------------

        const {
          data: sender,
        } = await supabase
          .from('users')
          .select(`
            id,
            name
          `)
          .eq(
            'id',
            newMessage.sender_id
          )
          .maybeSingle()

        const senderName =
          sender?.name ||
          'Staff'

        const notificationMessage =
          `You received a new message from ${senderName} regarding Appointment #${appointment.appointment_number}.`

        // ---------------------------------------------------
        // Create notification
        // ---------------------------------------------------

        const {
          error: notificationError,
        } = await supabase
          .from('notifications')
          .insert({
            title:
              'New Appointment Message',

            message:
              notificationMessage,

            type: 'message',

            is_read: false,

            appointment_id:
              appointment.id,

            recipient_id:
              currentAuthUserId,

            customer_id:
              currentAuthUserId,
          })

        if (notificationError) {
          console.error(
            'Message notification creation failed:',
            notificationError
          )
        }
      }
    )

    .subscribe(status => {
      console.log(
        '📡 CUSTOMER GLOBAL MESSAGE REALTIME STATUS:',
        status
      )

      if (
        status === 'SUBSCRIBED'
      ) {
        console.log(
          '✅ CUSTOMER GLOBAL MESSAGE REALTIME CONNECTED'
        )
      }

      if (
        status === 'CHANNEL_ERROR'
      ) {
        console.error(
          '❌ CUSTOMER GLOBAL MESSAGE REALTIME CHANNEL ERROR'
        )
      }

      if (
        status === 'TIMED_OUT'
      ) {
        console.error(
          '❌ CUSTOMER GLOBAL MESSAGE REALTIME TIMED OUT'
        )
      }
    })

  return () => {
    console.log(
      '🧹 Removing CUSTOMER GLOBAL MESSAGE REALTIME channel'
    )

    supabase.removeChannel(
      unreadChannel
    )
  }

}, [
  currentAuthUserId,
  activeCustomerConversation?.id,
  showCustomerMessaging,
])

  // =========================================================
  // SEND CUSTOMER MESSAGE
  // =========================================================

  async function sendCustomerConversationMessage() {
    try {
      const messageText =
        customerChatMessage.trim()

      if (!messageText) {
        return
      }

      if (
        !activeCustomerConversation
      ) {
        alert(
          'No appointment conversation is open.'
        )

        return
      }

      if (!currentAuthUserId) {
        alert(
          'Your session could not be verified.'
        )

        return
      }

      const permission =
        await checkMessagingPermission(
          activeCustomerConversation.id,
          activeMessagingAppointment
        )

      if (!permission.allowed) {
        alert(
          permission.endAt
            ? `Messaging for this appointment ended on ${formatTimeOnly(
                permission.endAt
              )}.`
            : 'Messaging is currently unavailable for this appointment.'
        )

        return
      }

      setSendingMessage(true)

      const {
        data: newMessage,
        error: sendError,
      } = await supabase.rpc(
        'send_conversation_message',
        {
          p_conversation_id:
            activeCustomerConversation.id,

          p_message:
            messageText,

          p_reply_to_message_id:
            replyingToMessage?.id || null,
        }
      )

      if (sendError) {
        console.error(
          'Customer message send failed:',
          sendError
        )

        alert(
          `Failed to send message: ${sendError.message}`
        )

        setSendingMessage(false)

        return
      }

      if (newMessage) {
        setCustomerConversationMessages(
          currentMessages => {
            const exists =
              currentMessages.some(
                message =>
                  message.id ===
                  newMessage.id
              )

            if (exists) {
              return currentMessages
            }

            return [
              ...currentMessages,
              newMessage,
            ]
          }
        )

        await loadSenderProfiles([
          newMessage,
        ])
      }

      setCustomerChatMessage('')
      setReplyingToMessage(null)

      const {
        data: warrantyAllowed,
        error: warrantyError,
      } = await supabase.rpc(
        'can_send_appointment_message',
        {
          p_conversation_id:
            activeCustomerConversation.id,
        }
      )

      if (warrantyError) {
        console.error(
          'Customer messaging permission refresh failed:',
          warrantyError
        )
      } else {
        const endAt =
          getMessagingEndAt(
            activeMessagingAppointment
          )

        const expired =
          isMessagingExpired(
            endAt
          )

        setMessagingEndAt(
          endAt
        )

        setMessagingAllowed(
          warrantyAllowed === true &&
            !expired
        )
      }

      setSendingMessage(false)
    } catch (error) {
      console.error(
        'Unexpected customer message error:',
        error
      )

      alert(
        'Something went wrong while sending the message.'
      )

      setSendingMessage(false)
    }
  }

  // =========================================================
  // DELETE CUSTOMER MESSAGE
  // =========================================================

  async function deleteCustomerMessage(msg) {
    const confirmed =
      window.confirm(
        'Delete this message for everyone?'
      )

    if (!confirmed) {
      return
    }

    const {
      data: deletedMessage,
      error: deleteError,
    } = await supabase.rpc(
      'delete_conversation_message',
      {
        p_message_id:
          msg.id,
      }
    )

    if (deleteError) {
      console.error(
        'Customer message deletion failed:',
        deleteError
      )

      alert(
        `Failed to delete message: ${deleteError.message}`
      )

      return
    }

    const fallbackDeletedAt =
      new Date().toISOString()

    setCustomerConversationMessages(
      currentMessages =>
        currentMessages.map(
          currentMessage =>
            currentMessage.id === msg.id
              ? {
                  ...currentMessage,
                  ...(deletedMessage || {}),
                  deleted_at:
                    deletedMessage?.deleted_at ||
                    fallbackDeletedAt,
                  deleted_by:
                    deletedMessage?.deleted_by ||
                    currentAuthUserId,
                }
              : currentMessage
        )
    )

    if (
      replyingToMessage?.id ===
      msg.id
    ) {
      setReplyingToMessage(
        currentReply => ({
          ...currentReply,
          ...(deletedMessage || {}),
          deleted_at:
            deletedMessage?.deleted_at ||
            fallbackDeletedAt,
        })
      )
    }
  }

  // =========================================================
  // ONLINE / OFFLINE
  // =========================================================

  function isUserOnline(lastSeen) {
    if (!lastSeen) {
      return false
    }

    const lastSeenTime =
      new Date(lastSeen).getTime()

    if (
      Number.isNaN(
        lastSeenTime
      )
    ) {
      return false
    }

    return (
      Date.now() -
        lastSeenTime <=
      5 * 60 * 1000
    )
  }

  // =========================================================
  // UPDATE CUSTOMER LAST SEEN
  // =========================================================

  useEffect(() => {
    let interval

    async function updateLastSeen() {
      const {
        data: {
          user: authUser,
        },
      } = await supabase.auth.getUser()

      if (!authUser) {
        return
      }

      const now =
        new Date().toISOString()

      const {
        error,
      } = await supabase
        .from('users')
        .update({
          last_seen: now,
        })
        .eq(
          'id',
          authUser.id
        )

      if (error) {
        console.error(
          'Customer last_seen update failed:',
          error
        )

        return
      }

      setCurrentAuthUserId(
        authUser.id
      )
    }

    updateLastSeen()

    interval =
      setInterval(
        updateLastSeen,
        60 * 1000
      )

    return () => {
      clearInterval(interval)
    }
  }, [])

  // =========================================================
  // ELIGIBLE APPOINTMENTS
  // =========================================================

  const messageEligibleAppointments =
    useMemo(
      () =>
        appointments.filter(
          apt =>
            [
              'confirmed',
              'in_progress',
              'completed',
            ].includes(
              apt.status?.toLowerCase()
            )
        ),
      [appointments]
    )

  // =========================================================
  // TOTAL UNREAD
  // =========================================================

  const totalUnreadMessages =
    Object.values(
      unreadMessagesMap
    ).reduce(
      (total, count) =>
        total + Number(count || 0),
      0
    )

  // =========================================================
  // LOAD CONVERSATION MAP
  // =========================================================

  async function loadAppointmentConversationMap() {
    if (
      !messageEligibleAppointments.length
    ) {
      setAppointmentConversationMap({})
      return
    }

    const appointmentIds =
      messageEligibleAppointments.map(
        apt => apt.id
      )

    const {
      data,
      error,
    } = await supabase
      .from('conversations')
      .select(
        'id, appointment_id'
      )
      .in(
        'appointment_id',
        appointmentIds
      )

    if (error) {
      console.error(
        'Appointment conversation map failed:',
        error
      )
      return
    }

    const map = {}

    ;(data || []).forEach(
      conversation => {
        map[
          conversation.appointment_id
        ] = conversation.id
      }
    )

    setAppointmentConversationMap(
      map
    )
  }

  useEffect(() => {
    loadAppointmentConversationMap()
  }, [
    messageEligibleAppointments,
  ])

  function getAppointmentUnreadCount(
    appointmentId
  ) {
    const conversationId =
      appointmentConversationMap[
        appointmentId
      ]

    if (!conversationId) {
      return 0
    }

    return Number(
      unreadMessagesMap[
        conversationId
      ] || 0
    )
  }

  // =========================================================
  // OPEN LATEST CONVERSATION
  // =========================================================

  async function openLatestAppointmentConversation() {
    if (
      !messageEligibleAppointments.length
    ) {
      alert(
        'There is no appointment available for messaging yet.'
      )

      return
    }

    const unreadAppointment =
      messageEligibleAppointments.find(
        apt =>
          getAppointmentUnreadCount(
            apt.id
          ) > 0
      )

    const latestAppointment =
      unreadAppointment ||
      messageEligibleAppointments[0]

    await openCustomerAppointmentConversation(
      latestAppointment
    )
  }

  // =========================================================
  // CLOSE MESSAGING
  // =========================================================

  function closeCustomerMessaging() {
      previousMessageCountRef.current = 0
    previousConversationIdRef.current = null

    setShowCustomerMessaging(false)
    setReplyingToMessage(null)
    setCustomerChatMessage('')
  }

  // =========================================================
  // RENDER
  // =========================================================

  const activeAppointments =
    appointments.filter(
      apt =>
        [
          'pending',
          'confirmed',
          'in_progress',
        ].includes(
          apt.status?.toLowerCase()
        )
    )
  console.log('ALL APPOINTMENTS:', appointments)
  console.log('ACTIVE APPOINTMENT DATA:', activeAppointments[0])



















    

// =========================================================
// CUSTOMER NOTIFICATIONS
// =========================================================

// =========================================================
// MARK CUSTOMER NOTIFICATION AS READ
// CUSTOMER-SIDE ONLY
// =========================================================

async function markAsRead(id) {
  try {
    if (!user?.id) {
      console.error(
        '🚨 Cannot mark notification as read: customer user ID is missing.'
      )
      return false
    }

    console.log(
      '🔵 Marking CUSTOMER notification as read:',
      id,
      'customer:',
      user.id
    )

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
      .eq('id', id)
      .eq('recipient_id', user.id)
      .select('id, recipient_id, is_read')

    if (error) {
      console.error(
        '🚨 Customer notification read error:',
        error
      )
      return false
    }

    console.log(
      '✅ Customer notification read result:',
      data
    )

    if (!data || data.length === 0) {
      console.error(
        '🚨 Customer notification was not updated.',
        {
          notificationId: id,
          recipientId: user.id,
        }
      )

      return false
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id &&
        notification.recipient_id === user.id
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    )

    return true

  } catch (error) {
    console.error(
      '🚨 Unexpected customer notification error:',
      error
    )

    return false
  }
}

const handleClickNotification = async (notification) => {
  try {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    if (
      notification.type === 'appointment' ||
      notification.type === 'booking_status' ||
      notification.type === 'service_started' ||
      notification.type === 'service_completed' ||
      notification.type === 'message'
    ) {
      setShowNotifications(false)

      navigate('/customer/appointments', {
        state: {
          appointmentId: notification.appointment_id,
          openMessaging:
            notification.type === 'message',
        },
      })
    }

  } catch (error) {
    console.error(
      '🚨 Customer notification click error:',
      error
    )
  }
}





// =========================================================
// DELETE CUSTOMER NOTIFICATION
// CUSTOMER-SIDE ONLY
// =========================================================

async function deleteNotification(notificationId) {
  try {
    if (!user?.id) {
      console.error(
        '🚨 Cannot delete notification: customer user ID is missing.'
      )
      return false
    }

    console.log(
      '🔵 Deleting CUSTOMER notification:',
      notificationId,
      'customer:',
      user.id
    )

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('customer_id', user.id)
      .select('id, customer_id')

    if (error) {
      console.error(
        '🚨 Customer notification delete error:',
        error
      )
      return false
    }

    console.log(
      '✅ Customer notification delete result:',
      data
    )

    if (!data || data.length === 0) {
      console.error(
        '🚨 Customer notification was not deleted.',
        {
          notificationId,
          customerId: user.id,
        }
      )

      return false
    }

    setNotifications((current) =>
      current.filter(
        (notification) =>
          !(
            notification.id === notificationId &&
            notification.customer_id === user.id
          )
      )
    )

    return true

  } catch (error) {
    console.error(
      '🚨 Unexpected customer notification delete error:',
      error
    )

    return false
  }
}

// =========================================================
// CLEAR ALL CUSTOMER NOTIFICATIONS
// CUSTOMER-SIDE ONLY
// =========================================================

async function clearAllNotifications() {
  try {
    if (!user?.id) {
      console.error(
        '🚨 Cannot clear notifications: customer user ID is missing.'
      )
      return false
    }

    console.log(
      '🔵 Clearing ALL CUSTOMER notifications:',
      'customer:',
      user.id
    )

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('customer_id', user.id)
      .in('type', [
  'appointment',
  'booking_status',
  'service_started',
  'service_completed',
  'message',
])

      .select('id, customer_id')

    if (error) {
      console.error(
        '🚨 Customer clear all notifications error:',
        error
      )
      return false
    }

    console.log(
      '✅ Customer notifications cleared:',
      data
    )

    // =======================================================
    // REMOVE ONLY THE DELETED CUSTOMER NOTIFICATIONS
    // FROM LOCAL STATE
    // =======================================================

    const deletedIds = new Set(
      (data || []).map(
        (notification) =>
          notification.id
      )
    )

    setNotifications((current) =>
      current.filter(
        (notification) =>
          !deletedIds.has(notification.id)
      )
    )

    return true

  } catch (error) {
    console.error(
      '🚨 Unexpected customer clear all notifications error:',
      error
    )

    return false
  }
}





// =========================================================
// MARK ALL CUSTOMER NOTIFICATIONS AS READ
// CUSTOMER-SIDE ONLY
// =========================================================

async function markAllNotificationsAsRead() {
  try {
    if (!user?.id) {
      console.error(
        '🚨 Cannot mark all notifications as read: customer user ID is missing.'
      )
      return
    }

    const hasUnreadNotifications =
      notifications.some(
        (notification) =>
          notification.customer_id === user.id &&
          !notification.is_read
      )

    if (!hasUnreadNotifications) {
      return
    }

    console.log(
      '🔵 Marking ALL CUSTOMER notifications as read:',
      user.id
    )

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
      })
.eq('recipient_id', user.id)
      .eq('is_read', false)
      .select('id, customer_id, is_read')

    if (error) {
      console.error(
        '🚨 Mark all customer notifications error:',
        error
      )
      return
    }

    console.log(
      '✅ Customer notifications marked as read:',
      data
    )

    setNotifications((current) =>
      current.map((notification) =>
        notification.customer_id === user.id
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    )

  } catch (error) {
    console.error(
      '🚨 Unexpected mark-all-customer-read error:',
      error
    )
  }
}


// =====================================================
// CUSTOMER NOTIFICATION REALTIME
// =====================================================

useEffect(() => {

  if (!user?.id) {

    console.log(
      "🟡 Notification realtime waiting for user..."
    )

    return
  }

  const customerId = user.id

  const channelName =
    `customer-notifications-${customerId}`

  console.log(
    "🟢 CREATING CUSTOMER NOTIFICATION CHANNEL:",
    {
      customerId,
      channelName,
    }
  )

  const channel = supabase
    .channel(channelName)

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${customerId}`,
      },

      (payload) => {

        const notification =
          payload.new

        console.log(
          "🚨 CUSTOMER REALTIME NOTIFICATION RECEIVED 🚨",
          notification
        )


        // =================================================
        // PREVENT DUPLICATE PROCESSING
        // =================================================

        if (
          processedCustomerNotificationIdsRef.current.has(
            notification.id
          )
        ) {

          console.log(
            "ℹ️ Customer notification already processed:",
            notification.id
          )

          return
        }

        processedCustomerNotificationIdsRef.current.add(
          notification.id
        )


        // =================================================
        // VERIFY RECIPIENT
        // =================================================

        if (
          String(notification.recipient_id) !==
          String(customerId)
        ) {

          console.warn(
            "⚠️ Notification recipient mismatch:",
            {
              recipient_id:
                notification.recipient_id,

              currentCustomer:
                customerId,
            }
          )

          return
        }


        // =================================================
        // ADD NOTIFICATION
        // =================================================

        setNotifications(
          (previous) => {

            const alreadyExists =
              previous.some(
                (existingNotification) =>
                  String(
                    existingNotification.id
                  ) ===
                  String(
                    notification.id
                  )
              )

            if (alreadyExists) {

              console.log(
                "ℹ️ Notification already exists in state:",
                notification.id
              )

              return previous
            }

            console.log(
              "✅ Adding NEW customer notification:",
              notification.id
            )

            return [
              notification,
              ...previous,
            ]
          }
        )


        // =================================================
        // PLAY SOUND
        // =================================================

        const sound =
          notificationSoundRef.current

        if (!sound) {

          console.warn(
            "⚠️ CUSTOMER notification sound is not initialized."
          )

          return
        }

        sound.currentTime = 0
        sound.volume = 0.1
        sound.muted = false

        sound
          .play()
          .then(() => {

            console.log(
              "🔊 CUSTOMER notification sound played:",
              notification.title
            )

          })
          .catch((error) => {

            console.warn(
              "🔇 CUSTOMER notification sound could not play:",
              error?.name,
              error?.message
            )

          })
      }
    )

    .subscribe(
      (status, error) => {

        console.log(
          "📡 CUSTOMER NOTIFICATION REALTIME STATUS:",
          status
        )

        if (error) {

          console.error(
            "🚨 CUSTOMER NOTIFICATION REALTIME ERROR:",
            error
          )

        }

        if (
          status === "SUBSCRIBED"
        ) {

          console.log(
            "✅ CUSTOMER NOTIFICATION REALTIME READY"
          )

        }

      }
    )


  return () => {

    console.log(
      "🔴 REMOVING CUSTOMER NOTIFICATION CHANNEL:",
      channelName
    )

    supabase.removeChannel(
      channel
    )

  }

}, [user?.id])










const visibleNotifications =
  notifications.filter(
    notification =>
      notification.type === 'appointment' ||
      notification.type === 'booking_status' ||
      notification.type === 'service_started' ||
      notification.type === 'service_completed' ||
      notification.type === 'message'
  )

  useEffect(() => {
  const appointmentId =
    location.state?.appointmentId

  const openMessaging =
    location.state?.openMessaging

  if (!openMessaging) {
    return
  }

  if (!appointmentId) {
    return
  }

  if (!appointments?.length) {
    return
  }

  const appointment =
    appointments.find(
      apt =>
        String(apt.id) ===
        String(appointmentId)
    )

  if (!appointment) {
    console.warn(
      '⚠️ Appointment from notification not found:',
      appointmentId
    )

    return
  }

  console.log(
    '💬 Opening message notification appointment:',
    appointment
  )

  openCustomerAppointmentConversation(
    appointment
  )

  // Prevent reopening after refresh/back navigation.
  navigate(
    location.pathname,
    {
      replace: true,
      state: {},
    }
  )

}, [
  appointments,
  location.state,
])


const getNotificationStatus = (notification) => {
  const text = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (text.includes("reject")) return "rejected";
  if (text.includes("cancel")) return "cancelled";
  if (text.includes("complete")) return "completed";
  if (/\bconfirmed\b/.test(text)) return "approved";   // confirmed → green
  if (text.includes("approve")) return "approved";

  return null;
};

const notificationStatusStyles = {
  approved: {
    icon: "bg-gradient-to-br from-green-50 to-green-100 text-green-600 ring-green-200/50",
    rowUnread: "bg-green-50/70 hover:bg-green-50",
    rowRead: "bg-green-50/30 hover:bg-green-50/60",
    bar: "from-green-500 to-green-700",
    dot: "bg-green-600",
    text: "text-green-600",
  },
  completed: {
    icon: "bg-gradient-to-br from-green-50 to-green-100 text-green-600 ring-green-200/50",
    rowUnread: "bg-green-50/70 hover:bg-green-50",
    rowRead: "bg-green-50/30 hover:bg-green-50/60",
    bar: "from-green-500 to-green-700",
    dot: "bg-green-600",
    text: "text-green-600",
  },
  cancelled: {
    icon: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 ring-orange-200/50",
    rowUnread: "bg-orange-50/70 hover:bg-orange-50",
    rowRead: "bg-orange-50/30 hover:bg-orange-50/60",
    bar: "from-orange-400 to-orange-600",
    dot: "bg-orange-500",
    text: "text-orange-600",
  },
  rejected: {
    icon: "bg-gradient-to-br from-red-50 to-red-100 text-red-600 ring-red-200/50",
    rowUnread: "bg-red-50/70 hover:bg-red-50",
    rowRead: "bg-red-50/30 hover:bg-red-50/60",
    bar: "from-red-500 to-red-700",
    dot: "bg-red-600",
    text: "text-red-600",
  },
};




  return (
<div className="min-h-screen overflow-x-hidden bg-[#f6f7f9] text-slate-800">
    {/* =====================================================
        PREMIUM AUTOMOTIVE BACKGROUND
    ===================================================== */}

    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

      {/* Soft grid */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      {/* Red ambient glow */}
      <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-red-500/10 blur-3xl" />

      <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-slate-300/40 blur-3xl" />

      {/* Wavy automotive shapes */}
      <svg
        className="absolute left-0 top-0 h-[420px] w-full opacity-40"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <path
          d="M0 120C220 210 350 10 590 90C830 170 930 260 1180 130C1290 73 1370 82 1440 110V0H0Z"
          fill="#ffffff"
        />

        <path
          d="M0 210C240 290 390 100 620 150C850 200 1000 330 1210 200C1320 132 1380 150 1440 175V0H0Z"
          fill="#fee2e2"
          fillOpacity="0.35"
        />
      </svg>

      <svg
        className="absolute bottom-0 right-0 h-[360px] w-full opacity-30"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
      >
        <path
          d="M0 290C220 210 390 330 600 250C810 170 960 120 1170 210C1280 258 1370 245 1440 205V360H0Z"
          fill="#e2e8f0"
        />

        <path
          d="M0 320C250 230 390 360 630 285C850 216 1030 170 1210 250C1320 300 1390 290 1440 260V360H0Z"
          fill="#fecaca"
          fillOpacity="0.22"
        />
      </svg>
    </div>

    {/* =====================================================
        HEADER
    ===================================================== */}

<header className="relative z-10 w-full border-b border-slate-200/80 bg-white/90 text-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-2xl">      

<div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* BRAND */}

        <div className="flex min-w-0 items-center gap-3">

          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white shadow-lg shadow-red-500/20">

            <CarFront className="h-5 w-5" strokeWidth={2.2} />

            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/30" />

          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
              Alavaren Auto Electrical
            </p>

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Customer Service Portal
              </span>

            </div>

          </div>
        </div>

        {/* HEADER ACTIONS */}

        <div className="flex items-center gap-2 sm:gap-4">






          

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="relative z-[9999999]">

            <button
              type="button"
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
              className={`
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white/80
                text-slate-600
                shadow-sm
                transition-all
                duration-200
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-600
                active:scale-95

                sm:h-11
                sm:w-11

                ${
                  showNotifications
                    ? 'scale-95 border-red-200 bg-red-50 text-red-600 shadow-md'
                    : 'scale-100'
                }
              `}
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >

              <Bell
                className={`
                  h-4 w-4
                  transition-all
                  duration-200
                  sm:h-[18px] sm:w-[18px]

                  ${
                    notificationCount > 0
                      ? 'animate-pulse text-red-500'
                      : 'text-slate-600'
                  }

                  ${
                    showNotifications
                      ? 'scale-110'
                      : 'scale-100'
                  }
                `}
              />

              {notificationCount > 0 && (

                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-[18px]
                    min-w-[18px]
                    items-center
                    justify-center
                    rounded-full
                    bg-red-600
                    px-1
                    text-[9px]
                    font-black
                    text-white
                    shadow-sm
                    ring-2
                    ring-white
                    animate-[customerNotificationCountImpulse_1.5s_ease-in-out_infinite]
                    sm:h-5
                    sm:min-w-5
                    sm:text-[10px]
                  "
                >
                  {notificationCount > 99
                    ? '99+'
                    : notificationCount}
                </span>

              )}

            </button>

            {/* =================================================
                NOTIFICATION PANEL
            ================================================= */}

            {showNotifications && (

              <div
                className="
                  fixed
                  left-2
                  right-2
                  top-[4.25rem]
                  z-[999999999]
                  w-auto
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/70
                  bg-white/95
                  text-slate-800
                  shadow-[0_24px_80px_rgba(15,23,42,0.18)]
                  ring-1
                  ring-slate-200/70
                  backdrop-blur-2xl
                  origin-top-right
                  animate-[customerNotificationFloatingImpulse_280ms_cubic-bezier(0.16,1,0.3,1)]
                  max-h-[calc(100dvh-5rem)]
                  sm:left-auto
                  sm:right-3
                  sm:top-[4.5rem]
                  sm:w-[400px]
                  md:right-5
                  lg:right-6
                "
              >

                {/* NOTIFICATION HEADER */}

                <div className="shrink-0 border-b border-slate-100 bg-white/90 px-4 py-4 sm:px-5">

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-sm font-black text-slate-900 sm:text-base">
                          Notifications
                        </h3>

                        {notificationCount > 0 && (

                          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black text-red-600 sm:text-[10px]">
                            {notificationCount} unread
                          </span>

                        )}

                      </div>

                      <p className="mt-1 text-[11px] leading-4 text-slate-400 sm:text-xs">
                        Stay updated with your appointments
                      </p>

                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

                      {notificationCount > 0 && (

                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="
                            inline-flex
                            min-h-8
                            items-center
                            gap-1
                            rounded-lg
                            px-2
                            py-1.5
                            text-[9px]
                            font-bold
                            text-red-600
                            transition-all
                            duration-200
                            hover:bg-red-50
                            active:scale-95
                            sm:px-2.5
                            sm:text-[10px]
                          "
                        >

                          <Check
                            className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                          />

                          <span className="hidden xs:inline">
                            Mark all read
                          </span>

                          <span className="xs:hidden">
                            Read all
                          </span>

                        </button>

                      )}

                      {notifications.some(
  notification =>
    notification.type === 'appointment' ||
    notification.type === 'booking_status' ||
    notification.type === 'service_started' ||
    notification.type === 'service_completed' ||
    notification.type === 'message'
) && (


                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="
                            inline-flex
                            min-h-8
                            items-center
                            gap-1
                            rounded-lg
                            px-2
                            py-1.5
                            text-[9px]
                            font-bold
                            text-slate-400
                            transition-all
                            duration-200
                            hover:bg-red-50
                            hover:text-red-600
                            active:scale-95
                            sm:px-2.5
                            sm:text-[10px]
                          "
                          title="Clear all notifications"
                          aria-label="Clear all notifications"
                        >

                          <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />

                          <span className="hidden xs:inline">
                            Clear All
                          </span>

                          <span className="xs:hidden">
                            Clear
                          </span>

                        </button>

                      )}

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 sm:h-10 sm:w-10">

                        <Bell className="h-4 w-4 text-red-600 sm:h-[18px] sm:w-[18px]" />

                      </div>

                    </div>
                  </div>
                </div>

                {/* NOTIFICATION LIST */}

                <div className="min-h-0 max-h-[calc(100dvh-11rem)] overflow-y-auto overscroll-contain sm:max-h-[420px]">

                  {(() => {

                    const visibleNotifications =
  notifications.filter(
    notification =>
      notification.type === 'appointment' ||
      notification.type === 'booking_status' ||
      notification.type === 'service_started' ||
      notification.type === 'service_completed' ||
      notification.type === 'message'
  )


                    if (!visibleNotifications.length) {

                      return (
                        <div className="px-5 py-12 text-center sm:px-6">

                          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 animate-[customerNotificationEmptyImpulse_1.8s_ease-in-out_infinite] sm:h-16 sm:w-16">

                            <Bell className="h-6 w-6 sm:h-7 sm:w-7" />

                          </div>

                          <p className="font-bold text-slate-800">
                            No notifications yet
                          </p>

                          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-slate-400 sm:text-xs">
                            Updates about your appointments will appear here.
                          </p>

                        </div>
                      )
                    }

                    return visibleNotifications.map(
  notification => {

    const isUnread =
      !notification.is_read

    const isServiceStarted =
      notification.type === 'service_started'

    const isServiceCompleted =
      notification.type === 'service_completed'

    const isMessage =
      notification.type === 'message'

   const notificationStatus = isMessage || isServiceStarted
  ? null
  : isServiceCompleted
  ? 'completed'
  : getNotificationStatus(notification)

const statusStyle = notificationStatus
  ? notificationStatusStyles[notificationStatus]
  : null
const accent = statusStyle
  ? {
      dot: statusStyle.dot,
      text: statusStyle.text,
      bar: statusStyle.bar,
    }
    : isServiceStarted
  ? {
      dot: 'bg-yellow-500',
      text: 'text-yellow-600',
      bar: 'from-yellow-400 to-yellow-600',
    }
    : isMessage
  ? {
      dot: 'bg-blue-600',
      text: 'text-blue-600',
      bar: 'from-blue-500 to-blue-700',
    }
  : {
      dot: 'bg-blue-600',          // was red
      text: 'text-blue-600',       // was red
      bar: 'from-blue-500 to-blue-700',   // was red
    }
    return (
      <div
        key={notification.id}
        onClick={() =>
          handleClickNotification(notification)
        }
        className={`
          group
          relative
          cursor-pointer
          border-b
          border-slate-100
          px-4
          py-4
          transition-all
          duration-200
          ease-out
          hover:bg-slate-50
          active:scale-[0.995]
          sm:px-5

          ${
  statusStyle
    ? isUnread
      ? statusStyle.rowUnread
      : statusStyle.rowRead
          : isUnread
    ? isServiceStarted
      ? 'bg-yellow-50/60 hover:bg-yellow-50'
      : 'bg-blue-50/50 hover:bg-blue-50/70'
    : 'bg-white hover:bg-slate-50'
}
        `}
      >


                            
                            <div className="flex gap-3">

                              <div
  className={`
    flex
    h-10
    w-10
    shrink-0
    items-center
    justify-center
    rounded-xl
    transition-transform
    duration-200
    group-hover:scale-105
    sm:h-11
    sm:w-11

    ${
  statusStyle
    ? `${statusStyle.icon} shadow-sm ring-1`
        : isServiceStarted
    ? 'bg-yellow-50 text-yellow-600'
        : 'bg-blue-50 text-blue-600'
}
  `}
>
  {isServiceCompleted ? (
    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
  ) : isServiceStarted ? (
    <Wrench className="h-4 w-4 sm:h-5 sm:w-5" />
  ) : isMessage ? (
    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
  ) : (
    <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
  )}
</div>



                              

                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                  <p
                                    className={`
                                      min-w-0
                                      break-words
                                      text-xs
                                      leading-5
                                      sm:text-sm

                                      ${
                                        isUnread
                                          ? 'font-black text-slate-900'
                                          : 'font-semibold text-slate-700'
                                      }
                                    `}
                                  >
                                    {notification.title}
                                  </p>

                                  {isUnread && (

  <span
    className={`
      shrink-0
      rounded-full
      px-1.5
      py-0.5
      text-[8px]
      font-black
      tracking-wide
      text-white
      animate-pulse
      sm:px-2
      sm:text-[9px]

      ${accent.dot}
    `}
  >
    NEW
  </span>

)}

                                </div>

                                <p
                                  className={`
                                    mt-1
                                    break-words
                                    whitespace-pre-line
                                    text-[11px]
                                    leading-5
                                    sm:text-xs
                                    ${
                                      isUnread
                                        ? 'text-slate-600'
                                        : 'text-slate-500'
                                    }
                                  `}
                                >
                                  {notification.message
                                    ?.split('\n\n')
                                    .map((part, index) => {

                                      if (
                                        index === 0 &&
                                        part.startsWith('Appointment No.')
                                      ) {
                                        return (
                                          <span
                                            key={index}
                                            className="font-bold text-slate-900"
                                          >
                                            {part}
                                          </span>
                                        )
                                      }

                                      return (
                                        <span key={index}>
                                          {index > 0 && '\n\n'}
                                          {part}
                                        </span>
                                      )
                                    })}
                                </p>

                                <div className="mt-2.5 flex items-center justify-between gap-2">

                                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

                                    <span
  className={`
    h-1.5
    w-1.5
    shrink-0
    rounded-full

    ${isUnread ? accent.dot : 'bg-slate-300'}
  `}
/>

                                    <p className="truncate text-[9px] font-medium text-slate-400 sm:text-[10px]">
                                      {timeAgo(notification.created_at)}
                                    </p>

                                    <span
  className={`
    shrink-0
    text-[8px]
    font-black
    uppercase
    tracking-wide
    sm:text-[9px]

    ${isUnread ? accent.text : 'text-slate-400'}
  `}
>
                                      {isUnread
                                        ? 'Unread'
                                        : 'Read'}
                                    </span>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={e => {

                                      e.stopPropagation()

                                      deleteNotification(
                                        notification.id
                                      )

                                    }}
                                    className="
                                      inline-flex
                                      min-h-8
                                      shrink-0
                                      items-center
                                      gap-1
                                      rounded-lg
                                      px-2
                                      py-1.5
                                      text-[9px]
                                      font-semibold
                                      text-slate-400
                                      transition-all
                                      duration-200
                                      hover:bg-red-50
                                      hover:text-red-600
                                      active:scale-95
                                      sm:min-h-0
                                      sm:py-1
                                      sm:opacity-0
                                      sm:group-hover:opacity-100
                                    "
                                    title="Delete notification"
                                    aria-label="Delete notification"
                                  >

                                    <Trash2 className="h-3 w-3" />

                                    <span className="hidden sm:inline">
                                      Delete
                                    </span>

                                  </button>

                                </div>

                              </div>
                            </div>

                            {isUnread && (

  <span
    className={`
      absolute
      left-0
      top-0
      h-full
      w-1
      bg-gradient-to-b
      ${accent.bar}
    `}
  />

)}

                            

                          </div>
                        )
                      }
                    )

                  })()}

                </div>

                {/* FOOTER */}

                {(() => {

                  const visibleNotificationCount =
  notifications.filter(
    notification =>
      notification.type === 'appointment' ||
      notification.type === 'booking_status' ||
      notification.type === 'service_started' ||
      notification.type === 'service_completed' ||
      notification.type === 'message'
  ).length


                  if (!visibleNotificationCount) {
                    return null
                  }

                  return (
                    <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-[9px] font-medium text-slate-400 sm:text-[10px]">
                          {visibleNotificationCount}{' '}
                          {visibleNotificationCount === 1
                            ? 'notification'
                            : 'notifications'}
                        </p>

                        {notificationCount > 0 && (
                          <p className="text-[9px] font-bold text-red-600 sm:text-[10px]">
                            {notificationCount} unread
                          </p>
                        )}

                      </div>

                    </div>
                  )

                })()}

              </div>
            )}

          </div>











          {/* PROFILE */}

          <button
            type="button"
            onClick={() =>
              navigate('/customer/profile')
            }
            className="group flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
            title="View Profile"
          >

            {customerAvatar ? (

              <img
                src={customerAvatar}
                alt={
                  customerName ||
                  'Customer'
                }
                className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-md ring-1 ring-slate-200 transition group-hover:ring-red-300"
              />

            ) : (

              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-xs font-black text-red-700">
                {customerInitials}
              </div>

            )}

            <div className="hidden text-left leading-tight md:block">

              <p className="text-xs font-black text-slate-800">
                {customerName || 'Customer'}
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                {customerRole}
              </p>

            </div>

          </button>

          {/* LOGOUT */}

          <button
            onClick={() =>
              supabase.auth
                .signOut()
                .then(() =>
                  navigate('/')
                )
            }
            className="
              hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-xs
              font-bold
              text-slate-600
              shadow-sm
              transition
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              sm:block
            "
          >
            Sign out
          </button>

        </div>
      </div>
    </header>

    {/* =====================================================
        MAIN
    ===================================================== */}

    <main className="relative z-0 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

      {/* ===================================================
          PREMIUM HERO
      =================================================== */}

      <section className="relative mb-7 overflow-hidden rounded-[30px] border border-white/80 bg-white/80 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl">

        {/* WAVE */}

        <svg
          className="absolute inset-x-0 bottom-0 h-32 w-full opacity-70"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120C190 50 310 160 520 105C730 50 830 15 1040 75C1230 130 1320 85 1440 45V180H0Z"
            fill="#fef2f2"
          />

          <path
            d="M0 145C210 80 340 185 570 125C790 68 900 48 1080 98C1240 142 1350 110 1440 80V180H0Z"
            fill="#fee2e2"
            fillOpacity="0.7"
          />
        </svg>

        {/* Decorative glows */}

        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />

        {/* Accent line */}

        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-400 via-red-600 to-red-800" />

        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">

          <div className="max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 backdrop-blur">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">
                Service center online
              </span>

            </div>

            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-red-600">
              CUSTOMER DASHBOARD
            </p>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">

              Welcome,{' '}

              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                {customerName || 'Customer'}
              </span>

              .

            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Everything you need to manage your vehicle service,
              follow live repairs, and stay connected with our team.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">

                <CarFront className="h-4 w-4 text-red-500" />

                Vehicle care

              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">

                <Radio className="h-4 w-4 text-red-500" />

                Live updates

              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur">

                <MessageCircle className="h-4 w-4 text-red-500" />

                Direct messaging

              </div>

            </div>

          </div>

          {/* =================================================
              BOOK APPOINTMENT
              ORIGINAL STYLE RETAINED
          ================================================= */}

          <button
            onClick={() =>
              navigate('/customer/booking')
            }
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#E74C3C] to-[#C0392B] px-6 py-4 text-sm font-black text-white shadow-xl shadow-red-500/20 transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >

            <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />

            <CalendarPlus className="relative h-5 w-5" />

            <span className="relative">
              + Book Appointment
            </span>

            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />

          </button>

        </div>
      </section>

      <AnnouncementBanner />



      

      
{/* ===================================================
    PREMIUM SUMMARY CARDS
    MOBILE  = HORIZONTAL CAROUSEL
    DESKTOP = STATIC 3-COLUMN GRID
    UI ONLY — NO LOGIC CHANGED
=================================================== */}

<section className="mb-8">

  {/* =================================================
      MOBILE — HORIZONTAL CAROUSEL
  ================================================= */}

  <div className="sm:hidden">

    <div
      ref={summaryScrollRef}
      onScroll={(e) => {
        const container = e.currentTarget

        const cardWidth =
          container.clientWidth * 0.86 + 12

        const index = Math.round(
          container.scrollLeft / cardWidth
        )

        setActiveSummaryCard(
          Math.max(0, Math.min(2, index))
        )
      }}
      className="
        flex
        snap-x
        snap-mandatory
        gap-3
        overflow-x-auto
        overscroll-x-contain
        px-1
        pb-3
        pt-1
        scrollbar-none
      "
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >

      {/* =================================================
          UPCOMING SERVICES
      ================================================= */}

      <div
        className="
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-amber-100
          bg-white
          p-4
          shadow-[0_10px_35px_rgba(245,158,11,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
        "
      >

        {/* Glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-amber-100
            via-yellow-50
            to-transparent
            opacity-90
          "
        />

        {/* Bottom accent */}

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-amber-400
            to-orange-600
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-amber-500
                  shadow-[0_0_8px_rgba(245,158,11,0.7)]
                "
              />

              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-amber-600
                "
              >
                Upcoming Services
              </p>

            </div>

            <h3
              className="
                text-[34px]
                font-black
                leading-none
                tracking-[-0.04em]
                text-slate-950
              "
            >
              {upcomingAppointments}
            </h3>

            <p
              className="
                mt-2
                text-[11px]
                font-semibold
                leading-4
                text-slate-400
              "
            >
              Pending or active services
            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-amber-400
              to-orange-600
              text-white
              shadow-[0_8px_20px_rgba(245,158,11,0.30)]
              ring-1
              ring-amber-400/30
            "
          >

            <Clock3
              className="h-5 w-5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          UNREAD MESSAGES
      ================================================= */}

      <div
        className="
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-red-100
          bg-white
          p-4
          shadow-[0_10px_35px_rgba(220,38,38,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
        "
      >

        {/* Glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-red-100
            via-rose-50
            to-transparent
            opacity-90
          "
        />

        {/* Bottom accent */}

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-red-500
            to-rose-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-red-500
                  shadow-[0_0_8px_rgba(239,68,68,0.7)]
                "
              />

              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-red-500
                "
              >
                Unread Messages
              </p>

            </div>

            <h3
              className="
                text-[34px]
                font-black
                leading-none
                tracking-[-0.04em]
                text-slate-950
              "
            >
              {totalUnreadMessages}
            </h3>

            <p
              className="
                mt-2
                text-[11px]
                font-semibold
                leading-4
                text-slate-400
              "
            >
              Messages waiting for you
            </p>

          </div>

          <div
            className="
              relative
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-red-500
              to-rose-700
              text-white
              shadow-[0_8px_20px_rgba(220,38,38,0.30)]
              ring-1
              ring-red-400/30
            "
          >

            <MessageCircle
              className="h-5 w-5"
              strokeWidth={2.5}
            />

            {totalUnreadMessages > 0 && (

              <span
                className="
                  absolute
                  -right-2
                  -top-2
                  flex
                  h-6
                  min-w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-red-600
                  px-1.5
                  text-[10px]
                  font-black
                  text-white
                  shadow-lg
                  ring-2
                  ring-white
                "
              >
                {totalUnreadMessages > 99
                  ? '99+'
                  : totalUnreadMessages}
              </span>

            )}

          </div>

        </div>

      </div>


      {/* =================================================
          TOTAL APPOINTMENTS
      ================================================= */}

      <div
        className="
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-slate-200
          bg-white
          p-4
          shadow-[0_10px_35px_rgba(15,23,42,0.08)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
        "
      >

        {/* Glow */}

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-slate-200
            via-slate-100
            to-transparent
            opacity-90
          "
        />

        {/* Bottom accent */}

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-slate-500
            to-slate-900
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-slate-500
                  shadow-[0_0_8px_rgba(100,116,139,0.6)]
                "
              />

              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >
                Total Appointments
              </p>

            </div>

            <h3
              className="
                text-[34px]
                font-black
                leading-none
                tracking-[-0.04em]
                text-slate-950
              "
            >
              {appointments.length}
            </h3>

            <p
              className="
                mt-2
                text-[11px]
                font-semibold
                leading-4
                text-slate-400
              "
            >
              Your service history
            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-slate-600
              to-slate-900
              text-white
              shadow-[0_8px_20px_rgba(15,23,42,0.28)]
              ring-1
              ring-slate-400/30
            "
          >

            <ClipboardList
              className="h-5 w-5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>

    </div>


    {/* =================================================
        MOBILE PAGINATION
    ================================================= */}

    <div className="mt-3 flex flex-col items-center">

      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-slate-200
          bg-white
          px-3
          py-2
          shadow-[0_4px_15px_rgba(15,23,42,0.07)]
        "
      >

        {[0, 1, 2].map((index) => (

          <button
            key={index}
            type="button"
            aria-label={`Go to summary card ${index + 1}`}
            onClick={() => {

              const container =
                summaryScrollRef.current

              if (!container) return

              const cardWidth =
                container.clientWidth * 0.86 + 12

              container.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth',
              })

              setActiveSummaryCard(index)
            }}
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              transition-all
              duration-300
              active:scale-90
            "
          >

            <span
              className={`
                block
                rounded-full
                transition-all
                duration-300

                ${
                  activeSummaryCard === index
                    ? `
                      h-1.5
                      w-6
                      bg-slate-900
                      shadow-[0_0_8px_rgba(15,23,42,0.25)]
                    `
                    : `
                      h-1.5
                      w-1.5
                      bg-slate-300
                    `
                }
              `}
            />

          </button>

        ))}

      </div>

      <p
        className="
          mt-2
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-slate-400
        "
      >
        Swipe to explore
      </p>

    </div>

  </div>


  {/* =================================================
      TABLET / DESKTOP — STATIC
  ================================================= */}

  <div
    className="
      hidden
      sm:grid
      sm:grid-cols-2
      lg:grid-cols-3
      sm:gap-4
      lg:gap-5
    "
  >

    {/* =================================================
        UPCOMING SERVICES
    ================================================= */}

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-amber-100
        bg-white
        p-5
        shadow-[0_10px_35px_rgba(245,158,11,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(245,158,11,0.15)]
        sm:p-6
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-amber-100
          via-yellow-50
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-amber-400
          to-orange-600
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-600">
            Upcoming Services
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {upcomingAppointments}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Pending or active services
          </p>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-amber-400
            to-orange-600
            text-white
            shadow-[0_8px_20px_rgba(245,158,11,0.28)]
            ring-1
            ring-amber-400/30
            transition-transform
            duration-300
            group-hover:scale-110
          "
        >

          <Clock3
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>


    {/* =================================================
        UNREAD MESSAGES
    ================================================= */}

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-red-100
        bg-white
        p-5
        shadow-[0_10px_35px_rgba(220,38,38,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(220,38,38,0.15)]
        sm:p-6
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-red-100
          via-rose-50
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-red-500
          to-rose-700
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-red-500">
            Unread Messages
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {totalUnreadMessages}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Messages waiting for you
          </p>

        </div>

        <div
          className="
            relative
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-red-500
            to-rose-700
            text-white
            shadow-[0_8px_20px_rgba(220,38,38,0.28)]
            ring-1
            ring-red-400/30
            transition-transform
            duration-300
            group-hover:scale-110
          "
        >

          <MessageCircle
            className="h-6 w-6"
            strokeWidth={2.5}
          />

          {totalUnreadMessages > 0 && (

            <span
              className="
                absolute
                -right-2
                -top-2
                flex
                h-6
                min-w-6
                items-center
                justify-center
                rounded-full
                bg-red-600
                px-1.5
                text-[10px]
                font-black
                text-white
                shadow-lg
                ring-2
                ring-white
              "
            >
              {totalUnreadMessages > 99
                ? '99+'
                : totalUnreadMessages}
            </span>

          )}

        </div>

      </div>

    </div>


    {/* =================================================
        TOTAL APPOINTMENTS
    ================================================= */}

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_10px_35px_rgba(15,23,42,0.07)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]
        sm:p-6
      "
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-slate-200
          via-slate-100
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-slate-500
          to-slate-900
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
            Total Appointments
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {appointments.length}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Your service history
          </p>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-slate-600
            to-slate-900
            text-white
            shadow-[0_8px_20px_rgba(15,23,42,0.25)]
            ring-1
            ring-slate-400/30
            transition-transform
            duration-300
            group-hover:scale-110
          "
        >

          <ClipboardList
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>

  </div>

</section>










      <AccountStatusCard />

      {/* ===================================================
          LIVE SERVICE PROGRESS
      =================================================== */}

      <section className="mb-10">

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Live Service Progress
              </h2>

              <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

                Live

              </span>

            </div>

            <p className="mt-1.5 text-sm text-slate-500">
              Follow your vehicle service in real time.
            </p>

          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

            Updates automatically

          </div>

        </div>

        {activeAppointments.length === 0 ? (

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-10 text-center shadow-sm backdrop-blur-xl">

            <div className="absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-red-100/60 blur-3xl" />

            <div className="relative">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">

                <CircleCheckBig className="h-8 w-8" />

              </div>

              <h3 className="font-black text-slate-800">
                No active service
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Your active appointment progress will appear here automatically.
              </p>

              <button
                onClick={() =>
                  navigate('/customer/booking')
                }
                className="mt-5 rounded-xl bg-[#C0392B] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-900/20 transition hover:-translate-y-0.5 hover:bg-[#922B21]"
              >
                Book a Service →
              </button>

            </div>
          </div>

        ) : (

          <div className="space-y-6">

            {activeAppointments.map(apt => {

              const safeAppointmentId =
                Number(apt.id) || 0

              const appointmentNumber =
                `APPT-${String(
                  safeAppointmentId
                ).padStart(6, '0')}`

              const currentIndex =
                getProgressIndex(
                  apt.status
                )

              const messagingState =
                getAppointmentMessagingState(
                  apt
                )

              const unreadCount =
                getAppointmentUnreadCount(
                  apt.id
                )

              const isInProgress =
                apt.status?.toLowerCase() ===
                'in_progress'

              return (

                <div
                  key={`progress-${apt.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_15px_50px_rgba(15,23,42,0.07)] backdrop-blur-xl transition duration-300 hover:shadow-2xl"
                >

                  {/* PREMIUM ACCENT */}

                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      h-full
                      w-1

                      ${
                        isInProgress
                          ? 'bg-gradient-to-b from-red-400 via-red-500 to-red-700'
                          : 'bg-gradient-to-b from-red-500 to-red-800'
                      }
                    `}
                  />

                  {/* CARD HEADER */}

                  <div className="p-5 sm:p-6">

                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600">
                            Current Appointment
                          </span>

                          {isInProgress && (

                            <span className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-red-700">

                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

                              Technician working

                            </span>

                          )}

                        </div>

                        <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
                          {apt.service_type ||
                            'Vehicle Service'}
                        </h3>

                        <div className="mt-2 text-xs font-black tracking-wider text-slate-500">
                          {appointmentNumber}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">

                          <span className="flex items-center gap-1.5">

                            <CalendarDays className="h-3.5 w-3.5 text-red-500" />

                            {apt.appointment_date}

                          </span>

                          <span className="flex items-center gap-1.5">

                            <Clock3 className="h-3.5 w-3.5 text-red-500" />

                            {apt.appointment_time
                              ? new Date(
                                  `2000-01-01T${apt.appointment_time}`
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: 'numeric',
                                    minute:
                                      '2-digit',
                                    hour12:
                                      true,
                                  }
                                )
                              : 'No time set'}

                          </span>

                        </div>

                        {/* VEHICLE INFORMATION */}

{(apt.vehicle_model ||
  apt.plate_number ||
  apt.fuel_type ||
  apt.battery_voltage ||
  apt.transmission_type) && (

  <div className="mt-3 space-y-2">

    {/* VEHICLE + PLATE */}

    {(apt.vehicle_model || apt.plate_number) && (
      <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-600">

        <CarFront className="h-4 w-4 shrink-0 text-red-500" />

        {apt.vehicle_model && (
          <span className="break-words">
            {apt.vehicle_model}
          </span>
        )}

        {apt.vehicle_model && apt.plate_number && (
          <span className="text-slate-300">
            •
          </span>
        )}

        {apt.plate_number && (
          <span className="break-words">
            {apt.plate_number}
          </span>
        )}

      </div>
    )}

    {/* NEW VEHICLE DETAILS */}

    {(apt.fuel_type ||
      apt.battery_voltage ||
      apt.transmission_type) && (

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

        {/* FUEL TYPE */}

        {apt.fuel_type && (
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">

            <span className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-400">
              Fuel Type
            </span>

            <span className="min-w-0 truncate text-right text-xs font-bold text-slate-700">
              {apt.fuel_type}
            </span>

          </div>
        )}

        {/* BATTERY VOLTAGE */}

        {apt.battery_voltage && (
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">

            <span className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-400">
              Battery
            </span>

            <span className="min-w-0 truncate text-right text-xs font-bold text-slate-700">
              {apt.battery_voltage}
            </span>

          </div>
        )}

        {/* TRANSMISSION */}

        {apt.transmission_type && (
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">

            <span className="shrink-0 text-[10px] font-black uppercase tracking-wide text-slate-400">
              Transmission
            </span>

            <span className="min-w-0 truncate text-right text-xs font-bold text-slate-700">
              {apt.transmission_type}
            </span>

          </div>
        )}

      </div>
    )}

  </div>
)}
                      </div>

                      <div className="flex items-center gap-2">

                        <span
                          className={`
                            rounded-full
                            border
                            px-3.5
                            py-2
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wider

                            ${
                              statusColor[
                                apt.status?.toLowerCase()
                              ] ||
                              'border-slate-200 bg-slate-50 text-slate-700'
                            }
                          `}
                        >
                          {apt.status?.replace(
                            '_',
                            ' '
                          ) || 'Unknown'}
                        </span>

                        {[
                          'confirmed',
                          'in_progress',
                          'completed',
                        ].includes(
                          apt.status?.toLowerCase()
                        ) && (

                          <button
                            type="button"
                            onClick={() =>
                              openCustomerAppointmentConversation(
                                apt
                              )
                            }
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition duration-200 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-lg"
                            title="Open appointment messages"
                          >

                            <MessageCircle className="h-4 w-4" />

                            {unreadCount > 0 && (

                              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[9px] font-black text-white shadow">

                                {unreadCount > 99
                                  ? '99+'
                                  : unreadCount}

                              </span>

                            )}

                          </button>

                        )}

                      </div>
                    </div>

                    {/* MESSAGE AVAILABILITY */}

                    {[
                      'confirmed',
                      'in_progress',
                      'completed',
                    ].includes(
                      apt.status?.toLowerCase()
                    ) && (

                      <button
                        type="button"
                        onClick={() =>
                          openCustomerAppointmentConversation(
                            apt
                          )
                        }
                        className={`
                          mt-5
                          flex
                          w-full
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          p-4
                          text-left
                          transition
                          duration-200

                          ${
                            messagingState.ended
                              ? 'border-red-200 bg-red-50 hover:bg-red-100'
                              : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50'
                          }
                        `}
                      >

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            flex-shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            shadow-sm

                            ${
                              messagingState.ended
                                ? 'text-red-600'
                                : 'text-emerald-600'
                            }

                            ${
                              !messagingState.ended
                                ? 'animate-pulse'
                                : ''
                            }
                          `}
                        >

                          {messagingState.ended ? (
                            <LockKeyhole className="h-4 w-4" />
                          ) : (
                            <MessageCircle className="h-4 w-4" />
                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p
                              className={`
                                text-xs
                                font-black

                                ${
                                  messagingState.ended
                                    ? 'text-red-700'
                                    : 'text-emerald-700'
                                }
                              `}
                            >
                              {messagingState.label}
                            </p>

                            {unreadCount > 0 && (

                              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                                {unreadCount} unread
                              </span>

                            )}

                          </div>

                          <p
                            className={`
                              mt-1
                              text-[11px]
                              leading-5

                              ${
                                messagingState.ended
                                  ? 'text-red-600'
                                  : 'text-emerald-700'
                              }
                            `}
                          >
                            {messagingState.description}
                          </p>

                        </div>

                        <span className="hidden text-[10px] font-black text-slate-400 sm:block">
                          VIEW →
                        </span>

                      </button>

                    )}

                    {/* =================================================
                        PROGRESS TRACKER
                    ================================================= */}

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-6">

                      <div className="mb-5 flex items-center justify-between">

                        <div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Service Journey
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            Real-time repair status
                          </p>

                        </div>

                        {isInProgress && (

                          <span className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-red-700">

                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />

                            Working now

                          </span>

                        )}

                      </div>

                      <div className="relative">

                        {/* DESKTOP CONNECTING LINE */}

                        <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-1 overflow-hidden rounded-full bg-slate-200 sm:block">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-red-500 transition-all duration-700"
                            style={{
                              width:
                                currentIndex <= 0
                                  ? '0%'
                                  : `${Math.min(
                                      currentIndex /
                                        (progressStages.length - 1),
                                      1
                                    ) * 100}%`,
                            }}
                          />

                        </div>

                        <div className="relative grid grid-cols-4 gap-2">

                          {progressStages.map(
                            (
                              stage,
                              index
                            ) => {

                              const isCompleted =
                                currentIndex >
                                index

                              const isCurrent =
                                currentIndex ===
                                index

                              const isAppointmentCompleted =
                                apt.status?.toLowerCase() ===
                                'completed'

                              const done =
                                isCompleted ||
                                isAppointmentCompleted

                              return (

                                <div
                                  key={stage.key}
                                  className="flex flex-col items-center text-center"
                                >

                                  <div
                                    className={`
                                      relative
                                      flex
                                      h-14
                                      w-14
                                      items-center
                                      justify-center
                                      rounded-full
                                      border-4
                                      bg-white
                                      shadow-lg
                                      transition-all
                                      duration-500

                                      ${
                                        done
                                          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-emerald-100'
                                          : isCurrent
                                          ? 'border-red-500 bg-red-50 text-red-600 shadow-red-100'
                                          : 'border-slate-200 bg-slate-100 text-slate-400 shadow-slate-100'
                                      }
                                    `}
                                  >

                                    {isCurrent &&
                                      !done && (
                                        <span className="absolute -inset-2 animate-ping rounded-full border border-red-300/50" />
                                      )}

                                    <Settings
                                      className={`
                                        relative
                                        h-5
                                        w-5

                                        ${
                                          isCurrent &&
                                          !isAppointmentCompleted
                                            ? 'animate-spin'
                                            : ''
                                        }
                                      `}
                                    />

                                    {done && (

                                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">

                                        <Check className="h-3 w-3" />

                                      </span>

                                    )}

                                  </div>

                                  <p
                                    className={`
                                      mt-3
                                      text-[10px]
                                      font-black
                                      sm:text-xs

                                      ${
                                        done
                                          ? 'text-emerald-600'
                                          : isCurrent
                                          ? 'text-red-600'
                                          : 'text-slate-400'
                                      }
                                    `}
                                  >
                                    {stage.label}
                                  </p>

                                  {isCurrent &&
                                    !done && (
                                      <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-red-500">
                                        Current
                                      </span>
                                    )}

                                  {done &&
                                    !isCurrent && (
                                      <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                        Done
                                      </span>
                                    )}

                                  {isAppointmentCompleted &&
                                    index ===
                                      progressStages.length - 1 && (
                                      <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                                        Finished
                                      </span>
                                    )}

                                </div>
                              )
                            }
                          )}

                        </div>

                      </div>
                    </div>

                    {/* CURRENT STATUS */}

                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">

                      <div className="flex items-start gap-4 p-4">

                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">

                          <Info className="h-5 w-5" />

                        </div>

                        <div>

                          <p className="text-sm font-black text-slate-800">

                            {isInProgress
                              ? 'Service in progress'
                              : apt.status?.toLowerCase() ===
                                'confirmed'
                              ? 'Appointment confirmed'
                              : 'Appointment received'}

                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {getAppointmentMessage(apt)}
                          </p>

                        </div>

                      </div>
                    </div>

                    {/* CANCELLATION */}

                    {apt.status?.toLowerCase() ===
                      'cancelled' && (

                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">

                        <div className="flex items-center gap-2">

                          <CircleX className="h-4 w-4 text-red-600" />

                          <p className="text-sm font-black text-red-700">
                            Appointment Cancelled
                          </p>

                        </div>

                        {apt.cancelled_at && (
                          <p className="mt-2 text-xs text-red-600">
                            Cancelled:{' '}
                            {formatDateTime(
                              apt.cancelled_at
                            )}
                          </p>
                        )}

                       {(
  apt.rejection_reason ||
  apt.cancellation_reason
) && (
  <div
    className={`mt-3 w-full min-w-0 overflow-hidden rounded-xl border p-3 sm:p-4 ${
      apt.rejection_reason
        ? 'border-red-100 bg-red-50/50'
        : 'border-orange-100 bg-orange-50/50'
    }`}
  >

    <p
      className={`text-[9px] font-black uppercase tracking-wider ${
        apt.rejection_reason
          ? 'text-red-500'
          : 'text-orange-600'
      }`}
    >
      {apt.rejection_reason
        ? 'Rejection Reason'
        : 'Cancellation Reason'}
    </p>

    <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
      {apt.rejection_reason ||
        apt.cancellation_reason}
    </p>

  </div>
)}



                      </div>

                    )}

                    {/* COMPLETION */}

                    {apt.status?.toLowerCase() ===
                      'completed' &&
                      apt.completed_at && (

                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                        <div className="flex items-center gap-2">

                          <CircleCheckBig className="h-4 w-4 text-emerald-600" />

                          <p className="text-sm font-black text-emerald-700">
                            Service Completed
                          </p>

                        </div>

                        <p className="mt-1 text-xs text-emerald-600">
                          Completed:{' '}
                          {formatDateTime(
                            apt.completed_at
                          )}
                        </p>

                      </div>

                    )}

                    {/* HISTORY */}

<AppointmentProgressHistory
  history={
    progressHistory[
      apt.id
    ] || []
  }
  appointment={apt}
/>


                  </div>
                </div>
              )
            })}

          </div>
        )}

      </section>

    </main>

    

    {/* =====================================================
        CUSTOMER MESSAGING MODAL
    ===================================================== */}

    {showCustomerMessaging && (

      <div
        className="fixed inset-0 z-[100] flex items-end justify-end bg-slate-950/35 p-3 pb-28 backdrop-blur-md sm:p-6 sm:pb-28"
        onClick={closeCustomerMessaging}
      >

        <div
          className="mb-0 flex h-[min(680px,calc(100vh-7rem))] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_30px_100px_rgba(15,23,42,0.25)] backdrop-blur-2xl"
          onClick={e =>
            e.stopPropagation()
          }
        >

          {/* ===================================================== 
    FLOATING BACK BUTTON 
    BELOW MAIN HEADER - UPPER LEFT 
===================================================== */} 
<button 
  type="button" 
  onClick={() => {
    setShowCustomerMessaging(false)
  }}
  aria-label="Back" 
  title="Back" 
  className=" 
    fixed 
    left-4 
    top-[140px] 
    z-[60] 
    flex 
    h-11 
    w-11 
    items-center 
    justify-center 
    rounded-full 
    border 
    border-slate-200 
    bg-white 
    text-slate-700 
    shadow-[0_8px_25px_rgba(15,23,42,0.18)] 
    ring-1 
    ring-black/5 
    transition-all 
    duration-200 
    hover:-translate-y-0.5 
    hover:border-red-200 
    hover:bg-red-50 
    hover:text-red-600 
    active:scale-95 
    sm:left-5 
    sm:top-[96px] 
    md:left-6 
  " 
> 
  <ArrowLeft size={20} strokeWidth={2.5} /> 
</button>

          {/* CHAT HEADER */}

          <div className="relative overflow-hidden border-b border-red-100 bg-white px-5 py-4">

            <div className="absolute -right-10 -top-20 h-40 w-40 rounded-full bg-red-100 blur-3xl" />

            <div className="relative flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white shadow-lg shadow-red-500/20">

                  <MessageCircle className="h-5 w-5" />

                  {activeCustomerConversation &&
                    unreadMessagesMap[
                      activeCustomerConversation.id
                    ] > 0 && (

                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1 text-[9px] font-black text-red-950">

                        {unreadMessagesMap[
                          activeCustomerConversation.id
                        ] > 99
                          ? '99+'
                          : unreadMessagesMap[
                              activeCustomerConversation.id
                            ]}

                      </span>

                    )}

                </div>

                <div>

                  <h3 className="text-sm font-black text-slate-900">
                    Appointment Messages
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {activeMessagingAppointment?.service_type ||
                      'Service conversation'}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeCustomerMessaging}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Close messages"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          </div>

          {/* APPOINTMENT INFO */}

          {activeMessagingAppointment && (

            <div className="border-b border-slate-100 bg-white px-5 py-3">

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">

                <span className="flex items-center gap-1">

                  <CalendarDays className="h-3 w-3 text-red-500" />

                  {activeMessagingAppointment.appointment_date}

                </span>

                {activeMessagingAppointment.appointment_time && (

                  <span className="flex items-center gap-1">

                    <Clock3 className="h-3 w-3 text-red-500" />

                    {new Date(
                      `2000-01-01T${activeMessagingAppointment.appointment_time}`
                    ).toLocaleTimeString(
                      [],
                      {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }
                    )}

                  </span>

                )}

                <span
                  className={`
                    rounded-full
                    border
                    px-2
                    py-1
                    font-black
                    uppercase

                    ${
                      statusColor[
                        activeMessagingAppointment.status?.toLowerCase()
                      ] ||
                      'border-slate-200 bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  {
                    activeMessagingAppointment.status?.replace(
                      '_',
                      ' '
                    )
                  }
                </span>

              </div>

            </div>
          )}

          {/* EXPIRY */}

          {activeMessagingAppointment &&
            messagingEndAt && (

              <div
                className={`
                  border-b
                  px-4
                  py-3

                  ${
                    messagingAllowed
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                  }
                `}
              >

                <div className="flex items-start gap-3">

                  <div
                    className={`
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white

                      ${
                        messagingAllowed
                          ? 'text-emerald-600'
                          : 'text-red-600'
                      }
                    `}
                  >

                    {messagingAllowed ? (
                      <MessageCircle className="h-4 w-4" />
                    ) : (
                      <LockKeyhole className="h-4 w-4" />
                    )}

                  </div>

                  <div>

                    <p
                      className={`
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide

                        ${
                          messagingAllowed
                            ? 'text-emerald-700'
                            : 'text-red-700'
                        }
                      `}
                    >
                      {messagingAllowed
                        ? 'Messaging available'
                        : 'Messaging period ended'}
                    </p>

                    <p
                      className={`
                        mt-0.5
                        text-[10px]
                        leading-5

                        ${
                          messagingAllowed
                            ? 'text-emerald-700'
                            : 'text-red-600'
                        }
                      `}
                    >
                      {messagingAllowed
                        ? `You can send messages until ${formatTimeOnly(
                            messagingEndAt
                          )}.`
                        : `Messaging ended on ${formatTimeOnly(
                            messagingEndAt
                          )}.`}
                    </p>

                  </div>
                </div>
              </div>
            )}

          {/* LOADING */}

          {messagingLoading ? (

            <div className="flex flex-1 items-center justify-center bg-slate-50">

              <div className="text-center">

                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

                  <MessageCircle className="h-6 w-6 animate-pulse" />

                  <span className="absolute -inset-1 animate-ping rounded-2xl border border-red-200" />

                </div>

                <p className="text-sm font-black text-slate-700">
                  Loading conversation...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Connecting securely.
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* MESSAGES */}

              <div className="flex-1 overflow-y-auto bg-[#f6f7f9] p-4">

                {customerConversationMessages.length === 0 ? (

                  <div className="flex h-full items-center justify-center text-center">

                    <div>

                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">

                        <MessageCircle className="h-6 w-6" />

                      </div>

                      <p className="text-sm font-black text-slate-700">
                        Start the conversation
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Send a message about your appointment.
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {customerConversationMessages.map(
                      msg => {

                        const isMine =
                          msg.sender_id ===
                          currentAuthUserId

                        const senderProfile =
                          senderProfilesMap[
                            msg.sender_id
                          ]

                        const repliedMessage =
                          msg.reply_to_message_id
                            ? customerConversationMessages.find(
                                originalMessage =>
                                  originalMessage.id ===
                                  msg.reply_to_message_id
                              )
                            : null

                        const repliedSenderProfile =
                          repliedMessage
                            ? senderProfilesMap[
                                repliedMessage.sender_id
                              ]
                            : null

                        return (

                          <div
                            key={msg.id}
                            className={`flex ${
                              isMine
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >

                            <div
                              className={`
                                flex
                                max-w-[88%]
                                items-end
                                gap-2

                                ${
                                  isMine
                                    ? 'flex-row-reverse'
                                    : 'flex-row'
                                }
                              `}
                            >

                              {/* AVATAR */}

                              <div className="relative h-8 w-8 flex-shrink-0">

                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white bg-slate-200 text-[10px] font-black text-slate-500 shadow-sm">

                                  {senderProfile?.avatar_url ? (

                                    <img
                                      src={
                                        senderProfile.avatar_url
                                      }
                                      alt={
                                        senderProfile?.name ||
                                        'User'
                                      }
                                      className="h-full w-full object-cover"
                                    />

                                  ) : (

                                    <span>
                                      {(
                                        senderProfile?.name ||
                                        'U'
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>

                                  )}

                                </div>

                                <span
                                  className={`
                                    absolute
                                    bottom-0
                                    right-0
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                    border-2
                                    border-white

                                    ${
                                      isUserOnline(
                                        senderProfile?.last_seen
                                      )
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-400'
                                    }
                                  `}
                                />

                              </div>

                              {/* CONTENT */}

                              <div
                                className={`
                                  min-w-0

                                  ${
                                    isMine
                                      ? 'text-right'
                                      : 'text-left'
                                  }
                                `}
                              >

                                <div className="mb-1 px-1 text-[10px] font-bold text-slate-500">

                                  {senderProfile?.name ||
                                    'Unknown User'}

                                  {senderProfile?.role && (
                                    <span className="ml-1 font-normal text-slate-400">
                                      ·{' '}
                                      {
                                        senderProfile.role
                                      }
                                    </span>
                                  )}

                                </div>

                                {/* BUBBLE */}

                                <div
                                  className={`
                                    rounded-2xl
                                    px-4
                                    py-3
                                    text-xs
                                    leading-5
                                    shadow-sm

                                    ${
                                      isMine
                                        ? 'rounded-br-md bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white'
                                        : 'rounded-bl-md border border-slate-100 bg-white text-slate-800'
                                    }
                                  `}
                                >

                                  {/* REPLY */}

                                  {repliedMessage && (

                                    <div
                                      className={`
                                        mb-2
                                        overflow-hidden
                                        rounded-lg
                                        border-l-[3px]
                                        px-3
                                        py-2
                                        text-left

                                        ${
                                          isMine
                                            ? 'border-red-200 bg-white/10'
                                            : 'border-red-500 bg-slate-50'
                                        }
                                      `}
                                    >

                                      <div
                                        className={`
                                          mb-0.5
                                          text-[8px]
                                          font-black
                                          uppercase
                                          tracking-wide

                                          ${
                                            isMine
                                              ? 'text-red-100'
                                              : 'text-red-600'
                                          }
                                        `}
                                      >

                                        ↩ Reply to{' '}

                                        {
                                          repliedSenderProfile?.name ||
                                          'Unknown User'
                                        }

                                      </div>

                                      <div
                                        className={`
                                          line-clamp-2
                                          text-[10px]

                                          ${
                                            repliedMessage.deleted_at
                                              ? 'italic opacity-70'
                                              : isMine
                                              ? 'text-white/80'
                                              : 'text-slate-500'
                                          }
                                        `}
                                      >

                                        {repliedMessage.deleted_at
                                          ? 'This message was deleted'
                                          : repliedMessage.message}

                                      </div>

                                    </div>

                                  )}

                                  <div
                                    className={
                                      msg.deleted_at
                                        ? 'italic opacity-70'
                                        : ''
                                    }
                                  >
                                    {msg.deleted_at
                                      ? 'This message was deleted'
                                      : msg.message}
                                  </div>

                                </div>

                                {/* TIMESTAMP */}

                                <div className="mt-1 px-1 text-[9px] text-slate-400">

                                  {msg.created_at
                                    ? new Date(
                                        msg.created_at
                                      ).toLocaleString(
                                        undefined,
                                        {
                                          month:
                                            'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: 'numeric',
                                          minute:
                                            '2-digit',
                                        }
                                      )
                                    : ''}

                                </div>

                                {/* ACTIONS */}

                                <div
                                  className={`
                                    mt-1
                                    flex
                                    items-center
                                    gap-2

                                    ${
                                      isMine
                                        ? 'justify-end'
                                        : 'justify-start'
                                    }
                                  `}
                                >

                                  {!msg.deleted_at && (

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReplyingToMessage(
                                          msg
                                        )
                                      }
                                      className="inline-flex items-center gap-1 px-1 text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
                                    >

                                      <Reply className="h-3 w-3" />

                                      Reply

                                    </button>

                                  )}

                                  {isMine &&
                                    !msg.deleted_at && (

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteCustomerMessage(
                                            msg
                                          )
                                        }
                                        className="inline-flex items-center gap-1 px-1 text-[10px] font-semibold text-slate-400 transition hover:text-red-600"
                                      >

                                        <Trash2 className="h-3 w-3" />

                                        Delete

                                      </button>

                                    )}

                                </div>

                              </div>

                            </div>

                          </div>

                        )
                      }
                    )}
                    <div ref={messagesEndRef} />

                  </div>

                )}

              </div>

              {/* REPLY BAR */}

              {replyingToMessage && (

                <div className="border-t border-slate-100 bg-white px-4 py-3">

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2">

                    <div className="min-w-0">

                      <p className="text-[8px] font-black uppercase tracking-wide text-red-600">

                        Replying to{' '}

                        {
                          senderProfilesMap[
                            replyingToMessage.sender_id
                          ]?.name ||
                          'User'
                        }

                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-600">

                        {replyingToMessage.deleted_at
                          ? 'This message was deleted'
                          : replyingToMessage.message}

                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToMessage(
                          null
                        )
                      }
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                  </div>

                </div>

              )}

              {/* INPUT */}

              <div className="border-t border-slate-200 bg-white p-3">



                {messagingAllowed ? ( 

  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50"> 

    {/* SEND BUTTON - LEFT */} 
    <button 
      type="button" 
      onClick={ 
        sendCustomerConversationMessage 
      } 
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white shadow-lg shadow-red-900/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40" 
      disabled={ 
        !customerChatMessage.trim() || 
        sendingMessage 
      } 
      aria-label="Send message" 
    > 

      {sendingMessage ? ( 
        <LoaderCircle className="h-4 w-4 animate-spin" /> 
      ) : ( 
        <Send className="h-4 w-4" /> 
      )} 

    </button> 

    {/* MESSAGE INPUT */} 
    <input 
      type="text" 
      value={ 
        customerChatMessage 
      } 
      onChange={e => 
        setCustomerChatMessage( 
          e.target.value 
        ) 
      } 
      onKeyDown={e => { 

        if ( 
          e.key === 'Enter' && 
          !e.shiftKey 
        ) { 

          e.preventDefault() 

          if (!sendingMessage) { 
            sendCustomerConversationMessage() 
          } 

        } 

      }} 
      placeholder="Type a message..." 
      disabled={ 
        sendingMessage 
      } 
      className="h-10 min-w-0 flex-1 bg-transparent px-3 text-xs outline-none placeholder:text-slate-400 disabled:opacity-50" 
    /> 

  </div> 

) : ( 




                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center">

                    <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-700">

                      <LockKeyhole className="h-4 w-4 text-slate-500" />

                      Messaging unavailable

                    </div>

                    <div className="mt-1 text-[10px] leading-5 text-slate-500">

                      {messagingEndAt
                        ? `The messaging period ended on ${formatTimeOnly(
                            messagingEndAt
                          )}. You can still view the conversation.`
                        : 'Messaging is not currently available for this appointment.'}

                    </div>

                  </div>

                )}

              </div>

            </>

          )}

        </div>
      </div>
    )}

    {/* =====================================================
        FLOATING APPOINTMENT CHAT
    ===================================================== */}

    {!showCustomerMessaging &&
      messageEligibleAppointments.length > 0 && (

        <button
          type="button"
          onClick={
            openLatestAppointmentConversation
          }
          className="group fixed bottom-32 right-5 z-[110] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#E74C3C] to-[#C0392B] text-white shadow-xl shadow-red-500/25 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl sm:right-7"
          title="Open appointment messages"
          aria-label="Open appointment messages"
        >

          {/* OUTER GLOW */}

          <span className="absolute -inset-1 -z-10 animate-pulse rounded-full bg-red-500/20 blur-md" />

          {/* ICON */}

          <MessageCircle className="relative h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />

          {/* UNREAD */}

          {totalUnreadMessages > 0 && (

            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 animate-bounce items-center justify-center rounded-full border-2 border-white bg-amber-400 px-1.5 text-[9px] font-black text-red-950 shadow-lg">

              {totalUnreadMessages > 99
                ? '99+'
                : totalUnreadMessages}

            </span>

          )}

          {/* LIVE DOT */}

          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />

        </button>

      )}

    {/* =====================================================
        CUSTOMER NOTIFICATION ANIMATIONS
    ===================================================== */}

    <style>
      {`
        @keyframes customerNotificationFloatingImpulse {
          0% {
            opacity: 0;
            transform:
              scale(0.82)
              translateY(-12px);
          }

          40% {
            opacity: 1;
            transform:
              scale(1.035)
              translateY(2px);
          }

          65% {
            transform:
              scale(0.985)
              translateY(-1px);
          }

          82% {
            transform:
              scale(1.008)
              translateY(0);
          }

          100% {
            opacity: 1;
            transform:
              scale(1)
              translateY(0);
          }
        }

        @keyframes customerNotificationCountImpulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }
        }

        @keyframes customerNotificationEmptyImpulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.75;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse,
          .animate-ping,
          .animate-bounce,
          .animate-spin {
            animation: none !important;
          }
        }
      `}
    </style>

  </div>
)

}
