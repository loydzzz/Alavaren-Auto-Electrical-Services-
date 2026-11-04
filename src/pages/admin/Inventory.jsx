import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useLocation } from 'react-router-dom'
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
  FaImage,
  FaCamera,
  FaEye,
  FaTrashAlt,
} from 'react-icons/fa'

const BUCKET = 'inventory-images'

// Shrinks big phone photos before upload (faster + saves storage)
async function compressImage(file, maxSize = 800) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          resolve(blob || file)
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}

async function uploadItemImage(file) {
  const blob = await compressImage(file)
  const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return { image_url: data.publicUrl, image_path: path }
}

async function removeItemImage(path) {
  if (!path) return

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .remove([path])

  console.log('Storage remove:', { path, data, error })

  if (error) {
    toast.error('Image delete error: ' + error.message)
    return
  }

  if (!data || data.length === 0) {
    toast.error('Photo was not deleted from storage (check policies).')
  }
}

function getPathFromUrl(url) {
  return url ? url.split(`/${BUCKET}/`)[1] : null
}

// Thumbnail with placeholder icon when there's no photo
function ItemThumb({ item, onView }) {
  const overlay = (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <FaEye className="text-xl sm:text-2xl" />
      <span className="text-[11px] sm:text-xs font-semibold">View</span>
    </div>
  )

  if (item.image_url) {
    return (
      <div className="w-24 sm:w-32 shrink-0">
        <div
          onClick={() => onView(item.image_url)}
          title="View details"
          className="group relative inline-block max-w-full cursor-pointer"
        >
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="block h-auto w-auto max-h-24 sm:max-h-32 max-w-full rounded-xl border border-gray-200"
          />
          {overlay}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => onView(item.image_url)}
      title="View details"
      className="group relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 cursor-pointer rounded-xl border border-gray-200 bg-gray-100 text-gray-400 flex items-center justify-center text-2xl"
    >
      <FaCube />
      {overlay}
    </div>
  )
}

// Highlight colors, matching the admin notification colors
const highlightStyles = {
  rejected: 'bg-red-100 ring-red-500',        // Out of Stock
  lowstock: 'bg-yellow-100 ring-yellow-500',  // Low Stock Alert
  cancelled: 'bg-orange-100 ring-orange-500', // Stock Used
  approved: 'bg-green-100 ring-green-500',    // Restocked
  updated: 'bg-blue-100 ring-blue-500',       // Updated
  newitem: 'bg-purple-100 ring-purple-500',   // New item
}

