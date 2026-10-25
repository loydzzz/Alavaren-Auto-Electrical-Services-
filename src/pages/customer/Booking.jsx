import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useLocation, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { Globe2, Store, Loader2, ChevronDown, Lock } from 'lucide-react'


const ATTACHMENT_BUCKET = 'service-task-attachments'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_ATTACHMENTS = 2

const BOOKING_AGREEMENT_VERSION = '1.0'

// ========================================================= 
// // ZIP CODE FALLBACKS // Used only when PSGC does not provide a ZIP code. // 
// ========================================================= 
const ZIP_CODE_FALLBACKS = { 
  //NCR
  '140000000': '1400', //Caloocan 
  '170000000': '1740', //Las Piñas 
  '160000000': '1200', //Makati 
  '137000000': '1470', //Malabon 
  '074000000': '1550', //Mandaluyong 
  '138000000': '1000', //Manila 
  '041000000': '1800', //Marikina 
  '086000000': '1770', //Muntinlupa 
  '126000000': '1485', //Navotas 
  '076000000': '1700', //Parañaque 
  '079000000': '1600', //Pasig 
  '086000000': '1500', //San Juan 
  '128000000': '1630', //Taguig 
  '084000000': '1440', //Valenzuela 
  '136000000': '1300', //Pasay 
  '137000000': '1620', //Pateros 
  '129000000': '1100', // Quezon City 
  }

const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = '',
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `shrink-0 ${className}`,
  }

  const icons = {

    user: (
  <svg {...common}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
),

phone: (
  <svg {...common}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
  </svg>
),
    car: (
      <svg {...common}>
        <path d="M5 17h14l1-5-2-5H6L4 12l1 5Z" />
        <path d="M7 17v2" />
        <path d="M17 17v2" />
        <path d="M4 12h16" />
        <circle cx="7" cy="15" r="1" />
        <circle cx="17" cy="15" r="1" />
      </svg>
    ),

    plate: (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M7 10h10" />
        <path d="M7 14h6" />
      </svg>
    ),

    wrench: (
      <svg {...common}>
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-.7-.7-2.8 2.6-1.6Z" />
      </svg>
    ),

    calendar: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),

    clock: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    chevronDown: (
<svg {...common}> <path d="m6 9 6 6 6-6" /> </svg>
),




    note: (
      <svg {...common}>
        <path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M8 12h8M8 16h6" />
      </svg>
    ),
store: (
  <svg {...common}>
    <path d="M4 10h16v10H4z" />
    <path d="M3 10 5 4h14l2 6" />
    <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M9 20v-5h6v5" />
  </svg>
),

mapPin: (
  <svg {...common}>
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
),


    upload: (
      <svg {...common}>
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 20h14" />
      </svg>
    ),

    image: (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m21 15-5-5L5 20" />
      </svg>
    ),

    video: (
      <svg {...common}>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3v-4Z" />
      </svg>
    ),

    shield: (
      <svg {...common}>
        <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    ),

    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    arrowLeft: (
      <svg {...common}>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
    ),

    arrowRight: (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    ),

    x: (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    ),

    bolt: (
      <svg {...common}>
        <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    ),

    alternator: (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5V3M12 21v-2M5 12H3M21 12h-2" />
      </svg>
    ),

    window: (
      <svg {...common}>
        <path d="M4 5h16v14H4z" />
        <path d="m4 14 5-5 4 4 2-2 5 5" />
      </svg>
    ),

    cpu: (
      <svg {...common}>
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" />
      </svg>
    ),

    generator: (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m12 8-3 4h3l-1 4 4-5h-3l2-3" />
      </svg>
    ),

    settings: (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h3v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v3h-.1a1.7 1.7 0 0 0-1.5.8Z" />
      </svg>
    ),

    info: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    ),

        location: (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),

    loader: (
      <svg {...common}>
        <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      </svg>
    ),

    alertCircle: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </svg>
    ),
  }

  return icons[name] || icons.settings
}

const PSGC_API = 'https://psgc.cloud/api/v2'

const SERVICE_HOURS = {
  shop: { start: 8, end: 18 }, // 8:00 AM - 6:00 PM
  home: { start: 8, end: 16 }, // 8:00 AM - 4:00 PM
}

function getTimeSlots(arrangement, dateValue, now = new Date()) {
  const { start, end } = SERVICE_HOURS[arrangement] || SERVICE_HOURS.shop
  const pad = (n) => String(n).padStart(2, '0')

  const slots = []
  for (let h = start; h <= end; h++) slots.push(`${pad(h)}:00`)

  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  // Other dates: full schedule
  if (dateValue !== today) return slots

  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  if (nowMinutes > end * 60) return []        // closed for today
  if (nowMinutes < start * 60) return slots   // not open yet

  // Today: current time + the hours after it
  const upcoming = slots.filter((s) => Number(s.slice(0, 2)) * 60 > nowMinutes)
  return [`${pad(now.getHours())}:${pad(now.getMinutes())}`, ...upcoming]
}

// "2026-10-23" + "09:00" -> "October 23, 2026 at 9:00 AM"
function formatBookingSchedule(date, time) {
  if (!date) return 'Not specified'

  const datePart = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!time) return datePart

  const timePart = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} at ${timePart}`
}

// ISO timestamp -> "October 23, 2026 at 9:00 AM"
function formatTimestamp(value) {
  if (!value) return ''

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''

  const datePart = d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart} at ${timePart}`
}


export default function Booking() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const submittingRef = useRef(false)
  const [userRole, setUserRole] = useState('')
const location = useLocation()
const [serviceArrangementError, setServiceArrangementError] =
  useState(false)

const handleBack = () => {
  if (location.pathname.startsWith('/admin')) {
    navigate('/admin')
  } else {
    navigate('/customer')
  }
}

 // =====================================================
// WALK-IN ADDRESS DATA
// =====================================================

const [regions, setRegions] = useState([])
const [provinces, setProvinces] = useState([])
const [citiesMunicipalities, setCitiesMunicipalities] = useState([])
const [barangays, setBarangays] = useState([])

const [loadingRegions, setLoadingRegions] = useState(false)
const [loadingProvinces, setLoadingProvinces] = useState(false)
const [loadingCities, setLoadingCities] = useState(false)
const [loadingBarangays, setLoadingBarangays] = useState(false)
const [loadingZip, setLoadingZip] = useState(false)




  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleLoading, setRoleLoading] = useState(true)
  // =====================================================
// SUNDAY LOCK (WALK-IN)
// Walk-in booking is closed on Sundays.
// "now" refreshes every minute so the lock lifts
// automatically once Monday starts.
// =====================================================

const [lockNow, setLockNow] = useState(() => new Date())

useEffect(() => {
  const timer = setInterval(() => {
    setLockNow(new Date())
  }, 60 * 1000)

  return () => clearInterval(timer)
}, [])

const isSundayToday = lockNow.getDay() === 0

// Only walk-in (admin) booking is locked, and only after
// the role has been checked so customers never see a flash of it.
const isWalkInLocked = isAdmin && !roleLoading && isSundayToday

const lockedDateLabel = lockNow.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const [currentUser, setCurrentUser] = useState(null)

// =====================================================
// BOOKING AGREEMENT
// Customer only — UI state for the required agreement.
// Supabase saving will be added in a later step.
// =====================================================

const [showBookingAgreement, setShowBookingAgreement] =
  useState(false)
const [bookingAgreementVersion, setBookingAgreementVersion] =
  useState(null)
const [agreementScrolledToBottom, setAgreementScrolledToBottom] =
  useState(false)

const [agreementChecked, setAgreementChecked] =
  useState(false)

  const [viewingBookingAgreement, setViewingBookingAgreement] =
  useState(false)

  const [bookingAgreementAcceptedAt, setBookingAgreementAcceptedAt] =
  useState(null)



const agreementScrollRef = useRef(null)

const bookingSource = isAdmin
  ? 'walkin'
  : 'online'

const [serviceArrangement, setServiceArrangement] = useState('')
  const [showAttachmentModal, setShowAttachmentModal] =
    useState(false)

  const [selectedFiles, setSelectedFiles] =
    useState([])

  const [uploadingAttachment, setUploadingAttachment] =
    useState(false)

  const [dragActive, setDragActive] =
    useState(false)

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
  })

  const [form, setForm] = useState({
  vehicle_model: '',
  plate_number: '',

// Vehicle information
  fuel_type: '',
  battery_voltage: '',
  transmission_type: '',

  service_type: '',
  date: '',
  time: '',
  notes: '',

  // Walk-in customer
  customer_name: '',
  mobile_number: '',
  customer_address: '',

  // Walk-in address fields
  region: '',
  province: '',
  cityMunicipality: '',
  barangay: '',
  zipCode: '',
  street: '',
})

// Freezes "now" so the 10:23 option doesn't change every re-render
const slotNow = useMemo(
  () => new Date(),
  [form.date, serviceArrangement]
)

  // Stores the booking information for the success modal
  // before the main form gets reset.
  const [submittedBooking, setSubmittedBooking] =
  useState({
    appointment_no: '',
    vehicle_model: '',
    plate_number: '',
    fuel_type: '',
    battery_voltage: '',
    transmission_type: '',
    customer_address: customer.address || '',
    service_type: '',
    date: '',
    time: '',
  })

 useEffect(() => {
  const loadUserAndCustomer = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        return
      }

      setCurrentUser(user)

      const {
        data: userData,
        error: profileError,
      } = await supabase
        .from('users')
        .select(
  'name, phone, address, role, booking_agreement_version, booking_agreement_accepted_at'
)
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error(
          'Error loading user profile:',
          profileError
        )
        return
      }

      // ==========================================
      // DETERMINE USER ROLE
      // ==========================================

      const adminUser =
        userData?.role === 'admin'

      setIsAdmin(adminUser)

      setBookingAgreementVersion(
  userData?.booking_agreement_version || null
)

setBookingAgreementAcceptedAt(
  userData?.booking_agreement_accepted_at || null
)
      // ==========================================
      // CUSTOMER
      // ==========================================

      if (!adminUser) {
        setCustomer({
          name: userData?.name || '',
          phone: userData?.phone || '',
          address: userData?.address || '',
        })
      }

      // ==========================================
      // ADMIN
      // ==========================================

      if (adminUser) {
        setCustomer({
          name: '',
          phone: '',
          address: '',
        })
      }

    } catch (error) {
      console.error(
        'User loading error:',
        error
      )
    } finally {
      // IMPORTANT:
      // User role has now been checked.
      setRoleLoading(false)
    }
  }

  loadUserAndCustomer()
}, [])



// =====================================================
// BOOKING AGREEMENT - SHOW FOR CUSTOMERS
// =====================================================

useEffect(() => {
  if (roleLoading) return

  // Admin walk-in bookings do not need the agreement.
  if (isAdmin) {
    setShowBookingAgreement(false)
    return
  }

  // Customer has already accepted the current version.
  if (
    bookingAgreementVersion ===
    BOOKING_AGREEMENT_VERSION
  ) {
    setShowBookingAgreement(false)
    return
  }

  // Customer has not accepted the current version yet.
  setShowBookingAgreement(true)
  setAgreementScrolledToBottom(false)
  setAgreementChecked(false)
}, [
  roleLoading,
  isAdmin,
  bookingAgreementVersion,
])




// =====================================================
// BOOKING AGREEMENT - SCROLL DETECTION
// =====================================================

