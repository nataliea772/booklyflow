import { NextResponse } from "next/server";
import {
  buildAppointmentSmsMessage,
  sendSms,
  type SmsEventType,
} from "@/lib/server/sms";
import { recordAppointmentNotification } from "@/lib/supabase/appointment-notifications";
import { verifyAuthenticatedAdmin } from "@/lib/server/supabase-auth";
import { getAppointmentById } from "@/lib/supabase/appointments";
import { fetchBusinessSettingsSafe } from "@/lib/supabase/fetch-business-settings";
import { getServiceById } from "@/lib/supabase/services";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type SmsNotificationRequest = {
  appointmentId?: string;
  eventType?: SmsEventType;
};

const VALID_EVENT_TYPES: SmsEventType[] = [
  "confirmed",
  "cancelled",
  "rescheduled",
];

function isSmsEventType(value: unknown): value is SmsEventType {
  return (
    typeof value === "string" &&
    VALID_EVENT_TYPES.includes(value as SmsEventType)
  );
}

function validateEventForAppointment(
  eventType: SmsEventType,
  status: string
): string | null {
  if (eventType === "confirmed" && status !== "confirmed") {
    return "SMS confirmation requires a confirmed appointment.";
  }

  if (eventType === "cancelled" && status !== "cancelled") {
    return "SMS cancellation requires a cancelled appointment.";
  }

  return null;
}

export async function POST(request: Request) {
  const auth = await verifyAuthenticatedAdmin(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }

  let body: SmsNotificationRequest;
  try {
    body = (await request.json()) as SmsNotificationRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const appointmentId = body.appointmentId?.trim();
  const eventType = isSmsEventType(body.eventType)
    ? body.eventType
    : "confirmed";

  if (!appointmentId) {
    return NextResponse.json(
      { success: false, error: "appointmentId is required." },
      { status: 400 }
    );
  }

  if (!isSupabaseConfigured() || !auth.supabase) {
    return NextResponse.json({
      success: false,
      error: "SMS notifications require Supabase configuration.",
    });
  }

  const appointment = await getAppointmentById(auth.supabase, appointmentId);
  if (!appointment) {
    return NextResponse.json(
      { success: false, error: "Appointment not found." },
      { status: 404 }
    );
  }

  const statusError = validateEventForAppointment(
    eventType,
    appointment.status
  );
  if (statusError) {
    return NextResponse.json(
      { success: false, error: statusError },
      { status: 400 }
    );
  }

  const [service, businessSettings] = await Promise.all([
    getServiceById(auth.supabase, appointment.serviceId),
    fetchBusinessSettingsSafe(auth.supabase),
  ]);

  if (!service) {
    await recordAppointmentNotification(auth.supabase, {
      appointmentId,
      eventType,
      status: "failed",
      error: "Related service not found.",
    });

    return NextResponse.json({
      success: false,
      error: "Related service not found.",
    });
  }

  const message = buildAppointmentSmsMessage(
    eventType,
    appointment,
    service,
    businessSettings
  );
  const smsResult = await sendSms(appointment.customerPhone, message);

  if (smsResult.success) {
    await recordAppointmentNotification(auth.supabase, {
      appointmentId,
      eventType,
      status: "sent",
    });

    return NextResponse.json({ success: true, eventType });
  }

  await recordAppointmentNotification(auth.supabase, {
    appointmentId,
    eventType,
    status: "failed",
    error: smsResult.error ?? "Failed to send SMS.",
  });

  return NextResponse.json({
    success: false,
    error: smsResult.error ?? "Failed to send SMS.",
    eventType,
  });
}
