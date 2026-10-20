import { useNavigate } from 'react-router-dom'
import React, { useEffect, useRef, useState } from 'react'

import { FaFacebookF } from 'react-icons/fa'
import { FaTiktok } from 'react-icons/fa6'

import {
  FaChevronDown,
  FaChevronUp,
  FaHome,
FaCalendarCheck,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaClock,
  FaPhone,
  FaMapMarkerAlt,
  FaWrench,
  FaBolt,
  FaCar,
  FaArrowRight,
  FaBatteryFull,
  FaStar,
  FaMicrochip,
  FaCogs,
  FaCheckCircle,
  FaShieldAlt,
  FaTools,
  FaPowerOff,
  FaWindowMaximize,
  FaClipboardList,
  FaArrowUp,
  FaRoute,
    FaAward,
  FaHandshake,
} from 'react-icons/fa'


export default function Landing() {

  const navigate = useNavigate()
  const [statsVisible, setStatsVisible] = useState(false)
  const [gettingStartedVisible, setGettingStartedVisible] = useState(false)
  const gettingStartedRef = useRef(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const [heroVisible, setHeroVisible] = useState(true)
  const whyChooseRef = useRef(null)
const [whyChooseVisible, setWhyChooseVisible] = useState(false)
const whyReasonRefs = useRef([])
const [visibleReasons, setVisibleReasons] = useState({})
const servicesSectionRef = useRef(null)
const [servicesSectionVisible, setServicesSectionVisible] = useState(false)
const specializedScrollRef = useRef(null)
const [specializedActiveIndex, setSpecializedActiveIndex] = useState(0)
const contactRef = useRef(null)
const [contactVisible, setContactVisible] = useState(false)

const serviceRefs = useRef([])
const [visibleServices, setVisibleServices] = useState({})
const [specializedVisible, setSpecializedVisible] = useState(false)

  const [openService, setOpenService] = useState(null)
  const [openReason, setOpenReason] = useState(null)
  const [activeSection, setActiveSection] = useState('about')
  const [showAccount, setShowAccount] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const aboutSectionRef = useRef(null) 

const [aboutSectionVisible, setAboutSectionVisible] =
  useState(false)
  const specializedServicesRef = useRef(null)

const [specializedServicesVisible, setSpecializedServicesVisible] =
  useState(false)

  const privacyRef = useRef(null)
const [privacyVisible, setPrivacyVisible] = useState(false)
const [heroImageIndex, setHeroImageIndex] = useState(0)
const [heroImageVisible, setHeroImageVisible] = useState(false) // false, not true


  // =========================================================
  // ACCORDION
  // =========================================================

  const toggleService = (index) => {
    setOpenService(
      openService === index
        ? null
        : index
    )
  }


  const toggleReason = (index) => {
    setOpenReason(
      openReason === index
        ? null
        : index
    )
  }

  useEffect(() => {
  const section = document.getElementById('alavaren-stats')

  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setStatsVisible(entry.isIntersecting)
    },
    {
      threshold: 0.25,
    }
  )

  observer.observe(section)

  return () => {
    observer.disconnect()
  }
}, [])

  useEffect(() => {
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 450)
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  handleScroll()

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}


  useEffect(() => {
  const element = gettingStartedRef.current

  if (!element) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setGettingStartedVisible(entry.isIntersecting)
    },
    {
      threshold: 0.18
    }
  )

  observer.observe(element)

  return () => observer.disconnect()
}, [])

const heroImages = [
  '/TemporaryBg1.jpg',
  '/TemporaryBg2.jpg',
  '/TemporaryBg3.jpg',
];
 // state: two image slots + which one is currently on top
const [layerA, setLayerA] = useState(heroImages[0])
const [layerB, setLayerB] = useState(heroImages[1])
const [activeLayer, setActiveLayer] = useState('A') // whichever is opacity:1
const [current, setCurrent] = useState(0)

useEffect(() => {
  // warm the browser cache on mount so every image is already
  // downloaded before it's ever needed for a crossfade
  heroImages.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}, [])

useEffect(() => {
  let cancelled = false;

  const interval = setInterval(() => {
    const next = (current + 1) % heroImages.length;
    const nextSrc = heroImages[next];

    const img = new Image();
    img.src = nextSrc;

    // decode() waits until the image is fully decoded, not just downloaded,
    // which prevents a one-frame flash on large images
    (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
      if (cancelled) return;

      if (activeLayer === 'A') setLayerB(nextSrc);
      else setLayerA(nextSrc);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return;
          setActiveLayer((prev) => (prev === 'A' ? 'B' : 'A'));
          setCurrent(next);
        });
      });
    });
  }, 7000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [current, activeLayer]);


const layerStyle = (layer, url) => {
  const isActive = activeLayer === layer;
  return {
    backgroundImage: `url('${url}')`,
    opacity: isActive ? 1 : 0,
    transform: isActive ? 'scale(1)' : 'scale(1.035)',
    zIndex: isActive ? 2 : 1,
    transition: isActive
      ? 'opacity 1800ms ease-in-out, transform 2200ms ease-out'
      : 'opacity 0ms linear 1800ms, transform 0ms linear 2200ms',
  };
};

useEffect(() => {
  const element = specializedServicesRef.current

  if (!element) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setSpecializedVisible(entry.isIntersecting)
    },
    {
      threshold: 0.2
    }
  )

  observer.observe(element)

  return () => observer.disconnect()
}, [])

  useEffect(() => {
  const section = privacyRef.current
  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setPrivacyVisible(entry.isIntersecting)
    },
    {
      threshold: 0.08
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])

  useEffect(() => {
  const section = contactRef.current
  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setContactVisible(entry.isIntersecting)
    },
    {
      threshold: 0.08
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])







  useEffect(() => {
  const hero = document.querySelector('.landing-hero')

  if (!hero) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setHeroVisible(entry.isIntersecting)
    },
    {
      threshold: 0.25,
    }
  )

  observer.observe(hero)

  return () => observer.disconnect()
}, [])


useEffect(() => {
  const section = whyChooseRef.current

  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setWhyChooseVisible(entry.isIntersecting)
    },
    {
      threshold: 0.05
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])

useEffect(() => {
  const elements = whyReasonRefs.current.filter(Boolean)

  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      setVisibleReasons((previous) => {
        const next = { ...previous }

        entries.forEach((entry) => {
          const index = Number(
            entry.target.dataset.reasonIndex
          )

          next[index] = entry.isIntersecting
        })

        return next
      })
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  )

  elements.forEach((element) => {
    observer.observe(element)
  })

  return () => {
    observer.disconnect()
  }
}, [])


useEffect(() => {
  const section = servicesSectionRef.current

  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setServicesSectionVisible(entry.isIntersecting)
    },
    {
      threshold: 0.05
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])

useEffect(() => {
  const elements = serviceRefs.current.filter(Boolean)

  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      setVisibleServices((previous) => {
        const next = { ...previous }

        entries.forEach((entry) => {
          const index = Number(
            entry.target.dataset.serviceIndex
          )

          next[index] = entry.isIntersecting
        })

        return next
      })
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    }
  )

  elements.forEach((element) => {
    observer.observe(element)
  })

  return () => {
    observer.disconnect()
  }
}, [])


useEffect(() => {
  const container = specializedScrollRef.current
  if (!container) return

  const handleScroll = () => {
    const cards = Array.from(
      container.querySelectorAll('.landing-specialized-card')
    )

    if (!cards.length) return

    const containerCenter =
      container.scrollLeft + container.clientWidth / 2

    let closestIndex = 0
    let closestDistance = Infinity

    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2

      const distance = Math.abs(
        cardCenter - containerCenter
      )

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    setSpecializedActiveIndex(closestIndex)
  }

  handleScroll()

  container.addEventListener('scroll', handleScroll, {
    passive: true
  })

  window.addEventListener('resize', handleScroll)

  return () => {
    container.removeEventListener(
      'scroll',
      handleScroll
    )

    window.removeEventListener(
      'resize',
      handleScroll
    )
  }
}, [])

  useEffect(() => {
  const section = aboutSectionRef.current

  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setAboutSectionVisible(entry.isIntersecting)
    },
    {
      threshold: 0.25
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])

  useEffect(() => {
  const section = specializedServicesRef.current

  if (!section) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      setSpecializedServicesVisible(entry.isIntersecting)
    },
    {
      threshold: 0.2
    }
  )

  observer.observe(section)

  return () => observer.disconnect()
}, [])
  // =========================================================
  // ACTIVE NAVIGATION SECTION
  // =========================================================

  useEffect(() => {

    const handleScroll = () => {

      const sections = [
        'about',
        'services',
        'contact'
      ]

      const aboutEl =
        document.getElementById('about')

      const contactEl =
        document.getElementById('contact')

      if (!aboutEl || !contactEl) {
        return
      }

      const aboutTop =
        aboutEl.getBoundingClientRect().top

      const contactBottom =
        contactEl.getBoundingClientRect().bottom

      if (
        aboutTop > 200 ||
        contactBottom < 0
      ) {
        setActiveSection(null)
        return
      }

      let current = null

      sections.forEach((id) => {

        const el =
          document.getElementById(id)

        if (!el) {
          return
        }

        const rect =
          el.getBoundingClientRect()

        if (
          rect.top <= 220 &&
          rect.bottom >= 220
        ) {
          current = id
        }

      })

      setActiveSection(current)
    }


    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    )

    handleScroll()

    return () => {

      window.removeEventListener(
        'scroll',
        handleScroll
      )

    }

  }, [])


  // =========================================================
  // RESPONSIVE MENU
  // =========================================================

  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth > 1023) {
        setShowMobileMenu(false)
      }

    }

    window.addEventListener(
      'resize',
      handleResize
    )

    handleResize()

    return () => {

      window.removeEventListener(
        'resize',
        handleResize
      )

    }

  }, [])




  // =========================================================
// PREMIUM UI CSS
// =========================================================

