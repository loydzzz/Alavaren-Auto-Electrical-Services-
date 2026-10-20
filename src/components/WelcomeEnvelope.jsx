import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Settings, ShieldCheck, Mail, X } from 'lucide-react'

// =============================================================
// EVENTS + STORAGE
// =============================================================

const OPEN_EVENT = 'alavaren:open-welcome'
const SEEN_EVENT = 'alavaren:welcome-seen'

const seenKey = (userId) => `alavaren_welcome_seen_${userId}`

const readSeen = (key) => {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}


export const openWelcomeMessage = () => {
  try {
    window.dispatchEvent(new Event(OPEN_EVENT))
  } catch {
    // ignore
  }
}

export function useWelcomeSeen(userId) {
  const [seen, setSeen] = useState(true)

  useEffect(() => {
    if (!userId) return

    const key = seenKey(userId)

    setSeen(readSeen(key))

    const onSeen = () => setSeen(readSeen(key))

    window.addEventListener(SEEN_EVENT, onSeen)

    return () => window.removeEventListener(SEEN_EVENT, onSeen)
  }, [userId])

  return seen
}


const writeSeen = (key) => {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new Event(SEEN_EVENT))
  } catch {
    // ignore
  }
}

// =============================================================
// STYLES (animations)
// =============================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');

.we-hand { font-family: 'Caveat', 'Comic Sans MS', cursive; }

@keyframes we-shake {
  0%, 36%, 100% { transform: rotate(0deg); }
  4%  { transform: rotate(-7deg); }
  8%  { transform: rotate(6deg); }
  12% { transform: rotate(-5deg); }
  16% { transform: rotate(4deg); }
  20% { transform: rotate(-2.5deg); }
  24% { transform: rotate(1.5deg); }
  28% { transform: rotate(-0.8deg); }
}
.we-shake { animation: we-shake 2.4s ease-in-out infinite; transform-origin: 50% 20%; }
.we-shake-btn { display: inline-flex; animation: we-shake 2.4s ease-in-out infinite; transform-origin: 50% 0%; }

@keyframes we-ring {
  0%   { transform: scale(1);   opacity: .7; }
  100% { transform: scale(1.8); opacity: 0; }
}
.we-ring { animation: we-ring 1.6s ease-out infinite; border: 3px solid rgba(255,255,255,.75); }

@keyframes we-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}
.we-bounce { animation: we-bounce 1s ease-in-out infinite; }

@keyframes we-spin { to { transform: rotate(360deg); } }
.we-spin     { animation: we-spin 40s linear infinite; }
.we-spin-rev { animation: we-spin 55s linear infinite reverse; }

