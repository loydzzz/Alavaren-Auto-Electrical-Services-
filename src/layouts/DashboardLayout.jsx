import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
  FaSignOutAlt,
  FaTachometerAlt,
  FaClipboardList,
  FaBox,
  FaCalendarAlt,
  FaArchive,
  FaReceipt,
  FaBolt,
  FaUser,
  FaUserShield,
  FaBullhorn,
  FaTimes,
  FaBan,
  FaExclamationTriangle,
  FaShieldAlt,
  FaHome,
  FaGift,
} from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import WelcomeEnvelope, {
  openWelcomeMessage,
  useWelcomeSeen,
} from '../components/WelcomeEnvelope'
export default function DashboardLayout() {
  // =========================================================
  // CONFIGURATION
  // =========================================================

  const ENABLE_INACTIVITY_LOGOUT = false

  // =========================================================
  // DROPDOWN STATE
  // =========================================================

  const [menuOpen, setMenuOpen] = useState(false)

  const menuRef = useRef(null)

  // =========================================================
  // INACTIVITY LOGOUT
  // =========================================================

  const [showLogoutWarning, setShowLogoutWarning] = useState(false)
  const [countdown, setCountdown] = useState(10)

  const inactivityTimer = useRef(null)
  const countdownTimer = useRef(null)
  const warningRef = useRef(false)

  // =========================================================
  // ROUTER
  // =========================================================

  const navigate = useNavigate()
  const location = useLocation()

  // =========================================================
  // USER
  // =========================================================

  const [userRole, setUserRole] = useState(null)
  const [layoutUser, setLayoutUser] = useState(null)
  const welcomeSeen = useWelcomeSeen(layoutUser?.id)

  // =========================================================
  // ACCOUNT MODERATION
  // =========================================================

  const [accountModeration, setAccountModeration] = useState(null)
  const [moderationLoading, setModerationLoading] = useState(true)

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = async () => {
    clearTimers()

    setMenuOpen(false)

    await supabase.auth.signOut()

    navigate('/')
  }

  // =========================================================
  // CLEAR TIMERS
  // =========================================================

  const clearTimers = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current)
      inactivityTimer.current = null
    }

    if (countdownTimer.current) {
      clearInterval(countdownTimer.current)
      countdownTimer.current = null
    }
  }

  // =========================================================
  // RESET INACTIVITY TIMER
  // =========================================================

  const resetInactivityTimer = () => {
    clearTimers()

    warningRef.current = false

    setShowLogoutWarning(false)
    setCountdown(10)

    inactivityTimer.current = setTimeout(() => {
      warningRef.current = true

      setShowLogoutWarning(true)
      setCountdown(10)

      countdownTimer.current = setInterval(() => {
        setCountdown((previous) => {
          if (previous <= 1) {
            clearInterval(countdownTimer.current)

            countdownTimer.current = null

            logout()

            return 0
          }

          return previous - 1
        })
      }, 1000)
    }, 30000)
  }

  // =========================================================
  // LOAD USER ROLE + MODERATION
  // =========================================================

  useEffect(() => {
    let mounted = true

    async function fetchUserData() {
      console.log('🔵 DashboardLayout: Loading user...')

      setModerationLoading(true)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log('🔵 DashboardLayout Auth User:', user)
      console.log('🔵 DashboardLayout Auth Error:', authError)

      if (authError || !user) {
        console.error(
          '🔴 DashboardLayout: No authenticated user.',
          authError
        )

        if (mounted) {
          setModerationLoading(false)
        }

        return
      }

      // =====================================================
      // LOAD USER PROFILE
      // =====================================================

      const {
        data: userProfile,
        error: profileError,
      } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .maybeSingle()

      console.log(
        '🟢 DashboardLayout User Profile:',
        userProfile
      )

      console.log(
        '🟢 DashboardLayout Profile Error:',
        profileError
      )

      if (profileError) {
        console.error(
          '🔴 DashboardLayout Role Error:',
          profileError
        )

        if (mounted) {
          setModerationLoading(false)
        }

        return
      }

      if (!userProfile) {
        console.error(
          '🔴 DashboardLayout: User profile not found.'
        )

        if (mounted) {
          setModerationLoading(false)
        }

        return
      }

      if (!mounted) return

      console.log(
        '🟢 DashboardLayout Detected Role:',
        userProfile.role
      )

      setUserRole(userProfile.role)
      setLayoutUser({
  id: user.id,
  name: userProfile.name,
  createdAt: user.created_at,
})

      // =====================================================
      // ONLY CUSTOMERS NEED MODERATION CHECK
      // =====================================================

      if (userProfile.role !== 'customer') {
        setAccountModeration(null)
        setModerationLoading(false)

        return
      }

      // =====================================================
      // LOAD ACCOUNT MODERATION
      // =====================================================

      console.log(
        '🔵 Checking customer account moderation...'
      )

      const {
        data: moderationData,
        error: moderationError,
      } = await supabase
        .from('account_moderations')
        .select(`
          id,
          user_id,
          status,
          warning_count,
          reason,
          banned_at,
          banned_by
        `)
        .eq('user_id', user.id)
        .maybeSingle()

      console.log(
        '🟢 Account Moderation:',
        moderationData
      )

      console.log(
        '🟢 Account Moderation Error:',
        moderationError
      )

      if (moderationError) {
        console.error(
          '🔴 Account Moderation Error:',
          moderationError
        )

        setAccountModeration(null)
        setModerationLoading(false)

        return
      }

      // =====================================================
      // DEFAULT HEALTHY ACCOUNT
      // =====================================================

      if (!moderationData) {
        setAccountModeration({
          status: 'healthy',
          warning_count: 0,
          reason: null,
          banned_at: null,
          banned_by: null,
          adminName: null,
        })

        setModerationLoading(false)

        return
      }

      // =====================================================
      // GET ADMIN NAME IF BANNED
      // =====================================================

      let adminName = null

      if (
        moderationData.status === 'banned' &&
        moderationData.banned_by
      ) {
        const {
          data: adminProfile,
          error: adminError,
        } = await supabase
          .from('users')
          .select('name')
          .eq('id', moderationData.banned_by)
          .maybeSingle()

        console.log(
          '🟢 Banning Admin:',
          adminProfile
        )

        console.log(
          '🟢 Banning Admin Error:',
          adminError
        )

        if (!adminError && adminProfile) {
          adminName = adminProfile.name
        }
      }

      if (!mounted) return

      setAccountModeration({
        ...moderationData,
        adminName,
      })

      setModerationLoading(false)
    }

    fetchUserData()

    return () => {
      mounted = false
    }
  }, [])

  // =========================================================
  // ACTIVITY DETECTION
  // =========================================================

  useEffect(() => {
    if (!ENABLE_INACTIVITY_LOGOUT) {
      return
    }

    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ]

    const handleActivity = () => {
      if (warningRef.current) return

      resetInactivityTimer()
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    resetInactivityTimer()

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })

      clearTimers()
    }
  }, [])

  // =========================================================
  // CLOSE DROPDOWN WHEN ROUTE CHANGES
  // =========================================================

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // =========================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    document.addEventListener(
      'touchstart',
      handleOutsideClick
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

      document.removeEventListener(
        'touchstart',
        handleOutsideClick
      )
    }
  }, [])

  // =========================================================
  // ESCAPE KEY CLOSE
  // =========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [])

  // =========================================================
  // QUICK ACTIONS
  // =========================================================

  useEffect(() => {
    if (!location.state?.fromQuickAction) {
      return
    }

    setMenuOpen(false)

    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, [location.pathname, location.state, navigate])

  // =========================================================
  // MENU
  // =========================================================

  const adminMenuItems = [
    {
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/admin',
    },
    {
      label: 'Tasks',
      icon: <FaClipboardList />,
      path: '/admin/tasks',
    },
    {
      label: 'Inventory',
      icon: <FaBox />,
      path: '/admin/inventory',
    },

    {
  label: 'Booking',
  icon: <FaCalendarAlt />,
  path: '/admin/booking',
},


   

    {
      label: 'Appointments',
      icon: <FaCalendarAlt />,
      path: '/admin/appointments',
    },
    {
      label: 'Archive',
      icon: <FaArchive />,
      path: '/admin/archive',
    },
    // =====================================================
  // WARRANTY DOCUMENT
  // =====================================================

      // =====================================================
    // WARRANTY DOCUMENTS
    // =====================================================

    {
      label: 'Warranty Policy',
      icon: <FaShieldAlt />,
      path: '/admin/warranty',
    },

    {
      label: 'Home Service Warranty',
      icon: <FaHome />,
      path: '/admin/home-service-warranty',
    },
    {
      label: 'Transactions',
      icon: <FaReceipt />,
      path: '/admin/transactions',
    },

     {
  label: 'Announcements',
  icon: <FaBullhorn />,
  path: '/admin/announcements',
},

 

    {
      label: 'Profile',
      icon: <FaUser />,
      path: '/admin/profile',
    },
    {
      label: 'User Account Management',
      icon: <FaUserShield />,
      path: '/admin/customers',
    },
    
  ]

  const technicianMenuItems = [
    {
      label: 'Service Tasks',
      icon: <FaClipboardList />,
      path: '/technician/tasks',
    },
    {
      label: 'Inventory',
      icon: <FaBox />,
      path: '/technician/inventory',
    },
    {
      label: 'Profile',
      icon: <FaUser />,
      path: '/technician/profile',
    },
  ]

  const customerMenuItems = [
    {
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
      path: '/customer',
    },
    {
      label: 'Booking',
      icon: <FaCalendarAlt />,
      path: '/customer/booking',
    },
    {
      label: 'My Appointments',
      icon: <FaClipboardList />,
      path: '/customer/appointments',
    },
    {
      label: 'Profile',
      icon: <FaUser />,
      path: '/customer/profile',
    },
    {
    label: 'Welcome Message',
    icon: <FaGift />,
    action: openWelcomeMessage,
    badge: !welcomeSeen ? 'NEW' : null,
  },
  ]

  const menuItems =
    userRole === 'technician'
      ? technicianMenuItems
      : userRole === 'customer'
        ? customerMenuItems
        : userRole === 'admin'
          ? adminMenuItems
          : []

  console.log(
    'Dashboard User Role:',
    userRole
  )

  // =========================================================
  // IS ACCOUNT BANNED?
  // =========================================================

  const isBanned =
    userRole === 'customer' &&
    accountModeration?.status === 'banned'

  // =========================================================
  // MENU NAVIGATION
  // =========================================================

  const handleMenuClick = (path) => {
    if (isBanned) {
      return
    }

    navigate(path)

    setMenuOpen(false)
  }

  // =========================================================
  // LOGO DROPDOWN TOGGLE
  // =========================================================

  const toggleMenu = () => {
    if (isBanned) {
      return
    }

    setMenuOpen((previous) => !previous)
  }

  // =========================================================
  // FORMAT BAN DATE
  // =========================================================

  const formatBanDate = (date) => {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleDateString(
      'en-PH',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    )
  }

  // =========================================================
  // FORMAT BAN TIME
  // =========================================================

  const formatBanTime = (date) => {
    if (!date) {
      return 'Not available'
    }

    return new Date(date).toLocaleTimeString(
      'en-PH',
      {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }
    )
  }


  
// =========================================================
// HEADER SCROLL STATE
// Full header at top.
// Compact floating menu while scrolling.
// =========================================================

const [isHeaderScrolled, setIsHeaderScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => {
    setIsHeaderScrolled(window.scrollY > 20)
  }

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])



  // =========================================================