const handleAgreementScroll = (e) => {
  const element = e.currentTarget

  const reachedBottom =
    element.scrollTop + element.clientHeight >=
    element.scrollHeight - 8

  if (reachedBottom) {
    setAgreementScrolledToBottom(true)
  }
}





  useEffect(() => {
    return () => {
      selectedFiles.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl)
        }
      })
    }
  }, [selectedFiles])

  const serviceVisuals = {
    'Alternator Repair': {
      icon: 'alternator',
      description:
        'Charging system and alternator service',
    },

    'Starter Repair': {
      icon: 'bolt',
      description:
        'Starter motor and starting system',
    },

    'Power Window Motor Repair': {
      icon: 'window',
      description:
        'Power window motor and controls',
    },

    'ECU Repair': {
      icon: 'cpu',
      description:
        'Engine computer diagnostics and repair',
    },

    'BCM Repair': {
      icon: 'settings',
      description:
        'Body control module electrical service',
    },

    'EPS Module Repair': {
      icon: 'settings',
      description:
        'Electronic power steering module',
    },

    'ECU Programming': {
      icon: 'cpu',
      description:
        'ECU programming and configuration',
    },

    'Generator Services': {
      icon: 'generator',
      description:
        'Generator electrical inspection and repair',
    },

    Others: {
      icon: 'wrench',
      description:
        'Describe the electrical issue you need fixed',
    },
  }





  const validateBookingForm = () => {
    if (!form.service_type) {
      toast.error('Please select a service.')
      return false
    }

    if (!form.date) {
      toast.error(
        'Please select an appointment date.'
      )
      return false
    }

    if (!form.time) {
      toast.error(
        'Please select an appointment time.'
      )
      return false
    }

        const hours = isAdmin
      ? SERVICE_HOURS.shop
      : SERVICE_HOURS[serviceArrangement] || SERVICE_HOURS.shop

    const pad2 = (n) => String(n).padStart(2, '0')

    if (
      form.time < `${pad2(hours.start)}:00` ||
      form.time > `${pad2(hours.end)}:00`
    ) {
      toast.error(
        serviceArrangement === 'home' && !isAdmin
          ? 'Home / On-Site service is available between 8:00 AM and 4:00 PM.'
          : 'Appointment time must be between 8:00 AM and 6:00 PM.'
      )
      return false
    }

    // Customers: block times that have already passed (checked at submit)
    if (!isAdmin) {
      const open = getTimeSlots(serviceArrangement, form.date)

      if (
        open.length === 0 ||
        form.time.slice(0, 2) < open[0].slice(0, 2)
      ) {
        toast.error(
          'That time is no longer available. Please pick another.'
        )
        return false
      }
    }

     // ==========================================
  // VALIDATE PLATE NUMBER
  // ==========================================

  const platePattern =
    /^[A-Z]{3,4} [0-9]{3,4}$/

  if (!platePattern.test(form.plate_number)) {
    toast.error(
      'Please enter a valid plate number, such as ABC 1234 or ABCD 123.'
    )
    return false
  }

  if (
    form.service_type === 'Others' &&
    !form.notes.trim()
  ) {
    toast.error(
      'Please describe your concern.'
    )
    return false
  }

  return true
}









  const validateFile = (file) => {
    if (!file) {
      toast.error(
        'Please select an image or video.'
      )
      return false
    }

    const isImage =
      file.type.startsWith('image/')

    const isVideo =
      file.type.startsWith('video/')

    if (!isImage && !isVideo) {
      toast.error(
        'Only image and video files are allowed.'
      )
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        'Each file must not exceed 50MB.'
      )
      return false
    }

    return true
  }

  const addFiles = (files) => {
  const incomingFiles = Array.from(files || [])

  if (!incomingFiles.length) return

  // ==========================================
  // MAX ATTACHMENTS
  // ==========================================

  if (
    selectedFiles.length +
      incomingFiles.length >
    MAX_ATTACHMENTS
  ) {
    toast.error(
      'You can upload a maximum of 2 attachments.'
    )
    return
  }

  // ==========================================
  // PRIMARY ATTACHMENT MUST BE AN IMAGE
  // ==========================================
  //
  // The first attachment is sent to the
  // Vehicle AI. Therefore it MUST be a photo.
  //

  const firstAttachment =
    selectedFiles.length === 0

  if (
    firstAttachment &&
    incomingFiles[0] &&
    !incomingFiles[0].type.startsWith('image/')
  ) {
    toast.error(
      'The first attachment must be a clear vehicle photo. A video can only be added as the second attachment.'
    )
    return
  }

  // ==========================================
  // VALIDATE ALL FILES
  // ==========================================

  const validFiles = []

  for (const file of incomingFiles) {
    if (validateFile(file)) {
      validFiles.push({
        file,
        previewUrl:
          URL.createObjectURL(file),
      })
    }
  }

  if (!validFiles.length) return

  // ==========================================
  // SAFETY CHECK
  // ==========================================
  //
  // If this is the first attachment, make
  // absolutely sure it is an image.
  //

  if (
    selectedFiles.length === 0 &&
    !validFiles[0].file.type.startsWith(
      'image/'
    )
  ) {
    validFiles.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(
          item.previewUrl
        )
      }
    })

    toast.error(
      'The first attachment must be a vehicle photo.'
    )

    return
  }

  setSelectedFiles((previous) => [
    ...previous,
    ...validFiles,
  ])
}


  const handleFileInputChange = (e) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    addFiles(e.dataTransfer.files)
  }

  const removeSelectedFile = (index) => {
    setSelectedFiles((previous) => {
      const item = previous[index]

      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl)
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    })
  }

  const replaceSelectedFile = (
  index,
  file
) => {
  if (!validateFile(file)) return

  // ==========================================
  // ATTACHMENT #1 MUST ALWAYS BE AN IMAGE
  // ==========================================

  if (
    index === 0 &&
    !file.type.startsWith('image/')
  ) {
    toast.error(
      'The first attachment must be a vehicle photo. A video can only be used as the second attachment.'
    )

    return
  }

  const previewUrl =
    URL.createObjectURL(file)

  setSelectedFiles((previous) => {
    const oldFile = previous[index]

    if (oldFile?.previewUrl) {
      URL.revokeObjectURL(
        oldFile.previewUrl
      )
    }

    return previous.map(
      (item, itemIndex) =>
        itemIndex === index
          ? {
              file,
              previewUrl,
            }
          : item
    )
  })
}


  const handleReplaceInput = (
    e,
    index
  ) => {
    const file = e.target.files?.[0]

    if (file) {
      replaceSelectedFile(
        index,
        file
      )
    }

    e.target.value = ''
  }

  const clearSelectedFiles = () => {
    selectedFiles.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(
          item.previewUrl
        )
      }
    })

    setSelectedFiles([])
  }

  const closeAttachmentModal = () => {
    if (
      uploadingAttachment ||
      loading
    ) {
      return
    }

    setShowAttachmentModal(false)
    clearSelectedFiles()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (isWalkInLocked) {
  toast.error('Walk-in booking is locked on Sundays.')
  return
}

    if (!isAdmin && !serviceArrangement) {
  setServiceArrangementError(true)

  toast.error(
    'Please select a service arrangement before submitting your booking.'
  )

  return
}



    if (!validateBookingForm()) {
      return
    }

    setShowAttachmentModal(true)
  }

  const submitBookingWithAttachment =
  async () => {

    

    // ==========================================
    // PREVENT DOUBLE SUBMIT
    // ==========================================

    if (submittingRef.current) {
      console.log(
        'Submit already in progress. Ignoring duplicate click.'
      )

      return
    }

    submittingRef.current = true

    // ==========================================
    // VALIDATE ATTACHMENTS
    // ==========================================

    if (
      selectedFiles.length === 0
    ) {
      submittingRef.current = false

      toast.error(
        'Please upload at least one photo or video.'
      )

      return
    }

    if (
      selectedFiles.length >
      MAX_ATTACHMENTS
    ) {
      submittingRef.current = false

      toast.error(
        'You can upload a maximum of 2 attachments.'
      )

      return
    }

    // ==========================================
    // PRIMARY ATTACHMENT MUST BE IMAGE
    // ==========================================

    if (
      !selectedFiles[0]?.file?.type.startsWith(
        'image/'
      )
    ) {
      submittingRef.current = false

      toast.error(
        'Your first attachment must be a clear vehicle photo.'
      )

      return
    }

    setUploadingAttachment(true)
    setLoading(true)

    let createdAppointmentId = null

    const uploadedFilePaths = []

    try {




        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error(
            'You must be logged in to book an appointment.'
          )
        }
const isAdminBooking =
  isAdmin

console.log('BOOKING ROLE CHECK:', {
  isAdmin,
  isAdminBooking,
})

const bookingSource =
  isAdminBooking
    ? 'walkin'
    : 'online'

// ==========================================
// UPLOADER = whoever is logged in
// Walk-in  → the admin
// Online   → the customer
// ==========================================
const {
  data: uploaderProfile,
  error: uploaderError,
} = await supabase
  .from('users')
  .select('name, role')
  .eq('id', user.id)
  .single()

if (uploaderError) {
  throw uploaderError
}

const uploaderName =
  uploaderProfile?.name || 'Unknown user'

const uploaderRole =
  uploaderProfile?.role ||
  (isAdminBooking ? 'admin' : 'customer')

let customerName = ''
let customerPhone = ''
let customerAddress = ''
        

       

if (isAdminBooking) {
  // ==========================================
  // ADMIN WALK-IN CUSTOMER
  // ==========================================
  //
  // Use the information entered by the admin
  // for the walk-in customer.
  //

  customerName =
    form.customer_name?.trim() || ''

  customerPhone =
    form.mobile_number?.trim() || ''

  customerAddress =
    form.customer_address?.trim() || ''

} else {

  // ==========================================
  // NORMAL ONLINE CUSTOMER
  // ==========================================
  //
  // Use the logged-in customer's profile.
  //

  const {
    data: customerData,
    error: customerError,
  } = await supabase
    .from('users')
    .select('name, phone, address')
    .eq('id', user.id)
    .single()

  if (customerError) {
    throw customerError
  }

  customerName =
    customerData?.name ||
    customer.name ||
    ''

  customerPhone =
    customerData?.phone ||
    customer.phone ||
    ''

  customerAddress =
    customerData?.address ||
    customer.address ||
    ''
}





        // ==========================================
        // CREATE APPOINTMENT
        // ==========================================

        // ==========================================
// CREATE APPOINTMENT
// ==========================================

const {
  data: appointment,
  error: appointmentError,
} = await supabase
  .from('appointments')
  .insert([
    {
      customer_id:
  isAdminBooking
    ? null
    : user.id,


      customer_name: customerName,

      mobile_number: customerPhone,

      // Automatically copied from customer's profile
      customer_address: customerAddress,

      booking_source: bookingSource,
      service_arrangement: isAdminBooking ? 'shop' : (serviceArrangement || null),

      assisted_by:
  isAdminBooking
    ? user.id
    : null,


     vehicle_model: form.vehicle_model,
plate_number: form.plate_number,

// Vehicle information
fuel_type: form.fuel_type,
battery_voltage: form.battery_voltage,
transmission_type: form.transmission_type,

service_type: form.service_type,
appointment_date: form.date,

      appointment_time: form.time,

      notes: form.notes,

      status: 'pending',
    },
  ])
  .select()
  .single()

if (appointmentError) {
  throw appointmentError
}


createdAppointmentId =
  appointment?.id


const safeAppointmentId =
  Number(createdAppointmentId)

if (
  !Number.isInteger(
    safeAppointmentId
  ) ||
  safeAppointmentId <= 0
) {
  throw new Error(
    "Invalid appointment ID."
  )
}

const appointmentNumber =
  `APPT-${String(safeAppointmentId).padStart(6, '0')}`


// ==========================================
// SAVE SUCCESS MODAL DATA BEFORE RESET
// ==========================================

setSubmittedBooking({
  appointment_no:
    appointmentNumber,

  vehicle_model:
    form.vehicle_model,

  plate_number:
    form.plate_number,

  // Vehicle information
  fuel_type:
    form.fuel_type,

  battery_voltage:
    form.battery_voltage,

  transmission_type:
    form.transmission_type,

  customer_address:
    customerAddress,

  service_type:
    form.service_type,

  date:
    form.date,

  time:
    form.time,
})

        // ==========================================
        // UPLOAD UP TO 2 ATTACHMENTS
        // ==========================================

        for (
          let index = 0;
          index < selectedFiles.length;
          index++
        ) {
          const selected =
            selectedFiles[index]

          const file =
            selected.file

          const originalName =
            file.name ||
            `attachment-${index + 1}`

          const sanitizedName =
            originalName
              .replace(
                /[^a-zA-Z0-9._-]/g,
                '_'
              )
              .replace(
                /_+/g,
                '_'
              )

          const finalFileName =
            sanitizedName ||
            `attachment-${index + 1}`

          // IMPORTANT:
          // Keep the same storage path structure.
          const filePath =
            `${user.id}/` +
            `${safeAppointmentId}/` +
            `${Date.now()}-${index}-${finalFileName}`

          const {
            error: uploadError,
          } = await supabase.storage
            .from(
              ATTACHMENT_BUCKET
            )
            .upload(
              filePath,
              file,
              {
                cacheControl:
                  '3600',
                upsert: false,
              }
            )

          if (uploadError) {
            throw uploadError
          }

          uploadedFilePaths.push(
            filePath
          )

          // ========================================
          // INSERT ATTACHMENT RECORD
          // ========================================

          const {
            error: attachmentError,
          } = await supabase
            .from(
              'service_task_attachments'
            )
            .insert([
              {
                appointment_id:
                  safeAppointmentId,
                file_name:
                  file.name,
                file_path:
                  filePath,
                file_type:
                  file.type,
                file_size:
                  file.size,
                uploaded_by:
  user.id,
uploaded_by_name:
  uploaderName,
uploaded_by_role:
  uploaderRole,

              },
            ])

          if (attachmentError) {
            throw attachmentError
          }

// ==========================================
// AI VEHICLE ELIGIBILITY CHECK
// ==========================================
//
// IMPORTANT:
//
// Roboflow ONLY receives an IMAGE.
//
// The first IMAGE found is the primary
// AI verification image.
//
// Videos and additional images are
// supporting evidence only.
//
// Examples:
//
// IMAGE
// → AI verification
//
// IMAGE + VIDEO
// → IMAGE → AI
// → VIDEO → supporting
//
// VIDEO + IMAGE
// → VIDEO → supporting
// → IMAGE → AI
//
// VIDEO ONLY
// → no AI call
// → UNSURE / manual admin review
//
// IMAGE + IMAGE
// → first IMAGE → AI
// → second IMAGE → supporting
// ==========================================


// Find the first IMAGE in the entire
// selectedFiles array.
//
// Do NOT use index === 0 because the
// customer may upload a video first.

const primaryImageIndex =
  selectedFiles.findIndex(
    (item) =>
      item.file.type.startsWith('image/')
  )


// Is this attachment the primary AI image?

const isPrimaryAIImage =
  index === primaryImageIndex


const isImage =
  file.type.startsWith('image/')


const isVideo =
  file.type.startsWith('video/')


// ==========================================
// PRIMARY IMAGE → RUN VEHICLE AI
// ==========================================

if (
  isPrimaryAIImage &&
  isImage
) {

  try {

    console.log(
      '🤖 Starting PRIMARY vehicle AI check:',
      {
        appointment_id:
          safeAppointmentId,

        attachment_index:
          index,

        attachment_path:
          filePath,

        file_name:
          file.name,

        file_type:
          file.type,
      }
    )

    console.log('🚨 ABOUT TO INVOKE VEHICLE AI', {
  appointment_id: safeAppointmentId,
  attachment_path: filePath,
  file_name: file.name,
  file_type: file.type,
})


    const {
      data: aiResult,
      error: aiError,
    } =
      await supabase.functions.invoke(
        'roboflow-vehicle-check',
        {
          body: {
            appointment_id:
              safeAppointmentId,

            attachment_path:
              filePath,
          },
        }
      )


    if (aiError) {

      console.error(
        '🚨 Primary AI vehicle check error:',
        aiError
      )

      // ========================================
      // AI FAILED
      // NEVER LEAVE APPOINTMENT AT "pending"
      // ========================================

      const {
        error: fallbackError,
      } = await supabase
        .from('appointments')
        .update({
          vehicle_type: null,

          vehicle_eligibility:
            'unsure',

          vehicle_detection_message:
            '⚠️ Admin review required. The Vehicle AI check could not be completed.',

          vehicle_detection_confidence:
            null,

          vehicle_detected_at:
            new Date().toISOString(),
        })
        .eq(
          'id',
          safeAppointmentId
        )


      if (fallbackError) {

        console.error(
          '🚨 Failed to save AI fallback status:',
          fallbackError
        )

      }

    } else {

      console.log(
        '✅ Primary AI vehicle eligibility result:',
        aiResult
      )

    }

  } catch (aiError) {

    console.error(
      '🚨 Primary AI vehicle check failed:',
      aiError
    )


    // ========================================
    // AI FAILED COMPLETELY
    // → MANUAL ADMIN REVIEW
    // ========================================

    const {
      error: fallbackError,
    } = await supabase
      .from('appointments')
      .update({
        vehicle_type: null,

        vehicle_eligibility:
          'unsure',

        vehicle_detection_message:
          '⚠️ Admin review required. The Vehicle AI check could not be completed.',

        vehicle_detection_confidence:
          null,

        vehicle_detected_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        safeAppointmentId
      )


    if (fallbackError) {

      console.error(
        '🚨 Failed to save AI failure status:',
        fallbackError
      )

    }

  }


// ==========================================
// VIDEO-ONLY
// ==========================================

} else if (
  primaryImageIndex === -1 &&
  isVideo
) {

  // ========================================
  // NO IMAGE EXISTS
  //
  // Do NOT call Roboflow.
  //
  // The appointment immediately becomes
  // UNSURE for admin review.
  // ========================================

  console.log(
    '📹 Video-only booking. Skipping Vehicle AI:',
    {
      appointment_id:
        safeAppointmentId,

      attachment_index:
        index,

      file_name:
        file.name,

      file_type:
        file.type,
    }
  )


  // Only perform the status update for
  // the first attachment.
  //
  // This prevents unnecessary duplicate
  // updates when multiple videos exist.

  if (index === 0) {

    const {
      error: videoFallbackError,
    } = await supabase
      .from('appointments')
      .update({
        vehicle_type: null,

        vehicle_eligibility:
          'unsure',

        vehicle_detection_message:
          '📹 Vehicle video received. Admin review required because vehicle AI verification requires a photo.',

        vehicle_detection_confidence:
          null,

        vehicle_detected_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        safeAppointmentId
      )


    if (videoFallbackError) {

      console.error(
        '🚨 Failed to save video review status:',
        videoFallbackError
      )

    }

  }


// ==========================================
// SUPPORTING ATTACHMENT
// ==========================================

} else {

  console.log(
    '📎 Supporting attachment stored without vehicle AI check:',
    {
      appointment_id:
        safeAppointmentId,

      attachment_index:
      
        index,

      file_name:
        file.name,

      file_type:
        file.type,
    }
  )

}




        }

        
        

        // ==========================================
        // NOTIFICATION
        // ==========================================

        // ==========================================
// CUSTOMER NOTIFICATION
// ==========================================

const formattedDate = form.date
  ? new Date(`${form.date}T00:00:00`).toLocaleDateString(
      'en-US',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }
    )
  : form.date

const formattedTime = form.time
  ? new Date(`1970-01-01T${form.time}`).toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    )
  : form.time

const isWalkIn = bookingSource === 'walkin'

const bookingSourceLabel = isWalkIn
  ? 'Walk-in Booking'
  : 'Online Booking'

const notificationTitle = 'Appointment Submitted'

const notificationMessage =
  `Appointment No. ${appointmentNumber}\n\n` +
  `${bookingSourceLabel}\n\n` +
  `Hi ${customerName}, your appointment for ${form.service_type} ` +
  `has been submitted for ${formattedDate} at ${formattedTime}.\n\n` +
  `Your request is currently pending confirmation.`



const {
  error: notificationError,
} = await supabase
  .from('notifications')
  .insert([
    {
      customer_id: user.id,
      recipient_id: user.id, // <-- ADD THIS
      appointment_id: safeAppointmentId,
      title: notificationTitle,
      message: notificationMessage,
      type: 'booking_status',
      is_read: false,
    },
  ])

if (notificationError) {
  console.error(
    'Customer notification error:',
    notificationError
  )
}



        // ==========================================
        // SUCCESS
        // ==========================================

        setShowAttachmentModal(
          false
        )

        clearSelectedFiles()

        toast.success(
          'Appointment submitted successfully!'
        )

        // Reset the form AFTER
        // saving submittedBooking.
        setForm({
  vehicle_model: '',
  plate_number: '',

  // Vehicle information
  fuel_type: '',
  battery_voltage: '',
  transmission_type: '',

  customer_address: '',
  service_type: '',
  date: '',
  time: '',
  notes: '',
})

        setShowSuccess(true)

      } catch (error) {
        console.error(
          'Booking error:',
          error
        )

        // ==========================================
        // CLEANUP UPLOADED FILES
        // ==========================================

        if (
          uploadedFilePaths.length
        ) {
          await supabase.storage
            .from(
              ATTACHMENT_BUCKET
            )
            .remove(
              uploadedFilePaths
            )
        }

        // ==========================================
        // CLEANUP APPOINTMENT
        // ==========================================

        if (
          createdAppointmentId
        ) {
          await supabase
            .from('appointments')
            .delete()
            .eq(
              'id',
              createdAppointmentId
            )
        }

        toast.error(
          error?.message ||
            'Something went wrong while submitting your appointment.'
        )
      } finally {
  setUploadingAttachment(false)
  setLoading(false)

  // Release the synchronous submit lock
  submittingRef.current = false
}

    }


  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return '0 Bytes'
    }

    const units = [
      'Bytes',
      'KB',
      'MB',
      'GB',
    ]

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    )

    return (
      parseFloat(
        (
          bytes /
          Math.pow(
            1024,
            index
          )
        ).toFixed(2)
      ) +
      ' ' +
      units[index]
    )
  }

  const selectedService =
    serviceVisuals[
      form.service_type
    ] || {
      icon: 'wrench',
      description:
        'Choose the electrical service you need',
    }


