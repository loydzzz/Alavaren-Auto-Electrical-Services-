import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaBolt,
  FaMapMarkerAlt,
  FaCamera,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa'

// =====================================================
// CONSTANTS
// =====================================================

const PSGC_API = 'https://psgc.cloud/api/v2'

const AVATAR_BUCKET = 'avatars'
const MAX_AVATAR_MB = 5
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Days a customer must wait between profile edits (enforced in the database)
const PROFILE_EDIT_COOLDOWN_DAYS = 60

// Only emails from these known providers are accepted.
// Write the domain WITHOUT the "@" (e.g. 'icloud.com', not '@icloud.com').
const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.com.ph',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'proton.me',
  'protonmail.com'
]

// PSGC v2 sometimes returns an empty zip_code.
// The PSGC code is used as the key so spelling/encoding
// differences in city names do not matter.
// PSGC ZIP is always preferred; this is only a fallback.
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
  '1381600000': '1100'  // Quezon City
  // ADD OTHER PSGC LOCATIONS HERE
}

const TERMS = [
  [
    '1. Use of the Service',
    'By creating an account with Alavaren Auto Electrical Services, you agree to provide accurate and complete information when registering and booking appointments.'
  ],
  [
    '2. Appointment Booking',
    'Appointment requests are subject to availability and confirmation by Alavaren Auto Electrical Services. Submitting an appointment request does not automatically guarantee that the requested schedule will be available.'
  ],
  [
    '3. Customer Information',
    'The information you provide, including your name, phone number, email address, address, and vehicle information, may be used for appointment management, customer support, and service-related communication.'
  ],
  [
    '4. Service Information',
    'Customers are responsible for providing accurate vehicle information and describing their vehicle concerns as accurately as possible.'
  ],
  [
    '5. Profile Photo',
    'You must upload a clear, real photo of yourself. Accounts that use fake, cartoon, logo, or unrelated photos may be deactivated by the administrator.'
  ],
  [
    '6. Profile Changes',
    `You may update your profile information inside your account. After you save a change, you must wait ${PROFILE_EDIT_COOLDOWN_DAYS} days before you can edit your profile again. Please make sure your information is correct before saving.`
  ],
  [
    '7. Privacy',
    'Alavaren Auto Electrical Services respects your privacy. Personal information will only be used for legitimate business, appointment, and service-related purposes.'
  ],
  [
    '8. Agreement',
    'By creating an account, you acknowledge that you have read, understood, and agreed to these terms and conditions.'
  ]
]

// =====================================================
// EMAIL HELPER
// Accepts only a valid email whose domain is in the list
// =====================================================

function isAllowedEmail(email) {
  const value = String(email || '').trim().toLowerCase()

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false

  const domain = value.split('@')[1]

  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}

// =====================================================
// PSGC HELPERS
// =====================================================

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
    .replace(/Las PiA\+as/gi, 'Las Piñas')
    .replace(/ParanaA\+que/gi, 'Parañaque')
    .replace(/Paranaque/gi, 'Parañaque')
}

function cleanPSGCItems(items) {
  if (!Array.isArray(items)) return []

  return items.map(item => ({
    ...item,
    name: fixEncoding(item.name),
    region: fixEncoding(item.region),
    province: fixEncoding(item.province),
    city_municipality: fixEncoding(item.city_municipality)
  }))
}

async function fetchPSGC(endpoint) {
  const response = await fetch(`${PSGC_API}${endpoint}`)

  if (!response.ok) {
    throw new Error(`Location request failed: ${response.status}`)
  }

  const data = await response.json()

  let items = []

  if (Array.isArray(data)) {
    items = data
  } else if (Array.isArray(data?.data)) {
    items = data.data
  }

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
    `https://psgc.cloud/api/cities-municipalities/${encodeURIComponent(cityCode)}`
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
    const response = await fetch('https://psgc.cloud/api/cities-municipalities')

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

// =====================================================
// PHOTO HELPER
// Shrinks the photo to max 800px and converts to JPEG
// =====================================================

async function resizeAvatar(file, maxSize = 800) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  canvas
    .getContext('2d')
    .drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob =>
        blob ? resolve(blob) : reject(new Error('Could not process photo.')),
      'image/jpeg',
      0.85
    )
  })
}

// =====================================================
// COMPONENT
// =====================================================

