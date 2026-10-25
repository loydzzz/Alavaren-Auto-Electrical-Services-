import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import toast, { Toaster } from 'react-hot-toast'
import { TriangleAlert, Store, Home, } from 'lucide-react'



// =========================================================
// ICON SYSTEM
// =========================================================
// Inline SVG icons.
// No external icon package required.
// =========================================================

function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
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

    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M16 2v4M8 2v4M3 9h18" />
        <path d="M8 13h2M12 13h2M16 13h.01M8 17h2M12 17h2" />
      </>
    ),

    wrench: (
      <>
        <path d="M14.7 6.3a4.5 4.5 0 0 0-5.8-5.8l3 3-2.9 2.9-3-3a4.5 4.5 0 0 0 5.8 5.8l7.1 7.1a2.1 2.1 0 1 0 3-3z" />
      </>
    ),

    car: (
      <>
        <path d="M5 17h14" />
        <path d="M6.5 17H5a2 2 0 0 1-2-2v-2.5a2 2 0 0 1 1.7-2L6 10l1.8-4.1A2 2 0 0 1 9.6 4.7h4.8a2 2 0 0 1 1.8 1.2L18 10l1.3.5a2 2 0 0 1 1.7 2V15a2 2 0 0 1-2 2h-1.5" />
        <path d="M6 10h12" />
        <circle cx="7" cy="17" r="1.8" />
        <circle cx="17" cy="17" r="1.8" />
      </>
    ),

        carSide: (
      <>
        <path d="M5.2 17H4a1 1 0 0 1-1-1v-3a2 2 0 0 1 2-2h.4l1.6-3.5A2 2 0 0 1 8.8 6.5h6.2a2 2 0 0 1 1.6.8L19 11a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-1.2" />
        <path d="M9.2 17h5.6" />
        <path d="M12 6.5V11" />
        <circle cx="7.2" cy="17" r="2" />
        <circle cx="16.8" cy="17" r="2" />
      </>
    ),
    arrowLeft: (<><path d="M19 12H5M11 6l-6 6 6 6" /></>),

    tag: (
      <>
        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3.4 13.4a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.4z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </>
    ),
    fuel: (
  <>
    <path d="M6 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M6 7h10" />
    <path d="M9 10h4" />
    <path d="M16 7h2l2 2v8a2 2 0 0 0 2 2" />
    <path d="M20 11h2" />
  </>
),
battery: (
  <>
    <rect x="3" y="7" width="17" height="10" rx="2" />
    <path d="M20 10h2v4h-2" />
    <path d="M7 10v4M10 10v4M13 10v4M16 10v4" />
  </>
),
settings: (
  <>
    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5h-.2a1.7 1.7 0 0 0-1.6 1z" />
  </>
),

    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    x: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.7 2.4 17.2A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4M12 16h.01" />
      </>
    ),

    message: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.5-.7L4 20l1.4-3.7A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5z" />
      </>
    ),

    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),

    paperclip: (
      <>
        <path d="m21.4 11.6-8.8 8.8a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
      </>
    ),

    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),

    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v5c0 5.2-3.3 8.8-8 10-4.7-1.2-8-4.8-8-10V6z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),

    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
      </>
    ),

    trash: (
      <>
        <path d="M4 7h16M10 11v5M14 11v5" />
        <path d="m6 7 1 14h10l1-14M9 7V4h6v3" />
      </>
    ),

    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M8 9h8M8 13h6M8 17h4" />
      </>
    ),

    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),

    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),

    activity: (
      <>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </>
    ),

    inbox: (
      <>
        <path d="M4 4h16v13H4z" />
        <path d="M4 13h5l1.5 2h3L15 13h5" />
      </>
    ),

    close: (
      <>
        <path d="m7 7 10 10M17 7 7 17" />
      </>
    ),

  }

  return (
    <svg {...common}>
      {icons[name] || icons.info}
    </svg>
  )
}


// =========================================================
// STATUS HELPERS
// =========================================================

function getStatusTheme(status) {

  switch (status?.toLowerCase()) {

    case 'pending':
      return {
        label: 'Pending',
        color: 'text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-400/20',
        dot: 'bg-amber-400',
        icon: 'clipboard',
      }

    case 'confirmed':
      return {
        label: 'Confirmed',
        color: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-400/20',
        dot: 'bg-emerald-400',
        icon: 'check',
      }

    case 'in_progress':
      return {
        label: 'In Progress',
        color: 'text-violet-300',
        bg: 'bg-violet-500/10',
        border: 'border-violet-400/20',
        dot: 'bg-violet-400',
        icon: 'wrench',
      }

    case 'completed':
      return {
        label: 'Completed',
        color: 'text-sky-300',
        bg: 'bg-sky-500/10',
        border: 'border-sky-400/20',
        dot: 'bg-sky-400',
        icon: 'check',
      }

    case 'cancelled':
  return {
    label: 'Cancelled',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/20',
    dot: 'bg-orange-400',
    icon: 'x',
  }


    case 'rejected':
  return {
    label: 'Rejected',
    color: 'text-red-300',
    bg: 'bg-red-500/10',
    border: 'border-red-400/20',
    dot: 'bg-red-400',
    icon: 'x',
  }


    default:
      return {
        label: 'Unknown',
        color: 'text-slate-300',
        bg: 'bg-white/5',
        border: 'border-white/10',
        dot: 'bg-slate-400',
        icon: 'info',
      }
  }
}


// =========================================================
// APPOINTMENT PROGRESS
// =========================================================

// =========================================================
// APPOINTMENT PROGRESS
// =========================================================

