import React, { useEffect, useRef, useState } from 'react'

/* =========================================================
   SPECIALIZED CARD
========================================================= */

function SpecializedCard({ service, number }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black">

      <img
        src={service.image}
        alt={service.title}
        draggable="false"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">

        <div className="flex items-center justify-between">

          <div
            style={{
              width: 39,
              height: 39,
              borderRadius: 11,
              background: '#fcedeb',
              color: '#C0392B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
            }}
          >
            {service.icon}
          </div>

          <div
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: '1.5px',
            }}
          >
            {String(number).padStart(2, '0')}
          </div>

        </div>

        <div>
          <h3 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 800 }}>
            {service.title}
          </h3>

          <p
            style={{
              margin: '9px 0 0',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 13.5,
              lineHeight: 1.7,
            }}
          >
            {service.description}
          </p>
        </div>

      </div>
    </div>
  )
}


/* =========================================================
   CAROUSEL
   - scrolls by itself, endlessly
   - point at a card (or tap it on a phone): the scrolling stops,
     that card slides to the CENTER of the screen
   - the rest of the screen goes dark (plain black tint, no blur)
   - there is only ever ONE copy of each card - nothing is cloned
   - move the mouse away to the left or right side, tap the dark
     area, scroll the page, or press Esc to continue scrolling
========================================================= */

