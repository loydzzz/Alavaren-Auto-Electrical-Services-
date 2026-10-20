import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  FaReceipt,
  FaSearch,
  FaArrowLeft,
  FaCar,
  FaUser,
  FaWrench,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaClock,
  FaCreditCard,
  FaHashtag,
  FaGlobe,
  FaUserCheck,
  FaStore,
  FaQuestionCircle,
} from 'react-icons/fa'

/* =========================================================
   FORMAT HELPERS
========================================================= */

const formatMoney = (amount) => {
  return `₱${Number(amount || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (date) => {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCreatedDateTime = (dateTime) => {
  if (!dateTime) {
    return { date: 'N/A', time: 'N/A' }
  }

  const date = new Date(dateTime)

  return {
    date: date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),

    time: date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
  }
}

/* =========================================================
   RECEIPT BUILDER (shared by manual print + auto print)
========================================================= */

const RECEIPT_STYLES = `
  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 30px;
    background: white;
    color: #111827;
    font-family: Arial, Helvetica, sans-serif;
  }

  .receipt { width: 100%; max-width: 800px; margin: 0 auto; }

  .header {
    text-align: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #111827;
  }

  .business { font-size: 24px; font-weight: bold; }
  .subtitle { margin-top: 5px; color: #6b7280; font-size: 13px; }
  .receipt-title { margin-top: 18px; font-size: 20px; font-weight: bold; }
  .receipt-number { margin-top: 6px; color: #6b7280; font-size: 13px; }

  .section { margin-top: 25px; }

  .section-title {
    margin-bottom: 12px;
    color: #6b7280;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 30px;
  }

  .info { font-size: 14px; line-height: 1.5; }
  .label { color: #6b7280; margin-right: 5px; }
  .value { font-weight: bold; }

  table { width: 100%; border-collapse: collapse; }

  th {
    padding: 10px;
    background: #f3f4f6;
    font-size: 12px;
    text-align: left;
  }

  td {
    padding: 10px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 13px;
  }

  .center { text-align: center; }
  .right { text-align: right; }
  .empty { text-align: center; color: #6b7280; }

  .totals { width: 330px; margin-left: auto; margin-top: 20px; }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
    font-size: 14px;
  }

  .grand-total {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 2px solid #111827;
    font-size: 20px;
    font-weight: bold;
  }

  .timeline {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #d1d5db;
  }

  .warranty {
    margin-top: 25px;
    padding: 15px;
    border: 1px solid #d1fae5;
    border-radius: 8px;
    background: #ecfdf5;
  }

  .warranty-title {
    margin-bottom: 10px;
    color: #047857;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .footer {
    margin-top: 35px;
    padding-top: 20px;
    border-top: 1px solid #d1d5db;
    text-align: center;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.6;
  }

  @media print {
    body { padding: 0; }
    .receipt { max-width: none; }
  }
`

const buildReceiptHTML = (transaction) => {
  const appointment = transaction.appointments || {}
  const parts = transaction.transaction_items || []

  const appointmentNumber = appointment.id
    ? `APPT-${String(appointment.id).padStart(6, '0')}`
    : 'N/A'

  const bookingSource =
    appointment.booking_source === 'walkin'
      ? 'Walk-in'
      : appointment.booking_source === 'online'
      ? 'Online'
      : 'N/A'

  const assistedBy = appointment.assisted_by_user?.name || 'N/A'

  const appointmentDate = formatDate(
    appointment.appointment_date || transaction.appointment_date
  )

  const appointmentTime =
    appointment.appointment_time || transaction.appointment_time || 'N/A'

  const completed = appointment.completed_at
    ? formatCreatedDateTime(appointment.completed_at)
    : { date: 'N/A', time: 'N/A' }

  const created = formatCreatedDateTime(transaction.created_at)

  const warrantyStartDate = formatDate(transaction.warranty_start_date)
  const warrantyDueDate = formatDate(transaction.warranty_due_date)
  const warrantyPeriod = Number(transaction.warranty_period_days || 0)

  const serviceCharge = Number(transaction.service_charge || 0)

  const partsTotal = parts.reduce(
    (total, item) => total + Number(item.subtotal || 0),
    0
  )

  const totalAmount = Number(
    transaction.total_amount || transaction.amount || 0
  )

  const partsHTML =
    parts.length > 0
      ? parts
          .map(
            (item) => `
        <tr>
          <td>${item.item_name || 'Unnamed Part'}</td>
          <td class="center">${Number(item.quantity || 0)}</td>
          <td class="right">${formatMoney(item.unit_price)}</td>
          <td class="right">${formatMoney(item.subtotal)}</td>
        </tr>
      `
          )
          .join('')
      : `
        <tr>
          <td colspan="4" class="empty">
            No parts or materials recorded.
          </td>
        </tr>
      `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${transaction.receipt_number || 'Transaction Receipt'}</title>
      <style>${RECEIPT_STYLES}</style>
    </head>

    <body>
      <div class="receipt">

        <!-- HEADER -->
        <div class="header">
          <div class="business">ALAVAREN AUTO ELECTRICAL SERVICES</div>
          <div class="subtitle">Auto Electrical Repair & Services</div>
          <div class="receipt-title">TRANSACTION RECEIPT</div>
          <div class="receipt-number">
            Receipt No:
            <strong>${transaction.receipt_number || 'N/A'}</strong>
          </div>
        </div>

        <!-- CUSTOMER -->
        <div class="section">
          <div class="section-title">Customer Information</div>

          <div class="info-grid">
            <div class="info">
              <span class="label">Customer:</span>
              <span class="value">${transaction.customer_name || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Phone:</span>
              <span class="value">${transaction.customer_phone || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Address:</span>
              <span class="value">
                ${appointment.customer_address ||
                  transaction.customer_address ||
                  'N/A'}
              </span>
            </div>
          </div>
        </div>

        <!-- VEHICLE -->
        <div class="section">
          <div class="section-title">Vehicle Information</div>

          <div class="info-grid">
            <div class="info">
              <span class="label">Vehicle:</span>
              <span class="value">${transaction.vehicle_model || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Plate No:</span>
              <span class="value">${transaction.plate_number || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Fuel Type:</span>
              <span class="value">${appointment.fuel_type || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Battery Voltage:</span>
              <span class="value">${appointment.battery_voltage || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Transmission:</span>
              <span class="value">${appointment.transmission_type || 'N/A'}</span>
            </div>
          </div>
        </div>

        <!-- SERVICE -->
        <div class="section">
          <div class="section-title">Service Information</div>

          <div class="info-grid">
            <div class="info">
              <span class="label">Appointment No:</span>
              <span class="value">${appointmentNumber}</span>
            </div>

            <div class="info">
              <span class="label">Booking Source:</span>
              <span class="value">${bookingSource}</span>
            </div>

            <div class="info">
              <span class="label">Assisted By:</span>
              <span class="value">${assistedBy}</span>
            </div>

            <div class="info">
              <span class="label">Service:</span>
              <span class="value">${transaction.service_type || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Technician:</span>
              <span class="value">${transaction.technician_name || 'N/A'}</span>
              <br />
              <span class="label">Role:</span>
              <span class="value">${appointment.technician_role || 'N/A'}</span>
            </div>

            <div class="info">
              <span class="label">Payment:</span>
              <span class="value">${transaction.payment_method || 'Cash'}</span>
            </div>

            <div class="info">
              <span class="label">Payment Status:</span>
              <span class="value">${transaction.payment_status || 'Paid'}</span>
            </div>
          </div>
        </div>

        <!-- PARTS -->
        <div class="section">
          <div class="section-title">Parts & Materials</div>

          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th class="center">Qty</th>
                <th class="right">Unit Price</th>
                <th class="right">Subtotal</th>
              </tr>
            </thead>

            <tbody>${partsHTML}</tbody>
          </table>
        </div>

        <!-- TOTALS -->
        <div class="totals">
          <div class="total-row">
            <span>Service Charge</span>
            <strong>${formatMoney(serviceCharge)}</strong>
          </div>

          <div class="total-row">
            <span>Parts Total</span>
            <strong>${formatMoney(partsTotal)}</strong>
          </div>

          <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>${formatMoney(totalAmount)}</span>
          </div>
        </div>

        <!-- WARRANTY -->
        <div class="warranty">
          <div class="warranty-title">Warranty Information</div>

          <div class="info-grid">
            <div class="info">
              <span class="label">Warranty Period:</span>
              <span class="value">
                ${warrantyPeriod > 0 ? `${warrantyPeriod} Days` : 'N/A'}
              </span>
            </div>

            <div class="info">
              <span class="label">Warranty Start:</span>
              <span class="value">${warrantyStartDate}</span>
            </div>

            <div class="info">
              <span class="label">Warranty Due:</span>
              <span class="value">${warrantyDueDate}</span>
            </div>
          </div>
        </div>

        <!-- TIMELINE -->
        <div class="timeline">
          <div class="section-title">Service Timeline</div>

          <div class="info-grid">
            <div class="info">
              <span class="label">Appointment:</span>
              <span class="value">${appointmentDate} ${appointmentTime}</span>
            </div>

            <div class="info">
              <span class="label">Completed:</span>
              <span class="value">${completed.date} ${completed.time}</span>
            </div>

            <div class="info">
              <span class="label">Transaction Created:</span>
              <span class="value">${created.date} ${created.time}</span>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="footer">
          <strong>
            Thank you for choosing Alavaren Auto Electrical Services!
          </strong>
          <br />
          Please keep this receipt for your records.
        </div>

      </div>
    </body>
    </html>
  `
}

const printReceiptHTML = (receiptHTML, errorMessage) => {
  const iframe = document.createElement('iframe')

  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'

  document.body.appendChild(iframe)

  const iframeDocument =
    iframe.contentDocument || iframe.contentWindow.document

  iframeDocument.open()
  iframeDocument.write(receiptHTML)
  iframeDocument.close()

  setTimeout(() => {
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (error) {
      console.error('PRINT ERROR:', error)
      alert(errorMessage)
    }

    // Remove iframe after printing
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }, 1000)
  }, 500)
}

