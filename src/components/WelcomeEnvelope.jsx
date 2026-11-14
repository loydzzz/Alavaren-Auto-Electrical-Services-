import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Settings,
  ShieldCheck,
  Mail,
  X,
  Sparkles,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react'

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

const writeSeen = (key) => {
  try {
    localStorage.setItem(key, '1')
  } catch {
    // Storage may be unavailable.
  }

  try {
    window.dispatchEvent(new Event(SEEN_EVENT))
  } catch {
    // Ignore unsupported event dispatch.
  }
}

export const openWelcomeMessage = () => {
  try {
    window.dispatchEvent(new Event(OPEN_EVENT))
  } catch {
    // Ignore.
  }
}

export function useWelcomeSeen(userId) {
  const [seen, setSeen] = useState(true)

  useEffect(() => {
    if (!userId) {
      setSeen(true)
      return
    }

    const key = seenKey(userId)
    setSeen(readSeen(key))

    const onSeen = () => setSeen(readSeen(key))

    window.addEventListener(SEEN_EVENT, onSeen)

    return () => {
      window.removeEventListener(SEEN_EVENT, onSeen)
    }
  }, [userId])

  return seen
}

// =============================================================
// ANIMATION SETTINGS (easy to tweak)
// =============================================================

// How far the hands lean toward the envelope.
const HAND_TILT = 22

// Hands fade in, shake, pop (small recoil), then fade out.
const HAND_FADE_IN_MS = 650
const HAND_SHAKE_MS = 450
const HAND_FADE_OUT_MS = 700

// -------------------------------------------------------------
// Confetti physics (px per 60fps frame)
//
// Real party-popper confetti is light, so air drag does most of
// the work: it leaves the popper very fast, slows down quickly,
// eases up to its highest point, then floats down at a slow
// "terminal" speed (GRAVITY / drag) instead of dropping.
// -------------------------------------------------------------
const GRAVITY = 0.065
const STEP_MS = 1000 / 60

// Confetti per pop.
const BURST_COUNT = 165

// All pieces leave within this many frames: a pop, not a stream.
const BURST_SPRAY_FRAMES = 6

// Half-width of the cone leaving the popper, in radians.
// Bigger = a wider triangle. 0.34 is about 20 degrees each side.
const CONE_HALF_ANGLE = 0.62

// Air drag per frame. Lower = slows down faster and falls slower.
const DRAG_MIN = 0.968
const DRAG_MAX = 0.982

// -------------------------------------------------------------
// Falling around the envelope
//
// Once a piece reaches the top of its arc, it drifts toward its
// own landing spot near the envelope while it falls. Confetti
// from the left and right poppers ends up mixed together around
// the envelope, and lands on the ground around it.
// -------------------------------------------------------------

// How far from the envelope's center pieces land, as a share of
// the envelope's width. Most pieces stay close; some land wider.
const LAND_SPREAD = 1.02
const LAND_SPREAD_WIDE = 1.55
const WIDE_SHARE = 0.24

// How strongly a piece is drawn toward its landing spot (per
// frame). Higher = gathers around the envelope sooner.
const PULL_MIN = 0.005
const PULL_MAX = 0.014

// The settled confetti on the ground.
const PILE_BIN = 10
const PILE_MAX = 30

// Fade the confetti away after it has landed.
const FADE_OUT_CONFETTI = true
const CONFETTI_HOLD_MS = 1200
const CONFETTI_FADE_MS = 1400

// Vivid confetti: [front color, back color shown when it flips].
const CONFETTI_COLORS = [
  ['#FF2D55', '#C4113A'], // Vivid red
  ['#FF6B00', '#C94F00'], // Orange
  ['#FFC800', '#C99A00'], // Sunshine yellow
  ['#00D26A', '#00964A'], // Green
  ['#00C2FF', '#0089C7'], // Sky blue
  ['#3D5AFE', '#2338B8'], // Royal blue
  ['#B517FF', '#7D0FB5'], // Violet
  ['#FF3DA5', '#C21D78'], // Hot pink
  ['#00E5C3', '#00A98F'], // Teal
  ['#FFB300', '#C98A00'], // Gold
]

// Launch speed needed to climb exactly `height` px under air drag
// (rate k) and gravity g, before turning around at the top.
// Height reached = u/k - (g/k^2) * ln(1 + k*u/g). It only grows
// with u, so a quick bisection finds the right speed.
const launchSpeedForHeight = (height, k, g) => {
  let lo = 1
  let hi = 140

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const reached = mid / k - (g / (k * k)) * Math.log(1 + (k * mid) / g)

    if (reached < height) lo = mid
    else hi = mid
  }

  return (lo + hi) / 2
}


// =============================================================
// SOUND (Web Audio, no audio files needed)
// =============================================================

let audioCtx = null
let audioUnlocked = false
let popBuffer = null
let keepAliveOsc = null

const makeContext = () => {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null

  try {
    // Smallest buffer = lowest delay on phones.
    return new Ctx({ latencyHint: 'interactive' })
  } catch {
    return new Ctx()
  }
}

const getAudioCtx = () => {
  try {
    if (!audioCtx) {
      audioCtx = makeContext()
      if (!audioCtx) return null
    }

    // 'interrupted' is an iOS-only state after calls / lock screen.
    if (audioCtx.state !== 'running') audioCtx.resume?.()

    return audioCtx
  } catch {
    return null
  }
}

// Build the pop noise once instead of on every pop.
const getPopBuffer = (ctx) => {
  if (popBuffer && popBuffer.sampleRate === ctx.sampleRate) {
    return popBuffer
  }

  const length = Math.floor(ctx.sampleRate * 0.18)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
  }

  popBuffer = buffer
  return buffer
}

