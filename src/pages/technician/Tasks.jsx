import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import AnnouncementBanner from '../../components/AnnouncementBanner'


import {
  UserRound,
  Wrench,
  Settings,
  CalendarDays,
  MessageCircle,
  Car,
  BadgeCheck,
  ClipboardList,
  Package,
  Paperclip,
  Upload,
  Eye,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Send,
  ShieldCheck,
  LockKeyhole,
  AlertTriangle,
  CircleCheck,
  Clock3,
  UserCog,
  FileText,
  Gauge,
  CircleUserRound,
  Plus,
  Ban,
  Play,
  LoaderCircle,
  Loader2,
  Fuel,
  Battery,
  Settings2,
} from 'lucide-react'
import { FaClipboardList } from 'react-icons/fa'


export default function ServiceTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [technician, setTechnician] = useState(null)

  // =========================================================
  // LIVE SERVICE PROGRESS
  // =========================================================
  const [progressHistory, setProgressHistory] = useState({})
  const [progressLoading, setProgressLoading] = useState({})

  const [serviceItems, setServiceItems] = useState({})
  const [inventoryItems, setInventoryItems] = useState([])
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null)
  const [serviceItemQuantity, setServiceItemQuantity] = useState(1)
  const [itemsLoading, setItemsLoading] = useState(false)

  const [attachments, setAttachments] = useState({})
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // =========================================================
  // MESSAGING
  // =========================================================

  const [conversations, setConversations] = useState([])
  const [conversationMessages, setConversationMessages] = useState({})
  const [conversationLoading, setConversationLoading] = useState(false)
  const [openMessagingTask, setOpenMessagingTask] = useState(null)
  const [messageText, setMessageText] = useState({})
  const [sendingMessage, setSendingMessage] = useState({})
  const [markingRead, setMarkingRead] = useState(false)
const [userPresence, setUserPresence] = useState({})
  /*
   * IMPORTANT:
   * These refs prevent realtime events from overwriting the
   * locally confirmed "read" state while the read operation
   * is still being synchronized with Supabase.
   */
  const readInProgressRef = useRef(new Set())
  const locallyReadMessagesRef = useRef(new Set())
  const conversationFetchVersionRef = useRef(0)

  // Auto-scroll tracking
  const messagesContainerRef = useRef(null)
  const previousMessageCountRef = useRef(0)
  const previousConversationIdRef = useRef(null)

  // Used by realtime handlers (they live in effects that
  // only re-subscribe when the technician changes)
  const openMessagingTaskRef = useRef(null)
  const conversationsRef = useRef([])

  const [notifications, setNotifications] =
    useState([])

  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  const handleStartService = async (taskId) => {
    if (updatingTaskId === taskId) return

    setUpdatingTaskId(taskId)

    try {
      await updateStatus(taskId, 'in_progress')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const [cancellingAppointmentId, setCancellingAppointmentId] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadTechnician()
    fetchTasks()
    fetchInventoryItems()
  }, [])

  // =========================================================
  // KEEP REFS IN SYNC (used by realtime handlers)
  // =========================================================

  useEffect(() => {
    openMessagingTaskRef.current = openMessagingTask
  }, [openMessagingTask])

  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // =========================================================
  // LIVE TECHNICIAN MESSAGING REALTIME
  // =========================================================
  useEffect(() => {
    if (!technician?.id) return

    let cancelled = false

    // Initial conversation load
    fetchTechnicianConversations()

    const channel = supabase
      .channel(`technician-messaging-${technician.id}`)

      // -------------------------------------------------------
      // NEW MESSAGE
      // -------------------------------------------------------
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async payload => {
  if (cancelled) return

  const newMessage = payload?.new

  if (!newMessage?.id) return

  console.log(
    '💬 TECHNICIAN REALTIME NEW MESSAGE:',
    newMessage
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const isMine =
    String(newMessage.sender_id) ===
    String(user.id)

  // =========================================================
  // LOAD THE ACTUAL SENDER PROFILE
  // =========================================================

  let senderProfile = null

  const {
    data: senderData,
    error: senderError,
  } = await supabase
    .from('users')
    .select(`
  id,
  name,
  role,
  avatar_url,
  last_seen
`)
    .eq('id', newMessage.sender_id)
    .maybeSingle()

  if (senderError) {
    console.error(
      'Realtime Sender Profile Error:',
      senderError
    )
  } else {
    senderProfile = senderData || null
  }

  const enrichedNewMessage = {
    ...newMessage,
    sender: senderProfile,
    isMine,
    isReadByMe: isMine,
    readAt: isMine
      ? newMessage.created_at
      : null,
  }

  const openTask =
    openMessagingTaskRef.current

  // =========================================================
  // IF THIS CONVERSATION IS CURRENTLY OPEN
  // =========================================================

  if (openTask?.id) {
    const conversation =
      conversationsRef.current.find(
        c =>
          String(c.appointment_id) ===
          String(openTask.id)
      )

    if (
      conversation?.id &&
      String(conversation.id) ===
        String(newMessage.conversation_id)
    ) {
      setConversationMessages(prev => {
        const existing =
          prev[newMessage.conversation_id] || []

        const alreadyExists =
          existing.some(
            message =>
              String(message.id) ===
              String(newMessage.id)
          )

        if (alreadyExists) return prev

        return {
          ...prev,
          [newMessage.conversation_id]: [
            ...existing,
            enrichedNewMessage,
          ],
        }
      })

      // =====================================================
      // MARK INCOMING MESSAGE AS READ
      // =====================================================

      if (!isMine) {
        await markConversationMessagesRead(
          newMessage.conversation_id,
          [
            {
              ...enrichedNewMessage,
              isReadByMe: false,
              deleted_at:
                newMessage.deleted_at,
            },
          ]
        )
      }

      await refreshConversationSummary(
        newMessage.conversation_id
      )

      return
    }
  }

  // =========================================================
  // CONVERSATION IS NOT CURRENTLY OPEN
  // =========================================================

  setConversations(prev =>
    prev.map(conversation => {
      if (
        String(conversation.id) !==
        String(newMessage.conversation_id)
      ) {
        return conversation
      }

      const isIncoming =
        String(newMessage.sender_id) !==
        String(user.id)

      return {
        ...conversation,
        lastMessage: newMessage.message,
        unreadCount: isIncoming
          ? (Number(conversation.unreadCount) || 0) + 1
          : conversation.unreadCount,
        totalMessages:
          (Number(conversation.totalMessages) || 0) + 1,
      }
    })
  )
}
      )

      // -------------------------------------------------------
      // MESSAGE READS
      // -------------------------------------------------------
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reads',
        },
        async payload => {
          if (cancelled) return

          const conversationId =
            payload?.new?.conversation_id ||
            payload?.old?.conversation_id ||
            null

          if (!conversationId) return

          console.log(
            '👁️ TECHNICIAN MESSAGE READ REALTIME:',
            payload
          )

          if (
            readInProgressRef.current.has(
              String(conversationId)
            )
          ) {
            return
          }

          await refreshConversationSummary(
            conversationId
          )

          const openTask = openMessagingTaskRef.current

          if (openTask?.id) {
            const conversation = conversationsRef.current.find(
              c =>
                String(c.appointment_id) ===
                String(openTask.id)
            )

            if (
              conversation?.id &&
              String(conversation.id) ===
                String(conversationId)
            ) {
              await fetchConversationMessages(
                conversationId,
                false
              )
            }
          }
        }
      )

      .subscribe(status => {
        console.log(
          '💬 Technician messaging realtime status:',
          status
        )
      })

    return () => {
      cancelled = true

      console.log(
        '🧹 Removing technician messaging realtime channel'
      )

      supabase.removeChannel(channel)
    }

    /*
     * IMPORTANT:
     * Only recreate the realtime channel when the technician
     * changes. Do NOT put openMessagingTask?.id here.
     */
  }, [technician?.id])


  // =========================================================
// UPDATE TECHNICIAN LAST SEEN
// =========================================================
useEffect(() => {
  if (!technician?.id) return

  let cancelled = false

  const updateLastSeen = async () => {
    if (cancelled) return

    const { error } = await supabase
      .from('users')
      .update({
        last_seen: new Date().toISOString(),
      })
      .eq('id', technician.id)

    if (error) {
      console.error(
        'Update Technician Last Seen Error:',
        error
      )
    }
  }

  // Update immediately
  updateLastSeen()

  // Then keep it updated every 60 seconds
  const interval = setInterval(
    updateLastSeen,
    60 * 1000
  )

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}, [technician?.id])


