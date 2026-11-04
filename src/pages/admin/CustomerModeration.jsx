import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  FaSearch,
  FaUserShield,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBan,
  FaHistory,
  FaTimes,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaShieldAlt,
  FaUnlock,
  FaUserCheck,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUsers,
  FaUserCog,
  FaUserTie,
  FaUserPlus,
  FaUserClock,
  FaUserSlash,
  FaPowerOff,
  FaEye,
  FaClock,
  FaInfoCircle,
  FaFileSignature,
  FaBirthdayCake,
  FaVenusMars,
  FaIdBadge,
  FaChevronLeft,
  FaChevronRight,
  FaWrench,
  FaTrash,
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'


/* =========================================================
   CUSTOMER / USER ACCOUNT MANAGEMENT
========================================================= */

export default function CustomerModeration() {
  const navigate = useNavigate()
  const ATTACHMENT_BUCKET = 'service-task-attachments'

  // =========================================================
  // DATA
  // =========================================================

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  // =========================================================
  // SELECTED USER
  // =========================================================

  const [selectedCustomer, setSelectedCustomer] = useState(null)

  // =========================================================
  // MODALS
  // =========================================================

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showUnbanModal, setShowUnbanModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  // =========================================================
  // MODERATION
  // =========================================================

  const [processing, setProcessing] = useState(false)
  const [reason, setReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  // =========================================================
  // HISTORY
  // =========================================================

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadCustomers = async () => {
    try {
      setLoading(true)

      // =======================================================
      // LOAD ALL USERS
      // =======================================================

      const {
        data: users,
        error: usersError,
      } = await supabase
        .from('users')
        .select(`
          id,
          name,
          username,
          email,
          phone,
          role,
          created_at,
          avatar_url,
          avatar_uploaded_at,
          cover_url,
          cover_type,
          registration_avatar_path,
          bio,
          birthday,
          gender,
          address,
          last_seen,
          booking_agreement_version,
          booking_agreement_accepted_at,
          is_active,
deactivated_at
        `)
        .order('created_at', {
          ascending: false,
        })

      if (usersError) {
        throw usersError
      }

      if (!users || users.length === 0) {
        setCustomers([])
        return
      }

      const userIds = users.map(
        (user) => user.id
      )

      // =======================================================
      // LOAD MODERATION DATA
      // =======================================================

      const {
        data: moderations,
        error: moderationError,
      } = await supabase
        .from('account_moderations')
        .select(`
          user_id,
          status,
          warning_count,
          reason,
          banned_at,
          banned_by,
          updated_at
        `)
        .in('user_id', userIds)

      if (moderationError) {
        throw moderationError
      }

      // =======================================================
      // LOAD APPOINTMENTS
      // =======================================================

      const {
        data: appointments,
        error: appointmentError,
      } = await supabase
        .from('appointments')
        .select(`
          id,
          customer_id,
          status,
          technician_id,
          created_at
        `)
        .in('customer_id', userIds)

      if (appointmentError) {
        throw appointmentError
      }

      // =======================================================
      // MODERATION MAP
      // =======================================================

      const moderationMap = new Map()

      ;(moderations || []).forEach(
        (moderation) => {
          moderationMap.set(
            moderation.user_id,
            moderation
          )
        }
      )

      // =======================================================
      // APPOINTMENT MAP
      // =======================================================

      const appointmentMap = new Map()

      const appointmentStatusMap = new Map()

      ;(appointments || []).forEach(
        (appointment) => {
          const customerId =
            appointment.customer_id

          appointmentMap.set(
            customerId,
            (appointmentMap.get(customerId) || 0) + 1
          )

          if (
            !appointmentStatusMap.has(
              customerId
            )
          ) {
            appointmentStatusMap.set(
  customerId,
  {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  }
)
          }

          const statusData =
            appointmentStatusMap.get(
              customerId
            )

          if (
            statusData[
              appointment.status
            ] !== undefined
          ) {
            statusData[
              appointment.status
            ]++
          }
        }
      )

      // =======================================================
      // COMBINE USER DATA
      // =======================================================

      const combinedUsers = users.map(
        (user) => {
          const moderation =
            moderationMap.get(user.id)

          return {
            ...user,

            moderationStatus:
              moderation?.status ||
              'healthy',

            warningCount:
              moderation?.warning_count ||
              0,

            moderationReason:
              moderation?.reason || null,

            bannedAt:
              moderation?.banned_at ||
              null,

            bannedBy:
              moderation?.banned_by ||
              null,

            moderationUpdatedAt:
              moderation?.updated_at ||
              null,

            appointmentCount:
              appointmentMap.get(
                user.id
              ) || 0,

            appointmentStatuses:
  appointmentStatusMap.get(
    user.id
  ) || {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
  },

            is_active:
  user.is_active !== false,

deactivatedAt:
  user.deactivated_at || null,
          }
        }
      )

      setCustomers(combinedUsers)
    } catch (error) {
      console.error(
        'Error loading users:',
        error
      )

      toast.error(
        error?.message ||
          'Failed to load user accounts.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCustomers()
  }, [])

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const startOfToday = () => {
    const date = new Date()

    date.setHours(0, 0, 0, 0)

    return date
  }

  const startOfWeek = () => {
    const date = new Date()

    date.setHours(0, 0, 0, 0)

    const day = date.getDay()

    const difference =
      day === 0 ? 6 : day - 1

    date.setDate(
      date.getDate() - difference
    )

    return date
  }

  const startOfMonth = () => {
    const date = new Date()

    date.setHours(0, 0, 0, 0)
    date.setDate(1)

    return date
  }

  const getAccountAgeDays = (
    createdAt
  ) => {
    if (!createdAt) {
      return null
    }

    const created =
      new Date(createdAt)

    const now = new Date()

    const difference =
      now.getTime() -
      created.getTime()

    return Math.max(
      0,
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      )
    )
  }

  const isNewToday = (
    createdAt
  ) => {
    if (!createdAt) {
      return false
    }

    return (
      new Date(createdAt) >=
      startOfToday()
    )
  }

  const isNewThisWeek = (
    createdAt
  ) => {
    if (!createdAt) {
      return false
    }

    return (
      new Date(createdAt) >=
      startOfWeek()
    )
  }

  const isNewThisMonth = (
    createdAt
  ) => {
    if (!createdAt) {
      return false
    }

    return (
      new Date(createdAt) >=
      startOfMonth()
    )
  }

  const isOlderAccount = (
    createdAt
  ) => {
    if (!createdAt) {
      return false
    }

    return (
      new Date(createdAt) <
      startOfMonth()
    )
  }

  // =========================================================
  // ACTIVITY
  // =========================================================

  const isActiveRecently = (
    lastSeen
  ) => {
    if (!lastSeen) {
      return false
    }

    const lastSeenDate =
      new Date(lastSeen)

    const now = new Date()

    const difference =
      now.getTime() -
      lastSeenDate.getTime()

    const sevenDays =
      7 *
      24 *
      60 *
      60 *
      1000

    return difference <= sevenDays
  }

  const getActivityLabel = (
    lastSeen
  ) => {
    if (!lastSeen) {
      return 'Never Active'
    }

    if (
      isActiveRecently(lastSeen)
    ) {
      return 'Active Recently'
    }

    return 'Inactive'
  }

  // =========================================================
  // ACCOUNT AGE LABEL
  // =========================================================

  const getAccountAgeLabel = (
    createdAt
  ) => {
    if (!createdAt) {
      return 'Unknown'
    }

    if (
      isNewToday(createdAt)
    ) {
      return 'New Today'
    }

    const days =
      getAccountAgeDays(
        createdAt
      )

    if (days === 1) {
      return '1 day ago'
    }

    if (days < 7) {
      return `${days} days ago`
    }

    if (
      isNewThisWeek(createdAt)
    ) {
      return 'This Week'
    }

    if (
      isNewThisMonth(createdAt)
    ) {
      return 'This Month'
    }

    if (days < 30) {
      return `${days} days old`
    }

    const months =
      Math.floor(days / 30)

    if (months === 1) {
      return '1 month old'
    }

    return `${months} months old`
  }

  // =========================================================
  // DATE FORMATTING
  // =========================================================

    const formatDateTime = (
    value
  ) => {
    if (!value) {
      return 'Not available'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Not available'
    }

    const datePart =
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

    const timePart =
      date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })

    return `${datePart} at ${timePart}`
  }



  const formatDateOnly = (
    value
  ) => {
    if (!value) {
      return 'Not provided'
    }

    return new Date(
      value
    ).toLocaleDateString(
      'en-PH',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
  }

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredCustomers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase()

      return customers.filter(
        (user) => {
          // =================================================
          // SEARCH
          // =================================================

          const matchesSearch =
            !query ||
            user.name
              ?.toLowerCase()
              .includes(query) ||
            user.username
              ?.toLowerCase()
              .includes(query) ||
            user.email
              ?.toLowerCase()
              .includes(query) ||
            user.phone
              ?.toLowerCase()
              .includes(query) ||
            user.address
              ?.toLowerCase()
              .includes(query)

          if (!matchesSearch) {
            return false
          }

          // =================================================
          // ROLE
          // =================================================

          if (
            roleFilter !== 'all' &&
            user.role !== roleFilter
          ) {
            return false
          }

          // =================================================
          // MODERATION STATUS
          // =================================================

          if (
            statusFilter !== 'all' &&
            user.moderationStatus !==
              statusFilter
          ) {
            return false
          }

          // =================================================
          // ACCOUNT AGE
          // =================================================

          if (
            ageFilter === 'today' &&
            !isNewToday(
              user.created_at
            )
          ) {
            return false
          }

          if (
            ageFilter === 'week' &&
            !isNewThisWeek(
              user.created_at
            )
          ) {
            return false
          }

          if (
            ageFilter === 'month' &&
            !isNewThisMonth(
              user.created_at
            )
          ) {
            return false
          }

          if (
            ageFilter === 'older' &&
            !isOlderAccount(
              user.created_at
            )
          ) {
            return false
          }

          // =================================================
          // ACTIVITY
          // =================================================

          if (
            activityFilter ===
              'recent' &&
            !isActiveRecently(
              user.last_seen
            )
          ) {
            return false
          }

          if (
            activityFilter ===
              'inactive' &&
            (
              !user.last_seen ||
              isActiveRecently(
                user.last_seen
              )
            )
          ) {
            return false
          }

          if (
            activityFilter ===
              'never' &&
            user.last_seen
          ) {
            return false
          }

          return true
        }
      )
    }, [
      customers,
      search,
      roleFilter,
      ageFilter,
      activityFilter,
      statusFilter,
    ])

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    return {
      totalUsers:
        customers.length,

      customersCount:
        customers.filter(
          (user) =>
            user.role ===
            'customer'
        ).length,

      techniciansCount:
        customers.filter(
          (user) =>
            user.role ===
            'technician'
        ).length,

      adminsCount:
        customers.filter(
          (user) =>
            user.role ===
            'admin'
        ).length,

      newToday:
        customers.filter(
          (user) =>
            isNewToday(
              user.created_at
            )
        ).length,

      newThisWeek:
        customers.filter(
          (user) =>
            isNewThisWeek(
              user.created_at
            )
        ).length,

      newThisMonth:
        customers.filter(
          (user) =>
            isNewThisMonth(
              user.created_at
            )
        ).length,

      activeRecently:
        customers.filter(
          (user) =>
            isActiveRecently(
              user.last_seen
            )
        ).length,

      healthy:
        customers.filter(
          (user) =>
            user.moderationStatus ===
            'healthy'
        ).length,

      warnings:
        customers.filter(
          (user) =>
            user.moderationStatus ===
            'warning'
        ).length,

      banned:
        customers.filter(
          (user) =>
            user.moderationStatus ===
            'banned'
        ).length,

      deactivated:
        customers.filter(
          (user) =>
            user.is_active ===
            false
        ).length,
    }
  }, [customers])

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.ceil(
      filteredCustomers.length /
        usersPerPage
    )

  const paginatedUsers =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        usersPerPage

      return filteredCustomers.slice(
        start,
        start + usersPerPage
      )
    }, [
      filteredCustomers,
      currentPage,
    ])

  useEffect(() => {
    if (
      currentPage > totalPages &&
      totalPages > 0
    ) {
      setCurrentPage(totalPages)
    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1)
    }
  }, [
    totalPages,
    currentPage,
  ])

  // =========================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =========================================================

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    roleFilter,
    ageFilter,
    activityFilter,
    statusFilter,
  ])

  // =========================================================
  // OPEN PROFILE
  // =========================================================

  const openProfile = (
    user
  ) => {
    setSelectedCustomer(user)
    setShowProfileModal(true)
  }

  // =========================================================
  // CLOSE MODALS
  // =========================================================

  const closeAllModals = () => {
    setShowProfileModal(false)
    setShowWarningModal(false)
    setShowBanModal(false)
    setShowUnbanModal(false)
    setShowHistoryModal(false)

    setSelectedCustomer(null)

    setReason('')
    setAdminNotes('')
  }

  // =========================================================
  // ACCOUNT ACTIVE / DEACTIVATE
  // =========================================================

  
  // =========================================================
  // ACCOUNT ACTIVE / DEACTIVATE
  // =========================================================

  const handleToggleAccount = async (user) => {
    if (!user) return

    try {
      const {
        data: { user: currentAuthUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError

      // Prevent self-deactivation
      if (
        user.id === currentAuthUser?.id &&
        user.is_active
      ) {
        toast.error(
          'You cannot deactivate your own account.'
        )
        return
      }

      const nextStatus = !user.is_active

      const confirmed = window.confirm(
        nextStatus
          ? `Reactivate ${user.name}'s account?`
          : `Deactivate ${user.name}'s account?`
      )

      if (!confirmed) return

      setProcessing(true)

      const { error } = await supabase
        .from('users')
        .update({
          is_active: nextStatus,
          deactivated_at: nextStatus
            ? null
            : new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Preserve the existing technician reassignment logic
      if (!nextStatus) {
        const { error: appointmentError } =
          await supabase
            .from('appointments')
            .update({
              technician_id: null,
              technician_role: null,
            })
            .eq('technician_id', user.id)
            .in('status', ['pending', 'confirmed'])

        if (appointmentError) {
          console.error(
            'Appointment reassignment error:',
            appointmentError
          )

          toast.error(
            'Account deactivated, but some appointments could not be unassigned.'
          )

          await loadCustomers()
          return
        }
      }

      toast.success(
        nextStatus
          ? 'Account reactivated successfully.'
          : 'Account deactivated successfully.'
      )

      await loadCustomers()

      setSelectedCustomer((current) =>
        current
          ? {
              ...current,
              is_active: nextStatus,
              deactivatedAt: nextStatus
                ? null
                : new Date().toISOString(),
            }
          : current
      )
    } catch (error) {
      console.error(
        'Account status error:',
        error
      )

      toast.error(
        error?.message ||
          'Unable to update account status.'
      )
    } finally {
      setProcessing(false)
    }
  }


  // =========================================================
  // LOAD MODERATION HISTORY
  // =========================================================

  const loadHistory = async (
    customer
  ) => {
    if (!customer) {
      return
    }

    try {
      setHistoryLoading(true)

      const {
        data,
        error,
      } = await supabase
        .from(
          'moderation_actions'
        )
        .select(`
          id,
          action_type,
          warning_number,
          reason,
          admin_notes,
          created_at,
          admin_id
        `)
        .eq(
          'user_id',
          customer.id
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )

      if (error) {
        throw error
      }

      setHistory(data || [])
    } catch (error) {
      console.error(
        'History error:',
        error
      )

      toast.error(
        error?.message ||
          'Unable to load moderation history.'
      )

      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

    // =========================================================
  // DELETE ACCOUNT
  // =========================================================

    const getStorageFile = (url) => {
    if (!url) return null
    const marker = '/storage/v1/object/public/'
    const index = url.indexOf(marker)
    if (index === -1) return null
    const rest = url.slice(index + marker.length).split('?')[0]
    const slash = rest.indexOf('/')
    if (slash === -1) return null
    return {
      bucket: rest.slice(0, slash),
      path: decodeURIComponent(rest.slice(slash + 1)),
    }
  }

  const deleteUserFiles = async (user) => {
    const targets = new Map() // bucket -> Set of paths

    const add = (bucket, path) => {
      if (!targets.has(bucket)) targets.set(bucket, new Set())
      targets.get(bucket).add(path)
    }

    // 1. Everything in the user's folder
    for (const bucket of ['avatars', 'covers']) {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list(user.id, { limit: 1000 })

      if (error) {
        console.error(`List failed (${bucket}):`, error)
        continue
      }
      ;(files || []).forEach((f) => add(bucket, `${user.id}/${f.name}`))
    }

    // 2. The exact files saved on the user row (covers older uploads)
    ;[user.avatar_url, user.cover_url]
      .map(getStorageFile)
      .filter(Boolean)
      .forEach((f) => add(f.bucket, f.path))
        // 2b. Original sign-up picture (kept even after the avatar was changed)
    if (user.registration_avatar_path) {
      add('avatars', user.registration_avatar_path)
    }

    // 3. Remove and verify
    let removed = 0
    let expected = 0

    for (const [bucket, paths] of targets) {
      const list = [...paths]
      expected += list.length

      const { data, error } = await supabase.storage.from(bucket).remove(list)

      if (error) {
        console.error(`Remove failed (${bucket}):`, error)
        continue
      }
      removed += data?.length || 0
    }

    console.log(`Storage cleanup: removed ${removed} of ${expected} files`)
    return { removed, expected }
  }

    const getAttachmentPaths = async (userId) => {
    const { data: appts, error: apptError } = await supabase
      .from('appointments')
      .select('id')
      .eq('customer_id', userId)

    if (apptError) {
      console.error('Appointment lookup failed:', apptError)
      return []
    }

    const ids = (appts || []).map((a) => a.id)
    if (!ids.length) return []

    const { data: atts, error: attError } = await supabase
      .from('service_task_attachments')
      .select('file_path')
      .in('appointment_id', ids)

    if (attError) {
      console.error('Attachment lookup failed:', attError)
      return []
    }

    return (atts || []).map((a) => a.file_path).filter(Boolean)
  }

  // PASTE HERE
  const getAttachmentFolderPaths = async (userId) => {
    const paths = []

    const { data: folders, error } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .list(userId, { limit: 1000 })

    if (error) {
      console.error('Attachment folder list failed:', error)
      return paths
    }

    for (const folder of folders || []) {
      const { data: files } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .list(`${userId}/${folder.name}`, { limit: 1000 })

      ;(files || []).forEach((f) =>
        paths.push(`${userId}/${folder.name}/${f.name}`)
      )
    }

    return paths
  }

  const handleDeleteAccount = async (user) => {

    if (!user) return

    const {
      data: { user: currentAuthUser },
    } = await supabase.auth.getUser()

    if (user.id === currentAuthUser?.id) {
      toast.error('You cannot delete your own account.')
      return
    }

    const confirmed = window.confirm(
      `Permanently delete ${user.name}'s account?\n\nThis also deletes their appointments, moderation history, profile, and uploaded photos. This cannot be undone.`
    )
    if (!confirmed) return

    try {
      setProcessing(true)

            // 0. Collect attachment file paths BEFORE the rows are deleted
      const dbPaths = await getAttachmentPaths(user.id)
      const folderPaths = await getAttachmentFolderPaths(user.id)
      const attachmentPaths = [...new Set([...dbPaths, ...folderPaths])]

      // 1. Database records + login
      const { error } = await supabase.rpc('admin_delete_user', {
        target_user_id: user.id,
      })
      if (error) throw error

      // 2. Storage files (avatars, covers, registration photo)
      const { removed, expected } = await deleteUserFiles(user)

      // 3. Service task attachment files
      let attRemoved = 0
      for (let i = 0; i < attachmentPaths.length; i += 100) {
        const chunk = attachmentPaths.slice(i, i + 100)
        const { data, error: attErr } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .remove(chunk)

        if (attErr) console.error('Attachment remove failed:', attErr)
        else attRemoved += data?.length || 0
      }

      console.log(
        `Attachment cleanup: removed ${attRemoved} of ${attachmentPaths.length} files`
      )

      const allRemoved = removed + attRemoved
      const allExpected = expected + attachmentPaths.length

      if (allRemoved < allExpected) {
        toast.error(
          `Account deleted, but only ${allRemoved} of ${allExpected} files were removed. Check storage policies.`
        )
      } else {
        toast.success('Account and all connected data deleted.')
      }

      setShowProfileModal(false)
      setShowHistoryModal(false)
      setSelectedCustomer(null)

      await loadCustomers()
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error(error?.message || 'Unable to delete account.')
    } finally {
      setProcessing(false)
    }
  }

    const cleanupOrphanAvatars = async (dryRun = true) => {
    // Every avatar URL still used by a real account
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('avatar_url')

    if (usersError) return console.error(usersError)

    const inUse = (users || []).map((u) => u.avatar_url).filter(Boolean)

    // Files in the registrations folder
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list('registrations', { limit: 1000 })

    if (error) return console.error(error)

    const orphans = (files || [])
      .filter((f) => !f.name.startsWith('.'))
      .map((f) => `registrations/${f.name}`)
      .filter((path) => !inUse.some((url) => url.includes(path)))

    // The old folder from a deleted user
    orphans.push('f9c620d9-bf67-43ed-8666-68525316b577/avatar.jpg')

    console.log(`Orphans (${orphans.length}):`, orphans)

    if (dryRun) {
      console.log('DRY RUN: nothing deleted. Run cleanupOrphanAvatars(false) to delete.')
      return orphans
    }

    const { data, error: removeError } = await supabase.storage
      .from('avatars')
      .remove(orphans)

    if (removeError) return console.error(removeError)
    console.log(`Deleted ${data?.length || 0} files`)
  }

  useEffect(() => {
    window.cleanupOrphanAvatars = cleanupOrphanAvatars
    return () => delete window.cleanupOrphanAvatars
  }, [])

  // =========================================================
  // DELETE HISTORY ENTRY
  // =========================================================

  const handleDeleteHistory = async (actionId) => {
    const confirmed = window.confirm(
      'Delete this moderation record? The customer will no longer see it either.'
    )
    if (!confirmed) return

    try {
      setProcessing(true)

      const { error } = await supabase.rpc('admin_delete_moderation_action', {
        action_id: actionId,
      })
      if (error) throw error

      setHistory((prev) => prev.filter((h) => h.id !== actionId))
      toast.success('Moderation record deleted.')
    } catch (error) {
      console.error('Delete history error:', error)
      toast.error(error?.message || 'Unable to delete record.')
    } finally {
      setProcessing(false)
    }
  }

  // =========================================================
  // WARNING
  // =========================================================

  const handleIssueWarning =
    async () => {
      if (!selectedCustomer) {
        return
      }

      if (
        !reason.trim()
      ) {
        toast.error(
          'Please provide a reason for the warning.'
        )

        return
      }

      try {
        setProcessing(true)

        const {
          data,
          error,
        } =
          await supabase.rpc(
            'admin_issue_warning',
            {
              p_user_id:
                selectedCustomer.id,

              p_reason:
                reason.trim(),

              p_appointment_id:
                null,

              p_admin_notes:
                adminNotes.trim() ||
                null,
            }
          )

        if (error) {
          throw error
        }

        console.log(
          'Warning RPC result:',
          data
        )

        toast.success(
          'Warning issued successfully.'
        )

        setShowWarningModal(false)
        setReason('')
        setAdminNotes('')

        await loadCustomers()
      } catch (error) {
        console.error(
          'Warning error:',
          error
        )

        toast.error(
          error?.message ||
            'Unable to issue warning.'
        )
      } finally {
        setProcessing(false)
      }
    }

  // =========================================================
  // BAN
  // =========================================================

  const handleBanAccount =
    async () => {
      if (!selectedCustomer) {
        return
      }

      if (
        !reason.trim()
      ) {
        toast.error(
          'Please provide a reason for the ban.'
        )

        return
      }

      try {
        setProcessing(true)

        const {
          data,
          error,
        } =
          await supabase.rpc(
            'admin_ban_account',
            {
              p_user_id:
                selectedCustomer.id,

              p_reason:
                reason.trim(),

              p_admin_notes:
                adminNotes.trim() ||
                null,
            }
          )

        if (error) {
          throw error
        }

        console.log(
          'Ban RPC result:',
          data
        )

        toast.success(
          'Account banned successfully.'
        )

        setShowBanModal(false)
        setReason('')
        setAdminNotes('')

        await loadCustomers()
      } catch (error) {
        console.error(
          'Ban error:',
          error
        )

        toast.error(
          error?.message ||
            'Unable to ban account.'
        )
      } finally {
        setProcessing(false)
      }
    }

  // =========================================================
  // UNBAN
  // =========================================================

  const handleUnbanAccount =
    async () => {
      if (!selectedCustomer) {
        return
      }

      if (
        !reason.trim()
      ) {
        toast.error(
          'Please provide a reason for the unban.'
        )

        return
      }

      try {
        setProcessing(true)

        const {
          data,
          error,
        } =
          await supabase.rpc(
            'admin_unban_account',
            {
              p_user_id:
                selectedCustomer.id,

              p_reason:
                reason.trim(),

              p_admin_notes:
                adminNotes.trim() ||
                null,
            }
          )

        if (error) {
          throw error
        }

        console.log(
          'Unban RPC result:',
          data
        )

        toast.success(
          'Account unbanned successfully.'
        )

        setShowUnbanModal(false)
        setReason('')
        setAdminNotes('')

        await loadCustomers()
      } catch (error) {
        console.error(
          'Unban error:',
          error
        )

        toast.error(
          error?.message ||
            'Unable to unban account.'
        )
      } finally {
        setProcessing(false)
      }
    }

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setAgeFilter('all')
    setActivityFilter('all')
    setStatusFilter('all')
    setCurrentPage(1)
  }


  

  // =========================================================
// LOCK BACKGROUND SCROLL WHEN ANY MODAL IS OPEN
// =========================================================

useEffect(() => {
  const isModalOpen =
    showProfileModal ||
    showWarningModal ||
    showBanModal ||
    showUnbanModal ||
    showHistoryModal

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
  showProfileModal,
  showWarningModal,
  showBanModal,
  showUnbanModal,
  showHistoryModal,
])

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-red-100 border-t-red-700" />

            <p className="mt-4 text-sm font-bold text-gray-600">
              Loading user accounts...
            </p>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="border-b border-gray-200 bg-white">

        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate('/admin')
                }
                className="
                  mt-1
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  text-gray-600
                  shadow-sm
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-700
                "
                title="Back to Dashboard"
              >
                <FaArrowLeft />
              </button>

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <FaUsers />
                  </div>

                  <div>
                    <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                      User Account Management
                    </h1>

                    <p className="mt-0.5 text-xs font-medium text-gray-500 sm:text-sm">
                      Monitor user accounts, activity, profiles, and customer moderation.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">

                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Showing
                </p>

                <p className="text-sm font-black text-gray-800">
                  {filteredCustomers.length}{' '}
                  user
                  {filteredCustomers.length !== 1
                    ? 's'
                    : ''}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section>

          <div className="mb-3 flex items-center gap-2">

            <FaInfoCircle className="text-red-600" />

            <h2 className="text-sm font-black uppercase tracking-wider text-gray-700">
              Account Overview
            </h2>

          </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            <StatCard color="blue" icon={<FaUsers />} label="Total Users"
              value={statistics.totalUsers} description="All registered accounts" />

            <StatCard color="red" icon={<FaUser />} label="Customers"
              value={statistics.customersCount} description="Customer accounts" />

            <StatCard color="orange" icon={<FaUserCog />} label="Technicians"
              value={statistics.techniciansCount} description="Staff technician accounts" />

            <StatCard color="violet" icon={<FaUserShield />} label="Administrators"
              value={statistics.adminsCount} description="Admin accounts" />

            <StatCard color="teal" icon={<FaUserPlus />} label="New Today"
              value={statistics.newToday} description="Joined today" />

            <StatCard color="sky" icon={<FaCalendarAlt />} label="New This Week"
              value={statistics.newThisWeek} description="Joined this week" />

            <StatCard color="indigo" icon={<FaCalendarAlt />} label="New This Month"
              value={statistics.newThisMonth} description="Joined this month" />

            <StatCard color="emerald" icon={<FaUserClock />} label="Active Recently"
              value={statistics.activeRecently} description="Seen in the last 7 days" />

            <StatCard color="green" icon={<FaCheckCircle />} label="Healthy"
              value={statistics.healthy} description="No moderation issues" />

            <StatCard color="amber" icon={<FaExclamationTriangle />} label="Warnings"
              value={statistics.warnings} description="Accounts with warnings" />

            <StatCard color="rose" icon={<FaBan />} label="Banned"
              value={statistics.banned} description="Restricted accounts" />

            <StatCard color="slate" icon={<FaUserSlash />} label="Deactivated"
              value={statistics.deactivated} description="Disabled accounts" />

          </div>

        </section>

        {/* ===================================================
            SEARCH + FILTERS
        =================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search name, username, email, phone, or address..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  font-medium
                  text-gray-800
                  outline-none
                  transition
                  placeholder:text-gray-400
                  focus:border-red-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-red-50
                "
              />

            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                px-5
                py-3
                text-sm
                font-bold
                text-gray-600
                transition
                hover:border-red-200
                hover:bg-red-50
                hover:text-red-700
              "
            >
              Clear Filters
            </button>

          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* ROLE */}

            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              label="Role"
            >
              <option value="all">
                All Users
              </option>

              <option value="customer">
                Customers
              </option>

              <option value="technician">
                Technicians
              </option>

              <option value="admin">
                Administrators
              </option>
            </FilterSelect>

            {/* AGE */}

            <FilterSelect
              value={ageFilter}
              onChange={setAgeFilter}
              label="Account Age"
            >
              <option value="all">
                All Account Ages
              </option>

              <option value="today">
                New Today
              </option>

              <option value="week">
                New This Week
              </option>

              <option value="month">
                New This Month
              </option>

              <option value="older">
                Older Accounts
              </option>
            </FilterSelect>

            {/* ACTIVITY */}

            <FilterSelect
              value={activityFilter}
              onChange={setActivityFilter}
              label="Activity"
            >
              <option value="all">
                All Activity
              </option>

              <option value="recent">
                Active Recently
              </option>

              <option value="inactive">
                Inactive
              </option>

              <option value="never">
                Never Active
              </option>
            </FilterSelect>

            {/* MODERATION */}

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Moderation"
            >
              <option value="all">
                All Moderation Status
              </option>

              <option value="healthy">
                Healthy
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="banned">
                Banned
              </option>
            </FilterSelect>

          </div>

        </section>

        {/* ===================================================
            USER LIST
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-4">

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-base font-black text-gray-900">
                  User Accounts
                </h2>

                <p className="text-xs text-gray-500">
                  Account profiles, access status, activity, and moderation.
                </p>

              </div>

              {totalPages > 0 && (
                <p className="text-xs font-bold text-gray-400">
                  Page {currentPage} of{' '}
                  {totalPages}
                </p>
              )}

            </div>

          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-x-auto lg:block">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50">

                  <TableHeader>
                    User
                  </TableHeader>

                  <TableHeader>
                    Contact
                  </TableHeader>

                  <TableHeader>
                    Role
                  </TableHeader>

                  <TableHeader>
                    Account
                  </TableHeader>

                  <TableHeader>
                    Activity
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>

                </tr>

              </thead>

              <tbody>

                {paginatedUsers.map(
                  (user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      openProfile={
                        openProfile
                      }
                      handleToggleAccount={
                        handleToggleAccount
                      }
                      handleDeleteAccount={
                        handleDeleteAccount
                      }
                      setSelectedCustomer={
                        setSelectedCustomer
                      }
                      setReason={
                        setReason
                      }
                      setAdminNotes={
                        setAdminNotes
                      }
                      setShowHistoryModal={
                        setShowHistoryModal
                      }
                      setShowWarningModal={
                        setShowWarningModal
                      }
                      setShowBanModal={
                        setShowBanModal
                      }
                      setShowUnbanModal={
                        setShowUnbanModal
                      }
                      loadHistory={
                        loadHistory
                      }
                      processing={
                        processing
                      }
                      formatDateTime={
                        formatDateTime
                      }
                      getAccountAgeLabel={
                        getAccountAgeLabel
                      }
                      getActivityLabel={
                        getActivityLabel
                      }
                      
                    />
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE / TABLET CARDS
          ================================================= */}

          <div className="divide-y divide-gray-100 lg:hidden">

            {paginatedUsers.map(
              (user) => (
                <UserMobileCard
                  key={user.id}
                  user={user}
                  openProfile={
                    openProfile
                  }
                  handleToggleAccount={
                    handleToggleAccount
                  }
                  handleDeleteAccount={
                    handleDeleteAccount
                  }
                  setSelectedCustomer={
                    setSelectedCustomer
                  }
                  setReason={
                    setReason
                  }
                  setAdminNotes={
                    setAdminNotes
                  }
                  setShowHistoryModal={
                    setShowHistoryModal
                  }
                  setShowWarningModal={
                    setShowWarningModal
                  }
                  setShowBanModal={
                    setShowBanModal
                  }
                  setShowUnbanModal={
                    setShowUnbanModal
                  }
                  loadHistory={
                    loadHistory
                  }
                  processing={
                    processing
                  }
                  formatDateTime={
                    formatDateTime
                  }
                  getAccountAgeLabel={
                    getAccountAgeLabel
                  }
                  getActivityLabel={
                    getActivityLabel
                  }
                  
                />
              )
            )}

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {paginatedUsers.length === 0 && (
            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <FaSearch className="text-xl text-gray-300" />
              </div>

              <h3 className="mt-4 text-sm font-black text-gray-800">
                No users found
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="
                  mt-4
                  rounded-xl
                  bg-red-700
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-red-800
                "
              >
                Clear Filters
              </button>

            </div>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-gray-700
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <FaChevronLeft />
                Previous
              </button>

              <div className="flex items-center gap-1">

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                )
                  .slice(
                    Math.max(
                      0,
                      currentPage - 3
                    ),
                    Math.min(
                      totalPages,
                      currentPage + 2
                    )
                  )
                  .map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          setCurrentPage(
                            page
                          )
                        }
                        className={`
                          h-9
                          min-w-9
                          rounded-lg
                          px-2
                          text-xs
                          font-black
                          transition
                          ${
                            currentPage ===
                            page
                              ? 'bg-red-700 text-white'
                              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-700'
                          }
                        `}
                      >
                        {page}
                      </button>
                    )
                  )}

              </div>

              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-gray-700
                  transition
                  hover:border-red-200
                  hover:bg-red-50
                  hover:text-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
                <FaChevronRight />
              </button>

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {showProfileModal &&
        selectedCustomer && (
          <ProfileModal
            user={
              selectedCustomer
            }
            processing={
              processing
            }
            onClose={() => {
              setShowProfileModal(
                false
              )
              setSelectedCustomer(
                null
              )
            }}
            onToggleAccount={() =>
              handleToggleAccount(
                selectedCustomer
              )
            }
            formatDateTime={
              formatDateTime
            }
            formatDateOnly={
              formatDateOnly
            }
            getAccountAgeLabel={
              getAccountAgeLabel
            }
          />
        )}

      {/* =====================================================
          WARNING MODAL
      ===================================================== */}

      {showWarningModal &&
        selectedCustomer && (
          <ModerationModal
            type="warning"
            title="Issue Warning"
            icon={
              <FaExclamationTriangle />
            }
            user={
              selectedCustomer
            }
            reason={reason}
            setReason={
              setReason
            }
            adminNotes={
              adminNotes
            }
            setAdminNotes={
              setAdminNotes
            }
            processing={
              processing
            }
            onClose={() => {
              setShowWarningModal(
                false
              )
              setReason('')
              setAdminNotes('')
            }}
            onSubmit={
              handleIssueWarning
            }
          />
        )}

      {/* =====================================================
          BAN MODAL
      ===================================================== */}

      {showBanModal &&
        selectedCustomer && (
          <ModerationModal
            type="ban"
            title="Ban Account"
            icon={
              <FaBan />
            }
            user={
              selectedCustomer
            }
            reason={reason}
            setReason={
              setReason
            }
            adminNotes={
              adminNotes
            }
            setAdminNotes={
              setAdminNotes
            }
            processing={
              processing
            }
            onClose={() => {
              setShowBanModal(
                false
              )
              setReason('')
              setAdminNotes('')
            }}
            onSubmit={
              handleBanAccount
            }
          />
        )}

      {/* =====================================================
          UNBAN MODAL
      ===================================================== */}

      {showUnbanModal &&
        selectedCustomer && (
          <ModerationModal
            type="unban"
            title="Unban Account"
            icon={
              <FaUnlock />
            }
            user={
              selectedCustomer
            }
            reason={reason}
            setReason={
              setReason
            }
            adminNotes={
              adminNotes
            }
            setAdminNotes={
              setAdminNotes
            }
            processing={
              processing
            }
            onClose={() => {
              setShowUnbanModal(
                false
              )
              setReason('')
              setAdminNotes('')
            }}
            onSubmit={
              handleUnbanAccount
            }
          />
        )}

      {/* =====================================================
          HISTORY MODAL
      ===================================================== */}

      {showHistoryModal &&
        selectedCustomer && (
          <HistoryModal
            user={
              selectedCustomer
            }
            history={
              history
            }
            loading={
              historyLoading
            }
            processing={processing}
            onDeleteHistory={handleDeleteHistory}
            onClose={() => {
              setShowHistoryModal(
                false
              )
              setSelectedCustomer(
                null
              )
            }}
            formatDateTime={
              formatDateTime
            }
          />
        )}

        

    </div>
  )
}

