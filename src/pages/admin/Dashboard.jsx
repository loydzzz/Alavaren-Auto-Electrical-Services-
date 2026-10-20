import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useNavigate } from "react-router-dom"
import { FaBell } from "react-icons/fa"
import { useRef } from "react"
import { FaCommentDots } from "react-icons/fa"
import React from "react"
import AnnouncementBanner from '../../components/AnnouncementBanner'
import toast from "react-hot-toast"


import {
  FaCalendarAlt,
  FaBoxOpen,
  FaUserCircle,
  FaSignOutAlt,
  FaCheck,
  FaTrashAlt,
  FaCircle,
  FaUserCog,
  FaBolt,
  FaWrench,
} from 'react-icons/fa'
import { CalendarDays, Package, Wrench, Users, ShieldAlert} from "lucide-react";
import {
  User,
  Car,
  Hash,
  Clock3,
  CheckCircle2,
  CreditCard,
  Banknote,
  Archive,
  MessageCircle,
  XCircle,
  Trash2,
  Paperclip,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  UserCog,
  CircleCheck,
  LoaderCircle,
  FolderArchive,
  ArrowRight,
  AlertCircle,
    X,
TrendingDown,
TrendingUp,
Pencil,
  ShieldCheck,
  Reply,
  Send,
  Receipt,
  Megaphone,
  UserCircle,
  Ban,
  CircleX,
  CalendarPlus,
  ArrowLeft,
  Fuel,
  Settings2,
  Battery,
  CalendarCheck,
} from "lucide-react"

function AutoOpenOnView({ onOpen, enabled }) {
  const ref = useRef(null);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    console.log("AutoOpenOnView mounted, enabled =", enabled);
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("marker visible?", entry.isIntersecting);
        if (entry.isIntersecting) onOpenRef.current();
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return <div ref={ref} aria-hidden="true" className="h-4 w-full" />;
}

export default function AdminDashboard() {

const seenAiNotices = useRef(
  (() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("seenAiNotices") || "[]"));
    } catch {
      return new Set();
    }
  })()
);

const markAiNoticeSeen = (id) => {
  if (!id) return;
  seenAiNotices.current.add(id);
  try {
    localStorage.setItem(
      "seenAiNotices",
      JSON.stringify([...seenAiNotices.current])
    );
  } catch {}
};

const autoOpenAiNotice = (appt) => {
  console.log("autoOpenAiNotice called", appt.id, {
    showVehicleEligibilityModal,
    showRejectModal,
    seen: seenAiNotices.current.has(appt.id),
  });
  if (showVehicleEligibilityModal || showRejectModal) return;
  if (seenAiNotices.current.has(appt.id)) return;

  setSelectedAppointment(appt);
  setShowVehicleEligibilityModal(true);
};



  const currentHour = new Date().getHours()

  let greeting = "Good Evening"

  if (currentHour < 12) {
    greeting = "Good Morning"
  } else if (currentHour < 18) {
    greeting = "Good Afternoon"
  }

  const [stats, setStats] = useState({
    appointments: 0,
    inventory: 0,
    tasks: 0,
    customers: 0,
  })

  const [mobileInventoryActivityIndex, setMobileInventoryActivityIndex] = useState(0);

  const [realtimeVehicleAI, setRealtimeVehicleAI] = useState({})

  const [showVehicleEligibilityModal, setShowVehicleEligibilityModal] =
  useState(false);

  


  const [recentAppointments, setRecentAppointments] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [recentInventoryActivity, setRecentInventoryActivity] = useState([])
  const [notifications, setNotifications] = useState([])
  const notificationSoundRef = useRef(null)
  const previousNotificationIdsRef = useRef(new Set())
  const processedNotificationIdsRef = useRef(
  new Set()
)


  
  const [technicians, setTechnicians] = useState([])

  const [selectedInventoryActivity, setSelectedInventoryActivity] =
  useState(null)
  

  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(Date.now())

  const [attachments, setAttachments] = useState({})
  const [uploadingAttachment, setUploadingAttachment] = useState(null)

  const [adminProfile, setAdminProfile] = useState(null)
  const [adminProfileLoading, setAdminProfileLoading] = useState(true)

  const [userRole, setUserRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)

  const [showRejectModal, setShowRejectModal] = useState(false)
const [selectedAppointment, setSelectedAppointment] = useState(null)
const [rejectionReason, setRejectionReason] = useState('')

const [showCancelDialog, setShowCancelDialog] = useState(false)
const [selectedCancelAppointment, setSelectedCancelAppointment] = useState(null)
const [cancelReason, setCancelReason] = useState('')

const [activeConversation, setActiveConversation] =
  useState(null)

const [conversationMessages, setConversationMessages] =
  useState([])

const [showChat, setShowChat] =
  useState(false)

const [loadingMessages, setLoadingMessages] =
  useState(false)
const [chatMessage, setChatMessage] =
  useState("")

  const [showMessaging, setShowMessaging] =
  useState(false)
const [isMessagingOpen, setIsMessagingOpen] =
  useState(false)
const [messagingAllowed, setMessagingAllowed] =
  useState(true)
const [warrantyEndsAt, setWarrantyEndsAt] =
  useState(null)
const activeConversationRef = useRef(null)
const showMessagingRef = useRef(false)

const [currentAuthUserId, setCurrentAuthUserId] = useState(null)
const [senderProfiles, setSenderProfiles] = useState({})
const [senderProfilesMap, setSenderProfilesMap] = useState({})

const [replyingToMessage, setReplyingToMessage] = useState(null)
const messagesContainerRef = useRef(null)
const previousMessageCountRef = useRef(0)
const previousConversationIdRef = useRef(null)

const [adminUnreadCounts, setAdminUnreadCounts] = useState({})
const [
  adminConversationMap,
  setAdminConversationMap
] = useState({})

const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null)
const [isCancellingAppointment, setIsCancellingAppointment] = useState(false)
const [isRejecting, setIsRejecting] = useState(false)


// =========================================================
// ACCOUNT MODERATION
// =========================================================

const [moderationUsers, setModerationUsers] = useState([])
const [moderationLoading, setModerationLoading] = useState(false)

const [showModerationModal, setShowModerationModal] = useState(false)
const [selectedModerationUser, setSelectedModerationUser] = useState(null)

const [moderationAction, setModerationAction] = useState(null)
const [moderationReason, setModerationReason] = useState("")
const [moderationNotes, setModerationNotes] = useState("")
const [moderationSubmitting, setModerationSubmitting] = useState(false)

const [processingAppointmentId, setProcessingAppointmentId] = useState(null);
const [processingAppointmentAction, setProcessingAppointmentAction] = useState(null);
const mobileSummaryScrollRef = useRef(null)
const serviceTaskScrollRef = useRef(null)


const [activeSummaryCard, setActiveSummaryCard] = useState(0)
const quickActionsScrollRef = useRef(null)
const [activeQuickAction, setActiveQuickAction] = useState(0)
const [moderationActiveDot, setModerationActiveDot] = useState(0)

const [serviceTaskIndex, setServiceTaskIndex] = useState(0)
const goToPreviousServiceTask = () => {
  setServiceTaskIndex((current) =>
    Math.max(current - 1, 0)
  )
}

const goToNextServiceTask = () => {
  setServiceTaskIndex((current) =>
    Math.min(
      current + 1,
      Math.max(recentAppointments.length - 1, 0)
    )
  )
}


const [inventoryActivityIndex, setInventoryActivityIndex] = useState(0);















  


  
  const navigate = useNavigate()

  // =========================================================
  // FETCH ALL DASHBOARD DATA
  // =========================================================

  async function fetchStats({
  refreshAppointments = true,
  showLoading = true,
} = {}) {
  if (showLoading) {
    setLoading(true)
  }

  try {
    const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

if (authError || !user) {
  console.error(
    "🚨 Unable to identify current admin:",
    authError
  )

  return
}


      const [
        appointmentsResult,
        inventoryResult,
        appointmentDataResult,
        inventoryDataResult,
        notificationDataResult,
        customersResult,
        technicianDataResult,
        inventoryActivityResult,
        transactionsResult,
        attachmentDataResult,    
        ] = await Promise.all([
        // Total appointments
        supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("archived", false),

        // Total inventory items
        supabase
          .from("inventory")
          .select("*", { count: "exact", head: true }),

        // Appointments
        supabase
          .from("appointments")
         .select("*")
          .eq("archived", false)
          .order("appointment_date", { ascending: false })
          .order("appointment_time", { ascending: false }),

        // Inventory
        supabase
          .from("inventory")
          .select("*"),

        // Notifications
supabase
  .from("notifications")
  .select("*")
  .eq("recipient_id", user.id)
  .order("created_at", { ascending: false }),

        // Customers
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer"),

       // Technicians + Admins
supabase
  .from("users")
  .select("id, name, email, phone, role")
  .in("role", ["technician", "admin"])
  .order("name"),


        // Inventory activity
       // Inventory activity
supabase
  .from("inventory_transactions")
  .select(`
    *,
    performer:performed_by (
      id,
      name,
      role
    )
  `)
  .order("created_at", { ascending: false })
  .limit(5),

          // Transactions / Payment Status
        // Transactions
supabase
  .from("transactions")
  .select(`
    id,
    appointment_id,
    receipt_number,
    payment_status,
    payment_method,
    total_amount,
    transaction_date
  `),

          // Service Task Attachments
        supabase
          .from("service_task_attachments")
          .select("*")
          .order("created_at", { ascending: false }),


      ])

      // =====================================================
      // CHECK ERRORS
      // =====================================================

      if (appointmentsResult.error) {
        console.error(
          "Appointments Count Error:",
          appointmentsResult.error
        )
      }

      if (inventoryResult.error) {
        console.error(
          "Inventory Count Error:",
          inventoryResult.error
        )
      }

      if (appointmentDataResult.error) {
        console.error(
          "Appointment Data Error:",
          appointmentDataResult.error
        )
      }

      if (inventoryDataResult.error) {
        console.error(
          "Inventory Data Error:",
          inventoryDataResult.error
        )
      }

      if (notificationDataResult.error) {
        console.error(
          "Notification Error:",
          notificationDataResult.error
        )
      }

      if (customersResult.error) {
        console.error(
          "Customer Error:",
          customersResult.error
        )
      }

      if (technicianDataResult.error) {
        console.error(
          "Technician Error:",
          technicianDataResult.error
        )
      }

      if (inventoryActivityResult.error) {
        console.error(
          "Inventory Activity Error:",
          inventoryActivityResult.error
        )
      }
      if (transactionsResult.error) {
  console.error(
    "Transactions Error:",
    transactionsResult.error
  )
}
if (attachmentDataResult.error) {
  console.error(
    "Service Task Attachments Error:",
    attachmentDataResult.error
  )
}



      // =====================================================
      // DATA
      // =====================================================

      const appointmentData =
        appointmentDataResult.data || []

      const inventoryData =
        inventoryDataResult.data || []

      const notificationData =
        notificationDataResult.data || []

      const technicianData =
        technicianDataResult.data || []

      const staffNameMap = {}

;(technicianData || []).forEach((staff) => {
  if (staff.id) {
    staffNameMap[staff.id] = staff.name
  }
})

const appointmentsWithAssistedNames = appointmentData.map((appt) => ({
  ...appt,
  assisted_by_name: appt.assisted_by
    ? staffNameMap[appt.assisted_by] || null
    : null,
}))



      const inventoryActivityData =
  inventoryActivityResult.data || []

const transactionsData =
  transactionsResult.data || []

  const attachmentData =
  attachmentDataResult.data || []


console.log(
  "💳 TRANSACTIONS FROM SUPABASE:",
  transactionsData
)
console.log(
  "📎 SERVICE TASK ATTACHMENTS:",
  attachmentData
)


      

      // =====================================================
      // STATS
      // =====================================================

      const activeTasks = appointmentData.filter(
        (appt) =>
          appt.status === "pending" ||
          appt.status === "confirmed" ||
          appt.status === "in_progress"
      ).length

      setStats({
        appointments:
          appointmentsResult.count || 0,

        inventory:
          inventoryResult.count || 0,

        tasks:
          activeTasks,

        customers:
          customersResult.count || 0,
      })

      

// =====================================================
// APPOINTMENTS + PAYMENT STATUS
// =====================================================


// =====================================================
// APPOINTMENTS + PAYMENT STATUS
// =====================================================

const appointmentsWithPayment =
  appointmentData.map((appointment) => {

    const transaction =
      transactionsData.find(
        (transaction) =>
          Number(transaction.appointment_id) ===
          Number(appointment.id)
      )

    return {
      ...appointment,

       assisted_by_name:
        appointment.assisted_by
          ? staffNameMap[appointment.assisted_by] || null
          : null,

      transaction_id:
        transaction?.id || null,

      receipt_number:
        transaction?.receipt_number || null,

      payment_status:
        transaction?.payment_status || "Unpaid",

      payment_method:
        transaction?.payment_method || null,

      transaction_amount:
        transaction?.total_amount || 0,
    }
  })

if (refreshAppointments) {
  setRecentAppointments(appointmentsWithPayment)
}

      // =====================================================
      // FETCH ATTACHMENTS FOR SERVICE TASKS
      // =====================================================

      const attachmentResults = await Promise.all(
        appointmentsWithPayment.map(async (appointment) => {
          const { data, error } = await supabase
            .from("service_task_attachments")
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
            .eq("appointment_id", appointment.id)
            .order("created_at", {
              ascending: false,
            })

          if (error) {
            console.error(
              `Attachment Fetch Error for Appointment ${appointment.id}:`,
              error
            )

            return {
              appointmentId: appointment.id,
              data: [],
            }
          }

          return {
            appointmentId: appointment.id,
            data: data || [],
          }
        })
      )

      const attachmentMap = {}

      attachmentResults.forEach(
        ({ appointmentId, data }) => {
          attachmentMap[appointmentId] = data
        }
      )

      setAttachments(attachmentMap)

// =========================================================
// FETCH SERVICE TASK ATTACHMENTS
// =========================================================

async function fetchAttachments(appointmentId) {
  if (!appointmentId) {
    return
  }

  const { data, error } = await supabase
    .from("service_task_attachments")
    .select("*")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(
      "Fetch Service Task Attachments Error:",
      error
    )

    return
  }

  setAttachments((current) => ({
    ...current,
    [appointmentId]: data || [],
  }))
}



      // =====================================================
      // LOW STOCK
      // =====================================================

      const lowStock = inventoryData.filter(
        (item) =>
          Number(item.quantity) <=
          Number(item.low_stock_threshold)
      )

      setLowStockItems(lowStock)

      // =====================================================
      // NOTIFICATIONS
      // =====================================================

      // =====================================================
// NOTIFICATIONS
// =====================================================

const currentNotificationIds = new Set(
  notificationData.map(
    (notification) => notification.id
  )
)

// Only check for new notifications after the
// initial notification list has already been loaded.
if (previousNotificationIdsRef.current.size > 0) {

  const hasNewNotification =
    notificationData.some(
      (notification) =>
        !previousNotificationIdsRef.current.has(
          notification.id
        )
    )

  if (hasNewNotification) {
    notificationSoundRef.current
      ?.play()
      .catch(() => {
        // Browser may block automatic audio playback.
      })
  }
}

// Remember the current notification IDs
previousNotificationIdsRef.current =
  currentNotificationIds

// Keep your existing notification state logic
setNotifications(notificationData)


      // =====================================================
      // TECHNICIANS
      // =====================================================

      setTechnicians(technicianData)

      // =====================================================
      // INVENTORY ACTIVITY
      // =====================================================

      setRecentInventoryActivity(
        inventoryActivityData
      )

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Appointments:",
        appointmentData
      )

      console.log(
        "Technicians:",
        technicianData
      )

      console.log(
        "Inventory Transactions:",
        inventoryActivityData
      )

      // VERY IMPORTANT:
      // Check technician_id values
      console.log(
        "Appointment Technician Assignments:",
        appointmentData.map((appt) => ({
          appointment_id: appt.id,
          status: appt.status,
          technician_id: appt.technician_id,
        }))
      )
    } catch (error) {
      console.error(
        "Dashboard Fetch Error:",
        error
      )
    } finally {
  if (showLoading) {
    setLoading(false)
  }
}
}





// =========================================================
// FETCH CUSTOMER MODERATION STATUS
// =========================================================

// =========================================================
// FETCH CUSTOMER MODERATION STATUS
// =========================================================

async function fetchModerationUsers() {
  setModerationLoading(true)

  try {

    // -------------------------------------------------------
    // 1. LOAD CUSTOMERS
    // -------------------------------------------------------

    const {
      data: users,
      error: usersError
    } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        role,
        avatar_url
        
      `)
      .eq("role", "customer")
      .order("name", {
        ascending: true
      })

    if (usersError) {
      throw usersError
    }


    // -------------------------------------------------------
    // 2. LOAD MODERATION RECORDS SEPARATELY
    // -------------------------------------------------------

    const userIds = (users || []).map(
      user => user.id
    )

    let moderations = []

    if (userIds.length > 0) {

      const {
        data,
        error: moderationError
      } = await supabase
        .from("account_moderations")
        .select(`
          user_id,
          status,
          warning_count,
          reason,
          banned_at,
          banned_by,
          updated_at
        `)
        .in("user_id", userIds)

      if (moderationError) {
        throw moderationError
      }

      moderations = data || []
    }


    // -------------------------------------------------------
    // 3. CREATE MODERATION MAP
    // -------------------------------------------------------

    const moderationMap = new Map()

    moderations.forEach(moderation => {

      moderationMap.set(
        moderation.user_id,
        moderation
      )

    })


    // -------------------------------------------------------
    // 4. COMBINE USERS + MODERATION
    // -------------------------------------------------------

    const formattedUsers = (users || []).map(user => {

      const moderation =
        moderationMap.get(user.id) || null

      return {

        ...user,

        moderation_status:
          moderation?.status || "healthy",

        warning_count:
          moderation?.warning_count ?? 0,

        moderation_reason:
          moderation?.reason || null,

        banned_at:
          moderation?.banned_at || null,

        banned_by:
          moderation?.banned_by || null,

        moderation_updated_at:
          moderation?.updated_at || null,

      }

    })


    // -------------------------------------------------------
    // 5. DEBUG
    // -------------------------------------------------------

    console.log(
      "CUSTOMERS:",
      users
    )

    console.log(
      "MODERATION RECORDS:",
      moderations
    )

    console.log(
      "FORMATTED MODERATION USERS:",
      formattedUsers
    )


    // -------------------------------------------------------
    // 6. UPDATE UI
    // -------------------------------------------------------

    setModerationUsers(
      formattedUsers
    )

  } catch (error) {

    console.error(
      "Moderation Fetch Error:",
      error
    )

  } finally {

    setModerationLoading(false)

  }
}





// =========================================================
// SUBMIT MODERATION ACTION
// =========================================================

async function submitModerationAction() {
  if (!selectedModerationUser) {
    return
  }

  if (!moderationReason.trim()) {
    alert("Please provide a reason.")
    return
  }

  setModerationSubmitting(true)

  try {
    let result

    if (moderationAction === "warning") {

      result = await supabase.rpc(
        "admin_issue_warning",
        {
          p_user_id:
            selectedModerationUser.id,

          p_reason:
            moderationReason.trim(),

          p_appointment_id:
            null,

          p_admin_notes:
            moderationNotes.trim() || null,
        }
      )

    } else if (moderationAction === "ban") {

      result = await supabase.rpc(
        "admin_ban_account",
        {
          p_user_id:
            selectedModerationUser.id,

          p_reason:
            moderationReason.trim(),

          p_admin_notes:
            moderationNotes.trim() || null,
        }
      )
    }

    if (result?.error) {
      console.error(
        "Moderation Action Error:",
        result.error
      )

      alert(
        result.error.message ||
        "Unable to complete moderation action."
      )

      return
    }

    alert(
      moderationAction === "warning"
        ? "Warning issued successfully."
        : "Account banned successfully."
    )

    setShowModerationModal(false)
    setSelectedModerationUser(null)
    setModerationAction(null)
    setModerationReason("")
    setModerationNotes("")

    await fetchModerationUsers()

  } catch (error) {

    console.error(
      "Moderation Submit Error:",
      error
    )

    alert(
      "An unexpected error occurred."
    )

  } finally {
    setModerationSubmitting(false)
  }
}


useEffect(() => {
  fetchModerationUsers()
}, [])







  // =========================================================
  // FETCH SERVICE TASK ATTACHMENTS
  // =========================================================

  async function fetchAttachments(appointmentId) {
    if (!appointmentId) {
      return
    }

    const { data, error } = await supabase
      .from("service_task_attachments")
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
      .eq("appointment_id", appointmentId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(
        "Fetch Service Task Attachments Error:",
        error
      )

      return
    }

    setAttachments((current) => ({
      ...current,
      [appointmentId]: data || [],
    }))
  }



  // =========================================================
  // UPDATE APPOINTMENT STATUS
  // =========================================================

async function updateStatus(
  id,
  status,
  reason = "",
  cancellationType = ""
) 
 {
  if (updatingAppointmentId === id) return

  setUpdatingAppointmentId(id)

  try {

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    console.log("🔐 CURRENT USER:", user)
console.log("🔐 AUTH ERROR:", authError)


    if (authError) {
      console.error(
        "❌ Failed to get logged-in user:",
        authError
      )
    }

    console.log(
      "Updating appointment:",
      id,
      "Status:",
      status
    )

  console.log(
    "Updating appointment:",
    id,
    "Status:",
    status
  )

 
const updateData = {
  status,
}

// =====================================================
// SAVE ACTUAL SERVICE START TIME
// =====================================================

if (status === "in_progress") {

  const startedAt =
    new Date().toISOString()

  updateData.in_progress_at =
    startedAt

  console.log(
    "🔧 SERVICE STARTED AT:",
    startedAt
  )
}



// =====================================================
// SAVE ADMIN WHO APPROVED THE APPOINTMENT
// =====================================================

if (status === "confirmed") {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    updateData.approved_by = user.id
  }
}



// Add timestamp when service is completed
let warrantyEndsAt = null

if (status === "completed") {

  const completedAt = new Date()

  updateData.completed_at =
    completedAt.toISOString()

  warrantyEndsAt =
    new Date(
      completedAt.getTime() +
      3 * 24 * 60 * 60 * 1000
    )

  console.log(
    "🛡️ WARRANTY WILL END:",
    warrantyEndsAt.toISOString()
  )
}



  // =====================================================
  // REJECTION INFORMATION
  // =====================================================

  // Add timestamp when appointment/service is cancelled
// =====================================================
// CANCELLED / REJECTED
// =====================================================

if (status === "cancelled") {

  const cancelledAt =
    new Date().toISOString()

  // Always save cancellation timestamp
  updateData.cancelled_at =
    cancelledAt

  // ===================================================
  // REJECTED BY ADMIN
  // ===================================================

  if (cancellationType === "rejected") {

    if (reason?.trim()) {
      updateData.rejection_reason =
        reason.trim()
    }

    updateData.rejected_at =
      cancelledAt

    if (user) {
      updateData.rejected_by =
        user.id
    }
  }

  // ===================================================
  // NORMAL CANCELLATION
  // ===================================================

 else if (cancellationType === "cancelled") {

  if (reason?.trim()) {
    updateData.cancellation_reason =
      reason.trim()
  }

  console.log(
    "Appointment cancelled normally:",
    id,
    "Reason:",
    reason
  )
}


}



  const { data, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", id)
    .select("*")

  if (error) {
    console.error(
      "Update Status Error:",
      error
    )

    alert(
      `Failed to update appointment: ${error.message}`
    )

    return
  }

  console.log(
    "Updated Appointment:",
    data
  )

  if (!data || data.length === 0) {
    alert(
      "Appointment could not be updated."
    )

    return
  }

  const appointment = data[0]
  


// =====================================================
// ADMIN NOTIFICATION — SERVICE STARTED
// =====================================================

if (status === "in_progress" && user) {

  // =====================================================
  // IDENTIFY BOOKING SOURCE
  // Supports:
  // walkin
  // walk-in
  // walk_in
  // online
  // =====================================================

  const normalizedBookingSource =
    String(appointment.booking_source || "")
      .toLowerCase()
      .replace(/[-_]/g, "")

  const isWalkIn =
    normalizedBookingSource === "walkin" ||
    !appointment.customer_id

  const bookingSourceLabel =
    isWalkIn
      ? "Walk-in Booking"
      : "Online Booking"

  const customerDisplayName =
    appointment.customer_name || "Walk-in Customer"

  const adminNotificationTitle =
    isWalkIn
      ? "Walk-in Service Started"
      : "Service Started"

  
const adminNotificationMessage =
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSourceLabel}\n\n` +
  `${isWalkIn
    ? `Walk-in customer ${appointment.customer_name || "Customer"}, `
    : `${appointment.customer_name || "Customer"}'s `
  }` +
  `${appointment.service_type || "vehicle service"} ` +
  
`has started at ${appointment.in_progress_at
  ? new Date(appointment.in_progress_at).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  : "the current time"}. ` +


  `The technician is currently working on the ` +
  `${appointment.vehicle_model || "vehicle"}.` +
  (
    appointment.plate_number
      ? ` Plate No. ${appointment.plate_number}.`
      : ""
  )



  // =====================================================
  // GET ALL ADMINS
  // =====================================================

  const {
    data: adminUsers,
    error: adminUsersError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")

  if (adminUsersError) {

    console.error(
      "❌ FAILED TO GET ADMIN USERS FOR SERVICE STARTED:",
      adminUsersError
    )

  } else if (adminUsers && adminUsers.length > 0) {

    const adminNotifications =
      adminUsers.map((admin) => ({
        recipient_id:
          admin.id,

        // Keep customer_id null for walk-in customers.
        customer_id:
          appointment.customer_id || null,

        appointment_id:
          appointment.id,

        title:
          adminNotificationTitle,

        message:
          adminNotificationMessage,

        type: "appointment",

        booking_source:
          isWalkIn
            ? "walkin"
            : "online",

        is_read:
          false,
      }))

    const {
      error: adminStartedNotificationError,
    } = await supabase
      .from("notifications")
      .insert(adminNotifications)

    if (adminStartedNotificationError) {

      console.error(
        "❌ ADMIN SERVICE STARTED NOTIFICATION FAILED:",
        adminStartedNotificationError
      )

    } else {

      console.log(
        "✅ ADMIN SERVICE STARTED NOTIFICATIONS CREATED:",
        appointment.id
      )

    }

  } else {

    console.warn(
      "⚠️ NO ADMIN USERS FOUND FOR SERVICE STARTED NOTIFICATION"
    )

  }
}


// =====================================================
// ADMIN NOTIFICATION — SERVICE COMPLETED
// =====================================================

if (status === "completed" && user) {

  // =====================================================
  // IDENTIFY BOOKING SOURCE
  // =====================================================

  const normalizedBookingSource =
    String(appointment.booking_source || "")
      .toLowerCase()
      .replace(/[-_]/g, "")

  const isWalkIn =
    normalizedBookingSource === "walkin" ||
    !appointment.customer_id

  const bookingSourceLabel =
    isWalkIn
      ? "Walk-in Booking"
      : "Online Booking"

  const customerDisplayName =
    appointment.customer_name || "Walk-in Customer"

  const adminNotificationTitle =
    isWalkIn
      ? "Walk-in Service Completed"
      : "Service Completed"

 
const adminNotificationMessage =
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSourceLabel}\n\n` +
  `${isWalkIn
    ? `Walk-in customer ${appointment.customer_name || "Customer"}, `
    : `${appointment.customer_name || "Customer"}'s `
  }` +
  `${appointment.service_type || "vehicle service"} ` +

`has been completed at ${appointment.completed_at
  ? new Date(appointment.completed_at).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  : "the current time"}. ` +

  `The technician has completed the service on the ` +
  `${appointment.vehicle_model || "vehicle"}.` +
  (
    appointment.plate_number
      ? ` Plate No. ${appointment.plate_number}.`
      : ""
  )



  // =====================================================
  // GET ALL ADMINS
  // =====================================================

  const {
    data: adminUsers,
    error: adminUsersError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")

  if (adminUsersError) {

    console.error(
      "❌ FAILED TO GET ADMIN USERS FOR SERVICE COMPLETED:",
      adminUsersError
    )

  } else if (adminUsers && adminUsers.length > 0) {

    const adminNotifications =
      adminUsers.map((admin) => ({
        recipient_id:
          admin.id,

        customer_id:
          appointment.customer_id || null,

        appointment_id:
          appointment.id,

        title:
          adminNotificationTitle,

        message:
          adminNotificationMessage,

        type: "appointment",

        booking_source:
          isWalkIn
            ? "walkin"
            : "online",

        is_read:
          false,
      }))

    const {
      error: adminCompletedNotificationError,
    } = await supabase
      .from("notifications")
      .insert(adminNotifications)

    if (adminCompletedNotificationError) {

      console.error(
        "❌ ADMIN SERVICE COMPLETED NOTIFICATION FAILED:",
        adminCompletedNotificationError
      )

    } else {

      console.log(
        "✅ ADMIN SERVICE COMPLETED NOTIFICATIONS CREATED:",
        appointment.id
      )

    }

  } else {

    console.warn(
      "⚠️ NO ADMIN USERS FOUND FOR SERVICE COMPLETED NOTIFICATION"
    )

  }
}









// =====================================================
// CUSTOMER NOTIFICATION — SERVICE COMPLETED
// =====================================================

if (status === "completed") {

  console.log(
    "🔔 SERVICE COMPLETED — notifying customer:",
    appointment.customer_id
  )

  if (!appointment.customer_id) {

    console.warn(
      "⚠️ Cannot send completion notification: appointment has no customer_id.",
      appointment.id
    )

  } else {

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    console.log(
      "👤 Notification sender/admin:",
      currentUser?.id
    )

    const {
      data: adminRecord,
      error: adminRecordError,
    } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", currentUser?.id)
      .maybeSingle()

    console.log(
      "👤 Current user record:",
      adminRecord
    )

    if (adminRecordError) {
      console.error(
        "❌ Failed to verify admin:",
        adminRecordError
      )
    }

    // =====================================================
    // IDENTIFY BOOKING SOURCE
    // =====================================================

    const bookingSource =
      String(appointment.booking_source || "").toLowerCase() === "walkin"
        ? "Walk-in Booking"
        : "Online Booking"

    const {
      error: completedNotificationError,
    } = await supabase
      .from("notifications")
      .insert([
        {
          customer_id:
            appointment.customer_id,

          recipient_id:
            appointment.customer_id,

          appointment_id:
            appointment.id,

          
title:
  "Service Completed",

message:
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSource}\n\n` +
  `Hi ${appointment.customer_name || "Customer"}, your ` +
  `${appointment.service_type || "vehicle service"} ` +
  `for ${appointment.vehicle_model || "vehicle"} ` +
  `${appointment.plate_number
    ? `(Plate No. ${appointment.plate_number}) `
    : ""}` +
  `has been completed at ${appointment.completed_at
    ? new Date(appointment.completed_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}. ` +
  `Please check your appointment details for more information.`,



          type:
            "service_completed",

          is_read:
            false,
        },
      ])

    if (completedNotificationError) {

      console.error(
        "❌ SERVICE COMPLETED NOTIFICATION FAILED:",
        completedNotificationError
      )

    } else {

      console.log(
        "✅ SERVICE COMPLETED NOTIFICATION SENT:",
        appointment.customer_id
      )
    }
  }
}


  setRecentAppointments((prev) =>
  prev.map((appt) =>
    Number(appt.id) === Number(appointment.id)
      ? {
          ...appt,
          ...appointment,
        }
      : appt
  )
)


// =====================================================
// CUSTOMER NOTIFICATION — SERVICE STARTED
// =====================================================

if (status === "in_progress") {

  console.log(
    "🔔 SERVICE STARTED — notifying customer:",
    appointment.customer_id
  )

  if (!appointment.customer_id) {

    console.warn(
      "⚠️ Cannot send service-start notification: appointment has no customer_id.",
      appointment.id
    )

  } else {

    const bookingSource =
      String(appointment.booking_source || "").toLowerCase() === "walkin"
        ? "Walk-in Booking"
        : "Online Booking"

    const {
      error: serviceStartedNotificationError,
    } = await supabase
      .from("notifications")
      .insert([
        {
          customer_id:
            appointment.customer_id,

          recipient_id:
            appointment.customer_id,

          appointment_id:
            appointment.id,

          title:
            "Service Started",

         
message:
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSource}\n\n` +
  `Hi ${appointment.customer_name || "Customer"}, your ` +
  `${appointment.service_type || "vehicle service"} ` +
  `for ${appointment.vehicle_model || "vehicle"} ` +
  `${appointment.plate_number
    ? `(Plate No. ${appointment.plate_number}) `
    : ""}` +
  `has started at ${appointment.in_progress_at
    ? new Date(appointment.in_progress_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}. ` +
  `Our technician is currently working on your vehicle.`,



          type:
            "service_started",

          is_read:
            false,
        },
      ])

    if (serviceStartedNotificationError) {

      console.error(
        "❌ SERVICE STARTED NOTIFICATION FAILED:",
        serviceStartedNotificationError
      )

    } else {

      console.log(
        "✅ SERVICE STARTED NOTIFICATION SENT:",
        appointment.customer_id
      )
    }
  }
}


  // =====================================================
// SAVE 3-DAY WARRANTY END TIME TO CONVERSATION
// =====================================================

if (
  status === "completed" &&
  warrantyEndsAt
) {

  const {
    data: conversation,
    error: conversationLookupError,
  } = await supabase
    .from("conversations")
    .select("id")
    .eq(
      "appointment_id",
      appointment.id
    )
    .maybeSingle()

  if (conversationLookupError) {

    console.error(
      "❌ Failed to find conversation:",
      conversationLookupError
    )

  } else if (conversation) {

    const {
      error: warrantyError,
    } = await supabase
      .from("conversations")
      .update({
        warranty_ends_at:
          warrantyEndsAt.toISOString(),
      })
      .eq(
        "id",
        conversation.id
      )

    if (warrantyError) {

      console.error(
        "❌ Failed to save warranty end:",
        warrantyError
      )

    } else {

      console.log(
        "✅ WARRANTY END SAVED:",
        warrantyEndsAt.toISOString()
      )

    }

  } else {

    console.warn(
      "⚠️ No conversation found for completed appointment:",
      appointment.id
    )

  }
}


  // =====================================================
// CREATE / PREPARE APPOINTMENT CONVERSATION
// =====================================================

  // =====================================================
  // CREATE / PREPARE APPOINTMENT CONVERSATION
  // =====================================================

  if (status === "confirmed") {

    console.log(
      "💬 Preparing conversation for appointment:",
      appointment.id
    )

    // Get currently logged-in admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {

      console.error(
        "Conversation setup failed: no logged-in user."
      )

    } else {

      // ---------------------------------------------------
      // 1. FIND EXISTING CONVERSATION
      // ---------------------------------------------------

      const {
        data: existingConversation,
        error: conversationLookupError,
      } = await supabase
        .from("conversations")
        .select("*")
        .eq("appointment_id", appointment.id)
        .maybeSingle()

      if (conversationLookupError) {

        console.error(
          "Conversation lookup failed:",
          conversationLookupError
        )

      } else {

        let conversation =
          existingConversation

        // -------------------------------------------------
        // 2. CREATE CONVERSATION IF NONE EXISTS
        // -------------------------------------------------

        if (!conversation) {

          const {
            data: newConversation,
            error: conversationCreateError,
          } = await supabase
            .from("conversations")
            .insert({
              appointment_id:
                appointment.id,
            })

            
            .select("*")
            .single()

          // IMPORTANT:
          // The variable is conversationCreateError
          if (conversationCreateError) {

            console.error(
              "🚨 CONVERSATION CREATION FAILED"
            )

            console.error(
              "message:",
              conversationCreateError.message
            )

            console.error(
              "details:",
              conversationCreateError.details
            )

            console.error(
              "hint:",
              conversationCreateError.hint
            )

            console.error(
              "code:",
              conversationCreateError.code
            )

            console.error(
              "status:",
              conversationCreateError.status
            )

            console.error(
              "full error:",
              conversationCreateError
            )

          } else {

            conversation =
              newConversation

            console.log(
              "✅ Conversation created:",
              conversation.id
            )
          }
        }

        // -------------------------------------------------
        // 3. ADD PARTICIPANTS
        // -------------------------------------------------

       if (conversation) {

  const participantIds = [
    appointment.customer_id,
    appointment.technician_id,
    appointment.approved_by,
  ].filter(Boolean)

  const uniqueParticipantIds = [
    ...new Set(participantIds),
  ]

  console.log(
    "💬 Conversation participants:",
    uniqueParticipantIds
  )

  const {
    data: participantData,
    error: participantRpcError,
  } = await supabase.rpc(
    "add_appointment_conversation_participants",
    {
      p_conversation_id:
        conversation.id,

      p_user_ids:
        uniqueParticipantIds,
    }
  )

  if (participantRpcError) {

    console.error(
      "🚨 PARTICIPANT RPC FAILED"
    )

    console.error(
      "message:",
      participantRpcError.message
    )

    console.error(
      "details:",
      participantRpcError.details
    )

    console.error(
      "hint:",
      participantRpcError.hint
    )

    console.error(
      "code:",
      participantRpcError.code
    )

  } else {

    console.log(
      "✅ Conversation participants saved:",
      participantData
    )

  }
        }
      }
    }
  }


 



  async function openAppointmentConversation(appointment) {
  try {

    if (!appointment) {
      console.error("No appointment provided.")
      return
    }

    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "in_progress" &&
      appointment.status !== "completed"
    ) {
      console.log(
        "ℹ️ Messaging unavailable for appointment:",
        appointment.id,
        "Status:",
        appointment.status
      )

      return
    }

    console.log(
      "💬 Loading conversation for appointment:",
      appointment.id
    )

    setShowMessaging(true)
    setActiveConversation(null)
    setConversationMessages([])

    // =====================================================
    // FIND CONVERSATION
    // =====================================================

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select("*")
      .eq("appointment_id", appointment.id)
      .maybeSingle()

    if (conversationError) {

      console.error(
        "Conversation lookup failed:",
        conversationError
      )

      return
    }

    if (!conversation) {

      console.log(
        "ℹ️ No conversation exists for appointment:",
        appointment.id
      )

      return
    }

    console.log(
      "✅ Conversation found:",
      conversation
    )

    setActiveConversation(conversation)

    // =====================================================
    // MARK ADMIN CONVERSATION AS READ
    // =====================================================

    const readAt = new Date().toISOString()

const {
  data: updatedConversation,
  error: markReadError,
} = await supabase
  .from("conversations")
  .update({
    admin_last_read_at: readAt,
  })
  .eq("id", conversation.id)
  .select(`
    id,
    admin_last_read_at
  `)

if (markReadError) {

  console.error(
    "🚨 Failed to mark admin conversation as read:",
    markReadError
  )

} else if (!updatedConversation?.length) {

  console.error(
    "🚨 Admin conversation read update matched ZERO rows.",
    {
      conversationId: conversation.id,
    }
  )

} else {

  console.log(
    "✅ Admin conversation marked as read:",
    updatedConversation[0]
  )

  setAdminUnreadCounts((currentCounts) => {

    const updatedCounts = {
      ...currentCounts,
    }

    delete updatedCounts[
      conversation.id
    ]

    return updatedCounts
  })
}


    if (markReadError) {

      console.error(
        "🚨 Failed to mark admin conversation as read:",
        markReadError
      )

    } else {

      console.log(
        "✅ Admin conversation marked as read:",
        conversation.id
      )

      setAdminUnreadCounts(
        (currentCounts) => {

          const updatedCounts = {
            ...currentCounts,
          }

          delete updatedCounts[
            conversation.id
          ]

          return updatedCounts
        }
      )
    }

    // =====================================================
    // LOAD MESSAGES
    // =====================================================

    const {
      data: messages,
      error: messagesError,
    } = await supabase
      .from("messages")
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
        "conversation_id",
        conversation.id
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )

    if (messagesError) {

      console.error(
        "🚨 Message loading failed:",
        messagesError
      )

      return
    }

    console.log(
      "✅ Conversation messages:",
      messages
    )

    setConversationMessages(
      messages || []
    )

    // =====================================================
    // CHECK WARRANTY / MESSAGE PERMISSION
    // =====================================================

    const {
      data: allowed,
      error: allowedError,
    } = await supabase.rpc(
      "can_send_appointment_message",
      {
        p_conversation_id:
          conversation.id,
      }
    )

    if (allowedError) {

      console.error(
        "Messaging authorization check failed:",
        allowedError
      )

      setMessagingAllowed(false)

    } else {

      console.log(
        "🔐 Messaging allowed:",
        allowed
      )

      setMessagingAllowed(
        allowed === true
      )
    }

  } catch (error) {

    console.error(
      "Unexpected conversation error:",
      error
    )

  }
}


async function loadAdminConversationMap(appointments) {

  try {

    if (
      !appointments ||
      appointments.length === 0
    ) {
      return {}
    }

    const appointmentIds =
      appointments
        .map(
          (appointment) =>
            appointment.id
        )
        .filter(Boolean)

    if (
      appointmentIds.length === 0
    ) {
      return {}
    }

    const {
      data: conversations,
      error,
    } = await supabase
      .from("conversations")
      .select(`
        id,
        appointment_id
      `)
      .in(
        "appointment_id",
        appointmentIds
      )

    if (error) {

      console.error(
        "🚨 Failed to load admin conversation map:",
        error
      )

      return {}
    }

    const conversationMap = {}

    ;(conversations || []).forEach(
      (conversation) => {

        if (
          conversation.appointment_id
        ) {

          conversationMap[
            conversation.appointment_id
          ] = conversation.id

        }

      }
    )

    console.log(
      "💬 Admin appointment → conversation map:",
      conversationMap
    )

    return conversationMap

  } catch (error) {

    console.error(
      "🚨 Unexpected conversation map error:",
      error
    )

    return {}
  }
}






if (user) {
  const statusMessages = {
    pending:
      "Your appointment request has been received and is waiting for confirmation.",

    confirmed:
      "Your appointment has been confirmed. Please wait for the scheduled service.",

    in_progress:
      "Your vehicle is currently being serviced by our technician.",

    completed:
      "Your vehicle service has been completed.",

    cancelled:
      reason?.trim()
        ? `Your appointment was cancelled. Reason: ${reason.trim()}`
        : "Your appointment was cancelled.",
  }

  const {
  data: historyData,
  error: historyError,
} = await supabase
  .from("appointment_progress_history")
  .insert({
    appointment_id: appointment.id,
    status: status,
    message:
      statusMessages[status] ||
      `Appointment status changed to ${status}.`,
    changed_by: user.id,
    changed_by_name: adminProfile?.name || null,
    changed_by_role: "admin",
  })
  .select()

if (historyError) {
  console.error(
    "🚨 APPOINTMENT HISTORY INSERT FAILED:",
    historyError
  )

  alert(
    `History insert failed: ${historyError.message}`
  )
} else {
  console.log(
    "✅ APPOINTMENT HISTORY INSERT SUCCESS:",
    historyData
  )
}



}


  console.log(
    "New status:",
    appointment.status
  )

  console.log(
    "Cancelled at:",
    appointment.cancelled_at
  )

  console.log(
    "Completed at:",
    appointment.completed_at
  )

  // =====================================================
// CREATE CUSTOMER NOTIFICATION
// =====================================================

if (
  status === "confirmed" ||
  status === "cancelled"
) {

  // =====================================================
// FORMAT APPOINTMENT TIME
// =====================================================

let formattedTime =
  appointment.appointment_time || ""

if (appointment.appointment_time) {
  try {
    formattedTime = new Date(
      `2000-01-01T${appointment.appointment_time}`
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    formattedTime =
      appointment.appointment_time
  }
}


  let notificationTitle = ""
  let notificationMessage = ""

  // ===================================================
  // APPROVED
  // ===================================================

  if (status === "confirmed") {

    notificationTitle =
      "Booking approved"

    notificationMessage =
      `✅ Your booking for ${appointment.service_type} on ${appointment.appointment_date} at ${formattedTime} has been approved.`

  }

  

  // ===================================================
// REJECTED
// ===================================================

else if (
  status === "cancelled" &&
  cancellationType === "rejected"
) {

  notificationTitle =
    "Booking rejected"

  const bookingSource =
    String(appointment.booking_source || "").toLowerCase() === "walkin"
      ? "Walk-in Booking"
      : "Online Booking"

  
notificationMessage =
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSource}\n\n` +
  `❌ Hi ${appointment.customer_name || "Customer"}, your booking for ` +
  `${appointment.service_type || "Service"} ` +
  `has been rejected at ${appointment.rejected_at
    ? new Date(appointment.rejected_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}.` +
  (
    reason?.trim()
      ? ` Reason: ${reason.trim()}`
      : ""
  )



}


// ===================================================
// CANCELLED SERVICE
// ===================================================

else if (
  status === "cancelled" &&
  cancellationType === "cancelled"
) {

  notificationTitle =
    "Service cancelled"

  const bookingSource =
    String(appointment.booking_source || "").toLowerCase() === "walkin"
      ? "Walk-in Booking"
      : "Online Booking"


notificationMessage =
  `Appointment No. APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `${bookingSource}\n\n` +
  `⚠️ Hi ${appointment.customer_name || "Customer"}, your ` +
  `scheduled service for ${appointment.service_type || "Service"} ` +
  `has been cancelled at ${appointment.cancelled_at
    ? new Date(appointment.cancelled_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}.` +
  (
    reason?.trim()
      ? ` Reason: ${reason.trim()}`
      : ""
  )



}

 // ===================================================
// INSERT CUSTOMER + ADMIN NOTIFICATIONS
// ===================================================

if (
  notificationTitle &&
  notificationMessage
) {

  // =================================================
  // DETERMINE BOOKING SOURCE
  // =================================================

  const bookingSource =
    String(
      appointment.booking_source || ""
    ).toLowerCase() === "walkin"
      ? "Walk-in Booking"
      : "Online Booking"


  // =================================================
  // CUSTOMER NOTIFICATION
  // =================================================
  //
  // KEEP THE EXISTING CUSTOMER MESSAGE.
  //
  // This preserves the customer-side notification
  // that is already working.
  //

  if (
    appointment.customer_id
  ) {

    const {
      error: customerNotificationError,
    } = await supabase
      .from("notifications")
      .insert([
        {
          customer_id:
            appointment.customer_id,

          recipient_id:
            appointment.customer_id,

          appointment_id:
            appointment.id,

          title:
            notificationTitle,

          message:
            notificationMessage,

          type:
            "booking_status",

          is_read:
            false,
        },
      ])


    if (
      customerNotificationError
    ) {

      console.error(
        "❌ CUSTOMER NOTIFICATION FAILED"
      )

      console.error(
        "Message:",
        customerNotificationError.message
      )

      console.error(
        "Details:",
        customerNotificationError.details
      )

      console.error(
        "Hint:",
        customerNotificationError.hint
      )

      console.error(
        "Code:",
        customerNotificationError.code
      )

      console.error(
        "Full error:",
        customerNotificationError
      )

    } else {

      console.log(
        "✅ CUSTOMER NOTIFICATION CREATED:",
        notificationTitle
      )

    }

  } else {

    console.log(
      "ℹ️ CUSTOMER NOTIFICATION SKIPPED: " +
      "This appointment has no customer account."
    )

  }


  // =================================================
  // BUILD ADMIN-SPECIFIC MESSAGE
  // =================================================
  //
  // The admin should NOT receive:
  //
  // "Hi DINA MAE 5..."
  //
  // Instead, the admin receives a direct
  // administrative message.
  //

  let adminNotificationMessage =
    ""


  // =================================================
  // REJECTED
  // =================================================

  if (
    status === "cancelled" &&
    cancellationType === "rejected"
  ) {

    

adminNotificationMessage =
  `Appointment No. APPT-${String(
    appointment.id
  ).padStart(6, "0")}\n\n` +

  `${bookingSource}\n\n` +

  `❌ The appointment for ` +
  `${appointment.customer_name || "Customer"} ` +
  `(${appointment.service_type || "Service"}) ` +
  `has been rejected at ${appointment.rejected_at
    ? new Date(appointment.rejected_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}.` +

  (
    appointment.plate_number
      ? ` Plate No. ${appointment.plate_number}.`
      : ""
  ) +

  (
    reason?.trim()
      ? ` Reason: ${reason.trim()}`
      : ""
  )



  }


  // =================================================
  // CANCELLED SERVICE
  // =================================================

  else if (
    status === "cancelled" &&
    cancellationType === "cancelled"
  ) {

   

adminNotificationMessage =
  `Appointment No. APPT-${String(
    appointment.id
  ).padStart(6, "0")}\n\n` +

  `${bookingSource}\n\n` +

  `⚠️ The appointment for ` +
  `${appointment.customer_name || "Customer"} ` +
  `(${appointment.service_type || "Service"}) ` +
  `has been cancelled at ${appointment.cancelled_at
    ? new Date(appointment.cancelled_at).toLocaleString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "the current time"}.` +

  (
    appointment.plate_number
      ? ` Plate No. ${appointment.plate_number}.`
      : ""
  ) +

  (
    reason?.trim()
      ? ` Reason: ${reason.trim()}`
      : ""
  )

  }


  // =================================================
  // ADMIN NOTIFICATIONS
  // =================================================
  //
  // Send the notification to every admin.
  //
  // IMPORTANT:
  // recipient_id = admin.id
  //
  // This works with your existing RLS policy:
  //
  // recipient_id = auth.uid()
  //

  const {
    data: adminUsers,
    error: adminUsersError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("role", "admin")


  if (
    adminUsersError
  ) {

    console.error(
      "❌ FAILED TO LOAD ADMIN USERS"
    )

    console.error(
      "Message:",
      adminUsersError.message
    )

    console.error(
      "Details:",
      adminUsersError.details
    )

    console.error(
      "Hint:",
      adminUsersError.hint
    )

    console.error(
      "Code:",
      adminUsersError.code
    )

    console.error(
      "Full error:",
      adminUsersError
    )

  } else if (
    adminUsers &&
    adminUsers.length > 0 &&
    adminNotificationMessage
  ) {

    const adminNotifications =
      adminUsers.map(
        (admin) => ({
          customer_id:
            appointment.customer_id,

          recipient_id:
            admin.id,

          appointment_id:
            appointment.id,

          title:
            notificationTitle,

          message:
            adminNotificationMessage,

          type:
            "booking_status",

          is_read:
            false,
        })
      )


    const {
      error: adminNotificationError,
    } = await supabase
      .from("notifications")
      .insert(
        adminNotifications
      )


    if (
      adminNotificationError
    ) {

      console.error(
        "❌ ADMIN NOTIFICATION FAILED"
      )

      console.error(
        "Message:",
        adminNotificationError.message
      )

      console.error(
        "Details:",
        adminNotificationError.details
      )

      console.error(
        "Hint:",
        adminNotificationError.hint
      )

      console.error(
        "Code:",
        adminNotificationError.code
      )

      console.error(
        "Full error:",
        adminNotificationError
      )

    } else {

      console.log(
        "✅ ADMIN NOTIFICATIONS CREATED:",
        adminNotifications.length
      )

    }

  } else {

    console.log(
      "ℹ️ NO ADMIN NOTIFICATION CREATED"
    )

  }

}}
    // =====================================================
  // UPDATE UI IMMEDIATELY
  // =====================================================

  // =====================================================
// UPDATE APPOINTMENT IN UI IMMEDIATELY
// =====================================================

setRecentAppointments((currentAppointments) =>
  currentAppointments.map((appt) =>
    appt.id === appointment.id
      ? {
          ...appt,
          ...appointment,
        }
      : appt
  )
)

// Refresh the other dashboard statistics in the background
await fetchStats({ refreshAppointments: false })

  } finally {
    setUpdatingAppointmentId(null)
  }
}











async function loadConversationMessages(appointmentId) {

  console.log(
    "💬 Loading conversation for appointment:",
    appointmentId
  )

  setLoadingMessages(true)

  try {

    // ================================================
    // FIND CONVERSATION
    // ================================================

    const {
      data: conversation,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select("*")
      .eq("appointment_id", appointmentId)
      .maybeSingle()

    if (conversationError) {
      console.error(
        "Conversation lookup failed:",
        conversationError
      )

      return
    }

    if (!conversation) {

      console.log(
        "No conversation exists for appointment:",
        appointmentId
      )

      setActiveConversation(null)
      setConversationMessages([])

      return
    }

    console.log(
      "✅ Conversation found:",
      conversation
    )

    setActiveConversation(conversation)

 // ================================================
// LOAD MESSAGES FIRST
// ================================================

const {
  data: messages,
  error: messagesError,
} = await supabase
  .from("messages")
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
    "conversation_id",
    conversation.id
  )
  .order(
    "created_at",
    {
      ascending: true,
    }
  )

if (messagesError) {
  console.error(
    "Message loading failed:",
    messagesError
  )

  return
}

console.log(
  "✅ Conversation messages:",
  messages
)

setConversationMessages(
  messages || []
)


// ================================================
// MARK ADMIN CONVERSATION AS READ
// ================================================

const readAt = new Date().toISOString()

const {
  error: markReadError,
} = await supabase
  .from("conversations")
  .update({
    admin_last_read_at: readAt,
  })
  .eq(
    "id",
    conversation.id
  )

if (markReadError) {

  console.error(
    "🚨 Failed to mark admin conversation as read:",
    markReadError
  )

} else {

  console.log(
    "✅ ADMIN READ SAVED TO DATABASE:",
    {
      conversationId: conversation.id,
      admin_last_read_at: readAt,
    }
  )

  // ==============================================
  // REMOVE BADGE IMMEDIATELY
  // ==============================================

  setAdminUnreadCounts(
    (currentCounts) => {

      const updatedCounts = {
        ...currentCounts,
      }

      delete updatedCounts[
        conversation.id
      ]

      return updatedCounts
    }
  )
}


  } finally {

    setLoadingMessages(false)

  }
}




async function sendConversationMessage() {

  if (!activeConversation) {
    console.error(
      "No active conversation."
    )
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error(
      "No logged-in user."
    )
    return
  }

  const messageText =
    chatMessage.trim()

  if (!messageText) {
    return
  }

  console.log(
    "💬 Sending message:",
    {
      conversationId:
        activeConversation.id,

      senderId:
        user.id,

      message:
        messageText,
    }
  )

const {
  data: newMessage,
  error,
} = await supabase.rpc(
  "send_conversation_message",
  {
    p_conversation_id:
      activeConversation.id,

    p_message:
      messageText,

    p_reply_to_message_id:
      replyingToMessage?.id || null,
  }
)



if (error) {

  console.error(
    "🚨 Message send failed:",
    error
  )

  console.error(
    "🚨 Message send failed JSON:",
    JSON.stringify(error, null, 2)
  )

  alert(
    `Failed to send message: ${
      error.message ||
      error.details ||
      error.hint ||
      error.code ||
      "Unknown error"
    }`
  )

  return
}


console.log(
  "✅ Message sent:",
  newMessage
)

// Add the newly created message immediately
setConversationMessages((currentMessages) => {
  console.log(
    "💬 Updating conversation messages:",
    {
      previousCount: currentMessages.length,
      newMessage,
    }
  )

  return [
    ...currentMessages,
    newMessage,
  ]
})

// Clear input and reply state only AFTER successful insert
setChatMessage("")
setReplyingToMessage(null)



const {
  data: warrantyAllowed,
  error: warrantyError,
} = await supabase.rpc(
  "can_send_appointment_message",
  {
    p_conversation_id: activeConversation.id,
  }
)

console.log(
  "🔐 MESSAGE WARRANTY AUTHORIZATION:",
  {
    conversationId: activeConversation.id,
    currentUserId: user.id,
    warrantyAllowed,
    warrantyError,
  }
)

setChatMessage("")

}



  // =========================================================
  // ASSIGN TECHNICIAN
  // =========================================================

  async function assignTechnician(
    appointmentId,
    technicianId
  ) {
    console.log(
      "Assigning technician:",
      {
        appointmentId,
        technicianId,
      }
    )

    // Convert empty selection to null
    const selectedTechnician =
      technicianId === ""
        ? null
        : technicianId

    const { data, error } = await supabase
      .from("appointments")
      .update({
        technician_id:
          selectedTechnician,
      })
      .eq("id", appointmentId)
      .select()

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
      console.error(
        "Technician Assignment Error:",
        error
      )

      alert(
        `Failed to assign technician: ${error.message}`
      )

      return
    }

    // =====================================================
    // CHECK RESULT
    // =====================================================

    console.log(
      "Technician Assignment Result:",
      data
    )

    if (!data || data.length === 0) {
      alert(
        "Technician assignment was not saved."
      )

      return
    }

    console.log(
      "Saved technician_id:",
      data[0].technician_id
    )

    // =====================================================
    // RELOAD EVERYTHING
    // =====================================================

    await fetchStats()

    alert(
      selectedTechnician
        ? "Technician assigned successfully!"
        : "Technician assignment removed."
    )
  }


  // =========================================================
// UPLOAD SERVICE TASK ATTACHMENT
// =========================================================

// =========================================================
// UPLOAD SERVICE TASK ATTACHMENT
// =========================================================

async function uploadAttachment(
  appointmentId,
  file
) {
  if (!file) {
    return
  }

  try {
    console.log(
      "📎 Uploading attachment:",
      {
        appointmentId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      }
    )

    // =====================================================
    // GET CURRENT LOGGED-IN USER
    // =====================================================

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error(
        "Current User Error:",
        userError
      )

      alert(
        "You must be logged in to upload an attachment."
      )

      return
    }

    console.log(
      "📎 Current Auth User:",
      user.id
    )

    // =====================================================
    // GET CURRENT USER PROFILE
    // =====================================================

    const {
      data: currentUser,
      error: currentUserError,
    } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("id", user.id)
      .single()

    if (currentUserError || !currentUser) {
      console.error(
        "User Profile Error:",
        currentUserError
      )

      alert(
        `Could not load your user information: ${
          currentUserError?.message ||
          "Profile not found."
        }`
      )

      return
    }

    console.log(
      "📎 Current User Profile:",
      currentUser
    )

    // =====================================================
    // GET APPOINTMENT
    // =====================================================

    const {
      data: appointment,
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .select("id, technician_id")
      .eq("id", appointmentId)
      .single()

    if (appointmentError || !appointment) {
      console.error(
        "Appointment Lookup Error:",
        appointmentError
      )

      alert(
        `Could not find this service task: ${
          appointmentError?.message ||
          "Appointment not found."
        }`
      )

      return
    }

    console.log(
      "📎 Appointment:",
      appointment
    )

    // =====================================================
    // CHECK PERMISSION
    // ADMIN = CAN MANAGE
    // TECHNICIAN = MUST BE ASSIGNED
    // =====================================================

    const isAdmin =
      currentUser.role === "admin"

    const isAssignedTechnician =
      appointment.technician_id === user.id

    if (
      !isAdmin &&
      !isAssignedTechnician
    ) {
      alert(
        "You are not assigned to this service task."
      )

      return
    }

    // =====================================================
    // CREATE UNIQUE FILE PATH
    // =====================================================

    const filePath =
  `${appointmentId}/${generateFileId()}-${file.name}`

    

    

    console.log(
      "📎 Storage File Path:",
      filePath
    )

    function generateFileId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`
}


    // =====================================================
    // UPLOAD FILE TO STORAGE
    // =====================================================

    const {
      error: uploadError,
    } = await supabase.storage
      .from("service-task-attachments")
      .upload(
        filePath,
        file
      )

    if (uploadError) {
      console.error(
        "Storage Upload Error:",
        uploadError
      )

      alert(
        `Failed to upload file: ${uploadError.message}`
      )

      return
    }

    console.log(
      "✅ File uploaded to Storage"
    )

    // =====================================================
    // SAVE ATTACHMENT RECORD
    // =====================================================

    const {
      data: attachment,
      error: attachmentError,
    } = await supabase
      .from("service_task_attachments")
      .insert([
        {
          appointment_id:
            appointmentId,

          file_name:
            file.name,

          file_path:
            filePath,

          file_type:
            file.type || null,

          file_size:
            file.size,

          uploaded_by:
            currentUser.id,

          uploaded_by_name:
            currentUser.name,

          uploaded_by_role:
            currentUser.role,
        },
      ])
      .select()
      .single()

    if (attachmentError) {
      console.error(
        "Attachment Record Error:",
        attachmentError
      )

      // Remove Storage file if database record failed
      await supabase.storage
        .from("service-task-attachments")
        .remove([filePath])

      alert(
        `Failed to save attachment information: ${attachmentError.message}`
      )

      return
    }

    console.log(
      "✅ Attachment Record Saved:",
      attachment
    )

    // =====================================================
    // UPDATE DASHBOARD IMMEDIATELY
    // =====================================================

   setAttachments((current) => ({
  ...current,
  [appointmentId]: [
    attachment,
    ...(current[appointmentId] || []),
  ],
}))


    alert(
      "Attachment uploaded successfully!"
    )

  } catch (error) {
    console.error(
      "Upload Attachment Error:",
      error
    )

    alert(
      `Failed to upload attachment: ${error.message}`
    )
  }
}


  // =========================================================
// UPDATE TECHNICIAN ROLE
// =========================================================

async function updateTechnicianRole(
  appointmentId,
  technicianRole
) {

  const { data, error } = await supabase
    .from("appointments")
    .update({
      technician_role:
        technicianRole || null,
    })
    .eq("id", appointmentId)
    .select()

  if (error) {
    console.error(
      "Technician Role Error:",
      error
    )

    alert(
      `Failed to save technician role: ${error.message}`
    )

    return
  }

  console.log(
    "Technician Role Saved:",
    data
  )

  await fetchStats()
}

  // =========================================================
  // ARCHIVE APPOINTMENT
  // =========================================================

 async function archiveAppointment(id) {
  const confirmed = window.confirm(
    "Are you sure you want to archive this appointment?"
  )

  if (!confirmed) return

  try {
    const { error } = await supabase
      .from("appointments")
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Archive Error:", error)

      alert(
        `Failed to archive appointment: ${error.message}`
      )

      return
    }

    // =====================================================
    // IMPORTANT:
    // Remove the appointment from the UI immediately.
    // Do NOT wait for fetchStats().
    // =====================================================

    setRecentAppointments((current) =>
      current.filter(
        (appointment) =>
          Number(appointment.id) !== Number(id)
      )
    )

    // =====================================================
    // Refresh dashboard data in the background.
    // It does not block the UI.
    // =====================================================

    void fetchStats()
  } catch (error) {
    console.error(
      "Unexpected Archive Error:",
      error
    )

    alert(
      `Failed to archive appointment: ${
        error?.message ||
        "Something went wrong."
      }`
    )
  }
}





// =========================================================
// DELETE CANCELLED APPOINTMENT
// + IDENTIFY ONLINE / WALK-IN
// + NOTIFY CUSTOMER WHEN AVAILABLE
// + NOTIFY ADMINS
// =========================================================

async function deleteAppointment(id) {
  const confirmed =
    window.confirm(
      "Are you sure you want to permanently delete this cancelled appointment?"
    )

  if (!confirmed) return

  try {

    // =====================================================
    // 1. GET APPOINTMENT BEFORE DELETING
    // =====================================================

    const {
      data: appointment,
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (appointmentError) {
      console.error(
        "❌ Failed to find appointment before deletion:",
        appointmentError
      )

      alert(
        `Failed to delete appointment: ${appointmentError.message}`
      )

      return
    }

    if (!appointment) {
      alert(
        "Appointment could not be found."
      )

      return
    }

    console.log(
      "🗑️ Appointment to delete:",
      appointment
    )


    // =====================================================
    // 2. IDENTIFY BOOKING SOURCE
    // =====================================================

    const bookingSource =
      String(appointment.booking_source || "").toLowerCase() === "walkin"
        ? "Walk-in Booking"
        : "Online Booking"

    console.log(
      "📌 Booking source:",
      bookingSource
    )


    // =====================================================
    // 3. FORMAT APPOINTMENT TIME
    // =====================================================

    let formattedTime =
      appointment.appointment_time || ""

    if (appointment.appointment_time) {

      try {

        formattedTime =
          new Date(
            `2000-01-01T${appointment.appointment_time}`
          ).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })

      } catch {

        formattedTime =
          appointment.appointment_time

      }
    }


    // =====================================================
    // 4. CREATE CUSTOMER NOTIFICATION
    // =====================================================
    //
    // Only customers with a customer_id can receive a
    // customer notification.
    //
    // Walk-in appointments may have customer_id = null.
    // In that case, we skip the customer notification
    // instead of blocking the deletion.
    // =====================================================

    if (appointment.customer_id) {

      console.log(
        "🔔 Sending appointment deletion notification to customer:",
        appointment.customer_id
      )

      const {
        error: notificationError,
      } = await supabase
        .from("notifications")
        .insert([
          {
            customer_id:
              appointment.customer_id,

            recipient_id:
              appointment.customer_id,

            appointment_id:
              appointment.id,

            
title:
  "Appointment Deleted",

message:
  `${bookingSource} • APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `Hi ${appointment.customer_name || "Customer"}, your ` +
  `${appointment.service_type || "service"} ` +
  `for ${appointment.vehicle_model || "vehicle"} ` +
  `${appointment.plate_number
    ? `(Plate No. ${appointment.plate_number}) `
    : ""}` +
  `has been permanently deleted by the administrator on ` +
  `${new Date().toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}.`,
  
type:
  "booking_status",



            is_read:
              false,
          },
        ])

      if (notificationError) {

        console.error(
          "❌ CUSTOMER DELETE NOTIFICATION FAILED:",
          notificationError
        )

        console.error(
          "Message:",
          notificationError.message
        )

        console.error(
          "Details:",
          notificationError.details
        )

        console.error(
          "Hint:",
          notificationError.hint
        )

        console.error(
          "Code:",
          notificationError.code
        )

        alert(
          `Appointment was NOT deleted because the customer notification could not be created: ${notificationError.message}`
        )

        return
      }

      console.log(
        "✅ CUSTOMER DELETE NOTIFICATION CREATED:",
        appointment.customer_id
      )

    } else {

      console.log(
        "ℹ️ No customer_id found. Skipping customer notification because this is likely a walk-in appointment."
      )

    }


    // =====================================================
    // 5. NOTIFY ALL ADMINS
    // =====================================================

    const {
      data: adminUsers,
      error: adminUsersError,
    } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")

    if (adminUsersError) {

      console.error(
        "❌ Failed to get admin users:",
        adminUsersError
      )

      alert(
        `Appointment was NOT deleted because admin notifications could not be prepared: ${adminUsersError.message}`
      )

      return
    }


    if (adminUsers && adminUsers.length > 0) {

       
const adminNotificationMessage =
  `${bookingSource} • APPT-${String(appointment.id).padStart(6, "0")}\n\n` +
  `The ${bookingSource.toLowerCase()} for ` +
  `${appointment.customer_name || "Walk-in Customer"} ` +
  `(${appointment.service_type || "Service"}) ` +
  `for ${appointment.vehicle_model || "vehicle"} ` +
  `${appointment.plate_number
    ? `(Plate No. ${appointment.plate_number}) `
    : ""}` +
  `has been permanently deleted by the administrator on ` +
  `${new Date().toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}.`



      const adminNotifications =
        adminUsers.map((admin) => ({
          customer_id:
            appointment.customer_id || null,

          recipient_id:
            admin.id,

          appointment_id:
            appointment.id,

          title:
            "Appointment Deleted",

          message:
            adminNotificationMessage,

          type:
            "appointment",

          is_read:
            false,
        }))


      const {
        error: adminNotificationError,
      } = await supabase
        .from("notifications")
        .insert(adminNotifications)


      if (adminNotificationError) {

        console.error(
          "❌ ADMIN DELETE NOTIFICATION FAILED:",
          adminNotificationError
        )

        console.error(
          "Message:",
          adminNotificationError.message
        )

        console.error(
          "Details:",
          adminNotificationError.details
        )

        console.error(
          "Hint:",
          adminNotificationError.hint
        )

        console.error(
          "Code:",
          adminNotificationError.code
        )

        alert(
          `Appointment was NOT deleted because the admin notification could not be created: ${adminNotificationError.message}`
        )

        return
      }


      console.log(
        "✅ ADMIN DELETE NOTIFICATIONS CREATED:",
        adminUsers.length
      )

    } else {

      console.warn(
        "⚠️ No admin users found. Continuing with deletion."
      )

    }


    // =====================================================
    // 6. DELETE APPOINTMENT
    // =====================================================

    const {
      data,
      error,
    } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id)
      .select()

    if (error) {

      console.error(
        "❌ Delete Appointment Error:",
        error
      )

      alert(
        `Failed to delete appointment: ${error.message}`
      )

      return
    }


    // =====================================================
    // 7. MAKE SURE DELETE ACTUALLY HAPPENED
    // =====================================================

    if (!data || data.length === 0) {

      alert(
        "Appointment could not be deleted."
      )

      return
    }


    // =====================================================
    // 8. SUCCESS
    // =====================================================

    console.log(
      "✅ Appointment permanently deleted:",
      data[0]
    )

    alert(
      appointment.customer_id
        ? `Cancelled ${bookingSource.toLowerCase()} deleted successfully. The customer and administrators have been notified.`
        : `Cancelled ${bookingSource.toLowerCase()} deleted successfully. The administrators have been notified.`
    )

    await fetchStats()

  } catch (error) {

    console.error(
      "🚨 Unexpected delete appointment error:",
      error
    )

    alert(
      `Failed to delete appointment: ${error.message}`
    )
  }
}



// =========================================================
// HANDLE ADMIN NOTIFICATION CLICK
// =========================================================

async function handleNotificationClick(notification) {
  console.log(
    "🔔 Admin notification clicked:",
    notification
  )

  // Mark ONLY admin notification as read
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  setShowNotifications(false)

  // =======================================================
  // ADMIN NAVIGATION ONLY
  // =======================================================

  switch (notification.type) {
    case "appointment":
case "booking_status":
  navigate("/admin/appointments", {
    state: {
      appointmentId: notification.appointment_id,
    },
  })
  break

    case "inventory":
    case "low_stock":
      navigate("/admin/inventory")
      break

   case "message":
      navigate("/admin/archive", {
        state: {
          appointmentId: notification.appointment_id,
        },
      })
      break



    default:
      break
  }
}

// =========================================================
// MARK ONE ADMIN NOTIFICATION AS READ
// =========================================================

async function markAsRead(notificationId) {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error(
        "🚨 Unable to identify admin:",
        authError
      )
      return false
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId)
      .eq("recipient_id", user.id)

    if (error) {
      console.error(
        "🔴 Mark ADMIN notification as read error:",
        error
      )
      return false
    }

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    )

    console.log(
      "✅ Admin notification marked as read:",
      notificationId
    )

    return true
  } catch (error) {
    console.error(
      "🔴 Unexpected mark-admin-read error:",
      error
    )

    return false
  }
}



 // =========================================================
// DELETE ADMIN NOTIFICATION
// =========================================================

async function deleteNotification(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this notification?"
  )

  if (!confirmed) return

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error(
      "Unable to identify current user:",
      authError
    )
    return
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("recipient_id", user.id)

  if (error) {
    console.error(
      "Delete Notification Error:",
      error
    )

    alert(
      `Failed to delete notification: ${error.message}`
    )

    return
  }

  setNotifications((current) =>
    current.filter(
      (notification) =>
        notification.id !== id
    )
  )
}


async function clearAllNotifications() {
  if (notifications.length === 0) return

  const confirmed = window.confirm(
    "Are you sure you want to clear all notifications?"
  )

  if (!confirmed) return

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error(
      "Unable to identify current user:",
      authError
    )
    return
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("recipient_id", user.id)

  if (error) {
    console.error(
      "Clear All Notifications Error:",
      error
    )

    alert(
      `Failed to clear notifications: ${error.message}`
    )

    return
  }

  setNotifications([])
}

// =========================================================
// DELETE INVENTORY ACTIVITY
// =========================================================

async function deleteInventoryActivity(id) {
  const confirmed = window.confirm(
    "Are you sure you want to permanently delete this inventory activity?"
  )

  if (!confirmed) return

  console.log("Deleting inventory activity ID:", id)

  const { error } = await supabase
    .from("inventory_transactions")
    .delete()
    .eq("id", id)

  console.log("Delete error:", error)

  if (error) {
    console.error(
      "Delete Inventory Activity Error:",
      error
    )

    toast.error(
      `Failed to delete inventory activity: ${error.message}`
    )

    return
  }

  // Remove from UI only after Supabase accepts the delete
  setRecentInventoryActivity((current) =>
    current.filter(
      (activity) => activity.id !== id
    )
  )

  // If the deleted activity is currently open in the modal,
  // close the modal.
  if (
    selectedInventoryActivity?.id === id
  ) {
    setSelectedInventoryActivity(null)
  }

  toast.success(
    "Inventory activity deleted successfully."
  )
}
// =========================================================
// MARK ALL ADMIN NOTIFICATIONS AS READ
// =========================================================

const markAllNotificationsAsRead = async () => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error(
        "🚨 Unable to identify admin:",
        authError
      )
      return
    }

    const hasUnreadNotifications =
      notifications.some(
        (notification) =>
          !notification.is_read
      )

    if (!hasUnreadNotifications) {
      return
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("recipient_id", user.id)
      .eq("is_read", false)

    if (error) {
      console.error(
        "🔴 Mark all ADMIN notifications as read error:",
        error
      )
      return
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    )

    console.log(
      "✅ All admin notifications marked as read."
    )

  } catch (error) {
    console.error(
      "🔴 Unexpected mark-all-admin-read error:",
      error
    )
  }
}

  // =========================================================
  // TIME AGO
  // =========================================================

  function timeAgo(date) {
    const seconds = Math.floor(
      (new Date() - new Date(date)) /
        1000
    )

    if (seconds < 60) {
      return "Just now"
    }

    const minutes =
      Math.floor(seconds / 60)

    if (minutes < 60) {
      return `${minutes} minute${
        minutes > 1 ? "s" : ""
      } ago`
    }

    const hours =
      Math.floor(minutes / 60)

    if (hours < 24) {
      return `${hours} hour${
        hours > 1 ? "s" : ""
      } ago`
    }

    const days =
      Math.floor(hours / 24)

    if (days === 1) {
      return "Yesterday"
    }

    return `${days} days ago`
  }














  // =========================================================
  // INITIAL LOAD + REALTIME
  // =========================================================
 // =========================================================
// ADMIN DASHBOARD REALTIME
// =========================================================

useEffect(() => {

  fetchStats()
  fetchAdminProfile()

  console.log(
    "🟣 Creating admin realtime channel..."
  )

  const channel = supabase
    .channel("admin-dashboard-channel")

    // =====================================================
    // APPOINTMENTS
    // =====================================================


    // =====================================================
    // MESSAGES
    // =====================================================

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {

        console.log(
          "💬 NEW MESSAGE REALTIME:",
          payload.new
        )

        try {

          const {
            data: conversation,
            error,
          } = await supabase
            .from("conversations")
            .select(`
              id,
              appointment_id,
              admin_last_read_at
            `)
            .eq(
              "id",
              payload.new.conversation_id
            )
            .maybeSingle()

          if (error) {

            console.error(
              "🚨 Failed to refresh message badge:",
              error
            )

            return
          }

          if (!conversation) {
            return
          }
          // Conversation is open right now, so don't count it as unread
if (
  showMessagingRef.current &&
  String(activeConversationRef.current?.id) === String(conversation.id)
) {
  return
}

          // ---------------------------------------------
          // Ignore messages sent by this admin
          // ---------------------------------------------

          if (
            payload.new.sender_id ===
            currentAuthUserId
          ) {

            console.log(
              "ℹ️ Message was sent by admin. No unread badge."
            )

            return
          }

          // ---------------------------------------------
          // Check whether message was already read
          // ---------------------------------------------

          const lastReadAt =
            conversation.admin_last_read_at
              ? new Date(
                  conversation.admin_last_read_at
                )
              : new Date(0)

          const messageDate =
            new Date(
              payload.new.created_at
            )

          if (
            messageDate <=
            lastReadAt
          ) {

            console.log(
              "ℹ️ Message is already read."
            )

            return
          }

          // ---------------------------------------------
          // Increment unread badge
          // ---------------------------------------------

          setAdminUnreadCounts(
            (currentCounts) => {

              const current =
                Number(
                  currentCounts[
                    conversation.id
                  ] || 0
                )

              return {
                ...currentCounts,

                [conversation.id]:
                  current + 1,
              }
            }
          )

          console.log(
            "🔴 Admin unread badge incremented:",
            conversation.id
          )

        } catch (error) {

          console.error(
            "🚨 Realtime message badge error:",
            error
          )

        }
      }
    )

    // =====================================================
    // CONVERSATION READ STATE
    // =====================================================

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "conversations",
      },
      (payload) => {

        console.log(
          "👁️ Conversation read state updated:",
          payload.new
        )

        if (
          payload.new.admin_last_read_at
        ) {

          setAdminUnreadCounts(
            (currentCounts) => {

              if (
                !currentCounts[
                  payload.new.id
                ]
              ) {

                return currentCounts
              }

              const updated = {
                ...currentCounts,
              }

              delete updated[
                payload.new.id
              ]

              return updated
            }
          )
        }
      }
    )

    // =====================================================
    // SUBSCRIBE
    // =====================================================

    .subscribe(
      (status, err) => {

        console.log(
          "📡 Admin realtime status:",
          status
        )

        if (err) {

          console.error(
            "🚨 Admin realtime error:",
            err
          )

        }

        if (
          status ===
          "SUBSCRIBED"
        ) {

          console.log(
            "✅ Admin realtime is READY"
          )

        }

      }
    )

  // =======================================================
  // CLEANUP
  // =======================================================

  return () => {

    console.log(
      "🧹 Removing admin dashboard realtime channel"
    )

    supabase.removeChannel(
      channel
    )

  }

}, [currentAuthUserId])







useEffect(() => {
  if (!currentAuthUserId) {
    console.log(
      "⏳ Notification realtime waiting for auth user..."
    )

    return
  }

  console.log(
    "🔔 Starting ADMIN notification realtime for:",
    currentAuthUserId
  )

  const notificationChannel = supabase
    .channel(
      `admin-notifications-${currentAuthUserId}`
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${currentAuthUserId}`,
      },
      (payload) => {
        console.log(
          "🚨 REALTIME ADMIN NOTIFICATION RECEIVED:",
          payload.new
        )

        const notification =
          payload.new

        // ==========================================
        // EXTRA SAFETY CHECK
        // ==========================================

      if (
  processedNotificationIdsRef.current.has(
    notification.id
  )
) {

  console.log(
    "ℹ️ Realtime notification already processed:",
    notification.id
  )

  return
}

processedNotificationIdsRef.current.add(
  notification.id
)

console.log(
  "🔔 Processing NEW realtime notification:",
  notification.title,
  notification.id
)

setNotifications((previous) => {

  const exists = previous.some(
    (item) =>
      String(item.id) ===
      String(notification.id)
  )

  if (exists) {
    return previous
  }

  return [
    notification,
    ...previous,
  ]
})



        // ==========================================
        // PLAY SOUND
        // ==========================================

        // ==========================================
// PLAY SOUND
// ==========================================

const sound =
  notificationSoundRef.current

if (!sound) {

  console.warn(
    "⚠️ Notification sound is not initialized."
  )

  return
}

sound.currentTime = 0
sound.volume = 0.1000
sound.muted = false

sound
  .play()
  .then(() => {

    console.log(
      "🔊 Notification sound played."
    )

  })
  .catch((error) => {

    if (
      error?.name === "NotAllowedError"
    ) {

      console.warn(
        "🔇 Notification sound blocked until the user interacts with the page."
      )

      return
    }

    console.warn(
      "🔇 Notification sound could not play:",
      error
    )

  })



      }
    )
    .subscribe((status, error) => {

      console.log(
        "📡 ADMIN NOTIFICATION REALTIME:",
        status
      )

      if (error) {
        console.error(
          "🚨 ADMIN NOTIFICATION REALTIME ERROR:",
          error
        )
      }

      if (
        status === "SUBSCRIBED"
      ) {
        console.log(
          "✅ ADMIN NOTIFICATION REALTIME READY"
        )
      }
    })

  return () => {

    console.log(
      "🧹 Removing admin notification realtime channel"
    )

    supabase.removeChannel(
      notificationChannel
    )
  }

}, [currentAuthUserId])




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
            "🔓 Notification sound unlocked."
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




 useEffect(() => {

  console.log(
    "🔊 Initializing notification sound..."
  )

  const audio =
    new Audio("/sounds/notification.mp3")

  audio.volume = 0.1000
  audio.preload = "auto"

  notificationSoundRef.current = audio

  console.log(
    "🔊 Notification sound ready:",
    audio.src
  )

  return () => {

    console.log(
      "🔇 Cleaning up notification sound."
    )

    audio.pause()

    notificationSoundRef.current = null
  }

}, [])


// =========================================================
// APPOINTMENT REALTIME
// =========================================================

useEffect(() => {

  if (!currentAuthUserId) {
    console.log(
      "⏳ Appointment realtime waiting for auth user..."
    )

    return
  }

  console.log(
    "📅 Starting APPOINTMENT realtime for:",
    currentAuthUserId
  )

  const appointmentChannel = supabase
    .channel(
      `admin-appointments-${currentAuthUserId}`
    )

    // =====================================================
    // NEW APPOINTMENT
    // =====================================================

    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "appointments",
      },
      async (payload) => {

        console.log(
          "🚨🚨🚨 APPOINTMENT INSERT REALTIME RECEIVED 🚨🚨🚨",
          payload
        )

        console.log(
          "📅 New appointment:",
          payload.new
        )

        try {

          await fetchStats()

          console.log(
            "✅ Dashboard refreshed after NEW appointment"
          )

        } catch (error) {

          console.error(
            "🚨 Failed to refresh appointments:",
            error
          )

        }

      }
    )

   // =====================================================
// APPOINTMENT UPDATED
// =====================================================

.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "appointments",
  },
  async (payload) => {

    console.log(
      "🔄 APPOINTMENT UPDATE REALTIME RECEIVED",
      payload
    )

    const updatedAppointment =
      payload.new

    const appointmentId =
      updatedAppointment?.id

    if (!appointmentId) {
      return
    }


    // =====================================================
    // VEHICLE AI RESULT
    // =====================================================

    const vehicleAIUpdate = {
      vehicle_type:
        updatedAppointment.vehicle_type,

      vehicle_eligibility:
        updatedAppointment.vehicle_eligibility,

      vehicle_detection_confidence:
        updatedAppointment.vehicle_detection_confidence,

      vehicle_detection_message:
        updatedAppointment.vehicle_detection_message,

      vehicle_detected_at:
        updatedAppointment.vehicle_detected_at,
    }


    console.log(
      "🤖 REALTIME VEHICLE AI UPDATE:",
      {
        appointment_id:
          appointmentId,

        ...vehicleAIUpdate,
      }
    )


    // =====================================================
    // INSTANT AI STATE
    // =====================================================
    //
    // This state is specifically for immediate UI
    // decisions such as Approve / Reject.
    //
    // =====================================================

    setRealtimeVehicleAI(
      (current) => ({
        ...current,

        [appointmentId]:
          vehicleAIUpdate,
      })
    )


    // =====================================================
    // ALSO UPDATE THE APPOINTMENT OBJECT
    // =====================================================
    //
    // Keeps your existing UI/data logic synchronized.
    //
    // =====================================================

    setRecentAppointments(
      (currentAppointments) => {

        if (
          !Array.isArray(
            currentAppointments
          )
        ) {
          return currentAppointments
        }

        return currentAppointments.map(
          (appointment) => {

            if (
              appointment.id !==
              appointmentId
            ) {
              return appointment
            }

            return {
              ...appointment,
              ...updatedAppointment,
            }

          }
        )

      }
    )


    // =====================================================
    // BACKGROUND FULL REFRESH
    // =====================================================
    //
    // DO NOT wait for this before updating the UI.
    //
    // =====================================================

    try {

      await fetchStats()

      console.log(
        "✅ Background dashboard synchronization complete"
      )

    } catch (error) {

      console.error(
        "🚨 Background appointment synchronization failed:",
        error
      )

    }

  }
)





    .subscribe((status, error) => {

      console.log(
        "📡 APPOINTMENT REALTIME STATUS:",
        status
      )

      if (error) {

        console.error(
          "🚨 APPOINTMENT REALTIME ERROR:",
          error
        )

      }

      if (
        status === "SUBSCRIBED"
      ) {

        console.log(
          "✅ APPOINTMENT REALTIME READY"
        )

      }

    })

  return () => {

    console.log(
      "🧹 Removing appointment realtime channel"
    )

    supabase.removeChannel(
      appointmentChannel
    )

  }

}, [currentAuthUserId])





  useEffect(() => {
  if (!recentAppointments.length) {
    return
  }

  async function loadAllAttachments() {
    for (const appointment of recentAppointments) {
      await fetchAttachments(appointment.id)
    }
  }

  loadAllAttachments()
}, [recentAppointments])

useEffect(() => {
  async function fetchUserRole() {
    setRoleLoading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Unable to identify user:', authError)
      setRoleLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Role Fetch Error:', error)
      setRoleLoading(false)
      return
    }

    console.log('Dashboard User Role:', data?.role)

    setUserRole(data?.role || null)
    setRoleLoading(false)
  }

  fetchUserRole()
}, [])

useEffect(() => {

  let cancelled = false

  async function refreshAdminMessagingBadges() {

    if (
      !recentAppointments ||
      recentAppointments.length === 0
    ) {
      setAdminConversationMap({})
      setAdminUnreadCounts({})
      return
    }

    // ==========================================
    // ONLY APPOINTMENTS WITH ACTIVE MESSAGING
    // ==========================================

    const messagingAppointments =
      recentAppointments.filter(
        (appointment) =>
          appointment.status === "confirmed" ||
          appointment.status === "in_progress" ||
          appointment.status === "completed"
      )

    if (messagingAppointments.length === 0) {
      setAdminConversationMap({})
      setAdminUnreadCounts({})
      return
    }

    const appointmentIds =
      messagingAppointments
        .map((appointment) => appointment.id)
        .filter(Boolean)

    // ==========================================
    // LOAD CONVERSATIONS
    // ==========================================

    const {
      data: conversations,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select(`
        id,
        appointment_id,
        admin_last_read_at
      `)
      .in("appointment_id", appointmentIds)

    if (conversationError) {
      console.error(
        "🚨 Failed to load admin conversations:",
        conversationError
      )
      return
    }

    if (cancelled) {
      return
    }

    // ==========================================
    // BUILD APPOINTMENT → CONVERSATION MAP
    // ==========================================

    const conversationMap = {}

    ;(conversations || []).forEach(
      (conversation) => {

        if (conversation.appointment_id) {

          conversationMap[
            conversation.appointment_id
          ] = conversation.id

        }

      }
    )

    console.log(
      "💬 Admin appointment → conversation map:",
      conversationMap
    )

    setAdminConversationMap(
      conversationMap
    )

    // ==========================================
    // LOAD UNREAD COUNTS
    // ==========================================

    await loadAdminUnreadCounts(
      conversations || []
    )
  }

  refreshAdminMessagingBadges()

  return () => {
    cancelled = true
  }

}, [
  recentAppointments,
  currentAuthUserId
])






// =========================================================
// FETCH CURRENT ADMIN PROFILE
// =========================================================

async function fetchAdminProfile() {

  setAdminProfileLoading(true)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error(
      "Current Admin Auth Error:",
      authError
    )

    setAdminProfileLoading(false)
    return
  }

  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      name,
      email,
      role,
      avatar_url
    `)
    .eq("id", user.id)
    .single()

  if (error) {
    console.error(
      "Admin Profile Error:",
      error
    )

    setAdminProfileLoading(false)
    return
  }

  if (data.role !== "admin") {
    console.error(
      "Current user is not an admin."
    )

    setAdminProfileLoading(false)
    return
  }

  setAdminProfile(data)
  setAdminProfileLoading(false)
}




  // =========================================================
  // NOTIFICATION COUNT
  // =========================================================

  const notificationCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length

  const totalAdminUnread = Object.values(adminUnreadCounts).reduce(
  (total, count) => total + Number(count || 0),
  0
)

  // =========================================================
  // TECHNICIAN NAME
  // =========================================================

  function getTechnicianName(
    technicianId
  ) {
    if (!technicianId) {
      return null
    }

    const technician =
      technicians.find(
        (tech) =>
          tech.id === technicianId
      )

    return technician?.name || null
  }

  // =========================================================
  // TIME FORMAT
  // =========================================================

  function formatAppointmentTime(
    time
  ) {
    if (!time) {
      return "Not specified"
    }

    try {
      return new Date(
        `1970-01-01T${time}`
      ).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return time
    }
  }

  function formatStatusTimestamp(timestamp) {
  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp)

  if (isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(Date.now())
  }, 10000)

  return () => {
    clearInterval(timer)
  }
}, [])

function isWarrantyActive(completedAt) {

  if (!completedAt) {
    return true
  }

  const warrantyEnd =
    new Date(completedAt).getTime() +
    3 * 24 * 60 * 60 * 1000

  return Date.now() <= warrantyEnd
}

// =====================================================
// OPEN APPOINTMENT CONVERSATION
// =====================================================

async function openAppointmentConversation(appointment) {

  try {

    console.log(
      "💬 Loading conversation for appointment:",
      appointment.id
    )

    // Open the messaging modal
    setShowMessaging(true)

    // Clear previous conversation
    setActiveConversation(null)
    setConversationMessages([])

    // ---------------------------------------------------
    // 1. FIND CONVERSATION
    // ---------------------------------------------------

    const {
  data: conversation,
  error: conversationError,
} = await supabase
  .from("conversations")
  .select("*")
  .eq("appointment_id", appointment.id)
  .maybeSingle()



    if (conversationError) {

      console.error(
        "🚨 Conversation lookup failed:",
        conversationError
      )

      return
    }

    // ---------------------------------------------------
    // 2. NO CONVERSATION
    // ---------------------------------------------------

    if (!conversation) {

      console.log(
        "ℹ️ No conversation exists for appointment:",
        appointment.id
      )

      return
    }

    console.log(
      "✅ Conversation found:",
      conversation
    )

    // ---------------------------------------------------
    // 3. SET ACTIVE CONVERSATION
    // ---------------------------------------------------

    setActiveConversation(
      conversation
    )

    // =====================================================
// MARK ADMIN CONVERSATION AS READ
// =====================================================

const readAt = new Date().toISOString()

const {
  data: updatedConversation,
  error: markReadError,
} = await supabase
  .from("conversations")
  .update({
    admin_last_read_at: readAt,
  })
  .eq("id", conversation.id)
  .select(`
    id,
    admin_last_read_at
  `)

if (markReadError) {

  console.error(
    "🚨 FAILED TO MARK CONVERSATION AS READ:",
    markReadError
  )

} else if (!updatedConversation?.length) {

  console.error(
    "🚨 READ UPDATE MATCHED ZERO ROWS:",
    conversation.id
  )

} else {

  console.log(
    "✅ ADMIN CONVERSATION MARKED AS READ:",
    updatedConversation[0]
  )

  // Remove badge immediately
  setAdminUnreadCounts(
    (currentCounts) => {

      const updated = {
        ...currentCounts,
      }

      delete updated[
        conversation.id
      ]

      return updated
    }
  )
}


    // ---------------------------------------------------
// DEBUG: TEST CURRENT AUTH USER + PARTICIPANT
// ---------------------------------------------------

const {
  data: {
    user: currentUser,
  },
  error: currentUserError,
} = await supabase.auth.getUser()

console.log(
  "🔎 CURRENT AUTH USER:",
  {
    id: currentUser?.id,
    email: currentUser?.email,
    error: currentUserError,
  }
)

const {
  data: participantCheck,
  error: participantCheckError,
} = await supabase
  .from("conversation_participants")
  .select(`
    conversation_id,
    user_id
  `)
  .eq(
    "conversation_id",
    conversation.id
  )

console.log(
  "🔎 CURRENT CONVERSATION PARTICIPANTS:",
  {
    participantCheck,
    participantCheckError,
  }
)


    // ---------------------------------------------------
    // 4. LOAD MESSAGES
    // ---------------------------------------------------

    const {
  data: messages,
  error: messagesError,
} = await supabase
  .from("messages")
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
    "conversation_id",
    conversation.id
  )
  .order(
    "created_at",
    {
      ascending: true,
    }
  )


    if (messagesError) {

      console.error(
        "🚨 Message loading failed:",
        messagesError
      )

      return
    }

    console.log(
      "✅ Conversation messages:",
      messages
    )

    setConversationMessages(
      messages || []
    )

    // ---------------------------------------------------
// 1B. LOAD SENDER PROFILES
// ---------------------------------------------------

console.log(
  "🟡 STEP 1B REACHED — loading sender profiles"
)

const senderIds = [
  ...new Set(
    (messages || [])
      .map((msg) => msg.sender_id)
      .filter(Boolean)
  ),
]

console.log(
  "👤 Sender IDs:",
  senderIds
)

let senderProfilesMap = {}

if (senderIds.length > 0) {

  const {
    data: profiles,
    error: senderProfilesError,
  } = await supabase
    .from("users")
    .select(`
      id,
      name,
      username,
      role,
      avatar_url,
      last_seen
    `)
    .in(
      "id",
      senderIds
    )

  console.log(
    "👤 Sender profile query result:",
    {
      profiles,
      senderProfilesError,
    }
  )

  if (senderProfilesError) {

    console.error(
      "🚨 Sender profile loading failed:",
      senderProfilesError
    )

  } else {

    ;(profiles || []).forEach((profile) => {

      senderProfilesMap[profile.id] = profile

    })

  }

} else {

  console.log(
    "ℹ️ No sender IDs found in messages"
  )

}

console.log(
  "👤 Sender profile map:",
  senderProfilesMap
)

setSenderProfilesMap(
  senderProfilesMap
)

const completedAt =
  appointment.completed_at || null

console.log(
  "🛡️ WARRANTY COMPLETED AT:",
  completedAt
)

if (completedAt) {

  const warrantyEndsAt =
    new Date(completedAt).getTime() +
    3 * 24 * 60 * 60 * 1000

  console.log(
    "🛡️ WARRANTY ENDS AT:",
    new Date(warrantyEndsAt)
  )
}

// ---------------------------------------------------
// SET 3-DAY WARRANTY END TIME
// ---------------------------------------------------

if (appointment.completed_at) {

  const warrantyEnd =
    new Date(appointment.completed_at).getTime() +
    3 * 24 * 60 * 60 * 1000

  setWarrantyEndsAt(warrantyEnd)

  console.log(
    "🛡️ WARRANTY END TIME SAVED:",
    new Date(warrantyEnd)
  )

} else {

  setWarrantyEndsAt(null)

  console.log(
    "🛡️ NO COMPLETED DATE — WARRANTY END TIME CLEARED"
  )

}






    // ---------------------------------------------------
    // 5. CHECK MESSAGE AUTHORIZATION
    // ---------------------------------------------------

    // ---------------------------------------------------
// CHECK WARRANTY / MESSAGE PERMISSION
// ---------------------------------------------------

const {
  data: allowed,
  error: allowedError,
} = await supabase.rpc(
  "can_send_appointment_message",
  {
    p_conversation_id:
      conversation.id,
  }
)

if (allowedError) {

  console.error(
    "Messaging authorization check failed:",
    allowedError
  )

  setMessagingAllowed(false)

} else {

  const warrantyActive =
    isWarrantyActive(
      appointment.completed_at
    )

  console.log(
    "🛡️ WARRANTY ACTIVE:",
    warrantyActive
  )

  console.log(
    "🔐 DATABASE MESSAGING ALLOWED:",
    allowed
  )

  setMessagingAllowed(
    allowed === true &&
    warrantyActive
  )
}


  } catch (error) {

    console.error(
      "🚨 Unexpected conversation error:",
      error
    )

  }

}





useEffect(() => {
  let intervalId

  async function updateLastSeen() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    setCurrentAuthUserId(user.id)

    const { error } = await supabase
      .from("users")
      .update({
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error(
        "🚨 Failed to update last_seen:",
        error
      )
    } else {
      console.log(
        "🟢 LAST SEEN UPDATED:",
        new Date().toISOString()
      )
    }
  }

  // Update immediately
  updateLastSeen()

  // Then update every 30 seconds
  intervalId = setInterval(
    updateLastSeen,
    30 * 1000
  )

  return () => {
    clearInterval(intervalId)
  }
}, [])



function isUserOnline(lastSeen) {
  if (!lastSeen) {
    return false
  }

  const lastSeenTime =
    new Date(lastSeen).getTime()

  const now =
    Date.now()

  return (
    now - lastSeenTime <= 60 * 1000
  )
}

const handleApproveAppointment = async (appointmentId) => {
  try {
    // Find the appointment currently displayed in the admin list
    const appointment = recentAppointments.find(
      (appt) => appt.id === appointmentId
    )

    if (!appointment) {
      alert("Appointment not found.")
      return
    }

    // ==========================================
    // AI VEHICLE ELIGIBILITY CHECK
    // ==========================================
    //
    // IMPORTANT:
    // Use the latest realtime AI result when available.
    // Fall back to the appointment data if realtime
    // data has not arrived yet.
    // ==========================================

    const realtimeAI =
      realtimeVehicleAI[appointmentId]

    const vehicleEligibility =
      realtimeAI?.vehicle_eligibility ??
      appointment.vehicle_eligibility

    const vehicleType =
      realtimeAI?.vehicle_type ??
      appointment.vehicle_type

    const confidence =
      realtimeAI?.vehicle_detection_confidence ??
      appointment.vehicle_detection_confidence

    const detectionMessage =
      realtimeAI?.vehicle_detection_message ??
      appointment.vehicle_detection_message

    const detectedAt =
      realtimeAI?.vehicle_detected_at ??
      appointment.vehicle_detected_at

    console.log(
      "Vehicle AI check before approval:",
      {
        appointmentId,
        vehicleType,
        vehicleEligibility,
        confidence,
        detectionMessage,
        detectedAt,
      }
    )

    // ==========================================
    // AI CHECKING / NO COMPLETED RESULT
    // ==========================================
    //
    // Do not allow approval while the AI check
    // has not completed.
    //
    // ==========================================

    if (!detectedAt) {
      alert(
        "The Vehicle AI check is still in progress or has not completed yet.\n\n" +
        "Please wait for the AI review to finish before approving this appointment."
      )

      return
    }

    // ==========================================
    // NOT ELIGIBLE
    // ==========================================
    //
    // AI explicitly classified the vehicle as
    // outside the supported vehicle types.
    //
    // Approval remains blocked.
    //
    // ==========================================

    if (
      vehicleEligibility ===
      "not_eligible"
    ) {
      alert(
        `This appointment cannot be approved based on the AI vehicle classification.\n\n` +
        `Detected vehicle: ${
          vehicleType || "Unknown"
        }\n\n` +
        `AI result: Not eligible.\n\n` +
        `Please review the customer's attachments and appointment manually.`
      )

      return
    }

    // ==========================================
    // UNSURE / NEEDS ADMIN REVIEW
    // ==========================================
    //
    // The AI could not confidently verify the
    // vehicle. The admin is allowed to make the
    // final decision after manually reviewing
    // the customer's attachments.
    //
    // ==========================================

    if (
      vehicleEligibility ===
      "unsure"
    ) {
      const confirmed =
        window.confirm(
          `AI vehicle review required.\n\n` +
          `Detected vehicle: ${
            vehicleType || "Unknown"
          }\n` +
          `Confidence: ${
            confidence != null
              ? `${(
                  Number(confidence) * 100
                ).toFixed(2)}%`
              : "Unknown"
          }\n\n` +
          `AI message: ${
            detectionMessage ||
            "The AI could not confidently verify the vehicle."
          }\n\n` +
          `Please make sure you have manually reviewed the customer's submitted vehicle image and any additional attachment or video.\n\n` +
          `Do you want to continue approving this appointment?`
        )

      if (!confirmed) {
        return
      }
    }

    // ==========================================
    // UNKNOWN / MISSING ELIGIBILITY
    // ==========================================
    //
    // Do not accidentally approve when the AI
    // returned an unexpected or missing result.
    //
    // ==========================================

    if (
      vehicleEligibility !==
        "eligible" &&
      vehicleEligibility !==
        "unsure"
    ) {
      alert(
        "The Vehicle AI result is incomplete or unrecognized.\n\n" +
        "Please review the customer's attachments before approving this appointment."
      )

      return
    }

    // ==========================================
    // APPROVE APPOINTMENT
    // ==========================================

    const {
      data,
      error,
    } = await supabase.rpc(
      "approve_appointment",
      {
        p_appointment_id:
          appointmentId,
      }
    )

    if (error) {
      console.error(
        "Approve appointment error:",
        error
      )

      alert(error.message)
      return
    }

    console.log(
      "Appointment approved:",
      data
    )

    // ==========================================
    // REFRESH
    // ==========================================

    await fetchStats()

  } catch (error) {
    console.error(
      "Approve appointment error:",
      error
    )

    alert(
      error?.message ||
        "Failed to approve appointment."
    )
  }
}






async function loadAdminUnreadCounts(conversations) {

  try {

    const {
      data: {
        user: authUser,
      },
    } = await supabase.auth.getUser()

    const adminUserId =
      authUser?.id || null


    if (!conversations || conversations.length === 0) {
      setAdminUnreadCounts({})
      return
    }

    const conversationIds =
      conversations
        .map((conversation) => conversation.id)
        .filter(Boolean)

    if (conversationIds.length === 0) {
      setAdminUnreadCounts({})
      return
    }

    const {
      data: conversationRows,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select(`
        id,
        admin_last_read_at
      `)
      .in(
        "id",
        conversationIds
      )

    if (conversationError) {

      console.error(
        "🚨 Failed to load admin read status:",
        conversationError
      )

      return
    }

    const {
      data: unreadMessages,
      error: messagesError,
    } = await supabase
      .from("messages")
      .select(`
        id,
        conversation_id,
        sender_id,
        created_at
      `)
      .in(
        "conversation_id",
        conversationIds
      )

    if (messagesError) {

      console.error(
        "🚨 Failed to load admin unread messages:",
        messagesError
      )

      return
    }

    const readMap = {}

    ;(conversationRows || []).forEach(
      (conversation) => {

        readMap[
          conversation.id
        ] =
          conversation.admin_last_read_at
            ? new Date(
                conversation.admin_last_read_at
              )
            : new Date(0)

      }
    )

    const counts = {}

    ;(unreadMessages || []).forEach(
      (message) => {

        const readAt =
          readMap[
            message.conversation_id
          ]

        // Don't count messages sent by the admin
        if (
          message.sender_id ===
          adminUserId
        ) {
          return
        }

        const messageDate =
          new Date(
            message.created_at
          )

        if (
          !readAt ||
          messageDate > readAt
        ) {

          counts[
            message.conversation_id
          ] =
            (
              counts[
                message.conversation_id
              ] || 0
            ) + 1

        }

      }
    )

    console.log(
      "🔴 Admin unread counts:",
      counts
    )

    setAdminUnreadCounts(
      counts
    )

  } catch (error) {

    console.error(
      "🚨 Unexpected admin unread count error:",
      error
    )

  }
}

const preventDoubleClick = async (e, action) => {
  if (e.currentTarget.disabled) return

  e.currentTarget.disabled = true

  try {
    await action()
  } catch (error) {
    e.currentTarget.disabled = false
    throw error
  }
}

const [archivingId, setArchivingId] = useState(null);

const handleArchive = async (id) => {
  if (archivingId === id) return;

  try {
    setArchivingId(id);
    await archiveAppointment(id);
  } finally {
    setArchivingId(null);
  }
};

const [actionLoading, setActionLoading] = useState(null);

const handleDelete = async (id) => {
  if (actionLoading === `delete-${id}`) return;

  setActionLoading(`delete-${id}`);

  try {
    await deleteAppointment(id);
  } finally {
    setActionLoading(null);
  }
};

useEffect(() => {
  setServiceTaskIndex((current) =>
    Math.min(
      current,
      Math.max(recentAppointments.length - 1, 0)
    )
  )
}, [recentAppointments.length])


// =========================================================
// ADMIN MESSAGING — AUTO SCROLL TO LATEST MESSAGE
// =========================================================

useEffect(() => {
  // Modal closed: reset tracking so the next open starts fresh
  if (!showMessaging) {
    previousMessageCountRef.current = 0
    previousConversationIdRef.current = null
    return
  }

  if (!activeConversation?.id) return

  // Messages are still loading. Don't mark this conversation as handled yet.
  if (conversationMessages.length === 0) return

  const container = messagesContainerRef.current
  if (!container) return

  const conversationId = activeConversation.id
  const currentMessageCount = conversationMessages.length

  const conversationChanged =
    previousConversationIdRef.current !== conversationId

  const hasNewMessage =
    currentMessageCount > previousMessageCountRef.current

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
        behavior: "smooth",
      })
    })
  }

  previousConversationIdRef.current = conversationId
  previousMessageCountRef.current = currentMessageCount
}, [
  showMessaging,
  activeConversation?.id,
  conversationMessages.length,
])

// =========================================================
// KEEP REFS IN SYNC (used by realtime handlers)
// =========================================================

useEffect(() => {
  activeConversationRef.current = activeConversation
  showMessagingRef.current = showMessaging
}, [activeConversation, showMessaging])

// =========================================================
// ADMIN MESSAGING — LIVE MESSAGES FOR THE OPEN CONVERSATION
// =========================================================

useEffect(() => {
  if (!showMessaging || !activeConversation?.id) return

  const conversationId = activeConversation.id

  const channel = supabase
    .channel(`admin-conversation-${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {

        // ---------------------------------------------
        // NEW MESSAGE
        // ---------------------------------------------
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new

          setConversationMessages((current) => {
            if (current.some((m) => m.id === newMessage.id)) {
              return current
            }
            return [...current, newMessage]
          })

          // Load the sender's profile if we don't have it yet
          if (
            newMessage.sender_id &&
            !senderProfilesMap[newMessage.sender_id]
          ) {
            const { data: profile } = await supabase
              .from("users")
              .select("id, name, username, role, avatar_url, last_seen")
              .eq("id", newMessage.sender_id)
              .maybeSingle()

            if (profile) {
              setSenderProfilesMap((current) => ({
                ...current,
                [profile.id]: profile,
              }))
            }
          }

          // Incoming message while the chat is open = already read
          if (newMessage.sender_id !== currentAuthUserId) {
            const { error } = await supabase
              .from("conversations")
              .update({
                admin_last_read_at: new Date().toISOString(),
              })
              .eq("id", conversationId)

            if (error) {
              console.error(
                "🚨 Failed to mark live message as read:",
                error
              )
            }

            setAdminUnreadCounts((current) => {
              if (!current[conversationId]) return current
              const updated = { ...current }
              delete updated[conversationId]
              return updated
            })
          }

          return
        }

        // ---------------------------------------------
        // EDITED / DELETED FOR EVERYONE (soft delete)
        // ---------------------------------------------
        if (payload.eventType === "UPDATE") {
          setConversationMessages((current) =>
            current.map((m) =>
              m.id === payload.new.id ? { ...m, ...payload.new } : m
            )
          )
          return
        }

        // ---------------------------------------------
        // HARD DELETE
        // ---------------------------------------------
        if (payload.eventType === "DELETE") {
          setConversationMessages((current) =>
            current.filter((m) => m.id !== payload.old.id)
          )
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [
  showMessaging,
  activeConversation?.id,
  currentAuthUserId,
])





const getNotificationStatus = (notification) => {
  const text = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (text.includes("reject")) return "rejected";
  if (text.includes("cancel")) return "cancelled";
  if (text.includes("complete")) return "completed";
  if (
    notification.type === "service_started" ||
    text.includes("service started") ||
    text.includes("has started")
  ) return "started";
  if (/\bconfirmed\b/.test(text)) return "approved";
  if (text.includes("approve")) return "approved";

  return null;
};

const getInventoryStatus = (notification) => {
  const text = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();

  if (/\b(delete|deleted|removed)\b/.test(text)) return "rejected";   // red
  if (text.includes("restock")) return "approved";                    // green
  if (/\b(used|deducted|consumed)\b/.test(text)) return "cancelled";  // orange
  if (text.includes("update")) return "updated";                      // blue

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
    started: {
    icon: "bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-600 ring-yellow-200/50",
    rowUnread: "bg-yellow-50/70 hover:bg-yellow-50",
    rowRead: "bg-yellow-50/30 hover:bg-yellow-50/60",
    bar: "from-yellow-400 to-yellow-600",
    dot: "bg-yellow-500",
    text: "text-yellow-600",
  },
    updated: {
    icon: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 ring-blue-200/50",
    rowUnread: "bg-blue-50/70 hover:bg-blue-50",
    rowRead: "bg-blue-50/30 hover:bg-blue-50/60",
    bar: "from-blue-500 to-blue-700",
    dot: "bg-blue-600",
    text: "text-blue-600",
  },
};

const getInventoryActionTheme = (action) => {
  const a = String(action || "").toLowerCase();

  if (["restocked", "restored", "added"].includes(a)) {
    return {
      Icon: TrendingUp,
      iconBox: "bg-emerald-50 text-emerald-600",
      accent: "bg-gradient-to-r from-emerald-500 to-green-400",
      text: "text-emerald-600",
      hero: "from-emerald-600 via-emerald-600 to-green-700 border-emerald-100 shadow-emerald-500/15",
      heroSub: "text-emerald-100",
    };
  }

  if (["deleted", "removed"].includes(a)) {
    return {
      Icon: Trash2,
      iconBox: "bg-red-50 text-red-600",
      accent: "bg-gradient-to-r from-red-500 to-rose-400",
      text: "text-red-600",
      hero: "from-red-600 via-red-600 to-rose-700 border-red-100 shadow-red-500/15",
      heroSub: "text-red-100",
    };
  }

  if (["edited", "updated"].includes(a)) {
    return {
      Icon: Pencil,
      iconBox: "bg-blue-50 text-blue-600",
      accent: "bg-gradient-to-r from-blue-500 to-indigo-400",
      text: "text-blue-600",
      hero: "from-blue-600 via-blue-600 to-indigo-700 border-blue-100 shadow-blue-500/15",
      heroSub: "text-blue-100",
    };
  }

  // Used / anything that lowers stock
  return {
    Icon: TrendingDown,
    iconBox: "bg-orange-50 text-orange-600",
    accent: "bg-gradient-to-r from-orange-500 to-amber-400",
    text: "text-orange-600",
    hero: "from-orange-500 via-orange-500 to-amber-600 border-orange-100 shadow-orange-500/15",
    heroSub: "text-orange-100",
  };
};

const selectedActivityTheme = getInventoryActionTheme(
  selectedInventoryActivity?.action
);

useEffect(() => {
  const isModalOpen =
    showVehicleEligibilityModal ||
    showRejectModal ||
    showCancelDialog;

  if (!isModalOpen) return;

  const prevBody = document.body.style.overflow;
  const prevHtml = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = prevBody;
    document.documentElement.style.overflow = prevHtml;
  };
}, [showVehicleEligibilityModal, showRejectModal, showCancelDialog]);








  // =========================================================
  // RENDER
  // =========================================================

 return (
  <div className="min-h-screen bg-[#f4f6f8] text-gray-900">


    {/* =====================================================
        TOP NAVIGATION
    ===================================================== */}

    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">

      <div className="mx-auto flex min-h-[74px] w-full items-center justify-between gap-3 px-3 sm:min-h-[82px] sm:px-5 lg:px-8">

        {/* =================================================
            LEFT SIDE — BRAND
        ================================================= */}

        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">

          {/* PREMIUM RED ACCENT */}

          <div className="hidden h-11 w-1 rounded-full bg-gradient-to-b from-red-500 via-red-700 to-red-900 shadow-[0_0_12px_rgba(185,28,28,0.25)] sm:block" />


          {/* BRAND ICON */}

<div
  className="
    relative
    flex
    h-10
    w-10
    shrink-0
    cursor-pointer
    items-center
    justify-center
    rounded-2xl
    bg-gradient-to-br
    from-red-600
    via-red-700
    to-red-900
    text-white
    shadow-[0_8px_20px_rgba(185,28,28,0.28)]
    ring-1
    ring-red-900/10
    transition-all
    duration-300
    hover:scale-110
    hover:shadow-[0_12px_28px_rgba(185,28,28,0.38)]
    active:scale-95
    sm:h-12
    sm:w-12
  "
>
  <div className="absolute inset-0 rounded-2xl bg-white/10" />

  <FaBolt className="relative text-base sm:text-lg" />
</div>



          {/* BRAND TEXT */}

          <div className="min-w-0">

            <h2 className="truncate text-sm font-extrabold tracking-tight text-gray-950 sm:text-lg lg:text-xl">
              Alavaren Auto Electrical
            </h2>

            <p className="mt-0.5 hidden text-[11px] font-medium tracking-wide text-gray-400 sm:block sm:text-xs">
              ADMIN CONTROL CENTER
            </p>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="relative">

            {/* NOTIFICATION BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-gray-200/80
                bg-white
                text-gray-500
                shadow-[0_4px_14px_rgba(15,23,42,0.05)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-700
                hover:shadow-[0_8px_20px_rgba(185,28,28,0.10)]
                active:scale-95
                sm:h-11
                sm:w-11
              "
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              aria-haspopup="true"
            >

              <FaBell
                className={`
                  relative
                  text-base
                  transition-all
                  duration-300
                  sm:text-lg

                  ${
                    notifications.filter(
                      (notification) =>
                        !notification.is_read
                    ).length > 0
                      ? "animate-pulse text-red-600"
                      : "text-gray-500"
                  }

                  ${
                    showNotifications
                      ? "scale-110"
                      : "scale-100"
                  }
                `}
              />


              {/* UNREAD COUNT */}

              {notifications.filter(
                (notification) =>
                  !notification.is_read
              ).length > 0 && (

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
                    border-2
                    border-white
                    bg-gradient-to-br
                    from-red-500
                    to-red-700
                    px-1
                    text-[8px]
                    font-extrabold
                    text-white
                    shadow-[0_4px_10px_rgba(185,28,28,0.35)]
                    animate-[notificationCountImpulse_1.5s_ease-in-out_infinite]
                    sm:h-5
                    sm:min-w-5
                    sm:text-[9px]
                  "
                >

                  {
                    notifications.filter(
                      (notification) =>
                        !notification.is_read
                    ).length > 99
                      ? "99+"
                      : notifications.filter(
                          (notification) =>
                            !notification.is_read
                        ).length
                  }

                </span>

              )}

            </button>


            {/* =================================================
                FLOATING NOTIFICATION PANEL
            ================================================= */}

            {showNotifications && (

              <div
                className="
                  fixed
                  left-2
                  right-2
                  top-[4.5rem]
                  z-[9999]
                  w-auto
                  overflow-hidden
                  rounded-3xl
                  border
                  border-gray-200/80
                  bg-white/95
                  shadow-[0_25px_80px_rgba(15,23,42,0.22)]
                  ring-1
                  ring-black/[0.03]
                  backdrop-blur-xl
                  origin-top-right
                  animate-[notificationFloatingImpulse_280ms_cubic-bezier(0.16,1,0.3,1)]
                  max-h-[calc(100dvh-5.25rem)]
                  sm:left-auto
                  sm:right-3
                  sm:top-[4.75rem]
                  sm:w-[420px]
                  md:right-5
                  lg:right-6
                "
              >

                {/* =================================================
                    NOTIFICATION HEADER
                ================================================= */}

                <div
                  className="
                    relative
                    shrink-0
                    overflow-hidden
                    border-b
                    border-gray-100
                    bg-gradient-to-br
                    from-white
                    via-white
                    to-red-50/30
                    px-4
                    py-4
                    sm:px-5
                    sm:py-5
                  "
                >

                  {/* HEADER ACCENT */}

                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-800" />


                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-3
                    "
                  >

                    {/* TITLE */}

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >

                        <h3
                          className="
                            text-sm
                            font-extrabold
                            tracking-tight
                            text-gray-950
                            sm:text-base
                          "
                        >
                          Notifications
                        </h3>


                        {notificationCount > 0 && (

                          <span
                            className="
                              shrink-0
                              rounded-full
                              bg-red-50
                              px-2.5
                              py-1
                              text-[9px]
                              font-extrabold
                              text-red-700
                              ring-1
                              ring-red-100
                              sm:text-[10px]
                            "
                          >
                            {notificationCount} unread
                          </span>

                        )}

                      </div>


                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          leading-4
                          text-gray-500
                          sm:text-xs
                        "
                      >
                        Stay updated with your business activity
                      </p>

                    </div>





                    {/* HEADER ACTIONS */}

<div
  className="
    flex
    shrink-0
    items-center
    gap-1.5
    sm:gap-2
  "
>

  {/* MARK ALL AS READ */}

  {notificationCount > 0 && (

    <button
      type="button"
      onClick={markAllNotificationsAsRead}
      className="
        inline-flex
        min-h-8
        items-center
        gap-1
        rounded-xl
        border
        border-blue-100
        bg-blue-50/70
        px-2
        py-1.5
        text-[9px]
        font-bold
        text-blue-600
        transition-all
        duration-200
        hover:bg-blue-100
        hover:shadow-sm
        active:scale-95
        sm:px-2.5
        sm:text-[10px]
      "
    >

      <FaCheck className="text-[8px] sm:text-[9px]" />

      <span className="hidden xs:inline">
        Mark all read
      </span>

      <span className="xs:hidden">
        Read all
      </span>

    </button>

  )}


  {/* CLEAR ALL */}

  {notifications.length > 0 && (

    <button
      type="button"
      onClick={clearAllNotifications}
      className="
        inline-flex
        min-h-8
        items-center
        gap-1
        rounded-xl
        border
        border-red-100
        bg-red-50/70
        px-2
        py-1.5
        text-[9px]
        font-bold
        text-red-600
        transition-all
        duration-200
        hover:bg-red-100
        hover:shadow-sm
        active:scale-95
        sm:px-2.5
        sm:text-[10px]
      "
      title="Clear all notifications"
      aria-label="Clear all notifications"
    >

      <FaTrashAlt className="text-[8px] sm:text-[9px]" />

      <span className="hidden xs:inline">
        Clear all
      </span>

      <span className="xs:hidden">
        Clear
      </span>

    </button>

  )}


  {/* HEADER BELL */}

  <div
    className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-2xl
      bg-gradient-to-br
      from-red-50
      to-red-100
      text-red-600
      shadow-inner
      sm:h-10
      sm:w-10
    "
  >

    <FaBell className="text-sm sm:text-base" />

  </div>

</div>




                  </div>

                </div>



                


                {/* =================================================
                    NOTIFICATION LIST
                ================================================= */}

                <div
                  className="
                    min-h-0
                    overflow-y-auto
                    overscroll-contain
                    scrollbar-thin
                    scrollbar-thumb-gray-200
                    scrollbar-track-transparent
                    max-h-[calc(100dvh-11.5rem)]
                    sm:max-h-[440px]
                  "
                >

                  {notifications.length === 0 ? (

                    /* EMPTY STATE */

                    <div
                      className="
                        px-5
                        py-14
                        text-center
                        sm:px-6
                      "
                    >

                      <div
                        className="
                          relative
                          mx-auto
                          mb-5
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-3xl
                          bg-gradient-to-br
                          from-gray-50
                          to-gray-100
                          text-gray-400
                          shadow-inner
                          ring-1
                          ring-gray-200/70
                          animate-[notificationEmptyImpulse_1.8s_ease-in-out_infinite]
                          sm:h-20
                          sm:w-20
                        "
                      >

                        <FaBell className="text-xl sm:text-2xl" />

                      </div>


                      <p className="font-bold text-gray-800">
                        No notifications yet
                      </p>


                      <p
                        className="
                          mx-auto
                          mt-1.5
                          max-w-xs
                          text-[11px]
                          leading-5
                          text-gray-400
                          sm:text-xs
                        "
                      >
                        New appointments and business activity
                        will appear here.
                      </p>

                    </div>

                  ) : (

                    /* NOTIFICATIONS */

                    notifications.map(
                      (notification) => {

                        const isUnread =
                          !notification.is_read

                        const isAppointment =
                          notification.type === "appointment" ||
                          notification.type === "booking_status"

                        const isInventory =
                          notification.type === "inventory" ||
                          notification.type === "low_stock"
                        const isMessage =
                          notification.type === "message"
                       const isServiceStarted =
  notification.type === "service_started"
const isInventoryUpdate =
  notification.type === "inventory"

const notificationStatus = isInventoryUpdate
  ? getInventoryStatus(notification)
  : isAppointment || isServiceStarted
  ? getNotificationStatus(notification)
  : null

  const statusStyle = notificationStatus
  ? notificationStatusStyles[notificationStatus]
  : null


                        return (

                          <div
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`
                              group
                              relative
                              cursor-pointer
                              border-b
                              border-gray-100/80
                              px-4
                              py-4
                              transition-all
                              duration-300
                              ease-out
                              hover:bg-gray-50/80
                              active:scale-[0.995]
                              sm:px-5

                              ${
  statusStyle
    ? isUnread
      ? statusStyle.rowUnread
      : statusStyle.rowRead
    : isUnread
    ? "bg-blue-50/40 hover:bg-blue-50/70"
    : "bg-white hover:bg-gray-50"
}
                            `}
                          >

                            <div className="flex gap-3">


                              {/* NOTIFICATION ICON */}

                              <div
                                className={`
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-2xl
                                  shadow-sm
                                  ring-1
                                  transition-all
                                  duration-300
                                  group-hover:scale-105
                                  group-hover:shadow-md
                                  sm:h-11
                                  sm:w-11

                                 ${
  notificationStatus
    ? notificationStatusStyles[notificationStatus].icon
    : isMessage
    ? "bg-gradient-to-br from-red-50 to-red-100 text-red-600 ring-red-200/50"
    : isAppointment
    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 ring-blue-200/50"
    : isInventory
    ? "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 ring-orange-200/50"
    : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500 ring-gray-200/70"
}
                                `}
                              >

                                {isMessage ? (

  <MessageCircle className="text-sm sm:text-base" />

) : notificationStatus === "started" || isServiceStarted ? (

  <FaWrench className="text-sm sm:text-base" />

) : isAppointment ? (

  <FaCalendarAlt className="text-sm sm:text-base" />

) : isInventory ? (

  <FaBoxOpen className="text-sm sm:text-base" />

) : (

  <FaBell className="text-sm sm:text-base" />

)}


                              </div>


                              {/* CONTENT */}

                              <div className="min-w-0 flex-1">


                                {/* TITLE + NEW */}

                                <div
                                  className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                  "
                                >

                                  <p
                                    className={`
                                      min-w-0
                                      break-words
                                      text-xs
                                      leading-5
                                      sm:text-sm

                                      ${
                                        isUnread
                                          ? "font-extrabold text-gray-950"
                                          : "font-semibold text-gray-700"
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
      ${statusStyle ? statusStyle.dot : "bg-blue-600"}
      px-1.5
      py-0.5
      text-[8px]
      font-extrabold
      tracking-wide
      text-white
      shadow-sm
      animate-pulse
      sm:px-2
      sm:text-[9px]
    `}
  >
    NEW
  </span>

)}

                                  

                                </div>


                                

{/* MESSAGE */}

<p
  className={`
    mt-1
    break-words
    text-[11px]
    leading-5
    whitespace-pre-line
    sm:text-xs

    ${
      isUnread
        ? "text-gray-600"
        : "text-gray-500"
    }
  `}
>
  {notification.message
    ?.split(/\n\s*\n/)
    .map((part, index) => {

      const cleanPart = part.trim()

      if (!cleanPart) return null

      return (
        <React.Fragment key={index}>

          {index > 0 && (
            <span className="block h-2" />
          )}

          <span>
            {index === 0 ? (

              cleanPart.startsWith("Walk-in Booking") ? (
                <>
                  <span className="font-bold text-gray-800">
                    Walk-in Booking
                  </span>

                  {cleanPart
                    .substring("Walk-in Booking".length)
                    .replace(
                      /•\s*(APPT-\d+)/,
                      ""
                    )}

                  {(() => {
                    const match =
                      cleanPart.match(/•\s*(APPT-\d+)/)

                    return match ? (
                      <>
                        {" • "}
                        <span className="font-extrabold text-gray-900">
                          {match[1]}
                        </span>
                      </>
                    ) : null
                  })()}
                </>
              )

              : cleanPart.startsWith("Online Booking") ? (
                <>
                  <span className="font-bold text-gray-800">
                    Online Booking
                  </span>

                  {cleanPart
                    .substring("Online Booking".length)
                    .replace(
                      /•\s*(APPT-\d+)/,
                      ""
                    )}

                  {(() => {
                    const match =
                      cleanPart.match(/•\s*(APPT-\d+)/)

                    return match ? (
                      <>
                        {" • "}
                        <span className="font-extrabold text-gray-900">
                          {match[1]}
                        </span>
                      </>
                    ) : null
                  })()}
                </>
              )

              : cleanPart.startsWith("Appointment No.") ? (
                <span className="font-extrabold text-gray-900">
                  {cleanPart}
                </span>
              )

              : (
                cleanPart
              )

            ) : (
              cleanPart
            )}
          </span>

        </React.Fragment>
      )
    })}
</p>


                                


                                {/* TIME / STATUS / DELETE */}

                                <div
                                  className="
                                    mt-2.5
                                    flex
                                    items-center
                                    justify-between
                                    gap-2
                                  "
                                >

                                  {/* TIME + STATUS */}

                                  <div
                                    className="
                                      flex
                                      min-w-0
                                      items-center
                                      gap-1.5
                                      sm:gap-2
                                    "
                                  >

                                    <span
  className={`
    h-1.5
    w-1.5
    shrink-0
    rounded-full

    ${
      isUnread
        ? statusStyle
          ? `${statusStyle.dot} shadow-sm`
          : "bg-blue-600 shadow-[0_0_7px_rgba(37,99,235,0.6)]"
        : "bg-gray-300"
    }
  `}
/>


                                    <p
                                      className="
                                        truncate
                                        text-[9px]
                                        font-medium
                                        text-gray-400
                                        sm:text-[10px]
                                      "
                                    >
                                      {timeAgo(
                                        notification.created_at
                                      )}
                                    </p>


                                    <span
                                      className={`
                                        shrink-0
                                        text-[8px]
                                        font-extrabold
                                        uppercase
                                        tracking-wide
                                        sm:text-[9px]

                                        ${
  isUnread
    ? statusStyle
      ? statusStyle.text
      : "text-blue-600"
    : "text-gray-400"
}
                                      `}
                                    >
                                      {isUnread
                                        ? "Unread"
                                        : "Read"}
                                    </span>

                                  </div>


                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={(e) => {
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
                                      rounded-xl
                                      px-2
                                      py-1.5
                                      text-[9px]
                                      font-semibold
                                      text-gray-400
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

                                    <FaTrashAlt />

                                    <span className="hidden sm:inline">
                                      Delete
                                    </span>

                                  </button>

                                </div>

                              </div>

                            </div>

                            


                            {/* UNREAD SIDE INDICATOR */}

                            {isUnread && (

                              <span
                                className={`
  absolute
  left-0
  top-0
  h-full
  w-1
  rounded-r-full
  bg-gradient-to-b
  ${statusStyle ? statusStyle.bar : "from-blue-500 to-blue-700"}
  shadow-[0_0_8px_rgba(37,99,235,0.25)]
`}
                              />

                            )}

                          </div>

                        )

                      }

                    )

                  )}

                </div>


                {/* =================================================
                    NOTIFICATION FOOTER
                ================================================= */}

                {notifications.length > 0 && (

                  <div
                    className="
                      shrink-0
                      border-t
                      border-gray-100
                      bg-gradient-to-r
                      from-gray-50
                      to-white
                      px-4
                      py-3
                      sm:px-5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      <p
                        className="
                          text-[9px]
                          font-semibold
                          text-gray-400
                          sm:text-[10px]
                        "
                      >

                        {notifications.length}

                        {" "}

                        {notifications.length === 1
                          ? "notification"
                          : "notifications"}

                      </p>


                      {notificationCount > 0 && (

                        <p
                          className="
                            rounded-full
                            bg-blue-50
                            px-2
                            py-1
                            text-[9px]
                            font-bold
                            text-blue-600
                            sm:text-[10px]
                          "
                        >

                          {notificationCount} unread

                        </p>

                      )}

                    </div>

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                FLOATING NOTIFICATION ANIMATIONS
            ================================================= */}

            <style>
              {`
                @keyframes notificationFloatingImpulse {
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


                @keyframes notificationCountImpulse {
                  0%,
                  100% {
                    transform: scale(1);
                  }

                  50% {
                    transform: scale(1.08);
                  }
                }


                @keyframes notificationEmptyImpulse {
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

                  [class*="notificationFloatingImpulse"],
                  [class*="notificationCountImpulse"],
                  [class*="notificationEmptyImpulse"],
                  .animate-pulse {
                    animation: none !important;
                  }

                }
              `}
            </style>

          </div>


          {/* =================================================
              ONLINE STATUS
          ================================================= */}

          <div
            className="
              hidden
              items-center
              gap-2
              rounded-2xl
              border
              border-emerald-200/80
              bg-gradient-to-r
              from-emerald-50
              to-green-50
              px-3.5
              py-2.5
              shadow-sm
              sm:flex
            "
          >

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />

            <span className="text-[11px] font-extrabold tracking-wide text-emerald-700">
              Online
            </span>

          </div>


          {/* =================================================
              ADMIN PROFILE
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/admin/profile")
            }
            className="
              group
              flex
              items-center
              gap-2
              border-l
              border-gray-200
              pl-2.5
              text-left
              transition-all
              duration-300
              hover:opacity-90
              sm:gap-3
              sm:pl-4
            "
            title="Open profile"
          >

            {/* AVATAR */}

            {adminProfile?.avatar_url ? (

              <img
                src={adminProfile.avatar_url}
                alt="Profile"
                className="
                  h-9
                  w-9
                  rounded-full
                  border-2
                  border-white
                  object-cover
                  shadow-[0_4px_14px_rgba(15,23,42,0.14)]
                  ring-1
                  ring-gray-200
                  transition-all
                  duration-300
                  group-hover:scale-105
                  group-hover:ring-red-200
                  sm:h-11
                  sm:w-11
                "
              />

            ) : (

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-red-500
                  via-red-700
                  to-red-900
                  text-xs
                  font-extrabold
                  text-white
                  shadow-[0_6px_16px_rgba(185,28,28,0.25)]
                  ring-2
                  ring-white
                  transition-all
                  duration-300
                  group-hover:scale-105
                  sm:h-11
                  sm:w-11
                  sm:text-sm
                "
              >

                {adminProfile?.name
                  ? adminProfile.name
                      .split(" ")
                      .filter(Boolean)
                      .map(word => word[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()
                  : "A"}

              </div>

            )}


            {/* ADMIN INFORMATION */}

            <div className="hidden text-right md:block">

              <p
                className="
                  max-w-[150px]
                  truncate
                  text-sm
                  font-extrabold
                  tracking-tight
                  text-gray-800
                "
              >
                {adminProfile?.name ||
                  "Administrator"}
              </p>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">

                {adminProfile?.role === "admin"
                  ? "Administrator"
                  : "Admin Account"}

              </p>

            </div>

          </button>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <button
            type="button"
            onClick={() =>
              supabase.auth
                .signOut()
                .then(() =>
                  navigate("/")
                )
            }
            className="
              group
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-red-200
              bg-gradient-to-br
              from-red-50
              to-red-100/70
              px-3
              text-sm
              font-bold
              text-red-700
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-red-600
              hover:bg-gradient-to-br
              hover:from-red-600
              hover:to-red-700
              hover:text-white
              hover:shadow-[0_8px_20px_rgba(185,28,28,0.25)]
              active:scale-95
              sm:h-11
              sm:px-4
            "
            title="Logout"
          >

            <FaSignOutAlt className="text-sm transition-transform duration-300 group-hover:translate-x-0.5" />

            <span className="hidden sm:inline">
              Logout
            </span>

          </button>

        </div>

      </div>

    </header>


    {/* =====================================================
        MAIN CONTENT
    ===================================================== */}

    <div
      className="
        mx-auto
        w-full
        max-w-[1600px]
        px-4
        py-6
        sm:px-6
        sm:py-7
        md:px-8
        md:py-9
      "
    >

      {/* =================================================
          DASHBOARD WELCOME
      ================================================= */}

      <div
        className="
          mb-7
          flex
          flex-col
          gap-5
          sm:mb-9
          md:flex-row
          md:items-end
          md:justify-between
          md:gap-6
        "
      >

        <div className="min-w-0 flex-1">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]" />

            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-red-600 sm:text-xs">
              Admin Dashboard
            </span>

          </div>


          <h2
            className="
              text-2xl
              font-extrabold
              leading-tight
              tracking-tight
              text-gray-950
              sm:text-3xl
              md:text-4xl
              lg:text-[2.65rem]
            "
          >
            {greeting}, Admin 👋
          </h2>


          <p
            className="
              mt-2.5
              max-w-2xl
              text-sm
              leading-6
              text-gray-500
              sm:text-base
            "
          >
            Here's a quick overview of your appointments,
            services, inventory, and business activity.
          </p>

        </div>


        {/* PREMIUM DASHBOARD INFO CARD */}

        <div
          className="
            relative
            w-full
            overflow-hidden
            rounded-3xl
            border
            border-gray-200/80
            bg-white
            px-5
            py-4
            shadow-[0_10px_30px_rgba(15,23,42,0.06)]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-[0_15px_35px_rgba(15,23,42,0.09)]
            sm:px-6
            sm:py-5
            md:w-auto
            md:min-w-[290px]
          "
        >

          {/* RED GLOW */}

          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100/60 blur-2xl" />


          <div className="relative">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">

                <FaBolt className="text-xs" />

              </div>

              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-gray-400">
                Admin Dashboard
              </p>

            </div>


            <p className="mt-2 text-sm font-bold leading-5 text-gray-800">
              Manage your business in one place
            </p>

          </div>

        </div>

      </div>



{/* ===================================================
    PREMIUM SUMMARY CARDS
    UI ONLY — NO LOGIC CHANGED
=================================================== */}

<div className="mb-6 sm:mb-8">

  {/* ===================================================
      MOBILE — PREMIUM HORIZONTAL CAROUSEL
  =================================================== */}

  <div className="sm:hidden">

    <div
  ref={mobileSummaryScrollRef}
  onScroll={(e) => {
    const container = e.currentTarget

    const cardWidth =
      container.clientWidth * 0.86 + 12

    const index = Math.round(
      container.scrollLeft / cardWidth
    )

    setActiveSummaryCard(
      Math.max(0, Math.min(3, index))
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
    pb-4
    pt-1
    scrollbar-none
  "
  style={{
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }}
>



      {/* =================================================
          APPOINTMENTS
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

        {/* PREMIUM BACKGROUND */}

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
            via-red-50
            to-transparent
            opacity-90
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-1
            w-24
            rounded-l-full
            bg-gradient-to-r
            from-red-500
            to-rose-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-500">
                Appointments
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-slate-950">
              {stats.appointments}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              All appointment records
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
              from-red-500
              to-rose-700
              text-white
              shadow-[0_8px_20px_rgba(220,38,38,0.30)]
              ring-1
              ring-red-400/30
            "
          >

            <CalendarDays
              className="h-5.5 w-5.5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          INVENTORY
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
          border-blue-100
          bg-white
          p-4
          shadow-[0_10px_35px_rgba(37,99,235,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
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
            from-blue-100
            via-blue-50
            to-transparent
            opacity-90
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-1
            w-24
            rounded-l-full
            bg-gradient-to-r
            from-blue-500
            to-indigo-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
                Inventory
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-slate-950">
              {stats.inventory}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Available items in stock
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
              from-blue-500
              to-indigo-700
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.30)]
              ring-1
              ring-blue-400/30
            "
          >

            <Package
              className="h-5.5 w-5.5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          SERVICE TASKS
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

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-1
            w-24
            rounded-l-full
            bg-gradient-to-r
            from-amber-400
            to-orange-600
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600">
                Service Tasks
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-slate-950">
              {stats.tasks}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Current service workload
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

            <Wrench
              className="h-5.5 w-5.5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>


      {/* =================================================
          CUSTOMERS
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
          border-emerald-100
          bg-white
          p-4
          shadow-[0_10px_35px_rgba(16,185,129,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
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
            from-emerald-100
            via-green-50
            to-transparent
            opacity-90
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            h-1
            w-24
            rounded-l-full
            bg-gradient-to-r
            from-emerald-500
            to-green-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                Customers
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-slate-950">
              {stats.customers}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Registered customer accounts
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
              from-emerald-500
              to-green-700
              text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.30)]
              ring-1
              ring-emerald-400/30
            "
          >

            <Users
              className="h-5.5 w-5.5"
              strokeWidth={2.5}
            />

          </div>

        </div>

      </div>

    </div>


    {/* =================================================
        MOBILE SWIPE INDICATOR
    ================================================= */}

    {/* =================================================
    MOBILE SWIPE INDICATOR
================================================= */}

<div className="mt-2 flex flex-col items-center">

  <div
    className="
      flex
      items-center
      justify-center
      gap-1.5
      rounded-full
      border
      border-slate-200
      bg-white
      px-3
      py-2
      shadow-[0_4px_15px_rgba(15,23,42,0.08)]
    "
  >

    {[0, 1, 2, 3].map((index) => (

      <button
        key={index}
        type="button"
        aria-label={`Go to summary card ${index + 1}`}
        onClick={() => {

          const container =
            mobileSummaryScrollRef.current

          if (!container) return

          const cardWidth =
            container.clientWidth * 0.86 + 12

          container.scrollTo({
            left: index * cardWidth,
            behavior: "smooth",
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
            ease-out

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
                  hover:bg-slate-500
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


  {/* ===================================================
      TABLET / DESKTOP
  =================================================== */}

  <div
    className="
      hidden
      sm:grid
      sm:grid-cols-2
      sm:gap-4
      lg:grid-cols-4
      lg:gap-5
    "
  >

    {/* =================================================
        APPOINTMENTS
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
          via-red-50
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
            Appointments
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {stats.appointments}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            All appointment records
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

          <CalendarDays
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>


    {/* =================================================
        INVENTORY
    ================================================= */}

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-blue-100
        bg-white
        p-5
        shadow-[0_10px_35px_rgba(37,99,235,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(37,99,235,0.15)]
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
          from-blue-100
          via-blue-50
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
          from-blue-500
          to-indigo-700
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-500">
            Inventory
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {stats.inventory}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Available items in stock
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
            from-blue-500
            to-indigo-700
            text-white
            shadow-[0_8px_20px_rgba(37,99,235,0.28)]
            ring-1
            ring-blue-400/30
            transition-transform
            duration-300
            group-hover:scale-110
          "
        >

          <Package
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>


    {/* =================================================
        SERVICE TASKS
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
            Service Tasks
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {stats.tasks}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Current service workload
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

          <Wrench
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>


    {/* =================================================
        CUSTOMERS
    ================================================= */}

    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-emerald-100
        bg-white
        p-5
        shadow-[0_10px_35px_rgba(16,185,129,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(16,185,129,0.15)]
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
          from-emerald-100
          via-green-50
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
          from-emerald-500
          to-green-700
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-600">
            Customers
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950">
            {stats.customers}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Registered customer accounts
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
            from-emerald-500
            to-green-700
            text-white
            shadow-[0_8px_20px_rgba(16,185,129,0.28)]
            ring-1
            ring-emerald-400/30
            transition-transform
            duration-300
            group-hover:scale-110
          "
        >

          <Users
            className="h-6 w-6"
            strokeWidth={2.5}
          />

        </div>

      </div>

    </div>

  </div>

</div>








<AnnouncementBanner />




{/* =========================================================
    ACCOUNT MODERATION
    PREMIUM RESPONSIVE UI
    UI ONLY — EXISTING FUNCTIONS / LOGIC PRESERVED
========================================================= */}

<div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.07)] sm:p-5 lg:p-6">

  {/* =======================================================
      HEADER
  ======================================================= */}

  <div className="mb-5">

    <div className="flex items-start justify-between gap-3">

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.65)]" />

          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-red-500">
            Security Center
          </p>

        </div>

        <h2 className="mt-1.5 text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
          Account Moderation
        </h2>

        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
          Monitor customer account health and restrictions.
        </p>

      </div>


      {/* REFRESH */}

      <button
        type="button"
        onClick={fetchModerationUsers}
        disabled={moderationLoading}
        className="
          flex
          h-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-3
          text-[11px]
          font-black
          text-slate-700
          shadow-sm
          transition-all
          duration-200
          hover:border-slate-300
          hover:bg-white
          hover:shadow-md
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:h-10
          sm:px-4
          sm:text-xs
        "
      >
        {moderationLoading ? 'Refreshing...' : 'Refresh'}
      </button>

    </div>

  </div>


  {/* =======================================================
      LOADING
  ======================================================= */}

  {moderationLoading ? (

    <div className="flex min-h-[150px] items-center justify-center">

      <div className="text-center">

        <div
          className="
            mx-auto
            h-8
            w-8
            animate-spin
            rounded-full
            border-[3px]
            border-slate-200
            border-t-red-600
          "
        />

        <p className="mt-3 text-[11px] font-bold text-slate-500">
          Loading accounts...
        </p>

      </div>

    </div>


  ) : moderationUsers.length === 0 ? (

    /* =====================================================
       EMPTY STATE
    ===================================================== */

    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-slate-50/80
        px-4
        py-10
        text-center
      "
    >

      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200/70">

        <ShieldCheck
          className="h-6 w-6"
          strokeWidth={2}
        />

      </div>

      <p className="text-sm font-black text-slate-800">
        No customer accounts found.
      </p>

      <p className="mt-1 text-xs font-medium text-slate-400">
        There are currently no accounts to moderate.
      </p>

    </div>


  ) : (

    <>

      {/* ===================================================
          STATUS SUMMARY
      =================================================== */}

      <div className="mb-5 grid grid-cols-3 gap-2.5 sm:gap-3">

        {/* HEALTHY */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-emerald-100
            bg-gradient-to-br
            from-emerald-50
            to-white
            px-3
            py-3
            shadow-sm
            sm:px-4
            sm:py-3.5
          "
        >

          <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-emerald-100/60" />

          <div className="relative">

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.7)]" />

              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-600 sm:text-[10px]">
                Healthy
              </p>

            </div>

            <p className="mt-1 text-2xl font-black tracking-tight text-emerald-900 sm:text-3xl">
              {
                moderationUsers.filter(
                  user =>
                    user.moderation_status !== 'warning' &&
                    user.moderation_status !== 'banned'
                ).length
              }
            </p>

          </div>

        </div>


        {/* WARNINGS */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-amber-100
            bg-gradient-to-br
            from-amber-50
            to-white
            px-3
            py-3
            shadow-sm
            sm:px-4
            sm:py-3.5
          "
        >

          <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-amber-100/60" />

          <div className="relative">

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.7)]" />

              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-600 sm:text-[10px]">
                Warnings
              </p>

            </div>

            <p className="mt-1 text-2xl font-black tracking-tight text-amber-900 sm:text-3xl">
              {
                moderationUsers.filter(
                  user =>
                    user.moderation_status === 'warning'
                ).length
              }
            </p>

          </div>

        </div>


        {/* BANNED */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-red-100
            bg-gradient-to-br
            from-red-50
            to-white
            px-3
            py-3
            shadow-sm
            sm:px-4
            sm:py-3.5
          "
        >

          <div className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-red-100/60" />

          <div className="relative">

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(239,68,68,0.7)]" />

              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-red-600 sm:text-[10px]">
                Banned
              </p>

            </div>

            <p className="mt-1 text-2xl font-black tracking-tight text-red-900 sm:text-3xl">
              {
                moderationUsers.filter(
                  user =>
                    user.moderation_status === 'banned'
                ).length
              }
            </p>

          </div>

        </div>

      </div>


      {/* ===================================================
          RECENT / IMPORTANT ACCOUNTS HEADER
      =================================================== */}

      <div className="mb-3 flex items-end justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-black tracking-tight text-slate-900 sm:text-sm">
            Accounts Requiring Attention
          </p>

          <p className="mt-0.5 text-[10px] font-medium text-slate-400 sm:text-xs">
            Recent warnings and account activity
          </p>

        </div>


        <button
          type="button"
          onClick={() => navigate('/admin/customers')}
          className="
            shrink-0
            rounded-lg
            px-2
            py-1
            text-[10px]
            font-black
            uppercase
            tracking-wide
            text-red-600
            transition
            hover:bg-red-50
            hover:text-red-700
            sm:text-xs
          "
        >
          View All
        </button>

      </div>


      {/* ===================================================
          CUSTOMER CAROUSEL
          MOBILE / IPHONE / ANDROID = HORIZONTAL
          DESKTOP = VERTICAL
      =================================================== */}

      <div
        className="
          -mx-4
          overflow-x-auto
          px-4
          pb-2
          sm:-mx-5
          sm:px-5
          lg:mx-0
          lg:overflow-visible
          lg:px-0
        "
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={(e) => {
          const el = e.currentTarget
          const maxScroll = el.scrollWidth - el.clientWidth

          if (maxScroll <= 0) return

          const progress = el.scrollLeft / maxScroll

          const dots = Math.min(
            5,
            moderationUsers.slice().slice(0, 5).length
          )

          const nextIndex = Math.min(
            dots - 1,
            Math.max(
              0,
              Math.round(progress * (dots - 1))
            )
          )

          setModerationActiveDot(nextIndex)
        }}
      >

        <div
          className="
            flex
            gap-3
            lg:block
          "
        >

          {/*
            Show only the first 5 accounts on the dashboard.
            Full moderation list remains available through
            "View All".
          */}

          {moderationUsers
            .slice()
            .sort((a, b) => {

              const priority = {
                banned: 0,
                warning: 1,
                healthy: 2,
              }

              return (
                (priority[a.moderation_status] ?? 2) -
                (priority[b.moderation_status] ?? 2)
              )

            })
            .slice(0, 5)
            .map((user, index) => {

              const status =
                user.moderation_status

              const warningCount =
                user.warning_count || 0

              return (

                <div
                  key={user.id}
                  className={`
                    relative
                    w-[84vw]
                    max-w-[350px]
                    shrink-0
                    overflow-hidden
                    rounded-[22px]
                    border
                    bg-white
                    p-4
                    shadow-[0_10px_30px_rgba(15,23,42,0.07)]
                    transition-all
                    duration-300
                    active:scale-[0.985]
                    sm:w-[340px]
                    sm:p-4
                    lg:mb-3
                    lg:w-full
                    lg:max-w-none
                    lg:shrink
                    lg:rounded-2xl
                    lg:p-3.5
                    lg:hover:-translate-y-0.5
                    lg:hover:shadow-[0_12px_35px_rgba(15,23,42,0.10)]
                    ${
                      status === 'banned'
                        ? 'border-red-100'
                        : status === 'warning'
                          ? 'border-amber-100'
                          : 'border-emerald-100'
                    }
                  `}
                >

                  {/* PREMIUM COLOR GLOW */}

                  <div
                    className={`
                      pointer-events-none
                      absolute
                      -right-8
                      -top-8
                      h-28
                      w-28
                      rounded-full
                      opacity-70
                      ${
                        status === 'banned'
                          ? 'bg-red-100'
                          : status === 'warning'
                            ? 'bg-amber-100'
                            : 'bg-emerald-100'
                      }
                    `}
                  />


                  {/* CUSTOMER ROW */}

                  <div className="relative flex items-center gap-3">

                    {/* AVATAR */}

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        text-sm
                        font-black
                        shadow-sm
                        ring-1
                        ${
                          status === 'banned'
                            ? 'bg-gradient-to-br from-red-500 to-rose-700 text-white ring-red-300/40'
                            : status === 'warning'
                              ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white ring-amber-300/40'
                              : 'bg-gradient-to-br from-emerald-500 to-green-700 text-white ring-emerald-300/40'
                        }
                      `}
                    >
                      {user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.name || 'Customer'}
      className="h-full w-full rounded-xl object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none'
        e.currentTarget.parentElement
          ?.classList.add('avatar-fallback')
      }}
    />
  ) : (
    user.name
      ?.charAt(0)
      ?.toUpperCase() || '?'
  )}
</div>

                    {/* CUSTOMER INFO */}

                    <div className="min-w-0 flex-1">

                      <p
                        className="
                          truncate
                          text-sm
                          font-black
                          tracking-tight
                          text-slate-950
                        "
                        title={user.name}
                      >
                        {user.name}
                      </p>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-[10px]
                          font-medium
                          text-slate-400
                        "
                        title={user.email}
                      >
                        {user.email}
                      </p>

                    </div>


                    {/* STATUS */}

                    <div className="relative shrink-0">

                      {status === 'banned' ? (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-red-200
                            bg-red-50
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-black
                            uppercase
                            tracking-wide
                            text-red-700
                          "
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          Banned
                        </span>

                      ) : status === 'warning' ? (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-amber-200
                            bg-amber-50
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-black
                            uppercase
                            tracking-wide
                            text-amber-700
                          "
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {warningCount}/3
                        </span>

                      ) : (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-emerald-200
                            bg-emerald-50
                            px-2.5
                            py-1.5
                            text-[9px]
                            font-black
                            uppercase
                            tracking-wide
                            text-emerald-700
                          "
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Healthy
                        </span>

                      )}

                    </div>

                  </div>


                  {/* ACTIONS */}

                  {status !== 'banned' && (

                    <div className="relative mt-3 grid grid-cols-2 gap-2">

                      {/* WARN */}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModerationUser(user)
                          setModerationAction('warning')
                          setModerationReason('')
                          setModerationNotes('')
                          setShowModerationModal(true)
                        }}
                        className="
                          rounded-xl
                          border
                          border-amber-200
                          bg-amber-50
                          px-3
                          py-2.5
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wide
                          text-amber-700
                          transition-all
                          duration-200
                          hover:border-amber-300
                          hover:bg-amber-100
                          active:scale-[0.97]
                        "
                      >
                        Warn
                      </button>


                      {/* BAN */}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedModerationUser(user)
                          setModerationAction('ban')
                          setModerationReason('')
                          setModerationNotes('')
                          setShowModerationModal(true)
                        }}
                        className="
                          rounded-xl
                          border
                          border-red-200
                          bg-red-50
                          px-3
                          py-2.5
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wide
                          text-red-700
                          transition-all
                          duration-200
                          hover:border-red-300
                          hover:bg-red-100
                          active:scale-[0.97]
                        "
                      >
                        Ban
                      </button>

                    </div>

                  )}


                  {/* BANNED INFORMATION */}

                  {status === 'banned' && (

                    <div
                      className="
                        relative
                        mt-3
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-red-100
                        bg-red-50/70
                        px-3
                        py-2.5
                        text-[10px]
                        font-bold
                        text-red-600
                      "
                    >

                      <ShieldCheck
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={2.5}
                      />

                      This account is currently restricted.

                    </div>

                  )}

                </div>

              )

            })}

        </div>

      </div>


      {/* ===================================================
          PREMIUM MOBILE DOT INDICATOR
          DYNAMIC — FOLLOWS HORIZONTAL SWIPE
      =================================================== */}

      {moderationUsers.length > 1 && (

        <div className="mt-3 flex flex-col items-center lg:hidden">

          <div className="flex h-3 items-center justify-center gap-1.5">

            {moderationUsers
              .slice()
              .sort((a, b) => {

                const priority = {
                  banned: 0,
                  warning: 1,
                  healthy: 2,
                }

                return (
                  (priority[a.moderation_status] ?? 2) -
                  (priority[b.moderation_status] ?? 2)
                )

              })
              .slice(0, 5)
              .map((_, index) => (

                <span
                  key={index}
                  className={`
                    block
                    rounded-full
                    transition-all
                    duration-300
                    ease-out
                    ${
                      index === moderationActiveDot
                        ? 'h-1.5 w-6 bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.18)]'
                        : 'h-1.5 w-1.5 bg-slate-300'
                    }
                  `}
                />

              ))}

          </div>

          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            Swipe to explore
          </p>

        </div>

      )}

    </>

  )}

</div>








  {/* ===================================================
    PENDING APPOINTMENTS
    PREMIUM RESPONSIVE HORIZONTAL CAROUSEL
    LOGIC + INFORMATION PRESERVED
    MOBILE SWIPE + TABLET SWIPE + DESKTOP ARROWS
    BOTTOM DOT NAVIGATION PRESERVED
=================================================== */}

<div className="mb-8 w-full overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)]">

  {/* ===================================================
      PREMIUM HEADER
  =================================================== */}

  <div className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-br from-white via-white to-red-50/70 px-4 py-5 sm:px-6 sm:py-6 lg:px-7">

    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-100/40 blur-3xl" />

    <div className="pointer-events-none absolute -bottom-20 left-1/3 h-32 w-32 rounded-full bg-orange-100/30 blur-3xl" />

    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex min-w-0 items-center gap-3.5">

        <div
  className="
    flex
    h-12
    w-12
    shrink-0
    items-center
    justify-center
    rounded-2xl
    border
    border-red-100
    bg-gradient-to-br
    from-red-500
    to-rose-700
    text-white
    shadow-[0_8px_20px_rgba(220,38,38,0.30)]
    ring-1
    ring-red-400/30
    transition-transform
    duration-300
    hover:scale-110
    sm:h-14
    sm:w-14
  "
>
  <CalendarDays
    className="h-6 w-6 sm:h-7 sm:w-7"
    strokeWidth={2.5}
  />
</div>

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="truncate text-base font-extrabold tracking-tight text-gray-950 sm:text-lg lg:text-xl">
              Pending Appointments
            </h3>

            <span className="inline-flex items-center rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600">
              Requests
            </span>

          </div>

          <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-gray-500 sm:text-sm">
            Review, assign, approve, or reject new customer appointment requests.
          </p>

        </div>

        

      </div>

      <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-700 shadow-sm">

        <span className="relative flex h-2.5 w-2.5 shrink-0">

          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.45)]" />

        </span>

        Pending Requests

      </span>

    </div>

  </div>


  {/* ===================================================
      CONTENT
  =================================================== */}

  <div className="w-full bg-gradient-to-b from-gray-50/40 to-white p-3 sm:p-5 lg:p-6">

    {recentAppointments.filter(
      (appt) => appt.status === "pending"
    ).length > 0 ? (

      <div className="w-full">

        {/* =================================================
            CAROUSEL WRAPPER
        ================================================= */}

        <div className="relative w-full">


          {/* =================================================
              LEFT ARROW

              Visible on tablet + desktop.
              Mobile uses the compact controls below.
          ================================================= */}

          {recentAppointments.filter(
            (appt) => appt.status === "pending"
          ).length > 1 && (

            <button
              type="button"
              aria-label="Previous appointment"
              disabled={activeSummaryCard === 0}
              onClick={() => {

                const container =
                  mobileSummaryScrollRef.current

                if (!container) return

                const previousIndex =
                  Math.max(
                    0,
                    activeSummaryCard - 1
                  )

                container.scrollTo({
                  left:
                    previousIndex *
                    container.clientWidth,
                  behavior: "smooth",
                })

                setActiveSummaryCard(
                  previousIndex
                )

              }}
              className={`
                absolute
                left-2
                top-1/2
                z-30
                hidden
                h-11
                w-11
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                bg-white/95
                text-gray-700
                shadow-[0_8px_25px_rgba(15,23,42,0.16)]
                backdrop-blur
                transition-all
                duration-200

                sm:flex

                ${
                  activeSummaryCard === 0
                    ? "cursor-not-allowed border-gray-100 text-gray-300 opacity-50"
                    : "border-gray-200 hover:-translate-x-[55%] hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-lg active:scale-95"
                }
              `}
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 18-6-6 6-6"
                />
              </svg>

            </button>

          )}


          {/* =================================================
              RIGHT ARROW
          ================================================= */}

          {recentAppointments.filter(
            (appt) => appt.status === "pending"
          ).length > 1 && (

            <button
              type="button"
              aria-label="Next appointment"
              disabled={
                activeSummaryCard >=
                recentAppointments.filter(
                  (appt) => appt.status === "pending"
                ).length - 1
              }
              onClick={() => {

                const container =
                  mobileSummaryScrollRef.current

                if (!container) return

                const totalAppointments =
                  recentAppointments.filter(
                    (appt) =>
                      appt.status === "pending"
                  ).length

                const nextIndex =
                  Math.min(
                    totalAppointments - 1,
                    activeSummaryCard + 1
                  )

                container.scrollTo({
                  left:
                    nextIndex *
                    container.clientWidth,
                  behavior: "smooth",
                })

                setActiveSummaryCard(
                  nextIndex
                )

              }}
              className={`
                absolute
                right-2
                top-1/2
                z-30
                hidden
                h-11
                w-11
                translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                bg-white/95
                text-gray-700
                shadow-[0_8px_25px_rgba(15,23,42,0.16)]
                backdrop-blur
                transition-all
                duration-200

                sm:flex

                ${
                  activeSummaryCard >=
                  recentAppointments.filter(
                    (appt) =>
                      appt.status === "pending"
                  ).length - 1
                    ? "cursor-not-allowed border-gray-100 text-gray-300 opacity-50"
                    : "border-gray-200 hover:translate-x-[55%] hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-lg active:scale-95"
                }
              `}
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9 18 6-6-6-6"
                />
              </svg>

            </button>

          )}


          {/* =================================================
              MOBILE ARROWS

              Compact controls above the carousel.
          ================================================= */}

          {recentAppointments.filter(
            (appt) => appt.status === "pending"
          ).length > 1 && (

            <div className="mb-3 flex items-center justify-between gap-3 sm:hidden">

              <button
                type="button"
                aria-label="Previous appointment"
                disabled={
                  activeSummaryCard === 0
                }
                onClick={() => {

                  const container =
                    mobileSummaryScrollRef.current

                  if (!container) return

                  const previousIndex =
                    Math.max(
                      0,
                      activeSummaryCard - 1
                    )

                  container.scrollTo({
                    left:
                      previousIndex *
                      container.clientWidth,
                    behavior: "smooth",
                  })

                  setActiveSummaryCard(
                    previousIndex
                  )

                }}
                className={`
                  inline-flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  bg-white
                  shadow-sm
                  transition-all

                  ${
                    activeSummaryCard === 0
                      ? "cursor-not-allowed border-gray-100 text-gray-300"
                      : "border-gray-200 text-gray-700 active:scale-95"
                  }
                `}
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 18-6-6 6-6"
                  />
                </svg>

              </button>


              <div className="min-w-0 text-center">

                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-500 shadow-sm">

                  {activeSummaryCard + 1}{" "}
                  /{" "}
                  {
                    recentAppointments.filter(
                      (appt) =>
                        appt.status === "pending"
                    ).length
                  }

                </span>

              </div>


              <button
                type="button"
                aria-label="Next appointment"
                disabled={
                  activeSummaryCard >=
                  recentAppointments.filter(
                    (appt) =>
                      appt.status === "pending"
                  ).length - 1
                }
                onClick={() => {

                  const container =
                    mobileSummaryScrollRef.current

                  if (!container) return

                  const totalAppointments =
                    recentAppointments.filter(
                      (appt) =>
                        appt.status === "pending"
                    ).length

                  const nextIndex =
                    Math.min(
                      totalAppointments - 1,
                      activeSummaryCard + 1
                    )

                  container.scrollTo({
                    left:
                      nextIndex *
                      container.clientWidth,
                    behavior: "smooth",
                  })

                  setActiveSummaryCard(
                    nextIndex
                  )

                }}
                className={`
                  inline-flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  bg-white
                  shadow-sm
                  transition-all

                  ${
                    activeSummaryCard >=
                    recentAppointments.filter(
                      (appt) =>
                        appt.status === "pending"
                    ).length - 1
                      ? "cursor-not-allowed border-gray-100 text-gray-300"
                      : "border-gray-200 text-gray-700 active:scale-95"
                  }
                `}
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>

              </button>

            </div>

          )}


          {/* =================================================
              HORIZONTAL APPOINTMENT SCROLLER
          ================================================= */}

          <div
            ref={mobileSummaryScrollRef}
            onScroll={(e) => {

              const container =
                e.currentTarget

              if (!container.children.length) {
                return
              }

              const index = Math.round(
                container.scrollLeft /
                container.clientWidth
              )

              setActiveSummaryCard(
                Math.max(
                  0,
                  Math.min(
                    index,
                    container.children.length - 1
                  )
                )
              )

            }}
            className="
              flex
              w-full
              gap-0
              overflow-x-auto
              overflow-y-hidden
              snap-x
              snap-mandatory
              scroll-smooth
              overscroll-x-contain
              touch-pan-x
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >

            {recentAppointments
              .filter(
                (appt) =>
                  appt.status === "pending"
              )
              .map((appt) => {

                const isProcessing =
                  processingAppointmentId ===
                  appt.id

                const realtimeAI =
  realtimeVehicleAI[appt.id]

const vehicleEligibility =
  realtimeAI?.vehicle_eligibility === "pending"
    ? appt.vehicle_eligibility
    : (
        realtimeAI?.vehicle_eligibility ??
        appt.vehicle_eligibility
      )

// ==========================================
// VEHICLE AI CHECK STATUS
// ==========================================
//
// AI is considered completed when the latest
// known result is one of:
//   eligible
//   not_eligible
//   unsure
//
// "pending" means the AI has not completed yet.
//

const aiCheckCompleted =
  vehicleEligibility === "eligible" ||
  vehicleEligibility === "not_eligible" ||
  vehicleEligibility === "unsure"






                const isApproving =
                  isProcessing &&
                  processingAppointmentAction ===
                    "approve"

                const isRejecting =
                  isProcessing &&
                  processingAppointmentAction ===
                    "reject"

                





                return (

                  <div
                    key={appt.id}
                    className={`
                      group
                      relative
                      w-full
                      min-w-full
                      shrink-0
                      snap-center
                      overflow-hidden
                      rounded-2xl
                      border
                      p-3.5
                      transition-all
                      duration-300
                      sm:p-5
                      lg:p-6

                      ${
                        isProcessing
                          ? "border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-white shadow-[0_8px_30px_rgba(59,130,246,0.10)]"
                          : "border-gray-200/90 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.045)] hover:-translate-y-[1px] hover:border-red-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                      }
                    `}
                  >

                    {/* ===================================================
                        PREMIUM TOP ACCENT
                    =================================================== */}

                    <div
                      className={`
                        absolute
                        inset-x-0
                        top-0
                        h-1

                        ${
                          isProcessing
                            ? "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400"
                            : "bg-gradient-to-r from-red-500 via-red-400 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        }
                      `}
                    />


                    {/* ===================================================
                        PROCESSING BAR
                    =================================================== */}

                    {isProcessing && (

                      <div className="mb-5 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">

                        <div className="flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-5 w-5 animate-spin text-blue-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42M7.06 16.94l-1.42 1.42"
                              />

                              <circle
                                cx="12"
                                cy="12"
                                r="4"
                              />

                            </svg>

                          </div>

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">

                              <p className="text-xs font-extrabold text-blue-700 sm:text-sm">
                                {isApproving
                                  ? "Approving appointment..."
                                  : "Processing appointment..."}
                              </p>

                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 sm:text-xs">
                                Please wait
                              </span>

                            </div>

                            <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-gray-500 sm:text-xs">
                              {isApproving
                                ? "Saving the appointment approval and updating its status."
                                : "Your request is being processed. Please do not click again."}
                            </p>

                          </div>

                        </div>

                        <div className="h-1 overflow-hidden bg-blue-50">

                          <div className="h-full w-1/2 animate-[progress_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />

                        </div>

                      </div>

                    )}





                    {/* ===================================================
                        EXISTING APPOINTMENT CONTENT
                        PRESERVED
                    =================================================== */}

                    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_120px]">

                      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        {/* CUSTOMER */}

                        <div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

                          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-3.5 w-3.5 shrink-0 text-red-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 21a7.5 7.5 0 0 1 15 0"
                              />

                            </svg>

                            Customer

                          </p>

                          <p
                            className="mt-2 truncate text-sm font-extrabold tracking-tight text-gray-950"
                            title={appt.customer_name}
                          >
                            {appt.customer_name ||
                              "Unknown Customer"}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium text-gray-500">

                            {appt.mobile_number ||
                              appt.phone ||
                              "No mobile number"}

                          </p>

                          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 px-2.5 py-2.5">

                            <div className="flex min-w-0 items-start gap-2">

                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500"
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

                              <div className="min-w-0">

                                <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
                                  Service Address
                                </p>

                                <p className="mt-0.5 break-words text-xs font-semibold leading-relaxed text-gray-700">
                                  {appt.customer_address ||
                                    "Service address not specified"}
                                </p>

                              </div>

                            </div>

                          </div>

                        </div>


                       {/* SERVICE / VEHICLE */}

<div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5 shrink-0 text-red-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.7 6.3a4.5 4.5 0 0 0-5.8 5.8L4 17a2.12 2.12 0 0 0 3 3l4.9-4.9a4.5 4.5 0 0 0 5.8-5.8l-3 3-2.1-2.1 3-2.9Z"
      />
    </svg>

    Service

  </p>

  <p className="mt-2 break-words text-sm font-extrabold leading-relaxed tracking-tight text-gray-950">
    {appt.service_type ||
      "Not specified"}
  </p>

  <div className="mt-3 space-y-2 rounded-xl border border-gray-200 bg-gray-50/80 p-2.5">

    {/* VEHICLE */}

    <div className="flex min-w-0 items-center gap-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5 text-gray-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m5 11 1.5-5h11L19 11"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 11h16a1 1 0 0 1 1 1v5H3v-5a1 1 0 0 1 1-1Z"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.5 17v2m11-2v2M6 14h.01M18 14h.01"
          />
        </svg>

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
          Vehicle
        </p>

        <p className="truncate text-xs font-bold text-gray-800">
          {appt.vehicle_model ||
            "No vehicle model"}
        </p>

      </div>

    </div>


    {/* PLATE NUMBER */}

    <div className="flex min-w-0 items-center gap-2 border-t border-gray-200 pt-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5 text-gray-500"
        >
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
          />

          <path
            strokeLinecap="round"
            d="M7 10h10M7 14h6"
          />

        </svg>

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
          Plate Number
        </p>

        <p className="truncate text-xs font-bold text-gray-800">
          {appt.plate_number ||
            "No plate number"}
        </p>

      </div>

    </div>


    {/* FUEL TYPE */}

    <div className="flex min-w-0 items-center gap-2 border-t border-gray-200 pt-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-3.5 w-3.5 text-gray-500"
>
  <path d="M6 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
  <path d="M6 7h10" />
  <path d="M9 10h4" />
  <path d="M16 7h2l2 2v8a2 2 0 0 0 2 2" />
  <path d="M20 11h2" />
</svg>

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
          Fuel Type
        </p>

        <p className="truncate text-xs font-bold text-gray-800">
          {appt.fuel_type ||
            "Not specified"}
        </p>

      </div>

    </div>


    {/* BATTERY VOLTAGE */}

    <div className="flex min-w-0 items-center gap-2 border-t border-gray-200 pt-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-3.5 w-3.5 text-gray-500"
>
  <rect
    x="3"
    y="7"
    width="17"
    height="10"
    rx="2"
  />

  <path d="M20 10h2v4h-2" />

  <path d="M7 10v4M10 10v4M13 10v4M16 10v4" />
</svg>

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
          Battery Voltage
        </p>

        <p className="truncate text-xs font-bold text-gray-800">
          {appt.battery_voltage ||
            "Not specified"}
        </p>

      </div>

    </div>


    {/* TRANSMISSION */}

    <div className="flex min-w-0 items-center gap-2 border-t border-gray-200 pt-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  className="h-3.5 w-3.5 text-gray-500"
>
  <circle
    cx="12"
    cy="12"
    r="3.5"
  />

  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.6 1z" />
</svg>

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">
          Transmission
        </p>

        <p className="truncate text-xs font-bold text-gray-800">
          {appt.transmission_type ||
            "Not specified"}
        </p>

      </div>

    </div>

  </div>

</div>



{/* SCHEDULE */}

<div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5 shrink-0 text-red-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2v4m8-4v4M3.5 9.5h17M5 4.5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z"
      />
    </svg>

    Schedule Request

  </p>

  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-3">

    {/* DATE */}

    <p className="break-words text-xs font-bold leading-relaxed text-gray-800">
      {appt.appointment_date || "Not specified"}
    </p>

    {/* TIME */}

    <div className="mt-2 flex items-center gap-2">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5 text-gray-500"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />

          <path
            strokeLinecap="round"
            d="M12 7v5l3 2"
          />

        </svg>

      </div>

      <span className="text-xs font-bold text-gray-700">

        {formatAppointmentTime(
          appt.appointment_time
        )}

      </span>

    </div>



    {/* BOOKING SOURCE */}

<div className="mt-3 border-t border-gray-200 pt-3">

  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
    Booking Source
  </p>

  <div className="mt-1.5 flex items-center gap-2">

    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
        appt.booking_source === "walkin"
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {appt.booking_source === "walkin"
        ? "Walk-in"
        : "Online"}
    </span>

  </div>

</div>

{/* ASSISTED BY */}

{appt.assisted_by_name && (
  <div className="mt-3 border-t border-gray-200 pt-3">

    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
      Assisted By
    </p>

    <p className="mt-1.5 break-words text-xs font-bold text-gray-700">
      {appt.assisted_by_name}
    </p>

  </div>
)}






  </div>

</div>


                        {/* STATUS */}

<div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm transition hover:border-gray-300 hover:shadow-md">

  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
    Status
  </p>

  <div
    className={`mt-3 rounded-xl border px-3 py-3 ${
      isProcessing
        ? "border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50/40"
        : "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/40"
    }`}
  >

    {/* STATUS */}

    <div className="flex items-center gap-2">

      {isProcessing ? (

        <span className="relative flex h-2.5 w-2.5 shrink-0">

          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />

          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />

        </span>

      ) : (

        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.35)]" />

      )}

      <span
        className={`text-xs font-extrabold ${
          isProcessing
            ? "text-blue-700"
            : "text-amber-700"
        }`}
      >
        {isProcessing
          ? "Processing..."
          : "Pending"}
      </span>

    </div>


    {/* STATUS DESCRIPTION */}

    <p
      className={`mt-1 text-[11px] font-medium leading-relaxed ${
        isProcessing
          ? "text-blue-600"
          : "text-amber-600"
      }`}
    >
      {isProcessing
        ? "Updating appointment status"
        : "Awaiting admin approval"}
    </p>


    {/* APPOINTMENT NUMBER */}

    <div
      className={`mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
        isProcessing
          ? "border-blue-200/80 bg-white/70"
          : "border-amber-200/80 bg-white/70"
      }`}
    >

      <div className="min-w-0">

        <p
          className={`text-[8px] font-extrabold uppercase tracking-[0.16em] ${
            isProcessing
              ? "text-blue-400"
              : "text-amber-400"
          }`}
        >
          Appointment
        </p>

        <p
          className={`mt-0.5 text-sm font-black tracking-wider ${
            isProcessing
              ? "text-blue-700"
              : "text-amber-700"
          }`}
        >
          #{String(appt.id).padStart(5, "0")}
        </p>

      </div>


      {/* STATUS-MATCHED INDICATOR */}

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isProcessing
            ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
            : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
        }`}
      >

        {isProcessing ? (

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />

          </span>

        ) : (

          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_7px_rgba(245,158,11,0.45)]" />

        )}

      </div>

    </div>

  </div>

</div>

                          

                        

                      </div>










                    {/* =================================================
    ACTION BUTTONS
================================================= */}

<div className="flex w-full flex-row gap-2 xl:w-[120px] xl:flex-col">

  {/* =================================================
      AI CHECKING
  ================================================= */}

  {!aiCheckCompleted && (

    <>
      {/* APPROVE — AI CHECKING */}

      <button
        type="button"
        disabled
        title="Please wait for the Vehicle AI check to complete."
        className="inline-flex min-h-[44px] flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-extrabold text-indigo-400 opacity-80 sm:text-sm xl:flex-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4 animate-spin"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            className="opacity-25"
          />

          <path
            strokeLinecap="round"
            d="M21 12a9 9 0 0 0-9-9"
          />
        </svg>

        <span className="truncate">
          Checking...
        </span>
      </button>


      {/* REJECT — AI CHECKING */}

      <button
        type="button"
        disabled
        title="Please wait for the Vehicle AI check to complete."
        className="inline-flex min-h-[44px] flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-xs font-extrabold text-gray-400 opacity-80 sm:text-sm xl:flex-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16h.01"
          />

          <circle
            cx="12"
            cy="12"
            r="9"
          />
        </svg>

        <span className="truncate">
          Waiting...
        </span>
      </button>
    </>

  )}


  {/* =================================================
      AI COMPLETED
  ================================================= */}

  {aiCheckCompleted && (

    <>

      {/* =================================================
          APPROVE
      ================================================= */}

      {vehicleEligibility !== "not_eligible" && (

        <button
          type="button"
          disabled={isProcessing}
          onClick={async () => {

            if (isProcessing) return

            // ==========================================
            // TECHNICIAN REQUIRED
            // ==========================================

            if (!appt.technician_id) {

              alert(
                "Please assign a technician or admin before approving this appointment."
              )

              return
            }

            const assignedStaff =
              technicians.find(
                (staff) =>
                  staff.id ===
                  appt.technician_id
              )

            const isAdmin =
              assignedStaff?.role ===
              "admin"

            // ==========================================
            // TECHNICIAN ROLE REQUIRED
            // ==========================================

            if (
              !isAdmin &&
              !appt.technician_role
            ) {

              alert(
                "Please select a technician role before approving this appointment."
              )

              return
            }

            try {

              setProcessingAppointmentId(
                appt.id
              )

              setProcessingAppointmentAction(
                "approve"
              )

              await handleApproveAppointment(
                appt.id
              )

            } catch (error) {

              console.error(
                "Approve Appointment Error:",
                error
              )

            } finally {

              setProcessingAppointmentId(
                null
              )

              setProcessingAppointmentAction(
                null
              )

            }

          }}
          className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold shadow-sm transition-all duration-200 sm:text-sm xl:flex-none ${
            isProcessing
              ? "cursor-not-allowed bg-green-400 text-white opacity-80"
              : "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-600/10 hover:-translate-y-0.5 hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-600/20 active:translate-y-0"
          }`}
        >

          {isApproving ? (

            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 animate-spin"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  className="opacity-25"
                />

                <path
                  strokeLinecap="round"
                  d="M21 12a9 9 0 0 0-9-9"
                />
              </svg>

              <span className="truncate">
                Approving...
              </span>
            </>

          ) : (

            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>

              Approve
            </>
          )}

        </button>
      )}


      {/* =================================================
          NOT ELIGIBLE
      ================================================= */}

      {vehicleEligibility === "not_eligible" && (

        <button
          type="button"
          disabled
          title="This vehicle is not eligible for automatic approval."
          className="inline-flex min-h-[44px] flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-xs font-extrabold text-gray-400 opacity-80 sm:text-sm xl:flex-none"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
    d="m5 12 4 4L19 6"
            />
          </svg>

          <span className="truncate">
            Approve
          </span>

        </button>
      )}


      {/* =================================================
          REJECT
      ================================================= */}

      <button
        type="button"
        disabled={isProcessing}
onClick={() => {
  if (isProcessing) return;

  setSelectedAppointment(appt);
  setRejectionReason("");
  setShowRejectModal(true);
}}


        className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-extrabold transition-all duration-200 sm:text-sm xl:flex-none ${
          isProcessing
            ? "cursor-not-allowed border-red-100 bg-red-50 text-red-300 opacity-60"
            : "border-red-200 bg-red-50 text-red-700 hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:translate-y-0"
        }`}
      >

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6l12 12M18 6 6 18"
          />
        </svg>

        Reject

      </button>


        {/* =================================================
            AI STATUS
        ================================================= */}

        <p className="text-xs text-slate-400">
          AI Status:{" "}

          {vehicleEligibility === "pending" && (
            <span className="font-semibold text-indigo-500">
              Checking...
            </span>
          )}

          {vehicleEligibility === "eligible" && (
            <span className="font-semibold text-green-600">
              Eligible
            </span>
          )}

          {vehicleEligibility === "not_eligible" && (
            <span className="font-semibold text-red-600">
              Not Eligible
            </span>
          )}

          {vehicleEligibility === "unsure" && (
            <span className="font-semibold text-amber-600">
              Manual Review
            </span>
          )}

        </p>

               {(vehicleEligibility === "not_eligible" ||
    vehicleEligibility === "unsure") && (
    <button
      type="button"
      onClick={() => {
        setSelectedAppointment(appt);
        setShowVehicleEligibilityModal(true);
      }}
      className="text-left text-xs font-semibold text-indigo-600 underline"
    >
      View AI message
    </button>
  )}

{/* ===== ADD THIS: AUTO POPUP WHEN THIS CARD COMES INTO VIEW ===== */}
{(appt.status === "pending" || appt.status === "rejected") &&
  (vehicleEligibility === "not_eligible" ||
    vehicleEligibility === "unsure") &&
  !seenAiNotices.current.has(appt.id) && (
    <AutoOpenOnView
      enabled={!showVehicleEligibilityModal && !showRejectModal}
      onOpen={() => autoOpenAiNotice(appt)}
    />
  )}
{/* ===== END ===== */}

    </>
  )}

</div>
     



                      



                    </div>




                    {/* ===================================================
                        MANAGEMENT SECTION
                    =================================================== */}

                    <div className="mt-5 grid min-w-0 grid-cols-1 gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2">

                      {/* TECHNICIAN */}

                      <div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm">

                        <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5 shrink-0 text-red-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 21a7.5 7.5 0 0 1 15 0"
                            />

                          </svg>

                          Assign Staff

                        </p>

                        <select
                          value={
                            appt.technician_id ||
                            ""
                          }
                          disabled={isProcessing}
                          onChange={(e) =>
                            assignTechnician(
                              appt.id,
                              e.target.value
                            )
                          }
                          className="mt-2.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 shadow-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100/70 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                        >

                          <option value="">
                            Select Technician / Admin
                          </option>

                          {technicians.map(
                            (staff) => (

                              <option
                                key={staff.id}
                                value={staff.id}
                              >
                                {staff.name} —{" "}
                                {staff.role}
                              </option>

                            )
                          )}

                        </select>

                        {technicians.find(
                          (staff) =>
                            staff.id ===
                            appt.technician_id
                        )?.role !== "admin" && (

                          <select
                            value={
                              appt.technician_role ||
                              ""
                            }
                            disabled={
                              isProcessing
                            }
                            onChange={(e) =>
                              updateTechnicianRole(
                                appt.id,
                                e.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-xs font-semibold text-gray-800 shadow-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100/70 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                          >

                            <option value="">
                              Select Technician Role
                            </option>

                            <option value="Auto Electrical">
                              Auto Electrical
                            </option>

                            <option value="Battery & Starting System">
                              Battery & Starting System
                            </option>

                            <option value="Wiring & Diagnostics">
                              Wiring & Diagnostics
                            </option>

                            <option value="Lighting & Accessories">
                              Lighting & Accessories
                            </option>

                            <option value="General Electrical">
                              General Electrical
                            </option>

                          </select>

                        )}

                        {appt.technician_id && (

                          <div className="mt-2.5 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-2.5 py-1.5 text-[11px] font-bold text-green-700 sm:text-xs">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-3.5 w-3.5 shrink-0"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m8 12 2.5 2.5L16 9"
                              />

                            </svg>

                            <span className="truncate">

                              Assigned to{" "}

                              {getTechnicianName(
                                appt.technician_id
                              ) ||
                                "Staff"}

                            </span>

                          </div>

                        )}

                      </div>




                      {/* NOTES */}
<div className="min-w-0 w-full rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm">
  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5 shrink-0 text-red-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      />

      <path
        strokeLinecap="round"
        d="M9 11h6M9 15h6M9 7h2"
      />
    </svg>

    Customer Notes
  </p>

  {appt.notes ? (
    <div className="mt-2.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="whitespace-pre-wrap break-words text-xs font-medium leading-relaxed text-gray-600 sm:text-sm">
        {appt.notes}
      </p>
    </div>
  ) : (
    <p className="mt-2.5 w-full rounded-lg bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-400">
      No additional notes provided.
    </p>
  )}
</div>

{/* =================================================
    VEHICLE AI CHECK
================================================= */}

<div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm">

  <div className="flex items-center justify-between gap-3">

    <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-3.5 w-3.5 shrink-0 text-red-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 3h6l1 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1-3Z"
        />

        <circle
          cx="12"
          cy="13"
          r="3"
        />
      </svg>

      Vehicle AI Check

    </p>

    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        appt.vehicle_eligibility === "eligible"
          ? "border-green-200 bg-green-50 text-green-700"
          : appt.vehicle_eligibility === "not_eligible"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {appt.vehicle_eligibility === "eligible"
        ? "Eligible"
        : appt.vehicle_eligibility === "not_eligible"
        ? "Not Eligible"
        : "Review Required"}
    </span>

  </div>

  <div className="mt-3 space-y-2.5">

    {/* DETECTED VEHICLE */}

    <div className="rounded-xl border border-gray-200 bg-white p-3">

      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400">
        Detected Vehicle
      </p>

      <p className="mt-1 text-sm font-black capitalize text-gray-800">
        {appt.vehicle_type
          ? appt.vehicle_type.replace(
              /_/g,
              " "
            )
          : "No vehicle detected"}
      </p>

    </div>

    {/* CONFIDENCE */}

    <div className="rounded-xl border border-gray-200 bg-white p-3">

      <div className="flex items-center justify-between gap-3">

        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-gray-400">
          AI Confidence
        </p>

        <p className="text-sm font-black text-gray-800">
          {appt.vehicle_detection_confidence != null
            ? `${(
                Number(
                  appt.vehicle_detection_confidence
                ) * 100
              ).toFixed(2)}%`
            : "N/A"}
        </p>

      </div>

      {appt.vehicle_detection_confidence != null && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

          <div
            className={`h-full rounded-full transition-all ${
              Number(
                appt.vehicle_detection_confidence
              ) >= 0.75
                ? "bg-green-500"
                : Number(
                    appt.vehicle_detection_confidence
                  ) >= 0.5
                ? "bg-amber-500"
                : "bg-red-400"
            }`}
            style={{
              width: `${Math.min(
                Number(
                  appt.vehicle_detection_confidence
                ) * 100,
                100
              )}%`,
            }}
          />

        </div>
      )}

    </div>

    {/* AI MESSAGE */}

    <div
      className={`rounded-xl border px-3 py-2.5 ${
        appt.vehicle_eligibility === "eligible"
          ? "border-green-100 bg-green-50"
          : appt.vehicle_eligibility === "not_eligible"
          ? "border-red-100 bg-red-50"
          : "border-amber-100 bg-amber-50"
      }`}
    >

      <p
        className={`whitespace-pre-wrap break-words text-xs font-semibold leading-relaxed ${
          appt.vehicle_eligibility === "eligible"
            ? "text-green-700"
            : appt.vehicle_eligibility === "not_eligible"
            ? "text-red-700"
            : "text-amber-700"
        }`}
      >
        {appt.vehicle_detection_message ||
          "Vehicle AI check has not been completed."}
      </p>

    </div>

  </div>

</div>







                      {/* ATTACHMENTS */}

<div className="min-w-0 rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/50 p-3.5 shadow-sm">

                        <div className="flex items-center justify-between gap-3">

                          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-3.5 w-3.5 shrink-0 text-red-500"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m9 17 6.5-6.5a3.5 3.5 0 0 0-5-5L4 12a5 5 0 0 0 7 7l7-7"
                              />
                            </svg>

                            Customer Attachments

                          </p>

                          {attachments[
                            appt.id
                          ]?.length > 0 && (

                            <span className="shrink-0 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 shadow-sm">

                              {
                                attachments[
                                  appt.id
                                ].length
                              }{" "}

                              {
                                attachments[
                                  appt.id
                                ].length === 1
                                  ? "File"
                                  : "Files"
                              }

                            </span>

                          )}

                        </div>

                        <div className="mt-3">

                          {attachments[
                            appt.id
                          ]?.length > 0 ? (

                            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">

                              {attachments[
                                appt.id
                              ].map(
                                (
                                  attachment
                                ) => (

                                  <div
                                    key={
                                      attachment.id
                                    }
                                    className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                                  >

                                    <div className="flex min-w-0 items-start gap-2.5">

                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">

                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          className="h-4 w-4 text-gray-500"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 3h8l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                                          />

                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M14 3v5h5"
                                          />

                                        </svg>

                                      </div>

                                      <div className="min-w-0 flex-1">

                                        <p className="truncate text-xs font-extrabold text-gray-800 sm:text-sm">
                                          {
                                            attachment.file_name
                                          }
                                        </p>

                                        <p className="mt-0.5 truncate text-[10px] font-medium text-gray-400 sm:text-xs">

                                          Uploaded by{" "}

                                          {
                                            attachment.uploaded_by_name ||
                                            "Customer"
                                          }

                                          {" • "}

                                          {
                                            attachment.uploaded_by_role ||
                                            "Customer"
                                          }

                                        </p>

                                      </div>

                                    </div>

                                    <div className="mt-3 flex gap-2">

                                      <button
                                        type="button"
                                        disabled={
                                          isProcessing
                                        }
                                        onClick={async () => {

                                          try {

                                            const {
                                              data,
                                              error,
                                            } =
                                              await supabase.storage
                                                .from(
                                                  "service-task-attachments"
                                                )
                                                .createSignedUrl(
                                                  attachment.file_path,
                                                  60
                                                )

                                            if (
                                              error
                                            ) {

                                              console.error(
                                                "Attachment View Error:",
                                                error
                                              )

                                              alert(
                                                `Unable to open attachment: ${error.message}`
                                              )

                                              return
                                            }

                                            if (
                                              data?.signedUrl
                                            ) {

                                              window.open(
                                                data.signedUrl,
                                                "_blank",
                                                "noopener,noreferrer"
                                              )

                                            }

                                          } catch (
                                            error
                                          ) {

                                            console.error(
                                              "Attachment View Error:",
                                              error
                                            )

                                            alert(
                                              `Unable to open attachment: ${
                                                error?.message ||
                                                "Unknown error"
                                              }`
                                            )

                                          }

                                        }}
                                        className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-2 text-[11px] font-extrabold text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                                      >

                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          className="h-3.5 w-3.5"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                                          />

                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="2.5"
                                          />

                                        </svg>

                                        View

                                      </button>


                                      <button
                                        type="button"
                                        disabled={
                                          isProcessing
                                        }
                                        onClick={async () => {

                                          try {

                                            console.log(
                                              "Downloading attachment:",
                                              attachment.file_path
                                            )

                                            const {
                                              data,
                                              error,
                                            } =
                                              await supabase.storage
                                                .from(
                                                  "service-task-attachments"
                                                )
                                                .download(
                                                  attachment.file_path
                                                )

                                            if (
                                              error
                                            ) {

                                              console.error(
                                                "Attachment Download Error:",
                                                error
                                              )

                                              alert(
                                                `Unable to download attachment: ${error.message}`
                                              )

                                              return
                                            }

                                            if (
                                              !data
                                            ) {

                                              alert(
                                                "Unable to download attachment: No file data was returned."
                                              )

                                              return
                                            }

                                            const blobUrl =
                                              window.URL.createObjectURL(
                                                data
                                              )

                                            const link =
                                              document.createElement(
                                                "a"
                                              )

                                            link.href =
                                              blobUrl

                                            link.download =
                                              attachment.file_name ||
                                              "attachment"

                                            document.body.appendChild(
                                              link
                                            )

                                            link.click()

                                            document.body.removeChild(
                                              link
                                            )

                                            window.URL.revokeObjectURL(
                                              blobUrl
                                            )

                                            console.log(
                                              "Attachment downloaded successfully:",
                                              attachment.file_name
                                            )

                                          } catch (
                                            error
                                          ) {

                                            console.error(
                                              "Attachment Download Error:",
                                              error
                                            )

                                            alert(
                                              `Unable to download attachment: ${
                                                error?.message ||
                                                "Unknown error"
                                              }`
                                            )

                                          }

                                        }}
                                        className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-2.5 py-2 text-[11px] font-extrabold text-green-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-600 hover:bg-green-600 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                                      >

                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.8"
                                          className="h-3.5 w-3.5"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 3v12"
                                          />

                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m7 11 5 5 5-5"
                                          />

                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 21h14"
                                          />

                                        </svg>

                                        Download

                                      </button>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          ) : (

                            <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-400">

                              No attachments uploaded.

                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                )

              })}

          </div>


         {/* ===================================================
    BOTTOM DOT NAVIGATION + APPOINTMENT COUNTER
=================================================== */}

{recentAppointments.filter(
  (appt) => appt.status === "pending"
).length > 1 && (

  <div className="mt-5 flex flex-col items-center justify-center gap-3">

    {/* =================================================
        DOT NAVIGATION
    ================================================= */}

    <div className="flex items-center justify-center gap-2">

      {/* MOBILE — reset every 10 */}
      <div className="flex items-center justify-center gap-2 sm:hidden">

        {(() => {
          const pendingAppointments =
            recentAppointments.filter(
              (appt) => appt.status === "pending"
            )

          const dotsPerPage = 10

          const currentPage =
            Math.floor(
              activeSummaryCard / dotsPerPage
            )

          const pageStart =
            currentPage * dotsPerPage

          const pageAppointments =
            pendingAppointments.slice(
              pageStart,
              pageStart + dotsPerPage
            )

          return pageAppointments.map(
            (appt, dotIndex) => {

              const actualIndex =
                pageStart + dotIndex

              return (
                <button
                  key={appt.id}
                  type="button"
                  aria-label={`Go to appointment ${
                    actualIndex + 1
                  }`}
                  aria-current={
                    activeSummaryCard === actualIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() => {

                    const container =
                      mobileSummaryScrollRef.current

                    if (!container) return

                    container.scrollTo({
                      left:
                        actualIndex *
                        container.clientWidth,
                      behavior: "smooth",
                    })

                    setActiveSummaryCard(
                      actualIndex
                    )
                  }}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    duration-300

                    ${
                      activeSummaryCard === actualIndex
                        ? "w-7 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }
                  `}
                />
              )
            }
          )
        })()}

      </div>


      {/* TABLET / DESKTOP — ALL DOTS */}

      <div className="hidden items-center justify-center gap-2 sm:flex">

        {recentAppointments
          .filter(
            (appt) => appt.status === "pending"
          )
          .map((appt, index) => (

            <button
              key={appt.id}
              type="button"
              aria-label={`Go to appointment ${
                index + 1
              }`}
              aria-current={
                activeSummaryCard === index
                  ? "true"
                  : undefined
              }
              onClick={() => {

                const container =
                  mobileSummaryScrollRef.current

                if (!container) return

                container.scrollTo({
                  left:
                    index *
                    container.clientWidth,
                  behavior: "smooth",
                })

                setActiveSummaryCard(index)
              }}
              className={`
                h-2
                rounded-full
                transition-all
                duration-300

                ${
                  activeSummaryCard === index
                    ? "w-7 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.35)]"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }
              `}
            />

          ))}

      </div>

    </div>


   {/* =================================================
    APPOINTMENT COUNTER
================================================= */}

<div
  className="
    inline-flex
    items-center
    gap-2
    rounded-full
    border
    border-red-100
    bg-red-50
    px-3.5
    py-1.5
  "
>
  <span
    className="
      h-2
      w-2
      rounded-full
      bg-red-500
      shadow-[0_0_0_4px_rgba(239,68,68,0.10)]
    "
  />

  <span
    className="
      text-[10px]
      font-extrabold
      uppercase
      tracking-[0.14em]
      text-red-600
    "
  >
    Appointment
  </span>

  <span
    className="
      text-xs
      font-black
      text-red-700
    "
  >
    {activeSummaryCard + 1}
  </span>

  <span
    className="
      text-xs
      font-bold
      text-red-300
    "
  >
    /
  </span>

  <span
    className="
      text-xs
      font-black
      text-red-700
    "
  >
    {
      recentAppointments.filter(
        (appt) => appt.status === "pending"
      ).length
    }
  </span>
</div>




  </div>
)}


          

        </div>

      </div>

    ) : (

      /* ===================================================
          PREMIUM EMPTY STATE
      =================================================== */

      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50/60 px-4 py-14 text-center shadow-sm sm:py-16">

        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 shadow-sm">

          <div className="absolute inset-0 rounded-2xl bg-green-400/5" />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="relative h-8 w-8"
          >

            <circle
              cx="12"
              cy="12"
              r="9"
            />

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8 12 2.5 2.5L16 9"
            />

          </svg>

        </div>

        <p className="text-base font-extrabold tracking-tight text-gray-900 sm:text-lg">
          You're all caught up!
        </p>

        <p className="mx-auto mt-1.5 max-w-md text-xs font-medium leading-relaxed text-gray-400 sm:text-sm">
          New appointment requests will appear here when customers submit them.
        </p>

        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-green-700">

          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

          All Clear

        </div>

      </div>

    )}

  </div>

</div>










{/* ===================================================
    PREMIUM QUICK ACTIONS
    UI ONLY — EXISTING FUNCTIONS / LOGIC PRESERVED
    ORDER:
    TASKS
    INVENTORY
    APPOINTMENTS
    ARCHIVE
    TRANSACTIONS
    ANNOUNCEMENTS
    PROFILE
    ACCOUNT MODERATION
=================================================== */}

<div className="mb-8 w-full min-w-0">

  {/* =================================================
      HEADER
  ================================================= */}

  <div className="mb-4 flex items-end justify-between gap-3">

    <div className="min-w-0">

      <div className="flex items-center gap-2">

        <span
          className="
            h-2
            w-2
            rounded-full
            bg-red-500
            shadow-[0_0_10px_rgba(239,68,68,0.65)]
          "
        />

        <h3
          className="
            text-lg
            font-black
            tracking-[-0.02em]
            text-slate-950
            sm:text-xl
            lg:text-2xl
          "
        >
          Quick Actions
        </h3>

      </div>

      <p
        className="
          mt-1
          text-xs
          font-medium
          leading-relaxed
          text-slate-500
          sm:text-sm
        "
      >
        Quickly access important management tools.
      </p>

    </div>


    {/* DESKTOP SWIPE INDICATOR */}

    <div
      className="
        hidden
        shrink-0
        items-center
        gap-2
        rounded-full
        border
        border-slate-200
        bg-white
        px-3
        py-1.5
        text-[10px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400
        shadow-sm
        sm:flex
      "
    >

      <span>Swipe</span>

      <ArrowRight
        className="h-3.5 w-3.5 text-slate-400"
        strokeWidth={2.5}
      />

    </div>

  </div>


  {/* =================================================
      PREMIUM CAROUSEL
  ================================================= */}

  <div className="w-full min-w-0">

    <div
      ref={quickActionsScrollRef}
      onWheel={(e) => {
        const container = e.currentTarget

        // Normal mouse wheels produce vertical deltaY.
        // Let horizontal trackpad gestures (deltaX) stay native
        // so they remain smooth and do not fight this handler.
        if (
          container.scrollWidth > container.clientWidth &&
          Math.abs(e.deltaY) > Math.abs(e.deltaX)
        ) {
          e.preventDefault()

          const firstCard = container.querySelector(
            "[data-quick-action-card]"
          )

          if (!firstCard) return

          const cardWidth = firstCard.offsetWidth
          const gap = 12
          const step = cardWidth + gap

          const currentIndex = Math.round(
            container.scrollLeft / step
          )

          const direction = e.deltaY > 0 ? 1 : -1

          const nextIndex = Math.max(
            0,
            Math.min(9, currentIndex + direction)
          )

          container.scrollTo({
            left: nextIndex * step,
            behavior: "smooth",
          })
        }
      }}

      onScroll={(e) => {
        const container = e.currentTarget

        const firstCard =
          container.querySelector(
            "[data-quick-action-card]"
          )

        if (!firstCard) return

        const cardWidth =
          firstCard.offsetWidth

        const gap = 12

        const index = Math.round(
          container.scrollLeft /
          (cardWidth + gap)
        )

        setActiveQuickAction(
          Math.max(
            0,
            Math.min(9, index)
          )
        )

      }}
      className="
        flex
        w-full
        min-w-0
        gap-3
        overflow-x-auto
        overflow-y-hidden
        pb-3
        pt-1
        pr-1
        snap-x
        snap-mandatory
        overscroll-x-contain
        touch-pan-x
        [-ms-overflow-style:none]
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden

        sm:gap-4
        sm:pb-4
      "
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >


      {/* =================================================
          1. TASKS
      ================================================= */}

      <button
        data-quick-action-card
        type="button"
        onClick={() =>
          navigate("/admin/tasks")
        }
        className="
          group
          relative
          flex
          w-[82vw]
          min-w-[82vw]
          max-w-[320px]
          shrink-0
          snap-start
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-orange-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(249,115,22,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
          sm:w-[42vw]
          sm:min-w-[42vw]
          sm:max-w-[310px]
          sm:p-5
          lg:w-[270px]
          lg:min-w-[270px]
          lg:max-w-[270px]
          lg:p-5
          xl:w-[285px]
          xl:min-w-[285px]
          xl:max-w-[285px]
          hover:-translate-y-1
          hover:border-orange-200
          hover:shadow-[0_18px_45px_rgba(249,115,22,0.16)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-28
            w-28
            rounded-full
            bg-gradient-to-br
            from-orange-100
            via-amber-50
            to-transparent
            opacity-90
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
            from-orange-500
            to-amber-600
          "
        />

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-orange-500
              to-amber-600
              text-white
              shadow-[0_8px_20px_rgba(249,115,22,0.30)]
              ring-1
              ring-orange-400/30
              transition-transform
              duration-300
              group-hover:scale-110
              sm:h-12
              sm:w-12
            "
          >
            <Wrench
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.5}
            />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-50
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-orange-50
              group-hover:text-orange-600
            "
          >
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          </div>

        </div>

        <div className="relative mt-4">

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-orange-500
            "
          >
            Operations
          </p>

          <h4
            className="
              mt-1
              text-base
              font-black
              tracking-[-0.02em]
              text-slate-950
              sm:text-lg
            "
          >
            View Service Tasks
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              leading-5
              text-slate-400
              sm:text-xs
            "
          >
            Monitor and manage service tasks.
          </p>

        </div>

      </button>


      {/* =================================================
          2. INVENTORY
      ================================================= */}

      <button
        data-quick-action-card
        type="button"
        onClick={() =>
          navigate("/admin/inventory")
        }
        className="
          group
          relative
          flex
          w-[82vw]
          min-w-[82vw]
          max-w-[320px]
          shrink-0
          snap-start
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-blue-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(37,99,235,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
          sm:w-[42vw]
          sm:min-w-[42vw]
          sm:max-w-[310px]
          sm:p-5
          lg:w-[270px]
          lg:min-w-[270px]
          lg:max-w-[270px]
          lg:p-5
          xl:w-[285px]
          xl:min-w-[285px]
          xl:max-w-[285px]
          hover:-translate-y-1
          hover:border-blue-200
          hover:shadow-[0_18px_45px_rgba(37,99,235,0.16)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-28
            w-28
            rounded-full
            bg-gradient-to-br
            from-blue-100
            via-blue-50
            to-transparent
            opacity-90
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
            from-blue-500
            to-indigo-700
          "
        />

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-blue-500
              to-indigo-700
              text-white
              shadow-[0_8px_20px_rgba(37,99,235,0.30)]
              ring-1
              ring-blue-400/30
              transition-transform
              duration-300
              group-hover:scale-110
              sm:h-12
              sm:w-12
            "
          >
            <Package
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.5}
            />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-50
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-blue-50
              group-hover:text-blue-600
            "
          >
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          </div>

        </div>

        <div className="relative mt-4">

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-blue-500
            "
          >
            Management
          </p>

          <h4
            className="
              mt-1
              text-base
              font-black
              tracking-[-0.02em]
              text-slate-950
              sm:text-lg
            "
          >
            Manage Inventory
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              leading-5
              text-slate-400
              sm:text-xs
            "
          >
            Manage inventory items and stock.
          </p>

        </div>

      </button>




      {/* =================================================
    3. WALK-IN BOOKING
================================================= */}

<button
  data-quick-action-card
  type="button"
  onClick={() =>
    navigate("/admin/booking")
  }
  className="
    group
    relative
    flex
    w-[82vw]
    min-w-[82vw]
    max-w-[320px]
    shrink-0
    snap-start
    flex-col
    overflow-hidden
    rounded-[22px]
    border
    border-rose-100
    bg-white
    p-4
    text-left
    shadow-[0_10px_35px_rgba(225,29,72,0.10)]
    ring-1
    ring-black/[0.02]
    transition-all
    duration-300
    active:scale-[0.985]
    sm:w-[42vw]
    sm:min-w-[42vw]
    sm:max-w-[310px]
    sm:p-5
    lg:w-[270px]
    lg:min-w-[270px]
    lg:max-w-[270px]
    lg:p-5
    xl:w-[285px]
    xl:min-w-[285px]
    xl:max-w-[285px]
    hover:-translate-y-1
    hover:border-rose-200
    hover:shadow-[0_18px_45px_rgba(225,29,72,0.16)]
  "
>
  {/* BACKGROUND GLOW */}

  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-8
      h-28
      w-28
      rounded-full
      bg-gradient-to-br
      from-rose-100
      via-red-50
      to-transparent
      opacity-90
      transition-transform
      duration-500
      group-hover:scale-125
    "
  />

  {/* BOTTOM ACCENT */}

  <div
    className="
      absolute
      bottom-0
      left-0
      h-1
      w-20
      rounded-r-full
      bg-gradient-to-r
      from-rose-600
      to-red-800
    "
  />

  {/* TOP ROW */}

  <div
    className="
      relative
      flex
      items-center
      justify-between
      gap-3
    "
  >

    {/* CALENDAR ICON */}

    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-rose-600
        to-red-800
        text-white
        shadow-[0_8px_20px_rgba(225,29,72,0.30)]
        ring-1
        ring-rose-500/30
        transition-transform
        duration-300
        group-hover:scale-110
        sm:h-12
        sm:w-12
      "
    >
      <CalendarPlus
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>

    {/* ARROW */}

    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-slate-50
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-rose-50
        group-hover:text-rose-700
      "
    >
      <ArrowRight
        className="h-4 w-4"
        strokeWidth={2.5}
      />
    </div>

  </div>

  {/* CONTENT */}

  <div className="relative mt-4">

    <p
      className="
        text-[9px]
        font-black
        uppercase
        tracking-[0.16em]
        text-rose-600
      "
    >
      Walk-in Service
    </p>

    <h4
      className="
        mt-1
        text-base
        font-black
        tracking-[-0.02em]
        text-slate-950
        sm:text-lg
      "
    >
      Walk-in Booking
    </h4>

    <p
      className="
        mt-1
        text-[11px]
        font-semibold
        leading-5
        text-slate-400
        sm:text-xs
      "
    >
      Create a new appointment for a customer at the shop.
    </p>

  </div>

</button>


      {/* =================================================
          3. APPOINTMENTS
      ================================================= */}

      <button
        data-quick-action-card
        type="button"
        onClick={() =>
          navigate("/admin/appointments")
        }
        className="
          group
          relative
          flex
          w-[82vw]
          min-w-[82vw]
          max-w-[320px]
          shrink-0
          snap-start
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-red-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(220,38,38,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
          sm:w-[42vw]
          sm:min-w-[42vw]
          sm:max-w-[310px]
          sm:p-5
          lg:w-[270px]
          lg:min-w-[270px]
          lg:max-w-[270px]
          lg:p-5
          xl:w-[285px]
          xl:min-w-[285px]
          xl:max-w-[285px]
          hover:-translate-y-1
          hover:border-red-200
          hover:shadow-[0_18px_45px_rgba(220,38,38,0.16)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-28
            w-28
            rounded-full
            bg-gradient-to-br
            from-red-100
            via-rose-50
            to-transparent
            opacity-90
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

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
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
              transition-transform
              duration-300
              group-hover:scale-110
              sm:h-12
              sm:w-12
            "
          >
            <CalendarDays
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.5}
            />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-50
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-red-50
              group-hover:text-red-600
            "
          >
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          </div>

        </div>

        <div className="relative mt-4">

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-red-500
            "
          >
            Scheduling
          </p>

          <h4
            className="
              mt-1
              text-base
              font-black
              tracking-[-0.02em]
              text-slate-950
              sm:text-lg
            "
          >
            View Appointments
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              leading-5
              text-slate-400
              sm:text-xs
            "
          >
            Review and manage appointments.
          </p>

        </div>

      </button>


      {/* =================================================
          4. ARCHIVE
      ================================================= */}

      <button
        data-quick-action-card
        type="button"
        onClick={() =>
          navigate("/admin/archive")
        }
        className="
          group
          relative
          flex
          w-[82vw]
          min-w-[82vw]
          max-w-[320px]
          shrink-0
          snap-start
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-slate-200
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(15,23,42,0.08)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
          sm:w-[42vw]
          sm:min-w-[42vw]
          sm:max-w-[310px]
          sm:p-5
          lg:w-[270px]
          lg:min-w-[270px]
          lg:max-w-[270px]
          lg:p-5
          xl:w-[285px]
          xl:min-w-[285px]
          xl:max-w-[285px]
          hover:-translate-y-1
          hover:border-slate-300
          hover:shadow-[0_18px_45px_rgba(15,23,42,0.14)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-28
            w-28
            rounded-full
            bg-gradient-to-br
            from-slate-100
            via-gray-50
            to-transparent
            opacity-90
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
            to-slate-800
          "
        />

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
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
              sm:h-12
              sm:w-12
            "
          >
            <FolderArchive
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.5}
            />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-50
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-slate-100
              group-hover:text-slate-700
            "
          >
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          </div>

        </div>

        <div className="relative mt-4">

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Records
          </p>

          <h4
            className="
              mt-1
              text-base
              font-black
              tracking-[-0.02em]
              text-slate-950
              sm:text-lg
            "
          >
            Archived Appointments
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              leading-5
              text-slate-400
              sm:text-xs
            "
          >
            View completed and archived appointments.
          </p>

        </div>

      </button>

    
{/* =================================================
    9. WARRANTY — MEDIUM DARK RED
================================================= */}

<button
  data-quick-action-card
  type="button"
  onClick={() =>
    navigate("/admin/warranty")
  }
  className="
    group
    relative
    flex
    w-[82vw]
    min-w-[82vw]
    max-w-[320px]
    shrink-0
    snap-start
    flex-col
    overflow-hidden
    rounded-[22px]
    border
    border-red-200
    bg-white
    p-4
    text-left
    shadow-[0_10px_35px_rgba(153,27,27,0.10)]
    ring-1
    ring-black/[0.02]
    transition-all
    duration-300
    active:scale-[0.985]
    sm:w-[42vw]
    sm:min-w-[42vw]
    sm:max-w-[310px]
    sm:p-5
    lg:w-[270px]
    lg:min-w-[270px]
    lg:max-w-[270px]
    lg:p-5
    xl:w-[285px]
    xl:min-w-[285px]
    xl:max-w-[285px]
    hover:-translate-y-1
    hover:border-red-300
    hover:shadow-[0_18px_45px_rgba(153,27,27,0.17)]
  "
>
  {/* BACKGROUND GLOW */}

  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-8
      h-28
      w-28
      rounded-full
      bg-gradient-to-br
      from-red-100
      via-rose-50
      to-transparent
      opacity-90
      transition-transform
      duration-500
      group-hover:scale-125
    "
  />

  {/* BOTTOM ACCENT */}

  <div
    className="
      absolute
      bottom-0
      left-0
      h-1
      w-20
      rounded-r-full
      bg-gradient-to-r
      from-red-700
      to-red-900
    "
  />

  {/* TOP ROW */}

  <div
    className="
      relative
      flex
      items-center
      justify-between
      gap-3
    "
  >

    {/* SHIELD LOGO */}

    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-red-700
        to-red-900
        text-white
        shadow-[0_8px_20px_rgba(153,27,27,0.32)]
        ring-1
        ring-red-600/30
        transition-transform
        duration-300
        group-hover:scale-110
        sm:h-12
        sm:w-12
      "
    >
      <ShieldCheck
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>

    {/* ARROW */}

    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-slate-50
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-red-50
        group-hover:text-red-700
      "
    >
      <ArrowRight
        className="h-4 w-4"
        strokeWidth={2.5}
      />
    </div>

  </div>

  {/* CONTENT */}

  <div className="relative mt-4">

    <p
      className="
        text-[9px]
        font-black
        uppercase
        tracking-[0.16em]
        text-red-700
      "
    >
      Protection
    </p>

    <h4
      className="
        mt-1
        text-base
        font-black
        tracking-[-0.02em]
        text-slate-950
        sm:text-lg
      "
    >
      Manage Warranty
    </h4>

    <p
      className="
        mt-1
        text-[11px]
        font-semibold
        leading-5
        text-slate-400
        sm:text-xs
      "
    >
      View and create customer warranty.
    </p>

  </div>

</button>




      {/* =================================================
          5. TRANSACTIONS
      ================================================= */}

      <button
        data-quick-action-card
        type="button"
        onClick={() =>
          navigate("/admin/transactions")
        }
        className="
          group
          relative
          flex
          w-[82vw]
          min-w-[82vw]
          max-w-[320px]
          shrink-0
          snap-start
          flex-col
          overflow-hidden
          rounded-[22px]
          border
          border-emerald-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(16,185,129,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]
          sm:w-[42vw]
          sm:min-w-[42vw]
          sm:max-w-[310px]
          sm:p-5
          lg:w-[270px]
          lg:min-w-[270px]
          lg:max-w-[270px]
          lg:p-5
          xl:w-[285px]
          xl:min-w-[285px]
          xl:max-w-[285px]
          hover:-translate-y-1
          hover:border-emerald-200
          hover:shadow-[0_18px_45px_rgba(16,185,129,0.16)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-28
            w-28
            rounded-full
            bg-gradient-to-br
            from-emerald-100
            via-green-50
            to-transparent
            opacity-90
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
            from-emerald-500
            to-green-700
          "
        />

        <div
          className="
            relative
            flex
            items-center
            justify-between
            gap-3
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-emerald-500
              to-green-700
              text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.30)]
              ring-1
              ring-emerald-400/30
              transition-transform
              duration-300
              group-hover:scale-110
              sm:h-12
              sm:w-12
            "
          >
            <Receipt
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.5}
            />
          </div>

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-slate-50
              text-slate-400
              transition-all
              duration-300
              group-hover:bg-emerald-50
              group-hover:text-emerald-600
            "
          >
            <ArrowRight
              className="h-4 w-4"
              strokeWidth={2.5}
            />
          </div>

        </div>

        <div className="relative mt-4">

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-emerald-500
            "
          >
            Finance
          </p>

          <h4
            className="
              mt-1
              text-base
              font-black
              tracking-[-0.02em]
              text-slate-950
              sm:text-lg
            "
          >
            View Transactions
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              leading-5
              text-slate-400
              sm:text-xs
            "
          >
            Review payments and transaction records.
          </p>

        </div>

      </button>


      {/* =================================================
    6. ANNOUNCEMENTS — BLUE/CYAN
================================================= */}

<button
  data-quick-action-card
  type="button"
  onClick={() =>
    navigate("/admin/announcements")
  }
  className="
    group
    relative
    flex
    w-[82vw]
    min-w-[82vw]
    max-w-[320px]
    shrink-0
    snap-start
    flex-col
    overflow-hidden
    rounded-[22px]
    border
    border-cyan-100
    bg-white
    p-4
    text-left
    shadow-[0_10px_35px_rgba(6,182,212,0.10)]
    ring-1
    ring-black/[0.02]
    transition-all
    duration-300
    active:scale-[0.985]
    sm:w-[42vw]
    sm:min-w-[42vw]
    sm:max-w-[310px]
    sm:p-5
    lg:w-[270px]
    lg:min-w-[270px]
    lg:max-w-[270px]
    lg:p-5
    xl:w-[285px]
    xl:min-w-[285px]
    xl:max-w-[285px]
    hover:-translate-y-1
    hover:border-cyan-200
    hover:shadow-[0_18px_45px_rgba(6,182,212,0.16)]
  "
>
  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-8
      h-28
      w-28
      rounded-full
      bg-gradient-to-br
      from-cyan-100
      via-sky-50
      to-transparent
      opacity-90
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
      from-cyan-500
      to-blue-600
    "
  />

  <div
    className="
      relative
      flex
      items-center
      justify-between
      gap-3
    "
  >
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-cyan-500
        to-blue-600
        text-white
        shadow-[0_8px_20px_rgba(6,182,212,0.30)]
        ring-1
        ring-cyan-400/30
        transition-transform
        duration-300
        group-hover:scale-110
        sm:h-12
        sm:w-12
      "
    >
      <Megaphone
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>

    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-slate-50
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-cyan-50
        group-hover:text-cyan-600
      "
    >
      <ArrowRight
        className="h-4 w-4"
        strokeWidth={2.5}
      />
    </div>
  </div>

  <div className="relative mt-4">
    <p
      className="
        text-[9px]
        font-black
        uppercase
        tracking-[0.16em]
        text-cyan-600
      "
    >
      Communication
    </p>

    <h4
      className="
        mt-1
        text-base
        font-black
        tracking-[-0.02em]
        text-slate-950
        sm:text-lg
      "
    >
      Manage Announcements
    </h4>

    <p
      className="
        mt-1
        text-[11px]
        font-semibold
        leading-5
        text-slate-400
        sm:text-xs
      "
    >
      Create and manage customer announcements.
    </p>
  </div>
</button>


{/* =================================================
    7. PROFILE — VIOLET
================================================= */}

<button
  data-quick-action-card
  type="button"
  onClick={() =>
    navigate("/admin/profile")
  }
  className="
    group
    relative
    flex
    w-[82vw]
    min-w-[82vw]
    max-w-[320px]
    shrink-0
    snap-start
    flex-col
    overflow-hidden
    rounded-[22px]
    border
    border-purple-100
    bg-white
    p-4
    text-left
    shadow-[0_10px_35px_rgba(147,51,234,0.10)]
    ring-1
    ring-black/[0.02]
    transition-all
    duration-300
    active:scale-[0.985]
    sm:w-[42vw]
    sm:min-w-[42vw]
    sm:max-w-[310px]
    sm:p-5
    lg:w-[270px]
    lg:min-w-[270px]
    lg:max-w-[270px]
    lg:p-5
    xl:w-[285px]
    xl:min-w-[285px]
    xl:max-w-[285px]
    hover:-translate-y-1
    hover:border-purple-200
    hover:shadow-[0_18px_45px_rgba(147,51,234,0.16)]
  "
>
  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-8
      h-28
      w-28
      rounded-full
      bg-gradient-to-br
      from-purple-100
      via-violet-50
      to-transparent
      opacity-90
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
      from-purple-500
      to-violet-700
    "
  />

  <div
    className="
      relative
      flex
      items-center
      justify-between
      gap-3
    "
  >
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-purple-500
        to-violet-700
        text-white
        shadow-[0_8px_20px_rgba(147,51,234,0.30)]
        ring-1
        ring-purple-400/30
        transition-transform
        duration-300
        group-hover:scale-110
        sm:h-12
        sm:w-12
      "
    >
      <UserCircle
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>

    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-slate-50
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-purple-50
        group-hover:text-purple-600
      "
    >
      <ArrowRight
        className="h-4 w-4"
        strokeWidth={2.5}
      />
    </div>
  </div>

  <div className="relative mt-4">
    <p
      className="
        text-[9px]
        font-black
        uppercase
        tracking-[0.16em]
        text-purple-500
      "
    >
      Account
    </p>

    <h4
      className="
        mt-1
        text-base
        font-black
        tracking-[-0.02em]
        text-slate-950
        sm:text-lg
      "
    >
      Manage Profile
    </h4>

    <p
      className="
        mt-1
        text-[11px]
        font-semibold
        leading-5
        text-slate-400
        sm:text-xs
      "
    >
      View and manage your admin profile.
    </p>
  </div>
</button>


{/* =================================================
    8. ACCOUNT MODERATION — YELLOW
================================================= */}

<button
  data-quick-action-card
  type="button"
  onClick={() =>
    navigate("/admin/customers")
  }
  className="
    group
    relative
    flex
    w-[82vw]
    min-w-[82vw]
    max-w-[320px]
    shrink-0
    snap-start
    flex-col
    overflow-hidden
    rounded-[22px]
    border
    border-yellow-100
    bg-white
    p-4
    text-left
    shadow-[0_10px_35px_rgba(234,179,8,0.10)]
    ring-1
    ring-black/[0.02]
    transition-all
    duration-300
    active:scale-[0.985]
    sm:w-[42vw]
    sm:min-w-[42vw]
    sm:max-w-[310px]
    sm:p-5
    lg:w-[270px]
    lg:min-w-[270px]
    lg:max-w-[270px]
    lg:p-5
    xl:w-[285px]
    xl:min-w-[285px]
    xl:max-w-[285px]
    hover:-translate-y-1
    hover:border-yellow-200
    hover:shadow-[0_18px_45px_rgba(234,179,8,0.16)]
  "
>
  <div
    className="
      pointer-events-none
      absolute
      -right-8
      -top-8
      h-28
      w-28
      rounded-full
      bg-gradient-to-br
      from-yellow-100
      via-amber-50
      to-transparent
      opacity-90
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
      from-yellow-400
      to-orange-500
    "
  />

  <div
    className="
      relative
      flex
      items-center
      justify-between
      gap-3
    "
  >
    <div
      className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-yellow-400
        to-orange-500
        text-white
        shadow-[0_8px_20px_rgba(234,179,8,0.30)]
        ring-1
        ring-yellow-400/30
        transition-transform
        duration-300
        group-hover:scale-110
        sm:h-12
        sm:w-12
      "
    >
      <ShieldCheck
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>

    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-slate-50
        text-slate-400
        transition-all
        duration-300
        group-hover:bg-yellow-50
        group-hover:text-yellow-600
      "
    >
      <ArrowRight
        className="h-4 w-4"
        strokeWidth={2.5}
      />
    </div>
  </div>

  <div className="relative mt-4">
    <p
      className="
        text-[9px]
        font-black
        uppercase
        tracking-[0.16em]
        text-yellow-600
      "
    >
      Security
    </p>

    <h4
      className="
        mt-1
        text-base
        font-black
        tracking-[-0.02em]
        text-slate-950
        sm:text-lg
      "
    >
      Users Account Management
    </h4>

    <p
      className="
        mt-1
        text-[11px]
        font-semibold
        leading-5
        text-slate-400
        sm:text-xs
      "
    >
      Review customer account status and warnings.
    </p>
  </div>
</button>

    </div>

  </div>


  {/* =================================================
      MOBILE PREMIUM PAGINATION
      8 QUICK ACTIONS
  ================================================= */}

  <div className="mt-3 flex flex-col items-center sm:hidden">

    <div
      className="
        flex
        max-w-full
        items-center
        gap-1
        overflow-x-auto
        rounded-full
        border
        border-slate-200
        bg-white
        px-2.5
        py-2
        shadow-[0_5px_18px_rgba(15,23,42,0.08)]
        [-ms-overflow-style:none]
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >

      {[
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9
      ].map((index) => (

        <button
          key={index}
          type="button"
          aria-label={`Go to quick action ${index + 1}`}
          onClick={() => {

            const container =
              quickActionsScrollRef.current

            if (!container) return

            const card =
              container.querySelector(
                "[data-quick-action-card]"
              )

            if (!card) return

            const gap = 12

            const cardWidth =
              card.offsetWidth

            container.scrollTo({
              left:
                index *
                (cardWidth + gap),
              behavior: "smooth",
            })

            setActiveQuickAction(index)
          }}
          className="
            flex
            h-5
            w-5
            shrink-0
            items-center
            justify-center
            rounded-full
            active:scale-90
          "
        >

          <span
            className={`
              block
              rounded-full
              transition-all
              duration-300
              ease-out

              ${
                activeQuickAction === index
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


    <div
      className="
        mt-2
        flex
        items-center
        gap-1.5
        text-[9px]
        font-black
        uppercase
        tracking-[0.14em]
        text-slate-400
      "
    >

      <span>
        {activeQuickAction + 1}
      </span>

      <span className="text-slate-300">
        /
      </span>

      <span>
        10
      </span>

      <span className="ml-1">
        Swipe to explore
      </span>

    </div>

  </div>

</div>






      {/* ===================================================
    SERVICE TASKS — HORIZONTAL PREMIUM REDESIGN
    LOGIC / DATA / HANDLERS UNCHANGED

    NEW UI BEHAVIOR:
    - Desktop/Laptop: Horizontal appointment carousel
    - Large screens: Centered side navigation arrows
    - Small screens/iPhone: Top-corner navigation arrows
    - Disabled arrows at first/last appointment
    - Orange bottom pagination
=================================================== */}

<div className="mb-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">

  {/* ===================================================
      HEADER
  =================================================== */}

  <div className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-5 sm:px-6 sm:py-6">

    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_35%)]"></div>

<div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">


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
    from-orange-500
    to-amber-600
    text-white
    shadow-[0_8px_20px_rgba(249,115,22,0.30)]
    ring-1
    ring-orange-400/30
    transition-transform
    duration-300
    hover:scale-110
    sm:h-14
    sm:w-14
  "
>
  <Wrench
    className="h-6 w-6 sm:h-7 sm:w-7"
    strokeWidth={2.5}
  />
</div>



        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2.5">

            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Service Tasks
            </h3>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-green-700">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60"></span>

                <span className="relative h-1.5 w-1.5 rounded-full bg-green-600"></span>

              </span>

              Live

            </span>

          </div>

          <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
            Track and manage customer service appointments
          </p>

        </div>

      </div>

      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-extrabold text-orange-700 shadow-sm">

        <span className="relative flex h-2 w-2">

          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-50"></span>

          <span className="relative h-2 w-2 rounded-full bg-orange-600"></span>

        </span>

        Service Management

      </span>

      {/* =================================================
    MOBILE SERVICE TASK NAVIGATION
    iPhone / phone only
================================================= */}

<div className="flex items-center justify-between gap-2 md:hidden">

  {/* PREVIOUS */}
  <button
    type="button"
    onClick={goToPreviousServiceTask}
    disabled={serviceTaskIndex === 0}
    aria-label="Previous appointment"
    title={
      serviceTaskIndex === 0
        ? "First appointment"
        : "Previous appointment"
    }
    className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      border
      border-orange-200
      bg-white
      text-orange-600
      shadow-sm
      transition-all
      duration-200
      active:scale-95
      disabled:cursor-not-allowed
      disabled:border-slate-200
      disabled:bg-slate-100
      disabled:text-slate-300
      disabled:opacity-40
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15 19-7-7 7-7"
      />
    </svg>
  </button>


  {/* NEXT */}
  <button
    type="button"
    onClick={goToNextServiceTask}
    disabled={
      serviceTaskIndex >= recentAppointments.length - 1
    }
    aria-label="Next appointment"
    title={
      serviceTaskIndex >= recentAppointments.length - 1
        ? "Last appointment"
        : "Next appointment"
    }
    className="
      flex
      h-9
      w-9
      shrink-0
      items-center
      justify-center
      rounded-full
      border
      border-orange-200
      bg-white
      text-orange-600
      shadow-sm
      transition-all
      duration-200
      active:scale-95
      disabled:cursor-not-allowed
      disabled:border-slate-200
      disabled:bg-slate-100
      disabled:text-slate-300
      disabled:opacity-40
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 5 7 7-7 7"
      />
    </svg>
  </button>

</div>




    </div>

  </div>




  {/* ===================================================
      TASK CAROUSEL
  =================================================== */}

  <div className="bg-slate-50/40 px-3 pb-5 pt-8 sm:px-5 sm:pb-6 sm:pt-10 md:px-6">

    {recentAppointments.length > 0 ? (

      <>

        {/* =================================================
            CAROUSEL VIEWPORT
        ================================================= */}

        

          <div className="relative">

            

  {/* =================================================
      DESKTOP SERVICE TASK NAVIGATION
      Visible on laptop/desktop only.
      Hidden on phones/tablets.
  ================================================= */}

  

  {/* PREVIOUS */}
  <button
    type="button"
    onClick={goToPreviousServiceTask}
    disabled={serviceTaskIndex === 0}
    aria-label="Previous appointment"
    title={
      serviceTaskIndex === 0
        ? "First appointment"
        : "Previous appointment"
    }
    className="
      absolute
      left-10
      top-1/2
      z-30
      hidden
      h-11
      w-11
      -translate-x-[calc(100%+1rem)]
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      bg-white
      shadow-lg
      transition-all
      duration-200
      lg:flex

      disabled:cursor-not-allowed
      disabled:border-slate-200
      disabled:bg-slate-100
      disabled:text-slate-300
      disabled:opacity-60

      border-orange-200
      text-orange-600
      hover:border-orange-400
      hover:bg-orange-50
      hover:shadow-xl
      active:scale-95
    "
  >

    
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15 19-7-7 7-7"
      />
    </svg>
  </button>

  


  {/* NEXT */}
  <button
    type="button"
    onClick={goToNextServiceTask}
    disabled={
      serviceTaskIndex >= recentAppointments.length - 1
    }
    aria-label="Next appointment"
    title={
      serviceTaskIndex >= recentAppointments.length - 1
        ? "Last appointment"
        : "Next appointment"
    }
    className="
      absolute
      right-10
      top-1/2
      z-30
      hidden
      h-11
      w-11
      translate-x-[calc(100%+1rem)]
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      border
      bg-white
      shadow-lg
      transition-all
      duration-200
      lg:flex

      disabled:cursor-not-allowed
      disabled:border-slate-200
      disabled:bg-slate-100
      disabled:text-slate-300
      disabled:opacity-60

      border-orange-200
      text-orange-600
      hover:border-orange-400
      hover:bg-orange-50
      hover:shadow-xl
      active:scale-95
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 5 7 7-7 7"
      />
    </svg>
  </button>

  








          {/* =================================================
              APPOINTMENT CARD
          ================================================= */}


<div
  ref={serviceTaskScrollRef}
  className="
    overflow-x-auto
    overflow-y-hidden
    rounded-[20px]
    border
    border-slate-200
    bg-white
    shadow-[0_3px_14px_rgba(15,23,42,0.045)]
    select-none
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
>



            {(() => {

              const appt =
                recentAppointments[
                  serviceTaskIndex
                ]

              if (!appt) {
                return null
              }

              const technicianName =
                getTechnicianName(
                  appt.technician_id
                )


              {/* =====================================================
                  LIVE PROGRESS CONFIGURATION
              ===================================================== */}

              const progressConfig = {

                pending: {
                  percent: 15,
                  label: "Appointment Requested",
                  description:
                    "Waiting for appointment confirmation",
                  color: "bg-yellow-500",
                  light: "bg-yellow-50",
                  border: "border-yellow-200",
                  text: "text-yellow-700",
                  dot: "bg-yellow-500",
                },

                confirmed: {
                  percent: 40,
                  label: "Service Confirmed",
                  description:
                    "Appointment is confirmed and ready for service",
                  color: "bg-blue-500",
                  light: "bg-blue-50",
                  border: "border-blue-200",
                  text: "text-blue-700",
                  dot: "bg-blue-500",
                },

                in_progress: {
                  percent: 70,
                  label: "Service In Progress",
                  description:
                    "Technician is currently working on the vehicle",
                  color: "bg-purple-500",
                  light: "bg-purple-50",
                  border: "border-purple-200",
                  text: "text-purple-700",
                  dot: "bg-purple-500",
                },

                completed: {
                  percent: 100,
                  label: "Service Completed",
                  description:
                    "Service work has been completed",
                  color: "bg-green-500",
                  light: "bg-green-50",
                  border: "border-green-200",
                  text: "text-green-700",
                  dot: "bg-green-500",
                },

                cancelled: {
  percent: 100,
  label: "Service Cancelled",
  description:
    "This service appointment was cancelled",
  color: "bg-orange-500",
  light: "bg-orange-50",
  border: "border-orange-200",
  text: "text-orange-700",
  dot: "bg-orange-500",
},

rejected: {
  percent: 100,
  label: "Service Rejected",
  description:
    "This service appointment was rejected",
  color: "bg-red-500",
  light: "bg-red-50",
  border: "border-red-200",
  text: "text-red-700",
  dot: "bg-red-500",
},


              }

              const progress =
                progressConfig[appt.status] ||
                progressConfig.pending


              return (

                <div
                  key={appt.id}
                  className="group overflow-hidden"
                >

                  {/* =====================================================
                      TOP INFORMATION
                  ===================================================== */}

                  <div className="p-4 sm:p-5 md:p-6">

                    <div className="flex flex-col gap-6">

                      {/* =================================================
                          APPOINTMENT INFORMATION
                      ================================================= */}

                      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* CUSTOMER */}

                        <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

                          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

                            <User className="h-3.5 w-3.5 shrink-0 text-slate-500" />

                            Customer

                          </p>

                          <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
                            {appt.customer_name ||
                              "Unknown Customer"}
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-600">
                            {appt.mobile_number ||
                              appt.phone ||
                              "No mobile number"}
                          </p>

                          {/* SERVICE ADDRESS */}

                          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">

                            <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">

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

                              Service Address

                            </p>

                            <p className="mt-1.5 break-words text-sm font-semibold leading-relaxed text-slate-700">
                              {appt.customer_address ||
                                "Service address not specified"}
                            </p>

                          </div>

                        </div>


                        {/* SERVICE + VEHICLE */}

<div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

    <Wrench className="h-3.5 w-3.5 shrink-0 text-orange-500" />

    Service

  </p>

  <p className="mt-2 font-extrabold leading-relaxed text-slate-900">
    {appt.service_type ||
      "Not specified"}
  </p>

  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

    {/* VEHICLE */}

    <div className="flex min-w-0 items-center gap-2.5 px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

        <Car className="h-4 w-4" />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Vehicle
        </p>

        <p className="truncate text-sm font-bold text-slate-800">
          {appt.vehicle_model ||
            "No vehicle model"}
        </p>

      </div>

    </div>


    {/* PLATE NUMBER */}

    <div className="flex items-center gap-2.5 border-t border-slate-100 px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

        <Hash className="h-4 w-4" />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Plate Number
        </p>

        <p className="truncate text-sm font-bold text-slate-800">
          {appt.plate_number ||
            "No plate number"}
        </p>

      </div>

    </div>


    {/* FUEL TYPE */}

    <div className="flex items-center gap-2.5 border-t border-slate-100 px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

        <Fuel className="h-4 w-4" />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Fuel Type
        </p>

        <p className="truncate text-sm font-bold text-slate-800">
          {appt.fuel_type ||
            "Not specified"}
        </p>

      </div>

    </div>


    {/* BATTERY VOLTAGE */}

    <div className="flex items-center gap-2.5 border-t border-slate-100 px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

        <Battery className="h-4 w-4" />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Battery Voltage
        </p>

        <p className="truncate text-sm font-bold text-slate-800">
          {appt.battery_voltage ||
            "Not specified"}
        </p>

      </div>

    </div>


    {/* TRANSMISSION */}

    <div className="flex items-center gap-2.5 border-t border-slate-100 px-3.5 py-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">

        <Settings2 className="h-4 w-4" />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
          Transmission
        </p>

        <p className="truncate text-sm font-bold text-slate-800">
          {appt.transmission_type ||
            "Not specified"}
        </p>

      </div>

    </div>

  </div>

</div>


                        {/* SCHEDULE */}

<div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

  <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue-500" />

    Schedule Request

  </p>

  {/* DATE */}

  <p className="mt-2 truncate text-sm font-extrabold text-slate-900">
    {appt.appointment_date || "Not specified"}
  </p>

  {/* TIME */}

  <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600">

    <Clock3 className="h-3.5 w-3.5 shrink-0 text-slate-500" />

    {formatAppointmentTime(
      appt.appointment_time
    )}

  </p>

  {/* BOOKING SOURCE */}

  <div className="mt-3 border-t border-slate-200 pt-3">

    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
      Booking Source
    </p>

    <div className="mt-1.5 flex items-center gap-2">

      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
          appt.booking_source === "walkin"
            ? "bg-amber-100 text-amber-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {appt.booking_source === "walkin"
          ? "Walk-in"
          : "Online"}
      </span>

    </div>

  </div>

  {/* ASSISTED BY */}

  {appt.assisted_by_name && (
    <div className="mt-3 border-t border-slate-200 pt-3">

      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
        Assisted By
      </p>

      <p className="mt-1.5 break-words text-xs font-bold text-slate-700">
        {appt.assisted_by_name}
      </p>

    </div>
  )}

</div>



                        {/* STATUS */}

{(() => {

  const statusKey =
    appt.status === "cancelled"
      ? appt.rejected_at
        ? "rejected"
        : "cancelled"
      : appt.status

  const themes = {
    pending: {
      Icon: Clock3,
      label: "Appointment Requested",
      message: "Waiting for appointment confirmation",
      box: "border-yellow-200 bg-yellow-50/70",
      icon: "text-amber-600",
      title: "text-amber-700",
      msg: "text-amber-600",
      inner: "border-yellow-200/80",
      small: "text-amber-500",
      number: "text-amber-800",
      iconBox: "bg-yellow-50 ring-yellow-200",
      divider: "border-yellow-100",
    },
    confirmed: {
      Icon: CalendarCheck,
      label: "Confirmed",
      message: "Approved and scheduled",
      box: "border-blue-200 bg-blue-50/70",
      icon: "text-blue-600",
      title: "text-blue-700",
      msg: "text-blue-600",
      inner: "border-blue-200/80",
      small: "text-blue-500",
      number: "text-blue-800",
      iconBox: "bg-blue-50 ring-blue-200",
      divider: "border-blue-100",
    },
    in_progress: {
      Icon: Wrench,
      label: "Service Started",
      message: "Service is currently ongoing",
      box: "border-purple-200 bg-purple-50/70",
      icon: "text-purple-600",
      title: "text-purple-700",
      msg: "text-purple-600",
      inner: "border-purple-200/80",
      small: "text-purple-500",
      number: "text-purple-800",
      iconBox: "bg-purple-50 ring-purple-200",
      divider: "border-purple-100",
    },
    completed: {
      Icon: CheckCircle2,
      label: "Completed",
      message: "",
      box: "border-green-200 bg-green-50/70",
      icon: "text-green-600",
      title: "text-green-700",
      msg: "text-green-600",
      inner: "border-green-200/80",
      small: "text-green-500",
      number: "text-green-800",
      iconBox: "bg-green-50 ring-green-200",
      divider: "border-green-100",
    },
    rejected: {
      Icon: XCircle,
      label: "Rejected",
      message: "",
      box: "border-red-200 bg-red-50/70",
      icon: "text-red-600",
      title: "text-red-700",
      msg: "text-red-600",
      inner: "border-red-200/80",
      small: "text-red-600",
      number: "text-red-800",
      iconBox: "bg-red-50 ring-red-200",
      divider: "border-red-100",
      timeLabel: "Rejected On",
      reasonLabel: "Rejection Reason",
    },
    cancelled: {
      Icon: Ban,
      label: "Cancelled",
      message: "",
      box: "border-orange-200 bg-orange-50/70",
      icon: "text-orange-600",
      title: "text-orange-700",
      msg: "text-orange-600",
      inner: "border-orange-200/80",
      small: "text-orange-600",
      number: "text-orange-800",
      iconBox: "bg-orange-50 ring-orange-200",
      divider: "border-orange-100",
      timeLabel: "Cancelled On",
      reasonLabel: "Cancellation Reason",
    },
  }

  const theme = themes[statusKey] || {
    Icon: Clock3,
    label: appt.status,
    message: "",
    box: "border-slate-200 bg-slate-50/70",
    icon: "text-slate-500",
    title: "text-slate-800",
    msg: "text-slate-500",
    inner: "border-slate-200",
    small: "text-slate-500",
    number: "text-slate-800",
    iconBox: "bg-slate-50 ring-slate-200",
    divider: "border-slate-200",
  }

  const timestamp =
    statusKey === "rejected"
      ? appt.rejected_at
      : statusKey === "cancelled"
      ? appt.cancelled_at
      : statusKey === "completed"
      ? appt.completed_at
      : null

  const reason =
    statusKey === "rejected"
      ? appt.rejection_reason
      : statusKey === "cancelled"
      ? appt.cancellation_reason
      : null

  return (

    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">

      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
        Status
      </p>

      <div
        className={`mt-3 rounded-2xl border p-3.5 transition-all duration-300 ${theme.box}`}
      >

        {/* ICON + STATUS NAME */}

        <div className="flex items-center gap-2.5">

          <theme.Icon
            className={`h-5 w-5 shrink-0 ${theme.icon}`}
            strokeWidth={2.4}
          />

          <p className={`text-sm font-extrabold ${theme.title}`}>
            {theme.label}
          </p>

        </div>

        {theme.message && (

          <p className={`mt-1.5 text-xs font-medium ${theme.msg}`}>
            {theme.message}
          </p>

        )}


        {/* APPOINTMENT NUMBER (directly under the status) */}

        <div
          className={`mt-3 flex items-center justify-between gap-3 rounded-xl border bg-white/60 px-3.5 py-3 ${theme.inner}`}
        >

          <div className="min-w-0">

            <p className={`text-[9px] font-extrabold uppercase tracking-[0.14em] ${theme.small}`}>
              Appointment
            </p>

            <p className={`mt-0.5 text-base font-black tracking-[0.04em] ${theme.number}`}>
              #{String(appt.id).padStart(5, "0")}
            </p>

          </div>

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${theme.iconBox}`}
          >
            <theme.Icon
              className={`h-4 w-4 ${theme.icon}`}
              strokeWidth={2.4}
            />
          </div>

        </div>


        {/* DATE */}

        {timestamp && (

          <div className={`mt-3 border-t pt-3 ${theme.divider}`}>

            {theme.timeLabel && (

              <p className={`text-[9px] font-extrabold uppercase tracking-[0.12em] ${theme.small}`}>
                {theme.timeLabel}
              </p>

            )}

            <p
              className={`text-xs font-semibold ${
                theme.timeLabel
                  ? "mt-1 text-sm font-bold text-slate-700"
                  : "text-slate-500"
              }`}
            >
              {formatStatusTimestamp(timestamp)}
            </p>

          </div>

        )}


        {/* REASON */}

        {reason && (

          <div className={`mt-3 border-t pt-3 ${theme.divider}`}>

            <p className={`text-[9px] font-extrabold uppercase tracking-[0.12em] ${theme.small}`}>
              {theme.reasonLabel}
            </p>

            <p className="mt-1 break-words text-xs font-semibold leading-relaxed text-slate-600">
              {reason}
            </p>

          </div>

        )}

      </div>

    </div>

  )

})()}


                            

                        

                        

                      </div>


                      {/* =====================================================
                          ACTION BUTTONS
                      ===================================================== */}

                      <div className="flex w-full flex-wrap gap-2 border-t border-slate-100 pt-5">

                        {/* CONFIRMED */}

                        {appt.status === "confirmed" && (
                          <>

                            <button
                              onClick={(e) =>
                                preventDoubleClick(e, () =>
                                  updateStatus(
                                    appt.id,
                                    "in_progress"
                                  )
                                )
                              }
                              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:flex-none"
                            >

                              <Wrench className="h-4 w-4 shrink-0" />

                              <span>
                                Start Service
                              </span>

                            </button>


                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCancelAppointment(appt)
                                setCancelReason("")
                                setShowCancelDialog(true)
                              }}
                              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-bold text-red-700 transition-all duration-200 hover:bg-red-600 hover:text-white sm:flex-none"
                            >

                              <XCircle className="h-4 w-4 shrink-0" />

                              <span>
                                Cancel Service
                              </span>

                            </button>

                          </>
                        )}


                        {/* IN PROGRESS */}

                        {appt.status === "in_progress" && (
                          <>

                            <button
                              onClick={(e) =>
                                preventDoubleClick(e, () =>
                                  updateStatus(
                                    appt.id,
                                    "completed"
                                  )
                                )
                              }
                              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-700 hover:shadow-md sm:flex-none"
                            >

                              <CheckCircle2 className="h-4 w-4 shrink-0" />

                              <span>
                                Complete Service
                              </span>

                            </button>


                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCancelAppointment(appt)
                                setCancelReason("")
                                setShowCancelDialog(true)
                              }}
                              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-bold text-red-700 transition-all duration-200 hover:bg-red-600 hover:text-white sm:flex-none"
                            >

                              <XCircle className="h-4 w-4 shrink-0" />

                              <span>
                                Cancel Service
                              </span>

                            </button>

                          </>
                        )}


                        {/* COMPLETED */}

                        {appt.status === "completed" && (
                          <>

                            <div className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 sm:w-auto">

                              <p className="flex items-center gap-1.5 text-xs font-extrabold text-green-700">

                                <CheckCircle2 className="h-4 w-4 shrink-0" />

                                Completed

                              </p>

                              {appt.completed_at && (

                                <p className="mt-1 text-xs font-semibold text-slate-500">

                                  {new Date(
                                    appt.completed_at
                                  ).toLocaleDateString([], {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}{" "}

                                  at{" "}

                                  {new Date(
                                    appt.completed_at
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}

                                </p>

                              )}

                            </div>


                            {/* PAYMENT / TRANSACTION */}

                            {appt.transaction_id ? (

                              <div className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 sm:w-auto">

                                <p className="flex items-center gap-1.5 text-xs font-extrabold text-green-700">

                                  <CreditCard className="h-4 w-4 shrink-0" />

                                  Payment Completed

                                </p>

                                {appt.payment_method && (
                                  <p className="mt-1 text-xs font-semibold text-slate-500">
                                    {appt.payment_method}
                                  </p>
                                )}

                              </div>

                            ) : (

                              <button
                                onClick={() =>
                                  navigate(
                                    `/admin/transactions/create/${appt.id}`
                                  )
                                }
                                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-md sm:flex-none"
                              >

                                <Banknote className="h-4 w-4 shrink-0" />

                                <span>
                                  Create Transaction
                                </span>

                              </button>

                            )}


                            {/* ARCHIVE */}

                            <button
                              type="button"
                              onClick={() =>
                                archiveAppointment(appt.id)
                              }
                              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-slate-700 sm:flex-none"
                            >

                              <Archive className="h-4 w-4 shrink-0" />

                              <span>
                                Archive
                              </span>

                            </button>

                          </>
                        )}


                        {/* =====================================================
                            ADMIN APPOINTMENT MESSAGING BUTTON
                        ===================================================== */}

                        {(
                          appt.status === "confirmed" ||
                          appt.status === "in_progress" ||
                          appt.status === "completed"
                        ) && (() => {

                          const conversationId =
                            adminConversationMap?.[appt.id]

                          const unreadCount =
                            conversationId
                              ? Number(
                                  adminUnreadCounts?.[
                                    conversationId
                                  ] || 0
                                )
                              : 0

                          const hasUnread =
                            unreadCount > 0

                          return (

                            <div className="relative inline-flex">

                              <button
                                type="button"
                                onClick={async () => {

                                  await openAppointmentConversation(
                                    appt
                                  )

                                  if (
                                    conversationId &&
                                    unreadCount > 0
                                  ) {

                                    await markConversationAsRead(
                                      conversationId
                                    )

                                  }

                                }}
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
                                  transition-all
                                  duration-200

                                  ${
                                    hasUnread
                                      ? `
                                        border-red-300
                                        bg-red-100
                                        text-red-600
                                        ring-2
                                        ring-red-200
                                        animate-pulse
                                      `
                                      : `
                                        border-red-200
                                        bg-red-50
                                        text-red-600
                                        hover:border-red-300
                                        hover:bg-red-100
                                      `
                                  }
                                `}
                                title={
                                  hasUnread
                                    ? `${unreadCount} unread message${
                                        unreadCount === 1
                                          ? ""
                                          : "s"
                                      }`
                                    : "Open appointment messages"
                                }
                                aria-label="Open appointment messages"
                              >

                                <MessageCircle className="h-5 w-5" />

                              </button>


                              {hasUnread && (

                                <span
                                  className="
                                    absolute
                                    -right-2
                                    -top-2
                                    z-10
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    border-2
                                    border-white
                                    bg-red-600
                                    px-1.5
                                    text-[10px]
                                    font-extrabold
                                    leading-none
                                    text-white
                                    shadow-md
                                    animate-bounce
                                  "
                                >

                                  {unreadCount > 99
                                    ? "99+"
                                    : unreadCount}

                                </span>

                              )}

                            </div>

                          )

                        })()}

{/* =====================================================
    CANCELLED / REJECTED — ARCHIVE + DELETE
===================================================== */}

{appt.status === "cancelled" && (

  <div className="mt-5 flex w-full items-center justify-end gap-2 pb-1 sm:mt-6">

    {/* ARCHIVE */}

    <button
      type="button"
      disabled={actionLoading === `archive-${appt.id}`}
      onClick={() => handleArchive(appt.id)}
      className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white transition-all duration-150 sm:flex-none ${
        actionLoading === `archive-${appt.id}`
          ? "cursor-not-allowed bg-slate-500 opacity-70"
          : "bg-slate-600 shadow-sm hover:bg-slate-700 active:scale-[0.98]"
      }`}
    >
      <Archive className="h-4 w-4 shrink-0" />
      <span>
        {actionLoading === `archive-${appt.id}` ? "Archiving..." : "Archive"}
      </span>
    </button>

    {/* DELETE */}

    <button
      type="button"
      disabled={actionLoading === `delete-${appt.id}`}
      onClick={() => handleDelete(appt.id)}
      className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white transition-all duration-150 sm:flex-none ${
        actionLoading === `delete-${appt.id}`
          ? "cursor-not-allowed bg-slate-600 opacity-70"
          : "bg-slate-700 shadow-sm hover:bg-slate-800 active:scale-[0.98]"
      }`}
    >
      <Trash2 className="h-4 w-4 shrink-0" />
      <span>
        {actionLoading === `delete-${appt.id}` ? "Deleting..." : "Delete"}
      </span>
    </button>

  </div>

)}
                      
                      </div>

                    </div>


                      {/* =====================================================
      LIVE SERVICE PROGRESS
      UI ONLY — NO DATA / LOGIC / HANDLERS CHANGED

      STATUS BEHAVIOR:
      pending     → 15% / Requested
      confirmed   → 40% / Confirmed
      in_progress → 70% / Service
      completed   → 100% / Completed
      cancelled   → stops at current known stage
      rejected    → 0% / stopped before confirmation
  ===================================================== */}

  <div
    className={`
      relative
      mt-6
      overflow-hidden
      rounded-[20px]
      border
      shadow-sm
      transition-all
      duration-500
      sm:mt-7

      ${
        appt.status === "pending"
          ? "border-yellow-200 bg-yellow-50 shadow-yellow-100"
          : appt.status === "confirmed"
          ? "border-blue-200 bg-blue-50 shadow-blue-100"
          : appt.status === "in_progress"
          ? "border-purple-200 bg-purple-50 shadow-purple-100"
          : appt.status === "completed"
          ? "border-green-200 bg-green-50 shadow-green-100"
          : appt.status === "cancelled"
          ? "border-orange-200 bg-orange-50 shadow-orange-100"
          : appt.status === "rejected"
          ? "border-red-200 bg-red-50 shadow-red-100"
          : "border-slate-200 bg-slate-50"
      }
    `}
  >

    {/* =================================================
        STATUS CONFIGURATION
    ================================================= */}

   {/* =====================================================
    LIVE SERVICE PROGRESS
    UI ONLY — NO DATA / LOGIC / HANDLER CHANGES

    STATUS BEHAVIOR:
    - pending      → 15%
    - confirmed    → 40%
    - in_progress → 70%
    - completed   → 100%
    - cancelled   → stops at current stage, OR 15% if
                     cancellation happened before confirmation
    - rejected    → 0%, stopped before confirmation

    IMPORTANT:
    Database does NOT have status = "rejected".
    Rejection is identified by:
      appt.rejected_at
      appt.rejection_reason
===================================================== */}

{(() => {

  /* =====================================================
      DETERMINE VISUAL STATUS

      IMPORTANT:
      rejected_at takes priority over status.

      This prevents a rejected appointment from being
      displayed as "Service Cancelled".
  ===================================================== */

  const isRejected =
    Boolean(appt.rejected_at)

  const isCancelled =
    appt.status === "cancelled" &&
    !isRejected

  const visualStatus =
    isRejected
      ? "rejected"
      : isCancelled
      ? "cancelled"
      : appt.status


  /* =====================================================
      PROGRESS CONFIGURATION
  ===================================================== */

  const progressConfig = {

    pending: {
      percent: 15,
      label: "Appointment Requested",
      description:
        "Waiting for appointment confirmation",
      color: "bg-yellow-500",
      light: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
      shadow: "shadow-yellow-100",
    },

    confirmed: {
      percent: 40,
      label: "Service Confirmed",
      description:
        "Appointment is confirmed and ready for service",
      color: "bg-blue-500",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500",
      shadow: "shadow-blue-100",
    },

    in_progress: {
      percent: 70,
      label: "Service In Progress",
      description:
        "Technician is currently working on the vehicle",
      color: "bg-purple-500",
      light: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      dot: "bg-purple-500",
      shadow: "shadow-purple-100",
    },

    completed: {
      percent: 100,
      label: "Service Completed",
      description:
        "Service work has been completed",
      color: "bg-green-500",
      light: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      dot: "bg-green-500",
      shadow: "shadow-green-100",
    },

    cancelled: {
      percent: 0,
      label: "Service Cancelled",
      description:
        "This service appointment was cancelled.",
      color: "bg-orange-500",
      light: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      dot: "bg-orange-500",
      shadow: "shadow-orange-100",
    },

    rejected: {
      percent: 0,
      label: "Service Rejected",
      description:
        "This service appointment was rejected and will not proceed.",
      color: "bg-red-500",
      light: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
      shadow: "shadow-red-100",
    },

  }


  /* =====================================================
      CANCELLED PROGRESS

      A cancellation should stop at the stage where the
      appointment actually was.

      Since cancelled appointments retain status = cancelled,
      we use available timestamps / appointment state.

      Default cancellation point:
        15% = requested

      If there was already confirmation/completion activity,
      the visual can remain at that stage.
  ===================================================== */

  let progressPercent = 15

  let progressColor = progressConfig.cancelled.color
  let progressLight = progressConfig.cancelled.light
  let progressBorder = progressConfig.cancelled.border
  let progressText = progressConfig.cancelled.text
  let progressShadow = progressConfig.cancelled.shadow
  let progressLabel = progressConfig.cancelled.label
  let progressDescription = progressConfig.cancelled.description


  /* =====================================================
      REJECTED
      ALWAYS 0%

      Rejection happens before confirmation, so the bar
      must remain completely stopped.
  ===================================================== */

  if (visualStatus === "rejected") {

    progressPercent = 0

    progressColor = progressConfig.rejected.color
    progressLight = progressConfig.rejected.light
    progressBorder = progressConfig.rejected.border
    progressText = progressConfig.rejected.text
    progressShadow = progressConfig.rejected.shadow
    progressLabel = progressConfig.rejected.label
    progressDescription = progressConfig.rejected.description

  }


  /* =====================================================
      CANCELLED

      Orange.

      If the appointment was cancelled before confirmation,
      stop at Requested.

      If the record still contains a previous completed_at
      value, show the completed point.

      If technician/service activity exists, stop at Service.

      Otherwise stop at Requested.
  ===================================================== */

  else if (visualStatus === "cancelled") {

    progressColor = progressConfig.cancelled.color
    progressLight = progressConfig.cancelled.light
    progressBorder = progressConfig.cancelled.border
    progressText = progressConfig.cancelled.text
    progressShadow = progressConfig.cancelled.shadow
    progressLabel = progressConfig.cancelled.label
    progressDescription = progressConfig.cancelled.description

    if (appt.completed_at) {

      progressPercent = 100

    } else if (appt.technician_id) {

      progressPercent = 70

    } else {

      progressPercent = 15

    }

  }


  /* =====================================================
      NORMAL STATUSES
  ===================================================== */

  else {

    const normalProgress =
      progressConfig[visualStatus] ||
      progressConfig.pending

    progressPercent = normalProgress.percent
    progressColor = normalProgress.color
    progressLight = normalProgress.light
    progressBorder = normalProgress.border
    progressText = normalProgress.text
    progressShadow = normalProgress.shadow
    progressLabel = normalProgress.label
    progressDescription = normalProgress.description

  }


  /* =====================================================
      JOURNEY LINE PROGRESS

      Rejected:
        0% — stops before confirmation.

      Cancelled:
        Stops at the actual visual stage.

      Normal:
        follows appointment status.
  ===================================================== */

  let journeyPercent = "0%"

  if (visualStatus === "rejected") {

    journeyPercent = "0%"

  } else if (visualStatus === "cancelled") {

    if (appt.completed_at) {
      journeyPercent = "86%"
    } else if (appt.technician_id) {
      journeyPercent = "63%"
    } else {
      journeyPercent = "0%"
    }

  } else if (visualStatus === "pending") {

    journeyPercent = "0%"

  } else if (visualStatus === "confirmed") {

    journeyPercent = "30%"

  } else if (visualStatus === "in_progress") {

    journeyPercent = "63%"

  } else if (visualStatus === "completed") {

    journeyPercent = "86%"

  }


  /* =====================================================
      JOURNEY NODE STATES
  ===================================================== */

  const requestedComplete =
    visualStatus !== "rejected"

  const confirmedComplete =
    [
      "confirmed",
      "in_progress",
      "completed",
    ].includes(visualStatus)

  const serviceComplete =
    [
      "in_progress",
      "completed",
    ].includes(visualStatus)

  const completedComplete =
    visualStatus === "completed"


  return (

    <div className="relative mt-2 sm:mt-0">


      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {visualStatus === "in_progress" && (
          <>
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl"></div>

            <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-purple-200/20 blur-3xl"></div>
          </>
        )}

        {visualStatus === "completed" && (
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-300/20 blur-3xl"></div>
        )}

        {visualStatus === "cancelled" && (
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-300/20 blur-3xl"></div>
        )}

        {visualStatus === "rejected" && (
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-300/20 blur-3xl"></div>
        )}

      </div>


      {/* =================================================
          LIVE HEADER
      ================================================= */}

      <div className="relative px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* =================================================
              LEFT STATUS
          ================================================= */}

          <div className="flex min-w-0 items-center gap-3">

            <div
              className={`
                relative
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-sm
                ring-1
                ring-black/5
                ${progressText}
              `}
            >

              {/* IN PROGRESS */}

              {visualStatus === "in_progress" ? (

                <>
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-purple-400/30 animate-pulse"></span>

                  <Wrench
                    className="relative h-5 w-5 animate-[spin_3s_linear_infinite]"
                  />
                </>

              ) : visualStatus === "completed" ? (

                <CheckCircle2 className="h-5 w-5" />

              ) : visualStatus === "cancelled" ? (

                <Ban className="h-5 w-5" />

              ) : visualStatus === "rejected" ? (

                <XCircle className="h-5 w-5" />

              ) : visualStatus === "confirmed" ? (

                <CheckCircle2 className="h-5 w-5" />

              ) : (

                <Clock3 className="h-5 w-5" />

              )}

            </div>


            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <p
                  className={`
                    text-sm
                    font-extrabold
                    ${progressText}
                    sm:text-base
                  `}
                >
                  {progressLabel}
                </p>


                {visualStatus === "in_progress" && (

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-purple-700">

                    <span className="relative flex h-1.5 w-1.5">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-75"></span>

                      <span className="relative h-1.5 w-1.5 rounded-full bg-purple-600"></span>

                    </span>

                    Live Now

                  </span>

                )}

              </div>


              <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                {progressDescription}
              </p>

            </div>

          </div>


          {/* =================================================
              PERCENTAGE
          ================================================= */}

          <div className="flex items-center justify-between gap-4 sm:block sm:text-right">

            <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
              Progress
            </div>

            <div
              className={`
                text-2xl
                font-black
                leading-none
                ${progressText}
              `}
            >
              {progressPercent}%
            </div>

          </div>

        </div>


        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <div className="mt-5">

          <div className="relative h-3 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-black/5">

            {/* BACKGROUND MARKERS */}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1">

              <span className="h-1 w-1 rounded-full bg-slate-300"></span>

              <span className="h-1 w-1 rounded-full bg-slate-300"></span>

              <span className="h-1 w-1 rounded-full bg-slate-300"></span>

              <span className="h-1 w-1 rounded-full bg-slate-300"></span>

              <span className="h-1 w-1 rounded-full bg-slate-300"></span>

            </div>


            {/* ACTUAL PROGRESS */}

            <div
              className={`
                relative
                h-full
                overflow-hidden
                rounded-full
                ${progressColor}
                shadow-sm
                transition-all
                duration-1000
                ease-out
              `}
              style={{
                width: `${progressPercent}%`,
              }}
            >

              <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-black/5"></div>


              {/* LIVE SHINE ONLY WHILE SERVICE IS ACTIVE */}

              {visualStatus === "in_progress" && (

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    w-1/3
                    -translate-x-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/70
                    to-transparent
                    animate-[progressShine_2s_linear_infinite]
                  "
                />

              )}


              {/* COMPLETED SHINE */}

              {visualStatus === "completed" && (

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

              )}

            </div>

          </div>


          <div className="mt-2 flex justify-between text-[9px] font-bold uppercase tracking-wide text-slate-500">

            <span>Start</span>

            <span>Service</span>

            <span>Complete</span>

          </div>

        </div>


        {/* =================================================
            SERVICE JOURNEY
        ================================================= */}

        <div className="mt-6">

          <div className="relative">

            {/* BASE LINE */}

            <div className="absolute left-[7%] right-[7%] top-4 h-0.5 bg-slate-200"></div>


            {/* ACTIVE JOURNEY LINE */}

            <div
              className={`
                absolute
                left-[7%]
                top-4
                h-0.5
                ${progressColor}
                transition-all
                duration-1000
              `}
              style={{
                width: journeyPercent,
              }}
            ></div>


            <div className="relative grid grid-cols-4 gap-1">


              {/* =================================================
                  REQUESTED
              ================================================= */}

              <div className="min-w-0 text-center">

                <div
                  className={`
                    relative
                    mx-auto
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    bg-white
                    shadow-sm
                    transition-all
                    duration-500
                    ${
                      isRejected
                        ? "border-red-500 text-red-600"
                        : requestedComplete
                        ? "border-green-500 text-green-600"
                        : "border-slate-200 text-slate-300"
                    }
                  `}
                >

                  {isRejected ? (

                    <XCircle className="h-3.5 w-3.5" />

                  ) : (

                    <CheckCircle2 className="h-3.5 w-3.5" />

                  )}

                </div>


                <p
                  className={`
                    mt-2
                    truncate
                    text-[9px]
                    font-extrabold
                    sm:text-[10px]
                    ${
                      isRejected
                        ? "text-red-700"
                        : requestedComplete
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  `}
                >
                  Requested
                </p>

              </div>


              {/* =================================================
                  CONFIRMED
              ================================================= */}

              <div className="min-w-0 text-center">

                <div
                  className={`
                    relative
                    mx-auto
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    bg-white
                    shadow-sm
                    transition-all
                    duration-500

                    ${
                      confirmedComplete
                        ? "border-blue-500 text-blue-600"
                        : visualStatus === "cancelled"
                        ? "border-orange-500 text-orange-600"
                        : visualStatus === "rejected"
                        ? "border-red-500 text-red-600"
                        : "border-slate-200 text-slate-300"
                    }
                  `}
                >

                  {confirmedComplete ? (

                    <CheckCircle2 className="h-3.5 w-3.5" />

                  ) : visualStatus === "cancelled" ? (

                    <Ban className="h-3.5 w-3.5" />

                  ) : visualStatus === "rejected" ? (

                    <XCircle className="h-3.5 w-3.5" />

                  ) : (

                    <span className="h-2 w-2 rounded-full bg-slate-300"></span>

                  )}

                </div>


                <p
                  className={`
                    mt-2
                    truncate
                    text-[9px]
                    font-extrabold
                    sm:text-[10px]

                    ${
                      confirmedComplete
                        ? "text-slate-700"
                        : visualStatus === "cancelled"
                        ? "text-orange-700"
                        : visualStatus === "rejected"
                        ? "text-red-700"
                        : "text-slate-400"
                    }
                  `}
                >
                  Confirmed
                </p>

              </div>


              {/* =================================================
                  SERVICE
              ================================================= */}

              <div className="min-w-0 text-center">

                <div
                  className={`
                    relative
                    mx-auto
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    bg-white
                    shadow-sm
                    transition-all
                    duration-500

                    ${
                      serviceComplete
                        ? "border-purple-500 text-purple-600"
                        : visualStatus === "cancelled"
                        ? "border-orange-500 text-orange-600"
                        : visualStatus === "rejected"
                        ? "border-red-500 text-red-600"
                        : "border-slate-200 text-slate-300"
                    }

                    ${
                      visualStatus === "in_progress"
                        ? "ring-4 ring-purple-100"
                        : ""
                    }
                  `}
                >

                  {visualStatus === "in_progress" ? (

                    <Wrench className="h-3.5 w-3.5 animate-[spin_3s_linear_infinite]" />

                  ) : visualStatus === "completed" ? (

                    <CheckCircle2 className="h-3.5 w-3.5" />

                  ) : visualStatus === "cancelled" ? (

                    <Ban className="h-3.5 w-3.5" />

                  ) : visualStatus === "rejected" ? (

                    <XCircle className="h-3.5 w-3.5" />

                  ) : (

                    <Wrench className="h-3.5 w-3.5" />

                  )}

                </div>


                <p
                  className={`
                    mt-2
                    truncate
                    text-[9px]
                    font-extrabold
                    sm:text-[10px]

                    ${
                      serviceComplete
                        ? "text-slate-700"
                        : visualStatus === "cancelled"
                        ? "text-orange-700"
                        : visualStatus === "rejected"
                        ? "text-red-700"
                        : "text-slate-400"
                    }
                  `}
                >
                  Service
                </p>

              </div>


              {/* =================================================
                  COMPLETED
              ================================================= */}

              <div className="min-w-0 text-center">

                <div
                  className={`
                    relative
                    mx-auto
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    bg-white
                    shadow-sm
                    transition-all
                    duration-500

                    ${
                      completedComplete
                        ? "border-green-500 text-green-600"
                        : visualStatus === "cancelled"
                        ? "border-orange-500 text-orange-600"
                        : visualStatus === "rejected"
                        ? "border-red-500 text-red-600"
                        : "border-slate-200 text-slate-300"
                    }

                    ${
                      completedComplete
                        ? "ring-4 ring-green-100"
                        : ""
                    }
                  `}
                >

                  {completedComplete ? (

                    <CheckCircle2 className="h-3.5 w-3.5" />

                  ) : visualStatus === "cancelled" ? (

                    <Ban className="h-3.5 w-3.5" />

                  ) : visualStatus === "rejected" ? (

                    <XCircle className="h-3.5 w-3.5" />

                  ) : (

                    <CheckCircle2 className="h-3.5 w-3.5" />

                  )}

                </div>


                <p
                  className={`
                    mt-2
                    truncate
                    text-[9px]
                    font-extrabold
                    sm:text-[10px]

                    ${
                      completedComplete
                        ? "text-slate-700"
                        : visualStatus === "cancelled"
                        ? "text-orange-700"
                        : visualStatus === "rejected"
                        ? "text-red-700"
                        : "text-slate-400"
                    }
                  `}
                >
                  Completed
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          IN-PROGRESS NOTICE
      ================================================= */}

      {visualStatus === "in_progress" && (

        <div className="relative overflow-hidden border-t border-purple-200 bg-purple-50 px-4 py-3 sm:px-5">

          <div className="relative flex items-start gap-3">

            <div className="relative mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-sm">

              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />

              <span className="absolute inset-0 rounded-full ring-2 ring-purple-400/30 animate-ping"></span>

            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-purple-600">
                Live Service Update
              </p>

              <p className="mt-0.5 text-xs font-semibold leading-5 text-purple-800">

                Service is currently being worked on by{" "}

                <span className="font-extrabold">
                  {technicianName || "the assigned technician"}
                </span>.

              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          COMPLETED NOTICE
      ================================================= */}

      {visualStatus === "completed" && (

        <div className="relative overflow-hidden border-t border-green-200 bg-green-50 px-4 py-3 sm:px-5">

          <div className="relative flex items-start gap-3">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-sm">

              <CheckCircle2 className="h-3.5 w-3.5" />

            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-green-600">
                Service Finished
              </p>

              <p className="mt-0.5 text-xs font-semibold leading-5 text-green-800">
                All service stages have been completed successfully.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          CANCELLED NOTICE
          ORANGE
      ================================================= */}

      {visualStatus === "cancelled" && (

        <div className="relative overflow-hidden border-t border-orange-200 bg-orange-50 px-4 py-3 sm:px-5">

          <div className="relative flex items-start gap-3">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white shadow-sm">

              <Ban className="h-3.5 w-3.5" />

            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-orange-600">
                Service Cancelled
              </p>

              <p className="mt-0.5 text-xs font-semibold leading-5 text-orange-800">
                This service appointment was cancelled.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          REJECTED NOTICE
          RED
      ================================================= */}

      {visualStatus === "rejected" && (

        <div className="relative overflow-hidden border-t border-red-200 bg-red-50 px-4 py-3 sm:px-5">

          <div className="relative flex items-start gap-3">

            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">

              <XCircle className="h-3.5 w-3.5" />

            </div>

            <div className="min-w-0">

              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-red-600">
                Service Rejected
              </p>

              <p className="mt-0.5 text-xs font-semibold leading-5 text-red-800">
                This service appointment was rejected and will not proceed.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  )

})()}





                    </div>
 
                    {/* =====================================================
                        BOTTOM INFORMATION
                    ===================================================== */}

                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 lg:grid-cols-2 lg:gap-5">

                      {/* TECHNICIAN */}

                      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

                        <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

                          <UserCog className="h-3.5 w-3.5 shrink-0 text-slate-500" />

                          Assigned Technician

                        </p>

                        {appt.technician_id &&
                        technicianName ? (

                          <div className="mt-3 flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">

                              <UserCog className="h-5 w-5" />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-extrabold text-slate-900">
                                {technicianName}
                              </p>

                              {appt.technician_role && (

                                <p className="mt-1 truncate text-xs font-bold text-blue-600">
                                  Role: {appt.technician_role}
                                </p>

                              )}

                              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-green-600">

                                <CheckCircle2 className="h-3.5 w-3.5" />

                                Assigned

                              </p>

                            </div>

                          </div>

                        ) : appt.technician_id ? (

                          <div className="mt-3">

                            <span className="inline-flex max-w-full items-center rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-700">

                              <span className="truncate">
                                Technician ID:{" "}
                                {appt.technician_id}
                              </span>

                            </span>

                          </div>

                        ) : (

                          <div className="mt-3">

                            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500">
                              Not Assigned
                            </span>

                          </div>

                        )}

                      </div>


                      {/* CUSTOMER NOTES */}

                      <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

                        <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

                          <Paperclip className="h-3.5 w-3.5 shrink-0" />

                          Customer Notes

                        </p>

                        {appt.notes ? (

                          <p className="mt-3 break-words rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                            {appt.notes}
                          </p>

                        ) : (

                          <p className="mt-3 text-sm font-medium text-slate-400">
                            No additional notes provided.
                          </p>

                        )}

                      </div>






                      {/* SERVICE TASK ATTACHMENTS */}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:col-span-2">

                        <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">

                          <Paperclip className="h-3.5 w-3.5 shrink-0" />

                          Service Task Attachments

                        </p>

                        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

                          {/* UPLOAD */}

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="min-w-0">

                              <p className="text-sm font-extrabold text-slate-800">
                                Add service files
                              </p>

                              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                                Upload photos, videos, documents, or other service files.
                              </p>

                            </div>

                            <label className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-700 hover:shadow-md sm:w-fit">

                              {uploadingAttachment ===
                              appt.id ? (

                                <>
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                  Uploading...
                                </>

                              ) : (

                                <>
                                  <Upload className="h-4 w-4" />
                                  Upload Attachment
                                </>

                              )}

                              <input
                                type="file"
                                className="hidden"
                                disabled={
                                  uploadingAttachment ===
                                  appt.id
                                }
                                onChange={(e) => {

                                  const file =
                                    e.target.files?.[0]

                                  if (!file) {
                                    return
                                  }

                                  uploadAttachment(
                                    appt.id,
                                    file
                                  )

                                  e.target.value = ""

                                }}
                              />

                            </label>

                          </div>


                          {/* ATTACHMENT LIST */}

                          <div className="mt-4 space-y-2.5">

                            {attachments[appt.id]?.length > 0 ? (

                              attachments[
                                appt.id
                              ].map((attachment) => (

                                <div
                                  key={attachment.id}
                                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 sm:px-4 md:flex-row md:items-center md:justify-between"
                                >

                                  {/* FILE INFORMATION */}

                                  <div className="min-w-0">

                                    <p className="flex min-w-0 items-center gap-2 text-sm font-extrabold text-slate-800">

                                      <Paperclip className="h-4 w-4 shrink-0 text-slate-500" />

                                      <span className="truncate">
                                        {attachment.file_name}
                                      </span>

                                    </p>

                                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                      Uploaded by{" "}
                                      {attachment.uploaded_by_name ||
                                        "Unknown user"}
                                      {" • "}
                                      {attachment.uploaded_by_role ||
                                        "Unknown role"}
                                    </p>

                                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">

                                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                                      <span>
                                        Uploaded{" "}
                                        {attachment.created_at
                                          ? new Date(
                                              attachment.created_at
                                            ).toLocaleString(
                                              [],
                                              {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                              }
                                            )
                                          : "Date unavailable"}
                                      </span>

                                    </p>

                                  </div>


                                  {/* ADMIN FILE ACTIONS */}

                                  <div className="flex w-full shrink-0 flex-wrap gap-2 md:w-auto">

                                    {/* VIEW */}

                                    <button
                                      type="button"
                                      onClick={async () => {

                                        const {
                                          data,
                                          error,
                                        } =
                                          await supabase.storage
                                            .from(
                                              "service-task-attachments"
                                            )
                                            .createSignedUrl(
                                              attachment.file_path,
                                              60
                                            )

                                        if (error) {

                                          console.error(
                                            "Attachment View Error:",
                                            error
                                          )

                                          alert(
                                            `Unable to open attachment: ${error.message}`
                                          )

                                          return
                                        }

                                        if (
                                          data?.signedUrl
                                        ) {

                                          window.open(
                                            data.signedUrl,
                                            "_blank",
                                            "noopener,noreferrer"
                                          )

                                        }

                                      }}
                                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white sm:flex-none"
                                    >

                                      <Eye className="h-4 w-4" />

                                      View

                                    </button>


                                    {/* DOWNLOAD */}

                                    <button
                                      type="button"
                                      onClick={async () => {

                                        try {

                                          console.log(
                                            "Downloading attachment:",
                                            attachment.file_path
                                          )

                                          const {
                                            data,
                                            error,
                                          } =
                                            await supabase.storage
                                              .from(
                                                "service-task-attachments"
                                              )
                                              .download(
                                                attachment.file_path
                                              )

                                          if (error) {

                                            console.error(
                                              "Attachment Download Error:",
                                              error
                                            )

                                            alert(
                                              `Unable to download attachment: ${error.message}`
                                            )

                                            return
                                          }

                                          if (!data) {

                                            console.error(
                                              "Attachment Download Error: No file data returned"
                                            )

                                            alert(
                                              "Unable to download attachment: No file data was returned."
                                            )

                                            return
                                          }

                                          const blobUrl =
                                            window.URL.createObjectURL(
                                              data
                                            )

                                          const link =
                                            document.createElement(
                                              "a"
                                            )

                                          link.href =
                                            blobUrl

                                          link.download =
                                            attachment.file_name ||
                                            "attachment"

                                          document.body.appendChild(
                                            link
                                          )

                                          link.click()

                                          document.body.removeChild(
                                            link
                                          )

                                          window.URL.revokeObjectURL(
                                            blobUrl
                                          )

                                          console.log(
                                            "Attachment downloaded successfully:",
                                            attachment.file_name
                                          )

                                        } catch (
                                          error
                                        ) {

                                          console.error(
                                            "Attachment Download Error:",
                                            error
                                          )

                                          alert(
                                            `Unable to download attachment: ${
                                              error?.message ||
                                              "Unknown error"
                                            }`
                                          )

                                        }

                                      }}
                                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700 transition-all hover:bg-green-600 hover:text-white sm:flex-none"
                                    >

                                      <Download className="h-4 w-4" />

                                      Download

                                    </button>


                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      onClick={async () => {

                                        const confirmed =
                                          window.confirm(
                                            `Are you sure you want to delete "${attachment.file_name}"?`
                                          )

                                        if (
                                          !confirmed
                                        ) {
                                          return
                                        }

                                        try {

                                          console.log(
                                            "Deleting attachment:",
                                            attachment
                                          )


                                          /* DELETE FROM STORAGE */

                                          const {
                                            error:
                                              storageError,
                                          } =
                                            await supabase.storage
                                              .from(
                                                "service-task-attachments"
                                              )
                                              .remove([
                                                attachment.file_path,
                                              ])

                                          if (
                                            storageError
                                          ) {

                                            console.error(
                                              "Storage Delete Error:",
                                              storageError
                                            )

                                            alert(
                                              `Failed to delete file: ${storageError.message}`
                                            )

                                            return
                                          }


                                          /* DELETE DATABASE RECORD */

                                          const {
                                            error:
                                              databaseError,
                                          } =
                                            await supabase
                                              .from(
                                                "service_task_attachments"
                                              )
                                              .delete()
                                              .eq(
                                                "id",
                                                attachment.id
                                              )

                                          if (
                                            databaseError
                                          ) {

                                            console.error(
                                              "Attachment Database Delete Error:",
                                              databaseError
                                            )

                                            alert(
                                              `File removed from storage, but database record could not be deleted: ${databaseError.message}`
                                            )

                                            return
                                          }


                                          /* UPDATE UI */

                                          setAttachments(
                                            (
                                              current
                                            ) => ({
                                              ...current,
                                              [appt.id]:
                                                (
                                                  current[
                                                    appt.id
                                                  ] || []
                                                ).filter(
                                                  (
                                                    item
                                                  ) =>
                                                    item.id !==
                                                    attachment.id
                                                ),
                                            })
                                          )

                                          alert(
                                            "Attachment deleted successfully."
                                          )

                                        } catch (
                                          error
                                        ) {

                                          console.error(
                                            "Attachment Delete Error:",
                                            error
                                          )

                                          alert(
                                            `Failed to delete attachment: ${error.message}`
                                          )

                                        }

                                      }}
                                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:bg-red-600 hover:text-white sm:flex-none"
                                    >

                                      <Trash2 className="h-4 w-4" />

                                      Delete

                                    </button>

                                  </div>

                                </div>

                              ))

                            ) : (

                              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                                No attachments uploaded yet.
                              </p>

                            )}

                          </div>

                         

                        </div>

                        

                      </div>

                       {/* =================================================
    VEHICLE AI CHECK
================================================= */}

<div className="min-w-0 rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-3.5 shadow-sm sm:col-span-2">

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

    {appt.vehicle_eligibility === "eligible" ? (

      <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-extrabold text-green-700">

        <span className="h-2 w-2 rounded-full bg-green-500" />

        Eligible

      </span>

    ) : appt.vehicle_eligibility === "not_eligible" ? (

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

    {/* VEHICLE TYPE */}

    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        Detected Vehicle
      </p>

      <p className="mt-1 text-sm font-black capitalize text-slate-800">
        {appt.vehicle_type
          ? appt.vehicle_type
              .replace(/_/g, " ")
          : "Not detected"}
      </p>

    </div>


    {/* CONFIDENCE */}

    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        AI Confidence
      </p>

      <p className="mt-1 text-sm font-black text-slate-800">

        {appt.vehicle_detection_confidence !==
        null &&
        appt.vehicle_detection_confidence !==
        undefined
          ? `${(
              Number(
                appt.vehicle_detection_confidence
              ) * 100
            ).toFixed(1)}%`
          : "N/A"}

      </p>

    </div>


    {/* ELIGIBILITY */}

    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">

      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        Eligibility
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          appt.vehicle_eligibility ===
          "eligible"
            ? "text-green-600"
            : appt.vehicle_eligibility ===
              "not_eligible"
            ? "text-red-600"
            : "text-amber-600"
        }`}
      >

        {appt.vehicle_eligibility ===
        "eligible"
          ? "Eligible"
          : appt.vehicle_eligibility ===
            "not_eligible"
          ? "Not Eligible"
          : "Admin Review"}

      </p>

    </div>

  </div>


  {/* AI MESSAGE */}

  <div
    className={`mt-2.5 rounded-xl border px-3 py-2.5 ${
      appt.vehicle_eligibility ===
      "eligible"
        ? "border-green-100 bg-green-50"
        : appt.vehicle_eligibility ===
          "not_eligible"
        ? "border-red-100 bg-red-50"
        : "border-amber-100 bg-amber-50"
    }`}
  >

    <p
      className={`text-xs font-semibold leading-5 ${
        appt.vehicle_eligibility ===
        "eligible"
          ? "text-green-700"
          : appt.vehicle_eligibility ===
            "not_eligible"
          ? "text-red-700"
          : "text-amber-700"
      }`}
    >

      {appt.vehicle_detection_message ||
        "Vehicle AI check has not been completed yet."}

    </p>

  </div>


  {/* DETECTION TIME */}

  {appt.vehicle_detected_at && (
  <p className="mt-2 break-words text-[10px] font-medium leading-4 text-slate-400">
    AI check completed{" "}
    {new Date(
      appt.vehicle_detected_at
    ).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}
  </p>
)}


  

</div>


                    </div>















                    {/* ===================================================
                        CANCEL SERVICE MODAL
                    =================================================== */}

                    {showCancelDialog &&
                    selectedCancelAppointment && (

<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/70 px-3 py-4 sm:px-4">
                        <div className="my-auto w-full max-w-md overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.28)]">

                        
                            {/* HEADER */}

<div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">

  <div className="flex items-start gap-3">

    {/* ICON */}
   <div
  className="
    flex
    h-10
    w-10
    shrink-0
    cursor-pointer
    items-center
    justify-center
    rounded-xl
    border
    border-red-200
    bg-gradient-to-br
    from-red-50
    to-rose-100
    text-red-600
    shadow-sm
    transition-all
    duration-300
    hover:scale-110
    hover:shadow-[0_8px_20px_rgba(220,38,38,0.18)]
    active:scale-95
    sm:h-11
    sm:w-11
  "
>
  <XCircle
    className="h-5 w-5 sm:h-6 sm:w-6"
    strokeWidth={2.2}
  />
</div>



    {/* TITLE */}
    <div className="min-w-0 flex-1">

      <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
        Cancel Service
      </h2>

      <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
        Please provide a reason for cancelling this service.
      </p>

    </div>


    {/* CLOSE X BUTTON */}
    <button
      type="button"
      onClick={() => {
        setShowCancelDialog(false)
        setSelectedCancelAppointment(null)
        setCancelReason("")
      }}
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        text-slate-400
        shadow-sm
        transition-all
        duration-200
        hover:scale-110
        hover:border-red-200
        hover:bg-red-50
        hover:text-red-600
        hover:shadow-md
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-red-100
      "
      aria-label="Close cancellation dialog"
      title="Close"
    >
      <X className="h-5 w-5" strokeWidth={2.2} />
    </button>

  </div>


                            

                          </div>


                          {/* APPOINTMENT INFORMATION */}

                          <div className="px-4 py-5 sm:px-6">

                            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">

                              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Customer
                              </p>

                              <p className="mt-1 break-words font-extrabold text-slate-900">
                                {selectedCancelAppointment.customer_name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Service
                              </p>

                              <p className="mt-1 break-words font-bold text-slate-800">
                                {selectedCancelAppointment.service_type ||
                                  "Not specified"}
                              </p>

                              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Schedule
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {selectedCancelAppointment.appointment_date ||
                                  "Not specified"}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">

                                <Clock3 className="h-3.5 w-3.5 shrink-0" />

                                {formatAppointmentTime(
                                  selectedCancelAppointment.appointment_time
                                )}

                              </p>

                            </div>


                            {/* REASON */}

                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Cancellation Reason
                            </label>

                            <textarea
                              value={cancelReason}
                              onChange={(e) =>
                                setCancelReason(
                                  e.target.value
                                )
                              }
                              placeholder="Enter the reason for cancelling this service..."
                              rows={4}
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            />


                            {/* NOTICE */}

                            <div className="mt-4 flex gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3">

                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-700" />

                              <p className="text-xs font-medium leading-relaxed text-yellow-800">
                                This cancellation will be recorded with the cancellation date, time, and reason.
                              </p>

                            </div>


                            {/* BUTTONS */}

                            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">

                              <button
                                type="button"
                                onClick={() => {

                                  setShowCancelDialog(
                                    false
                                  )

                                  setSelectedCancelAppointment(
                                    null
                                  )

                                  setCancelReason("")

                                }}
                                className="min-h-[44px] flex-1 rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                              >
                                Keep Service
                              </button>


                              <button
                                type="button"
                                disabled={
                                  !cancelReason.trim()
                                }
                                onClick={async () => {

                                  if (
                                    !selectedCancelAppointment
                                  ) {
                                    return
                                  }

                                  const appointment =
                                    selectedCancelAppointment

                                  const reason =
                                    cancelReason.trim()

                                  if (!reason) {
                                    return
                                  }


                                  setShowCancelDialog(
                                    false
                                  )

                                  setSelectedCancelAppointment(
                                    null
                                  )

                                  setCancelReason("")


                                  try {

                                    await updateStatus(
                                      appointment.id,
                                      "cancelled",
                                      reason,
                                      "cancelled"
                                    )

                                  } catch (
                                    error
                                  ) {

                                    console.error(
                                      "Cancellation failed:",
                                      error
                                    )

                                  }

                                }}
                                className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                              >
                                Confirm Cancellation
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    )}


                    {/* ===================================================
                        REJECT APPOINTMENT MODAL
                    =================================================== */}

                    {showRejectModal &&
                    selectedAppointment && (

                      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/70 px-3 py-4 sm:px-4">

                        <div className="my-auto w-full max-w-md overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.28)]">

                          {/* HEADER */}

<div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6">

  <div className="flex items-start gap-3">

    {/* REJECT ICON */}

    <div
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-red-200
        bg-gradient-to-br
        from-red-50
        to-rose-100
        text-red-600
        shadow-sm
        transition-all
        duration-300
        hover:scale-110
        hover:shadow-[0_8px_20px_rgba(220,38,38,0.18)]
        sm:h-11
        sm:w-11
      "
    >
      <X
        className="h-5 w-5 sm:h-6 sm:w-6"
        strokeWidth={2.5}
      />
    </div>


    {/* TITLE */}

    <div className="min-w-0 flex-1">

      <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
        Reject Appointment
      </h2>

      <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
        Please provide a reason for rejecting this appointment.
      </p>

    </div>


    {/* CLOSE BUTTON */}

    <button
      type="button"
      onClick={() => {
        setShowRejectModal(false)
        setSelectedAppointment(null)
        setRejectionReason("")
      }}
      className="
        flex
        h-9
        w-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        text-slate-400
        shadow-sm
        transition-all
        duration-200
        hover:scale-110
        hover:border-red-200
        hover:bg-red-50
        hover:text-red-600
        hover:shadow-md
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-red-100
      "
      aria-label="Close rejection dialog"
      title="Close"
    >
      <X
        className="h-5 w-5"
        strokeWidth={2.2}
      />
    </button>

  </div>

</div>


                          {/* APPOINTMENT INFORMATION */}

                          <div className="px-4 py-5 sm:px-6">

                            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">

                              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Customer
                              </p>

                              <p className="mt-1 break-words font-extrabold text-slate-900">
                                {selectedAppointment.customer_name ||
                                  "Unknown Customer"}
                              </p>

                              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Service
                              </p>

                              <p className="mt-1 break-words font-bold text-slate-800">
                                {selectedAppointment.service_type ||
                                  "Not specified"}
                              </p>

                              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                                Schedule
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {selectedAppointment.appointment_date ||
                                  "Not specified"}
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">

                                <Clock3 className="h-3.5 w-3.5 shrink-0" />

                                {formatAppointmentTime(
                                  selectedAppointment.appointment_time
                                )}

                              </p>

                            </div>


                            {/* REJECTION REASON */}

                            <label className="mb-2 block text-sm font-bold text-slate-700">
                              Rejection Reason
                            </label>

                            <textarea
                              value={rejectionReason}
                              onChange={(e) =>
                                setRejectionReason(
                                  e.target.value
                                )
                              }
                              placeholder="Enter the reason for rejecting this appointment..."
                              rows={4}
                              className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
                            />


                            {/* NOTICE */}

                            <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3">

                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                              <p className="text-xs font-medium leading-relaxed text-red-800">
                                This appointment will be marked as rejected and the rejection reason will be recorded.
                              </p>

                            </div>


                            {/* BUTTONS */}

                            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:gap-3">

                              <button
                                type="button"
                                onClick={() => {

                                  setShowRejectModal(
                                    false
                                  )

                                  setSelectedAppointment(
                                    null
                                  )

                                  setRejectionReason("")

                                }}
                                className="min-h-[44px] flex-1 rounded-xl bg-slate-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                              >
                                Keep Appointment
                              </button>


                              <button
                                type="button"
                                disabled={
                                  !rejectionReason.trim() ||
                                  isRejecting
                                }
                                onClick={async () => {

                                  if (
                                    !selectedAppointment ||
                                    isRejecting
                                  ) {
                                    return
                                  }

                                  const appointment =
                                    selectedAppointment

                                  const reason =
                                    rejectionReason.trim()

                                  if (!reason) {
                                    return
                                  }

                                  setIsRejecting(
                                    true
                                  )

                                  setShowRejectModal(
                                    false
                                  )

                                  setSelectedAppointment(
                                    null
                                  )

                                  setRejectionReason("")

                                  try {

                                    await updateStatus(
                                      appointment.id,
                                      "cancelled",
                                      reason,
                                      "rejected"
                                    )

                                  } catch (
                                    error
                                  ) {

                                    console.error(
                                      "Rejection failed:",
                                      error
                                    )

                                  } finally {

                                    setIsRejecting(
                                      false
                                    )

                                  }

                                }}
                                className="min-h-[44px] flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-400"
                              >
                                Confirm Rejection
                              </button>

                            </div>

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                  
{/* VEHICLE AI ELIGIBILITY POPUP */}

{showVehicleEligibilityModal && selectedAppointment && (
<div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/70 px-4 py-6">    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

      <div className="border-b border-amber-200 bg-amber-50 px-5 py-4">
       <div className="border-b border-amber-200 bg-amber-50 px-5 py-4">
  <div className="flex flex-wrap items-center gap-2">
    <h2 className="text-lg font-extrabold text-slate-900">
      Vehicle AI Message
    </h2>

    <span className="rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-xs font-extrabold text-amber-700">
      #{selectedAppointment.appointment_number ?? selectedAppointment.id}
    </span>
  </div>

  <p className="mt-1 text-sm text-slate-600">
    Please review the Vehicle AI result before continuing.
  </p>
</div>
      </div>

      <div className="space-y-4 p-5">

        
<div>
  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    AI Result
  </p>

  <p className="mt-1 font-extrabold text-red-600">
    {(
      realtimeVehicleAI[selectedAppointment.id]?.vehicle_eligibility ??
      selectedAppointment.vehicle_eligibility
    ) === "unsure"
      ? "Manual Review Required"
      : "Not Eligible"}
  </p>
</div>


        
<div>
  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    Detected Vehicle
  </p>

  <p className="mt-1 font-semibold text-slate-800">
    {realtimeVehicleAI[selectedAppointment.id]?.vehicle_type ??
      selectedAppointment.vehicle_type ??
      "Not available"}
  </p>
</div>

{/* AI CONFIDENCE */}

<div>
  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    AI Confidence
  </p>

  <p className="mt-1 font-semibold text-slate-800">
    {(() => {
      const confidence =
        realtimeVehicleAI[selectedAppointment.id]
          ?.vehicle_detection_confidence ??
        selectedAppointment.vehicle_detection_confidence;

      if (
        confidence === null ||
        confidence === undefined ||
        confidence === ""
      ) {
        return "Not available";
      }

      const value = Number(confidence);

      if (!Number.isFinite(value)) {
        return "Not available";
      }

      // Supports confidence stored as either 0–1 or 0–100.
      const percentage =
        value >= 0 && value <= 1
          ? value * 100
          : value;

      return `${percentage.toFixed(2)}%`;
    })()}
  </p>
</div>


        
<div>
  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    AI Message
  </p>

  <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
    {realtimeVehicleAI[selectedAppointment.id]?.vehicle_detection_message ??
      selectedAppointment.vehicle_detection_message ??
      "No detailed Vehicle AI message was saved for this appointment."}
  </p>
</div>


        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
  <p className="text-xs leading-relaxed text-amber-800">
    You can continue to the rejection form, or close this and decide
    later. The appointment will not be rejected until you enter a reason
    and confirm rejection.
  </p>
</div>

<div className="flex flex-col gap-2 sm:flex-row">
  <button
  type="button"
  onClick={() => {
    markAiNoticeSeen(selectedAppointment.id);
    setShowVehicleEligibilityModal(false);
  }}
  className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
>
  Close
</button>

<button
  type="button"
  onClick={() => {
    markAiNoticeSeen(selectedAppointment.id);
    setShowVehicleEligibilityModal(false);
    setRejectionReason("");
    setShowRejectModal(true);
  }}
  className="min-h-[46px] w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-700"
>
  OK, Continue to Reject
</button>
</div>

      </div>
    </div>
  </div>
)}


                </div>

              )

            })()}

          </div>

        </div>


        {/* =================================================
            ORANGE BOTTOM PAGINATION
        ================================================= */}

        {/* =================================================
    ORANGE BOTTOM PAGINATION
    MOBILE: 10 DOTS PER GROUP
    DESKTOP: ALL DOTS
================================================= */}

{recentAppointments.length > 1 && (

  <div className="mt-6 flex flex-col items-center justify-center gap-3">

    {/* =================================================
        MOBILE — 10 DOTS PER GROUP
    ================================================= */}

    <div className="flex items-center justify-center gap-1.5 sm:hidden">

      {(() => {
        const dotsPerPage = 10

        const currentPage =
          Math.floor(
            serviceTaskIndex / dotsPerPage
          )

        const pageStart =
          currentPage * dotsPerPage

        const visibleAppointments =
          recentAppointments.slice(
            pageStart,
            pageStart + dotsPerPage
          )

        return visibleAppointments.map(
          (appointment, dotIndex) => {

            const actualIndex =
              pageStart + dotIndex

            return (
              <button
                key={appointment.id}
                type="button"
                onClick={() =>
                  setServiceTaskIndex(
                    actualIndex
                  )
                }
                aria-label={`Go to appointment ${
                  actualIndex + 1
                }`}
                aria-current={
                  serviceTaskIndex === actualIndex
                    ? "true"
                    : undefined
                }
                className={`
                  h-2
                  rounded-full
                  transition-all
                  duration-300

                  ${
                    serviceTaskIndex === actualIndex
                      ? "w-8 bg-orange-500 shadow-sm shadow-orange-200"
                      : "w-2 bg-orange-200 hover:w-4 hover:bg-orange-300"
                  }
                `}
              />
            )
          }
        )
      })()}

    </div>


    {/* =================================================
        TABLET / DESKTOP — ALL DOTS
    ================================================= */}

    <div className="hidden items-center justify-center gap-1.5 sm:flex">

      {recentAppointments.map(
        (appointment, index) => (

          <button
            key={appointment.id}
            type="button"
            onClick={() =>
              setServiceTaskIndex(index)
            }
            aria-label={`Go to appointment ${
              index + 1
            }`}
            aria-current={
              serviceTaskIndex === index
                ? "true"
                : undefined
            }
            className={`
              h-2
              rounded-full
              transition-all
              duration-300

              ${
                serviceTaskIndex === index
                  ? "w-8 bg-orange-500 shadow-sm shadow-orange-200"
                  : "w-2 bg-orange-200 hover:w-4 hover:bg-orange-300"
              }
            `}
          />

        )
      )}

    </div>


    {/* =================================================
        APPOINTMENT COUNTER
    ================================================= */}

    <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-1.5">

      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-orange-600">
        Appointment
      </span>

      <span className="text-xs font-black text-orange-700">
        {serviceTaskIndex + 1}
      </span>

      <span className="text-xs font-bold text-orange-300">
        /
      </span>

      <span className="text-xs font-black text-orange-700">
        {recentAppointments.length}
      </span>

    </div>

  </div>

)}





      </>

    ) : (

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center sm:py-16">

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-200 bg-green-50 text-green-600 shadow-sm sm:h-[68px] sm:w-[68px]">

          <CircleCheck className="h-8 w-8" />

        </div>

        <p className="font-extrabold text-slate-800">
          No service tasks
        </p>

        <p className="mt-1 px-4 text-sm font-medium text-slate-500">
          Customer appointments will appear here.
        </p>

      </div>

    )}

  </div>

</div>






 



        {/* ===================================================
PREMIUM LOW STOCK INVENTORY ALERTS
UI ONLY — NO LOGIC CHANGED
=================================================== */}

<div className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.02]">

{/* TOP ACCENT */}

<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400" />

{/* ===================================================
HEADER
=================================================== */}

<div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-white to-red-50/70 px-4 py-5 sm:px-6 sm:py-6">
{/* DECORATIVE GLOW */}
<div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-red-100/60 blur-2xl" />

<div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  {/* HEADER INFORMATION */}
  <div className="flex min-w-0 items-center gap-3 sm:gap-4">

    {/* HEADER ICON */}
    {/* HEADER ICON */}
<div
  className="
    relative
    flex
    h-12
    w-12
    shrink-0
    cursor-pointer
    items-center
    justify-center
    overflow-hidden
    rounded-2xl
    bg-gradient-to-br
    from-red-500
    via-red-600
    to-rose-700
    text-white
    shadow-[0_8px_22px_rgba(220,38,38,0.28)]
    ring-1
    ring-red-400/30
    transition-all
    duration-300
    hover:scale-110
    hover:shadow-[0_12px_30px_rgba(220,38,38,0.38)]
    active:scale-95
    sm:h-13
    sm:w-13
  "
>
  <div
    className="
      pointer-events-none
      absolute
      -right-3
      -top-3
      h-8
      w-8
      rounded-full
      bg-white/20
      blur-md
    "
  />

  <Package
    className="relative h-5.5 w-5.5 sm:h-6 sm:w-6"
    strokeWidth={2.5}
  />
</div>


    

    {/* TITLE */}
    <div className="min-w-0">

      <div className="flex items-center gap-2">

        <span
          className="
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            bg-red-500
            shadow-[0_0_8px_rgba(239,68,68,0.8)]
          "
        />

        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.16em]
            text-red-500
            sm:text-[10px]
          "
        >
          Inventory Monitoring
        </p>

      </div>

      <h3
        className="
          mt-1
          text-lg
          font-black
          tracking-[-0.025em]
          text-slate-950
          sm:text-xl
        "
      >
        Low Stock Inventory Alerts
      </h3>

      <p
        className="
          mt-1
          text-xs
          font-medium
          leading-relaxed
          text-slate-400
          sm:text-sm
        "
      >
        Items that need to be restocked
      </p>

    </div>

  </div>


  {/* =================================================
      ALERT COUNT
  ================================================= */}

  {lowStockItems.length > 0 && (

    <span
      className="
        inline-flex
        w-fit
        shrink-0
        items-center
        gap-2
        rounded-full
        border
        border-red-200
        bg-red-50
        px-3.5
        py-2
        text-[10px]
        font-black
        uppercase
        tracking-[0.08em]
        text-red-700
        shadow-sm
        sm:px-4
      "
    >

      <span className="relative flex h-2 w-2">

        <span
          className="
            absolute
            inline-flex
            h-full
            w-full
            animate-ping
            rounded-full
            bg-red-400
            opacity-60
          "
        />

        <span
          className="
            relative
            inline-flex
            h-2
            w-2
            rounded-full
            bg-red-500
          "
        />

      </span>

      {lowStockItems.length}{" "}
      {lowStockItems.length === 1
        ? "Alert"
        : "Alerts"}

    </span>

  )}

</div>

</div>

{/* ===================================================
INVENTORY ITEMS
=================================================== */}

<div className="relative p-4 sm:p-6">
{lowStockItems.length > 0 ? (

  <div className="space-y-3">

    {lowStockItems.map((item) => (

      <div
        key={item.id}
        className="
          group
          relative
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-gradient-to-r
          from-slate-50
          to-white
          p-3.5
          shadow-[0_4px_16px_rgba(15,23,42,0.04)]
          transition-all
          duration-300
          hover:-translate-y-[1px]
          hover:border-red-200
          hover:bg-white
          hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]
          sm:p-4
        "
      >

        {/* LEFT STATUS ACCENT */}
        <div
          className={`absolute bottom-0 left-0 top-0 w-1 ${
            Number(item.quantity) === 0
              ? "bg-gradient-to-b from-red-500 to-rose-700"
              : "bg-gradient-to-b from-amber-400 to-orange-500"
          }`}
        />


        <div
          className="
            relative
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:gap-4
          "
        >

          {/* =================================================
              ITEM INFORMATION
          ================================================= */}

          <div className="flex min-w-0 items-center gap-3 sm:gap-4">

            {/* STATUS ICON */}
            <div
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 sm:h-12 sm:w-12 ${
                Number(item.quantity) === 0
                  ? "bg-gradient-to-br from-red-100 to-rose-50 text-red-600 ring-red-200"
                  : "bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-600 ring-amber-200"
              }`}
            >

              <div
                className={`absolute inset-0 rounded-xl opacity-30 blur-lg ${
                  Number(item.quantity) === 0
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
              />

              {Number(item.quantity) === 0 ? (

                <AlertCircle
                  className="relative h-5 w-5 sm:h-5.5 sm:w-5.5"
                  strokeWidth={2.5}
                />

              ) : (

                <AlertTriangle
                  className="relative h-5 w-5 sm:h-5.5 sm:w-5.5"
                  strokeWidth={2.5}
                />

              )}

            </div>


            {/* ITEM DETAILS */}
            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-sm
                  font-black
                  tracking-[-0.01em]
                  text-slate-950
                  sm:text-base
                "
              >
                {item.name}
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  font-medium
                  text-slate-400
                  sm:text-xs
                "
              >
                Remaining Stock:{" "}

                <span
                  className={`font-black ${
                    Number(item.quantity) === 0
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {item.quantity}
                </span>

              </p>

            </div>

          </div>


          {/* =================================================
              STATUS
          ================================================= */}

          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] shadow-sm sm:shrink-0 ${
              Number(item.quantity) === 0
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >

            <span className="relative flex h-2 w-2">

              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${
                  Number(item.quantity) === 0
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
              />

              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  Number(item.quantity) === 0
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />

            </span>

            {Number(item.quantity) === 0
              ? "Out of Stock"
              : "Low Stock"}

          </span>

        </div>

      </div>

    ))}

  </div>

) : (

  /* =================================================
      HEALTHY INVENTORY STATE
  ================================================= */

  <div
    className="
      relative
      overflow-hidden
      rounded-2xl
      border
      border-emerald-100
      bg-gradient-to-br
      from-emerald-50/70
      via-white
      to-green-50/40
      py-10
      text-center
      shadow-sm
      sm:py-12
    "
  >

    {/* DECORATIVE GLOW */}
    <div
      className="
        pointer-events-none
        absolute
        -right-10
        -top-10
        h-28
        w-28
        rounded-full
        bg-emerald-100/50
        blur-2xl
      "
    />

    <div className="relative">

      {/* SUCCESS ICON */}
      <div
        className="
          mx-auto
          mb-4
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-emerald-500
          to-green-600
          text-white
          shadow-[0_8px_22px_rgba(16,185,129,0.25)]
          ring-1
          ring-emerald-400/30
        "
      >

        <CheckCircle2
          className="h-7 w-7"
          strokeWidth={2.5}
        />

      </div>

      <p
        className="
          text-sm
          font-black
          tracking-[-0.01em]
          text-slate-900
          sm:text-base
        "
      >
        Inventory looks good!
      </p>

      <p
        className="
          mx-auto
          mt-1.5
          max-w-md
          text-xs
          font-medium
          leading-relaxed
          text-slate-400
          sm:text-sm
        "
      >
        All inventory items are sufficiently stocked.
      </p>

    </div>

  </div>

)}

</div> </div>



{/* ===================================================
    RECENT INVENTORY ACTIVITY — PREMIUM RESPONSIVE
=================================================== */}

<div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">

  {/* HEADER */}
  <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/70 px-4 py-5 sm:px-6 sm:py-6">

    {/* Decorative glow */}
    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      {/* HEADER INFORMATION */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">

        <div
  className="
    flex
    h-12
    w-12
    shrink-0
    cursor-pointer
    items-center
    justify-center
    rounded-2xl
    bg-gradient-to-br
    from-blue-600
    to-indigo-600
    text-white
    shadow-lg
    shadow-blue-500/20
    transition-all
    duration-300
    hover:scale-110
    hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)]
    active:scale-95
    sm:h-14
    sm:w-14
  "
>
  <Package
    className="h-5 w-5 sm:h-6 sm:w-6"
    strokeWidth={2.2}
  />
</div>


        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-lg font-black tracking-[-0.025em] text-slate-950 sm:text-xl">
              Recent Inventory Activity
            </h3>

          </div>

          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 sm:text-sm">
            Latest inventory stock movements
          </p>

        </div>

      </div>


      {/* ACTIVITY BADGE */}
      {recentInventoryActivity.length > 0 && (

        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-blue-700 shadow-sm">

          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>

          Recent Activity

        </span>

      )}

    </div>

  </div>


  {/* ACTIVITY LIST */}
  <div className="p-3 sm:p-5 lg:p-6">

    {recentInventoryActivity.length > 0 ? (

      <>
        {/* ===================================================
            MOBILE HORIZONTAL CAROUSEL
        =================================================== */}

        <div className="sm:hidden">

          <div
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const container = e.currentTarget;
              const cardWidth =
                container.clientWidth * 0.88 + 12;

              const index = Math.round(
                container.scrollLeft / cardWidth
              );

              setMobileInventoryActivityIndex(
                Math.min(
                  index,
                  Math.min(
                    recentInventoryActivity.length,
                    5
                  ) - 1
                )
              );
            }}
          >

            {recentInventoryActivity
              .slice(0, 5)
              .map((activity) => {

                const theme = getInventoryActionTheme(activity.action);

                return (

                  <div
                    key={activity.id}
                    className="w-[88%] shrink-0 snap-center overflow-hidden rounded-[1.35rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.35)] transition duration-300 active:scale-[0.99]"
                  >

                    {/* TOP ACCENT */}
                    <div className={`mb-4 h-1 w-14 rounded-full ${theme.accent}`} />

                    {/* ITEM HEADER */}
                    <div className="flex items-start gap-3">


<div
  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBox}`}
>
  <theme.Icon className="h-5 w-5" strokeWidth={2.2} />
</div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-[15px] font-black tracking-[-0.01em] text-slate-950">
                          {activity.item_name}
                        </p>

                        <p
                          className={`mt-1 text-sm font-extrabold ${theme.text}`}
                        >
                          {activity.action}{" "}
                          {activity.quantity}
                        </p>

                      </div>

                    </div>


                    {/* PERFORMER */}
                    <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-100 bg-white/80 p-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">

                        <User
                          className="h-3.5 w-3.5"
                          strokeWidth={2}
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-bold text-slate-800">
                          {activity.performer?.name || "Unknown User"}
                        </p>

                        <p className="text-[10px] font-medium capitalize text-slate-400">
                          {activity.performer?.role ||
                            activity.performed_by_role ||
                            "Unknown Role"}
                        </p>

                      </div>

                    </div>


                    {/* PRICE CHANGE */}
                    {activity.action === "Edited" && (

                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50/70 px-3 py-2.5">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Price
                        </span>

                        <span className="text-sm font-black text-slate-900">
                          ₱{Number(
                            activity.old_price || 0
                          ).toLocaleString()}
                        </span>

                        <ArrowRight
                          className="h-3.5 w-3.5 text-blue-500"
                          strokeWidth={2.5}
                        />

                        <span className="text-sm font-black text-blue-600">
                          ₱{Number(
                            activity.new_price || 0
                          ).toLocaleString()}
                        </span>

                      </div>

                    )}


                    {/* TIME */}
                    <div className="mt-4">

                      <p className="flex items-center gap-1.5 text-xs font-bold text-blue-600">

                        <Clock3
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                        />

                        {timeAgo(
                          activity.created_at,
                          currentTime
                        )}

                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-400">

                        {new Date(
                          activity.created_at
                        ).toLocaleString([], {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}

                      </p>

                    </div>


                    {/* STOCK + ACTIONS */}
                    <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 border-t border-slate-100 pt-4">

                      <div>

                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Remaining Stock
                        </p>

                        <p className="mt-0.5 text-xl font-black tracking-tight text-slate-950">
                          {activity.remaining_stock}
                        </p>

                      </div>


                      <div className="grid grid-cols-2 gap-2">

                        {/* VIEW */}
                        <button
                          onClick={() => {
                            console.log(
                              "Selected Inventory Activity:",
                              activity
                            );
                            setSelectedInventoryActivity(activity);
                          }}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-extrabold text-slate-600 shadow-sm transition active:scale-95 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          title="View activity details"
                        >

                          <Eye
                            className="h-4 w-4"
                            strokeWidth={2}
                          />

                          <span>
                            View
                          </span>

                        </button>


                        {/* DELETE */}
                        <button
                          onClick={(e) =>
                            preventDoubleClick(e, () =>
                              deleteInventoryActivity(activity.id)
                            )
                          }
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50/40 px-3 text-[11px] font-extrabold text-red-500 transition active:scale-95 hover:bg-red-50 hover:text-red-700"
                          title="Delete activity"
                        >

                          <Trash2
                            className="h-4 w-4"
                            strokeWidth={2}
                          />

                          <span>
                            Delete
                          </span>

                        </button>

                      </div>

                    </div>

                  </div>

                );

              })}

          </div>


          {/* MOBILE DOT INDICATOR */}
          <div className="mt-4 flex items-center justify-center gap-1.5">

            {recentInventoryActivity
              .slice(0, 5)
              .map((activity, index) => (

                <span
                  key={activity.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === mobileInventoryActivityIndex
                      ? "w-6 bg-blue-600"
                      : "w-1.5 bg-slate-300"
                  }`}
                />

              ))}

          </div>

          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Swipe to view activity
          </p>

        </div>


     {/* ===================================================
    TABLET / DESKTOP — CURRENT 5 ACTIVITIES
    Mobile carousel above remains completely untouched.
=================================================== */}

<div className="hidden sm:block">

  {(() => {

    const activities = recentInventoryActivity.slice(0, 5);

    if (!activities.length) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-500">
            No recent inventory activity.
          </p>
        </div>
      );
    }

    return (

      <div className="space-y-3">

        {activities.map((activity) => {

          const theme = getInventoryActionTheme(activity.action);

          return (

            <div
              key={activity.id}
              className="
                w-full
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-gradient-to-r
                from-white
                to-slate-50/70
                p-4
                shadow-[0_12px_35px_-20px_rgba(15,23,42,0.28)]
                transition-all
                duration-200
                hover:border-slate-300
                hover:shadow-md
                lg:p-5
              "
            >

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="flex min-w-0 items-start gap-4">

                  {/* ACTIVITY ICON */}

                 <div
  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBox}`}
>
  <theme.Icon className="h-5 w-5" strokeWidth={2.2} />
</div>

                  {/* ITEM INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate font-black tracking-[-0.01em] text-slate-950">
                      {activity.item_name}
                    </p>


                    {/* PERFORMER */}

                    <div className="mt-2 flex items-center gap-2">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">

                        <User
                          className="h-3.5 w-3.5"
                          strokeWidth={2}
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-bold text-slate-700">
                          {activity.performer?.name ||
                            "Unknown User"}
                        </p>

                        <p className="text-[11px] font-medium capitalize text-slate-400">
                          {activity.performer?.role ||
                            activity.performed_by_role ||
                            "Unknown Role"}
                        </p>

                      </div>

                    </div>


                    {/* ACTION */}

                    <p
                      className={`mt-2 text-sm font-extrabold ${theme.text}`}
                    >
                      {activity.action}{" "}
                      {activity.quantity}
                    </p>


                    {/* PRICE CHANGE */}

                    {activity.action === "Edited" && (

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        <span className="text-xs font-bold text-slate-400">
                          Price:
                        </span>

                        <span className="text-sm font-black text-slate-900">
                          ₱{Number(
                            activity.old_price || 0
                          ).toLocaleString()}
                        </span>

                        <ArrowRight
                          className="h-3.5 w-3.5 text-blue-500"
                          strokeWidth={2.5}
                        />

                        <span className="text-sm font-black text-blue-600">
                          ₱{Number(
                            activity.new_price || 0
                          ).toLocaleString()}
                        </span>

                      </div>

                    )}


                    {/* TIME */}

                    <div className="mt-2">

                      <p className="flex items-center gap-1.5 text-xs font-bold text-blue-600">

                        <Clock3
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={2}
                        />

                        {timeAgo(
                          activity.created_at,
                          currentTime
                        )}

                      </p>

                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">

                        {new Date(
                          activity.created_at
                        ).toLocaleString([], {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}

                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="flex flex-col gap-2 border-t border-slate-200 pt-3 lg:flex-row lg:items-center lg:justify-end lg:border-t-0 lg:pt-0">

                  {/* REMAINING STOCK */}

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm lg:block lg:min-w-[130px] lg:text-right">

                    <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                      Remaining Stock
                    </p>

                    <p className="text-lg font-black text-slate-950 lg:mt-1">
                      {activity.remaining_stock}
                    </p>

                  </div>


                  {/* BUTTONS */}

                  <div className="grid grid-cols-2 gap-2 lg:flex">

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() => {
                        console.log(
                          "Selected Inventory Activity:",
                          activity
                        );

                        setSelectedInventoryActivity(
                          activity
                        );
                      }}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2.5
                        text-xs
                        font-extrabold
                        text-slate-600
                        shadow-sm
                        transition
                        hover:border-blue-200
                        hover:bg-blue-50
                        hover:text-blue-700
                        active:scale-[0.98]
                      "
                      title="View activity details"
                    >

                      <Eye
                        className="h-4 w-4"
                        strokeWidth={2}
                      />

                      <span>
                        View
                      </span>

                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={(e) =>
                        preventDoubleClick(
                          e,
                          () =>
                            deleteInventoryActivity(
                              activity.id
                            )
                        )
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-red-100
                        bg-red-50/40
                        px-3
                        py-2.5
                        text-xs
                        font-extrabold
                        text-red-500
                        transition
                        hover:bg-red-50
                        hover:text-red-700
                        active:scale-[0.98]
                      "
                      title="Delete activity"
                    >

                      <Trash2
                        className="h-4 w-4"
                        strokeWidth={2}
                      />

                      <span>
                        Delete
                      </span>

                    </button>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    );

  })()}

</div>



      </>

    ) : (

      /* EMPTY STATE */
      <div className="py-12 text-center">

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">

          <Package
            className="h-7 w-7"
            strokeWidth={1.8}
          />

        </div>

        <p className="font-black tracking-[-0.01em] text-slate-800">
          No inventory activity yet
        </p>

        <p className="mx-auto mt-1 max-w-md text-xs font-medium leading-relaxed text-slate-400 sm:text-sm">
          Inventory movements will appear here.
        </p>

      </div>

    )}

  </div>

</div>




{/* ===================================================
    INVENTORY ACTIVITY DETAILS MODAL — PREMIUM
=================================================== */}

{selectedInventoryActivity && (

  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-4">

    <div className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-white/20 bg-white shadow-[0_30px_100px_-25px_rgba(15,23,42,0.55)] sm:max-h-[92vh] sm:rounded-[2rem]">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="relative flex shrink-0 items-center justify-between overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-white to-blue-50/80 px-4 py-4 sm:px-6 sm:py-5">

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex min-w-0 items-center gap-3 sm:gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 sm:h-12 sm:w-12">

            <Package
              className="h-5 w-5 sm:h-6 sm:w-6"
              strokeWidth={2.2}
            />

          </div>

          <div className="min-w-0">

            <h2 className="truncate text-base font-black tracking-[-0.02em] text-slate-950 sm:text-xl">
              Inventory Activity Details
            </h2>

            <p className="mt-0.5 hidden text-xs font-medium text-slate-500 sm:block sm:text-sm">
              Detailed information about this inventory activity
            </p>

          </div>

        </div>


        {/* CLOSE */}

        <button
          onClick={() =>
            setSelectedInventoryActivity(null)
          }
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-90 sm:h-10 sm:w-10"
          title="Close"
          aria-label="Close"
        >

          <X
            className="h-5 w-5"
            strokeWidth={2.2}
          />

        </button>

      </div>


      {/* ===================================================
          SCROLLABLE CONTENT
      =================================================== */}

      <div className="overflow-y-auto bg-gradient-to-b from-slate-50/70 to-white p-3 sm:p-5 lg:p-6">

        {/* ===================================================
            ITEM HEADER / HERO
        =================================================== */}

        <div className={`relative mb-4 overflow-hidden rounded-[1.35rem] border bg-gradient-to-br p-4 text-white shadow-lg sm:mb-5 sm:p-5 ${selectedActivityTheme.hero}`}>

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-indigo-300/10 blur-2xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

              <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${selectedActivityTheme.heroSub}`}>
                Inventory Item
              </p>

              <h3 className="mt-1 break-words text-xl font-black tracking-[-0.025em] text-white sm:text-2xl">
                {selectedInventoryActivity.item_name}
              </h3>

              <p className={`mt-1 text-xs font-medium ${selectedActivityTheme.heroSub}`}>
                Inventory activity record
              </p>

            </div>


            {/* ACTION BADGE */}

            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white shadow-sm backdrop-blur-md">

              <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

              {selectedInventoryActivity.action}

            </span>

          </div>

        </div>


        {/* ===================================================
            DETAILS GRID
        =================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">


          {/* ===================================================
              ACTION
          =================================================== */}

          <div className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Action
                </p>

                <p className="mt-2 text-base font-black tracking-[-0.01em] text-slate-950">
                  {selectedInventoryActivity.action}
                </p>

              </div>

              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${selectedActivityTheme.iconBox}`}>
  <selectedActivityTheme.Icon className="h-4 w-4" strokeWidth={2.2} />
</div>

            </div>

          </div>


          {/* ===================================================
              QUANTITY
          =================================================== */}

          <div className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Quantity
                </p>

                <p className="mt-2 text-base font-black tracking-[-0.01em] text-slate-950">
                  {selectedInventoryActivity.quantity}
                </p>

              </div>

              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${selectedActivityTheme.iconBox}`}>
  <selectedActivityTheme.Icon className="h-4 w-4" strokeWidth={2.2} />
</div>

            </div>

          </div>


          {/* ===================================================
              REMAINING STOCK
          =================================================== */}

          <div className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Remaining Stock
                </p>

                <p className="mt-2 text-xl font-black tracking-[-0.02em] text-slate-950">
                  {selectedInventoryActivity.remaining_stock}
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                <Package
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />

              </div>

            </div>

          </div>


          {/* ===================================================
              PERFORMED BY
          =================================================== */}

          <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:border-violet-200 hover:shadow-md">

            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              Performed By
            </p>

            <div className="mt-3 flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20">

                <User
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-black text-slate-950 sm:text-base">
                  {selectedInventoryActivity.performer?.name ||
                    "Unknown User"}
                </p>

                <p className="mt-0.5 text-xs font-medium capitalize text-slate-400">
                  {selectedInventoryActivity.performer?.role ||
                    selectedInventoryActivity.performed_by_role ||
                    "Unknown Role"}
                </p>

              </div>

            </div>

          </div>


          {/* ===================================================
              PRICE
          =================================================== */}

          <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-sm md:col-span-2">

            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">

                    <span className="text-sm font-black">
                      ₱
                    </span>

                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                    Price
                  </p>

                </div>


                {selectedInventoryActivity.action === "Edited" ? (

                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-base font-black text-slate-900">
                      ₱{Number(
                        selectedInventoryActivity.old_price ?? 0
                      ).toLocaleString()}
                    </span>

                    <ArrowRight
                      className="h-4 w-4 text-blue-500"
                      strokeWidth={2.5}
                    />

                    <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-base font-black text-blue-600">
                      ₱{Number(
                        selectedInventoryActivity.new_price ?? 0
                      ).toLocaleString()}
                    </span>

                  </div>

                ) : (

                  <p className="mt-3 text-xl font-black tracking-[-0.02em] text-slate-950">

                    ₱{Number(
                      selectedInventoryActivity.new_price ??
                      selectedInventoryActivity.old_price ??
                      0
                    ).toLocaleString()}

                  </p>

                )}

              </div>


              <div className="rounded-xl bg-slate-50 px-3 py-2.5 sm:text-right">

                <p className="text-[10px] font-bold leading-relaxed text-slate-400">

                  {selectedInventoryActivity.action === "Edited"
                    ? "Price updated"
                    : "Item price at time of activity"}

                </p>

              </div>

            </div>

          </div>


          {/* ===================================================
              ACTIVITY TIME
          =================================================== */}

          <div className="relative overflow-hidden rounded-[1.25rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm md:col-span-2 sm:p-5">

            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative flex items-start gap-3 sm:items-center sm:gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-md shadow-blue-500/10">

                <Clock3
                  className="h-5 w-5"
                  strokeWidth={2.2}
                />

              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Activity Time
                </p>

                {/* JUST NOW / MINUTES AGO */}

                <p className="mt-1 text-base font-black text-blue-600">
                  {timeAgo(
                    selectedInventoryActivity.created_at,
                    currentTime
                  )}
                </p>

                {/* EXACT DATE */}

                <p className="mt-0.5 break-words text-xs font-medium text-slate-500">

                  {new Date(
                    selectedInventoryActivity.created_at
                  ).toLocaleString([], {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}

                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-3 py-3 sm:px-6 sm:py-4">

        <p className="hidden text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:block">
          Inventory Activity Record
        </p>

        <button
          onClick={() =>
            setSelectedInventoryActivity(null)
          }
          className="w-full rounded-xl bg-gradient-to-r from-slate-950 to-slate-800 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:from-slate-800 hover:to-slate-700 active:scale-[0.98] sm:w-auto"
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

      </div>

    {/* =====================================================
    FLOATING APPOINTMENT MESSAGING
    Premium Responsive
===================================================== */}

<button
  type="button"
  onClick={() => {
    // Open the first conversation that has unread messages
    const unreadAppointment = recentAppointments.find((appointment) => {
      const conversationId = adminConversationMap?.[appointment.id]
      return (
        conversationId &&
        Number(adminUnreadCounts?.[conversationId] || 0) > 0
      )
    })

    if (unreadAppointment) {
      openAppointmentConversation(unreadAppointment)
    } else {
      setShowMessaging(true)
    }
  }}
  className="
    fixed
    bottom-20
    right-3
    z-50
    flex
    h-14
    w-14
    items-center
    justify-center
    rounded-2xl
    border
    border-white/20
    bg-gradient-to-br
    from-red-500
    via-red-600
    to-rose-700
    text-white
    shadow-[0_12px_35px_-8px_rgba(220,38,38,0.65)]
    transition
    duration-300
    hover:-translate-y-1
    hover:scale-105
    hover:shadow-[0_18px_40px_-8px_rgba(220,38,38,0.75)]
    active:scale-95
    focus:outline-none
    focus:ring-4
    focus:ring-red-200/70
    sm:bottom-24
    sm:right-6
    sm:h-16
    sm:w-16
    sm:rounded-[1.25rem]
  "
  aria-label={
    totalAdminUnread > 0
      ? `Open appointment messages, ${totalAdminUnread} unread`
      : "Open appointment messages"
  }
>
  <span className="absolute inset-0 rounded-2xl bg-white/10" />

  <MessageCircle
    className="relative h-6 w-6 sm:h-7 sm:w-7"
    strokeWidth={2.2}
  />

  {totalAdminUnread > 0 && (
    <span
      className="
        absolute
        -right-2
        -top-2
        z-10
        flex
        h-6
        min-w-6
        animate-bounce
        items-center
        justify-center
        rounded-full
        border-2
        border-white
        bg-amber-400
        px-1.5
        text-[10px]
        font-black
        leading-none
        text-red-950
        shadow-lg
      "
    >
      {totalAdminUnread > 99 ? "99+" : totalAdminUnread}
    </span>
  )}
</button>



{/* =====================================================
    MESSAGING MODAL
===================================================== */}

{showMessaging && (

  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-end
      justify-center
      bg-slate-950/65
      p-0
      backdrop-blur-sm
      sm:items-end
      sm:justify-end
      sm:p-4
      md:p-6
    "
    onClick={() => {
      setShowMessaging(false)
    }}
  >

    <div
      className="
        mb-0
        flex
        h-[100dvh]
        max-h-[100dvh]
        w-full
        flex-col
        overflow-hidden
        rounded-none
        border
        border-white/20
        bg-white
        shadow-[0_30px_100px_-25px_rgba(15,23,42,0.55)]
        sm:mb-16
        sm:h-[min(680px,calc(100dvh-5rem))]
        sm:max-h-[720px]
        sm:w-full
        sm:max-w-md
        sm:rounded-[1.75rem]
        md:max-w-lg
      "
      onClick={(e) => {
        e.stopPropagation()
      }}
    >

{/* =====================================================
    FLOATING BACK BUTTON
    BELOW MAIN HEADER - UPPER LEFT
===================================================== */}
<button
  type="button"
  onClick={() => {
    setShowMessaging(false)
  }}
  aria-label="Back"
  title="Back"
  className="
    fixed
    left-4
    top-[76px]
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
    sm:top-[76px]
    md:left-6
  "
>
  <ArrowLeft size={20} strokeWidth={2.5} />
</button>
      

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          relative
          flex
          shrink-0
          items-center
          justify-between
          overflow-hidden
          border-b
          border-slate-100
          bg-gradient-to-br
          from-white
          via-white
          to-red-50
          px-4
          py-3.5
          sm:px-5
          sm:py-4
        "
      >

        {/* Decorative glow */}

        <div className="
          pointer-events-none
          absolute
          -right-12
          -top-16
          h-36
          w-36
          rounded-full
          bg-red-500/10
          blur-3xl
        " />

        <div className="relative flex min-w-0 items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-red-500
              to-rose-700
              text-white
              shadow-lg
              shadow-red-500/20
            "
          >

            <MessageCircle
              className="h-5 w-5"
              strokeWidth={2.2}
            />

          </div>

          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h3 className="
                truncate
                text-base
                font-black
                tracking-[-0.02em]
                text-slate-950
                sm:text-lg
              ">
                Messages
              </h3>

              <span className="
                hidden
                rounded-full
                bg-red-50
                px-2
                py-0.5
                text-[9px]
                font-black
                uppercase
                tracking-wider
                text-red-600
                sm:inline-flex
              ">
                Support
              </span>

            </div>

            <p className="
              truncate
              text-[11px]
              font-medium
              text-slate-500
              sm:text-xs
            ">
              Appointment conversations
            </p>

          </div>

        </div>


        {/* CLOSE */}

        <button
          type="button"
          onClick={() => {
            setShowMessaging(false)
          }}
          className="
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
            bg-white
            text-slate-400
            shadow-sm
            transition
            duration-200
            hover:border-slate-300
            hover:bg-slate-50
            hover:text-slate-700
            active:scale-90
          "
          aria-label="Close messages"
        >

          <X
            className="h-5 w-5"
            strokeWidth={2.2}
          />

        </button>

      </div>

      



      {/* =================================================
          WARRANTY STATUS
      ================================================= */}

      {activeConversation && warrantyEndsAt && (

        <div className="
          shrink-0
          border-b
          border-red-100
          bg-gradient-to-r
          from-red-50
          via-rose-50
          to-white
          px-3
          py-2.5
          sm:px-4
        ">

          <div className="flex items-center gap-3">

            <div className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              text-red-600
              shadow-sm
            ">

              <ShieldCheck
                className="h-5 w-5"
                strokeWidth={2.2}
              />

            </div>

            <div className="min-w-0">

              <p className="
                text-[11px]
                font-black
                uppercase
                tracking-wider
                text-red-700
              ">
                3-Day Service Warranty
              </p>

              <p className="
                truncate
                text-[10px]
                font-medium
                text-red-500
                sm:text-[11px]
              ">

                Messaging available until{" "}

                {new Date(
                  warrantyEndsAt
                ).toLocaleString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}

              </p>

            </div>

          </div>

        </div>

      )}



      {/* =================================================
          CONVERSATION AREA
      ================================================= */}

      <div
  ref={messagesContainerRef}
  className="
    min-h-0
    flex-1
    overflow-y-auto
    overscroll-contain
    bg-gradient-to-b
    from-slate-50
    via-slate-50
    to-white
    p-3
    sm:p-4
  "
>

        {!activeConversation ? (

          /* =================================================
              NO CONVERSATION SELECTED
          ================================================= */

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              px-4
              text-center
            "
          >

            <div>

              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-red-50
                  to-rose-100
                  text-red-500
                  shadow-sm
                "
              >

                <MessageCircle
                  className="h-8 w-8"
                  strokeWidth={1.8}
                />

              </div>

              <p className="
                text-sm
                font-black
                tracking-[-0.01em]
                text-slate-800
              ">
                No conversation selected
              </p>

              <p className="
                mx-auto
                mt-1
                max-w-[250px]
                text-xs
                font-medium
                leading-relaxed
                text-slate-400
              ">
                Select an appointment to view messages.
              </p>

            </div>

            

          </div>

        ) : (

          <div className="space-y-3">

            {conversationMessages.length === 0 ? (

              /* =================================================
                  EMPTY CONVERSATION
              ================================================= */

              <div
                className="
                  flex
                  min-h-[350px]
                  items-center
                  justify-center
                  px-4
                  text-center
                  sm:min-h-[400px]
                "
              >

                <div>

                  <div className="
                    mx-auto
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-50
                    text-red-500
                  ">

                    <MessageCircle
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />

                  </div>

                  <p className="
                    text-sm
                    font-black
                    text-slate-800
                  ">
                    Start the conversation
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    font-medium
                    leading-relaxed
                    text-slate-400
                    sm:text-sm
                  ">
                    Send a message about this appointment.
                  </p>

                </div>

              </div>

            ) : (

              conversationMessages.map((msg) => {

                const isMine =
                  msg.sender_id === currentAuthUserId

                const senderProfile =
                  senderProfilesMap[msg.sender_id]

                // Find the message this message is replying to
                const repliedMessage =
                  msg.reply_to_message_id
                    ? conversationMessages.find(
                        (originalMessage) =>
                          originalMessage.id ===
                          msg.reply_to_message_id
                      )
                    : null

                // Find the sender of the replied message
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
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`
                        flex
                        max-w-[94%]
                        items-end
                        gap-2
                        sm:max-w-[88%]
                        ${isMine ? "flex-row-reverse" : "flex-row"}
                      `}
                    >

                      {/* =================================================
                          AVATAR + ONLINE STATUS
                      ================================================= */}

                      <div className="relative h-8 w-8 shrink-0">

                        {/* AVATAR */}

                        <div
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            border-2
                            border-white
                            bg-gradient-to-br
                            from-slate-100
                            to-slate-200
                            text-[11px]
                            font-black
                            text-slate-500
                            shadow-sm
                          "
                        >

                          {senderProfile?.avatar_url ? (

                            <img
                              src={senderProfile.avatar_url}
                              alt={
                                senderProfile?.name ||
                                "User"
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />

                          ) : (

                            <span>
                              {(
                                senderProfile?.name ||
                                "U"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </span>

                          )}

                        </div>


                        {/* ONLINE / OFFLINE INDICATOR */}

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
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }
                          `}
                          title={
                            isUserOnline(
                              senderProfile?.last_seen
                            )
                              ? "Online"
                              : "Offline"
                          }
                        />

                      </div>



                      {/* =================================================
                          MESSAGE CONTENT
                      ================================================= */}

                      <div
                        className={`
                          min-w-0
                          ${isMine ? "text-right" : "text-left"}
                        `}
                      >

                        {/* SENDER NAME */}

                        <div
                          className="
                            mb-1
                            px-1
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >

                          {senderProfile?.name ||
                            "Unknown User"}

                          {senderProfile?.role && (

                            <span className="
                              ml-1
                              font-medium
                              normal-case
                              tracking-normal
                              text-slate-400
                            ">
                              · {senderProfile.role}
                            </span>

                          )}

                        </div>



                        {/* =================================================
                            MESSAGE BUBBLE
                        ================================================= */}

                        <div
                          className={`
                            break-words
                            rounded-[1.15rem]
                            px-3.5
                            py-2.5
                            text-[13px]
                            font-medium
                            leading-relaxed
                            shadow-sm
                            sm:px-4
                            sm:text-sm
                            ${
                              isMine
                                ? "rounded-br-md bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white shadow-red-500/10"
                                : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-slate-200/60"
                            }
                          `}
                        >

                          {/* =================================================
                              REPLIED MESSAGE PREVIEW
                          ================================================= */}

                          {repliedMessage && (

                            <div
                              className={`
                                mb-2
                                overflow-hidden
                                rounded-xl
                                border-l-[3px]
                                px-3
                                py-2
                                text-left
                                ${
                                  isMine
                                    ? "border-red-200 bg-white/15"
                                    : "border-red-500 bg-slate-50"
                                }
                              `}
                            >

                              {/* REPLY LABEL */}

                              <div
                                className={`
                                  mb-1
                                  flex
                                  items-center
                                  gap-1
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-wider
                                  ${
                                    isMine
                                      ? "text-red-100"
                                      : "text-red-600"
                                  }
                                `}
                              >

                                <Reply
                                  className="h-3 w-3"
                                  strokeWidth={2}
                                />

                                <span>
                                  Reply to{" "}
                                  {repliedSenderProfile?.name ||
                                    "Unknown User"}
                                </span>

                              </div>


                              {/* ORIGINAL MESSAGE */}

                              <div
                                className={`
                                  line-clamp-2
                                  text-[11px]
                                  leading-relaxed
                                  ${
                                    repliedMessage.deleted_at
                                      ? "italic opacity-70"
                                      : isMine
                                        ? "text-red-50"
                                        : "text-slate-500"
                                  }
                                `}
                              >

                                {repliedMessage.deleted_at
                                  ? "This message was deleted"
                                  : repliedMessage.message}

                              </div>

                            </div>

                          )}



                          {/* CURRENT MESSAGE */}

                          <div
                            className={
                              msg.deleted_at
                                ? "italic opacity-70"
                                : ""
                            }
                          >

                            {msg.deleted_at
                              ? "This message was deleted"
                              : msg.message}

                          </div>

                        </div>



                        {/* =================================================
                            TIMESTAMP
                        ================================================= */}

                        <div
                          className="
                            mt-1
                            px-1
                            text-[9px]
                            font-medium
                            text-slate-400
                          "
                        >

                          {msg.created_at
                            ? new Date(
                                msg.created_at
                              ).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )
                            : ""}

                        </div>



                        {/* =================================================
                            MESSAGE ACTIONS
                        ================================================= */}

                        <div
                          className={`
                            mt-1
                            flex
                            items-center
                            gap-2
                            px-1
                            ${
                              isMine
                                ? "justify-end"
                                : "justify-start"
                            }
                          `}
                        >

                          {/* REPLY */}

                          <button
                            type="button"
                            onClick={() => {
                              setReplyingToMessage(msg)
                            }}
                            className="
                              inline-flex
                              items-center
                              gap-1
                              rounded-md
                              px-1
                              py-0.5
                              text-[10px]
                              font-bold
                              text-slate-400
                              transition
                              hover:bg-red-50
                              hover:text-red-600
                            "
                          >

                            <Reply
                              className="h-3.5 w-3.5"
                              strokeWidth={2}
                            />

                            <span>
                              Reply
                            </span>

                          </button>


                          {/* DELETE FOR EVERYONE */}

                          {isMine && !msg.deleted_at && (

                            <button
                              type="button"
                              onClick={async () => {

                                const confirmed =
                                  window.confirm(
                                    "Delete this message for everyone?"
                                  )

                                if (!confirmed) {
                                  return
                                }

                                const {
                                  data: deletedMessage,
                                  error: deleteError,
                                } = await supabase.rpc(
                                  "delete_conversation_message",
                                  {
                                    p_message_id: msg.id,
                                  }
                                )

                                if (deleteError) {

                                  console.error(
                                    "Message deletion failed:",
                                    deleteError
                                  )

                                  alert(
                                    `Failed to delete message: ${deleteError.message}`
                                  )

                                  return
                                }

                                console.log(
                                  "Message deleted for everyone:",
                                  deletedMessage
                                )

                                // Update the message locally

                                setConversationMessages(
                                  (currentMessages) =>
                                    currentMessages.map(
                                      (currentMessage) =>
                                        currentMessage.id === msg.id
                                          ? deletedMessage
                                          : currentMessage
                                    )
                                )

                              }}
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-md
                                px-1
                                py-0.5
                                text-[10px]
                                font-bold
                                text-slate-400
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >

                              <Trash2
                                className="h-3.5 w-3.5"
                                strokeWidth={2}
                              />

                              <span>
                                Delete
                              </span>

                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                )

              })

            )}

          </div>

        )}

      </div>



      {/* =================================================
          MESSAGE INPUT / WARRANTY STATUS
      ================================================= */}

      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          p-3
          pb-[max(0.75rem,env(safe-area-inset-bottom))]
          sm:p-3
        "
      >

        {messagingAllowed ? (

          <div>

            {/* =================================================
                REPLY PREVIEW
            ================================================= */}

            {replyingToMessage && (

              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-2
                  rounded-xl
                  border
                  border-red-100
                  bg-gradient-to-r
                  from-red-50
                  to-rose-50
                  px-3
                  py-2
                "
              >

                <div className="min-w-0">

                  <div
                    className="
                      flex
                      items-center
                      gap-1
                      text-[10px]
                      font-black
                      uppercase
                      tracking-wider
                      text-red-600
                    "
                  >

                    <Reply
                      className="h-3 w-3"
                      strokeWidth={2}
                    />

                    Replying to

                  </div>

                  <div
                    className="
                      truncate
                      text-[11px]
                      font-medium
                      text-slate-600
                    "
                  >

                    {senderProfilesMap[
                      replyingToMessage.sender_id
                    ]?.name || "Unknown User"}

                    {" · "}

                    {replyingToMessage.message}

                  </div>

                </div>


                {/* CANCEL REPLY */}

                <button
                  type="button"
                  onClick={() => {
                    setReplyingToMessage(null)
                  }}
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-white
                    hover:text-slate-700
                    active:scale-90
                  "
                  aria-label="Cancel reply"
                >

                  <X
                    className="h-4 w-4"
                    strokeWidth={2}
                  />

                </button>

              </div>

            )}



            {/* =================================================
    MESSAGE INPUT
================================================= */}

<div
  className="
    flex
    items-center
    gap-2
    rounded-2xl
    border
    border-slate-200
    bg-slate-50
    p-1.5
    shadow-inner
  "
>

  {/* SEND BUTTON - LEFT */}

  <button
    type="button"
    onClick={() => {
      sendConversationMessage()
    }}
    className="
      order-first
      flex
      h-10
      w-10
      shrink-0
      items-center
      justify-center
      rounded-xl
      bg-gradient-to-br
      from-red-500
      to-rose-700
      text-white
      shadow-md
      shadow-red-500/20
      transition
      hover:from-red-600
      hover:to-rose-800
      active:scale-90
      disabled:cursor-not-allowed
      disabled:opacity-50
    "
    aria-label="Send message"
  >
    <Send
      className="h-4 w-4"
      strokeWidth={2.2}
    />
  </button>


  {/* MESSAGE INPUT */}

  <input
    type="text"
    value={chatMessage}
    onChange={(e) => {
      setChatMessage(e.target.value)
    }}
    onKeyDown={(e) => {

      if (e.key === "Enter") {
        e.preventDefault()
        sendConversationMessage()
      }

    }}
    placeholder="Type a message..."
    className="
      h-10
      min-w-0
      flex-1
      bg-transparent
      px-2.5
      text-sm
      font-medium
      text-slate-800
      outline-none
      placeholder:text-slate-400
      sm:px-3
    "
  />

</div>
            </div>

          

        ) : (

          /* =================================================
              WARRANTY EXPIRED
          ================================================= */

          <div
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-3
              py-3
              text-center
            "
          >

            <div className="flex items-center justify-center gap-2">

              <div className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-white
                text-slate-500
                shadow-sm
              ">

                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={2}
                />

              </div>

              <div
                className="
                  text-xs
                  font-black
                  text-slate-700
                  sm:text-sm
                "
              >
                Warranty messaging period ended
              </div>

            </div>

            <div
              className="
                mt-1
                text-[10px]
                font-medium
                text-slate-400
                sm:text-xs
              "
            >
              This conversation is now closed.
            </div>

          </div>

        )}

      </div>

    </div>

  </div>

)}




      


     {/* =========================================================
    MODERATION MODAL — PREMIUM RESPONSIVE
========================================================= */}

{showModerationModal &&
  selectedModerationUser && (

    <div className="
      fixed
      inset-0
      z-50
      flex
      items-end
      justify-center
      bg-slate-950/70
      p-0
      backdrop-blur-sm
      sm:items-center
      sm:p-4
    ">

      <div className="
        relative
        flex
        max-h-[100dvh]
        w-full
        flex-col
        overflow-hidden
        rounded-t-[1.75rem]
        border
        border-white/20
        bg-white
        shadow-[0_30px_100px_-25px_rgba(15,23,42,0.6)]
        sm:max-h-[92vh]
        sm:max-w-lg
        sm:rounded-[1.75rem]
      ">


        {/* =====================================================
            TOP ACCENT
        ===================================================== */}

        <div
          className={`
            h-1.5
            w-full
            shrink-0
            ${
              moderationAction === "ban"
                ? "bg-gradient-to-r from-red-500 via-rose-600 to-red-700"
                : "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500"
            }
          `}
        />


        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="
          relative
          flex
          shrink-0
          items-center
          justify-between
          overflow-hidden
          border-b
          border-slate-100
          bg-gradient-to-br
          from-white
          via-white
          to-slate-50
          px-4
          py-4
          sm:px-6
          sm:py-5
        ">

          {/* Decorative glow */}

          <div
            className={`
              pointer-events-none
              absolute
              -right-12
              -top-16
              h-36
              w-36
              rounded-full
              blur-3xl
              ${
                moderationAction === "ban"
                  ? "bg-red-500/10"
                  : "bg-amber-400/10"
              }
            `}
          />


          <div className="relative flex min-w-0 items-center gap-3">

            {/* ACTION ICON */}

            <div
              className={`
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                text-white
                shadow-lg
                sm:h-12
                sm:w-12
                ${
                  moderationAction === "ban"
                    ? "bg-gradient-to-br from-red-500 to-rose-700 shadow-red-500/20"
                    : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20"
                }
              `}
            >

              {moderationAction === "ban" ? (
                <ShieldAlert
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  strokeWidth={2.2}
                />
              ) : (
                <AlertTriangle
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  strokeWidth={2.2}
                />
              )}

            </div>


            {/* TITLE */}

            <div className="min-w-0">

              <h2 className="
                truncate
                text-base
                font-black
                tracking-[-0.02em]
                text-slate-950
                sm:text-xl
              ">

                {moderationAction === "warning"
                  ? "Issue Warning"
                  : "Ban Account"}

              </h2>

              <p className="
                mt-0.5
                truncate
                text-xs
                font-medium
                text-slate-500
                sm:text-sm
              ">
                {selectedModerationUser.name}
              </p>

            </div>

          </div>


          {/* CLOSE */}

          <button
            onClick={() => {
              setShowModerationModal(false)
              setSelectedModerationUser(null)
            }}
            className="
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
              bg-white
              text-slate-400
              shadow-sm
              transition
              duration-200
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-slate-700
              active:scale-90
            "
            aria-label="Close moderation modal"
          >

            <X
              size={20}
              strokeWidth={2.2}
            />

          </button>

        </div>



        {/* =====================================================
            SCROLLABLE CONTENT
        ===================================================== */}

        <div className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          bg-gradient-to-b
          from-slate-50/70
          to-white
          p-3
          sm:p-5
          lg:p-6
        ">


          {/* =====================================================
              CURRENT STATUS
          ===================================================== */}

          <div className="
            mb-5
            overflow-hidden
            rounded-[1.25rem]
            border
            border-slate-200
            bg-white
            shadow-sm
          ">

            <div className="
              flex
              items-center
              gap-3
              border-b
              border-slate-100
              bg-slate-50/80
              px-4
              py-3
            ">

              <div className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-blue-50
                text-blue-600
              ">

                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />

              </div>

              <div>

                <p className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.13em]
                  text-slate-400
                ">
                  Account Overview
                </p>

                <p className="
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  Current moderation status
                </p>

              </div>

            </div>


            <div className="
              grid
              grid-cols-1
              gap-3
              p-4
              sm:grid-cols-2
            ">


              {/* STATUS */}

              <div className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                p-3
              ">

                <div className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  Current Status
                </div>

                <div className="
                  mt-2
                  inline-flex
                  max-w-full
                  items-center
                  rounded-full
                  bg-white
                  px-3
                  py-1.5
                  text-sm
                  font-black
                  capitalize
                  text-slate-900
                  shadow-sm
                ">
                  {selectedModerationUser.moderation_status}
                </div>

              </div>


              {/* WARNINGS */}

              <div className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                p-3
              ">

                <div className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-wider
                  text-slate-400
                ">
                  Warning Count
                </div>

                <div className="
                  mt-2
                  flex
                  items-center
                  gap-2
                ">

                  <span className="
                    text-xl
                    font-black
                    tracking-tight
                    text-slate-950
                  ">
                    {selectedModerationUser.warning_count}
                  </span>

                  <span className="
                    text-sm
                    font-bold
                    text-slate-400
                  ">
                    / 3
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
    PREVIOUS 3/3 VIOLATION NOTICE
===================================================== */}

{selectedModerationUser.warning_count >= 3 && (
  <div className="
    mb-5
    rounded-[1.25rem]
    border
    border-red-200
    bg-gradient-to-r
    from-red-50
    via-rose-50
    to-red-50
    p-4
    shadow-sm
  ">

    <div className="flex items-start gap-3">

      <div className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-red-100
        text-red-600
      ">
        <ShieldAlert
          className="h-5 w-5"
          strokeWidth={2.2}
        />
      </div>

      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <p className="
            text-sm
            font-black
            text-red-800
          ">
            Previous 3/3 Violations
          </p>

          <span className="
            rounded-full
            bg-red-600
            px-2.5
            py-1
            text-[10px]
            font-black
            text-white
          ">
            3 / 3
          </span>

        </div>

        <p className="
          mt-1
          text-xs
          font-medium
          leading-5
          text-red-700
        ">
          This customer has already reached the maximum of 3
          warnings in their moderation history.
        </p>

        <div className="
          mt-3
          rounded-xl
          border
          border-red-200
          bg-white/70
          p-3
        ">

          <p className="
            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-red-500
          ">
            Important
          </p>

          <p className="
            mt-1
            text-xs
            font-semibold
            leading-5
            text-slate-700
          ">
            This account was previously banned after receiving
            3 warnings. If the account was unbanned, issuing
            another warning will count as another violation and
            may cause the account to be banned again.
          </p>

        </div>

      </div>

    </div>

  </div>
)}




          {/* =====================================================
              ACTION NOTICE
          ===================================================== */}

          <div
            className={`
              mb-5
              rounded-[1.25rem]
              border
              p-4
              ${
                moderationAction === "ban"
                  ? "border-red-100 bg-gradient-to-r from-red-50 to-rose-50"
                  : "border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50"
              }
            `}
          >

            <div className="flex items-start gap-3">

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  shadow-sm
                  ${
                    moderationAction === "ban"
                      ? "text-red-600"
                      : "text-amber-600"
                  }
                `}
              >

                {moderationAction === "ban" ? (
                  <ShieldAlert
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />
                ) : (
                  <AlertTriangle
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />
                )}

              </div>

              <div className="min-w-0">

                <p
                  className={`
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                    ${
                      moderationAction === "ban"
                        ? "text-red-700"
                        : "text-amber-700"
                    }
                  `}
                >

                  {moderationAction === "warning"
                    ? "Warning Action"
                    : "Account Ban"}

                </p>

                <p className="
                  mt-1
                  text-[11px]
                  font-medium
                  leading-relaxed
                  text-slate-500
                ">

                  {moderationAction === "warning"
                    ? "This action will issue a moderation warning to this account."
                    : "This action will restrict this account from accessing the system."}

                </p>

              </div>

            </div>

          </div>



          {/* =====================================================
              REASON
          ===================================================== */}

          <div className="mb-4">

            <label className="
              mb-2
              flex
              items-center
              justify-between
              gap-2
            ">

              <span className="
                text-xs
                font-black
                uppercase
                tracking-wider
                text-slate-700
              ">
                Reason
              </span>

              <span className="
                text-[10px]
                font-medium
                text-slate-400
              ">
                Required
              </span>

            </label>

            <textarea
              value={moderationReason}
              onChange={(e) =>
                setModerationReason(e.target.value)
              }
              rows={4}
              placeholder="Enter the reason for this action..."
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-3.5
                text-sm
                font-medium
                leading-relaxed
                text-slate-800
                shadow-sm
                outline-none
                transition
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>



          {/* =====================================================
              ADMIN NOTES
          ===================================================== */}

          <div className="mb-5 sm:mb-6">

            <label className="
              mb-2
              flex
              items-center
              justify-between
              gap-2
            ">

              <span className="
                text-xs
                font-black
                uppercase
                tracking-wider
                text-slate-700
              ">
                Admin Notes
              </span>

              <span className="
                text-[10px]
                font-medium
                text-slate-400
              ">
                Optional
              </span>

            </label>

            <textarea
              value={moderationNotes}
              onChange={(e) =>
                setModerationNotes(e.target.value)
              }
              rows={3}
              placeholder="Optional internal notes..."
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-3.5
                text-sm
                font-medium
                leading-relaxed
                text-slate-800
                shadow-sm
                outline-none
                transition
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>

        </div>



        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="
          shrink-0
          border-t
          border-slate-100
          bg-white
          px-3
          py-3
          pb-[max(0.75rem,env(safe-area-inset-bottom))]
          sm:px-6
          sm:py-4
        ">

          <div className="
            flex
            flex-col-reverse
            gap-2
            sm:flex-row
            sm:justify-end
            sm:gap-3
          ">


            {/* CANCEL */}

            <button
              onClick={() => {
                setShowModerationModal(false)
                setSelectedModerationUser(null)
              }}
              disabled={moderationSubmitting}
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-100
                px-5
                text-sm
                font-black
                text-slate-600
                transition
                hover:bg-slate-200
                hover:text-slate-800
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
              "
            >
              Cancel
            </button>


            {/* PRIMARY ACTION */}

            <button
              onClick={submitModerationAction}
              disabled={
                moderationSubmitting ||
                !moderationReason.trim()
              }
              className={`
                h-11
                w-full
                rounded-xl
                px-6
                text-sm
                font-black
                text-white
                shadow-lg
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:w-auto
                ${
                  moderationAction === "ban"
                    ? "bg-gradient-to-r from-red-500 via-red-600 to-rose-700 shadow-red-500/20 hover:from-red-600 hover:via-red-700 hover:to-rose-800"
                    : "bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 shadow-amber-500/20 hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600"
                }
              `}
            >

              {moderationSubmitting
                ? "Processing..."
                : moderationAction === "warning"
                  ? "Issue Warning"
                  : "Ban Account"}

            </button>

          </div>

        </div>

      </div>

    </div>

)}



    


    </div>
  )
}