useEffect(() => {

  const style =
    document.createElement('style')

  style.innerHTML = `

    :root {
      --red: #c0392b;
      --red-dark: #8f241b;
      --red-deep: #701b15;
      --red-light: #f7d5d1;
      --charcoal: #17191d;
      --charcoal-2: #23262c;
      --gray: #667085;
      --gray-light: #f4f5f7;
      --white: #ffffff;
      --glass: rgba(255,255,255,0.68);
      --glass-dark: rgba(20,22,26,0.72);
    }


    html {
      scroll-behavior: smooth;
      scroll-padding-top: 78px;
    }
    section {
  scroll-margin-top: 90px;
}


    * {
      box-sizing: border-box;
    }


    body {
      margin: 0;
      overflow-x: hidden;
      background: #ffffff;
    }


    button,
    a,
    input {
      -webkit-tap-highlight-color: transparent;
    }


    /* =====================================================
       KEYFRAMES
    ===================================================== */

    @keyframes landingBlink {
      0% {
        opacity: 1;
        transform: scale(1);
      }

      50% {
        opacity: .35;
        transform: scale(.78);
      }

      100% {
        opacity: 1;
        transform: scale(1);
      }
    }


    @keyframes landingFloat {
      0%,
      100% {
        transform: translate3d(0,0,0);
      }

      50% {
        transform: translate3d(0,-9px,0);
      }
    }


    @keyframes landingFloatSlow {
      0%,
      100% {
        transform:
          translate3d(0,0,0)
          rotate(0deg);
      }

      50% {
        transform:
          translate3d(0,-15px,0)
          rotate(1deg);
      }
    }


    @keyframes landingPulse {
      0% {
        box-shadow:
          0 0 0 0 rgba(192,57,43,.35);
      }

      70% {
        box-shadow:
          0 0 0 12px rgba(192,57,43,0);
      }

      100% {
        box-shadow:
          0 0 0 0 rgba(192,57,43,0);
      }
    }


    @keyframes landingBounce {
      0% {
        transform: scale(1);
      }

      30% {
        transform: scale(.94);
      }

      55% {
        transform: scale(1.045);
      }

      75% {
        transform: scale(.985);
      }

      100% {
        transform: scale(1);
      }
    }


    /* =====================================================
       CLICK / TOUCH BOUNCE
    ===================================================== */

    .landing-bounce {
      transform-origin: center;
    }


    .landing-bounce:active {
      animation:
        landingBounce .42s ease;
    }


    .landing-clickable:active {
      transform:
        scale(.97) !important;
    }


    /* =====================================================
       GENERAL CARD SYSTEM
    ===================================================== */

    .landing-card {
      position: relative;
      isolation: isolate;
      overflow: hidden;

      transition:
        transform .32s cubic-bezier(.2,.8,.2,1),
        box-shadow .32s ease,
        border-color .32s ease,
        background .32s ease;
    }


    .landing-card::before {
      content: "";

      position: absolute;

      width: 140px;
      height: 140px;

      top: -90px;
      right: -70px;

      background:
        radial-gradient(
          circle,
          rgba(192,57,43,.12),
          transparent 68%
        );

      pointer-events: none;
      z-index: -1;
    }


    @media (hover:hover) {

      .landing-card:hover {
        transform:
          translateY(-7px);

        box-shadow:
          0 22px 55px rgba(25,28,33,.11),
          0 5px 15px rgba(192,57,43,.06);

        border-color:
          rgba(192,57,43,.22);
      }

    }


    /* =====================================================
       NAVBAR
    ===================================================== */

    .landing-navbar {
      backdrop-filter:
        blur(22px)
        saturate(160%);

      -webkit-backdrop-filter:
        blur(22px)
        saturate(160%);
    }


    .landing-nav-link {
      position: relative;
    }


    .landing-nav-link::after {
      content: "";

      position: absolute;

      left: 0;
      right: 0;
      bottom: -4px;

      height: 2px;

      background:
        #ffffff;

      transform:
        scaleX(0);

      transform-origin:
        center;

      transition:
        transform .25s ease;
    }


    .landing-nav-link:hover::after {
      transform:
        scaleX(1);
    }


    .landing-user-icon {
      transition:
        transform .25s ease,
        color .25s ease;
    }


    .landing-user-icon:hover {
      transform:
        translateY(-2px)
        scale(1.08);
    }


    /* =====================================================
       HERO
    ===================================================== */

    .landing-hero {
      isolation: isolate;
    }


    .landing-hero-image {
      will-change:
        transform;
    }


    .landing-hero-content {
      animation:
        landingFloatSlow 8s ease-in-out infinite;
    }


    .landing-hero-badge {
      box-shadow:
        0 10px 30px rgba(0,0,0,.15),
        inset 0 1px 0 rgba(255,255,255,.28);
    }


    .landing-hero-badge-dot {
      animation:
        landingPulse 2s infinite;
    }


    /* =====================================================
       GLASS
    ===================================================== */

    .landing-glass {
      background:
        rgba(255,255,255,.64);

      backdrop-filter:
        blur(20px)
        saturate(150%);

      -webkit-backdrop-filter:
        blur(20px)
        saturate(150%);

      border:
        1px solid rgba(255,255,255,.72);

      box-shadow:
        0 18px 50px rgba(30,33,38,.08),
        inset 0 1px 0 rgba(255,255,255,.75);
    }


    .landing-glass-dark {
      background:
        rgba(255,255,255,.09);

      backdrop-filter:
        blur(18px)
        saturate(140%);

      -webkit-backdrop-filter:
        blur(18px)
        saturate(140%);

      border:
        1px solid rgba(255,255,255,.18);

      box-shadow:
        0 20px 60px rgba(0,0,0,.18),
        inset 0 1px 0 rgba(255,255,255,.10);
    }


    /* =====================================================
       ICON BOX
    ===================================================== */

    .landing-premium-icon {
      transition:
        transform .3s ease,
        background .3s ease,
        color .3s ease;
    }


    @media (hover:hover) {

      .landing-card:hover
      .landing-premium-icon {
        transform:
          translateY(-2px)
          rotate(-3deg);
      }

    }


    /* =====================================================
       SPECIALIZED CARDS
    ===================================================== */

    .landing-specialized-card {
      transition:
        transform .35s cubic-bezier(.2,.8,.2,1),
        box-shadow .35s ease,
        background .35s ease;
    }


    @media (hover:hover) {

      .landing-specialized-card:hover {
        transform:
          translateY(-8px)
          rotateX(1deg);

        box-shadow:
          0 25px 60px rgba(0,0,0,.20);
      }

    }


    /* =====================================================
       CONTACT ITEMS
    ===================================================== */

    .landing-contact-item {
      transition:
        transform .25s ease,
        background .25s ease,
        border-color .25s ease,
        box-shadow .25s ease;
    }


    @media (hover:hover) {

      .landing-contact-item:hover {
        transform:
          translateX(5px);

        background:
          rgba(192,57,43,.035);

        border-color:
          rgba(192,57,43,.20);

        box-shadow:
          0 8px 25px rgba(30,33,38,.05);
      }

    }


    /* =====================================================
       SOCIAL BUTTONS
    ===================================================== */

    .landing-social-button {
      transition:
        transform .25s ease,
        box-shadow .25s ease,
        background .25s ease,
        color .25s ease;
    }


    .landing-social-button:active {
      animation:
        landingBounce .42s ease;
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    .mobile-menu-button {
      display: none !important;

      background: transparent;
      border: none;

      color: white;

      cursor: pointer;

      padding: 8px;

      align-items: center;
      justify-content: center;

      -webkit-tap-highlight-color: transparent;
    }


    .mobile-menu {
      display: none;
    }


    /* =====================================================
       TABLET
    ===================================================== */

    @media (max-width: 900px) {

      .landing-navbar {
        padding-left:
          24px !important;

        padding-right:
          24px !important;
      }


      .landing-section {
        padding-left:
          24px !important;

        padding-right:
          24px !important;
      }


      .landing-contact-section,
      .landing-specialized-section,
      .landing-privacy-section,
      .landing-footer {
        padding-left:
          24px !important;

        padding-right:
          24px !important;
      }


      .landing-hero-content {
        max-width:
          760px !important;
      }

    }


    /* =====================================================
       MOBILE
    ===================================================== */

    @media (max-width: 768px) {

      html {
        scroll-padding-top:
          70px;
      }


      .landing-navbar {
        min-height:
          64px;

        padding:
          10px 15px !important;

        position:
          sticky !important;

        top:
          0;

        left:
          0;

        width:
          100%;

        z-index:
          10000 !important;
      }


      .landing-brand-area {
        gap:
          9px !important;

        min-width:
          0;
      }


      .landing-brand-icon {
        width:
          37px !important;

        min-width:
          37px !important;

        height:
          37px !important;

        border-radius:
          11px !important;
      }


      .landing-brand-name {
        font-size:
          13.5px !important;

        max-width:
          210px;

        overflow:
          hidden;

        text-overflow:
          ellipsis;
      }


      .landing-brand-subtitle {
        display:
          none !important;
      }


      .landing-nav-links {
        gap:
          5px !important;

        margin-left:
          auto;
      }


      .landing-nav-link {
        display:
          none !important;
      }


      .mobile-menu-button {
        display:
          flex !important;

        width:
          42px;

        height:
          42px;

        min-width:
          42px;

        padding:
          0 !important;

        margin:
          0;

        border-radius:
          11px;

        position:
          relative;

        z-index:
          10002;
      }


      .mobile-menu-button:hover {
        background:
          rgba(255,255,255,.10);
      }


      .mobile-menu-button:active {
        background:
          rgba(255,255,255,.16);

        animation:
          landingBounce .42s ease;
      }


      .landing-user-icon {
        width:
          27px !important;

        height:
          27px !important;
      }


      .mobile-menu {
        position:
          absolute !important;

        top:
          100% !important;

        left:
          10px !important;

        right:
          10px !important;

        width:
          auto !important;

        display:
          flex !important;

        flex-direction:
          column;

        padding:
          10px;

        border-radius:
          0 0 18px 18px;

        background:
          rgba(82,24,20,.92);

        backdrop-filter:
          blur(22px)
          saturate(140%);

        -webkit-backdrop-filter:
          blur(22px)
          saturate(140%);

        border:
          1px solid rgba(255,255,255,.13);

        box-shadow:
          0 25px 60px rgba(0,0,0,.28);

        z-index:
          10001 !important;
      }


      .mobile-menu a,
      .mobile-menu button {
        width:
          100%;

        min-height:
          49px;

        padding:
          12px 14px;

        margin-top:
          4px;

        border:
          0;

        border-radius:
          11px;

        background:
          transparent;

        color:
          #ffffff;

        text-decoration:
          none;

        text-align:
          left;

        font-size:
          14px;

        font-weight:
          700;

        cursor:
          pointer;

        display:
          flex;

        align-items:
          center;
      }


      .mobile-menu a:hover,
      .mobile-menu button:hover {
        background:
          rgba(255,255,255,.10);
      }


      .mobile-menu a:active,
      .mobile-menu button:active {
        background:
          rgba(255,255,255,.17);

        animation:
          landingBounce .42s ease;
      }


      .landing-account-dropdown {
        top:
          60px !important;

        right:
          12px !important;

        width:
          180px !important;

        border-radius:
          15px !important;

        z-index:
          10001 !important;
      }


      /* =================================================
         HERO — MOBILE
      ================================================= */

      .landing-hero {
        min-height:
          82svh !important;

        min-height:
          82vh !important;
      }


      .landing-hero-image {
        background-position:
          center center !important;
      }


      .landing-hero-overlay {
        background:
          linear-gradient(
            180deg,
            rgba(0,0,0,.74),
            rgba(0,0,0,.66),
            rgba(89,20,15,.52)
          ) !important;
      }


      .landing-hero-content {
        width:
          100%;

        max-width:
          100% !important;

        padding:
          52px 18px !important;

        animation:
          none;
      }


      .landing-hero-badge {
        max-width:
          100%;

        padding:
          7px 11px !important;

        font-size:
          9.5px !important;

        line-height:
          1.4;

        margin-bottom:
          18px !important;
      }


      .landing-hero-title {
        font-size:
          clamp(32px, 10vw, 46px) !important;

        line-height:
          1.08 !important;

        letter-spacing:
          -1.5px !important;
      }


      .landing-hero-description {
        margin-top:
          18px !important;

        font-size:
          13.5px !important;

        line-height:
          1.75 !important;
      }


      .landing-hero-buttons {
        flex-direction:
          column !important;

        width:
          100%;

        gap:
          10px !important;

        margin-top:
          25px !important;
      }


      .landing-cta,
      .landing-secondary-cta {
        width:
          100% !important;

        max-width:
          330px;

        min-height:
          48px;

        padding:
          12px 18px !important;

        font-size:
          13.5px !important;
      }


      /* =================================================
         SECTIONS — MOBILE
      ================================================= */

      .landing-section,
      .landing-section-alt,
      .landing-contact-section,
      .landing-specialized-section,
      .landing-privacy-section {
        padding:
          66px 17px !important;
      }


      .landing-section-eyebrow {
        font-size:
          9.5px !important;

        letter-spacing:
          1.8px !important;
      }


      .landing-section-title,
      .landing-section-title-white {
        font-size:
          clamp(25px, 7.5vw, 34px) !important;

        line-height:
          1.15 !important;
      }


      .landing-section-intro,
      .landing-specialized-intro {
        font-size:
          13.5px !important;

        line-height:
          1.72 !important;

        margin-top:
          15px !important;
      }


      /* =================================================
         CONTACT — MOBILE
      ================================================= */

      .landing-contact-grid {
        grid-template-columns:
          1fr !important;

        gap:
          30px !important;

        margin-top:
          32px !important;
      }


      .landing-contact-heading {
        font-size:
          22px !important;
      }


      .landing-contact-description {
        font-size:
          13px !important;

        line-height:
          1.7 !important;
      }


      .landing-hours-card {
        margin-top:
          20px !important;

        padding:
          17px !important;

        gap:
          12px !important;
      }


      .landing-hours-icon {
        width:
          41px !important;

        min-width:
          41px !important;

        height:
          41px !important;
      }


      .landing-contact-details {
        gap:
          9px !important;
      }


      .landing-contact-item {
        padding:
          14px !important;

        gap:
          12px !important;
      }


      .landing-contact-icon {
        width:
          37px !important;

        min-width:
          37px !important;

        height:
          37px !important;
      }


      .landing-contact-value {
        font-size:
          13px !important;

        line-height:
          1.6 !important;

        overflow-wrap:
          anywhere;
      }


      .landing-social-button {
        width:
          100% !important;

        justify-content:
          center !important;

        margin-top:
          8px !important;
      }


      .landing-quote-box {
        margin-top:
          3px !important;

        padding:
          19px !important;
      }


      .landing-quote-text {
        font-size:
          13px !important;
      }


      /* =================================================
         PRIVACY — MOBILE
      ================================================= */

      .landing-text-block {
        font-size:
          12.8px !important;

        line-height:
          1.75 !important;

        text-align:
          center !important;
      }


      /* =================================================
         FOOTER — MOBILE
      ================================================= */

      .landing-footer {
        padding:
          30px 17px 18px !important;

        padding-bottom:
          calc(
            18px +
            env(safe-area-inset-bottom)
          ) !important;
      }


      .landing-footer-inner {
        flex-direction:
          column !important;

        gap:
          22px !important;
      }


      .landing-footer-title {
        font-size:
          15px !important;
      }


      .landing-footer-text,
      .landing-footer-address {
        font-size:
          12px !important;

        line-height:
          1.6;
      }


      .landing-footer-bottom {
        margin-top:
          23px !important;

        padding-top:
          15px !important;

        line-height:
          1.5;
      }


      /* =================================================
         TOUCH DEVICES
      ================================================= */

      .landing-card:hover {
        transform:
          none;

        box-shadow:
          0 8px 28px rgba(30,33,38,.045);
      }


      .landing-contact-item:hover {
        transform:
          none;
      }


      .landing-specialized-card:hover {
        transform:
          none;
      }

    }

    /* =====================================================
   NAVBAR: HAMBURGER UP TO 1023px (covers landscape phones)
===================================================== */
@media (max-width: 1023px) {

  .landing-navbar {
    min-height: 64px;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    padding-left: max(15px, env(safe-area-inset-left)) !important;
    padding-right: max(15px, env(safe-area-inset-right)) !important;
    position: sticky !important;
    top: 0;
    width: 100%;
    z-index: 10000 !important;
  }

  .landing-brand-area { gap: 9px !important; min-width: 0; }
  .landing-brand-subtitle { display: none !important; }

  .landing-brand-name {
    font-size: 14px !important;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .landing-nav-links { gap: 6px !important; margin-left: auto; }

  /* hide the desktop link pill, show the hamburger */
  .landing-nav-links > nav { display: none !important; }

  .mobile-menu-button {
    display: flex !important;
    width: 42px;
    height: 42px;
    min-width: 42px;
    padding: 0 !important;
    border-radius: 11px;
    position: relative;
    z-index: 10002;
  }

  .mobile-menu {
    position: absolute !important;
    top: 100% !important;
    left: max(10px, env(safe-area-inset-left)) !important;
    right: max(10px, env(safe-area-inset-right)) !important;
    width: auto !important;
    display: flex !important;
    flex-direction: column;
    padding: 10px;
    border-radius: 0 0 18px 18px;
    background: rgba(82,24,20,.94);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
    border: 1px solid rgba(255,255,255,.13);
    box-shadow: 0 25px 60px rgba(0,0,0,.28);
    z-index: 10001 !important;

    /* never taller than the screen; scroll if needed */
    max-height: calc(100vh - 76px);
    max-height: calc(100dvh - 76px);
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-menu a,
  .mobile-menu button {
    width: 100%;
    min-height: 49px;
    padding: 12px 14px;
    margin-top: 4px;
    border: 0;
    border-radius: 11px;
    background: transparent;
    color: #fff;
    text-decoration: none;
    text-align: left;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  .mobile-menu a:active,
  .mobile-menu button:active { background: rgba(255,255,255,.17); }

  .landing-account-dropdown {
    top: 60px !important;
    right: max(12px, env(safe-area-inset-right)) !important;
    width: 200px !important;
    max-height: calc(100dvh - 76px);
    overflow-y: auto;
    z-index: 10001 !important;
  }
}

/* =====================================================
   NAVBAR: COMPACT FOR SHORT LANDSCAPE SCREENS
===================================================== */
@media (max-height: 500px) and (orientation: landscape) {

  html { scroll-padding-top: 58px; }
  section { scroll-margin-top: 60px; }

  .landing-navbar {
    min-height: 50px;
    padding-top: 6px !important;
    padding-bottom: 6px !important;
  }

  .landing-brand-icon {
    width: 34px !important;
    min-width: 34px !important;
    height: 34px !important;
  }

  .landing-brand-name { font-size: 13px !important; }

  .mobile-menu-button {
    width: 38px;
    height: 38px;
    min-width: 38px;
  }

  .mobile-menu { max-height: calc(100dvh - 58px); }

  .mobile-menu a,
  .mobile-menu button {
    min-height: 42px;
    padding: 8px 14px;
    margin-top: 2px;
  }

  .landing-account-dropdown {
    top: 52px !important;
    max-height: calc(100dvh - 62px);
  }
}


    /* =====================================================
       VERY SMALL PHONES
    ===================================================== */

    @media (max-width: 380px) {

      .landing-navbar {
        padding-left:
          11px !important;

        padding-right:
          11px !important;
      }


      .landing-brand-name {
        font-size:
          12.5px !important;

        max-width:
          170px;
      }


      .landing-brand-icon {
        width:
          34px !important;

        min-width:
          34px !important;

        height:
          34px !important;
      }


      .landing-hero-content {
        padding:
          45px 15px !important;
      }


      .landing-hero-title {
        font-size:
          31px !important;
      }


      .landing-hero-description {
        font-size:
          13px !important;
      }


      .landing-section,
      .landing-section-alt,
      .landing-contact-section,
      .landing-specialized-section,
      .landing-privacy-section {
        padding-left:
          14px !important;

        padding-right:
          14px !important;
      }

    }


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    @media (prefers-reduced-motion: reduce) {

      *,
      *::before,
      *::after {
        animation-duration:
          .01ms !important;

        animation-iteration-count:
          1 !important;

        scroll-behavior:
          auto !important;

        transition-duration:
          .01ms !important;
      }

    }

  `

  document.head.appendChild(style)

  return () => {
    document.head.removeChild(style)
  }

}, [])




 // =========================================================
// SERVICES
// =========================================================