/* =========================================================
   STAT CARD
========================================================= */

/* =========================================================
   STAT CARD
========================================================= */

const STAT_COLORS = {
  red:     { border: 'border-red-100',     label: 'text-red-600',     blob: 'bg-red-100/70',     icon: 'from-red-500 to-red-700',         bar: 'bg-red-600',     glow: 'shadow-red-300/50' },
  rose:    { border: 'border-rose-100',    label: 'text-rose-600',    blob: 'bg-rose-100/70',    icon: 'from-rose-500 to-rose-700',       bar: 'bg-rose-600',    glow: 'shadow-rose-300/50' },
  blue:    { border: 'border-blue-100',    label: 'text-blue-600',    blob: 'bg-blue-100/70',    icon: 'from-blue-500 to-blue-700',       bar: 'bg-blue-600',    glow: 'shadow-blue-300/50' },
  indigo:  { border: 'border-indigo-100',  label: 'text-indigo-600',  blob: 'bg-indigo-100/70',  icon: 'from-indigo-500 to-indigo-700',   bar: 'bg-indigo-600',  glow: 'shadow-indigo-300/50' },
  sky:     { border: 'border-sky-100',     label: 'text-sky-600',     blob: 'bg-sky-100/70',     icon: 'from-sky-400 to-sky-600',         bar: 'bg-sky-500',     glow: 'shadow-sky-300/50' },
  orange:  { border: 'border-orange-100',  label: 'text-orange-600',  blob: 'bg-orange-100/70',  icon: 'from-orange-400 to-orange-600',   bar: 'bg-orange-500',  glow: 'shadow-orange-300/50' },
  amber:   { border: 'border-amber-100',   label: 'text-amber-600',   blob: 'bg-amber-100/70',   icon: 'from-amber-400 to-amber-600',     bar: 'bg-amber-500',   glow: 'shadow-amber-300/50' },
  violet:  { border: 'border-violet-100',  label: 'text-violet-600',  blob: 'bg-violet-100/70',  icon: 'from-violet-500 to-violet-700',   bar: 'bg-violet-600',  glow: 'shadow-violet-300/50' },
  green:   { border: 'border-green-100',   label: 'text-green-600',   blob: 'bg-green-100/70',   icon: 'from-green-500 to-green-700',     bar: 'bg-green-600',   glow: 'shadow-green-300/50' },
  emerald: { border: 'border-emerald-100', label: 'text-emerald-600', blob: 'bg-emerald-100/70', icon: 'from-emerald-500 to-emerald-700', bar: 'bg-emerald-600', glow: 'shadow-emerald-300/50' },
  teal:    { border: 'border-teal-100',    label: 'text-teal-600',    blob: 'bg-teal-100/70',    icon: 'from-teal-400 to-teal-600',       bar: 'bg-teal-500',    glow: 'shadow-teal-300/50' },
  slate:   { border: 'border-slate-200',   label: 'text-slate-600',   blob: 'bg-slate-100',      icon: 'from-slate-500 to-slate-700',     bar: 'bg-slate-500',   glow: 'shadow-slate-300/50' },
}

