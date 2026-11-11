import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  FaEnvelope,
  FaArrowLeft,
  FaCarBattery,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa'
import toast, { Toaster } from 'react-hot-toast'

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [activeLegalModal, setActiveLegalModal] = useState('')

  const navigate = useNavigate()

  // Close the legal modal using Escape (same as Login)
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

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter your email address.')
      return
    }

    setLoading(true)

    try {
      const redirectTo =
        `${window.location.origin}/reset-password`

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          { redirectTo }
        )

      if (error) {
        toast.error(error.message)
        return
      }

      setSent(true)

      toast.success(
        'Password reset link sent! Check your email.'
      )
    } catch {
      toast.error(
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleTryAgain() {
    setSent(false)
    setEmail('')
  }

  function closeLegalModal() {
    setActiveLegalModal('')
  }

  // Lock background scrolling while a legal modal is open
  useEffect(() => {
    if (!activeLegalModal) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Prevent the background page from scrolling
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    // Prevent layout shifting when the scrollbar disappears
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore the original page styles when the modal closes
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [activeLegalModal])

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

        .forgot-page {
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

        .forgot-background {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .forgot-wave {
          position: absolute;
          left: -5%;
          width: 110%;
          pointer-events: none;
        }

        .forgot-wave svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .forgot-wave-top {
          top: -70px;
          height: 360px;
        }

        .forgot-wave-middle {
          top: 20%;
          height: 360px;
          opacity: .65;
        }

        .forgot-wave-bottom {
          bottom: -80px;
          height: 350px;
        }

        /* FLOATING GLASS SHAPES */

        .forgot-floating-shape {
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

        .forgot-floating-one {
          width: 210px;
          height: 110px;
          top: 10%;
          left: -70px;
        }

        .forgot-floating-two {
          width: 180px;
          height: 180px;
          top: 16%;
          right: -75px;
          transform: rotate(18deg);
        }

        .forgot-floating-three {
          width: 150px;
          height: 90px;
          bottom: 10%;
          left: 8%;
          transform: rotate(12deg);
        }

        .forgot-floating-four {
          width: 230px;
          height: 120px;
          bottom: 7%;
          right: -80px;
          transform: rotate(-14deg);
        }

        /* RED ORBS */

        .forgot-red-orb {
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

        .forgot-red-orb-one {
          width: 280px;
          height: 280px;
          top: -120px;
          right: 14%;
        }

        .forgot-red-orb-two {
          width: 220px;
          height: 220px;
          bottom: -90px;
          left: 22%;
          opacity: .65;
        }

        /* MAIN */

        .forgot-main {
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

        .forgot-card {
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

        .forgot-brand-panel {
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

        .forgot-brand-panel::before {
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

        .forgot-brand-panel::after {
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

        .forgot-brand-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            to top,
            rgba(17,24,39,.82),
            rgba(17,24,39,.08) 70%
          );
        }

        .forgot-brand-content {
          position: relative;
          z-index: 3;
          width: 100%;
          padding: 36px;
          color: white;
        }

        .forgot-brand-title {
          margin: 0;
          max-width: 340px;
          font-size: clamp(25px,3vw,34px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -.8px;
          text-shadow: 0 5px 20px rgba(0,0,0,.25);
        }

        .forgot-brand-tagline {
          max-width: 330px;
          margin: 12px 0 0;
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,.82);
        }

        /* FORM PANEL */

        .forgot-form-panel {
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

        .forgot-form-panel::before {
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

        .forgot-logo-row {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 30px;
        }

        .forgot-logo {
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

        .forgot-logo::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 20px;
          border: 1px solid rgba(192,57,43,.12);
          pointer-events: none;
        }

        .forgot-company-name {
          margin: 0;
          color: #1f2937;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 800;
        }

        .forgot-company-subtitle {
          margin: 3px 0 0;
          color: #9ca3af;
          font-size: 10px;
          line-height: 1.5;
        }

        /* BACK BUTTON */

        .forgot-back {
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

        .forgot-back:hover {
          color: #c0392b;
          transform: translateX(-3px);
        }

        /* HEADING */

        .forgot-label {
          margin-bottom: 7px;
          color: #c0392b;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .forgot-heading {
          margin: 0 0 7px;
          color: #1f2937;
          font-size: clamp(25px,3vw,30px);
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -.6px;
        }

        .forgot-description {
          max-width: 440px;
          margin: 0 0 26px;
          color: #9ca3af;
          font-size: 12px;
          line-height: 1.6;
        }

        /* EMAIL FIELD */

        .forgot-field {
          margin-bottom: 17px;
        }

        .forgot-field-label {
          display: block;
          margin-bottom: 7px;
          color: #4b5563;
          font-size: 11px;
          font-weight: 700;
        }

        .forgot-input-box {
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

        .forgot-input-box:hover {
          border-color: #d1d5db;
        }

        .forgot-input-box:focus-within {
          border-color: #c0392b;
          box-shadow:
            0 0 0 4px rgba(192,57,43,.07),
            0 8px 20px rgba(31,41,55,.05);
        }

        .forgot-input-icon {
          flex: 0 0 auto;
          margin-left: 15px;
          color: #9ca3af;
          font-size: 14px;
          transition: color .2s ease;
        }

        .forgot-input-box:focus-within .forgot-input-icon {
          color: #c0392b;
        }

        .forgot-input-box input {
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

        .forgot-input-box input::placeholder {
          color: #b6bbc3;
        }

        .forgot-input-box input:disabled {
          cursor: not-allowed;
          opacity: .6;
        }

        /* SUBMIT BUTTON */

        .forgot-submit {
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

        .forgot-submit::before {
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

        .forgot-submit:hover:not(:disabled) {
          background: linear-gradient(135deg,#a93226,#922b21);
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(192,57,43,.28);
        }

        .forgot-submit:hover:not(:disabled)::before {
          left: 130%;
        }

        .forgot-submit:disabled {
          cursor: not-allowed;
          opacity: .7;
        }

        /* SECURITY MESSAGE */

        .forgot-security {
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

        .forgot-security svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #c0392b;
          font-size: 11px;
        }

        /* SUCCESS STATE */

        .forgot-success {
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

        .forgot-success-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 13px;
          border-radius: 18px;
          color: white;
          background: linear-gradient(135deg,#35a853,#218838);
          box-shadow: 0 10px 25px rgba(40,167,69,.22);
          font-size: 25px;
        }

        .forgot-success-label {
          color: #35a853;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .forgot-success h3 {
          margin: 7px 0;
          color: #242424;
          font-size: 20px;
          font-weight: 800;
        }

        .forgot-success-description {
          margin: 0 auto 18px;
          color: #777;
          font-size: 11px;
          line-height: 1.6;
        }

        .forgot-email-display {
          display: block;
          margin-top: 4px;
          color: #333;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .forgot-success-info {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          text-align: left;
          border-radius: 11px;
          background: rgba(40,167,69,.06);
          border: 1px solid rgba(40,167,69,.10);
        }

        .forgot-success-info-icon {
          color: #35a853;
          font-size: 13px;
          flex-shrink: 0;
        }

        .forgot-success-info strong,
        .forgot-success-info small {
          display: block;
        }

        .forgot-success-info strong {
          margin-bottom: 2px;
          color: #28783c;
          font-size: 10px;
        }

        .forgot-success-info small {
          color: #7c9b83;
          font-size: 9px;
          line-height: 1.4;
        }

        .forgot-try-again {
          margin-top: 18px;
          border: none;
          background: transparent;
          color: #888;
          font-size: 10px;
          cursor: pointer;
        }

        .forgot-try-again:hover {
          text-decoration: underline;
        }

        .forgot-try-again span {
          color: #c0392b;
          font-weight: 800;
        }

        /* BOTTOM LOGIN */

        .forgot-bottom {
          margin-top: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #9ca3af;
          font-size: 10px;
          line-height: 1.5;
        }

        .forgot-bottom button {
          padding: 3px;
          border: none;
          background: transparent;
          color: #c0392b;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .forgot-bottom button:hover {
          text-decoration: underline;
        }

        /* PAGE FOOTER */

        .forgot-footer {
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
        .forgot-footer-copy,
        .forgot-footer-links {
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

        /* MODAL HEADER */

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

        /* X BUTTON — SAME AS LOGIN */

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

        /* MODAL CONTENT — NO INNER SCROLLBAR */

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

        /* MODAL FOOTER */

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

        /* MODAL ANIMATIONS */

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
          .forgot-main {
            padding: 30px 20px;
          }

          .forgot-card {
            max-width: 760px;
            min-height: 520px;
            border-radius: 26px;
          }

          .forgot-brand-panel {
            width: 38%;
            min-width: 280px;
          }

          .forgot-brand-content {
            padding: 28px;
          }

          .forgot-form-panel {
            padding: 36px;
          }

          .forgot-floating-one {
            left: -110px;
          }

          .forgot-floating-two {
            right: -110px;
          }
        }

        /* MOBILE */

        @media (max-width: 680px) {
          .forgot-page {
            background: linear-gradient(
              145deg,
              #fff 0%,
              #f5f5f5 50%,
              #e5e7eb 100%
            );
          }

          .forgot-main {
            align-items: flex-start;
            padding: 18px 12px 14px;
          }

          .forgot-card {
            width: 100%;
            max-width: 500px;
            min-height: auto;
            flex-direction: column;
            border-radius: 24px;
            box-shadow: 0 25px 60px rgba(31,41,55,.13);
          }

          .forgot-brand-panel {
            width: 100%;
            min-width: 0;
            height: 175px;
            min-height: 175px;
            align-items: flex-end;
          }

          .forgot-brand-content {
            padding: 20px 22px 22px;
          }

          .forgot-brand-title {
            max-width: 290px;
            font-size: 22px;
          }

          .forgot-brand-tagline {
            max-width: 280px;
            margin-top: 7px;
            font-size: 11px;
          }

          .forgot-form-panel {
            width: 100%;
            padding: 28px 22px 25px;
          }

          .forgot-form-panel::before {
            right: 24px;
            width: 70px;
          }

          .forgot-logo-row {
            margin-bottom: 22px;
          }

          .forgot-logo {
            width: 45px;
            height: 45px;
            min-width: 45px;
            border-radius: 14px;
          }

          .forgot-company-name {
            font-size: 13px;
          }

          .forgot-company-subtitle {
            max-width: 230px;
            font-size: 9px;
          }

          .forgot-back {
            margin-bottom: 22px;
          }

          .forgot-heading {
            font-size: 23px;
          }

          .forgot-description {
            margin-bottom: 22px;
            font-size: 11px;
          }

          .forgot-input-box {
            height: 49px;
            border-radius: 11px;
          }

          .forgot-input-box input {
            font-size: 16px;
          }

          .forgot-submit {
            min-height: 49px;
            border-radius: 11px;
          }

          .forgot-security {
            font-size: 8px;
          }

          .forgot-bottom {
            margin-top: 18px;
          }

          /* Footer: copyright on one line, legal links on their own line below */
          .forgot-footer-copy,
          .forgot-footer-links {
            display: block;
          }

          .forgot-footer-links {
            margin-top: 2px;
          }

          .forgot-footer-split {
            display: none;
          }

          .forgot-floating-one {
            width: 140px;
            height: 75px;
            top: 4%;
            left: -95px;
          }

          .forgot-floating-two {
            width: 120px;
            height: 120px;
            top: 24%;
            right: -75px;
          }

          .forgot-floating-three {
            width: 110px;
            height: 65px;
            bottom: 8%;
            left: -35px;
          }

          .forgot-floating-four {
            width: 140px;
            height: 75px;
            bottom: 3%;
            right: -70px;
          }

          .forgot-red-orb-one {
            width: 180px;
            height: 180px;
            right: -70px;
            top: -60px;
          }

          .forgot-red-orb-two {
            width: 150px;
            height: 150px;
            left: -50px;
            bottom: -50px;
          }

          /* LEGAL MODALS ON MOBILE */

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
          .forgot-main {
            padding: 10px 8px;
          }

          .forgot-card {
            border-radius: 20px;
          }

          .forgot-brand-panel {
            height: 145px;
            min-height: 145px;
          }

          .forgot-brand-content {
            padding: 17px 18px;
          }

          .forgot-brand-title {
            font-size: 19px;
          }

          .forgot-brand-tagline {
            font-size: 10px;
          }

          .forgot-form-panel {
            padding: 23px 17px 21px;
          }

          .forgot-logo {
            width: 42px;
            height: 42px;
            min-width: 42px;
          }

          .forgot-company-name {
            font-size: 12px;
          }

          .forgot-company-subtitle {
            font-size: 8px;
          }

          .forgot-heading {
            font-size: 21px;
          }

          .forgot-description {
            font-size: 10px;
          }

          .forgot-input-box {
            height: 47px;
          }

          .forgot-submit {
            min-height: 47px;
          }

          .forgot-success {
            padding: 23px 17px;
          }

          .forgot-footer {
            padding: 8px 10px 12px;
            font-size: 8px;
          }
        }

        /* REDUCED MOTION */

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

      <div className="forgot-page">

        {/* BACKGROUND */}

        <div className="forgot-background">
          <div className="forgot-wave forgot-wave-top">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="M0,150 C180,60 330,230 510,150 C690,70 810,20 1000,110 C1190,200 1300,210 1440,100 L1440,0 L0,0 Z"
              />
            </svg>
          </div>

          <div className="forgot-wave forgot-wave-middle">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="M0,210 C180,120 330,310 520,230 C700,155 800,90 980,180 C1160,270 1280,310 1440,190 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="forgot-wave forgot-wave-bottom">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="M0,270 C190,180 340,330 530,250 C720,170 820,110 1000,220 C1170,325 1280,310 1440,230 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="forgot-floating-shape forgot-floating-one" />
          <div className="forgot-floating-shape forgot-floating-two" />
          <div className="forgot-floating-shape forgot-floating-three" />
          <div className="forgot-floating-shape forgot-floating-four" />

          <div className="forgot-red-orb forgot-red-orb-one" />
          <div className="forgot-red-orb forgot-red-orb-two" />
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

        <main className="forgot-main">
          <div className="forgot-card">

            {/* BRANDING PANEL */}

            <div className="forgot-brand-panel">
              <div className="forgot-brand-overlay" />

              <div className="forgot-brand-content">
                <h2 className="forgot-brand-title">
                  Alavaren Auto Electrical
                </h2>

                <p className="forgot-brand-tagline">
                  "Driven by quality, powered by trust."
                </p>
              </div>
            </div>

            {/* FORM PANEL */}

            <div className="forgot-form-panel">

              <div className="forgot-logo-row">
                <div className="forgot-logo">
                  <FaCarBattery size={20} />
                </div>

                <div>
                  <p className="forgot-company-name">
                    Alavaren Auto Electrical
                  </p>

                  <p className="forgot-company-subtitle">
                    Appointment & Inventory Management System
                  </p>
                </div>
              </div>

              {/* BACK TO LOGIN */}

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="forgot-back"
              >
                <FaArrowLeft />
                <span>Back to Login</span>
              </button>

              {/* HEADING */}

              <div className="forgot-label">
                ACCOUNT RECOVERY
              </div>

              <h2 className="forgot-heading">
                Forgot Password?
              </h2>

              <p className="forgot-description">
                {sent
                  ? 'Your password reset request has been processed successfully.'
                  : "Enter your registered email address and we'll send you a secure link to reset your password."}
              </p>

              {/* SUCCESS STATE */}

              {sent ? (
                <div className="forgot-success">
                  <div className="forgot-success-icon">
                    <FaCheckCircle />
                  </div>

                  <div className="forgot-success-label">
                    PASSWORD RESET
                  </div>

                  <h3>Reset Link Sent</h3>

                  <p className="forgot-success-description">
                    We sent a password reset link to

                    <strong className="forgot-email-display">
                      {email}
                    </strong>
                  </p>

                  <div className="forgot-success-info">
                    <FaShieldAlt className="forgot-success-info-icon" />

                    <div>
                      <strong>Check your inbox</strong>

                      <small>
                        Open the email and follow the instructions to create a new password.
                      </small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="forgot-try-again"
                  >
                    Didn't receive it?

                    <span> Try again</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="forgot-field">
                    <label
                      htmlFor="forgot-email"
                      className="forgot-field-label"
                    >
                      Email
                    </label>

                    <div className="forgot-input-box">
                      <FaEnvelope className="forgot-input-icon" />

                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="forgot-submit"
                    disabled={loading}
                  >
                    {loading
                      ? 'Sending reset link...'
                      : 'Send Reset Link'}
                  </button>

                  <div className="forgot-security">
                    <FaShieldAlt />

                    <span>
                      Your account information remains protected. We will only use your email to send the password reset instructions.
                    </span>
                  </div>
                </form>
              )}

              {/* BOTTOM LOGIN */}

              <div className="forgot-bottom">
                <span>Remember your password?</span>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </button>
              </div>

            </div>
          </div>
        </main>

        {/* PAGE FOOTER */}

        <footer className="forgot-footer">
          <span className="forgot-footer-copy">
            © {new Date().getFullYear()} Alavaren Auto Electrical Services.
            {' '}All rights reserved.
          </span>

          <span className="forgot-footer-split" aria-hidden="true">
            {' '}·{' '}
          </span>

          <span className="forgot-footer-links">
            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('terms')}
              aria-haspopup="dialog"
              aria-controls="forgot-terms-modal"
            >
              Terms of Use
            </button>

            {' '}<span aria-hidden="true">·</span>{' '}

            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('privacy')}
              aria-haspopup="dialog"
              aria-controls="forgot-privacy-modal"
            >
              Privacy &amp; Cookies
            </button>
          </span>
        </footer>

        {/* TERMS OF USE / PRIVACY & COOKIES MODAL */}

        {activeLegalModal && (
          <div
            className="modal-overlay"
            onClick={closeLegalModal}
          >
            <div
              id={
                activeLegalModal === 'terms'
                  ? 'forgot-terms-modal'
                  : 'forgot-privacy-modal'
              }
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-legal-title"
              onClick={e => e.stopPropagation()}
            >

              {/* MODAL HEADER */}

              <div className="modal-header">
                <div>
                  <div className="modal-badge">
                    Legal
                  </div>

                  <h2
                    id="forgot-legal-title"
                    className="modal-title"
                  >
                    {activeLegalModal === 'terms'
                      ? 'Terms & Conditions'
                      : 'Privacy & Cookies'}
                  </h2>
                </div>

                {/* X BUTTON — SAME AS LOGIN */}

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

              {/* MODAL CONTENT — NO INNER SCROLLBAR */}

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

              {/* MODAL FOOTER */}

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