const services = [

  {
    icon: <FaBolt />,
    image: '/images/ElectricalDiagnostics.webp',
    title: 'Electrical Diagnostics',
    description:
      'We inspect your vehicle electrical system using diagnostic tools to identify electrical faults, wiring problems, charging issues, and other system failures.'
  },

  {
    icon: <FaWrench />,
    image: '/images/EngineWiringRepair.jpg',
    title: 'Engine Wiring Repair',
    description:
      'We repair damaged, loose, burned, or faulty engine wiring and wiring harnesses to help restore proper electrical connections and vehicle performance.'
  },

  {
    icon: <FaBatteryFull />,
    image: '/images/BatteryAndCharging.jpg',
    title: 'Battery & Charging Systems',
    description:
      'We check batteries, alternators, charging voltage, and related electrical components to help ensure your vehicle starts and operates reliably.'
  },

  {
    icon: <FaCar />,
    image: '/images/FullVehicleInspection.jpg',
    title: 'Full Electrical Wirings Vehicle Inspection',
    description:
      'We inspect important electrical wiring components throughout the vehicle to identify possible problems before they become bigger and more expensive repairs.'
  }

]


  // =========================================================
  // WHY CHOOSE US
  // =========================================================

  const reasons = [
  {
    icon: <FaBolt />,
    image: '/images/FastDiagnostics.jpg',
    title: 'Fast Diagnostics',
    description:
      'We use modern diagnostic equipment to help identify electrical problems efficiently, reducing unnecessary waiting time.'
  },
  {
    icon: <FaTools />,
    image: '/images/SkilledTechnician.webp',
    title: 'Skilled Technicians',
    description:
      'Our technicians handle automotive electrical systems with care, attention to detail, and practical repair experience.'
  },
  {
    icon: <FaCheckCircle />,
    image: '/images/AffordablePrices.jpg',
    title: 'Affordable Pricing',
    description:
      'We aim to provide dependable automotive electrical services at reasonable and competitive prices.'
  },
  {
    icon: <FaShieldAlt />,
    image: '/images/Warranty.webp',
    title: '3-Day Response & 1-Week Service Warranty',
    description:
      'We aim to respond to reported vehicle concerns within 3 days. After a completed repair, eligible services include a 1-week warranty covering the same or related issue addressed during the service.'
  },
  {
    icon: <FaStar />,
    image: '/images/TrustedService.jpg',
    title: 'Trusted Service',
    description:
      'We prioritize reliable workmanship, honest recommendations, and customer satisfaction on every service.'
  },
  {
    title: 'Online Booking',
    icon: <FaCalendarCheck />,
    image: '/images/OnlineBooking.webp',
    description:
      'Book your vehicle service online at your convenience. Choose your preferred service arrangement, provide your vehicle details and service concerns, and select an available appointment schedule. Your booking will be reviewed and confirmed by our team before the service takes place.'
  },
  {
    title: 'Home Service Available',
    icon: <FaHome />,
    image: '/images/HomeService.png',
    description:
      'For services that are suitable for on-site repair, our technicians can provide assistance at your preferred location. Home Service is subject to vehicle condition, service requirements, location suitability, and confirmation. If the requested service cannot be safely or properly performed on-site, you may be advised to bring the vehicle to our shop for further inspection or repair.'
  },
  {
    title: 'Walk-In Booking',
    icon: <FaClipboardList />,
    image: '/images/WalkinBooking.webp',
    description:
      'Customers may visit our shop and ask our staff for assistance with their service appointment, even without an online booking account. Our staff can help arrange the appointment and service details based on availability and service requirements.'
  }
]


  // =========================================================
  // SPECIALIZED SERVICES
  // =========================================================

  const specializedServices = [

    {
      icon: <FaBolt />,
      title: 'Alternator Repair',
      description:
        'Repair and diagnosis of alternator problems that can affect battery charging and your vehicle’s electrical power.',
        image: '/images/alternator.jpeg'

      },

    {
      icon: <FaPowerOff />,
      title: 'Starter Repair',
      description:
        'Diagnosis and repair of starter motor and starting-system problems when your vehicle has difficulty starting.',
      image: '/images/StarterRepair.webp'

    },

    {
      icon: <FaWindowMaximize />,
      title: 'Power Window Motor Repair',
      description:
        'Repair of power window motor and electrical problems that prevent vehicle windows from moving properly.',
        image: '/images/PowerWindowRepair.webp'
    },

    {
      icon: <FaMicrochip />,
      title: 'ECU Repair',
      description:
        'Inspection and repair of Electronic Control Unit problems that may affect important vehicle functions.',
      image: '/images/ECU.jpg'

    },

    {
      icon: <FaCogs />,
      title: 'BCM Repair',
      description:
        'Diagnosis and repair of Body Control Module issues involving electrical features such as lighting, locks, windows, and other body systems.',
      image: '/images/BCM.webp'

    },

    {
      icon: <FaCar />,
      title: 'EPS Module Repair',
      description:
        'Diagnosis and repair of Electronic Power Steering module problems affecting the vehicle’s steering assistance system.',
              image: '/images/EPS.jpg'

    },

    {
      icon: <FaMicrochip />,
      title: 'ECU Programming',
      description:
        'Electronic programming and configuration services for supported vehicle control modules.',
                      image: '/images/ECUProgramming.webp'

    },

    {
      icon: <FaBolt />,
      title: 'Generator Services',
      description:
        'Electrical inspection, troubleshooting, repair, and maintenance services for generators.',
      image: '/images/GeneratorServices.webp'

    }

  ]


  // =========================================================
  // BUSINESS STATUS
  // =========================================================

  const formatTimeDiff = (minutes) => {

    const hrs =
      Math.floor(minutes / 60)

    const mins =
      minutes % 60

    if (hrs > 0) {
      return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`
    }

    return `${mins} min`
  }


  const getBusinessStatus = () => {

    const now =
      new Date()

    const day =
      now.getDay()

    const hour =
      now.getHours()

    const minute =
      now.getMinutes()

    const currentMinutes =
      hour * 60 + minute

    const openMinutes =
      8 * 60

    const closeMinutes =
      18 * 60

    const isSunday =
      day === 0

    const isOpen =
      !isSunday &&
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes


  const currentSeconds = new Date().getSeconds()
const todayIndex = new Date().getDay()   // 0 = Sunday

const formatCountdown = (total) => {
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h} hr ${mm} min ${ss} sec` : `${mm} min ${ss} sec`
}

const GREEN = '#16A34A'
const YELLOW = '#F59E0B'
const RED = '#C0392B'


// OPEN
if (isOpen) {

  const secondsUntilClose =
    (closeMinutes - currentMinutes) * 60 - currentSeconds

  // WARNING: 1 hour or less before closing
  if (secondsUntilClose <= 3600) {
    return {
      isOpen: true,
      isWarning: true,
      statusLabel: 'CLOSING SOON',
      statusText: `Closes in ${formatCountdown(secondsUntilClose)}`,
      statusColor: YELLOW
    }
  }

  // OPEN: only the remaining time
  return {
    isOpen: true,
    isWarning: false,
    statusLabel: 'OPEN NOW',
    statusText: formatCountdown(secondsUntilClose),
    statusColor: GREEN
  }

}


// CLOSED: countdown to the next opening (skips Sundays)
const nowSeconds = currentMinutes * 60 + currentSeconds
const openSeconds = openMinutes * 60

let dayOffset = isSunday ? 1 : openSeconds > nowSeconds ? 0 : 1

if ((todayIndex + dayOffset) % 7 === 0) {
  dayOffset += 1
}

const secondsUntilOpen = dayOffset * 86400 + openSeconds - nowSeconds

return {
  isOpen: false,
  isWarning: false,
  statusLabel: 'CLOSED NOW',
  statusText: formatCountdown(secondsUntilOpen),
  statusColor: RED
}

}


const {
  isOpen,
  isWarning,
  statusLabel,
  statusText,
  statusColor
} = getBusinessStatus()




const [, setTick] = useState(0)

useEffect(() => {
  const timer = setInterval(() => setTick((t) => t + 1), 1000)
  return () => clearInterval(timer)
}, [])
  // =========================================================
  // NAVIGATION STYLE
  // =========================================================

  const navLinkStyle = (section) => ({
    ...styles.navLink,

    color:
      activeSection === section
        ? '#ffffff'
        : '#f5c6c2',

    borderBottom:
      activeSection === section
        ? '2px solid #ffffff'
        : '2px solid transparent'
  })


  // =========================================================
  // CLOSE MOBILE MENU
  // =========================================================

  const closeMobileMenu = () => {
    setShowMobileMenu(false)
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (





    <div style={styles.page}>


{/* =====================================================
    NAVBAR
===================================================== */}

<header
  className="landing-navbar"
  style={styles.navbar}
>

  {/* =====================================================
      BRAND
  ===================================================== */}

  <button
    type="button"
    onClick={scrollToTop}
    className="
      landing-brand-area
      cursor-pointer
      text-left
      transition-all
      duration-300
      hover:opacity-95
      active:scale-[0.99]
    "
    style={{
      ...styles.brandArea,
      border: 'none',
      background: 'transparent',
      padding: 0,
    }}
    aria-label="Return to top"
  >

    <div
      className="
        landing-brand-icon
        landing-bounce
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-white/15
        bg-white/10
        text-white
        shadow-[0_8px_25px_rgba(0,0,0,0.18)]
        backdrop-blur-md
      "
      style={styles.brandIcon}
    >
      <FaBolt size={20} />
    </div>


    <div className="min-w-0">

      <div className="flex items-center gap-2">

        <h3
          className="
            landing-brand-name
            truncate
          "
          style={styles.brandName}
        >
          Alavaren Auto Electrical
        </h3>

      </div>


      <div className="mt-0.5 flex items-center gap-2">

        <span
          className="
            hidden
            h-1.5
            w-1.5
            shrink-0
            rounded-full
            bg-red-400
            shadow-[0_0_8px_rgba(248,113,113,0.75)]
            sm:block
          "
        />

        <p
          className="
            landing-brand-subtitle
            truncate
          "
          style={styles.brandSubtitle}
        >
          Professional Automotive Electrical Services
        </p>

      </div>

    </div>

  </button>


  {/* =====================================================
      NAVIGATION
  ===================================================== */}

  <div
    className="
      landing-nav-links
      flex
      items-center
      gap-1
      sm:gap-2
    "
    style={styles.navLinks}
  >

    {/* ===================================================
        DESKTOP NAV LINKS
    =================================================== */}

    <nav
      className="
        hidden
        items-center
        gap-1
        rounded-2xl
        border
        border-white/10
        bg-white/[0.045]
        p-1
        backdrop-blur-md
        md:flex
      "
      aria-label="Main navigation"
    >

      {/* ABOUT */}

      <a
        href="#about"
        className="
          landing-nav-link
          group
          relative
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2.5
          text-sm
          font-semibold
          transition-all
          duration-300
        "
        style={navLinkStyle('about')}
        onClick={closeMobileMenu}
      >

        <FaShieldAlt
          className="
            text-[12px]
            opacity-70
            transition
            group-hover:opacity-100
          "
        />

        <span>About</span>

      </a>


      {/* SERVICES */}

      <a
        href="#services"
        className="
          landing-nav-link
          group
          relative
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2.5
          text-sm
          font-semibold
          transition-all
          duration-300
        "
        style={navLinkStyle('services')}
        onClick={closeMobileMenu}
      >

        <FaTools
          className="
            text-[12px]
            opacity-70
            transition
            group-hover:opacity-100
          "
        />

        <span>Services</span>

      </a>


      {/* HOW IT WORKS */}

      <a
        href="#how-it-works"
        className="
          landing-nav-link
          group
          relative
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2.5
          text-sm
          font-semibold
          transition-all
          duration-300
        "
        style={navLinkStyle('how-it-works')}
        onClick={closeMobileMenu}
      >

        <FaRoute
          className="
            text-[12px]
            opacity-70
            transition
            group-hover:opacity-100
          "
        />

        <span>How It Works</span>

      </a>


      {/* CONTACT */}

      <a
        href="#contact"
        className="
          landing-nav-link
          group
          relative
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2.5
          text-sm
          font-semibold
          transition-all
          duration-300
        "
        style={navLinkStyle('contact')}
        onClick={closeMobileMenu}
      >

        <FaPhone
          className="
            text-[12px]
            opacity-70
            transition
            group-hover:opacity-100
          "
        />

        <span>Contact</span>

      </a>

    </nav>


    {/* ===================================================
        MOBILE MENU BUTTON
    =================================================== */}

    <button
      type="button"
      className="
        mobile-menu-button
        landing-bounce
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-white/15
        bg-white/10
        text-white
        shadow-[0_6px_18px_rgba(0,0,0,0.14)]
        backdrop-blur-md
        transition-all
        duration-300
        hover:border-white/25
        hover:bg-white/15
        md:hidden
      "
      onClick={() =>
        setShowMobileMenu(prev => !prev)
      }
      aria-label="Toggle navigation menu"
      aria-expanded={showMobileMenu}
      aria-controls="mobile-navigation"
    >

      {showMobileMenu
        ? <FaTimes size={19} />
        : <FaBars size={19} />
      }

    </button>


    {/* ===================================================
        ACCOUNT BUTTON
    =================================================== */}

    <div
      className="
        landing-account-wrap
        relative
      "
      style={styles.userIconWrap}
    >

      <button
        type="button"
        onClick={() =>
          setShowAccount(!showAccount)
        }
        aria-label="Open account menu"
        aria-expanded={showAccount}
        className="
          landing-user-button
          landing-clickable
          group
          flex
          h-10
          items-center
          gap-2
          rounded-xl
          border
          border-white/15
          bg-white/10
          px-2.5
          text-white
          shadow-[0_6px_18px_rgba(0,0,0,0.14)]
          backdrop-blur-md
          transition-all
          duration-300
          hover:border-white/25
          hover:bg-white/15
          active:scale-[0.97]
        "
      >

        <span
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-lg
            bg-white/10
          "
        >
          <FaUserCircle size={21} />
        </span>


        <span
          className="
            hidden
            text-xs
            font-bold
            sm:block
          "
        >
          Account
        </span>

      </button>

    </div>

  </div>


  {/* =====================================================
      MOBILE MENU
  ===================================================== */}

  {showMobileMenu && (

    <div
      id="mobile-navigation"
      className="
        mobile-menu
        md:hidden
      "
    >

      {/* ABOUT */}

      <a
        href="#about"
        onClick={closeMobileMenu}
      >
        <FaShieldAlt style={{ marginRight: 10 }} />
        About
      </a>


      {/* SERVICES */}

      <a
        href="#services"
        onClick={closeMobileMenu}
      >
        <FaTools style={{ marginRight: 10 }} />
        Services
      </a>


      {/* HOW IT WORKS */}

      <a
        href="#how-it-works"
        onClick={closeMobileMenu}
      >
        <FaRoute style={{ marginRight: 10 }} />
        How It Works
      </a>


      {/* CONTACT */}

      <a
        href="#contact"
        onClick={closeMobileMenu}
      >
        <FaPhone style={{ marginRight: 10 }} />
        Contact
      </a>


      {/* ACCOUNT */}

      <button
        type="button"
        onClick={() => {
          closeMobileMenu()
          setShowAccount(true)
        }}
      >
        <FaUserCircle style={{ marginRight: 10 }} />
        My Account
      </button>

    </div>

  )}


  {/* =====================================================
      ACCOUNT DROPDOWN
  ===================================================== */}

  {showAccount && (

    <div
      className="
        landing-account-dropdown
        absolute
        right-0
        top-[calc(100%+12px)]
        z-[70]
        w-[260px]
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-slate-950/95
        shadow-[0_20px_45px_rgba(0,0,0,0.35)]
        backdrop-blur-xl
      "
      style={styles.accountDropdown}
    >

      {/* SMALL TOP ACCENT */}

      <div
        className="
          h-[2px]
          w-full
          bg-red-600
        "
      />


      {/* ACCOUNT HEADER */}

      <div
  className="
    flex
    items-center
    gap-3
    border-b
    border-slate-200
    px-4
    py-4
  "
>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-red-500/20
            bg-red-600/10
            text-red-400
          "
        >
          <FaUserCircle size={21} />
        </div>


        <div className="min-w-0">

          <p
  className="
    text-sm
    font-bold
    leading-tight
    text-slate-900
  "
>
  My Account
</p>

        </div>

      </div>


      {/* ACCOUNT ACTION */}

      <div className="p-2">

        <button
          type="button"
          onClick={() =>
            navigate('/login')
          }
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            border
            border-transparent
            bg-white/[0.04]
            px-3
            py-3
            text-left
            transition-all
            duration-300
            hover:border-red-500/20
            hover:bg-red-600/10
            active:scale-[0.98]
          "
          style={styles.dropdownBtn}
        >

          <span
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-white/[0.06]
              text-slate-300
              transition-colors
              duration-300
              group-hover:bg-red-600/15
              group-hover:text-red-400
            "
          >
            <FaUserCircle size={18} />
          </span>


          <span
            className="
              flex-1
              text-sm
              font-semibold
              text-slate-200
              transition-colors
              duration-300
              group-hover:text-white
            "
          >
            Sign In
          </span>


          <span
            className="
              text-sm
              font-medium
              text-slate-500
              transition-all
              duration-300
              group-hover:translate-x-0.5
              group-hover:text-red-400
            "
          >
            →
          </span>

        </button>

      </div>

    </div>

  )}

</header>


{/* =====================================================
    BACK TO TOP
    LEFT SIDE
===================================================== */}

<button
  type="button"
  onClick={scrollToTop}
  aria-label="Back to top"
  title="Back to top"
  className={`
    landing-back-to-top
    group
    fixed
    bottom-5
    left-5
    z-[60]
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-xl
    border
    border-white/15
    bg-slate-950/85
    text-white
    shadow-[0_10px_30px_rgba(0,0,0,0.25)]
    backdrop-blur-xl
    transition-all
    duration-300
    hover:border-red-500/40
    hover:bg-red-600
    hover:shadow-[0_12px_30px_rgba(192,57,43,0.30)]
    active:scale-90
    md:bottom-7
    md:left-7
    ${
      showBackToTop
        ? 'translate-y-0 opacity-100 pointer-events-auto'
        : 'translate-y-4 opacity-0 pointer-events-none'
    }
  `}
>
  <FaArrowUp
    size={16}
    className="
      transition-transform
      duration-300
      group-hover:-translate-y-0.5
    "
  />
</button>













      {/* =====================================================
    HERO — MODERN SPLIT LAYOUT
===================================================== */}

<section
  className="landing-hero relative min-h-[720px] overflow-hidden"
  style={{
    ...styles.heroWrapper,
    background: '#ffffff',
  }}
>

  {/* ===================================================
    FULL-WIDTH HERO PHOTO (crossfade kept)
=================================================== */}

<div className="absolute inset-0 z-0 isolate overflow-hidden bg-black">
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={layerStyle('A', layerA)}
  />
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={layerStyle('B', layerB)}
  />
</div>


{/* ===================================================
    PHOTO DARKENING (keeps white text readable)
=================================================== */}

<div
  className="absolute inset-0 z-[1]"
  style={{
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.50) 100%)',
  }}