export default function Inventory() {
    const navigate = useNavigate()
  const location = useLocation()
    const [highlightId, setHighlightId] = useState(null)
  const [highlightStatus, setHighlightStatus] = useState(null)

  const MAX_STOCK = 100


    const emptyForm = {
    name: '',
    category: '',
    quantity: '',
    price: '',
    low_stock_threshold: '',
    description: '',
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

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [viewImage, setViewImage] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')





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
            if (Number(form.low_stock_threshold || 0) < 0) {
        toast.error('Low Stock Alert cannot be below 0.')
        return
      }
            if (Number(form.price || 0) < 0) {
        toast.error('Price cannot be below 0.')
        return
      }

      if (!editingItem && initialQuantity > MAX_STOCK) {
        toast.error(`Stock cannot exceed ${MAX_STOCK} items.`)
        return
      }

      // Upload image first (optional)
let imageData = {}

if (imageFile) {
  try {
    imageData = await uploadItemImage(imageFile)
  } catch (err) {
    toast.error('Image upload failed: ' + err.message)
    return
  }
}

const newItem = {
  name: form.name,
  category: form.category,
  quantity: initialQuantity,
  price: Number(form.price || 0),
  low_stock_threshold: Number(form.low_stock_threshold || 0),
  description: form.description.trim() || null,
  ...imageData,
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
                const updates = {
  name: form.name,
  category: form.category,
  price: Number(form.price),
  low_stock_threshold: Number(form.low_stock_threshold),
  description: form.description.trim() || null,
}

if (imageFile) {
  updates.image_url = imageData.image_url
  updates.image_path = imageData.image_path
} else if (removeImage) {
  updates.image_url = null
  updates.image_path = null
}

const { error } = await supabase
  .from('inventory')
  .update(updates)
  .eq('id', editingItem.id)

if (error) {
  console.error('Update Error:', error)
  toast.error(error.message)
  await removeItemImage(imageData.image_path) // clean up the new upload
  return
}

// Delete the OLD image file if it was replaced or removed
if ((imageFile || removeImage) && editingItem.image_path) {
  await removeItemImage(editingItem.image_path)
}

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
      inventory_id: editingItem.id,
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
  await removeItemImage(imageData.image_path) // <-- ADD THIS LINE

  console.error('Add Error:', error)

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

// Delete the photo from storage too
await removeItemImage(
  deletedItem.image_path || getPathFromUrl(deletedItem.image_url)
)

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
                        inventory_id: selectedItem.id,
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





      // =====================================================
      // ADMIN NOTIFICATION — STOCK USED / LOW STOCK / OUT OF STOCK
      // (only ONE notification is sent, based on what is left)
      // =====================================================

      const isOutOfStock = remaining === 0
      const isLowStock =
        remaining > 0 && remaining <= selectedItem.low_stock_threshold

      const who = userProfile.name || userProfile.role

      let notifTitle = 'Stock Used'
      let notifMessage = `${qty} unit${qty === 1 ? '' : 's'} of ${
        selectedItem.name
      } used by ${who}. Stock updated from ${selectedItem.quantity} to ${remaining}.`

      if (isOutOfStock) {
        notifTitle = 'Out of Stock'
        notifMessage = `${selectedItem.name} is now out of stock. The last ${qty} unit${
          qty === 1 ? '' : 's'
        } was used by ${who}.`
      } else if (isLowStock) {
        notifTitle = 'Low Stock Alert'
        notifMessage = `${selectedItem.name} is running low (${remaining} left). ${qty} unit${
          qty === 1 ? '' : 's'
        } used by ${who}.`
      }

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([
          {
            type: 'inventory',
            title: notifTitle,
            inventory_id: selectedItem.id,
            message: notifMessage,
            is_read: false,
            recipient_id: userProfile.id,
          },
        ])

      if (notificationError) {
        console.error(
          '❌ Use Stock Notification Error:',
          notificationError
        )
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
                        inventory_id: selectedItem.id,
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
      inventory_id: selectedItem.id,
      message: `${qty} unit${qty === 1 ? '' : 's'} of ${
        selectedItem.name
      } added by ${
        userProfile.name || userProfile.role
      }. Stock updated from ${selectedItem.quantity} to ${remaining}.`,

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
        bar: 'bg-red-500',
        Icon: FaTimesCircle,
      }

    if (item.quantity <= item.low_stock_threshold)
      return {
        text: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-700',
        bar: 'bg-yellow-500',
        Icon: FaExclamationTriangle,
      }

    return {
      text: 'In Stock',
      color: 'bg-green-100 text-green-700',
      bar: 'bg-green-500',
      Icon: FaCheckCircle,
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

  function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    toast.error('Please choose an image file.')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    toast.error('Image must be under 10MB.')
    return
  }

  setImageFile(file)
  setImagePreview(URL.createObjectURL(file))
  setRemoveImage(false)
}

function handleRemoveImage() {
  setImageFile(null)
  setImagePreview(null)
  setRemoveImage(true)
}

function openEdit(item) {
  setEditingItem(item)
    setForm({
    name: item.name || '',
    category: item.category || '',
    quantity: item.quantity || '',
    price: item.price || '',
    low_stock_threshold: item.low_stock_threshold || '',
    description: item.description || '',
  })
  setImageFile(null)
  setImagePreview(item.image_url || null)
  setRemoveImage(false)
  setShowForm(true)
}

function handleCancel() {
  setShowForm(false)
  setEditingItem(null)
  setForm(emptyForm)
  setImageFile(null)
  setImagePreview(null)
  setRemoveImage(false)
}
  const formTheme = editingItem
    ? {
        icon: 'bg-blue-50 text-blue-600',
        border: 'border-t-blue-600',
        ring: 'focus:border-blue-500 focus:ring-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700',
      }
    : {
        icon: 'bg-purple-50 text-purple-600',
        border: 'border-t-purple-600',
        ring: 'focus:border-purple-500 focus:ring-purple-500',
        button: 'bg-purple-600 hover:bg-purple-700',
      }

    const viewStatus = viewItem ? getStatus(viewItem) : null

  const viewStockPercent = viewItem
    ? Math.min(100, Math.round((viewItem.quantity / MAX_STOCK) * 100))
    : 0

  const inStockCount =
    items.length - lowStockItems.length - outOfStockItems.length

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())

    const isOut = item.quantity === 0
    const isLow =
      item.quantity > 0 && item.quantity <= item.low_stock_threshold

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'out' && isOut) ||
      (statusFilter === 'low' && isLow) ||
      (statusFilter === 'in' && !isOut && !isLow)

    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    const id = location.state?.inventoryId
    if (!id || items.length === 0) return

    // make sure search/filter can't hide the item
    setSearch('')
    setStatusFilter('all')
       setHighlightId(id)
    setHighlightStatus(location.state?.highlightStatus || null)

    setTimeout(() => {
      document
        .getElementById(`inventory-item-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 200)

    setTimeout(() => setHighlightId(null), 3500)

    // clear the state so a page refresh doesn't highlight again
    navigate(location.pathname, { replace: true, state: null })
  }, [items, location.state])

    useEffect(() => {
    const isModalOpen = showUseDialog || showRestockDialog || viewItem

    if (!isModalOpen) return

    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [showUseDialog, showRestockDialog, viewItem])

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
  setImageFile(null)
  setImagePreview(null)
  setRemoveImage(false)
}}
                  className="group flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                  <FaPlus className="transition-transform group-hover:rotate-90" />
                  Add New Item
                </button>

              </div>

            </div>

          </div>

                    {/* ================= FILTER CHIPS ================= */}

          <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
            {[
              {
                key: 'all',
                label: 'All',
                count: items.length,
                dot: 'bg-gray-400',
                active: 'border-gray-900 bg-gray-900 text-white',
              },
              {
                key: 'in',
                label: 'In Stock',
                count: inStockCount,
                dot: 'bg-green-500',
                active: 'border-green-600 bg-green-600 text-white',
              },
              {
                key: 'low',
                label: 'Low Stock',
                count: lowStockItems.length,
                dot: 'bg-yellow-500',
                active: 'border-yellow-500 bg-yellow-500 text-white',
              },
              {
                key: 'out',
                label: 'Out of Stock',
                count: outOfStockItems.length,
                dot: 'bg-red-500',
                active: 'border-red-600 bg-red-600 text-white',
              },
            ].map((chip) => {
              const isActive = statusFilter === chip.key

              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setStatusFilter(chip.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
                    isActive
                      ? `${chip.active} shadow-sm`
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {!isActive && (
                    <span className={`h-2 w-2 rounded-full ${chip.dot}`} />
                  )}

                  {chip.label}

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              )
            })}
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
              className={`bg-white rounded-2xl shadow-lg border border-gray-200 border-t-4 ${formTheme.border} p-4 sm:p-6 mb-6 animate-[fadeIn_.2s_ease-out]`}
            >

              <div className="flex items-start gap-3 mb-5 sm:mb-6">

                                <div className={`w-10 h-10 shrink-0 rounded-xl ${formTheme.icon} flex items-center justify-center`}>
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

              

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">

                {/* Photo (left side) */}
                <div className="sm:w-40 shrink-0">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Photo <span className="font-normal text-gray-400">(optional)</span>
                  </label>

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto block h-auto w-auto max-h-40 max-w-full rounded-xl border border-gray-200"
                      />
                  ) : (
                    <div className="mx-auto h-32 w-32 sm:h-40 sm:w-40 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center text-3xl">                      <FaImage />
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition">
                      <FaCamera />
                      {imagePreview ? 'Change' : 'Add Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>

                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        <FaTrash />
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields (right side) */}
                <div className="flex-1 min-w-0">

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
                        field === 'quantity' ||
                        field === 'price' ||
                        field === 'low_stock_threshold'
                          ? 0
                          : undefined
                      }
                      max={
                        field === 'quantity'
                          ? MAX_STOCK
                          : undefined
                      }
                      className={`w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${formTheme.ring} transition-all hover:border-gray-400`}
                      placeholder={label}
                                            onKeyDown={(e) => {
                        const isNumberField =
                          field === 'quantity' ||
                          field === 'price' ||
                          field === 'low_stock_threshold'

                        if (
                          isNumberField &&
                          ['-', '+', 'e', 'E'].includes(e.key)
                        ) {
                          e.preventDefault()
                        }
                      }}
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

              {/* Optional Description */}
<div className="mt-4 sm:mt-5">
  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
    Description <span className="font-normal text-gray-400">(optional)</span>
  </label>

  <textarea
    rows={3}
    maxLength={200}
        className={`w-full border border-gray-300 p-3 rounded-lg text-sm focus:outline-none focus:ring-2 ${formTheme.ring} transition-all hover:border-gray-400 resize-none`}
    placeholder="Example: Fits Toyota Vios 2014-2020"
    value={form.description}
    onChange={(e) =>
      setForm({ ...form, description: e.target.value })
    }
  />

  <p className="text-[11px] text-gray-400 mt-1 text-right">
    {form.description.length}/200
  </p>
</div>
                </div>
              </div>

              
              <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">

                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] ${
                    isSaving
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : `${formTheme.button} hover:shadow-md text-white`
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
<div className="fixed inset-0 z-[9999] flex items-center justify-center overscroll-contain bg-slate-950/70 px-3 py-4 sm:px-4">
              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-md max-h-[95vh] overflow-y-auto">

                <div className="flex items-start gap-3 mb-5">

                                    <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg shadow-sm">
                    <FaTools />
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

                  <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-orange-100/50" />

<div className="absolute right-2 top-2 h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
  <FaBoxOpen />
</div>

<div className="relative">

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCube className="text-orange-500" />
                      Item
                    </div>

                    <p className="font-bold text-gray-900 mt-1 break-words">
                      {selectedItem?.name}
                    </p>

                    <div className="mt-4">
  <p className="text-xs text-gray-500">Available Stock</p>

  <p className="font-bold text-orange-600 text-lg">
    {selectedItem?.quantity}
    <span className="text-xs font-semibold text-gray-400">
      /{MAX_STOCK}
    </span>
  </p>

  {selectedItem && (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${getStatus(selectedItem).bar}`}
        style={{
          width: `${
            selectedItem.quantity > 0
              ? Math.max(
                  Math.min(
                    100,
                    Math.round((selectedItem.quantity / MAX_STOCK) * 100)
                  ),
                  3
                )
              : 0
          }%`,
        }}
      />
    </div>
  )}
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
            <div className="fixed inset-0 z-[9999] flex items-center justify-center overscroll-contain bg-slate-950/70 px-3 py-4 sm:px-4">

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