function StatCard({
  icon,
  label,
  value,
  description,
  color = 'red',
}) {
  const c = STAT_COLORS[color] || STAT_COLORS.red

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border bg-white
        p-4 pb-5 shadow-sm transition
        hover:-translate-y-0.5 hover:shadow-lg
        sm:p-5 sm:pb-6
        ${c.border}
      `}
    >
      {/* corner blob */}
      <div
        className={`absolute -right-7 -top-7 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-110 ${c.blob}`}
      />

      {/* icon tile */}
      <div
        className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg text-white shadow-lg ${c.icon} ${c.glow}`}
      >
        {icon}
      </div>

      {/* text */}
      <div className="relative pr-12">
        <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${c.label}`}>
          {label}
        </p>

        <p className="mt-2 text-3xl font-black leading-none text-gray-900">
          {value}
        </p>

        <p className="mt-2 text-xs font-medium text-gray-400">
          {description}
        </p>
      </div>

      {/* bottom accent bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 w-16 rounded-tr-full ${c.bar}`}
      />
    </div>
  )
}

function SectionCard({ theme, icon, title, children }) {
  return (
    <div className={`relative mt-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${theme.border} ${theme.soft}`}>

      <div className="relative flex items-center gap-2 text-sm font-black text-gray-800">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-xs text-white shadow ${theme.tile} ${theme.glow}`}>
          {icon}
        </span>
        {title}
      </div>

      <div className="relative">{children}</div>
    </div>
  )
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  value,
  onChange,
  label,
  children,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="
          w-full
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          px-4
          py-3
          text-sm
          font-semibold
          text-gray-700
          outline-none
          transition
          focus:border-red-500
          focus:bg-white
          focus:ring-4
          focus:ring-red-50
        "
      >
        {children}
      </select>

    </div>
  )
}

/* =========================================================
   TABLE HEADER
========================================================= */

function TableHeader({
  children,
  align = 'left',
}) {
  return (
    <th
      className={`
        px-4
        py-3
        text-[10px]
        font-extrabold
        uppercase
        tracking-wider
        text-gray-400
        ${
          align === 'right'
            ? 'text-right'
            : 'text-left'
        }
      `}
    >
      {children}
    </th>
  )
}

/* =========================================================
   USER TABLE ROW
========================================================= */

function UserTableRow({
  user,
  openProfile,
  handleToggleAccount,
    handleDeleteAccount,

  setSelectedCustomer,
  setReason,
  setAdminNotes,
  setShowHistoryModal,
  setShowWarningModal,
  setShowBanModal,
  setShowUnbanModal,
  loadHistory,
  processing,
  formatDateTime,
  getAccountAgeLabel,
  getActivityLabel,
}) {
  return (
    <tr className="border-b border-gray-100 transition hover:bg-gray-50/70">

      {/* USER */}

      <td className="px-4 py-4">

        <div className="flex min-w-[220px] items-center gap-3">

          <Avatar
            user={user}
            size="sm"
          />

          <div className="min-w-0">

            <p className="truncate text-sm font-black text-gray-900">
              {user.name ||
                'Unnamed User'}
            </p>

            <p className="truncate text-xs text-gray-400">
              @{user.username ||
                'no username'}
            </p>

          </div>

        </div>

      </td>

      

      {/* CONTACT */}

      <td className="px-4 py-4">

        <div className="min-w-[190px]">

          <p className="truncate text-xs font-semibold text-gray-700">
            {user.email}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {user.phone ||
              'No phone number'}
          </p>

        </div>

      </td>

      {/* ROLE */}

      <td className="px-4 py-4">

        <RoleBadge
          role={user.role}
        />

      </td>

      {/* ACCOUNT */}

      <td className="px-4 py-4">

        <div className="min-w-[130px]">

          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-extrabold
              ${
                user.is_active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }
            `}
          >
            {user.is_active ? (
              <FaCheckCircle />
            ) : (
              <FaUserSlash />
            )}

            {user.is_active
              ? 'Active'
              : 'Deactivated'}
          </span>

          <p className="mt-1.5 text-[10px] font-semibold text-gray-400">
            {getAccountAgeLabel(
              user.created_at
            )}
          </p>

        </div>

      </td>

      

      {/* ACTIVITY */}

      <td className="px-4 py-4">

        <div className="min-w-[140px]">

          <ActivityBadge
            lastSeen={
              user.last_seen
            }
          />

          <p className="mt-1.5 text-[10px] text-gray-400">
            {user.last_seen
              ? formatDateTime(
                  user.last_seen
                )
              : 'No activity recorded'}
          </p>

        </div>

      </td>



      {/* STATUS */}

      <td className="px-4 py-4">

        {user.role ===
        'customer' ? (
          <ModerationBadge
            status={
              user.moderationStatus
            }
            warningCount={
              user.warningCount
            }
          />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold capitalize text-slate-600">
            <FaShieldAlt />
            {user.role ===
            'technician'
              ? 'Staff Account'
              : 'Admin Account'}
          </span>
        )}

      </td>

      {/* ACTIONS */}

      <td className="px-4 py-4">

        <div className="flex justify-end gap-1.5">

          {/* PROFILE */}

          <ActionButton
            title="View Profile"
            onClick={() =>
              openProfile(user)
            }
          >
            <FaEye />
          </ActionButton>

          {/* ACCOUNT */}

          <ActionButton
            title={
              user.is_active
                ? 'Deactivate Account'
                : 'Reactivate Account'
            }
            onClick={() =>
              handleToggleAccount(
                user
              )
            }
            disabled={
              processing
            }
            variant={
              user.is_active
                ? 'danger'
                : 'success'
            }
          >
            {user.is_active ? (
              <FaUserSlash />
            ) : (
              <FaUserCheck />
            )}
          </ActionButton>

                    <ActionButton
            title="Delete Account"
            onClick={() => handleDeleteAccount(user)}
            disabled={processing}
            variant="danger"
          >
            <FaTrash />
          </ActionButton>

          {/* CUSTOMER MODERATION */}

          {user.role ===
            'customer' && (
            <>
              <ActionButton
                title="Moderation History"
                onClick={() => {
                  setSelectedCustomer(
                    user
                  )
                  loadHistory(user)
                  setShowHistoryModal(
                    true
                  )
                }}
              >
                <FaHistory />
              </ActionButton>



              {user.moderationStatus !==
                'banned' && (
                <ActionButton
                  title="Issue Warning"
                  onClick={() => {
                    setSelectedCustomer(
                      user
                    )
                    setReason('')
                    setAdminNotes('')
                    setShowWarningModal(
                      true
                    )
                  }}
                  variant="warning"
                >
                  <FaExclamationTriangle />
                </ActionButton>
              )}
              

              {user.moderationStatus !==
                'banned' && (
                <ActionButton
                  title="Ban Account"
                  onClick={() => {
                    setSelectedCustomer(
                      user
                    )
                    setReason('')
                    setAdminNotes('')
                    setShowBanModal(
                      true
                    )
                  }}
                  variant="danger"
                >
                  <FaBan />
                </ActionButton>
              )}

              {user.moderationStatus ===
                'banned' && (
                <ActionButton
                  title="Unban Account"
                  onClick={() => {
                    setSelectedCustomer(
                      user
                    )
                    setReason('')
                    setAdminNotes('')
                    setShowUnbanModal(
                      true
                    )
                  }}
                  variant="success"
                >
                  <FaUnlock />
                </ActionButton>
              )}
            </>
          )}

        </div>

      </td>

    </tr>
  )
}

