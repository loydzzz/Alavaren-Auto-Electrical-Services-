import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBolt
} from "react-icons/fa"

import {
  ShieldAlert,
  ArrowLeft,
  UserRound,
  Wrench,
  ShieldCheck,
  X
} from 'lucide-react'

import toast, { Toaster } from 'react-hot-toast'

// ── Lockout helpers ──────────────────────────────────────────────
const LOCKOUT_KEY = 'login_lockout'

function getLockoutData() {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLockoutData(data) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data))
}

function getEmailLockout(email) {
  const data = getLockoutData()
  return data[email] || { attempts: 0, lockedUntil: 0 }
}

function setEmailLockout(email, info) {
  const data = getLockoutData()
  data[email] = info
  saveLockoutData(data)
}

function clearEmailLockout(email) {
  const data = getLockoutData()
  delete data[email]
  saveLockoutData(data)
}

/** Returns lockout minutes for a given attempt count */
function lockoutMinutes(attempts) {
  if (attempts < 3) return 0
  return Math.min(attempts - 2, 5)
}

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
// ─────────────────────────────────────────────────────────────────

export default function Login() {
  // Email field
  const [email, setEmail] = useState('')

  // Password field
  const [password, setPassword] = useState('')

  // Remember me checkbox
  const [remember, setRemember] = useState(false)

  // Show/Hide password
  const [showPassword, setShowPassword] = useState(false)

  // Loading state for login button
  const [loading, setLoading] = useState(false)

  // Lockout state
  const [lockedOut, setLockedOut] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)

  const navigate = useNavigate()
  const { role: requestedRole } = useParams()
  console.log('Requested login role:', requestedRole)
  const [accessDenied, setAccessDenied] = useState(null)

  // Check lockout whenever email changes
  const checkLockout = useCallback((emailToCheck) => {
    if (!emailToCheck) {
      setLockedOut(false)
      setLockoutRemaining('')
      setFailedAttempts(0)
      return
    }

    const info = getEmailLockout(
      emailToCheck.trim().toLowerCase()
    )

    const now = Date.now()

    if (info.lockedUntil > now) {
      setLockedOut(true)
      setLockoutRemaining(
        formatRemaining(info.lockedUntil - now)
      )
    } else {
      setLockedOut(false)
      setLockoutRemaining('')
    }

    setFailedAttempts(info.attempts)
  }, [])

  // Countdown timer while locked out
  useEffect(() => {
    if (!lockedOut) return

    const interval = setInterval(() => {
      const info = getEmailLockout(
        email.trim().toLowerCase()
      )

      const now = Date.now()

      if (info.lockedUntil <= now) {
        setLockedOut(false)
        setLockoutRemaining('')
        clearInterval(interval)
      } else {
        setLockoutRemaining(
          formatRemaining(info.lockedUntil - now)
        )
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockedOut, email])

  // Re-check lockout when email field changes
  useEffect(() => {
    checkLockout(email)
  }, [email, checkLockout])

  async function handleLogin(e) {
    e.preventDefault()

    if (!email.trim()) {
      return toast.error('Please enter your email.')
    }

    if (!password.trim()) {
      return toast.error('Please enter your password.')
    }

    const emailKey = email.trim().toLowerCase()

    // ── Check if currently locked out ──
    const lockInfo = getEmailLockout(emailKey)
    const now = Date.now()

    if (lockInfo.lockedUntil > now) {
      const remaining = formatRemaining(
        lockInfo.lockedUntil - now
      )

      setLockedOut(true)
      setLockoutRemaining(remaining)

      return toast.error(
        `Account temporarily locked. Try again in ${remaining}.`
      )
    }

    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    setLoading(false)

    if (error) {
      // ── Track failed attempt ──
      const current = getEmailLockout(emailKey)
      const newAttempts = current.attempts + 1
      const minutes = lockoutMinutes(newAttempts)

      if (minutes > 0) {
        const lockedUntil =
          Date.now() + minutes * 60 * 1000

        setEmailLockout(emailKey, {
          attempts: newAttempts,
          lockedUntil
        })

        setLockedOut(true)

        setLockoutRemaining(
          formatRemaining(lockedUntil - Date.now())
        )

        toast.error(
          `Too many failed attempts. Account locked for ${minutes} minute${minutes > 1 ? 's' : ''}.`
        )
      } else {
        setEmailLockout(emailKey, {
          attempts: newAttempts,
          lockedUntil: 0
        })

        const remaining = 3 - newAttempts

        toast.error(
          `${error.message}. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`
        )
      }

      setFailedAttempts(newAttempts)
      return
    }

    // ── Success — clear lockout ──
    clearEmailLockout(emailKey)
    setLockedOut(false)
    setFailedAttempts(0)

    const {
      data: profile,
      error: profileError
    } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    console.log('Logged in user:', data.user.id)
    console.log('Profile:', profile)

    if (profileError) {
      return toast.error(
        'Unable to load user profile.'
      )
    }

    const role = profile.role

    // =========================================================
    // CHECK IF USER IS ELIGIBLE FOR THIS LOGIN PORTAL
    // =========================================================

    if (
      requestedRole &&
      requestedRole !== role
    ) {
      await supabase.auth.signOut()

      setAccessDenied({
        requestedRole,
        actualRole: role,
      })

      return
    }

    // =========================================================
    // LOGIN SUCCESS
    // =========================================================

    toast.success(
      `${role.charAt(0).toUpperCase() + role.slice(1)} logged in successfully!`,
      { duration: 3000 }
    )

    if (role === 'admin') {
      navigate('/admin')
    } else if (role === 'technician') {
      navigate('/technician')
    } else {
      navigate('/customer')
    }
  }

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          html,
          body,
          #root {
            margin: 0;
            min-height: 100%;
          }

          body {
            background: #f1f2f4;
          }

          /* =====================================================
             PAGE
          ===================================================== */

          .login-page {
            position: relative;
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family:
              "Segoe UI",
              Arial,
              sans-serif;
            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #f5f5f5 45%,
                #e5e7eb 100%
              );
          }


          /* =====================================================
             BACKGROUND WAVES
          ===================================================== */

          .login-background {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }

          .login-wave {
            position: absolute;
            left: -5%;
            width: 110%;
            pointer-events: none;
          }

          .login-wave svg {
            display: block;
            width: 100%;
            height: 100%;
          }

          .login-wave-top {
            top: -70px;
            height: 360px;
          }

          .login-wave-middle {
            top: 20%;
            height: 360px;
            opacity: 0.65;
          }

          .login-wave-bottom {
            bottom: -80px;
            height: 350px;
          }


          /* =====================================================
             FLOATING BACKGROUND CARDS
          ===================================================== */

          .floating-shape {
            position: absolute;
            border-radius: 28px;
            border: 1px solid rgba(255, 255, 255, 0.7);
            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.7),
                rgba(255, 255, 255, 0.18)
              );
            box-shadow:
              0 25px 60px rgba(31, 41, 55, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transform: rotate(-12deg);
          }

          .floating-shape-one {
            width: 210px;
            height: 110px;
            top: 10%;
            left: -70px;
          }

          .floating-shape-two {
            width: 180px;
            height: 180px;
            top: 16%;
            right: -75px;
            transform: rotate(18deg);
          }

          .floating-shape-three {
            width: 150px;
            height: 90px;
            bottom: 10%;
            left: 8%;
            transform: rotate(12deg);
          }

          .floating-shape-four {
            width: 230px;
            height: 120px;
            bottom: 7%;
            right: -80px;
            transform: rotate(-14deg);
          }


          /* =====================================================
             RED ORBS
          ===================================================== */

          .red-orb {
            position: absolute;
            border-radius: 999px;
            background:
              radial-gradient(
                circle at 35% 30%,
                rgba(231, 76, 60, 0.38),
                rgba(192, 57, 43, 0.08) 55%,
                transparent 72%
              );
            filter: blur(2px);
          }

          .red-orb-one {
            width: 280px;
            height: 280px;
            top: -120px;
            right: 14%;
          }

          .red-orb-two {
            width: 220px;
            height: 220px;
            bottom: -90px;
            left: 22%;
            opacity: 0.65;
          }


          /* =====================================================
             MAIN
          ===================================================== */

          .login-main {
            position: relative;
            z-index: 5;
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding:
              clamp(24px, 5vw, 60px)
              16px;
          }


          /* =====================================================
             MAIN FLOATING CARD
          ===================================================== */

          .login-card {
            position: relative;
            display: flex;
            width: 100%;
            max-width: 980px;
            min-height: 560px;
            overflow: hidden;

            border:
              1px solid rgba(255, 255, 255, 0.8);

            border-radius: 30px;

            background:
              rgba(255, 255, 255, 0.88);

            box-shadow:
              0 35px 90px rgba(31, 41, 55, 0.16),
              0 10px 30px rgba(192, 57, 43, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);

            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }


          /* =====================================================
             LEFT BRANDING
          ===================================================== */

          .login-brand-panel {
            position: relative;
            width: 42%;
            min-width: 350px;
            display: flex;
            align-items: flex-end;
            overflow: hidden;

            background-image:
              linear-gradient(
                145deg,
                rgba(192, 57, 43, 0.15),
                rgba(17, 24, 39, 0.25)
              ),
              url('/alavaren.jpg');

            background-size: cover;
            background-position: center;
          }


          /* Red glass layer */

          .login-brand-panel::before {
            content: "";
            position: absolute;
            inset: 0;

            background:
              linear-gradient(
                145deg,
                rgba(192, 57, 43, 0.82) 0%,
                rgba(127, 29, 29, 0.48) 45%,
                rgba(17, 24, 39, 0.78) 100%
              );

            z-index: 0;
          }


          /* Wavy brand decoration */

          .login-brand-panel::after {
            content: "";
            position: absolute;
            width: 420px;
            height: 420px;
            right: -210px;
            bottom: -210px;
            border-radius: 50%;

            border:
              1px solid rgba(255, 255, 255, 0.18);

            box-shadow:
              0 0 0 35px rgba(255, 255, 255, 0.04),
              0 0 0 70px rgba(255, 255, 255, 0.03);

            z-index: 1;
          }


          .login-brand-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;

            background:
              linear-gradient(
                to top,
                rgba(17, 24, 39, 0.82),
                rgba(17, 24, 39, 0.08) 70%
              );
          }


          /* =====================================================
             BRAND CONTENT
          ===================================================== */

          .login-brand-content {
            position: relative;
            z-index: 3;
            width: 100%;
            padding: 36px;
            color: white;
          }


          .login-brand-title {
            margin: 0;
            max-width: 340px;

            font-size:
              clamp(25px, 3vw, 34px);

            line-height: 1.15;
            font-weight: 800;
            letter-spacing: -0.8px;

            text-shadow:
              0 5px 20px rgba(0, 0, 0, 0.25);
          }


          .login-brand-tagline {
            max-width: 330px;
            margin: 12px 0 0;

            font-size: 13px;
            line-height: 1.7;

            color:
              rgba(255, 255, 255, 0.82);
          }


          /* =====================================================
             RIGHT FORM PANEL
          ===================================================== */

          .login-form-panel {
            position: relative;
            flex: 1;
            min-width: 0;

            padding:
              clamp(32px, 5vw, 58px);

            background:
              linear-gradient(
                145deg,
                rgba(255, 255, 255, 0.98),
                rgba(248, 249, 250, 0.94)
              );
          }


          /* Decorative red line */

          .login-form-panel::before {
            content: "";
            position: absolute;
            top: 0;
            right: 40px;
            width: 100px;
            height: 4px;

            border-radius: 0 0 10px 10px;

            background:
              linear-gradient(
                90deg,
                #922b21,
                #c0392b,
                #e74c3c
              );
          }


          /* =====================================================
             LOGO ROW
          ===================================================== */

          .login-logo-row {
            display: flex;
            align-items: center;
            gap: 13px;
            margin-bottom: 30px;
          }


          .login-logo {
            position: relative;

            width: 50px;
            height: 50px;
            min-width: 50px;

            display: flex;
            align-items: center;
            justify-content: center;

            color: white;

            border-radius: 16px;

            background:
              linear-gradient(
                145deg,
                #c0392b,
                #922b21
              );

            box-shadow:
              0 12px 25px rgba(192, 57, 43, 0.25);
          }


          .login-logo::after {
            content: "";
            position: absolute;
            inset: -5px;

            border-radius: 20px;

            border:
              1px solid rgba(192, 57, 43, 0.12);

            pointer-events: none;
          }


          .login-company-name {
            margin: 0;

            color: #1f2937;

            font-size: 15px;
            line-height: 1.3;
            font-weight: 800;
          }


          .login-company-subtitle {
            margin: 3px 0 0;

            color: #9ca3af;

            font-size: 10px;
            line-height: 1.5;
          }


          /* =====================================================
             HEADING
          ===================================================== */

          .login-heading {
            margin: 0 0 6px;

            color: #1f2937;

            font-size:
              clamp(25px, 3vw, 30px);

            line-height: 1.2;
            font-weight: 800;
            letter-spacing: -0.6px;
          }


          .login-description {
            margin: 0 0 25px;

            color: #9ca3af;

            font-size: 12px;
            line-height: 1.5;
          }


          /* =====================================================
             FIELDS
          ===================================================== */

          .login-field {
            margin-bottom: 18px;
          }


          .login-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;

            margin-bottom: 7px;
          }


          .login-label {
            color: #4b5563;

            font-size: 11px;
            font-weight: 700;
          }


          .forgot-password {
            color: #c0392b;

            font-size: 10px;
            font-weight: 700;

            cursor: pointer;
            white-space: nowrap;

            transition:
              color 0.2s ease;
          }


          .forgot-password:hover {
            color: #922b21;
          }


          /* =====================================================
             INPUT
          ===================================================== */

          .input-box {
            position: relative;

            width: 100%;
            height: 48px;

            display: flex;
            align-items: center;

            border:
              1px solid #e5e7eb;

            border-radius: 12px;

            background:
              rgba(255, 255, 255, 0.92);

            box-shadow:
              0 4px 15px rgba(31, 41, 55, 0.035);

            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease;
          }


          .input-box:hover {
            border-color: #d1d5db;
          }


          .input-box:focus-within {
            border-color: #c0392b;

            box-shadow:
              0 0 0 4px rgba(192, 57, 43, 0.07),
              0 8px 20px rgba(31, 41, 55, 0.05);

            transform: translateY(-1px);
          }


          .input-icon {
            flex: 0 0 auto;

            margin-left: 15px;

            color: #9ca3af;

            font-size: 14px;

            transition:
              color 0.2s ease;
          }


          .input-box:focus-within .input-icon {
            color: #c0392b;
          }


          .input-box input {
            width: 100%;
            min-width: 0;
            height: 100%;

            border: none;
            outline: none;

            background: transparent;

            padding:
              0 13px;

            color: #1f2937;

            font-size: 13px;
          }


          .input-box input::placeholder {
            color: #b6bbc3;
          }


          .password-box input {
            padding-right: 48px;
          }


          /* =====================================================
             EYE BUTTON
          ===================================================== */

          .eye-btn {
            position: absolute;
            top: 0;
            right: 0;

            width: 46px;
            height: 48px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            outline: none;
            background: transparent;

            color: #9ca3af;

            cursor: pointer;

            transition:
              color 0.2s ease;
          }


          .eye-btn:hover {
            color: #c0392b;
          }


          /* =====================================================
             REMEMBER
          ===================================================== */

          .remember-row {
            display: flex;
            align-items: center;
            gap: 8px;

            margin-bottom: 18px;
          }


          .remember-row input {
            width: 15px;
            height: 15px;

            margin: 0;

            accent-color: #c0392b;

            cursor: pointer;
          }


          .remember-label {
            color: #6b7280;

            font-size: 11px;
            font-weight: 500;

            cursor: pointer;
          }


          /* =====================================================
             WARNINGS
          ===================================================== */

          .lockout-banner,
          .failed-attempts {
            border-radius: 12px;
            text-align: center;
          }


          .lockout-banner {
            margin-bottom: 14px;
            padding: 11px 13px;

            background:
              linear-gradient(
                135deg,
                #fff1f2,
                #fef2f2
              );

            border:
              1px solid #fecaca;

            color: #991b1b;

            font-size: 11px;
            font-weight: 500;

            box-shadow:
              0 6px 18px rgba(220, 38, 38, 0.06);
          }


          .failed-attempts {
            margin-bottom: 14px;
            padding: 10px 13px;

            background:
              linear-gradient(
                135deg,
                #fffbeb,
                #fefce8
              );

            border:
              1px solid #fde68a;

            color: #92400e;

            font-size: 10px;
          }


          /* =====================================================
             LOGIN BUTTON
          ===================================================== */

          .login-btn {
            position: relative;

            width: 100%;
            min-height: 48px;

            overflow: hidden;

            border: none;
            border-radius: 12px;

            background:
              linear-gradient(
                135deg,
                #c0392b,
                #a93226
              );

            color: white;

            font-size: 13px;
            font-weight: 800;

            cursor: pointer;

            box-shadow:
              0 12px 25px rgba(192, 57, 43, 0.22);

            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }


          .login-btn::before {
            content: "";

            position: absolute;
            top: 0;
            left: -100%;

            width: 70%;
            height: 100%;

            background:
              linear-gradient(
                90deg,
                transparent,
                rgba(255,255,255,0.18),
                transparent
              );

            transform: skewX(-20deg);

            transition:
              left 0.6s ease;
          }


          .login-btn:hover:not(:disabled) {
            background:
              linear-gradient(
                135deg,
                #a93226,
                #922b21
              );

            transform:
              translateY(-2px);

            box-shadow:
              0 16px 30px rgba(192, 57, 43, 0.28);
          }


          .login-btn:hover:not(:disabled)::before {
            left: 130%;
          }


          .login-btn:active:not(:disabled) {
            transform:
              translateY(0)
              scale(0.99);
          }


          .login-btn:disabled {
            cursor: not-allowed;
          }


          /* =====================================================
             SIGN UP
          ===================================================== */

          .signup-text {
            margin: 20px 0 0;

            color: #9ca3af;

            text-align: center;

            font-size: 10px;
            line-height: 1.5;
          }


          .signup-link {
            margin-left: 5px;

            color: #c0392b;

            font-weight: 800;

            cursor: pointer;

            transition:
              color 0.2s ease;
          }


          .signup-link:hover {
            color: #922b21;
          }


          /* =====================================================
             FOOTER
          ===================================================== */

          .login-footer {
            position: relative;
            z-index: 5;

            width: 100%;

            padding:
              12px 16px 18px;

            color:
              rgba(75, 85, 99, 0.55);

            text-align: center;

            font-size: 9px;
            font-weight: 600;

            letter-spacing: 0.2px;
          }


          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 900px) {

            .login-main {
              padding:
                30px 20px;
            }

            .login-card {
              max-width: 760px;
              min-height: 520px;
              border-radius: 26px;
            }

            .login-brand-panel {
              width: 38%;
              min-width: 280px;
            }

            .login-brand-content {
              padding: 28px;
            }

            .login-form-panel {
              padding: 36px;
            }

            .floating-shape-one {
              left: -110px;
            }

            .floating-shape-two {
              right: -110px;
            }
          }


          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 680px) {

            .login-page {
              background:
                linear-gradient(
                  145deg,
                  #ffffff 0%,
                  #f5f5f5 50%,
                  #e5e7eb 100%
                );
            }


            .login-main {
              align-items: flex-start;

              padding:
                18px 12px 14px;
            }


            .login-card {
              width: 100%;
              max-width: 500px;
              min-height: auto;

              flex-direction: column;

              border-radius: 24px;

              box-shadow:
                0 25px 60px rgba(31, 41, 55, 0.13);
            }


            /* Mobile brand */

            .login-brand-panel {
              width: 100%;
              min-width: 0;

              height: 175px;
              min-height: 175px;

              align-items: flex-end;
            }


            .login-brand-content {
              padding:
                20px 22px 22px;
            }


            .login-brand-title {
              max-width: 290px;

              font-size: 22px;
            }


            .login-brand-tagline {
              max-width: 280px;

              margin-top: 7px;

              font-size: 11px;
            }


            /* Form */

            .login-form-panel {
              width: 100%;

              padding:
                28px 22px 25px;
            }


            .login-form-panel::before {
              right: 24px;
              width: 70px;
            }


            .login-logo-row {
              margin-bottom: 23px;
            }


            .login-logo {
              width: 45px;
              height: 45px;
              min-width: 45px;

              border-radius: 14px;
            }


            .login-company-name {
              font-size: 13px;
            }


            .login-company-subtitle {
              max-width: 230px;

              font-size: 9px;
            }


            .login-heading {
              font-size: 23px;
            }


            .login-description {
              margin-bottom: 22px;

              font-size: 11px;
            }


            .login-field {
              margin-bottom: 16px;
            }


            .input-box {
              height: 49px;

              border-radius: 11px;
            }


            .eye-btn {
              height: 49px;
            }


            /*
              Prevent iPhone Safari from zooming
              when focusing form inputs.
            */

            .input-box input {
              font-size: 16px;
            }


            .forgot-password {
              font-size: 9px;
            }


            .remember-row {
              margin-bottom: 17px;
            }


            .login-btn {
              min-height: 49px;

              border-radius: 11px;
            }


            .signup-text {
              margin-top: 18px;
            }


            /* Hide large decorative shapes */

            .floating-shape-one {
              width: 140px;
              height: 75px;
              top: 4%;
              left: -95px;
            }


            .floating-shape-two {
              width: 120px;
              height: 120px;
              top: 24%;
              right: -75px;
            }


            .floating-shape-three {
              width: 110px;
              height: 65px;
              bottom: 8%;
              left: -35px;
            }


            .floating-shape-four {
              width: 140px;
              height: 75px;
              bottom: 3%;
              right: -70px;
            }


            .red-orb-one {
              width: 180px;
              height: 180px;
              right: -70px;
              top: -60px;
            }


            .red-orb-two {
              width: 150px;
              height: 150px;
              left: -50px;
              bottom: -50px;
            }
          }


          /* =====================================================
             SMALL PHONES
          ===================================================== */

          @media (max-width: 390px) {

            .login-main {
              padding:
                10px 8px 10px;
            }


            .login-card {
              border-radius: 20px;
            }


            .login-brand-panel {
              height: 145px;
              min-height: 145px;
            }


            .login-brand-content {
              padding:
                17px 18px;
            }


            .login-brand-title {
              font-size: 19px;
            }


            .login-brand-tagline {
              font-size: 10px;
            }


            .login-form-panel {
              padding:
                23px 17px 21px;
            }


            .login-logo {
              width: 42px;
              height: 42px;
              min-width: 42px;
            }


            .login-company-name {
              font-size: 12px;
            }


            .login-company-subtitle {
              font-size: 8px;
            }


            .login-heading {
              font-size: 21px;
            }


            .login-description {
              font-size: 10px;
            }


            .input-box {
              height: 47px;
            }


            .eye-btn {
              height: 47px;
            }


            .login-btn {
              min-height: 47px;
            }


            .login-footer {
              padding:
                8px 10px 12px;

              font-size: 8px;
            }
          }


          /* =====================================================
             PHONE LANDSCAPE
             Wide but very short screens: restore the side-by-side
             card and compact everything so it fits.
             Must stay AFTER the mobile blocks above.
          ===================================================== */

          @media (orientation: landscape) and (max-height: 540px) {

            .login-main {
              align-items: center;
              padding: 12px 16px;
            }

            .login-card {
              flex-direction: row;
              width: 100%;
              max-width: 820px;
              min-height: 0;
              border-radius: 20px;
            }

            .login-brand-panel {
              width: 34%;
              min-width: 0;
              height: auto;
              min-height: 0;
            }

            .login-brand-content {
              padding: 16px 18px;
            }

            .login-brand-title {
              max-width: 200px;
              font-size: 18px;
            }

            .login-brand-tagline {
              max-width: 200px;
              margin-top: 6px;
              font-size: 10px;
              line-height: 1.5;
            }

            .login-form-panel {
              padding: 18px 24px;
            }

            .login-form-panel::before {
              right: 24px;
              width: 70px;
            }

            .login-logo-row {
              gap: 10px;
              margin-bottom: 10px;
            }

            .login-logo {
              width: 38px;
              height: 38px;
              min-width: 38px;
              border-radius: 12px;
            }

            .login-company-name {
              font-size: 12px;
            }

            .login-company-subtitle {
              display: none;
            }

            .login-heading {
              font-size: 20px;
            }

            .login-description {
              margin-bottom: 10px;
            }

            .login-field {
              margin-bottom: 10px;
            }

            .login-label-row {
              margin-bottom: 4px;
            }

            .input-box,
            .eye-btn {
              height: 40px;
            }

            .remember-row {
              margin-bottom: 10px;
            }

            .login-btn {
              min-height: 40px;
            }

            .signup-text {
              margin-top: 10px;
            }

            .login-footer {
              padding: 4px 10px 8px;
            }

            .login-wave-middle,
            .floating-shape-two,
            .floating-shape-three {
              display: none;
            }
          }


          /* =====================================================
             REDUCED MOTION
          ===================================================== */

          @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
              scroll-behavior: auto !important;
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
            }
          }
        `}
      </style>


      <div className="login-page">

        {/* =====================================================
            BACKGROUND DESIGN
        ===================================================== */}

        <div className="login-background">

          {/* RED TOP WAVE */}

          <div className="login-wave login-wave-top">
            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >
              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="
                  M0,150
                  C180,60 330,230 510,150
                  C690,70 810,20 1000,110
                  C1190,200 1300,210 1440,100
                  L1440,0
                  L0,0
                  Z
                "
              />
            </svg>
          </div>


          {/* GRAY WAVE */}

          <div className="login-wave login-wave-middle">
            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >
              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="
                  M0,210
                  C180,120 330,310 520,230
                  C700,155 800,90 980,180
                  C1160,270 1280,310 1440,190
                  L1440,400
                  L0,400
                  Z
                "
              />
            </svg>
          </div>


          {/* BOTTOM RED WAVE */}

          <div className="login-wave login-wave-bottom">
            <svg
              viewBox="0 0 1440 400"
              preserveAspectRatio="none"
            >
              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="
                  M0,270
                  C190,180 340,330 530,250
                  C720,170 820,110 1000,220
                  C1170,325 1280,310 1440,230
                  L1440,400
                  L0,400
                  Z
                "
              />
            </svg>
          </div>


          {/* FLOATING GLASS SHAPES */}

          <div className="floating-shape floating-shape-one" />
          <div className="floating-shape floating-shape-two" />
          <div className="floating-shape floating-shape-three" />
          <div className="floating-shape floating-shape-four" />


          {/* RED LIGHT EFFECTS */}

          <div className="red-orb red-orb-one" />
          <div className="red-orb red-orb-two" />

        </div>


        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '13px',
              maxWidth: '90vw'
            }
          }}
        />


        {/* =====================================================
            LOGIN MAIN
        ===================================================== */}

        <div className="login-main">

          <div className="login-card">

            {/* =================================================
                LEFT BRANDING PANEL
            ================================================= */}

            <div className="login-brand-panel">

              <div className="login-brand-overlay" />

              <div className="login-brand-content">

                <h2 className="login-brand-title">
                  Alavaren Auto Electrical
                </h2>

                <p className="login-brand-tagline">
                  "Driven by quality, powered by trust."
                </p>

              </div>

            </div>


            {/* =================================================
                RIGHT LOGIN FORM
            ================================================= */}

            <div className="login-form-panel">

              {/* LOGO */}

              <div className="login-logo-row">

                <div className="login-logo">
                  <FaBolt size={20} />
                </div>

                <div>

                  <p className="login-company-name">
                    Alavaren Auto Electrical
                  </p>

                  <p className="login-company-subtitle">
                    Appointment & Inventory Management System
                  </p>

                </div>

              </div>


              {/* HEADING */}

              <h2 className="login-heading">
                Login
              </h2>

              <p className="login-description">
                Please login to continue
              </p>


              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form onSubmit={handleLogin}>

                {/* EMAIL */}

                <div className="login-field">

                  <div className="login-label-row">

                    <label className="login-label">
                      Email
                    </label>

                  </div>

                  <div className="input-box">

                    <FaEnvelope className="input-icon" />

                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={e =>
                        setEmail(e.target.value)
                      }
                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div className="login-field">

                  <div className="login-label-row">

                    <label className="login-label">
                      Password
                    </label>

                    <span
                      onClick={() =>
                        navigate('/forgot-password')
                      }
                      className="forgot-password"
                    >
                      Forgot password?
                    </span>

                  </div>


                  <div className="input-box password-box">

                    <FaLock className="input-icon" />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password"
                      value={password}
                      onChange={e =>
                        setPassword(e.target.value)
                      }
                    />


                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >

                      {showPassword
                        ? <FaEyeSlash />
                        : <FaEye />}

                    </button>

                  </div>

                </div>


                {/* REMEMBER ME */}

                <div className="remember-row">

                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={e =>
                      setRemember(e.target.checked)
                    }
                  />

                  <label
                    htmlFor="remember"
                    className="remember-label"
                  >
                    Keep me signed in
                  </label>

                </div>


                {/* LOCKOUT WARNING */}

                {lockedOut && (

                  <div className="lockout-banner">

                    🔒 Account locked. Try again in{' '}

                    <strong>
                      {lockoutRemaining}
                    </strong>

                  </div>

                )}


                {/* FAILED ATTEMPTS */}

                {!lockedOut &&
                  failedAttempts > 0 &&
                  failedAttempts < 3 && (

                    <div className="failed-attempts">

                      ⚠️ {failedAttempts} failed attempt
                      {failedAttempts > 1 ? 's' : ''}.{' '}

                      {3 - failedAttempts} remaining before
                      lockout.

                    </div>

                  )}


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading || lockedOut}
                  style={
                    lockedOut
                      ? {
                          opacity: 0.5,
                          cursor: 'not-allowed'
                        }
                      : {}
                  }
                >

                  {lockedOut
                    ? `Locked (${lockoutRemaining})`
                    : loading
                    ? 'Logging in...'
                    : 'Login'}

                </button>

              </form>


              {/* =================================================
                  SIGN UP
                  CUSTOMER LOGIN ONLY
              ================================================= */}

              {requestedRole === 'customer' && (
                <p className="signup-text">

                  Don't have an account?

                  <span
                    onClick={() =>
                      navigate('/register')
                    }
                    className="signup-link"
                  >
                    Sign Up
                  </span>

                </p>
              )}

            </div>

          </div>

        </div>


        {/* =====================================================
            PREMIUM ROLE ACCESS DENIED MODAL
            (outer layer scrolls on short screens such as
            phone landscape; inner box uses my-auto to stay
            centered when it fits)
        ===================================================== */}

        {accessDenied && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-md"
          >

            {/* MODAL */}

            <div
              className="relative my-auto w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_35px_90px_rgba(31,41,55,0.22)] backdrop-blur-xl"
            >

              {/* TOP RED ACCENT */}

              <div
                className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#922b21] via-[#c0392b] to-[#e74c3c]"
              />


              {/* DECORATIVE RED GLOW */}

              <div
                className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"
              />

              <div
                className="pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-gray-400/10 blur-3xl"
              />


              {/* CLOSE BUTTON */}

              <button
                type="button"
                onClick={() => setAccessDenied(null)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/80 text-gray-400 shadow-sm backdrop-blur transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-700 active:scale-95"
                aria-label="Close"
              >
                <X size={17} strokeWidth={2.2} />
              </button>


              {/* HEADER */}

              <div className="relative px-6 pb-5 pt-8 sm:px-7">

                <div className="flex items-center gap-4">

                  {/* ICON */}

                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c0392b] to-[#922b21] text-white shadow-[0_12px_25px_rgba(192,57,43,0.25)] ring-4 ring-red-50"
                  >
                    <ShieldAlert
                      size={25}
                      strokeWidth={2}
                    />

                    <span
                      className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-400 ring-2 ring-white"
                    />
                  </div>


                  {/* TITLE */}

                  <div className="min-w-0">

                    <p
                      className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-red-700"
                    >
                      Alavaren Auto Electrical
                    </p>

                    <h2
                      className="mt-1 text-[21px] font-extrabold tracking-[-0.4px] text-gray-900"
                    >
                      Access Restricted
                    </h2>

                  </div>

                </div>

              </div>


              {/* CONTENT */}

              <div className="relative px-6 pb-7 sm:px-7">

                {/* MAIN MESSAGE */}

                <div
                  className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm"
                >

                  <div className="flex gap-3">

                    <div
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700"
                    >
                      <ShieldAlert
                        size={16}
                        strokeWidth={2.4}
                      />
                    </div>

                    <div>

                      <p
                        className="text-sm font-extrabold text-red-900"
                      >
                        This account cannot access this portal.
                      </p>

                      <p
                        className="mt-1 text-[12px] leading-5 text-red-800/80"
                      >
                        Your account is registered under a
                        different role and does not have permission
                        to use this login.
                      </p>

                    </div>

                  </div>

                </div>


                {/* ROLE COMPARISON */}

                <div className="mt-4 grid grid-cols-2 gap-3">

                  {/* YOUR ACCOUNT */}

                  <div
                    className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4"
                  >

                    <p
                      className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400"
                    >
                      Your account
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm ring-1 ring-gray-100"
                      >
                        <UserRound size={15} />
                      </div>

                      <span
                        className="truncate text-xs font-extrabold capitalize text-gray-800"
                      >
                        {accessDenied.actualRole}
                      </span>

                    </div>

                  </div>


                  {/* REQUESTED PORTAL */}

                  <div
                    className="rounded-2xl border border-red-100 bg-red-50/70 p-4"
                  >

                    <p
                      className="text-[9px] font-extrabold uppercase tracking-wider text-red-400"
                    >
                      Requested portal
                    </p>

                    <div className="mt-2 flex items-center gap-2">

                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-red-700 shadow-sm ring-1 ring-red-100"
                      >

                        {accessDenied.requestedRole === 'technician' ? (
                          <Wrench size={15} />
                        ) : accessDenied.requestedRole === 'admin' ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <UserRound size={15} />
                        )}

                      </div>

                      <span
                        className="truncate text-xs font-extrabold capitalize text-red-900"
                      >
                        {accessDenied.requestedRole}
                      </span>

                    </div>

                  </div>

                </div>


                {/* PROFESSIONAL MESSAGE */}

                <div className="mt-4">

                  <p
                    className="text-center text-[11px] leading-5 text-gray-400"
                  >
                    {accessDenied.requestedRole === 'technician'
                      ? 'The Technician Portal is exclusively available to authorized technician professionals.'
                      : accessDenied.requestedRole === 'admin'
                      ? 'The Administrator Portal is exclusively available to authorized administrators.'
                      : 'The Customer Portal is exclusively available to registered customer accounts.'
                    }
                  </p>

                </div>


                {/* RETURN BUTTON */}

                <button
                  type="button"
                  onClick={() => setAccessDenied(null)}
                  className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c0392b] to-[#a93226] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_25px_rgba(192,57,43,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(192,57,43,0.28)] active:translate-y-0 active:scale-[0.99]"
                >

                  <ArrowLeft
                    size={16}
                    className="transition-transform duration-200 group-hover:-translate-x-1"
                  />

                  Return to Login

                </button>


                {/* SECURITY FOOTER */}

                <div
                  className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-semibold text-gray-400"
                >
                  <ShieldCheck
                    size={12}
                    className="text-green-500"
                  />

                  Secure role-based access

                </div>

              </div>

            </div>
          </div>
        )}


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="login-footer">

          © {new Date().getFullYear()} Alavaren Auto Electrical Services. All rights reserved.

        </div>

      </div>
    </>
  )
}