export default function Register() {

  const navigate = useNavigate()

  // ---------------------------------------------------
  // FLOW
  // ---------------------------------------------------

  const [step, setStep] = useState('form') // 'form' | 'review'
  const [submitting, setSubmitting] = useState(false)

  // ---------------------------------------------------
  // FORM
  // ---------------------------------------------------

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',

    region: '',
    province: '',
    cityMunicipality: '',
    barangay: '',
    zipCode: '',
    street: '',

    address: '',

    password: '',
    confirmPassword: ''
  })

  const [emailTouched, setEmailTouched] = useState(false)

  // ---------------------------------------------------
  // PROFILE PHOTO
  // ---------------------------------------------------

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  // ---------------------------------------------------
  // ADDRESS DATA
  // ---------------------------------------------------

  const [regions, setRegions] = useState([])
  const [provinces, setProvinces] = useState([])
  const [citiesMunicipalities, setCitiesMunicipalities] = useState([])
  const [barangays, setBarangays] = useState([])

  const [loadingRegions, setLoadingRegions] = useState(false)
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingZip, setLoadingZip] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // ---------------------------------------------------
  // PASSWORD
  // ---------------------------------------------------

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showReviewPassword, setShowReviewPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })

  // ---------------------------------------------------
  // TERMS
  // ---------------------------------------------------

  const [showTerms, setShowTerms] = useState(false)
  const [termsClosed, setTermsClosed] = useState(false)

  // ---------------------------------------------------
  // VALIDATION REGEX
  // ---------------------------------------------------

  const fullNameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/
  const usernameRegex = /^[A-Za-z0-9_]+$/
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/

  // ---------------------------------------------------
  // NCR DETECTION
  // ---------------------------------------------------

  const selectedRegion = regions.find(
    item => String(item.code) === String(form.region)
  )

  const isNCR =
    form.region === '130000000' ||
    /national capital region|\(ncr\)|^ncr$/i.test(selectedRegion?.name || '')

  // =====================================================
  // LOAD REGIONS
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function loadRegions() {
      try {
        setLoadingRegions(true)
        const data = await fetchPSGC('/regions')
        if (!cancelled) setRegions(data)
      } catch (error) {
        console.error('Region loading error:', error)
      } finally {
        if (!cancelled) setLoadingRegions(false)
      }
    }

    loadRegions()

    return () => {
      cancelled = true
    }
  }, [])

  // =====================================================
  // LOAD PROVINCES WHEN REGION CHANGES
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function loadProvinces() {
      if (!form.region || isNCR) {
        setProvinces([])
        return
      }

      try {
        setLoadingProvinces(true)

        const data = await fetchPSGC(
          `/regions/${encodeURIComponent(form.region)}/provinces`
        )

        if (!cancelled) setProvinces(data)
      } catch (error) {
        console.error('Province loading error:', error)
        if (!cancelled) setProvinces([])
      } finally {
        if (!cancelled) setLoadingProvinces(false)
      }
    }

    loadProvinces()

    return () => {
      cancelled = true
    }
  }, [form.region, isNCR])

  // =====================================================
  // LOAD CITIES / MUNICIPALITIES
  // Region -> Province -> City   (or Region -> City for NCR)
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function loadCitiesMunicipalities() {
      if (!form.region) {
        setCitiesMunicipalities([])
        return
      }

      try {
        setLoadingCities(true)

        let data = []

        if (isNCR) {
          data = await fetchPSGC(
            `/regions/${encodeURIComponent(form.region)}/cities-municipalities`
          )
        } else if (form.province) {
          data = await fetchPSGC(
            `/provinces/${encodeURIComponent(form.province)}/cities-municipalities`
          )
        }

        if (!cancelled) setCitiesMunicipalities(data)
      } catch (error) {
        console.error('City/Municipality loading error:', error)
        if (!cancelled) setCitiesMunicipalities([])
      } finally {
        if (!cancelled) setLoadingCities(false)
      }
    }

    loadCitiesMunicipalities()

    return () => {
      cancelled = true
    }
  }, [form.region, form.province, isNCR])

  // =====================================================
  // LOAD BARANGAYS
  // =====================================================

  useEffect(() => {
    let cancelled = false

    async function loadBarangays() {
      if (!form.cityMunicipality) {
        setBarangays([])
        return
      }

      try {
        setLoadingBarangays(true)

        const data = await fetchPSGC(
          `/cities-municipalities/${encodeURIComponent(
            form.cityMunicipality
          )}/barangays`
        )

        if (!cancelled) setBarangays(data)
      } catch (error) {
        console.error('Barangay loading error:', error)
        if (!cancelled) setBarangays([])
      } finally {
        if (!cancelled) setLoadingBarangays(false)
      }
    }

    loadBarangays()

    return () => {
      cancelled = true
    }
  }, [form.cityMunicipality])

  // =====================================================
  // ADDRESS BUILDER
  // =====================================================

  function updateAddress(overrides = {}) {
    const current = { ...form, ...overrides }

    const region = regions.find(
      item => String(item.code) === String(current.region)
    )

    const province = provinces.find(
      item => String(item.code) === String(current.province)
    )

    const city = citiesMunicipalities.find(
      item => String(item.code) === String(current.cityMunicipality)
    )

    const barangay = barangays.find(
      item => String(item.code) === String(current.barangay)
    )

    const ncr = /national capital region|\(ncr\)|^ncr$/i.test(
      region?.name || ''
    )

    const parts = [
      current.street,
      barangay?.name,
      city?.name,
      !ncr ? province?.name : null, // no province for NCR
      region?.name,
      current.zipCode
    ].filter(Boolean)

    return parts.join(', ')
  }

  // =====================================================
  // ADDRESS HANDLERS
  // =====================================================

  function handleRegionChange(e) {
    const value = e.target.value

    setForm(prev => ({
      ...prev,
      region: value,
      province: '',
      cityMunicipality: '',
      barangay: '',
      zipCode: '',
      street: '',
      address: ''
    }))

    setProvinces([])
    setCitiesMunicipalities([])
    setBarangays([])
  }

  function handleProvinceChange(e) {
    const value = e.target.value

    setForm(prev => ({
      ...prev,
      province: value,
      cityMunicipality: '',
      barangay: '',
      zipCode: '',
      street: '',
      address: ''
    }))

    setCitiesMunicipalities([])
    setBarangays([])
  }

  async function handleCityMunicipalityChange(e) {
    const value = e.target.value

    const selected = citiesMunicipalities.find(
      item => String(item.code) === String(value)
    )

    // Use whatever PSGC already has, or the local fallback
    const immediateZip = getZipCode(selected)

    setForm(prev => ({
      ...prev,
      cityMunicipality: value,
      barangay: '',
      zipCode: immediateZip,
      street: '',
      address: ''
    }))

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
          setForm(prev => {
            // Ignore if the user picked another city while waiting
            if (String(prev.cityMunicipality) !== String(value)) {
              return prev
            }

            return {
              ...prev,
              zipCode: resolvedZip,
              address: updateAddress({ ...prev, zipCode: resolvedZip })
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

  function handleBarangayChange(e) {
    const value = e.target.value

    setForm(prev => {
      const next = { ...prev, barangay: value }
      return { ...next, address: updateAddress(next) }
    })
  }

  function handleStreetChange(e) {
    const value = e.target.value

    setForm(prev => {
      const next = { ...prev, street: value }
      return { ...next, address: updateAddress(next) }
    })
  }

  // =====================================================
  // GENERIC FORM UPDATE
  // =====================================================

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // =====================================================
  // PHOTO HANDLERS
  // =====================================================

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]

    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WEBP image.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      alert(`Your photo must be ${MAX_AVATAR_MB} MB or smaller.`)
      e.target.value = ''
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function removeAvatar() {
    setAvatarFile(null)
    setAvatarPreview('')

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  function checkPasswordStrength(password) {
    const requirements = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    }

    setPasswordRequirements(requirements)

    const passed = Object.values(requirements).filter(Boolean).length

    if (!password) {
      setPasswordStrength('')
    } else if (passed <= 2) {
      setPasswordStrength('weak')
    } else if (passed < 5) {
      setPasswordStrength('fair')
    } else {
      setPasswordStrength('strong')
    }
  }

  // =====================================================
  // VALIDATION
  // Returns an error message, or '' when everything is valid
  // =====================================================

  function validateForm() {
    const fullName = form.fullName.trim()
    const username = form.username.trim()
    const phone = form.phone.trim()

    if (!avatarFile) {
      return 'Please upload a profile photo. A real photo of yourself is required.'
    }

    if (!isAllowedEmail(form.email)) {
      return 'Please use a valid email from a known provider (e.g. Gmail, Yahoo, Outlook).'
    }

    if (!/^09\d{9}$/.test(phone)) {
      return 'Please enter a valid Philippine mobile number (09XXXXXXXXX).'
    }

    if (!form.region) return 'Please select your region.'

    if (!isNCR && !form.province) return 'Please select your province.'

    if (!form.cityMunicipality) {
      return 'Please select your city or municipality.'
    }

    if (!form.barangay) return 'Please select your barangay.'

    if (!form.street.trim()) {
      return 'Please enter your street, house number, or building.'
    }

    if (!fullNameRegex.test(fullName)) {
      return 'Full name can only contain letters and spaces. Numbers, emojis, and special characters are not allowed.'
    }

    if (fullName.length < 2) return 'Please enter a valid full name.'

    if (!usernameRegex.test(username)) {
      return 'Username can only contain letters, numbers, and underscores. Spaces and special characters are not allowed.'
    }

    if (username.length < 3) {
      return 'Username must contain at least 3 characters.'
    }

    if (!strongPasswordRegex.test(form.password)) {
      return 'Password must be at least 12 characters and contain an uppercase letter, lowercase letter, number, and special character.'
    }

    if (form.password !== form.confirmPassword) {
      return 'Passwords do not match!'
    }

    return ''
  }

  // =====================================================
  // STEP 1: FORM SUBMIT -> REVIEW
  // =====================================================

  function handleReview(e) {
    e.preventDefault()

    const message = validateForm()

    if (message) return alert(message)

    setForm(prev => ({ ...prev, address: updateAddress() }))
    setShowReviewPassword(false)
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // =====================================================
  // STEP 2: CONFIRM -> CREATE ACCOUNT
  // =====================================================

  async function handleRegister() {
    if (submitting) return

    setSubmitting(true)

    try {
      const fullName = form.fullName.trim()
      const username = form.username.trim()
      const email = form.email.trim().toLowerCase()
      const phone = form.phone.trim()
      const address = updateAddress().trim()

      // Safety net: never create an account with a disallowed email
      if (!isAllowedEmail(email)) {
        setStep('form')
        return alert(
          'Please use a valid email from a known provider (e.g. Gmail, Yahoo, Outlook).'
        )
      }

      // -----------------------------------------------
      // 1. UPLOAD PROFILE PHOTO
      // -----------------------------------------------

      const blob = await resizeAvatar(avatarFile)
      const path = `registrations/${crypto.randomUUID()}.jpg`

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (uploadError) {
        return alert(`Photo upload failed: ${uploadError.message}`)
      }

      const { data: urlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path)

      const avatarUrl = urlData.publicUrl
      const avatarUploadedAt = new Date().toISOString()

      // -----------------------------------------------
      // 2. SUPABASE AUTH SIGN UP
      // -----------------------------------------------

      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            role: 'customer',
            name: fullName,
            username,
            phone,
            address,
            avatar_url: avatarUrl
          }
        }
      })

      if (error) {
        setStep('form')

        if (error.message.includes('Email not confirmed')) {
          return alert('Please verify your email before logging in.')
        }

        return alert(error.message)
      }

      // -----------------------------------------------
      // 3. INSERT USER PROFILE
      // -----------------------------------------------

      if (data?.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          name: fullName,
          username,
          email,
          phone,
          address,
          role: 'customer',
          avatar_url: avatarUrl,
          avatar_uploaded_at: avatarUploadedAt
        })

        if (insertError) {
          console.log('Insert error:', insertError.message)

          return alert(
            `Account was created, but your profile could not be saved: ${insertError.message}`
          )
        }
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      alert(
        'Account created! Please check your email to verify your account before logging in.'
      )

      navigate('/')
    } catch (err) {
      console.error(err)
      alert(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // =====================================================
  // REVIEW ROWS
  // =====================================================

  const reviewRows = [
    ['Full name', form.fullName.trim()],
    ['Username', form.username.trim()],
    ['Email', form.email.trim()],
    ['Phone', form.phone.trim()],
    ['Address', updateAddress()],
    [
      'Password',
      showReviewPassword
        ? form.password
        : '•'.repeat(Math.min(form.password.length, 12))
    ]
  ]

  const passwordRequirementList = [
    ['length', 'At least 12 characters'],
    ['uppercase', 'At least one uppercase letter'],
    ['lowercase', 'At least one lowercase letter'],
    ['number', 'At least one number'],
    ['special', 'At least one special character']
  ]

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <style>{`

        * { box-sizing: border-box; }

        html, body, #root { margin: 0; min-height: 100%; }

        body {
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
          background: #151719;
        }

        button, input, select { font-family: inherit; }

        .register-page {
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          overflow-x: hidden;
          color: #202124;
          background:
            radial-gradient(circle at 10% 10%, rgba(192, 57, 43, 0.16), transparent 28%),
            radial-gradient(circle at 90% 85%, rgba(192, 57, 43, 0.13), transparent 30%),
            linear-gradient(145deg, #ffffff 0%, #f2f3f4 42%, #dfe2e5 100%);
        }

        .background {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .background::before {
          content: "";
          position: absolute;
          width: 620px;
          height: 620px;
          top: -330px;
          right: -220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192,57,43,0.30) 0%, rgba(192,57,43,0.12) 36%, transparent 70%);
          filter: blur(8px);
        }

        .background::after {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          left: -330px;
          bottom: -330px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(82,88,94,0.22), transparent 70%);
          filter: blur(10px);
        }

        .wave {
          position: absolute;
          left: -8%;
          width: 116%;
          height: 240px;
          border-radius: 50%;
          pointer-events: none;
        }

        .wave-one {
          bottom: -105px;
          background: linear-gradient(135deg, rgba(192,57,43,0.92), rgba(146,43,33,0.95));
          transform: rotate(-4deg);
          box-shadow: 0 -20px 55px rgba(192,57,43,0.15);
          opacity: 0.95;
        }

        .wave-two {
          bottom: -150px;
          background: linear-gradient(135deg, rgba(255,255,255,0.90), rgba(231,233,235,0.96));
          transform: rotate(4deg);
          opacity: 0.96;
        }

        .wave-three {
          bottom: -205px;
          background: linear-gradient(135deg, rgba(55,60,65,0.88), rgba(30,33,36,0.94));
          transform: rotate(-3deg);
          opacity: 0.96;
        }

        .wave-four {
          bottom: -255px;
          background: linear-gradient(135deg, #c0392b, #8e2a21);
          transform: rotate(5deg);
          opacity: 0.98;
        }

        .top-wave {
          position: absolute;
          width: 120%;
          height: 170px;
          left: -10%;
          top: -105px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(192,57,43,0.10), rgba(255,255,255,0.05));
          transform: rotate(-2deg);
          filter: blur(1px);
        }

        .ambient-red {
          position: absolute;
          width: 280px;
          height: 280px;
          left: -130px;
          top: 38%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192,57,43,0.13), transparent 70%);
          filter: blur(8px);
        }

        .ambient-gray {
          position: absolute;
          width: 320px;
          height: 320px;
          right: -150px;
          top: 24%;
          border-radius: 50%;
          border: 1px solid rgba(100,105,110,0.12);
          background: rgba(255,255,255,0.08);
          box-shadow: inset 0 0 50px rgba(255,255,255,0.20);
        }

        .grid-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(255,255,255,0.50) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.50) 1px, transparent 1px);
          background-size: 75px 75px;
          mask-image: linear-gradient(to bottom, black 0%, transparent 70%);
        }
          .top-bar {
  display: flex;
  align-items: center;            /* centers logo + text vertically */
  justify-content: space-between;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;            /* logo and text share the same center line */
  margin: 0;
  min-width: 0;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: 0;
}

.brand-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0;
  line-height: 1.2;
}

.brand-name,
.brand-sub {
  margin: 0;
  line-height: 1.25;
}

.back-button {
  align-self: center;
  margin: 0;
}

        .top-bar {
          width: min(1180px, calc(100% - 32px));
          height: 68px;
          position: relative;
          z-index: 10;
          margin: 18px auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px 0 18px;
          border: 1px solid rgba(255,255,255,0.78);
          border-radius: 18px;
          background: rgba(255,255,255,0.63);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          box-shadow: 0 20px 55px rgba(31,41,55,0.10), inset 0 1px 0 rgba(255,255,255,0.95);
        }

        .brand { display: flex; align-items: center; gap: 11px; min-width: 0; }

        .logo {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #fff;
          background: linear-gradient(145deg, #e74c3c, #c0392b 55%, #922b21);
          box-shadow: 0 9px 24px rgba(192,57,43,0.28), inset 0 1px 0 rgba(255,255,255,0.35);
          font-size: 15px;
          font-weight: 900;
        }

        .brand-info { min-width: 0; }

        .brand-name {
          color: #252525;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brand-sub {
          margin-top: 3px;
          color: #7b8085;
          font-size: 9px;
          letter-spacing: 0.25px;
          white-space: nowrap;
        }

        .back-button {
          flex-shrink: 0;
          height: 38px;
          padding: 0 15px;
          border: 1px solid rgba(192,57,43,0.25);
          border-radius: 11px;
          background: rgba(255,255,255,0.72);
          color: #c0392b;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .back-button:hover {
          background: #c0392b;
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(192,57,43,0.20);
        }

        .register-main {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 42px 16px 95px;
        }

        .register-card {
          width: 100%;
          max-width: 570px;
          position: relative;
          padding: 42px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.82);
          background: linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.61));
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          box-shadow:
            0 40px 100px rgba(20,24,28,0.18),
            0 12px 35px rgba(192,57,43,0.07),
            inset 0 1px 0 rgba(255,255,255,0.98);
        }

        .register-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 9%;
          right: 9%;
          height: 3px;
          border-radius: 0 0 20px 20px;
          background: linear-gradient(90deg, transparent, #922b21, #e74c3c, #922b21, transparent);
        }

        .register-card::after {
          content: "";
          position: absolute;
          width: 220px;
          height: 220px;
          top: -110px;
          right: -110px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(192,57,43,0.15), transparent 70%);
          pointer-events: none;
        }

        .form-header { position: relative; z-index: 1; margin-bottom: 30px; }

        .header-row { display: flex; align-items: center; gap: 13px; margin-bottom: 18px; }

        .header-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: linear-gradient(145deg, #c0392b, #922b21);
          color: #fff;
          box-shadow: 0 12px 27px rgba(192,57,43,0.25), inset 0 1px 0 rgba(255,255,255,0.30);
          transform: rotate(-3deg);
        }

        .header-icon svg { font-size: 19px; }

        .header-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.12);
          color: #c0392b;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .title {
          margin: 0;
          color: #202124;
          font-size: clamp(25px, 4vw, 32px);
          line-height: 1.18;
          font-weight: 900;
          letter-spacing: -0.8px;
        }

        .title-highlight { color: #c0392b; }

        .subtitle {
          max-width: 470px;
          margin: 10px 0 0;
          color: #74787d;
          font-size: 12px;
          line-height: 1.7;
        }

        .register-form { position: relative; z-index: 1; }

        .field { margin-bottom: 15px; }

        .label {
          display: block;
          margin: 0 0 7px 2px;
          color: #565b60;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.9px;
        }

        .input-wrapper { position: relative; display: flex; align-items: center; }

        .input-icon {
          position: absolute;
          left: 15px;
          color: #c0392b;
          font-size: 12px;
          z-index: 2;
          pointer-events: none;
        }

        .input {
          width: 100%;
          height: 47px;
          padding: 0 43px 0 42px;
          border: 1px solid rgba(180,185,190,0.72);
          border-radius: 12px;
          outline: none;
          background: rgba(255,255,255,0.66);
          color: #242424;
          font-size: 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .input::placeholder { color: #a7aaad; }

        .input:hover, .location-select:hover { background: rgba(255,255,255,0.82); }

        .input:focus, .location-select:focus {
          border-color: #c0392b;
          background: rgba(255,255,255,0.96);
          box-shadow: 0 0 0 4px rgba(192,57,43,0.08), 0 9px 24px rgba(31,41,55,0.05);
        }

        .location-select {
          width: 100%;
          height: 47px;
          padding: 0 40px 0 42px;
          border: 1px solid rgba(180,185,190,0.72);
          border-radius: 12px;
          outline: none;
          background: rgba(255,255,255,0.66);
          color: #242424;
          font-size: 12px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .location-select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          background: rgba(235,237,239,0.68);
        }

        .location-select option { color: #242424; background: #fff; }

        .zip-input {
          background: rgba(240,242,244,0.78);
          color: #555;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .address-helper {
          margin: 6px 2px 0;
          color: #85898d;
          font-size: 9px;
          line-height: 1.5;
        }

        .eye-button {
          position: absolute;
          right: 8px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #999;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .eye-button:hover { color: #c0392b; background: rgba(192,57,43,0.07); }

        /* ---------- PROFILE PHOTO ---------- */

        .photo-upload { display: flex; align-items: center; gap: 16px; }

       .photo-square {
  width: 92px;
  height: 92px;
  min-width: 92px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  overflow: hidden;
  border: 2px solid #c0392b;   /* was #000 */
  border-radius: 0;                /* square */
  background: rgba(255,255,255,0.66);
  color: #c0392b;
  font: inherit;
  font-size: 24px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  appearance: none;
}

/* hover effect only for mouse / trackpad, not touch screens */
@media (hover: hover) {
  .photo-button:hover {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
  }
}
.photo-square:active {
  transform: none;
  box-shadow: none;
  background: rgba(255,255,255,0.95);
}

.photo-square:focus {
  outline: none;
}

.photo-square:focus-visible {
  outline: 3px solid #c0392b;
  outline-offset: 3px;
}

.photo-square img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-square-text {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c0392b;   /* was #000 */
}

        .photo-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

        .photo-actions .address-helper { flex-basis: 100%; margin: 2px 0 0; }

        .photo-button,
        .secondary-button {
          height: 36px;
          padding: 0 14px;
          border: 1px solid rgba(192,57,43,0.3);
          border-radius: 10px;
          background: rgba(255,255,255,0.75);
          color: #c0392b;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .photo-button:hover,
        .secondary-button:hover:not(:disabled) { background: #c0392b; color: #fff; }

        .photo-button {
  border: 2px solid #c0392b;
  border-radius: 0;
  background: #fff;
  color: #c0392b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.photo-button:hover {
  background: #c0392b;
  border-color: #c0392b;
  color: #fff;
}

        .photo-remove {
  height: 36px;
  padding: 0 12px;
  border: 2px solid #000;
  border-radius: 0;
  background: #fff;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.photo-remove:hover {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
}

       .photo-warning {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 2px solid #c0392b;   /* red line (was black) */
  border-radius: 0;            /* keep square; use 10px for rounded corners */
  background: rgba(245,158,11,0.09);
  color: #8a5a06;
  font-size: 10px;
  line-height: 1.6;
}
          .photo-warning {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 2px solid #c0392b;   /* red line (was black) */
  border-radius: 0;            /* keep square; use 10px for rounded corners */
  background: rgba(245,158,11,0.09);
  color: #8a5a06;
  font-size: 10px;
  line-height: 1.6;
}

        .photo-warning-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #d97706;
          font-size: 12px;
        }

        .info-notice {
          border-color: rgba(37,99,235,0.28);
          background: rgba(59,130,246,0.08);
          color: #1e4a8a;
        }

        .info-notice .photo-warning-icon { color: #2563eb; }

        /* ---------- REVIEW ---------- */

        .review-panel { position: relative; z-index: 1; }

        .review-title {
          margin: 0;
          color: #202124;
          font-size: clamp(22px, 4vw, 27px);
          font-weight: 900;
          letter-spacing: -0.6px;
        }

        .review-avatar-wrap { display: flex; justify-content: center; margin: 22px 0 18px; }

        .review-avatar {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0;
  border: 2px solid #c0392b;   /* red line, matching your upload square */
  box-shadow: none;            /* removes the black block */
  background: #fff;            /* white behind transparent PNGs */
}

        .review-list { margin: 0 0 4px; }

        .review-row {
          display: flex;
          gap: 14px;
          padding: 11px 0;
          border-bottom: 1px solid rgba(200,204,208,0.55);
        }

        .review-row dt {
          flex: 0 0 90px;
          padding-top: 2px;
          color: #85898d;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .review-row dd {
          margin: 0;
          flex: 1;
          color: #242424;
          font-size: 12px;
          line-height: 1.5;
          word-break: break-word;
        }

        .review-password {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .review-eye-button {
          width: 30px;
          height: 30px;
          min-width: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #999;
          cursor: pointer;
          transition: color 0.2s ease, background 0.2s ease;
        }

        .review-eye-button:hover { color: #c0392b; background: rgba(192,57,43,0.07); }

        .review-actions { display: flex; gap: 10px; margin-top: 20px; }

        .review-actions .secondary-button { height: 49px; padding: 0 18px; border-radius: 13px; }

        .review-actions .submit-button { flex: 1; width: auto; }

        /* ---------- TERMS + SUBMIT ---------- */

        .terms { display: flex; align-items: center; gap: 8px; margin: 5px 1px 20px; }

        .terms-text { color: #696d71; font-size: 10px; line-height: 1.4; }

        .question-button {
          width: 20px;
          height: 20px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 2px;
          border: 1px solid rgba(107,114,128,0.30);
          border-radius: 50%;
          background: rgba(255,255,255,0.65);
          color: #777;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-button:hover {
          background: #c0392b;
          border-color: #c0392b;
          color: #fff;
          transform: scale(1.08);
        }

        .submit-button {
          width: 100%;
          height: 49px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          overflow: hidden;
          border: none;
          border-radius: 13px;
          background: linear-gradient(135deg, #d94a3b, #c0392b 55%, #922b21);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.2px;
          cursor: pointer;
          box-shadow: 0 13px 28px rgba(192,57,43,0.25), inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px rgba(192,57,43,0.30), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .submit-button:active { transform: translateY(0); }

        .submit-button:disabled,
        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .arrow { font-size: 17px; line-height: 1; }

        .login-text {
          position: relative;
          z-index: 1;
          margin-top: 21px;
          text-align: center;
          color: #85898d;
          font-size: 10px;
        }

        .login-link { color: #c0392b; font-weight: 900; cursor: pointer; }

        /* ---------- MODAL (static, not scrollable) ---------- */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          overflow-y: auto;
          padding: 18px;
          background: rgba(20,22,24,0.58);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .modal {
          width: 100%;
          max-width: 590px;
          margin: auto;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.78);
          border-radius: 24px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          box-shadow: 0 35px 90px rgba(0,0,0,0.27), inset 0 1px 0 rgba(255,255,255,0.98);
          animation: modalIn 0.25s ease-out;
        }

        @keyframes modalIn {
          from { opacity: 0; transform: translateY(15px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 22px 23px 18px;
          border-bottom: 1px solid rgba(220,222,224,0.80);
        }

        .modal-badge {
          display: inline-flex;
          padding: 5px 9px;
          margin-bottom: 7px;
          border-radius: 999px;
          color: #c0392b;
          background: rgba(192,57,43,0.08);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .modal-title { margin: 0; color: #242424; font-size: 20px; font-weight: 900; }

        .close-button {
          width: 34px;
          height: 34px;
          min-width: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(180,184,188,0.45);
          border-radius: 50%;
          background: rgba(248,249,250,0.85);
          color: #666;
          font-size: 19px;
          font-weight: 500;
          cursor: pointer;
        }

        .close-button:hover, .close-button.closed {
          background: #c0392b;
          border-color: #c0392b;
          color: #fff;
        }

        .modal-content {
          padding: 21px 23px;
          color: #686d71;
          font-size: 11px;
          line-height: 1.75;
        }

        .modal-content h3 { margin: 0 0 5px; color: #303235; font-size: 12px; font-weight: 900; }

        .modal-content p { margin: 0 0 17px; }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 15px 23px;
          border-top: 1px solid rgba(220,222,224,0.80);
          background: rgba(248,249,250,0.45);
        }

        .modal-button {
          height: 40px;
          padding: 0 18px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #d94a3b, #c0392b);
          color: #fff;
          font-size: 11px;
          font-weight: 900;
          cursor: pointer;
        }

        .register-footer {
          position: relative;
          z-index: 3;
          width: 100%;
          padding: 18px 20px 22px;
          text-align: center;
          color: #ffffff;
          font-size: 10px;
          text-shadow: 0 1px 3px rgba(0,0,0,0.35);
        }

        .footer-main { color: #ffffff; font-weight: 800; }

        .footer-small { margin-top: 4px; color: #ffffff; font-size: 9px; }

        /* ---------- RESPONSIVE ---------- */

        @media (max-width: 768px) {
          .top-bar { width: calc(100% - 24px); margin-top: 12px; }
          .register-main { padding: 28px 14px 65px; }
          .register-card { max-width: 570px; padding: 34px; border-radius: 26px; }
        }

        @media (max-width: 600px) {
          .top-bar {
            height: 62px;
            width: calc(100% - 18px);
            margin-top: 9px;
            padding: 0 9px 0 12px;
            border-radius: 15px;
          }

          .logo { width: 35px; height: 35px; min-width: 35px; border-radius: 10px; font-size: 13px; }
          .brand { gap: 9px; }
          .brand-name { font-size: 11px; }
          .brand-sub { display: none; }
          .back-button { height: 34px; padding: 0 10px; font-size: 9px; border-radius: 9px; }
          .register-main { padding: 18px 10px 45px; }
          .register-card { width: 100%; padding: 27px 19px 23px; border-radius: 23px; animation: none; }
          .header-row { gap: 10px; margin-bottom: 15px; }
          .header-icon { width: 43px; height: 43px; border-radius: 13px; }
          .title { font-size: 25px; }
          .subtitle { font-size: 11px; line-height: 1.65; }
          .form-header { margin-bottom: 23px; }
          .field { margin-bottom: 13px; }
          .label { font-size: 8px; }
          .input, .location-select { height: 48px; font-size: 16px; border-radius: 11px; }
          .input-icon { left: 14px; font-size: 12px; }
          .terms { align-items: flex-start; margin-top: 5px; margin-bottom: 18px; }
          .submit-button { height: 49px; border-radius: 12px; font-size: 11px; }
          .login-text { margin-top: 18px; font-size: 10px; }
          .register-footer { padding: 14px 15px 20px; font-size: 9px; }
          .footer-small { font-size: 8px; }

          .wave { height: 150px; left: -22%; width: 144%; }
          .wave-one { bottom: -82px; }
          .wave-two { bottom: -118px; }
          .wave-three { bottom: -155px; }
          .wave-four { bottom: -192px; }

          .photo-upload { gap: 12px; }
          .photo-square { width: 80px; height: 80px; min-width: 80px; }
          .review-row { flex-direction: column; gap: 3px; }
          .review-row dt { flex: none; }
          .review-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.review-actions .submit-button {
  order: 1;              /* Confirm on top */
  width: 100%;
  height: 49px;
  min-height: 49px;
}

.review-actions .secondary-button {
  order: 2;              /* Edit below */
  width: 100%;
  height: 49px;
  min-height: 49px;
}

          .modal-overlay { padding: 10px; }
          .modal { margin: auto auto 0; border-radius: 22px 22px 18px 18px; }
          .modal-header { padding: 19px 18px 15px; }
          .modal-content { padding: 18px; font-size: 11px; }
          .modal-footer { padding: 13px 18px; justify-content: stretch; }
          .modal-button { width: 100%; }
        }

        @media (max-width: 380px) {
          .top-bar { width: calc(100% - 12px); }
          .brand-name { max-width: 145px; }
          .register-main { padding: 12px 7px 35px; }
          .register-card { padding: 23px 15px 20px; border-radius: 20px; }
          .title { font-size: 22px; }
          .subtitle { font-size: 10px; }
          .input, .location-select { height: 47px; }
          .terms-text { font-size: 9px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .register-card { animation: none; }
          * { scroll-behavior: auto !important; }
        }

      `}</style>

      <div className="register-page">

        {/* BACKGROUND */}

        <div className="background">
          <div className="grid-pattern" />
          <div className="top-wave" />
          <div className="ambient-red" />
          <div className="ambient-gray" />
          <div className="wave wave-one" />
          <div className="wave wave-two" />
          <div className="wave wave-three" />
          <div className="wave wave-four" />
        </div>

        {/* TOP BAR */}

        <header className="top-bar">
          <div className="brand">
            <div className="logo">
              <FaBolt />
            </div>

            <div className="brand-info">
              <div className="brand-name">Alavaren Auto Electrical</div>
              <div className="brand-sub">
                Professional Automotive Electrical Services
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="back-button"
          >
            ← Back to Home
          </button>
        </header>

        {/* MAIN */}

        <main className="register-main">
          <div className="register-card">

            {step === 'form' && (
              <div className="form-header">
                <div className="header-row">
                  <div className="header-icon">
                    <FaUser />
                  </div>

                  <div>
                    <div className="header-badge">Customer Registration</div>
                  </div>
                </div>

                <h1 className="title">
                  Create your <span className="title-highlight">account</span>
                </h1>

                <p className="subtitle">
                  Join Alavaren Auto Electrical and easily manage
                  appointments, vehicle services, and your customer
                  information.
                </p>
              </div>
            )}

            {/* =============================================
                FORM (hidden, not unmounted, during review
                so nothing the customer typed is lost)
            ============================================= */}

            <form
              onSubmit={handleReview}
              className="register-form"
              hidden={step !== 'form'}
            >

              {/* PROFILE PHOTO */}

              <div className="field">
                <label className="label">PROFILE PHOTO</label>

                <div className="photo-upload">
                  <button
  type="button"
  className="photo-square"
  onClick={() => fileInputRef.current?.click()}
  aria-label="Upload profile photo"
>
  {avatarPreview ? (
    <img src={avatarPreview} alt="Profile preview" />
  ) : (
    <>
      <FaCamera />
      <span className="photo-square-text">Upload</span>
    </>
  )}
</button>

                  <div className="photo-actions">
                    <button
                      type="button"
                      className="photo-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarFile ? 'Change photo' : 'Upload photo'}
                    </button>

                    {avatarFile && (
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={removeAvatar}
                      >
                        Remove
                      </button>
                    )}

                    <div className="address-helper">
                      JPG, PNG or WEBP. Max {MAX_AVATAR_MB} MB.
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="photo-warning">
                  <FaExclamationTriangle className="photo-warning-icon" />

                  <div>
                    <strong>Important:</strong> Please upload a clear, real
                    photo of yourself. Accounts using fake, cartoon, logo, or
                    unrelated photos may be deactivated by the
                    administrator.
                  </div>
                </div>
              </div>

              {/* FULL NAME */}

              <div className="field">
                <label className="label">FULL NAME</label>

                <div className="input-wrapper">
                  <FaUser className="input-icon" />

                  <input
                    type="text"
                    placeholder="Juan Dela Cruz"
                    value={form.fullName}
                    onChange={e => updateField('fullName', e.target.value)}
                    className="input"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* USERNAME */}

              <div className="field">
                <label className="label">USERNAME</label>

                <div className="input-wrapper">
                  <FaUser className="input-icon" />

                  <input
                    type="text"
                    placeholder="juan_123"
                    value={form.username}
                    onChange={e => updateField('username', e.target.value)}
                    className="input"
                    required
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div className="field">
                <label className="label">EMAIL ADDRESS</label>

                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />

                  <input
                    type="email"
                    placeholder="juan@gmail.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className="input"
                    required
                    autoComplete="email"
                    aria-invalid={
                      emailTouched &&
                      form.email.length > 0 &&
                      !isAllowedEmail(form.email)
                    }
                  />
                </div>

                {emailTouched &&
                form.email.length > 0 &&
                !isAllowedEmail(form.email) ? (
                  <div
                    style={{
                      marginTop: '7px',
                      marginLeft: '2px',
                      color: '#dc2626',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}
                  >
                    ✕ Please use a valid email from a known provider (Gmail,
                    Yahoo, Outlook, iCloud, etc.).
                  </div>
                ) : (
                  <div className="address-helper">
                    Only emails from known providers such as Gmail, Yahoo, or
                    Outlook are accepted.
                  </div>
                )}
              </div>

              {/* PHONE */}

              <div className="field">
                <label className="label">PHONE NUMBER</label>

                <div className="input-wrapper">
                  <FaPhone className="input-icon" />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="09XXXXXXXXX"
                    value={form.phone}
                    onChange={e => {
                      let value = e.target.value
                        .replace(/[^0-9]/g, '')
                        .slice(0, 11)

                      // Philippine mobile numbers must start with 09
                      if (value.length === 1 && value !== '0') {
                        value = ''
                      }

                      if (value.length >= 2 && !value.startsWith('09')) {
                        value = '0'
                      }

                      updateField('phone', value)
                    }}
                    pattern="^09[0-9]{9}$"
                    title="Please enter a valid Philippine mobile number starting with 09 and containing exactly 11 digits."
                    className="input"
                    required
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* REGION */}

              <div className="field">
                <label className="label">REGION</label>

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />

                  <select
                    className="location-select"
                    value={form.region}
                    onChange={handleRegionChange}
                    required
                    disabled={loadingRegions}
                  >
                    <option value="">
                      {loadingRegions ? 'Loading regions...' : 'Select Region'}
                    </option>

                    {regions.map(region => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PROVINCE (not for NCR) */}

              {!isNCR && (
                <div className="field">
                  <label className="label">PROVINCE</label>

                  <div className="input-wrapper">
                    <FaMapMarkerAlt className="input-icon" />

                    <select
                      className="location-select"
                      value={form.province}
                      onChange={handleProvinceChange}
                      required
                      disabled={!form.region || loadingProvinces}
                    >
                      <option value="">
                        {!form.region
                          ? 'Select Region First'
                          : loadingProvinces
                          ? 'Loading provinces...'
                          : 'Select Province'}
                      </option>

                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* CITY / MUNICIPALITY */}

              <div className="field">
                <label className="label">CITY / MUNICIPALITY</label>

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />

                  <select
                    className="location-select"
                    value={form.cityMunicipality}
                    onChange={handleCityMunicipalityChange}
                    required
                    disabled={
                      !form.region ||
                      (!form.province && !isNCR) ||
                      loadingCities
                    }
                  >
                    <option value="">
                      {!form.region
                        ? 'Select Region First'
                        : !form.province && !isNCR
                        ? 'Select Province First'
                        : loadingCities
                        ? 'Loading cities / municipalities...'
                        : 'Select City / Municipality'}
                    </option>

                    {citiesMunicipalities.map(locality => (
                      <option key={locality.code} value={locality.code}>
                        {fixEncoding(locality.name)}
                        {locality.type ? ` (${locality.type})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BARANGAY */}

              <div className="field">
                <label className="label">BARANGAY</label>

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />

                  <select
                    className="location-select"
                    value={form.barangay}
                    onChange={handleBarangayChange}
                    required
                    disabled={!form.cityMunicipality || loadingBarangays}
                  >
                    <option value="">
                      {!form.cityMunicipality
                        ? 'Select City / Municipality First'
                        : loadingBarangays
                        ? 'Loading barangays...'
                        : 'Select Barangay'}
                    </option>

                    {barangays.map(barangay => (
                      <option key={barangay.code} value={barangay.code}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ZIP CODE */}

              <div className="field">
                <label className="label">ZIP CODE</label>

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    value={form.zipCode}
                    readOnly
                    placeholder={
                      loadingZip ? 'Loading ZIP code...' : 'Automatic ZIP code'
                    }
                    className="input zip-input"
                  />
                </div>

                <div className="address-helper">
                  ZIP code is automatically populated from the selected city
                  or municipality.
                </div>
              </div>

              {/* STREET */}

              <div className="field">
                <label className="label">STREET / HOUSE NO. / BUILDING</label>

                <div className="input-wrapper">
                  <FaMapMarkerAlt className="input-icon" />

                  <input
                    type="text"
                    placeholder="House No., Street, Building"
                    value={form.street}
                    onChange={handleStreetChange}
                    className="input"
                    required
                    maxLength={150}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* ADDRESS PREVIEW */}

              {form.address && (
                <div
                  style={{
                    margin: '-3px 2px 15px',
                    padding: '10px 12px',
                    border: '1px solid rgba(192,57,43,0.12)',
                    borderRadius: '10px',
                    background: 'rgba(192,57,43,0.045)',
                    color: '#777',
                    fontSize: '9px',
                    lineHeight: '1.6'
                  }}
                >
                  <strong style={{ color: '#c0392b' }}>Complete address:</strong>{' '}
                  {form.address}
                </div>
              )}

              {/* PASSWORD */}

              <div className="field">
                <label className="label">PASSWORD</label>

                <div className="input-wrapper">
                  <FaLock className="input-icon" />

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={e => {
                      const value = e.target.value
                      updateField('password', value)
                      checkPasswordStrength(value)
                    }}
                    className="input"
                    required
                    minLength={12}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="eye-button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {passwordStrength && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color:
                        passwordStrength === 'weak'
                          ? '#dc2626'
                          : passwordStrength === 'fair'
                          ? '#d97706'
                          : '#16a34a'
                    }}
                  >
                    Password strength:{' '}
                    {passwordStrength.charAt(0).toUpperCase() +
                      passwordStrength.slice(1)}
                  </div>
                )}

                <div
                  style={{
                    marginTop: '8px',
                    marginLeft: '2px',
                    fontSize: '10px',
                    lineHeight: '1.7'
                  }}
                >
                  {passwordRequirementList.map(([key, text]) => (
                    <div
                      key={key}
                      style={{
                        color: passwordRequirements[key] ? '#16a34a' : '#85898d'
                      }}
                    >
                      {passwordRequirements[key] ? '✓' : '○'} {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="field">
                <label className="label">CONFIRM PASSWORD</label>

                <div className="input-wrapper">
                  <FaLock className="input-icon" />

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={e =>
                      updateField('confirmPassword', e.target.value)
                    }
                    className="input"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    aria-invalid={
                      form.confirmPassword.length > 0 &&
                      form.password !== form.confirmPassword
                    }
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="eye-button"
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {form.confirmPassword.length > 0 ? (
                  <div
                    style={{
                      marginTop: '7px',
                      marginLeft: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color:
                        form.password === form.confirmPassword
                          ? '#16a34a'
                          : '#dc2626',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: '800' }}>
                      {form.password === form.confirmPassword ? '✓' : '✕'}
                    </span>

                    <span>
                      {form.password === form.confirmPassword
                        ? 'Passwords match.'
                        : 'Passwords do not match.'}
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '6px',
                      marginLeft: '2px',
                      color: '#85898d',
                      fontSize: '9px'
                    }}
                  >
                    Re-enter the same password to confirm it.
                  </div>
                )}
              </div>

              {/* TERMS (no checkbox) */}

              <div className="terms">
                <span className="terms-text">
                  By creating an account, you agree to the terms and
                  conditions.
                </span>

                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="question-button"
                  aria-label="View terms and conditions"
                  title="View terms and conditions"
                >
                  ?
                </button>
              </div>

              {/* REVIEW BUTTON */}

              <button type="submit" className="submit-button">
                <span>Review Information</span>
                <span className="arrow">→</span>
              </button>
            </form>

            {/* =============================================
                REVIEW STEP
            ============================================= */}

            {step === 'review' && (
              <div className="review-panel">
                <h2 className="review-title">Review your account information</h2>

                <p className="subtitle">
                  Please double-check everything below before creating your
                  account.
                </p>

                <div className="review-avatar-wrap">
                  <img
                    src={avatarPreview}
                    alt="Your profile"
                    className="review-avatar"
                  />
                </div>

                <dl className="review-list">
                  {reviewRows.map(([label, value]) => (
                    <div className="review-row" key={label}>
                      <dt>{label}</dt>

                      {label === 'Password' ? (
                        <dd className="review-password">
                          <span>{value}</span>

                          <button
                            type="button"
                            className="review-eye-button"
                            onClick={() =>
                              setShowReviewPassword(!showReviewPassword)
                            }
                            aria-label={
                              showReviewPassword
                                ? 'Hide password'
                                : 'Show password'
                            }
                          >
                            {showReviewPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </dd>
                      ) : (
                        <dd>{value}</dd>
                      )}
                    </div>
                  ))}
                </dl>

                <div className="photo-warning info-notice">
                  <FaInfoCircle className="photo-warning-icon" />

                  <div>
                    <strong>Please check carefully:</strong> You can update
                    your profile information inside your account, but after
                    you save a change you must wait{' '}
                    {PROFILE_EDIT_COOLDOWN_DAYS} days before you can edit it
                    again.
                  </div>
                </div>

                <div className="photo-warning">
                  <FaExclamationTriangle className="photo-warning-icon" />

                  <div>
                    Your profile photo must be a real photo of you. The
                    administrator may deactivate accounts that do not follow
                    this rule.
                  </div>
                </div>

                <div className="review-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setStep('form')}
                    disabled={submitting}
                  >
                    ← Edit
                  </button>

                  <button
                    type="button"
                    className="submit-button"
                    onClick={handleRegister}
                    disabled={submitting}
                  >
                    <span>
                      {submitting
                        ? 'Creating account...'
                        : 'Confirm & Create Account'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* LOGIN */}

            {step === 'form' && (
              <div className="login-text">
                Already have an account?{' '}
                <span onClick={() => navigate('/login')} className="login-link">
                  Sign in
                </span>
              </div>
            )}

          </div>
        </main>

        {/* TERMS MODAL */}

        {showTerms && (
          <div className="modal-overlay" onClick={() => setShowTerms(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>

              <div className="modal-header">
                <div>
                  <div className="modal-badge">Legal</div>
                  <h2 className="modal-title">Terms & Conditions</h2>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowTerms(false)
                    setTermsClosed(true)
                    setTimeout(() => setTermsClosed(false), 700)
                  }}
                  className={
                    termsClosed ? 'close-button closed' : 'close-button'
                  }
                  aria-label="Close terms"
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                {TERMS.map(([heading, body]) => (
                  <div key={heading}>
                    <h3>{heading}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowTerms(false)}
                  className="modal-button"
                >
                  I Understand
                </button>
              </div>

            </div>
          </div>
        )}

        {/* FOOTER */}

        <footer className="register-footer">
          <div className="footer-main">Alavaren Auto Electrical Services</div>
          <div className="footer-small">
            Professional automotive electrical solutions
          </div>
        </footer>

      </div>
    </>
  )
}