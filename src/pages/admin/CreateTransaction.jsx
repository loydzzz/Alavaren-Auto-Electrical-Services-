import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useParams } from 'react-router-dom'
import { FaGlobe, FaStore } from 'react-icons/fa'
import {
  BatteryCharging,
  CalendarDays,
  Car,
  Check,
  Clock3,
  Cog,
  FileText,
  Fuel,
  HardHat,
  Hash,
  MapPin,
  Phone,
  Sparkles,
  User,
  UserRound,
  Wrench,
} from 'lucide-react'

/* =========================================================
   HELPERS
========================================================= */

const peso = (value) =>
  Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

function formatTimestamp(timestamp) {
  if (!timestamp) return 'Not available'

  return new Date(timestamp).toLocaleString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatTime(time) {
  if (!time) return 'N/A'

  return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getEligibilityStyle(value) {
  const v = (value || 'pending').toLowerCase()

  if (['eligible', 'approved', 'accepted', 'supported'].includes(v)) {
    return {
      label: 'Eligible',
      badge: 'border-green-200 bg-green-100 text-green-700',
      dot: 'bg-green-500',
    }
  }

  if (['not_eligible', 'ineligible', 'rejected', 'unsupported'].includes(v)) {
    return {
      label: 'Not Eligible',
      badge: 'border-red-200 bg-red-100 text-red-700',
      dot: 'bg-red-500',
    }
  }

  if (['needs_review', 'review', 'manual_review'].includes(v)) {
    return {
      label: 'Needs Review',
      badge: 'border-amber-200 bg-amber-100 text-amber-700',
      dot: 'bg-amber-500',
    }
  }

  return {
    label: 'Pending',
    badge: 'border-gray-200 bg-gray-100 text-gray-700',
    dot: 'bg-gray-500',
  }
}

// Works whether confidence is stored as 0-1 or 0-100
function formatConfidence(value) {
  if (value === null || value === undefined || value === '') return null

  const n = Number(value)
  if (Number.isNaN(n)) return null

  return Math.max(0, Math.min(100, n <= 1 ? n * 100 : n))
}

/* =========================================================
   SHARED INFO GROUP
========================================================= */

function InfoGroup({ title, icon: Icon, header, iconBox, items }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${header}`}>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBox}`}
        >
          <Icon className="h-4 w-4" />
        </span>

        <p className="text-[11px] font-extrabold uppercase tracking-wider">
          {title}
        </p>
      </div>

      <dl className="divide-y divide-gray-100">
        {items.map(({ label, value, icon: ItemIcon, valueClass }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 px-4 py-2.5"
          >
            <dt className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <ItemIcon className="h-3.5 w-3.5" />
              {label}
            </dt>

            <dd
              className={`min-w-0 break-words text-right text-sm font-semibold text-gray-800 ${
                valueClass || ''
              }`}
            >
              {value || 'N/A'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* =========================================================
   APPOINTMENT INFO GRID
   Customer | Vehicle | Service | Record
========================================================= */

function AppointmentInfoGrid({ appointment }) {
  const isOnline =
    String(appointment.booking_source || '').toLowerCase() === 'online'

  const appointmentNumber = appointment.id
    ? `APPT-${String(appointment.id).padStart(6, '0')}`
    : 'N/A'

  const sourceValue = appointment.booking_source ? (
    isOnline ? (
      <span className="inline-flex items-center gap-1.5 text-blue-700">
        <FaGlobe />
        Online
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-yellow-700">
        <FaStore />
        Walk-in
      </span>
    )
  ) : null

  const assistedValue = appointment.assisted_by_user?.name ? (
    <span>
      {appointment.assisted_by_user.name}
      {appointment.assisted_by_user.role && (
        <span className="block text-xs font-medium text-gray-400">
          {appointment.assisted_by_user.role}
        </span>
      )}
    </span>
  ) : null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <InfoGroup
        title="Customer"
        icon={User}
        header="border-gray-100 bg-gray-50 text-gray-700"
        iconBox="bg-gray-200 text-gray-600"
        items={[
          { label: 'Name', value: appointment.customer_name, icon: User },
          {
            label: 'Phone',
            value: appointment.mobile_number,
            icon: Phone,
            valueClass: 'break-all',
          },
          {
            label: 'Address',
            value: appointment.customer_address,
            icon: MapPin,
          },
        ]}
      />

      <InfoGroup
        title="Vehicle"
        icon={Car}
        header="border-blue-100 bg-blue-50 text-blue-700"
        iconBox="bg-blue-100 text-blue-600"
        items={[
          { label: 'Vehicle', value: appointment.vehicle_model, icon: Car },
          { label: 'Plate Number', value: appointment.plate_number, icon: Hash },
          { label: 'Vehicle Type', value: appointment.vehicle_type, icon: Car },
          { label: 'Fuel Type', value: appointment.fuel_type, icon: Fuel },
          {
            label: 'Battery Voltage',
            value: appointment.battery_voltage,
            icon: BatteryCharging,
          },
          {
            label: 'Transmission',
            value: appointment.transmission_type,
            icon: Cog,
          },
        ]}
      />

      <InfoGroup
        title="Service"
        icon={Wrench}
        header="border-indigo-100 bg-indigo-50 text-indigo-700"
        iconBox="bg-indigo-100 text-indigo-600"
        items={[
          { label: 'Service', value: appointment.service_type, icon: Wrench },
          {
            label: 'Date Request',
            value: appointment.appointment_date,
            icon: CalendarDays,
          },
          {
            label: 'Time Request',
            value: formatTime(appointment.appointment_time),
            icon: Clock3,
          },
          {
            label: 'Technician',
            value:
              appointment.technician_name ||
              appointment.assigned_technician ||
              'Not Assigned',
            icon: HardHat,
          },
          {
            label: 'Technician Role',
            value: appointment.technician_role,
            icon: Wrench,
          },
        ]}
      />

      <InfoGroup
        title="Record"
        icon={FileText}
        header="border-green-100 bg-green-50 text-green-700"
        iconBox="bg-green-100 text-green-600"
        items={[
          {
            label: 'Appointment No.',
            value: appointmentNumber,
            icon: Hash,
            valueClass: 'font-bold tracking-wide',
          },
          {
            label: 'Booking Source',
            value: sourceValue,
            icon: isOnline ? FaGlobe : FaStore,
          },
          {
            label: 'Assisted By',
            value: assistedValue,
            icon: UserRound,
          },
          {
            label: 'Completed At',
            value: formatTimestamp(appointment.completed_at),
            icon: Check,
          },
        ]}
      />
    </div>
  )
}

/* =========================================================
   AI VEHICLE DETECTION PANEL
========================================================= */

function AiDetectionPanel({ appointment }) {
  if (!appointment) return null

  const eligibility = getEligibilityStyle(appointment.vehicle_eligibility)
  const confidence = formatConfidence(appointment.vehicle_detection_confidence)

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI Vehicle Detection
        </p>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${eligibility.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${eligibility.dot}`} />
          {eligibility.label}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Detection Confidence
          </p>

          <p className="text-xs font-bold text-gray-700">
            {confidence !== null ? `${confidence.toFixed(0)}%` : 'N/A'}
          </p>
        </div>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${
              confidence === null
                ? 'bg-gray-300'
                : confidence >= 80
                ? 'bg-green-500'
                : confidence >= 50
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${confidence ?? 0}%` }}
          />
        </div>

        <p className="mt-3 break-words text-sm leading-6 text-gray-600">
          {appointment.vehicle_detection_message ||
            'No AI detection message available.'}
        </p>

        <p className="mt-2 text-[11px] text-gray-400">
          Detected: {formatTimestamp(appointment.vehicle_detected_at)}
        </p>
      </div>
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

export default function CreateTransaction() {
  const navigate = useNavigate()
  const { appointmentId } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const saveLock = useRef(false)
  const [appointment, setAppointment] = useState(null)

  const [existingTransaction, setExistingTransaction] = useState(null)
  const [serviceItems, setServiceItems] = useState([])

  const [serviceCharge, setServiceCharge] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [inventoryItems, setInventoryItems] = useState([])

  const [items, setItems] = useState([])
  const [currentUser, setCurrentUser] = useState(null)

  // GENERATE RECEIPT NUMBER
  const generateReceiptNumber = () => {
    const date = new Date()

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const random = Math.floor(1000 + Math.random() * 9000)

    return `REC-${year}${month}${day}-${random}`
  }

  // FETCH APPOINTMENT
  const fetchAppointment = async () => {
    if (!appointmentId) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // FETCH APPOINTMENT (select * already includes the vehicle AI,
      // fuel type, battery voltage and transmission columns)
      const { data: appointmentData, error: appointmentError } =
        await supabase
          .from('appointments')
          .select(
            `
            *,
            assisted_by_user:users!appointments_assisted_by_fkey (
              id,
              name,
              role
            )
          `
          )
          .eq('id', appointmentId)
          .single()

      if (appointmentError) {
        console.error('Appointment Error:', appointmentError)
        alert('Unable to load appointment.')
        setLoading(false)
        return
      }

      // CHECK EXISTING TRANSACTION
      const {
        data: existingTransactionData,
        error: existingTransactionError,
      } = await supabase
        .from('transactions')
        .select(
          `
          id,
          receipt_number,
          total_amount,
          payment_method,
          payment_status,
          transaction_date,
          technician_name,
          technician_role
        `
        )
        .eq('appointment_id', appointmentData.id)
        .maybeSingle()

      if (existingTransactionError) {
        console.error(
          'Existing Transaction Check Error:',
          existingTransactionError
        )
      } else if (existingTransactionData) {
        setExistingTransaction(existingTransactionData)
      } else {
        setExistingTransaction(null)
      }

      // FETCH ASSIGNED TECHNICIAN
      let technicianName = ''

      if (appointmentData.technician_id) {
        const { data: technicianData, error: technicianError } =
          await supabase
            .from('users')
            .select('id, name')
            .eq('id', appointmentData.technician_id)
            .single()

        if (technicianError) {
          console.error('Technician Error:', technicianError)
        } else {
          technicianName = technicianData?.name || ''
        }
      }

      // ADMIN-ASSIGNED ROLE comes from appointments.technician_role
      const technicianRole = appointmentData.technician_role || ''

      setAppointment({
        ...appointmentData,
        technician_name: technicianName,
        technician_role: technicianRole,
      })

      // FETCH SERVICE ITEMS
      const { data: serviceItemsData, error: serviceItemsError } =
        await supabase
          .from('service_task_items')
          .select(
            `
            id,
            appointment_id,
            inventory_id,
            item_name,
            quantity,
            unit_price,
            subtotal,
            performed_by,
            created_at
          `
          )
          .eq('appointment_id', appointmentData.id)
          .order('created_at', { ascending: true })

      if (serviceItemsError) {
        console.error('Service Items Error:', serviceItemsError)

        alert(`Unable to load service items: ${serviceItemsError.message}`)

        setServiceItems([])
      } else {
        setServiceItems(serviceItemsData || [])
      }
    } catch (error) {
      console.error('Fetch Appointment Error:', error)
      alert(`Unable to load appointment: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // FETCH CURRENT USER
  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('Current User Error:', error)
        return
      }

      if (!user) {
        console.warn('No authenticated user found.')
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('User Profile Error:', userError)
        return
      }

      setCurrentUser(userData)
    } catch (error) {
      console.error('Fetch Current User Error:', error)
    }
  }

  // FETCH INVENTORY ITEMS
  const fetchInventoryItems = async () => {
    const { data, error } = await supabase
      .from('inventory')
      .select(
        `
        id,
        name,
        category,
        quantity,
        price,
        low_stock_threshold
      `
      )
      .order('name', { ascending: true })

    if (error) {
      console.error('Inventory Items Error:', error)
      alert(`Unable to load inventory items: ${error.message}`)
      setInventoryItems([])
      return
    }

    setInventoryItems(data || [])
  }

  // FETCH SERVICE ITEMS -> PRE-FILL PARTS LIST
  const fetchServiceItems = async () => {
    if (!appointmentId) return

    const { data, error } = await supabase
      .from('service_task_items')
      .select(
        `
        id,
        appointment_id,
        inventory_id,
        item_name,
        quantity,
        unit_price,
        subtotal,
        performed_by,
        created_at
      `
      )
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Service Items Error:', error)
      alert('Unable to load service items.')
      return
    }

    setItems(
      (data || []).map((item) => ({
        service_task_item_id: item.id,
        inventory_id: item.inventory_id,
        item_name: item.item_name,
        quantity: Number(item.quantity) || 0,
        unit_price: Number(item.unit_price) || 0,
      }))
    )
  }

  useEffect(() => {
    fetchAppointment()
    fetchServiceItems()
    fetchInventoryItems()
    fetchCurrentUser()
  }, [appointmentId])

  // ADD PART
  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: '',
        inventory_id: null,
        quantity: 1,
        unit_price: 0,
        available_stock: 0,
      },
    ])
  }

  // REMOVE PART
  const removeItem = (index) => {
    if (items.length === 1) {
      setItems([
        {
          item_name: '',
          inventory_id: null,
          quantity: 1,
          unit_price: 0,
          available_stock: 0,
        },
      ])
      return
    }

    setItems(items.filter((_, itemIndex) => itemIndex !== index))
  }

  // UPDATE PART
  const updateItem = (index, field, value) => {
    const updatedItems = [...items]

    updatedItems[index][field] = value

    setItems(updatedItems)
  }

  // CALCULATIONS
  const getItemSubtotal = (item) => {
    const quantity = Number(item.quantity) || 0
    const unitPrice = Number(item.unit_price) || 0

    return quantity * unitPrice
  }

  const partsSubtotal = items.reduce(
    (total, item) => total + getItemSubtotal(item),
    0
  )

  const serviceItemsSubtotal = serviceItems.reduce(
    (total, item) => total + Number(item.subtotal || 0),
    0
  )

  const serviceAmount = Number(serviceCharge) || 0

  const totalAmount = serviceAmount + partsSubtotal

  // SAVE TRANSACTION
  const handleSaveTransaction = async () => {
    if (saveLock.current) return

    if (!appointment) {
      alert('Appointment information is missing.')
      return
    }

    if (serviceAmount <= 0 && partsSubtotal <= 0) {
      alert('Please enter a service charge or add a part.')
      return
    }

    // Lock only after validation so an early return can't leave it stuck
    saveLock.current = true
    setSaving(true)

    try {
      const receiptNumber = generateReceiptNumber()

      // CREATE TRANSACTION
      const { data: transactionData, error: transactionError } =
        await supabase
          .from('transactions')
          .insert([
            {
              receipt_number: receiptNumber,
              appointment_id: appointment.id,
              customer_id: appointment.customer_id || null,
              customer_name: appointment.customer_name || 'N/A',
              customer_phone: appointment.mobile_number || '',
              vehicle_model: appointment.vehicle_model || '',
              plate_number: appointment.plate_number || '',
              service_type: appointment.service_type || 'N/A',
              technician_id: appointment.technician_id || null,
              technician_role: appointment.technician_role || null,
              technician_name:
                appointment.technician_name ||
                appointment.assigned_technician ||
                'N/A',
              appointment_date: appointment.appointment_date || null,
              appointment_time: appointment.appointment_time || null,
              service_charge: serviceAmount,
              subtotal: partsSubtotal,
              total_amount: totalAmount,
              amount: totalAmount,
              payment_method: paymentMethod,
              payment_status: 'Paid',
              warranty_period_days: 7,
              warranty_start_date: appointment.completed_at
                ? appointment.completed_at.split('T')[0]
                : null,
              warranty_due_date: appointment.completed_at
                ? (() => {
                    const startDate = new Date(appointment.completed_at)

                    startDate.setDate(startDate.getDate() + 7)

                    return startDate.toISOString().split('T')[0]
                  })()
                : null,
            },
          ])
          .select()
          .single()

      if (transactionError) {
        throw transactionError
      }

      // FILTER VALID PARTS
      const validItems = items.filter((item) => item.item_name.trim() !== '')

      // SAVE TRANSACTION ITEMS
      if (validItems.length > 0) {
        const transactionItems = validItems.map((item) => ({
          transaction_id: transactionData.id,
          inventory_id: item.inventory_id || null,
          service_task_item_id: item.service_task_item_id || null,
          item_name: item.item_name,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0,
          subtotal: getItemSubtotal(item),
        }))

        const { error: itemsError } = await supabase
          .from('transaction_items')
          .insert(transactionItems)

        if (itemsError) {
          throw itemsError
        }

        // DEDUCT MANUALLY ADDED INVENTORY
        const { error: deductionError } = await supabase.rpc(
          'deduct_inventory_for_transaction',
          {
            p_transaction_id: transactionData.id,
            p_performed_by: currentUser?.id || null,
            p_performed_by_role: currentUser?.role || null,
          }
        )

        if (deductionError) {
          throw deductionError
        }
      }

      // FETCH COMPLETE TRANSACTION FOR AUTO PRINT
      const { data: printableTransaction, error: printableTransactionError } =
        await supabase
          .from('transactions')
          .select(
            `
            *,
            transaction_items (
              id,
              item_name,
              quantity,
              unit_price,
              subtotal
            ),
            appointments (
              appointment_date,
              appointment_time,
              completed_at,
              technician_id,
              technician_role,
              customer_address
            )
          `
          )
          .eq('id', transactionData.id)
          .single()

      if (printableTransactionError || !printableTransaction) {
        console.error(
          'Auto Print Transaction Fetch Error:',
          printableTransactionError
        )

        alert(
          'Transaction created successfully, but the receipt could not be prepared for printing.'
        )

        navigate('/admin/transactions')
        return
      }

      alert('Transaction created successfully!')

      // Wait for the print dialog to open, then navigate to transactions.
      setTimeout(() => {
        navigate('/admin/transactions')
      }, 700)
    } catch (error) {
      console.error('Transaction Save Error:', error)
      alert(`Failed to save transaction: ${error.message}`)
    } finally {
      setSaving(false)
      saveLock.current = false
    }
  }

  /* =========================================================
     EXISTING TRANSACTION
  ========================================================= */

  if (existingTransaction) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-4">
        <div className="w-full max-w-lg rounded-2xl border border-yellow-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">⚠️</div>

          <h2 className="text-2xl font-bold text-gray-900">
            Transaction Already Created
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            This appointment already has a transaction. Only one transaction is
            allowed per appointment.
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-500">Receipt Number</span>

              <span className="text-sm font-bold text-gray-900">
                {existingTransaction.receipt_number}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-sm text-gray-500">Total Amount</span>

              <span className="text-sm font-bold text-green-600">
                ₱{peso(existingTransaction.total_amount)}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-sm text-gray-500">Payment</span>

              <span className="text-sm font-semibold text-gray-900">
                {existingTransaction.payment_method || 'N/A'}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-sm text-gray-500">Technician</span>

              <span className="text-sm font-semibold text-gray-900">
                {existingTransaction.technician_name || 'N/A'}
              </span>
            </div>

            <div className="mt-3 flex justify-between gap-4">
              <span className="text-sm text-gray-500">Technician Role</span>

              <span className="text-sm font-semibold text-gray-900">
                {existingTransaction.technician_role || 'N/A'}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/transactions')}
            className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            View Transaction History
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb]">
        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
          <p className="font-semibold text-gray-700">Loading appointment...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-4xl">⚠️</div>

          <h2 className="text-xl font-bold text-gray-900">
            Appointment Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            We could not find the appointment for this transaction.
          </p>

          <button
            onClick={() => navigate('/admin')}
            className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-xl">
              🧾
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
                Create Transaction
              </h1>

              <p className="hidden text-sm text-gray-500 sm:block">
                Create a transaction for the completed service
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Cancel
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* PAGE TITLE */}
        <div className="mb-6">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Transaction
          </span>

          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Service Transaction
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Review appointment details and add service charges and parts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* LEFT SIDE */}
          <div className="space-y-6 xl:col-span-2">
            {/* APPOINTMENT INFORMATION */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Customer & Vehicle Information
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Automatically loaded from the appointment
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                  Completed
                </span>
              </div>

              {/* CUSTOMER / VEHICLE / SERVICE / RECORD */}
              <AppointmentInfoGrid appointment={appointment} />

              {/* AI VEHICLE DETECTION */}
              <div className="mt-4">
                <AiDetectionPanel appointment={appointment} />
              </div>
            </div>

            {/* SERVICE CHARGE */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-gray-900">
                Service Charge
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Enter the labor or service charge.
              </p>

              <div className="mt-5">
                <label className="text-sm font-semibold text-gray-700">
                  Service Charge
                </label>

                <div className="relative mt-2">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                    ₱
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    value={serviceCharge}
                    onChange={(e) => {
                      const value = e.target.value

                      // Allow only numbers and one decimal point
                      if (/^\d*\.?\d*$/.test(value)) {
                        setServiceCharge(value)
                      }
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm font-semibold outline-none transition focus:border-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* PARTS */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Parts & Materials
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Add parts or materials used for this service.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  + Add Part
                </button>
              </div>

              {/* TECHNICIAN USED PARTS */}
              {serviceItems.length > 0 && (
                <div className="mb-6 mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-blue-900">
                      🔧 Technician Used Parts
                    </h4>

                    <p className="mt-1 text-xs text-blue-700">
                      These parts were recorded by the technician during the
                      service.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {serviceItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-blue-100 bg-white p-4"
                      >
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Item
                            </p>

                            <p className="mt-1 font-bold text-gray-900">
                              {item.item_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Quantity
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              {Number(item.quantity)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Unit Price
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                              ₱{peso(item.unit_price)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Subtotal
                            </p>

                            <p className="mt-1 font-bold text-blue-700">
                              ₱{peso(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end border-t border-blue-200 pt-3">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-700">
                        Technician Parts Total
                      </p>

                      <p className="text-lg font-bold text-blue-900">
                        ₱{peso(serviceItemsSubtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
                      {/* ITEM NAME */}
                      <div className="md:col-span-5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Part Name
                        </label>

                        <select
                          value={item.inventory_id || ''}
                          onChange={(e) => {
                            const inventoryId = e.target.value

                            const selectedInventory = inventoryItems.find(
                              (inventory) =>
                                String(inventory.id) === String(inventoryId)
                            )

                            if (!selectedInventory) {
                              updateItem(index, 'inventory_id', null)
                              updateItem(index, 'item_name', '')
                              updateItem(index, 'unit_price', 0)
                              updateItem(index, 'available_stock', 0)
                              return
                            }

                            updateItem(index, 'inventory_id', selectedInventory.id)
                            updateItem(
                              index,
                              'item_name',
                              selectedInventory.name || ''
                            )
                            updateItem(
                              index,
                              'unit_price',
                              Number(selectedInventory.price) || 0
                            )
                            updateItem(
                              index,
                              'available_stock',
                              Number(selectedInventory.quantity) || 0
                            )
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                        >
                          <option value="">Select inventory item</option>

                          {inventoryItems.map((inventory) => (
                            <option
                              key={inventory.id}
                              value={inventory.id}
                              disabled={Number(inventory.quantity || 0) <= 0}
                            >
                              {inventory.name}
                              {' — Stock: '}
                              {Number(inventory.quantity || 0)}
                              {' — ₱'}
                              {peso(inventory.price)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* QUANTITY */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={item.available_stock || undefined}
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = Number(e.target.value)

                            if (
                              item.available_stock > 0 &&
                              value > item.available_stock
                            ) {
                              updateItem(index, 'quantity', item.available_stock)
                              return
                            }

                            updateItem(index, 'quantity', e.target.value)
                          }}
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                        />

                        {item.inventory_id && (
                          <p className="mt-1 text-xs text-gray-500">
                            Available stock: {item.available_stock}
                          </p>
                        )}
                      </div>

                      {/* UNIT PRICE */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Unit Price
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(index, 'unit_price', e.target.value)
                          }
                          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-900"
                        />
                      </div>

                      {/* SUBTOTAL */}
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Subtotal
                        </label>

                        <div className="mt-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900">
                          ₱{peso(getItemSubtotal(item))}
                        </div>
                      </div>

                      {/* REMOVE */}
                      <div className="md:col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="xl:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-gray-900">
                Transaction Summary
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Review the total amount.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Service Charge</span>

                  <span className="font-semibold text-gray-900">
                    ₱{peso(serviceAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Parts Subtotal</span>

                  <span className="font-semibold text-gray-900">
                    ₱{peso(partsSubtotal)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Service charge + parts
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-green-600">
                      ₱{peso(totalAmount)}
                    </p>
                  </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="border-t border-gray-200 pt-5">
                  <label className="text-sm font-semibold text-gray-700">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-gray-900"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveTransaction}
                className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving Transaction...' : 'Save Transaction'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}