/* =========================================================
   MOBILE CARD
========================================================= */

function UserMobileCard({
  user,
  openProfile,
  handleToggleAccount,
  handleDeleteAccount,
  setSelectedCustomer,
  setReason,
  setAdminNotes,
  setShowHistoryModal,
  setShowWarningModal,
  setShowBanModal,
  setShowUnbanModal,
  loadHistory,
  processing,
  formatDateTime,
  getAccountAgeLabel,
  getActivityLabel,
}) {
  return (
    <div className="p-4 sm:p-5">

      {/* PROFILE */}

      <div className="flex items-start gap-3">

        <Avatar
          user={user}
          size="md"
        />

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="break-words text-sm font-black text-gray-900">
              {user.name ||
                'Unnamed User'}
            </h3>

            <RoleBadge
              role={user.role}
              small
            />

          </div>

          <p className="mt-0.5 break-all text-xs text-gray-400">
            {user.email}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            @{user.username ||
              'no username'}
          </p>

        </div>

      </div>

      {/* ACCOUNT DETAILS */}

      <div className="mt-4 grid grid-cols-2 gap-2">

        <MobileInfo
          icon={
            <FaCalendarAlt />
          }
          label="Account"
          value={
            getAccountAgeLabel(
              user.created_at
            )
          }
        />

        <MobileInfo
          icon={<FaClock />}
          label="Activity"
          value={
            getActivityLabel(
              user.last_seen
            )
          }
        />

        <MobileInfo
          icon={<FaPhone />}
          label="Phone"
          value={
            user.phone ||
            'Not provided'
          }
        />

        <MobileInfo
          icon={
            <FaMapMarkerAlt />
          }
          label="Address"
          value={
            user.address ||
            'Not provided'
          }
        />

      </div>

      {/* STATUS */}

      <div className="mt-3 flex flex-wrap gap-2">

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-[10px]
            font-extrabold
            ${
              user.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }
          `}
        >
          {user.is_active ? (
            <FaCheckCircle />
          ) : (
            <FaUserSlash />
          )}

          {user.is_active
            ? 'Active Account'
            : 'Deactivated'}
        </span>

        {user.role ===
        'customer' && (
          <ModerationBadge
            status={
              user.moderationStatus
            }
            warningCount={
              user.warningCount
            }
          />
        )}

      </div>

      {/* LAST SEEN */}

      <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">

        <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
          Last Seen
        </p>

        <p className="mt-0.5 text-xs font-semibold text-gray-700">
          {user.last_seen
            ? formatDateTime(
                user.last_seen
              )
            : 'Never active'}
        </p>

      </div>

      {/* APPOINTMENTS */}

      {user.role ===
        'customer' && (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <FaCalendarAlt className="text-red-600" />

              <span className="text-xs font-bold text-gray-700">
                Appointments
              </span>

            </div>

            <span className="text-sm font-black text-red-700">
              {
                user.appointmentCount
              }
            </span>

          </div>

        </div>
      )}

      {/* ACTIONS */}

      <div className="mt-4 flex flex-wrap gap-2">

        <MobileAction
          onClick={() =>
            openProfile(user)
          }
          variant="neutral"
        >
          <FaEye />
          Profile
        </MobileAction>

        <MobileAction
          onClick={() =>
            handleToggleAccount(
              user
            )
          }
          variant={
            user.is_active
              ? 'danger'
              : 'success'
          }
          disabled={
            processing
          }
        >
          {user.is_active ? (
            <FaUserSlash />
          ) : (
            <FaUserCheck />
          )}

          {user.is_active
            ? 'Deactivate'
            : 'Reactivate'}
        </MobileAction>

                

        <MobileAction
          onClick={() => handleDeleteAccount(user)}
          variant="danger"
          disabled={processing}
        >
          <FaTrash />
          Delete
        </MobileAction>

        {user.role ===
          'customer' && (
          <>
            <MobileAction
              onClick={() => {
                setSelectedCustomer(
                  user
                )
                loadHistory(user)
                setShowHistoryModal(
                  true
                )
              }}
              variant="neutral"
            >
              <FaHistory />
              History
            </MobileAction>

                    

            {user.moderationStatus !==
              'banned' && (
              <MobileAction
                onClick={() => {
                  setSelectedCustomer(
                    user
                  )
                  setReason('')
                  setAdminNotes('')
                  setShowWarningModal(
                    true
                  )
                }}
                variant="warning"
              >
                <FaExclamationTriangle />
                Warn
              </MobileAction>
            )}

            {user.moderationStatus !==
              'banned' && (
              <MobileAction
                onClick={() => {
                  setSelectedCustomer(
                    user
                  )
                  setReason('')
                  setAdminNotes('')
                  setShowBanModal(
                    true
                  )
                }}
                variant="danger"
              >
                <FaBan />
                Ban
              </MobileAction>
            )}

            {user.moderationStatus ===
              'banned' && (
              <MobileAction
                onClick={() => {
                  setSelectedCustomer(
                    user
                  )
                  setReason('')
                  setAdminNotes('')
                  setShowUnbanModal(
                    true
                  )
                }}
                variant="success"
              >
                <FaUnlock />
                Unban
              </MobileAction>
            )}
          </>
        )}

      </div>

    </div>
  )
}

/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  user,
  size = 'md',
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-10 w-10'
      : 'h-14 w-14'

  const iconSize =
    size === 'sm'
      ? 'text-base'
      : 'text-xl'

  return (
    <div
      className={`
        ${sizeClass}
        shrink-0
        overflow-hidden
        rounded-2xl
        bg-red-50
      `}
    >

      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={
            user.name ||
            'User'
          }
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-red-300">
          <FaUser
            className={
              iconSize
            }
          />
        </div>
      )}

    </div>
  )
}

/* =========================================================
   GLASS AVATAR (profile modal)
========================================================= */

function GlassAvatar({ user }) {
  return (
    <div
      className="
                relative shrink-0
        h-20 w-20
        sm:h-24 sm:w-24
        rounded-full
        border-2 border-sky-300/70
        bg-white/60
        p-1.5
        shadow-[0_8px_24px_rgba(0,0,0,0.18)]
        backdrop-blur-md
      "
    >
      <div className="h-full w-full overflow-hidden rounded-full bg-red-50">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name || 'User'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-red-300">
            <FaUser className="text-2xl sm:text-3xl" />
          </div>
        )}
      </div>

      {/* glass shine */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
    </div>
  )
}

function CoverBanner({ user }) {
    const theme = ROLE_THEME[user.role] || ROLE_THEME.customer
  const url = user.cover_url

  const isVideo =
    user.cover_type === 'video' ||
    (!user.cover_type &&
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url || ''))

  return (
    <div className={`absolute inset-0 bg-gradient-to-r ${theme.cover}`}>      {url &&
        (isVideo ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ))}
    </div>
  )
}
/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({
  role,
  small = false,
}) {
  const config = {
    customer: {
      label: 'Customer',
      icon: <FaUser />,
      className:
        'bg-blue-50 text-blue-700',
    },

    technician: {
      label: 'Technician',
      icon: <FaWrench />,
      className:
        'bg-amber-50 text-amber-700',
    },

    admin: {
      label: 'Administrator',
      icon: <FaUserShield />,
      className:
        'bg-purple-50 text-purple-700',
    },
  }

  const current =
    config[role] ||
    {
      label: role || 'Unknown',
      icon: <FaUser />,
      className:
        'bg-gray-100 text-gray-600',
    }

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        font-extrabold
        ${
          small
            ? 'px-2 py-0.5 text-[9px]'
            : 'px-2.5 py-1 text-[10px]'
        }
        ${current.className}
      `}
    >
      {current.icon}
      {current.label}
    </span>
  )
}

