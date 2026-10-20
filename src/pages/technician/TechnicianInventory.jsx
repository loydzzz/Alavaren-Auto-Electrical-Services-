import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaSearch,
  FaWarehouse,
  FaTools,
  FaTag,
  FaChevronRight,
  FaCircle,
} from 'react-icons/fa'

export default function TechnicianInventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

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
      }
    }

    if (item.quantity <= item.low_stock_threshold) {
      return {
        text: 'Low Stock',
        color: 'bg-yellow-50 text-yellow-700 border-yellow-100',
        dot: 'bg-yellow-500',
      }
    }

    return {
      text: 'In Stock',
      color: 'bg-green-50 text-green-700 border-green-100',
      dot: 'bg-green-500',
    }
  }

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockItems = items.filter(
    item =>
      item.quantity > 0 &&
      item.quantity <= item.low_stock_threshold
  )

  const outOfStockItems = items.filter(
    item => item.quantity === 0
  )

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


        {/* ================= ALERTS ================= */}

        {outOfStockItems.length > 0 && (

          <div className="mb-4 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white shadow-sm sm:mb-5">

            <div className="p-4 sm:p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 ring-1 ring-red-200">

                  <FaExclamationTriangle />

                </div>

                <div className="min-w-0">

                  <h3 className="font-bold text-red-800">
                    Out of Stock
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-red-600 sm:text-sm">
                    Some inventory items are currently unavailable.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {outOfStockItems.map(item => (

                      <span
                        key={item.id}
                        className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm"
                      >
                        <FaCircle className="text-[5px]" />
                        <span className="truncate">
                          {item.name}
                        </span>
                      </span>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}


        {lowStockItems.length > 0 && (

          <div className="mb-6 overflow-hidden rounded-2xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-white shadow-sm">

            <div className="p-4 sm:p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200">

                  <FaExclamationTriangle />

                </div>

                <div>

                  <h3 className="font-bold text-yellow-800">
                    Low Stock Alert
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-yellow-700 sm:text-sm">
                    These items are running low and may need attention soon.
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}


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


          {/* ================= DESKTOP TABLE ================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead className="bg-[#151515] text-white">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Available
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="p-14 text-center"
                    >

                      <div className="mx-auto flex h-11 w-11 animate-pulse items-center justify-center rounded-xl bg-red-50 text-red-600">

                        <FaBoxOpen />

                      </div>

                      <p className="mt-3 text-sm font-semibold text-gray-600">
                        Loading inventory...
                      </p>

                    </td>

                  </tr>

                ) : filteredItems.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="p-14 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

                        <FaSearch className="text-lg" />

                      </div>

                      <p className="mt-4 font-bold text-gray-700">
                        No inventory items found
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Try searching for another item.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredItems.map(item => {

                    const status = getStatus(item)

                    return (
                      <tr
                        key={item.id}
                        className={`group border-t border-gray-100 transition-all duration-200 hover:bg-gray-50 ${
                          item.quantity === 0
                            ? 'bg-red-50/30'
                            : item.quantity <= item.low_stock_threshold
                            ? 'bg-yellow-50/30'
                            : ''
                        }`}
                      >

                        {/* NAME */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-red-50 group-hover:text-red-600">

                              <FaBoxOpen />

                            </div>

                            <div className="min-w-0">

                              <div className="font-bold text-gray-900">
                                {item.name}
                              </div>

                              <div className="mt-0.5 text-xs text-gray-400">
                                Inventory item
                              </div>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td className="px-6 py-4">

                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">

                            <FaTag className="text-[10px] text-gray-400" />

                            {item.category || 'Uncategorized'}

                          </span>

                        </td>


                        {/* QUANTITY */}

                        <td className="px-6 py-4">

                          <div>

                            <span className="font-black text-gray-900">
                              {item.quantity}
                            </span>

                            <span className="ml-1 text-xs text-gray-400">
                              units
                            </span>

                          </div>

                        </td>


                        {/* PRICE */}

                        <td className="px-6 py-4">

                          <span className="font-bold text-gray-800">
                            ₱{Number(item.price || 0).toLocaleString()}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.color}`}
                          >

                            <FaCircle className={`text-[6px] ${status.dot}`} />

                            {status.text}

                          </span>

                        </td>

                      </tr>
                    )
                  })

                )}

              </tbody>

            </table>

          </div>


          {/* ================= MOBILE LIST ================= */}

          <div className="md:hidden">

            {loading ? (

              <div className="px-5 py-14 text-center">

                <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-red-50 text-red-600">

                  <FaBoxOpen />

                </div>

                <p className="mt-3 text-sm font-semibold text-gray-600">
                  Loading inventory...
                </p>

              </div>

            ) : filteredItems.length === 0 ? (

              <div className="px-5 py-14 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">

                  <FaSearch />

                </div>

                <p className="mt-4 font-bold text-gray-700">
                  No inventory items found
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Try searching for another item.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-gray-100">

                {filteredItems.map(item => {

                  const status = getStatus(item)

                  return (

                    <div
                      key={item.id}
                      className={`p-4 transition-colors duration-200 active:bg-gray-100 ${
                        item.quantity === 0
                          ? 'bg-red-50/30'
                          : item.quantity <= item.low_stock_threshold
                          ? 'bg-yellow-50/30'
                          : 'bg-white'
                      }`}
                    >

                      {/* TOP ROW */}

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">

                            <FaBoxOpen />

                          </div>

                          <div className="min-w-0">

                            <h4 className="truncate font-bold text-gray-900">
                              {item.name}
                            </h4>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">

                              <FaTag className="text-[9px] text-gray-400" />

                              <span className="truncate">
                                {item.category || 'Uncategorized'}
                              </span>

                            </div>

                          </div>

                        </div>

                        <FaChevronRight className="mt-2 shrink-0 text-xs text-gray-300" />

                      </div>


                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Available
                          </p>

                          <p className="mt-1 text-lg font-black text-gray-900">
                            {item.quantity}
                            <span className="ml-1 text-[10px] font-semibold text-gray-400">
                              units
                            </span>
                          </p>

                        </div>


                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Price
                          </p>

                          <p className="mt-1 text-lg font-black text-gray-900">
                            ₱{Number(item.price || 0).toLocaleString()}
                          </p>

                        </div>

                      </div>


                      {/* STATUS */}

                      <div className="mt-3">

                        <span
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.color}`}
                        >

                          <FaCircle className={`text-[6px] ${status.dot}`} />

                          {status.text}

                        </span>

                      </div>

                    </div>

                  )
                })}

              </div>

            )}

          </div>

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

    </div>
  )
}
