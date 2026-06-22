import { NextResponse } from "next/server";
import {
  buildAppointmentWhatsAppMessage,
  sendWhatsAppMessage,
  type WhatsAppEventType,
} from "@/lib/server/whatsapp";
import { buildReviewLink } from "@/lib/review-links";
import { recordAppointmentNotification } from "@/lib/supabase/appointment-notifications";
import { verifyAuthenticatedAdmin } from "@/lib/server/supabase-auth";
import { getAppointmentById } from "@/lib/supabase/appointments";
import { fetchBusinessSettingsSafe } from "@/lib/supabase/fetch-business-settings";
import { getServiceById } from "@/lib/supabase/services";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type WhatsAppNotificationRequest = {
  appointmentId?: string;
  eventType?: WhatsAppEventType;
};

const VALID_EVENT_TYPES: WhatsAppEventType[] = [
  "confirmed",
  "cancelled",
  "rescheduled",
  "review_request",
];

function isWhatsAppEventType(value: unknown): value is WhatsAppEventType {
  return (
    typeof value === "string" &&
    VALID_EVENT_TYPES.includes(value as WhatsAppEventType)
  );
}

function getRequestOrigin(request: Request): string | undefined {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ??
    new URL(request.url).protocol.replace(":", "");

  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

function validateEventForAppointment(
  eventType: WhatsAppEventType,
  status: string
): string | null {
  if (eventType === "confirmed" && status !== "confirmed") {
    return "WhatsApp confirmation requires a confirmed appointment.";
  }

  if (eventType === "cancelled" && status !== "cancelled") {
    return "WhatsApp cancellation requires a cancelled appointment.";
  }

  if (eventType === "review_request" && status !== "completed") {
    return "WhatsApp review request requires a completed appointment.";
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

  let body: WhatsAppNotificationRequest;
  try {
    body = (await request.json()) as WhatsAppNotificationRequest;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const appointmentId = body.appointmentId?.trim();
  const eventType = isWhatsAppEventType(body.eventType)
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
      error: "WhatsApp notifications require Supabase configuration.",
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

  const service = await getServiceById(auth.supabase, appointment.serviceId);
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

  const businessSettings = await fetchBusinessSettingsSafe(auth.supabase);
  const reviewLink =
    eventType === "review_request"
      ? buildReviewLink(appointmentId, getRequestOrigin(request))
      : undefined;

  const message = buildAppointmentWhatsAppMessage(
    eventType,
    appointment,
    service,
    businessSettings,
    reviewLink
  );

  const whatsAppResult = await sendWhatsAppMessage(
    appointment.customerPhone,
    message
  );

  if (whatsAppResult.success) {
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
    error: whatsAppResult.error ?? "Failed to send WhatsApp.",
  });

  return NextResponse.json({
    success: false,
    error: whatsAppResult.error ?? "Failed to send WhatsApp.",
    eventType,
  });
}