// WAIT FOR CUSTOMER MODERATION CHECK
// Prevent the dashboard from flashing before ban status loads.
// =========================================================

if (
  userRole === 'customer' &&
  moderationLoading
) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">

        <div
          className="
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-gray-200
            border-t-red-700
          "
        />

        <p className="mt-4 text-sm font-semibold text-gray-600">
          Checking your account...
        </p>

      </div>
    </div>
  )
}


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">

      

{/* =====================================================
    FULL HEADER AT TOP
    FLOATING MENU WHEN SCROLLING
===================================================== */}

{/* =====================================================
    FULL-WIDTH HEADER
    VISIBLE ONLY AT TOP
===================================================== */}

<header
  ref={menuRef}
  className={`
    no-print
    fixed
    left-0
    right-0
    top-0
    z-50
    flex
    h-16
    items-center
    border-b
    border-gray-200
    bg-white
    px-3
    shadow-sm
    backdrop-blur-md
    transition-all
    duration-300
    ease-out

    sm:px-5
    md:px-6
    lg:px-7
    xl:px-8

    ${
      isHeaderScrolled
        ? 'pointer-events-none -translate-y-full opacity-0'
        : 'translate-y-0 opacity-100'
    }
  `}
>

  {/* =================================================
      LOGO DROPDOWN BUTTON
  ================================================= */}

  <button
    type="button"
    onClick={toggleMenu}
    disabled={isBanned}
    aria-label={
      menuOpen
        ? 'Close navigation menu'
        : 'Open navigation menu'
    }
    aria-expanded={menuOpen}
    aria-haspopup="menu"
    className={`
      group
      flex
      min-w-0
      items-center
      gap-2.5
      rounded-2xl
      px-2
      py-1.5
      transition-all
      duration-200

      ${
        isBanned
          ? 'cursor-not-allowed opacity-50'
          : 'hover:bg-red-50 active:scale-[0.98]'
      }
    `}
  >

    {/* LOGO */}

    <span
      className={`
        relative
        flex
        h-10
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        bg-gradient-to-br
        from-red-600
        to-red-800
        text-white
        shadow-[0_8px_20px_rgba(185,28,28,0.28)]
        ring-1
        ring-red-900/10
        transition-all
        duration-300
        group-hover:scale-110
        active:scale-95

        ${
          menuOpen
            ? 'shadow-[0_10px_28px_rgba(185,28,28,0.38)] ring-4 ring-red-100'
            : 'hover:shadow-[0_12px_28px_rgba(185,28,28,0.38)]'
        }
      `}
    >
      <FaBolt className="text-lg" />

      {menuOpen && (
        <span
          className="
            absolute
            -right-0.5
            -top-0.5
            h-2.5
            w-2.5
            rounded-full
            bg-red-500
            shadow-[0_0_8px_rgba(239,68,68,0.65)]
            ring-2
            ring-white
          "
        />
      )}
    </span>


    {/* BRAND */}

    <span className="min-w-0 text-left">

      <span
        className="
          block
          truncate
          text-sm
          font-extrabold
          leading-tight
          text-gray-900
        "
      >
        Alavaren
      </span>

      <span
        className="
          block
          truncate
          text-[10px]
          font-semibold
          leading-tight
          text-red-700
        "
      >
        Auto Electrical
      </span>

    </span>

  </button>


  {/* =================================================
      ACCOUNT / ROLE
  ================================================= */}

  <div className="ml-auto flex items-center gap-2">

    {userRole && (
      <span
        className="
          hidden
          rounded-full
          bg-gray-100
          px-3
          py-1.5
          text-[10px]
          font-bold
          uppercase
          tracking-wide
          text-gray-500

          sm:inline-flex
        "
      >
        {userRole}
      </span>
    )}

    {/* SMALL MENU INDICATOR */}

    <span
      className={`
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        text-gray-400
        transition-transform
        duration-200

        ${
          menuOpen
            ? 'rotate-180 bg-red-50 text-red-700'
            : ''
        }
      `}
    >
      <span className="text-sm">
        ↓
      </span>
    </span>

  </div>


  {/* =================================================
      DROPDOWN FOR FULL HEADER
  ================================================= */}

  <div
    className={`
      absolute
      left-3
      top-[calc(100%+10px)]
      w-[calc(100%-24px)]
      origin-top-left
      transition-all
      duration-200
      ease-out

      sm:left-5
      sm:w-[360px]

      md:left-6
      lg:left-7
      xl:left-8

      ${
        menuOpen && !isBanned && !isHeaderScrolled
          ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
      }
    `}
    role="menu"
    aria-hidden={!menuOpen || isHeaderScrolled}
  >

    <div
      className="
        max-h-[calc(100vh-90px)]
        overflow-y-auto
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-2
        shadow-2xl
        ring-1
        ring-black/5
      "
    >

      {/* DROPDOWN HEADER */}

      <div
        className="
          mb-1
          flex
          items-center
          justify-between
          rounded-xl
          bg-gray-50
          px-3
          py-2.5
        "
      >

        <div className="min-w-0">

          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-gray-400
            "
          >
            Navigation
          </p>

          <p
            className="
              mt-0.5
              truncate
              text-sm
              font-extrabold
              text-gray-900
            "
          >
            Alavaren Auto Electrical
          </p>

        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="
            ml-3
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-gray-400
            transition
            hover:bg-red-50
            hover:text-red-700
          "
          aria-label="Close navigation menu"
        >
          <FaTimes className="text-sm" />
        </button>

      </div>


      {/* MENU */}

      <nav className="space-y-1">

        {menuItems.map((item) => {
  const active =
    !!item.path &&
    (location.pathname === item.path ||
      (item.path !== '/' &&
        location.pathname.startsWith(`${item.path}/`)))

  return (
    <DropdownMenuItem
      key={item.path || item.label}
      icon={item.icon}
      label={item.label}
      badge={item.badge}
      active={active}
      onClick={() => {
        if (item.action) {
          setMenuOpen(false)
          item.action()
          return
        }

        handleMenuClick(item.path)
      }}
      disabled={isBanned}
    />
  )
})}
      </nav>


      {/* DIVIDER */}

      <div className="my-2 border-t border-gray-100" />


      {/* LOGOUT */}

      <button
        type="button"
        onClick={logout}
        role="menuitem"
        className="
          group
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          px-3
          py-3
          text-left
          text-gray-600
          transition-all
          duration-200
          hover:bg-red-50
          hover:text-red-700
        "
      >

        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-gray-100
            text-gray-500
            transition
            group-hover:bg-red-100
            group-hover:text-red-700
          "
        >
          <FaSignOutAlt />
        </span>

        <span className="flex-1">

          <span
            className="
              block
              text-sm
              font-bold
            "
          >
            Logout
          </span>

          <span
            className="
              block
              text-[10px]
              text-gray-400
              group-hover:text-red-500
            "
          >
            Sign out of your account
          </span>

        </span>

      </button>

    </div>

  </div>

