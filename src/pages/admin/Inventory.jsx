import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import {
  FaBoxOpen,
  FaBoxes,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPlus,
  FaEdit,
  FaTools,
  FaWarehouse,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaWrench,
  FaCheckCircle,
  FaTimes,
  FaCube,
  FaChartLine,
} from 'react-icons/fa'

export default function Inventory() {
  const navigate = useNavigate()

  const MAX_STOCK = 100


  const emptyForm = {
    name: '',
    category: '',
    quantity: '',
    price: '',
    low_stock_threshold: '',
  }

  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [form, setForm] = useState(emptyForm)
  const [showUseDialog, setShowUseDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [usedQuantity, setUsedQuantity] = useState(1)
  const [showRestockDialog, setShowRestockDialog] = useState(false)
  const [restockQuantity, setRestockQuantity] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isUsingStock, setIsUsingStock] = useState(false)
  const [isRestocking, setIsRestocking] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  


  async function fetchItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name')

    if (error) {
      console.log(error)
      toast.error(error.message)
      return
    }

    setItems(data)
  }

  async function handleAdd(e) {
    e.preventDefault()

    // Prevent double tapping / double submission
    if (isSaving) return

    setIsSaving(true)

    try {
      const userProfile = await getCurrentUserProfile()

      if (!userProfile) return

      const initialQuantity = Number(form.quantity || 0)

      if (!editingItem && initialQuantity > MAX_STOCK) {
        toast.error(`Stock cannot exceed ${MAX_STOCK} items.`)
        return
      }

      const newItem = {
        name: form.name,
        category: form.category,
        quantity: initialQuantity,
        price: Number(form.price || 0),
        low_stock_threshold: Number(form.low_stock_threshold || 0),
      }

      console.log('Editing Item:', editingItem)
      console.log('Current User:', userProfile)
      console.log('New Item:', newItem)

      // =====================================================
      // EDIT EXISTING ITEM
      // =====================================================

      if (editingItem) {
        // Get logged-in user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          toast.error('Unable to identify the logged-in user.')
          return
        }

        // Get user profile and role
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, name, role')
          .eq('id', user.id)
          .single()

        if (profileError || !userProfile) {
          console.error('User Profile Error:', profileError)
          toast.error('Unable to identify user role.')
          return
        }

        // Update inventory item
        const { error } = await supabase
          .from('inventory')
          .update({
            name: form.name,
            category: form.category,
            price: Number(form.price),
            low_stock_threshold: Number(form.low_stock_threshold),
          })
          .eq('id', editingItem.id)

        if (error) {
          console.error('Update Error:', error)
          toast.error(error.message)
          return
        }

        // Record inventory activity
        const { error: transactionError } = await supabase
          .from('inventory_transactions')
          .insert([
            {
              inventory_id: editingItem.id,
              item_name: form.name,
              action: 'Edited',
              quantity: editingItem.quantity,
              remaining_stock: editingItem.quantity,

              old_price: Number(editingItem.price || 0),
              new_price: Number(form.price || 0),

              performed_by: userProfile.id,
              performed_by_role: userProfile.role,
            },
          ])

        if (transactionError) {
          console.error(
            'Inventory Transaction Error:',
            transactionError
          )
        }

       // =====================================================
// ADMIN NOTIFICATION — INVENTORY UPDATED
// =====================================================

const { error: notificationError } = await supabase
  .from('notifications')
  .insert([
    {
      type: 'inventory',
      title: 'Inventory Updated',
      message: `${form.name} information was updated by ${
        userProfile.name || userProfile.role
      }.`,
      is_read: false,

      // IMPORTANT:
      // Make this notification belong ONLY
      // to the admin who performed the action.
      recipient_id: userProfile.id,

    },
  ])

if (notificationError) {
  console.error(
    '❌ Edit Inventory Notification Error:',
    notificationError
  )

  toast.error(
    `Notification error: ${notificationError.message}`
  )
}



        toast.success('Item updated!')

        handleCancel()
        fetchItems()

        return
      }

      // =====================================================
      // ADD NEW ITEM
      // =====================================================

      const { data: insertedItem, error } = await supabase
        .from('inventory')
        .insert([newItem])
        .select()
        .single()

      if (error) {
        console.error('Restock Error:', error)

        if (error.code === '23514') {
          toast.error(`Stock cannot exceed ${MAX_STOCK} items.`)
        } else {
          toast.error(error.message)
        }

        return
      }

      // RECORD INVENTORY ACTIVITY
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert([
          {
            inventory_id: insertedItem.id,
            item_name: insertedItem.name,
            action: 'Added',
            quantity: insertedItem.quantity,
            remaining_stock: insertedItem.quantity,

            old_price: Number(insertedItem.price || 0),
            new_price: Number(insertedItem.price || 0),

            performed_by: userProfile.id,
            performed_by_role: userProfile.role,
          },
        ])

      if (transactionError) {
        console.error('Add Transaction Error:', transactionError)
      }

      // NOTIFICATION
const { error: notificationError } = await supabase
  .from('notifications')
  .insert([
    {
      type: 'inventory',
      title: 'New Inventory Item',
      message: `${form.name} was added to inventory by ${
        userProfile.name || userProfile.role
      }.`,
      is_read: false,

      // IMPORTANT:
      // This makes the notification belong to the
      // currently logged-in admin/authorized user.
      recipient_id: userProfile.id,
      inventory_id: insertedItem.id,

    },
  ])

if (notificationError) {
  console.error(
    '❌ Add Inventory Notification Error:',
    notificationError
  )
}


      toast.success('Item added!')

      handleCancel()
      fetchItems()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    console.log('Delete clicked:', id)

    const confirmDelete = window.confirm('Delete this item?')

    if (!confirmDelete) return

    // Get logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      toast.error('Unable to identify the logged-in user.')
      return
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('User Profile Error:', profileError)
      toast.error('Unable to identify user role.')
      return
    }

    // Delete item
    const { data, error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)
      .select()

    console.log('Deleted data:', data)
    console.log('Delete error:', error)

    if (error) {
      toast.error(error.message)
      return
    }

    const deletedItem = data?.[0]

    if (!deletedItem) {
      toast.error('Item could not be deleted.')
      return
    }

    // Record DELETE activity
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert([
        {
          inventory_id: deletedItem.id,
          item_name: deletedItem.name,
          action: 'Deleted',
          quantity: deletedItem.quantity,
          remaining_stock: 0,

          old_price: Number(deletedItem.price || 0),
          new_price: Number(deletedItem.price || 0),

          performed_by: userProfile.id,
          performed_by_role: userProfile.role,
        },
      ])

    if (transactionError) {
      console.error(
        'Delete Transaction Error:',
        transactionError
      )
    }

    // Notification
    // =====================================================