function AppointmentProgress({ appointment }) {

  const status = appointment.status?.toLowerCase()

  const isRejected =
  status === 'cancelled' &&
  Boolean(appointment.rejected_at)

const isCancelled =
  status === 'cancelled' &&
  !isRejected

  const statusTheme = getStatusTheme(status)


  const displayStatusLabel =
  isRejected
    ? 'Rejected'
    : isCancelled
      ? 'Cancelled'
      : statusTheme.label



  const stages = [
    {
      key: 'pending',
      label: 'Appointment Received',
      shortLabel: 'Received',
      message:
        'Your appointment request has been received and is waiting for confirmation.',
    },
    {
      key: 'confirmed',
      label: 'Appointment Confirmed',
      shortLabel: 'Confirmed',
      message:
        'Your appointment has been confirmed. Please wait for the scheduled service.',
    },
    {
      key: 'in_progress',
      label: 'Service In Progress',
      shortLabel: 'In Service',
      message:
        'Our technician is currently working on your vehicle.',
    },
    {
      key: 'completed',
      label: 'Service Completed',
      shortLabel: 'Completed',
      message:
        'Your vehicle service has been completed.',
    },
  ]


  



  const statusOrder = {
    pending: 0,
    confirmed: 1,
    in_progress: 2,
    completed: 3,
  }

  const currentIndex =
    statusOrder[status] ?? -1


  // =======================================================
  // REJECTED
  // =======================================================

  if (isRejected) {

    return (
      <div className="mt-2 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50/70 shadow-sm">

        <div className="flex items-start gap-4 p-5">

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
            <Icon name="x" size={21} />
          </div>

          <div className="min-w-0 flex-1">

            <h4 className="font-bold text-red-700">
              Appointment Rejected
            </h4>

            <p className="mt-1 text-sm text-red-600/80">
              Your appointment request was rejected.
            </p>

                                    {appointment.rejected_at && (
              <p className="mt-3 text-xs text-red-500/70">
                Rejected on{' '}
                {new Date(
                  appointment.rejected_at
                ).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            )}

            {appointment.rejection_reason && (
              <div className="mt-3 w-full min-w-0 overflow-hidden rounded-xl border border-red-200 bg-red-50/70 p-3 sm:p-4">


                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                  Reason
                </p>

                <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
  {appointment.rejection_reason}
</p>


              </div>
            )}

          </div>

        </div>

      </div>
    )
  }


  // =======================================================
  // CANCELLED
  // =======================================================

  if (isCancelled) {

    return (
      <div className="mt-2 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/70 shadow-sm">

        <div className="flex items-start gap-4 p-5">

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-600">
            <Icon name="alert" size={21} />
          </div>

          <div className="min-w-0 flex-1">

            <h4 className="font-bold text-orange-700">
              Service Cancelled
            </h4>

            <p className="mt-1 text-sm text-orange-600/80">
              This appointment has been cancelled.
            </p>

                        {appointment.cancelled_at && (
              <p className="mt-3 text-xs text-orange-500/70">
                Cancelled on{' '}
                {new Date(
                  appointment.cancelled_at
                ).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            )}

            {appointment.cancellation_reason && (
  <div className="mt-3 w-full min-w-0 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/70 p-3 sm:p-4">

  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
    Cancellation Reason
  </p>

  <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">
    {appointment.cancellation_reason}
  </p>

</div>

)}


          </div>

        </div>

      </div>
    )
  }


  // =======================================================
  // NORMAL PROGRESS
  // =======================================================

  return (
    <div className="mt-1 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm sm:p-5">

      <div className="mb-5 flex items-center justify-between gap-3">

        <div>

          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-800">
            Service Progress
          </h4>

          <p className="mt-1 text-xs text-slate-500">
            Track your appointment journey.
          </p>

        </div>

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:flex">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

          Live Tracking

        </div>

      </div>


      {/* MOBILE / DESKTOP TIMELINE */}

      <div className="space-y-0">

        {stages.map((stage, index) => {

          const isCompleted =
            status === 'completed' ||
            currentIndex > index

          const isActive =
            status !== 'completed' &&
            currentIndex === index

          const isWaiting =
            status !== 'completed' &&
            currentIndex < index

          return (
            <div
              key={stage.key}
              className="flex"
            >

              <div className="mr-3 flex flex-col items-center sm:mr-4">

                <div
                  className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-11 sm:w-11 ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : isActive
                      ? 'border-red-300 bg-red-50 text-red-600 shadow-lg shadow-red-500/10'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >

                  {isActive && (
                    <span className="absolute inset-0 animate-ping rounded-full border border-red-400/30" />
                  )}

                  {isCompleted ? (
                    <Icon
                      name="check"
                      size={18}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <Icon
                      name={
                        stage.key === 'in_progress'
                          ? 'wrench'
                          : 'clock'
                      }
                      size={17}
                    />
                  )}

                </div>


                {index < stages.length - 1 && (
                  <div
                    className={`min-h-[42px] w-px transition-colors duration-500 ${
                      isCompleted
                        ? 'bg-emerald-400/60'
                        : 'bg-slate-200'
                    }`}
                  />
                )}

              </div>


              <div
                className={`min-w-0 flex-1 ${
                  index === stages.length - 1
                    ? 'pb-1'
                    : 'pb-5'
                }`}
              >

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <p
                    className={`text-sm font-bold ${
                      isCompleted
                        ? 'text-emerald-700'
                        : isActive
                        ? 'text-red-600'
                        : 'text-slate-700'
                    }`}
                  >

                    <span className="sm:hidden">
                      {stage.shortLabel}
                    </span>

                    <span className="hidden sm:inline">
                      {stage.label}
                    </span>

                  </p>

                  {isActive && (
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">

                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

                      Current

                    </span>
                  )}

                </div>


                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    isWaiting
                      ? 'text-slate-500'
                      : 'text-slate-600'
                  }`}
                >
                  {isWaiting
                    ? 'Waiting for the previous stage to be completed.'
                    : stage.message}
                </p>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}






// =========================================================
// APPOINTMENT PROGRESS HISTORY
// =========================================================

// =========================================================
// APPOINTMENT PROGRESS HISTORY
// =========================================================

function AppointmentProgressHistory({
  history = [],
  appointment,
  attachments = [],
}) {


  function getStatusStyle(status) {

    switch (status?.toLowerCase()) {

      case 'pending':
        return {
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'clipboard',
        }

      case 'confirmed':
        return {
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: 'check',
        }

      case 'in_progress':
        return {
          color: 'text-violet-700',
          bg: 'bg-violet-50',
          border: 'border-violet-200',
          icon: 'wrench',
        }

      case 'completed':
        return {
          color: 'text-sky-700',
          bg: 'bg-sky-50',
          border: 'border-sky-200',
          icon: 'check',
        }

      case 'rejected':
      return {
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: '✕',
      }

    case 'cancelled':
      return {
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: '⚠',
      }



      default:
        return {
          color: 'text-slate-700',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: 'info',
        }
    }
  }


  function formatHistoryDate(date) {

    if (!date) {
      return 'Date not available'
    }

    const parsedDate = new Date(date)

    if (isNaN(parsedDate.getTime())) {
      return 'Date not available'
    }

    return parsedDate.toLocaleString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }


  async function viewAttachment(attachment) {

    try {

      if (!attachment?.file_path) {
        toast.error('Attachment file path is missing.')
        return
      }

      const { data, error } =
        await supabase.storage
          .from('service-task-attachments')
          .createSignedUrl(
            attachment.file_path,
            3600
          )

      if (error) {

        console.error(
          'Customer Attachment View Error:',
          error
        )

        toast.error(
          `Unable to view file: ${error.message}`
        )

        return
      }

      if (!data?.signedUrl) {
        toast.error(
          'Unable to create file preview URL.'
        )

        return
      }

      window.open(
        data.signedUrl,
        '_blank',
        'noopener,noreferrer'
      )

    } catch (error) {

      console.error(
        'Unexpected view error:',
        error
      )

      toast.error(
        error?.message ||
          'Something went wrong while opening the file.'
      )
    }
  }


  async function downloadAttachment(attachment) {

    try {

      if (!attachment?.file_path) {
        toast.error('Attachment file path is missing.')
        return
      }

      const { data, error } =
        await supabase.storage
          .from('service-task-attachments')
          .download(
            attachment.file_path
          )

      if (error) {

        console.error(
          'Download error:',
          error
        )

        toast.error(
          `Unable to download file: ${error.message}`
        )

        return
      }

      if (!data) {

        toast.error(
          'The file could not be downloaded.'
        )

        return
      }

      const url =
        URL.createObjectURL(data)

      const link =
        document.createElement('a')

      link.href = url

      link.download =
        attachment.file_name ||
        'attachment'

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)

      toast.success('Download started.')

    } catch (error) {

      console.error(
        'Unexpected download error:',
        error
      )

      toast.error(
        error?.message ||
          'Something went wrong while downloading the file.'
      )
    }
  }


  if (!history || history.length === 0) {

    return (
      <div className="mt-2 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
            <Icon name="clipboard" size={17} />
          </div>

          <div>

            <p className="text-sm font-bold text-slate-800">
              Progress History
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              No progress updates have been recorded yet.
            </p>

          </div>

        </div>

      </div>
    )
  }


  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-sm">

      {/* HEADER */}

      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:px-5">

        <div className="flex items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
              <Icon name="activity" size={18} />
            </div>

            <div className="min-w-0">

              <h4 className="text-sm font-bold text-slate-800">
                Progress History
              </h4>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                Record of service updates.
              </p>

            </div>

          </div>

          <span className="flex-shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {history.length} update
            {history.length !== 1 ? 's' : ''}
          </span>

        </div>

      </div>


      <div className="p-4 sm:p-5">

        <div className="space-y-0">

          {history.map((item, index) => {

  const itemStatus =
    item.status?.toLowerCase()

  // A rejection is stored as "cancelled" in the history,
  // so use rejected_at from the appointment to distinguish it.
  const isRejected =
    itemStatus === 'cancelled' &&
    Boolean(appointment?.rejected_at)

  const isCancelled =
    itemStatus === 'cancelled' &&
    !isRejected

  const displayStatus =
    isRejected
      ? 'rejected'
      : isCancelled
        ? 'cancelled'
        : itemStatus

  const style =
    getStatusStyle(displayStatus)

  const displayReason =
    isRejected
      ? appointment?.rejection_reason
      : isCancelled
        ? appointment?.cancellation_reason
        : null

  const isLast =
    index === history.length - 1


            return (
              <div
                key={item.id}
                className="flex gap-3 sm:gap-4"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.color}`}
                  >
                    <Icon
                      name={style.icon}
                      size={16}
                    />
                  </div>

                  {!isLast && (
                    <div className="min-h-[55px] w-px bg-slate-200" />
                  )}

                </div>


                <div
                  className={`min-w-0 flex-1 ${
                    isLast
                      ? 'pb-1'
                      : 'pb-6'
                  }`}
                >

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style.border} ${style.bg} ${style.color}`}
                    >
                      {displayStatus?.replace(
  '_',
  ' '
) || 'Unknown'}

                    </span>

                    <span className="text-[10px] font-medium text-slate-500">
                      {formatHistoryDate(
                        item.created_at
                      )}
                    </span>

                  </div>


                  <p className="mt-2 text-sm font-semibold leading-relaxed break-words text-slate-800">
  {isRejected
    ? 'Your appointment was rejected.'
    : isCancelled
      ? 'Your appointment was cancelled.'
      : item.message}
</p>

{displayReason && (
  <div
    className={`mt-3 w-full min-w-0 overflow-hidden rounded-xl border p-3 ${
      isRejected
        ? 'border-red-200 bg-red-50'
        : 'border-orange-200 bg-orange-50'
    }`}
  >
    <p
      className={`text-[9px] font-black uppercase tracking-wider ${
        isRejected
          ? 'text-red-500'
          : 'text-orange-600'
      }`}
    >
      {isRejected
        ? 'Rejection Reason'
        : 'Cancellation Reason'}
    </p>

    <p
      className="mt-1 w-full break-words whitespace-normal text-sm leading-6 text-slate-700"
      style={{
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}
    >
      {displayReason}
    </p>
  </div>
)}


                  


                  {(item.changed_by_name ||
                    item.changed_by_role) && (

                    <div className="mt-2 flex flex-wrap items-center gap-2">

                      <span className="text-[10px] text-slate-500">
                        Updated by
                      </span>

                      {item.changed_by_name && (
                        <span className="text-xs font-semibold text-slate-700">
                          {item.changed_by_name}
                        </span>
                      )}

                      {item.changed_by_role && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                          {item.changed_by_role}
                        </span>
                      )}

                    </div>
                  )}

                </div>

              </div>
            )
          })}

        </div>




        {/* ATTACHMENTS */}

        {attachments.length > 0 && (

          <div className="mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50/70">

            <div className="border-b border-orange-200 px-4 py-3">

              <div className="flex items-center gap-2">

                <Icon
                  name="paperclip"
                  size={15}
                  className="text-orange-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-700">
                  Service Attachments
                </p>

              </div>

            </div>


            <div className="space-y-2 p-3">

              {attachments.map((attachment) => (

                <div
                  key={attachment.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >

                  <div className="flex min-w-0 items-start gap-3">

                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                      <Icon name="file" size={16} />
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-slate-800">
                        {attachment.file_name}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        Uploaded by{' '}
                        {attachment.uploaded_by_name ||
                          'Unknown user'}
                        {' • '}
                        {attachment.uploaded_by_role ||
                          'Unknown role'}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">

                        {attachment.created_at
                          ? new Date(
                              attachment.created_at
                            ).toLocaleString([], {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'Date unavailable'}

                      </p>

                    </div>

                  </div>


                  <div className="flex w-full gap-2 sm:w-auto">

                    <button
                      type="button"
                      onClick={() =>
                        viewAttachment(
                          attachment
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 sm:flex-none"
                    >
                      <Icon name="eye" size={14} />
                      View
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        downloadAttachment(
                          attachment
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 sm:flex-none"
                    >
                      <Icon name="download" size={14} />
                      Download
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  )
}


// =========================================================
// APPOINTMENT MESSAGING
// =========================================================

function AppointmentMessaging({
  appointment,
  conversationId,
  warrantyEndsAt,
  warrantyActive,
  onClose,
}) {
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // Auto-scroll tracking
  const messagesContainerRef = useRef(null)
  const previousMessageCountRef = useRef(0)
  const hasInitialScrolledRef = useRef(false)

  const readOnly =
    appointment.status?.toLowerCase() === 'completed' &&
    !warrantyActive

  // =======================================================
  // LOAD USER
  // =======================================================

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (mounted) {
        setCurrentUser(user)
      }
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [])

  // =======================================================
  // LOAD MESSAGES
  // =======================================================

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setLoadingMessages(false)
      return
    }

    let mounted = true

    async function loadMessages() {
      setLoadingMessages(true)

      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          message,
          created_at
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error('Customer Messages Error:', error)

        if (mounted) {
          setMessages([])
        }
      } else if (mounted) {
        setMessages(data || [])
      }

      if (mounted) {
        setLoadingMessages(false)
      }
    }

    loadMessages()

    const channel = supabase
      .channel(`customer-conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        payload => {
          if (!mounted) {
            return
          }

          setMessages(prev => {
            const alreadyExists = prev.some(
              item => item.id === payload.new.id
            )

            if (alreadyExists) {
              return prev
            }

            return [...prev, payload.new]
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false

      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // =======================================================
  // RESET SCROLL TRACKING WHEN CONVERSATION CHANGES
  // =======================================================

  useEffect(() => {
    previousMessageCountRef.current = 0
    hasInitialScrolledRef.current = false
  }, [conversationId])

  // =======================================================
  // AUTO SCROLL TO LATEST MESSAGE
  // =======================================================

  useEffect(() => {
    // Wait until the message list is actually rendered
    if (loadingMessages) return

    const container = messagesContainerRef.current
    if (!container) return

    if (messages.length === 0) {
      previousMessageCountRef.current = 0
      return
    }

    const isInitialOpen = !hasInitialScrolledRef.current

    const hasNewMessage =
      messages.length > previousMessageCountRef.current

    // OPENING: jump instantly to the latest message
    if (isInitialOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight
        })
      })

      hasInitialScrolledRef.current = true
    }

    // NEW MESSAGE WHILE INSIDE: scroll smoothly
    else if (hasNewMessage) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      })
    }

    previousMessageCountRef.current = messages.length
  }, [loadingMessages, messages.length])

  // =======================================================
  // SEND MESSAGE
  // =======================================================

  async function sendMessage(event) {
    event.preventDefault()

    const text = messageText.trim()

    if (!text) {
      return
    }

    if (!currentUser) {
      toast.error('You must be signed in to send a message.')

      return
    }

    if (readOnly) {
      toast.error(
        'The messaging period for this appointment has ended.'
      )

      return
    }

    if (!conversationId) {
      toast.error(
        'No conversation is available for this appointment.'
      )

      return
    }

    try {
      setSending(true)

      const { data: allowed, error: permissionError } =
        await supabase.rpc('can_send_appointment_message', {
          p_conversation_id: conversationId,
        })

      if (permissionError) {
        console.error(
          'Message Permission Error:',
          permissionError
        )

        throw new Error(permissionError.message)
      }

      if (!allowed) {
        toast.error(
          'You are no longer allowed to send messages for this appointment.'
        )

        return
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          message: text,
        })
        .select(`
          id,
          conversation_id,
          sender_id,
          message,
          created_at
        `)
        .single()

      if (error) {
        console.error('Send Message Error:', error)

        throw new Error(error.message)
      }

      setMessages(prev => {
        const alreadyExists = prev.some(
          item => item.id === data.id
        )

        if (alreadyExists) {
          return prev
        }

        return [...prev, data]
      })

      setMessageText('')
    } catch (error) {
      console.error('Customer Send Message Error:', error)

      toast.error(`Unable to send message: ${error.message}`)
    } finally {
      setSending(false)
    }
  }

  // =======================================================
  // FORMAT DATE
  // =======================================================

  function formatMessageDate(date) {
    if (!date) {
      return ''
    }

    const parsed = new Date(date)

    if (isNaN(parsed.getTime())) {
      return ''
    }

    return parsed.toLocaleString([], {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">

      {/* ===================================================
          CHAT HEADER
      =================================================== */}

      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">

        <div className="flex min-w-0 items-center gap-3">

          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">

            <Icon name="message" size={18} />

            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />

          </div>

          <div className="min-w-0">

            <h4 className="truncate text-sm font-bold text-slate-900">
              Service Team
            </h4>

            <p className="truncate text-xs text-slate-500">
              {appointment.service_type}
              {appointment.vehicle_model
                ? ` • ${appointment.vehicle_model}`
                : ''}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close conversation"
        >
          <Icon name="close" size={17} />
        </button>

      </div>

      {/* ===================================================
          WARRANTY ACTIVE
      =================================================== */}

      {appointment.status?.toLowerCase() === 'completed' &&
        warrantyActive && (

        <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-5">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">

              <Icon name="shield" size={17} />

            </div>

            <div className="min-w-0">

              <p className="text-sm font-bold text-emerald-700">
                Warranty Active
              </p>

              <p className="mt-1 text-xs leading-relaxed text-emerald-700/70">
                You can continue communicating with the service team during your 3-day warranty period.
              </p>

              {warrantyEndsAt && (
                <p className="mt-1 text-[10px] font-medium text-emerald-700/60">
                  Warranty ends{' '}
                  {new Date(warrantyEndsAt).toLocaleString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          WARRANTY EXPIRED
      =================================================== */}

      {readOnly && (

        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">

              <Icon name="lock" size={16} />

            </div>

            <div>

              <p className="text-sm font-bold text-slate-600">
                Warranty Period Ended
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                This conversation is now read-only.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ===================================================
          MESSAGES
      =================================================== */}

      <div
        ref={messagesContainerRef}
        className="max-h-[420px] min-h-[230px] overflow-y-auto bg-slate-50 p-4 sm:p-5"
      >

        {loadingMessages ? (

          <div className="flex h-48 items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">

                <Icon name="message" size={20} />

              </div>

              <p className="mt-3 text-xs text-slate-400">
                Loading conversation...
              </p>

            </div>

          </div>

        ) : messages.length === 0 ? (

          <div className="flex h-48 items-center justify-center">

            <div className="max-w-sm text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">

                <Icon name="message" size={24} />

              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                Start a conversation
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Send a message to communicate with the service team about this appointment.
              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-4">

            {messages.map(item => {

              const isMine =
                currentUser &&
                item.sender_id === currentUser.id

              return (
                <div
                  key={item.id}
                  className={`flex ${
                    isMine ? 'justify-end' : 'justify-start'
                  }`}
                >

                  <div
                    className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${
                      isMine ? 'items-end' : 'items-start'
                    }`}
                  >

                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? 'rounded-br-md bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-slate-200/50'
                      }`}
                    >
                      {item.message}
                    </div>

                    <p
                      className={`mt-1.5 text-[9px] text-slate-400 ${
                        isMine ? 'text-right' : 'text-left'
                      }`}
                    >
                      {isMine ? 'You' : 'Service Team'}
                      {' • '}
                      {formatMessageDate(item.created_at)}
                    </p>

                  </div>

                </div>
              )
            })}

          </div>
        )}

      </div>

      {/* ===================================================
          COMPOSER
      =================================================== */}

      {!readOnly ? (

        <form
          onSubmit={sendMessage}
          className="border-t border-slate-200 bg-white p-3 sm:p-4"
        >

          <div className="flex items-end gap-2">

            <textarea
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              onKeyDown={e => {

                if (e.key === 'Enter' && !e.shiftKey) {

                  e.preventDefault()

                  if (!sending && messageText.trim()) {
                    sendMessage(e)
                  }
                }
              }}
              rows={2}
              placeholder="Write a message to the service team..."
              disabled={sending}
              className="min-h-[54px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="flex h-[54px] w-[54px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:from-red-400 hover:to-red-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-5"
              aria-label="Send message"
            >

              {sending ? (

                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

              ) : (

                <>
                  <Icon name="send" size={17} />

                  <span className="ml-2 hidden sm:inline">
                    Send
                  </span>
                </>

              )}

            </button>

          </div>

          <div className="mt-2 flex items-center justify-between px-1">

            <p className="text-[9px] text-slate-400">
              Enter to send • Shift + Enter for a new line
            </p>

            <span className="hidden text-[9px] text-slate-400 sm:block">
              Secure conversation
            </span>

          </div>

        </form>

      ) : (

        <div className="border-t border-slate-200 bg-white px-5 py-4">

          <div className="flex items-center justify-center gap-2 text-center">

            <Icon
              name="lock"
              size={13}
              className="text-slate-400"
            />

            <p className="text-[10px] font-semibold text-slate-400">
              Messaging is no longer available because the 3-day warranty period has ended.
            </p>

          </div>

        </div>

      )}

    </div>
  )
}

// =========================================================
// DATE / TIME HELPERS
// =========================================================

function formatLongDate(value) {
  if (!value) return 'Not specified'

  const [year, month, day] = String(value)
    .slice(0, 10)
    .split('-')
    .map(Number)

  if (!year || !month || !day) return String(value)

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime12(value) {
  if (!value) return 'No time set'

  try {
    return new Date(`2000-01-01T${value}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return value
  }
}

// =========================================================
// DETAIL ITEM (icon + label + value)
// =========================================================

function DetailItem({ icon, label, value, emphasize = false }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 shadow-sm">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
        <Icon name={icon} size={15} />
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p
          className={`break-words text-sm leading-tight ${
            emphasize
              ? 'font-black tracking-wide text-slate-900'
              : 'font-bold text-slate-800'
          }`}
        >
          {value}
        </p>

      </div>

    </div>
  )
}










// =========================================================
// MY APPOINTMENTS PAGE
// =========================================================

export default function MyAppointments() {

  const [appointments, setAppointments] = useState([])
  const [progressHistory, setProgressHistory] = useState({})
  const [appointmentFilter, setAppointmentFilter] = useState('all')
  const [attachments, setAttachments] = useState({})
  const appointmentSummaryScrollRef = useRef(null)
  const [activeAppointmentSummary, setActiveAppointmentSummary] = useState(0)
  const [highlightedAppointmentId, setHighlightedAppointmentId] = useState(null)

  const [customerConversationMap, setCustomerConversationMap] =
    useState({})

  const [warrantyEndsAt, setWarrantyEndsAt] =
    useState({})

  const [unreadMessageCounts, setUnreadMessageCounts] =
    useState({})

  const [showMessaging, setShowMessaging] =
    useState(false)

  const [activeConversation, setActiveConversation] =
    useState(null)

  const [searchTerm, setSearchTerm] =
    useState('')

  const [selectedAppointmentId, setSelectedAppointmentId] =
  useState(null)
  
  const [currentUser, setCurrentUser] =
    useState(null)

    const [targetAppointmentId, setTargetAppointmentId] =
  useState(null)


  // =========================================================
  // REFS
  // =========================================================

  const appointmentsRef =
    useRef([])

  const conversationMapRef =
    useRef({})

  const activeConversationRef =
    useRef(null)

  const currentUserRef =
    useRef(null)

  const unreadLoadVersion =
    useRef(0)
  
  const processedCustomerMessageIdsRef =
  useRef(new Set())


  // =========================================================
  // KEEP REFS SYNCHRONIZED
  // =========================================================

  useEffect(() => {
    appointmentsRef.current =
      appointments
  }, [appointments])


  useEffect(() => {
    conversationMapRef.current =
      customerConversationMap
  }, [customerConversationMap])


  useEffect(() => {
    activeConversationRef.current =
      activeConversation
  }, [activeConversation])


  useEffect(() => {
    currentUserRef.current =
      currentUser
  }, [currentUser])


  // =========================================================
  // HIDDEN APPOINTMENTS
  // =========================================================

  const [hiddenAppointments, setHiddenAppointments] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            'hiddenCustomerAppointments'
          )

        return saved
          ? JSON.parse(saved)
          : []

      } catch (error) {

        console.error(
          'Failed to load hidden appointments:',
          error
        )

        return []
      }
    })


  const navigate =
    useNavigate()
  const location = useLocation()

 useEffect(() => {

  const targetId =
    location.state?.appointmentId

  if (!targetId) return

  const numericTargetId =
    Number(targetId)

  if (!appointments.length) {
    return
  }

  const targetAppointment =
    appointments.find(
      (appointment) =>
        Number(appointment.id) ===
        numericTargetId
    )

  if (!targetAppointment) {
    console.log(
      '⏳ Waiting for target appointment:',
      numericTargetId
    )
    return
  }

  console.log(
    '🎯 Target appointment ready:',
    numericTargetId
  )

  requestAnimationFrame(() => {

    const element =
      document.getElementById(
        `appointment-${numericTargetId}`
      )

    if (!element) {
      console.log(
        '⏳ Waiting for target card to render:',
        numericTargetId
      )
      return
    }

    console.log(
      '🚀 Scrolling to appointment:',
      numericTargetId
    )

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    setHighlightedAppointmentId(
      numericTargetId
    )

    setTimeout(() => {
      setHighlightedAppointmentId(null)
    }, 3000)

  })

}, [
  appointments,
  location.state?.appointmentId,
])






  // =========================================================
  // LOAD CURRENT USER
  // =========================================================

  useEffect(() => {

    let mounted = true

    async function loadCurrentUser() {

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser()

      if (!mounted) {
        return
      }

      setCurrentUser(user)
      currentUserRef.current = user
    }

    loadCurrentUser()

    return () => {
      mounted = false
    }

  }, [])


  // =========================================================
  // LOAD APPOINTMENTS
  // =========================================================

  useEffect(() => {

  let mounted = true

  const notificationAppointmentId =
    location.state?.appointmentId
      ? Number(location.state.appointmentId)
      : null

  if (notificationAppointmentId) {
    setTargetAppointmentId(
      notificationAppointmentId
    )

    console.log(
      '🎯 Customer notification target:',
      notificationAppointmentId
    )
  }

  async function loadAppointments() {

    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser()

    if (!user || !mounted) {
      return
    }

    // =====================================================
    // FAST PATH
    // Load the notification appointment first
    // =====================================================

    let targetAppointment = null

    if (notificationAppointmentId) {

      const {
        data: targetData,
        error: targetError,
      } = await supabase
        .from('appointments')
        .select('*')
        .eq(
          'customer_id',
          user.id
        )
        .eq(
          'id',
          notificationAppointmentId
        )
        .maybeSingle()

      if (targetError) {

        console.error(
          '🎯 Target appointment load error:',
          targetError
        )

      } else {

        targetAppointment =
          targetData

        console.log(
          '🎯 Target appointment loaded:',
          targetAppointment
        )
      }
    }


    // =====================================================
    // LOAD ALL APPOINTMENTS
    // =====================================================

    const {
      data,
      error,
    } = await supabase
      .from('appointments')
      .select('*')
      .eq(
        'customer_id',
        user.id
      )
      .order(
        'appointment_date',
        {
          ascending: false,
        }
      )
      .order(
        'appointment_time',
        {
          ascending: false,
        }
      )


    if (error) {

      console.error(
        'Appointments Error:',
        error
      )

      return
    }


    if (!mounted) {
      return
    }


    let nextAppointments =
      data || []


    // =====================================================
    // MAKE SURE TARGET APPOINTMENT IS FIRST
    // =====================================================
    //
    // This means the target is available immediately
    // even while the rest of the page continues loading.
    //

    if (targetAppointment) {

      nextAppointments = [
        targetAppointment,
        ...nextAppointments.filter(
          (appointment) =>
            Number(appointment.id) !==
            Number(targetAppointment.id)
        ),
      ]
    }


    setAppointments(
      nextAppointments
    )

    appointmentsRef.current =
      nextAppointments
  }


  loadAppointments()


  // =====================================================
  // REALTIME APPOINTMENT LISTENER
  // =====================================================

  const apptChannel =
    supabase
      .channel(
        'customer-my-appointments'
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        () => {
          loadAppointments()
        }
      )
      .subscribe()


  return () => {

    mounted = false

    supabase.removeChannel(
      apptChannel
    )
  }

}, [
  location.state?.appointmentId,
])


  



  // =========================================================
  // FETCH PROGRESS HISTORY
  // =========================================================

  useEffect(() => {

    async function loadProgressHistory() {

      if (!appointments.length) {

        setProgressHistory({})

        return
      }


      const appointmentIds =
        appointments.map(
          appointment =>
            appointment.id
        )


      const {
        data,
        error,
      } = await supabase
        .from(
          'appointment_progress_history'
        )
        .select(`
          id,
          appointment_id,
          status,
          message,
          changed_by,
          changed_by_name,
          changed_by_role,
          created_at
        `)
        .in(
          'appointment_id',
          appointmentIds
        )
        .order(
          'created_at',
          {
            ascending: true,
          }
        )


      if (error) {

        console.error(
          'Customer Progress History Error:',
          error
        )

        return
      }


      const historyMap = {}


      ;(data || []).forEach(
        historyItem => {

          const appointmentId =
            historyItem.appointment_id

          if (
            !historyMap[
              appointmentId
            ]
          ) {
            historyMap[
              appointmentId
            ] = []
          }

          historyMap[
            appointmentId
          ].push(
            historyItem
          )
        }
      )


      setProgressHistory(
        historyMap
      )
    }


    loadProgressHistory()

  }, [appointments])


  // =========================================================
  // FETCH ATTACHMENTS
  // =========================================================

  useEffect(() => {

    async function loadAttachments() {

      if (!appointments.length) {

        setAttachments({})

        return
      }


      const appointmentIds =
        appointments.map(
          appointment =>
            appointment.id
        )


      const {
        data,
        error,
      } = await supabase
        .from(
          'service_task_attachments'
        )
        .select(`
          id,
          appointment_id,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_by,
          uploaded_by_name,
          uploaded_by_role,
          created_at
        `)
        .in(
          'appointment_id',
          appointmentIds
        )
        .order(
          'created_at',
          {
            ascending: true,
          }
        )


      if (error) {

        console.error(
          'Customer Attachments Error:',
          error
        )

        setAttachments({})

        return
      }


      const attachmentMap = {}


      ;(data || []).forEach(
        attachment => {

          const appointmentId =
            attachment.appointment_id

          if (
            !attachmentMap[
              appointmentId
            ]
          ) {
            attachmentMap[
              appointmentId
            ] = []
          }

          attachmentMap[
            appointmentId
          ].push(
            attachment
          )
        }
      )


      setAttachments(
        attachmentMap
      )
    }


    loadAttachments()

  }, [appointments])


  // =========================================================
  // FORMAT DATE TIME
  // =========================================================

  function formatDateTime(date) {

    if (!date) {
      return 'Not available'
    }

    return new Date(
      date
    ).toLocaleString(
      [],
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    )
  }


  // =========================================================
  // FILTER APPOINTMENTS
  // =========================================================

  const filteredAppointments =
  appointments.filter(
    (apt) => {

      // =====================================================
      // HIDDEN APPOINTMENTS
      // =====================================================

      if (
        hiddenAppointments.includes(
          apt.id
        )
      ) {
        return false
      }


      // =====================================================
      // STATUS
      // =====================================================

      const status =
        apt.status?.toLowerCase()


      const isRejected =
        status === 'cancelled' &&
        Boolean(apt.rejected_at)


      const isCancelled =
        status === 'cancelled' &&
        !isRejected


      // =====================================================
      // APPOINTMENT FILTER
      // =====================================================

      if (
        appointmentFilter === 'completed' &&
        status !== 'completed'
      ) {
        return false
      }


      if (
  appointmentFilter === 'cancelled' &&
  !(
    status === 'cancelled' &&
    !Boolean(
      apt.rejection_reason?.trim()
    )
  )
) {
  return false
}



      if (
  appointmentFilter === 'rejected' &&
  !(
    status === 'cancelled' &&
    Boolean(
      apt.rejection_reason?.trim()
    )
  )
) {
  return false
}



      // =====================================================
      // SEARCH
      // =====================================================

      const search =
        searchTerm
          .trim()
          .toLowerCase()


      if (!search) {
        return true
      }


      const appointmentId =
  Number(apt.id)

const appointmentNumber =
  Number.isFinite(appointmentId)
    ? `APPT-${String(
        appointmentId
      ).padStart(6, '0')}`
    : ''

const searchableText = [
  appointmentNumber,
  apt.plate_number,
  apt.vehicle_model,
  apt.service_type,
  apt.appointment_date,
  apt.appointment_time,
  apt.notes,
]
  .filter(Boolean)
  .join(' ')
  .toLowerCase()

return searchableText.includes(
  search
)

    }
  )



  // =========================================================
  // HIDE APPOINTMENT
  // =========================================================

  function hideAppointmentFromUI(
    appointmentId
  ) {

    setHiddenAppointments(
      prev => {

        if (
          prev.includes(
            appointmentId
          )
        ) {
          return prev
        }


        const updated = [
          ...prev,
          appointmentId,
        ]


        localStorage.setItem(
          'hiddenCustomerAppointments',
          JSON.stringify(
            updated
          )
        )


        return updated
      }
    )
  }


  // =========================================================
// OPEN APPOINTMENT FROM NOTIFICATION
// INCLUDING AUTOMATIC MESSAGE OPEN
// =========================================================

useEffect(() => {

  const appointmentId =
    location.state?.appointmentId

  const shouldOpenMessaging =
    location.state?.openMessaging === true

  if (!appointmentId) {
    return
  }


  // =======================================================
  // FIND TARGET APPOINTMENT
  // =======================================================

  const targetAppointment =
    appointments.find(
      apt =>
        String(apt.id) ===
        String(appointmentId)
    )

  if (!targetAppointment) {
    return
  }


  // =======================================================
  // REVEAL IF HIDDEN
  // =======================================================

  if (
    hiddenAppointments.includes(
      targetAppointment.id
    )
  ) {

    setHiddenAppointments(
      previous => {

        const updated =
          previous.filter(
            id =>
              String(id) !==
              String(targetAppointment.id)
          )

        localStorage.setItem(
          'hiddenCustomerAppointments',
          JSON.stringify(updated)
        )

        return updated
      }
    )
  }


  // =======================================================
  // SELECT CORRECT FILTER
  // =======================================================

  const status =
    targetAppointment.status?.toLowerCase()

  if (status === 'completed') {

    setAppointmentFilter(
      'completed'
    )

  } else if (status === 'cancelled') {

    setAppointmentFilter(
      'cancelled'
    )

  } else if (status === 'rejected') {

    setAppointmentFilter(
      'rejected'
    )

  } else {

    setAppointmentFilter(
      'all'
    )
  }


  // =======================================================
  // CLEAR SEARCH
  // =======================================================

  setSearchTerm('')


  // =======================================================
  // SELECT APPOINTMENT
  // =======================================================

  setSelectedAppointmentId(
    targetAppointment.id
  )


  // =======================================================
  // AUTOMATICALLY OPEN MESSAGING
  // =======================================================

  if (!shouldOpenMessaging) {
    return
  }


  const conversationId =
    conversationMapRef.current?.[
      targetAppointment.id
    ]


  // Conversation may not have loaded yet.
  // The effect will run again when the
  // conversation map becomes available.
  if (!conversationId) {

    console.log(
      '🟡 Message notification received, waiting for conversation:',
      targetAppointment.id
    )

    return
  }


  const appointmentWarrantyEndsAt =
    warrantyEndsAt[
      targetAppointment.id
    ] || null


  const completedAt =
    targetAppointment.completed_at


  let warrantyActive =
    false


  if (
    targetAppointment.status?.toLowerCase() ===
      'completed' &&
    completedAt
  ) {

    const warrantyEnd =
      new Date(
        completedAt
      ).getTime() +
      (
        3 *
        24 *
        60 *
        60 *
        1000
      )

    warrantyActive =
      Date.now() <
      warrantyEnd
  }


  const nextConversation = {

    appointment:
      targetAppointment,

    conversationId:
      conversationId,

    warrantyEndsAt:
      appointmentWarrantyEndsAt,

    warrantyActive:
      warrantyActive,
  }


  console.log(
    '💬 OPENING CUSTOMER CONVERSATION FROM NOTIFICATION:',
    nextConversation
  )


  activeConversationRef.current =
    nextConversation

  setActiveConversation(
    nextConversation
  )

  setShowMessaging(
    true
  )


  // =======================================================
  // MARK CONVERSATION AS READ
  // =======================================================

  markConversationAsRead(
    conversationId,
    targetAppointment.id
  )

}, [
  location.state,
  appointments,
  hiddenAppointments,
  customerConversationMap,
  warrantyEndsAt,
])





  useEffect(() => {
  if (!selectedAppointmentId) {
    return
  }

  const element = document.getElementById(
    `appointment-${selectedAppointmentId}`
  )

  if (!element) {
    return
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}, [selectedAppointmentId, filteredAppointments])




  // =========================================================
  // VISIBLE APPOINTMENTS
  // =========================================================

  const visibleAppointments =
    appointments.filter(
      apt =>
        !hiddenAppointments.includes(
          apt.id
        )
    )


  // =========================================================
  // LOAD CUSTOMER CONVERSATIONS
  // =========================================================

  useEffect(() => {

    let mounted = true

    async function loadCustomerConversations() {

      if (!appointments.length) {

        setCustomerConversationMap({})
        setWarrantyEndsAt({})

        conversationMapRef.current =
          {}

        return
      }


      const appointmentIds =
        appointments.map(
          appointment =>
            appointment.id
        )


      const {
        data,
        error,
      } = await supabase
        .from('conversations')
        .select(`
          id,
          appointment_id
        `)
        .in(
          'appointment_id',
          appointmentIds
        )


      if (error) {

        console.error(
          'Customer conversations error:',
          error
        )

        return
      }


      const conversationMap =
        {}

      const warrantyMap =
        {}


      ;(data || []).forEach(
        conversation => {

          conversationMap[
            conversation.appointment_id
          ] =
            conversation.id
        }
      )


      appointments.forEach(
        appointment => {

          if (
            appointment.status?.toLowerCase() ===
            'completed' &&
            appointment.completed_at
          ) {

            const completedAt =
              new Date(
                appointment.completed_at
              )


            const warrantyEnd =
              new Date(
                completedAt.getTime() +
                (
                  3 *
                  24 *
                  60 *
                  60 *
                  1000
                )
              )


            warrantyMap[
              appointment.id
            ] =
              warrantyEnd.toISOString()
          }
        }
      )


      if (!mounted) {
        return
      }


      setCustomerConversationMap(
        conversationMap
      )

      conversationMapRef.current =
        conversationMap

      setWarrantyEndsAt(
        warrantyMap
      )
    }


    loadCustomerConversations()

    return () => {
      mounted = false
    }

  }, [appointments])


  // =========================================================
  // LOAD UNREAD MESSAGE COUNTS
  // =========================================================

  async function loadUnreadMessageCounts() {

    const requestVersion =
      ++unreadLoadVersion.current


    const user =
      currentUserRef.current


    if (!user) {

      setUnreadMessageCounts({})

      return
    }


    const currentAppointments =
      appointmentsRef.current


    if (!currentAppointments.length) {

      setUnreadMessageCounts({})

      return
    }


    const appointmentIds =
      currentAppointments.map(
        appointment =>
          appointment.id
      )


    const {
      data: conversations,
      error: conversationError,
    } = await supabase
      .from('conversations')
      .select(`
        id,
        appointment_id
      `)
      .in(
        'appointment_id',
        appointmentIds
      )


    if (conversationError) {

      console.error(
        'Customer unread conversations error:',
        conversationError
      )

      return
    }


    if (!conversations?.length) {

      if (
        requestVersion ===
        unreadLoadVersion.current
      ) {
        setUnreadMessageCounts({})
      }

      return
    }


    const conversationIds =
      conversations.map(
        conversation =>
          conversation.id
      )


    const {
      data: participants,
      error: participantError,
    } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        last_read_at
      `)
      .eq(
        'user_id',
        user.id
      )
      .in(
        'conversation_id',
        conversationIds
      )


    if (participantError) {

      console.error(
        'Customer conversation participant read error:',
        participantError
      )

      return
    }


    const lastReadMap =
      {}


    ;(participants || []).forEach(
      participant => {

        lastReadMap[
          participant.conversation_id
        ] =
          participant.last_read_at
      }
    )


    const {
      data: incomingMessages,
      error: messageError,
    } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        created_at
      `)
      .in(
        'conversation_id',
        conversationIds
      )
      .neq(
        'sender_id',
        user.id
      )
      .is(
        'deleted_at',
        null
      )


    if (messageError) {

      console.error(
        'Customer unread messages error:',
        messageError
      )

      return
    }


    const conversationAppointmentMap =
      {}


    conversations.forEach(
      conversation => {

        conversationAppointmentMap[
          conversation.id
        ] =
          conversation.appointment_id
      }
    )


    const counts = {}


    ;(incomingMessages || []).forEach(
      message => {

        const appointmentId =
          conversationAppointmentMap[
            message.conversation_id
          ]


        if (!appointmentId) {
          return
        }


        const lastReadAt =
          lastReadMap[
            message.conversation_id
          ]


        const messageTime =
          new Date(
            message.created_at
          ).getTime()


        const readTime =
          lastReadAt
            ? new Date(
                lastReadAt
              ).getTime()
            : 0


        if (
          messageTime <=
          readTime
        ) {
          return
        }


        counts[
          appointmentId
        ] =
          (
            counts[
              appointmentId
            ] || 0
          ) + 1
      }
    )


    if (
      requestVersion !==
      unreadLoadVersion.current
    ) {
      return
    }


    setUnreadMessageCounts(
      counts
    )
  }


  // =========================================================
  // INITIAL UNREAD LOAD
  // =========================================================

  useEffect(() => {

    if (!currentUser) {
      return
    }

    loadUnreadMessageCounts()

  }, [
    currentUser,
    appointments,
  ])


  // =========================================================
  // MARK CONVERSATION AS READ
  // =========================================================

  async function markConversationAsRead(
    conversationId,
    appointmentId
  ) {

    if (!conversationId) {
      return false
    }


    const user =
      currentUserRef.current


    if (!user) {
      return false
    }


    const readAt =
      new Date().toISOString()


    ++unreadLoadVersion.current


    setUnreadMessageCounts(
      previous => {

        const updated = {
          ...previous,
        }

        delete updated[
          appointmentId
        ]

        return updated
      }
    )


    const {
      data: updatedRows,
      error: updateError,
    } = await supabase
      .from('conversation_participants')
      .update({
        last_read_at:
          readAt,
      })
      .eq(
        'conversation_id',
        conversationId
      )
      .eq(
        'user_id',
        user.id
      )
      .select(`
        conversation_id,
        user_id,
        last_read_at
      `)


    if (updateError) {

      console.error(
        'Customer conversation read update error:',
        updateError
      )

      await loadUnreadMessageCounts()

      return false
    }


    if (!updatedRows?.length) {

      const {
        data: insertedRows,
        error: insertError,
      } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id:
            conversationId,

          user_id:
            user.id,

          last_read_at:
            readAt,
        })
        .select(`
          conversation_id,
          user_id,
          last_read_at
        `)


      if (insertError) {

        console.error(
          'Customer conversation read participant insert error:',
          insertError
        )

        await loadUnreadMessageCounts()

        return false
      }


      if (!insertedRows?.length) {

        console.error(
          'Customer conversation read insert returned no row.'
        )

        await loadUnreadMessageCounts()

        return false
      }
    }


    const {
      data: verifiedParticipant,
      error: verifyError,
    } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        user_id,
        last_read_at
      `)
      .eq(
        'conversation_id',
        conversationId
      )
      .eq(
        'user_id',
        user.id
      )
      .maybeSingle()


    if (verifyError) {

      console.error(
        'Customer conversation read verification error:',
        verifyError
      )

      return false
    }


    const verifiedTime =
      verifiedParticipant?.last_read_at
        ? new Date(
            verifiedParticipant.last_read_at
          ).getTime()
        : 0


    const expectedTime =
      new Date(
        readAt
      ).getTime()


    if (
      !verifiedParticipant ||
      verifiedTime <
        expectedTime
    ) {

      console.error(
        'Customer conversation read state was not persisted correctly.',
        {
          conversationId,
          expected: readAt,
          actual:
            verifiedParticipant?.last_read_at,
        }
      )

      await loadUnreadMessageCounts()

      return false
    }


    return true
  }


  // =========================================================
  // REALTIME MESSAGE NOTIFICATIONS
  // =========================================================

 // =========================================================
// REALTIME MESSAGE NOTIFICATIONS
// =========================================================

useEffect(() => {

  if (!currentUser) {
    return
  }

  let mounted = true

  console.log(
    '💬 Starting CUSTOMER APPOINTMENTS MESSAGE REALTIME:',
    currentUser.id
  )

  const channel =
    supabase
      .channel(
        `customer-my-appointments-messages-${currentUser.id}`
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async payload => {

          if (!mounted) {
            return
          }

          const newMessage =
            payload?.new

          if (!newMessage?.id) {
            return
          }

          console.log(
            '💬 CUSTOMER APPOINTMENTS REALTIME NEW MESSAGE:',
            newMessage
          )

          // =================================================
          // PREVENT DUPLICATE REALTIME EVENTS
          // =================================================

          if (
            processedCustomerMessageIdsRef.current.has(
              newMessage.id
            )
          ) {
            return
          }

          processedCustomerMessageIdsRef.current.add(
            newMessage.id
          )

          // =================================================
          // CURRENT USER
          // =================================================

          const user =
            currentUserRef.current

          if (!user) {
            return
          }

          // =================================================
          // IGNORE OUR OWN MESSAGE
          // =================================================

          if (
            String(newMessage.sender_id) ===
            String(user.id)
          ) {
            return
          }

          // =================================================
          // FIND APPOINTMENT FROM EXISTING MAP
          // =================================================

          let appointment =
            appointmentsRef.current.find(
              appointment =>
                String(
                  conversationMapRef.current?.[
                    appointment.id
                  ]
                ) ===
                String(
                  newMessage.conversation_id
                )
            )

          // =================================================
          // FALLBACK:
          // IF CONVERSATION MAP IS NOT READY YET,
          // LOOK UP THE CONVERSATION DIRECTLY
          // =================================================

          if (!appointment) {

            console.log(
              '🟡 Conversation not found in local map. Looking it up...'
            )

            const {
              data: conversation,
              error: conversationError,
            } = await supabase
              .from('conversations')
              .select(`
                id,
                appointment_id
              `)
              .eq(
                'id',
                newMessage.conversation_id
              )
              .maybeSingle()

            if (conversationError) {

              console.error(
                'Customer realtime conversation lookup error:',
                conversationError
              )

              return
            }

            if (!conversation) {
              return
            }

            appointment =
              appointmentsRef.current.find(
                item =>
                  String(item.id) ===
                  String(
                    conversation.appointment_id
                  )
              )
          }

          // =================================================
          // MESSAGE DOES NOT BELONG TO THIS CUSTOMER'S
          // APPOINTMENTS
          // =================================================

          if (!appointment) {

            console.log(
              'ℹ️ Realtime message does not belong to a visible customer appointment.'
            )

            return
          }

          // =================================================
          // CHECK IF THIS CONVERSATION IS CURRENTLY OPEN
          // =================================================

          const openConversation =
            activeConversationRef.current

          const isOpen =
            String(
              openConversation?.conversationId
            ) ===
            String(
              newMessage.conversation_id
            )

          // =================================================
          // IF OPEN:
          // MARK AS READ
          // =================================================

          if (isOpen) {

            console.log(
              '💬 Conversation is open. Marking incoming message as read.'
            )

            const readAt =
              new Date().toISOString()

            const {
              data: updatedRows,
              error: updateError,
            } = await supabase
              .from(
                'conversation_participants'
              )
              .update({
                last_read_at:
                  readAt,
              })
              .eq(
                'conversation_id',
                newMessage.conversation_id
              )
              .eq(
                'user_id',
                user.id
              )
              .select(`
                conversation_id,
                user_id,
                last_read_at
              `)

            if (updateError) {

              console.error(
                'Realtime open conversation read error:',
                updateError
              )

              return
            }

            // =============================================
            // CREATE PARTICIPANT ROW IF NEEDED
            // =============================================

            if (!updatedRows?.length) {

              const {
                error: insertError,
              } = await supabase
                .from(
                  'conversation_participants'
                )
                .insert({
                  conversation_id:
                    newMessage.conversation_id,

                  user_id:
                    user.id,

                  last_read_at:
                    readAt,
                })

              if (insertError) {

                console.error(
                  'Realtime open conversation participant insert error:',
                  insertError
                )

                return
              }
            }

            // =============================================
            // REMOVE BADGE
            // =============================================

            setUnreadMessageCounts(
              previous => {

                const updated = {
                  ...previous,
                }

                delete updated[
                  appointment.id
                ]

                return updated
              }
            )

            return
          }

          // =================================================
          // NOT OPEN:
          // INCREASE UNREAD COUNT IMMEDIATELY
          // =================================================

          setUnreadMessageCounts(
            previous => {

              const previousCount =
                Number(
                  previous[
                    appointment.id
                  ] || 0
                )

              const nextCount =
                previousCount + 1

              console.log(
                '🔔 CUSTOMER APPOINTMENT UNREAD COUNT UPDATED:',
                {
                  appointmentId:
                    appointment.id,

                  previous:
                    previousCount,

                  next:
                    nextCount,
                }
              )

              return {
                ...previous,

                [appointment.id]:
                  nextCount,
              }
            }
          )

        }
      )
      .subscribe(
        status => {

          console.log(
            '📡 CUSTOMER APPOINTMENTS MESSAGE REALTIME STATUS:',
            status
          )

          if (
            status ===
            'SUBSCRIBED'
          ) {

            console.log(
              '✅ CUSTOMER APPOINTMENTS MESSAGE REALTIME CONNECTED'
            )
          }

          if (
            status ===
            'CHANNEL_ERROR'
          ) {

            console.error(
              '❌ CUSTOMER APPOINTMENTS MESSAGE REALTIME CHANNEL ERROR'
            )
          }

          if (
            status ===
            'TIMED_OUT'
          ) {

            console.error(
              '❌ CUSTOMER APPOINTMENTS MESSAGE REALTIME TIMED OUT'
            )
          }
        }
      )

  return () => {

    mounted = false

    console.log(
      '🧹 Removing CUSTOMER APPOINTMENTS MESSAGE REALTIME channel'
    )

    supabase.removeChannel(
      channel
    )
  }

}, [
  currentUser,
])


  // =========================================================
  // WARRANTY TIME REMAINING
  // =========================================================

  function getWarrantyTimeRemaining(
    warrantyEndsAt
  ) {

    if (!warrantyEndsAt) {
      return null
    }


    const end =
      new Date(
        warrantyEndsAt
      ).getTime()


    const now =
      Date.now()


    const difference =
      end - now


    if (difference <= 0) {
      return null
    }


    const totalMinutes =
      Math.floor(
        difference /
        (1000 * 60)
      )


    const days =
      Math.floor(
        totalMinutes /
        (60 * 24)
      )


    const hours =
      Math.floor(
        (
          totalMinutes %
          (60 * 24)
        ) /
        60
      )


    const minutes =
      totalMinutes % 60


    if (days > 0) {
      return `${days}d ${hours}h remaining`
    }


    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    }


    return `${minutes}m remaining`
  }


  // =========================================================
  // COUNTS
  // =========================================================

const totalCount =
  visibleAppointments.length

const completedCount =
  visibleAppointments.filter(
    apt =>
      apt.status?.toLowerCase() ===
      'completed'
  ).length

const cancelledCount =
  visibleAppointments.filter(
    apt => {

      const status =
        apt.status?.toLowerCase()

      const isRejected =
        status === 'cancelled' &&
        Boolean(
          apt.rejection_reason?.trim()
        )

      return (
        status === 'cancelled' &&
        !isRejected
      )
    }
  ).length

const rejectedCount =
  visibleAppointments.filter(
    apt => {

      const status =
        apt.status?.toLowerCase()

      return (
        status === 'cancelled' &&
        Boolean(
          apt.rejection_reason?.trim()
        )
      )
    }
  ).length

const activeCount =
  visibleAppointments.filter(
    apt => {

      const status =
        apt.status?.toLowerCase()

      return (
        status === 'pending' ||
        status === 'confirmed' ||
        status === 'in_progress'
      )
    }
  ).length



















    // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="relative min-h-screen overflow-hidden bg-[#f4f5f7] text-slate-900">

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255,255,255,0.94)',
            color: '#1f2937',
            border: '1px solid rgba(148,163,184,0.22)',
            boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
          },
        }}
      />


      {/* =====================================================
          PREMIUM WAVY BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Soft white base */}

        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f6f7f9] to-[#eef0f3]" />


        {/* RED WAVE — TOP LEFT */}

        <div
          className="absolute -left-[18%] -top-[15%] h-[520px] w-[920px] rotate-[-12deg] rounded-[45%] bg-gradient-to-r from-red-500/20 via-red-400/10 to-transparent blur-[2px]"
          style={{
            clipPath:
              'ellipse(58% 42% at 45% 50%)',
          }}
        />


        {/* RED WAVE — TOP */}

        <div
          className="absolute left-[25%] top-[-12%] h-[260px] w-[900px] rotate-[5deg] bg-gradient-to-r from-transparent via-red-500/[0.08] to-transparent blur-[10px]"
          style={{
            borderRadius: '50%',
          }}
        />


        {/* GRAY WAVE — RIGHT */}

        <div
          className="absolute -right-[20%] top-[12%] h-[520px] w-[900px] rotate-[18deg] bg-gradient-to-l from-slate-400/[0.16] via-slate-300/[0.08] to-transparent blur-[5px]"
          style={{
            borderRadius: '48% 52% 45% 55%',
          }}
        />


        {/* RED WAVE — LOWER RIGHT */}

        <div
          className="absolute -bottom-[18%] -right-[12%] h-[600px] w-[850px] rotate-[-15deg] bg-gradient-to-tl from-red-500/[0.14] via-red-300/[0.06] to-transparent blur-[6px]"
          style={{
            borderRadius: '55% 45% 50% 50%',
          }}
        />


        {/* GRAY WAVE — LOWER LEFT */}

        <div
          className="absolute -bottom-[20%] -left-[15%] h-[500px] w-[850px] rotate-[12deg] bg-gradient-to-tr from-slate-400/[0.12] via-slate-200/[0.06] to-transparent blur-[4px]"
          style={{
            borderRadius: '45% 55% 48% 52%',
          }}
        />


        {/* THIN FLOWING WAVE */}

        <div
          className="absolute left-[-10%] top-[42%] h-[180px] w-[120%] rotate-[-4deg] border-y border-red-500/[0.07] bg-gradient-to-r from-transparent via-red-500/[0.035] to-transparent"
          style={{
            borderRadius: '50%',
          }}
        />


        {/* SUBTLE GRID */}

        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15,23,42,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />


        {/* VIGNETTE */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(15,23,42,0.035)_100%)]" />

      </div>


      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="relative mb-5 overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:mb-7">

          {/* Decorative wave */}

          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-[520px] rotate-[-12deg] bg-gradient-to-l from-red-500/[0.13] via-red-400/[0.06] to-transparent"
            style={{
              borderRadius: '50%',
            }}
          />

          <div
            className="pointer-events-none absolute -bottom-20 left-[30%] h-36 w-[520px] rotate-[3deg] bg-gradient-to-r from-transparent via-slate-400/[0.08] to-transparent"
            style={{
              borderRadius: '50%',
            }}
          />


          <div className="relative p-5 sm:p-7">

            <div className="relative flex items-center justify-between gap-4">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_12px_30px_rgba(220,38,38,0.25)] sm:h-14 sm:w-14">

                  <Icon
                    name="wrench"
                    size={24}
                    strokeWidth={1.7}
                  />

                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      My Appointments
                    </h2>

                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-red-600 sm:px-2.5 sm:text-[9px]">
                      Service Portal
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-500 sm:mt-1.5 sm:text-sm">
                    View, track, and manage your vehicle service appointments.
                  </p>

                </div>

              </div>


             <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">

  <button
    type="button"
    onClick={() =>
      navigate('/customer')
    }
    className="group inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-red-200 hover:bg-white hover:text-red-500 hover:shadow-[0_0_16px_rgba(239,68,68,0.10)] active:scale-[0.98] active:border-red-300 active:text-red-500 active:shadow-[0_0_18px_rgba(239,68,68,0.14)]"
  >
    <Icon
      name="arrowLeft"
      size={16}
      strokeWidth={2}
      className="transition-colors duration-200 group-hover:text-red-500"
    />

    <span className="hidden sm:inline">
      Back to Dashboard
    </span>

    <span className="sm:hidden">
      Back
    </span>
  </button>

  <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/75 text-slate-400 shadow-sm sm:flex">
    <Icon
      name="calendar"
      size={22}
    />
  </div>

