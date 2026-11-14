import { supabase } from './supabase'

export async function sendAppointmentStatusSms(appointmentId, event) {
  try {
    const { data, error } = await supabase.functions.invoke(
      'send-appointment-sms',
      {
        body: { appointmentId, event },
      }
    )

    if (error || data?.error) {
      console.error(
        'Appointment SMS notification failed:',
        error?.message || data?.error
      )
      return false
    }

    return true
  } catch (error) {
    console.error(
      'Appointment SMS notification failed:',
      error?.message || error
    )
    return false
  }
}