// =========================================================
// REFRESH MESSAGE USER PRESENCE
// =========================================================
useEffect(() => {
  const senderIds = [
    ...new Set(
      Object.values(conversationMessages)
        .flat()
        .map(message => message.sender_id)
        .filter(Boolean)
    ),
  ]

  if (!senderIds.length) return

  let cancelled = false

  const refreshPresence = async () => {
    const {
      data,
      error,
    } = await supabase
      .from('users')
      .select(`
        id,
        last_seen
      `)
      .in('id', senderIds)

    if (cancelled) return

    if (error) {
      console.error(
        'Refresh User Presence Error:',
        error
      )
      return
    }

    const presenceMap = {}

    ;(data || []).forEach(user => {
      presenceMap[String(user.id)] =
        user.last_seen
    })

    setUserPresence(presenceMap)
  }

  refreshPresence()

  const interval = setInterval(
    refreshPresence,
    30 * 1000
  )

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}, [conversationMessages])

  // =========================================================
  // LIVE SERVICE PROGRESS REALTIME
  // =========================================================
  useEffect(() => {
    if (!technician?.id) return

    const channel = supabase
      .channel(`technician-live-progress-${technician.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `technician_id=eq.${technician.id}`,
        },
        async payload => {
          const appointmentId =
            payload?.new?.id || payload?.old?.id || null

          if (!appointmentId) return

          await fetchTasks()

          await fetchProgressHistory(appointmentId)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_progress_history',
        },
        async payload => {
          const appointmentId =
            payload?.new?.appointment_id ||
            payload?.old?.appointment_id ||
            null

          if (!appointmentId) return

          await fetchProgressHistory(appointmentId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [technician?.id])


  // =========================================================
  // TECHNICIAN NOTIFICATIONS REALTIME
  // =========================================================

  useEffect(() => {
    if (!technician?.id) return

    let channel = null
    let cancelled = false

    async function setupTechnicianNotifications() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error(
          'Unable to identify technician:',
          authError
        )
        return
      }

      if (cancelled) return

      channel = supabase
        .channel(
          `technician-notifications-${user.id}`
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          payload => {
            console.log(
              '🔔 NEW TECHNICIAN NOTIFICATION:',
              payload.new
            )

            setNotifications(current => [
              payload.new,
              ...current,
            ])
          }
        )
        .subscribe(status => {
          console.log(
            '🔔 Technician notification realtime status:',
            status
          )
        })
    }

    setupTechnicianNotifications()

    return () => {
      cancelled = true

      if (channel) {
        console.log(
          '🧹 Removing technician notification channel'
        )

        supabase.removeChannel(channel)
        channel = null
      }
    }
  }, [technician?.id])


  async function fetchTechnicianNotifications() {
    if (!technician?.id) return

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        title,
        message,
        type,
        is_read,
        created_at,
        quantity,
        customer_id,
        appointment_id,
        recipient_id
      `)
      .eq('recipient_id', technician.id)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Technician Notifications Error:',
        error
      )
      return
    }

    setNotifications(data || [])
  }

  async function createCustomerNotification({
    appointment,
    title,
    message,
    type,
  }) {
    if (!appointment?.id) {
      console.error(
        '❌ CUSTOMER NOTIFICATION: appointment.id is missing',
        appointment
      )
      return false
    }

    if (!appointment?.customer_id) {
      console.error(
        '❌ CUSTOMER NOTIFICATION: customer_id is missing',
        appointment
      )
      return false
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error(
        '❌ CUSTOMER NOTIFICATION: unable to identify current user',
        authError
      )
      return false
    }

    console.log('🔔 CUSTOMER NOTIFICATION DEBUG:', {
      currentUser: user.id,
      appointmentId: appointment.id,
      customerId: appointment.customer_id,
      technicianId: appointment.technician_id,
      title,
      type,
    })

    console.log('🔐 RLS CHECK VALUES:', {
      authUserId: user.id,
      authUserRole: user.id === '643e3989-138a-476f-9b22-2a8d5dd14563'
        ? 'EXPECTED ADMIN'
        : 'OTHER USER',
      appointmentId: appointment.id,
      appointmentCustomerId: appointment.customer_id,
      notificationCustomerId: appointment.customer_id,
      notificationRecipientId: appointment.customer_id,
      appointmentTechnicianId: appointment.technician_id,
      isAssignedTechnician:
        appointment.technician_id === user.id,
      isAdmin:
        user.id === '643e3989-138a-476f-9b22-2a8d5dd14563',
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('🔐 ACTUAL SUPABASE SESSION:', {
      userId: session?.user?.id,
      role: session?.user?.role,
      email: session?.user?.email,
      accessTokenExists: !!session?.access_token,
    })

    const { error } = await supabase
      .from('notifications')
      .insert({
        title,
        message,
        type,
        is_read: false,

        customer_id: appointment.customer_id,
        recipient_id: appointment.customer_id,

        appointment_id: appointment.id,
      })

    if (error) {
      console.error(
        '❌ CUSTOMER NOTIFICATION INSERT FAILED:',
        error
      )

      return false
    }

    console.log(
      '✅ CUSTOMER NOTIFICATION CREATED SUCCESSFULLY'
    )

    return true
  }


  // =========================================================
  // ADMIN NOTIFICATIONS
  // =========================================================

  async function createAdminNotification({
    appointment,
    title,
    message,
    type = 'appointment',
  }) {
    if (!appointment?.id) {
      console.error(
        '❌ ADMIN NOTIFICATION: appointment.id is missing',
        appointment
      )
      return false
    }

    try {
      const normalizedBookingSource =
        String(appointment.booking_source || '')
          .toLowerCase()
          .replace(/[-_]/g, '')

      const isWalkIn =
        normalizedBookingSource === 'walkin' ||
        !appointment.customer_id

      const bookingSource =
        isWalkIn ? 'walkin' : 'online'

      const {
        data: adminUsers,
        error: adminUsersError,
      } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')

      if (adminUsersError) {
        console.error(
          '❌ ADMIN NOTIFICATION: unable to load admins',
          adminUsersError
        )

        return false
      }

      if (!adminUsers?.length) {
        console.warn(
          '⚠️ ADMIN NOTIFICATION: no admin users found'
        )

        return false
      }

      const adminNotifications = adminUsers.map(admin => ({
        recipient_id: admin.id,

        customer_id:
          appointment.customer_id || null,

        appointment_id:
          appointment.id,

        title,

        message,

        type,

        booking_source:
          bookingSource,

        is_read: false,
      }))

      const { error: insertError } =
        await supabase
          .from('notifications')
          .insert(adminNotifications)

      if (insertError) {
        console.error(
          '❌ ADMIN NOTIFICATION INSERT FAILED:',
          insertError
        )

        return false
      }

      console.log(
        '✅ ADMIN NOTIFICATION CREATED SUCCESSFULLY:',
        {
          appointmentId: appointment.id,
          bookingSource,
          adminCount: adminUsers.length,
          title,
          type,
        }
      )

      return true
    } catch (error) {
      console.error(
        '❌ ADMIN NOTIFICATION EXCEPTION:',
        error
      )

      return false
    }
  }


  // =========================================================
  // TECHNICIAN
  // =========================================================

  async function loadTechnician() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error('You must be logged in.')
      navigate('/')
      return
    }

    const { data: technicianData, error: technicianError } =
      await supabase
        .from('users')
        .select('id, name, email, phone, role, avatar_url')
        .eq('id', user.id)
        .single()

    if (technicianError) {
      console.error('Technician Error:', technicianError)
      toast.error('Unable to load technician information.')
      return
    }

    setTechnician(technicianData)
  }

  // =========================================================
  // INVENTORY
  // =========================================================

  async function fetchInventoryItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('id, name, quantity, price, category')
      .order('name')

    if (error) {
      console.error('Inventory Error:', error)
      toast.error('Unable to load inventory items.')
      return
    }

    setInventoryItems(data || [])
  }

  // =========================================================
  // TASKS
  // =========================================================

  async function fetchTasks() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('You must be logged in.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          technician:users!technician_id (
            id,
            name,
            role
          ),
          assisted_by_user:users!assisted_by (
            id,
            name,
            role
          )
        `)
        .eq('technician_id', user.id)
        .in('status', ['confirmed', 'in_progress'])
        .order('appointment_date', { ascending: true })

      if (error) {
        console.error('Task Error:', error)
        toast.error(error.message)
        setLoading(false)
        return
      }
      console.log('TECHNICIAN TASK DATA:', data)
      setTasks(data || [])
      setLoading(false)

      for (const task of data || []) {
        await fetchServiceItems(task.id)
        await fetchAttachments(task.id)
        await fetchProgressHistory(task.id)
      }
    } catch (error) {
      console.error('Fetch Tasks Error:', error)
      toast.error('Unable to load service tasks.')
      setLoading(false)
    }
  }

  // =========================================================
  // SERVICE ITEMS
  // =========================================================

  async function fetchServiceItems(appointmentId) {
    setItemsLoading(true)

    const { data, error } = await supabase
      .from('service_task_items')
      .select(`
        id,
        appointment_id,
        inventory_id,
        item_name,
        quantity,
        unit_price,
        subtotal,
        performed_by,
        created_at
      `)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Service Items Error:', error)
      toast.error('Unable to load service items.')
      setItemsLoading(false)
      return
    }

    setServiceItems(prev => ({
      ...prev,
      [appointmentId]: data || [],
    }))

    setItemsLoading(false)
  }

  // =========================================================
  // ATTACHMENTS
  // =========================================================

  async function fetchAttachments(appointmentId) {
    setAttachmentsLoading(true)

    const { data, error } = await supabase
      .from('service_task_attachments')
      .select(`
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
      `)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Attachments Error:', error)
      toast.error('Unable to load service attachments.')
      setAttachmentsLoading(false)
      return
    }

    setAttachments(prev => ({
      ...prev,
      [appointmentId]: data || [],
    }))

    setAttachmentsLoading(false)
  }

  async function handleUploadAttachment(task, file) {
    if (!task || !file) return

    if (task.status !== 'in_progress') {
      toast.error(
        'Attachments can only be added while the service is in progress.'
      )
      return
    }

    setUploadingAttachment(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Unable to identify the logged-in user.')
        return
      }

      const { data: userProfile, error: profileError } =
        await supabase
          .from('users')
          .select('id, name, role')
          .eq('id', user.id)
          .single()

      if (profileError || !userProfile) {
        toast.error('Unable to identify user profile.')
        return
      }

      const fileExtension = file.name.includes('.')
        ? file.name.split('.').pop()
        : ''

      const uniqueName =
        `${Date.now()}-${crypto.randomUUID()}` +
        `${fileExtension ? `.${fileExtension}` : ''}`

      const filePath = `${task.id}/${uniqueName}`

      const { error: uploadError } = await supabase.storage
        .from('service-task-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        toast.error(
          uploadError.message || 'Failed to upload attachment.'
        )
        return
      }

      const { error: insertError } = await supabase
        .from('service_task_attachments')
        .insert([
          {
            appointment_id: task.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type || null,
            file_size: file.size || null,
            uploaded_by: userProfile.id,
            uploaded_by_name: userProfile.name,
            uploaded_by_role: userProfile.role,
          },
        ])

      if (insertError) {
        await supabase.storage
          .from('service-task-attachments')
          .remove([filePath])

        toast.error(
          insertError.message || 'Failed to save attachment.'
        )
        return
      }

      toast.success('Attachment uploaded successfully.')
      await fetchAttachments(task.id)
    } catch (error) {
      console.error('Attachment Error:', error)
      toast.error('Something went wrong while uploading the attachment.')
    } finally {
      setUploadingAttachment(false)
    }
  }

  async function handleRemoveAttachment(attachment) {
    if (!attachment) return

    const confirmed = window.confirm(
      `Remove "${attachment.file_name}" from this service?`
    )

    if (!confirmed) return

    setUploadingAttachment(true)

    try {
      const { error: storageError } = await supabase.storage
        .from('service-task-attachments')
        .remove([attachment.file_path])

      if (storageError) {
        toast.error(storageError.message || 'Failed to remove file.')
        return
      }

      const { error: databaseError } = await supabase
        .from('service_task_attachments')
        .delete()
        .eq('id', attachment.id)

      if (databaseError) {
        toast.error(
          databaseError.message || 'Failed to remove attachment.'
        )
        return
      }

      toast.success('Attachment removed.')
      await fetchAttachments(attachment.appointment_id)
    } finally {
      setUploadingAttachment(false)
    }
  }

  async function handleViewAttachment(attachment) {
    if (!attachment) return

    const { data, error } = await supabase.storage
      .from('service-task-attachments')
      .createSignedUrl(attachment.file_path, 60 * 5)

    if (error) {
      toast.error('Unable to open attachment.')
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  // =========================================================
  // INVENTORY ITEM ACTIONS
  // =========================================================

  async function handleAddServiceItem() {
    if (!selectedTask) {
      toast.error('No service task selected.')
      return
    }

    if (!selectedInventoryItem) {
      toast.error('Please select an inventory item.')
      return
    }

    const qty = Number(serviceItemQuantity)

    if (!qty || qty <= 0) {
      toast.error('Enter a valid quantity.')
      return
    }

    if (qty > Number(selectedInventoryItem.quantity)) {
      toast.error(
        `Not enough stock. Only ${selectedInventoryItem.quantity} available.`
      )
      return
    }

    setItemsLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      toast.error('Unable to identify the logged-in user.')
      setItemsLoading(false)
      return
    }

    const { data: userProfile, error: profileError } =
      await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .single()

    if (profileError || !userProfile) {
      toast.error('Unable to identify user profile.')
      setItemsLoading(false)
      return
    }

    const { data: existingItem, error: existingError } =
      await supabase
        .from('service_task_items')
        .select('id, quantity, unit_price, item_name')
        .eq('appointment_id', selectedTask.id)
        .eq('inventory_id', selectedInventoryItem.id)
        .maybeSingle()

    if (existingError) {
      toast.error(existingError.message)
      setItemsLoading(false)
      return
    }

    if (existingItem) {
      const newQuantity =
        Number(existingItem.quantity) + qty

      if (
        newQuantity >
        Number(selectedInventoryItem.quantity)
      ) {
        toast.error(
          `Cannot add ${qty}. Available stock is ${selectedInventoryItem.quantity}.`
        )
        setItemsLoading(false)
        return
      }

      const newSubtotal =
        newQuantity *
        Number(selectedInventoryItem.price || 0)

      const { error } = await supabase
        .from('service_task_items')
        .update({
          quantity: newQuantity,
          unit_price: Number(selectedInventoryItem.price || 0),
          subtotal: newSubtotal,
        })
        .eq('id', existingItem.id)

      if (error) {
        toast.error(error.message)
        setItemsLoading(false)
        return
      }

      toast.success('Item quantity updated!')
    } else {
      const unitPrice =
        Number(selectedInventoryItem.price || 0)

      const subtotal = qty * unitPrice

      const { error } = await supabase
        .from('service_task_items')
        .insert([
          {
            appointment_id: selectedTask.id,
            inventory_id: selectedInventoryItem.id,
            item_name: selectedInventoryItem.name,
            quantity: qty,
            unit_price: unitPrice,
            subtotal,
            performed_by: userProfile.id,
          },
        ])

      if (error) {
        toast.error(error.message)
        setItemsLoading(false)
        return
      }

      toast.success('Inventory item added to service!')
    }

    await fetchServiceItems(selectedTask.id)

    setSelectedInventoryItem(null)
    setServiceItemQuantity(1)
    setShowAddItemDialog(false)
    setItemsLoading(false)
  }

  async function handleRemoveServiceItem(item) {
    if (!item) return

    const confirmed = window.confirm(
      `Remove "${item.item_name}" from this service?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('service_task_items')
      .delete()
      .eq('id', item.id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(`${item.item_name} removed from service.`)
    await fetchServiceItems(item.appointment_id)
  }

  // =========================================================
  // PROGRESS HISTORY
  // =========================================================

  async function addProgressHistory(
    appointmentId,
    status,
    message
  ) {
    const { error } = await supabase.rpc(
      'add_appointment_progress_history',
      {
        p_appointment_id: appointmentId,
        p_status: status,
        p_message: message,
      }
    )

    if (error) {
      console.error(
        'PROGRESS HISTORY INSERT FAILED:',
        error
      )

      toast.error(
        `Progress history failed: ${error.message}`
      )
    }
  }

  const [completingTaskId, setCompletingTaskId] = useState(null)

  const handleCompleteService = async (taskId) => {
    if (completingTaskId === taskId) return

    setCompletingTaskId(taskId)

    try {
      await updateStatus(taskId, 'completed')
    } finally {
      setCompletingTaskId(null)
    }
  }


  // =========================================================
  // LIVE PROGRESS HISTORY
  // =========================================================

  async function fetchProgressHistory(appointmentId) {
    if (!appointmentId) return

    setProgressLoading(prev => ({
      ...prev,
      [appointmentId]: true,
    }))

    try {
      const { data, error } = await supabase
        .from('appointment_progress_history')
        .select(`
          id,
          appointment_id,
          status,
          message,
          created_at
        `)
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Progress History Error:', error)
        return
      }

      setProgressHistory(prev => ({
        ...prev,
        [appointmentId]: data || [],
      }))
    } finally {
      setProgressLoading(prev => ({
        ...prev,
        [appointmentId]: false,
      }))
    }
  }

  function getProgressSteps(task) {
    const history = progressHistory[task.id] || []

    const hasStatus = status =>
      history.some(row => row.status === status)

    const confirmedDone =
      task.status !== 'pending' &&
      (hasStatus('confirmed') || task.status === 'confirmed' || task.status === 'in_progress')

    const inProgressDone =
      hasStatus('in_progress') || task.status === 'in_progress'

    const completedDone =
      hasStatus('completed') || task.status === 'completed'

    return [
      {
        key: 'confirmed',
        label: 'Confirmed',
        message: 'Appointment confirmed and ready for service.',
        done: confirmedDone,
      },
      {
        key: 'in_progress',
        label: 'Service In Progress',
        message: 'Technician is currently working on the vehicle.',
        done: inProgressDone,
      },
      {
        key: 'completed',
        label: 'Completed',
        message: 'Vehicle service has been completed.',
        done: completedDone,
      },
    ]
  }

  function getLatestProgress(task) {
    const history = progressHistory[task.id] || []

    if (!history.length) {
      if (task.status === 'in_progress') {
        return {
          status: 'in_progress',
          message: 'Your vehicle service is now in progress.',
          created_at: null,
        }
      }

      return {
        status: 'confirmed',
        message: 'Your appointment has been confirmed and is ready for service.',
        created_at: null,
      }
    }

    return history[history.length - 1]
  }


  // =========================================================
  // STATUS
  // =========================================================

  async function updateStatus(id, status, reason = '') {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      toast.error('Unable to identify the logged-in user.')
      return
    }

    const { data: userProfile, error: profileError } =
      await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .single()

    if (profileError || !userProfile) {
      toast.error('Unable to identify user profile.')
      return
    }

    // =========================================================
    // GET THE APPOINTMENT
    // =========================================================

    const { data: appointment, error: appointmentError } =
      await supabase
        .from('appointments')
        .select(`
          id,
          customer_id,
          technician_id,
          service_type,
          appointment_date,
          appointment_time,
          status,
          cancellation_reason,
          cancelled_at,
          completed_at,
          in_progress_at,
          customer_name,
          vehicle_model,
          plate_number,
          booking_source
        `)
        .eq('id', id)
        .single()

    if (appointmentError || !appointment) {
      console.error(
        '❌ Appointment lookup failed:',
        appointmentError
      )

      toast.error(
        appointmentError?.message ||
        'Unable to load appointment.'
      )

      return
    }

    console.log(
      '🔵 Task appointment loaded:',
      appointment
    )

    // =========================================================
    // COMPLETE
    // =========================================================

    if (status === 'completed') {
      const { error: inventoryError } =
        await supabase.rpc(
          'deduct_inventory_for_service',
          {
            p_appointment_id: id,
            p_performed_by: userProfile.id,
            p_performed_by_role: userProfile.role,
          }
        )

      if (inventoryError) {
        console.error(
          'Inventory Deduction Error:',
          inventoryError
        )

        toast.error(
          inventoryError.message ||
          'Unable to deduct service inventory.'
        )

        return
      }

      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error(
          'Complete Appointment Error:',
          error
        )

        toast.error(
          'Inventory was deducted, but service could not be completed.'
        )

        return
      }

      await addProgressHistory(
        id,
        'completed',
        'Your vehicle service has been completed.'
      )

      const completedAt = new Date().toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

      // CUSTOMER NOTIFICATION
      await createCustomerNotification({
        appointment,

        title: 'Service Completed',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `Online Booking\n\n` +
          `Hi ${appointment.customer_name || 'Customer'}, your ` +
          `${appointment.service_type || 'vehicle service'} ` +
          `for ${appointment.vehicle_model || 'vehicle'} ` +
          `${
            appointment.plate_number
              ? `(Plate No. ${appointment.plate_number}) `
              : ''
          }` +
          `has been completed at ${completedAt}. ` +
          `Please check your appointment details for more information.`,

        type: 'service_completed',
      })

      // ADMIN NOTIFICATION (ONLINE + WALK-IN)
      const normalizedBookingSource =
        String(appointment.booking_source || '')
          .toLowerCase()
          .replace(/[-_]/g, '')

      const isWalkIn =
        normalizedBookingSource === 'walkin' ||
        !appointment.customer_id

      const bookingSourceLabel =
        isWalkIn
          ? 'Walk-in Booking'
          : 'Online Booking'

      await createAdminNotification({
        appointment,

        title: isWalkIn
          ? 'Walk-in Service Completed'
          : 'Service Completed',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `${bookingSourceLabel}\n\n` +
          `The appointment for ` +
          `${appointment.customer_name || 'Customer'} ` +
          `(${appointment.service_type || 'Service'}) ` +
          `has been completed at ${completedAt}. ` +
          `The technician has completed the service on the ` +
          `${appointment.vehicle_model || 'vehicle'}.` +
          (
            appointment.plate_number
              ? ` Plate No. ${appointment.plate_number}.`
              : ''
          ),

        type: 'appointment',
      })

      await fetchProgressHistory(id)

      toast.success(
        'Service completed and inventory updated!'
      )

      fetchTasks()
      fetchTechnicianConversations()

      return
    }

    // =========================================================
    // NORMAL STATUS UPDATE
    // =========================================================

    const updateData = {
      status,
    }

    if (status === 'in_progress') {
      updateData.in_progress_at =
        new Date().toISOString()
    }

    if (status === 'cancelled') {
      updateData.cancellation_reason =
        reason.trim()

      updateData.cancelled_at =
        new Date().toISOString()
    }

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error(
        '❌ Appointment Status Update Error:',
        error
      )

      toast.error(
        error.message ||
        'Failed to update task.'
      )

      return
    }

    // =========================================================
    // PROGRESS HISTORY
    // =========================================================

    const progressMessages = {
      confirmed:
        'Your appointment has been confirmed and is ready for service.',

      in_progress:
        'Your vehicle service is now in progress.',

      cancelled:
        reason?.trim()
          ? `Your appointment was cancelled. Reason: ${reason.trim()}`
          : 'Your appointment was cancelled.',
    }

    await addProgressHistory(
      id,
      status,
      progressMessages[status] ||
        'Appointment status updated.'
    )

    if (status === 'in_progress') {
      // CUSTOMER NOTIFICATION
      await createCustomerNotification({
        appointment,

        title: 'Service Started',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `Online Booking\n\n` +
          `Hi ${appointment.customer_name || 'Customer'}, your ` +
          `${appointment.service_type || 'vehicle service'} ` +
          `for ${appointment.vehicle_model || 'vehicle'} ` +
          `${
            appointment.plate_number
              ? `(Plate No. ${appointment.plate_number}) `
              : ''
          }` +
          `has started at ${
            updateData.in_progress_at
              ? new Date(updateData.in_progress_at).toLocaleString([], {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'the current time'
          }. ` +
          `Our technician is currently working on your vehicle.`,

        type: 'service_started',
      })

      // ADMIN NOTIFICATION (ONLINE + WALK-IN)
      const normalizedBookingSource =
        String(appointment.booking_source || '')
          .toLowerCase()
          .replace(/[-_]/g, '')

      const isWalkIn =
        normalizedBookingSource === 'walkin' ||
        !appointment.customer_id

      const bookingSourceLabel =
        isWalkIn
          ? 'Walk-in Booking'
          : 'Online Booking'

      await createAdminNotification({
        appointment,

        title: isWalkIn
          ? 'Walk-in Service Started'
          : 'Service Started',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `${bookingSourceLabel}\n\n` +
          `The appointment for ` +
          `${appointment.customer_name || 'Customer'} ` +
          `(${appointment.service_type || 'Service'}) ` +
          `has started at ${
            updateData.in_progress_at
              ? new Date(updateData.in_progress_at).toLocaleString([], {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : 'the current time'
          }. ` +
          `The technician is currently working on the ` +
          `${appointment.vehicle_model || 'vehicle'}.` +
          (
            appointment.plate_number
              ? ` Plate No. ${appointment.plate_number}.`
              : ''
          ),

        type: 'appointment',
      })
    }

    if (status === 'cancelled') {
      const cleanReason = reason?.trim()

      const cancelledAt = new Date(
        updateData.cancelled_at
      ).toLocaleString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

      // CUSTOMER NOTIFICATION
      await createCustomerNotification({
        appointment,

        title: 'Service Cancelled',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `Online Booking\n\n` +
          `Hi ${appointment.customer_name || 'Customer'}, your ` +
          `scheduled service for ${appointment.service_type || 'Service'} ` +
          (
            appointment.plate_number
              ? `(Plate No. ${appointment.plate_number}) `
              : ''
          ) +
          `has been cancelled at ${cancelledAt}.` +
          (
            cleanReason
              ? ` Reason: ${cleanReason}`
              : ''
          ),

        type: 'booking_status',
      })

      // ADMIN NOTIFICATION (ONLINE + WALK-IN)
      const normalizedBookingSource =
        String(appointment.booking_source || '')
          .toLowerCase()
          .replace(/[-_]/g, '')

      const isWalkIn =
        normalizedBookingSource === 'walkin' ||
        !appointment.customer_id

      const bookingSourceLabel =
        isWalkIn
          ? 'Walk-in Booking'
          : 'Online Booking'

      await createAdminNotification({
        appointment,

        title: isWalkIn
          ? 'Walk-in Service Cancelled'
          : 'Service Cancelled',

        message:
          `Appointment No. APPT-${String(appointment.id).padStart(6, '0')}\n\n` +
          `${bookingSourceLabel}\n\n` +
          `The appointment for ` +
          `${appointment.customer_name || 'Customer'} ` +
          `(${appointment.service_type || 'Service'}) ` +
          `has been cancelled at ${cancelledAt}.` +
          (
            appointment.plate_number
              ? ` Plate No. ${appointment.plate_number}.`
              : ''
          ) +
          (
            cleanReason
              ? ` Reason: ${cleanReason}`
              : ''
          ),

        type: 'appointment',
      })
    }

    await fetchProgressHistory(id)

    toast.success(
      'Task status updated!'
    )

    fetchTasks()
    fetchTechnicianConversations()
  }


  // =========================================================
  // MESSAGING
  // =========================================================

  async function fetchTechnicianConversations() {
    if (!technician?.id) return

    const requestVersion =
      ++conversationFetchVersionRef.current

    setConversationLoading(true)

    try {
      const { data: participantRows, error: participantError } =
        await supabase
          .from('conversation_participants')
          .select(`
            conversation_id,
            user_id,
            joined_at,
            last_read_at
          `)
          .eq('user_id', technician.id)

      if (participantError) {
        console.error(
          'Conversation Participants Error:',
          participantError
        )

        setConversations([])
        setConversationLoading(false)
        return
      }

      const conversationIds =
        (participantRows || []).map(
          row => row.conversation_id
        )

      if (!conversationIds.length) {
        setConversations([])
        setConversationLoading(false)
        return
      }

      const { data: conversationRows, error: conversationError } =
        await supabase
          .from('conversations')
          .select(`
            id,
            created_at,
            updated_at,
            appointment_id,
            warranty_ends_at,
            admin_last_read_at,
            customer_last_read_at
          `)
          .in('id', conversationIds)
          .order('updated_at', {
            ascending: false,
          })

      if (conversationError) {
        console.error(
          'Conversations Error:',
          conversationError
        )

        setConversations([])
        setConversationLoading(false)
        return
      }

      const appointmentIds =
        (conversationRows || [])
          .map(row => row.appointment_id)
          .filter(Boolean)

      let appointments = []

      if (appointmentIds.length) {
        const { data: appointmentRows, error } =
          await supabase
            .from('appointments')
            .select(`
              id,
              customer_id,
              technician_id,
              status,
              completed_at,
              appointment_date,
              appointment_time,
              service_type,
              vehicle_model,
              plate_number
            `)
            .in('id', appointmentIds)

        if (!error) {
          appointments = appointmentRows || []
        }
      }

      const customerIds =
        appointments
          .map(row => row.customer_id)
          .filter(Boolean)

      let customers = []

      if (customerIds.length) {
        const { data: customerRows } =
          await supabase
            .from('users')
            .select('id, name, email, avatar_url, role')
            .in('id', customerIds)

        customers = customerRows || []
      }

      const enrichedConversations =
        await Promise.all(
          (conversationRows || []).map(
            async conversation => {
              const participant =
                participantRows.find(
                  row =>
                    row.conversation_id ===
                    conversation.id
                )

              const appointment =
                appointments.find(
                  row =>
                    row.id ===
                    conversation.appointment_id
                )

              const customer =
                customers.find(
                  row =>
                    row.id ===
                    appointment?.customer_id
                )

              const messages =
                await getConversationMessageSummary(
                  conversation.id
                )

              return {
                ...conversation,
                participant,
                appointment,
                customer,
                lastMessage:
                  messages.lastMessage,
                unreadCount:
                  messages.unreadCount,
                totalMessages:
                  messages.totalMessages,
                canSend:
                  messages.canSend,
              }
            }
          )
        )

      /*
       * Don't let an older async fetch overwrite a newer
       * fetch.
       */
      if (
        requestVersion !==
        conversationFetchVersionRef.current
      ) {
        return
      }

      const correctedConversations =
        enrichedConversations.map(conversation => {
          const locallyReadForConversation =
            locallyReadMessagesRef.current

          if (!locallyReadForConversation.size) {
            return conversation
          }

          return {
            ...conversation,
            unreadCount:
              Number(conversation.unreadCount || 0),
          }
        })

      setConversations(correctedConversations)
    } catch (error) {
      console.error(
        'Fetch Technician Conversations Error:',
        error
      )
    } finally {
      if (
        requestVersion ===
        conversationFetchVersionRef.current
      ) {
        setConversationLoading(false)
      }
    }
  }

  function getConversationForTask(taskId) {
    if (!taskId) return null

    return conversations.find(
      conversation =>
        String(conversation.appointment_id) ===
        String(taskId)
    ) || null
  }

  async function getConversationMessageSummary(
    conversationId
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        lastMessage: null,
        unreadCount: 0,
        totalMessages: 0,
        canSend: false,
      }
    }

    const { data: messages, error: messagesError } =
      await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          message,
          created_at,
          updated_at,
          deleted_at,
          deleted_by,
          reply_to_message_id
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', {
          ascending: false,
        })

    if (messagesError) {
      console.error(
        'Message Summary Error:',
        messagesError
      )

      return {
        lastMessage: null,
        unreadCount: 0,
        totalMessages: 0,
        canSend: false,
      }
    }

    const rows = messages || []
    const messageIds = rows.map(row => row.id)

    let readRows = []

    if (messageIds.length) {
      const { data } = await supabase
        .from('message_reads')
        .select(
          'message_id, user_id, read_at'
        )
        .eq('user_id', user.id)
        .in('message_id', messageIds)

      readRows = data || []
    }

    const readSet = new Set(
      readRows.map(row => row.message_id)
    )

    locallyReadMessagesRef.current.forEach(
      messageId => {
        readSet.add(messageId)
      }
    )

    const unreadCount = rows.filter(
      row =>
        row.sender_id !== user.id &&
        !readSet.has(row.id)
    ).length

    let canSend = false

    const { data: sendAllowed, error: sendError } =
      await supabase.rpc(
        'can_send_appointment_message',
        {
          p_conversation_id: conversationId,
        }
      )

    if (!sendError) {
      canSend = sendAllowed === true
    }

    return {
      lastMessage: rows[0] || null,
      unreadCount,
      totalMessages: rows.length,
      canSend,
    }
  }

  async function fetchConversationMessages(
  conversationId,
  markAsRead = true
) {
  if (!conversationId) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data, error } = await supabase
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
    .eq('conversation_id', conversationId)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    console.error(
      'Fetch Conversation Messages Error:',
      error
    )

    toast.error(
      'Unable to load conversation messages.'
    )

    return
  }

  let rows = data || []
  let readRows = []

  // =========================================================
  // LOAD SENDER PROFILES
  // =========================================================

  const senderIds = [
    ...new Set(
      rows
        .map(row => row.sender_id)
        .filter(Boolean)
    ),
  ]

  let senderProfiles = []

  if (senderIds.length) {
    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from('users')
      .select(`
        id,
        name,
        role,
        avatar_url
      `)
      .in('id', senderIds)

    if (profilesError) {
      console.error(
        'Message Sender Profiles Error:',
        profilesError
      )
    } else {
      senderProfiles = profiles || []
    }
  }

  const senderMap = new Map(
    senderProfiles.map(profile => [
      String(profile.id),
      profile,
    ])
  )

  // =========================================================
  // LOAD READ STATES
  // =========================================================

  if (rows.length) {
    const messageIds = rows.map(
      row => row.id
    )

    const {
      data: reads,
      error: readsError,
    } = await supabase
      .from('message_reads')
      .select(
        'message_id, user_id, read_at'
      )
      .eq('user_id', user.id)
      .in('message_id', messageIds)

    if (readsError) {
      console.error(
        'Message Reads Error:',
        readsError
      )
    } else {
      readRows = reads || []
    }
  }

  const readMap = new Map(
    readRows.map(row => [
      row.message_id,
      row.read_at,
    ])
  )

  // =========================================================
  // ENRICH MESSAGES
  // =========================================================

  rows = rows.map(row => {
    const locallyRead =
      locallyReadMessagesRef.current.has(row.id)

    const sender =
      senderMap.get(
        String(row.sender_id)
      ) || null

    return {
      ...row,

      // Actual sender profile
      sender,

      // Existing ownership logic stays intact
      isMine:
        String(row.sender_id) ===
        String(user.id),

      isReadByMe:
        readMap.has(row.id) ||
        locallyRead,

      readAt:
        readMap.get(row.id) ||
        (
          locallyRead
            ? new Date().toISOString()
            : null
        ),
    }
  })

  setConversationMessages(prev => ({
    ...prev,
    [conversationId]: rows,
  }))

  if (markAsRead) {
    await markConversationMessagesRead(
      conversationId,
      rows
    )
  }

  await refreshConversationSummary(
    conversationId
  )
}

  async function refreshConversationSummary(
    conversationId
  ) {
    if (!conversationId) return

    const summary =
      await getConversationMessageSummary(
        conversationId
      )

    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount:
                summary.unreadCount,
              totalMessages:
                summary.totalMessages,
              lastMessage:
                summary.lastMessage,
              canSend:
                summary.canSend,
            }
          : conversation
      )
    )
  }

  async function markConversationMessagesRead(
    conversationId,
    rows
  ) {
    if (!technician?.id || !rows?.length) return

    const unreadMessages = rows.filter(
      row =>
        row.sender_id !== technician.id &&
        !row.isReadByMe &&
        !row.deleted_at
    )

    if (!unreadMessages.length) {
      setConversations(prev =>
        prev.map(conversation =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation
        )
      )

      return
    }

    setMarkingRead(true)

    readInProgressRef.current.add(
      String(conversationId)
    )

    const messageIds =
      unreadMessages.map(row => row.id)

    messageIds.forEach(messageId => {
      locallyReadMessagesRef.current.add(
        messageId
      )
    })

    const now = new Date().toISOString()

    setConversationMessages(prev => ({
      ...prev,
      [conversationId]: (
        prev[conversationId] || []
      ).map(row =>
        messageIds.includes(row.id)
          ? {
              ...row,
              isReadByMe: true,
              readAt: now,
            }
          : row
      ),
    }))

    setConversations(prev =>
      prev.map(conversation =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation
      )
    )

    try {
      const readPayload =
        unreadMessages.map(row => ({
          message_id: row.id,
          user_id: technician.id,
          read_at: now,
        }))

      const { error } = await supabase
        .from('message_reads')
        .upsert(readPayload, {
          onConflict:
            'message_id,user_id',
        })

      if (error) {
        console.error(
          'Mark Messages Read Error:',
          error
        )

        messageIds.forEach(messageId => {
          locallyReadMessagesRef.current.delete(
            messageId
          )
        })

        await fetchConversationMessages(
          conversationId,
          false
        )

        await refreshConversationSummary(
          conversationId
        )

        return
      }

      messageIds.forEach(messageId => {
        locallyReadMessagesRef.current.add(
          messageId
        )
      })

      await fetchConversationMessages(
        conversationId,
        false
      )

      await refreshConversationSummary(
        conversationId
      )
    } finally {
      readInProgressRef.current.delete(
        String(conversationId)
      )

      setMarkingRead(false)

      await refreshConversationSummary(
        conversationId
      )
    }
  }

  async function openConversationForTask(task) {
    if (!task) return

    const conversation =
      getConversationForTask(task.id)

    if (!conversation) {
      toast.error(
        'No customer conversation is available for this service yet.'
      )
      return
    }

    if (
      openMessagingTask?.id === task.id
    ) {
      setOpenMessagingTask(null)
      return
    }

    setOpenMessagingTask(task)

    setMessageText(prev => ({
      ...prev,
      [conversation.id]: '',
    }))

    await fetchConversationMessages(
      conversation.id,
      true
    )
  }

  function closeConversationForTask() {
    setOpenMessagingTask(null)
  }

  async function handleSendMessageForTask(
    task
  ) {
    if (!task) return

    const conversation =
      getConversationForTask(task.id)

    if (!conversation) {
      toast.error(
        'No customer conversation is available.'
      )
      return
    }

    const text =
      (messageText[conversation.id] || '').trim()

    if (!text) return

    if (!technician?.id) {
      toast.error(
        'Unable to identify technician.'
      )
      return
    }

    setSendingMessage(prev => ({
      ...prev,
      [conversation.id]: true,
    }))

    try {
      const {
        data: allowed,
        error: permissionError,
      } = await supabase.rpc(
        'can_send_appointment_message',
        {
          p_conversation_id:
            conversation.id,
        }
      )

      if (permissionError) {
        console.error(
          'Message Permission Error:',
          permissionError
        )

        toast.error(
          permissionError.message ||
          'Unable to verify messaging availability.'
        )

        return
      }

      if (allowed !== true) {
        toast.error(
          'Messaging is no longer available for this conversation.'
        )

        await fetchTechnicianConversations()
        return
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id:
            conversation.id,
          sender_id:
            technician.id,
          message: text,
        })
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
        .single()

      if (error) {
        console.error(
          'Send Message Error:',
          error
        )

        toast.error(
          error.message ||
          'Unable to send message.'
        )

        return
      }

      setMessageText(prev => ({
        ...prev,
        [conversation.id]: '',
      }))

      setConversationMessages(prev => {
        const existing = prev[conversation.id] || []

        // The realtime event may have added it already
        if (existing.some(m => m.id === data.id)) {
          return prev
        }

        return {
          ...prev,
          [conversation.id]: [
            ...existing,
            {
              ...data,
              isMine: true,
              isReadByMe: true,
            },
          ],
        }
      })

      await fetchTechnicianConversations()
    } finally {
      setSendingMessage(prev => ({
        ...prev,
        [conversation.id]: false,
      }))
    }
  }

  function handleMessageKeyDown(
    e,
    task
  ) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {
      e.preventDefault()
      handleSendMessageForTask(task)
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function formatTime(time) {
    if (!time) return 'Not specified'

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  function formatDateTime(value) {
    if (!value) return 'Not available'

    return new Date(value).toLocaleString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )
  }

  function formatDate(value) {
    if (!value) return 'Not available'

    return new Date(value).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    )
  }

  function getStatusStyle(status) {
    if (status === 'confirmed') {
      return 'bg-blue-100 text-blue-700'
    }

    if (status === 'in_progress') {
      return 'bg-yellow-100 text-yellow-700'
    }

    if (status === 'completed') {
      return 'bg-green-100 text-green-700'
    }

    return 'bg-gray-100 text-gray-700'
  }

  function getConversationStatus(
    conversation
  ) {
    const status =
      conversation?.appointment?.status

    if (status === 'completed') {
      return {
        label: 'Service Completed',
        color:
          'bg-green-100 text-green-700 border-green-200',
        icon: '✓',
      }
    }

    if (status === 'in_progress') {
      return {
        label: 'Service In Progress',
        color:
          'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: '⚙',
      }
    }

    if (status === 'confirmed') {
      return {
        label: 'Confirmed',
        color:
          'bg-blue-100 text-blue-700 border-blue-200',
        icon: '✓',
      }
    }

    return {
      label: status || 'Service',
      color:
        'bg-gray-100 text-gray-700 border-gray-200',
      icon: '●',
    }
  }

  function getWarrantyInfo(conversation) {
    const warrantyEndsAt =
      conversation?.warranty_ends_at

    if (!warrantyEndsAt) {
      return {
        exists: false,
        expired: false,
        label:
          'Messaging availability is controlled by the service policy.',
      }
    }

    const endDate =
      new Date(warrantyEndsAt)

    const now = new Date()

    const expired = now > endDate

    return {
      exists: true,
      expired,
      endDate,
      label: expired
        ? `Messaging ended ${formatDateTime(
            warrantyEndsAt
          )}`
        : `Messaging available until ${formatDateTime(
            warrantyEndsAt
          )}`,
    }
  }