<div className="absolute right-2 top-2 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
  <FaWarehouse />
</div>

<div className="relative">

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaCube className="text-green-500" />
                      Item
                    </div>

                    <p className="font-bold text-gray-900 mt-1 break-words">
                      {selectedItem?.name}
                    </p>




                    <div className="mt-4">
  <p className="text-xs text-gray-500">Current Stock</p>

  <div className="flex items-end justify-between gap-3">
  <p className="font-bold text-green-600 text-lg">
    {selectedItem?.quantity}
    <span className="text-xs font-semibold text-gray-400">
      /{MAX_STOCK}
    </span>
  </p>

  <p className="text-[11px] text-gray-500 pb-1">
    Maximum stock: {MAX_STOCK}
  </p>
</div>

  {selectedItem && (
    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${getStatus(selectedItem).bar}`}
        style={{
          width: `${
            selectedItem.quantity > 0
              ? Math.max(
                  Math.min(
                    100,
                    Math.round((selectedItem.quantity / MAX_STOCK) * 100)
                  ),
                  3
                )
              : 0
          }%`,
        }}
      />
    </div>
  )}
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
        const stockPercent = Math.min(
        100,
        Math.round((item.quantity / MAX_STOCK) * 100)
      )

      return (
        <div
                    key={item.id}
          id={`inventory-item-${item.id}`}
          className={`p-4 sm:p-5 transition-colors hover:bg-gray-50 ${
                        highlightId === item.id
              ? `${highlightStyles[highlightStatus] || highlightStyles.rejected} ring-2 ring-inset animate-pulse`
              : item.quantity === 0
              ? 'bg-red-50/40'

              : item.quantity <= item.low_stock_threshold
              ? 'bg-yellow-50/40'
              : 'bg-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            <div className="flex items-start gap-4 flex-1 min-w-0">

              <ItemThumb
                item={item}
                onView={() => setViewItem(item)}
              />

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate min-w-0">
                    {item.name}
                  </h4>

                                    <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${status.color}`}
                  >
                    <status.Icon className="text-[10px] sm:text-xs" />
                    {status.text}
                  </span>
                                  
                </div>

                {item.category && (
                  <span className="inline-flex mt-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                    {item.category}
                  </span>
                )}

                <div className="flex items-start gap-6 mt-3">
  <div className="w-24 sm:w-28">
    <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
      Stock
    </p>

    <p className="font-bold text-gray-900">
      {item.quantity}
      <span className="text-xs font-semibold text-gray-400">
        /{MAX_STOCK}
      </span>
    </p>

    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
        style={{
          width: `${
            item.quantity > 0 ? Math.max(stockPercent, 3) : 0
          }%`,
        }}
      />
    </div>
  </div>

  <div>
    <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
      Price
    </p>
    <p className="font-bold text-gray-900">
      ₱{Number(item.price).toLocaleString()}
    </p>
  </div>
</div>
              </div>
            </div>


            <div className="flex flex-col sm:items-end gap-3">

              

            <div className="grid grid-cols-4 sm:flex gap-2">

                <button
                  onClick={() => openEdit(item)}
                  className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all"
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
                  className="flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all"
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
                  className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all"
                >
                  <FaBoxes />
                  Restock
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all"
                >
                  <FaTrashAlt />
                  Delete
                </button>

              </div>
            </div>

          </div>
        </div>
      )
    })}
  </div>
)}
          </div>

        </div>

      </main>
                  {viewItem && (
        <div
          onClick={() => setViewItem(null)}
          className="fixed inset-0 z-[9998] flex items-center justify-center overscroll-contain bg-slate-950/70 px-3 py-4 sm:px-4"        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col md:flex-row w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >

            {/* ===== LEFT SIDE: photo ===== */}
            <div className="md:w-[42%] shrink-0 p-3 md:p-4">
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl bg-gray-100 p-4">
                {viewItem.image_url ? (
                  <img
                    src={viewItem.image_url}
                    alt={viewItem.name}
                    onClick={() => setViewImage(viewItem.image_url)}
                    className="block h-auto w-auto max-h-[40vh] md:max-h-[70vh] max-w-full cursor-pointer rounded-xl hover:opacity-90 transition"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-200 text-4xl text-gray-400">
                    <FaCube />
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT SIDE: details ===== */}
            <div className="flex-1 min-w-0 overflow-y-auto overscroll-contain p-5 md:p-6">

              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Item Details
                </h2>

                <button
                  onClick={() => setViewItem(null)}
                  className="shrink-0 text-gray-400 hover:text-gray-700 text-xl"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Name + status */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-900 break-words min-w-0">
                  {viewItem.name}
                </h3>

                                <span
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${viewStatus.color}`}
                >
                  <viewStatus.Icon className="text-xs" />
                  {viewStatus.text}
                </span>
              </div>

              {viewItem.category && (
                <span className="inline-flex mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {viewItem.category}
                </span>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mt-5">

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                    Stock
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {viewItem.quantity}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                    Price
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    ₱{Number(viewItem.price || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                    Low Stock Alert
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {viewItem.low_stock_threshold}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                    Stock Value
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    ₱
                    {(
                      Number(viewItem.quantity || 0) *
                      Number(viewItem.price || 0)
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

                            {/* Stock level bar */}
              <div className="mt-4 rounded-xl border border-gray-200 p-3">

                <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Stock level</span>
                  <span>
                    {viewItem.quantity}/{MAX_STOCK}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${viewStatus.bar}`}
                    style={{
                      width: `${
                        viewItem.quantity > 0
                          ? Math.max(viewStockPercent, 3)
                          : 0
                      }%`,
                    }}
                  />
                </div>

              </div>

              {/* Description (only if there is one) */}
              {viewItem.description && (
                <div className="mt-4 rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                    {viewItem.description}
                  </p>
                </div>
              )}

              {/* Date added */}
              {viewItem.created_at && (
                <p className="text-xs text-gray-400 mt-4">
                  Added on{' '}
                  {new Date(viewItem.created_at).toLocaleDateString(
                    'en-PH',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Manila',
                    }
                  )}
                  {' at '}
                  {new Date(viewItem.created_at).toLocaleTimeString(
                    'en-PH',
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      timeZone: 'Asia/Manila',
                    }
                  )}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5">
                <button
                  onClick={() => setViewItem(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 active:scale-[0.98] text-white py-3 rounded-lg font-semibold transition-all"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const itemToEdit = viewItem
                    setViewItem(null)
                    openEdit(itemToEdit)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-3 rounded-lg font-semibold transition-all"
                >
                  <FaEdit />
                  Edit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {viewImage && (
  <div
    onClick={() => setViewImage(null)}
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
  >
    <button
      className="absolute top-4 right-4 text-white text-2xl"
      onClick={() => setViewImage(null)}
    >
      <FaTimes />
    </button>
    <img
      src={viewImage}
      alt="Item"
      className="max-h-[90vh] max-w-full rounded-xl object-contain"
    />
  </div>
)}

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
