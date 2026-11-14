import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaSearch,
  FaWarehouse,
  FaTools,
  FaCircle,
  FaEye,
  FaCube,
  FaTimes,
} from 'react-icons/fa'

const MAX_STOCK = 100

// Highlights the part of the text that matches the search
function HighlightText({ text, query }) {
  const value = text ?? ''
  const q = query?.trim()

  if (!q) return <>{value}</>

  // escape special characters so searching "(" or "." doesn't break
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = value.split(new RegExp(`(${safe})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-yellow-300 px-0.5 text-gray-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// Photo thumbnail: shows the whole photo, with a hover "View" overlay
function ItemThumb({ item, onView }) {
  const overlay = (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/50 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <FaEye className="text-xl" />
      <span className="text-[11px] font-semibold">View</span>
    </div>
  )

  if (item.image_url) {
    return (
      <div className="w-20 shrink-0 sm:w-28">
        <div
          onClick={onView}
          title="View details"
          className="group relative inline-block max-w-full cursor-pointer"
        >
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="block h-auto w-auto max-h-20 max-w-full rounded-xl border border-gray-200 shadow-sm sm:max-h-28"
          />
          {overlay}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onView}
      title="View details"
      className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-2xl text-gray-400 sm:h-28 sm:w-28"
    >
      <FaCube />
      {overlay}
    </div>
  )
}

export default function TechnicianInventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewItem, setViewItem] = useState(null)
  const [viewImage, setViewImage] = useState(null)
  const [searchHighlightId, setSearchHighlightId] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [])

    useEffect(() => {
    if (!viewItem) return

    const prevBody = document.body.style.overflow
    const prevHtml = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = prevBody
      document.documentElement.style.overflow = prevHtml
    }
  }, [viewItem])

  async function fetchItems() {
    setLoading(true)

    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name')

    if (error) {
      console.error('Inventory Error:', error)
      toast.error('Unable to load inventory.')
      setLoading(false)
      return
    }

    setItems(data || [])
    setLoading(false)
  }

    function getStatus(item) {
    if (item.quantity === 0) {
      return {
        text: 'Out of Stock',
        color: 'bg-red-50 text-red-700 border-red-100',
        dot: 'bg-red-500',
        bar: 'bg-red-500',
      }
    }

    if (item.quantity <= item.low_stock_threshold) {
      return {
        text: 'Low Stock',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        dot: 'bg-yellow-500',
        bar: 'bg-yellow-500',
      }
    }

    return {
      text: 'In Stock',
      color: 'bg-green-50 text-green-700 border-green-100',
      dot: 'bg-green-500',
      bar: 'bg-green-500',
    }
  }

    const filteredItems = items.filter(item => {
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

  // When searching: highlight + scroll to the first matching card
useEffect(() => {
  const q = search.trim()

  if (!q) {
    setSearchHighlightId(null)
    return
  }

  let clearTimer

  // wait until the user stops typing
  const timer = setTimeout(() => {
    const query = q.toLowerCase()

    // best match first: exact name, then starts with, then contains
    const firstMatch =
      filteredItems.find((i) => i.name?.toLowerCase() === query) ||
      filteredItems.find((i) => i.name?.toLowerCase().startsWith(query)) ||
      filteredItems.find((i) => i.name?.toLowerCase().includes(query)) ||
      filteredItems[0]

    if (!firstMatch) {
      setSearchHighlightId(null)
      return
    }

    setSearchHighlightId(firstMatch.id)

    // remove the card highlight after 4 seconds
    clearTimer = setTimeout(() => setSearchHighlightId(null), 4000)

    document
      .getElementById(`inventory-item-${firstMatch.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 400)

  return () => {
    clearTimeout(timer)
    clearTimeout(clearTimer)
  }
}, [search, statusFilter])

  const lowStockItems = items.filter(
    item =>
      item.quantity > 0 &&
      item.quantity <= item.low_stock_threshold
  )

  const outOfStockItems = items.filter(
    item => item.quantity === 0
  )

    const inStockCount =
    items.length - lowStockItems.length - outOfStockItems.length

  const viewStatus = viewItem ? getStatus(viewItem) : null
    const viewStockPercent = viewItem
    ? Math.min(100, Math.round((viewItem.quantity / MAX_STOCK) * 100))
    : 0

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fa] text-gray-900">

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }}
      />

      {/* ================= BACKGROUND ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-red-100/50 blur-3xl" />

        <div className="absolute top-[35%] -left-40 h-96 w-96 rounded-full bg-gray-200/60 blur-3xl" />

        <div className="absolute bottom-0 right-[20%] h-72 w-72 rounded-full bg-red-50/70 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

      </div>


      {/* ================= HEADER ================= */}

      <header className="relative z-10 overflow-hidden bg-[#151515] text-white shadow-xl">

        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#151515] to-red-950/30" />

        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" />

        <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

          <div className="flex items-center justify-between gap-4">

            {/* BRAND */}

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-950/30 ring-1 ring-white/10 sm:h-12 sm:w-12">

                <FaBoxOpen className="text-lg sm:text-xl" />

              </div>

              <div className="min-w-0">

                <h1 className="truncate text-base font-bold tracking-wide sm:text-xl">
                  Alavaren Auto Electrical
                </h1>

                <p className="mt-0.5 truncate text-[11px] text-gray-400 sm:text-xs">
                  Available Inventory
                </p>

              </div>

            </div>


            {/* TECHNICIAN BADGE */}

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 shadow-inner">

              <FaTools className="text-[11px]" />

              Technician View

            </div>

          </div>

        </div>

      </header>


      {/* ================= MAIN CONTENT ================= */}

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">


        {/* ================= PAGE TITLE ================= */}

        <section className="mb-6 sm:mb-8">

          <div className="flex items-start gap-3">

            <div className="mt-1 hidden h-12 w-1 rounded-full bg-gradient-to-b from-red-500 to-red-800 sm:block" />

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Technician Workspace
                </span>

              </div>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                Inventory
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                View available parts, materials, and current stock levels.
              </p>

            </div>

          </div>

        </section>


        {/* ================= SUMMARY ================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">


          {/* TOTAL */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl sm:p-6">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/60 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Inventory Items
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  {items.length}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Available inventory items
                </p>

              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-100">

                <FaWarehouse className="text-lg" />

              </div>

            </div>

            <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-gray-100">

              <div className="h-full w-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />

            </div>

          </div>


          {/* LOW STOCK */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-yellow-200 hover:shadow-xl sm:p-6">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-yellow-100/60 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Low Stock
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  {lowStockItems.length}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Items needing attention
                </p>

              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 shadow-sm ring-1 ring-yellow-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow-100">

                <FaExclamationTriangle className="text-lg" />

              </div>

            </div>

            <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-gray-100">

              <div className="h-full w-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" />

            </div>

          </div>


          {/* OUT OF STOCK */}

          <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl sm:p-6">

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-100/60 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-center justify-between">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Out of Stock
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                  {outOfStockItems.length}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Currently unavailable
                </p>

              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 shadow-sm ring-1 ring-red-100 transition-all duration-300 group-hover:scale-110 group-hover:bg-red-100">

                <FaBoxOpen className="text-lg" />

              </div>

            </div>

            <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-gray-100">

              <div className="h-full w-full rounded-full bg-gradient-to-r from-red-500 to-red-800" />

            </div>

          </div>

        </section>


        {/* ================= SEARCH ================= */}

        <section className="mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md sm:mb-6">

          <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700 ring-1 ring-red-100">

                <FaTools />

              </div>

              <div>

                <h3 className="text-lg font-bold text-gray-950 sm:text-xl">
                  Available Items
                </h3>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Search parts, materials, and available stock.
                </p>

              </div>

            </div>


            {/* SEARCH FIELD */}

            <div className="relative w-full lg:max-w-md">

              <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

              <input
                type="text"
                placeholder="Search item or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium text-gray-800 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  Clear
                </button>
              )}

            </div>

          </div>

        </section>


                {/* ================= FILTER CHIPS ================= */}