/>

 


 {/* ===================================================
    HERO CONTENT
=================================================== */}

<div className="relative z-[10] flex min-h-[720px] w-full flex-col">

  {/* =================================================
      GLASS BAND (badge + title only)
  ================================================= */}

  <div
    className="
  flex
  min-h-[340px]
  w-full
  flex-col
  items-center
  justify-center
  rounded-b-[32px]
  border-b
  border-white/40
  bg-white/20
  px-6
  pb-14
  pt-10
  text-center
  shadow-[0_20px_60px_rgba(0,0,0,0.18)]
  backdrop-blur-[3px]
  sm:px-10
  lg:px-14
"
    style={{
      transform: heroVisible
        ? 'translate3d(0, 0, 0)'
        : 'translate3d(0, -40px, 0)',
      opacity: heroVisible ? 1 : 0,
      transition:
        'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 650ms ease-out',
    }}
  >

    {/* BADGE */}

    <div
      className="
        mb-5
        inline-flex
        items-center
        gap-2.5
        rounded-full
        border
        border-red-700/30
        bg-white/60
        px-4
        py-2.5
        text-xs
        font-black
        uppercase
        tracking-[0.12em]
        text-red-700
        shadow-sm
        backdrop-blur-md
      "
    >
      <span className="h-2 w-2 rounded-full bg-red-700" />
      <FaShieldAlt />
      Professional Auto Electrical Services
    </div>


    {/* MAIN TITLE */}

<h1
  className="
    mx-auto
    max-w-[1200px]
    text-center
    text-[clamp(1.75rem,4.4vw,3.75rem)]
    font-black
    leading-[1.05]
    tracking-[-0.05em]
    text-white
  "
  style={{ textShadow: '0 3px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)' }}
>
  <span className="md:whitespace-nowrap">
    Reliable Auto Electrical Services
  </span>

  <span className="mt-2 block">
    You Can Trust
  </span>