// ADMIN NOTIFICATION — INVENTORY DELETED
// =====================================================

const { error: notificationError } = await supabase
  .from('notifications')
  .insert([
    {
      title: 'Inventory Deleted',
      message: `${deletedItem.name} was deleted by ${
        userProfile.name || userProfile.role
      }.`,
      type: 'inventory',
      is_read: false,

      // IMPORTANT:
      // Notification belongs only to the admin
      // who performed the action.
      recipient_id: userProfile.id,

    },
  ])

if (notificationError) {
  console.error(
    '❌ Delete Inventory Notification Error:',
    notificationError
  )
}


    toast.success('Successfully deleted!')

    fetchItems()
  }

  async function handleUseStock() {
    if (isUsingStock) return

    setIsUsingStock(true)

    try {
      if (!selectedItem) return

      const qty = Number(usedQuantity)

      if (qty <= 0) {
        toast.error('Enter a valid quantity.')
        return
      }

      if (qty > selectedItem.quantity) {
        toast.error('Not enough stock available.')
        return
      }

      const userProfile = await getCurrentUserProfile()

      if (!userProfile) return

      const remaining = selectedItem.quantity - qty

      // UPDATE INVENTORY
      const { error } = await supabase
        .from('inventory')
        .update({
          quantity: remaining,
        })
        .eq('id', selectedItem.id)

      if (error) {
        console.error('Restock Error:', error)

        if (error.code === '23514') {
          toast.error(`Stock cannot exceed ${MAX_STOCK} items.`)
        } else {
          toast.error(error.message)
        }

        return
      }

      // RECORD TRANSACTION
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert([
          {
            item_name: selectedItem.name,
            action: 'Used',
            quantity: qty,
            remaining_stock: remaining,

            old_price: Number(selectedItem.price || 0),
            new_price: Number(selectedItem.price || 0),

            performed_by: userProfile.id,
            performed_by_role: userProfile.role,
          },
        ])

      if (transactionError) {
        console.error('Use Transaction Error:', transactionError)
      }

      // NOTIFICATION
      // =====================================================
// ADMIN NOTIFICATION — STOCK USED
// =====================================================

const { error: notificationError } = await supabase
  .from('notifications')
  .insert([
    {
      type: 'inventory',

      title:
        remaining <= selectedItem.low_stock_threshold
          ? 'Low Stock Alert'
          : 'Stock Used',

      message:
        remaining <= selectedItem.low_stock_threshold
          ? `${selectedItem.name} is low on stock (${remaining} left). Used by ${
              userProfile.name || userProfile.role
            }.`
          : `${qty} ${selectedItem.name} used by ${
              userProfile.name || userProfile.role
            }. ${remaining} remaining.`,

      is_read: false,

      // IMPORTANT:
      // Notification belongs to the admin
      // who performed this inventory action.
      recipient_id: userProfile.id,

    },
  ])

if (notificationError) {
  console.error(
    '❌ Use Stock Notification Error:',
    notificationError
  )
}


      // EXTRA LOW / OUT OF STOCK NOTIFICATION
      if (remaining <= selectedItem.low_stock_threshold) {
        await supabase
          .from('notifications')
          .insert([
            {
              title:
                remaining === 0
                  ? 'Out of Stock'
                  : 'Low Stock',

              message: `${selectedItem.name} has only ${remaining} remaining after being used by ${
                userProfile.name || userProfile.role
              }.`,

              type: 'inventory',
              is_read: false,
            },
          ])
      }

      toast.success('Stock updated successfully!')

      setShowUseDialog(false)
      setSelectedItem(null)
      setUsedQuantity(1)

      fetchItems()
    } finally {
      setIsUsingStock(false)
    }
  }

  async function handleRestock() {
    if (isRestocking) return

    setIsRestocking(true)

    try {
      if (!selectedItem) return

      const qty = Number(restockQuantity)

      if (qty <= 0) {
        toast.error('Enter a valid quantity.')
        return
      }

      const userProfile = await getCurrentUserProfile()

      if (!userProfile) return

      const remaining = selectedItem.quantity + qty

      if (remaining > MAX_STOCK) {
        const availableSpace = MAX_STOCK - selectedItem.quantity

        toast.error(
          `Cannot restock that amount. You can only add ${availableSpace} more item${
            availableSpace === 1 ? '' : 's'
          }. Maximum stock is ${MAX_STOCK}.`
        )

        return
      }

      // UPDATE INVENTORY
      const { error } = await supabase
        .from('inventory')
        .update({
          quantity: remaining,
        })
        .eq('id', selectedItem.id)

      if (error) {
        console.error('Restock Error:', error)

        if (error.code === '23514') {
          toast.error(`Stock cannot exceed ${MAX_STOCK} items.`)
        } else {
          toast.error(error.message)
        }

        return
      }

      // RECORD TRANSACTION
      const {
        data: transactionData,
        error: transactionError,
      } = await supabase
        .from('inventory_transactions')
        .insert([
          {
            item_name: selectedItem.name,
            action: 'Restocked',
            quantity: qty,
            remaining_stock: remaining,

            old_price: Number(selectedItem.price || 0),
            new_price: Number(selectedItem.price || 0),

            performed_by: userProfile.id,
            performed_by_role: userProfile.role,
          },
        ])
        .select()

      console.log('RESTOCK TRANSACTION:', transactionData)
      console.log('RESTOCK ERROR:', transactionError)

      if (transactionError) {
        console.error(
          'Restock Transaction Error:',
          transactionError
        )
      }

      // NOTIFICATION
      // =====================================================
// ADMIN NOTIFICATION — INVENTORY RESTOCKED
// =====================================================

const { error: notificationError } = await supabase
  .from('notifications')
  .insert([
    {
      type: 'inventory',
      title: 'Item Restocked',
      message: `${selectedItem.name} was restocked by ${
        userProfile.name || userProfile.role
      }.`,
      is_read: false,

      // IMPORTANT:
      // Notification belongs only to the admin
      // who performed the action.
      recipient_id: userProfile.id,

    },
  ])

if (notificationError) {
  console.error(
    '❌ Restock Inventory Notification Error:',
    notificationError
  )
}


      toast.success('Stock restocked successfully!')

      setShowRestockDialog(false)
      setSelectedItem(null)
      setRestockQuantity(1)

      fetchItems()
    } finally {
      setIsRestocking(false)
    }
  }

  function getStatus(item) {
    if (item.quantity === 0)
      return {
        text: 'Out of Stock',
        color: 'bg-red-100 text-red-700',
      }

    if (item.quantity <= item.low_stock_threshold)
      return {
        text: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-700',
      }

    return {
      text: 'In Stock',
      color: 'bg-green-100 text-green-700',
    }
  }

  const lowStockItems = items.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= item.low_stock_threshold
  )

  const outOfStockItems = items.filter(
    (item) => item.quantity === 0
  )

  async function getCurrentUserProfile() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      toast.error('Unable to identify the logged-in user.')
      return null
    }

    const { data: userProfile, error: profileError } =
      await supabase
        .from('users')
        .select('id, name, role')
        .eq('id', user.id)
        .single()

    if (profileError || !userProfile) {
      console.error('User Profile Error:', profileError)
      toast.error('Unable to identify user.')
      return null
    }

    return userProfile
  }

  function handleCancel() {
    setShowForm(false)
    setEditingItem(null)
    setForm(emptyForm)
  }

  const filteredItems = items.filter(
    (item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.category
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-[#151515] text-white border-b border-gray-800 shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Brand */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">

              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-red-700 shadow-lg shadow-red-900/20">
                <FaBoxes className="text-lg sm:text-xl" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-sm sm:text-lg md:text-xl font-bold tracking-wide">
                  Alavaren Auto Electrical
                </h1>

                <p className="truncate text-[10px] sm:text-xs text-gray-400 mt-0.5">
                  Inventory Management
                </p>
              </div>

            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate('/admin')}
              className="group shrink-0 flex items-center gap-2 bg-white text-red-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm hover:bg-red-50 active:scale-95 transition-all shadow-sm"
            >
              <FaArrowLeft className="text-xs sm:text-sm transition-transform group-hover:-translate-x-0.5" />

              <span className="hidden xs:inline sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </button>

          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="p-4 sm:p-6 md:p-8">

        <div className="mx-auto w-full max-w-[1600px]">

          {/* Page Title */}
          <div className="mb-6 sm:mb-8">

            <div className="flex items-center gap-3 mb-2">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <FaWarehouse />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-red-600">
                Inventory
              </h2>
            </div>

            <p className="text-sm sm:text-base text-gray-500">
              Manage parts, stock levels, pricing, and inventory activity.
            </p>

          </div>

          {/* ================= INVENTORY SUMMARY ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">

            {/* Total Items */}
            <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">

              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-orange-50 opacity-60 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">

                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Inventory Items
                  </p>

                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {items.length}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Total items in inventory
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg sm:text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <FaBoxes />
                </div>

              </div>

            </div>

            {/* Low Stock */}
            <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">

              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-yellow-50 opacity-60 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">

                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Low Stock
                  </p>

                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {lowStockItems.length}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Items needing attention
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg sm:text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <FaExclamationTriangle />
                </div>

              </div>

            </div>

            {/* Out of Stock */}
            <div className="group relative overflow-hidden bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 sm:col-span-2 lg:col-span-1">

              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-red-50 opacity-60 transition-transform duration-300 group-hover:scale-125" />

              <div className="relative flex items-center justify-between">

                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Out of Stock
                  </p>

                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {outOfStockItems.length}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Items currently unavailable
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-red-50 text-red-700 flex items-center justify-center text-lg sm:text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <FaTimesCircle />
                </div>

              </div>

            </div>

          </div>

          {/* ================= CONTROLS ================= */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-5 sm:mb-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              <div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-red-600" />

                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">
                    Inventory Items
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Add, update, restock, or use inventory items.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

                {/* Search */}
                <div className="relative w-full sm:w-72">

                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />

                  <input
                    type="text"
                    placeholder="Search item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <FaTimes />
                    </button>
                  )}

                </div>

                {/* Add */}
                <button
                  onClick={() => {
                    setShowForm(true)
                    setEditingItem(null)
                    setForm(emptyForm)
                  }}
                  className="group flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                  <FaPlus className="transition-transform group-hover:rotate-90" />
                  Add New Item
                </button>

              </div>

            </div>

          </div>

          {/* ================= ALERTS ================= */}

          {outOfStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-5 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 shrink-0 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <FaTimesCircle />
                </div>

                <div className="min-w-0">

                  <h3 className="font-bold text-red-700">
                    Out of Stock
                  </h3>

                  <p className="text-xs sm:text-sm text-red-600 mt-1">
                    The following items currently have no stock.
                  </p>

                  <ul className="mt-3 space-y-1">

                    {outOfStockItems.map((item) => (
                      <li
                        key={item.id}
                        className="text-xs sm:text-sm text-red-700 font-medium flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </li>
                    ))}

                  </ul>

                </div>

              </div>

            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 shrink-0 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
                  <FaExclamationTriangle />
                </div>

                <div className="min-w-0">

                  <h3 className="font-bold text-yellow-700">
                    Low Stock Alert
                  </h3>

                  <p className="text-xs sm:text-sm text-yellow-600 mt-1">
                    These items are below their stock threshold.
                  </p>

                  <ul className="mt-3 space-y-1">

                    {lowStockItems.map((item) => (
                      <li
                        key={item.id}
                        className="text-xs sm:text-sm text-yellow-700 font-medium flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />

                        <span className="truncate">
                          {item.name} — {item.quantity} left
                        </span>
                      </li>
                    ))}

                  </ul>

                </div>

              </div>

            </div>
          )}

          {/* ================= ADD / EDIT FORM ================= */}

          {showForm && (
            <form
              onSubmit={handleAdd}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 animate-[fadeIn_.2s_ease-out]"
            >

              <div className="flex items-start gap-3 mb-5 sm:mb-6">

                <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
                  {editingItem ? <FaEdit /> : <FaPlus />}
                </div>

                <div className="min-w-0">

                  <h3 className="font-bold text-lg sm:text-xl text-gray-900">
                    {editingItem
                      ? 'Edit Inventory Item'
                      : 'Add New Inventory Item'}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {editingItem
                      ? 'Update the item information below.'
                      : 'Enter the details for the new inventory item.'}
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

                {(editingItem
                  ? [
                      ['name', 'Item Name'],
                      ['category', 'Category'],
                      ['price', 'Price'],
                      ['low_stock_threshold', 'Low Stock Alert'],
                    ]
                  : [
                      ['name', 'Item Name'],
                      ['category', 'Category'],
                      ['quantity', 'Initial Stock'],
                      ['price', 'Price'],
                      ['low_stock_threshold', 'Low Stock Alert'],
                    ]
                ).map(([field, label]) => (
                  <div key={field}>

                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      {label}
                    </label>

                    <input
                      type={
                        field === 'quantity' ||
                        field === 'price' ||
                        field === 'low_stock_threshold'
                          ? 'number'
                          : 'text'
                      }
                      min={
                        field === 'quantity'
                          ? 0
                          : undefined
                      }
                      max={
                        field === 'quantity'
                          ? MAX_STOCK
                          : undefined
                      }
                      className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-gray-400"
                      placeholder={label}
                      value={form[field]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field]: e.target.value,
                        })
                      }
                    />

                  </div>
                ))}

              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] ${
                    isSaving
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-red-700 hover:bg-red-800 hover:shadow-md text-white'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      {editingItem
                        ? 'Update Item'
                        : 'Save Item'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 active:scale-[0.98] text-white py-3 rounded-lg font-semibold transition-all"
                >
                  <FaTimes />
                  Cancel
                </button>

              </div>

            </form>
          )}

          {/* ================= USE STOCK DIALOG ================= */}

          {showUseDialog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">

              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto">

                <div className="flex items-start gap-3 mb-5">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg shadow-sm">
                    <FaWrench />
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Service / Repair Stock
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Record parts used for a service repair.
                    </p>

                  </div>

                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-4 mb-5">

                  <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-orange-100/50" />

                  <div className="relative">

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCube className="text-orange-500" />
                      Item
                    </div>

                    <p className="font-bold text-gray-900 mt-1 break-words">
                      {selectedItem?.name}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-4">

                      <div>
                        <p className="text-xs text-gray-500">
                          Available Stock
                        </p>

                        <p className="font-bold text-orange-600 text-lg">
                          {selectedItem?.quantity}
                        </p>
                      </div>

                      <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <FaBoxes />
                      </div>

                    </div>

                  </div>

                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Use
                </label>

                <input
                  type="number"
                  min="1"
                  max={selectedItem?.quantity || 1}
                  value={usedQuantity}
                  onChange={(e) =>
                    setUsedQuantity(e.target.value)
                  }
                  className="border border-gray-300 rounded-lg w-full p-3 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />

                <div className="flex flex-col-reverse sm:flex-row gap-3">

                  <button
                    onClick={() =>
                      setShowUseDialog(false)
                    }
                    disabled={isUsingStock}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 active:scale-[0.98] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUseStock}
                    disabled={isUsingStock}
                    className={`flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-lg font-semibold transition-all active:scale-[0.98] ${
                      isUsingStock
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 hover:shadow-md'
                    }`}
                  >
                    {isUsingStock ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaTools />
                        Confirm Use
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ================= RESTOCK DIALOG ================= */}

          {showRestockDialog && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">

              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto">

                <div className="flex items-start gap-3 mb-5">

                  <div className="w-11 h-11 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-lg shadow-sm">
                    <FaBoxes />
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Restock Item
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      Add quantity back into inventory.
                    </p>

                  </div>

                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-4 mb-5">

                  <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-green-100/50" />

                  <div className="relative">

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCube className="text-green-500" />
                      Item
                    </div>

                    <p className="font-bold text-gray-900 mt-1 break-words">
                      {selectedItem?.name}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-4">

                      <div>
                        <p className="text-xs text-gray-500">
                          Current Stock
                        </p>

                        <p className="font-bold text-green-600 text-lg">
                          {selectedItem?.quantity} / {MAX_STOCK}
                        </p>

                        <p className="text-[11px] text-gray-500 mt-1">
                          Maximum stock: {MAX_STOCK}
                        </p>
                      </div>

                      <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <FaWarehouse />
                      </div>

                    </div>

                  </div>

                </div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Restock
                </label>

                <input
                  type="number"
                  min="1"
                  max={
                    selectedItem
                      ? MAX_STOCK -
                        selectedItem.quantity
                      : MAX_STOCK
                  }
                  value={restockQuantity}
                  onChange={(e) =>
                    setRestockQuantity(e.target.value)
                  }
                  className="border border-gray-300 rounded-lg w-full p-3 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />

                {selectedItem && (
                  <p className="text-xs sm:text-sm text-gray-500 mb-5">
                    You can add up to{' '}
                    <span className="font-bold text-green-600">
                      {Math.max(
                        0,
                        MAX_STOCK -
                          selectedItem.quantity
                      )}
                    </span>{' '}
                    more item(s).
                  </p>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3">

                  <button
                    onClick={() =>
                      setShowRestockDialog(false)
                    }
                    disabled={isRestocking}
                    className="flex-1 bg-gray-700 hover:bg-gray-800 active:scale-[0.98] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleRestock}
                    disabled={isRestocking}
                    className={`flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-lg font-semibold transition-all active:scale-[0.98] ${
                      isRestocking
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
                    }`}
                  >
                    {isRestocking ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaBoxes />
                        Confirm Restock
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>
          )}

          {/* ================= INVENTORY LIST ================= */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Table Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <div className="flex items-center gap-2">

                    <FaBoxes className="text-red-600" />

                    <h3 className="font-bold text-lg sm:text-xl text-gray-900">
                      Inventory List
                    </h3>

                  </div>

                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    View and manage all inventory items.
                  </p>
                </div>

                <span className="self-start sm:self-auto bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                  {filteredItems.length} Items
                </span>

              </div>

            </div>

            {/* ================= MOBILE CARDS ================= */}
            <div className="block md:hidden">

              {filteredItems.length === 0 ? (

                <div className="p-10 text-center">

                  <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl">
                    <FaBoxOpen />
                  </div>

                  <p className="font-semibold text-gray-700">
                    {items.length === 0
                      ? 'No inventory items yet'
                      : 'No matching items'}
                  </p>

                  <p className="text-sm text-gray-400 mt-1">
                    {items.length === 0
                      ? 'Add your first inventory item to get started.'
                      : 'Try changing your search.'}
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-gray-100">

                  {filteredItems.map((item) => {

                    const status = getStatus(item)

                    return (
                      <div
                        key={item.id}
                        className={`p-4 transition-colors ${
                          item.quantity === 0
                            ? 'bg-red-50/40'
                            : item.quantity <=
                              item.low_stock_threshold
                            ? 'bg-yellow-50/40'
                            : 'bg-white'
                        }`}
                      >

                        {/* Card Top */}
                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-start gap-3 min-w-0">

                            <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                              <FaCube />
                            </div>

                            <div className="min-w-0">

                              <h4 className="font-bold text-gray-900 truncate">
                                {item.name}
                              </h4>

                              <span className="inline-flex mt-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                                {item.category}
                              </span>

                            </div>

                          </div>

                          <span
                            className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${status.color}`}
                          >
                            {status.text}
                          </span>

                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mt-4">

                          <div className="rounded-xl bg-white/80 border border-gray-200 p-3">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                              Quantity
                            </p>

                            <p className="font-bold text-gray-900 mt-1">
                              {item.quantity}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white/80 border border-gray-200 p-3">
                            <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                              Price
                            </p>

                            <p className="font-bold text-gray-900 mt-1">
                              ₱
                              {Number(
                                item.price
                              ).toLocaleString()}
                            </p>
                          </div>

                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 mt-3">

                          <button
                            onClick={() => {
                              setEditingItem(item)

                              setForm({
                                name: item.name || '',
                                category:
                                  item.category || '',
                                quantity:
                                  item.quantity || '',
                                price:
                                  item.price || '',
                                low_stock_threshold:
                                  item.low_stock_threshold ||
                                  '',
                              })

                              setShowForm(true)
                            }}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setUsedQuantity(1)
                              setShowUseDialog(true)
                            }}
                            className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                          >
                            <FaTools />
                            Use
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setRestockQuantity(1)
                              setShowRestockDialog(true)
                            }}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                          >
                            <FaBoxes />
                            Restock
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white px-3 py-2.5 rounded-lg font-semibold text-xs transition-all"
                          >
                            <FaTrash />
                            Delete
                          </button>

                        </div>

                      </div>
                    )
                  })}

                </div>

              )}

            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead className="bg-[#151515] text-white">

                  <tr>
                    {[
                      'Name',
                      'Category',
                      'Quantity',
                      'Price',
                      'Status',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="p-4 text-left text-sm font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>

                </thead>

                <tbody>

                  {filteredItems.length === 0 ? (

                    <tr>
                      <td
                        colSpan="6"
                        className="p-12 text-center"
                      >

                        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center text-2xl">
                          <FaBoxOpen />
                        </div>

                        <p className="font-semibold text-gray-700">
                          {items.length === 0
                            ? 'No inventory items yet'
                            : 'No matching items'}
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          {items.length === 0
                            ? 'Add your first inventory item to get started.'
                            : 'Try changing your search.'}
                        </p>

                      </td>
                    </tr>

                  ) : (

                    filteredItems.map((item) => {

                      const status = getStatus(item)

                      return (
                        <tr
                          key={item.id}
                          className={`border-t border-gray-200 transition-all duration-200 hover:bg-gray-50 ${
                            item.quantity === 0
                              ? 'bg-red-50/40'
                              : item.quantity <=
                                item.low_stock_threshold
                              ? 'bg-yellow-50/40'
                              : ''
                          }`}
                        >

                          {/* Name */}
                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                                <FaCube />
                              </div>

                              <div className="font-bold text-gray-900">
                                {item.name}
                              </div>

                            </div>

                          </td>

                          {/* Category */}
                          <td className="p-4">

                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                              {item.category}
                            </span>

                          </td>

                          {/* Quantity */}
                          <td className="p-4">

                            <span className="font-bold text-gray-900">
                              {item.quantity}
                            </span>

                          </td>

                          {/* Price */}
                          <td className="p-4">

                            <span className="font-semibold text-gray-800">
                              ₱
                              {Number(
                                item.price
                              ).toLocaleString()}
                            </span>

                          </td>

                          {/* Status */}
                          <td className="p-4">

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}
                            >
                              {item.quantity === 0 ? (
                                <FaTimesCircle />
                              ) : item.quantity <=
                                item.low_stock_threshold ? (
                                <FaExclamationTriangle />
                              ) : (
                                <FaCheckCircle />
                              )}

                              {status.text}
                            </span>

                          </td>

                          {/* Actions */}
                          <td className="p-4">

                            <div className="flex gap-2 flex-wrap">

                              <button
                                onClick={() => {
                                  setEditingItem(item)

                                  setForm({
                                    name:
                                      item.name || '',
                                    category:
                                      item.category || '',
                                    quantity:
                                      item.quantity || '',
                                    price:
                                      item.price || '',
                                    low_stock_threshold:
                                      item.low_stock_threshold ||
                                      '',
                                  })

                                  setShowForm(true)
                                }}
                                title="Edit item"
                                className="group flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                              >
                                <FaEdit className="transition-transform group-hover:scale-110" />
                                Edit
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setUsedQuantity(1)
                                  setShowUseDialog(true)
                                }}
                                title="Use stock for service repair"
                                className="group flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                              >
                                <FaTools className="transition-transform group-hover:rotate-12" />
                                Use
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedItem(item)
                                  setRestockQuantity(1)
                                  setShowRestockDialog(true)
                                }}
                                title="Restock item"
                                className="group flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                              >
                                <FaBoxes className="transition-transform group-hover:scale-110" />
                                Restock
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    item.id
                                  )
                                }
                                title="Delete item"
                                className="group flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-sm transition-all"
                              >
                                <FaTrash className="transition-transform group-hover:scale-110" />
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    })

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

      {/* Small responsive animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 639px) {
          input,
          button {
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  )
}
