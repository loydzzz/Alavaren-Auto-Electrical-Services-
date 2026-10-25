import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Cropper from 'react-easy-crop'

/* =========================================================
   PREMIUM GLASSMORPHISM PROFILE

   IMPORTANT:
   - Loading state is ROLE-NEUTRAL.
   - No violet/admin styling is rendered before the profile
     has been loaded from Supabase.
   - Role-specific styling starts only after profile.role exists.
   - Bouncy/floating card movement has been removed.

   60-DAY EDIT RULE:
   - Applies to the fields editable in "Edit Profile":
     name, username, phone, address, bio, birthday, gender
     AND to the profile picture (change or remove).
   - Details and picture share ONE lock: saving either one
     starts the same 60-day wait for both.
   - The lock is enforced by a database trigger
     (see profile-edit-cooldown.md); this file only shows it.
========================================================= */

const PSGC_API = 'https://psgc.cloud/api/v2'

// Days a customer must wait between saves of the profile details
const PROFILE_EDIT_COOLDOWN_DAYS = 60

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 18,
  strokeWidth = 2,
  className = '',
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': true,
  }

  const icons = {
    user: (
      <>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),

    userRound: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7.5 18a5.5 5.5 0 0 1 9 0" />
      </>
    ),

    id: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <path d="M13 10h5M13 14h4" />
      </>
    ),

    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),

    phone: (
      <>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),

    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),

    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),

    settings: (
      <>
        <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.2v2.4h-.2A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),

    camera: (
      <>
        <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),

    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 15H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </>
    ),

    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),

    x: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    save: (
      <>
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
        <path d="M17 21v-8H7v8M7 3v5h8" />
      </>
    ),

    wrench: (
      <>
        <path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z" />
      </>
    ),

    car: (
      <>
        <path d="M5 17h14l1-5-2-5H6L4 12l1 5Z" />
        <path d="M7 17v2M17 17v2M4 12h16" />
        <circle cx="7" cy="15" r="1" />
        <circle cx="17" cy="15" r="1" />
      </>
    ),

    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),

    zoom: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4M11 8v6M8 11h6" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6M12 7h.01" />
      </>
    ),

    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),

    mapPin: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
  }

  return <svg {...common}>{icons[name] || icons.info}</svg>
}

function RoleWindowsLogo({
  roleVisual,
  roleName,
  roleIcon,
}) {
  return (
    <div className="pointer-events-none absolute right-5 top-5 hidden sm:block lg:right-8 lg:top-6">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-[30px] border border-white/70 bg-white/20 shadow-[0_25px_60px_rgba(15,23,42,.16)] backdrop-blur-2xl lg:h-40 lg:w-40 lg:rounded-[36px]">
        <div
          className={`absolute -inset-4 rounded-[38px] bg-gradient-to-br ${roleVisual.gradient} opacity-20 blur-2xl`}
        />

        <div
          className={`absolute inset-3 overflow-hidden rounded-[25px] bg-gradient-to-br ${roleVisual.window} shadow-[0_20px_50px_rgba(15,23,42,.22)] lg:rounded-[30px]`}
        >
          <div className="absolute -left-12 -top-16 h-32 w-52 rotate-[-25deg] bg-white/30 blur-2xl" />
          <div className="absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
              <div className="h-7 w-7 rounded-[4px] bg-white/95 shadow-md lg:h-8 lg:w-8" />
              <div className="h-7 w-7 rounded-[4px] bg-white/80 shadow-md lg:h-8 lg:w-8" />
              <div className="h-7 w-7 rounded-[4px] bg-white/80 shadow-md lg:h-8 lg:w-8" />
              <div className="h-7 w-7 rounded-[4px] bg-white/95 shadow-md lg:h-8 lg:w-8" />
            </div>
          </div>

          <div className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/30 bg-black/10 text-white backdrop-blur-md">
            <Icon name={roleIcon} size={15} strokeWidth={2.2} />
          </div>
        </div>

        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,.14)] backdrop-blur-xl">
          {roleName}
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   HERO COVER (video or photo)
========================================================= */

// TEMPORARY: one fixed cover for everyone, just to test the look.
// Put your file inside /public, e.g. public/videos/profile-cover.mp4
const COVER_MEDIA = {
  type: 'video',                    // 'video' or 'image'
  src: '/videos/profile-cover.mp4', // for a photo: '/images/profile-cover.jpg'
}

 function HeroCover({ media, roleVisual }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 h-[55%] overflow-hidden rounded-t-[30px] bg-gradient-to-br ${roleVisual.window} sm:rounded-t-[38px]`}
    >
      {media?.type === 'video' && (
        <video
          key={media.src}
          className="absolute inset-0 h-full w-full object-cover"
          src={media.src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
      )}

      {media?.type === 'image' && (
        <img
          src={media.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {media && (
        <>
          <div
            className={`absolute inset-0 bg-gradient-to-br ${roleVisual.window} opacity-30 mix-blend-multiply`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
        </>
      )}
    </div>
  )
}

/* =========================================================
   60-DAY EDIT LOCK HELPERS
========================================================= */

const DAY_MS = 24 * 60 * 60 * 1000

function getEditLock(profileUpdatedAt) {
  if (!profileUpdatedAt) {
    return { locked: false }
  }

  const lastEdit = new Date(profileUpdatedAt)

  if (Number.isNaN(lastEdit.getTime())) {
    return { locked: false }
  }

  const unlockDate = new Date(
    lastEdit.getTime() + PROFILE_EDIT_COOLDOWN_DAYS * DAY_MS
  )

  const msLeft = unlockDate.getTime() - Date.now()

  return {
    locked: msLeft > 0,
    lastEdit,
    unlockDate,
    daysLeft: Math.max(0, Math.ceil(msLeft / DAY_MS)),
  }
}

function formatLongDate(date) {
  if (!date) return ''

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/* =========================================================
   PSGC / ZIP HELPERS
========================================================= */

// PSGC v2 sometimes returns an empty zip_code.
// The PSGC code is used as the key so name/encoding
// differences do not matter. PSGC ZIP is always preferred.
const ZIP_CODE_FALLBACKS = {
  // NCR
  '1380100000': '1400', // Caloocan
  '1380200000': '1740', // Las Piñas
  '1380300000': '1200', // Makati
  '1380400000': '1470', // Malabon
  '1380500000': '1550', // Mandaluyong
  '1380600000': '1000', // Manila
  '1380700000': '1800', // Marikina
  '1380800000': '1770', // Muntinlupa
  '1380900000': '1485', // Navotas
  '1376000000': '1700', // Parañaque
  '1381000000': '1600', // Pasig
  '1381100000': '1500', // San Juan
  '1381200000': '1630', // Taguig
  '1381300000': '1440', // Valenzuela
  '1381400000': '1300', // Pasay
  '1381500000': '1620', // Pateros
  '1381600000': '1100', // Quezon City
}

function fixEncoding(value) {
  if (!value || typeof value !== 'string') return value

  return value
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã«/g, 'ë')
    .replace(/Ã¯/g, 'ï')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¼/g, 'ü')
}

function cleanPSGCItems(items) {
  if (!Array.isArray(items)) return []

  return items.map(item => ({
    ...item,
    name: fixEncoding(item.name),
    region: fixEncoding(item.region),
    province: fixEncoding(item.province),
    city_municipality: fixEncoding(item.city_municipality),
  }))
}

async function fetchPSGC(endpoint) {
  const response = await fetch(`${PSGC_API}${endpoint}`)

  if (!response.ok) {
    throw new Error(`Location request failed: ${response.status}`)
  }

  const data = await response.json()

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : []

  return cleanPSGCItems(items)
}

function normalizeLocationName(name) {
  if (!name) return ''

  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ã±/gi, 'n')
    .replace(/Ã‘/gi, 'n')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
}

// ZIP from a locality object: PSGC first, then local fallback by code
function getZipCode(locality) {
  if (!locality) return ''

  const psgcZip =
    locality.zip_code ??
    locality.zipCode ??
    locality.postal_code ??
    locality.postalCode ??
    ''

  if (String(psgcZip).trim() !== '') {
    return String(psgcZip).trim()
  }

  const code = String(locality.code || '').trim()
  const fallbackZip = ZIP_CODE_FALLBACKS[code]

  if (fallbackZip && String(fallbackZip).trim() !== '') {
    return String(fallbackZip).trim()
  }

  return ''
}

// Tries: selected object -> PSGC v2 detail -> PSGC v1 detail
// -> PSGC v1 full list -> local fallback
async function fetchZipCode(cityCode, cityName, selectedLocality = null) {
  const selectedZip = getZipCode(selectedLocality)
  if (selectedZip) return selectedZip

  const urls = [
    `${PSGC_API}/cities-municipalities/${encodeURIComponent(cityCode)}`,
    `https://psgc.cloud/api/cities-municipalities/${encodeURIComponent(cityCode)}`,
  ]

  for (const url of urls) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        const data = await response.json()
        const zip = getZipCode(data?.data || data)
        if (zip) return zip
      }
    } catch (error) {
      console.warn('ZIP lookup failed:', url, error)
    }
  }

  try {
    const response = await fetch(
      'https://psgc.cloud/api/cities-municipalities'
    )

    if (response.ok) {
      const data = await response.json()

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : []

      let locality = list.find(
        item => String(item.code) === String(cityCode)
      )

      if (!locality && cityName) {
        const searchName = normalizeLocationName(cityName)

        locality = list.find(
          item => normalizeLocationName(item.name) === searchName
        )
      }

      const zip = getZipCode(locality)
      if (zip) return zip
    }
  } catch (error) {
    console.warn('Complete ZIP list lookup failed:', error)
  }

  return ZIP_CODE_FALLBACKS[String(cityCode)] || ''
}