// =====================================================
// PSGC HELPERS
// =====================================================

function fixEncoding(value) {
  if (!value || typeof value !== 'string') {
    return value
  }

  return value
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
}

function cleanPSGCItems(items) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map(item => ({
    ...item,
    name: fixEncoding(item.name),
    region: fixEncoding(item.region),
    province: fixEncoding(item.province),
    city_municipality: fixEncoding(item.city_municipality),
  }))
}

async function fetchPSGC(endpoint) {
  const response = await fetch(
    `${PSGC_API}${endpoint}`
  )

  if (!response.ok) {
    throw new Error(
      `Location request failed: ${response.status}`
    )
  }

  const data = await response.json()

  let items = []

  if (Array.isArray(data)) {
    items = data
  } else if (Array.isArray(data?.data)) {
    items = data.data
  }

  return cleanPSGCItems(items)
}

function fixPSGCName(name) {
  if (!name) return ''

  return String(name)
    .replace(/Las PiA\+\+as/gi, 'Las Piñas')
    .replace(/Paranaque/gi, 'Parañaque')
    .replace(/ParanaA\+\+que/gi, 'Parañaque')
}


// =========================================================
// ZIP CODE HELPERS
// =========================================================

function normalizeZip(zip) {
  if (zip === null || zip === undefined) return ''

  const value = String(zip).trim()

  if (!value) return ''

  // Keep Philippine ZIP codes as 4 digits
  const digits = value.replace(/\D/g, '')

  if (!digits) return ''

  return digits.padStart(4, '0').slice(0, 4)
}


function normalizeLocationName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^city\s+of\s+/i, '')
    .replace(/^municipality\s+of\s+/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}




function getZipCode(locality) {
  if (!locality) return ''

  // =======================================================
  // 1. CHECK ZIP PROVIDED DIRECTLY BY PSGC
  // =======================================================
  const possibleZip =
    locality.zip_code ??
    locality.zipCode ??
    locality.postal_code ??
    locality.postalCode ??
    locality.ZIP_CODE

  const normalized = normalizeZip(possibleZip)

  if (normalized) {
    return normalized
  }

  // =======================================================
  // 2. CHECK PSGC CODE FALLBACK
  // =======================================================
  const code = String(locality.code || '').trim()

  if (code && ZIP_CODE_FALLBACKS[code]) {
    return ZIP_CODE_FALLBACKS[code]
  }

  // =======================================================
  // 3. CHECK CITY / MUNICIPALITY NAME
  // =======================================================
  const localityName = normalizeLocationName(
    locality.name ||
      locality.city_municipality ||
      locality.cityMunicipality ||
      ''
  )

  if (!localityName) {
    return ''
  }

  const nameFallbacks = {
    // NCR
    caloocan: '1400',
    'las pinas': '1740',
    


    makati: '1200',
    malabon: '1470',
    mandaluyong: '1550',
    manila: '1000',
    marikina: '1800',
    muntinlupa: '1770',
    navotas: '1485',
    paranaque: '1700',
    pasig: '1600',
    'san juan': '1500',
    taguig: '1630',
    valenzuela: '1440',
    pasay: '1300',
    pateros: '1620',
    'quezon city': '1100',

    // Cavite
    bacoor: '4102',
    'cavite city': '4100',
    dasmarinas: '4114',
    imus: '4103',
    silang: '4118',
    'general trias': '4107',
    rosario: '4106',
    kawit: '4104',
    naic: '4110',
    maragondon: '4112',
    ternate: '4111',
    tagaytay: '4120',
    amadeo: '4119',
    alfonso: '4123',
    indang: '4122',
    magallanes: '4113',
    generalemilioaguinaldo: '4124',
    muntinlupa: '1770',
  }

  return nameFallbacks[localityName] || ''
}





// =========================================================
// AUTOMATIC ZIP CODE LOOKUP
// =========================================================

async function fetchZipCode(cityCode, cityName, selectedLocality) {
  // -------------------------------------------------------
  // 1. Check the selected city/municipality first
  // -------------------------------------------------------
  const immediateZip = getZipCode(selectedLocality)

  if (immediateZip) {
    return immediateZip
  }

  // -------------------------------------------------------
  // 2. Try PSGC V2 detail endpoint
  // -------------------------------------------------------
  if (cityCode) {
    try {
      const response = await fetch(
        `${PSGC_API}/cities-municipalities/${encodeURIComponent(cityCode)}`
      )

      if (response.ok) {
        const result = await response.json()

        const data = result?.data || result

        const zip = getZipCode(data)

        if (zip) {
          return zip
        }
      }
    } catch (error) {
      console.warn(
        'PSGC V2 ZIP lookup failed:',
        error
      )
    }
  }

  // -------------------------------------------------------
  // 3. Try PSGC V1 detail endpoint
  // -------------------------------------------------------
  if (cityCode) {
    try {
      const response = await fetch(
        `https://psgc.cloud/api/cities-municipalities/${encodeURIComponent(cityCode)}`
      )

      if (response.ok) {
        const result = await response.json()

        const data = result?.data || result

        const zip = getZipCode(data)

        if (zip) {
          return zip
        }
      }
    } catch (error) {
      console.warn(
        'PSGC V1 ZIP lookup failed:',
        error
      )
    }
  }

  // -------------------------------------------------------
  // 4. Try the complete PSGC city/municipality list
  // -------------------------------------------------------
  try {
    const response = await fetch(
      'https://psgc.cloud/api/cities-municipalities'
    )

    if (response.ok) {
      const result = await response.json()

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : []

      const matchedCity = list.find((item) => {
        // First try matching the PSGC code
        if (
          cityCode &&
          String(item.code || '') === String(cityCode)
        ) {
          return true
        }

        // Then try matching the city name
        if (cityName) {
          return (
            normalizeLocationName(
              item.name ||
                item.city_municipality ||
                item.cityMunicipality ||
                ''
            ) ===
            normalizeLocationName(cityName)
          )
        }

        return false
      })

      const zip = getZipCode(matchedCity)

      if (zip) {
        return zip
      }
    }
  } catch (error) {
    console.warn(
      'PSGC city list ZIP lookup failed:',
      error
    )
  }

  // -------------------------------------------------------
  // 5. Final local fallback
  // -------------------------------------------------------
  return (
    getZipCode({
      code: cityCode,
      name: cityName,
    }) || ''
  )
}









// =====================================================
// LOAD REGIONS
// =====================================================

useEffect(() => {
  let cancelled = false

  async function loadRegions() {
    try {
      setLoadingRegions(true)

      const data = await fetchPSGC('/regions')

      if (!cancelled) {
        setRegions(data)
      }
    } catch (error) {
      console.error('Region loading error:', error)
    } finally {
      if (!cancelled) {
        setLoadingRegions(false)
      }
    }
  }

  // Only needed for admin/walk-in
  if (isAdmin) {
    loadRegions()
  }

  return () => {
    cancelled = true
  }
}, [isAdmin])

