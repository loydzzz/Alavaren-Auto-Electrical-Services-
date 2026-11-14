import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import {
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Info,
  X,
  ChevronRight,
  CalendarDays,
  FileText,
  Trash2,
} from "lucide-react"

export default function AccountStatusCard() {
  const [status, setStatus] = useState("healthy")
  const [warningCount, setWarningCount] = useState(0)
  const [reason, setReason] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [removingAction, setRemovingAction] = useState(false)
  const [bannedAt, setBannedAt] = useState(null)
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  // =========================================================
  // FETCH CUSTOMER ACCOUNT STATUS
  // =========================================================

  const fetchAccountStatus = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")

    try {
      // -------------------------------------------------------
      // GET CURRENTLY AUTHENTICATED CUSTOMER
      // -------------------------------------------------------

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error(
          "Account Status Auth Error:",
          authError
        )

        setError("Unable to verify your account.")
        return
      }

      if (!user) {
        setError("No authenticated customer found.")
        return
      }

      // -------------------------------------------------------
      // GET ACCOUNT MODERATION STATUS
      // -------------------------------------------------------

      const {
        data: moderationData,
        error: moderationError,
      } = await supabase
        .from("account_moderations")
        .select(`
          id,
          user_id,
          status,
          warning_count,
          reason,
          banned_at,
          created_at,
          updated_at
        `)
        .eq("user_id", user.id)
        .maybeSingle()

      if (moderationError) {
        console.error(
          "Account Moderation Fetch Error:",
          moderationError
        )

        setError("Unable to load account status.")
        return
      }

      // -------------------------------------------------------
      // NO MODERATION RECORD = HEALTHY
      // -------------------------------------------------------

      if (!moderationData) {
        setStatus("healthy")
        setWarningCount(0)
        setReason("")
        setBannedAt(null)
      } else {
        setStatus(
          moderationData.status || "healthy"
        )

        setWarningCount(
          moderationData.warning_count || 0
        )

        setReason(
          moderationData.reason || ""
        )

        setBannedAt(
          moderationData.banned_at || null
        )
      }

      // -------------------------------------------------------
      // GET ALL MODERATION HISTORY
      // IMPORTANT:
      // No .limit(10)
      // -------------------------------------------------------

      const {
        data: actionData,
        error: actionError,
      } = await supabase
        .from("moderation_actions")
        .select(`
          id,
          action_type,
          warning_number,
          reason,
          admin_notes,
          created_at
        `)
        .eq("user_id", user.id)
        .eq("customer_hidden", false)
        .order("created_at", {
          ascending: false,
        })

      if (actionError) {
        console.error(
          "Moderation Actions Fetch Error:",
          actionError
        )

        // Do not fail the whole card
        // if history cannot be loaded.
        setActions([])
      } else {
        setActions(actionData || [])
      }

    } catch (error) {
      console.error(
        "Customer Account Status Error:",
        error
      )

      setError(
        "Something went wrong while loading your account status."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // =========================================================
  // HIDE MODERATION HISTORY ITEM — CUSTOMER ONLY
  // =========================================================

  const handleRemoveFromHistory = async () => {
    if (!selectedAction?.id || removingAction) {
      return
    }

    setRemovingAction(true)
    setError("")

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError("Unable to verify your account.")
        return
      }

      // Soft-delete only from the customer's history view.
      // The moderation record itself remains in the database.
      const { error: hideError } = await supabase
        .from("moderation_actions")
        .update({
          customer_hidden: true,
        })
        .eq("id", selectedAction.id)
        .eq("user_id", user.id)

      if (hideError) {
        console.error(
          "Customer Moderation History Hide Error:",
          hideError
        )

        setError("Unable to remove this item from your history.")
        return
      }

      setActions((currentActions) =>
        currentActions.filter(
          (action) => action.id !== selectedAction.id
        )
      )

      setSelectedAction(null)
    } catch (error) {
      console.error(
        "Customer Moderation History Hide Error:",
        error
      )

      setError("Something went wrong while updating your history.")
    } finally {
      setRemovingAction(false)
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAccountStatus()
  }, [])

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  const statusConfig = {
    healthy: {
      label: "Account Healthy",
      description:
        "Your account is in good standing. No restrictions are currently active.",
      icon: CheckCircle2,

      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700",

      iconClass:
        "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-600",

      borderClass:
        "border-emerald-100",

      accentClass:
        "from-emerald-400 via-emerald-500 to-green-600",

      glowClass:
        "bg-emerald-400/20",

      softClass:
        "border-emerald-100 bg-emerald-50/70",

      textClass:
        "text-emerald-700",
    },

    warning: {
      label: "Account Warning",
      description:
        "Your account has received a warning. Please review the information below.",
      icon: AlertTriangle,

      badgeClass:
        "border-amber-200 bg-amber-50 text-amber-700",

      iconClass:
        "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-600",

      borderClass:
        "border-amber-100",

      accentClass:
        "from-amber-400 via-yellow-500 to-orange-500",

      glowClass:
        "bg-yellow-400/20",

      softClass:
        "border-amber-100 bg-amber-50/70",

      textClass:
        "text-amber-700",
    },

    banned: {
      label: "Account Restricted",
      description:
        "Your account is currently restricted. Please review the reason below.",
      icon: Ban,

      badgeClass:
        "border-red-200 bg-red-50 text-red-700",

      iconClass:
        "border-red-200 bg-gradient-to-br from-red-50 to-rose-100 text-red-600",

      borderClass:
        "border-red-100",

      accentClass:
        "from-red-400 via-red-600 to-rose-700",

      glowClass:
        "bg-red-500/20",

      softClass:
        "border-red-100 bg-red-50/70",

      textClass:
        "text-red-700",
    },
  }

  const config =
    statusConfig[status] ||
    statusConfig.healthy

  const StatusIcon = config.icon

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not available"
    }

    const parsedDate = new Date(date)

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Not available"
    }

    return parsedDate.toLocaleString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    )
  }

  // =========================================================
  // ACTION STYLE
  // =========================================================

  const getActionStyle = (actionType) => {
    const normalized =
      actionType?.toLowerCase()

    if (normalized === "ban") {
      return {
        icon: Ban,
        iconClass:
          "border-red-200 bg-gradient-to-br from-red-50 to-rose-100 text-red-600",
        badgeClass:
          "border-red-200 bg-red-50 text-red-700",
        label: "Account Restriction",
      }
    }

    if (
      normalized === "warning" ||
      normalized === "restriction" ||
      normalized === "final_restriction"
    ) {
      return {
        icon: AlertTriangle,
        iconClass:
          "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-600",
        badgeClass:
          "border-amber-200 bg-amber-50 text-amber-700",
        label:
          normalized === "final_restriction"
            ? "Final Restriction"
            : normalized === "restriction"
              ? "Restriction"
              : "Warning",
      }
    }

    return {
      icon: CheckCircle2,
      iconClass:
        "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-600",
      badgeClass:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      label: "Account Update",
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">

          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />

          <div className="min-w-0 flex-1">

            <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />

            <div className="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-slate-100" />

          </div>

          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-100" />

        </div>

        <div className="mt-3 h-11 animate-pulse rounded-xl bg-slate-50" />
      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-100 text-red-600">
            <Info className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">

            <h2 className="text-sm font-bold text-slate-900">
              Account Status
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              fetchAccountStatus(true)
            }
            disabled={refreshing}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              transition
              hover:border-slate-300
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            title="Retry"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>

        </div>

      </div>
    )
  }

  // =========================================================
  // MAIN CARD
  // =========================================================

  return (
    <>
      {/* =====================================================
          COMPACT PREMIUM ACCOUNT STATUS CARD
      ===================================================== */}

      <div
        className={`
          relative
          w-full
          overflow-hidden
          rounded-2xl
          border
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.06)]
          ${config.borderClass}
        `}
      >

        {/* PREMIUM TOP ACCENT */}

        <div
          className={`
            absolute
            left-0
            top-0
            h-1
            w-full
            bg-gradient-to-r
            ${config.accentClass}
          `}
        />

        {/* SUBTLE GLOW */}

        <div
          className={`
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-32
            w-32
            rounded-full
            blur-3xl
            ${config.glowClass}
          `}
        />

        <div className="relative p-4 sm:p-5">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex items-center gap-3">

            {/* PREMIUM STATUS ICON */}

            <div className="relative shrink-0">

              <div
                className={`
                  absolute
                  -inset-1
                  rounded-2xl
                  opacity-40
                  blur-md
                  ${config.glowClass}
                `}
              />

              <div
                className={`
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  shadow-sm
                  ${config.iconClass}
                `}
              >
                <StatusIcon className="h-5 w-5" />
              </div>

            </div>


            {/* STATUS TEXT */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-1.5">

                <h2 className="text-sm font-black tracking-tight text-slate-900 sm:text-base">
                  Account Status
                </h2>

                <span
                  className={`
                    inline-flex
                    items-center
                    rounded-full
                    border
                    px-2
                    py-0.5
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wide
                    ${config.badgeClass}
                  `}
                >
                  {config.label}
                </span>

              </div>

              <p className="mt-0.5 truncate text-[11px] leading-5 text-slate-500 sm:text-xs">
                {config.description}
              </p>

            </div>


            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                fetchAccountStatus(true)
              }
              disabled={refreshing}
              title="Refresh account status"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-400
                shadow-sm
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

          </div>


          {/* =================================================
              HEALTHY STATUS
          ================================================= */}

          {status === "healthy" && (
            <div
              className={`
                mt-3
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                px-3
                py-2.5
                ${config.softClass}
              `}
            >

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>

              <p className="text-xs font-bold text-emerald-800">
                Your account is in good standing.
              </p>

            </div>
          )}


          {/* =================================================
              WARNING STATUS
          ================================================= */}

          {status === "warning" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2.5">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-xs font-bold text-amber-900">
                  Account warning
                </p>

                <p className="mt-0.5 text-[10px] text-amber-800">
                  {warningCount}/3 warning
                  {warningCount === 1 ? "" : "s"} recorded.
                </p>

              </div>

              <div className="flex shrink-0 gap-1">

                {[1, 2, 3].map((number) => (
                  <span
                    key={number}
                    className={`
                      h-1.5
                      w-5
                      rounded-full
                      ${
                        number <= warningCount
                          ? "bg-amber-500"
                          : "bg-amber-200"
                      }
                    `}
                  />
                ))}

              </div>

            </div>
          )}


          {/* =================================================
              BANNED STATUS
          ================================================= */}

          {status === "banned" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50 px-3 py-2.5">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Ban className="h-4 w-4 text-red-600" />
              </div>

              <div className="min-w-0">

                <p className="text-xs font-bold text-red-900">
                  Account access is restricted
                </p>

                {bannedAt && (
                  <p className="mt-0.5 text-[10px] text-red-700">
                    Restricted on {formatDate(bannedAt)}
                  </p>
                )}

              </div>

            </div>
          )}


          {/* =================================================
              REASON — ONLY WHEN NEEDED
          ================================================= */}

          {(status === "warning" ||
            status === "banned") &&
            reason && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                <div className="min-w-0">

                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                    Reason
                  </p>

                  <p className="mt-0.5 whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-600">
                    {reason}
                  </p>

                </div>

              </div>
            )}


          {/* =================================================
              VIEW ALL HISTORY
          ================================================= */}

          {actions.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowHistory(true)
              }
              className="
                group
                mt-3
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2.5
                text-left
                shadow-sm
                transition
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
                hover:shadow-md
                active:scale-[0.99]
              "
            >

              {/* HISTORY ICON */}

              <div className="relative shrink-0">

                <div className="absolute -inset-1 rounded-xl bg-slate-300/20 blur-sm transition group-hover:bg-slate-400/30" />

                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 shadow-sm">
                  <Clock3 className="h-4 w-4" />
                </div>

              </div>


              {/* HISTORY TEXT */}

              <div className="min-w-0 flex-1">

                <p className="text-xs font-bold text-slate-800">
                  View Account History
                </p>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {actions.length} recorded update
                  {actions.length !== 1 ? "s" : ""}
                </p>

              </div>


              {/* ARROW */}

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500" />

            </button>
          )}

        </div>
      </div>


      