</header>


{/* =====================================================
    FLOATING MENU WHILE SCROLLING
    THIS IS INDEPENDENT FROM THE FULL HEADER
===================================================== */}

{isHeaderScrolled && (
  <div
    ref={menuRef}
    className="
      no-print
      fixed
      left-3
      top-3
      z-[60]
flex 
items-start 
gap-2
      sm:left-5
      sm:top-4

      md:left-6

      lg:left-7

      xl:left-8
    "
  >

    {/* =================================================
        FLOATING MENU BUTTON
    ================================================= */}

    <button
      type="button"
      onClick={toggleMenu}
      disabled={isBanned}
      aria-label={
        menuOpen
          ? 'Close navigation menu'
          : 'Open navigation menu'
      }
      aria-expanded={menuOpen}
      aria-haspopup="menu"
      className={`
        group
        flex
        items-center
        gap-2.5
        rounded-2xl
        border
        border-gray-200
        bg-white
        px-2
        py-1.5
        shadow-lg
        ring-1
        ring-black/5
        backdrop-blur-md
        transition-all
        duration-200

        ${
          isBanned
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-red-200 hover:bg-red-50 hover:shadow-xl active:scale-[0.98]'
        }
      `}
    >

      {/* LOGO */}

      <span
        className={`
          relative
          flex
          h-10
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-red-600
          to-red-800
          text-white
          shadow-[0_8px_20px_rgba(185,28,28,0.28)]
          ring-1
          ring-red-900/10
          transition-all
          duration-300

          ${
            menuOpen
              ? 'shadow-[0_10px_28px_rgba(185,28,28,0.38)] ring-4 ring-red-100'
              : ''
          }
        `}
      >
        <FaBolt className="text-lg" />

        {menuOpen && (
          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              h-2.5
              w-2.5
              rounded-full
              bg-red-500
              shadow-[0_0_8px_rgba(239,68,68,0.65)]
              ring-2
              ring-white
            "
          />
        )}
      </span>


      {/* BRAND */}

      <span className="min-w-0 text-left">

        <span
          className="
            block
            truncate
            text-sm
            font-extrabold
            leading-tight
            text-gray-900
          "
        >
          Alavaren
        </span>

        <span
          className="
            block
            truncate
            text-[10px]
            font-semibold
            leading-tight
            text-red-700
          "
        >
          Auto Electrical
        </span>

      </span>


      {/* ARROW */}

      <span
        className={`
          ml-1
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-gray-400
          transition-all
          duration-200

          ${
            menuOpen
              ? 'rotate-180 bg-red-50 text-red-700'
              : 'group-hover:bg-red-50 group-hover:text-red-700'
          }
        `}
      >
        <span className="text-sm">
          ↓
        </span>
      </span>

    </button>


    {/* =================================================
        FLOATING DROPDOWN
        THIS ONE DOES NOT DISAPPEAR
    ================================================= */}

    <div
      className={`
        absolute
        left-0
        top-[calc(100%+10px)]
        w-[calc(100vw-24px)]
        max-w-[360px]
        origin-top-left
        transition-all
        duration-200
        ease-out

        sm:w-[360px]

        ${
          menuOpen && !isBanned
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-[0.98] opacity-0'
        }
      `}
      role="menu"
      aria-hidden={!menuOpen}
    >

      <div
        className="
          max-h-[calc(100vh-90px)]
          overflow-y-auto
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-2
          shadow-2xl
          ring-1
          ring-black/5
        "
      >

        {/* DROPDOWN HEADER */}

        <div
          className="
            mb-1
            flex
            items-center
            justify-between
            rounded-xl
            bg-gray-50
            px-3
            py-2.5
          "
        >

          <div className="min-w-0">

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Navigation
            </p>

            <p
              className="
                mt-0.5
                truncate
                text-sm
                font-extrabold
                text-gray-900
              "
            >
              Alavaren Auto Electrical
            </p>

          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="
              ml-3
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-red-50
              hover:text-red-700
            "
            aria-label="Close navigation menu"
          >
            <FaTimes className="text-sm" />
          </button>

        </div>


        {/* MENU */}

        <nav className="space-y-1">

          {menuItems.map((item) => {
  const active =
    !!item.path &&
    (location.pathname === item.path ||
      (item.path !== '/' &&
        location.pathname.startsWith(`${item.path}/`)))

  return (
    <DropdownMenuItem
      key={item.path || item.label}
      icon={item.icon}
      label={item.label}
      badge={item.badge}
      active={active}
      onClick={() => {
        if (item.action) {
          setMenuOpen(false)
          item.action()
          return
        }

        handleMenuClick(item.path)
      }}
      disabled={isBanned}
    />
  )
})}
        </nav>


        {/* DIVIDER */}

        <div className="my-2 border-t border-gray-100" />


        {/* LOGOUT */}

        <button
          type="button"
          onClick={logout}
          role="menuitem"
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-gray-600
            transition-all
            duration-200
            hover:bg-red-50
            hover:text-red-700
          "
        >

          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-gray-100
              text-gray-500
              transition
              group-hover:bg-red-100
              group-hover:text-red-700
            "
          >
            <FaSignOutAlt />
          </span>

          <span className="flex-1">

            <span
              className="
                block
                text-sm
                font-bold
              "
            >
              Logout
            </span>

            <span
              className="
                block
                text-[10px]
                text-gray-400
                group-hover:text-red-500
              "
            >
              Sign out of your account
            </span>

          </span>

        </button>

      </div>

    </div>

  </div>
)}