// Called on the first real tap/click/key press anywhere.
const unlockAudio = () => {
  if (audioUnlocked) return

  const ctx = getAudioCtx()
  if (!ctx) return

  try {
    // Silent buffer unlocks audio on iOS.
    const buffer = ctx.createBuffer(1, 1, 22050)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.connect(ctx.destination)
    src.start(0)

    // Keep the audio hardware awake with an inaudible tone, so the
    // first real sound doesn't wait for the speaker to wake up.
    if (!keepAliveOsc) {
      keepAliveOsc = ctx.createOscillator()
      const g = ctx.createGain()
      g.gain.value = 0.0001
      keepAliveOsc.frequency.value = 30
      keepAliveOsc.connect(g).connect(ctx.destination)
      keepAliveOsc.start()
    }

    getPopBuffer(ctx) // warm up
    audioUnlocked = true
  } catch {
    // Ignore.
  }

  if (audioUnlocked) {
    UNLOCK_EVENTS.forEach((evt) =>
      window.removeEventListener(evt, unlockAudio, true)
    )
  }
}

// iOS only counts touchend (not touchstart) as a valid gesture.
const UNLOCK_EVENTS = ['touchend', 'click', 'keydown']

if (typeof window !== 'undefined') {
  UNLOCK_EVENTS.forEach((evt) =>
    window.addEventListener(evt, unlockAudio, true)
  )

  // Wake the audio back up when returning to the tab.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && audioCtx && audioCtx.state !== 'running') {
      audioCtx.resume?.()
    }
  })
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Soft rising chime when the envelope opens.
const playOpenSound = () => {
  const ctx = getAudioCtx()
  if (!ctx) return

  const t = ctx.currentTime + 0.005

  ;[523.25, 659.25, 783.99].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = t + i * 0.09

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)

    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

// Party-popper "pop": a noise burst plus a low thump.
const playPopSound = () => {
  const ctx = getAudioCtx()
  if (!ctx) return

  const t = ctx.currentTime + 0.005

  const noise = ctx.createBufferSource()
  noise.buffer = getPopBuffer(ctx)

  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 900

  const noiseGain = ctx.createGain()
  noiseGain.gain.value = 0.45

  noise.connect(filter).connect(noiseGain).connect(ctx.destination)
  noise.start(t)

  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.12)

  oscGain.gain.setValueAtTime(0.5, t)
  oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)

  osc.connect(oscGain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.16)
}








// =============================================================
// PARTY-POPPER HAND
// Two mirrored hands sit at the bottom corners and lean inward.
// =============================================================

const starPoints = (cx, cy, spikes, outer, inner) => {
  const pts = []

  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / spikes) * i - Math.PI / 2

    pts.push(
      `${(cx + Math.cos(a) * r).toFixed(1)},${(
        cy + Math.sin(a) * r
      ).toFixed(1)}`
    )
  }

  return pts.join(' ')
}



const FLASH_POINTS = starPoints(80, 62, 9, 35, 15)

const BASE_TRANSFORM = 'translateY(10%) rotate(var(--tilt))'

const HAND_STYLES = {
  // Invisible, waiting to fade in.
  start: {
    opacity: 0,
    transform: BASE_TRANSFORM,
    transition: 'none',
  },
  // Fully visible, resting.
  in: {
    opacity: 1,
    transform: BASE_TRANSFORM,
    transition: `opacity ${HAND_FADE_IN_MS}ms ease-out, transform 220ms ease-out`,
  },
  // Wind-up shake before the pop.
  shake: {
    opacity: 1,
    transform: BASE_TRANSFORM,
    transition: 'none',
    animation: `we-hand-shake ${HAND_SHAKE_MS}ms ease-in-out`,
  },
  // Fade away.
  out: {
    opacity: 0,
    transform: BASE_TRANSFORM,
    transition: `opacity ${HAND_FADE_OUT_MS}ms ease-in`,
  },
}

// Small kick-back each time a popper fires.
const POP_STYLE = {
  opacity: 1,
  transform:
    'translateY(15%) rotate(calc(var(--tilt) - var(--dir) * 5deg))',
  transition: 'transform 100ms ease-out',
}

const SKIN = '#f6c9ad'
const SKIN_LINE = '#bd8066'