/* =========================================================
   ROLE CONFIG + MINI BADGE + MINI TILE
========================================================= */

const ROLE_UI = {
  customer: {
    label: 'Customer',
    short: 'CUSTOMER',
    icon: FaUser,
    text: 'text-red-700',        // changed
    bg: 'bg-red-50',             // changed
    tile: 'from-blue-400/80 to-blue-600/80',
  },
  technician: {
    label: 'Technician',
    short: 'TECH',
    icon: FaWrench,
    text: 'text-orange-700',     // changed
    bg: 'bg-orange-50',          // changed
    tile: 'from-amber-400/80 to-orange-500/80',
  },
  admin: {
    label: 'Admin',
    short: 'ADMIN',
    icon: FaUserShield,
    text: 'text-violet-700',     // changed
    bg: 'bg-violet-50',          // changed
    tile: 'from-purple-400/80 to-fuchsia-600/80',
  },
}

function MiniRoleBadge({ role }) {
  const cfg = ROLE_UI[role] || ROLE_UI.customer
  const Icon = cfg.icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-extrabold ${cfg.bg} ${cfg.text}`}
    >
      <Icon className="text-[8px]" />
      {cfg.label}
    </span>
  )
}

function RoleTile({ role }) {
  const cfg = ROLE_UI[role] || ROLE_UI.customer
  const Icon = cfg.icon

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-gradient-to-br ${cfg.tile} text-lg text-white shadow-lg backdrop-blur-md sm:h-14 sm:w-14 sm:text-xl`}
      >
        <Icon />
      </div>

      <span className="-mt-2 rounded-full bg-white px-2.5 py-0.5 text-[8px] font-black tracking-[0.2em] text-slate-600 shadow">
        {cfg.short}
      </span>
    </div>
  )
}

