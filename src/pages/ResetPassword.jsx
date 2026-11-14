import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCarBattery,
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'

// =====================================================
// CONSTANTS (same rules as Register.jsx)
// =====================================================

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/

const PASSWORD_REQUIREMENT_LIST = [
  ['length', 'At least 12 characters'],
  ['uppercase', 'At least one uppercase letter'],
  ['lowercase', 'At least one lowercase letter'],
  ['number', 'At least one number'],
  ['special', 'At least one special character']
]

// Blocks paste, drop, copy and cut so the password must be typed manually
// (same helper as Register.jsx)
const noPaste = {
  onPaste: e => e.preventDefault(),
  onDrop: e => e.preventDefault(),
  onCopy: e => e.preventDefault(),
  onCut: e => e.preventDefault()
}

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

// =====================================================
// COMPONENT
// =====================================================

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const [done, setDone] = useState(false)
  const [activeLegalModal, setActiveLegalModal] = useState('')

  const redirectTimer = useRef(null)
  const navigate = useNavigate()

  // ---------------------------------------------------
  // PASSWORD RULES + STRENGTH (same logic as Register)
  // ---------------------------------------------------

  const passwordRequirements = useMemo(
    () => ({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }),
    [password]
  )

  const passwordStrength = useMemo(() => {
    if (!password) return ''

    const passed = Object.values(passwordRequirements).filter(Boolean).length

    if (passed <= 2) return 'weak'
    if (passed < 5) return 'fair'
    return 'strong'
  }, [password, passwordRequirements])

  // ---------------------------------------------------
  // SESSION FROM THE EMAIL LINK
  // ---------------------------------------------------

  useEffect(() => {
    let mounted = true

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === 'PASSWORD_RECOVERY' ||
          (event === 'SIGNED_IN' && session)
        ) {
          if (!mounted) return
          setSessionReady(true)
          setValidating(false)
        }
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) {
        setSessionReady(true)
        setValidating(false)
      }
    })

    // If nothing arrives, stop waiting and show the "invalid link" state
    const timer = setTimeout(() => {
      if (mounted) setValidating(false)
    }, 4000)

    return () => {
      mounted = false
      clearTimeout(timer)
      clearTimeout(redirectTimer.current)
      listener?.subscription?.unsubscribe()
    }
  }, [])

  // ---------------------------------------------------
  // LEGAL MODAL: Escape key + background scroll lock
  // ---------------------------------------------------

  function closeLegalModal() {
    setActiveLegalModal('')
  }

  useEffect(() => {
    if (!activeLegalModal) return

    function handleEscape(e) {
      if (e.key === 'Escape') setActiveLegalModal('')
    }

    document.addEventListener('keydown', handleEscape)

    return () => document.removeEventListener('keydown', handleEscape)
  }, [activeLegalModal])

  useEffect(() => {
    if (!activeLegalModal) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [activeLegalModal])

  // ---------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------

  async function goToLogin() {
    clearTimeout(redirectTimer.current)
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (loading) return

    if (!password) {
      toast.error('Please enter a new password.')
      return
    }

    if (!strongPasswordRegex.test(password)) {
      toast.error(
        'Password must be at least 12 characters and contain an uppercase letter, lowercase letter, number, and special character.'
      )
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password updated successfully!')
      setDone(true)

      // Sign out and send the user to login after a short moment
      redirectTimer.current = setTimeout(goToLogin, 3000)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------
  // WHICH PANEL TO SHOW
  // ---------------------------------------------------

  const passwordsFilled = confirmPassword.length > 0
  const passwordsMatch = password === confirmPassword

  let heading = 'Reset Password'
  let description = 'Create a new password for your account.'

  if (validating) {
    heading = 'Verifying Link'
    description = 'Please wait while we verify your reset link.'
  } else if (!sessionReady) {
    heading = 'Link Not Valid'
    description = 'This password reset link cannot be used.'
  } else if (done) {
    heading = 'Password Updated'
    description = 'Your password has been changed successfully.'
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

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

        .reset-page {
          position: relative;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          font-family: "Segoe UI", Arial, sans-serif;
          background: linear-gradient(
            135deg,
            #ffffff 0%,
            #f5f5f5 45%,
            #e5e7eb 100%
          );
        }

        /* BACKGROUND WAVES */

        .reset-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .reset-wave {
          position: absolute;
          left: -5%;
          width: 110%;
          pointer-events: none;
        }

        .reset-wave svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .reset-wave-top {
          top: -70px;
          height: 360px;
        }

        .reset-wave-middle {
          top: 20%;
          height: 360px;
          opacity: .65;
        }

        .reset-wave-bottom {
          bottom: -80px;
          height: 350px;
        }

        /* FLOATING GLASS SHAPES */

        .reset-floating-shape {
          position: absolute;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.7);
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.7),
            rgba(255,255,255,.18)
          );
          box-shadow:
            0 25px 60px rgba(31,41,55,.08),
            inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transform: rotate(-12deg);
        }

        .reset-floating-one {
          width: 210px;
          height: 110px;
          top: 10%;
          left: -70px;
        }

        .reset-floating-two {
          width: 180px;
          height: 180px;
          top: 16%;
          right: -75px;
          transform: rotate(18deg);
        }

        .reset-floating-three {
          width: 150px;
          height: 90px;
          bottom: 10%;
          left: 8%;
          transform: rotate(12deg);
        }

        .reset-floating-four {
          width: 230px;
          height: 120px;
          bottom: 7%;
          right: -80px;
          transform: rotate(-14deg);
        }

        /* RED ORBS */

        .reset-red-orb {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(
            circle at 35% 30%,
            rgba(231,76,60,.38),
            rgba(192,57,43,.08) 55%,
            transparent 72%
          );
          filter: blur(2px);
        }

        .reset-red-orb-one {
          width: 280px;
          height: 280px;
          top: -120px;
          right: 14%;
        }

        .reset-red-orb-two {
          width: 220px;
          height: 220px;
          bottom: -90px;
          left: 22%;
          opacity: .65;
        }

        /* MAIN */

        .reset-main {
          position: relative;
          z-index: 5;
          flex: 1;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 5vw, 60px) 16px;
        }

        /* MAIN CARD */

        .reset-card {
          position: relative;
          display: flex;
          width: 100%;
          max-width: 980px;
          min-height: 560px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.8);
          border-radius: 30px;
          background: rgba(255,255,255,.88);
          box-shadow:
            0 35px 90px rgba(31,41,55,.16),
            0 10px 30px rgba(192,57,43,.06),
            inset 0 1px 0 rgba(255,255,255,.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* BRANDING PANEL */

        .reset-brand-panel {
          position: relative;
          width: 42%;
          min-width: 350px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background-image:
            linear-gradient(
              145deg,
              rgba(192,57,43,.15),
              rgba(17,24,39,.25)
            ),
            url('/alavaren.jpg');
          background-size: cover;
          background-position: center;
        }

        .reset-brand-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            145deg,
            rgba(192,57,43,.82) 0%,
            rgba(127,29,29,.48) 45%,
            rgba(17,24,39,.78) 100%
          );
          z-index: 0;
        }

        .reset-brand-panel::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          right: -210px;
          bottom: -210px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.18);
          box-shadow:
            0 0 0 35px rgba(255,255,255,.04),
            0 0 0 70px rgba(255,255,255,.03);
          z-index: 1;
        }

        .reset-brand-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to top,
            rgba(17,24,39,.82),
            rgba(17,24,39,.08) 70%
          );
        }

        .reset-brand-content {
          position: relative;
          z-index: 3;
          width: 100%;
          padding: 36px;
          color: white;
        }

        .reset-brand-title {
          margin: 0;
          max-width: 340px;
          font-size: clamp(25px,3vw,34px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -.8px;
          text-shadow: 0 5px 20px rgba(0,0,0,.25);
        }

        .reset-brand-tagline {
          max-width: 330px;
          margin: 12px 0 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,.82);
        }

        /* FORM PANEL */

        .reset-form-panel {
          position: relative;
          flex: 1;
          min-width: 0;
          padding: clamp(32px,5vw,58px);
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.98),
            rgba(248,249,250,.94)
          );
        }

        .reset-form-panel::before {
          content: "";
          position: absolute;
          top: 0;
          right: 40px;
          width: 100px;
          height: 4px;
          border-radius: 0 0 10px 10px;
          background: linear-gradient(
            90deg,
            #922b21,
            #c0392b,
            #e74c3c
          );
        }

        /* LOGO */

        .reset-logo-row {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 30px;
        }

        .reset-logo {
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

        .reset-logo::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          border: 1px solid rgba(192,57,43,.12);
          pointer-events: none;
        }

        .reset-company-name {
          margin: 0;
          color: #1f2937;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 800;
        }

        .reset-company-subtitle {
          margin: 3px 0 0;
          color: #9ca3af;
          font-size: 10px;
          line-height: 1.5;
        }

        /* BACK BUTTON */

        .reset-back {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 28px;
          padding: 7px 10px 7px 0;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: color .2s ease, transform .2s ease;
        }

        .reset-back:hover {
          color: #c0392b;
          transform: translateX(-3px);
        }

        /* HEADING */

        .reset-label {
          margin-bottom: 7px;
          color: #c0392b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .reset-heading {
          margin: 0 0 7px;
          color: #1f2937;
          font-size: clamp(25px,3vw,30px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .reset-description {
          max-width: 440px;
          margin: 0 0 26px;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.6;
        }

        /* FIELDS */

        .reset-field {
          margin-bottom: 17px;
        }

        .reset-field-label {
          display: block;
          margin-bottom: 7px;
          color: #4b5563;
          font-size: 11px;
          font-weight: 700;
        }

        .reset-input-box {
          position: relative;
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 4px 15px rgba(31,41,55,.035);
          transition: border-color .2s ease, box-shadow .2s ease;
        }

        .reset-input-box:hover {
          border-color: #d1d5db;
        }

        .reset-input-box:focus-within {
          border-color: #c0392b;
          box-shadow:
            0 0 0 4px rgba(192,57,43,.07),
            0 8px 20px rgba(31,41,55,.05);
        }

        .reset-input-icon {
          flex: 0 0 auto;
          margin-left: 15px;
          color: #9ca3af;
          font-size: 14px;
          transition: color .2s ease;
        }

        .reset-input-box:focus-within .reset-input-icon {
          color: #c0392b;
        }

        .reset-input-box input {
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

        .reset-input-box input::placeholder {
          color: #b6bbc3;
        }

        .reset-input-box input:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        .reset-eye {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          margin-right: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: color .2s ease, background .2s ease;
        }

        .reset-eye:hover {
          color: #c0392b;
          background: rgba(192,57,43,.07);
        }

        /* PASSWORD FEEDBACK */

        .reset-strength {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .reset-requirements {
          margin-top: 8px;
          margin-left: 2px;
          font-size: 10px;
          line-height: 1.7;
        }

        .reset-match {
          margin-top: 7px;
          margin-left: 2px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 9px;
          font-weight: 600;
        }

        .reset-match span:first-child {
          font-size: 11px;
          font-weight: 800;
        }

        .reset-helper {
          margin-top: 6px;
          margin-left: 2px;
          color: #85898d;
          font-size: 9px;
        }

        /* SUBMIT BUTTON (same as Forgot Password) */

        .reset-submit {
          position: relative;
          width: 100%;
          min-height: 48px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg,#c0392b,#a93226);
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 25px rgba(192,57,43,.22);
          transition: transform .2s ease, box-shadow .2s ease;
        }

        .reset-submit::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.18),
            transparent
          );
          transform: skewX(-20deg);
          transition: left .6s ease;
        }

        .reset-submit:hover:not(:disabled) {
          background: linear-gradient(135deg,#a93226,#922b21);
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(192,57,43,.28);
        }

        .reset-submit:hover:not(:disabled)::before {
          left: 130%;
        }

        .reset-submit:disabled {
          cursor: not-allowed;
          opacity: .7;
        }

        /* SECURITY MESSAGE */

        .reset-security {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 16px;
          padding: 11px 12px;
          border-radius: 11px;
          background: rgba(243,244,246,.65);
          border: 1px solid rgba(0,0,0,.045);
          color: #9ca3af;
          font-size: 9px;
          line-height: 1.55;
        }

        .reset-security svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #c0392b;
          font-size: 11px;
        }

        /* STATUS CARDS (verifying / invalid / success) */

        .reset-status {
          padding: 26px 23px;
          text-align: center;
          border-radius: 18px;
          background: linear-gradient(
            145deg,
            rgba(255,255,255,.88),
            rgba(247,247,247,.75)
          );
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 15px 35px rgba(0,0,0,.06);
        }

        .reset-status-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 13px;
          border-radius: 18px;
          color: white;
          font-size: 25px;
        }

        .reset-status-icon.success {
          background: linear-gradient(135deg,#35a853,#218838);
          box-shadow: 0 10px 25px rgba(40,167,69,.22);
        }

        .reset-status-icon.warning {
          background: linear-gradient(135deg,#d97706,#b45309);
          box-shadow: 0 10px 25px rgba(217,119,6,.22);
        }

        .reset-status-label {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .reset-status-label.success { color: #35a853; }
        .reset-status-label.warning { color: #d97706; }

        .reset-status h3 {
          margin: 7px 0;
          color: #242424;
          font-size: 20px;
          font-weight: 800;
        }

        .reset-status-description {
          margin: 0 auto 18px;
          color: #777;
          font-size: 11px;
          line-height: 1.6;
        }

        .reset-spinner {
          width: 44px;
          height: 44px;
          margin: 0 auto 14px;
          border-radius: 50%;
          border: 3px solid rgba(192,57,43,.15);
          border-top-color: #c0392b;
          animation: resetSpin .8s linear infinite;
        }

        @keyframes resetSpin {
          to { transform: rotate(360deg); }
        }

        /* BOTTOM LOGIN */

        .reset-bottom {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #9ca3af;
          font-size: 10px;
          line-height: 1.5;
        }

        .reset-bottom button {
          padding: 3px;
          border: none;
          background: transparent;
          color: #c0392b;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .reset-bottom button:hover {
          text-decoration: underline;
        }

        /* PAGE FOOTER */

        .reset-footer {
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

        .reset-footer-copy,
        .reset-footer-links {
          display: inline;
        }

        /* LEGAL MODALS */

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
          box-shadow:
            0 28px 80px rgba(0,0,0,.26),
            0 8px 24px rgba(192,57,43,.08);
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
          background:
            radial-gradient(
              circle at 95% 0%,
              rgba(192,57,43,.09),
              transparent 34%
            ),
            linear-gradient(135deg,#fff,#f8f9fb);
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
          transition:
            transform .2s ease,
            box-shadow .2s ease;
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
          from {
            opacity: 0;
            transform: translateY(10px) scale(.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* TABLET */

        @media (max-width: 900px) {
          .reset-main {
            padding: 30px 20px;
          }

          .reset-card {
            max-width: 760px;
            min-height: 520px;
            border-radius: 26px;
          }

          .reset-brand-panel {
            width: 38%;
            min-width: 280px;
          }

          .reset-brand-content {
            padding: 28px;
          }

          .reset-form-panel {
            padding: 36px;
          }

          .reset-floating-one {
            left: -110px;
          }

          .reset-floating-two {
            right: -110px;
          }
        }

        /* MOBILE */

        @media (max-width: 680px) {
          .reset-main {
            align-items: flex-start;
            padding: 18px 12px 14px;
          }

          .reset-card {
            width: 100%;
            max-width: 500px;
            min-height: auto;
            flex-direction: column;
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(31,41,55,.13);
          }

          .reset-brand-panel {
            width: 100%;
            min-width: 0;
            height: 175px;
            min-height: 175px;
            align-items: flex-end;
          }

          .reset-brand-content {
            padding: 20px 22px 22px;
          }

          .reset-brand-title {
            max-width: 290px;
            font-size: 22px;
          }

          .reset-brand-tagline {
            max-width: 280px;
            margin-top: 7px;
            font-size: 11px;
          }

          .reset-form-panel {
            width: 100%;
            padding: 28px 22px 25px;
          }

          .reset-form-panel::before {
            right: 24px;
            width: 70px;
          }

          .reset-logo-row {
            margin-bottom: 22px;
          }

          .reset-logo {
            width: 45px;
            height: 45px;
            min-width: 45px;
            border-radius: 14px;
          }

          .reset-company-name {
            font-size: 13px;
          }

          .reset-company-subtitle {
            max-width: 230px;
            font-size: 9px;
          }

          .reset-back {
            margin-bottom: 22px;
          }

          .reset-heading {
            font-size: 23px;
          }

          .reset-description {
            margin-bottom: 22px;
            font-size: 11px;
          }

          .reset-input-box {
            height: 49px;
            border-radius: 11px;
          }

          /* 16px stops iPhone Safari from zooming into fields */
          .reset-input-box input {
            font-size: 16px;
          }

          .reset-submit {
            min-height: 49px;
            border-radius: 11px;
          }

          .reset-security {
            font-size: 8px;
          }

          .reset-bottom {
            margin-top: 18px;
          }

          .reset-footer-copy,
          .reset-footer-links {
            display: block;
          }

          .reset-footer-links {
            margin-top: 2px;
          }

          .reset-footer-split {
            display: none;
          }

          .reset-floating-one {
            width: 140px;
            height: 75px;
            top: 4%;
            left: -95px;
          }

          .reset-floating-two {
            width: 120px;
            height: 120px;
            top: 24%;
            right: -75px;
          }

          .reset-floating-three {
            width: 110px;
            height: 65px;
            bottom: 8%;
            left: -35px;
          }

          .reset-floating-four {
            width: 140px;
            height: 75px;
            bottom: 3%;
            right: -70px;
          }

          .reset-red-orb-one {
            width: 180px;
            height: 180px;
            right: -70px;
            top: -60px;
          }

          .reset-red-orb-two {
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
        }

        /* SMALL PHONES */

        @media (max-width: 390px) {
          .reset-main {
            padding: 10px 8px;
          }

          .reset-card {
            border-radius: 20px;
          }

          .reset-brand-panel {
            height: 145px;
            min-height: 145px;
          }

          .reset-brand-content {
            padding: 17px 18px;
          }

          .reset-brand-title {
            font-size: 19px;
          }

          .reset-brand-tagline {
            font-size: 10px;
          }

          .reset-form-panel {
            padding: 23px 17px 21px;
          }

          .reset-logo {
            width: 42px;
            height: 42px;
            min-width: 42px;
          }

          .reset-company-name {
            font-size: 12px;
          }

          .reset-company-subtitle {
            font-size: 8px;
          }

          .reset-heading {
            font-size: 21px;
          }

          .reset-description {
            font-size: 10px;
          }

          .reset-input-box {
            height: 47px;
          }

          .reset-submit {
            min-height: 47px;
          }

          .reset-status {
            padding: 23px 17px;
          }

          .reset-footer {
            padding: 8px 10px 12px;
            font-size: 8px;
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

      <div className="reset-page">

        {/* BACKGROUND */}

        <div className="reset-background">
          <div className="reset-wave reset-wave-top">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="M0,150 C180,60 330,230 510,150 C690,70 810,20 1000,110 C1190,200 1300,210 1440,100 L1440,0 L0,0 Z"
              />
            </svg>
          </div>

          <div className="reset-wave reset-wave-middle">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="M0,210 C180,120 330,310 520,230 C700,155 800,90 980,180 C1160,270 1280,310 1440,190 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="reset-wave reset-wave-bottom">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="M0,270 C190,180 340,330 530,250 C720,170 820,110 1000,220 C1170,325 1280,310 1440,230 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="reset-floating-shape reset-floating-one" />
          <div className="reset-floating-shape reset-floating-two" />
          <div className="reset-floating-shape reset-floating-three" />
          <div className="reset-floating-shape reset-floating-four" />

          <div className="reset-red-orb reset-red-orb-one" />
          <div className="reset-red-orb reset-red-orb-two" />
        </div>

        {/* TOAST */}

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

        {/* MAIN */}

        <main className="reset-main">
          <div className="reset-card">

            {/* BRANDING PANEL */}

            <div className="reset-brand-panel">
              <div className="reset-brand-overlay" />

              <div className="reset-brand-content">
                <h2 className="reset-brand-title">
                  Alavaren Auto Electrical
                </h2>

                <p className="reset-brand-tagline">
                  "Driven by quality, powered by trust."
                </p>
              </div>
            </div>

            {/* FORM PANEL */}

            <div className="reset-form-panel">

              <div className="reset-logo-row">
                <div className="reset-logo">
                  <FaCarBattery size={20} />
                </div>

                <div>
                  <p className="reset-company-name">
                    Alavaren Auto Electrical
                  </p>

                  <p className="reset-company-subtitle">
                    Appointment & Inventory Management System
                  </p>
                </div>
              </div>

              {/* BACK TO LOGIN (hidden once the password is changed) */}

              {!done && (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="reset-back"
                >
                  <FaArrowLeft />
                  <span>Back to Login</span>
                </button>
              )}

              {/* HEADING */}

              <div className="reset-label">
                ACCOUNT RECOVERY
              </div>

              <h2 className="reset-heading">{heading}</h2>

              <p className="reset-description">{description}</p>

              {/* ---------- VERIFYING ---------- */}

              {validating && (
                <div className="reset-status">
                  <div className="reset-spinner" />

                  <p
                    className="reset-status-description"
                    style={{ marginBottom: 0 }}
                  >
                    Verifying your reset link...
                  </p>
                </div>
              )}

              {/* ---------- INVALID / EXPIRED LINK ---------- */}

              {!validating && !sessionReady && (
                <div className="reset-status">
                  <div className="reset-status-icon warning">
                    <FaExclamationTriangle />
                  </div>

                  <div className="reset-status-label warning">
                    LINK EXPIRED
                  </div>

                  <h3>Invalid or Expired Link</h3>

                  <p className="reset-status-description">
                    This password reset link is invalid or has expired.
                    Please request a new one.
                  </p>

                  <button
                    type="button"
                    className="reset-submit"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Request New Link
                  </button>
                </div>
              )}

              {/* ---------- SUCCESS ---------- */}

              {!validating && sessionReady && done && (
                <div className="reset-status">
                  <div className="reset-status-icon success">
                    <FaCheckCircle />
                  </div>

                  <div className="reset-status-label success">
                    PASSWORD RESET
                  </div>

                  <h3>All Set</h3>

                  <p className="reset-status-description">
                    Your password has been updated. You will be redirected
                    to the login page in a moment.
                  </p>

                  <button
                    type="button"
                    className="reset-submit"
                    onClick={goToLogin}
                  >
                    Continue to Sign In
                  </button>
                </div>
              )}

              {/* ---------- FORM ---------- */}

              {!validating && sessionReady && !done && (
                <form onSubmit={handleSubmit}>

                  {/* NEW PASSWORD */}

                  <div className="reset-field">
                    <label
                      htmlFor="reset-password"
                      className="reset-field-label"
                    >
                      New Password
                    </label>

                    <div className="reset-input-box">
                      <FaLock className="reset-input-icon" />

                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                        required
                        minLength={12}
                        {...noPaste}
                      />

                      <button
                        type="button"
                        className="reset-eye"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {passwordStrength && (
                      <div
                        className="reset-strength"
                        style={{
                          color:
                            passwordStrength === 'weak'
                              ? '#dc2626'
                              : passwordStrength === 'fair'
                              ? '#d97706'
                              : '#16a34a'
                        }}
                      >
                        Password strength:{' '}
                        {passwordStrength.charAt(0).toUpperCase() +
                          passwordStrength.slice(1)}
                      </div>
                    )}

                    <div className="reset-requirements">
                      {PASSWORD_REQUIREMENT_LIST.map(([key, text]) => (
                        <div
                          key={key}
                          style={{
                            color: passwordRequirements[key]
                              ? '#16a34a'
                              : '#85898d'
                          }}
                        >
                          {passwordRequirements[key] ? '✓' : '○'} {text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className="reset-field">
                    <label
                      htmlFor="reset-confirm-password"
                      className="reset-field-label"
                    >
                      Confirm New Password
                    </label>

                    <div className="reset-input-box">
                      <FaLock className="reset-input-icon" />

                      <input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="new-password"
                        required
                        minLength={12}
                        aria-invalid={passwordsFilled && !passwordsMatch}
                        {...noPaste}
                      />

                      <button
                        type="button"
                        className="reset-eye"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {passwordsFilled ? (
                      <div
                        className="reset-match"
                        style={{
                          color: passwordsMatch ? '#16a34a' : '#dc2626'
                        }}
                      >
                        <span>{passwordsMatch ? '✓' : '✕'}</span>

                        <span>
                          {passwordsMatch
                            ? 'Passwords match.'
                            : 'Passwords do not match.'}
                        </span>
                      </div>
                    ) : (
                      <div className="reset-helper">
                        Re-enter the same password to confirm it.
                      </div>
                    )}
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="reset-submit"
                    disabled={loading}
                  >
                    {loading ? 'Updating password...' : 'Update Password'}
                  </button>

                  <div className="reset-security">
                    <FaShieldAlt />

                    <span>
                      Choose a password you have not used before. You will
                      be signed out and asked to log in with your new
                      password.
                    </span>
                  </div>
                </form>
              )}

              {/* BOTTOM LOGIN */}

              {!done && (
                <div className="reset-bottom">
                  <span>Remember your password?</span>

                  <button type="button" onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* PAGE FOOTER */}

        <footer className="reset-footer">
          <span className="reset-footer-copy">
            © {new Date().getFullYear()} Alavaren Auto Electrical Services.
            {' '}All rights reserved.
          </span>

          <span className="reset-footer-split" aria-hidden="true">
            {' '}·{' '}
          </span>

          <span className="reset-footer-links">
            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('terms')}
              aria-haspopup="dialog"
              aria-controls="reset-terms-modal"
            >
              Terms of Use
            </button>

            {' '}<span aria-hidden="true">·</span>{' '}

            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('privacy')}
              aria-haspopup="dialog"
              aria-controls="reset-privacy-modal"
            >
              Privacy &amp; Cookies
            </button>
          </span>
        </footer>

        {/* TERMS OF USE / PRIVACY & COOKIES MODAL */}

        {activeLegalModal && (
          <div className="modal-overlay" onClick={closeLegalModal}>
            <div
              id={
                activeLegalModal === 'terms'
                  ? 'reset-terms-modal'
                  : 'reset-privacy-modal'
              }
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-legal-title"
              onClick={e => e.stopPropagation()}
            >

              <div className="modal-header">
                <div>
                  <div className="modal-badge">Legal</div>

                  <h2 id="reset-legal-title" className="modal-title">
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

              <div className="modal-content">
                {(activeLegalModal === 'terms'
                  ? TERMS
                  : PRIVACY_COOKIES
                ).map(([title, body]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>

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