</div>


            </div>




          </div>

        </div>
{/* ===================================================
    MY APPOINTMENTS — PREMIUM SUMMARY CARDS
    MOBILE  = HORIZONTAL CAROUSEL
    DESKTOP = STATIC 4-COLUMN GRID
    LOGIC   = UNCHANGED
=================================================== */}

<section className="mb-6 sm:mb-8">

  {/* =================================================
      MOBILE — HORIZONTAL CAROUSEL
  ================================================= */}

  <div className="sm:hidden">

    <div
      ref={appointmentSummaryScrollRef}
      onScroll={(e) => {
        const container = e.currentTarget

        const cardWidth =
          container.clientWidth * 0.86 + 12

        const index = Math.round(
          container.scrollLeft / cardWidth
        )

        setActiveAppointmentSummary(
          Math.max(0, Math.min(3, index))
        )
      }}
      className="
        flex
        snap-x
        snap-mandatory
        gap-3
        overflow-x-auto
        overscroll-x-contain
        px-1
        pb-3
        pt-1
        scrollbar-none
      "
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >

      {/* =================================================
          TOTAL
      ================================================= */}

      <button
        type="button"
        onClick={() => {
          setAppointmentFilter('all')
          setActiveAppointmentSummary(0)
        }}
        className={`
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          p-4
          text-left
          transition-all
          duration-300
          active:scale-[0.985]

          ${
            appointmentFilter === 'all'
              ? `
                border-red-500/30
                bg-gradient-to-br
                from-red-500
                to-red-700
                shadow-[0_18px_40px_rgba(220,38,38,0.22)]
              `
              : `
                border-red-100
                bg-white
                shadow-[0_10px_35px_rgba(220,38,38,0.10)]
                ring-1
                ring-black/[0.02]
              `
          }
        `}
      >

        <div
          className={`
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            transition-transform
            duration-500
            group-hover:scale-125

            ${
              appointmentFilter === 'all'
                ? 'bg-white/15'
                : 'bg-gradient-to-br from-red-100 via-rose-50 to-transparent'
            }
          `}
        />

        <div
          className={`
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full

            ${
              appointmentFilter === 'all'
                ? 'bg-white/50'
                : 'bg-gradient-to-r from-red-500 to-rose-700'
            }
          `}
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span
                className={`
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full

                  ${
                    appointmentFilter === 'all'
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                  }
                `}
              />

              <p
                className={`
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]

                  ${
                    appointmentFilter === 'all'
                      ? 'text-red-100'
                      : 'text-red-500'
                  }
                `}
              >
                Total
              </p>

            </div>

            <h3
              className={`
                text-[34px]
                font-black
                leading-none
                tracking-[-0.04em]

                ${
                  appointmentFilter === 'all'
                    ? 'text-white'
                    : 'text-slate-950'
                }
              `}
            >
              {totalCount}
            </h3>

            <p
              className={`
                mt-2
                text-[11px]
                font-semibold
                leading-4

                ${
                  appointmentFilter === 'all'
                    ? 'text-red-100/75'
                    : 'text-slate-400'
                }
              `}
            >
              All appointments
            </p>

          </div>

          <div
            className={`
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              transition-transform
              duration-300
              group-hover:scale-110

              ${
                appointmentFilter === 'all'
                  ? 'bg-white/15 text-white ring-1 ring-white/20'
                  : 'bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_8px_20px_rgba(220,38,38,0.30)] ring-1 ring-red-400/30'
              }
            `}
          >

            <Icon
              name="calendar"
              size={20}
            />

          </div>

        </div>

      </button>


      {/* =================================================
          COMPLETED
      ================================================= */}

      <button
        type="button"
        onClick={() => {
          setAppointmentFilter('completed')
          setActiveAppointmentSummary(1)
        }}
        className={`
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-emerald-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(16,185,129,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]

          ${
            appointmentFilter === 'completed'
              ? 'border-emerald-300 bg-emerald-50 shadow-[0_18px_40px_rgba(16,185,129,0.15)]'
              : ''
          }
        `}
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-emerald-100
            via-green-50
            to-transparent
            opacity-90
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-emerald-500
            to-green-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-600">
                Completed
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-emerald-600">
              {completedCount}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Finished services
            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-emerald-500
              to-green-700
              text-white
              shadow-[0_8px_20px_rgba(16,185,129,0.30)]
              ring-1
              ring-emerald-400/30
              transition-transform
              duration-300
              group-hover:scale-110
            "
          >

            <Icon
              name="check"
              size={20}
              strokeWidth={2.5}
            />

          </div>

        </div>

      </button>


      {/* =================================================
          CANCELLED
      ================================================= */}

      <button
        type="button"
        onClick={() => {
          setAppointmentFilter('cancelled')
          setActiveAppointmentSummary(2)
        }}
        className={`
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-orange-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(249,115,22,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]

          ${
            appointmentFilter === 'cancelled'
              ? 'border-orange-300 bg-orange-50 shadow-[0_18px_40px_rgba(249,115,22,0.15)]'
              : ''
          }
        `}
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-orange-100
            via-amber-50
            to-transparent
            opacity-90
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-orange-400
            to-orange-600
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
                Cancelled
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-orange-600">
              {cancelledCount}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Cancelled appointments
            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-orange-400
              to-orange-600
              text-white
              shadow-[0_8px_20px_rgba(249,115,22,0.30)]
              ring-1
              ring-orange-400/30
              transition-transform
              duration-300
              group-hover:scale-110
            "
          >

           <TriangleAlert
  className="h-5 w-5"
  strokeWidth={2.2}