{/* =====================================================
    HEADER SPACER
===================================================== */}

<div className="h-16" />





{/* =====================================================
    MAIN APPLICATION AREA
    GRID-FREE RED / GRAY / WHITE BACKGROUND
===================================================== */}


<main
  className="
    relative
    min-h-screen
    w-full
    overflow-hidden
    bg-white
    bg-none
  "
>
  {/* ===================================================
      GRID-FREE RED / GRAY / WHITE WAVE BACKGROUND
  =================================================== */}

  <div
    className="
      pointer-events-none
      absolute
      inset-0
      overflow-hidden
      bg-white
      bg-none
    "
    style={{
      backgroundImage: 'none',
    }}
  >

    {/* BASE WHITE / LIGHT GRAY */}
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-br
        from-white
        via-gray-100
        to-gray-200
      "
    />

    {/* TOP RED WAVE */}
    <div
      className="
        absolute
        -left-[20%]
        top-[4%]
        h-[430px]
        w-[140%]
        rotate-[-4deg]
        rounded-[50%]
        bg-gradient-to-r
        from-red-950
        via-red-700
        to-red-400
      "
    />

    {/* WHITE WAVE CUT */}
    <div
      className="
        absolute
        -left-[20%]
        top-[17%]
        h-[330px]
        w-[140%]
        rotate-[-4deg]
        rounded-[50%]
        bg-white
      "
    />

    {/* DARK GRAY WAVE */}
    <div
      className="
        absolute
        -left-[20%]
        top-[29%]
        h-[350px]
        w-[140%]
        rotate-[-3deg]
        rounded-[50%]
        bg-gradient-to-r
        from-gray-950
        via-gray-700
        to-gray-300
      "
    />

    {/* WHITE WAVE CUT */}
    <div
      className="
        absolute
        -left-[20%]
        top-[41%]
        h-[300px]
        w-[140%]
        rotate-[-3deg]
        rounded-[50%]
        bg-white
      "
    />

    {/* LOWER RED WAVE */}
    <div
      className="
        absolute
        -left-[20%]
        top-[52%]
        h-[300px]
        w-[140%]
        rotate-[-2deg]
        rounded-[50%]
        bg-gradient-to-r
        from-red-950
        via-red-700
        to-red-500
      "
    />

    {/* BOTTOM WHITE */}
    <div
      className="
        absolute
        -bottom-[300px]
        -left-[20%]
        h-[550px]
        w-[140%]
        rounded-[50%]
        bg-white
      "
    />

  </div>

  {/* ===================================================
      PAGE CONTENT
  =================================================== */}

  <div
  className={`
    relative
    z-10
    min-h-screen
    w-full
    px-3
      px-3
      pb-5

      sm:px-5
      sm:pb-6

      md:px-6

      lg:px-7
      lg:pb-7

      xl:px-8
      xl:pb-8

      ${
        isBanned
          ? 'pointer-events-none select-none'
          : ''
      }
    `}
  >
    <div className="w-full min-w-0">
      <Outlet />
    </div>
  </div>