/* =========================================================
   PROFILE PAGE
========================================================= */

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [showAddressEditor, setShowAddressEditor] = useState(false)

  const [addressForm, setAddressForm] = useState({
    region: '',
    province: '',
    city: '',
    barangay: '',
    street: '',
    zipCode: '',
  })

  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [citiesMunicipalities, setCitiesMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])

  const [loadingRegions, setLoadingRegions] = useState(false)
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)
  const [loadingZip, setLoadingZip] = useState(false)

  const [selectedImage, setSelectedImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropper, setShowCropper] = useState(false)

  const [form, setForm] = useState({
    name: '',
    username: '',
    phone: '',
    address: '',
    bio: '',
    birthday: '',
    gender: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  function formFromProfile(data) {
    return {
      name: data.name || '',
      username: data.username || '',
      phone: data.phone || '',
      address: data.address || '',
      bio: data.bio || '',
      birthday: data.birthday || '',
      gender: data.gender || '',
    }
  }

  async function fetchProfile({ silent = false } = {}) {
    if (!silent) {
      setLoading(true)
      setProfile(null)
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Unable to identify your account.')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          username,
          email,
          phone,
          address,
          bio,
          birthday,
          gender,
          role,
          created_at,
          avatar_url,
          avatar_uploaded_at,
          profile_updated_at,
          cover_url,
          cover_type
        `)
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Profile Error:', error)
        toast.error('Unable to load your profile.')
        return
      }

      setProfile(data)
      setForm(formFromProfile(data))
    } catch (error) {
      console.error('Fetch Profile Error:', error)
      toast.error('Unable to load your profile.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target

    // ==========================================
    // STRICT PHILIPPINE MOBILE NUMBER
    // Format: 09XXXXXXXXX
    // ==========================================
    if (name === 'phone') {
      let phoneValue = value.replace(/\D/g, '')

      // First digit must be 0
      if (phoneValue.length >= 1 && phoneValue[0] !== '0') {
        phoneValue = ''
      }

      // Second digit must be 9
      if (phoneValue.length >= 2 && phoneValue[1] !== '9') {
        phoneValue = phoneValue.slice(0, 1)
      }

      // Maximum 11 digits
      phoneValue = phoneValue.slice(0, 11)

      setForm(previous => ({
        ...previous,
        phone: phoneValue,
      }))

      return
    }

    setForm(previous => ({
      ...previous,
      [name]: value,
    }))
  }

  /* =======================================================
     PROFILE PICTURE (covered by the same 60-day lock)
  ======================================================= */

  function handleImageSelect(e) {
    const file = e.target.files?.[0]

    if (!file) return

    const currentLock = getEditLock(profile?.profile_updated_at)

    if (currentLock.locked) {
      toast.error(
        `You can change your profile picture again on ${formatLongDate(
          currentLock.unlockDate
        )}.`
      )
      e.target.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.')
      e.target.value = ''
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setSelectedImage(imageUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setShowCropper(true)

    e.target.value = ''
  }

  function handleCropComplete(_croppedArea, croppedPixels) {
    setCroppedAreaPixels(croppedPixels)
  }

  async function createCroppedImage(imageSrc, pixelCrop) {
    const image = new Image()

    image.src = imageSrc

    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
    })

    const canvas = document.createElement('canvas')

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Unable to create image canvas.')
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Unable to crop image.'))
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        0.9
      )
    })
  }

  async function handleCropSave() {
    if (!selectedImage || !croppedAreaPixels) {
      toast.error('Please position your image first.')
      return
    }

    const currentLock = getEditLock(profile?.profile_updated_at)

    if (currentLock.locked) {
      toast.error(
        `You can change your profile picture again on ${formatLongDate(
          currentLock.unlockDate
        )}.`
      )
      return
    }

    const confirmSave = window.confirm(
      `After saving, you will not be able to change your profile picture or edit your profile details again for ${PROFILE_EDIT_COOLDOWN_DAYS} days.\n\nMake sure this is a clear, real photo of you. Save picture?`
    )

    if (!confirmSave) return

    setUploadingImage(true)

    try {
      const croppedBlob = await createCroppedImage(
        selectedImage,
        croppedAreaPixels
      )

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Unable to identify your account.')
        return
      }

      // Unique file name: the database link (protected by the
      // 60-day trigger) decides which picture is used, so an old
      // file can never be silently overwritten.
      const filePath = `${user.id}/avatar-${Date.now()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          upsert: false,
          contentType: 'image/jpeg',
        })

      if (uploadError) {
        console.error('Upload Error:', uploadError)
        toast.error(uploadError.message)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = publicUrlData.publicUrl

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: avatarUrl,
          avatar_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('avatar_url, avatar_uploaded_at, profile_updated_at')
        .single()

      if (updateError) {
        console.error('Avatar Database Error:', updateError)

        // The new file was not accepted, so remove it again
        await supabase.storage.from('avatars').remove([filePath])

        if (updateError.message?.includes('PROFILE_EDIT_LOCKED')) {
          toast.error(
            updateError.message.replace('PROFILE_EDIT_LOCKED: ', '')
          )
          closeCropper()
          fetchProfile({ silent: true })
          return
        }

        toast.error(updateError.message)
        return
      }

      // Remove older pictures of this user
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id)

      const oldPaths = (files || [])
        .map(file => `${user.id}/${file.name}`)
        .filter(path => path !== filePath)

      if (oldPaths.length) {
        await supabase.storage.from('avatars').remove(oldPaths)
      }

      setProfile(previous => ({
        ...previous,
        ...data,
      }))

      closeCropper()

      toast.success(
        `Profile picture updated. You can make changes again in ${PROFILE_EDIT_COOLDOWN_DAYS} days.`
      )
    } catch (error) {
      console.error('Image Crop/Upload Error:', error)

      toast.error('Something went wrong while updating your picture.')
    } finally {
      setUploadingImage(false)
    }
  }

  function closeCropper() {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage)
    }

    setSelectedImage(null)
    setShowCropper(false)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  async function handleRemoveImage() {
    if (!profile?.avatar_url) return

    const currentLock = getEditLock(profile.profile_updated_at)

    if (currentLock.locked) {
      toast.error(
        `You can change your profile picture again on ${formatLongDate(
          currentLock.unlockDate
        )}.`
      )
      return
    }

    const confirmRemove = window.confirm(
      `Remove your profile picture?\n\nAfter this, you will not be able to change your profile picture or edit your profile details again for ${PROFILE_EDIT_COOLDOWN_DAYS} days.`
    )

    if (!confirmRemove) return

    setUploadingImage(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Unable to identify your account.')
        return
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          avatar_uploaded_at: null,
        })
        .eq('id', user.id)
        .select('avatar_url, avatar_uploaded_at, profile_updated_at')
        .single()

      if (updateError) {
        console.error('Remove Avatar Error:', updateError)

        if (updateError.message?.includes('PROFILE_EDIT_LOCKED')) {
          toast.error(
            updateError.message.replace('PROFILE_EDIT_LOCKED: ', '')
          )
          fetchProfile({ silent: true })
          return
        }

        toast.error(updateError.message)
        return
      }

      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id)

      if (files?.length) {
        const filePaths = files.map(file => `${user.id}/${file.name}`)

        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove(filePaths)

        if (removeError) {
          console.error('Storage Remove Error:', removeError)
        }
      }

      setProfile(previous => ({
        ...previous,
        ...data,
      }))

      toast.success(
        `Profile picture removed. You can make changes again in ${PROFILE_EDIT_COOLDOWN_DAYS} days.`
      )
    } catch (error) {
      console.error('Remove Image Error:', error)

      toast.error('Unable to remove profile picture.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleCoverSelect(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return

  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')

  if (!isVideo && !isImage) {
    toast.error('Please choose an image or a video.')
    return
  }

  const MAX_VIDEO_MB = 30
const MAX_IMAGE_MB = 10

if (file.size > (isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB) * 1024 * 1024) {
  toast.error(
    isVideo
      ? `Video must be under ${MAX_VIDEO_MB}MB.`
      : `Image must be under ${MAX_IMAGE_MB}MB.`
  )
  return
}

  setUploadingCover(true)

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast.error('Unable to identify your account.')
      return
    }

    const ext = file.name.split('.').pop().toLowerCase()
    const filePath = `${user.id}/cover-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, file, { upsert: false, contentType: file.type })

    if (uploadError) {
      toast.error(uploadError.message)
      return
    }

    const { data: urlData } = supabase.storage.from('covers').getPublicUrl(filePath)

    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        cover_url: urlData.publicUrl,
        cover_type: isVideo ? 'video' : 'image',
        cover_uploaded_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('cover_url, cover_type, cover_uploaded_at, profile_updated_at')
      .single()

    if (updateError) {
      await supabase.storage.from('covers').remove([filePath])

      if (updateError.message?.includes('PROFILE_EDIT_LOCKED')) {
        toast.error(updateError.message.replace('PROFILE_EDIT_LOCKED: ', ''))
        fetchProfile({ silent: true })
        return
      }

      toast.error(updateError.message)
      return
    }

    // remove older covers of this user
    const { data: files } = await supabase.storage.from('covers').list(user.id)
    const oldPaths = (files || [])
      .map(f => `${user.id}/${f.name}`)
      .filter(p => p !== filePath)
    if (oldPaths.length) await supabase.storage.from('covers').remove(oldPaths)

    setProfile(prev => ({ ...prev, ...data }))
    toast.success('Cover updated.')
  } catch (error) {
    console.error('Cover upload error:', error)
    toast.error('Unable to update your cover.')
  } finally {
    setUploadingCover(false)
  }
}

async function handleRemoveCover() {
  if (!profile?.cover_url) return
  if (!window.confirm('Remove your cover?')) return

  setUploadingCover(true)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .update({ cover_url: null, cover_type: null, cover_uploaded_at: null })
      .eq('id', user.id)
      .select('cover_url, cover_type, cover_uploaded_at, profile_updated_at')
      .single()

    if (error) {
      if (error.message?.includes('PROFILE_EDIT_LOCKED')) {
        toast.error(error.message.replace('PROFILE_EDIT_LOCKED: ', ''))
        fetchProfile({ silent: true })
        return
      }
      toast.error(error.message)
      return
    }

    const { data: files } = await supabase.storage.from('covers').list(user.id)
    if (files?.length) {
      await supabase.storage.from('covers').remove(files.map(f => `${user.id}/${f.name}`))
    }

    setProfile(prev => ({ ...prev, ...data }))
    toast.success('Cover removed.')
  } finally {
    setUploadingCover(false)
  }
}

  /* =======================================================
     EDIT PROFILE (covered by the 60-day lock)
  ======================================================= */

  function startEditing() {
    const currentLock = getEditLock(profile?.profile_updated_at)

    if (currentLock.locked) {
      toast.error(
        `You can edit your profile again on ${formatLongDate(
          currentLock.unlockDate
        )}.`
      )
      return
    }

    setForm(formFromProfile(profile))
    setEditing(true)
  }

  function hasProfileChanges() {
    if (!profile) return false

    return (
      form.name.trim() !== (profile.name || '') ||
      form.username.trim() !== (profile.username || '') ||
      form.phone.trim() !== (profile.phone || '') ||
      form.address.trim() !== (profile.address || '') ||
      form.bio.trim() !== (profile.bio || '') ||
      (form.birthday || '') !== (profile.birthday || '') ||
      (form.gender || '') !== (profile.gender || '')
    )
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Full name is required.')
      return
    }

    // ==========================================
    // STRICT PHILIPPINE MOBILE NUMBER
    // ==========================================
    const phone = form.phone.trim()

    if (phone && !/^09\d{9}$/.test(phone)) {
      toast.error(
        'Please enter a valid Philippine mobile number (09XXXXXXXXX).'
      )
      return
    }

    // Nothing changed: no need to start a 60-day lock
    if (!hasProfileChanges()) {
      toast('No changes to save.')
      setEditing(false)
      return
    }

    const confirmSave = window.confirm(
      `After saving, you will not be able to edit your profile details or change your profile picture again for ${PROFILE_EDIT_COOLDOWN_DAYS} days.\n\nPlease make sure everything is correct. Save changes?`
    )

    if (!confirmSave) return

    setSaving(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        toast.error('Unable to identify your account.')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          name: form.name.trim(),
          username: form.username.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          bio: form.bio.trim() || null,
          birthday: form.birthday || null,
          gender: form.gender || null,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Update Profile Error:', error)

        // Database trigger rejected the edit (60-day lock)
        if (error.message?.includes('PROFILE_EDIT_LOCKED')) {
          toast.error(error.message.replace('PROFILE_EDIT_LOCKED: ', ''))
          setEditing(false)
          fetchProfile({ silent: true })
          return
        }

        toast.error(error.message)
        return
      }

      setProfile(previous => ({
        ...previous,
        ...data,
      }))

      setForm(formFromProfile(data))

      setEditing(false)

      toast.success(
        `Profile updated. You can edit again in ${PROFILE_EDIT_COOLDOWN_DAYS} days.`
      )
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (!profile) return

    setForm(formFromProfile(profile))

    setEditing(false)
  }

  function formatUploadedDate(timestamp) {
    if (!timestamp) return null

    const date = new Date(timestamp)

    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /* =======================================================
     ADDRESS EDITOR (changes are applied together with
     "Save Changes" so only ONE 60-day lock is started)
  ======================================================= */

  function isNCRRegion(regionCode) {
    const selectedRegion = regions.find(
      item => String(item.code) === String(regionCode)
    )

    if (!selectedRegion) return false

    const name = selectedRegion.name?.toLowerCase() || ''

    return (
      name.includes('national capital region') ||
      name.includes('(ncr)')
    )
  }

  useEffect(() => {
    let cancelled = false

    async function loadRegions() {
      try {
        setLoadingRegions(true)

        const data = await fetchPSGC('/regions')

        if (!cancelled) setRegions(data)
      } catch (error) {
        console.error('Profile region loading error:', error)

        toast.error('Unable to load regions.')
      } finally {
        if (!cancelled) setLoadingRegions(false)
      }
    }

    loadRegions()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProvinces() {
      if (!addressForm.region || isNCRRegion(addressForm.region)) {
        setProvinces([])
        return
      }

      try {
        setLoadingProvinces(true)

        const data = await fetchPSGC(
          `/regions/${encodeURIComponent(addressForm.region)}/provinces`
        )

        if (!cancelled) setProvinces(data)
      } catch (error) {
        console.error('Profile province loading error:', error)

        if (!cancelled) setProvinces([])
      } finally {
        if (!cancelled) setLoadingProvinces(false)
      }
    }

    loadProvinces()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.region, regions])

  useEffect(() => {
    let cancelled = false

    async function loadCities() {
      if (!addressForm.region) {
        setCitiesMunicipalities([])
        return
      }

      try {
        setLoadingCities(true)

        let data = []

        if (isNCRRegion(addressForm.region)) {
          data = await fetchPSGC(
            `/regions/${encodeURIComponent(
              addressForm.region
            )}/cities-municipalities`
          )
        } else if (addressForm.province) {
          data = await fetchPSGC(
            `/provinces/${encodeURIComponent(
              addressForm.province
            )}/cities-municipalities`
          )
        }

        if (!cancelled) setCitiesMunicipalities(data)
      } catch (error) {
        console.error('Profile city loading error:', error)

        if (!cancelled) setCitiesMunicipalities([])
      } finally {
        if (!cancelled) setLoadingCities(false)
      }
    }

    loadCities()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.region, addressForm.province, regions])

  useEffect(() => {
    let cancelled = false

    async function loadBarangays() {
      if (!addressForm.city) {
        setBarangays([])
        return
      }

      try {
        setLoadingBarangays(true)

        const data = await fetchPSGC(
          `/cities-municipalities/${encodeURIComponent(
            addressForm.city
          )}/barangays`
        )

        if (!cancelled) setBarangays(data)
      } catch (error) {
        console.error('Profile barangay loading error:', error)

        if (!cancelled) setBarangays([])
      } finally {
        if (!cancelled) setLoadingBarangays(false)
      }
    }

    loadBarangays()

    return () => {
      cancelled = true
    }
  }, [addressForm.city])

  function buildAddress(overrides = {}) {
    const current = {
      ...addressForm,
      ...overrides,
    }

    const selectedRegion = regions.find(
      item => String(item.code) === String(current.region)
    )

    const selectedProvince = provinces.find(
      item => String(item.code) === String(current.province)
    )

    const selectedCity = citiesMunicipalities.find(
      item => String(item.code) === String(current.city)
    )

    const selectedBarangay = barangays.find(
      item => String(item.code) === String(current.barangay)
    )

    const ncr = /national capital region|\(ncr\)|^ncr$/i.test(
      selectedRegion?.name || ''
    )

    const parts = [
      current.street,
      selectedBarangay?.name,
      selectedCity?.name,
      !ncr ? selectedProvince?.name : null,
      selectedRegion?.name,
      current.zipCode,
    ].filter(Boolean)

    return parts.join(', ')
  }

  function handleAddressRegionChange(e) {
    const value = e.target.value

    setAddressForm(previous => ({
      ...previous,
      region: value,
      province: '',
      city: '',
      barangay: '',
      street: '',
      zipCode: '',
    }))

    setProvinces([])
    setCitiesMunicipalities([])
    setBarangays([])
  }

  function handleAddressProvinceChange(e) {
    const value = e.target.value

    setAddressForm(previous => ({
      ...previous,
      province: value,
      city: '',
      barangay: '',
      street: '',
      zipCode: '',
    }))

    setCitiesMunicipalities([])
    setBarangays([])
  }

  async function handleAddressCityChange(e) {
    const value = e.target.value

    const selected = citiesMunicipalities.find(
      item => String(item.code) === String(value)
    )

    // Use whatever PSGC already has, or the local fallback
    const immediateZip = getZipCode(selected)

    setAddressForm(prev => ({
      ...prev,
      city: value,
      barangay: '',
      zipCode: immediateZip,
    }))

    // Barangays load automatically from the effect above
    setBarangays([])

    // No ZIP yet: do the async lookup
    if (!immediateZip && selected) {
      try {
        setLoadingZip(true)

        const resolvedZip = await fetchZipCode(
          selected.code,
          selected.name,
          selected
        )

        if (resolvedZip) {
          setAddressForm(prev => {
            // Ignore if the user picked another city while waiting
            if (String(prev.city) !== String(value)) {
              return prev
            }

            return {
              ...prev,
              zipCode: resolvedZip,
            }
          })
        }
      } catch (error) {
        console.error('ZIP resolution error:', error)
      } finally {
        setLoadingZip(false)
      }
    }
  }

  function handleAddressBarangayChange(e) {
    const value = e.target.value

    setAddressForm(previous => ({
      ...previous,
      barangay: value,
    }))
  }

  function handleAddressStreetChange(e) {
    const value = e.target.value

    setAddressForm(previous => ({
      ...previous,
      street: value,
    }))
  }

  function openAddressEditor() {
    setAddressForm({
      region: '',
      province: '',
      city: '',
      barangay: '',
      street: '',
      zipCode: '',
    })

    setProvinces([])
    setCitiesMunicipalities([])
    setBarangays([])

    setShowAddressEditor(true)
  }

  // Applies the new address to the edit form only.
  // It is saved to the database with "Save Changes".
  function handleApplyAddress() {
    if (!addressForm.region) {
      toast.error('Please select your region.')
      return
    }

    if (!isNCRRegion(addressForm.region) && !addressForm.province) {
      toast.error('Please select your province.')
      return
    }

    if (!addressForm.city) {
      toast.error('Please select your city or municipality.')
      return
    }

    if (!addressForm.barangay) {
      toast.error('Please select your barangay.')
      return
    }

    if (!addressForm.street.trim()) {
      toast.error('Please enter your street, house number, or building.')
      return
    }

    const newAddress = buildAddress().trim()

    if (!newAddress) {
      toast.error('Unable to create the complete address.')
      return
    }

    setForm(previous => ({
      ...previous,
      address: newAddress,
    }))

    setShowAddressEditor(false)

    toast.success('New address selected. Click "Save Changes" to apply it.')
  }

 

  /* =========================================================
     IMPORTANT:
     This loading screen intentionally has NO ROLE COLOR.
     It must not render violet before profile.role is known.
  ========================================================= */

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes neutralFloat {
            0%,100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-7px);
            }
          }

          @keyframes neutralPulse {
            0%,100% {
              opacity: .55;
            }
            50% {
              opacity: 1;
            }
          }

          .neutral-loading-card {
            animation: neutralFloat 4s ease-in-out infinite;
          }

          .neutral-loading-line {
            animation: neutralPulse 1.8s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            .neutral-loading-card,
            .neutral-loading-line {
              animation: none !important;
            }
          }
        `}</style>

        <div className="relative min-h-screen overflow-hidden bg-[#f6f7f9] px-4 py-6 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100">
            <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-slate-300/20 blur-3xl" />
            <div className="absolute bottom-[-180px] left-[20%] h-[360px] w-[650px] rotate-[-8deg] rounded-[50%] bg-slate-300/30 blur-3xl" />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[#f6f7f9]" />

          <Toaster position="top-right" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-7">
              <div className="neutral-loading-line h-3 w-24 rounded-full bg-slate-200" />
              <div className="neutral-loading-line mt-3 h-8 w-40 rounded-xl bg-slate-200" />
              <div className="neutral-loading-line mt-3 h-4 w-72 rounded-full bg-slate-200" />
            </div>

            <div className="neutral-loading-card overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,.08)] backdrop-blur-2xl">
              <div className="h-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />

              <div className="p-6 sm:p-9">
                <div className="-mt-16 h-28 w-28 rounded-full border-8 border-white bg-slate-200 shadow-xl" />

                <div className="mt-6">
                  <div className="h-6 w-52 rounded-lg bg-slate-200" />
                  <div className="mt-3 h-4 w-32 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <style>{`
          @keyframes emptyFloat {
            0%,100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-7px) scale(1.015);
            }
          }

          .empty-icon {
            animation: emptyFloat 3.5s ease-in-out infinite;
          }
        `}</style>

        <div className="relative min-h-screen overflow-hidden bg-[#f6f7f9] px-4 py-8 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-br from-slate-100 via-white to-slate-100" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[#f6f7f9]" />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute right-[-160px] top-[-160px] h-[520px] w-[520px] rounded-full bg-slate-300/20 blur-3xl" />
            <div className="absolute bottom-[-160px] left-[-160px] h-[520px] w-[520px] rounded-full bg-slate-200/70 blur-3xl" />
          </div>

          <Toaster position="top-right" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">
                Service Center
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Your service account profile.
              </p>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_80px_rgba(15,23,42,.10)] backdrop-blur-2xl">
              <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                <div className="empty-icon flex h-24 w-24 items-center justify-center rounded-[30px] border border-white bg-white/75 text-slate-500 shadow-[0_20px_45px_rgba(15,23,42,.10)] backdrop-blur-xl">
                  <Icon name="userRound" size={38} />
                </div>

                <h2 className="mt-7 text-2xl font-black text-slate-950">
                  Profile not found
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  We could not find your account information.
                  Please try again or contact your service administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const roleLower = String(profile.role || '').toLowerCase()

  const roleName = profile.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : 'User'

  const initials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U'

  const uploadedDate = formatUploadedDate(profile.avatar_uploaded_at)

  // 60-day edit lock
  const lock = getEditLock(profile.profile_updated_at)
  const unlockDateText = formatLongDate(lock.unlockDate)
  const lastEditText = formatLongDate(lock.lastEdit)

  const roleVisual =
    roleLower === 'admin'
      ? {
          label: 'Service Administrator',
          gradient: 'from-violet-500 via-purple-500 to-indigo-500',
          soft: 'bg-violet-50 text-violet-700 border-violet-100',
          window: 'from-violet-600 via-purple-600 to-indigo-600',
          windowSoft: 'bg-violet-50/80',
          windowBorder: 'border-violet-200/70',
          windowGlow: 'bg-violet-500/20',
          accent: 'text-violet-600',
          button: 'from-violet-600 via-purple-600 to-indigo-600',
          iconBg: 'from-violet-500 to-purple-600',
          iconSoft: 'bg-violet-50 text-violet-600',
        }
      : roleLower === 'technician'
        ? {
            label: 'Automotive Technician',
            gradient: 'from-orange-400 via-orange-500 to-red-500',
            soft: 'bg-orange-50 text-orange-700 border-orange-100',
            window: 'from-orange-400 via-orange-500 to-red-500',
            windowSoft: 'bg-orange-50/80',
            windowBorder: 'border-orange-200/70',
            windowGlow: 'bg-orange-500/20',
            accent: 'text-orange-600',
            button: 'from-orange-500 via-orange-500 to-red-500',
            iconBg: 'from-orange-400 to-orange-600',
            iconSoft: 'bg-orange-50 text-orange-600',
          }
        : {
            label: 'Service Customer',
            gradient: 'from-red-400 via-red-500 to-rose-600',
            soft: 'bg-red-50 text-red-700 border-red-100',
            window: 'from-red-400 via-red-500 to-rose-600',
            windowSoft: 'bg-red-50/80',
            windowBorder: 'border-red-200/70',
            windowGlow: 'bg-red-500/20',
            accent: 'text-red-600',
            button: 'from-red-600 via-red-500 to-rose-500',
            iconBg: 'from-red-500 to-rose-600',
            iconSoft: 'bg-red-50 text-red-600',
          }

  const roleIcon =
    roleLower === 'admin'
      ? 'shield'
      : roleLower === 'technician'
        ? 'wrench'
        : 'car'

  const addressChanged =
    editing && form.address.trim() !== (profile.address || '')
  const hasCover = Boolean(profile.cover_url)

  return (
    <>
      <style>{`
        @keyframes liquidFloatOne {
          0%,100% {
            transform: translate3d(0,0,0) rotate(0deg);
          }
          50% {
            transform: translate3d(35px,-25px,0) rotate(7deg);
          }
        }

        @keyframes liquidFloatTwo {
          0%,100% {
            transform: translate3d(0,0,0) rotate(0deg);
          }
          50% {
            transform: translate3d(-35px,30px,0) rotate(-8deg);
          }
        }

        @keyframes liquidFloatThree {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }
          50% {
            transform: translate3d(20px,10px,0) scale(1.08);
          }
        }

        @keyframes glassShine {
          0% {
            transform: translateX(-120%) rotate(12deg);
          }
          100% {
            transform: translateX(220%) rotate(12deg);
          }
        }

        @keyframes statusPulse {
          0%,100% {
            box-shadow:
              0 0 0 0 rgba(34,197,94,.25);
          }
          50% {
            box-shadow:
              0 0 0 7px rgba(34,197,94,0);
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .liquid-one {
          animation: liquidFloatOne 12s ease-in-out infinite;
        }

        .liquid-two {
          animation: liquidFloatTwo 15s ease-in-out infinite;
        }

        .liquid-three {
          animation: liquidFloatThree 10s ease-in-out infinite;
        }

        .glass-shine {
          animation: glassShine 8s ease-in-out infinite;
        }

        .status-pulse {
          animation: statusPulse 2.5s ease-in-out infinite;
        }

        .modal-enter {
          animation: modalIn .28s cubic-bezier(.22,1,.36,1);
        }

        .premium-glass {
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.88),
              rgba(255,255,255,.58)
            );

          backdrop-filter:
            blur(24px)
            saturate(150%);

          -webkit-backdrop-filter:
            blur(24px)
            saturate(150%);

          border:
            1px solid
            rgba(255,255,255,.85);

          box-shadow:
            0 25px 70px
              rgba(15,23,42,.08),
            inset 0 1px 0
              rgba(255,255,255,.9);
        }

        .premium-glass-dark {
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.88),
              rgba(255,255,255,.58)
            );

          backdrop-filter:
            blur(30px)
            saturate(160%);

          -webkit-backdrop-filter:
            blur(30px)
            saturate(160%);

          border:
            1px solid
            rgba(255,255,255,.8);

          box-shadow:
            0 30px 90px
              rgba(15,23,42,.12),
            inset 0 1px 0
              rgba(255,255,255,.95);
        }

        .glass-input {
          background: rgba(255,255,255,.68);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226,232,240,.85);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.9),
            0 8px 24px rgba(15,23,42,.025);
        }

        .glass-input:focus {
          background: rgba(255,255,255,.92);
          border-color: rgba(239,68,68,.55);
          box-shadow:
            0 0 0 4px rgba(239,68,68,.08),
            0 10px 30px rgba(239,68,68,.08);
        }

        .premium-button {
          transition:
            transform .25s cubic-bezier(.22,1,.36,1),
            box-shadow .25s ease,
            background .25s ease;
        }

        .premium-button:hover {
          transform:
            translateY(-3px)
            scale(1.015);
        }

        .premium-button:active {
          transform:
            translateY(0)
            scale(.98);
        }

        .premium-button:disabled:hover {
          transform: none;
        }

        /*
         * FLOATING/Bouncy card movement removed.
         * Cards no longer translate when hovered.
         */
        .floating-card {
          transition:
            box-shadow .35s ease,
            border-color .35s ease;
        }

        .floating-card:hover {
          box-shadow:
            0 35px 90px rgba(15,23,42,.11),
            inset 0 1px 0 rgba(255,255,255,.95);
        }

        .profile-avatar-frame {
          position: relative;
          width: 6rem;
          height: 6rem;
          min-width: 6rem;
          min-height: 6rem;
          max-width: 6rem;
          max-height: 6rem;
          flex: 0 0 6rem;
          aspect-ratio: 1 / 1;
          border-radius: 9999px;
          overflow: visible;
        }

        .profile-avatar-ring {
          position: relative;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          max-width: 100%;
          max-height: 100%;
          aspect-ratio: 1 / 1;
          flex: 0 0 auto;
          border-radius: 9999px;
          overflow: hidden;
        }

        .profile-avatar-image {
          display: block;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          max-width: 100%;
          max-height: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 9999px;
          object-fit: cover;
          object-position: center;
        }

        @media (min-width: 640px) {
          .profile-avatar-frame {
            width: 7rem;
            height: 7rem;
            min-width: 7rem;
            min-height: 7rem;
            max-width: 7rem;
            max-height: 7rem;
            flex-basis: 7rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .liquid-one,
          .liquid-two,
          .liquid-three,
          .glass-shine,
          .status-pulse,
          .modal-enter {
            animation: none !important;
          }

          .premium-button,
          .floating-card {
            transition: none !important;
          }
        }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#f6f7f9] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        {/* BACKGROUND */}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[47%] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100" />

          <div
            className={`absolute -right-32 -top-40 h-[520px] w-[620px] rounded-[45%_55%_60%_40%] bg-gradient-to-br ${roleVisual.gradient} opacity-10 blur-3xl`}
          />

          <div className="liquid-one absolute -left-48 bottom-[-220px] h-[500px] w-[760px] rotate-[-8deg] rounded-[50%] bg-gradient-to-tr from-slate-200/80 via-white/80 to-transparent blur-3xl" />

          <div className="liquid-three absolute left-[28%] bottom-[-170px] h-[280px] w-[650px] rotate-[-8deg] rounded-[50%] bg-gradient-to-r from-transparent via-white to-transparent blur-3xl" />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-[35%] h-[24%]"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,255,255,.85), rgba(255,255,255,.45), rgba(246,247,249,0))',
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-[#f6f7f9]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[15%] h-[420px] w-[420px] rounded-full bg-white/80 blur-3xl" />

          <div className="liquid-two absolute -bottom-48 -left-48 h-[620px] w-[680px] rounded-[55%_45%_40%_60%] bg-gradient-to-tr from-slate-300/65 via-slate-200/45 to-transparent blur-3xl" />

          <div className="liquid-three absolute left-[25%] top-[45%] h-[260px] w-[650px] rotate-[-10deg] rounded-[50%] bg-gradient-to-r from-white/80 via-red-100/45 to-white/80 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[.12]"
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(148,163,184,.13) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(148,163,184,.13) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: '46px 46px',
              maskImage:
                'linear-gradient(to bottom, black, transparent 80%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black, transparent 80%)',
            }}
          />
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '18px',
              fontSize: '13px',
              fontWeight: '700',
              padding: '13px 16px',
              boxShadow: '0 18px 45px rgba(15,23,42,.12)',
            },
          }}
        />

        <div className="relative mx-auto w-full max-w-6xl">

          {/* HEADER */}

          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border ${roleVisual.windowBorder} ${roleVisual.windowSoft} ${roleVisual.accent} shadow-sm backdrop-blur-xl`}
                  >
                    <Icon name="settings" size={17} />
                  </span>

                  <span
                    className={`text-[10px] font-black uppercase tracking-[.2em] ${roleVisual.accent} sm:text-xs`}
                  >
                    Service Center
                  </span>
                </div>

                <h1 className="text-3xl font-black tracking-[-.04em] text-slate-950 sm:text-4xl lg:text-[44px]">
                  My Profile
                </h1>

                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                  Your personal service identity, account information,
                  and profile controls in one premium workspace.
                </p>
              </div>

              <div
                className={`hidden rounded-2xl border ${roleVisual.windowBorder} ${roleVisual.windowSoft} px-4 py-3 shadow-xl backdrop-blur-2xl lg:block`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${roleVisual.gradient} text-white`}
                  >
                    <Icon name="globe" size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-black text-slate-900">
                      Global Service Platform
                    </p>

                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                      Your profile travels with your account
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </header>

          {/* PROFILE HERO */}

          <section className="premium-glass-dark relative mb-5 overflow-hidden rounded-[30px] sm:mb-7 sm:rounded-[38px]">

            <div className="glass-shine pointer-events-none absolute -left-[30%] top-0 h-full w-[25%] bg-gradient-to-r from-transparent via-white/60 to-transparent blur-xl" />