/>

          </div>

        </div>

      </button>


      {/* =================================================
          REJECTED
      ================================================= */}

      <button
        type="button"
        onClick={() => {
          setAppointmentFilter('rejected')
          setActiveAppointmentSummary(3)
        }}
        className={`
          group
          relative
          w-[86vw]
          min-w-[86vw]
          shrink-0
          snap-center
          overflow-hidden
          rounded-[22px]
          border
          border-red-100
          bg-white
          p-4
          text-left
          shadow-[0_10px_35px_rgba(220,38,38,0.10)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          active:scale-[0.985]

          ${
            appointmentFilter === 'rejected'
              ? 'border-red-300 bg-red-50 shadow-[0_18px_40px_rgba(220,38,38,0.15)]'
              : ''
          }
        `}
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-8
            -top-8
            h-32
            w-32
            rounded-full
            bg-gradient-to-br
            from-red-100
            via-rose-50
            to-transparent
            opacity-90
            transition-transform
            duration-500
            group-hover:scale-125
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-1
            w-24
            rounded-r-full
            bg-gradient-to-r
            from-red-500
            to-rose-700
          "
        />

        <div className="relative flex items-center justify-between gap-4">

          <div className="min-w-0 flex-1">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />

              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-red-500">
                Rejected
              </p>

            </div>

            <h3 className="text-[34px] font-black leading-none tracking-[-0.04em] text-red-600">
              {rejectedCount}
            </h3>

            <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-400">
              Rejected appointments
            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-red-500
              to-rose-700
              text-white
              shadow-[0_8px_20px_rgba(220,38,38,0.30)]
              ring-1
              ring-red-400/30
              transition-transform
              duration-300
              group-hover:scale-110
            "
          >

            <Icon
              name="x"
              size={20}
            />

          </div>

        </div>

      </button>

    </div>


    {/* =================================================
        MOBILE PAGINATION
    ================================================= */}

    <div className="mt-3 flex flex-col items-center">

      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          border
          border-slate-200
          bg-white
          px-3
          py-2
          shadow-[0_4px_15px_rgba(15,23,42,0.07)]
        "
      >

        {[0, 1, 2, 3].map((index) => (

          <button
            key={index}
            type="button"
            aria-label={`Go to appointment filter ${index + 1}`}
            onClick={() => {

              const container =
                appointmentSummaryScrollRef.current

              if (!container) return

              const cardWidth =
                container.clientWidth * 0.86 + 12

              container.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth',
              })

              setActiveAppointmentSummary(index)

            }}
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              transition-all
              duration-300
              active:scale-90
            "
          >

            <span
              className={`
                block
                rounded-full
                transition-all
                duration-300
                ease-out

                ${
                  activeAppointmentSummary === index
                    ? `
                      h-1.5
                      w-6
                      bg-slate-900
                      shadow-[0_0_8px_rgba(15,23,42,0.25)]
                    `
                    : `
                      h-1.5
                      w-1.5
                      bg-slate-300
                    `
                }
              `}
            />

          </button>

        ))}

      </div>

      <p
        className="
          mt-2
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-slate-400
        "
      >
        Swipe to explore
      </p>

    </div>

  </div>


  {/* =================================================
      TABLET / DESKTOP — STATIC 4 CARDS
  ================================================= */}

  <div
    className="
      hidden
      sm:grid
      sm:grid-cols-2
      lg:grid-cols-4
      gap-4
      lg:gap-5
    "
  >

    {/* TOTAL */}

    <button
      type="button"
      onClick={() => setAppointmentFilter('all')}
      className={`
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        p-5
        text-left
        transition-all
        duration-300
        sm:p-6

        ${
          appointmentFilter === 'all'
            ? `
              border-red-500/30
              bg-gradient-to-br
              from-red-500
              to-red-700
              shadow-[0_18px_40px_rgba(220,38,38,0.20)]
            `
            : `
              border-red-100
              bg-white
              shadow-[0_10px_35px_rgba(220,38,38,0.08)]
              ring-1
              ring-black/[0.02]
              hover:-translate-y-1
              hover:shadow-[0_18px_45px_rgba(220,38,38,0.15)]
            `
        }
      `}
    >

      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full

          ${
            appointmentFilter === 'all'
              ? 'bg-white/15'
              : 'bg-gradient-to-br from-red-100 via-rose-50 to-transparent'
          }
        `}
      />

      <div
        className={`
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full

          ${
            appointmentFilter === 'all'
              ? 'bg-white/50'
              : 'bg-gradient-to-r from-red-500 to-rose-700'
          }
        `}
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p
            className={`
              text-[11px]
              font-black
              uppercase
              tracking-[0.15em]

              ${
                appointmentFilter === 'all'
                  ? 'text-red-100/80'
                  : 'text-red-500'
              }
            `}
          >
            Total
          </p>

          <h3
            className={`
              mt-2
              text-4xl
              font-black
              tracking-[-0.045em]

              ${
                appointmentFilter === 'all'
                  ? 'text-white'
                  : 'text-slate-950'
              }
            `}
          >
            {totalCount}
          </h3>

          <p
            className={`
              mt-2
              text-xs
              font-semibold
              leading-5

              ${
                appointmentFilter === 'all'
                  ? 'text-red-100/70'
                  : 'text-slate-400'
              }
            `}
          >
            All appointments
          </p>

        </div>

        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl

            ${
              appointmentFilter === 'all'
                ? 'bg-white/15 text-white'
                : 'bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_8px_20px_rgba(220,38,38,0.28)]'
            }
          `}
        >

          <Icon
            name="calendar"
            size={22}
          />

        </div>

      </div>

    </button>


    {/* COMPLETED */}

    <button
      type="button"
      onClick={() => setAppointmentFilter('completed')}
      className={`
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-emerald-100
        bg-white
        p-5
        text-left
        shadow-[0_10px_35px_rgba(16,185,129,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(16,185,129,0.15)]
        sm:p-6

        ${
          appointmentFilter === 'completed'
            ? 'border-emerald-300 bg-emerald-50'
            : ''
        }
      `}
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-emerald-100
          via-green-50
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-emerald-500
          to-green-700
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-600">
            Completed
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-emerald-600">
            {completedCount}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Finished services
          </p>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-emerald-500
            to-green-700
            text-white
            shadow-[0_8px_20px_rgba(16,185,129,0.28)]
          "
        >

          <Icon
            name="check"
            size={22}
            strokeWidth={2.5}
          />

        </div>

      </div>

    </button>


    {/* CANCELLED */}

    <button
      type="button"
      onClick={() => setAppointmentFilter('cancelled')}
      className={`
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-orange-100
        bg-white
        p-5
        text-left
        shadow-[0_10px_35px_rgba(249,115,22,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(249,115,22,0.15)]
        sm:p-6

        ${
          appointmentFilter === 'cancelled'
            ? 'border-orange-300 bg-orange-50'
            : ''
        }
      `}
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-orange-100
          via-amber-50
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-orange-400
          to-orange-600
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-orange-600">
            Cancelled
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-orange-600">
            {cancelledCount}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Cancelled appointments
          </p>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-orange-400
            to-orange-600
            text-white
            shadow-[0_8px_20px_rgba(249,115,22,0.28)]
          "
        >

          <TriangleAlert
  className="h-[22px] w-[22px]"
  strokeWidth={2.2}
