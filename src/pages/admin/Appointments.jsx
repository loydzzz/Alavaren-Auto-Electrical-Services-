import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  FaCalendarAlt,
  FaArrowLeft,
  FaUser,
  FaCar,
  FaTag,
  FaWrench,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaClipboardList,
  FaChevronRight,
} from 'react-icons/fa'

import { XCircle } from 'lucide-react'

export default function Appointments() {

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

const [highlightedAppointmentId, setHighlightedAppointmentId] =
  useState(null)



 async function fetchAppointments() {
  setLoading(true)

  const targetAppointmentId =
    location.state?.appointmentId

  try {
    const targetId = targetAppointmentId
      ? Number(targetAppointmentId)
      : null

    // =====================================================
    // IF WE CAME FROM A NOTIFICATION
    // LOAD THE TARGET APPOINTMENT FIRST
    // =====================================================

    if (targetId) {
      console.log(
        '🎯 Loading notification appointment first:',
        targetId
      )

      const {
        data: targetAppointment,
        error: targetError,
      } = await supabase
        .from('appointments')
        .select(`
  *,
  assisted_user:users!appointments_assisted_by_fkey (
    id,
    name
  )
`)

        .eq('id', targetId)
        .maybeSingle()

      if (targetError) {
        console.error(
          '🎯 Target appointment fetch error:',
          targetError
        )
      }

      if (targetAppointment) {
  console.log(
    '🎯 Target appointment loaded first:',
    targetAppointment
  )

  const appointmentWithName = {
    ...targetAppointment,
    assisted_by_name:
      targetAppointment.assisted_user?.name || null,
  }

  // Put the target appointment into the UI immediately
  setAppointments([appointmentWithName])



        // Don't wait for every appointment.
        setLoading(false)

        // =================================================
        // LOAD THE REST IN THE BACKGROUND
        // =================================================

        const {
          data: remainingAppointments,
          error: remainingError,
        } = await supabase
          .from('appointments')
          .select(`
  *,
  assisted_user:users!appointments_assisted_by_fkey (
    id,
    name
  )
`)

          .eq('archived', false)
          .neq('id', targetId)
          .order('appointment_date', {
            ascending: false,
          })

        if (remainingError) {
          console.error(
            'Background appointments error:',
            remainingError
          )

          return
        }

        const remainingWithNames =
  (remainingAppointments || []).map((appt) => ({
    ...appt,
    assisted_by_name:
      appt.assisted_user?.name || null,
  }))

setAppointments((current) => {
  const alreadyExists =
    current.some(
      (appointment) =>
        Number(appointment.id) === targetId
    )

  if (alreadyExists) {
    return [
      ...current,
      ...remainingWithNames,
    ]
  }

  return [
    appointmentWithName,
    ...remainingWithNames,
  ]
})




        return
      }
    }

    // =====================================================
    // NORMAL PAGE LOAD
    // =====================================================

    const {
      data,
      error,
    } = await supabase
      .from('appointments')
      .select(`
  *,
  assisted_user:users!appointments_assisted_by_fkey (
    id,
    name
  )
`)

      .eq('archived', false)
      .order('appointment_date', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Appointments Error:',
        error
      )

      setAppointments([])
      return
    }

    console.log(
  "🔎 APPOINTMENTS WITH ASSISTED USER:",
  data
)


    const appointmentsWithNames =
  (data || []).map((appt) => ({
    ...appt,
    assisted_by_name:
      appt.assisted_user?.name || null,
  }))

setAppointments(appointmentsWithNames)


  } catch (error) {
    console.error(
      'Fetch appointments error:',
      error
    )

    setAppointments([])

  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchAppointments()
  }, [])

  function formatTime(time) {

    if (!time) return 'Not specified'

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  function formatCompletedAt(timestamp) {
    if (!timestamp) return 'Not completed'

    return new Date(timestamp).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  function formatCancelledAt(timestamp) {
    if (!timestamp) return 'Not cancelled'

    return new Date(timestamp).toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  useEffect(() => {
  const appointmentId =
    location.state?.appointmentId

  if (!appointmentId || !appointments.length) {
    return
  }

  const targetId = Number(appointmentId)

  console.log(
    '🎯 Admin appointment target received:',
    targetId
  )

  // Make sure the appointment actually exists
  // in the fetched appointments.
  const targetAppointment =
    appointments.find(
      (appointment) =>
        Number(appointment.id) === targetId
    )

  if (!targetAppointment) {
    console.warn(
      '🎯 Target appointment is not in loaded appointments:',
      targetId
    )
    return
  }

  console.log(
    '🎯 Target appointment found:',
    targetAppointment
  )

  // Wait until React has rendered the row.
  const timer = setTimeout(() => {
    const element =
      document.getElementById(
        `admin-appointment-${targetId}`
      )

    if (!element) {
      console.warn(
        '🎯 Admin appointment row not found:',
        targetId
      )
      return
    }

    console.log(
      '🎯 Admin appointment row found:',
      targetId
    )

    // Highlight
    setHighlightedAppointmentId(targetId)

    // Smooth scroll
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedAppointmentId(null)
    }, 3000)

    // Clear navigation state so it doesn't
    // trigger again unnecessarily.
    navigate(location.pathname, {
      replace: true,
      state: {},
    })
  }, 300)

  return () => {
    clearTimeout(timer)
  }
}, [
  appointments,
  location.state?.appointmentId,
  navigate,
  location.pathname,
])




  function statusStyle(status) {

    switch (status) {

      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'

      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200'

      case 'in_progress':
        return 'bg-purple-50 text-purple-700 border-purple-200'

      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'

      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      
      case 'rejected':
        return 'bg-orange-50 text-orange-700 border-orange-200'


      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  function statusIcon(status) {

    switch (status) {

      case 'pending':
        return <FaClock />

      case 'confirmed':
        return <FaCheckCircle />

      case 'in_progress':
        return <FaWrench />

      case 'completed':
        return <FaCheckCircle />

      case 'cancelled':
        return <FaTimesCircle />
      
      case 'rejected':
      return <XCircle />


      default:
        return <FaClipboardList />
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-gray-50 to-red-50/40 text-gray-900">

      {/* =====================================================
          PREMIUM WAVY BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-red-200/30 blur-3xl" />

        <div className="absolute right-[-180px] top-[12%] h-[520px] w-[520px] rounded-full bg-gray-200/60 blur-3xl" />

        <div className="absolute bottom-[-220px] left-[15%] h-[520px] w-[700px] rounded-[50%] bg-red-100/40 blur-3xl" />

        <div className="absolute left-[-10%] top-[35%] h-[260px] w-[75%] rotate-[-8deg] rounded-[50%] border-[45px] border-white/70 blur-[1px]" />

        <div className="absolute right-[-15%] top-[55%] h-[280px] w-[75%] rotate-[7deg] rounded-[50%] border-[55px] border-red-100/50 blur-[2px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.06),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(156,163,175,0.10),transparent_30%)]" />

      </div>


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="relative border-b border-white/70 bg-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-2xl">

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* TITLE */}

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">

             <div
  className="
    relative
    flex
    h-11
    w-11
    shrink-0
    cursor-pointer
    items-center
    justify-center
    rounded-2xl
    border
    border-red-200/80
    bg-gradient-to-br
    from-red-500
    to-red-700
    text-white
    shadow-[0_10px_25px_rgba(220,38,38,0.22)]
    transition-all
    duration-300
    hover:scale-110
    hover:shadow-[0_12px_30px_rgba(220,38,38,0.32)]
    active:scale-95
    sm:h-12
    sm:w-12
  "
>
  <div className="absolute inset-0 rounded-2xl bg-white/10" />

  <FaCalendarAlt className="relative text-lg sm:text-xl" />
</div>


              <div className="min-w-0">

                <h1 className="truncate text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
                  Appointments
                </h1>

                <p className="mt-0.5 hidden text-sm font-medium text-gray-500 sm:block">
                  View and manage customer appointments
                </p>

              </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

              {/* COUNT */}

              <div className="flex items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-white/65 px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm backdrop-blur-xl">

                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-50">
                  <FaClipboardList className="text-xs" />
                </div>

                <span>
                  {appointments.length} Appointments
                </span>

              </div>


              {/* BACK */}

              <button
                onClick={() => navigate('/admin')}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:shadow-[0_12px_25px_rgba(220,38,38,0.10)] active:scale-[0.98] sm:w-auto"
              >

                <FaArrowLeft className="text-xs transition-transform duration-200 group-hover:-translate-x-0.5" />

                <span>
                  Back to Dashboard
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">

        {/* =====================================================
            MAIN GLASS CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_25px_70px_rgba(0,0,0,0.08)] backdrop-blur-2xl">

          {/* ===================================================
              SECTION HEADER
          =================================================== */}

          {/* ===================================================
    SECTION HEADER
=================================================== */}

<div className="
  relative
  overflow-hidden
  border-b
  border-gray-200/70
  bg-gradient-to-br
  from-white
  via-white
  to-red-50/70
  px-4
  py-4
  sm:px-6
  sm:py-5
">

  {/* =================================================
      TOP-RIGHT RED GLOW
  ================================================= */}

  <div className="
    pointer-events-none
    absolute
    -right-16
    -top-16
    h-40
    w-40
    rounded-full
    bg-red-100/40
    blur-3xl
  " />

  {/* =================================================
      BOTTOM ORANGE GLOW
  ================================================= */}

  <div className="
    pointer-events-none
    absolute
    -bottom-20
    left-1/3
    h-32
    w-32
    rounded-full
    bg-orange-100/30
    blur-3xl
  " />

  {/* =================================================
      HEADER CONTENT
  ================================================= */}

  <div className="
    relative
    flex
    flex-col
    gap-3
    sm:flex-row
    sm:items-center
    sm:justify-between
  ">

    {/* =================================================
        LEFT SIDE
    ================================================= */}

    <div className="
      flex
      min-w-0
      items-center
      gap-3
    ">

      {/* =================================================
          GRADIENT ICON
      ================================================= */}

      <div
        className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-2xl
          border
          border-red-100
          bg-gradient-to-br
          from-red-500
          to-rose-700
          text-white
          shadow-[0_8px_20px_rgba(220,38,38,0.30)]
          ring-1
          ring-red-400/30
          transition-all
          duration-300
          hover:scale-110
          hover:shadow-[0_10px_25px_rgba(220,38,38,0.38)]
          sm:h-12
          sm:w-12
        "
      >
        <FaClipboardList
          className="h-5 w-5 sm:h-5 sm:w-5"
        />
      </div>


      {/* =================================================
          TITLE
      ================================================= */}

      <div className="min-w-0">

        <div className="
          flex
          flex-wrap
          items-center
          gap-2
        ">

          <h2 className="
            truncate
            text-lg
            font-extrabold
            tracking-tight
            text-gray-900
            sm:text-xl
          ">
            Appointment List
          </h2>


          {/* SMALL CATEGORY BADGE */}

          <span className="
            inline-flex
            items-center
            rounded-md
            border
            border-red-100
            bg-red-50
            px-2
            py-0.5
            text-[9px]
            font-bold
            uppercase
            tracking-wider
            text-red-600
          ">
            Schedule
          </span>

        </div>


        <p className="
          mt-0.5
          text-xs
          font-medium
          text-gray-500
          sm:text-sm
        ">
          Customer booking and service schedule
        </p>

      </div>

    </div>


    {/* =================================================
        ACTIVE APPOINTMENTS
    ================================================= */}

    {/* =================================================
    ACTIVE APPOINTMENTS
================================================= */}

<span
  className="
    inline-flex
    w-fit
    shrink-0
    items-center
    gap-2
    rounded-full
    border
    border-red-100
    bg-white/75
    px-3.5
    py-1.5
    text-xs
    font-bold
    text-red-600
    shadow-sm
    backdrop-blur
  "
>
  <span className="relative flex h-2 w-2">
    <span
      className="
        absolute
        inline-flex
        h-full
        w-full
        animate-ping
        rounded-full
        bg-red-400
        opacity-60
      "
    />

    <span
      className="
        relative
        inline-flex
        h-2
        w-2
        rounded-full
        bg-red-500
        shadow-[0_0_8px_rgba(239,68,68,0.45)]
      "
    />
  </span>

  Active Appointments
</span>



  </div>

</div>



          {/* ===================================================
              LOADING
          =================================================== */}

          {loading ? (

            <div className="px-6 py-16 text-center sm:py-20">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-white/80 shadow-sm backdrop-blur">

                <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />

              </div>

              <p className="font-bold text-gray-700">
                Loading appointments...
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Please wait while we retrieve the latest records.
              </p>

            </div>

          ) : appointments.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="px-6 py-16 text-center sm:py-20">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white text-2xl text-red-600 shadow-sm">

                <FaCalendarAlt />

              </div>

              <p className="font-bold text-gray-700">
                No appointments found
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
                Customer appointments will appear here when they are available.
              </p>

              <button
                onClick={() => navigate('/admin')}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(220,38,38,0.22)] transition-all hover:-translate-y-0.5 hover:from-red-500 hover:to-red-700 active:scale-[0.98]"
              >

                <FaArrowLeft className="text-xs" />

                Back to Dashboard

              </button>

            </div>

          ) : (

            <>

              {/* =================================================
                  DESKTOP TABLE
                  Hidden on small screens
              ================================================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  {/* TABLE HEADER */}

                  <thead className="border-b border-gray-200/70 bg-gray-50/75 backdrop-blur-xl">

                    <tr>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                       Appointment No.
                      </th>


                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Customer
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Address
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Vehicle
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Plate Number
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Service
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Date
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Time
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
  Booking Source
</th>

<th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
  Assisted By
</th>


                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Completed / Cancelled / Rejected
                      </th>

                      <th className="whitespace-nowrap px-5 py-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                    </tr>

                  </thead>


                  {/* TABLE BODY */}

                  <tbody className="divide-y divide-gray-100/80">

                    {appointments.map((appt) => (
  <tr
    key={appt.id}
    id={`admin-appointment-${appt.id}`}
    className={`group transition-all duration-200 hover:bg-red-50/45 ${
      highlightedAppointmentId === appt.id
        ? 'bg-red-50 ring-2 ring-inset ring-red-500'
        : ''
    }`}
  >


                        {/* APPOINTMENT NUMBER */}

<td className="px-5 py-4">

  <div className="flex items-center gap-2">

    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white text-red-600 shadow-sm transition-all group-hover:border-red-200 group-hover:shadow-md">
      <FaClipboardList className="text-sm" />
    </div>

    <div className="min-w-0">

      

      <p className="mt-0.5 whitespace-nowrap text-sm font-extrabold tracking-tight text-gray-900">
        #{appt.id}
      </p>

    </div>

  </div>

</td>


                        {/* CUSTOMER */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white text-red-600 shadow-sm transition-all group-hover:border-red-200 group-hover:shadow-md">
                              <FaUser />
                            </div>

                            <div className="min-w-0">

                              <p className="whitespace-nowrap font-bold text-gray-900">
                                {appt.customer_name || 'Unknown Customer'}
                              </p>

                              <p className="mt-0.5 whitespace-nowrap text-xs font-medium text-gray-500">
                                {appt.mobile_number ||
                                  appt.phone ||
                                  'No mobile number'}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="min-w-[180px] px-5 py-4 align-middle">

  <div className="flex items-center gap-3">

    {/* LOCATION ICON */}
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white text-gray-500 shadow-sm transition-all group-hover:border-gray-300 group-hover:shadow-md">

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        />

        <circle
          cx="12"
          cy="9"
          r="2.5"
        />
      </svg>

    </div>

    {/* ADDRESS */}
    <div className="min-w-0">

      <p className="text-sm font-semibold leading-snug text-gray-700 break-words">
        {appt.customer_address || 'No address provided'}
      </p>

    </div>

  </div>

</td>





                        {/* VEHICLE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                              <FaCar className="text-xs" />
                            </div>

                            <p className="whitespace-nowrap font-semibold text-gray-800">
                              {appt.vehicle_model || 'Not specified'}
                            </p>

                          </div>

                        </td>


                        {/* PLATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                              <FaTag className="text-xs" />
                            </div>

                            <p className="whitespace-nowrap font-semibold text-gray-800">
                              {appt.plate_number || 'Not specified'}
                            </p>

                          </div>

                        </td>


                        {/* SERVICE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                              <FaWrench className="text-xs" />
                            </div>

                            <p className="whitespace-nowrap font-semibold text-gray-800">
                              {appt.service_type || 'Not specified'}
                            </p>

                          </div>

                        </td>


                        {/* DATE */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                              <FaCalendarAlt className="text-xs" />
                            </div>

                            <p className="whitespace-nowrap font-medium text-gray-700">
                              {appt.appointment_date}
                            </p>

                          </div>

                        </td>


                        {/* TIME */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                              <FaClock className="text-xs" />
                            </div>

                            <p className="whitespace-nowrap font-medium text-gray-700">
                              {formatTime(appt.appointment_time)}
                            </p>

                          </div>

                        </td>

                        <td className="px-5 py-4">

  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${
      appt.booking_source === 'walkin'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-blue-200 bg-blue-50 text-blue-700'
    }`}
  >
    {appt.booking_source === 'walkin'
      ? 'Walk-in'
      : 'Online'}
  </span>

</td>

<td className="px-5 py-4">

  <div className="flex items-center gap-2">

    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
      <FaUser className="text-xs" />
    </div>

    <p className="whitespace-nowrap font-semibold text-gray-800">
      {appt.assisted_user?.name || '—'}

    </p>

  </div>

</td>


{/* COMPLETED / CANCELLED / REJECTED */}

<td className="px-5 py-4">

  {appt.status === 'completed' && appt.completed_at ? (

    /* =================================================
       COMPLETED
    ================================================= */

    <div className="flex items-start gap-2">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50 text-green-600">
        <FaCheckCircle className="text-sm" />
      </div>

      <div>

        <p className="text-xs font-bold text-green-600">
          Completed
        </p>

        <p className="mt-0.5 whitespace-nowrap text-sm font-medium text-gray-700">
          {formatCompletedAt(appt.completed_at)}
        </p>

      </div>

    </div>

  ) : appt.status === 'cancelled' && appt.rejection_reason ? (

    /* =================================================
       REJECTED
    ================================================= */

    <div className="flex items-start gap-2">

  {/* REJECTED ICON */}
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
    <XCircle className="text-sm" />
  </div>

  <div className="min-w-0">

    <p className="text-xs font-bold text-red-600">
      Rejected
    </p>

    {appt.rejected_at ? (

      <p className="mt-0.5 whitespace-nowrap text-sm font-medium text-gray-700">
        {formatCancelledAt(appt.rejected_at)}
      </p>

    ) : (

      <p className="mt-0.5 text-xs text-gray-400">
        Rejection time unavailable
      </p>

    )}

    {appt.rejection_reason ? (

      <div className="mt-2 w-full max-w-xs min-w-0 overflow-hidden rounded-xl border border-red-100 bg-red-50/70 px-3 py-2">

        <p className="text-[10px] font-bold uppercase tracking-wide text-red-600">
          Rejection Reason
        </p>

        <p className="mt-1 break-words whitespace-normal text-xs leading-relaxed text-gray-700">
          {appt.rejection_reason}
        </p>

      </div>

    ) : null}

  </div>

</div>


  ) : appt.status === 'cancelled' ? (

    /* =================================================
       CANCELLED
    ================================================= */

   <div className="flex items-start gap-2">

  {/* CANCELLED ICON */}

  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
    <FaTimesCircle className="text-sm" />
  </div>

  {/* CANCELLED CONTENT */}

  <div className="min-w-0 flex-1">

    <p className="text-xs font-bold text-orange-600">
      Cancelled
    </p>

    {appt.cancelled_at ? (

      <p className="mt-0.5 whitespace-nowrap text-sm font-medium text-gray-700">
        {formatCancelledAt(appt.cancelled_at)}
      </p>

    ) : (

      <p className="mt-0.5 text-xs text-gray-400">
        Cancellation time unavailable
      </p>

    )}

    {appt.cancellation_reason ? (

      <div className="mt-2 w-full max-w-xs min-w-0 overflow-hidden rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2">

        <p className="text-[10px] font-bold uppercase tracking-wide text-orange-600">
          Cancellation Reason
        </p>

        <p className="mt-1 break-words whitespace-normal text-xs leading-relaxed text-gray-700">
          {appt.cancellation_reason}
        </p>

      </div>

    ) : null}

  </div>

</div>

  ) : (

    <span className="text-sm font-medium text-gray-300">
      —
    </span>

  )}

</td>


                       {/* STATUS */}

<td className="px-5 py-4">

  {appt.status === 'cancelled' && appt.rejection_reason ? (

    /* REJECTED */
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold capitalize text-red-700 shadow-sm"
    >
      <FaTimesCircle className="text-sm" />

      Rejected
    </span>

  ) : appt.status === 'cancelled' ? (

    /* CANCELLED */
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold capitalize text-orange-700 shadow-sm"
    >
      <FaTimesCircle className="text-sm" />

      Cancelled
    </span>

  ) : (

    /* OTHER STATUSES */
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${statusStyle(
        appt.status
      )}`}
    >

      {statusIcon(appt.status)}

      {appt.status
        ? appt.status.replace('_', ' ')
        : 'Unknown'}

    </span>

  )}

</td>


                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>


              {/* =================================================
                  MOBILE APPOINTMENT CARDS
                  Visible only on small screens
              ================================================= */}

              <div className="divide-y divide-gray-100/80 md:hidden">

                {appointments.map((appt) => (

                  <div
                    key={appt.id}
                    className="p-4 transition-all duration-200 active:bg-red-50/50"
                  >

                    {/* MOBILE CUSTOMER + ADDRESS */}

<div className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

{/* APPOINTMENT NUMBER */}

<div className="mb-3 flex justify-center">

  <div className="relative flex w-full max-w-[280px] items-center justify-center rounded-xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-red-50/60 px-4 py-2.5 shadow-sm">

    {/* LEFT ICON */}

    <div className="absolute left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-sm">
      <FaClipboardList className="text-[11px]" />
    </div>

    {/* PERFECTLY CENTERED CONTENT */}

    <div className="text-center leading-none">

      <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-red-500">
        Appointment No.
      </p>

      <p className="mt-1 text-sm font-extrabold tracking-tight text-gray-900">
        #{appt.id}
      </p>

    </div>

  </div>

</div>


  <div className="flex items-start justify-between gap-3">

    {/* CUSTOMER + ADDRESS */}
    <div className="min-w-0 flex-1">

      {/* CUSTOMER */}
      <div className="flex items-center gap-3">

        {/* CUSTOMER ICON */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white text-red-600 shadow-sm">
          <FaUser />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Customer
          </p>

          {/* CUSTOMER NAME */}
          <p className="truncate font-bold text-gray-900">
            {appt.customer_name || 'Unknown Customer'}
          </p>

          {/* MOBILE NUMBER */}
          <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
            {appt.mobile_number ||
              appt.phone ||
              'No mobile number'}
          </p>

        </div>

      </div>
      


      {/* ADDRESS */}
      <div className="mt-3 flex items-start gap-2.5">

        {/* LOCATION ICON */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white text-gray-500 shadow-sm">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
            />

            <circle
              cx="12"
              cy="9"
              r="2.5"
            />
          </svg>

        </div>

        {/* ADDRESS TEXT */}
        <div className="min-w-0 flex-1">

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Service Address
          </p>

          <p className="mt-0.5 break-words text-sm font-semibold leading-snug text-gray-700">
            {appt.customer_address || 'No address provided'}
          </p>

        </div>

      </div>

    </div>


  {/* STATUS */}

{appt.status === 'cancelled' && appt.rejection_reason ? (

  /* REJECTED */
  <span
    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold capitalize text-red-700 shadow-sm"
  >
    <FaTimesCircle className="text-sm" />

    Rejected
  </span>

) : appt.status === 'cancelled' ? (

  /* CANCELLED */
  <span
    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold capitalize text-orange-700 shadow-sm"
  >
    <FaTimesCircle className="text-sm" />

    Cancelled
  </span>

) : (

  /* OTHER STATUSES */
  <span
    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold capitalize shadow-sm ${statusStyle(
      appt.status
    )}`}
  >

    {statusIcon(appt.status)}

    {appt.status
      ? appt.status.replace('_', ' ')
      : 'Unknown'}

  </span>

)}

  </div>

</div>



                    {/* SERVICE */}

                    <div className="mt-4 rounded-2xl border border-white/80 bg-gray-50/75 p-3 shadow-sm backdrop-blur-xl">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm">
                          <FaWrench className="text-sm" />
                        </div>

                        <div className="min-w-0">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Service
                          </p>

                          <p className="mt-0.5 truncate text-sm font-bold text-gray-800">
                            {appt.service_type || 'Not specified'}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* VEHICLE + PLATE */}

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      {/* VEHICLE */}

                      <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

                        <div className="flex items-start gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                            <FaCar className="text-xs" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              Vehicle
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-gray-800">
                              {appt.vehicle_model || 'Not specified'}
                            </p>

                          </div>

                        </div>

                      </div>


                      {/* PLATE */}

                      <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

                        <div className="flex items-start gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                            <FaTag className="text-xs" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              Plate Number
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-gray-800">
                              {appt.plate_number || 'Not specified'}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* DATE + TIME */}

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      {/* DATE */}

                      <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

                        <div className="flex items-start gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                            <FaCalendarAlt className="text-xs" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              Date
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-gray-800">
                              {appt.appointment_date || 'Not specified'}
                            </p>

                          </div>

                        </div>

                      </div>


                      {/* TIME */}

                      <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

                        <div className="flex items-start gap-2.5">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                            <FaClock className="text-xs" />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                              Time
                            </p>

                            <p className="mt-1 truncate text-xs font-bold text-gray-800">
                              {formatTime(appt.appointment_time)}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* BOOKING SOURCE + ASSISTED BY */}

<div className="mt-3 grid grid-cols-2 gap-3">

  {/* BOOKING SOURCE */}

  <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

    <div className="flex items-start gap-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <FaClipboardList className="text-xs" />
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Booking Source
        </p>

        <span
          className={`mt-1 inline-flex items-center rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${
            appt.booking_source === 'walkin'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {appt.booking_source === 'walkin'
            ? 'Walk-in'
            : 'Online'}
        </span>

      </div>

    </div>

  </div>


  {/* ASSISTED BY */}

  <div className="rounded-2xl border border-white/90 bg-white/70 p-3 shadow-sm backdrop-blur-xl">

    <div className="flex items-start gap-2.5">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        <FaUser className="text-xs" />
      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
          Assisted By
        </p>

        <p className="mt-1 break-words text-xs font-bold text-gray-800">
          {appt.assisted_user?.name || '—'}
        </p>

      </div>

    </div>

  </div>

</div>



                   {/* COMPLETED / CANCELLED / REJECTED */}

{appt.status === 'completed' && appt.completed_at ? (

  /* =================================================
     COMPLETED
  ================================================= */

  <div className="mt-3 rounded-2xl border border-green-100 bg-green-50/80 p-3 shadow-sm backdrop-blur-xl">

    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
        <FaCheckCircle />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
          Completed
        </p>

        <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-700">
          {formatCompletedAt(appt.completed_at)}
        </p>

      </div>

    </div>

  </div>

) : appt.status === 'cancelled' && appt.rejection_reason ? (

  /* =================================================
     REJECTED
  ================================================= */

  <div className="mt-3 rounded-2xl border border-red-100 bg-red-50/80 p-3 shadow-sm backdrop-blur-xl">

    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
        <XCircle />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
          Rejected
        </p>

        {appt.rejected_at ? (

          <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-700">
            {formatCancelledAt(appt.rejected_at)}
          </p>

        ) : (

          <p className="mt-1 text-xs text-gray-400">
            Rejection time unavailable
          </p>

        )}

       <div className="mt-3 w-full min-w-0 overflow-hidden rounded-xl border border-red-100 bg-white/75 p-3">

  <p className="text-[9px] font-bold uppercase tracking-wider text-red-600">
    Rejection Reason
  </p>

  <p className="mt-1 break-words whitespace-normal text-xs leading-relaxed text-gray-700">
    {appt.rejection_reason}
  </p>

</div>


      </div>

    </div>

  </div>

) : appt.status === 'cancelled' ? (

  /* =================================================
     CANCELLED
  ================================================= */

  <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50/80 p-3 shadow-sm backdrop-blur-xl">

    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
        <FaTimesCircle />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
          Cancelled
        </p>

        {appt.cancelled_at ? (

          <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-700">
            {formatCancelledAt(appt.cancelled_at)}
          </p>

        ) : (

          <p className="mt-1 text-xs text-gray-400">
            Cancellation time unavailable
          </p>

        )}

        {appt.cancellation_reason ? (

  <div className="mt-3 w-full min-w-0 overflow-hidden rounded-xl border border-orange-100 bg-white/75 p-3">

    <p className="text-[9px] font-bold uppercase tracking-wider text-orange-600">
      Cancellation Reason
    </p>

    <p className="mt-1 break-words whitespace-normal text-xs leading-relaxed text-gray-700">
      {appt.cancellation_reason}
    </p>

  </div>

) : null}


      </div>

    </div>

  </div>

) : null}


                    


                    {/* MOBILE FOOTER */}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100/80 pt-3">

                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400">

                        <FaClipboardList />

                        <span>
                          Appointment Record
                        </span>

                      </div>

                      <FaChevronRight className="text-xs text-gray-300" />

                    </div>

                  </div>

                ))}

              </div>

            </>

          )}

        </div>

      </main>

    </div>
  )
}