export default function SpecializedCarousel({
  services,
  visible = true,
  speed = 45,          // pixels per second
  focusScale = 1,      // 1 = no enlarging (try 1.3 to make the focused card bigger)
  dimColor = 'rgba(0,0,0,0.62)',
  leaveDelay = 400,    // ms before scrolling continues if the mouse is off the card
}) {

  const n = services.length

  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const xRef = useRef(0)
  const loopRef = useRef(0)
  const targetRef = useRef(null)      // where the track glides to (center)
  const pausedRef = useRef(false)
  const focusKeyRef = useRef(null)
  const openedAtRef = useRef(0)
  const enteredRef = useRef(false)    // pointer has been on the focused card
  const outsideSinceRef = useRef(null)
  const lastScrollRef = useRef(0)

  const [focusKey, setFocusKey] = useState(null)
  const [scale, setScale] = useState(1)

  // three copies so the loop never shows a gap
  const items = [...services, ...services, ...services]


  // ---------- measure one full loop ----------

  useEffect(() => {
    const measure = () => {
      const cards = trackRef.current?.children
      if (!cards || cards.length <= n) return
      loopRef.current = cards[n].offsetLeft - cards[0].offsetLeft
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [n])


  // ---------- auto scroll + glide to center ----------

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    let raf
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      const loop = loopRef.current
      let moved = false

      if (targetRef.current !== null) {
        // glide the focused card to the center
        const diff = targetRef.current - xRef.current

        if (Math.abs(diff) < 0.5) {
          xRef.current = targetRef.current
          targetRef.current = null
        } else {
          xRef.current += diff * (1 - Math.pow(0.0005, dt))
        }

        moved = true
      } else if (!pausedRef.current && !reduceMotion && loop) {
        xRef.current -= speed * dt
        moved = true
      }

      // keep the loop endless (only while nothing is focused)
      if (!pausedRef.current && loop) {
        while (xRef.current <= -loop) xRef.current += loop
        while (xRef.current > 0) xRef.current -= loop
      }

      if (moved && trackRef.current) {
        trackRef.current.style.transform =
          `translate3d(${xRef.current}px,0,0)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed])


  // ---------- remember when the page scrolls ----------

  useEffect(() => {
    const onScroll = () => {
      lastScrollRef.current = Date.now()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])


  // ---------- focus / release ----------

  const openCard = (key) => {
    if (focusKeyRef.current !== null) return

    // the page is scrolling under the cursor - not a real hover/tap
    if (Date.now() - lastScrollRef.current < 250) return

    const el = cardRefs.current[key]
    if (!el) return

    const r = el.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth

    // slide the track so this card ends up in the middle of the screen
    const delta = viewportWidth / 2 - (r.left + r.width / 2)
    targetRef.current = xRef.current + delta

    // never wider than the screen
    setScale(Math.min(focusScale, (viewportWidth - 32) / r.width))

    pausedRef.current = true
    focusKeyRef.current = key
    openedAtRef.current = Date.now()
    enteredRef.current = false
    outsideSinceRef.current = null

    setFocusKey(key)
  }

  const releaseCard = () => {
    if (focusKeyRef.current === null) return

    focusKeyRef.current = null
    targetRef.current = null
    pausedRef.current = false

    setFocusKey(null)
  }


  // while a card is focused: watch the mouse, Esc and page scroll

  useEffect(() => {
    if (focusKey === null) return

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return

      // wait until the card has finished sliding to the center
      if (targetRef.current !== null) return
      if (Date.now() - openedAtRef.current < 400) return

      const el = cardRefs.current[focusKeyRef.current]
      if (!el) return

      const r = el.getBoundingClientRect()
      const pad = 8

      const inside =
        e.clientX >= r.left - pad &&
        e.clientX <= r.right + pad &&
        e.clientY >= r.top - pad &&
        e.clientY <= r.bottom + pad

      if (inside) {
        enteredRef.current = true
        outsideSinceRef.current = null
        return
      }

      // the mouse was on the card and has now moved off to a side
      if (enteredRef.current) {
        releaseCard()
        return
      }

      // the mouse never reached the card (it slid away to the center):
      // give the person a moment to move over to it, then continue
      if (outsideSinceRef.current === null) {
        outsideSinceRef.current = Date.now()
      } else if (Date.now() - outsideSinceRef.current > leaveDelay) {
        releaseCard()
      }
    }

    const onKey = (e) => {
      if (e.key === 'Escape') releaseCard()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', releaseCard, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', releaseCard)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])


  // =========================================================
  // RENDER
  // =========================================================

  const isFocusing = focusKey !== null

  return (
    <>

      {/* ---------- dark layer (plain tint, no blur) ---------- */}

      <div
        aria-hidden="true"
        onPointerDown={releaseCard}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          background: dimColor,
          opacity: isFocusing ? 1 : 0,
          pointerEvents: isFocusing ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />


      {/* ---------- scrolling row ---------- */}

      <div
        className="
          relative
          -mx-5
          w-[calc(100%+2.5rem)]
          overflow-hidden
          py-8
          sm:-mx-8
          sm:w-[calc(100%+4rem)]
          lg:-mx-10
          lg:w-[calc(100%+5rem)]
        "
        style={{
          zIndex: 6,
          opacity: visible ? 1 : 0,
          transition: 'opacity 600ms ease-out',
          touchAction: 'pan-y',
        }}
      >

        <div
          ref={trackRef}
          className="flex w-max gap-5 px-5 py-2 will-change-transform sm:gap-6 sm:px-8 lg:px-10"
        >
          {items.map((service, i) => {
            const index = i % n
            const isFocused = focusKey === i
            const dimmed = isFocusing && !isFocused

            return (
              <div
                key={i}
                ref={(el) => {
                  cardRefs.current[i] = el
                }}
                role="button"
                tabIndex={i < n ? 0 : -1}
                aria-hidden={i >= n ? 'true' : undefined}
                aria-label={`${service.title}. Press Enter to enlarge.`}
                className="
                  relative
                  h-[300px]
                  w-[82vw]
                  shrink-0
                  cursor-pointer
                  select-none
                  outline-none
                  sm:w-[420px]
                  lg:w-[430px]
                "
                style={{
                  zIndex: isFocused ? 20 : 1,
                  transform: isFocused ? `scale(${scale})` : 'scale(1)',
                  filter: dimmed ? 'brightness(0.5)' : 'none',
                  borderRadius: 24,
                  boxShadow: isFocused
                    ? '0 30px 80px rgba(0,0,0,0.55)'
                    : '0 0 0 rgba(0,0,0,0)',
                  transition:
                    'transform 400ms cubic-bezier(0.2,0.8,0.2,1), filter 300ms ease, box-shadow 400ms ease',
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') openCard(i)
                }}
                onPointerMove={(e) => {
                  if (e.pointerType === 'mouse') openCard(i)
                }}
                onPointerDown={(e) => {
                  // phones / tablets: tap to enlarge, tap again to continue
                  if (e.pointerType === 'mouse') return

                  // tapping any other card also continues the scroll
                  if (focusKeyRef.current !== null) releaseCard()
                  else openCard(i)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()

                    if (focusKeyRef.current === i) releaseCard()
                    else openCard(i)
                  }
                }}
              >
                <SpecializedCard service={service} number={index + 1} />
              </div>
            )
          })}
        </div>

      </div>

    </>
  )
}