/>

        </div>

      </div>

    </button>


    {/* REJECTED */}

    <button
      type="button"
      onClick={() => setAppointmentFilter('rejected')}
      className={`
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-red-100
        bg-white
        p-5
        text-left
        shadow-[0_10px_35px_rgba(220,38,38,0.08)]
        ring-1
        ring-black/[0.02]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(220,38,38,0.15)]
        sm:p-6

        ${
          appointmentFilter === 'rejected'
            ? 'border-red-300 bg-red-50'
            : ''
        }
      `}
    >

      <div
        className="
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-32
          w-32
          rounded-full
          bg-gradient-to-br
          from-red-100
          via-rose-50
          to-transparent
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-0
          h-1
          w-20
          rounded-r-full
          bg-gradient-to-r
          from-red-500
          to-rose-700
        "
      />

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-red-500">
            Rejected
          </p>

          <h3 className="mt-2 text-4xl font-black tracking-[-0.045em] text-red-600">
            {rejectedCount}
          </h3>

          <p className="mt-2 text-xs font-semibold leading-5 text-slate-400">
            Rejected appointments
          </p>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-red-500
            to-rose-700
            text-white
            shadow-[0_8px_20px_rgba(220,38,38,0.28)]
          "
        >

          <Icon
            name="x"
            size={22}
          />

        </div>

      </div>

    </button>

  </div>