// =====================================================
// NCR DETECTION
// =====================================================

function isSelectedNCR() {
  const selectedRegion = regions.find(
    item =>
      String(item.code) ===
      String(form.region)
  )

  if (!selectedRegion) {
    return false
  }

  const name = String(
    selectedRegion.name || ''
  ).toLowerCase()

  return (
    name.includes('national capital region') ||
    name.includes('(ncr)') ||
    name === 'ncr'
  )
}

// =====================================================
// LOAD PROVINCES
// =====================================================

useEffect(() => {
  let cancelled = false

  async function loadProvinces() {
    if (!form.region || isSelectedNCR()) {
      setProvinces([])
      return
    }

    try {
      setLoadingProvinces(true)

      const data = await fetchPSGC(
        `/regions/${encodeURIComponent(
          form.region
        )}/provinces`
      )

      if (!cancelled) {
        setProvinces(data)
      }
    } catch (error) {
      console.error(
        'Province loading error:',
        error
      )

      if (!cancelled) {
        setProvinces([])
      }
    } finally {
      if (!cancelled) {
        setLoadingProvinces(false)
      }
    }
  }

  if (isAdmin) {
    loadProvinces()
  }

  return () => {
    cancelled = true
  }
}, [form.region, isAdmin])

// =====================================================
// LOAD CITIES / MUNICIPALITIES
// =====================================================

useEffect(() => {
  let cancelled = false

  async function loadCitiesMunicipalities() {
    if (!form.region) {
      setCitiesMunicipalities([])
      return
    }

    try {
      setLoadingCities(true)

      let data = []

      const selectedRegion = regions.find(
        item =>
          String(item.code) ===
          String(form.region)
      )

      const regionName =
        selectedRegion?.name || ''

      const ncr =
        regionName
          .toLowerCase()
          .includes('national capital region') ||
        regionName
          .toLowerCase()
          .includes('(ncr)')

      if (ncr) {
        data = await fetchPSGC(
          `/regions/${encodeURIComponent(
            form.region
          )}/cities-municipalities`
        )
      } else if (form.province) {
        data = await fetchPSGC(
          `/provinces/${encodeURIComponent(
            form.province
          )}/cities-municipalities`
        )
      }

      if (!cancelled) {
        setCitiesMunicipalities(data)
      }
    } catch (error) {
      console.error(
        'City/Municipality loading error:',
        error
      )

      if (!cancelled) {
        setCitiesMunicipalities([])
      }
    } finally {
      if (!cancelled) {
        setLoadingCities(false)
      }
    }
  }

  if (isAdmin) {
    loadCitiesMunicipalities()
  }

  return () => {
    cancelled = true
  }
}, [
  form.region,
  form.province,
  regions,
  isAdmin,
])

// =====================================================
// LOAD BARANGAYS
// =====================================================

useEffect(() => {
  let cancelled = false

  async function loadBarangays() {
    if (!form.cityMunicipality) {
      setBarangays([])
      return
    }

    try {
      setLoadingBarangays(true)

      const data = await fetchPSGC(
        `/cities-municipalities/${encodeURIComponent(
          form.cityMunicipality
        )}/barangays`
      )

      if (!cancelled) {
        setBarangays(data)
      }
    } catch (error) {
      console.error(
        'Barangay loading error:',
        error
      )

      if (!cancelled) {
        setBarangays([])
      }
    } finally {
      if (!cancelled) {
        setLoadingBarangays(false)
      }
    }
  }

  if (isAdmin) {
    loadBarangays()
  }

  return () => {
    cancelled = true
  }
}, [form.cityMunicipality, isAdmin])

// =====================================================
// ADDRESS BUILDER
// =====================================================

function updateWalkInAddress(overrides = {}) {
  const current = {
    ...form,
    ...overrides,
  }

  const selectedRegion = regions.find(
    item =>
      String(item.code) ===
      String(current.region)
  )

  const selectedProvince = provinces.find(
    item =>
      String(item.code) ===
      String(current.province)
  )

  const selectedCity =
    citiesMunicipalities.find(
      item =>
        String(item.code) ===
        String(current.cityMunicipality)
    )

  const selectedBarangay =
    barangays.find(
      item =>
        String(item.code) ===
        String(current.barangay)
    )

  const regionName =
    selectedRegion?.name || ''

  const ncr =
    regionName
      .toLowerCase()
      .includes('national capital region') ||
    regionName
      .toLowerCase()
      .includes('(ncr)') ||
    regionName.toLowerCase() === 'ncr'

  const parts = [
    current.street,
    selectedBarangay?.name,
    selectedCity
      ? fixPSGCName(selectedCity.name)
      : '',
    !ncr
      ? selectedProvince?.name
      : null,
    selectedRegion?.name,
    current.zipCode,
  ].filter(Boolean)

  return parts.join(', ')
}

function handleRegionChange(e) {
  const value = e.target.value

  setForm(prev => ({
    ...prev,
    region: value,
    province: '',
    cityMunicipality: '',
    barangay: '',
    zipCode: '',
    street: '',
    customer_address: '',
  }))

  setProvinces([])
  setCitiesMunicipalities([])
  setBarangays([])
}

function handleProvinceChange(e) {
  const value = e.target.value

  setForm(prev => ({
    ...prev,
    province: value,
    cityMunicipality: '',
    barangay: '',
    zipCode: '',
    street: '',
    customer_address: '',
  }))

  setCitiesMunicipalities([])
  setBarangays([])
}


async function handleCityMunicipalityChange(e) {
  const value = e.target.value

  const selectedCity = citiesMunicipalities.find(
    



    (item) => String(item.code) === String(value)
  )
  console.log('SELECTED CITY:', selectedCity)
console.log('CITY NAME:', selectedCity?.name)
console.log('CITY CODE:', selectedCity?.code)
console.log('ZIP FROM GET ZIP:', getZipCode(selectedCity))

  // =======================================================
  // GET ZIP FROM SELECTED CITY FIRST
  // =======================================================
  const immediateZip = getZipCode(selectedCity)

  setForm((previous) => ({
    ...previous,
    cityMunicipality: value,
    barangay: '',
    zipCode: immediateZip || '',
    street: '',
    customer_address: '',
  }))

  // Clear barangays because the city changed
  setBarangays([])

  // =======================================================
  // IF PSGC ALREADY HAS ZIP, STOP HERE
  // =======================================================
  if (immediateZip) {
    return
  }

  // =======================================================
  // PSGC DOES NOT HAVE ZIP
  // TRY AUTOMATIC FALLBACK
  // =======================================================
  try {
    setLoadingZip(true)

    const cityCode =
      selectedCity?.code || value

    const cityName =
      selectedCity?.name ||
      selectedCity?.city_municipality ||
      selectedCity?.cityMunicipality ||
      ''

    const zip = await fetchZipCode(
      cityCode,
      cityName,
      selectedCity
    )

    // =====================================================
    // MAKE SURE THE USER DID NOT SELECT ANOTHER CITY
    // WHILE THE ZIP LOOKUP WAS RUNNING
    // =====================================================
    setForm((previous) => {
      if (
        String(previous.cityMunicipality) !==
        String(value)
      ) {
        return previous
      }

      return {
        ...previous,
        zipCode: zip || '',
      }
    })
  } catch (error) {
    console.error(
      'Automatic ZIP code lookup failed:',
      error
    )
  } finally {
    setLoadingZip(false)
  }
}



function handleBarangayChange(e) {
  const value = e.target.value

  setForm(prev => {
    const next = {
      ...prev,
      barangay: value,
    }

    return {
      ...next,
      customer_address:
        updateWalkInAddress(next),
    }
  })
}

function handleStreetChange(e) {
  const value = e.target.value
    .replace(/[<>]/g, '')
    .trimStart()

  setForm(prev => {
    const next = {
      ...prev,
      street: value,
    }

    return {
      ...next,
      customer_address:
        updateWalkInAddress(next),
    }
  })
}



// ==========================================
// WALK-IN: USE CURRENT DATE & TIME
// ==========================================
const handleUseCurrentDateTime = () => {
  const now = new Date()

  const OPEN_MINUTES = 8 * 60    // 8:00 AM
  const CLOSE_MINUTES = 18 * 60  // 6:00 PM

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // closed on Sundays
  if (now.getDay() === 0) {
    setForm((prev) => ({ ...prev, date: '', time: '' }))
    alert('We are closed on Sundays. Please choose another date.')
    return
  }

  // outside business hours (before opening or after closing)
  if (currentMinutes < OPEN_MINUTES || currentMinutes > CLOSE_MINUTES) {
    setForm((prev) => ({ ...prev, date: '', time: '' }))
    alert('The current time is outside business hours (8:00 AM to 6:00 PM). Please choose a date and time.')
    return
  }

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    now.getDate()
  ).padStart(2, '0')

  const hours = String(
    now.getHours()
  ).padStart(2, '0')

  const minutes = String(
    now.getMinutes()
  ).padStart(2, '0')

  setForm((prev) => ({
    ...prev,
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  }))
}

const SERVICE_ARRANGEMENT_STATEMENTS = {
  shop:
    'I will bring my vehicle to the shop for inspection and service.',

  home:
    'I am requesting home / on-site service at my provided location.',
}

const handleServiceArrangementChange = (type) => {
  const selectedStatement =
    SERVICE_ARRANGEMENT_STATEMENTS[type]

  setServiceArrangement(type)

  setForm((prev) => {
    const currentNotes = prev.notes || ''

    const previousStatements = Object.values(
      SERVICE_ARRANGEMENT_STATEMENTS
    )

    let additionalNotes = currentNotes

    // Remove a previously selected arrangement statement
    previousStatements.forEach((statement) => {
      if (additionalNotes.startsWith(statement)) {
        additionalNotes = additionalNotes
          .slice(statement.length)
          .replace(/^\s*\n?\s*/, '')
      }
    })

    const nextNotes = additionalNotes
      ? `${selectedStatement}\n\n${additionalNotes}`
      : `${selectedStatement}\n\n`

        return {
      ...prev,
      notes: nextNotes,
      time: '',
      date: getTimeSlots(type, prev.date).length ? prev.date : '',
    }
  })
}

useEffect(() => {
  if (!form.date) return

  // Sunday: clear both date and time (online and walk-in)
  const isSunday = new Date(`${form.date}T00:00:00`).getDay() === 0

  if (isSunday) {
    setForm((prev) => ({ ...prev, date: '', time: '' }))
    return
  }

  // the rest only applies to online customers (dropdown time slots)
  if (isAdmin) return

  const slots = getTimeSlots(serviceArrangement, form.date, slotNow)

  // selected date has no slots left (for example today after closing)
  if (slots.length === 0) {
    setForm((prev) => ({ ...prev, date: '', time: '' }))
    return
  }

  // selected time is no longer available
  if (form.time && !slots.includes(form.time)) {
    setForm((prev) => ({ ...prev, time: '' }))
  }
}, [isAdmin, form.date, form.time, serviceArrangement, slotNow])


useEffect(() => {
  const isModalOpen =
    showSuccess ||
    showAttachmentModal ||
    showBookingAgreement ||
    viewingBookingAgreement ||
    isWalkInLocked;

  if (!isModalOpen) return;

  const prevBody = document.body.style.overflow;
  const prevHtml = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = prevBody;
    document.documentElement.style.overflow = prevHtml;
  };
}, [
  showSuccess,
  showAttachmentModal,
  showBookingAgreement,
  viewingBookingAgreement,
  isWalkInLocked,
]);






  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">

      {/* =====================================================
          AUTOMOTIVE BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(220,38,38,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(127,29,29,0.14),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)
            `,
            backgroundSize:
              '46px 46px',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, transparent 0px, transparent 70px, rgba(255,255,255,0.5) 71px, transparent 72px)',
          }}
        />

        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-3xl" />

        <div className="absolute -bottom-48 -left-40 h-[550px] w-[550px] rounded-full bg-red-700/10 blur-3xl" />

        <div className="absolute left-[8%] top-[28%] h-32 w-px bg-gradient-to-b from-transparent via-red-500/30 to-transparent" />

        <div className="absolute right-[12%] top-[18%] h-px w-40 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        <div className="absolute bottom-[18%] left-[18%] h-px w-56 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="absolute right-[5%] top-[45%] h-32 w-32 rounded-full border border-red-500/10" />

        <div className="absolute right-[7%] top-[47%] h-28 w-28 rounded-full border border-white/5" />

        <div className="absolute bottom-[12%] left-[4%] h-24 w-24 rounded-full border border-white/5" />

      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
        }}
      />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="relative z-20 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-950/40">
              <Icon
                name="wrench"
                size={23}
                strokeWidth={2}
              />
            </div>

            <div>
              <p className="text-sm font-bold tracking-wide text-white sm:text-base">
                ALAVAREN AUTO ELECTRICAL
              </p>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                Service Appointment
              </p>
            </div>

          </div>

          <button
  type="button"
  onClick={handleBack}
  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-red-500/40 hover:bg-red-600/10"
>
  <Icon
    name="arrowLeft"
    size={17}
  />

  <span className="hidden sm:inline">
    Back to Dashboard
  </span>

  <span className="sm:hidden">
    Back
  </span>
</button>


        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        <div className="mb-7 max-w-3xl">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-300">

            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />

            Online Service Booking

          </div>


          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Book your
            <span className="text-red-500">
              {' '}auto electrical service
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Tell us about your vehicle and
            electrical concern. Add clear
            photos or a video so our team can
            better understand the problem
            before your appointment.
          </p>

        </div>
{!isAdmin && bookingAgreementVersion === BOOKING_AGREEMENT_VERSION && (
  <button
    type="button"
    onClick={() => {
      setViewingBookingAgreement(true)
      setShowBookingAgreement(true)
      setAgreementScrolledToBottom(false)
      setAgreementChecked(false)
    }}
    className="mb-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
  >
    <Store size={17} />
    View Booking Agreement
  </button>
)}
        

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-black/20"
          >

           <div className="border-b border-slate-200 bg-slate-50 px-5 py-5 sm:px-7">

  <div className="flex items-center justify-between gap-4">

    {/* LEFT */}
    <div className="flex items-center gap-3">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Icon
          name="calendar"
          size={22}
        />
      </div>

      <div>

        <h2 className="text-lg font-bold text-slate-900">
          Appointment Details
        </h2>

        <p className="text-xs text-slate-500">
          Fill in the details below to request your service.
        </p>

        

      </div>

    </div>

    {/* BOOKING SOURCE */}