</main>




      {/* =====================================================
          INACTIVITY WARNING
      ===================================================== */}

      {showLogoutWarning && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/30
            p-4
            backdrop-blur-[2px]
          "
        >
          <div
            className="
              w-full
              max-w-sm
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-6
              shadow-2xl
            "
          >
            <div className="text-center">

              <div
                className="
                  mx-auto
                  mb-4
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-red-50
                  text-red-600
                "
              >
                <FaSignOutAlt />
              </div>

              <h2 className="text-lg font-bold text-gray-900">
                Inactivity detected
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                You will be logged out due to inactivity.
              </p>

              <div className="mt-5">

                <div className="text-3xl font-bold text-red-600">
                  {countdown}
                </div>

                <p className="mt-1 text-xs text-gray-400">
                  seconds remaining
                </p>

              </div>

              <button
                type="button"
                onClick={resetInactivityTimer}
                className="
                  mt-6
                  w-full
                  rounded-xl
                  bg-gray-900
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-gray-800
                  active:bg-gray-700
                "
              >
                I'm still here
              </button>

            </div>
          </div>
        </div>
      )}



      {/* =====================================================
          BANNED ACCOUNT MODAL
      ===================================================== */}

      {isBanned && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            bg-gray-950/70
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >

            {/* =================================================
                RED HEADER
            ================================================= */}

            <div
              className="
                bg-gradient-to-br
                from-red-700
                to-red-900
                px-5
                py-6
                text-white

                sm:px-7
                sm:py-7
              "
            >
              <div className="flex items-start gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white/15
                    ring-1
                    ring-white/20

                    sm:h-14
                    sm:w-14
                  "
                >
                  <FaBan className="text-xl sm:text-2xl" />
                </div>

                <div className="min-w-0">

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-red-200
                    "
                  >
                    Alavaren Auto Electrical
                  </p>

                  <h2
                    className="
                      mt-1
                      text-xl
                      font-extrabold

                      sm:text-2xl
                    "
                  >
                    Account Banned
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-red-100
                    "
                  >
                    Access to your customer account has been restricted.
                  </p>

                </div>
              </div>
            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="p-5 sm:p-7">

              <div
                className="
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  p-4

                  sm:p-5
                "
              >
                <div className="flex gap-3">

                  <FaExclamationTriangle
                    className="
                      mt-0.5
                      shrink-0
                      text-red-600
                    "
                  />

                  <div>

                    <h3 className="font-bold text-red-900">
                      Dear Customer,
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-red-800
                      "
                    >
                      Your account has been banned by an administrator.
                      You are currently unable to make bookings,
                      appointments, or perform other customer actions.
                    </p>

                  </div>
                </div>
              </div>

              {/* =================================================
                  BAN INFORMATION
              ================================================= */}

              <div className="mt-5 space-y-3">

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Banned By
                  </p>

                  <p
                    className="
                      mt-1
                      break-words
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {accountModeration?.adminName ||
                      'Administrator'}
                  </p>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3

                    sm:grid-cols-2
                  "
                >

                  <div
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      bg-gray-50
                      p-4
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-400
                      "
                    >
                      Date Banned
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      {formatBanDate(
                        accountModeration?.banned_at
                      )}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-xl
                      border
                      border-gray-100
                      bg-gray-50
                      p-4
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-gray-400
                      "
                    >
                      Time Banned
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      {formatBanTime(
                        accountModeration?.banned_at
                      )}
                    </p>
                  </div>

                </div>

                {/* =================================================
                    REASON
                ================================================= */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-100
                    bg-gray-50
                    p-4
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-gray-400
                    "
                  >
                    Reason
                  </p>

                  <p
                    className="
                      mt-1
                      break-words
                      text-sm
                      leading-6
                      text-gray-800
                    "
                  >
                    {accountModeration?.reason ||
                      'No reason was provided.'}
                  </p>
                </div>

              </div>

              {/* =================================================
                  NOTICE
              ================================================= */}

              <p
                className="
                  mt-5
                  text-center
                  text-xs
                  leading-5
                  text-gray-500
                "
              >
                If you believe this action was made in error,
                please contact Alavaren Auto Electrical.
              </p>

              {/* =================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                onClick={logout}
                className="
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-gray-900
                  px-4
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-gray-800
                  active:bg-gray-700
                "
              >
                <FaSignOutAlt />

                Logout
              </button>

            </div>
          </div>
        </div>
      )}

      {userRole === 'customer' && layoutUser && !isBanned && (
        <WelcomeEnvelope
          userId={layoutUser.id}
          customerName={layoutUser.name}
          createdAt={layoutUser.createdAt}
        />
      )}
    </div>
  )
}

   


/* =========================================================
   FLOATING DROPDOWN MENU ITEM
========================================================= */

function DropdownMenuItem({
  icon,
  label,
  active,
  onClick,
  badge = null,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
      className={`
        group
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-3
        text-left
        transition-all
        duration-200

        ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : ''
        }

        ${
          active
            ? 'bg-red-50 font-semibold text-red-700 shadow-sm ring-1 ring-red-100'
            : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
        }
      `}
    >

      {/* =================================================
          ICON
      ================================================= */}

      <span
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          text-base
          transition-colors

          ${
            active
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-700'
          }
        `}
      >
        {icon}
      </span>

      {/* =================================================
          LABEL
      ================================================= */}

      <span className="min-w-0 flex-1">

        <span
          className={`
            block
            truncate
            text-sm
            ${
              active
                ? 'font-bold'
                : 'font-semibold'
            }
          `}
        >
          {label}
        </span>

      </span>
{badge && (
  <span className="shrink-0 animate-pulse rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black tracking-wide text-white">
    {badge}
  </span>
)}
      {/* =================================================
          ACTIVE INDICATOR
      ================================================= */}

      {active && (
        <span
          className="
            h-5
            w-1
            shrink-0
            rounded-full
            bg-red-700
          "
        />
      )}

    </button>
  )
}
