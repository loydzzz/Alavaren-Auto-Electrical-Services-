import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Outlet } from 'react-router-dom'
import {
  FaLock,
  FaUserSlash,
  FaArrowLeft,
} from 'react-icons/fa'

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [accountDeactivated, setAccountDeactivated] = useState(false)
  const [deactivatedAt, setDeactivatedAt] = useState(null)

  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      setLoading(true)
      setAccessDenied(false)
      setAccountDeactivated(false)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // NOT LOGGED IN
      if (!user) {
        window.location.href = '/'
        return
      }

      // LOAD USER PROFILE
      const { data: profile, error } = await supabase
        .from('users')
        .select('role, is_active, deactivated_at')
        .eq('id', user.id)
        .single()

      // PROFILE COULD NOT BE LOADED
      if (error || !profile) {
        await supabase.auth.signOut()
        window.location.href = '/'
        return
      }

      if (!mounted) return

      setUserRole(profile.role)

      // ACCOUNT DEACTIVATED
      if (profile.is_active === false) {
        setDeactivatedAt(profile.deactivated_at || null)
        setAccountDeactivated(true)
        setLoading(false)

        await supabase.auth.signOut()
        return
      }

      // WRONG ROLE
      if (!allowedRoles.includes(profile.role)) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // CORRECT ROLE
      setLoading(false)
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [allowedRoles])

  // =========================================================
  // MODERN ACCOUNT DEACTIVATED DESIGN
  // =========================================================

  const renderDeactivatedAccount = () => (
    <div className="
      relative isolate flex min-h-screen items-center justify-center
      overflow-hidden bg-gradient-to-br
      from-[#f8f8f8] via-[#f4f4f5] to-[#e9eaed]
      px-4 py-8 sm:px-6
    ">
      {/* FULL-PAGE WAVES + SOFT GLASS DECOR — THE CARD ITSELF IS UNCHANGED */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft blush and silver ambient lighting */}
        <div className="absolute -top-20 right-[12%] h-64 w-64 rounded-full bg-rose-300/35 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[18%] h-64 w-64 rounded-full bg-rose-200/45 blur-3xl" />
        <div className="absolute left-[-8rem] top-[38%] h-72 w-72 rounded-full bg-white/80 blur-3xl" />

        {/* Floating frosted-glass tiles, similar to the reference background */}
        <div className="absolute -left-5 top-[12%] h-20 w-28 rotate-[-12deg] rounded-[1.25rem] border border-white/90 bg-white/55 shadow-[0_18px_45px_rgba(100,116,139,0.10)] backdrop-blur-xl sm:left-[2%] sm:h-24 sm:w-32" />
        <div className="absolute -right-7 top-[19%] h-28 w-24 rotate-[17deg] rounded-[1.4rem] border border-white/90 bg-white/45 shadow-[0_18px_45px_rgba(100,116,139,0.10)] backdrop-blur-xl sm:right-[2%] sm:h-32 sm:w-28" />
        <div className="absolute bottom-[12%] left-[8%] h-16 w-24 rotate-[12deg] rounded-[1.2rem] border border-white/90 bg-white/55 shadow-[0_18px_45px_rgba(100,116,139,0.10)] backdrop-blur-xl sm:bottom-[11%] sm:left-[8%] sm:h-20 sm:w-28" />
        <div className="absolute bottom-[8%] -right-5 h-20 w-28 rotate-[-13deg] rounded-[1.4rem] border border-white/90 bg-white/45 shadow-[0_18px_45px_rgba(100,116,139,0.10)] backdrop-blur-xl sm:right-[3%] sm:h-24 sm:w-32" />

        {/* Layered flowing waves: top, middle, and bottom */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="deactivatedTopWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f9dede" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#eadfe1" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="deactivatedSilverWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e5e7eb" stopOpacity="0.48" />
              <stop offset="50%" stopColor="#d9dce1" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.50" />
            </linearGradient>
            <linearGradient id="deactivatedBottomWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f6e4e4" stopOpacity="0.76" />
              <stop offset="55%" stopColor="#eadbdd" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#e8dcde" stopOpacity="0.72" />
            </linearGradient>
          </defs>
          <path d="M0 0H1440V58C1290 112 1170 72 1030 35C865 -8 760 -20 590 24C405 73 355 96 180 58C105 42 45 34 0 42Z" fill="url(#deactivatedTopWave)" />
          <path d="M0 345C165 315 280 402 455 365C620 330 720 250 900 282C1085 314 1210 385 1440 318V545H0Z" fill="url(#deactivatedSilverWave)" />
          <path d="M0 805C170 760 285 845 440 820C625 790 760 710 920 735C1100 765 1210 850 1440 800V900H0Z" fill="url(#deactivatedBottomWave)" />
          <path d="M0 842C185 812 290 886 470 858C640 832 770 780 920 795C1100 812 1240 884 1440 850V900H0Z" fill="#f8f8f8" fillOpacity="0.45" />
        </svg>
      </div>

      <div className="
        relative z-10 w-full max-w-md overflow-hidden rounded-3xl
        border border-gray-200/80 bg-white
        shadow-2xl shadow-red-950/10
      ">

        {/* GRADIENT HEADER */}

        <div className="
          relative overflow-hidden
          bg-gradient-to-br from-red-700
          via-red-800 to-red-950
          px-6 pb-9 pt-8 text-center
          sm:px-8 sm:pt-9
        ">
          {/* Decorative background shapes */}

          <div className="
            pointer-events-none absolute -right-12 -top-16
            h-44 w-44 rounded-full
            border-[24px] border-white/5
          " />

          <div className="
            pointer-events-none absolute -bottom-20 -left-12
            h-40 w-40 rounded-full bg-white/5
          " />

          <div className="relative z-10">

            <div className="
              mx-auto flex h-20 w-20 items-center
              justify-center rounded-2xl
              border border-white/20
              bg-white/10 text-white
              shadow-lg shadow-black/10
              backdrop-blur-sm
            ">
              <FaUserSlash className="text-4xl" />
            </div>

            <p className="
              mt-5 text-xs font-bold uppercase
              tracking-[0.22em] text-red-100
            ">
              Account Access Restricted
            </p>

            <h1 className="
              mt-2 text-2xl font-extrabold
              tracking-tight text-white
              sm:text-3xl
            ">
              Account Deactivated
            </h1>

            <p className="
              mx-auto mt-3 max-w-xs
              text-sm leading-6 text-red-100/90
            ">
              Your account is currently inactive
              and access to the system has been restricted.
            </p>

          </div>
        </div>

        {/* WHITE CONTENT AREA */}

        <div className="px-6 py-7 sm:px-8 sm:py-8">

          <div className="
            rounded-2xl border border-red-100
            bg-gradient-to-br from-red-50
            to-white p-4 sm:p-5
          ">
            <div className="flex items-start gap-3">

              <div className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl bg-red-100 text-red-700
              ">
                <FaLock className="text-lg" />
              </div>

              <div className="min-w-0">
                <h2 className="
                  text-sm font-extrabold text-gray-900
                ">
                  Why can't I access my account?
                </h2>

                <p className="
                  mt-1.5 text-sm leading-6 text-gray-600
                ">
                  An administrator has deactivated your account.
                  Please contact the administrator if you need
                  assistance restoring your access.
                </p>
              </div>

            </div>
          </div>

          {/* DEACTIVATION DATE AND TIME */}

          <div className="
            mt-5 rounded-2xl border
            border-gray-200 bg-white p-4
            sm:p-5
          ">
            <div className="flex items-center gap-3">

              <div className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl bg-gray-100
              ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 text-gray-600"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                  />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="
                  text-xs font-bold uppercase
                  tracking-wider text-gray-500
                ">
                  Date and Time Deactivated
                </p>

                <p className="
                  mt-1.5 break-words text-sm
                  font-extrabold leading-6
                  text-gray-900
                ">
                  {deactivatedAt
                    ? new Date(deactivatedAt).toLocaleString(
                        'en-PH',
                        {
                          timeZone: 'Asia/Manila',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        }
                      )
                    : 'Date and time unavailable'}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Philippine Standard Time (PHT)
                </p>
              </div>

            </div>
          </div>

          {/* RETURN HOME BUTTON */}

          <button
            type="button"
            onClick={() => {
              window.location.href = '/'
            }}
            className="
              group mt-6 flex w-full
              items-center justify-center gap-2.5
              rounded-xl bg-gradient-to-r
              from-red-700 via-red-700 to-red-900
              px-5 py-3.5
              text-sm font-bold text-white
              shadow-lg shadow-red-700/20
              transition duration-200
              hover:-translate-y-0.5
              hover:from-red-800 hover:via-red-800
              hover:to-red-950
              hover:shadow-xl hover:shadow-red-800/25
              active:translate-y-0 active:scale-[0.99]
              focus:outline-none focus:ring-4
              focus:ring-red-200
            ">
            <FaArrowLeft className="
              transition-transform duration-200
              group-hover:-translate-x-1
            " />
            Return to Home
          </button>

          <p className="
            mt-5 text-center text-xs
            leading-5 text-gray-400
          ">
            If you believe this deactivation was a mistake,
            please contact your administrator.
          </p>

        </div>
      </div>
    </div>
  )

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="
        flex min-h-screen items-center
        justify-center bg-gray-50 px-4
      ">
        <div className="text-center">
          <div className="
            mx-auto h-9 w-9 animate-spin
            rounded-full border-4
            border-red-100 border-t-red-700
          " />

          <p className="
            mt-4 text-sm font-semibold text-gray-600
          ">
            Checking your account...
          </p>
        </div>
      </div>
    )
  }

  // =========================================================
  // DEACTIVATED ACCOUNT
  // =========================================================

  if (accountDeactivated) {
    return renderDeactivatedAccount()
  }

  // =========================================================
  // WRONG ROLE
  // =========================================================

  if (accessDenied) {
    const requiredRole = allowedRoles[0]

    const roleName =
      requiredRole === 'technician'
        ? 'Technician'
        : requiredRole === 'admin'
          ? 'Administrator'
          : 'Customer'

    return (
      <div className="
        flex min-h-screen items-center
        justify-center bg-gray-50 px-4
      ">
        <div className="
          w-full max-w-md rounded-2xl
          border border-gray-200 bg-white
          p-7 text-center shadow-xl
        ">

          <div className="
            mx-auto flex h-16 w-16 items-center
            justify-center rounded-full bg-red-50
          ">
            <FaLock className="text-2xl text-red-700" />
          </div>

          <h1 className="
            mt-5 text-xl font-extrabold text-gray-900
          ">
            Access Restricted
          </h1>

          <p className="
            mt-2 text-sm leading-6 text-gray-500
          ">
            You are currently logged in as{' '}
            <span className="font-bold text-gray-900">
              {userRole}
            </span>.
          </p>

          <p className="
            mt-2 text-sm leading-6 text-gray-500
          ">
            This page is only available to authorized{' '}
            <span className="font-bold text-red-700">
              {roleName}s
            </span>.
          </p>

          <button
            type="button"
            onClick={() => {
              if (userRole === 'admin') {
                window.location.href = '/admin'
              } else if (userRole === 'technician') {
                window.location.href = '/technician'
              } else {
                window.location.href = '/customer'
              }
            }}
            className="
              mt-6 w-full rounded-xl
              bg-gradient-to-r from-red-700
              to-red-900 px-4 py-3
              text-sm font-bold text-white
              transition hover:from-red-800
              hover:to-red-950 active:scale-[0.99]
            "
          >
            Return to My Dashboard
          </button>

        </div>
      </div>
    )
  }

  return <Outlet />
}