<div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
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


        {/* ================= INVENTORY CONTAINER ================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* SECTION HEADER */}

          <div className="border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">

            <div className="flex items-center justify-between gap-3">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">

                  <FaBoxOpen />

                </div>

                <div className="min-w-0">

                  <h3 className="truncate text-lg font-bold text-gray-950 sm:text-xl">
                    Inventory List
                  </h3>

                  <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
                    Read-only inventory information.
                  </p>

                </div>

              </div>

              <span className="shrink-0 rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1.5 text-[10px] font-bold text-orange-700 sm:px-3 sm:text-xs">

                {filteredItems.length} Items

              </span>

            </div>

          </div>


                    {/* ================= INVENTORY LIST ================= */}

          {loading ? (

            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FaBoxOpen />
              </div>

              <p className="mt-3 text-sm font-semibold text-gray-600">
                Loading inventory...
              </p>

            </div>

          ) : filteredItems.length === 0 ? (

            <div className="px-5 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FaSearch className="text-lg" />
              </div>

              <p className="mt-4 font-bold text-gray-700">
                No inventory items found
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Try another search or filter.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {filteredItems.map(item => {

                const status = getStatus(item)

                const stockPercent = Math.min(
                  100,
                  Math.round((item.quantity / MAX_STOCK) * 100)
                )

                return (
                  <div
  key={item.id}
  id={`inventory-item-${item.id}`}
  className={`p-4 transition-colors duration-200 hover:bg-gray-50/80 sm:p-5 ${
    searchHighlightId === item.id
      ? 'bg-red-50 ring-4 ring-inset ring-red-400'
      : item.quantity === 0
      ? 'bg-red-50/30'
      : item.quantity <= item.low_stock_threshold
      ? 'bg-yellow-50/30'
      : 'bg-white'
  }`}
>

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">

                      {/* PHOTO + TEXT */}

                      <div className="flex min-w-0 items-start gap-4 md:flex-1">

                        <ItemThumb
                          item={item}
                          onView={() => setViewItem(item)}
                        />

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">

                            <h4 className="break-words font-bold text-gray-950">
  <HighlightText text={item.name} query={search} />
</h4>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${status.color}`}
                            >
                              <FaCircle className={`text-[5px] ${status.dot}`} />
                              {status.text}
                            </span>

                          </div>

                          {item.category && (
  <span className="inline-flex mt-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
    <HighlightText text={item.category} query={search} />
  </span>
)}

                          

                        </div>

                      </div>

                      {/* AVAILABLE + PRICE + STOCK BAR */}

                      <div className="md:w-60 md:shrink-0">

                        <div className="grid grid-cols-2 gap-4">

  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
      Available
    </p>

    <p className="mt-1 text-xl font-black leading-none text-gray-950">
      {item.quantity}
      <span className="text-[11px] font-semibold text-gray-400">
        /{MAX_STOCK}
      </span>
    </p>

    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
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
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
      Price
    </p>

    <p className="mt-1 text-xl font-black leading-none text-gray-950">
      ₱{Number(item.price || 0).toLocaleString()}
    </p>
  </div>



                        </div>

                      </div>

                    </div>

                  </div>
                )
              })}

            </div>

          )}







        </section>


        {/* ================= FOOTER INFO ================= */}

        <div className="mt-5 flex flex-col gap-2 px-1 text-[11px] text-gray-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Inventory information is read-only for technicians.
          </p>

          <div className="flex items-center gap-1.5">

            <FaTools className="text-gray-300" />

            <span>
              Technician Inventory
            </span>

          </div>

        </div>

      </main>

            {/* ================= DETAILS MODAL ================= */}

      {viewItem && (
        <div
          onClick={() => setViewItem(null)}
          className="fixed inset-0 z-[9998] flex items-center justify-center overscroll-contain bg-slate-950/70 px-3 py-4 sm:px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row"
          >

            {/* LEFT: photo */}
            <div className="shrink-0 p-3 md:w-[42%] md:p-4">
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl bg-gray-100 p-4">
                {viewItem.image_url ? (
                  <img
                    src={viewItem.image_url}
                    alt={viewItem.name}
                    onClick={() => setViewImage(viewItem.image_url)}
                    className="block h-auto w-auto max-h-[40dvh] max-w-full cursor-pointer rounded-xl transition hover:opacity-90 md:max-h-[70vh]"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-gray-200 text-4xl text-gray-400">
                    <FaCube />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: details */}
            <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-5 md:p-6">

              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  Item Details
                </h2>

                <button
                  onClick={() => setViewItem(null)}
                  className="shrink-0 text-xl text-gray-400 hover:text-gray-700"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words text-xl font-black text-gray-950">
                  {viewItem.name}
                </h3>

                <span
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${viewStatus.color}`}
                >
                  <FaCircle className={`text-[6px] ${viewStatus.dot}`} />
                  {viewStatus.text}
                </span>
              </div>

              {viewItem.category && (
  <span className="inline-flex mt-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
    {viewItem.category}
  </span>
)}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Available
                  </p>
                  <p className="mt-1 font-black text-gray-950">
                    {viewItem.quantity} units
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Price
                  </p>
                  <p className="mt-1 font-black text-gray-950">
                    ₱{Number(viewItem.price || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Low Stock Alert
                  </p>
                  <p className="mt-1 font-black text-gray-950">
                    {viewItem.low_stock_threshold}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Stock Value
                  </p>
                  <p className="mt-1 font-black text-gray-950">
                    ₱
                    {(
                      Number(viewItem.quantity || 0) *
                      Number(viewItem.price || 0)
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

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

              {viewItem.description && (
                <div className="mt-4 rounded-xl border border-gray-200 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Description
                  </p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                    {viewItem.description}
                  </p>
                </div>
              )}

              {viewItem.created_at && (
                <p className="mt-4 text-xs text-gray-400">
                  Added on{' '}
                  {new Date(viewItem.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'Asia/Manila',
                  })}
                  {' at '}
                  {new Date(viewItem.created_at).toLocaleTimeString('en-PH', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila',
                  })}
                </p>
              )}

              <button
                onClick={() => setViewItem(null)}
                className="mt-5 w-full rounded-lg bg-gray-900 py-3 font-semibold text-white transition-all hover:bg-black active:scale-[0.98]"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ================= FULL-SIZE PHOTO ================= */}

      {viewImage && (
        <div
          onClick={() => setViewImage(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
        >
          <button
            className="absolute right-4 top-4 text-2xl text-white"
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

    </div>
  )
}