</h1>

  </div>


  {/* =================================================
      CONTENT ON THE PHOTO (outside the glass)
  ================================================= */}

  <div
    className="
      mx-auto
      flex
      w-full
      max-w-[900px]
      flex-1
      flex-col
      items-center
      justify-center
      px-6
      py-12
      text-center
      sm:px-10
    "
    style={{
      transform: heroVisible
        ? 'translate3d(0, 0, 0)'
        : 'translate3d(0, 40px, 0)',
      opacity: heroVisible ? 1 : 0,
      transition:
        'transform 1000ms cubic-bezier(0.16,1,0.3,1) 150ms, opacity 650ms ease-out 150ms',
    }}
  >

    {/* DESCRIPTION */}

    <p
      className="
        max-w-[600px]
        text-center
        text-base
        font-medium
        leading-7
        text-white
        sm:text-lg
        sm:leading-8
      "
      style={{ textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
    >
      Professional diagnostics, repairs, programming,
      and maintenance for your vehicle's electrical systems —
      with practical service designed around your vehicle's needs.
    </p>


    {/* ACTION BUTTONS */}

    <div
      className="
        mt-8
        flex
        flex-col
        items-center
        justify-center
        gap-3
        sm:flex-row
      "
    >

      <button
        type="button"
        onClick={() => navigate('/choose-role')}
        className="
          group
          inline-flex
          items-center
          justify-center
          gap-3
          rounded-2xl
          bg-white
          px-7
          py-4
          text-sm
          font-black
          text-red-800
          shadow-[0_12px_35px_rgba(0,0,0,0.20)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-red-50
          hover:shadow-[0_18px_40px_rgba(0,0,0,0.28)]
          active:translate-y-0
        "
      >
        Book Appointment

        <FaArrowRight
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </button>

      <a
        href="#services"
        className="
          inline-flex
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-white/35
          bg-white/10
          px-7
          py-4
          text-sm
          font-black
          text-white
          backdrop-blur-md
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-white/60
          hover:bg-white/20
        "
      >
        <FaTools />
        Explore Services
      </a>

    </div>


    {/* TRUST INDICATORS */}

    <div
      className="
        mt-9
        flex
        flex-wrap
        items-center
        justify-center
        gap-x-6
        gap-y-3
        text-xs
        font-bold
        text-white/90
      "
      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.45)' }}
    >
      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Electrical Diagnostics
      </span>

      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Repair & Maintenance
      </span>

      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Shop & On-Site Service
      </span>
    </div>

  </div>

</div>
</section>








      {/* =====================================================
          ABOUT
      ===================================================== */}

<section
  ref={aboutSectionRef}
  id="about"
  className="landing-section"
  style={{
    ...styles.section,
    position: 'relative',
    overflow: 'hidden'
  }}
>

  <div className="landing-wave landing-wave-red" />

{/* =====================================================
    SECTION HEADER
===================================================== */}

<div
  className="landing-section-eyebrow"
  style={{
    ...styles.sectionEyebrow,
    opacity: aboutSectionVisible ? 1 : 0,
    transform: aboutSectionVisible
      ? 'translate3d(0, 0, 0)'
      : 'translate3d(-45px, 0, 0)',
    transition:
      'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',
    transitionDelay: aboutSectionVisible ? '0ms' : '0ms',
  }}
>
  ABOUT US
</div>

<h2
  className="
    landing-section-title
    !font-black
    tracking-[-0.035em]
  "
  style={{
    ...styles.sectionTitle,
    opacity: aboutSectionVisible ? 1 : 0,
    transform: aboutSectionVisible
      ? 'translate3d(0, 0, 0)'
      : 'translate3d(-65px, 0, 0)',
    transition:
      'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease-out',
    transitionDelay: aboutSectionVisible ? '120ms' : '0ms',
  }}
>
  Automotive Electrical Specialists
</h2>

<p
  className="landing-section-intro"
  style={{
    ...styles.sectionIntro,
    opacity: aboutSectionVisible ? 1 : 0,
    transform: aboutSectionVisible
      ? 'translate3d(0, 0, 0)'
      : 'translate3d(-45px, 0, 0)',
    transition:
      'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
    transitionDelay: aboutSectionVisible ? '240ms' : '0ms',
  }}
>
  Alavaren Auto Electrical Services is dedicated to
  providing dependable automotive electrical solutions
  with precision, practical expertise, and customer-focused
  service.
</p>


{/* =====================================================
    ABOUT CARDS
===================================================== */}

<div
  className="landing-about-grid"
  style={styles.aboutGrid}
>

    {/* ===================================================
        CARD 01 — ELECTRICAL EXPERTISE
    =================================================== */}

    <div
      className={`
        landing-card
        landing-about-card
        group
        relative
        min-h-[320px]
        overflow-hidden
        rounded-[24px]
        border
        border-white/10
        transform-gpu
        will-change-transform
        transition-transform
        duration-700
        ${
          aboutSectionVisible
            ? 'translate-x-0'
            : '-translate-x-16'
        }
      `}
      style={{
        ...styles.aboutCard,
        background: 'transparent',
        transition:
          'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease-out',
        transitionDelay: '0ms',
        opacity: aboutSectionVisible ? 1 : 0,
      }}
    >

      {/* BACKGROUND IMAGE */}

      <img
  src="/images/ElectricalExpertise.webp"
  alt="Electrical Expertise"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-transform
          duration-500
          ease-out
          will-change-transform
          group-hover:scale-110
        "
      />


      {/* DARK GRADIENT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-black/55
          to-black/20
        "
      />


      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[320px]
          h-full
          flex-col
          justify-between
          p-6
        "
      >

        {/* TOP */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-white/15
              text-xl
              text-white
              backdrop-blur-md
              ring-1
              ring-white/20
              transition-transform
              duration-300
              group-hover:-translate-y-1
            "
          >
            <FaBolt />
          </div>


          {/* NUMBER */}

          <div
            className="
              text-sm
              font-black
              tracking-[0.2em]
              text-white/70
            "
          >
            01
          </div>

        </div>


        {/* BOTTOM */}

        <div>

          <h3
            className="
              text-xl
              font-black
              tracking-tight
              text-white
              sm:text-2xl
            "
          >
            Electrical Expertise
          </h3>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-white/80
            "
          >
            We focus on diagnosing and repairing electrical
            problems that affect your vehicle's performance,
            reliability, and convenience.
          </p>

        </div>

      </div>

    </div>


    {/* ===================================================
        CARD 02 — RELIABLE WORKMANSHIP
    =================================================== */}

    <div
      className={`
        landing-card
        landing-about-card
        group
        relative
        min-h-[320px]
        overflow-hidden
        rounded-[24px]
        border
        border-white/10
        transform-gpu
        will-change-transform
        transition-transform
        duration-700
        ${
          aboutSectionVisible
            ? 'translate-y-0'
            : 'translate-y-16'
        }
      `}
      style={{
        ...styles.aboutCard,
        background: 'transparent',
        transition:
          'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease-out',
        transitionDelay: '100ms',
        opacity: aboutSectionVisible ? 1 : 0,
      }}
    >

      {/* BACKGROUND IMAGE */}

      <img
        src="/images/ReliableWorkManship.jpg"
        alt="Reliable Workmanship"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-transform
          duration-500
          ease-out
          will-change-transform
          group-hover:scale-110
        "
      />


      {/* DARK GRADIENT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-black/55
          to-black/20
        "
      />


      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[320px]
          h-full
          flex-col
          justify-between
          p-6
        "
      >

        {/* TOP */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-white/15
              text-xl
              text-white
              backdrop-blur-md
              ring-1
              ring-white/20
              transition-transform
              duration-300
              group-hover:-translate-y-1
            "
          >
            <FaWrench />
          </div>


          {/* NUMBER */}

          <div
            className="
              text-sm
              font-black
              tracking-[0.2em]
              text-white/70
            "
          >
            02
          </div>

        </div>


        {/* BOTTOM */}

        <div>

          <h3
            className="
              text-xl
              font-black
              tracking-tight
              text-white
              sm:text-2xl
            "
          >
            Reliable Workmanship
          </h3>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-white/80
            "
          >
            Every service is approached with attention to
            detail and the goal of providing a dependable
            repair solution.
          </p>

        </div>

      </div>

    </div>


    {/* ===================================================
        CARD 03 — CUSTOMER FIRST
    =================================================== */}

    <div
      className={`
        landing-card
        landing-about-card
        group
        relative
        min-h-[320px]
        overflow-hidden
        rounded-[24px]
        border
        border-white/10
        transform-gpu
        will-change-transform
        transition-transform
        duration-700
        ${
          aboutSectionVisible
            ? 'translate-x-0'
            : 'translate-x-16'
        }
      `}
      style={{
        ...styles.aboutCard,
        background: 'transparent',
        transition:
          'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 400ms ease-out',
        transitionDelay: '200ms',
        opacity: aboutSectionVisible ? 1 : 0,
      }}
    >

      {/* BACKGROUND IMAGE */}

      <img
        src="/images/CustomerFirst.webp"
        alt="Customer First"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          transition-transform
          duration-500
          ease-out
          will-change-transform
          group-hover:scale-110
        "
      />


      {/* DARK GRADIENT */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black/90
          via-black/55
          to-black/20
        "
      />


      {/* CONTENT */}

      <div
        className="
          relative
          z-10
          flex
          min-h-[320px]
          h-full
          flex-col
          justify-between
          p-6
        "
      >

        {/* TOP */}

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-white/15
              text-xl
              text-white
              backdrop-blur-md
              ring-1
              ring-white/20
              transition-transform
              duration-300
              group-hover:-translate-y-1
            "
          >
            <FaCar />
          </div>


          {/* NUMBER */}

          <div
            className="
              text-sm
              font-black
              tracking-[0.2em]
              text-white/70
            "
          >
            03
          </div>

        </div>


        {/* BOTTOM */}

        <div>

          <h3
            className="
              text-xl
              font-black
              tracking-tight
              text-white
              sm:text-2xl
            "
          >
            Customer First
          </h3>


          <p
            className="
              mt-3
              text-sm
              leading-6
              text-white/80
            "
          >
            We aim to make automotive electrical service
            straightforward, professional, and convenient
            for every customer.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* =====================================================
    ALAVAREN EXPERIENCE / TRUST STATS
===================================================== */}

<section
  id="alavaren-stats"
  className="
    relative
    overflow-hidden
    bg-white
    px-5
    py-8
    sm:px-8
    sm:py-10
    lg:py-12
  "
>

  {/* ================================================
      SOFT BACKGROUND ACCENTS
  ================================================ */}

  <div
    className="
      pointer-events-none
      absolute
      -left-24
      top-1/2
      h-64
      w-64
      -translate-y-1/2
      rounded-full
      bg-red-100/50
      blur-3xl
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -right-24
      top-1/2
      h-64
      w-64
      -translate-y-1/2
      rounded-full
      bg-red-50
      blur-3xl
    "
  />


  {/* ================================================
      MAIN PANEL
  ================================================ */}

  <div
    className={`
      relative
      mx-auto
      max-w-6xl
      overflow-hidden
      rounded-[28px]
      border
      border-red-100
      bg-gradient-to-br
      from-red-50
      via-white
      to-red-50/70
      shadow-[0_18px_50px_rgba(153,27,27,0.08)]
      transition-all
      duration-700
      ease-[cubic-bezier(0.16,1,0.3,1)]
      ${
        statsVisible
          ? 'translate-y-0 scale-100 opacity-100'
          : 'translate-y-5 scale-[0.97] opacity-0'
      }
    `}
  >

    {/* ==============================================
        TOP RED ACCENT
    ============================================== */}

    <div
      className={`
        absolute
        left-1/2
        top-0
        h-1
        -translate-x-1/2
        rounded-b-full
        bg-red-700
        transition-all
        duration-700
        ease-[cubic-bezier(0.16,1,0.3,1)]
        ${
          statsVisible
            ? 'w-32 opacity-100'
            : 'w-0 opacity-0'
        }
      `}
    />


    {/* ==============================================
        HEADER
    ============================================== */}

    <div
      className={`
        relative
        z-10
        px-6
        pb-5
        pt-8
        text-center
        sm:px-10
        sm:pt-10
      `}
    >

      <div
        className={`
          mb-2
          text-[10px]
          font-black
          uppercase
          tracking-[0.25em]
          text-red-700
          transition-all
          duration-700
          ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }
        `}
      >
        A QUICK LOOK AT ALAVAREN
      </div>

      <h2
        className={`
          text-xl
          font-black
          tracking-[-0.025em]
          text-slate-900
          sm:text-2xl
          ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          }
        `}
        style={{
          transition:
            'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',
          transitionDelay: statsVisible ? '80ms' : '0ms',
        }}
      >
        Experience You Can See. Service You Can Trust.
      </h2>

    </div>


    {/* ==============================================
        STATISTICS
    ============================================== */}

    <div
      className="
        relative
        z-10
        grid
        grid-cols-1
        divide-y
        divide-red-100
        px-5
        pb-6
        sm:grid-cols-3
        sm:divide-x
        sm:divide-y-0
        sm:px-6
        sm:pb-8
      "
    >

      {/* ============================================
          STAT 1 — EXPERIENCE
      ============================================ */}

      <div
        className={`
          group
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-6
          text-center
          transition-all
          duration-700
          ease-[cubic-bezier(0.16,1,0.3,1)]
          sm:py-5
          ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }
        `}
        style={{
          transitionDelay: statsVisible ? '180ms' : '0ms',
        }}
      >

        <div
          className="
            mb-3
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-red-100
            bg-white
            text-red-700
            shadow-[0_6px_18px_rgba(153,27,27,0.08)]
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:bg-red-700
            group-hover:text-white
          "
        >
          <FaAward size={19} />
        </div>

        <div
          className="
            text-[clamp(2.3rem,5vw,3.3rem)]
            font-black
            leading-none
            tracking-[-0.06em]
            text-slate-900
          "
        >
          18+
        </div>

        <div
          className={`
            mt-2
            h-0.5
            rounded-full
            bg-red-700
            transition-all
            duration-700
            ${
              statsVisible
                ? 'w-8'
                : 'w-0'
            }
          `}
          style={{
            transitionDelay: statsVisible ? '450ms' : '0ms',
          }}
        />

        <p
          className="
            mt-2
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-slate-500
            sm:text-xs
          "
        >
          Years of Experience
        </p>

      </div>


      {/* ============================================
          STAT 2 — VEHICLES
      ============================================ */}

      <div
        className={`
          group
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-6
          text-center
          transition-all
          duration-700
          ease-[cubic-bezier(0.16,1,0.3,1)]
          sm:py-5
          ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }
        `}
        style={{
          transitionDelay: statsVisible ? '300ms' : '0ms',
        }}
      >

        <div
          className="
            mb-3
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-red-100
            bg-white
            text-red-700
            shadow-[0_6px_18px_rgba(153,27,27,0.08)]
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:bg-red-700
            group-hover:text-white
          "
        >
          <FaCar size={19} />
        </div>

        <div
          className="
            text-[clamp(2.3rem,5vw,3.3rem)]
            font-black
            leading-none
            tracking-[-0.06em]
            text-slate-900
          "
        >
          3000+
        </div>

        <div
          className={`
            mt-2
            h-0.5
            rounded-full
            bg-red-700
            transition-all
            duration-700
            ${
              statsVisible
                ? 'w-8'
                : 'w-0'
            }
          `}
          style={{
            transitionDelay: statsVisible ? '570ms' : '0ms',
          }}
        />

        <p
          className="
            mt-2
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-slate-500
            sm:text-xs
          "
        >
          Vehicles Serviced
        </p>

      </div>


      {/* ============================================
          STAT 3 — COMMITMENT
      ============================================ */}

      <div
        className={`
          group
          flex
          flex-col
          items-center
          justify-center
          px-5
          py-6
          text-center
          transition-all
          duration-700
          ease-[cubic-bezier(0.16,1,0.3,1)]
          sm:py-5
          ${
            statsVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }
        `}
        style={{
          transitionDelay: statsVisible ? '420ms' : '0ms',
        }}
      >

        <div
          className="
            mb-3
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            border
            border-red-100
            bg-white
            text-red-700
            shadow-[0_6px_18px_rgba(153,27,27,0.08)]
            transition-all
            duration-300
            group-hover:-translate-y-1
            group-hover:bg-red-700
            group-hover:text-white
          "
        >
          <FaHandshake size={19} />
        </div>

        <div
          className="
            text-[clamp(2.3rem,5vw,3.3rem)]
            font-black
            leading-none
            tracking-[-0.06em]
            text-slate-900
          "
        >
          100%
        </div>

        <div
          className={`
            mt-2
            h-0.5
            rounded-full
            bg-red-700
            transition-all
            duration-700
            ${
              statsVisible
                ? 'w-8'
                : 'w-0'
            }
          `}
          style={{
            transitionDelay: statsVisible ? '690ms' : '0ms',
          }}
        />

        <p
          className="
            mt-2
            text-[10px]
            font-black
            uppercase
            tracking-[0.18em]
            text-slate-500
            sm:text-xs
          "
        >
          Service Commitment
        </p>

      </div>

    </div>


    {/* ==============================================
        BOTTOM GLOW
    ============================================== */}

    <div
      className={`
        pointer-events-none
        absolute
        bottom-0
        left-1/2
        h-20
        w-2/3
        -translate-x-1/2
        rounded-full
        bg-red-200/30
        blur-3xl
        transition-opacity
        duration-1000
        ${
          statsVisible
            ? 'opacity-100'
            : 'opacity-0'
        }
      `}
    />

  </div>

</section>



      
{/* =====================================================
    WHY CHOOSE US
===================================================== */}

<section
  ref={whyChooseRef}
  className="relative overflow-hidden bg-white"
  style={{
    paddingTop: 'clamp(5rem, 9vw, 8rem)',
    paddingBottom: 'clamp(5rem, 9vw, 8rem)'
  }}
>

  {/* =====================================================
      SECTION HEADER
  ===================================================== */}

  <div className="mx-auto max-w-6xl px-5 sm:px-8">

    <div
      className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-red-700 sm:text-sm"
      style={{
        opacity: whyChooseVisible ? 1 : 0,
        transform: whyChooseVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(-45px,0,0)',
        transition:
          'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
      }}
    >
      WHY CHOOSE US
    </div>


    <h2
      className="
        max-w-4xl
        text-[clamp(2.2rem,5vw,4.5rem)]
        font-black
        uppercase
        leading-[0.95]
        tracking-[-0.055em]
        text-slate-900
      "
      style={{
        opacity: whyChooseVisible ? 1 : 0,
        transform: whyChooseVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(-65px,0,0)',
        transition:
          'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease-out',
        transitionDelay: whyChooseVisible ? '100ms' : '0ms'
      }}
    >
      Service You Can Count On
    </h2>


    <p
      className="
        mt-6
        max-w-2xl
        text-sm
        leading-7
        text-slate-600
        sm:text-base
      "
      style={{
        opacity: whyChooseVisible ? 1 : 0,
        transform: whyChooseVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(-45px,0,0)',
        transition:
          'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
        transitionDelay: whyChooseVisible ? '200ms' : '0ms'
      }}
    >
      From diagnostics to specialized electrical repairs,
      we focus on practical solutions and dependable service.
    </p>

  </div>


  {/* =====================================================
      SERVICE FEATURES
  ===================================================== */}

  <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-8 lg:mt-20">

    {reasons.map((reason, index) => {

      const imageLeft = index % 2 === 0

      return (

       <article
  key={index}
  ref={(element) => {
    whyReasonRefs.current[index] = element
  }}
  data-reason-index={index}
  className="
    relative
    grid
    items-center
    gap-10
    py-12
    sm:py-16
    lg:min-h-[480px]
    lg:grid-cols-2
    lg:gap-16
    lg:py-20
  "
>

          {/* =================================================
              IMAGE
          ================================================= */}

          <div
            className={`
              relative
              h-[280px]
              overflow-hidden
              sm:h-[360px]
              lg:h-[430px]
              ${imageLeft ? 'lg:order-1' : 'lg:order-2'}
            `}
            style={{
  opacity: visibleReasons[index] ? 1 : 0,

  transform: visibleReasons[index]
    ? 'translate3d(0,0,0)'
    : imageLeft
      ? 'translate3d(-90px,0,0)'
      : 'translate3d(90px,0,0)',

  transition:
    'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease-out',

  transitionDelay: visibleReasons[index]
    ? `${index * 80}ms`
    : '0ms',

  clipPath: imageLeft
    ? 'polygon(7% 0,100% 0,93% 100%,0 100%)'
    : 'polygon(0 0,93% 0,100% 100%,7% 100%)'
}}
          >

            <img
              src={reason.image}
              alt={reason.title}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                hover:scale-105
              "
            />


            {/* Image overlay */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/55
                via-black/10
                to-transparent
              "
            />


            {/* Number */}

            <div
              className="
                absolute
                left-6
                top-5
                text-5xl
                font-black
                leading-none
                tracking-[-0.06em]
                text-white/90
                drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]
                sm:left-8
                sm:top-7
                sm:text-6xl
              "
            >
              {String(index + 1).padStart(2, '0')}
            </div>


            {/* Bottom red accent */}

            <div
              className="
                absolute
                bottom-0
                left-0
                h-1.5
                w-28
                bg-red-700
                sm:w-36
              "
            />

          </div>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className={`
              relative
              ${imageLeft ? 'lg:order-2' : 'lg:order-1'}
            `}
           style={{
  opacity: visibleReasons[index] ? 1 : 0,

  transform: visibleReasons[index]
    ? 'translate3d(0,0,0)'
    : imageLeft
      ? 'translate3d(90px,0,0)'
      : 'translate3d(-90px,0,0)',

  transition:
    'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease-out',

  transitionDelay: visibleReasons[index]
    ? `${index * 80 + 120}ms`
    : '0ms'
}}
          >

            {/* Icon */}

            <div
              className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-700
                text-xl
                text-white
                shadow-[0_10px_25px_rgba(153,27,27,0.18)]
              "
            >
              {reason.icon}
            </div>


            {/* Title */}

            <h3
              className="
                max-w-xl
                text-[clamp(1.65rem,3vw,2.5rem)]
                font-black
                leading-[1.05]
                tracking-[-0.04em]
                text-slate-900
              "
            >
              {reason.title}
            </h3>


            {/* Automotive divider */}

            <div
              className="
                my-6
                h-1.5
                w-20
                bg-red-700
              "
              style={{
                clipPath:
                  'polygon(0 0,100% 0,82% 100%,0 100%)'
              }}
            />


            {/* Description */}

            <p
              className="
                max-w-xl
                text-sm
                leading-7
                text-slate-600
                sm:text-base
                sm:leading-8
              "
            >
              {reason.description}
            </p>


            {/* Small feature indicator */}

            <div
              className="
                mt-7
                flex
                items-center
                gap-3
                text-[11px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-700" />

              <span>
                Alavaren Auto Electrical Services
              </span>
            </div>

          </div>

        </article>

      )

    })}

  </div>

</section>












      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <div style={styles.sectionDivider} />


      {/* =====================================================
    SERVICES
===================================================== */}

<section
  ref={servicesSectionRef}
  id="services"
  className="relative overflow-hidden bg-white"
  style={{
    paddingTop: 'clamp(5rem, 9vw, 8rem)',
    paddingBottom: 'clamp(5rem, 9vw, 8rem)'
  }}
>

  {/* =====================================================
      SECTION HEADER
  ===================================================== */}

  <div className="mx-auto max-w-6xl px-5 sm:px-8">

    {/* EYEBROW */}
    <div
      className="
        mb-4
        text-right
        text-xs
        font-black
        uppercase
        tracking-[0.22em]
        text-red-700
        sm:text-sm
      "
      style={{
        opacity: servicesSectionVisible ? 1 : 0,

        transform: servicesSectionVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(45px,0,0)',

        transition:
          'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
      }}
    >
      OUR SERVICES
    </div>


    {/* TITLE */}
    <h2
      className="
        ml-auto
        max-w-5xl
        text-right
        text-[clamp(2.2rem,5vw,4.5rem)]
        font-black
        uppercase
        leading-[0.95]
        tracking-[-0.055em]
        text-slate-900
      "
      style={{
        opacity: servicesSectionVisible ? 1 : 0,

        transform: servicesSectionVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(65px,0,0)',

        transition:
          'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease-out',

        transitionDelay:
          servicesSectionVisible ? '100ms' : '0ms'
      }}
    >
      Professional Vehicle Electrical Services
    </h2>


    {/* DESCRIPTION */}
    <p
      className="
        ml-auto
        mt-6
        max-w-2xl
        text-right
        text-sm
        leading-7
        text-slate-600
        sm:text-base
      "
      style={{
        opacity: servicesSectionVisible ? 1 : 0,

        transform: servicesSectionVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(45px,0,0)',

        transition:
          'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

        transitionDelay:
          servicesSectionVisible ? '200ms' : '0ms'
      }}
    >
      Our services cover essential vehicle electrical
      systems, diagnostics, repairs, and inspections.
    </p>

  </div>


  {/* =====================================================
      SERVICE FEATURES
  ===================================================== */}

  <div
    className="
      mx-auto
      mt-14
      max-w-7xl
      px-5
      sm:px-8
      lg:mt-20
    "
  >

    {services.map((service, index) => {

      const imageLeft = index % 2 === 0

      return (

        <article
          key={index}

          ref={(element) => {
            serviceRefs.current[index] = element
          }}

          data-service-index={index}

          className="
            relative
            grid
            items-center
            gap-10
            py-12
            sm:py-16
            lg:min-h-[480px]
            lg:grid-cols-2
            lg:gap-16
            lg:py-20
          "
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          <div
            className={`
              relative
              h-[280px]
              overflow-hidden
              sm:h-[360px]
              lg:h-[430px]

              ${imageLeft
                ? 'lg:order-1'
                : 'lg:order-2'
              }
            `}
            style={{
              opacity: visibleServices[index] ? 1 : 0,

              transform: visibleServices[index]
                ? 'translate3d(0,0,0)'
                : imageLeft
                  ? 'translate3d(-90px,0,0)'
                  : 'translate3d(90px,0,0)',

              transition:
                'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease-out',

              transitionDelay: visibleServices[index]
                ? `${index * 80}ms`
                : '0ms',

              clipPath: imageLeft
                ? 'polygon(7% 0,100% 0,93% 100%,0 100%)'
                : 'polygon(0 0,93% 0,100% 100%,7% 100%)'
            }}
          >

            <img
              src={service.image}
              alt={service.title}
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                ease-out
                hover:scale-105
              "
            />


            {/* IMAGE OVERLAY */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/55
                via-black/10
                to-transparent
              "
            />


            {/* NUMBER */}

            <div
              className="
                absolute
                left-6
                top-5
                text-5xl
                font-black
                leading-none
                tracking-[-0.06em]
                text-white/90
                drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)]
                sm:left-8
                sm:top-7
                sm:text-6xl
              "
            >
              {String(index + 1).padStart(2, '0')}
            </div>


            {/* RED ACCENT */}

            <div
              className="
                absolute
                bottom-0
                left-0
                h-1.5
                w-28
                bg-red-700
                sm:w-36
              "
            />

          </div>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className={`
              relative

              ${imageLeft
                ? 'lg:order-2'
                : 'lg:order-1'
              }
            `}
            style={{
              opacity: visibleServices[index] ? 1 : 0,

              transform: visibleServices[index]
                ? 'translate3d(0,0,0)'
                : imageLeft
                  ? 'translate3d(90px,0,0)'
                  : 'translate3d(-90px,0,0)',

              transition:
                'transform 1000ms cubic-bezier(0.16,1,0.3,1), opacity 700ms ease-out',

              transitionDelay: visibleServices[index]
                ? `${index * 80 + 120}ms`
                : '0ms'
            }}
          >

            {/* ICON */}

            <div
              className="
                mb-6
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-700
                text-xl
                text-white
                shadow-[0_10px_25px_rgba(153,27,27,0.18)]
              "
            >
              {service.icon}
            </div>


            {/* TITLE */}

            <h3
              className="
                max-w-xl
                text-[clamp(1.65rem,3vw,2.5rem)]
                font-black
                leading-[1.05]
                tracking-[-0.04em]
                text-slate-900
              "
            >
              {service.title}
            </h3>


            {/* RED DIVIDER */}

            <div
              className="
                my-6
                h-1.5
                w-20
                bg-red-700
              "
              style={{
                clipPath:
                  'polygon(0 0,100% 0,82% 100%,0 100%)'
              }}
            />


            {/* DESCRIPTION */}

            <p
              className="
                max-w-xl
                text-sm
                leading-7
                text-slate-600
                sm:text-base
                sm:leading-8
              "
            >
              {service.description}
            </p>


            {/* BRAND LABEL */}

            <div
              className="
                mt-7
                flex
                items-center
                gap-3
                text-[11px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-red-700
                "
              />

              <span>
                Alavaren Auto Electrical Services
              </span>

            </div>

          </div>

        </article>

      )

    })}

  </div>

</section>


      {/* =====================================================
          SPECIALIZED SERVICES
      ===================================================== */}

     

<section
  ref={specializedServicesRef}
  className="landing-specialized-section"
  style={styles.specializedSection}
>
  <div className="landing-wave landing-wave-red" />

  <div style={styles.specializedInner}>

    <div
      className="landing-section-eyebrow"
      style={{
        ...styles.sectionEyebrow,
        color: '#f7c8c3',
        opacity: specializedVisible ? 1 : 0,
        transform: specializedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,35px,0)',
        transition:
          'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
      }}
    >
      SPECIALIZED SERVICES
    </div>


    <h2
      className="landing-section-title"
      style={{
        ...styles.sectionTitleWhite,
        opacity: specializedVisible ? 1 : 0,
        transform: specializedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,45px,0)',
        transition:
          'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
        transitionDelay:
          specializedVisible ? '100ms' : '0ms'
      }}
    >
      What We Specialize In
    </h2>


    <p
      className="landing-section-intro landing-specialized-intro"
      style={{
        ...styles.specializedIntro,
        opacity: specializedVisible ? 1 : 0,
        transform: specializedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,40px,0)',
        transition:
          'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
        transitionDelay:
          specializedVisible ? '180ms' : '0ms'
      }}
    >
      We provide specialized automotive electrical
      services designed to diagnose, repair, and maintain
      important vehicle electrical components.
    </p>

          {/* =====================================================
    SPECIALIZED SERVICES FULL-WIDTH SCROLL AREA
===================================================== */}

<div
  className="
    relative
    -mx-5
    w-[calc(100%+2.5rem)]
    sm:-mx-8
    sm:w-[calc(100%+4rem)]
    lg:-mx-10
    lg:w-[calc(100%+5rem)]
  "
>
  <div
    ref={specializedScrollRef}
    className="
      landing-specialized-scroll
      flex
      w-full
      gap-5
      overflow-x-auto
      overflow-y-hidden
      px-5
      pb-4
      scroll-smooth
      snap-x
      snap-mandatory
      touch-pan-x
      overscroll-x-contain
      select-none

      [-ms-overflow-style:none]
      [scrollbar-width:none]
      [&::-webkit-scrollbar]:hidden

      sm:gap-6
      sm:px-8
      lg:px-10
    "
    style={{
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none'
    }}
    onWheel={(e) => {
      const container = e.currentTarget

      if (
        Math.abs(e.deltaY) >
          Math.abs(e.deltaX) &&
        container.scrollWidth >
          container.clientWidth
      ) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }}
  >

    {specializedServices.map(
      (service, index) => (

        <div
          key={index}
          onMouseEnter={() => {
            setSpecializedActiveIndex(index)
          }}
          className={`
            landing-card
            landing-specialized-card
            group
            relative
            min-h-[280px]
            w-[82vw]
            min-w-[82vw]
            shrink-0
            snap-start
            overflow-hidden
            rounded-[24px]
            border
            border-white/10
            transform-gpu
            will-change-transform

            sm:w-[420px]
            sm:min-w-[420px]

            lg:w-[430px]
            lg:min-w-[430px]

            ${
              specializedServicesVisible
                ? 'translate-x-0'
                : index < 4
                  ? '-translate-x-16'
                  : 'translate-x-16'
            }
          `}
          style={{
            ...styles.specializedCard,
            background: 'transparent',
            opacity:
              specializedServicesVisible
                ? 1
                : 0,
            transition:
              'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease-out',
            transitionDelay:
              `${(index % 4) * 80}ms`
          }}
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          <img
            src={service.image}
            alt={service.title}
            draggable="false"
            className="
              pointer-events-none
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              ease-out
              will-change-transform
              group-hover:scale-110
            "
          />

          {/* =================================================
              DARK GRADIENT OVERLAY
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/90
              via-black/55
              to-black/20
            "
          />

          {/* =================================================
              CONTENT
          ================================================= */}

          <div
            className="
              relative
              z-10
              flex
              min-h-[280px]
              h-full
              flex-col
              justify-between
              p-6
            "
          >

            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              {/* ICON */}

              <div
                style={styles.specializedIcon}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-y-1
                "
              >
                {service.icon}
              </div>

              {/* NUMBER */}

              <div
                style={{
                  ...styles.specializedNumber,
                  color:
                    'rgba(255,255,255,0.75)'
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </div>

            </div>

            {/* BOTTOM CONTENT */}

            <div>

              <h3
                className="landing-specialized-title"
                style={{
                  ...styles.specializedTitle,
                  color: '#ffffff'
                }}
              >
                {service.title}
              </h3>

              <p
                className="landing-specialized-description"
                style={{
                  ...styles.specializedDescription,
                  color:
                    'rgba(255,255,255,0.82)'
                }}
              >
                {service.description}
              </p>

            </div>

          </div>

        </div>

      )
    )}

  </div>

  {/* =====================================================
      SCROLL DOT INDICATOR
  ===================================================== */}

  <div
    className="
      mt-5
      flex
      items-center
      justify-center
      gap-2
      px-5
      sm:px-8
      lg:px-10
    "
  >
    {specializedServices.map((_, index) => (
      <button
        key={index}
        type="button"
        aria-label={`Go to specialized service ${index + 1}`}
        onClick={() => {
          const container =
            specializedScrollRef.current

          if (!container) return

          const cards =
            container.querySelectorAll(
              '.landing-specialized-card'
            )

          const card = cards[index]

          if (!card) return

          container.scrollTo({
            left:
              card.offsetLeft -
              (container.clientWidth -
                card.offsetWidth) /
                2,
            behavior: 'smooth'
          })

          setSpecializedActiveIndex(index)
        }}
        className={`
          h-2
          rounded-full
          transition-all
          duration-300
          ${
            specializedActiveIndex === index
              ? 'w-6 bg-white/90'
              : 'w-2 bg-white/30 hover:bg-white/50'
          }
        `}
      />
    ))}
  </div>

</div>
        </div>

      </section>








{/* =====================================================
    GETTING STARTED
===================================================== */}

<section
  ref={gettingStartedRef}
  id="how-it-works"
  className="
    relative
    overflow-hidden
    bg-white
  "
  style={{
    paddingTop: 'clamp(5rem, 9vw, 8rem)',
    paddingBottom: 'clamp(5rem, 9vw, 8rem)'
  }}
>

  {/* ===================================================
      SUBTLE BACKGROUND ACCENTS
  =================================================== */}

  <div
    className="
      pointer-events-none
      absolute
      -right-24
      top-20
      h-72
      w-72
      rounded-full
      bg-red-50
      blur-3xl
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      -left-24
      bottom-10
      h-64
      w-64
      rounded-full
      bg-slate-50
      blur-3xl
    "
  />


  {/* ===================================================
      HEADER
  =================================================== */}

  <div
    className="
      relative
      z-10
      mx-auto
      max-w-6xl
      px-5
      text-center
      sm:px-8
    "
  >

    {/* EYEBROW */}

    <div
      className="
        mb-4
        text-xs
        font-black
        uppercase
        tracking-[0.22em]
        text-red-700
        sm:text-sm
      "
      style={{
        opacity: gettingStartedVisible ? 1 : 0,

        transform: gettingStartedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,35px,0)',

        transition:
          'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
      }}
    >
      GETTING STARTED
    </div>


    {/* TITLE */}

    <h2
      className="
        mx-auto
        max-w-4xl
        text-[clamp(2.2rem,5vw,4.5rem)]
        font-black
        leading-[0.95]
        tracking-[-0.055em]
        text-slate-900
      "
      style={{
        opacity: gettingStartedVisible ? 1 : 0,

        transform: gettingStartedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,45px,0)',

        transition:
          'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

        transitionDelay:
          gettingStartedVisible ? '100ms' : '0ms'
      }}
    >
      How to Start Your Service
    </h2>


    {/* DESCRIPTION */}

    <p
      className="
        mx-auto
        mt-6
        max-w-2xl
        text-sm
        leading-7
        text-slate-600
        sm:text-base
        sm:leading-8
      "
      style={{
        opacity: gettingStartedVisible ? 1 : 0,

        transform: gettingStartedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,40px,0)',

        transition:
          'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

        transitionDelay:
          gettingStartedVisible ? '180ms' : '0ms'
      }}
    >
      From creating your customer account to tracking your appointment,
      getting started with Alavaren is simple and straightforward.
    </p>

  </div>


  {/* ===================================================
      JOURNEY
  =================================================== */}

  <div
    className="
      relative
      z-10
      mx-auto
      mt-16
      max-w-7xl
      px-5
      sm:px-8
      lg:mt-20
    "
  >

    {/* =================================================
        DESKTOP CONNECTING LINE
    ================================================= */}

    <div
      className="
        pointer-events-none
        absolute
        left-[12.5%]
        right-[12.5%]
        top-[42px]
        hidden
        h-px
        bg-slate-200
        lg:block
      "
    >

      <div
        className="
          h-full
          origin-left
          bg-red-700
        "
        style={{
          width: gettingStartedVisible ? '100%' : '0%',

          transition:
            'width 1400ms cubic-bezier(0.16,1,0.3,1)',

          transitionDelay:
            gettingStartedVisible ? '450ms' : '0ms'
        }}
      />

    </div>


    {/* =================================================
        STEPS
    ================================================= */}

    <div
      className="
        relative
        grid
        gap-12
        lg:grid-cols-4
        lg:gap-8
      "
    >

      {/* =================================================
          STEP 01
      ================================================= */}

      <div
        className="
          relative
          flex
          gap-5
          lg:block
          lg:text-center
        "
        style={{
          opacity: gettingStartedVisible ? 1 : 0,

          transform: gettingStartedVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-45px,0,0)',

          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

          transitionDelay:
            gettingStartedVisible ? '350ms' : '0ms'
        }}
      >

        {/* MOBILE CONNECTOR */}

        <div
          className="
            absolute
            left-[27px]
            top-[62px]
            h-[calc(100%+48px)]
            w-px
            bg-slate-200
            lg:hidden
          "
        />

        {/* NUMBER CIRCLE */}

        <div
          className="
            relative
            z-10
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-full
            border-[5px]
            border-white
            bg-red-700
            text-sm
            font-black
            text-white
            shadow-[0_8px_25px_rgba(153,27,27,0.22)]
            ring-1
            ring-red-100
            transition-all
            duration-300
            lg:mx-auto
          "
        >
          01
        </div>


        <div className="min-w-0 pt-1 lg:pt-7">

          {/* ICON */}

          <div
            className="
              mb-4
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-700
              lg:mx-auto
              lg:flex
            "
          >
            <FaUserCircle size={19} />
          </div>


          <div
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.18em]
              text-red-700
            "
          >
            STEP 01
          </div>


          <h3
            className="
              mt-2
              text-xl
              font-black
              tracking-[-0.025em]
              text-slate-900
              sm:text-2xl
            "
          >
            Choose Customer
          </h3>


          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-600
              lg:mx-auto
            "
          >
            Select the Customer role to begin your service journey.
          </p>

        </div>

      </div>


      {/* =================================================
          STEP 02
      ================================================= */}

      <div
        className="
          relative
          flex
          gap-5
          lg:block
          lg:text-center
        "
        style={{
          opacity: gettingStartedVisible ? 1 : 0,

          transform: gettingStartedVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-25px,0,0)',

          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

          transitionDelay:
            gettingStartedVisible ? '500ms' : '0ms'
        }}
      >

        <div
          className="
            absolute
            left-[27px]
            top-[62px]
            h-[calc(100%+48px)]
            w-px
            bg-slate-200
            lg:hidden
          "
        />

        <div
          className="
            relative
            z-10
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-full
            border-[5px]
            border-white
            bg-red-700
            text-sm
            font-black
            text-white
            shadow-[0_8px_25px_rgba(153,27,27,0.22)]
            ring-1
            ring-red-100
            lg:mx-auto
          "
        >
          02
        </div>


        <div className="min-w-0 pt-1 lg:pt-7">

          <div
            className="
              mb-4
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-700
              lg:mx-auto
              lg:flex
            "
          >
            <FaShieldAlt size={18} />
          </div>


          <div
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.18em]
              text-red-700
            "
          >
            STEP 02
          </div>


          <h3
            className="
              mt-2
              text-xl
              font-black
              tracking-[-0.025em]
              text-slate-900
              sm:text-2xl
            "
          >
            Create Account
          </h3>


          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-600
              lg:mx-auto
            "
          >
            Create your customer account so you can manage your services
            and appointments.
          </p>

        </div>

      </div>


      {/* =================================================
          STEP 03
      ================================================= */}

      <div
        className="
          relative
          flex
          gap-5
          lg:block
          lg:text-center
        "
        style={{
          opacity: gettingStartedVisible ? 1 : 0,

          transform: gettingStartedVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(25px,0,0)',

          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

          transitionDelay:
            gettingStartedVisible ? '650ms' : '0ms'
        }}
      >

        <div
          className="
            absolute
            left-[27px]
            top-[62px]
            h-[calc(100%+48px)]
            w-px
            bg-slate-200
            lg:hidden
          "
        />

        <div
          className="
            relative
            z-10
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-full
            border-[5px]
            border-white
            bg-red-700
            text-sm
            font-black
            text-white
            shadow-[0_8px_25px_rgba(153,27,27,0.22)]
            ring-1
            ring-red-100
            lg:mx-auto
          "
        >
          03
        </div>


        <div className="min-w-0 pt-1 lg:pt-7">

          <div
            className="
              mb-4
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-700
              lg:mx-auto
              lg:flex
            "
          >
            <FaTools size={18} />
          </div>


          <div
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.18em]
              text-red-700
            "
          >
            STEP 03
          </div>


          <h3
            className="
              mt-2
              text-xl
              font-black
              tracking-[-0.025em]
              text-slate-900
              sm:text-2xl
            "
          >
            Book Service
          </h3>


          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-600
              lg:mx-auto
            "
          >
            Choose your service and provide your preferred appointment
            details.
          </p>

        </div>

      </div>


      {/* =================================================
          STEP 04
      ================================================= */}

      <div
        className="
          relative
          flex
          gap-5
          lg:block
          lg:text-center
        "
        style={{
          opacity: gettingStartedVisible ? 1 : 0,

          transform: gettingStartedVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(45px,0,0)',

          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',

          transitionDelay:
            gettingStartedVisible ? '800ms' : '0ms'
        }}
      >

        <div
          className="
            relative
            z-10
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-full
            border-[5px]
            border-white
            bg-red-700
            text-sm
            font-black
            text-white
            shadow-[0_8px_25px_rgba(153,27,27,0.22)]
            ring-1
            ring-red-100
            lg:mx-auto
          "
        >
          04
        </div>


        <div className="min-w-0 pt-1 lg:pt-7">

          <div
            className="
              mb-4
              hidden
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-red-50
              text-red-700
              lg:mx-auto
              lg:flex
            "
          >
            <FaClock size={18} />
          </div>


          <div
            className="
              text-[11px]
              font-black
              uppercase
              tracking-[0.18em]
              text-red-700
            "
          >
            STEP 04
          </div>


          <h3
            className="
              mt-2
              text-xl
              font-black
              tracking-[-0.025em]
              text-slate-900
              sm:text-2xl
            "
          >
            Track Appointment
          </h3>


          <p
            className="
              mt-3
              max-w-sm
              text-sm
              leading-6
              text-slate-600
              lg:mx-auto
            "
          >
            Keep track of your appointment and stay updated throughout
            the service process.
          </p>

        </div>

      </div>

    </div>


    {/* =================================================
        CTA
    ================================================= */}

    <div
      className="
        mt-14
        flex
        justify-center
        sm:mt-16
      "
      style={{
        opacity: gettingStartedVisible ? 1 : 0,

        transform: gettingStartedVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(0,30px,0)',

        transition:
          'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',

        transitionDelay:
          gettingStartedVisible ? '1050ms' : '0ms'
      }}
    >

      <button
        type="button"
        onClick={() => navigate('/choose-role')}
        className="
          group
          inline-flex
          items-center
          justify-center
          gap-3
          rounded-2xl
          bg-red-700
          px-7
          py-4
          text-sm
          font-black
          text-white
          shadow-[0_12px_30px_rgba(153,27,27,0.22)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-red-800
          hover:shadow-[0_18px_35px_rgba(153,27,27,0.28)]
          active:translate-y-0
        "
      >
        Get Started

        <FaArrowRight
          className="
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </button>

    </div>

  </div>


  {/* ===================================================
      BOTTOM DECORATIVE LINE
  =================================================== */}

  <div
    className="
      relative
      z-10
      mx-auto
      mt-16
      h-px
      max-w-6xl
      bg-gradient-to-r
      from-transparent
      via-red-200
      to-transparent
      sm:mt-20
    "
  />

</section>


      {/* =====================================================
    CONTACT
===================================================== */}

<section
  ref={contactRef}
  id="contact"
  className="landing-contact-section"
  style={{
    ...styles.contactSection,
    position: 'relative',
    overflow: 'hidden'
  }}
>

  <div className="landing-wave landing-wave-gray" />

  {/* =====================================================
      CONTACT HEADER
  ===================================================== */}

  <div
    className="landing-section-eyebrow"
    style={{
      ...styles.sectionEyebrow,
      opacity: contactVisible ? 1 : 0,
      transform: contactVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,35px,0)',
      transition:
        'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
    }}
  >
    CONTACT US
  </div>


  <h2
    className="landing-section-title"
    style={{
      ...styles.sectionTitle,
      opacity: contactVisible ? 1 : 0,
      transform: contactVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,45px,0)',
      transition:
        'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
      transitionDelay:
        contactVisible ? '100ms' : '0ms'
    }}
  >
    Visit or Get in Touch
  </h2>


  <p
    className="landing-section-intro"
    style={{
      ...styles.sectionIntro,
      opacity: contactVisible ? 1 : 0,
      transform: contactVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,40px,0)',
      transition:
        'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
      transitionDelay:
        contactVisible ? '180ms' : '0ms'
    }}
  >
    Have questions about your vehicle or need a quotation?
    Contact us or visit our shop.
  </p>


  {/* =====================================================
      CONTACT GRID
  ===================================================== */}

  <div
    className="landing-contact-grid"
    style={{
      ...styles.contactGrid,
      opacity: contactVisible ? 1 : 0,
      transform: contactVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,55px,0)',
      transition:
        'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 650ms ease-out',
      transitionDelay:
        contactVisible ? '260ms' : '0ms'
    }}
  >

    {/* =====================================================
        LEFT
    ===================================================== */}

    <div>

      <h3
        className="landing-contact-heading"
        style={{
          ...styles.contactHeading,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-45px,0,0)',
          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
          transitionDelay:
            contactVisible ? '350ms' : '0ms'
        }}
      >
        We're Ready to Help
      </h3>


      <p
        className="landing-contact-description"
        style={{
          ...styles.contactDescription,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-35px,0,0)',
          transition:
            'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',
          transitionDelay:
            contactVisible ? '450ms' : '0ms'
        }}
      >
        For inquiries, service information, and
        quotations, feel free to contact us using
        the information below.
      </p>


      {/* =====================================================
          BUSINESS HOURS WITH BACKGROUND IMAGE
      ===================================================== */}

      <div
        className="landing-card landing-glass landing-hours-card"
        style={{
          ...styles.hoursCard,
          position: 'relative',
          overflow: 'hidden',
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-55px,0,0)',
          transition:
            'transform 850ms cubic-bezier(0.16,1,0.3,1), opacity 600ms ease-out',
          transitionDelay:
            contactVisible ? '550ms' : '0ms'
        }}
      >

        {/* BACKGROUND IMAGE */}
        <img
          src="/images/BusinessHours.jpg"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        {/* DARK OVERLAY */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/60
          "
        />


        {/* CONTENT */}
        <div
          className="
            relative
            z-10
            flex
            items-center
            gap-4
          "
        >

          <div
            className="landing-premium-icon landing-hours-icon"
            style={{
              ...styles.hoursIcon,
              flexShrink: 0
            }}
          >
            <FaClock />
          </div>


          <div>

            <h4
              style={{
                ...styles.hoursTitle,
                color: '#ffffff'
              }}
            >
              Business Hours
            </h4>


            <p
              style={{
                ...styles.hoursText,
                color: 'rgba(255,255,255,0.85)'
              }}
            >
              Monday to Saturday
            </p>


            <p
              style={{
                ...styles.hoursTime,
                color: '#ffffff'
              }}
            >
              8:00 AM – 6:00 PM
            </p>

          </div>

        </div>

      </div>





      {/* =====================================================
          OPEN / CLOSED STATUS
      ===================================================== */}

      <div
        style={{
          ...styles.statusBox,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(-45px,0,0)',
          transition:
            'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
          transitionDelay:
            contactVisible ? '650ms' : '0ms'
        }}
      >

        <div style={styles.statusTop}>

         <span
  style={{
    ...styles.statusDot,
    background: statusColor,
    boxShadow: `0 0 10px ${statusColor}`,
    animation:
      isOpen
        ? `landingBlink ${isWarning ? '0.8s' : '1.5s'} infinite`
        : 'none'
  }}
/>

<span
  style={{
    ...styles.statusLabel,
    color: statusColor
  }}
>
  {statusLabel}
</span>
        </div>


        <p
          style={{
            ...styles.statusText,
            color: statusColor
          }}
        >
          {statusText}
        </p>

      </div>

    </div>


    {/* =====================================================
        RIGHT
    ===================================================== */}

    <div
      className="landing-contact-details"
      style={{
        ...styles.contactDetails,
        opacity: contactVisible ? 1 : 0,
        transform: contactVisible
          ? 'translate3d(0,0,0)'
          : 'translate3d(55px,0,0)',
        transition:
          'transform 900ms cubic-bezier(0.16,1,0.3,1), opacity 650ms ease-out',
        transitionDelay:
          contactVisible ? '320ms' : '0ms'
      }}
    >

      {/* =====================================================
          SMART
      ===================================================== */}

      <div
        className="landing-contact-item landing-glass"
        style={{
          ...styles.contactItem,
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        <img
          src="/images/Smart.jpg"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/60
          "
        />

        <div
          className="
            relative
            z-10
            flex
            items-center
            gap-4
          "
        >

          <div
            className="landing-premium-icon landing-contact-icon"
            style={{
              ...styles.contactIcon,
              flexShrink: 0
            }}
          >
            <FaPhone />
          </div>


          <div>

            <span
              style={{
                ...styles.contactLabel,
                color: '#ffffff'
              }}
            >
              Smart
            </span>


            <p
              className="landing-contact-value"
              style={{
                ...styles.contactValue,
                color: '#ffffff'
              }}
            >
              09218822125
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          SUN
      ===================================================== */}

      <div
        className="landing-contact-item landing-glass"
        style={{
          ...styles.contactItem,
          position: 'relative',
          overflow: 'hidden'
        }}
      >

        <img
          src="/images/Sun.jpg"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-black/60
          "
        />

        <div
          className="
            relative
            z-10
            flex
            items-center
            gap-4
          "
        >

          <div
            className="landing-premium-icon landing-contact-icon"
            style={{
              ...styles.contactIcon,
              flexShrink: 0
            }}
          >
            <FaPhone />
          </div>


          <div>

            <span
              style={{
                ...styles.contactLabel,
                color: '#ffffff'
              }}
            >
              Sun
            </span>


            <p
              className="landing-contact-value"
              style={{
                ...styles.contactValue,
                color: '#ffffff'
              }}
            >
              09228855498
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
      VISIT OUR SHOP
  ===================================================== */}

<a
  href="https://maps.app.goo.gl/CJokD9tKAUZU3SNU8"
  target="_blank"
  rel="noopener noreferrer"
  className="
    landing-contact-item
    landing-glass
    block
    cursor-pointer
    transition-all
    duration-300
    hover:-translate-y-1
    hover:shadow-lg
  "
  style={{
    ...styles.contactItem,
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none'
  }}
>

  <img
    src="/images/AlavarenAutoRepairShop.png"
    alt=""
    aria-hidden="true"
    className="
      pointer-events-none
      absolute
      inset-0
      h-full
      w-full
      object-cover
    "
  />

  <div
    className="
      pointer-events-none
      absolute
      inset-0
      bg-black/65
    "
  />

  <div
    className="
      relative
      z-10
      flex
      items-start
      gap-4
    "
  >

    <div
      className="landing-premium-icon landing-contact-icon"
      style={{
        ...styles.contactIcon,
        flexShrink: 0
      }}
    >
      <FaMapMarkerAlt />
    </div>

    <div>

      <span
        style={{
          ...styles.contactLabel,
          color: '#ffffff'
        }}
      >
        Visit Our Shop
      </span>

      <p
        className="landing-contact-value"
        style={{
          ...styles.contactValue,
          color: '#ffffff'
        }}
      >
        62 Alabang Zapote Road,
        <br />
        Pamplona Uno,
        <br />
        Las Piñas City,
        <br />
        Metro Manila
      </p>

      <span
        className="
          mt-2
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-white
          opacity-90
        "
      >
        <FaMapMarkerAlt />
        Get Directions
      </span>

    </div>

  </div>

</a>


      {/* =====================================================
          FACEBOOK
      ===================================================== */}

      <a
        href="https://www.facebook.com/profile.php?id=100057417281677"
        target="_blank"
        rel="noopener noreferrer"
        className="landing-social-button landing-bounce"
        style={{
          ...styles.facebookButton,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(55px,0,0)',
          transition:
            'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',
          transitionDelay:
            contactVisible ? '750ms' : '0ms'
        }}
      >

        <FaFacebookF size={18} />

        <span>
          Visit us on Facebook
        </span>

      </a>


      {/* =====================================================
          TIKTOK
      ===================================================== */}

      <a
        href="https://www.tiktok.com/@alavarenautoelectrical?is_from_webapp=1&sender_device=pc"
        target="_blank"
        rel="noopener noreferrer"
        className="landing-social-button landing-bounce"
        style={{
          ...styles.tiktokButton,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(55px,0,0)',
          transition:
            'transform 750ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out',
          transitionDelay:
            contactVisible ? '830ms' : '0ms'
        }}
      >

        <FaTiktok size={19} />

        <span>
          Visit us on TikTok
        </span>

      </a>


      {/* =====================================================
          QUOTATION BOX
      ===================================================== */}

      <div
        className="landing-quote-box landing-glass-dark"
        style={{
          ...styles.quoteBox,
          opacity: contactVisible ? 1 : 0,
          transform: contactVisible
            ? 'translate3d(0,0,0)'
            : 'translate3d(55px,0,0)',
          transition:
            'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
          transitionDelay:
            contactVisible ? '910ms' : '0ms'
        }}
      >

        <div style={styles.quoteIcon}>
          <FaShieldAlt />
        </div>


        <div>

          <p style={styles.quoteLabel}>
            FOR INQUIRIES & QUOTATION
          </p>


          <p
            className="landing-quote-text"
            style={styles.quoteText}
          >
            Contact us directly for service
            inquiries and quotation requests.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>





      {/* =====================================================
    PRIVACY & DISCLAIMER
===================================================== */}

<section
  ref={privacyRef}
  className="landing-privacy-section"
  style={{
    ...styles.privacySection,
    position: 'relative',
    overflow: 'hidden'
  }}
>

  <div className="landing-wave landing-wave-red" />


  {/* =====================================================
      EYEBROW
  ===================================================== */}

  <div
    className="landing-section-eyebrow"
    style={{
      ...styles.sectionEyebrow,
      opacity: privacyVisible ? 1 : 0,
      transform: privacyVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,35px,0)',
      transition:
        'transform 700ms cubic-bezier(0.16,1,0.3,1), opacity 500ms ease-out'
    }}
  >
    INFORMATION
  </div>


  {/* =====================================================
      TITLE
  ===================================================== */}

  <h2
    className="landing-section-title"
    style={{
      ...styles.sectionTitle,
      opacity: privacyVisible ? 1 : 0,
      transform: privacyVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(0,45px,0)',
      transition:
        'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
      transitionDelay:
        privacyVisible ? '100ms' : '0ms'
    }}
  >
    Privacy & Disclaimer
  </h2>


  {/* =====================================================
      PRIVACY POLICY
  ===================================================== */}

  <p
    className="landing-text-block"
    style={{
      ...styles.textBlock,
      opacity: privacyVisible ? 1 : 0,
      transform: privacyVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(-45px,0,0)',
      transition:
        'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
      transitionDelay:
        privacyVisible ? '220ms' : '0ms'
    }}
  >
    <strong>Privacy Policy:</strong>{' '}
    Alavaren Auto Electrical Services respects your
    privacy and is committed to protecting your personal
    information. Information is only used for appointments,
    support, and service-related purposes.
  </p>


  {/* =====================================================
      DISCLAIMER
  ===================================================== */}

  <p
    className="landing-text-block"
    style={{
      ...styles.textBlock,
      opacity: privacyVisible ? 1 : 0,
      transform: privacyVisible
        ? 'translate3d(0,0,0)'
        : 'translate3d(45px,0,0)',
      transition:
        'transform 800ms cubic-bezier(0.16,1,0.3,1), opacity 550ms ease-out',
      transitionDelay:
        privacyVisible ? '340ms' : '0ms'
    }}
  >
    <strong>Disclaimer:</strong>{' '}
    While every effort is made to ensure accuracy,
    Alavaren Auto Electrical Services is not liable
    for delays, damages, or issues beyond reasonable
    control.
  </p>