<div
  className={
    roleLoading
      ? 'flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500'
      : bookingSource === 'walkin'
        ? 'flex shrink-0 items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-yellow-700'
        : 'flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700'
  }
>

  {roleLoading ? (
    <Loader2
      size={16}
      strokeWidth={2.5}
      className="animate-spin"
    />
  ) : bookingSource === 'walkin' ? (
    <Store
      size={16}
      strokeWidth={2.5}
    />
  ) : (
    <Globe2
      size={16}
      strokeWidth={2.5}
    />
  )}

  <div className="leading-none">

    <p
      className={
        roleLoading
          ? 'text-[9px] font-bold uppercase tracking-wider text-slate-500'
          : bookingSource === 'walkin'
            ? 'text-[9px] font-bold uppercase tracking-wider text-yellow-600'
            : 'text-[9px] font-bold uppercase tracking-wider text-blue-600'
      }
    >
      Booking Source
    </p>

    <p className="mt-1 text-xs font-bold uppercase">
      {roleLoading
        ? 'Checking...'
        : bookingSource === 'walkin'
          ? 'Walk-in'
          : 'Online'}
    </p>

  </div>

</div>

  </div>

</div>

            <div className="space-y-7 p-5 sm:p-7">

              

              {/* VEHICLE */}

              <section>

                <div className="mb-4 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon
                      name="car"
                      size={17}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Vehicle Information
                    </h3>

                    <p className="text-xs text-slate-500">
                      Help us identify your vehicle.
                    </p>
                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Vehicle Model
                    </label>

                    <div className="relative">

                      <Icon
                        name="car"
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
  type="text"
  value={form.vehicle_model}
  onChange={(e) => {
    const value = e.target.value
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trimStart()

    setForm({
      ...form,
      vehicle_model: value,
    })
  }}
  placeholder="e.g. Toyota Vios 2020"
  maxLength={50}
  autoComplete="off"
  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
/>

                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
                      Plate Number
                    </label>

                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/10">

                      <div className="flex w-12 items-center justify-center bg-slate-900 text-white">

                        <div className="text-center">

                          <div className="text-[8px] font-bold tracking-widest">
                            PH
                          </div>

                          <div className="mt-0.5 text-[6px] text-blue-200">
                            PLATE
                          </div>

                        </div>

                      </div>

                     <input
  type="text"
  value={form.plate_number}
  onChange={(e) => {
  let value = e.target.value.toUpperCase()

  // Keep only letters, numbers, and spaces
  value = value.replace(/[^A-Z0-9 ]/g, '')

  // Remove leading spaces
  value = value.replace(/^\s+/, '')

  // Extract letters from the beginning
  const letters = value
    .match(/^[A-Z]{0,4}/)?.[0] || ''

  // Everything after the letters becomes the number section
  const remaining = value
    .slice(letters.length)
    .replace(/[^0-9]/g, '')
    .slice(0, 4)

  // Rebuild the plate
  const formattedValue =
    letters +
    (remaining ? ` ${remaining}` : '')

  setForm((previous) => ({
    ...previous,
    plate_number: formattedValue,
  }))
}}

  placeholder="ABC 1234"
  maxLength={9}
  inputMode="text"
  autoCapitalize="characters"
  autoCorrect="off"
  spellCheck={false}
  className="min-w-0 flex-1 px-3 py-3 text-sm font-semibold tracking-widest uppercase outline-none placeholder:font-normal placeholder:tracking-normal"
