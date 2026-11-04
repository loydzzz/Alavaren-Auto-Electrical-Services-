import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaBolt,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa'
import {
  ShieldAlert,
  ArrowLeft,
  UserRound,
  Wrench,
  ShieldCheck,
  X,
  FileText,
  LockKeyhole,
  Cookie
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

/* =========================================================
   LEGAL CONTENT — MATCHES FORGOT PASSWORD
========================================================= */

const TERMS = [
  ['1. Use of the System', 'Use the Alavaren Auto Electrical Services system only for legitimate account, appointment, and service-related purposes. By using it, you agree to follow these terms and applicable laws.'],
  ['2. Account and Information', 'Provide accurate account, contact, vehicle, and service details. Keep your login credentials private and promptly report suspected unauthorized access.'],
  ['3. Appointments', 'Submitting a request does not guarantee a booking. Appointments are subject to review and confirmation by Alavaren.'],
  ['4. Acceptable Use', 'Do not impersonate others, submit knowingly false information, access data without permission, disrupt the system, or use it for unlawful activity.'],
  ['5. Availability and Restrictions', 'The system may occasionally be unavailable or changed for maintenance, security, or service improvements. Access may be restricted for misuse or security concerns.'],
  ['6. Communications and Updates', 'Alavaren may use your provided contact details for account, appointment, scheduling, and related service updates. These terms may be revised when necessary; updated terms should be posted in the system.']
]

const PRIVACY_COOKIES = [
  ['1. Information We Collect', 'The system may collect information you provide, such as your name, contact details, account information, vehicle details, appointment requests, and messages related to service.'],
  ['2. How Information Is Used', 'Information may be used to manage accounts, respond to requests, schedule and provide services, send relevant updates, protect system security, and improve system operations.'],
  ['3. Access and Protection', 'Access to personal information should be limited to authorized personnel who need it for legitimate business purposes. Reasonable safeguards should be used to help protect information from unauthorized access or disclosure.'],
  ['4. Cookies and Similar Technologies', 'The website or its service providers may use essential cookies or similar technologies to support functionality, security, and user preferences. If optional analytics or tracking tools are used, explain them clearly and obtain consent where required. You can manage cookies through your browser settings; disabling them may affect some features.'],
  ['5. Sharing, Retention, and Your Choices', 'Information should only be shared when needed to operate the service, comply with legal obligations, or protect legitimate interests. It should be kept only as long as necessary. For questions or requests about personal information, contact Alavaren through its official contact channels.']
]

/* =========================================================
   LOGIN LOCKOUT HELPERS
========================================================= */

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

/* =========================================================
   LOGIN COMPONENT
========================================================= */

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [lockedOut, setLockedOut] = useState(false)
  const [lockoutRemaining, setLockoutRemaining] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)

  const [accessDenied, setAccessDenied] = useState(null)

  // Legal modal state
  const [activeLegalModal, setActiveLegalModal] = useState('')

  const navigate = useNavigate()
  const { role: requestedRole } = useParams()

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

  useEffect(() => {
    checkLockout(email)
  }, [email, checkLockout])

  // Close the legal modal using Escape
  useEffect(() => {
    if (!activeLegalModal) return

    function handleEscape(e) {
      if (e.key === 'Escape') {
        closeLegalModal()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [activeLegalModal])

  function closeLegalModal() {
    setActiveLegalModal('')
  }

  
  // Lock background scrolling while either modal is open
  useEffect(() => {
    const isModalOpen = Boolean(activeLegalModal || accessDenied)

    if (!isModalOpen) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Prevent the background page from scrolling
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    // Prevent horizontal layout shifting
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore the original page styles
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [activeLegalModal, accessDenied])


  async function handleLogin(e) {
    e.preventDefault()

    if (!email.trim()) {
      return toast.error('Please enter your email.')
    }

    if (!password.trim()) {
      return toast.error('Please enter your password.')
    }

    const emailKey = email.trim().toLowerCase()
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

    localStorage.setItem('remember_me', String(remember))
    setLoading(true)

    let data
    let error

    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      data = result.data
      error = result.error
    } catch {
      setLoading(false)
      toast.error('Unable to sign in. Please try again.')
      return
    }

    setLoading(false)

    if (error) {
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

    if (profileError || !profile) {
      toast.error('Unable to load user profile.')
      await supabase.auth.signOut()
      return
    }

    const role = profile.role

    if (requestedRole && requestedRole !== role) {
      await supabase.auth.signOut()

      setAccessDenied({
        requestedRole,
        actualRole: role
      })

      return
    }

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
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          min-height: 100%;
        }

        body {
          background: #f1f2f4;
        }

        button, input {
          font-family: inherit;
        }

        
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: "Segoe UI", Arial, sans-serif;
  background: linear-gradient(135deg,#fff 0%,#f5f5f5 45%,#e5e7eb 100%);
}


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
          opacity: .65;
        }

        .login-wave-bottom {
          bottom: -80px;
          height: 350px;
        }

        .floating-shape {
          position: absolute;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.7);
          background: linear-gradient(145deg,rgba(255,255,255,.7),rgba(255,255,255,.18));
          box-shadow: 0 25px 60px rgba(31,41,55,.08),inset 0 1px 0 rgba(255,255,255,.9);
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

        .red-orb {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 30%,rgba(231,76,60,.38),rgba(192,57,43,.08) 55%,transparent 72%);
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
          opacity: .65;
        }

        
.login-main {
  position: relative;
  z-index: 5;
  flex: 0 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(24px,5vw,60px) 16px;
}


        .login-card {
          position: relative;
          display: flex;
          width: 100%;
          max-width: 980px;
          min-height: 560px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 30px;
          background: rgba(255,255,255,.88);
          box-shadow: 0 35px 90px rgba(31,41,55,.16),0 10px 30px rgba(192,57,43,.06),inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .login-brand-panel {
          position: relative;
          width: 42%;
          min-width: 350px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background-image: linear-gradient(145deg,rgba(192,57,43,.15),rgba(17,24,39,.25)),url('/alavaren.jpg');
          background-size: cover;
          background-position: center;
        }

        .login-brand-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(145deg,rgba(192,57,43,.82) 0%,rgba(127,29,29,.48) 45%,rgba(17,24,39,.78) 100%);
          z-index: 0;
        }

        .login-brand-panel::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          right: -210px;
          bottom: -210px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.18);
          box-shadow: 0 0 0 35px rgba(255,255,255,.04),0 0 0 70px rgba(255,255,255,.03);
          z-index: 1;
        }

        .login-brand-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(to top,rgba(17,24,39,.82),rgba(17,24,39,.08) 70%);
        }

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
          font-size: clamp(25px,3vw,34px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -.8px;
          text-shadow: 0 5px 20px rgba(0,0,0,.25);
        }

        .login-brand-tagline {
          max-width: 330px;
          margin: 12px 0 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,.82);
        }

        .login-form-panel {
          position: relative;
          flex: 1;
          min-width: 0;
          padding: clamp(32px,5vw,58px);
          background: linear-gradient(145deg,rgba(255,255,255,.98),rgba(248,249,250,.94));
        }

        .login-form-panel::before {
          content: "";
          position: absolute;
          top: 0;
          right: 40px;
          width: 100px;
          height: 4px;
          border-radius: 0 0 10px 10px;
          background: linear-gradient(90deg,#922b21,#c0392b,#e74c3c);
        }

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
          background: linear-gradient(145deg,#c0392b,#922b21);
          box-shadow: 0 12px 25px rgba(192,57,43,.25);
        }

        .login-logo::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          border: 1px solid rgba(192,57,43,.12);
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

        .login-heading {
          margin: 0 0 6px;
          color: #1f2937;
          font-size: clamp(25px,3vw,30px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .login-description {
          margin: 0 0 25px;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.5;
        }

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
          transition: color .2s ease;
        }

        .forgot-password:hover {
          color: #922b21;
        }

        .input-box {
          position: relative;
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 4px 15px rgba(31,41,55,.035);
          transition: border-color .2s ease,box-shadow .2s ease,transform .2s ease;
        }

        .input-box:hover {
          border-color: #d1d5db;
        }

        .input-box:focus-within {
          border-color: #c0392b;
          box-shadow: 0 0 0 4px rgba(192,57,43,.07),0 8px 20px rgba(31,41,55,.05);
          transform: translateY(-1px);
        }

        .input-icon {
          flex: 0 0 auto;
          margin-left: 15px;
          color: #9ca3af;
          font-size: 14px;
          transition: color .2s ease;
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
          padding: 0 13px;
          color: #1f2937;
          font-size: 13px;
        }

        .input-box input::placeholder {
          color: #b6bbc3;
        }

        .password-box input {
          padding-right: 48px;
        }

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
          transition: color .2s ease;
        }

        .eye-btn:hover {
          color: #c0392b;
        }

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

        .lockout-banner,
        .failed-attempts {
          border-radius: 12px;
          text-align: center;
        }

        .lockout-banner {
          margin-bottom: 14px;
          padding: 11px 13px;
          background: linear-gradient(135deg,#fff1f2,#fef2f2);
          border: 1px solid #fecaca;
          color: #991b1b;
          font-size: 11px;
          font-weight: 500;
          box-shadow: 0 6px 18px rgba(220,38,38,.06);
        }

        .failed-attempts {
          margin-bottom: 14px;
          padding: 10px 13px;
          background: linear-gradient(135deg,#fffbeb,#fefce8);
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 10px;
        }

        .login-btn {
          position: relative;
          width: 100%;
          min-height: 48px;
          overflow: hidden;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg,#c0392b,#a93226);
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(192,57,43,.22);
          transition: transform .2s ease,box-shadow .2s ease,background .2s ease;
        }

        .login-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
          transform: skewX(-20deg);
          transition: left .6s ease;
        }

        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#a93226,#922b21);
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(192,57,43,.28);
        }

        .login-btn:hover:not(:disabled)::before {
          left: 130%;
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0) scale(.99);
        }

        .login-btn:disabled {
          cursor: not-allowed;
        }

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
          transition: color .2s ease;
        }

        .signup-link:hover {
          color: #922b21;
        }

        .login-footer {
          position: relative;
          z-index: 5;
          width: 100%;
          padding: 12px 16px 18px;
          color: rgba(75,85,99,.65);
          text-align: center;
          font-size: 9px;
          font-weight: 600;
          line-height: 2;
          letter-spacing: .2px;
        }

        /* Footer parts: single line on desktop/tablet (same as before) */
        .login-footer-copy,
        .login-footer-links {
          display: inline;
        }

        /* =====================================================
           LEGAL MODALS — SAME AS FORGOT PASSWORD
        ===================================================== */

        .terms-link {
          display: inline;
          padding: 0;
          border: 0;
          background: transparent;
          color: #c0392b;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .terms-link:hover {
          color: #922b21;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-x: hidden;
          overflow-y: auto;
          overscroll-behavior: contain;
          background: rgba(17,24,39,.66);
          backdrop-filter: blur(9px);
          -webkit-backdrop-filter: blur(9px);
          animation: termsOverlayIn .2s ease both;
        }

        .modal {
          position: relative;
          width: 100%;
          max-width: 650px;
          flex: 0 0 auto;
          margin: auto;
          display: block;
          overflow: visible;
          border: 1px solid rgba(255,255,255,.85);
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 28px 80px rgba(0,0,0,.26),0 8px 24px rgba(192,57,43,.08);
          animation: termsModalIn .24s ease both;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 17px 22px 14px;
          border-bottom: 1px solid #f0f1f3;
          border-radius: 22px 22px 0 0;
          background: radial-gradient(circle at 95% 0%,rgba(192,57,43,.09),transparent 34%),linear-gradient(135deg,#fff,#f8f9fb);
        }

        .modal-badge {
          display: inline-flex;
          align-items: center;
          margin-bottom: 5px;
          padding: 4px 8px;
          border: 1px solid rgba(192,57,43,.15);
          border-radius: 999px;
          color: #a93226;
          background: rgba(192,57,43,.07);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .modal-title {
          margin: 0;
          color: #1f2937;
          font-size: clamp(19px,2.5vw,23px);
          line-height: 1.25;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .close-button {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          color: #6b7280;
          background: #fff;
          cursor: pointer;
        }

        .close-button svg {
          display: block;
          width: 14px;
          height: 14px;
        }

        .close-button:hover {
          color: #b42318;
          border-color: #f0c9c5;
          background: #fff7f6;
        }

        /* No fixed height or internal scrolling */
        .modal-content {
          display: block;
          padding: 15px 22px 17px;
          overflow: visible;
          color: #6b7280;
          font-size: 11px;
          line-height: 1.5;
        }

        .modal-content > div {
          margin: 0 0 10px;
        }

        .modal-content > div:last-child {
          margin-bottom: 0;
        }

        .modal-content h3 {
          margin: 0 0 3px;
          color: #1f2937;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 800;
        }

        .modal-content p {
          margin: 0;
          color: #6b7280;
          font-size: 10.5px;
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 11px 22px;
          border-top: 1px solid #eceef1;
          border-radius: 0 0 22px 22px;
          background: #fafafa;
        }

        .modal-button {
          min-width: 112px;
          min-height: 36px;
          padding: 0 15px;
          border: 0;
          border-radius: 11px;
          color: #fff;
          background: linear-gradient(135deg,#c0392b,#922b21);
          box-shadow: 0 8px 18px rgba(192,57,43,.18);
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: transform .2s ease,box-shadow .2s ease;
        }

        .modal-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 11px 22px rgba(192,57,43,.24);
        }

        @keyframes termsOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes termsModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ACCESS RESTRICTED MODAL */

        .access-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 16px;
          background: rgba(15,23,42,.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .access-modal {
          position: relative;
          width: 100%;
          max-width: 430px;
          flex: 0 0 auto;
          margin: auto;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 26px;
          background: rgba(255,255,255,.97);
          box-shadow: 0 35px 90px rgba(31,41,55,.22);
          animation: termsModalIn .24s ease both;
        }

        .access-accent {
          position: absolute;
          inset: 0 0 auto;
          height: 4px;
          background: linear-gradient(90deg,#922b21,#c0392b,#e74c3c);
        }

        .access-close {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 5;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: rgba(255,255,255,.9);
          color: #9ca3af;
          cursor: pointer;
          transition: .2s ease;
        }

        .access-close:hover {
          color: #922b21;
          border-color: #fecaca;
          background: #fff1f2;
        }

        .access-header {
          position: relative;
          padding: 30px 25px 20px;
        }

        .access-brand {
          margin: 0 42px 5px 0;
          color: #b42318;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .access-title {
          margin: 0;
          color: #111827;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -.5px;
        }

        .access-content {
          padding: 0 25px 24px;
        }

        .access-message {
          display: flex;
          gap: 12px;
          padding: 15px;
          border: 1px solid #fee2e2;
          border-radius: 16px;
          background: linear-gradient(135deg,#fff1f2,#fff);
        }

        .access-message-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fee2e2;
          color: #b91c1c;
        }

        .access-message strong {
          display: block;
          color: #7f1d1d;
          font-size: 12px;
        }

        .access-message p {
          margin: 5px 0 0;
          color: #991b1b;
          font-size: 11px;
          line-height: 1.6;
        }

        .role-comparison {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .role-card {
          min-width: 0;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          background: #f9fafb;
        }

        .role-card.requested {
          border-color: #fee2e2;
          background: #fff7f6;
        }

        .role-caption {
          color: #9ca3af;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .role-card.requested .role-caption {
          color: #c24136;
        }

        .role-value {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          margin-top: 10px;
          color: #374151;
          font-size: 11px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .role-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: white;
          box-shadow: 0 1px 4px rgba(0,0,0,.05);
        }

        .role-value span {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-description {
          margin: 14px 0 0;
          color: #9ca3af;
          text-align: center;
          font-size: 10px;
          line-height: 1.7;
        }

        .return-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 18px;
        }

        .return-login svg {
          flex: 0 0 auto;
          transition: transform .2s ease;
        }

        .return-login:hover svg {
          transform: translateX(-3px);
        }

        .access-security {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 15px;
          color: #9ca3af;
          font-size: 9px;
          font-weight: 600;
        }

        .access-security svg {
          color: #22a06b;
        }

        @media (max-width: 900px) {
          .login-main {
            padding: 30px 20px;
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

        @media (max-width: 680px) {
          .login-main {
            align-items: flex-start;
            padding: 18px 12px 14px;
          }

          .login-card {
            width: 100%;
            max-width: 500px;
            min-height: auto;
            flex-direction: column;
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(31,41,55,.13);
          }

          .login-brand-panel {
            width: 100%;
            min-width: 0;
            height: 175px;
            min-height: 175px;
          }

          .login-brand-content {
            padding: 20px 22px 22px;
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

          .login-form-panel {
            width: 100%;
            padding: 28px 22px 25px;
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

          .input-box,
          .eye-btn {
            height: 49px;
          }

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

          /* Footer: copyright on one line, legal links on their own line below */
          .login-footer-copy,
          .login-footer-links {
            display: block;
          }

          .login-footer-links {
            margin-top: 2px;
          }

          .login-footer-split {
            display: none;
          }

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

          .modal-overlay {
            padding: 12px;
          }

          .modal {
            border-radius: 18px;
          }

          .modal-header {
            padding: 15px 16px 12px;
            border-radius: 18px 18px 0 0;
          }

          .modal-content {
            padding: 13px 16px 14px;
          }

          .modal-content p {
            font-size: 10px;
            line-height: 1.45;
          }

          .modal-content > div {
            margin-bottom: 9px;
          }

          .modal-footer {
            padding: 10px 16px;
            border-radius: 0 0 18px 18px;
          }

          .modal-button {
            width: 100%;
          }

          .access-header {
            padding: 26px 20px 18px;
          }

          .access-content {
            padding: 0 20px 22px;
          }

          .access-title {
            font-size: 20px;
          }
        }

        @media (max-width: 390px) {
          .login-main {
            padding: 10px 8px;
          }

          .login-card {
            border-radius: 20px;
          }

          .login-brand-panel {
            height: 145px;
            min-height: 145px;
          }

          .login-brand-content {
            padding: 17px 18px;
          }

          .login-brand-title {
            font-size: 19px;
          }

          .login-brand-tagline {
            font-size: 10px;
          }

          .login-form-panel {
            padding: 23px 17px 21px;
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

          .input-box,
          .eye-btn,
          .login-btn {
            min-height: 47px;
            height: 47px;
          }

          .login-footer {
            padding: 8px 10px 12px;
            font-size: 8px;
          }

          .access-overlay {
            padding: 10px;
          }

          .access-header {
            padding: 24px 16px 16px;
          }

          .access-content {
            padding: 0 16px 18px;
          }

          .role-card {
            padding: 10px 8px;
          }
        }

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
            height: auto;
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

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="login-page">
        {/* BACKGROUND DESIGN */}
        <div className="login-background">
          <div className="login-wave login-wave-top">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="M0,150 C180,60 330,230 510,150 C690,70 810,20 1000,110 C1190,200 1300,210 1440,100 L1440,0 L0,0 Z"
              />
            </svg>
          </div>

          <div className="login-wave login-wave-middle">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="M0,210 C180,120 330,310 520,230 C700,155 800,90 980,180 C1160,270 1280,310 1440,190 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="login-wave login-wave-bottom">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="M0,270 C190,180 340,330 530,250 C720,170 820,110 1000,220 C1170,325 1280,310 1440,230 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="floating-shape floating-shape-one" />
          <div className="floating-shape floating-shape-two" />
          <div className="floating-shape floating-shape-three" />
          <div className="floating-shape floating-shape-four" />
          <div className="red-orb red-orb-one" />
          <div className="red-orb red-orb-two" />
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontSize: '13px',
              maxWidth: '90vw',
              borderRadius: '12px'
            }
          }}
        />

        {/* LOGIN MAIN */}
        <main className="login-main">
          <div className="login-card">
            {/* BRANDING PANEL */}
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

            {/* LOGIN FORM */}
            <div className="login-form-panel">
              <div className="login-logo-row">
                <div className="login-logo">
                  <FaBolt size={20} />
                </div>

                <div>
                  <p className="login-company-name">
                    Alavaren Auto Electrical
                  </p>

                  <p className="login-company-subtitle">
                    Appointment &amp; Inventory Management System
                  </p>
                </div>
              </div>

              <h2 className="login-heading">Login</h2>

              <p className="login-description">
                Please login to continue
              </p>

              <form onSubmit={handleLogin}>
                {/* EMAIL */}
                <div className="login-field">
                  <div className="login-label-row">
                    <label htmlFor="login-email" className="login-label">
                      Email
                    </label>
                  </div>

                  <div className="input-box">
                    <FaEnvelope className="input-icon" />

                    <input
                      id="login-email"
                      type="email"
                      placeholder="Enter email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="login-field">
                  <div className="login-label-row">
                    <label htmlFor="login-password" className="login-label">
                      Password
                    </label>

                    <span
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate('/forgot-password')}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate('/forgot-password')
                        }
                      }}
                      className="forgot-password"
                    >
                      Forgot password?
                    </span>
                  </div>

                  <div className="input-box password-box">
                    <FaLock className="input-icon" />

                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* REMEMBER ME */}
                <div className="remember-row">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />

                  <label htmlFor="remember" className="remember-label">
                    Keep me signed in
                  </label>
                </div>

                {/* LOCKOUT WARNING */}
                {lockedOut && (
                  <div className="lockout-banner" role="alert">
                    <strong>Account locked.</strong>
                    {' '}Try again in{' '}
                    <strong>{lockoutRemaining}</strong>
                  </div>
                )}

                {/* FAILED ATTEMPTS */}
                {!lockedOut &&
                  failedAttempts > 0 &&
                  failedAttempts < 3 && (
                    <div className="failed-attempts" role="status">
                      {failedAttempts} failed attempt
                      {failedAttempts > 1 ? 's' : ''}.{' '}
                      {3 - failedAttempts} remaining before lockout.
                    </div>
                  )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  className="login-btn"
                  disabled={loading || lockedOut}
                  style={
                    lockedOut
                      ? { opacity: 0.5, cursor: 'not-allowed' }
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

              {/* CUSTOMER SIGN UP ONLY */}
              {requestedRole === 'customer' && (
                <p className="signup-text">
                  Don't have an account?

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/register')}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate('/register')
                      }
                    }}
                    className="signup-link"
                  >
                    Sign Up
                  </span>
                </p>
              )}
            </div>
          </div>
        </main>

        {/* =====================================================
            ACCESS RESTRICTED MODAL
        ===================================================== */}

        {accessDenied && (
          <div
            className="access-overlay"
            onClick={() => setAccessDenied(null)}
          >
            <div
              className="access-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="access-restricted-title"
              onClick={e => e.stopPropagation()}
            >
              <div className="access-accent" />

              <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-gray-400/10 blur-3xl pointer-events-none" />

              <button
                type="button"
                onClick={() => setAccessDenied(null)}
                className="access-close"
                aria-label="Close access restriction"
              >
                <X size={17} strokeWidth={2.2} />
              </button>

              <div className="access-header">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c0392b] to-[#922b21] text-white shadow-lg ring-4 ring-red-50">
                    <ShieldAlert size={25} strokeWidth={2} />

                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-400 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="access-brand">
                      Alavaren Auto Electrical
                    </p>

                    <h2
                      id="access-restricted-title"
                      className="access-title"
                    >
                      Access Restricted
                    </h2>
                  </div>
                </div>
              </div>

              <div className="access-content">
                <div className="access-message">
                  <div className="access-message-icon">
                    <ShieldAlert size={17} strokeWidth={2.4} />
                  </div>

                  <div>
                    <strong>
                      This account cannot access this portal.
                    </strong>

                    <p>
                      Your account is registered under a different role
                      and does not have permission to use this login.
                    </p>
                  </div>
                </div>

                <div className="role-comparison">
                  <div className="role-card">
                    <p className="role-caption">Your account</p>

                    <div className="role-value">
                      <div className="role-icon">
                        <UserRound size={15} />
                      </div>

                      <span>{accessDenied.actualRole}</span>
                    </div>
                  </div>

                  <div className="role-card requested">
                    <p className="role-caption">Requested portal</p>

                    <div className="role-value" style={{ color: '#991b1b' }}>
                      <div className="role-icon" style={{ color: '#b91c1c' }}>
                        {accessDenied.requestedRole === 'technician' ? (
                          <Wrench size={15} />
                        ) : accessDenied.requestedRole === 'admin' ? (
                          <ShieldCheck size={15} />
                        ) : (
                          <UserRound size={15} />
                        )}
                      </div>

                      <span>{accessDenied.requestedRole}</span>
                    </div>
                  </div>
                </div>

                <p className="role-description">
                  {accessDenied.requestedRole === 'technician'
                    ? 'The Technician Portal is exclusively available to authorized technician professionals.'
                    : accessDenied.requestedRole === 'admin'
                    ? 'The Administrator Portal is exclusively available to authorized administrators.'
                    : 'The Customer Portal is exclusively available to registered customer accounts.'}
                </p>

                <button
                  type="button"
                  onClick={() => setAccessDenied(null)}
                  className="login-btn return-login"
                >
                  <ArrowLeft size={16} />
                  Return to Login
                </button>

                <div className="access-security">
                  <ShieldCheck size={12} />
                  Secure role-based access
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PAGE FOOTER + LEGAL LINKS
        ===================================================== */}

        <footer className="login-footer">
          <span className="login-footer-copy">
            © {new Date().getFullYear()} Alavaren Auto Electrical Services.
            {' '}All rights reserved.
          </span>

          <span className="login-footer-split" aria-hidden="true">
            {' '}·{' '}
          </span>

          <span className="login-footer-links">
            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('terms')}
              aria-haspopup="dialog"
            >
              Terms of Use
            </button>

            {' '}<span aria-hidden="true">·</span>{' '}

            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('privacy')}
              aria-haspopup="dialog"
            >
              Privacy &amp; Cookies
            </button>
          </span>
        </footer>

        {/* =====================================================
            TERMS OF USE / PRIVACY & COOKIES
            NO INTERNAL SCROLLBAR
        ===================================================== */}

        {activeLegalModal && (
          <div
            className="modal-overlay"
            onClick={closeLegalModal}
          >
            <div
              id={
                activeLegalModal === 'terms'
                  ? 'login-terms-modal'
                  : 'login-privacy-modal'
              }
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-legal-title"
              onClick={e => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="modal-header">
                <div>
                  <div className="modal-badge">
                    Legal
                  </div>

                  <h2 id="login-legal-title" className="modal-title">
                    {activeLegalModal === 'terms'
                      ? 'Terms & Conditions'
                      : 'Privacy & Cookies'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeLegalModal}
                  className="close-button"
                  aria-label="Close legal information"
                >
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M2 2 L12 12 M12 2 L2 12" />
                  </svg>
                </button>
              </div>

              {/* CONTENT */}
              <div className="modal-content">
                {(activeLegalModal === 'terms'
                  ? TERMS
                  : PRIVACY_COOKIES
                ).map(([heading, body]) => (
                  <div key={heading}>
                    <h3>{heading}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeLegalModal}
                  className="modal-button"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}