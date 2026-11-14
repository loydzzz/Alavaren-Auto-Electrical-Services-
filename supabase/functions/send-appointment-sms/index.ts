import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const eventDetails = {
  approved: {
    status: "confirmed",
    allowedRoles: ["admin", "technician"],
    message: "Your appointment has been approved.",
  },
  rejected: {
    status: "rejected",
    allowedRoles: ["admin"],
    message: "Your appointment request has been rejected.",
  },
  service_started: {
    status: "in_progress",
    allowedRoles: ["admin", "technician"],
    message: "Your vehicle service has started.",
  },
  service_completed: {
    status: "completed",
    allowedRoles: ["admin", "technician"],
    message: "Your vehicle service has been completed.",
  },
  cancelled: {
    status: "cancelled",
    allowedRoles: ["admin", "technician"],
    message: "Your appointment has been cancelled.",
  },
} as const;

type SmsEvent = keyof typeof eventDetails;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizePhilippineNumber(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (/^639\d{9}$/.test(digits)) return `+${digits}`;
  if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`;
  if (/^9\d{9}$/.test(digits)) return `+63${digits}`;

  return null;
}

function formatAppointmentId(id: string | number) {
  return `APPT-${String(id).padStart(6, "0")}`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const uniSmsApiKey = Deno.env.get("UNISMS_API_KEY");
  const uniSmsSenderId = Deno.env.get("UNISMS_SENDER_ID");

  if (
    !supabaseUrl ||
    !anonKey ||
    !serviceRoleKey ||
    !uniSmsApiKey ||
    !uniSmsSenderId
  ) {
    console.error("SMS function is missing required server configuration.");
    return jsonResponse({ error: "SMS service is not configured." }, 503);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication required." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userData, error: authError } =
    await userClient.auth.getUser();

  if (authError || !userData.user) {
    return jsonResponse({ error: "Authentication required." }, 401);
  }

  let payload: { appointmentId?: string | number; event?: SmsEvent };
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  const appointmentId = payload.appointmentId;
  const event = payload.event;
  if (
    (typeof appointmentId !== "string" && typeof appointmentId !== "number") ||
    !event ||
    !Object.hasOwn(eventDetails, event)
  ) {
    return jsonResponse({ error: "Invalid appointment or SMS event." }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: caller, error: callerError } = await adminClient
    .from("users")
    .select("id, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (callerError || !caller) {
    return jsonResponse({ error: "User profile not found." }, 403);
  }

  const { data: appointment, error: appointmentError } = await adminClient
    .from("appointments")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();

  if (appointmentError || !appointment) {
    return jsonResponse({ error: "Appointment not found." }, 404);
  }

  const isCustomerCancellation =
    event === "cancelled" &&
    caller.role === "customer" &&
    String(appointment.customer_id) === String(caller.id);
  const isAssignedTechnician =
    caller.role === "technician" &&
    String(appointment.technician_id) === String(caller.id);
  const details = eventDetails[event];

  if (
    (!details.allowedRoles.includes(caller.role) ||
      (caller.role === "technician" && !isAssignedTechnician)) &&
    !isCustomerCancellation
  ) {
    return jsonResponse({ error: "Not allowed to send this notification." }, 403);
  }

  const statusMatches =
    appointment.status === details.status ||
    (event === "rejected" &&
      appointment.status === "cancelled" &&
      Boolean(appointment.rejected_at));

  if (!statusMatches) {
    return jsonResponse({ error: "Appointment status does not match the SMS event." }, 409);
  }

  let customerPhone = normalizePhilippineNumber(
    appointment.mobile_number || appointment.phone
  );

  if (!customerPhone && appointment.customer_id) {
    const { data: customer, error: customerError } = await adminClient
      .from("users")
      .select("phone")
      .eq("id", appointment.customer_id)
      .maybeSingle();

    if (customerError) {
      console.error("Could not load customer SMS number:", customerError.message);
    }
    customerPhone = normalizePhilippineNumber(customer?.phone);
  }

  if (!customerPhone) {
    return jsonResponse({ error: "Customer phone number is missing or invalid." }, 422);
  }

  const { data: admins, error: adminsError } = await adminClient
    .from("users")
    .select("phone")
    .eq("role", "admin");

  if (adminsError) {
    console.error("Could not load admin SMS recipients:", adminsError.message);
  }

  const adminRecipients = new Set<string>();
  for (const admin of admins ?? []) {
    const adminPhone = normalizePhilippineNumber(admin.phone);
    if (adminPhone) adminRecipients.add(adminPhone);
  }

  const recipients = new Set([
    customerPhone,
    ...adminRecipients,
  ]);

  const appointmentNumber = formatAppointmentId(appointment.id);
  const serviceName = String(appointment.service_type || "vehicle service");
  const vehicle = [appointment.vehicle_model, appointment.plate_number]
    .filter(Boolean)
    .join(" / ");
  const schedule = [appointment.appointment_date, appointment.appointment_time]
    .filter(Boolean)
    .join(" ");
  const updateReason = String(
    event === "rejected"
      ? appointment.rejection_reason || ""
      : event === "cancelled"
        ? appointment.cancellation_reason || ""
        : ""
  ).trim();
  const message = [
    appointment.customer_name ? `Hi ${appointment.customer_name},` : "",
    `Alavaren ${appointmentNumber}: ${details.message}`,
    `Service: ${serviceName}.`,
    vehicle ? `Vehicle: ${vehicle}.` : "",
    schedule ? `Schedule: ${schedule}.` : "",
    updateReason ? `Reason: ${updateReason}.` : "",
  ].filter(Boolean).join(" ").slice(0, 670);
  const credentials = btoa(`${uniSmsApiKey}:`);
  const providerResults = await Promise.all(
    [...recipients].map(async (recipient) => {
      try {
        const response = await fetch("https://unismsapi.com/api/sms", {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipient,
            content: message,
            sender_id: uniSmsSenderId,
            metadata: {
              appointment_id: String(appointment.id),
              event,
            },
          }),
        });
        const payload = await response.json().catch(() => null);
        const referenceId = payload?.message?.reference_id;

        return {
          recipient,
          accepted: response.ok && Boolean(referenceId),
          referenceId: referenceId || null,
          status: response.status,
        };
      } catch {
        return { recipient, accepted: false, referenceId: null, status: 0 };
      }
    })
  );

  const acceptedMessages = providerResults.filter((result) => result.accepted);
  const customerMessage = providerResults.find(
    (result) => result.recipient === customerPhone
  );

  if (!customerMessage?.accepted) {
    console.error("UniSMS did not accept all appointment notifications:", {
      acceptedCount: acceptedMessages.length,
      recipientCount: providerResults.length,
      responseStatuses: providerResults.map((result) => result.status),
    });
    return jsonResponse({
      error: "UniSMS did not accept the customer notification.",
      acceptedCount: acceptedMessages.length,
      recipientCount: providerResults.length,
    }, 502);
  }

  if (acceptedMessages.length !== providerResults.length) {
    console.error("UniSMS did not accept all admin notifications:", {
      acceptedCount: acceptedMessages.length,
      recipientCount: providerResults.length,
      responseStatuses: providerResults.map((result) => result.status),
    });
  }

  return jsonResponse({
    ok: true,
    recipientCount: acceptedMessages.length,
    customerReferenceId: customerMessage.referenceId,
  });
});