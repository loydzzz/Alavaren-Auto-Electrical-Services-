import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Outlet } from 'react-router-dom'
import { FaLock, FaUserSlash } from 'react-icons/fa'

export default function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [accountDeactivated, setAccountDeactivated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      setLoading(true)
      setAccessDenied(false)
      setAccountDeactivated(false)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // =========================================================
      // NOT LOGGED IN
      // =========================================================

      if (!user) {
        window.location.href = '/'
        return
      }

      // =========================================================
      // LOAD USER PROFILE
      // =========================================================

      const { data: profile, error } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      // =========================================================
      // PROFILE COULD NOT BE LOADED
      // =========================================================

      if (error || !profile) {
        await supabase.auth.signOut()
        window.location.href = '/'
        return
      }

      setUserRole(profile.role)

      // =========================================================
      // ACCOUNT DEACTIVATED
      // =========================================================

      if (profile.is_active === false) {
        setAccountDeactivated(true)
        setLoading(false)

        await supabase.auth.signOut()

        return
      }

      // =========================================================
      // WRONG ROLE
      // =========================================================

      if (!allowedRoles.includes(profile.role)) {
        setAccessDenied(true)
        setLoading(false)
        return
      }

      // =========================================================
      // CORRECT ROLE
      // =========================================================

      setLoading(false)
    }

    checkAuth()
  }, [allowedRoles])

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    if (accountDeactivated) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FaUserSlash className="text-2xl text-red-700" />
            </div>

            <h1 className="mt-5 text-xl font-extrabold text-gray-900">
              Account Deactivated
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your account has been deactivated by an administrator.
              You cannot access the system while your account is inactive.
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/'
              }}
              className="
                mt-6
                w-full
                rounded-xl
                bg-red-700
                px-4
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-red-800
                active:scale-[0.99]
              "
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-red-200 border-t-red-700" />

          <p className="mt-3 text-sm font-semibold text-gray-600">
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FaUserSlash className="text-2xl text-red-700" />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-gray-900">
            Account Deactivated
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Your account has been deactivated by an administrator.
            You cannot access the system while your account is inactive.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/'
            }}
            className="
              mt-6
              w-full
              rounded-xl
              bg-red-700
              px-4
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:bg-red-800
            "
          >
            Return to Home
          </button>
        </div>
      </div>
    )
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <FaLock className="text-2xl text-red-700" />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-gray-900">
            Access Restricted
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            You are currently logged in as{' '}
            <span className="font-bold text-gray-900">
              {userRole}
            </span>
            .
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This page is only available to authorized{' '}
            <span className="font-bold text-red-700">
              {roleName}s
            </span>
            .
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
              mt-6
              w-full
              rounded-xl
              bg-red-700
              px-4
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:bg-red-800
              active:scale-[0.99]
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