{/* =====================================================
    PREMIUM HISTORY MODAL
===================================================== */}

{showHistory && (
  <div
    className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-slate-950/60
      p-3
      backdrop-blur-sm
      sm:p-5
    "
    onClick={() =>
      setShowHistory(false)
    }
  >

    {/* =================================================
        MODAL
    ================================================= */}

    <div
      className="
        flex
        h-auto
        max-h-[calc(100dvh-1.5rem)]
        w-full
        max-w-xl
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-white/20
        bg-white
        shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        sm:max-h-[92vh]
        sm:rounded-3xl
        lg:max-w-5xl
      "
      onClick={(e) =>
        e.stopPropagation()
      }
    >

      {/* =================================================
          MODAL BODY
          NO TOP HEADER
      ================================================= */}

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5">

        {actions.length === 0 ? (

          <div className="flex min-h-[250px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-300 shadow-sm">
                <Clock3 className="h-6 w-6" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-700">
                No account history
              </p>

              <p className="mt-1 text-xs text-slate-400">
                No moderation actions have been recorded.
              </p>

            </div>

          </div>

        ) : (

          <div className="space-y-3">

            {actions.map((action, index) => {

              const style =
                getActionStyle(
                  action.action_type
                )

              const ActionIcon =
                style.icon

              return (
                <div
                  key={action.id}
                  className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    hover:shadow-md
                  "
                >

                  {/* LEFT ACCENT */}

                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      h-full
                      w-1
                      ${
                        action.action_type === "ban"
                          ? "bg-gradient-to-b from-red-400 to-red-700"
                          : action.action_type === "warning" ||
                              action.action_type === "restriction" ||
                              action.action_type === "final_restriction"
                            ? "bg-gradient-to-b from-amber-400 to-orange-500"
                            : "bg-gradient-to-b from-emerald-400 to-green-600"
                      }
                    `}
                  />

                  <div className="p-3.5 sm:p-4">

                    <div className="flex items-start gap-3">

                      {/* ACTION ICON */}

                      <div className="relative shrink-0">

                        <div className="absolute -inset-1 rounded-xl bg-slate-200/30 blur-sm" />

                        <div
                          className={`
                            relative
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            border
                            shadow-sm
                            ${style.iconClass}
                          `}
                        >
                          <ActionIcon className="h-4 w-4" />
                        </div>

                      </div>


                      {/* ACTION CONTENT */}

                      <div className="min-w-0 flex-1">

                        {/* TITLE + DATE */}

                        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-1.5">

                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  border
                                  px-2
                                  py-0.5
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-wide
                                  ${style.badgeClass}
                                `}
                              >
                                {style.label}
                              </span>

                              {action.warning_number && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                                  Warning #{action.warning_number}
                                </span>
                              )}

                            </div>

                            <p className="mt-1.5 text-sm font-black capitalize text-slate-800">
                              {action.action_type?.replace(
                                /_/g,
                                " "
                              ) || "Account update"}
                            </p>

                          </div>


                          {/* DATE */}

                          <div className="flex shrink-0 items-center gap-1.5 text-[9px] text-slate-400 lg:pt-1">

                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                            <span>
                              {formatDate(
                                action.created_at
                              )}
                            </span>

                          </div>

                          {/* CUSTOMER-ONLY REMOVE ACTION */}
                          <button
                            type="button"
                            onClick={() => setSelectedAction(action)}
                            className="
                              inline-flex
                              shrink-0
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              px-2.5
                              py-1.5
                              text-[9px]
                              font-bold
                              text-slate-500
                              shadow-sm
                              transition
                              hover:border-red-200
                              hover:bg-red-50
                              hover:text-red-600
                              active:scale-[0.98]
                            "
                            title="Remove this item from your history"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>

                        </div>


                        {/* REASON */}

                        {action.reason && (
                          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">

                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              Reason
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-600">
                              {action.reason}
                            </p>

                          </div>
                        )}


                        {/* ADMIN NOTES */}

                        {action.admin_notes && (
                          <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5">

                            <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">
                              Administration Notes
                            </p>

                            <p className="mt-1 whitespace-pre-wrap break-words text-[11px] leading-5 text-blue-800">
                              {action.admin_notes}
                            </p>

                          </div>
                        )}

                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        )}

      </div>


      
{/* ================================================= 
                BOTTOM DARK BANNER 
================================================= */} 
<div className=" relative shrink-0 overflow-hidden border-t border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-3.5 text-white sm:px-5 sm:py-4 lg:px-6 lg:py-4 " > 

{/* BOTTOM BANNER GLOW */} 
  <div className=" pointer-events-none absolute -left-12 -bottom-16 h-36 w-36 rounded-full bg-red-500/20 blur-3xl " /> 

    <div className=" pointer-events-none absolute -right-10 -bottom-14 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl " /> 

  {/* BANNER CONTENT */} 
    
    <div className=" relative flex items-center justify-between gap-3 " > 
  
    {/* LEFT SIDE */} 
      <div className="flex min-w-0 items-center gap-3"> 
    
    {/* ICON */} 
        <div className="relative shrink-0"> 
      
          <div className=" 
          absolute -inset-1 rounded-2xl bg-red-500/20 blur-md " 
          /> 
            
            <div className=" relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-lg backdrop-blur-sm " > 
          
             <Clock3 
             className="h-5 w-5 text-red-300" 
             /> 
          
          </div> 
        
        </div> 
      {/* TITLE */} 

      <div className="min-w-0"> 

        <h2 className="text-sm font-black sm:text-base"> 
          Account History 
        </h2> 

        <p className="mt-0.5 truncate text-[10px] text-white/50 sm:text-xs"> 
        Complete record of account updates 
        </p> 

        </div>

        </div> 
        {/* RECORD COUNT */} 
        
        <div className="hidden shrink-0 items-center gap-2 sm:flex"> 
          
          <span className=" rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/60 " > 
          {actions.length} total record {actions.length !== 1 ? "s" : ""}
          </span> 
          
          
          <span className="text-[9px] text-white/30"> 
          Newest first 
          </span>
          
           </div> 

           </div> 
           {/* MOBILE RECORD COUNT */}
            <div className="relative mt-2 flex items-center gap-2 sm:hidden"> 
              
              <span className=" rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/60 " >
               {actions.length} total record {actions.length !== 1 ? "s" : ""} 
              </span> 
              
              <span className="text-[9px] text-white/30"> 
              Newest first 
              </span> 
              
              </div> 
             
              {/* ================================================= 
                                CLOSE BUTTON 
              ================================================= */} 
              
              <div className="relative mt-3"> 
                
                <button 
                
                type="button" 
                onClick={() => setShowHistory(false) } 
                className=" flex w-full items-center justify-center rounded-xl border border-white/20 bg-white px-5 py-2.5 text-xs font-black text-slate-900 shadow-lg shadow-black/20 transition hover:bg-slate-100 active:scale-[0.98] sm:w-auto " > 
                
                Close 
                
              </button> 
            
            </div>
          
           </div> 
          
          </div> 
          
        </div> 
      )
    }

    {/* =====================================================
        CUSTOMER-ONLY REMOVE HISTORY CONFIRMATION MODAL
    ===================================================== */}

    {selectedAction && (
      <div
        className="
          fixed
          inset-0
          z-[120]
          flex
          items-center
          justify-center
          bg-slate-950/60
          p-4
          backdrop-blur-sm
        "
        onClick={() => {
          if (!removingAction) {
            setSelectedAction(null)
          }
        }}
      >
        <div
          className="
            w-full
            max-w-md
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600">
                <X className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-black text-slate-900 sm:text-base">
                  Remove from Account History?
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This will hide this moderation record from your account
                  history. The record will not be permanently deleted.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                disabled={removingAction}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                History Item
              </p>

              <p className="mt-1 text-sm font-black capitalize text-slate-800">
                {selectedAction.action_type?.replace(/_/g, " ") ||
                  "Account update"}
              </p>

              {selectedAction.reason && (
                <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-500">
                  {selectedAction.reason}
                </p>
              )}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[10px] leading-5 text-amber-800">
                This only removes the item from your personal history view.
                It does not permanently delete the moderation record.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setSelectedAction(null)}
              disabled={removingAction}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep in History
            </button>

            <button
              type="button"
              onClick={handleRemoveFromHistory}
              disabled={removingAction}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {removingAction ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5" />
                  Remove from History
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}


    </>
  )
}