/>


                    </div>

                  </div>

                </div>

                  {/* Additional Vehicle Information */}
  <div className="mt-4 grid gap-4 sm:grid-cols-3">

    {/* Fuel Type */}
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Fuel Type
      </label>

      <div className="relative">
        <select
          value={form.fuel_type}
          onChange={(e) =>
            setForm((previous) => ({
              ...previous,
              fuel_type: e.target.value,
            }))
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        >
          <option value="">Select fuel type</option>
          <option value="Gasoline">Gasoline</option>
          <option value="Diesel">Diesel</option>
          <option value="Electric">Electric</option>
          <option value="Hybrid">Hybrid</option>
        </select>

        <Icon
          name="chevronDown"
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>

    {/* Battery Voltage */}
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Battery Voltage
      </label>

      <div className="relative">
        <select
          value={form.battery_voltage}
          onChange={(e) =>
            setForm((previous) => ({
              ...previous,
              battery_voltage: e.target.value,
            }))
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        >
          <option value="">Select voltage</option>
          <option value="12V">12V</option>
          <option value="24V">24V</option>
        </select>

        <Icon
          name="chevronDown"
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>

    {/* Transmission */}
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Transmission
      </label>

      <div className="relative">
        <select
          value={form.transmission_type}
          onChange={(e) =>
            setForm((previous) => ({
              ...previous,
              transmission_type: e.target.value,
            }))
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        >
          <option value="">Select transmission</option>
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
        </select>

        <Icon
          name="chevronDown"
          size={17}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>

  </div>

              </section>

              {/* CUSTOMER */}

<section>

  <div className="mb-4 flex items-center gap-2">

    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
      <Icon
        name="shield"
        size={17}
      />
    </div>

    <div>

      <h3 className="text-sm font-bold text-slate-900">
        {isAdmin
          ? 'Walk-in Customer Information'
          : 'Customer Information'}
      </h3>

      <p className="text-xs text-slate-500">
        {isAdmin
          ? 'Enter the information of the customer you are assisting.'
          : 'Information from your account.'}
      </p>

    </div>

  </div>

  <div className="grid gap-4 sm:grid-cols-2">

    {/* FULL NAME */}

    <div>

      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Full Name
      </label>

      <div className="relative">
  <Icon
    name="user"
    size={18}
    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="text"
    value={isAdmin ? form.customer_name : customer.name}
    onChange={(e) => {
      if (!isAdmin) return

      const value = e.target.value
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trimStart()

      setForm((previous) => ({
        ...previous,
        customer_name: value,
      }))
    }}
    readOnly={!isAdmin}
    placeholder={isAdmin ? 'Enter customer full name' : ''}
    maxLength={100}
    autoComplete="off"
    className={`w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none transition ${
      isAdmin
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-slate-200 bg-slate-50 text-slate-600'
    }`}
  />
</div>
    </div>

    {/* MOBILE NUMBER */}

    <div>

<label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
  Mobile Number
</label>

<div className="relative">
  <Icon
    name="phone"
    size={18}
    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
  />

  <input
    type="text"
    value={isAdmin ? form.mobile_number : customer.phone}
    onChange={(e) => {
      if (!isAdmin) return

      let value = e.target.value.replace(/\D/g, '')

      // Maximum of 11 digits
      value = value.slice(0, 11)

      // First digit must be 0
      if (value.length >= 1 && value[0] !== '0') {
        return
      }

      // Second digit must be 9
      if (value.length >= 2 && value[1] !== '9') {
        return
      }

      setForm((previous) => ({
        ...previous,
        mobile_number: value,
      }))
    }}
    readOnly={!isAdmin}
    placeholder={isAdmin ? '09XXXXXXXXX' : ''}
    maxLength={11}
    inputMode="numeric"
    autoComplete="tel"
    pattern="09[0-9]{9}"
    className={`w-full rounded-xl border py-3 pl-10 pr-3 text-sm outline-none transition ${
      isAdmin
        ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : 'border-slate-200 bg-slate-50 text-slate-600'
    }`}
  />
</div>
    </div>

   
{/* ADDRESS */}

<div className="sm:col-span-2">

  {/* ================================================
      WALK-IN CUSTOMER ADDRESS
      ================================================ */}

  {isAdmin ? (
    <div>

      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Service Address
      </label>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* REGION */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Region
          </label>

          <div className="relative">
            <Icon
              name="location"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={form.region}
              onChange={handleRegionChange}
              required
              disabled={loadingRegions}
              className="w-full appearance-auto rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {loadingRegions
                  ? 'Loading regions...'
                  : 'Select Region'}
              </option>

              {regions.map((region) => (
                <option
                  key={region.code}
                  value={region.code}
                >
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PROVINCE */}
        {!isSelectedNCR() && (
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Province
            </label>

            <div className="relative">
              <Icon
                name="location"
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={form.province}
                onChange={handleProvinceChange}
                required
                disabled={
                  !form.region ||
                  loadingProvinces
                }
                className="w-full appearance-auto rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">
                  {!form.region
                    ? 'Select Region First'
                    : loadingProvinces
                    ? 'Loading provinces...'
                    : 'Select Province'}
                </option>

                {provinces.map((province) => (
                  <option
                    key={province.code}
                    value={province.code}
                  >
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* CITY / MUNICIPALITY */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            City / Municipality
          </label>

          <div className="relative">
            <Icon
              name="location"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={form.cityMunicipality}
              onChange={handleCityMunicipalityChange}
              required
              disabled={
                (!form.province &&
                  !isSelectedNCR()) ||
                loadingCities
              }
              className="w-full appearance-auto rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {!form.region
                  ? 'Select Region First'
                  : !form.province &&
                    !isSelectedNCR()
                  ? 'Select Province First'
                  : loadingCities
                  ? 'Loading cities / municipalities...'
                  : 'Select City / Municipality'}
              </option>

              {citiesMunicipalities.map((locality) => (
                <option
                  key={locality.code}
                  value={locality.code}
                >
                  {fixPSGCName(locality.name)}
                  {locality.type
                    ? ` (${locality.type})`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* BARANGAY */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Barangay
          </label>

          <div className="relative">
            <Icon
              name="location"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={form.barangay}
              onChange={handleBarangayChange}
              required
              disabled={
                !form.cityMunicipality ||
                loadingBarangays
              }
              className="w-full appearance-auto rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="">
                {!form.cityMunicipality
                  ? 'Select City / Municipality First'
                  : loadingBarangays
                  ? 'Loading barangays...'
                  : 'Select Barangay'}
              </option>

              {barangays.map((barangay) => (
                <option
                  key={barangay.code}
                  value={barangay.code}
                >
                  {barangay.name}
                </option>
              ))}
            </select>
          </div>
        </div>       
<div>
  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
    ZIP Code
  </label>

  <div className="relative">
    <Icon
      name="location"
      size={17}
      className="absolute left-3 top-3.5 text-slate-400"
    />

    <input
      type="text"
      value={form.zipCode}
      readOnly
      placeholder={
        loadingZip
          ? 'Finding ZIP code...'
          : 'Automatic ZIP code'
      }
      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none"
    />

    {loadingZip && (
      <Loader2
        size={17}
        className="absolute right-3 top-3.5 animate-spin text-red-500"
      />
    )}
  </div>

  <p className="mt-1 text-[11px] text-slate-400">
    ZIP code is automatically retrieved from the selected city or municipality.
  </p>
</div>




        {/* STREET / HOUSE NO. */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Street / House No. / Building
          </label>

          <div className="relative">
            <Icon
              name="location"
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={form.street}
              onChange={handleStreetChange}
              required
              maxLength={150}
              autoComplete="street-address"
              placeholder="House No., Street, Building"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
            />
          </div>
        </div>

        {/* COMPLETE ADDRESS PREVIEW */}
        {form.customer_address && (
          <div className="sm:col-span-2">
            <div className="rounded-xl border border-red-500/10 bg-red-50/60 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              <span className="font-bold text-red-600">
                Complete address:
              </span>{' '}
              {form.customer_address}
            </div>
          </div>
        )}

      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        Select the location of the walk-in customer and enter
        the complete street or house information.
      </p>

    </div>

  ) : (

    /* ================================================
       ONLINE CUSTOMER ADDRESS
       DO NOT CHANGE — STILL FROM SUPABASE
       ================================================ */

    <div>

      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Service Address
      </label>

      <div className="relative">

        <Icon
          name="location"
          size={18}
          className="absolute left-3 top-3.5 text-slate-400"
        />

        <textarea
          value={customer.address}
          readOnly
          rows={2}
          placeholder="Your service address"
          maxLength={255}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-600 outline-none"
        />

      </div>

      <p className="mt-1 text-[11px] text-slate-400">
        This address is taken from your customer profile.
      </p>

    </div>

  )}

</div>
</div>

</section>

              {/* SERVICE */}

              <section>

                <div className="mb-4 flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <Icon
                      name="wrench"
                      size={17}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Service Request
                    </h3>

                    <p className="text-xs text-slate-500">
                      Select the service your vehicle needs.
                    </p>
                  </div>

                </div>

                <div className="relative">

                  <Icon
                    name={
                      selectedService.icon
                    }
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
                  />

                  <select
                    value={
                      form.service_type
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service_type:
                          e.target.value,
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm font-medium outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  >

                    <option value="">
                      Select a service
                    </option>

                    <option value="Alternator Repair">
                      Alternator Repair
                    </option>

                    <option value="Starter Repair">
                      Starter Repair
                    </option>

                    <option value="Power Window Motor Repair">
                      Power Window Motor Repair
                    </option>

                    <option value="ECU Repair">
                      ECU Repair
                    </option>

                    <option value="BCM Repair">
                      BCM Repair
                    </option>

                    <option value="EPS Module Repair">
                      EPS Module Repair
                    </option>

                    <option value="ECU Programming">
                      ECU Programming
                    </option>

                    <option value="Generator Services">
                      Generator Services
                    </option>

                    <option value="Others">
                      Others
                    </option>

                  </select>

                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400">
                    <Icon
                      name="arrowRight"
                      size={16}
                    />
                  </div>

                </div>

                {form.service_type && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-3 py-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">

                      <Icon
                        name={
                          selectedService.icon
                        }
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-red-900">
                        {
                          form.service_type
                        }
                      </p>

                      <p className="text-[11px] text-red-700/70">
                        {
                          selectedService.description
                        }
                      </p>

                    </div>

                  </div>
                )}
              </section>

              {/* =====================================================
    SERVICE ARRANGEMENT
    CUSTOMER ONLY — REQUIRED
===================================================== */}

{roleLoading ? (
  <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Icon
          name="loader"
          size={18}
          className="animate-spin"
        />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-700">
          Checking account...
        </p>

        <p className="mt-0.5 text-[11px] text-slate-500">
          Preparing your available service options.
        </p>
      </div>
    </div>
  </div>
) : !isAdmin ? (
  <div className="mb-5">

    {/* HEADER */}
    <div className="mb-3 flex items-start justify-between gap-3">

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
            Service Arrangement
          </p>

          {/* REQUIRED BADGE */}
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-red-600">
            Required
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select where the requested service will take place.
        </p>
      </div>

      {/* CURRENT SELECTION */}
      {serviceArrangement && (
        <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {serviceArrangement === 'shop'
            ? 'Shop Service'
            : 'Home / On-Site'}
        </span>
      )}

    </div>


    {/* OPTIONS */}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

      {/* =================================================
          SHOP SERVICE
      ================================================= */}
      <button
        type="button"
       onClick={() => {
  handleServiceArrangementChange('shop')
  setServiceArrangementError(false)
}}
        aria-pressed={serviceArrangement === 'shop'}
        className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
          serviceArrangement === 'shop'
            ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10'
            : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/40'
        }`}
      >
        <div className="flex items-start gap-3">

          {/* ICON */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              serviceArrangement === 'shop'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-600'
            }`}
          >
            <Icon
              name="store"
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-center justify-between gap-2">

              <h4 className="text-sm font-bold text-slate-900">
                Shop Service
              </h4>

              {serviceArrangement === 'shop' && (
                <Icon
                  name="check"
                  size={17}
                  className="shrink-0 text-red-600"
                />
              )}

            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Bring the vehicle to the shop for inspection and service.
            </p>

          </div>

        </div>
      </button>


      {/* =================================================
          HOME / ON-SITE SERVICE
      ================================================= */}
      <button
        type="button"
        onClick={() => {
  handleServiceArrangementChange('home')
  setServiceArrangementError(false)
}}
        aria-pressed={serviceArrangement === 'home'}
        className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
          serviceArrangement === 'home'
            ? 'border-red-500 bg-red-50 ring-2 ring-red-500/10'
            : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/40'
        }`}
      >
        <div className="flex items-start gap-3">

          {/* ICON */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
              serviceArrangement === 'home'
                ? 'bg-red-600 text-white'
                : 'bg-slate-100 text-slate-600 group-hover:bg-red-100 group-hover:text-red-600'
            }`}
          >
            <Icon
              name="mapPin"
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">

            <div className="flex items-center justify-between gap-2">

              <h4 className="text-sm font-bold text-slate-900">
                Home / On-Site Service
              </h4>

              {serviceArrangement === 'home' && (
                <Icon
                  name="check"
                  size={17}
                  className="shrink-0 text-red-600"
                />
              )}

            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Request service at your provided location, subject to service
              availability and confirmation.
            </p>

          </div>

        </div>
      </button>

    </div>


    {/* REQUIRED VALIDATION MESSAGE */}
   {serviceArrangementError && !serviceArrangement && (
  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
    <Icon
      name="alertCircle"
      size={16}
      className="mt-0.5 shrink-0 text-red-600"
    />

    <p className="text-xs font-semibold leading-5 text-red-700">
      Please select a service arrangement before submitting your booking.
      Choose either Shop Service or Home / On-Site Service.
    </p>
  </div>
)}

  </div>
) : null}









             {/* SCHEDULE */}

<section>

  <div className="mb-4 flex items-center gap-2">

    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
      <Icon
        name="calendar"
        size={17}
      />
    </div>

    <div>
      <h3 className="text-sm font-bold text-slate-900">
        {isAdmin
          ? 'Walk-in Appointment'
          : 'Preferred Schedule'}
      </h3>

      <p className="text-xs text-slate-500">
        {isAdmin
          ? 'Set the date and time for this walk-in appointment.'
          : 'Choose your preferred appointment schedule.'}
      </p>
    </div>

  </div>


  {/* =====================================================
      ONLINE CUSTOMER SCHEDULE
  ===================================================== */}

  {!isAdmin && (

    <div className="grid grid-cols-2 gap-2 sm:gap-4">

      {/* DATE DROPDOWN */}

      <div className="min-w-0">

        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
          Date
        </label>

        <div className="relative min-w-0">

          <Icon
            name="calendar"
            size={18}
            className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 sm:left-3"
          />

          <select
            value={form.date}
            onChange={(e) =>
              setForm({
                ...form,
                date: e.target.value,
              })
            }
            className={`w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-7 text-[11px] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 sm:pl-10 sm:pr-9 sm:text-sm ${
              form.date
                ? 'text-slate-700'
                : 'text-slate-400'
            }`}
          >

            <option value="" disabled>
              Select date
            </option>

            {Array.from(
              { length: 30 },
              (_, index) => {

                const date = new Date()

                date.setHours(
                  0,
                  0,
                  0,
                  0
                )

                date.setDate(
                  date.getDate() + index
                )

                // closed on Sundays
if (date.getDay() === 0) return null
                const year =
                  date.getFullYear()

                const month =
                  String(
                    date.getMonth() + 1
                  ).padStart(2, '0')

                const day =
                  String(
                    date.getDate()
                  ).padStart(2, '0')

                const value =
                  `${year}-${month}-${day}`

                const label =
  date.toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  )

// hide today once there are no booking slots left
if (
  index === 0 &&
  getTimeSlots(serviceArrangement, value, slotNow).length === 0
) {
  return null
}

return (
  <option
    key={value}
    value={value}
  >
    {label}
  </option>
)
              }
            )}

          </select>

          <Icon
            name="chevronDown"
            size={16}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 sm:right-3"
          />

        </div>

      </div>


      {/* TIME DROPDOWN */}

      <div className="min-w-0">

        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
          Time
        </label>

        <div className="relative min-w-0">

          <Icon
            name="clock"
            size={18}
            className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 sm:left-3"
          />

          <select
            value={form.time}
            onChange={(e) =>
              setForm({
                ...form,
                time: e.target.value,
              })
            }
            className={`w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-7 text-[11px] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 sm:pl-10 sm:pr-9 sm:text-sm ${
              form.time
                ? 'text-slate-700'
                : 'text-slate-400'
            }`}
          >

            <option value="" disabled>
              Select time
            </option>

           {getTimeSlots(serviceArrangement, form.date, slotNow).map((t) => (
  <option key={t} value={t}>
    {new Date(`1970-01-01T${t}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })}
  </option>
))}
          </select>

          <Icon
            name="chevronDown"
            size={16}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 sm:right-3"
          />

        </div>

      </div>

    </div>

  )}

  


  {/* =====================================================
      ADMIN WALK-IN SCHEDULE
  ===================================================== */}

  {isAdmin && (

    <div className="space-y-3">

      <div className="grid grid-cols-2 gap-2 sm:gap-4">

        {/* WALK-IN DATE */}
<div className="min-w-0">
  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
    Date
  </label>

  <div className="relative min-w-0">
    <Icon
      name="calendar"
      size={18}
      className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-slate-400 sm:left-3"
    />

    <select
      value={form.date}
      onChange={(e) =>
        setForm({
          ...form,
          date: e.target.value,
        })
      }
     className={`h-12 w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-9 pr-7 text-[11px] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 sm:pl-10 sm:pr-9 sm:text-sm ${
  form.date ? 'text-slate-700' : 'text-slate-400'
}`}
         
    >
      <option value="" disabled>
        Select date
      </option>

      {Array.from({ length: 30 }, (_, index) => {
        const date = new Date()

        date.setHours(0, 0, 0, 0)

        date.setDate(
          date.getDate() + index
        )
// closed on Sundays
if (date.getDay() === 0) return null
        const year =
          date.getFullYear()

        const month =
          String(
            date.getMonth() + 1
          ).padStart(2, '0')

        const day =
          String(
            date.getDate()
          ).padStart(2, '0')

        const value =
          `${year}-${month}-${day}`

        const label =
          date.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          )
        if (index === 0 && getTimeSlots(serviceArrangement, value, slotNow).length === 0) return null

        return (
          <option
            key={value}
            value={value}
          >
            {label}
          </option>
        )
      })}
    </select>

    <Icon
      name="chevronDown"
      size={16}
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 sm:right-3"
    />
  </div>
</div>

        {/* WALK-IN TIME */}
<div className="min-w-0">
  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-600">
    Appointment Time
  </label>

  <div className="relative min-w-0">
    <Icon
      name="clock"
      size={18}
      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3"
    />

    <input
      type="time"
      min="08:00"
      max="18:00"
      value={form.time}
      onChange={(e) => setForm({ ...form, time: e.target.value })}
      className="block w-full min-w-0 max-w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-2 text-left text-sm text-slate-700 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 sm:pl-10 sm:pr-3 [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:min-h-[1.5em]"
    />
  </div>
</div>
        

      </div>


      {/* =====================================================
          USE CURRENT DATE & TIME
      ===================================================== */}

      <button
        type="button"
        onClick={handleUseCurrentDateTime}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.99]"
      >

        <Icon
          name="clock"
          size={17}
        />

        Use Current Date & Time

      </button>


      <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">

        <Icon
          name="info"
          size={16}
          className="mt-0.5 shrink-0 text-slate-400"
        />

        <p>
          Walk-in appointments use the current date and time by default.
          You can still adjust them before submitting.
        </p>

      </div>

    </div>

  )}


  {/* =====================================================
      ONLINE INFORMATION
  ===================================================== */}

    {!isAdmin && (

    <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs text-slate-500">

      <Icon
        name="info"
        size={16}
        className="mt-0.5 shrink-0 text-slate-400"
      />

      <p>
        {serviceArrangement === 'home'
          ? 'Home / On-Site service is available between'
          : 'Shop service is available between'}
        <span className="font-semibold text-slate-700">
          {serviceArrangement === 'home'
            ? ' 8:00 AM and 4:00 PM'
            : ' 8:00 AM and 6:00 PM'}
        </span>.
      </p>

    </div>

  )}

</section>

              {/* =====================================================
    SERVICE DETAILS & ADDITIONAL NOTES
===================================================== */}

<section>

  <div className="mb-4 flex items-center gap-2">

    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
  <Icon
    name="note"
    size={18}
  />
</div>

    <div>
      <h3 className="text-sm font-bold text-slate-900">
        Service Details & Additional Notes
      </h3>

      <p className="text-xs text-slate-500">
        Tell us about your service request, vehicle concern, or anything our team should know.
      </p>
    </div>

  </div>


  






{/* =====================================================
    VEHICLE CONCERN / ADDITIONAL NOTES
===================================================== */}

<div>

  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
    Vehicle Concern / Additional Notes
  </label>

  <textarea
    value={form.notes}
    onChange={(e) =>
      setForm({
        ...form,
        notes: e.target.value,
      })
    }
    rows={5}
    placeholder="Example: The headlights are flickering, the battery keeps draining, or the power window is not working."
    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
  />

  {!isAdmin && (
    <p className="mt-2 text-xs text-slate-400">
      Use this field only to describe the vehicle concern or provide
      additional information. Your service arrangement is recorded
      separately.
    </p>
  )}

</div>
</section>









              {/* ATTACHMENT REMINDER */}

              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                  <Icon
                    name="upload"
                    size={19}
                  />
                </div>

                <div>

                  <p className="text-sm font-bold text-red-900">
                    Add up to 2 photos or videos
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-800/70">
                    Show the vehicle, plate
                    number, dashboard, wiring,
                    electrical component, or the
                    area where the problem is
                    happening.
                  </p>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                <span>
                  Confirm Booking
                </span>

                <Icon
                  name="arrowRight"
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />

              </button>

            </div>

          </form>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">

            <div className="sticky top-6 space-y-5">

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">

                <div className="border-b border-white/10 bg-white/[0.04] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                        Vehicle
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-white">
                        Your Vehicle
                      </h3>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400">
                      <Icon
                        name="car"
                        size={21}
                      />
                    </div>

                  </div>

                </div>

                <div className="p-5">

                  <div className="flex h-28 items-center justify-center rounded-2xl border border-white/5 bg-slate-950/60">

                    <Icon
                      name="car"
                      size={78}
                      strokeWidth={1}
                      className="text-slate-600"
                    />

                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">

                      <span className="text-xs text-slate-500">
                        Model
                      </span>

                      <span className="max-w-[150px] truncate text-xs font-semibold text-slate-200">
                        {
                          form.vehicle_model ||
                          'Not specified'
                        }
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">

                      <span className="text-xs text-slate-500">
                        Plate
                      </span>

                      <span className="text-xs font-bold tracking-wider text-slate-200">
                        {
                          form.plate_number ||
                          'NOT SET'
                        }
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">

  <span className="text-xs text-slate-500">
    Fuel
  </span>

  <span className="text-xs font-semibold text-slate-200">
    {
      form.fuel_type ||
      'Not specified'
    }
  </span>

</div>

<div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">

  <span className="text-xs text-slate-500">
    Battery
  </span>

  <span className="text-xs font-semibold text-slate-200">
    {
      form.battery_voltage ||
      'Not specified'
    }
  </span>

</div>

<div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">

  <span className="text-xs text-slate-500">
    Transmission
  </span>

  <span className="text-xs font-semibold text-slate-200">
    {
      form.transmission_type ||
      'Not specified'
    }
  </span>

</div>

                  </div>

                </div>

              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-400">
                    <Icon
                      name="settings"
                      size={20}
                    />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                      Process
                    </p>

                    <h3 className="text-sm font-bold text-white">
                      How it works
                    </h3>

                  </div>

                </div>

                <div className="space-y-4">

                  {[
                    [
                      '01',
                      'Submit booking',
                      'Send your appointment request.',
                    ],
                    [
                      '02',
                      'Upload concern',
                      'Show us the vehicle problem.',
                    ],
                    [
                      '03',
                      'Review & confirm',
                      'Our team reviews your request.',
                    ],
                    [
                      '04',
                      'Visit the shop',
                      'Bring your vehicle at the schedule.',
                    ],
                  ].map(
                    ([
                      number,
                      title,
                      description,
                    ]) => (

                      <div
                        key={number}
                        className="flex gap-3"
                      >

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px] font-black text-red-400">
                          {number}
                        </div>

                        <div>

                          <p className="text-xs font-bold text-slate-200">
                            {title}
                          </p>

                          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                            {description}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              <div className="rounded-3xl border border-red-500/10 bg-red-500/[0.06] p-5">

                <div className="flex items-start gap-3">

                  <Icon
                    name="shield"
                    size={19}
                    className="mt-0.5 text-red-400"
                  />

                  <div>

                    <p className="text-xs font-bold text-red-300">
                      Service Reminder
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Appointment requests are
                      subject to confirmation by
                      the shop.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </aside>

          {/* =====================================================
    SUNDAY LOCK MODAL
    Walk-in (admin) only
===================================================== */}

{isWalkInLocked && (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="sunday-lock-title"
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
  >
    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* HEADER */}
      <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-center text-white">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.28),_transparent_60%)]" />

        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-xl shadow-red-950/50">
          <Lock size={36} strokeWidth={2.2} />
        </div>

        <h2
          id="sunday-lock-title"
          className="relative mt-5 text-2xl font-black"
        >
          Feature Locked
        </h2>

        <p className="relative mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">
          Walk-in Booking
        </p>

      </div>

      {/* BODY */}
      <div className="p-6 text-center">

        <p className="text-sm leading-6 text-slate-600">
          This feature is locked during this time.
        </p>

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-base font-black text-red-700">
            {lockedDateLabel}
          </p>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-red-500">
            "Sunday"
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Booking operations can be continued tomorrow.
          Thank you for your understanding.
        </p>

        <button
          type="button"
          onClick={handleBack}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
        >
          <Icon name="arrowLeft" size={17} />
          Back to Dashboard
        </button>

      </div>

    </div>
  </div>
)}

        </div>

      </main>

      {/* =====================================================
    BOOKING AGREEMENT MODAL
    Customer only
===================================================== */}

{showBookingAgreement && !isAdmin && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-5">

    <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* =================================================
          HEADER
      ================================================= */}
      <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-red-700 to-red-600 px-5 py-4 text-white sm:px-6">

        <div className="flex items-start gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Store size={22} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-extrabold sm:text-xl">
              Online Booking & Service Agreement
            </h2>

            <div className="mt-1">
  <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-50">
    Agreement Version {BOOKING_AGREEMENT_VERSION}
  </span>
</div>

            <p className="mt-1 text-xs leading-relaxed text-red-100 sm:text-sm">
              Please read and understand this agreement before
              continuing with your online booking.
            </p>
          </div>

        </div>
      </div>

      {/* =================================================
          SCROLLABLE AGREEMENT CONTENT
      ================================================= */}
      <div
        ref={agreementScrollRef}
        onScroll={handleAgreementScroll}
        className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"
      >

        <div className="space-y-5 text-sm leading-6 text-slate-700">

          {/* INTRODUCTION */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              1. Online Booking Request
            </h3>

            <p>
              By using the online booking system, you are submitting a
              service request to Alavaren Auto Electrical Services.
              Submitting a booking does not automatically guarantee that
              your requested appointment, service, or schedule is confirmed.
            </p>

            <p className="mt-2">
              Your booking will be reviewed by our team and may be
              confirmed, adjusted, or contacted for additional information
              before the service is provided.
            </p>
          </section>

          {/* CUSTOMER INFORMATION */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              2. Accurate Information
            </h3>

            <p>
              You agree to provide accurate and complete information,
              including your contact details, vehicle information,
              plate number, requested service, preferred schedule,
              and other information requested by the booking form.
            </p>

            <p className="mt-2">
              Providing incorrect or incomplete information may affect
              appointment confirmation or the ability of our technicians
              to properly assess and service your vehicle.
            </p>
          </section>

          {/* SHOP SERVICE */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Store size={18} className="text-red-600" />

              <h3 className="text-base font-bold text-slate-900">
                3. Shop Service
              </h3>
            </div>

            <p>
              For shop service, you are responsible for bringing the
              vehicle to Alavaren Auto Electrical Services at the confirmed
              appointment time.
            </p>

            <p className="mt-2">
              Our technicians may need to physically inspect the vehicle
              before determining the appropriate repair, diagnosis, parts,
              or service required.
            </p>
          </section>

          {/* HOME SERVICE */}
          <section className="rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Globe2 size={18} className="text-red-600" />

              <h3 className="text-base font-bold text-slate-900">
                4. Home / On-Site Service
              </h3>
            </div>

            <p>
              If home or on-site service is requested, you are requesting
              our technician or authorized personnel to travel to your
              provided location to perform the requested service.
            </p>

            <p className="mt-2">
              Home or on-site service is subject to confirmation and may
              depend on the type of vehicle concern, required equipment,
              available personnel, location, accessibility, safety, and
              whether the requested work can reasonably be performed
              on-site.
            </p>

            <p className="mt-2 font-medium text-slate-800">
              If the requested service cannot safely or properly be
              performed at the provided location, you may be advised to
              bring the vehicle to the shop instead.
            </p>
          </section>

          {/* VEHICLE ASSESSMENT */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              5. Vehicle Assessment
            </h3>

            <p>
              Photos, videos, vehicle information, and your description
              of the concern may help our team understand the request.
              However, these details do not replace an actual vehicle
              inspection when an inspection is necessary.
            </p>

            <p className="mt-2">
              The final diagnosis, required parts, repair procedure,
              service availability, and applicable charges may only be
              determined after proper assessment.
            </p>
          </section>

          {/* LOCATION */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              6. Service Location
            </h3>

            <p>
              For home or on-site service, you are responsible for
              providing a correct service address and ensuring that the
              vehicle and work area are reasonably accessible to the
              technician.
            </p>
          </section>

          {/* SCHEDULE */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              7. Appointment Schedule
            </h3>

            <p>
              Your preferred date and time are subject to availability
              and confirmation. Our team may contact you if the requested
              schedule needs to be adjusted.
            </p>
          </section>

          {/* CANCELLATION */}
          <section>
            <h3 className="mb-2 text-base font-bold text-slate-900">
              8. Cancellation or Rescheduling
            </h3>

            <p>
              If you need to cancel or reschedule your appointment,
              please coordinate with Alavaren Auto Electrical Services
              as soon as possible.
            </p>
          </section>

          {/* ACKNOWLEDGMENT */}
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="mb-2 text-base font-bold text-slate-900">
              9. Customer Acknowledgment
            </h3>

            <p>
              By continuing, you acknowledge that you have read and
              understood the information above and agree to follow the
              applicable booking and service arrangements.
            </p>
          </section>

          {/* BOTTOM MARKER */}
          <div className="flex justify-center py-2">
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold text-slate-500">
              End of Agreement
            </span>
          </div>

        </div>
      </div>

      {/* =================================================
          FOOTER
      ================================================= */}
     
<div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">

  {viewingBookingAgreement ? (
    <>
      {/* ================================================
          VIEW-ONLY MODE
      ================================================ */}

      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold text-slate-500">
          Agreement Version
        </p>

        <p className="mt-1 text-sm font-bold text-slate-900">
          Version {BOOKING_AGREEMENT_VERSION}
        </p>

        <p className="mt-1 text-xs text-slate-500">
  This is the agreement currently applicable to your
  online booking.
</p>

{bookingAgreementAcceptedAt && (
  <p className="mt-2 text-xs font-medium text-slate-600">
    Accepted on: {formatTimestamp(bookingAgreementAcceptedAt)}
  </p>
)}
      </div>

      <button
        type="button"
        onClick={() => {
          setShowBookingAgreement(false)
          setViewingBookingAgreement(false)
        }}
        className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Close Agreement
      </button>
    </>
  ) : (
    <>
      {/* ================================================
          REQUIRED ACCEPTANCE MODE
      ================================================ */}

      {!agreementScrolledToBottom && (
        <p className="mb-3 text-center text-xs font-medium text-slate-500">
          Please scroll to the bottom of the agreement to continue.
        </p>
      )}

      {/* CHECKBOX */}
      <label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
          agreementScrolledToBottom
            ? 'border-slate-200 bg-slate-50 hover:border-red-300'
            : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
        }`}
      >
        <input
          type="checkbox"
          checked={agreementChecked}
          disabled={!agreementScrolledToBottom}
          onChange={(e) =>
            setAgreementChecked(e.target.checked)
          }
          className="mt-1 h-4 w-4 shrink-0 accent-red-600"
        />

        <span className="text-xs font-medium leading-5 text-slate-700 sm:text-sm">
          I have read and understood the Online Booking & Service
          Agreement, including the differences between shop service
          and home/on-site service.
        </span>
      </label>

      {/* CONTINUE BUTTON */}
      <button
        type="button"
        disabled={
          !agreementScrolledToBottom ||
          !agreementChecked
        }
        onClick={async () => {
          if (
            !agreementScrolledToBottom ||
            !agreementChecked ||
            !currentUser?.id
          ) {
            return
          }

          try {
            const acceptedAt = new Date().toISOString()

const { error } = await supabase
  .from('users')
  .update({
    booking_agreement_version:
      BOOKING_AGREEMENT_VERSION,
    booking_agreement_accepted_at:
      acceptedAt,
  })
  .eq('id', currentUser.id)

            if (error) {
              console.error(
                'Error saving booking agreement:',
                error
              )

              toast.error(
                'Unable to save your agreement. Please try again.'
              )

              return
            }

            setBookingAgreementVersion(
              BOOKING_AGREEMENT_VERSION
            )

            setBookingAgreementAcceptedAt(
  acceptedAt
)

            setShowBookingAgreement(false)

            toast.success(
              'Booking agreement accepted.'
            )
          } catch (error) {
            console.error(
              'Booking agreement error:',
              error
            )

            toast.error(
              'Unable to save your agreement. Please try again.'
            )
          }
        }}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
          agreementScrolledToBottom && agreementChecked
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700'
            : 'cursor-not-allowed bg-slate-200 text-slate-400'
        }`}
      >
        <span>I Understand — Continue</span>
      </button>
    </>
  )}

</div>

    </div>
  </div>
)}





      {/* =====================================================
          ATTACHMENT MODAL
      ===================================================== */}

      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-5">

          <div className="max-h-[95vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="relative overflow-hidden bg-slate-950 px-5 py-5 text-white sm:px-7">

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.25),_transparent_45%)]" />

              <div className="relative flex items-center justify-between">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600">
                    <Icon
                      name="upload"
                      size={21}
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                      Step 2 of 2
                    </p>

                    <h2 className="truncate text-lg font-bold">
                      Add Vehicle Attachments
                    </h2>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeAttachmentModal
                  }
                  disabled={
                    uploadingAttachment
                  }
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                >

                  <Icon
                    name="x"
                    size={20}
                  />

                </button>

              </div>

              <div className="relative mt-5 flex gap-2">

                <div className="h-1.5 flex-1 rounded-full bg-red-600" />

                <div className="h-1.5 flex-1 rounded-full bg-red-600" />

              </div>

            </div>

            <div className="max-h-[calc(95vh-100px)] overflow-y-auto p-5 sm:p-7">

              {/* VEHICLE SUMMARY */}

              <div className="mb-5 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                  <div className="flex items-center gap-2">

                    <Icon
                      name="car"
                      size={17}
                      className="text-red-600"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Vehicle
                      </p>

                      <p className="truncate text-xs font-bold text-slate-800">
                        {
                          form.vehicle_model ||
                          'Not specified'
                        }
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

                  <div className="flex items-center gap-2">

                    <Icon
                      name="plate"
                      size={17}
                      className="text-red-600"
                    />

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Plate Number
                      </p>

                      <p className="truncate text-xs font-bold tracking-wider text-slate-800">
                        {
                          form.plate_number ||
                          'Not specified'
                        }
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* GUIDANCE */}

<div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">

  <div className="flex items-start gap-3">

    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
      <Icon
        name="car"
        size={20}
      />
    </div>

    <div className="min-w-0">

      <p className="text-sm font-black text-red-900">
        Primary Vehicle Photo Required
      </p>

      <p className="mt-1 text-xs leading-5 text-red-800/80">
        Your first photo must clearly show the actual vehicle
        you are requesting service for. For the most accurate
        vehicle eligibility check, please provide a clear
        front or front-side view and make sure the plate number
        is visible and readable.
      </p>

    </div>

  </div>

  {/* PRIMARY PHOTO */}

  <div className="mt-4 rounded-xl border border-red-100 bg-white p-3">

    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">

        <span className="text-xs font-black">
          1
        </span>

      </div>

      <div>

        <p className="text-xs font-black text-slate-900">
          Primary Vehicle Photo
          <span className="ml-1 text-red-600">
            Required
          </span>
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          Show the complete vehicle clearly, preferably from
          the front or front-side angle. The plate number should
          be visible and readable. This is the primary image used
          for the vehicle eligibility check.
        </p>

      </div>

    </div>

  </div>


  {/* SUPPORTING PHOTO */}

  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">

    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">

        <span className="text-xs font-black">
          2
        </span>

      </div>

      <div>

        <p className="text-xs font-black text-slate-900">
          Supporting Photo
          <span className="ml-1 font-semibold text-slate-400">
            Optional
          </span>
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          You may provide another clear photo of the same vehicle,
          such as the dashboard, electrical component, wiring,
          warning light, problem area, or another vehicle angle.
          This photo is for additional review and does not replace
          the primary vehicle photo.
        </p>

      </div>

    </div>

  </div>


  {/* VIDEO */}

  <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">

    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">

        <Icon
          name="video"
          size={15}
        />

      </div>

      <div>

<p className="text-xs font-black text-slate-900">
  Supporting Video
  <span className="ml-1 font-semibold text-slate-400">
    Optional — After Photo
  </span>
</p>

<p className="mt-1 text-[11px] leading-5 text-slate-500">
  After uploading the required primary vehicle photo, you may add
  a short video to show the electrical concern, such as warning
  lights, unusual sounds, flickering lights, power window problems,
  or other symptoms. The video is for supporting information only
  and does not replace the primary vehicle photo or trigger another
  Vehicle check.
</p>


      </div>

    </div>

  </div>


  {/* IMPORTANT NOTICE */}

  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">

    <Icon
      name="info"
      size={17}
      className="mt-0.5 shrink-0 text-amber-600"
    />

    
<p className="text-[11px] leading-5 text-amber-900">

  <span className="font-black">
    Important:
  </span>{' '}

  AI vehicle eligibility or appointment approval does not
  guarantee that the requested service can be performed.
  The vehicle must undergo a physical inspection to confirm
  that the requested service is suitable and can be performed
  through either Home Service or Onsite/Shop Service, depending
  on the vehicle's condition and service requirements.

</p>



  </div>

</div>

              {/* FILE INPUT */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={
                  handleFileInputChange
                }
                className="hidden"
              />

              {/* DROP AREA */}

              {selectedFiles.length <
                MAX_ATTACHMENTS && (
                <div
                  onDragEnter={
                    handleDragEnter
                  }
                  onDragOver={
                    handleDragOver
                  }
                  onDragLeave={
                    handleDragLeave
                  }
                  onDrop={handleDrop}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className={`group cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition sm:p-9 ${
                    dragActive
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200 bg-slate-50 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm transition group-hover:scale-105 sm:h-16 sm:w-16">

                    <Icon
                      name="upload"
                      size={27}
                      strokeWidth={1.7}
                    />

                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-900">
  Upload Your Vehicle Photo
</h3>

<p className="mt-1 text-xs leading-5 text-slate-500">
  Upload a clear front or front-side photo of the
  actual vehicle. This photo is required for the
  Vehicle AI check. You may optionally add a second
  photo or video as supporting evidence.
</p>


                  <div className="mt-4 flex flex-wrap justify-center gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">

                      <Icon
                        name="image"
                        size={13}
                      />

                      Photos

                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">

                      <Icon
                        name="video"
                        size={13}
                      />

                      Videos

                    </span>

                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">
  1 required photo + 1 optional photo/video
</span>



                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm">
                      50MB each
                    </span>

                  </div>

                </div>
              )}

              {/* FILE COUNTER */}

              <div className="mt-4 flex items-center justify-between">

                <p className="text-xs font-semibold text-slate-500">
                  Attachments
                </p>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {
                    selectedFiles.length
                  } / {MAX_ATTACHMENTS}
                </span>

              </div>

              {/* PREVIEWS */}

              {selectedFiles.length > 0 && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">

                  {selectedFiles.map(
                    (
                      selected,
                      index
                    ) => {

                      const file =
                        selected.file

                      const isVideo =
                        file.type.startsWith(
                          'video/'
                        )

                      return (
                        <div
                          key={`${file.name}-${index}`}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                        >

                          {/* Preview */}

                          <div className="relative aspect-video bg-slate-950">

                            {isVideo ? (

                              <video
                                src={
                                  selected.previewUrl
                                }
                                controls
                                className="h-full w-full object-contain"
                              />

                            ) : (

                              <img
                                src={
                                  selected.previewUrl
                                }
                                alt={`Vehicle attachment ${index + 1}`}
                                className="h-full w-full object-contain"
                              />

                            )}

                            <div className="absolute left-3 top-3 rounded-lg bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                              Attachment{' '}
                              {index + 1}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeSelectedFile(
                                  index
                                )
                              }
                              disabled={
                                uploadingAttachment
                              }
                              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/80 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-40"
                            >

                              <Icon
                                name="x"
                                size={18}
                              />

                            </button>

                          </div>

                          {/* File Details */}

                          <div className="p-3">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm">

                                <Icon
                                  name={
                                    isVideo
                                      ? 'video'
                                      : 'image'
                                  }
                                  size={18}
                                />

                              </div>

                              <div className="min-w-0 flex-1">

                                <p className="truncate text-xs font-bold text-slate-800">
                                  {
                                    file.name
                                  }
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-500">
                                  {
                                    formatFileSize(
                                      file.size
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                            <div className="mt-3 flex gap-2">

                              <button
                                type="button"
                                onClick={() => {
                                  const input =
                                    document.createElement(
                                      'input'
                                    )

                                  input.type =
                                    'file'

                                  input.accept =
                                    'image/*,video/*'

                                  input.onchange =
                                    (event) => {
                                      const newFile =
                                        event.target
                                          .files?.[0]

                                      if (
                                        newFile
                                      ) {
                                        replaceSelectedFile(
                                          index,
                                          newFile
                                        )
                                      }
                                    }

                                  input.click()
                                }}
                                disabled={
                                  uploadingAttachment
                                }
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                              >
                                Replace
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeSelectedFile(
                                    index
                                  )
                                }
                                disabled={
                                  uploadingAttachment
                                }
                                className="flex-1 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                              >
                                Remove
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>
              )}

              {/* ADD SECOND FILE */}

              {selectedFiles.length ===
                1 && (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    uploadingAttachment
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                >

                  <Icon
                    name="upload"
                    size={16}
                  />

                  Add second attachment

                </button>
              )}

              {/* BUTTONS */}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closeAttachmentModal
                  }
                  disabled={
                    uploadingAttachment
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    submitBookingWithAttachment
                  }
                  disabled={
                    uploadingAttachment ||
                    selectedFiles.length ===
                      0
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {uploadingAttachment ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Uploading{' '}
                      {
                        selectedFiles.length
                      }{' '}
                      attachment
                      {selectedFiles.length >
                      1
                        ? 's'
                        : ''}
                      ...
                    </>
                  ) : (
                    <>
                      Upload & Submit

                      <Icon
                        name="arrowRight"
                        size={17}
                      />
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

{/* =====================================================
    SUCCESS MODAL
===================================================== */}

{showSuccess && (
<div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/80 p-3 backdrop-blur-md sm:p-5">
    <div
  className="
    mx-auto
    my-3
    w-full
    max-w-md
    overflow-hidden
    rounded-3xl
    bg-white
    shadow-2xl

    lg:my-5
    lg:max-w-4xl
    xl:max-w-5xl
    lg:rounded-[28px]
  "
>

      {/* =================================================
          SUCCESS HEADER — FULL WIDTH
      ================================================= */}

      <div className="relative overflow-hidden bg-slate-950 px-6 py-7 text-center text-white sm:px-8 lg:px-10 lg:py-8">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(220,38,38,0.24),_transparent_60%)]" />

        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-600 shadow-xl shadow-red-950/50">

          <Icon
            name="check"
            size={38}
            strokeWidth={2.4}
          />

        </div>

        <h2 className="relative mt-5 text-2xl font-black lg:text-3xl">
          Booking Submitted
        </h2>

        <p className="relative mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
          Your appointment request has been sent to Alavaren Auto Electrical Services.
        </p>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-5 sm:p-6 lg:p-8">

        {/* =================================================
            APPOINTMENT NUMBER
        ================================================= */}

        <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">

          <span className="shrink-0 text-xs font-medium text-red-600">
            Appointment No.
          </span>

          <span className="min-w-0 break-words text-right text-sm font-black tracking-wider text-red-700">
            {submittedBooking.appointment_no}
          </span>

        </div>


        {/* =================================================
    BOOKING DETAILS
    MOBILE: ONE COLUMN
    DESKTOP: TWO COLUMNS
================================================= */}

<div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

  {/* VEHICLE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Vehicle
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold text-slate-800">
      {submittedBooking.vehicle_model || 'Not specified'}
    </span>

  </div>


  {/* PLATE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Plate
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold tracking-wider text-slate-800">
      {submittedBooking.plate_number || 'Not specified'}
    </span>

  </div>


  {/* FUEL TYPE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Fuel Type
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold text-slate-800">
      {submittedBooking.fuel_type || 'Not specified'}
    </span>

  </div>


  {/* BATTERY VOLTAGE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Battery Voltage
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold text-slate-800">
      {submittedBooking.battery_voltage || 'Not specified'}
    </span>

  </div>


  {/* TRANSMISSION */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Transmission
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold text-slate-800">
      {submittedBooking.transmission_type || 'Not specified'}
    </span>

  </div>


  {/* SERVICE ADDRESS */}

  <div className="flex min-w-0 items-start justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Service Address
    </span>

    <span className="min-w-0 max-w-[65%] break-words text-right text-xs font-bold leading-5 text-slate-800">
      {submittedBooking.customer_address || 'Not specified'}
    </span>

  </div>


  {/* SERVICE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Service
    </span>

    <span className="min-w-0 max-w-[65%] truncate text-right text-xs font-bold text-slate-800">
      {submittedBooking.service_type}
    </span>

  </div>


  {/* SCHEDULE */}

  <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 lg:col-span-2">

    <span className="shrink-0 text-xs font-medium text-slate-500">
      Schedule
    </span>

    <span className="min-w-0 text-right text-xs font-bold text-slate-800">
  {formatBookingSchedule(submittedBooking.date, submittedBooking.time)}
</span>

  </div>

</div>

        {/* =================================================
            PENDING NOTICE
        ================================================= */}

        {/* =================================================
IMPORTANT — VEHICLE MUST BE BROUGHT TO SHOP
================================================= */}

<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4"> <div className="flex items-start gap-3">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">

  <Icon
    name="info"
    size={19}
  />

</div>

<div className="min-w-0">

<p className="text-sm font-black text-red-900">
  Important: Service Confirmation and Vehicle Inspection
</p>

<p className="mt-1.5 text-xs leading-5 text-red-800">
  Booking approval does not guarantee that the requested
  service will be performed. Our approval confirms your
  appointment request for review and scheduling.
</p>

<p className="mt-2 text-xs font-semibold leading-5 text-red-900">
  The actual vehicle must be physically inspected at the
  appropriate service location, either through Home Service
  or at our shop, depending on the vehicle's condition,
  requested service, and service requirements. Our
  technicians will determine the appropriate repair or
  service before work begins.
</p>

<p className="mt-2 text-[11px] leading-5 text-red-700/80">
  Thank you for your understanding and cooperation.
</p>

</div>

</div> </div>

{/* =================================================
PENDING NOTICE
================================================= */}

<div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">

<Icon name="clock" size={17} className="mt-0.5 shrink-0 text-amber-600" />

<p className="text-xs leading-5 text-amber-800"> Your appointment is currently 
  <span className="font-bold"> {' '}pending confirmation 
    </span>. Please check your customer dashboard for updates. </p> 
    </div>


        {/* =================================================
            DASHBOARD BUTTON
        ================================================= */}

        <button
  type="button"
  onClick={() => {
    setShowSuccess(false)
    handleBack()
  }}
  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
>
  Go to Dashboard
  <Icon
    name="arrowRight"
    size={17}
  />
</button>

      </div>

    </div>

  </div>
)}
   </div>
  )
}