/* =========================================================
   ACTIVITY BADGE
========================================================= */

function ActivityBadge({
  lastSeen,
}) {
  if (!lastSeen) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-extrabold text-gray-500">
        <FaClock />
        Never Active
      </span>
    )
  }

  const date =
    new Date(lastSeen)

  const now =
    new Date()

  const difference =
    now.getTime() -
    date.getTime()

  const sevenDays =
    7 *
    24 *
    60 *
    60 *
    1000

  if (
    difference <=
    sevenDays
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active Recently
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-extrabold text-gray-500">
      <FaClock />
      Inactive
    </span>
  )
}

/* =========================================================
   MODERATION BADGE
========================================================= */

function ModerationBadge({
  status,
  warningCount,
}) {
  if (status === 'banned') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold text-red-700">
        <FaBan />
        Banned
      </span>
    )
  }

  if (status === 'warning') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
        <FaExclamationTriangle />
        Warning {warningCount}/3
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">
      <FaCheckCircle />
      Healthy
    </span>
  )
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  title,
  onClick,
  disabled = false,
  variant = 'neutral',
}) {
  const variants = {
    neutral:
      'border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700',

    warning:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',

    danger:
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',

    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        border
        text-xs
        transition
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  )
}

/* =========================================================
   MOBILE ACTION
========================================================= */