<HeroCover
  media={
    profile.cover_url
      ? { type: profile.cover_type, src: profile.cover_url }
      : null
  }
  roleVisual={roleVisual}
/>
            <div
              className={`pointer-events-none absolute -right-20 -top-32 h-80 w-[520px] rotate-[-12deg] rounded-[50%] ${roleVisual.windowGlow} blur-2xl`}
            />

            <div className="pointer-events-none absolute -left-40 bottom-[-180px] h-96 w-[600px] rounded-[50%] bg-gradient-to-tr from-slate-300/70 via-white/40 to-transparent blur-3xl" />

            <div className="relative overflow-hidden px-5 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-8">
              <div className="relative z-10 max-w-2xl pr-0 sm:max-w-[68%] sm:pr-4 lg:max-w-[65%]">

                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,.12)] backdrop-blur-xl sm:text-[10px]">
                    <Icon name={roleIcon} size={12} />
                    {roleVisual.label}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[9px] font-black text-slate-800 shadow-[0_10px_25px_rgba(15,23,42,.12)] backdrop-blur-xl sm:text-[10px]">
                    <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Active Account
                  </span>
                </div>

                <h2
  className={`mt-5 text-2xl font-black tracking-[-.03em] sm:text-3xl lg:text-4xl ${
    hasCover ? 'text-white drop-shadow-md' : 'text-slate-950'
  }`}