</section>








        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="mb-5 sm:mb-6">

          <div className="group relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-red-500">

              <Icon
                name="search"
                size={18}
              />

            </span>

            <input
  type="text"
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  placeholder="Search appointment no., plate, vehicle, service..."
  className="w-full rounded-2xl border border-white/90 bg-white/65 py-3.5 pl-11 pr-11 text-sm text-slate-800 shadow-[0_15px_40px_rgba(15,23,42,0.07)] outline-none backdrop-blur-2xl transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white/85 focus:ring-4 focus:ring-red-500/5 sm:py-4"
/>


            {searchTerm && (

              <button
                type="button"
                onClick={() =>
                  setSearchTerm('')
                }
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <Icon
                  name="x"
                  size={15}
                />
              </button>

            )}

          </div>


          {searchTerm.trim() && (

            <div className="mt-2 flex items-center gap-2 px-1">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              <p className="text-[10px] text-slate-400">

                {filteredAppointments.length}{' '}
                {filteredAppointments.length === 1
                  ? 'appointment'
                  : 'appointments'}{' '}
                matching "{searchTerm}"

              </p>

            </div>

          )}

        </div>


        {/* ===================================================
            ACTIVE FILTER INDICATOR
        =================================================== */}

        {appointmentFilter !== 'all' && (

          <div className="mb-4 flex items-center justify-between rounded-xl border border-white/80 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Filter:{' '}
                {appointmentFilter === 'completed'
                  ? 'Completed'
                  : 'Cancelled'}
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                setAppointmentFilter('all')
              }
              className="text-[10px] font-black text-red-500 transition hover:text-red-600"
            >
              Clear
            </button>

          </div>

        )}


        {/* ===================================================
            APPOINTMENTS
        =================================================== */}

        <div className="space-y-4">


          {/* NO APPOINTMENTS */}

          {appointments.length === 0 ? (

            <div className="overflow-hidden rounded-[28px] border border-white/90 bg-white/70 p-8 text-center shadow-[0_25px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl sm:p-12">

              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-100 bg-red-50 text-red-500">

                <Icon
                  name="calendar"
                  size={34}
                  strokeWidth={1.4}
                />

              </div>

              <h3 className="text-xl font-black text-slate-900">
                No appointments yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                Book your first appointment and we'll help take care of your vehicle.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/customer/booking'
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-5 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(220,38,38,0.20)] transition hover:-translate-y-0.5 hover:from-red-400 hover:to-red-600"
              >
                <Icon
                  name="plus"
                  size={17}
                />
                Book Appointment
              </button>

            </div>

          ) : filteredAppointments.length === 0 ? (

            <div className="rounded-[28px] border border-white/90 bg-white/70 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-12">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">

                <Icon
                  name="search"
                  size={27}
                />

              </div>

              <h3 className="text-lg font-black text-slate-900">
                No appointments found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try another search or view all appointments.
              </p>

              <button
                type="button"
                onClick={() => {
                  setAppointmentFilter('all')
                  setSearchTerm('')
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition hover:bg-red-100"
              >
                View All Appointments
                <Icon
                  name="arrow"
                  size={15}
                />
              </button>

            </div>

          ) : (

            filteredAppointments.map(
              (apt) => {

                const safeAppointmentId = Number(apt.id)

const appointmentNumber = Number.isFinite(safeAppointmentId)
  ? `APPT-${String(safeAppointmentId).padStart(6, '0')}`
  : 'APPT-UNKNOWN'


                

                const status =
                  apt.status?.toLowerCase()


                const statusTheme =
                  getStatusTheme(status)

                  const isRejected =
  status === 'cancelled' &&
  Boolean(apt.rejected_at)

const isCancelled =
  status === 'cancelled' &&
  !isRejected

const displayStatusLabel =
  isRejected
    ? 'Rejected'
    : isCancelled
      ? 'Cancelled'
      : statusTheme.label


const notesText = String(apt.notes || '').toLowerCase()

const arrangement =
  apt.service_arrangement ||
  (notesText.includes('home / on-site')
    ? 'home'
    : notesText.includes('bring my vehicle to the shop')
    ? 'shop'
    : null)

const arrangementBadge =
  arrangement === 'home'
    ? {
        label: 'Home Service',
        Icon: Home,
        className: 'border-teal-200 bg-teal-50 text-teal-700',
      }
    : arrangement === 'shop'
    ? {
        label: 'Shop Service',
        Icon: Store,
        className: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      }
    : null
                const conversationId =
                  customerConversationMap?.[
                    apt.id
                  ]


                const appointmentWarrantyEndsAt =
                  warrantyEndsAt?.[
                    apt.id
                  ]


                const warrantyActive =
                  appointmentWarrantyEndsAt
                    ? new Date(
                        appointmentWarrantyEndsAt
                      ) > new Date()
                    : false


                const conversationAvailable =
                  Boolean(
                    conversationId
                  )


                const messagingAllowed =
                  status === 'confirmed' ||
                  status === 'in_progress' ||
                  (
                    status === 'completed' &&
                    warrantyActive
                  )


                const warrantyExpired =
                  status === 'completed' &&
                  appointmentWarrantyEndsAt &&
                  new Date(
                    appointmentWarrantyEndsAt
                  ) <= new Date()


                const warrantyTimeRemaining =
                  getWarrantyTimeRemaining(
                    appointmentWarrantyEndsAt
                  )


                const unreadCount =
                  unreadMessageCounts?.[
                    apt.id
                  ] || 0


                const isActiveConversation =
                  showMessaging &&
                  activeConversation &&
                  activeConversation.appointment.id ===
                    apt.id


                return (

                  <div
                    key={apt.id}
                    id={`appointment-${apt.id}`}
className={`group relative overflow-hidden rounded-[28px] bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.09)] backdrop-blur-2xl transition-all duration-500 ${
  selectedAppointmentId === apt.id
    ? 'border border-red-400 ring-4 ring-red-500/20 shadow-[0_0_0_4px_rgba(239,68,68,0.08),0_28px_80px_rgba(220,38,38,0.16)]'
    : 'border border-white/90'
} hover:border-white hover:bg-white/80 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)]`}
                  >

                    {/* STATUS ACCENT */}

                    <div
  className={`absolute left-0 top-0 h-full w-1 ${
    isRejected
      ? 'bg-red-500'
      : isCancelled
      ? 'bg-orange-500'
      : status === 'completed'
      ? 'bg-sky-500'
      : status === 'confirmed'
      ? 'bg-emerald-500'
      : status === 'in_progress'
      ? 'bg-violet-500'
      : 'bg-amber-500'
  }`}
/>





                    {/* PREMIUM AMBIENT WAVE */}

                    <div
                      className="pointer-events-none absolute -right-28 -top-24 h-64 w-[440px] rotate-[-12deg] bg-gradient-to-l from-red-500/[0.07] via-red-300/[0.025] to-transparent blur-[3px]"
                      style={{
                        borderRadius: '50%',
                      }}
                    />


                    <div className="relative p-4 sm:p-6 lg:p-7">


                      {/* =================================================
                          TOP APPOINTMENT INFO
                      ================================================= */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-red-100/70 text-red-500 shadow-inner sm:h-14 sm:w-14">

                            <Icon
                              name="wrench"
                              size={23}
                            />

                          </div>


                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <div className="flex flex-wrap items-center gap-2">

  <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
    {apt.service_type}
  </h3>

  {arrangementBadge && (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wide ${arrangementBadge.className}`}
    >
      <arrangementBadge.Icon className="h-3 w-3" />
      {arrangementBadge.label}
    </span>
  )}

</div>

                              


                            </div>

                            

                           <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
  Appointment No. {appointmentNumber}
</p>

                           {/* DATE + TIME */}

<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">

  <span className="inline-flex items-center gap-1.5 text-sm">
    <Icon name="calendar" size={15} className="text-red-500" />
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
      Date
    </span>
    <span className="font-semibold text-slate-800">
      {formatLongDate(apt.appointment_date)}
    </span>
  </span>

  <span className="inline-flex items-center gap-1.5 text-sm">
    <Icon name="clock" size={15} className="text-red-500" />
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
      Time
    </span>
    <span className="font-semibold text-slate-800">
      {formatTime12(apt.appointment_time)}
    </span>
  </span>

</div>

{/* VEHICLE DETAILS WITH LABELS */}

<div className="mt-3 flex flex-wrap gap-2">

  {apt.vehicle_model && (
    <div className="inline-flex max-w-full items-baseline gap-2.5 rounded-lg border border-slate-200 bg-white/80 px-3.5 py-2 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Vehicle Type
      </span>
      <span className="truncate text-sm font-bold leading-none text-slate-800">
        {apt.vehicle_model}
      </span>
    </div>
  )}

  {[
    ['Plate No.', apt.plate_number],
    ['Fuel Type', apt.fuel_type],
    ['Battery', apt.battery_voltage],
    ['Transmission', apt.transmission_type],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => (

      <div
        key={label}
        className="inline-flex items-baseline gap-2.5 rounded-lg border border-slate-200 bg-white/80 px-3.5 py-2 shadow-sm"
      >

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>

        <span className="text-sm font-bold leading-none text-slate-800">
          {value}
        </span>

      </div>

    ))}

</div>

                            {apt.notes && (
  <div className="mt-3 w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/75 px-3.5 py-2.5">

    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
      Customer Note
    </p>

    <p
      className="mt-1 w-full break-words whitespace-normal text-sm font-medium leading-relaxed text-slate-700"
      style={{
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}
    >
      {apt.notes}
    </p>

  </div>
)}


                          </div>

                        </div>



                        {/* STATUS */}

<div className="flex flex-shrink-0 items-center gap-2 sm:self-start">

  <span
  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
    isRejected
      ? 'border-red-200 bg-red-50 text-red-600'
      : isCancelled
      ? 'border-orange-200 bg-orange-50 text-orange-600'
      : status === 'completed'
      ? 'border-sky-200 bg-sky-50 text-sky-600'
      : status === 'confirmed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
      : status === 'in_progress'
      ? 'border-violet-200 bg-violet-50 text-violet-600'
      : 'border-amber-200 bg-amber-50 text-amber-600'
  }`}
>
  <span
    className={`h-1.5 w-1.5 rounded-full ${
      isRejected
        ? 'bg-red-500'
        : isCancelled
        ? 'bg-orange-500'
        : status === 'completed'
        ? 'bg-sky-500'
        : status === 'confirmed'
        ? 'bg-emerald-500'
        : status === 'in_progress'
        ? 'bg-violet-500 animate-pulse'
        : 'bg-amber-500'
    }`}
  />

  {displayStatusLabel}
</span>

</div>


                      </div>





                      {/* =================================================
                          WARRANTY ACTIVE
                      ================================================= */}

                      {status === 'completed' &&
                        apt.completed_at &&
                        appointmentWarrantyEndsAt &&
                        warrantyActive && (

                        <div className="relative mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-green-50/50 p-4 shadow-sm sm:p-5">

                          <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-2xl" />

                          <div className="relative flex items-start gap-3">

                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-white/70 text-emerald-600">

                              <Icon
                                name="shield"
                                size={19}
                              />

                            </div>

                            <div className="min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <p className="text-sm font-black text-emerald-700">
                                  Warranty Active
                                </p>

                                {warrantyTimeRemaining && (
                                  <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 text-[9px] font-black text-emerald-600">
                                    {warrantyTimeRemaining}
                                  </span>
                                )}

                              </div>

                              <p className="mt-1 text-xs leading-relaxed text-emerald-700/65">
                                You can still communicate with the service team during your 3-day warranty period.
                              </p>

                              <div className="mt-3 grid grid-cols-1 gap-1 text-[10px] text-emerald-700/55 sm:grid-cols-2 sm:gap-x-4">

                                <span>
                                  Completed:{' '}
                                  {formatDateTime(
                                    apt.completed_at
                                  )}
                                </span>

                                <span>
                                  Ends:{' '}
                                  {formatDateTime(
                                    appointmentWarrantyEndsAt
                                  )}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                      )}


                      {/* =================================================
                          WARRANTY EXPIRED
                      ================================================= */}

                      {status === 'completed' &&
                        apt.completed_at &&
                        warrantyExpired && (

                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">

                          <div className="flex items-start gap-3">

                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">

                              <Icon
                                name="lock"
                                size={17}
                              />

                            </div>

                            <div>

                              <p className="text-sm font-black text-slate-500">
                                Warranty Period Ended
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                The 3-day communication period has ended.
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                Ended{' '}
                                {formatDateTime(
                                  appointmentWarrantyEndsAt
                                )}
                              </p>

                            </div>

                          </div>

                        </div>
                      )}








                      {/* =================================================
                          PROGRESS
                      ================================================= */}

                      <AppointmentProgress
                        appointment={apt}
                      />


                      {/* =================================================
    HISTORY
================================================= */}

<AppointmentProgressHistory
  history={
    progressHistory[
      apt.id
    ] || []
  }
  appointment={apt}
  attachments={
    attachments[
      apt.id
    ] || []
  }
/>


                      {/* =================================================
                          ACTION AREA
                      ================================================= */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-2">


                          {/* CONVERSATION */}

                          {conversationAvailable &&
                            messagingAllowed && (

                            <button
                              type="button"
                              onClick={async () => {

                                const nextConversation = {
                                  appointment:
                                    apt,

                                  conversationId:
                                    conversationId,

                                  warrantyEndsAt:
                                    appointmentWarrantyEndsAt,

                                  warrantyActive:
                                    warrantyActive,
                                }


                                activeConversationRef.current =
                                  nextConversation

                                setActiveConversation(
                                  nextConversation
                                )

                                setShowMessaging(
                                  true
                                )


                                await markConversationAsRead(
                                  conversationId,
                                  apt.id
                                )
                              }}
                              className={`group relative inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition-all duration-200 ${
                                isActiveConversation
                                  ? 'border-red-300 bg-red-50 text-red-600'
                                  : 'border-red-200 bg-red-50/70 text-red-600 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100'
                              }`}
                            >

                              <Icon
                                name="message"
                                size={15}
                              />

                              <span>
                                {isActiveConversation
                                  ? 'Conversation Open'
                                  : 'View Conversation'}
                              </span>


                              {unreadCount > 0 && (

                                <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[9px] font-black text-white">

                                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-30" />

                                  <span className="relative z-10">
                                    {unreadCount > 99
                                      ? '99+'
                                      : unreadCount}
                                  </span>

                                </span>

                              )}

                            </button>
                          )}


                          {/* NO CONVERSATION */}

                          {!conversationAvailable &&
                            messagingAllowed && (

                            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5">

                              <Icon
                                name="info"
                                size={14}
                                className="mt-0.5 flex-shrink-0 text-amber-600"
                              />

                              <div>

                                <p className="text-[10px] font-black text-amber-700">
                                  Messaging unavailable
                                </p>

                                <p className="mt-0.5 text-[9px] text-amber-600/65">
                                  Waiting for the service team conversation to be created.
                                </p>

                              </div>

                            </div>
                          )}


                          {/* EXPIRED */}

                          {status === 'completed' &&
                            warrantyExpired && (

                            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

                              <Icon
                                name="lock"
                                size={13}
                                className="text-slate-400"
                              />

                              <span className="text-[10px] font-semibold text-slate-400">
                                Messaging period ended
                              </span>

                            </div>
                          )}

                        </div>


                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() => {

                            const confirmed =
                              window.confirm(
                                'Remove this appointment from your dashboard? This will not delete the appointment or its history from the system.'
                              )

                            if (!confirmed) {
                              return
                            }

                            hideAppointmentFromUI(
                              apt.id
                            )
                          }}
                          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white/60 px-3 py-2.5 text-[10px] font-black text-slate-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        >

                          <Icon
                            name="trash"
                            size={13}
                          />

                          <span className="sm:hidden">
                            Remove
                          </span>

                          <span className="hidden sm:inline">
                            Remove from My Appointments
                          </span>

                        </button>

                      </div>


                      {/* =================================================
                          ACTIVE CONVERSATION
                      ================================================= */}

                      {isActiveConversation && (

                        <AppointmentMessaging
                          appointment={
                            activeConversation.appointment
                          }

                          conversationId={
                            activeConversation.conversationId
                          }

                          warrantyEndsAt={
                            activeConversation.warrantyEndsAt
                          }

                          warrantyActive={
                            activeConversation.warrantyActive
                          }

                          onClose={() => {

                            setShowMessaging(
                              false
                            )

                            activeConversationRef.current =
                              null

                            setActiveConversation(
                              null
                            )
                          }}
                        />
                      )}

                    </div>

                  </div>
                )
              }
            )
          )}

        </div>

      </div>

    </div>
  )
}