const isUserOnline = lastSeen => {
  if (!lastSeen) return false

  const lastSeenTime =
    new Date(lastSeen).getTime()

  if (Number.isNaN(lastSeenTime)) {
    return false
  }

  // Consider the user online if their
  // last_seen was updated within the last 2 minutes.
  return (
    Date.now() - lastSeenTime <=
    2 * 60 * 1000
  )
}
  // =========================================================
  // AUTO SCROLL TO LATEST MESSAGE
  // =========================================================

  const openConversationId = openMessagingTask
    ? getConversationForTask(openMessagingTask.id)?.id
    : null

  const openMessageCount = openConversationId
    ? (conversationMessages[openConversationId] || []).length
    : 0

  useEffect(() => {
    // Messages closed: reset so the next open starts fresh
    if (!openConversationId) {
      previousMessageCountRef.current = 0
      previousConversationIdRef.current = null
      return
    }

    // Messages are still loading. Don't mark this conversation as handled yet.
    if (openMessageCount === 0) return

    const container = messagesContainerRef.current
    if (!container) return

    const conversationChanged =
      previousConversationIdRef.current !== openConversationId

    const hasNewMessage =
      openMessageCount > previousMessageCountRef.current

    // OPENING: jump instantly to the latest message
    if (conversationChanged) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight
        })
      })
    }

    // NEW MESSAGE WHILE INSIDE: scroll smoothly
    else if (hasNewMessage) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      })
    }

    previousConversationIdRef.current = openConversationId
    previousMessageCountRef.current = openMessageCount
  }, [openConversationId, openMessageCount])

  // =========================================================
  // UNREAD TOTAL
  // =========================================================

  const currentTaskIds = new Set(
    tasks.map(task => String(task.id))
  )

  const totalUnreadMessages =
    conversations
      .filter(conversation =>
        currentTaskIds.has(
          String(conversation.appointment_id)
        )
      )
      .reduce(
        (total, conversation) =>
          total +
          Number(
            conversation.unreadCount || 0
          ),
        0
      )

  // =========================================================
  // TECHNICIAN NOTIFICATIONS
  // =========================================================

  async function createTechnicianNotification({
    appointmentId,
    title,
    message,
    type,
  }) {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error(
          'Unable to identify technician for notification:',
          authError
        )
        return false
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          title,
          message,
          type,
          recipient_id: user.id,
          customer_id: null,
          appointment_id: appointmentId,
          is_read: false,
        })
        .select(`
          id,
          title,
          message,
          type,
          is_read,
          created_at,
          appointment_id,
          recipient_id
        `)
        .single()

      if (error) {
        console.error(
          'Technician Notification Error:',
          error
        )
        return false
      }

      console.log(
        '✅ Technician notification created:',
        data
      )

      return true
    } catch (error) {
      console.error(
        'Technician Notification Exception:',
        error
      )

      return false
    }
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

      <style>{`
        @keyframes progressShimmer {
          0% {
            transform: translateX(0) skewX(-12deg);
          }
          100% {
            transform: translateX(420%) skewX(-12deg);
          }
        }

        @keyframes premiumPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: .65;
            transform: scale(1.08);
          }
        }
      `}</style>

      <Toaster position="top-right" />

      {/* =====================================================
          PREMIUM HEADER — SERVICE TASK STYLE
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-[0_4px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">

        <div className="relative mx-auto flex min-h-[72px] max-w-10xl items-center justify-between gap-4 overflow-hidden px-4 sm:min-h-[80px] sm:px-6 lg:px-8">

          {/* BRAND / PROFILE */}

          <div className="relative flex min-w-0 items-center gap-3 sm:gap-4">

            <button
              type="button"
              onClick={() =>
                navigate(
                  location.pathname.startsWith('/technician')
                    ? '/technician/profile'
                    : '/admin/profile'
                )
              }
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-[0_8px_20px_rgba(249,115,22,0.30)] ring-1 ring-orange-400/30 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_12px_25px_rgba(249,115,22,0.35)] hover:ring-orange-400/50 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:h-12 sm:w-12"
              title="View Profile"
            >

              {technician?.avatar_url ? (

                <img
                  src={technician.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

              ) : (

                <UserRound
                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6"
                  strokeWidth={2.5}
                />

              )}

            </button>

            {/* BRAND INFORMATION */}

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h1 className="truncate text-sm font-extrabold tracking-tight text-slate-950 sm:text-lg">
                  Alavaren Auto Electrical
                </h1>

                <span className="hidden items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-700 shadow-sm sm:inline-flex">

                  <span className="relative flex h-1.5 w-1.5">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />

                    <span className="relative h-1.5 w-1.5 rounded-full bg-orange-600" />

                  </span>

                  Service Center

                </span>

              </div>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-500 sm:text-sm">
                Technician Service Dashboard
              </p>

              {technician?.name && (

                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-orange-600">

                  <UserCog className="h-3.5 w-3.5" />

                  <span className="truncate">
                    {technician.name}
                    {technician?.role && ` • ${technician.role}`}
                  </span>

                </div>

              )}

            </div>

          </div>

          {/* BACK BUTTON */}

          {!location.pathname.startsWith('/technician') && (

            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="group relative inline-flex shrink-0 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-xs font-extrabold text-orange-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 sm:px-4 sm:text-sm"
            >

              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>

            </button>

          )}

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* PREMIUM PAGE INTRO */}

        <section className="mb-7 sm:mb-9">

          <div className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_35%)]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-[0_8px_20px_rgba(249,115,22,0.30)] ring-1 ring-orange-400/30 transition-transform duration-300 hover:scale-110 sm:h-14 sm:w-14">
                  <Wrench
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2.5">

                    <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      My Service Tasks
                    </h2>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-700">

                      <span className="relative flex h-1.5 w-1.5">

                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-60" />

                        <span className="relative h-1.5 w-1.5 rounded-full bg-orange-600" />

                      </span>

                      Auto Repair

                    </span>

                  </div>

                  {technician?.name && (

                    <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 sm:text-sm">

                      Welcome,{' '}

                      <span className="font-bold text-slate-950">
                        {technician.name}
                      </span>

                      {technician?.role && (
                        <>
                          {' '}
                          —{' '}
                          <span className="font-bold text-orange-600">
                            {technician.role}
                          </span>
                        </>
                      )}

                      . Here are your current service tasks.

                    </p>

                  )}

                  <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                    View and manage your assigned customer appointments,
                    vehicle repairs, parts, attachments, and service communication.
                  </p>

                </div>

              </div>

              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-extrabold text-orange-700 shadow-sm">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-50" />

                  <span className="relative h-2 w-2 rounded-full bg-orange-600" />

                </span>

                Service Management

              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            PREMIUM SUMMARY CARDS
        ===================================================== */}

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* ASSIGNED TASKS */}

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-[0_16px_40px_rgba(220,38,38,0.10)]">

            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                  Assigned Tasks
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {tasks.length}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Current service tasks
                </p>

              </div>

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_8px_20px_rgba(220,38,38,0.30)] ring-1 ring-red-400/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <ClipboardList
                  className="h-5 w-5"
                  strokeWidth={2.5}
                />
              </div>

            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_16px_40px_rgba(249,115,22,0.10)]">

            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight text-orange-600">
                  {
                    tasks.filter(
                      task => task.status === 'in_progress'
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Repairs currently being worked on
                </p>

              </div>

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-[0_8px_20px_rgba(249,115,22,0.30)] ring-1 ring-orange-400/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <Settings
                  className="h-5 w-5"
                  strokeWidth={2.5}
                />
              </div>

            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
            </div>

          </div>


          {/* WAITING */}

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(37,99,235,0.10)]">

            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                  Waiting to Start
                </p>

                <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-600">
                  {
                    tasks.filter(
                      task => task.status === 'confirmed'
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Confirmed appointments
                </p>

              </div>

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.30)] ring-1 ring-blue-400/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                <CalendarDays
                  className="h-5 w-5"
                  strokeWidth={2.5}
                />
              </div>

            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
            </div>

          </div>


          {/* UNREAD MESSAGES */}

          <div
            className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)] ${
              totalUnreadMessages > 0
                ? 'border-red-200 shadow-red-50'
                : 'border-slate-200/80'
            }`}
          >

            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-50 opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                  Unread Messages
                </p>

                <p
                  className={`mt-2 text-3xl font-extrabold tracking-tight ${
                    totalUnreadMessages > 0
                      ? 'text-red-600'
                      : 'text-slate-950'
                  }`}
                >
                  {totalUnreadMessages}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Current service conversations
                </p>

              </div>

              <div
                className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-300 group-hover:scale-110 ${
                  totalUnreadMessages > 0
                    ? 'bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_8px_20px_rgba(220,38,38,0.30)] ring-1 ring-red-400/30'
                    : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-[0_8px_20px_rgba(100,116,139,0.20)] ring-1 ring-slate-400/30'
                }`}
              >
                <MessageCircle
                  className="h-5 w-5"
                  strokeWidth={2.5}
                />

                {totalUnreadMessages > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-md ring-2 ring-white">
                    {totalUnreadMessages > 99
                      ? '99+'
                      : totalUnreadMessages}
                  </span>
                )}
              </div>

            </div>

            <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">

              <div
                className={`h-full rounded-full ${
                  totalUnreadMessages > 0
                    ? 'w-2/3 bg-gradient-to-r from-red-500 to-red-600'
                    : 'w-1/4 bg-slate-300'
                }`}
              />

            </div>

          </div>

        </section>


        <AnnouncementBanner />


        {/* =====================================================
            TASK SECTION
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* PREMIUM SECTION HEADER */}

          <div className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.10),transparent_35%)]" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              {/* LEFT SIDE */}
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-[0_8px_20px_rgba(220,38,38,0.28)] ring-1 ring-red-400/30 transition-transform duration-300 hover:scale-110 sm:h-14 sm:w-14">
                  <Wrench
                    className="h-6 w-6 sm:h-7 sm:w-7"
                    strokeWidth={2.5}
                  />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2.5">

                    <h3 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                      Assigned Service Tasks
                    </h3>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-red-700">

                      <span className="relative flex h-1.5 w-1.5">

                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />

                        <span className="relative h-1.5 w-1.5 rounded-full bg-red-600" />

                      </span>

                      Active

                    </span>

                  </div>

                  <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-slate-600 sm:text-sm">
                    Customer appointments ready for vehicle service
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      Technician Work Queue
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>Review details before service</span>
                  </div>

                </div>

              </div>

              {/* RIGHT SIDE STATUS */}
              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-extrabold text-red-700 shadow-sm">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-50" />

                  <span className="relative h-2 w-2 rounded-full bg-red-600" />

                </span>

                Service Management

              </span>

            </div>

          </div>


          <div className="p-4 sm:p-6">

            {loading ? (

              <div className="py-12 text-center">

                <LoaderCircle className="mx-auto mb-4 h-9 w-9 animate-spin text-red-600" />

                <p className="text-sm font-medium text-slate-600">
                  Loading service tasks...
                </p>

              </div>

            ) : tasks.length === 0 ? (

              <div className="py-12 text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <CircleCheck className="h-8 w-8" />
                </div>

                <p className="font-bold text-slate-700">
                  No service tasks
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Confirmed appointments will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-5">

                {tasks.map(task => {

                  const taskConversation =
                    getConversationForTask(task.id)

                  const taskUnread =
                    Number(taskConversation?.unreadCount || 0)

                  const isMessagingOpen =
                    openMessagingTask?.id === task.id

                  const taskMessages =
                    taskConversation
                      ? conversationMessages[
                          taskConversation.id
                        ] || []
                      : []

                  const taskWarranty =
                    taskConversation
                      ? getWarrantyInfo(taskConversation)
                      : null

                  const taskStatus =
                    taskConversation
                      ? getConversationStatus(taskConversation)
                      : null

                  return (

                    <article
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:border-red-200 hover:shadow-lg sm:p-6"
                    >

                      {/* TASK INFORMATION */}

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                        {/* CUSTOMER */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">

                          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <CircleUserRound className="h-3.5 w-3.5" />
                            Customer
                          </div>

                          <p className="mt-2 break-words text-base font-black text-slate-950">
                            {task.customer_name ||
                              task.full_name ||
                              'Unknown Customer'}
                          </p>

                        </div>


                        {/* VEHICLE INFORMATION */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md lg:col-span-2">

                          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <Car className="h-3.5 w-3.5" />
                            Vehicle Information
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">

                            <div className="min-w-0">
                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Vehicle
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.vehicle_model || 'Not specified'}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <BadgeCheck className="h-3 w-3" />
                                Plate
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.plate_number || 'Not specified'}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <Fuel className="h-3 w-3" />
                                Fuel
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.fuel_type || 'Not specified'}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <Battery className="h-3 w-3" />
                                Battery
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.battery_voltage || 'Not specified'}
                              </p>
                            </div>

                            <div className="min-w-0">
                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <Settings2 className="h-3 w-3" />
                                Transmission
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.transmission_type || 'Not specified'}
                              </p>
                            </div>

                          </div>

                        </div>


                        {/* SERVICE & SCHEDULE */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md lg:col-span-2">

                          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <Wrench className="h-3.5 w-3.5" />
                            Service & Schedule
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div className="min-w-0 sm:col-span-2">

                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Service
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.service_type || 'Not specified'}
                              </p>

                            </div>

                            <div className="min-w-0">

                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <CalendarDays className="h-3 w-3" />
                                Date
                              </p>

                              <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
                                {task.appointment_date || 'Not specified'}
                              </p>

                            </div>

                            <div className="min-w-0">

                              <p className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                <Clock3 className="h-3 w-3" />
                                Time
                              </p>

                              <p className="mt-1 text-sm font-extrabold text-slate-900">
                                {formatTime(task.appointment_time)}
                              </p>

                            </div>

                            <div className="min-w-0">

                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Booking Source
                              </p>

                              <span
                                className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                                  task.booking_source === 'walkin'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {task.booking_source === 'walkin'
                                  ? 'Walk-in'
                                  : 'Online'}
                              </span>

                            </div>

                            <div className="min-w-0 sm:col-span-2 lg:col-span-3">

                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Assisted By
                              </p>

                              <p className="mt-1 break-words text-sm font-bold text-slate-700">
                                {task.assisted_by_user?.name || 'Not specified'}
                              </p>

                            </div>

                          </div>

                        </div>


                        {/* STATUS */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">

                          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <Settings className="h-3.5 w-3.5" />
                            Task Status
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                                task.status
                              )}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />

                              {task.status === 'in_progress'
                                ? 'In Progress'
                                : 'Confirmed'}
                            </span>

                          </div>

                          <div className="mt-3 border-t border-slate-100 pt-3">

                            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                              Appointment No.
                            </p>

                            <span
                              className={`mt-1.5 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black ${getStatusStyle(
                                task.status
                              )}`}
                            >
                              #{task.id}
                            </span>

                          </div>

                        </div>


                        {/* ASSIGNMENT */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md lg:col-span-3">

                          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <UserCog className="h-3.5 w-3.5" />
                            Assignment
                          </div>

                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <div className="min-w-0">

                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Assigned Technician
                              </p>

                              <p className="mt-1 break-words text-sm font-black text-slate-950">
                                {task.technician?.name || 'Not assigned'}
                              </p>

                            </div>

                            <div className="min-w-0">

                              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                                Assigned Role
                              </p>

                              <p className="mt-1 break-words text-sm font-bold text-blue-600">
                                {task.technician_role || 'Not assigned'}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* =================================================
                          LIVE SERVICE PROGRESS
                      ================================================= */}
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <Gauge className="h-4 w-4" />
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  Live Service Progress
                                </h4>

                                <p className="text-xs text-slate-500">
                                  Updates automatically when the service status changes.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                            </span>
                            LIVE
                          </div>
                        </div>

                        <div className="mt-5">
                          {(() => {
                            const steps = getProgressSteps(task)
                            const latest = getLatestProgress(task)

                            return (
                              <>
                                {/* PERCENTAGE PROGRESS BAR */}
                                {(() => {
                                  const progressPercent =
                                    task.status === 'completed'
                                      ? 100
                                      : task.status === 'in_progress'
                                        ? 66
                                        : task.status === 'confirmed'
                                          ? 33
                                          : 0

                                  return (
                                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                      <div className="flex items-center justify-between gap-3">
                                        <div>
                                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Service Completion
                                          </p>
                                          <p className="mt-1 text-[11px] text-slate-400">
                                            Progress updates automatically as the service moves through each stage.
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-2xl font-black text-slate-900">
                                            {progressPercent}%
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
                                        <div
                                          className={`relative h-full rounded-full transition-all duration-1000 ease-out ${
                                            progressPercent === 100
                                              ? 'bg-green-500'
                                              : progressPercent === 66
                                                ? 'bg-red-500'
                                                : progressPercent === 33
                                                  ? 'bg-amber-500'
                                                  : 'bg-slate-300'
                                          }`}
                                          style={{ width: `${progressPercent}%` }}
                                        >
                                          {task.status === 'in_progress' && (
                                            <div className="absolute inset-0 overflow-hidden rounded-full">
                                              <div
                                                className="absolute inset-y-0 w-1/3 -skew-x-12 bg-white/30"
                                                style={{
                                                  left: '-35%',
                                                  animation: 'progressShimmer 1.4s linear infinite',
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                                        <span>0%</span>
                                        <span className={task.status === 'confirmed' ? 'text-amber-600' : ''}>33%</span>
                                        <span className={task.status === 'in_progress' ? 'text-red-600' : ''}>66%</span>
                                        <span className={task.status === 'completed' ? 'text-green-600' : ''}>100%</span>
                                      </div>
                                    </div>
                                  )
                                })()}

                                <div className="relative">
                                  <div className="absolute left-4 right-4 top-4 hidden h-0.5 bg-slate-200 sm:block" />

                                  <div
                                    className={`absolute left-4 top-4 hidden h-0.5 bg-green-500 transition-all duration-700 sm:block ${
                                      task.status === 'in_progress'
                                        ? 'w-1/2'
                                        : task.status === 'completed'
                                          ? 'right-4 w-auto'
                                          : 'w-0'
                                    }`}
                                  />

                                  <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    {steps.map((step, index) => {
                                      const active =
                                        step.key === task.status

                                      return (
                                        <div
                                          key={step.key}
                                          className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
                                        >
                                          <div
                                            className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                                              step.done
                                                ? 'border-green-500 bg-green-500 text-white'
                                                : active
                                                  ? 'border-red-500 bg-white text-red-600'
                                                  : 'border-slate-300 bg-white text-slate-400'
                                            }`}
                                          >
                                            {step.done ? (
                                              <Check className="h-4 w-4" />
                                            ) : (
                                              <span className="text-xs font-bold">
                                                {index + 1}
                                              </span>
                                            )}
                                          </div>

                                          <div className="min-w-0">
                                            <p
                                              className={`text-xs font-bold ${
                                                step.done
                                                  ? 'text-green-700'
                                                  : active
                                                    ? 'text-red-600'
                                                    : 'text-slate-500'
                                              }`}
                                            >
                                              {step.label}
                                            </p>

                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                              {step.message}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>

                                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm ring-1 ring-slate-200">
                                      {task.status === 'in_progress' ? (
                                        <Settings className="h-4 w-4 animate-pulse" />
                                      ) : task.status === 'completed' ? (
                                        <CircleCheck className="h-4 w-4" />
                                      ) : (
                                        <Clock3 className="h-4 w-4" />
                                      )}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                                        Latest Update
                                      </p>

                                      <p className="mt-1 text-sm font-bold text-slate-800">
                                        {latest.message}
                                      </p>

                                      {latest.created_at && (
                                        <p className="mt-1 text-[11px] text-slate-400">
                                          {formatDateTime(latest.created_at)}
                                        </p>
                                      )}

                                      {progressLoading[task.id] && (
                                        <p className="mt-1 text-[11px] text-slate-400">
                                          Syncing live progress...
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {(progressHistory[task.id] || []).length > 0 && (
                                  <details className="mt-4 rounded-xl border border-slate-200 bg-white">
                                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-bold text-slate-600">
                                      View complete progress history
                                    </summary>

                                    <div className="border-t border-slate-100 px-4 py-3">
                                      <div className="space-y-3">
                                        {(progressHistory[task.id] || [])
                                          .slice()
                                          .reverse()
                                          .map(entry => (
                                            <div
                                              key={entry.id}
                                              className="flex gap-3"
                                            >
                                              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />

                                              <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700">
                                                  {entry.status === 'in_progress'
                                                    ? 'Service In Progress'
                                                    : entry.status === 'completed'
                                                      ? 'Completed'
                                                      : entry.status === 'confirmed'
                                                        ? 'Confirmed'
                                                        : entry.status}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                  {entry.message}
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-slate-400">
                                                  {formatDateTime(entry.created_at)}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  </details>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>


                      {/* CUSTOMER NOTES */}

                      {task.notes && (
                        <div className="mt-5 w-full min-w-0 max-w-full overflow-hidden border-t border-slate-200 pt-5">

                          <div className="flex min-w-0 max-w-full items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="min-w-0 truncate">Customer Notes</span>
                          </div>

                          <div className="mt-2 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
                            <p className="m-0 w-full min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm font-medium leading-relaxed text-slate-700">
                              {task.notes}
                            </p>
                          </div>

                        </div>
                      )}


                      {/* SERVICE ADDRESS */}

                      <div className="mt-5 w-full min-w-0 max-w-full overflow-hidden border-t border-slate-200 pt-5">

                        <div className="flex min-w-0 max-w-full items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5 shrink-0"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                            />

                            <circle
                              cx="12"
                              cy="9"
                              r="2.5"
                            />
                          </svg>

                          <span className="min-w-0 break-words">
                            Service Address
                          </span>

                        </div>

                        <div className="mt-2 w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">

                          <p className="m-0 w-full min-w-0 max-w-full whitespace-pre-wrap break-words text-sm font-medium leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                            {task.customer_address || 'Service address not specified'}
                          </p>

                        </div>

                      </div>


                      {/* =================================================
                          INVENTORY
                      ================================================= */}

                      <div className="mt-5 border-t border-slate-200 pt-5">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                              <Package className="h-3.5 w-3.5" />
                              Parts / Inventory Used
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              Parts recorded for this service
                            </p>

                          </div>

                          {task.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTask(task)
                                setSelectedInventoryItem(null)
                                setServiceItemQuantity(1)
                                setShowAddItemDialog(true)
                              }}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:w-auto"
                            >
                              <Plus className="h-4 w-4" />
                              Add Inventory Item
                            </button>
                          )}

                        </div>


                        <div className="mt-4">

                          {(serviceItems[task.id] || []).length === 0 ? (

                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">

                              <Package className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                              <p className="text-sm font-medium text-slate-500">
                                No inventory items added yet.
                              </p>

                              {task.status === 'in_progress' && (
                                <p className="mt-1 text-xs text-slate-400">
                                  Add the parts used during this service.
                                </p>
                              )}

                            </div>

                          ) : (

                            <div className="space-y-3">

                              {(serviceItems[task.id] || []).map(item => (

                                <div
                                  key={item.id}
                                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
                                >

                                  <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                    <div>

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Item
                                      </p>

                                      <p className="mt-1 break-words font-bold text-slate-900">
                                        {item.item_name}
                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Quantity
                                      </p>

                                      <p className="mt-1 font-bold text-slate-700">
                                        {Number(item.quantity)}
                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Unit Price
                                      </p>

                                      <p className="mt-1 font-bold text-slate-700">
                                        ₱
                                        {Number(
                                          item.unit_price || 0
                                        ).toLocaleString(
                                          undefined,
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}
                                      </p>

                                    </div>

                                    <div>

                                      <p className="text-xs font-bold uppercase text-slate-400">
                                        Subtotal
                                      </p>

                                      <p className="mt-1 font-bold text-red-600">
                                        ₱
                                        {Number(
                                          item.subtotal || 0
                                        ).toLocaleString(
                                          undefined,
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                  {task.status === 'in_progress' && (
                                    <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveServiceItem(item)
                                        }
                                        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 transition hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Remove
                                      </button>

                                    </div>
                                  )}

                                </div>

                              ))}

                              <div className="flex justify-end pt-2">

                                <div className="flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 sm:w-auto sm:justify-end sm:px-5">

                                  <span className="text-sm font-medium text-slate-600 sm:mr-4">
                                    Parts Total
                                  </span>

                                  <span className="text-xl font-black text-red-700">
                                    ₱
                                    {(
                                      serviceItems[task.id] || []
                                    )
                                      .reduce(
                                        (total, item) =>
                                          total +
                                          Number(
                                            item.subtotal || 0
                                          ),
                                        0
                                      )
                                      .toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )}
                                  </span>

                                </div>

                              </div>

                            </div>

                          )}

                        </div>


                        {task.status === 'in_progress' && (
                          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                            <div className="flex items-start gap-3">

                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                              </div>

                              <div>

                                <p className="text-sm font-bold text-amber-800">
                                  Inventory deduction notice
                                </p>

                                <p className="mt-1 text-xs leading-relaxed text-amber-700">
                                  Adding or removing an item does not deduct
                                  inventory. Inventory will only be deducted
                                  when you successfully complete the service.
                                </p>

                              </div>

                            </div>

                          </div>
                        )}

                      </div>


                      {/* =================================================
                          ATTACHMENTS
                      ================================================= */}

                      <div className="mt-5 border-t border-slate-200 pt-5">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                              <Paperclip className="h-3.5 w-3.5" />
                              Service Attachments
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              Photos, reports, diagnostics, or other service files
                            </p>

                          </div>

                          {task.status === 'in_progress' && (
                            <label
                              className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 sm:w-auto ${
                                uploadingAttachment
                                  ? 'cursor-not-allowed opacity-50'
                                  : ''
                              }`}
                            >

                              <Upload className="h-4 w-4" />

                              {uploadingAttachment
                                ? 'Uploading...'
                                : 'Add Attachment'}

                              <input
                                type="file"
                                className="hidden"
                                disabled={uploadingAttachment}
                                onChange={e => {

                                  const file =
                                    e.target.files?.[0]

                                  if (file) {
                                    handleUploadAttachment(
                                      task,
                                      file
                                    )
                                  }

                                  e.target.value = ''

                                }}
                              />

                            </label>
                          )}

                        </div>


                        <div className="mt-4">

                          {(attachments[task.id] || []).length === 0 ? (

                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center">

                              <Paperclip className="mx-auto mb-2 h-6 w-6 text-slate-300" />

                              <p className="text-sm font-medium text-slate-500">
                                No attachments added.
                              </p>

                              {task.status === 'in_progress' && (
                                <p className="mt-1 text-xs text-slate-400">
                                  Attach photos, reports, or other files if needed.
                                </p>
                              )}

                            </div>

                          ) : (

                            <div className="space-y-3">

                              {(attachments[task.id] || []).map(
                                attachment => (

                                  <div
                                    key={attachment.id}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md"
                                  >

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                      <div className="flex min-w-0 items-start gap-3">

                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                          <Paperclip className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0">

                                          <p className="break-all font-bold text-slate-900">
                                            {attachment.file_name}
                                          </p>

                                          <p className="mt-1 text-xs text-slate-500">
                                            {attachment.uploaded_by_name ||
                                              'Unknown user'}

                                            {attachment.uploaded_by_role
                                              ? ` • ${attachment.uploaded_by_role}`
                                              : ''}
                                          </p>

                                          {attachment.created_at && (
                                            <p className="mt-1 text-xs text-slate-400">
                                              Created:{' '}
                                              {new Date(
                                                attachment.created_at
                                              ).toLocaleDateString(
                                                undefined,
                                                {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                                }
                                              )}
                                              {' • '}
                                              {new Date(
                                                attachment.created_at
                                              ).toLocaleTimeString([], {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true,
                                              })}
                                            </p>
                                          )}

                                          {attachment.file_size && (
                                            <p className="mt-1 text-xs text-slate-400">
                                              {(
                                                attachment.file_size /
                                                1024 /
                                                1024
                                              ).toFixed(2)}{' '}
                                              MB
                                            </p>
                                          )}

                                        </div>

                                      </div>

                                      <div className="flex w-full gap-2 sm:w-auto">

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleViewAttachment(
                                              attachment
                                            )
                                          }
                                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 sm:flex-none"
                                        >
                                          <Eye className="h-4 w-4" />
                                          View
                                        </button>

                                        {task.status === 'in_progress' && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveAttachment(
                                                attachment
                                              )
                                            }
                                            disabled={uploadingAttachment}
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:bg-slate-300 sm:flex-none"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            Remove
                                          </button>
                                        )}

                                      </div>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </div>

                      </div>

                      {/* =================================================
                          VEHICLE AI CHECK
                      ================================================= */}

                      <div>
                        <div className="flex items-center gap-2 text-xs mt-4 font-bold uppercase tracking-wide text-slate-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Vehicle AI Verification
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-600">
                          AI-assisted vehicle classification and eligibility verification
                        </p>
                      </div>

                      <div className="mt-4 min-w-0 rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-3.5 shadow-sm sm:col-span-2">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo-500">

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="h-3.5 w-3.5 shrink-0"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 3 4.5 6v5.5c0 4.7 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.8 7.5-9.5V6L12 3Z"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m8.5 12 2.2 2.2 4.8-5"
                                />
                              </svg>

                              Vehicle AI Eligibility Check

                            </p>

                            <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                              AI-assisted vehicle classification from the customer attachment.
                            </p>

                          </div>

                          {/* STATUS */}

                          {task.vehicle_eligibility === 'eligible' ? (

                            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-extrabold text-green-700">

                              <span className="h-2 w-2 rounded-full bg-green-500" />

                              Eligible

                            </span>

                          ) : task.vehicle_eligibility === 'not_eligible' ? (

                            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-red-700">

                              <span className="h-2 w-2 rounded-full bg-red-500" />

                              Not Eligible

                            </span>

                          ) : (

                            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-extrabold text-amber-700">

                              <span className="h-2 w-2 rounded-full bg-amber-500" />

                              Admin Review

                            </span>

                          )}

                        </div>

                        {/* AI RESULT */}

                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">

                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                              Detected Vehicle
                            </p>

                            <p className="mt-1 text-sm font-black capitalize text-slate-800">
                              {task.vehicle_type
                                ? task.vehicle_type.replace(/_/g, ' ')
                                : 'Not detected'}
                            </p>

                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                              AI Confidence
                            </p>

                            <p className="mt-1 text-sm font-black text-slate-800">

                              {task.vehicle_detection_confidence !== null &&
                              task.vehicle_detection_confidence !== undefined
                                ? `${(
                                    Number(
                                      task.vehicle_detection_confidence
                                    ) * 100
                                  ).toFixed(1)}%`
                                : 'N/A'}

                            </p>

                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

                            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
                              Eligibility
                            </p>

                            <p
                              className={`mt-1 text-sm font-black ${
                                task.vehicle_eligibility === 'eligible'
                                  ? 'text-green-600'
                                  : task.vehicle_eligibility === 'not_eligible'
                                  ? 'text-red-600'
                                  : 'text-amber-600'
                              }`}
                            >

                              {task.vehicle_eligibility === 'eligible'
                                ? 'Eligible'
                                : task.vehicle_eligibility === 'not_eligible'
                                ? 'Not Eligible'
                                : 'Admin Review'}

                            </p>

                          </div>

                        </div>

                        {/* AI MESSAGE */}

                        <div
                          className={`mt-2.5 rounded-xl border px-3 py-2.5 ${
                            task.vehicle_eligibility === 'eligible'
                              ? 'border-green-100 bg-green-50'
                              : task.vehicle_eligibility === 'not_eligible'
                              ? 'border-red-100 bg-red-50'
                              : 'border-amber-100 bg-amber-50'
                          }`}
                        >

                          <p
                            className={`text-xs font-bold leading-5 ${
                              task.vehicle_eligibility === 'eligible'
                                ? 'text-green-700'
                                : task.vehicle_eligibility === 'not_eligible'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >

                            {task.vehicle_detection_message ||
                              'Vehicle AI check has not been completed yet.'}

                          </p>

                        </div>

                        {/* DETECTION TIME */}

                        {task.vehicle_detected_at && (
                          <p className="mt-2 break-words text-[10px] font-medium leading-4 text-slate-400">

                            AI check completed{' '}

                            {new Date(
                              task.vehicle_detected_at
                            ).toLocaleString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}

                          </p>
                        )}

                      </div>


                      {/* =================================================
                          SERVICE MESSAGING
                      ================================================= */}

                      <div
                        className={`mt-5 border-t pt-5 ${
                          taskUnread > 0
                            ? 'border-red-200'
                            : 'border-slate-200'
                        }`}
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                                <MessageCircle className="h-3.5 w-3.5" />
                                Customer Messaging
                              </div>

                              {taskUnread > 0 && (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-1 text-[10px] font-bold text-white">
                                  {taskUnread > 99
                                    ? '99+'
                                    : taskUnread}
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-600">
                              Communicate directly with this customer about this service.
                            </p>

                          </div>


                          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

                            {taskConversation && (
                              <span
                                className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold ${
                                  taskUnread > 0
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-slate-200 bg-slate-100 text-slate-600'
                                }`}
                              >
                                {taskUnread > 0
                                  ? `${taskUnread} unread`
                                  : 'No unread messages'}
                              </span>
                            )}

                            {taskConversation ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openConversationForTask(task)
                                }
                                className={`relative inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition sm:w-auto ${
                                  isMessagingOpen
                                    ? 'bg-slate-700 text-white hover:bg-slate-800'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                              >

                                <MessageCircle className="h-4 w-4" />

                                {isMessagingOpen
                                  ? 'Hide Messages'
                                  : 'Open Messages'}

                                {taskUnread > 0 &&
                                  !isMessagingOpen && (
                                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-900 ring-2 ring-white">
                                      {taskUnread > 99
                                        ? '99+'
                                        : taskUnread}
                                    </span>
                                  )}

                              </button>
                            ) : (
                              <span className="text-center text-xs italic text-slate-400 sm:text-right">
                                No conversation available
                              </span>
                            )}

                          </div>

                        </div>


                        {/* INLINE MESSAGE AREA */}

                        {isMessagingOpen &&
                          taskConversation && (

                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                              {/* MESSAGE HEADER */}

                              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">

                                <div className="flex items-start justify-between gap-4">

                                  <div className="flex min-w-0 items-center gap-3">

                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-50 text-red-600">

                                      {taskConversation.customer?.avatar_url ? (
                                        <img
                                          src={
                                            taskConversation.customer.avatar_url
                                          }
                                          alt={
                                            taskConversation.customer?.name ||
                                            'Customer'
                                          }
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <UserRound className="h-5 w-5" />
                                      )}

                                    </div>

                                    <div className="min-w-0">

                                      <div className="flex flex-wrap items-center gap-2">

                                        <h4 className="truncate font-bold text-slate-900">
                                          {taskConversation.customer?.name ||
                                            task.customer_name ||
                                            task.full_name ||
                                            'Customer'}
                                        </h4>

                                        <span className="text-slate-300">
                                          /
                                        </span>

                                        <span className="text-xs font-bold text-red-600">
                                          Service Team
                                        </span>

                                      </div>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {task.service_type ||
                                          'Service conversation'}
                                      </p>

                                    </div>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={closeConversationForTask}
                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600"
                                    title="Close messages"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>

                                </div>


                                {/* STATUS / WARRANTY */}

                                <div
                                  className={`mt-4 rounded-xl border p-3 ${
                                    taskWarranty?.expired
                                      ? 'border-slate-200 bg-white'
                                      : 'border-green-200 bg-green-50'
                                  }`}
                                >

                                  <div className="flex items-start gap-3">

                                    <div
                                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                                        taskWarranty?.expired
                                          ? 'bg-slate-100 text-slate-500'
                                          : 'bg-green-100 text-green-600'
                                      }`}
                                    >
                                      {taskWarranty?.expired ? (
                                        <LockKeyhole className="h-4 w-4" />
                                      ) : (
                                        <ShieldCheck className="h-4 w-4" />
                                      )}
                                    </div>

                                    <div className="min-w-0">

                                      <div className="flex flex-wrap items-center gap-2">

                                        <span
                                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${
                                            taskStatus?.color ||
                                            'bg-slate-100 text-slate-600 border-slate-200'
                                          }`}
                                        >
                                          {taskStatus?.icon}
                                          {taskStatus?.label}
                                        </span>

                                        {taskWarranty?.expired ? (
                                          <span className="text-xs font-bold text-slate-600">
                                            Conversation history available
                                          </span>
                                        ) : (
                                          <span className="text-xs font-bold text-green-700">
                                            Messaging available
                                          </span>
                                        )}

                                      </div>

                                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                        {taskWarranty?.label ||
                                          'Messaging availability is controlled by the service policy.'}
                                      </p>

                                      {task.completed_at && (
                                        <p className="mt-1 text-[11px] text-slate-400">
                                          Service completed:{' '}
                                          {formatDateTime(
                                            task.completed_at
                                          )}
                                        </p>
                                      )}

                                    </div>

                                  </div>

                                </div>

                              </div>


                              {/* MESSAGE HISTORY */}

                              <div
                                ref={messagesContainerRef}
                                className="max-h-[420px] overflow-y-auto bg-slate-50 px-4 py-5 sm:px-5"
                                onScroll={async e => {

                                  const target =
                                    e.currentTarget

                                  if (
                                    target.scrollHeight -
                                      target.scrollTop -
                                      target.clientHeight <
                                    120
                                  ) {
                                    await markConversationMessagesRead(
                                      taskConversation.id,
                                      taskMessages
                                    )
                                  }

                                }}
                              >

                                {conversationLoading &&
                                taskMessages.length === 0 ? (

                                  <div className="py-8 text-center">

                                    <LoaderCircle className="mx-auto mb-3 h-7 w-7 animate-spin text-red-600" />

                                    <p className="text-sm font-medium text-slate-600">
                                      Loading messages...
                                    </p>

                                  </div>

                                ) : taskMessages.length === 0 ? (

                                  <div className="py-8 text-center">

                                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                                      <MessageCircle className="h-6 w-6" />
                                    </div>

                                    <p className="font-bold text-slate-700">
                                      No messages yet
                                    </p>

                                    <p className="mt-1 text-sm text-slate-400">
                                      Start the conversation with the customer.
                                    </p>

                                  </div>

                                ) : (

                                  <div className="space-y-3">

                                    {taskMessages.map(message => {
  const mine =
    String(message.sender_id) ===
    String(technician?.id)

  const senderRole = String(
    message.sender?.role || ''
  ).toLowerCase()

  const isCustomerMessage =
    senderRole === 'customer' ||
    String(message.sender_id) ===
      String(taskConversation.customer?.id)

 const isStaffMessage = mine

  const senderName =
    message.sender?.name ||
    (isCustomerMessage
      ? taskConversation.customer?.name ||
        task.customer_name ||
        'Customer'
      : 'Staff')

  const senderAvatar =
    message.sender?.avatar_url ||
    (isCustomerMessage
      ? taskConversation.customer?.avatar_url
      : null)

  return (
    <div
      key={message.id}
      className={`flex ${
        isStaffMessage
          ? 'justify-end'
          : 'justify-start'
      }`}
    >
      <div
        className={`flex max-w-[95%] items-end gap-2 sm:max-w-[78%] ${
          isStaffMessage
            ? 'flex-row-reverse'
            : 'flex-row'
        }`}
      >

        {/* =====================================================
            SENDER PROFILE PICTURE
        ===================================================== */}

        <div className="relative h-8 w-8 flex-shrink-0">
  {/* PROFILE PICTURE */}
  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-red-50 text-red-600 shadow-sm">
    {senderAvatar ? (
      <img
        src={senderAvatar}
        alt={senderName}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <UserRound className="h-4 w-4" />
      </div>
    )}
  </div>

  {/* ONLINE / OFFLINE INDICATOR */}
  <span
   className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
  isUserOnline(
    userPresence[
      String(message.sender_id)
    ]
  )
    ? 'bg-green-500'
    : 'bg-gray-400'
}`}
   title={
  isUserOnline(
    userPresence[
      String(message.sender_id)
    ]
  )
    ? 'Online'
    : 'Offline'
}
  />
</div>
        {/* =====================================================
            MESSAGE CONTENT
        ===================================================== */}

        <div
          className={`flex max-w-[calc(100%-40px)] flex-col ${
            isStaffMessage
              ? 'items-end'
              : 'items-start'
          }`}
        >
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm ${
              isStaffMessage
                ? 'rounded-br-md bg-red-600 text-white'
                : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
            }`}
          >
            {message.deleted_at ? (
              <p
                className={`text-sm italic ${
                  isStaffMessage
                    ? 'text-red-100'
                    : 'text-slate-400'
                }`}
              >
                Message deleted
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                {message.message}
              </p>
            )}
          </div>

          {/* =====================================================
              MESSAGE META
          ===================================================== */}

          <div
            className={`mt-1 flex items-center gap-2 px-1 ${
              isStaffMessage
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            <span className="text-[10px] text-slate-400">
              {formatDateTime(
                message.created_at
              )}
            </span>

            {/* TECHNICIAN'S OWN MESSAGE */}
            {mine && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                <Check className="h-3 w-3" />
                Sent
              </span>
            )}

            {/* CUSTOMER MESSAGE THAT TECHNICIAN HAS READ */}
            {!mine &&
              isCustomerMessage &&
              message.isReadByMe && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600">
                  <Check className="h-3 w-3" />
                  Read
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  )
})}

                                  </div>

                                )}

                              </div>


                              {/* COMPOSER */}

                              <div className="border-t border-slate-200 bg-white p-4">

                                {taskWarranty?.expired ? (

                                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <div className="flex items-start gap-3">

                                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500">
                                        <LockKeyhole className="h-4 w-4" />
                                      </div>

                                      <div>

                                        <p className="text-sm font-bold text-slate-700">
                                          Messaging is closed
                                        </p>

                                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                          You can still view the complete
                                          conversation history. New messages
                                          cannot be sent because the messaging
                                          period has ended.
                                        </p>

                                      </div>

                                    </div>

                                  </div>

                                ) : (

                                  <>

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">

                                      <textarea
                                        value={
                                          messageText[
                                            taskConversation.id
                                          ] || ''
                                        }
                                        onChange={e =>
                                          setMessageText(prev => ({
                                            ...prev,
                                            [taskConversation.id]:
                                              e.target.value,
                                          }))
                                        }
                                        onKeyDown={e =>
                                          handleMessageKeyDown(
                                            e,
                                            task
                                          )
                                        }
                                        disabled={
                                          sendingMessage[
                                            taskConversation.id
                                          ] ||
                                          taskConversation.canSend === false
                                        }
                                        rows={2}
                                        placeholder={
                                          taskConversation.canSend === false
                                            ? 'Messaging is currently unavailable...'
                                            : 'Type a message to the customer...'
                                        }
                                        className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100 disabled:text-slate-400"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSendMessageForTask(
                                            task
                                          )
                                        }
                                        disabled={
                                          sendingMessage[
                                            taskConversation.id
                                          ] ||
                                          !(
                                            messageText[
                                              taskConversation.id
                                            ] || ''
                                          ).trim() ||
                                          taskConversation.canSend === false
                                        }
                                        className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto"
                                      >

                                        {sendingMessage[
                                          taskConversation.id
                                        ] ? (
                                          <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Send className="h-4 w-4" />
                                        )}

                                        {sendingMessage[
                                          taskConversation.id
                                        ]
                                          ? 'Sending...'
                                          : 'Send'}

                                      </button>

                                    </div>

                                    <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                                      <p className="text-[11px] text-slate-400">
                                        Enter to send • Shift + Enter for a new line
                                      </p>

                                      {markingRead && (
                                        <p className="text-[11px] text-slate-400">
                                          Marking messages as read...
                                        </p>
                                      )}

                                    </div>

                                  </>

                                )}

                              </div>

                            </div>

                          )}

                      </div>


                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">

                        {task.status === 'confirmed' && (
                          <button
                            type="button"
                            disabled={updatingTaskId === task.id}
                            onClick={() => handleStartService(task.id)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          >
                            {updatingTaskId === task.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Starting...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Start Service
                              </>
                            )}
                          </button>
                        )}


                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCompleteService(task.id)
                            }
                            disabled={
                              completingTaskId === task.id
                            }
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 sm:w-auto ${
                              completingTaskId === task.id
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                          >

                            {completingTaskId === task.id ? (
                              <>
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Completing...
                              </>
                            ) : (
                              <>
                                <CircleCheck className="h-4 w-4" />
                                Complete Service
                              </>
                            )}

                          </button>
                        )}


                        {(task.status === 'confirmed' ||
                          task.status === 'in_progress') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointment(task)
                              setRejectionReason('')
                              setShowRejectModal(true)
                            }}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 sm:w-auto"
                          >
                            <Ban className="h-4 w-4" />
                            Cancel Service
                          </button>
                        )}

                      </div>

                    </article>

                  )

                })}

              </div>

            )}

          </div>

        </section>

      </main>


      {/* =====================================================
          ADD INVENTORY MODAL
      ===================================================== */}

      {showAddItemDialog && selectedTask && (

        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">

            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Package className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Add Inventory Item
                  </h2>

                  <p className="text-sm font-medium text-slate-600">
                    Add a part used for this service
                  </p>

                </div>

              </div>

            </div>


            <div className="p-5 sm:p-6">

              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Service
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {selectedTask.service_type || 'Service'}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Customer:{' '}
                  {selectedTask.customer_name ||
                    'Unknown Customer'}
                </p>

              </div>


              <label className="mb-2 block text-sm font-bold text-slate-700">
                Inventory Item
              </label>

              <select
                value={selectedInventoryItem?.id || ''}
                onChange={e => {

                  const item =
                    inventoryItems.find(
                      inventory =>
                        String(inventory.id) ===
                        e.target.value
                    )

                  setSelectedInventoryItem(
                    item || null
                  )

                }}
                className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >

                <option value="">
                  Select inventory item
                </option>

                {inventoryItems.map(item => (
                  <option
                    key={item.id}
                    value={item.id}
                    disabled={Number(item.quantity) <= 0}
                  >
                    {item.name} — Stock: {item.quantity} — ₱
                    {Number(item.price || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </option>
                ))}

              </select>


              {selectedInventoryItem && (

                <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-4">

                  <div className="flex justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-xs font-bold uppercase text-orange-600">
                        Selected Item
                      </p>

                      <p className="mt-1 break-words font-bold text-slate-900">
                        {selectedInventoryItem.name}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-slate-500">
                        Available
                      </p>

                      <p className="font-bold text-orange-600">
                        {selectedInventoryItem.quantity}
                      </p>

                    </div>

                  </div>


                  <div className="mt-3 border-t border-orange-200 pt-3">

                    <p className="text-xs text-slate-500">
                      Unit Price
                    </p>

                    <p className="font-bold text-slate-900">
                      ₱
                      {Number(
                        selectedInventoryItem.price || 0
                      ).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                  </div>

                </div>

              )}


              <label className="mb-2 block text-sm font-bold text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={serviceItemQuantity}
                onChange={e =>
                  setServiceItemQuantity(
                    e.target.value
                  )
                }
                className="mb-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />


              {selectedInventoryItem && (

                <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">

                  <span className="text-sm font-medium text-slate-600">
                    Subtotal
                  </span>

                  <span className="text-xl font-bold text-red-600">
                    ₱
                    {(
                      Number(serviceItemQuantity || 0) *
                      Number(
                        selectedInventoryItem.price || 0
                      )
                    ).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>

                </div>

              )}


              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">

                <div className="flex items-start gap-2">

                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />

                  <p className="text-xs leading-relaxed text-amber-800">
                    <strong>Important:</strong>{' '}
                    Adding this item only records it for
                    the service. Inventory stock will not
                    be deducted until the service is
                    successfully completed.
                  </p>

                </div>

              </div>


              <div className="flex flex-col-reverse gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemDialog(false)
                    setSelectedInventoryItem(null)
                    setServiceItemQuantity(1)
                  }}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAddServiceItem}
                  disabled={
                    itemsLoading ||
                    !selectedInventoryItem
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >

                  {itemsLoading && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}

                  {itemsLoading
                    ? 'Adding...'
                    : 'Add Item'}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          CANCEL SERVICE MODAL
      ===================================================== */}

      {showRejectModal &&
        selectedAppointment && (

          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">

            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">

              {/* HEADER */}

              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-100 text-red-600 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_20px_rgba(220,38,38,0.16)]">
                    <Ban
                      className="h-5 w-5"
                      strokeWidth={2.3}
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h2 className="text-lg font-bold text-slate-900">
                      Cancel Service
                    </h2>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      Please provide a reason for cancelling this service.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectModal(false)
                      setSelectedAppointment(null)
                      setRejectionReason('')
                    }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all duration-200 hover:scale-110 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100"
                    aria-label="Close cancellation dialog"
                    title="Close"
                  >
                    <X
                      className="h-5 w-5"
                      strokeWidth={2.2}
                    />
                  </button>

                </div>

              </div>


              <div className="px-5 py-5 sm:px-6">

                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Customer
                      </p>

                      <p className="mt-1 break-words font-bold text-slate-900">
                        {selectedAppointment.customer_name ||
                          selectedAppointment.full_name ||
                          'Unknown Customer'}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Service
                      </p>

                      <p className="mt-1 break-words font-bold text-slate-800">
                        {selectedAppointment.service_type ||
                          'Service not specified'}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Schedule
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedAppointment.appointment_date ||
                          'Not specified'}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Time
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatTime(
                          selectedAppointment.appointment_time
                        )}
                      </div>

                    </div>

                    {/* BOOKING SOURCE */}

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Booking Source
                      </p>

                      <div className="mt-1">

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                            selectedAppointment.booking_source === 'walkin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {selectedAppointment.booking_source === 'walkin'
                            ? 'Walk-in'
                            : 'Online'}
                        </span>

                      </div>

                    </div>

                    {/* ASSISTED BY */}

                    <div>

                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        Assisted By
                      </p>

                      <p className="mt-1 break-words text-sm font-bold text-slate-700">
                        {selectedAppointment.assisted_by_user?.name ||
                          'Not specified'}
                      </p>

                    </div>

                    {/* APPOINTMENT NUMBER */}

                    <div className="mt-4 border-t border-slate-100 pt-3">

                      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-500">
                        <Settings className="h-3.5 w-3.5" />
                        Appointment no.
                      </div>

                      <span
                        className={`mt-1.5 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black ${getStatusStyle(
                          selectedAppointment.status
                        )}`}
                      >
                        #{selectedAppointment.id}
                      </span>

                    </div>

                  </div>

                </div>


                <label className="block text-sm font-bold text-slate-700">
                  Reason for Cancellation
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={e =>
                    setRejectionReason(
                      e.target.value
                    )
                  }
                  placeholder="Enter the reason for cancelling this service..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />

                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  This reason will be recorded with the appointment
                  together with the date and time.
                </p>


                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">

                  <div className="flex items-start gap-2">

                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />

                    <p className="text-xs leading-relaxed text-amber-800">
                      This action will permanently record the
                      cancellation reason for this service.
                    </p>

                  </div>

                </div>

              </div>


              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:px-6">

                <button
                  type="button"
                  disabled={cancellingAppointmentId !== null}
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedAppointment(null)
                    setRejectionReason('')
                  }}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Keep Appointment
                </button>

                <button
                  type="button"
                  disabled={
                    !rejectionReason.trim() ||
                    cancellingAppointmentId !== null
                  }
                  onClick={async () => {
                    if (!selectedAppointment) return

                    const reason = rejectionReason.trim()

                    if (!reason) return

                    setCancellingAppointmentId(
                      selectedAppointment.id
                    )

                    try {
                      await updateStatus(
                        selectedAppointment.id,
                        'cancelled',
                        reason
                      )

                      setShowRejectModal(false)
                      setSelectedAppointment(null)
                      setRejectionReason('')
                    } catch (error) {
                      console.error(
                        'Cancellation error:',
                        error
                      )
                    } finally {
                      setCancellingAppointmentId(null)
                    }
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {cancellingAppointmentId === selectedAppointment?.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      Confirm Cancellation
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  )

}