/* =========================================================
   PAGE
========================================================= */

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingTransactionId, setDeletingTransactionId] = useState(null)
  const [bookingFilter, setBookingFilter] = useState('all')

  const navigate = useNavigate()

  // ==============================
  // FETCH TRANSACTIONS
  // ==============================
  const fetchTransactions = async () => {
    setLoading(true)

    const { data, error } = await supabase
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
          id,
          appointment_date,
          appointment_time,
          completed_at,
          technician_id,
          technician_role,
          customer_address,
          booking_source,
          assisted_by,
          fuel_type,
          battery_voltage,
          transmission_type,
          assisted_by_user:users!appointments_assisted_by_fkey (
            id,
            name,
            role
          )
        )
      `
      )
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Transaction Error:', error)
      setTransactions([])
    } else {
      setTransactions(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // ==============================
  // DELETE TRANSACTION + RESTORE INVENTORY
  // ==============================
  const deleteTransaction = async (transactionId) => {
    if (deletingTransactionId === transactionId) {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this transaction? The inventory items used by this transaction will be restored.'
    )

    if (!confirmed) return

    setDeletingTransactionId(transactionId)

    try {
      // GET CURRENT USER
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error('Auth Error:', authError)
        alert('Unable to identify the logged-in user.')
        return
      }

      // GET CURRENT USER PROFILE
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile) {
        console.error('User Profile Error:', profileError)
        alert('Unable to identify your user profile.')
        return
      }

      // GET TRANSACTION ITEMS BEFORE DELETING THEM
      const { data: transactionItems, error: itemsFetchError } =
        await supabase
          .from('transaction_items')
          .select(
            `
            id,
            transaction_id,
            item_name,
            quantity,
            unit_price,
            subtotal,
            inventory_id,
            service_task_item_id
          `
          )
          .eq('transaction_id', transactionId)

      if (itemsFetchError) {
        console.error('Fetch Transaction Items Error:', itemsFetchError)
        alert('Failed to retrieve transaction items.')
        return
      }

      // RESTORE INVENTORY ITEMS
      const inventoryItems = (transactionItems || []).filter(
        (item) => item.inventory_id !== null
      )

      for (const transactionItem of inventoryItems) {
        const inventoryId = transactionItem.inventory_id

        const quantityToRestore = Number(transactionItem.quantity || 0)

        if (quantityToRestore <= 0) {
          continue
        }

        // GET CURRENT INVENTORY
        const { data: inventoryItem, error: inventoryFetchError } =
          await supabase
            .from('inventory')
            .select('id, name, quantity, price')
            .eq('id', inventoryId)
            .single()

        if (inventoryFetchError || !inventoryItem) {
          console.error('Inventory Fetch Error:', inventoryFetchError)

          alert(`Could not find inventory item: ${transactionItem.item_name}`)

          return
        }

        // CALCULATE RESTORED STOCK
        const currentQuantity = Number(inventoryItem.quantity || 0)

        const restoredQuantity = currentQuantity + quantityToRestore

        // Your inventory table has a maximum of 100
        if (restoredQuantity > 100) {
          alert(
            `Cannot restore ${quantityToRestore} ${transactionItem.item_name}. ` +
              `Current stock is ${currentQuantity} and maximum stock is 100.`
          )

          return
        }

        // UPDATE INVENTORY
        const { error: inventoryUpdateError } = await supabase
          .from('inventory')
          .update({ quantity: restoredQuantity })
          .eq('id', inventoryId)

        if (inventoryUpdateError) {
          console.error('Inventory Restore Error:', inventoryUpdateError)

          alert(`Failed to restore ${transactionItem.item_name}.`)

          return
        }

        // CREATE INVENTORY ACTIVITY
        const { error: activityError } = await supabase
          .from('inventory_transactions')
          .insert([
            {
              inventory_id: inventoryId,
              item_name: transactionItem.item_name || inventoryItem.name,
              action: 'Restored',
              quantity: quantityToRestore,
              remaining_stock: restoredQuantity,
              old_price: Number(inventoryItem.price || 0),
              new_price: Number(inventoryItem.price || 0),
              performed_by: userProfile.id,
              performed_by_role: userProfile.role,
            },
          ])

        if (activityError) {
          console.error('Inventory Activity Error:', activityError)

          // Inventory was already restored. Stop here so we do not delete
          // the transaction while the restoration history failed.
          alert(
            `Inventory was restored, but the inventory activity could not be recorded for ${transactionItem.item_name}.`
          )

          return
        }
      }

      // DELETE TRANSACTION ITEMS
      const { error: itemsDeleteError } = await supabase
        .from('transaction_items')
        .delete()
        .eq('transaction_id', transactionId)

      if (itemsDeleteError) {
        console.error('Delete Items Error:', itemsDeleteError)

        alert(
          'Inventory was restored, but the transaction items could not be deleted.'
        )

        return
      }

      // DELETE TRANSACTION
      const { error: transactionDeleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (transactionDeleteError) {
        console.error('Delete Transaction Error:', transactionDeleteError)

        alert(
          'Transaction items were deleted, but the transaction itself could not be deleted.'
        )

        return
      }

      // REMOVE FROM UI
      setTransactions((current) =>
        current.filter((transaction) => transaction.id !== transactionId)
      )

      alert(
        inventoryItems.length > 0
          ? 'Transaction deleted and inventory restored successfully.'
          : 'Transaction deleted successfully.'
      )
    } catch (error) {
      console.error('Delete Transaction Error:', error)

      alert('Something went wrong while deleting the transaction.')
    } finally {
      setDeletingTransactionId(null)
    }
  }

  // ==============================
  // PRINT RECEIPT
  // ==============================
  const printReceipt = (transaction) => {
    console.log('PRINT RECEIPT:', transaction)

    printReceiptHTML(
      buildReceiptHTML(transaction),
      'Unable to open the print dialog.'
    )
  }

  // Same receipt, used right after a transaction is saved
  const autoPrintReceipt = (transaction) => {
    console.log('AUTO PRINT RECEIPT:', transaction)

    printReceiptHTML(
      buildReceiptHTML(transaction),
      'Transaction was saved, but the automatic print could not be opened.'
    )
  }

  // ==============================
  // PARTS CALCULATIONS
  // ==============================
  const getTotalParts = (transaction) => {
    return (transaction.transaction_items || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    )
  }

  const getPartsTotal = (transaction) => {
    return (transaction.transaction_items || []).reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    )
  }

  // ==============================
  // FILTER TRANSACTIONS
  // ==============================
  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = search.toLowerCase().trim()

    const appointmentNumber = transaction.appointments?.id
      ? `APPT-${String(transaction.appointments.id).padStart(6, '0')}`
      : ''

    const matchesSearch =
      !searchText ||
      transaction.receipt_number?.toLowerCase().includes(searchText) ||
      appointmentNumber.toLowerCase().includes(searchText) ||
      transaction.customer_name?.toLowerCase().includes(searchText) ||
      transaction.vehicle_model?.toLowerCase().includes(searchText) ||
      transaction.plate_number?.toLowerCase().includes(searchText) ||
      transaction.service_type?.toLowerCase().includes(searchText) ||
      transaction.technician_name?.toLowerCase().includes(searchText)

    const bookingSource =
      transaction.appointments?.booking_source?.toLowerCase()

    const matchesBookingFilter =
      bookingFilter === 'all' ||
      (bookingFilter === 'online' && bookingSource === 'online') ||
      (bookingFilter === 'walkin' && bookingSource === 'walkin')

    return matchesSearch && matchesBookingFilter
  })

  // ==============================
  // TOTALS
  // ==============================
  const totalRevenue = transactions.reduce(
    (total, transaction) =>
      total + Number(transaction.total_amount || transaction.amount || 0),
    0
  )

  const onlineTransactions = transactions.filter(
    (transaction) =>
      transaction.appointments?.booking_source?.toLowerCase() === 'online'
  )

  const walkInTransactions = transactions.filter((transaction) => {
    const source = transaction.appointments?.booking_source?.toLowerCase()

    return source === 'walkin' || source === 'walk-in' || source === 'walk in'
  })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* BRAND */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-green-100 bg-gradient-to-br from-green-500 to-emerald-700 text-white shadow-[0_8px_20px_rgba(34,197,94,0.30)] ring-1 ring-green-400/30 transition-all duration-300 hover:scale-110 hover:shadow-[0_10px_25px_rgba(34,197,94,0.38)] active:scale-95 sm:h-11 sm:w-11">
              <FaReceipt className="text-sm sm:text-base" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-xl">
                Transactions
              </h1>

              <p className="hidden truncate text-xs text-slate-500 sm:block">
                Completed services, payments & receipts
              </p>
            </div>
          </div>

          {/* BACK */}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="group flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:translate-y-0 sm:px-4 sm:text-sm"
          >
            <FaArrowLeft className="text-slate-500 transition-transform duration-200 group-hover:-translate-x-0.5" />

            <span className="hidden sm:inline">Back to Dashboard</span>

            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* PAGE INTRO */}
        <section className="mb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Financial Records
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Transaction History
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                Review completed services, charges, parts, payments,
                technicians, and printable receipts.
              </p>
            </div>

            {!loading && (
              <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:block">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Showing
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {filteredTransactions.length} transaction
                  {filteredTransactions.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* SUMMARY */}
        {!loading && (
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL TRANSACTIONS */}
            <button
              type="button"
              onClick={() => setBookingFilter('all')}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                bookingFilter === 'all'
                  ? 'border-slate-400 ring-2 ring-slate-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-100 opacity-70 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Total Transactions
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {transactions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {bookingFilter === 'all'
                      ? 'Showing all transactions'
                      : 'Click to show all'}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform duration-300 group-hover:scale-105">
                  <FaReceipt />
                </div>
              </div>
            </button>

            {/* ONLINE BOOKINGS */}
            <button
              type="button"
              onClick={() => setBookingFilter('online')}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                bookingFilter === 'online'
                  ? 'border-blue-400 ring-2 ring-blue-100'
                  : 'border-blue-100'
              }`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 opacity-80 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-500">
                    Online Bookings
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-blue-700">
                    {onlineTransactions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {bookingFilter === 'online'
                      ? 'Showing online transactions'
                      : 'Click to filter online'}
                  </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                  <FaGlobe />
                </div>
              </div>
            </button>

            {/* WALK-IN BOOKINGS */}
            <button
              type="button"
              onClick={() => setBookingFilter('walkin')}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                bookingFilter === 'walkin'
                  ? 'border-yellow-400 ring-2 ring-yellow-100'
                  : 'border-yellow-100'
              }`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-50 opacity-80 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-yellow-600">
                    Walk-in Bookings
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-yellow-700">
                    {walkInTransactions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {bookingFilter === 'walkin'
                      ? 'Showing walk-in transactions'
                      : 'Click to filter walk-in'}
                  </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 transition-transform duration-300 group-hover:scale-105">
                  <FaStore />
                </div>
              </div>
            </button>

            {/* TOTAL REVENUE */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-50 opacity-80 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                    Total Revenue
                  </p>

                  <p className="mt-2 truncate text-2xl font-bold tracking-tight text-emerald-700 sm:text-3xl">
                    {formatMoney(totalRevenue)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Across all transactions
                  </p>
                </div>

                <div className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-105">
                  <FaMoneyBillWave />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEARCH */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search appointment #, receipt, customer, vehicle, service, or technician..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
            />
          </div>

          {search && (
            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">
                Search results:
                <span className="ml-1 font-semibold text-slate-600">
                  {filteredTransactions.length}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
              >
                Clear search
              </button>
            </div>
          )}
        </section>

        {/* LOADING / EMPTY / LIST */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900" />
            </div>

            <p className="font-semibold text-slate-700">
              Loading transactions
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while your records are being loaded.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              <FaReceipt />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              {search ? 'No matching transactions' : 'No transactions yet'}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {search
                ? 'Try searching using another receipt number, customer, vehicle, service, or technician.'
                : 'Completed services will appear here as transactions.'}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const appointment = transaction.appointments || {}

              return (
                <article
                  key={transaction.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl"
                >
                  {/* TRANSACTION HEADER */}
                  <div className="border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      {/* RECEIPT */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-200 group-hover:bg-slate-900 group-hover:text-white">
                          <FaReceipt />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
                            Receipt Number
                          </p>

                          <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 sm:text-base">
                            {transaction.receipt_number || 'N/A'}
                          </h3>
                        </div>
                      </div>

                      {/* ACTIONS / TOTAL */}
                      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center xl:w-auto">
                        {/* TOTAL */}
                        <div className="order-1 rounded-xl bg-emerald-50 px-4 py-3 sm:order-2 sm:min-w-[160px]">
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-600">
                            Total Amount
                          </p>

                          <p className="mt-0.5 text-lg font-bold text-emerald-700">
                            {formatMoney(
                              transaction.total_amount || transaction.amount
                            )}
                          </p>
                        </div>

                        {/* PRINT */}
                        <button
                          type="button"
                          onClick={() => printReceipt(transaction)}
                          className="group/print order-2 flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] sm:order-1 sm:flex-none"
                        >
                          <FaReceipt className="text-slate-400 transition-colors group-hover/print:text-slate-700" />

                          <span>Print Receipt</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MAIN DETAILS */}
                  <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                    {/* CUSTOMER */}
                    <div className="rounded-xl border border-transparent p-2 transition-colors hover:border-blue-100 hover:bg-blue-50/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <FaUser />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Customer
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                            {transaction.customer_name || 'N/A'}
                          </p>

                          <p className="mt-1 break-words text-xs text-slate-500">
                            Address:
                            <span className="ml-1 font-semibold text-slate-700">
                              {appointment.customer_address ||
                                transaction.customer_address ||
                                'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* VEHICLE */}
                    <div className="rounded-xl border border-transparent p-2 transition-colors hover:border-purple-100 hover:bg-purple-50/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                          <FaCar />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Vehicle
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                            {transaction.vehicle_model || 'N/A'}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            Plate:
                            <span className="ml-1 font-semibold text-slate-700">
                              {transaction.plate_number || 'N/A'}
                            </span>
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            Fuel Type:
                            <span className="ml-1 font-semibold text-slate-700">
                              {appointment.fuel_type || 'N/A'}
                            </span>
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            Battery:
                            <span className="ml-1 font-semibold text-slate-700">
                              {appointment.battery_voltage || 'N/A'}
                            </span>
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            Transmission:
                            <span className="ml-1 font-semibold text-slate-700">
                              {appointment.transmission_type || 'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SERVICE */}
                    <div className="rounded-xl border border-transparent p-2 transition-colors hover:border-orange-100 hover:bg-orange-50/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <FaWrench />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Service
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                            {transaction.service_type || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TECHNICIAN */}
                    <div className="rounded-xl border border-transparent p-2 transition-colors hover:border-indigo-100 hover:bg-indigo-50/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <FaWrench />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            Technician
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                            {transaction.technician_name || 'N/A'}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            Role:
                            <span className="ml-1 font-semibold text-indigo-600">
                              {appointment.technician_role || 'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FINANCIAL DETAILS */}
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-6 sm:py-6 lg:px-7">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                      {/* SERVICE CHARGE */}
                      <div className="min-w-0 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Service Charge
                        </p>

                        <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                          {formatMoney(transaction.service_charge)}
                        </p>
                      </div>

                      {/* TOTAL PARTS */}
                      <div className="min-w-0 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Total Parts
                        </p>

                        <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                          {getTotalParts(transaction)}
                        </p>
                      </div>

                      {/* PARTS TOTAL */}
                      <div className="min-w-0 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Parts Total
                        </p>

                        <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                          {formatMoney(getPartsTotal(transaction))}
                        </p>
                      </div>

                      {/* PAYMENT */}
                      <div className="min-w-0 rounded-xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                          Payment
                        </p>

                        <p className="mt-1.5 flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-800">
                          <FaCreditCard className="shrink-0 text-slate-400" />

                          <span className="min-w-0 break-words">
                            {transaction.payment_method || 'Cash'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* PARTS BREAKDOWN */}
                    {(transaction.transaction_items || []).length > 0 && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              Parts & Materials
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Itemized parts used for this service
                            </p>
                          </div>

                          <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                            {getTotalParts(transaction)} item
                            {getTotalParts(transaction) !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* DESKTOP TABLE */}
                        <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
                          <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            <div className="col-span-5">Part</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">
                              Unit Price
                            </div>
                            <div className="col-span-3 text-right">
                              Subtotal
                            </div>
                          </div>

                          {(transaction.transaction_items || []).map((item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-12 items-center border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50"
                            >
                              <div className="col-span-5 min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {item.item_name || 'Unnamed Part'}
                                </p>
                              </div>

                              <div className="col-span-2 text-center">
                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                  {Number(item.quantity || 0)}
                                </span>
                              </div>

                              <div className="col-span-2 text-right">
                                <p className="text-sm font-medium text-slate-700">
                                  {formatMoney(item.unit_price)}
                                </p>
                              </div>

                              <div className="col-span-3 text-right">
                                <p className="text-sm font-bold text-slate-900">
                                  {formatMoney(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                Parts Total
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {getTotalParts(transaction)} total item(s)
                              </p>
                            </div>

                            <p className="text-lg font-bold text-slate-900">
                              {formatMoney(getPartsTotal(transaction))}
                            </p>
                          </div>
                        </div>

                        {/* MOBILE PARTS */}
                        <div className="space-y-2 sm:hidden">
                          {(transaction.transaction_items || []).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-slate-200 bg-white p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.item_name || 'Unnamed Part'}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {Number(item.quantity || 0)} ×{' '}
                                    {formatMoney(item.unit_price)}
                                  </p>
                                </div>

                                <p className="shrink-0 text-sm font-bold text-slate-900">
                                  {formatMoney(item.subtotal)}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-3">
                            <span className="text-xs font-bold text-slate-500">
                              Parts Total
                            </span>

                            <span className="text-base font-bold text-slate-900">
                              {formatMoney(getPartsTotal(transaction))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER / TIMELINE */}
                  <div className="border-t border-slate-100 px-5 py-5 sm:px-6 sm:py-6 lg:px-7">
                    {/* SERVICE TIMELINE */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                      {/* APPOINTMENT */}
                      <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
                            <FaCalendarAlt className="text-[11px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Appointment
                            </p>

                            <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-slate-600">
                              {formatDate(
                                appointment.appointment_date ||
                                  transaction.appointment_date
                              )}

                              <span className="ml-1">
                                {appointment.appointment_time ||
                                  transaction.appointment_time ||
                                  'N/A'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* COMPLETED */}
                      <div className="min-w-0 rounded-xl bg-emerald-50/60 px-4 py-3.5 ring-1 ring-emerald-100/70">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                            <FaClock className="text-[11px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-600/70">
                              Completed
                            </p>

                            <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-emerald-600">
                              {appointment.completed_at
                                ? formatCreatedDateTime(appointment.completed_at)
                                    .date
                                : 'N/A'}

                              {appointment.completed_at && (
                                <span className="ml-1">
                                  {
                                    formatCreatedDateTime(
                                      appointment.completed_at
                                    ).time
                                  }
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CREATED */}
                      <div className="min-w-0 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
                            <FaClock className="text-[11px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                              Transaction Created
                            </p>

                            <p className="mt-1.5 break-words text-xs font-semibold leading-5 text-slate-600">
                              {formatCreatedDateTime(transaction.created_at).date}

                              <span className="ml-1">
                                {formatCreatedDateTime(transaction.created_at).time}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* APPOINTMENT DETAILS */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                      {/* APPOINTMENT NUMBER */}
                      <div className="min-w-0 rounded-xl bg-blue-50/60 px-4 py-3.5 ring-1 ring-blue-100/70">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                            <FaHashtag className="text-[11px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600/70">
                              Appointment Number
                            </p>

                            <p className="mt-1.5 break-words text-xs font-bold leading-5 text-blue-700">
                              {appointment.id
                                ? `APPT-${String(appointment.id).padStart(
                                    6,
                                    '0'
                                  )}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BOOKING SOURCE */}
                      {(() => {
                        const bookingSource =
                          appointment.booking_source?.toLowerCase()

                        const isOnline = bookingSource === 'online'
                        const isWalkIn =
                          bookingSource === 'walkin' ||
                          bookingSource === 'walk-in' ||
                          bookingSource === 'walk in'

                        const sourceLabel = bookingSource
                          ? bookingSource === 'walkin'
                            ? 'Walk-in'
                            : bookingSource
                          : 'N/A'

                        const sourceStyles = isOnline
                          ? {
                              card: 'bg-blue-50/60 ring-blue-100/70',
                              icon: 'bg-white text-blue-600 ring-blue-100',
                              label: 'text-blue-600/70',
                              value: 'text-blue-700',
                            }
                          : isWalkIn
                          ? {
                              card: 'bg-yellow-50/60 ring-yellow-100/70',
                              icon: 'bg-white text-yellow-600 ring-yellow-100',
                              label: 'text-yellow-600/70',
                              value: 'text-yellow-700',
                            }
                          : {
                              card: 'bg-slate-50 ring-slate-100',
                              icon: 'bg-white text-slate-500 ring-slate-100',
                              label: 'text-slate-400',
                              value: 'text-slate-700',
                            }

                        return (
                          <div
                            className={`min-w-0 rounded-xl px-4 py-3.5 ring-1 ${sourceStyles.card}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ${sourceStyles.icon}`}
                              >
                                {isOnline ? (
                                  <FaGlobe className="text-[11px]" />
                                ) : isWalkIn ? (
                                  <FaStore className="text-[11px]" />
                                ) : (
                                  <FaQuestionCircle className="text-[11px]" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-[9px] font-bold uppercase tracking-[0.14em] ${sourceStyles.label}`}
                                >
                                  Booking Source
                                </p>

                                <p
                                  className={`mt-1.5 break-words text-xs font-bold capitalize leading-5 ${sourceStyles.value}`}
                                >
                                  {sourceLabel}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                      {/* ASSISTED BY */}
                      <div className="min-w-0 rounded-xl bg-orange-50/60 px-4 py-3.5 ring-1 ring-orange-100/70 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm ring-1 ring-orange-100">
                            <FaUserCheck className="text-[11px]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-orange-600/70">
                              Assisted By
                            </p>

                            <p className="mt-1.5 break-words text-xs font-bold leading-5 text-orange-700">
                              {appointment.assisted_by_user?.name || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DELETE */}
                    <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        disabled={deletingTransactionId === transaction.id}
                        onClick={() => deleteTransaction(transaction.id)}
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingTransactionId === transaction.id
                          ? 'Deleting...'
                          : 'Delete Transaction'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}