function MobileAction({
  children,
  onClick,
  variant = 'neutral',
  disabled = false,
}) {
  const variants = {
    neutral:
      'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',

    warning:
      'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',

    danger:
      'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',

    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        px-3
        py-2
        text-[11px]
        font-extrabold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  )
}

/* =========================================================
   MOBILE INFO
========================================================= */

function MobileInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-gray-400">

        <span className="text-red-600">
          {icon}
        </span>

        {label}

      </div>

      <p className="mt-1 break-words text-xs font-bold text-gray-700">
        {value}
      </p>

    </div>
  )
}
/* =========================================================
   ROLE THEME (profile modal colors)
========================================================= */

const ROLE_THEME = {
  customer: {
    header: 'from-red-600 via-red-700 to-red-900',
    cover: 'from-red-700 via-red-600 to-red-800',
    accent: 'text-red-600',
    border: 'border-red-100',
    blob: 'bg-red-100/70',
    tile: 'from-red-500 to-red-700',
    glow: 'shadow-red-300/50',
    bar: 'bg-red-600',
    soft: 'from-red-50/80 to-white',
  },
  technician: {
    header: 'from-orange-400 via-orange-500 to-orange-700',
    cover: 'from-orange-500 via-orange-400 to-orange-600',
    accent: 'text-orange-600',
    border: 'border-orange-100',
    blob: 'bg-orange-100/70',
    tile: 'from-orange-400 to-orange-600',
    glow: 'shadow-orange-300/50',
    bar: 'bg-orange-500',
    soft: 'from-orange-50/80 to-white',
  },
  admin: {
    header: 'from-violet-600 via-violet-700 to-violet-900',
    cover: 'from-violet-700 via-violet-600 to-violet-800',
    accent: 'text-violet-600',
    border: 'border-violet-100',
    blob: 'bg-violet-100/70',
    tile: 'from-violet-500 to-violet-700',
    glow: 'shadow-violet-300/50',
    bar: 'bg-violet-600',
    soft: 'from-violet-50/80 to-white',
  },
}
/* =========================================================
   PROFILE MODAL
========================================================= */