</section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="landing-footer"
        style={styles.footer}
      >

        <div
          className="landing-footer-inner"
          style={styles.footerInner}
        >

          <div>

            <h3
              className="landing-footer-title"
              style={styles.footerTitle}
            >
              Alavaren Auto Electrical Services
            </h3>


            <p
              className="landing-footer-text"
              style={styles.footerText}
            >
              Professional automotive electrical solutions
              you can trust.
            </p>

          </div>


          <div
            className="landing-footer-address"
            style={styles.footerAddress}
          >
            62 Alabang Zapote Road,
            <br />
            Pamplona Uno, Las Piñas City,
            <br />
            Metro Manila
          </div>

        </div>


        <div
          className="landing-footer-bottom"
          style={styles.footerBottom}
        >
          © {new Date().getFullYear()} Alavaren Auto Electrical
          Services. All rights reserved.
        </div>

      </footer>

    </div>

  )

}






/* =========================================================
   PREMIUM STYLES
========================================================= */

const styles = {

  page: {
    fontFamily:
      "'Inter', 'Segoe UI', Arial, sans-serif",

    background:
      '#ffffff',

    color:
      '#20242a',

    minHeight:
      '100vh',

    overflowX:
      'hidden',

    width:
      '100%'
  },


  navbar: {
    display:
      'flex',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    padding:
      '13px 5%',

    background:
      'rgba(164, 43, 32, 0.88)',

    color:
      '#ffffff',

    position:
      'sticky',

    top:
      0,

    zIndex:
      1000,

    borderBottom:
      '1px solid rgba(255,255,255,.14)',

    boxShadow:
      '0 8px 35px rgba(75,20,16,.18)'
  },


  brandArea: {
    display:
      'flex',

    alignItems:
      'center',

    gap:
      '12px',

    minWidth:
      0
  },


  brandIcon: {
    width:
      '42px',

    height:
      '42px',

    minWidth:
      '42px',

    borderRadius:
      '12px',

    background:
      'rgba(255,255,255,.96)',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    fontSize:
      '18px',

    boxShadow:
      '0 8px 25px rgba(0,0,0,.13)'
  },


  brandName: {
    margin:
      0,

    fontSize:
      '17px',

    fontWeight:
      '850',

    letterSpacing:
      '-0.3px',

    whiteSpace:
      'nowrap'
  },


  brandSubtitle: {
    margin:
      '3px 0 0',

    fontSize:
      '10px',

    color:
      '#f8d7d3',

    letterSpacing:
      '.2px'
  },


  navLinks: {
    display:
      'flex',

    alignItems:
      'center',

    gap:
      '28px',

    fontWeight:
      '650'
  },


  navLink: {
    textDecoration:
      'none',

    fontWeight:
      '650',

    fontSize:
      '14px',

    paddingBottom:
      '5px',

    transition:
      'all .25s ease'
  },


  userIconWrap: {
    display:
      'flex',

    alignItems:
      'center',

    marginLeft:
      '3px'
  },


  accountDropdown: {
    position:
      'absolute',

    top:
      '67px',

    right:
      '5%',

    width:
      '190px',

    padding:
      '13px',

    borderRadius:
      '16px',

    background:
      'rgba(255,255,255,.94)',

    backdropFilter:
      'blur(20px)',

    WebkitBackdropFilter:
      'blur(20px)',

    boxShadow:
      '0 20px 55px rgba(0,0,0,.18)',

    border:
      '1px solid rgba(255,255,255,.8)'
  },


  dropdownTitle: {
    margin:
      '2px 5px 10px',

    fontSize:
      '10px',

    fontWeight:
      '800',

    textTransform:
      'uppercase',

    letterSpacing:
      '1.5px',

    color:
      '#8a8f98'
  },


  dropdownBtn: {
    width:
      '100%',

    padding:
      '11px 13px',

    border:
      'none',

    borderRadius:
      '10px',

    background:
      '#C0392B',

    color:
      '#ffffff',

    cursor:
      'pointer',

    fontWeight:
      '750',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap:
      '8px',

    transition:
      'all .25s ease'
  },


  heroWrapper: {
    position:
      'relative',

    minHeight:
      '78vh',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    overflow:
      'hidden',

    textAlign:
      'center',

    boxSizing:
      'border-box',

    background:
      '#17191d'
  },


  heroImage: {
    position:
      'absolute',

    inset:
      0,

    backgroundImage:
      "url('/TemporaryBg1.jpg')",

    backgroundSize:
      'cover',

    backgroundPosition:
      'center',

    zIndex:
      1,

    transition:
      'transform 8s ease'
  },


  overlay: {
    position:
      'absolute',

    inset:
      0,

    background:
      'linear-gradient(100deg, rgba(8,9,11,.86), rgba(8,9,11,.60), rgba(120,26,20,.45))',

    zIndex:
      2
  },


  heroContent: {
    position:
      'relative',

    zIndex:
      5,

    color:
      '#ffffff',

    width:
      '100%',

    maxWidth:
      '900px',

    padding:
      '75px 24px'
  },


  heroBadge: {
    display:
      'inline-flex',

    alignItems:
      'center',

    gap:
      '8px',

    padding:
      '9px 15px',

    borderRadius:
      '999px',

    fontSize:
      '11px',

    fontWeight:
      '750',

    letterSpacing:
      '.5px',

    marginBottom:
      '22px',

    color:
      '#ffffff'
  },


  heroBadgeDot: {
    width:
      '7px',

    height:
      '7px',

    minWidth:
      '7px',

    borderRadius:
      '50%',

    background:
      '#ffffff'
  },


  heroTitle: {
    fontSize:
      'clamp(39px, 6vw, 66px)',

    fontWeight:
      '850',

    margin:
      0,

    lineHeight:
      '1.06',

    letterSpacing:
      '-2.5px'
  },


  heroTitleAccent: {
    color:
      '#f5c6c2',

    textShadow:
      '0 5px 25px rgba(192,57,43,.25)'
  },


  heroDescription: {
    maxWidth:
      '680px',

    margin:
      '24px auto 0',

    fontSize:
      '16px',

    lineHeight:
      '1.8',

    color:
      '#f5f6f7'
  },


  heroButtons: {
    display:
      'flex',

    justifyContent:
      'center',

    alignItems:
      'center',

    gap:
      '14px',

    flexWrap:
      'wrap',

    marginTop:
      '32px'
  },


  cta: {
    display:
      'inline-flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap:
      '10px',

    padding:
      '14px 26px',

    background:
      'linear-gradient(135deg,#d94b3c,#b52e23)',

    border:
      '1px solid rgba(255,255,255,.10)',

    borderRadius:
      '12px',

    color:
      '#ffffff',

    cursor:
      'pointer',

    fontSize:
      '14px',

    fontWeight:
      '750',

    boxShadow:
      '0 14px 35px rgba(192,57,43,.28)',

    transition:
      'all .3s ease'
  },


  secondaryCta: {
    display:
      'inline-flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap:
      '9px',

    padding:
      '14px 25px',

    border:
      '1px solid rgba(255,255,255,.40)',

    borderRadius:
      '12px',

    color:
      '#ffffff',

    background:
      'rgba(255,255,255,.08)',

    backdropFilter:
      'blur(12px)',

    WebkitBackdropFilter:
      'blur(12px)',

    textDecoration:
      'none',

    fontSize:
      '14px',

    fontWeight:
      '750',

    transition:
      'all .25s ease'
  },


  section: {
    position:
      'relative',

    padding:
      '92px 24px',

    maxWidth:
      '1100px',

    margin:
      '0 auto',

    width:
      '100%'
  },


  sectionAlt: {
    position:
      'relative',

    padding:
      '92px 24px',

    background:
      'linear-gradient(145deg,#fafbfc,#f5f6f8)',

    borderTop:
      '1px solid #eceef1',

    borderBottom:
      '1px solid #eceef1',

    width:
      '100%'
  },


  sectionEyebrow: {
    textAlign:
      'center',

    color:
      '#C0392B',

    fontSize:
      '10px',

    fontWeight:
      '850',

    letterSpacing:
      '2.2px',

    marginBottom:
      '13px'
  },


  sectionTitle: {
    color:
      '#191c21',

    fontSize:
      'clamp(28px, 4vw, 41px)',

    fontWeight:
      '850',

    textAlign:
      'center',

    margin:
      0,

    letterSpacing:
      '-1px'
  },


  sectionIntro: {
    maxWidth:
      '700px',

    margin:
      '18px auto 0',

    lineHeight:
      '1.8',

    fontSize:
      '14px',

    textAlign:
      'center',

    color:
      '#667085'
  },


  sectionDivider: {
    width:
      '70%',

    maxWidth:
      '800px',

    height:
      '1px',

    background:
      'linear-gradient(90deg,transparent,#dfe2e6,transparent)',

    margin:
      '0 auto'
  },


  aboutGrid: {
    display:
      'grid',

    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',

    gap:
      '18px',

    marginTop:
      '45px'
  },


  aboutCard: {
    minHeight:
      '225px',

    background:
      'rgba(255,255,255,.72)',

    border:
      '1px solid rgba(255,255,255,.92)',

    borderRadius:
      '20px',

    padding:
      '29px',

    textAlign:
      'center',

    boxShadow:
      '0 15px 45px rgba(30,33,38,.07)'
  },


  aboutIcon: {
    width:
      '50px',

    height:
      '50px',

    margin:
      '0 auto 18px',

    borderRadius:
      '14px',

    background:
      'linear-gradient(145deg,#fff1ef,#f8d8d4)',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    fontSize:
      '19px',

    boxShadow:
      '0 10px 25px rgba(192,57,43,.10)'
  },


  aboutCardTitle: {
    margin:
      0,

    color:
      '#20242a',

    fontSize:
      '17px',

    fontWeight:
      '800'
  },


  aboutCardText: {
    margin:
      '10px 0 0',

    color:
      '#667085',

    fontSize:
      '13px',

    lineHeight:
      '1.7'
  },


  accordionContainer: {
    maxWidth:
      '900px',

    margin:
      '40px auto 0',

    width:
      '100%'
  },


  accordionItem: {
    marginBottom:
      '11px',

    background:
      'rgba(255,255,255,.72)',

    border:
      '1px solid rgba(255,255,255,.92)',

    borderRadius:
      '15px',

    overflow:
      'hidden'
  },


  accordionHeader: {
    display:
      'flex',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    padding:
      '18px 20px',

    cursor:
      'pointer',

    fontSize:
      '14px',

    fontWeight:
      '750',

    color:
      '#22262c'
  },


  accordionLeft: {
    display:
      'flex',

    alignItems:
      'center',

    gap:
      '13px'
  },


  accordionIcon: {
    width:
      '39px',

    minWidth:
      '39px',

    height:
      '39px',

    borderRadius:
      '11px',

    background:
      '#fcedeb',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    fontSize:
      '16px'
  },


  accordionContent: {
    padding:
      '0 20px 20px 72px',

    color:
      '#667085',

    lineHeight:
      '1.8',

    fontSize:
      '13.5px'
  },


  accordionContentP: {
    margin:
      0
  },


  arrow: {
    color:
      '#C0392B',

    fontSize:
      '13px'
  },


  specializedSection: {
    position:
      'relative',

    background:
      'linear-gradient(135deg,#9b2d22 0%,#7b2019 55%,#551610 100%)',

    padding:
      '94px 24px',

    width:
      '100%',

    overflow:
      'hidden'
  },


  specializedInner: {
    maxWidth:
      '1100px',

    margin:
      '0 auto',

    width:
      '100%',

    position:
      'relative',

    zIndex:
      2
  },


  sectionTitleWhite: {
    color:
      '#ffffff',

    fontSize:
      'clamp(28px,4vw,41px)',

    fontWeight:
      '850',

    textAlign:
      'center',

    margin:
      0,

    letterSpacing:
      '-1px'
  },


  specializedIntro: {
    maxWidth:
      '700px',

    margin:
      '18px auto 0',

    color:
      '#f9dedb',

    textAlign:
      'center',

    lineHeight:
      '1.8',

    fontSize:
      '14px'
  },


  specializedGrid: {
    display:
      'grid',

    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',

    gap:
      '15px',

    marginTop:
      '45px'
  },


  specializedCard: {
    background:
      'rgba(255,255,255,.94)',

    borderRadius:
      '16px',

    padding:
      '24px',

    border:
      '1px solid rgba(255,255,255,.55)',

    boxShadow:
      '0 12px 35px rgba(0,0,0,.12)'
  },


  specializedTop: {
    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'space-between',

    marginBottom:
      '15px'
  },


  specializedIcon: {
    width:
      '39px',

    height:
      '39px',

    borderRadius:
      '11px',

    background:
      '#fcedeb',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    fontSize:
      '15px'
  },


  specializedNumber: {
    color:
      '#C0392B',

    fontSize:
      '10px',

    fontWeight:
      '850',

    letterSpacing:
      '1.5px'
  },


  specializedTitle: {
    margin:
      0,

    color:
      '#22262c',

    fontSize:
      '16px',

    fontWeight:
      '800'
  },


  specializedDescription: {
    margin:
      '9px 0 0',

    color:
      '#667085',

    fontSize:
      '12.8px',

    lineHeight:
      '1.7'
  },


  contactSection: {
    position:
      'relative',

    padding:
      '92px 24px',

    maxWidth:
      '1100px',

    margin:
      '0 auto',

    width:
      '100%'
  },


  contactGrid: {
    display:
      'grid',

    gridTemplateColumns:
      'repeat(auto-fit,minmax(300px,1fr))',

    gap:
      '50px',

    marginTop:
      '50px'
  },


  contactHeading: {
    margin:
      0,

    fontSize:
      '25px',

    fontWeight:
      '850',

    color:
      '#20242a'
  },


  contactDescription: {
    marginTop:
      '12px',

    color:
      '#667085',

    lineHeight:
      '1.8',

    fontSize:
      '14px'
  },


  hoursCard: {
    display:
      'flex',

    alignItems:
      'center',

    gap:
      '15px',

    marginTop:
      '25px',

    padding:
      '20px',

    background:
      'rgba(255,255,255,.70)',

    border:
      '1px solid rgba(255,255,255,.92)',

    borderRadius:
      '16px'
  },


  hoursIcon: {
    width:
      '45px',

    minWidth:
      '45px',

    height:
      '45px',

    borderRadius:
      '12px',

    background:
      '#fcedeb',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center'
  },


  hoursTitle: {
    margin:
      0,

    fontSize:
      '15px',

    fontWeight:
      '800',

    color:
      '#22262c'
  },


  hoursText: {
    margin:
      '4px 0 0',

    fontSize:
      '13px',

    color:
      '#667085'
  },


  hoursTime: {
    margin:
      '2px 0 0',

    fontSize:
      '14px',

    fontWeight:
      '800',

    color:
      '#C0392B'
  },


  statusBox: {
    marginTop:
      '12px',

    padding:
      '15px 18px',

    borderRadius:
      '13px',

    background:
      'linear-gradient(135deg,#fff9f8,#fdf1ef)',

    border:
      '1px solid #f1d5d1',

    boxShadow:
      '0 10px 25px rgba(192,57,43,.05)'
  },


  statusTop: {
    display:
      'flex',

    alignItems:
      'center',

    gap:
      '8px'
  },


  statusDot: {
    display:
      'inline-block',

    width:
      '9px',

    height:
      '9px',

    borderRadius:
      '50%',

    background:
      '#C0392B'
  },


  statusLabel: {
    fontSize:
      '10px',

    fontWeight:
      '850',

    letterSpacing:
      '1px'
  },


  statusText: {
    margin:
      '7px 0 0',

    fontSize:
      '13px',

    fontWeight:
      '700'
  },


  contactDetails: {
    display:
      'flex',

    flexDirection:
      'column',

    gap:
      '10px'
  },


  contactItem: {
    display:
      'flex',

    alignItems:
      'flex-start',

    gap:
      '15px',

    padding:
      '17px',

    borderRadius:
      '15px',

    border:
      '1px solid rgba(255,255,255,.9)',

    background:
      'rgba(255,255,255,.67)'
  },


  contactIcon: {
    width:
      '40px',

    minWidth:
      '40px',

    height:
      '40px',

    flexShrink:
      0,

    borderRadius:
      '11px',

    background:
      '#fcedeb',

    color:
      '#C0392B',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center'
  },


  contactLabel: {
    display:
      'block',

    fontSize:
      '9px',

    fontWeight:
      '850',

    textTransform:
      'uppercase',

    letterSpacing:
      '1.2px',

    color:
      '#98a0aa'
  },


  contactValue: {
    margin:
      '4px 0 0',

    fontSize:
      '14px',

    lineHeight:
      '1.7',

    fontWeight:
      '700',

    color:
      '#33373d'
  },


  quoteBox: {
    display:
      'flex',

    alignItems:
      'flex-start',

    gap:
      '13px',

    marginTop:
      '5px',

    padding:
      '22px',

    borderRadius:
      '16px',

    background:
      'linear-gradient(135deg,#9e2f24,#741c16)',

    color:
      '#ffffff'
  },


  quoteIcon: {
    width:
      '37px',

    height:
      '37px',

    minWidth:
      '37px',

    borderRadius:
      '10px',

    background:
      'rgba(255,255,255,.12)',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    color:
      '#ffffff'
  },


  quoteLabel: {
    margin:
      0,

    fontSize:
      '9px',

    fontWeight:
      '850',

    letterSpacing:
      '1.5px'
  },


  quoteText: {
    margin:
      '8px 0 0',

    fontSize:
      '13px',

    lineHeight:
      '1.6',

    color:
      '#ffffff'
  },


  facebookButton: {
    display:
      'inline-flex',

    alignItems:
      'center',

    justifyContent:
      'flex-start',

    gap:
      '10px',

    marginTop:
      '20px',

    padding:
      '11px 18px',

    border:
      '1px solid #C0392B',

    borderRadius:
      '11px',

    background:
      '#ffffff',

    color:
      '#C0392B',

    textDecoration:
      'none',

    fontSize:
      '13px',

    fontWeight:
      '750',

    cursor:
      'pointer',

    boxShadow:
      '0 8px 20px rgba(192,57,43,.07)'
  },


  tiktokButton: {
    display:
      'inline-flex',

    alignItems:
      'center',

    justifyContent:
      'flex-start',

    gap:
      '10px',

    marginTop:
      '10px',

    padding:
      '11px 18px',

    background:
      '#111111',

    color:
      '#ffffff',

    border:
      '1px solid #222',

    borderRadius:
      '11px',

    fontSize:
      '13px',

    fontWeight:
      '750',

    textDecoration:
      'none',

    cursor:
      'pointer',

    boxShadow:
      '0 8px 20px rgba(0,0,0,.10)'
  },


  privacySection: {
    position:
      'relative',

    padding:
      '80px 24px',

    background:
      'linear-gradient(145deg,#fafafa,#f4f5f7)',

    borderTop:
      '1px solid #eeeeee',

    width:
      '100%'
  },


  textBlock: {
    maxWidth:
      '800px',

    margin:
      '18px auto 0',

    textAlign:
      'center',

    lineHeight:
      '1.8',

    color:
      '#667085',

    fontSize:
      '13.5px'
  },


  center: {
    marginTop:
      '25px',

    textAlign:
      'center'
  },


  checkboxLabel: {
    display:
      'inline-flex',

    alignItems:
      'center',

    gap:
      '8px',

    fontSize:
      '12.5px',

    color:
      '#555b65',

    cursor:
      'pointer'
  },


  checkbox: {
    accentColor:
      '#C0392B',

    width:
      '16px',

    height:
      '16px'
  },


  footer: {
    background:
      'linear-gradient(135deg,#24272c,#15171a)',

    color:
      '#ffffff',

    padding:
      '38px 5% 20px',

    width:
      '100%',

    borderTop:
      '1px solid rgba(255,255,255,.06)'
  },


  footerInner: {
    maxWidth:
      '1100px',

    margin:
      '0 auto',

    display:
      'flex',

    justifyContent:
      'space-between',

    alignItems:
      'flex-start',

    gap:
      '30px',

    flexWrap:
      'wrap'
  },


  footerTitle: {
    margin:
      0,

    fontSize:
      '16px',

    fontWeight:
      '800'
  },


  footerText: {
    margin:
      '6px 0 0',

    color:
      '#aeb4bd',

    fontSize:
      '12px'
  },


  footerAddress: {
    fontSize:
      '12px',

    lineHeight:
      '1.7',

    color:
      '#aeb4bd'
  },


  footerBottom: {
    maxWidth:
      '1100px',

    margin:
      '28px auto 0',

    paddingTop:
      '18px',

    borderTop:
      '1px solid rgba(255,255,255,.10)',

    textAlign:
      'center',

    fontSize:
      '10px',

    color:
      '#858c96'
  }

}