function PartyPopperHand({ spent, flashKey, side }) {
  const gradientId = `we-pop-cone-${side}`

  return (
    <svg
      viewBox="0 0 160 270"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden="true"
      style={{
        transform: side === 'left' ? 'scaleX(-1)' : 'none',
        overflow: 'visible',
        filter: 'drop-shadow(0 8px 8px rgba(127, 29, 29, .10))',
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="55%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>

        <linearGradient
          id={`we-sleeve-${side}`}
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        <linearGradient
          id={`we-skin-${side}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stopColor="#f9d5bd" />
          <stop offset="100%" stopColor={SKIN} />
        </linearGradient>
      </defs>

      {/* Fine streamers above the popper */}
      <g
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          opacity: spent ? 0 : 1,
          transition: 'opacity 180ms ease',
        }}
      >
        <path d="M64 59 C53 43 75 30 65 13" stroke="#c9a86b" />
        <path d="M81 57 C94 39 73 25 86 8" stroke="#e11d48" />
        <path d="M97 59 C107 44 92 34 102 19" stroke="#fda4af" />
      </g>

      {/* Party-popper cone */}
      <path
        d="M61 177 L99 177 L116 66 L44 66 Z"
        fill={`url(#${gradientId})`}
        stroke="#9f1239"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Decorative gold bands */}
      <path
        d="M52 112 L108 112 L105 126 L55 126 Z"
        fill="#f4dfb0"
        stroke="#c9a86b"
        strokeWidth="1"
      />
      <path
        d="M45 81 L115 81 L112 91 L48 91 Z"
        fill="#f4dfb0"
        stroke="#c9a86b"
        strokeWidth="1"
      />

      {/* Small decorative details */}
      <g fill="#fff7ed" fillOpacity=".9">
        <circle cx="70" cy="151" r="2" />
        <circle cx="89" cy="144" r="2" />
        <circle cx="80" cy="161" r="1.8" />
        <circle cx="63" cy="101" r="1.8" />
        <circle cx="98" cy="101" r="1.8" />
      </g>

      {/* Popper opening */}
      <ellipse
        cx="80"
        cy="65"
        rx="37"
        ry="10"
        fill="#fff1f2"
        stroke="#9f1239"
        strokeWidth="1.8"
      />
      <ellipse cx="80" cy="65" rx="29" ry="6.5" fill="#881337" />

      {/* Forearm */}
      <path
        d="M61 191 Q61 181 70 179 L90 179 Q99 181 99 191 L99 244 L61 244 Z"
        fill={`url(#we-skin-${side})`}
        stroke={SKIN_LINE}
        strokeWidth="1.6"
      />

      {/* Tailored sleeve */}
      <path
        d="M52 226 Q52 219 61 219 L99 219 Q108 219 108 228 L108 270 L52 270 Z"
        fill={`url(#we-sleeve-${side})`}
        stroke="#9f1239"
        strokeWidth="1.8"
      />

      {/* Sleeve cuff */}
      <path
        d="M50 225 Q50 220 56 220 L104 220 Q110 220 110 225 L110 235 L50 235 Z"
        fill="#f4dfb0"
        stroke="#c9a86b"
        strokeWidth="1.4"
      />

      <path
        d="M58 226 H102"
        stroke="#fff7ed"
        strokeOpacity=".7"
        strokeWidth="1.2"
      />

      {/* Palm wrapped around the popper */}
      <path
        d="M54 156 Q54 145 65 143 L95 143 Q106 145 106 157 L106 196 Q106 207 95 210 L65 210 Q54 207 54 196 Z"
        fill={`url(#we-skin-${side})`}
        stroke={SKIN_LINE}
        strokeWidth="1.8"
      />

      {/* Soft finger contours */}
      <path
        d="M55 166 Q80 172 105 166"
        stroke="#d99a78"
        strokeOpacity=".8"
        strokeWidth="1.3"
      />
      <path
        d="M55 179 Q80 185 105 179"
        stroke="#d99a78"
        strokeOpacity=".8"
        strokeWidth="1.3"
      />
      <path
        d="M56 192 Q80 198 104 192"
        stroke="#d99a78"
        strokeOpacity=".8"
        strokeWidth="1.3"
      />

      {/* Thumb */}
      <path
        d="M57 151 Q48 143 43 151 Q39 158 44 171 L53 184 Q59 190 65 183 Q69 178 65 171 Z"
        fill={SKIN}
        stroke={SKIN_LINE}
        strokeWidth="1.6"
      />

      {/* Gold cuff detail */}
      <path
        d="M53 232 H107"
        stroke="#fff0c9"
        strokeWidth="1"
        strokeOpacity=".8"
      />

      {/* Pop flash (re-mounts on every pop so it replays) */}
      <g
        key={flashKey}
        className={flashKey ? 'we-flash' : ''}
        opacity="0"
      >
        <polygon
          points={FLASH_POINTS}
          fill="#fff1c7"
          stroke="#c9a86b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="62" r="8" fill="#fff" />
      </g>
    </svg>
  )
}

// =============================================================
// STYLES
// =============================================================

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

.we-modal {
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.we-hand {
  font-family: 'Playfair Display', Georgia, serif;
}

.we-shake {
  animation: we-float 3.2s ease-in-out infinite;
  transform-origin: 50% 50%;
}

.we-shake-btn {
  animation: we-float 3.2s ease-in-out infinite;
}

@keyframes we-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.we-ring {
  border: 1px solid rgba(239, 213, 166, .8);
  animation: we-ring 2s ease-out infinite;
}

@keyframes we-ring {
  0% { transform: scale(1); opacity: .8; }
  100% { transform: scale(1.65); opacity: 0; }
}

.we-bounce {
  animation: we-bounce 2s ease-in-out infinite;
}

@keyframes we-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.we-spin {
  animation: we-rotate 80s linear infinite;
}

.we-spin-rev {
  animation: we-rotate 100s linear infinite reverse;
}

@keyframes we-rotate {
  to { transform: rotate(360deg); }
}

.we-fade {
  animation: we-enter .55s ease-out both;
}

@keyframes we-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.we-letter {
  background: linear-gradient(145deg, #ffffff 0%, #fffafa 100%);
  box-shadow: 0 8px 28px rgba(127, 29, 29, .12);
}

.we-envelope {
  filter: drop-shadow(0 24px 36px rgba(127, 29, 29, .16));
}

.we-gold {
  background: linear-gradient(
    135deg,
    #f6e6bd 0%,
    #c9a86b 48%,
    #f4dfaa 100%
  );
}

.we-close-button {
  transition:
    background .2s ease,
    border-color .2s ease,
    color .2s ease;
}

.we-close-button:hover {
  background: rgba(239, 68, 68, .09);
  border-color: rgba(239, 68, 68, .25);
  color: #be123c;
}

/* Both hands shake together before the pop */
@keyframes we-hand-shake {
  0%, 100% { transform: translateY(10%) rotate(var(--tilt)); }
  15% { transform: translateY(8%) rotate(calc(var(--tilt) + 7deg)); }
  30% { transform: translateY(12%) rotate(calc(var(--tilt) - 7deg)); }
  45% { transform: translateY(8%) rotate(calc(var(--tilt) + 6deg)); }
  60% { transform: translateY(12%) rotate(calc(var(--tilt) - 6deg)); }
  80% { transform: translateY(9%) rotate(calc(var(--tilt) + 3deg)); }
}

.we-flash {
  transform-box: fill-box;
  transform-origin: center;
  animation: we-flash 420ms ease-out both;
}

@keyframes we-flash {
  0% { opacity: 1; transform: scale(.3) rotate(0deg); }
  60% { opacity: .9; }
  100% { opacity: 0; transform: scale(1.7) rotate(25deg); }
}

@media (prefers-reduced-motion: reduce) {
  .we-shake,
  .we-shake-btn,
  .we-ring,
  .we-bounce,
  .we-spin,
  .we-spin-rev,
  .we-fade {
    animation: none !important;
  }
}
`

// =============================================================
// MAIN WELCOME COMPONENT
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
  const [handPhase, setHandPhase] = useState('off')
  const [handSpent, setHandSpent] = useState(false)
  const [flash, setFlash] = useState({ left: 0, right: 0 })
  const [recoil, setRecoil] = useState({ left: false, right: false })
  const [seen, setSeen] = useState(true)

  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const particlesRef = useRef([])
  const timersRef = useRef([])
  const endAtRef = useRef(0)
  const dprRef = useRef(1)
  const sizeRef = useRef({ w: 0, h: 0 })
  const pileRef = useRef(new Float32Array(0))
  const frameRef = useRef(0)
  const lastTimeRef = useRef(0)
  const accRef = useRef(0)
  const movingRef = useRef(false)

  // Track the envelope and each popper's opening.
  const envelopeRef = useRef(null)
  const leftMouthRef = useRef(null)
  const rightMouthRef = useRef(null)

  const firstName = customerName?.trim()?.split(/\s+/)[0]

  // =========================================================
  // TIMER HELPERS
  // =========================================================

  const later = (fn, ms) => {
    const timer = setTimeout(fn, ms)
    timersRef.current.push(timer)
    return timer
  }

  // =========================================================
  // CONFETTI BURST (one pop from one hand)
  //
  // 1. Each popper sends a wider fan of confetti into the space
  //    above, beside, and around the envelope.
  // 2. The two bursts overlap at different heights to create a
  //    broad celebratory cloud instead of a narrow arc.
  // 3. Confetti drifts slowly and lands across a wider area around
  //    the envelope, while the lower pull keeps it from clumping
  //    into one tight pile.
  //
  // `reach` scales how far the arc goes (1 = just above the
  // envelope, smaller = a lower, smaller arc).
  // =========================================================

  const addBurst = (side, reach) => {
    const { w, h } = sizeRef.current
    const isLeft = side === 'leftHand'
    const dir = isLeft ? 1 : -1

    const mouth = (isLeft ? leftMouthRef : rightMouthRef).current
      ?.getBoundingClientRect()
    const envelope = envelopeRef.current?.getBoundingClientRect()

    const originX = mouth
      ? mouth.left + mouth.width / 2
      : isLeft
        ? 70
        : w - 70

    const originY = mouth
      ? mouth.top + mouth.height / 2
      : h - 150

    const centerX = envelope
      ? envelope.left + envelope.width / 2
      : w / 2

    const envelopeWidth = envelope
      ? envelope.width
      : Math.min(470, w * 0.8)

    const envelopeTop = envelope ? envelope.top : h * 0.35

    // The middle of the cone points at a spot above the envelope.
    const topY = Math.max(40, envelopeTop - h * 0.1)
    const axis = Math.max(
      Math.atan2(Math.abs(centerX - originX), originY - topY),
      0.2
    )
    const baseReach = Math.hypot(centerX - originX, originY - topY)

    const sizeK = Math.min(Math.max(Math.min(w, h) / 800, 0.8), 1.15)

    for (let i = 0; i < BURST_COUNT; i++) {
      // Angle from straight up, leaning toward the envelope.
      const angle = Math.max(
        axis + (Math.random() * 2 - 1) * CONE_HALF_ANGLE,
        0.05
      )

      // Where this piece runs out of speed. Most pieces stop on a
      // thin band (the arc); a few leaders go slightly past it.
      const band = Math.random() < 0.06
        ? 1.06 + Math.random() * 0.05
        : 0.8 + Math.random() * 0.2

      const distance = baseReach * reach * band

      const apexX = Math.min(
        Math.max(originX + dir * Math.sin(angle) * distance, 8),
        w - 8
      )
      const apexY = originY - Math.cos(angle) * distance

      const rise = Math.max(originY - apexY, 100)
      const run = apexX - originX

      // Air drag for this piece. Lighter pieces slow down faster.
      const drag = DRAG_MIN + Math.random() * (DRAG_MAX - DRAG_MIN)
      const k = -Math.log(drag)

      // Speed that carries it exactly to its spot, then it turns.
      const up = launchSpeedForHeight(rise, k, GRAVITY)
      const sideways = run * k * ((up + GRAVITY / k) / up)

      // Where this piece will end up on the ground: around the
      // envelope, from either popper. Adding two random numbers
      // makes landings bunch up near the middle, and a few pieces
      // land wider so the pile is not a neat block.
      const spread =
        Math.random() < WIDE_SHARE ? LAND_SPREAD_WIDE : LAND_SPREAD

      const landX = Math.min(
        Math.max(
          centerX +
            (Math.random() + Math.random() - 1) *
              envelopeWidth *
              spread,
          12
        ),
        w - 12
      )

      const roll = Math.random()

      const shape =
        roll < 0.4
          ? 'strip'
          : roll < 0.7
            ? 'rect'
            : roll < 0.88
              ? 'circle'
              : 'triangle'

      let pw
      let ph

      if (shape === 'strip') {
        pw = 14 + Math.random() * 8
        ph = 3 + Math.random() * 1.5
      } else if (shape === 'rect') {
        pw = 8 + Math.random() * 4
        ph = 6 + Math.random() * 2.5
      } else if (shape === 'circle') {
        pw = 5 + Math.random() * 3
        ph = pw
      } else {
        pw = 8 + Math.random() * 3
        ph = pw
      }

      const [color, color2] =
        CONFETTI_COLORS[
          Math.floor(Math.random() * CONFETTI_COLORS.length)
        ]

      particlesRef.current.push({
        // Starts inside the popper opening.
        x: originX + (Math.random() - 0.5) * 6,
        y: originY + (Math.random() - 0.5) * 4,
        vx: sideways,
        vy: -up,
        drag,

        // Landing spot and how strongly it is drawn there.
        landX,
        pull: PULL_MIN + Math.random() * (PULL_MAX - PULL_MIN),
        seed: Math.random() * Math.PI * 2,

        // Frames to wait before leaving the popper.
        wait: Math.floor(Math.random() * BURST_SPRAY_FRAMES),

        w: pw * sizeK,
        h: ph * sizeK,
        shape,
        color,
        color2,

        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI * 2,
        tiltSpeed: 0.1 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.04 + Math.random() * 0.05,
        sway: 0.3 + Math.random() * 0.6,
        drift: 0.5 + Math.random() * 0.7,

        settled: false,
        flat: 1,
      })
    }
  }

  // =========================================================
  // CONFETTI SIMULATION (fixed 60fps steps, same on any screen)
  // =========================================================

  const stepParticles = () => {
    const { w, h } = sizeRef.current
    const pile = pileRef.current

    frameRef.current += 1

    const wind = Math.sin(frameRef.current * 0.02) * 0.02

    let moving = false

    for (const p of particlesRef.current) {
      if (p.settled) continue

      // Still waiting inside the popper.
      if (p.wait > 0) {
        p.wait -= 1
        moving = true
        continue
      }

      // Air drag slows the burst down hard. Gravity then pulls the
      // piece down until drag balances it: a slow, steady float.
      p.vx = p.vx * p.drag + wind * p.drift
      p.vy = p.vy * p.drag + GRAVITY

      // 0 while the piece is still climbing, 1 once it has
      // slowed at the top and starts to fall. Everything that
      // scatters the confetti is scaled by this, so the cone
      // stays clean while it widens.
      const falling = Math.min(Math.max((p.vy + 1) / 2.5, 0), 1)

      p.phase += p.phaseSpeed

      p.x +=
        p.vx +
        // Side-to-side flutter.
        Math.sin(p.phase) * p.sway * falling +
        // Slow drift toward its landing spot around the envelope.
        (p.landX - p.x) * p.pull * falling +
        // Lazy wandering, so the confetti hangs and mingles in
        // the air instead of dropping in straight lines.
        Math.sin(p.phase * 0.43 + p.seed) * 0.35 * falling

      p.y += p.vy + Math.sin(p.phase * 0.8 + p.seed) * 0.3 * falling

      p.rot += p.vrot
      p.tilt += p.tiltSpeed

      if (p.x < 2) {
        p.x = 2
        p.vx = 0
      } else if (p.x > w - 2) {
        p.x = w - 2
        p.vx = 0
      }

      if (p.vy > 0 && pile.length > 0) {
        const bin = Math.min(
          Math.max(Math.floor(p.x / PILE_BIN), 0),
          pile.length - 1
        )

        const ground = h - pile[bin]

        if (p.y >= ground - 2) {
          p.settled = true
          p.y = ground - 1 - Math.random() * 2
          p.rot = Math.random() * Math.PI * 2
          p.flat = 0.45 + Math.random() * 0.55

          // A subtle pile, not a thick blanket.
          pile[bin] = Math.min(pile[bin] + 0.6, PILE_MAX)

          if (bin > 0) {
            pile[bin - 1] = Math.min(pile[bin - 1] + 0.2, PILE_MAX)
          }

          if (bin < pile.length - 1) {
            pile[bin + 1] = Math.min(pile[bin + 1] + 0.2, PILE_MAX)
          }
        }
      }

      if (!p.settled) moving = true
    }

    return moving
  }

  const drawParticles = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!canvas || !ctx) return

    const dpr = dprRef.current

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1

    for (const p of particlesRef.current) {
      // Not launched yet.
      if (p.wait > 0) continue

      const cos = Math.cos(p.rot)
      const sin = Math.sin(p.rot)
      const flip = Math.cos(p.tilt)

      // Pieces seem to spin in 3D by squashing and swapping colors.
      const sx = p.settled
        ? p.flat
        : Math.max(Math.abs(flip), 0.18)

      ctx.setTransform(
        dpr * cos,
        dpr * sin,
        -dpr * sin,
        dpr * cos,
        dpr * p.x,
        dpr * p.y
      )

      ctx.fillStyle = p.settled || flip >= 0 ? p.color : p.color2

      if (p.shape === 'circle') {
        ctx.beginPath()
        ctx.ellipse(0, 0, (p.w / 2) * sx, p.h / 2, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.shape === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(0, -p.h / 2)
        ctx.lineTo((p.w / 2) * sx, p.h / 2)
        ctx.lineTo((-p.w / 2) * sx, p.h / 2)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillRect((-p.w / 2) * sx, -p.h / 2, p.w * sx, p.h)
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  const finishConfetti = () => {
    if (!FADE_OUT_CONFETTI) return

    later(() => {
      const canvas = canvasRef.current

      if (canvas) {
        canvas.style.transition = `opacity ${CONFETTI_FADE_MS}ms ease-out`
        canvas.style.opacity = '0'
      }
    }, CONFETTI_HOLD_MS)

    later(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')

      particlesRef.current = []
      pileRef.current = new Float32Array(0)

      if (canvas && ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }, CONFETTI_HOLD_MS + CONFETTI_FADE_MS + 100)
  }

  const tick = (now) => {
    if (!canvasRef.current) {
      rafRef.current = null
      return
    }

    const last = lastTimeRef.current || now
    lastTimeRef.current = now

    accRef.current += Math.min(now - last, 100)

    while (accRef.current >= STEP_MS) {
      movingRef.current = stepParticles()
      accRef.current -= STEP_MS
    }

    drawParticles()

    if (movingRef.current || Date.now() < endAtRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      rafRef.current = null
      finishConfetti()
    }
  }

  const stopConfetti = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    rafRef.current = null

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    particlesRef.current = []
    pileRef.current = new Float32Array(0)
    endAtRef.current = 0

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (canvas && ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const launchConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    // The shake is over: hands rest until each popper fires.
    setHandPhase('in')

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.transition = 'none'
    canvas.style.opacity = '1'

    dprRef.current = dpr
    sizeRef.current = { w, h }
    pileRef.current = new Float32Array(Math.ceil(w / PILE_BIN) + 1)
    particlesRef.current = []
    frameRef.current = 0
    lastTimeRef.current = 0
    accRef.current = 0
    movingRef.current = true

    // Both poppers fire together, like a real celebration. The
    // second pop is a little lower, so the two arcs layer.
    // [hand, reach (1 = full height), delay in ms]
    const plan = [
      ['leftHand', 1, 0],
      ['rightHand', 1, 90],
      ['leftHand', 0.82, 950],
      ['rightHand', 0.82, 1040],
    ]

    plan.forEach(([side, reach, delay]) => {
  later(() => {
    if (!canvasRef.current) return

    playPopSound() // sound first, before the heavy work
    addBurst(side, reach)

    const key = side === 'leftHand' ? 'left' : 'right'
    // ...rest stays the same

        setHandSpent(true)

        setFlash((current) => ({
          ...current,
          [key]: current[key] + 1,
        }))

        // Quick kick-back on the hand that fired.
        setRecoil((current) => ({ ...current, [key]: true }))

        later(() => {
          setRecoil((current) => ({ ...current, [key]: false }))
        }, 300)
      }, delay)
    })

    const lastDelay = plan[plan.length - 1][2]

    // Hands fade out shortly after the last pop.
    later(() => setHandPhase('out'), lastDelay + 800)
    later(
      () => setHandPhase('off'),
      lastDelay + 800 + HAND_FADE_OUT_MS + 50
    )

    endAtRef.current = Date.now() + lastDelay + 400
    rafRef.current = requestAnimationFrame(tick)
  }

  // =========================================================
  // OPEN / CLOSE
  // =========================================================

  const startCelebration = () => {
    if (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    setHandSpent(false)
    setFlash({ left: 0, right: 0 })
    setRecoil({ left: false, right: false })
    setHandPhase('start')

    // Fade in, then shake, then the confetti blasts.
    later(() => setHandPhase('in'), 60)
    later(() => setHandPhase('shake'), HAND_FADE_IN_MS + 100)
    later(
      () => launchConfetti(),
      HAND_FADE_IN_MS + 100 + HAND_SHAKE_MS
    )
  }

  const openModal = (alreadySeen) => {
    stopConfetti()
    setHandPhase('off')
    setOpened(false)
    setOpen(true)

    if (alreadySeen) {
      later(() => setOpened(true), 450)
    }
  }

  const openEnvelope = () => {
  if (opened) return

  if (!prefersReducedMotion()) playOpenSound() // first
  setOpened(true)
  // ...

    try {
      navigator.vibrate?.(40)
    } catch {
      // Vibration is optional.
    }

    startCelebration()

    if (!seen) {
      writeSeen(storageKey)
      setSeen(true)
    }
  }

  const closeModal = () => {
    stopConfetti()
    setHandPhase('off')
    setOpen(false)
    setOpened(false)
  }

  // =========================================================
  // AUTO-SHOW FOR NEW CUSTOMERS
  // =========================================================

  useEffect(() => {
    if (!userId) return

    const wasSeen = readSeen(storageKey)

    const createdTimestamp = createdAt
      ? new Date(createdAt).getTime()
      : null

    const isNewCustomer =
      !createdAt ||
      (Number.isFinite(createdTimestamp) &&
        Date.now() - createdTimestamp >= 0 &&
        Date.now() - createdTimestamp <=
          newWithinDays * 24 * 60 * 60 * 1000)

    if (wasSeen) {
      setSeen(true)
      return
    }

    if (!isNewCustomer) {
      writeSeen(storageKey)
      setSeen(true)
      return
    }

    setSeen(false)

    const timer = setTimeout(() => {
  openModal(false)
  if (audioUnlocked && !prefersReducedMotion()) playOpenSound()
}, 700)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, createdAt, newWithinDays])

  // =========================================================
  // HEADER EVENT
  // =========================================================

  useEffect(() => {
    if (!userId) return

    const handler = () => {
      openModal(readSeen(storageKey))
    }

    window.addEventListener(OPEN_EVENT, handler)

    return () => {
      window.removeEventListener(OPEN_EVENT, handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // =========================================================
  // ESCAPE KEY + BODY SCROLL LOCK
  // =========================================================

  useEffect(() => {
    if (!open) return

    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    const previousOverflow = document.body.style.overflow

    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }

      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      particlesRef.current = []
    }
  }, [])

  if (!userId) return null

  // =========================================================
  // RENDER
  // =========================================================

  const handStyleFor = (side) =>
    recoil[side] && handPhase === 'in'
      ? POP_STYLE
      : HAND_STYLES[handPhase]

  const handBase = {
    width: 'clamp(76px, 12vw, 126px)',
    aspectRatio: '160 / 270',
    transformOrigin: '50% 100%',
    willChange: 'transform, opacity',
  }

  return createPortal(
    <>
      <style>{css}</style>

      {/* OPTIONAL FLOATING BUTTON */}

      {floatingButton && !open && (
        <button
          type="button"
          onClick={() => openModal(seen)}
          aria-label="Open welcome message"
          className="fixed bottom-5 left-5 z-[90] flex items-center gap-3 rounded-full border border-red-100 bg-white py-2.5 pl-3 pr-4 text-sm font-semibold text-slate-800 shadow-xl shadow-red-900/10 transition hover:bg-red-50 active:scale-95"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-gradient-to-br from-red-500 to-rose-700 text-white">
            <Mail size={17} />
          </span>

          <span className="hidden sm:inline">Welcome message</span>
        </button>
      )}

      {/* MAIN MODAL */}

      {open && (
        <div className="we-modal fixed inset-0 z-[300] overflow-y-auto bg-gradient-to-br from-red-50 via-white to-rose-100 text-slate-800">
          {/* BACKGROUND DECORATION */}

          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_34%,rgba(254,226,226,0.75),transparent_65%)]" />

            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border border-red-200/40" />

            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full border border-rose-200/35" />

            <div className="absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full border border-red-200/40" />

            <div className="absolute -bottom-36 -right-20 h-[27rem] w-[27rem] rounded-full border border-rose-200/35" />

            <Settings
              className="we-spin absolute -right-16 top-16 text-red-300/20"
              size={250}
              strokeWidth={0.7}
            />

            <Settings
              className="we-spin-rev absolute -bottom-16 -left-16 text-rose-300/20"
              size={300}
              strokeWidth={0.7}
            />

            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-rose-100/50 to-transparent" />
          </div>

          {/* PARTY-POPPER HANDS */}

          {handPhase !== 'off' && (
            <>
              {/* LEFT HAND */}

              <div
                className="pointer-events-none fixed bottom-0 left-0 z-[308]"
                style={{
                  '--tilt': `${HAND_TILT}deg`,
                  '--dir': 1,
                  ...handBase,
                  ...handStyleFor('left'),
                }}
              >
                <PartyPopperHand
                  side="left"
                  spent={handSpent}
                  flashKey={flash.left}
                />

                <span
                  ref={leftMouthRef}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '24%',
                    width: 1,
                    height: 1,
                  }}
                />
              </div>

              {/* RIGHT HAND */}

              <div
                className="pointer-events-none fixed bottom-0 right-0 z-[308]"
                style={{
                  '--tilt': `${-HAND_TILT}deg`,
                  '--dir': -1,
                  ...handBase,
                  ...handStyleFor('right'),
                }}
              >
                <PartyPopperHand
                  side="right"
                  spent={handSpent}
                  flashKey={flash.right}
                />

                <span
                  ref={rightMouthRef}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '24%',
                    width: 1,
                    height: 1,
                  }}
                />
              </div>
            </>
          )}

          {/* CONFETTI CANVAS */}

          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[310] h-full w-full"
          />

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeModal}
            aria-label="Close welcome message"
            className="we-close-button fixed right-4 top-4 z-[320] flex h-11 w-11 items-center justify-center rounded-full border border-red-100 bg-white/80 text-slate-500 shadow-sm backdrop-blur-xl sm:right-7 sm:top-7"
          >
            <X size={20} />
          </button>

          {/* CENTER CONTENT */}

          <div
            className="relative flex min-h-[100svh] items-center justify-center px-5 py-12 sm:px-8 sm:py-16"
            onClick={(event) => {
              if (event.target === event.currentTarget && opened) {
                closeModal()
              }
            }}
          >
            <div className="relative z-[305] flex w-full max-w-[470px] flex-col items-center">
              {/* BRAND INTRO */}

              <div className="we-fade mb-8 flex w-full flex-col items-center text-center sm:mb-10">
                <div className="mx-auto mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#c9a86b]/40 bg-white shadow-lg shadow-red-900/5">
                  <Settings
                    size={26}
                    strokeWidth={1.5}
                    className="block text-[#b89555]"
                  />
                </div>

                <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-rose-700 sm:text-[10px]">
                  ALAVAREN AUTO ELECTRICAL
                </p>

                <div
                  style={{
                    opacity: opened ? 0 : 1,
                    transition: 'opacity 350ms ease',
                  }}
                >
                  <h1 className="we-hand mt-3 text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                    A warm welcome
                  </h1>

                  <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                    Quality service begins with trust.
                  </p>
                </div>
              </div>

              {/* ENVELOPE */}

              <div
                ref={envelopeRef}
                className={`we-envelope w-full ${
                  !opened ? 'we-shake cursor-pointer' : ''
                }`}
              >
                <div
                  className="relative aspect-[3/2] w-full"
                  style={{ perspective: 1100 }}
                  onClick={openEnvelope}
                >
                  {/* ENVELOPE BACK */}

                  <div className="absolute inset-0 rounded-2xl border border-red-200 bg-gradient-to-b from-[#9f1239] to-[#7f0f2e]" />

                  {/* LETTER */}

                  <div
                    className="we-letter absolute left-[4%] right-[4%] top-[4%] h-[92%] overflow-hidden rounded-xl border border-red-100"
                    style={{
                      zIndex: 10,
                      transform: opened
                        ? 'translateY(-43%)'
                        : 'translateY(0)',
                      transition:
                        'transform 900ms cubic-bezier(.2,.8,.2,1)',
                      transitionDelay: opened ? '350ms' : '0ms',
                    }}
                  >
                    <div className="flex h-full flex-col px-4 pt-3 text-slate-800 sm:px-6 sm:pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-[0.19em] text-rose-700 sm:text-[9px]">
                          A Personal Message
                        </span>

                        <ShieldCheck
                          size={19}
                          className="shrink-0 text-rose-600"
                        />
                      </div>

                      <div className="my-2 h-px bg-red-100" />

                      <p className="text-[11px] text-slate-500 sm:text-sm">
                        Dear {firstName || 'Customer'},
                      </p>

                      <h2 className="we-hand mt-1.5 text-center text-xl font-semibold leading-tight text-rose-800 sm:text-2xl">
                        Welcome to Alavaren.
                      </h2>

                      <p className="mx-auto mt-1.5 max-w-[19rem] text-center text-[9.5px] leading-relaxed text-slate-600 sm:text-[11px]">
                        Thank you for choosing Alavaren Auto Electrical Services. We are delighted to have you with us.
                      </p>

                      <div className="mt-2.5 flex items-center justify-center gap-2">
                        <div className="h-px w-5 bg-red-200 sm:w-8" />

                        <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.14em] text-rose-700 sm:text-[9px] sm:tracking-[0.16em]">
                          Service · Trust · Care
                        </span>

                        <div className="h-px w-5 bg-red-200 sm:w-8" />
                      </div>
                    </div>
                  </div>

                  {/* ENVELOPE FLAP */}

                  <div
                    className="absolute inset-x-0 top-0 h-[55%] overflow-hidden rounded-t-2xl"
                    style={{
                      transformOrigin: 'top',
                      transform: opened
                        ? 'rotateX(180deg)'
                        : 'rotateX(0deg)',
                      transition:
                        'transform 650ms ease-in-out, z-index 0s linear 325ms',
                      zIndex: opened ? 5 : 30,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    <svg
                      viewBox="0 0 300 110"
                      preserveAspectRatio="none"
                      className="block h-full w-full"
                    >
                      <defs>
                        <linearGradient
                          id="we-flap-grad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f87171" />
                          <stop offset="100%" stopColor="#be123c" />
                        </linearGradient>
                      </defs>

                      <polygon
                        points="0,0 300,0 150,110"
                        fill="url(#we-flap-grad)"
                        stroke="#9f1239"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  {/* FRONT ENVELOPE POCKET */}

                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl border border-t-0 border-red-200"
                    style={{ zIndex: 20 }}
                  >
                    <svg
                      viewBox="0 0 300 200"
                      preserveAspectRatio="none"
                      className="block h-full w-full"
                    >
                      <defs>
                        <linearGradient
                          id="we-pocket-grad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f87171" />
                          <stop offset="100%" stopColor="#be123c" />
                        </linearGradient>
                      </defs>

                      <polygon
                        points="0,0 150,110 300,0 300,200 0,200"
                        fill="url(#we-pocket-grad)"
                      />

                      <path
                        d="M 0 200 L 150 110 L 300 200"
                        fill="none"
                        stroke="#fecaca"
                        strokeOpacity=".75"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />

                      <path
                        d="M 0 0 L 150 110 L 300 0"
                        fill="none"
                        stroke="#be123c"
                        strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>

                  {/* CIRCULAR GOLD SEAL */}

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEnvelope()
                    }}
                    aria-label="Open welcome envelope"
                    className="absolute left-1/2 top-[55%] flex items-center justify-center rounded-full transition duration-500"
                    style={{
                      zIndex: 40,
                      opacity: opened ? 0 : 1,
                      transform: `translate(-50%, -50%) scale(${
                        opened ? 0.5 : 1
                      })`,
                      pointerEvents: opened ? 'none' : 'auto',
                    }}
                  >
                    <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#f1dba9]/90 bg-rose-800 shadow-[0_8px_25px_rgba(127,29,29,.2)]">
                      {!opened && (
                        <span className="we-ring pointer-events-none absolute inset-0 rounded-full" />
                      )}

                      <span className="we-gold flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#fff2cf]/90 shadow-inner">
                        <Settings
                          size={28}
                          className="text-[#62202a]"
                          strokeWidth={1.8}
                        />
                      </span>
                    </span>
                  </button>

                  {/* TAP INSTRUCTION */}

                  {!opened && (
                    <div
                      className="pointer-events-none absolute left-1/2 top-[calc(55%+48px)] -translate-x-1/2"
                      style={{ zIndex: 40 }}
                    >
                      <span className="we-bounce flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-rose-700 shadow-lg backdrop-blur-sm">
                        <Sparkles size={11} />
                        OPEN YOUR MESSAGE
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER / ACTION */}

              <div className="mt-8 flex min-h-[76px] w-full flex-col items-center justify-center sm:mt-9">
                {opened ? (
                  <div className="we-fade flex w-full flex-col items-center">
                    <div className="mb-4 flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2
                        size={15}
                        className="text-[#b89555]"
                      />

                      <span>Thank you for being part of Alavaren.</span>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex w-full max-w-[260px] items-center justify-center gap-2 rounded-xl border border-[#e3c78e]/60 bg-gradient-to-r from-[#c6a46b] to-[#e4ce9c] px-6 py-3 text-sm font-bold text-[#35191b] shadow-lg shadow-red-900/10 transition hover:brightness-105 active:scale-[0.98]"
                    >
                      Continue to Dashboard
                      <ArrowDown size={16} className="-rotate-90" />
                    </button>
                  </div>
                ) : (
                  <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
                    A little message, prepared just for you.
                  </p>
                )}
              </div>

              {/* BRAND FOOTNOTE */}

              <div className="mt-7 flex items-center gap-3 text-[8px] font-medium uppercase tracking-[0.2em] text-slate-400">
                <span className="h-px w-7 bg-red-200" />

                ALAVAREN AUTO ELECTRICAL SERVICES

                <span className="h-px w-7 bg-red-200" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}