function ProfileModal({
  user,
  processing,
  onClose,
  onToggleAccount,
  formatDateTime,
  formatDateOnly,
  getAccountAgeLabel,
}) {
    const theme = ROLE_THEME[user.role] || ROLE_THEME.customer
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-4">

  <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">

        {/* HEADER */}

<div className={`relative flex items-center justify-between overflow-hidden bg-gradient-to-r ${theme.header} px-5 py-4 text-white sm:px-7`}>
  <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
  <div className="pointer-events-none absolute -bottom-12 right-28 h-24 w-24 rounded-full bg-white/5" />

  <div className="relative flex items-center gap-3">
   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-sm shadow-md ring-1 ring-white/30 backdrop-blur">
  <FaIdBadge />
</div>
    <div>
      <h2 className="text-lg font-black">User Profile</h2>
      <p className="text-[11px] text-white/80">Complete account information</p>
    </div>
  </div>

  <button type="button" onClick={onClose} className="relative rounded-xl p-2 transition hover:bg-white/10">
    <FaTimes />
  </button>
</div>

        

        {/* CONTENT */}

        <div className="overflow-y-auto p-5 sm:p-7">

                             {/* COVER + GLASS PROFILE CARD */}

          <div className="-mx-5 -mt-5 sm:-mx-7 sm:-mt-7">

            {/* cover (taller so more of the photo shows) */}
            <div className="relative h-44 overflow-hidden sm:h-56">
              

              <CoverBanner user={user} />

              <div className="absolute left-0 top-0 p-3 sm:p-4">
                <span
                  className={`
                    inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/80 px-3 py-1
                    text-[10px] font-extrabold backdrop-blur-md
                    ${user.is_active ? 'text-emerald-700' : 'text-gray-500'}
                  `}
                >
                  {user.is_active ? <FaCheckCircle /> : <FaUserSlash />}
                  {user.is_active ? 'Active Account' : 'Deactivated'}
                </span>
              </div>

            </div>

            {/* compact glass card, overlaps the cover only slightly */}
            <div className="relative -mt-10 px-3 sm:-mt-12 sm:px-5">

              <div
                className="
                  flex flex-col items-center gap-3
                  rounded-2xl border border-white/70
                  bg-gradient-to-b from-white/5 via-white/10 to-white
                  p-3 shadow-xl backdrop-blur-xl
                  sm:flex-row sm:gap-4 sm:p-4
                "
              >

                <GlassAvatar user={user} />

                <div className="min-w-0 flex-1 text-center sm:text-left">

                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">

                    <h3 className="break-words text-lg font-black text-gray-900 sm:text-xl">
                      {user.name || 'Unnamed User'}
                    </h3>

                    <MiniRoleBadge role={user.role} />

                  </div>

                  <p className="mt-0.5 break-all text-sm font-medium text-gray-500">
                    @{user.username || 'no username'}
                  </p>

                  {user.avatar_uploaded_at && (
                    <p className="mt-0.5 text-[11px] font-semibold text-gray-400">
                      Photo updated {formatDateTime(user.avatar_uploaded_at)}
                    </p>
                  )}

                </div>

                

              </div>

            </div>

          </div>

          <div className="mt-6" />



          {/* ACCOUNT DEACTIVATION DATE AND TIME */}

          {!user.is_active && (
            <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <FaClock className="text-red-600" />

                <p className="text-xs font-extrabold uppercase tracking-wide text-red-600">
                  Account Deactivated
                </p>
              </div>

              <p className="mt-2 text-sm font-bold text-gray-900">
                {formatDateTime(user.deactivatedAt)}
              </p>
            </div>
          )}




          {/* INFORMATION */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <ProfileInfo
              icon={<FaEnvelope />}
              label="Email"
              value={user.email}
              theme={theme}
            />

                        <ProfileInfo
                icon={<FaPhone />}
                label="Phone"
              value={user.phone}
              theme={theme}
            />

                        <ProfileInfo
              icon={
                <FaBirthdayCake />
              }
              label="Birthday"
              value={formatDateOnly(
                user.birthday
              )}
              theme={theme}
            />

                        <ProfileInfo
              icon={
                <FaVenusMars />
              }
              label="Gender"
              value={
                user.gender ||
                'Not provided'
              }
              theme={theme}
            />

                      
                        <ProfileInfo
              icon={
                <FaCalendarAlt />
              }
              label="Account Created"
              value={formatDateTime(
                user.created_at
              )}
              theme={theme}
            />

                        <ProfileInfo
              icon={
                <FaClock />
              }
              label="Last Seen"
              value={
                user.last_seen
                  ? formatDateTime(
                      user.last_seen
                    )
                  : 'Never active'
              }
              theme={theme}
            />

                        <ProfileInfo
              icon={
                <FaUserClock />
              }
              label="Account Age"
              value={getAccountAgeLabel(
                user.created_at
              )}
              theme={theme}
            />

          </div>

          {/* BIO */}

{/* BIO */}
<div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
  <div className="flex items-center gap-2 text-sm font-black text-gray-800">
    <FaUser className={theme.accent} />
    Bio
  </div>

  <div className={`relative mt-3 overflow-hidden rounded-xl border bg-white p-3 pb-4 shadow-sm ${theme.border}`}>
    <p className={`mb-1 text-[9px] font-black uppercase tracking-[0.16em] ${theme.accent}`}>
      About
    </p>
    <p className="relative whitespace-pre-wrap text-sm leading-6 text-gray-600">
      {user.bio || 'No bio provided.'}
    </p>

    <div className={`absolute bottom-0 right-0 h-1 w-20 rounded-tl-full ${theme.bar}`} />
  </div>
</div>

          {/* BOOKING AGREEMENT */}

          <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">

            <div className="flex items-center gap-2 text-sm font-black text-gray-800">

              <FaFileSignature className={theme.accent} />
              Booking Agreement

            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">

                            <ProfileInfo
                icon={
                  <FaFileSignature />
                }
                label="Version"
                value={
                  user.booking_agreement_version ||
                  'Not accepted'
                }
                theme={theme}
              />
                            <ProfileInfo
                icon={
                  <FaCalendarAlt />
                }
                label="Accepted"
                value={
                  user.booking_agreement_accepted_at
                    ? formatDateTime(
                        user.booking_agreement_accepted_at
                      )
                    : 'Not accepted'
                }
              theme={theme}              />

            </div>

          </div>

          

          {/* CUSTOMER DATA */}

          {user.role ===
            'customer' && (
            <>
              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-black text-gray-800">

                  <FaCalendarAlt className="text-red-600" />

                  Appointment Activity

                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">

  <MiniStat
    label="Total"
    value={user.appointmentCount}
  />

  <MiniStat
    label="Pending"
    value={user.appointmentStatuses?.pending || 0}
  />

  <MiniStat
    label="Confirmed"
    value={user.appointmentStatuses?.confirmed || 0}
  />

  <MiniStat
    label="In Progress"
    value={user.appointmentStatuses?.in_progress || 0}
  />

  <MiniStat
    label="Completed"
    value={user.appointmentStatuses?.completed || 0}
  />

  <MiniStat
    label="Cancelled"
    value={user.appointmentStatuses?.cancelled || 0}
  />

  <MiniStat
    label="Rejected"
    value={user.appointmentStatuses?.rejected || 0}
  />

</div>

              </div>

              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">

                <div className="flex items-center gap-2 text-sm font-black text-gray-800">

                  <FaShieldAlt className="text-red-600" />

                  Moderation Status

                </div>

                <div className="mt-3 flex flex-wrap gap-2">

                  <ModerationBadge
                    status={
                      user.moderationStatus
                    }
                    warningCount={
                      user.warningCount
                    }
                  />

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-extrabold text-gray-600">
                    <FaExclamationTriangle />
                    {user.warningCount}/3 Warnings
                  </span>

                </div>

              </div>
            </>
          )}

          {/* TECHNICIAN */}

          {user.role ===
            'technician' && (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">

              <div className="flex items-center gap-2 text-sm font-black text-gray-800">

                <FaWrench className="text-amber-600" />

                Technician Account

              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                This account is assigned the Technician role. Customer moderation actions are not available for technician accounts.
              </p>

            </div>
          )}

          {/* ADMIN */}

          {user.role ===
            'admin' && (
            <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">

              <div className="flex items-center gap-2 text-sm font-black text-gray-800">

                <FaUserShield className="text-purple-600" />

                Administrator Account

              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                This account has Administrator access. Customer moderation actions are not available for administrator accounts.
              </p>

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-between">

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-gray-700
              transition
              hover:bg-gray-100
            "
          >
            Close
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={
              onToggleAccount
            }
            className={`
              rounded-xl
              px-5
              py-3
              text-sm
              font-bold
              text-white
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                user.is_active
                  ? 'bg-red-700 hover:bg-red-800'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }
            `}
          >
            {user.is_active ? (
              <>
                <FaPowerOff className="mr-2 inline" />
                Deactivate Account
              </>
            ) : (
              <>
                <FaUserCheck className="mr-2 inline" />
                Reactivate Account
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({ icon, label, value, theme = ROLE_THEME.customer }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-white p-3 pb-4 shadow-sm ${theme.border}`}>

      <div className="relative flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm text-white shadow-md ${theme.tile} ${theme.glow}`}>
          {icon}
        </div>

        <div className="min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${theme.accent}`}>
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-gray-800">
            {value || 'Not provided'}
          </p>
        </div>
      </div>

<div className={`absolute bottom-0 right-0 h-1 w-20 rounded-tl-full ${theme.bar}`} />
    </div>
  )
}

/* =========================================================
   MINI STAT
========================================================= */

const MINI_STAT_BAR = {
  total: 'bg-blue-500',
  pending: 'bg-amber-500',
  confirmed: 'bg-sky-500',
  'in progress': 'bg-indigo-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-orange-500',
  rejected: 'bg-rose-700',
}

function MiniStat({ label, value }) {
  const bar =
    MINI_STAT_BAR[label?.toLowerCase()] || 'bg-gray-400'

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-1.5 py-3 text-center">

      <p className="whitespace-nowrap text-[8px] font-extrabold uppercase tracking-tight text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-gray-800">
        {value}
      </p>

      <div className={`mx-auto mt-2 h-1 w-8 rounded-full ${bar}`} />

    </div>
  )
}
/* =========================================================
   MODERATION MODAL
========================================================= */

const MOD_THEME = {
  warning: {
    header: 'from-amber-400 via-amber-500 to-amber-700',
    border: 'border-amber-100',
    soft: 'from-amber-50/80 to-white',
    blob: 'bg-amber-100/70',
    focus: 'focus:border-amber-500 focus:ring-amber-50',
    button: 'from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 shadow-amber-300/50',
  },
  ban: {
    header: 'from-red-600 via-red-700 to-red-900',
    border: 'border-red-100',
    soft: 'from-red-50/80 to-white',
    blob: 'bg-red-100/70',
    focus: 'focus:border-red-500 focus:ring-red-50',
    button: 'from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-red-300/50',
  },
  unban: {
    header: 'from-emerald-400 via-emerald-500 to-emerald-700',
    border: 'border-emerald-100',
    soft: 'from-emerald-50/80 to-white',
    blob: 'bg-emerald-100/70',
    focus: 'focus:border-emerald-500 focus:ring-emerald-50',
    button: 'from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-emerald-300/50',
  },
}

function ModerationModal({
  type, title, icon, user,
  reason, setReason, adminNotes, setAdminNotes,
  processing, onClose, onSubmit,
}) {
  const isWarning = type === 'warning'
  const isBan = type === 'ban'
  const t = MOD_THEME[type] || MOD_THEME.unban

  const textareaClass = `w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:ring-4 ${t.focus}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">

        {/* HEADER */}
        <div className={`relative flex items-center justify-between overflow-hidden bg-gradient-to-r ${t.header} px-5 py-4 text-white`}>
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 right-24 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur">
              {icon}
            </div>
            <div>
              <h2 className="text-lg font-black">{title}</h2>
              <p className="text-[11px] text-white/80">{user.name}</p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="relative rounded-xl p-2 transition hover:bg-white/10">
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4 overflow-y-auto p-5">
          <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 ${t.border} ${t.soft}`}>
            <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full ${t.blob}`} />
            <p className="relative text-xs leading-5 text-gray-600">
              {isWarning
                ? 'Issue a formal warning to this customer. Warnings are tracked and may contribute toward the account warning threshold.'
                : isBan
                  ? 'Ban this customer account. The existing moderation system will record the action and reason.'
                  : 'Restore access to this previously banned customer account.'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-gray-600">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder={
                isWarning
                  ? 'Enter the reason for this warning...'
                  : isBan
                    ? 'Enter the reason for banning this account...'
                    : 'Enter the reason for restoring this account...'
              }
              className={textareaClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-gray-600">
              Admin Notes
              <span className="ml-1 font-medium normal-case text-gray-400">Optional</span>
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              placeholder="Add internal notes if needed..."
              className={textareaClass}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={processing}
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={processing || !reason.trim()}
            onClick={onSubmit}
            className={`rounded-xl bg-gradient-to-r px-5 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${t.button}`}
          >
            {processing
              ? 'Processing...'
              : isWarning
                ? 'Issue Warning'
                : isBan
                  ? 'Ban Account'
                  : 'Unban Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   HISTORY MODAL
========================================================= */

function HistoryModal({
  user,
  history,
  loading,
  processing,
  onDeleteHistory,
  onClose,
  formatDateTime,
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center overscroll-contain bg-slate-950/70 p-0 sm:items-center sm:p-4">

  <div className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">

        {/* HEADER */}

        <div className="relative flex items-center justify-between overflow-hidden bg-gradient-to-r from-slate-700 via-slate-800 to-slate-950 px-5 py-4 text-white sm:px-6">
  <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10" />

  <div className="relative flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shadow-lg ring-1 ring-white/30 backdrop-blur">
      <FaHistory />
    </div>
    <div>
      <h2 className="text-lg font-black">Moderation History</h2>
      <p className="text-[11px] text-gray-300">{user.name}</p>
    </div>
  </div>

  <button type="button" onClick={onClose} className="relative rounded-xl p-2 transition hover:bg-white/10">
    <FaTimes />
  </button>
</div>



        {/* CONTENT */}

        <div className="overflow-y-auto p-5">

          {loading ? (
            <div className="py-12 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-red-100 border-t-red-700" />

              <p className="mt-3 text-xs font-bold text-gray-500">
                Loading history...
              </p>

            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
                <FaHistory className="text-gray-300" />
              </div>

              <h3 className="mt-3 text-sm font-black text-gray-800">
                No moderation history
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                No moderation actions have been recorded for this account.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

                            {history.map(
                (item) => (
                  <HistoryItem
                    key={item.id}
                    item={item}
                    formatDateTime={formatDateTime}
                    processing={processing}
                    onDelete={onDeleteHistory}
                  />
                )
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="border-t border-gray-100 bg-gray-50 p-4">

          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-gray-700
              transition
              hover:bg-gray-100
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>
  )
}

/* =========================================================
   HISTORY ITEM
========================================================= */

function HistoryItem({ item, formatDateTime, processing, onDelete }) {
  const isBan = item.action_type === 'ban'
  const isWarning = item.action_type === 'warning'
  const isUnban = item.action_type === 'unban'

  const tone = isBan
    ? { border: 'border-red-100', soft: 'from-red-50/70 to-white', blob: 'bg-red-100/70', tile: 'from-red-500 to-red-700', glow: 'shadow-red-300/50', bar: 'bg-red-600', text: 'text-red-600' }
    : isWarning
      ? { border: 'border-amber-100', soft: 'from-amber-50/70 to-white', blob: 'bg-amber-100/70', tile: 'from-amber-400 to-amber-600', glow: 'shadow-amber-300/50', bar: 'bg-amber-500', text: 'text-amber-600' }
      : isUnban
        ? { border: 'border-emerald-100', soft: 'from-emerald-50/70 to-white', blob: 'bg-emerald-100/70', tile: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-300/50', bar: 'bg-emerald-600', text: 'text-emerald-600' }
        : { border: 'border-slate-200', soft: 'from-slate-50 to-white', blob: 'bg-slate-100', tile: 'from-slate-500 to-slate-700', glow: 'shadow-slate-300/50', bar: 'bg-slate-500', text: 'text-slate-600' }

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 pb-5 ${tone.border} ${tone.soft}`}>
      <div className={`absolute -right-7 -top-7 h-20 w-20 rounded-full ${tone.blob}`} />

      <div className="relative flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg ${tone.tile} ${tone.glow}`}>
          {isBan ? <FaBan /> : isWarning ? <FaExclamationTriangle /> : isUnban ? <FaUnlock /> : <FaHistory />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.16em] ${tone.text}`}>
                {item.action_type?.replace('_', ' ')}
              </h3>
              {item.warning_number && (
                <p className="mt-0.5 text-[10px] font-bold text-amber-600">
                  Warning #{item.warning_number}
                </p>
              )}
            </div>
            <span className="text-[10px] font-semibold text-gray-400">
              {formatDateTime(item.created_at)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-600">
            {item.reason || 'No reason provided.'}
          </p>

          {item.admin_notes && (
            <div className="mt-3 rounded-xl border border-gray-100 bg-white/80 p-3">
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Admin Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-gray-600">{item.admin_notes}</p>
            </div>
          )}

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={processing}
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 h-1 w-14 rounded-tr-full ${tone.bar}`} />
    </div>
  )
}