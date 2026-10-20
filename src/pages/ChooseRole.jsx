import { useNavigate } from 'react-router-dom'
import {
  FaUser,
  FaTools,
  FaUserCog,
  FaBolt,
  FaArrowRight
} from 'react-icons/fa'

export default function ChooseRole() {
  const navigate = useNavigate()

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

        @media (prefers-reduced-motion: reduce) {
          .choose-role-brand,
          .premium-role-card,
          .choose-role-card-glow {
            transition: none !important;
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

          <div style={styles.bottomBox}>

            <div style={styles.bottomLine} />

            <div style={styles.bottomContent}>

              <span style={styles.bottomDot} />

              <p style={styles.bottomText}>
                Don’t have an account?
                {' '}
                <span style={styles.bottomHighlight}>
                  Create one after selecting Customer.
                </span>
              </p>

            </div>

            <div
              style={{
                ...styles.bottomLine,
                transform: 'scaleX(-1)'
              }}
            />

          </div>

        </main>

        {/* FOOTER */}

        <div style={styles.footerAccent}>
          ALAVAREN AUTO ELECTRICAL

          <span style={styles.footerSeparator}>
            •
          </span>

          SERVICE MANAGEMENT SYSTEM
        </div>

      </div>
    </>
  )
}