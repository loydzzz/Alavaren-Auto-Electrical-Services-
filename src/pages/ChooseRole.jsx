import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaTools,
  FaUserCog,
  FaBolt,
  FaArrowRight
} from 'react-icons/fa'

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

export default function ChooseRole() {
  const navigate = useNavigate()

  const [activeLegalModal, setActiveLegalModal] = useState('')

  function closeLegalModal() {
    setActiveLegalModal('')
  }

  
  // Lock background scrolling while a legal modal is open
  useEffect(() => {
    if (!activeLegalModal) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Prevent background page scrolling
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'

    // Prevent layout shifting when the scrollbar disappears
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // Restore the original page scrolling and spacing
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [activeLegalModal])


  const roles = [
    {
      name: 'Customer',
      icon: FaUser,
      description: 'Book home or online services.',
      path: '/login/customer'
    },
    {
      name: 'Technician',
      icon: FaTools,
      description: 'View assigned service tasks.',
      path: '/login/technician'
    },
    {
      name: 'Admin',
      icon: FaUserCog,
      description: 'Manage operations and appointments.',
      path: '/login/admin'
    }
  ]

  const styles = {
    page: {
      minHeight: '100vh',
      minHeight: '100dvh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#1F2937',
      padding: 'clamp(24px, 5vw, 60px) 16px',
      boxSizing: 'border-box'
    },

    content: {
      position: 'relative',
      zIndex: 3,
      width: '100%',
      maxWidth: '1050px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center'
    },

    brandArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 'clamp(16px, 3vw, 25px)'
    },

    brandMark: {
      width: 'clamp(58px, 9vw, 74px)',
      height: 'clamp(58px, 9vw, 74px)',
      borderRadius: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #C0392B, #7F1D1D)',
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow:
        '0 18px 40px rgba(192,57,43,0.28), inset 0 1px 0 rgba(255,255,255,0.25)',
      transform: 'rotate(-3deg)'
    },

    brandInner: {
      width: '70%',
      height: '70%',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(4px)'
    },

    brandBolt: {
      color: '#FFFFFF',
      fontSize: 'clamp(25px, 4vw, 34px)',
      filter: 'drop-shadow(0 3px 7px rgba(0,0,0,0.35))'
    },

    brandText: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '14px'
    },

    eyebrow: {
      color: '#1F2937',
      fontSize: '10px',
      fontWeight: 900,
      letterSpacing: '3px',
      lineHeight: 1.4
    },

    brandSubtitle: {
      marginTop: '5px',
      color: '#9CA3AF',
      fontSize: '8px',
      fontWeight: 700,
      letterSpacing: '2px'
    },

    headingArea: {
      width: '100%',
      maxWidth: '700px',
      marginBottom: 'clamp(25px, 4vw, 38px)'
    },

    title: {
      margin: 0,
      color: '#1F2937',
      fontSize: 'clamp(27px, 5vw, 44px)',
      lineHeight: 1.12,
      fontWeight: 900,
      letterSpacing: '-1px'
    },

    subtitle: {
      margin: '11px auto 0',
      maxWidth: '560px',
      color: '#6B7280',
      fontSize: 'clamp(12px, 2vw, 15px)',
      lineHeight: 1.65
    },

    grid: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 'clamp(14px, 2.5vw, 22px)',
      padding: '0 clamp(0px, 2vw, 12px)',
      boxSizing: 'border-box'
    },

    // Glass geometry (size, radius, blur, layout, hover lift) is unchanged.
    // Only fill, border, shadow and text colors were retuned for a light backdrop.
    card: {
      position: 'relative',
      width: '100%',
      minHeight: '255px',
      padding: '30px 24px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.38))',
      border: '1px solid rgba(255,255,255,0.85)',
      borderRadius: '24px',
      boxShadow:
        '0 20px 55px rgba(31,41,55,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      textAlign: 'center',
      cursor: 'pointer',
      transition:
        'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease',
      overflow: 'hidden',
      // resets the lift after hover (the old card style had no transform)
      transform: 'translateY(0) scale(1)'
    },

    cardHover: {
      position: 'relative',
      width: '100%',
      minHeight: '255px',
      padding: '30px 24px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background:
        'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(192,57,43,0.08))',
      border: '1px solid rgba(192,57,43,0.28)',
      borderRadius: '24px',
      boxShadow:
        '0 28px 70px rgba(31,41,55,0.16), 0 0 30px rgba(192,57,43,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      textAlign: 'center',
      cursor: 'pointer',
      transition:
        'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, border-color 0.3s ease',
      overflow: 'hidden',
      transform: 'translateY(-8px) scale(1.018)'
    },

    cardAccent: {
      position: 'absolute',
      top: 0,
      left: '18%',
      right: '18%',
      height: '2px',
      borderRadius: '0 0 10px 10px',
      background:
        'linear-gradient(90deg, transparent, #C0392B, #EF4444, transparent)'
    },

    cardGlow: {
      position: 'absolute',
      width: '170px',
      height: '170px',
      top: '-100px',
      right: '-80px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle, rgba(192,57,43,0.22), transparent 70%)',
      filter: 'blur(8px)',
      opacity: 0.65,
      transition:
        'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease',
      pointerEvents: 'none'
    },

    iconContainer: {
      position: 'relative',
      width: '72px',
      height: '72px',
      margin: '4px auto 18px',
      borderRadius: '21px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(192,57,43,0.10)',
      border: '1px solid rgba(192,57,43,0.18)',
      boxShadow:
        'inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 25px rgba(192,57,43,0.10)',
      color: '#C0392B',
      backdropFilter: 'blur(10px)'
    },

    icon: {
      position: 'relative',
      zIndex: 2,
      fontSize: '29px',
      filter: 'drop-shadow(0 3px 6px rgba(192,57,43,0.20))'
    },

    cardTitle: {
      margin: 0,
      color: '#1F2937',
      fontSize: '20px',
      fontWeight: 900,
      letterSpacing: '-0.3px'
    },

    cardText: {
      margin: '8px auto 0',
      width: '100%',
      maxWidth: '230px',
      color: '#6B7280',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.55,
      textAlign: 'center'
    },

    // In normal flow (not absolute): pushed to the bottom with marginTop auto,
    // and the card grows if the text needs more room, so nothing overlaps.
    cardFooter: {
      position: 'relative',
      width: '100%',
      marginTop: 'auto',
      paddingTop: '18px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },

    accessText: {
      color: '#9CA3AF',
      fontSize: '9px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '1.4px'
    },

    arrow: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      background: 'rgba(192,57,43,0.08)',
      border: '1px solid rgba(192,57,43,0.18)',
      color: '#C0392B',
      boxShadow: '0 6px 16px rgba(192,57,43,0.10)',
      backdropFilter: 'blur(8px)'
    },

    bottomBox: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '13px',
      width: '100%',
      marginTop: 'clamp(25px, 4vw, 38px)'
    },

    bottomLine: {
      width: 'clamp(25px, 8vw, 75px)',
      height: '1px',
      background:
        'linear-gradient(90deg, transparent, rgba(107,114,128,0.35))'
    },

    bottomContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '90%'
    },

    bottomDot: {
      width: '5px',
      height: '5px',
      flexShrink: 0,
      borderRadius: '50%',
      background: '#C0392B',
      boxShadow: '0 0 0 4px rgba(192,57,43,0.10)'
    },

    bottomText: {
      margin: 0,
      color: '#6B7280',
      fontSize: 'clamp(9px, 1.8vw, 12px)',
      lineHeight: 1.6
    },

    bottomHighlight: {
      color: '#9CA3AF'
    },

    footerAccent: {
      position: 'absolute',
      bottom: '12px',
      left: 0,
      right: 0,
      zIndex: 3,
      textAlign: 'center',
      color: 'rgba(75,85,99,0.55)',
      fontSize: '7px',
      fontWeight: 900,
      letterSpacing: '2px',
      lineHeight: 2,
      padding: '0 12px'
    },

    footerSeparator: {
      margin: '0 7px',
      color: 'rgba(192,57,43,0.70)'
    }
  }

  return (
    <>
      <style>{`
        /* ---------- Background (Login-style) ---------- */

        .crb-root {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f5f5f5 45%,
              #e5e7eb 100%
            );
        }

        .crb-wave {
          position: absolute;
          left: -5%;
          width: 110%;
        }

        .crb-wave svg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .crb-wave-top {
          top: -70px;
          height: 360px;
        }

        .crb-wave-middle {
          top: 20%;
          height: 360px;
          opacity: 0.65;
        }

        .crb-wave-bottom {
          bottom: -80px;
          height: 350px;
        }

        .crb-shape {
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

        .crb-shape-one {
          width: 210px;
          height: 110px;
          top: 10%;
          left: -70px;
        }

        .crb-shape-two {
          width: 180px;
          height: 180px;
          top: 16%;
          right: -75px;
          transform: rotate(18deg);
        }

        .crb-shape-three {
          width: 150px;
          height: 90px;
          bottom: 10%;
          left: 8%;
          transform: rotate(12deg);
        }

        .crb-shape-four {
          width: 230px;
          height: 120px;
          bottom: 7%;
          right: -80px;
          transform: rotate(-14deg);
        }

        .crb-orb {
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

        .crb-orb-one {
          width: 280px;
          height: 280px;
          top: -120px;
          right: 14%;
        }

        .crb-orb-two {
          width: 220px;
          height: 220px;
          bottom: -90px;
          left: 22%;
          opacity: 0.65;
        }

        @media (max-width: 900px) {
          .crb-shape-one { left: -110px; }
          .crb-shape-two { right: -110px; }
        }

        @media (max-width: 680px) {
          .crb-shape-one {
            width: 140px;
            height: 75px;
            top: 4%;
            left: -95px;
          }

          .crb-shape-two {
            width: 120px;
            height: 120px;
            top: 24%;
            right: -75px;
          }

          .crb-shape-three {
            width: 110px;
            height: 65px;
            bottom: 8%;
            left: -35px;
          }

          .crb-shape-four {
            width: 140px;
            height: 75px;
            bottom: 3%;
            right: -70px;
          }

          .crb-orb-one {
            width: 180px;
            height: 180px;
            right: -70px;
            top: -60px;
          }

          .crb-orb-two {
            width: 150px;
            height: 150px;
            left: -50px;
            bottom: -50px;
          }
        }

        /* ---------- Page ---------- */

        .choose-role-brand {
          transition:
            transform 0.35s cubic-bezier(0.16,1,0.3,1),
            box-shadow 0.35s ease;
        }

        .choose-role-brand:hover {
          transform: translateY(-3px) rotate(-2deg);
          box-shadow: 0 22px 55px rgba(192,57,43,0.38);
        }

        .premium-role-card {
          -webkit-tap-highlight-color: transparent;
          appearance: none;
          outline: none;
        }

        .premium-role-card:focus-visible {
          outline: 2px solid rgba(192,57,43,0.75);
          outline-offset: 4px;
        }

        .choose-role-card-glow {
          transition:
            opacity 0.35s ease,
            transform 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        .premium-role-card:hover .choose-role-card-glow {
          opacity: 1 !important;
          transform: scale(1.15);
        }

        @media (max-width: 760px) {
          .choose-role-grid {
            grid-template-columns: 1fr !important;
          }

          .premium-role-card {
            min-height: 230px !important;
          }
        }

        @media (max-width: 560px) {
          .premium-role-card {
            min-height: 220px !important;
            padding: 26px 20px 18px !important;
          }

          .premium-role-card p {
            max-width: 240px !important;
            font-size: 12px !important;
            line-height: 1.5 !important;
          }
        }

        @media (max-height: 760px) {
          .premium-role-card {
            min-height: 210px !important;
          }
        }

        /* ---------- "Don't have an account?" row ---------- */

        .choose-role-bottom-line {
          flex-shrink: 0;
        }

        .choose-role-bottom-text {
          text-align: center;
        }

        /* ---------- Footer brand line (desktop: same single line as before) ---------- */

        .choose-role-footer-brand,
        .choose-role-footer-links {
          display: inline;
        }

        /* ---------- Phones (portrait + short landscape) ---------- */

        @media (max-width: 680px), (max-height: 600px) {
          /* Footer leaves absolute positioning and sits below the content,
             so it can never overlap the cards or the account row. */
          .choose-role-footer {
            position: relative !important;
            bottom: auto !important;
            left: auto !important;
            right: auto !important;
            width: 100%;
            box-sizing: border-box;
            margin-top: 26px;
            padding: 0 12px !important;
            line-height: 1.9 !important;
          }

          .choose-role-footer-brand,
          .choose-role-footer-links {
            display: block;
          }

          .choose-role-footer-links {
            margin-top: 4px;
          }

          /* Hides only the separator between the brand line and the links line */
          .choose-role-footer-split {
            display: none;
          }

          /* Account row wraps and centers instead of squeezing */
          .choose-role-bottom {
            gap: 8px !important;
            margin-top: 22px !important;
          }

          .choose-role-bottom-line {
            width: 18px !important;
          }

          .choose-role-bottom-content {
            max-width: calc(100% - 52px) !important;
            gap: 7px !important;
          }

          .choose-role-bottom-text {
            font-size: 10px !important;
            line-height: 1.5 !important;
          }
        }

        /* ---------- Footer legal links + modal ---------- */

        .terms-link {
          display: inline;
          padding: 0;
          border: 0;
          background: transparent;
          color: #c0392b;
          font: inherit;
          letter-spacing: inherit;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          pointer-events: auto;
        }

        .terms-link:hover {
          color: #922b21;
        }

        .terms-link:focus-visible {
          outline: 2px solid rgba(192,57,43,0.75);
          outline-offset: 3px;
          border-radius: 3px;
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
          font-family: "Segoe UI", Arial, sans-serif;
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
          text-align: left;
          letter-spacing: normal;
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

        @media (max-width: 680px) {
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

        @media (prefers-reduced-motion: reduce) {
          .choose-role-brand,
          .premium-role-card,
          .choose-role-card-glow,
          .modal-overlay,
          .modal,
          .modal-button {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div style={styles.page}>

        {/* BACKGROUND (Login-style waves, glass shapes, red orbs) */}
        <div className="crb-root" aria-hidden="true">

          <div className="crb-wave crb-wave-top">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.10"
                d="M0,150 C180,60 330,230 510,150 C690,70 810,20 1000,110 C1190,200 1300,210 1440,100 L1440,0 L0,0 Z"
              />
            </svg>
          </div>

          <div className="crb-wave crb-wave-middle">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#6B7280"
                fillOpacity="0.09"
                d="M0,210 C180,120 330,310 520,230 C700,155 800,90 980,180 C1160,270 1280,310 1440,190 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="crb-wave crb-wave-bottom">
            <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
              <path
                fill="#C0392B"
                fillOpacity="0.07"
                d="M0,270 C190,180 340,330 530,250 C720,170 820,110 1000,220 C1170,325 1280,310 1440,230 L1440,400 L0,400 Z"
              />
            </svg>
          </div>

          <div className="crb-shape crb-shape-one" />
          <div className="crb-shape crb-shape-two" />
          <div className="crb-shape crb-shape-three" />
          <div className="crb-shape crb-shape-four" />

          <div className="crb-orb crb-orb-one" />
          <div className="crb-orb crb-orb-two" />

        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <main style={styles.content}>

          {/* BRAND */}

          <div style={styles.brandArea}>

            <div
              className="choose-role-brand"
              style={styles.brandMark}
            >
              <div style={styles.brandInner}>
                <FaBolt
                  style={styles.brandBolt}
                  aria-hidden="true"
                />
              </div>
            </div>

            <div style={styles.brandText}>
              <span style={styles.eyebrow}>
                ALAVAREN AUTO ELECTRICAL
              </span>

              <span style={styles.brandSubtitle}>
                SERVICE MANAGEMENT SYSTEM
              </span>
            </div>

          </div>

          {/* HEADING */}

          <div style={styles.headingArea}>

            <h1 style={styles.title}>
              Choose Your Account Type
            </h1>

            <p style={styles.subtitle}>
              Select how you would like to access
              {' '}
              Alavaren Auto Electrical.
            </p>

          </div>

          {/* ROLE CARDS */}

          <div className="choose-role-grid" style={styles.grid}>

            {roles.map((role) => {

              const RoleIcon = role.icon

              return (
                <button
                  key={role.name}
                  type="button"
                  className="premium-role-card"
                  style={styles.card}

                  onClick={() => navigate(role.path)}

                  onMouseEnter={(event) => {
                    Object.assign(
                      event.currentTarget.style,
                      styles.cardHover
                    )
                  }}

                  onMouseLeave={(event) => {
                    Object.assign(
                      event.currentTarget.style,
                      styles.card
                    )
                  }}

                  onTouchStart={(event) => {
                    event.currentTarget.style.transform =
                      'translateY(-3px) scale(0.99)'
                  }}

                  onTouchEnd={(event) => {
                    event.currentTarget.style.transform =
                      'translateY(0) scale(1)'
                  }}
                >

                  <div style={styles.cardAccent} />

                  <div
                    className="choose-role-card-glow"
                    style={styles.cardGlow}
                  />

                  <div style={styles.iconContainer}>
                    <RoleIcon
                      style={styles.icon}
                      aria-hidden="true"
                    />
                  </div>

                  <h2 style={styles.cardTitle}>
                    {role.name}
                  </h2>

                  <p style={styles.cardText}>
                    {role.description}
                  </p>

                  <div style={styles.cardFooter}>

                    <span
                      style={{
                        ...styles.accessText,
                        marginLeft: '6px'
                      }}
                    >
                      Continue
                    </span>

                    <span style={styles.arrow}>
                      <FaArrowRight size={12} />
                    </span>

                  </div>

                </button>
              )
            })}

          </div>

          {/* ACCOUNT INFORMATION */}

          <div className="choose-role-bottom" style={styles.bottomBox}>

            <div
              className="choose-role-bottom-line"
              style={styles.bottomLine}
            />

            <div
              className="choose-role-bottom-content"
              style={styles.bottomContent}
            >

              <span style={styles.bottomDot} />

              <p
                className="choose-role-bottom-text"
                style={styles.bottomText}
              >
                Don’t have an account?
                {' '}
                <span style={styles.bottomHighlight}>
                  Create one after selecting Customer.
                </span>
              </p>

            </div>

            <div
              className="choose-role-bottom-line"
              style={{
                ...styles.bottomLine,
                transform: 'scaleX(-1)'
              }}
            />

          </div>

        </main>

        {/* FOOTER */}

        <div
          className="choose-role-footer"
          style={styles.footerAccent}
        >
          <div className="choose-role-footer-brand">
            ALAVAREN AUTO ELECTRICAL

            <span style={styles.footerSeparator}>
              •
            </span>

            SERVICE MANAGEMENT SYSTEM
          </div>

          <span
            className="choose-role-footer-split"
            style={styles.footerSeparator}
          >
            •
          </span>

          <div className="choose-role-footer-links">
            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('terms')}
              aria-haspopup="dialog"
            >
              TERMS OF USE
            </button>

            <span style={styles.footerSeparator}>
              •
            </span>

            <button
              type="button"
              className="terms-link"
              onClick={() => setActiveLegalModal('privacy')}
              aria-haspopup="dialog"
            >
              PRIVACY &amp; COOKIES
            </button>
          </div>
        </div>

        {/* =====================================================
            TERMS OF USE / PRIVACY & COOKIES MODAL
        ===================================================== */}

        {activeLegalModal && (
          <div
            className="modal-overlay"
            onClick={closeLegalModal}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="choose-role-legal-title"
              onClick={(e) => e.stopPropagation()}
            >

              {/* MODAL HEADER */}

              <div className="modal-header">
                <div>
                  <div className="modal-badge">
                    Legal
                  </div>

                  <h2
                    id="choose-role-legal-title"
                    className="modal-title"
                  >
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

              {/* MODAL CONTENT */}

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