>
  Your service profile
</h2>

<p
  className={`mt-2 max-w-xl text-xs font-semibold leading-6 sm:text-sm ${
    hasCover ? 'text-white/90 drop-shadow' : 'text-slate-600'
  }`}
>
  Keep your information current so your automotive
  service experience stays personal, accurate,
  and connected.
</p>
              </div>

              <RoleWindowsLogo
                roleVisual={roleVisual}
                roleName={roleName}
                roleIcon={roleIcon}
              />
            </div>

{/* IDENTITY ROW – white background */}
<div className="relative z-20 -mt-10 px-5 pb-6 sm:-mt-12 sm:px-8 sm:pb-8">
  <div className="rounded-[26px] bg-white/500 px-4 pb-5 pt-4 shadow-[0_18px_45px_rgba(15,23,42,.10)] ring-1 ring-slate-200/70 backdrop-blur-xl sm:px-6 sm:pb-6">
    

   
 
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">

                  <div className="profile-avatar-frame">
                    <div
                      className={`profile-avatar-ring bg-white/90 p-1.5 shadow-[0_25px_50px_rgba(15,23,42,.16)] ring-2 ${roleVisual.windowBorder} backdrop-blur-xl sm:p-2`}
                    >
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="profile-avatar-image"
                        />
                      ) : (
                        <div className="profile-avatar-image flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100">
                          <span
                            className={`text-3xl font-black tracking-tight ${roleVisual.accent} sm:text-4xl`}
                          >
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>

                    <label
                      className={`premium-button absolute bottom-0 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${roleVisual.gradient} text-white shadow-[0_12px_30px_rgba(15,23,42,.25)] sm:h-10 sm:w-10 ${
                        lock.locked
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer'
                      } ${
                        uploadingImage
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }`}
                      title={
                        lock.locked
                          ? `Profile picture locked until ${unlockDateText}`
                          : 'Change profile picture'
                      }
                      onClick={e => {
                        if (lock.locked) {
                          e.preventDefault()

                          toast.error(
                            `You can change your profile picture again on ${unlockDateText}.`
                          )
                        }
                      }}
                    >
                      <Icon
                        name={lock.locked ? 'lock' : 'camera'}
                        size={15}
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={uploadingImage || lock.locked}
                      />
                    </label>
                  </div>

                  <div className="min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="max-w-full truncate text-xl font-black tracking-tight text-slate-950 sm:max-w-[440px] sm:text-2xl">
                        {profile.name}
                      </h2>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-black ${roleVisual.soft} sm:text-[10px]`}
                      >
                        <Icon name={roleIcon} size={11} />
                        {roleName}
                      </span>
                    </div>

                    {profile.username && (
                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        @{profile.username}
                      </p>
                    )}

                    {uploadedDate && (
                      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">
                        <Icon name="image" size={12} />
                        Photo updated {uploadedDate}
                      </p>
                    )}
                    

                    {uploadingImage && (
                      <p
                        className={`mt-2 flex items-center gap-2 text-xs font-bold ${roleVisual.accent}`}
                      >
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Updating profile picture...
                      </p>
                    )}
                  </div>
                  
                </div>

                {!editing && (

                  
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                    
                    <button
                      type="button"
                      onClick={startEditing}
                      disabled={lock.locked}
                      className={`premium-button inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${roleVisual.button} px-6 py-3.5 text-xs font-black text-white shadow-[0_18px_40px_rgba(15,23,42,.18)] hover:shadow-[0_18px_45px_rgba(15,23,42,.22)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm`}
                    >
                      <Icon
                        name={lock.locked ? 'lock' : 'edit'}
                        size={15}
                      />
                      {lock.locked ? 'Editing Locked' : 'Edit Profile'}
                    </button>

                    

                    {lock.locked && (
                      <p className="text-[10px] font-semibold text-slate-500 sm:text-right sm:text-[11px]">
                        Available again on {unlockDateText}
                      </p>
                    )}
                  </div>
                )}
              </div>
   </div>

{(profile.avatar_url || lock.locked) && !uploadingImage && (
  <div className="mt-6 flex flex-col gap-2 border-t border-slate-200/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
    {profile.avatar_url ? (
      <div className="flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={handleRemoveImage}
          disabled={lock.locked}
          className="premium-button inline-flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 sm:text-xs"
        >
          <Icon name="trash" size={14} />
          Remove profile picture
        </button>

        {/* COVER CONTROLS (under Remove profile picture) */}
        <div className="flex flex-wrap items-center gap-1">
          <label
            className={`premium-button inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:text-xs ${
              uploadingCover ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <Icon name="image" size={14} />
            {uploadingCover
              ? 'Uploading cover...'
              : profile.cover_url
                ? 'Change cover'
                : 'Add cover'}

            <input
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={handleCoverSelect}
              className="hidden"
              disabled={uploadingCover}
            />
          </label>

          {profile.cover_url && !uploadingCover && (
            <button
              type="button"
              onClick={handleRemoveCover}
              className="premium-button inline-flex w-fit items-center gap-2 rounded-xl px-2 py-2 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 sm:text-xs"
            >
              <Icon name="trash" size={14} />
              Remove cover
            </button>
          )}
        </div>
      </div>
    ) : (
      <span />
    )}

    {lock.locked && (
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 sm:text-xs">
        <Icon name="lock" size={12} />
        Profile picture locked until {unlockDateText}
      </p>
    )}
  </div>
)}
  </div>

            
          </section>

          

          {/* ACCOUNT INFORMATION */}

          <section
            className={`premium-glass floating-card overflow-hidden rounded-[30px] border ${roleVisual.windowBorder} sm:rounded-[38px]`}
          >
            <div
              className={`h-2 w-full bg-gradient-to-r ${roleVisual.window}`}
            />

            <div className="relative overflow-hidden border-b border-white/80 px-5 py-6 sm:px-8 sm:py-7">
              <div
                className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full ${roleVisual.windowGlow} blur-3xl`}
              />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${roleVisual.iconBg} text-white shadow-[0_12px_28px_rgba(15,23,42,.15)] sm:h-12 sm:w-12`}
                  >
                    <Icon name={roleIcon} size={20} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                      Account Information
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      Personal details used throughout your service account.
                    </p>
                  </div>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-[10px] font-black text-emerald-700 backdrop-blur-xl sm:text-xs">
                  <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Account Active
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">

              {/* 60-DAY LOCK NOTICE */}

              {!editing && lock.locked && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 backdrop-blur-xl">
                  <div className="mt-0.5 shrink-0 text-amber-600">
                    <Icon name="lock" size={17} />
                  </div>

                  <div className="text-xs font-semibold leading-5 text-amber-900">
                    <p>
                      Profile editing is locked. You last saved your
                      profile on {lastEditText}. You can edit it again on{' '}
                      <span className="font-black">{unlockDateText}</span>{' '}
                      ({lock.daysLeft}{' '}
                      {lock.daysLeft === 1 ? 'day' : 'days'} left).
                    </p>

                    <p className="mt-1 font-medium text-amber-800/80">
                      This also applies to your profile picture.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">

                <ProfileField label="Full Name" icon="user">
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  ) : (
                    <ValueBox>
                      {profile.name || 'Not provided'}
                    </ValueBox>
                  )}
                </ProfileField>

                <ProfileField label="Username" icon="id">
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter username"
                      className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  ) : (
                    <ValueBox>
                      {profile.username
                        ? `@${profile.username}`
                        : 'Not provided'}
                    </ValueBox>
                  )}
                </ProfileField>

                <ProfileField label="Email" icon="mail">
                  <ValueBox>
                    <p className="break-all text-sm font-bold text-slate-800">
                      {profile.email || 'Not provided'}
                    </p>

                    <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">
                      <Icon name="lock" size={11} />
                      Email cannot be changed here.
                    </p>
                  </ValueBox>
                </ProfileField>

                <ProfileField label="Phone" icon="phone">
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={11}
                      pattern="09[0-9]{9}"
                      placeholder="09XXXXXXXXX"
                      className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300"
                    />
                  ) : (
                    <ValueBox>
                      {profile.phone || 'Not provided'}
                    </ValueBox>
                  )}
                </ProfileField>

                <ProfileField label="Address" icon="globe">
                  <div className="mt-2.5 rounded-2xl border border-white/80 bg-white/40 px-4 py-3.5">
                    <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-700">
                      {(editing ? form.address : profile.address) ||
                        'Not provided'}
                    </p>

                    {addressChanged && (
                      <p
                        className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold sm:text-xs ${roleVisual.accent}`}
                      >
                        <Icon name="info" size={11} />
                        New address will be saved when you click Save Changes.
                      </p>
                    )}

                    {editing && (
                      <div className="mt-4 border-t border-slate-200/60 pt-3">
                        <button
                          type="button"
                          onClick={openAddressEditor}
                          className="premium-button inline-flex items-center gap-2 rounded-xl bg-white/70 px-3.5 py-2.5 text-xs font-black text-slate-600 shadow-sm backdrop-blur-xl transition-all hover:bg-red-50 hover:text-red-600"
                        >
                          <Icon name="mapPin" size={14} />
                          Change Address
                        </button>
                      </div>
                    )}
                  </div>
                </ProfileField>

                <div className="min-w-0 md:col-span-2">
                  <FieldLabel label="Bio" icon="info" />

                  {editing ? (
                    <div>
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Tell us a little about yourself"
                        rows={4}
                        maxLength={500}
                        className="glass-input mt-2.5 w-full resize-none rounded-2xl px-4 py-3.5 text-sm font-bold leading-6 text-slate-800 outline-none transition-all placeholder:text-slate-300"
                      />

                      <p className="mt-1.5 text-right text-[10px] font-bold text-slate-400">
                        {form.bio.length}/500
                      </p>
                    </div>
                  ) : (
                    <ValueBox>
                      <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-700">
                        {profile.bio || 'Not provided'}
                      </p>
                    </ValueBox>
                  )}
                </div>

                <ProfileField label="Birthday" icon="calendar">
                  {editing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={form.birthday}
                      onChange={handleChange}
                      className="glass-input mt-2.5 block w-full min-w-0 max-w-[300px] rounded-2xl px-3 py-3 text-sm font-bold text-slate-800 outline-none transition-all sm:px-4 sm:py-3.5"
                    />
                  ) : (
                    <ValueBox>
                      {profile.birthday
                        ? new Date(profile.birthday).toLocaleDateString([], {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not provided'}
                    </ValueBox>
                  )}
                </ProfileField>

                <ProfileField label="Gender" icon="userRound">
                  {editing ? (
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  ) : (
                    <ValueBox>
                      <p className="capitalize">
                        {profile.gender
                          ? profile.gender.replace(/-/g, ' ')
                          : 'Not provided'}
                      </p>
                    </ValueBox>
                  )}
                </ProfileField>

                <ProfileField label="Role" icon="shield">
                  <div
                    className={`mt-2.5 rounded-2xl border ${roleVisual.windowBorder} ${roleVisual.windowSoft} px-4 py-3.5`}
                  >
                    <span
                      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black ${roleVisual.soft} sm:text-xs`}
                    >
                      <Icon name={roleIcon} size={13} />
                      <span className="truncate">
                        {roleName}
                      </span>
                    </span>

                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-xs">
                      <Icon name="lock" size={11} />
                      Your account role cannot be changed here.
                    </p>
                  </div>
                </ProfileField>

                <ProfileField label="Account Status" icon="shield">
                  <ValueBox>
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                      <span className="status-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>

                    <p className="mt-2 text-[10px] font-medium text-slate-400 sm:text-xs">
                      Your account is currently available for service.
                    </p>
                  </ValueBox>
                </ProfileField>

              </div>

              {editing && (
                <div className="mt-8 border-t border-slate-200/70 pt-6">
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3.5 backdrop-blur-xl">
                    <div className="mt-0.5 shrink-0 text-amber-600">
                      <Icon name="alert" size={17} />
                    </div>

                    <p className="text-xs font-semibold leading-5 text-amber-900">
                      <span className="font-black">Please check carefully.</span>{' '}
                      After you save, you will not be able to edit these
                      profile details or change your profile picture
                      again for {PROFILE_EDIT_COOLDOWN_DAYS} days.
                    </p>
                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="premium-button inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white bg-white/65 px-6 py-3.5 text-sm font-black text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      <Icon name="x" size={16} />
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className={`premium-button inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${roleVisual.button} px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_40px_rgba(15,23,42,.18)] hover:shadow-[0_22px_50px_rgba(15,23,42,.24)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Icon name="save" size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* FOOTER CARDS */}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-7 sm:grid-cols-3">
            <FooterCard
              icon="car"
              title="Service Ready"
              text="Your profile helps keep automotive service operations organized."
              roleVisual={roleVisual}
            />

            <FooterCard
              icon="wrench"
              title="Workshop Connected"
              text="Your information can support communication across service teams."
              roleVisual={roleVisual}
            />

            <FooterCard
              icon="shield"
              title="Account Protected"
              text="Sensitive account controls remain protected by your platform."
              roleVisual={roleVisual}
            />
          </div>
        </div>
      </div>

      {/* =======================================================
          ADDRESS MODAL
      ======================================================= */}

      {showAddressEditor && (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-xl sm:p-5">

          <div className="modal-enter premium-glass-dark flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] shadow-[0_40px_120px_rgba(15,23,42,.3)] sm:rounded-[36px]">

            {/* HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/70 px-5 py-5 sm:px-7">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <Icon name="mapPin" size={19} />
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Change Address
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Enter your new home address.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setShowAddressEditor(false)}
                className="premium-button flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Close address editor"
              >
                <Icon name="x" size={17} />
              </button>

            </div>

            {/* BODY */}

            <div className="overflow-y-auto p-5 sm:p-7">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* REGION */}

                <ProfileAddressSelect
                  label="Region"
                  value={addressForm.region}
                  onChange={handleAddressRegionChange}
                  disabled={loadingRegions}
                >
                  <option value="">
                    {loadingRegions
                      ? 'Loading regions...'
                      : 'Select Region'}
                  </option>

                  {regions.map(region => (
                    <option
                      key={region.code}
                      value={region.code}
                    >
                      {region.name}
                    </option>
                  ))}
                </ProfileAddressSelect>

                {/* PROVINCE */}

                {!isNCRRegion(addressForm.region) && (
                  <ProfileAddressSelect
                    label="Province"
                    value={addressForm.province}
                    onChange={handleAddressProvinceChange}
                    disabled={
                      !addressForm.region ||
                      loadingProvinces
                    }
                  >
                    <option value="">
                      {!addressForm.region
                        ? 'Select Region First'
                        : loadingProvinces
                          ? 'Loading provinces...'
                          : 'Select Province'}
                    </option>

                    {provinces.map(province => (
                      <option
                        key={province.code}
                        value={province.code}
                      >
                        {province.name}
                      </option>
                    ))}
                  </ProfileAddressSelect>
                )}

                {/* CITY */}

                <ProfileAddressSelect
                  label="City / Municipality"
                  value={addressForm.city}
                  onChange={handleAddressCityChange}
                  disabled={
                    !addressForm.region ||
                    (!addressForm.province &&
                      !isNCRRegion(addressForm.region)) ||
                    loadingCities
                  }
                >
                  <option value="">
                    {!addressForm.region
                      ? 'Select Region First'
                      : !addressForm.province &&
                          !isNCRRegion(addressForm.region)
                        ? 'Select Province First'
                        : loadingCities
                          ? 'Loading cities / municipalities...'
                          : 'Select City / Municipality'}
                  </option>

                  {citiesMunicipalities.map(locality => (
                    <option
                      key={locality.code}
                      value={locality.code}
                    >
                      {locality.name}
                      {locality.type ? ` (${locality.type})` : ''}
                    </option>
                  ))}
                </ProfileAddressSelect>

                {/* BARANGAY */}

                <ProfileAddressSelect
                  label="Barangay"
                  value={addressForm.barangay}
                  onChange={handleAddressBarangayChange}
                  disabled={
                    !addressForm.city ||
                    loadingBarangays
                  }
                >
                  <option value="">
                    {!addressForm.city
                      ? 'Select City / Municipality First'
                      : loadingBarangays
                        ? 'Loading barangays...'
                        : 'Select Barangay'}
                  </option>

                  {barangays.map(barangay => (
                    <option
                      key={barangay.code}
                      value={barangay.code}
                    >
                      {barangay.name}
                    </option>
                  ))}
                </ProfileAddressSelect>

                {/* ZIP */}

                <div className="min-w-0">

                  <label className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">
                    ZIP Code
                  </label>

                  <input
                    type="text"
                    value={addressForm.zipCode}
                    readOnly
                    placeholder={
                      loadingZip
                        ? 'Loading ZIP code...'
                        : 'Automatic ZIP code'
                    }
                    className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none"
                  />

                </div>

                {/* STREET */}

                <div className="min-w-0 sm:col-span-2">

                  <label className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">
                    Street / House No. / Building
                  </label>

                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={handleAddressStreetChange}
                    placeholder="House No., Street, Building"
                    maxLength={150}
                    autoComplete="street-address"
                    className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-300"
                  />

                </div>

              </div>

              {/* PREVIEW */}

              {buildAddress() && (
                <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3.5">

                  <p className="text-[10px] font-black uppercase tracking-[.15em] text-red-500">
                    Complete Address
                  </p>

                  <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-700">
                    {buildAddress()}
                  </p>

                </div>
              )}

              <p className="mt-4 flex items-start gap-2 text-[11px] font-medium leading-5 text-slate-500">
                <span className="mt-0.5 shrink-0">
                  <Icon name="info" size={12} />
                </span>
                The new address is applied to your profile when you
                click Save Changes.
              </p>

            </div>

            {/* FOOTER */}

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/70 px-5 py-5 sm:flex-row sm:justify-end sm:px-7">

              <button
                type="button"
                onClick={() => setShowAddressEditor(false)}
                className="premium-button inline-flex items-center justify-center gap-2 rounded-2xl border border-white bg-white/65 px-6 py-3.5 text-sm font-black text-slate-600 shadow-sm hover:bg-white disabled:opacity-50"
              >
                <Icon name="x" size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyAddress}
                className="premium-button inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_40px_rgba(239,68,68,.22)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon name="mapPin" size={16} />
                Use This Address
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =======================================================
          CROP MODAL
      ======================================================= */}

      {showCropper && selectedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/35 p-3 backdrop-blur-xl sm:p-5">
          <div className="modal-enter premium-glass-dark flex max-h-[95vh] w-full max-w-xl flex-col overflow-hidden rounded-[30px] shadow-[0_40px_120px_rgba(15,23,42,.3)] sm:rounded-[36px]">

            <div className="flex shrink-0 items-center justify-between border-b border-white/70 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                  <Icon name="camera" size={19} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base font-black text-slate-950 sm:text-lg">
                    Crop Profile Picture
                  </h2>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
                    Position your photo inside the circle.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCropper}
                disabled={uploadingImage}
                className="premium-button flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/65 text-slate-500 shadow-sm backdrop-blur-xl hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                aria-label="Close cropper"
              >
                <Icon name="x" size={17} />
              </button>
            </div>

            <div className="relative h-[min(72vw,390px)] min-h-[270px] w-full overflow-hidden bg-slate-950">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="shrink-0 px-4 py-5 sm:px-6 sm:py-6">
              <div className="mb-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-slate-500 sm:text-xs">
                    <Icon name="zoom" size={14} />
                    Zoom
                  </span>

                  <span className="rounded-full border border-white bg-white/70 px-3 py-1.5 text-[10px] font-black text-slate-500 shadow-sm">
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={e =>
                    setZoom(Number(e.target.value))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-red-600"
                  disabled={uploadingImage}
                />
              </div>

              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3">
                <span className="mt-0.5 shrink-0 text-amber-600">
                  <Icon name="alert" size={15} />
                </span>

                <p className="text-[11px] font-semibold leading-5 text-amber-900 sm:text-xs">
                  Please use a clear, real photo of yourself. After
                  saving, you cannot change your profile picture or edit
                  your profile details for {PROFILE_EDIT_COOLDOWN_DAYS}{' '}
                  days. Fake or unrelated photos may lead to account
                  deactivation.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeCropper}
                  disabled={uploadingImage}
                  className="premium-button inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white bg-white/65 px-4 py-3.5 text-sm font-black text-slate-600 shadow-sm backdrop-blur-xl hover:bg-white disabled:opacity-50"
                >
                  <Icon name="x" size={16} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCropSave}
                  disabled={
                    uploadingImage ||
                    !croppedAreaPixels
                  }
                  className="premium-button inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_18px_40px_rgba(239,68,68,.22)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Icon name="camera" size={16} />
                      Save Picture
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* =========================================================
   SMALL PRESENTATION HELPERS
========================================================= */

function FieldLabel({ label, icon }) {
  return (
    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-slate-400 sm:text-xs">
      <Icon name={icon} size={14} />
      {label}
    </label>
  )
}

function ProfileField({ label, icon, children }) {
  return (
    <div className="min-w-0">
      <FieldLabel label={label} icon={icon} />
      {children}
    </div>
  )
}

function ValueBox({ children }) {
  return (
    <div className="mt-2.5 rounded-2xl border border-white/80 bg-white/40 px-4 py-3.5">
      <div className="break-words text-sm font-bold text-slate-800">
        {children}
      </div>
    </div>
  )
}

function ProfileAddressSelect({
  label,
  value,
  onChange,
  disabled,
  children,
}) {
  return (
    <div className="min-w-0">

      <label className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="glass-input mt-2.5 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </select>

    </div>
  )
}

function FooterCard({
  icon,
  title,
  text,
  roleVisual,
}) {
  return (
    <div className="premium-glass floating-card rounded-[26px] p-5 sm:p-6">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${roleVisual.iconSoft}`}
      >
        <Icon name={icon} size={19} />
      </div>

      <h3 className="text-sm font-black text-slate-900">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  )
}