@keyframes we-fade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.we-fade { animation: we-fade .5s ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .we-shake, .we-shake-btn, .we-ring, .we-bounce, .we-spin, .we-spin-rev { animation: none; }
}
`


// =============================================================
// MAIN POPUP COMPONENT
// Render this ONCE (in DashboardLayout).
//
// Props:
//   userId         (required)  logged-in customer id
//   customerName   (optional)  "Dear Juan,"
//   createdAt      (optional)  user.created_at (detects NEW customers)
//   newWithinDays  (optional)  default 14
//   floatingButton (optional)  show a floating button too (default false)
// =============================================================

export default function WelcomeEnvelope({
  userId,
  customerName,
  createdAt,
  newWithinDays = 14,
  floatingButton = false,
}) {
  const storageKey = seenKey(userId)

  const [open, setOpen] = useState(false)
  const [opened, setOpened] = useState(false)
  const [seen, setSeen] = useState(true)

  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const particlesRef = useRef([])
  const timersRef = useRef([])
  const endAtRef = useRef(0)

  const firstName = customerName?.trim()?.split(' ')[0]

  // =========================================================
  // FIREWORKS
  // =========================================================

  const addBurst = (x, y) => {
    const colors = ['#ff3b3b', '#ffd93b', '#ffffff', '#ff9f1c', '#ff6bd6', '#4ade80']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const count = 48

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
      const speed = 2 + Math.random() * 4.2
      const life = 65 + Math.random() * 35

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2 + Math.random() * 2,
        color,
      })
    }
  }

  const tick = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'lighter'

    particlesRef.current = particlesRef.current.filter((p) => p.life > 0)

    for (const p of particlesRef.current) {
      p.vx *= 0.985
      p.vy = p.vy * 0.985 + 0.05
      p.x += p.vx
      p.y += p.vy
      p.life -= 1

      ctx.globalAlpha = Math.max(p.life / p.maxLife, 0)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1

    if (particlesRef.current.length > 0 || Date.now() < endAtRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
    }
  }

  const stopFireworks = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    particlesRef.current = []

    const canvas = canvasRef.current
    if (canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const launchFireworks = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const dpr = window.devicePixelRatio || 1
    const w = window.innerWidth
    const h = window.innerHeight

    canvas.width = w * dpr
    canvas.height = h * dpr

    endAtRef.current = Date.now() + 2000

    const spots = [
      [0.5, 0.35, 0],
      [0.2, 0.3, 250],
      [0.8, 0.28, 450],
      [0.35, 0.2, 700],
      [0.65, 0.22, 950],
      [0.5, 0.3, 1300],
      [0.15, 0.45, 1500],
      [0.85, 0.45, 1700],
    ]

    spots.forEach(([fx, fy, delay]) => {
      const t = setTimeout(() => addBurst(w * fx, h * fy), delay)
      timersRef.current.push(t)
    })

    rafRef.current = requestAnimationFrame(tick)
  }

  // =========================================================
  // OPEN / CLOSE
  // =========================================================

  const later = (fn, ms) => {
    const t = setTimeout(fn, ms)
    timersRef.current.push(t)
  }

  const openModal = (alreadySeen) => {
    setOpened(false)
    setOpen(true)

    if (alreadySeen) {
      later(() => setOpened(true), 450)
    }
  }

  const openEnvelope = () => {
    if (opened) return

    setOpened(true)

    try {
      navigator.vibrate?.(40)
    } catch {
      // ignore
    }

    later(() => launchFireworks(), 450)

    if (!seen) {
      writeSeen(storageKey)
      setSeen(true)
    }
  }

  const closeModal = () => {
    stopFireworks()
    setOpen(false)
    setOpened(false)
  }

  // =========================================================
  // AUTO-SHOW FOR NEW CUSTOMERS (first time only)
  // =========================================================

  useEffect(() => {
    if (!userId) return

    const wasSeen = readSeen(storageKey)

    const isNewCustomer =
      !createdAt ||
      Date.now() - new Date(createdAt).getTime() <=
        newWithinDays * 24 * 60 * 60 * 1000

    if (wasSeen) {
      setSeen(true)
      return
    }

    // Older accounts: no popup, no "unread" dot
    if (!isNewCustomer) {
      writeSeen(storageKey)
      setSeen(true)
      return
    }

    setSeen(false)

    const t = setTimeout(() => openModal(false), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, createdAt])

  // =========================================================
  // OPEN WHEN THE HEADER BUTTON IS CLICKED
  // =========================================================

  useEffect(() => {
    if (!userId) return

    const handler = () => openModal(readSeen(storageKey))

    window.addEventListener(OPEN_EVENT, handler)

    return () => window.removeEventListener(OPEN_EVENT, handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // =========================================================
  // ESC KEY + LOCK SCROLL
  // =========================================================

  useEffect(() => {
    if (!open) return

    const onKey = (event) => {
      if (event.key === 'Escape') closeModal()
    }

    window.addEventListener('keydown', onKey)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    return () => stopFireworks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!userId) return null

  // =========================================================
  // RENDER
  // =========================================================

  return createPortal(
    <>
      <style>{css}</style>

      {/* OPTIONAL FLOATING BUTTON (off by default) */}

      {floatingButton && !open && (
        <button
          type="button"
          onClick={() => openModal(seen)}
          aria-label="Open welcome message"
          className="
            fixed bottom-5 left-5 z-[90]
            flex items-center gap-2
            pl-3 pr-3 sm:pr-4 py-3
            rounded-full
            bg-gradient-to-br from-red-600 to-red-800
            text-white font-semibold text-sm
            shadow-lg shadow-red-900/40
            border border-white/20
            active:scale-95 transition
          "
        >
          <Mail size={20} />
          <span className="hidden sm:inline">Welcome message</span>
        </button>
      )}

      {/* MODAL */}

      {open && (
        <div
          className="
            fixed inset-0 z-[300] overflow-y-auto
            bg-gradient-to-br from-[#3a0000]/95 via-[#8a0000]/95 to-[#3a0000]/95
            backdrop-blur-sm
          "
        >
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <Settings
              className="we-spin absolute -top-12 -left-12 text-white/10"
              size={230}
            />
            <Settings
              className="we-spin-rev absolute -bottom-20 -right-14 text-white/10"
              size={300}
            />
            <Settings
              className="we-spin absolute top-1/2 -right-16 text-white/5"
              size={160}
            />
          </div>

          <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[310] h-full w-full"
          />

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="
              fixed top-4 right-4 z-[320]
              w-10 h-10 rounded-full
              bg-white/10 hover:bg-white/20
              text-white flex items-center justify-center
              transition
            "
          >
            <X size={20} />
          </button>

          <div
            className="relative flex min-h-full items-center justify-center p-4"
            onClick={(event) => {
              if (event.target === event.currentTarget && opened) closeModal()
            }}
          >
            <div className="relative z-[305] flex w-full max-w-[400px] flex-col items-center pt-24">

              <div className={`w-full ${!opened ? 'we-shake' : ''}`}>

                <div
                  className={`relative aspect-[3/2] w-full ${!opened ? 'cursor-pointer' : ''}`}
                  style={{ perspective: 1000 }}
                  onClick={openEnvelope}
                >

                  {/* ---------- ENVELOPE BODY (back wall) ---------- */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-black bg-[#b80000] shadow-[0_25px_60px_rgba(0,0,0,0.55)]" />

                  {/* ---------- LETTER ---------- */}
                  <div
                    className="
                      absolute left-[5%] right-[5%] top-[4%] h-[92%]
                      rounded-xl border-2 border-black bg-[#ff7676]
                      px-4 pt-3 text-center
                    "
                    style={{
                      zIndex: 10,
                      transform: opened ? 'translateY(-40%)' : 'translateY(0)',
                      transition: 'transform 900ms cubic-bezier(.2,.8,.2,1)',
                      transitionDelay: opened ? '350ms' : '0ms',
                    }}
                  >
                    <p className="text-left text-[15px] text-black">
                      Dear {firstName || 'Customer'},
                    </p>

                    <h2 className="we-hand mt-2 text-[26px] font-bold leading-[1.05] text-black sm:text-[28px]">
                      Welcome to, Alavaren Auto Electrical Services
                    </h2>

                    <div className="mt-2 flex items-center justify-center gap-2">
                      <ShieldCheck size={28} className="text-emerald-600" />
                      <span className="text-[13px] text-black">-made with trust</span>
                    </div>

                    <p className="mt-2 text-[12px] leading-snug text-black/80">
                      Thank you for joining us! Book your first appointment anytime
                      and follow your vehicle's service right from this dashboard.
                    </p>
                  </div>

                  {/* ---------- FLAP ---------- */}
                  <div
                    className="absolute inset-x-0 top-0 h-[55%] overflow-hidden rounded-t-2xl"
                    style={{
                      transformOrigin: 'top',
                      transform: opened ? 'rotateX(180deg)' : 'rotateX(0deg)',
                      transition: 'transform 650ms ease-in-out',
                      zIndex: opened ? 5 : 30,
                    }}
                  >
                    <svg
                      viewBox="0 0 300 110"
                      preserveAspectRatio="none"
                      className="block h-full w-full"
                    >
                      <polygon
                        points="0,0 300,0 150,110"
                        fill="#d40000"
                        stroke="#000"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  {/* ---------- FRONT POCKET ----------
                      Only the lower 70% + NO top border,
                      so no line is drawn across the letter. */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 top-[30%] overflow-hidden rounded-b-2xl border-2 border-t-0 border-black"
                    style={{ zIndex: 20 }}
                  >
                    <svg
                      viewBox="0 0 300 140"
                      preserveAspectRatio="none"
                      className="block h-full w-full"
                    >
                      <polygon
                        points="0,140 0,0 150,52 300,0 300,140"
                        fill="#c80000"
                        stroke="#000"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  {/* ---------- GEAR BUTTON ---------- */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEnvelope()
                    }}
                    aria-label="Open welcome message"
                    className="absolute left-1/2 top-[55%]"
                    style={{
                      zIndex: 40,
                      opacity: opened ? 0 : 1,
                      transform: `translate(-50%, -50%) scale(${opened ? 0.4 : 1})`,
                      transition: 'all 400ms ease',
                      pointerEvents: opened ? 'none' : 'auto',
                    }}
                  >
                    <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#8f0000] shadow-lg shadow-black/40">
                      {!opened && (
                        <span className="we-ring pointer-events-none absolute inset-0 rounded-full" />
                      )}

                      <span className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-red-500 to-red-700 ring-2 ring-black">
                        <Settings size={30} className="text-white" strokeWidth={2.4} />
                      </span>
                    </span>
                  </button>

                  {/* ---------- "TAP ME" ---------- */}
                  {!opened && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-[calc(55%+46px)] -translate-x-1/2"
                      style={{ zIndex: 40 }}
                    >
                      <span className="we-bounce block whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700 shadow-lg">
                        👆 Tap me
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ---------- BOTTOM AREA ---------- */}
              <div className="mt-8 flex h-12 items-center justify-center">
                {opened ? (
                  <button
                    type="button"
                    onClick={closeModal}
                    className="we-fade rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-red-700 shadow-lg transition hover:bg-red-50 active:scale-95"
                    style={{ animationDelay: '1.4s' }}
                  >
                    Close message
                  </button>
                ) : (
                  <p className="text-center text-sm text-white/80">
                    Tap the gear to open your welcome message
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}