import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { supabase } from '../lib/supabase'


export default function AnnouncementBanner() {

  // =========================================================
  // STATE
  // =========================================================

  const [announcements, setAnnouncements] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [currentIndex, setCurrentIndex] =
    useState(0)

  const [touchStart, setTouchStart] =
    useState(null)

  const [touchEnd, setTouchEnd] =
    useState(null)

  const [mediaLoading, setMediaLoading] =
    useState(true)

  const [mediaError, setMediaError] =
    useState(false)

  // =========================================================
  // PAUSE AUTOMATIC ROTATION
  // =========================================================

  const [isPaused, setIsPaused] =
    useState(false)

  // =========================================================
  // HIDE ANNOUNCEMENT
  // =========================================================

  const [isHidden, setIsHidden] =
    useState(false)


  const videoRef =
    useRef(null)


  // =========================================================
  // LOAD ANNOUNCEMENTS
  // =========================================================

  useEffect(() => {

    let mounted = true


    const loadAnnouncements = async () => {

      try {

        setLoading(true)


        // =====================================================
        // GET LOGGED-IN USER
        // =====================================================

        const {
          data: {
            user,
          },
          error: userError,
        } =
          await supabase.auth.getUser()


        console.log(
          '📢 Announcement User:',
          user
        )


        if (
          userError ||
          !user
        ) {

          console.error(
            '❌ Announcement user error:',
            userError
          )

          return
        }


        // =====================================================
        // GET USER ROLE
        // =====================================================

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()


        console.log(
          '📢 Announcement User Profile:',
          profile
        )


        if (profileError) {

          console.error(
            '❌ Announcement profile error:',
            profileError
          )

          return
        }


        if (!profile) {

          console.error(
            '❌ No user profile found.'
          )

          return
        }


        const role =
          profile.role


        console.log(
          '📢 Announcement Role:',
          role
        )


        // =====================================================
        // GET PUBLISHED ANNOUNCEMENTS
        // =====================================================

        const {
          data,
          error,
        } =
          await supabase
            .from('announcements')
            .select('*')
            .eq(
              'status',
              'published'
            )
            .order(
              'created_at',
              {
                ascending: false,
              }
            )


        console.log(
          '📢 Published announcements:',
          data
        )


        console.log(
          '📢 Announcement query error:',
          error
        )


        if (error) {

          console.error(
            '❌ Announcement fetch error:',
            error
          )

          return
        }


        // =====================================================
        // CURRENT TIME
        // =====================================================

        const now =
          new Date()


        // =====================================================
        // FILTER ANNOUNCEMENTS
        // =====================================================

        const filtered =
          (data || []).filter(
            (announcement) => {

              // =================================================
              // AUDIENCE
              // =================================================

              let announcementAudience =
                announcement.audience


              if (
                typeof announcementAudience ===
                'string'
              ) {

                try {

                  announcementAudience =
                    JSON.parse(
                      announcementAudience
                    )

                } catch {

                  announcementAudience =
                    announcementAudience
                      .replace(
                        /[{}"]/g,
                        ''
                      )
                      .split(',')
                      .map(
                        (item) =>
                          item.trim()
                      )
                      .filter(Boolean)
                }
              }


              if (
                !Array.isArray(
                  announcementAudience
                )
              ) {

                announcementAudience =
                  []
              }


              const allowedAudience =
                announcementAudience.some(
                  (item) =>
                    String(item)
                      .trim()
                      .toLowerCase() ===
                    String(role)
                      .trim()
                      .toLowerCase()
                )


              console.log(
                '📢 Audience check:',
                {
                  title:
                    announcement.title,

                  audience:
                    announcementAudience,

                  userRole:
                    role,

                  allowed:
                    allowedAudience,
                }
              )


              if (
                !allowedAudience
              ) {

                return false
              }


              // =================================================
              // START DATE
              // =================================================

              if (
                announcement.starts_at
              ) {

                const startDate =
                  new Date(
                    announcement.starts_at
                  )


                if (
                  now < startDate
                ) {

                  return false
                }
              }


              // =================================================
              // END DATE
              // =================================================

              if (
                announcement.ends_at
              ) {

                const endDate =
                  new Date(
                    announcement.ends_at
                  )


                if (
                  now > endDate
                ) {

                  return false
                }
              }


              return true
            }
          )


        console.log(
          '📢 Announcements for this user:',
          filtered
        )


        if (mounted) {

          setAnnouncements(
            filtered
          )

          setCurrentIndex(0)
        }

      } catch (error) {

        console.error(
          '❌ Announcement exception:',
          error
        )

      } finally {

        if (mounted) {

          setLoading(false)
        }
      }
    }


    loadAnnouncements()


    return () => {

      mounted = false
    }

  }, [])


  // =========================================================
  // CURRENT ANNOUNCEMENT
  // =========================================================

  const currentAnnouncement =
    announcements[
      currentIndex
    ]


  // =========================================================
  // RESET MEDIA STATE
  // ONLY WHEN USER CHANGES SLIDE
  // =========================================================

  useEffect(() => {

    setMediaLoading(true)

    setMediaError(false)


    if (
      videoRef.current
    ) {

      try {

        videoRef.current.pause()

        videoRef.current.currentTime =
          0

      } catch (error) {

        console.warn(
          'Video reset warning:',
          error
        )
      }
    }

  }, [
    currentIndex,
  ])


  // =========================================================
  // AUTO-SCROLL
  //
  // PHONE:
  //   Disabled below 640px.
  //
  // TABLET:
  //   Enabled from 640px.
  //
  // LAPTOP/DESKTOP:
  //   Enabled.
  //
  // INTERVAL:
  //   7 seconds.
  //
  // HOVER:
  //   Pauses on larger screens.
  // =========================================================

  useEffect(() => {

    if (
      announcements.length <= 1
    ) {

      return
    }


    // =======================================================
    // SAFELY CHECK SCREEN WIDTH
    // =======================================================

    const mediaQuery =
      window.matchMedia(
        '(max-width: 639px)'
      )


    // =======================================================
    // PHONE = NO AUTO-SCROLL
    // =======================================================

    if (
      mediaQuery.matches
    ) {

      return
    }


    // =======================================================
    // PAUSED = NO TIMER
    // =======================================================

    if (
      isPaused
    ) {

      return
    }


    // =======================================================
    // START 7-SECOND AUTO-SCROLL
    // =======================================================

    const timer =
      setInterval(() => {

        setCurrentIndex(
          (previous) =>
            (
              previous + 1
            ) %
            announcements.length
        )

      }, 7000)


    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {

      clearInterval(timer)
    }

  }, [
    announcements.length,
    isPaused,
  ])


  // =========================================================
  // NEXT
  // =========================================================

  const nextAnnouncement = () => {

    if (
      announcements.length <= 1
    ) {

      return
    }


    setCurrentIndex(
      (previous) =>
        (
          previous + 1
        ) %
        announcements.length
    )
  }


  // =========================================================
  // PREVIOUS
  // =========================================================

  const previousAnnouncement = () => {

    if (
      announcements.length <= 1
    ) {

      return
    }


    setCurrentIndex(
      (previous) =>
        previous === 0
          ? announcements.length - 1
          : previous - 1
    )
  }


  // =========================================================
  // TOUCH START
  // =========================================================

  const handleTouchStart =
    (event) => {

      if (
        announcements.length <= 1
      ) {

        return
      }


      setTouchEnd(null)

      setTouchStart(
        event.targetTouches[0]
          .clientX
      )
    }


  // =========================================================
  // TOUCH MOVE
  // =========================================================

  const handleTouchMove =
    (event) => {

      if (
        touchStart === null
      ) {

        return
      }


      setTouchEnd(
        event.targetTouches[0]
          .clientX
      )
    }


  // =========================================================
  // TOUCH END
  // =========================================================

  const handleTouchEnd =
    () => {

      if (
        touchStart === null ||
        touchEnd === null
      ) {

        return
      }


      const distance =
        touchStart -
        touchEnd


      const minimumSwipeDistance =
        45


      if (
        Math.abs(distance) >=
        minimumSwipeDistance
      ) {

        if (
          distance > 0
        ) {

          nextAnnouncement()

        } else {

          previousAnnouncement()
        }
      }


      setTouchStart(null)
      setTouchEnd(null)
    }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return null
  }


  // =========================================================
  // NOTHING TO DISPLAY
  // =========================================================

  if (
    announcements.length === 0 ||
    !currentAnnouncement
  ) {

    return null
  }


  // =========================================================
  // HIDDEN STATE
  //
  // IMPORTANT:
  // The announcement is hidden, but the SHOW button remains.
  // =========================================================

  if (isHidden) {

    return (

      <section
        className="
          relative
          mb-6
          w-full
        "
      >

        <div
          className="
            flex
            w-full
            justify-center
          "
        >

          <button
            type="button"
            onClick={() => {

              setIsHidden(false)

            }}
            aria-label="Show announcement"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-200
              bg-white
              px-4
              py-2.5
              text-xs
              font-bold
              text-blue-600
              shadow-md
              shadow-blue-900/5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-blue-50
              hover:shadow-lg
              active:scale-95
            "
          >

            <span
              className="
                text-sm
                leading-none
              "
            >
              📢
            </span>

            Show Announcement

          </button>

        </div>

      </section>

    )
  }


  // =========================================================
  // MEDIA TYPE
  // =========================================================

  const isImage =
    currentAnnouncement.media_type ===
    'image'

  const isVideo =
    currentAnnouncement.media_type ===
    'video'

  const hasMedia =
    Boolean(
      currentAnnouncement.media_url
    )


  // =========================================================
  // DISPLAY
  // =========================================================

  return (

    <section
      className="
        relative
        mb-6
        w-full
        touch-pan-y
      "
    >

      {/* =====================================================
          PREMIUM CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          rounded-2xl
          bg-slate-950
          shadow-xl
          shadow-slate-900/10
          ring-1
          ring-black/5
          sm:rounded-3xl
        "

        // =====================================================
        // DESKTOP/TABLET HOVER PAUSE
        // =====================================================

        onMouseEnter={() => {

          setIsPaused(true)

        }}

        onMouseLeave={() => {

          setIsPaused(false)

        }}

        onTouchStart={
          handleTouchStart
        }

        onTouchMove={
          handleTouchMove
        }

        onTouchEnd={
          handleTouchEnd
        }
      >

        {/* ===================================================
            DECORATIVE GLOW
        =================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            z-0
            h-72
            w-72
            rounded-full
            bg-blue-500/20
            blur-3xl
          "
        />


        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-32
            z-0
            h-72
            w-72
            rounded-full
            bg-purple-500/20
            blur-3xl
          "
        />


        {/* ===================================================
            MEDIA AREA
        =================================================== */}

        <div
          className="
            relative
            z-10
            flex
            min-h-[300px]
            w-full
            items-center
            justify-center
            overflow-hidden
            bg-slate-950
            sm:min-h-[380px]
            lg:min-h-[460px]
          "
        >

          {/* =================================================
              LOADING
          ================================================= */}

          {hasMedia &&
            mediaLoading &&
            !mediaError && (

              <div
                className="
                  absolute
                  inset-0
                  z-40
                  flex
                  items-center
                  justify-center
                  bg-slate-900
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    items-center
                    gap-3
                    text-white/70
                  "
                >

                  <div
                    className="
                      h-8
                      w-8
                      animate-spin
                      rounded-full
                      border-2
                      border-white/20
                      border-t-white
                    "
                  />

                  <span
                    className="
                      text-xs
                      sm:text-sm
                    "
                  >
                    Loading announcement...
                  </span>

                </div>

              </div>

            )}


          {/* =================================================
              IMAGE
          ================================================= */}

          {isImage &&
            hasMedia &&
            !mediaError && (

              <img
                key={
                  currentAnnouncement.id
                }
                src={
                  currentAnnouncement.media_url
                }
                alt={
                  currentAnnouncement.title ||
                  'Announcement'
                }
                loading="eager"
                decoding="async"
                className="
                  relative
                  z-10
                  block
                  h-auto
                  min-h-[300px]
                  w-full
                  max-h-[700px]
                  object-contain
                  bg-slate-950
                  sm:min-h-[380px]
                  lg:min-h-[460px]
                "
                onLoad={() => {

                  console.log(
                    '✅ Announcement image loaded:',
                    currentAnnouncement.media_url
                  )

                  setMediaLoading(false)
                  setMediaError(false)

                }}
                onError={(event) => {

                  console.error(
                    '❌ Announcement image failed to load:',
                    currentAnnouncement.media_url
                  )

                  setMediaLoading(false)
                  setMediaError(true)

                  event.currentTarget.style.display =
                    'none'

                }}
              />

            )}


          {/* =================================================
              VIDEO
          ================================================= */}

          {isVideo &&
            hasMedia &&
            !mediaError && (

              <video
                key={
                  currentAnnouncement.id
                }
                ref={videoRef}
                src={
                  currentAnnouncement.media_url
                }
                controls
                playsInline
                preload="metadata"
                className="
                  relative
                  z-10
                  block
                  min-h-[300px]
                  w-full
                  max-h-[700px]
                  object-contain
                  bg-black
                  sm:min-h-[380px]
                  lg:min-h-[460px]
                "
                onLoadedMetadata={() => {

                  console.log(
                    '✅ Announcement video metadata loaded:',
                    currentAnnouncement.media_url
                  )

                  setMediaLoading(false)

                }}
                onCanPlay={() => {

                  setMediaLoading(false)

                }}
                onError={() => {

                  console.error(
                    '❌ Announcement video failed to load:',
                    currentAnnouncement.media_url
                  )

                  setMediaLoading(false)
                  setMediaError(true)

                }}
              />

            )}


          {/* =================================================
              NO MEDIA
          ================================================= */}

          {!hasMedia && (

            <div
              className="
                relative
                z-10
                flex
                min-h-[300px]
                w-full
                items-center
                justify-center
                bg-gradient-to-br
                from-slate-900
                to-slate-800
                px-6
                text-center
              "
            >

              <div>

                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white/10
                    text-2xl
                  "
                >
                  📢
                </div>

                <p
                  className="
                    text-sm
                    font-medium
                    text-white/70
                  "
                >
                  Announcement
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              MEDIA ERROR
          ================================================= */}

          {mediaError && (

            <div
              className="
                relative
                z-10
                flex
                min-h-[300px]
                w-full
                items-center
                justify-center
                bg-gradient-to-br
                from-slate-900
                to-slate-800
                px-6
                text-center
              "
            >

              <div>

                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-red-500/10
                    text-xl
                  "
                >
                  ⚠️
                </div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Media could not be loaded
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-white/50
                  "
                >
                  The announcement is still available.
                </p>

              </div>

            </div>

          )}


          {/* =================================================
              BOTTOM GRADIENT
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              z-20
              h-1/2
              bg-gradient-to-t
              from-black/80
              via-black/25
              to-transparent
            "
          />


          {/* =================================================
              ANNOUNCEMENT BADGE
          ================================================= */}

          <div
            className="
              absolute
              left-3
              top-3
              z-30
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-black/45
              px-3
              py-1.5
              text-xs
              font-medium
              text-white
              shadow-lg
              backdrop-blur-md
              sm:left-5
              sm:top-5
              sm:text-sm
            "
          >

            <span
              className="
                h-2
                w-2
                rounded-full
                bg-blue-400
                shadow-[0_0_10px_rgba(96,165,250,0.9)]
              "
            />

            Announcement

          </div>


          {/* =================================================
              COUNTER
          ================================================= */}

          {announcements.length > 1 && (

            <div
              className="
                absolute
                right-3
                top-3
                z-30
                rounded-full
                border
                border-white/20
                bg-black/45
                px-3
                py-1.5
                text-xs
                font-medium
                text-white
                backdrop-blur-md
                sm:right-5
                sm:top-5
                sm:text-sm
              "
            >

              {currentIndex + 1}
              {' / '}
              {announcements.length}

            </div>

          )}


          {/* =================================================
              HIDE BUTTON
              Positioned below the counter so it does not
              interfere with video fullscreen controls.
          ================================================= */}

          <button
            type="button"
            onClick={() => {

              setIsHidden(true)

            }}
            aria-label="Hide announcement"
            className="
              absolute
              right-3
              top-14
              z-40
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/20
              bg-black/45
              px-3
              py-1.5
              text-xs
              font-semibold
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-black/60
              active:scale-95
              sm:right-5
              sm:top-16
            "
          >

            <span
              className="
                text-sm
                leading-none
              "
            >
              ×
            </span>

            Hide

          </button>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-30
              p-4
              pb-16
              text-white
              sm:p-6
              sm:pb-6
              lg:p-8
            "
          >

            <div
              className="
                max-w-3xl
              "
            >

              <h2
                className="
                  line-clamp-2
                  text-xl
                  font-bold
                  tracking-tight
                  drop-shadow-lg
                  sm:text-2xl
                  lg:text-3xl
                "
              >
                {
                  currentAnnouncement.title
                }
              </h2>


              {currentAnnouncement.description && (

                <p
                  className="
                    mt-1.5
                    line-clamp-2
                    whitespace-pre-line
                    text-sm
                    leading-relaxed
                    text-white/85
                    drop-shadow
                    sm:mt-2
                    sm:line-clamp-3
                    sm:text-base
                  "
                >
                  {
                    currentAnnouncement.description
                  }
                </p>

              )}

            </div>

          </div>

        </div>


        {/* ===================================================
            CONTROL BAR
            KEPT AT THE BOTTOM
        =================================================== */}

        <div
          className="
            relative
            z-30
            flex
            items-center
            justify-between
            gap-3
            bg-slate-950
            px-3
            py-3
            sm:px-5
            sm:py-4
          "
        >

          {/* =================================================
              PREVIOUS
          ================================================= */}

          <button
            type="button"
            onClick={
              previousAnnouncement
            }
            disabled={
              announcements.length <= 1
            }
            aria-label="Previous announcement"
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              text-xl
              text-white
              transition-all
              duration-200
              hover:bg-white/10
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >

            ‹

          </button>


          {/* =================================================
              DOTS
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-center
              gap-1.5
              overflow-x-auto
              scrollbar-none
            "
          >

            {announcements.map(
              (announcement, index) => (

                <button
                  key={
                    announcement.id
                  }
                  type="button"
                  onClick={() => {

                    setCurrentIndex(
                      index
                    )

                  }}
                  aria-label={
                    `Go to announcement ${
                      index + 1
                    }`
                  }
                  className={`
                    h-1.5
                    shrink-0
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index ===
                      currentIndex
                        ? `
                          w-7
                          bg-white
                        `
                        : `
                          w-1.5
                          bg-white/30
                          hover:bg-white/60
                        `
                    }
                  `}
                />

              )
            )}

          </div>


          {/* =================================================
              NEXT
          ================================================= */}

          <button
            type="button"
            onClick={
              nextAnnouncement
            }
            disabled={
              announcements.length <= 1
            }
            aria-label="Next announcement"
            className="
              flex
              h-10
              w-10
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-white/5
              text-xl
              text-white
              transition-all
              duration-200
              hover:bg-white/10
              active:scale-95
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >

            ›

          </button>

        </div>

      </div>


      {/* =====================================================
          MOBILE SWIPE HINT
      ===================================================== */}

      {announcements.length > 1 && (

        <p
          className="
            mt-2
            text-center
            text-[11px]
            text-gray-400
            sm:hidden
          "
        >
          Swipe left or right to view announcements
        </p>

      )}

    </section>
  )
}
