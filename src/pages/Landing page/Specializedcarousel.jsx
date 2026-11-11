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

   MANUAL CONTROLS (new)
   - PHONE / TABLET : swipe left or right with your finger
                      (with a little momentum when you let go);
                      swiping up/down still scrolls the page
   - MOUSE          : roll the mouse wheel, or click-and-drag
   - LAPTOP TOUCHPAD: two-finger swipe left/right
   - after you stop touching it, the auto scroll continues by itself

   TO CONTINUE SCROLLING FROM A FOCUSED CARD
   - move the mouse off the card, tap the dark area, swipe,
     scroll the page, or press Esc
========================================================= */

const HOLD_AFTER_INTERACTION = 1200 // ms the auto scroll waits after you stop
const MOMENTUM_FRICTION = 5         // higher = stops sooner
const WHEEL_IMPULSE = 6             // higher = mouse wheel slides farther
const MAX_VELOCITY = 4000           // px per second

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default function SpecializedCarousel({
  services,
  visible = true,
  speed = 45,          // pixels per second
  focusScale = 1,      // 1 = no enlarging (try 1.3 to make the focused card bigger)
  dimColor = 'rgba(0,0,0,0.62)',
  leaveDelay = 400,    // ms before scrolling continues if the mouse is off the card
  // 'auto'   = mouse wheel slides the cards, a touchpad's up/down scroll
  //            still scrolls the page (touchpad left/right slides the cards)
  // 'always' = every wheel / touchpad movement over the cards slides them
  wheelMode = 'auto',
}) {

  const n = services.length

  const rowRef = useRef(null)
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

  // manual scrolling
  const velRef = useRef(0)            // momentum, px per second
  const draggingRef = useRef(false)
  const holdUntilRef = useRef(0)      // auto scroll waits until this time
  const lastInteractRef = useRef(0)
  const dragRef = useRef({
    down: false,
    moved: false,
    id: null,
    startX: 0,
    startY: 0,
    startTrack: 0,
    lastX: 0,
    lastT: 0,
  })

  const [focusKey, setFocusKey] = useState(null)
  const [scale, setScale] = useState(1)

  // three copies so the loop never shows a gap
  const items = [...services, ...services, ...services]


  // ---------- move the track (keeps the loop endless) ----------

  const applyX = () => {
    const loop = loopRef.current

    // wrap only while nothing is focused
    if (loop && focusKeyRef.current === null) {
      while (xRef.current <= -loop) xRef.current += loop
      while (xRef.current > 0) xRef.current -= loop
    }

    if (trackRef.current) {
      trackRef.current.style.transform =
        `translate3d(${xRef.current}px,0,0)`
    }
  }


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


  // ---------- auto scroll + glide to center + momentum ----------

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    let raf
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      if (targetRef.current !== null) {
        // glide the focused card to the center
        const diff = targetRef.current - xRef.current

        if (Math.abs(diff) < 0.5) {
          xRef.current = targetRef.current
          targetRef.current = null
        } else {
          xRef.current += diff * (1 - Math.pow(0.0005, dt))
        }

        applyX()
      } else if (draggingRef.current) {
        // the finger / mouse is moving the track - nothing to do here
      } else if (Math.abs(velRef.current) > 8) {
        // momentum after a swipe or a mouse wheel roll
        xRef.current += velRef.current * dt
        velRef.current *= Math.exp(-MOMENTUM_FRICTION * dt)
        holdUntilRef.current = Date.now() + HOLD_AFTER_INTERACTION
        applyX()
      } else {
        velRef.current = 0

        if (
          !pausedRef.current &&
          !reduceMotion &&
          loopRef.current &&
          Date.now() >= holdUntilRef.current
        ) {
          xRef.current -= speed * dt
          applyX()
        }
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])


  // ---------- remember when the page scrolls ----------

  useEffect(() => {
    const onScroll = () => {
      lastScrollRef.current = Date.now()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])


  // ---------- mouse wheel + touchpad two-finger swipe ----------

  useEffect(() => {
    const el = rowRef.current
    if (!el) return

    const onWheel = (e) => {
      if (e.ctrlKey) return // pinch-zoom: leave it alone

      // normalise line / page based wheels to pixels
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerWidth : 1
      const dx = e.deltaX * unit
      const dy = e.deltaY * unit

      const horizontal = Math.abs(dx) > Math.abs(dy)

      // a real mouse wheel sends big, whole-number, up/down steps
      const looksLikeMouseWheel =
        e.deltaMode !== 0 ||
        (e.deltaX === 0 &&
          Number.isInteger(e.deltaY) &&
          Math.abs(e.deltaY) >= 40)

      // touchpad up/down: let the page scroll normally
      if (!horizontal && wheelMode !== 'always' && !looksLikeMouseWheel) return

      e.preventDefault()

      if (focusKeyRef.current !== null) releaseCard()

      targetRef.current = null
      lastInteractRef.current = Date.now()
      holdUntilRef.current = Date.now() + HOLD_AFTER_INTERACTION

      if (horizontal) {
        // touchpad swipe: the OS already adds its own smooth momentum
        velRef.current = 0
        xRef.current -= dx
        applyX()
      } else {
        // mouse wheel: push the cards, they glide to a stop
        velRef.current = clamp(
          velRef.current - dy * WHEEL_IMPULSE,
          -MAX_VELOCITY,
          MAX_VELOCITY
        )
      }
    }

    // must be non-passive so preventDefault can stop the page from scrolling
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelMode])


  // ---------- focus / release ----------

  const openCard = (key) => {
    if (focusKeyRef.current !== null) return

    // the person is dragging / rolling the wheel / coasting - not a real hover
    if (draggingRef.current) return
    if (Math.abs(velRef.current) > 20) return
    if (Date.now() - lastInteractRef.current < 700) return

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

    velRef.current = 0
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


  // ---------- swipe / drag (finger, pen or mouse) ----------

  const onRowPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return

    // touching the row stops any coasting
    velRef.current = 0
    holdUntilRef.current = Date.now() + HOLD_AFTER_INTERACTION

    dragRef.current = {
      down: true,
      moved: false,
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTrack: xRef.current,
      lastX: e.clientX,
      lastT: performance.now(),
    }
  }

  const onRowPointerMove = (e) => {
    const d = dragRef.current
    if (!d.down || e.pointerId !== d.id) return

    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY

    if (!d.moved) {
      // not a drag yet - wait for a clear movement
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return

      // mostly vertical: leave it to the page
      if (Math.abs(dy) > Math.abs(dx)) {
        d.down = false
        return
      }

      // the drag begins here
      d.moved = true
      draggingRef.current = true
      targetRef.current = null

      if (focusKeyRef.current !== null) releaseCard()

      // start from where the track is right now (no jump)
      d.startX = e.clientX
      d.startTrack = xRef.current
      d.lastX = e.clientX
      d.lastT = performance.now()

      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch (err) {
        /* not supported - dragging still works inside the row */
      }
    }

    // follow the finger
    xRef.current = d.startTrack + (e.clientX - d.startX)
    applyX()

    // remember how fast it is moving (for the momentum on release)
    const now = performance.now()
    const dtMs = now - d.lastT

    if (dtMs > 0) {
      const instant = ((e.clientX - d.lastX) / dtMs) * 1000
      velRef.current = 0.6 * instant + 0.4 * velRef.current
    }

    d.lastX = e.clientX
    d.lastT = now
  }

  const endDrag = (e, cancelled) => {
    const d = dragRef.current
    if (!d.down || e.pointerId !== d.id) return

    const wasDrag = d.moved
    d.down = false
    d.moved = false

    if (wasDrag) {
      draggingRef.current = false

      // finger rested before letting go: no momentum
      const idle = performance.now() - d.lastT
      velRef.current =
        cancelled || idle > 80
          ? 0
          : clamp(velRef.current, -MAX_VELOCITY, MAX_VELOCITY)

      lastInteractRef.current = Date.now()
      holdUntilRef.current = Date.now() + HOLD_AFTER_INTERACTION

      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch (err) {
        /* already released */
      }
      return
    }

    // ----- it was a tap -----
    if (cancelled) return
    if (e.pointerType === 'mouse') return // the mouse uses hover instead

    // phones / tablets: tap to enlarge, tap again to continue
    if (focusKeyRef.current !== null) {
      releaseCard()
      return
    }

    const cardEl = e.target.closest ? e.target.closest('[data-card]') : null
    if (cardEl) openCard(Number(cardEl.getAttribute('data-card')))
  }


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
        ref={rowRef}
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
          touchAction: 'pan-y',          // up/down = page, left/right = carousel
          overscrollBehaviorX: 'contain', // no browser "back" swipe from the row
        }}
        onPointerDown={onRowPointerDown}
        onPointerMove={onRowPointerMove}
        onPointerUp={(e) => endDrag(e, false)}
        onPointerCancel={(e) => endDrag(e, true)}
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
                data-card={i}
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