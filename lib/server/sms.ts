import { formatTimeLabel } from "@/lib/availability";
import { getPublicBusinessName } from "@/lib/business-config";
import { formatDisplayDate } from "@/lib/i18n";
import type { Appointment, BusinessSettings, Service } from "@/lib/types";

export type SmsEventType = "confirmed" | "cancelled" | "rescheduled";

export type SmsSendResult = {
  success: boolean;
  error?: string;
};

type TwilioConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

export function isSmsConfigured(): boolean {
  return Boolean(getActiveSmsProvider());
}

function getActiveSmsProvider(): string | null {
  const provider = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (!provider) {
    return null;
  }

  if (provider === "twilio" && getTwilioConfig()) {
    return "twilio";
  }

  return null;
}

function getTwilioConfig(): TwilioConfig | null {
  const accountSid = process.env.SMS_ACCOUNT_SID?.trim();
  const authToken = process.env.SMS_AUTH_TOKEN?.trim();
  const fromNumber = process.env.SMS_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

/** Normalizes common Israeli/local formats to E.164 for Twilio. */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("972")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `+972${digits.slice(1)}`;
  }

  if (phone.trim().startsWith("+")) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

export function buildAppointmentSmsMessage(
  eventType: SmsEventType,
  appointment: Pick<Appointment, "appointmentDate" | "startTime">,
  _service: Pick<Service, "name">,
  businessSettings: Pick<BusinessSettings, "businessName">
): string {
  const businessName = getPublicBusinessName(businessSettings);
  const date = formatDisplayDate(appointment.appointmentDate);
  const time = formatTimeLabel(appointment.startTime);

  switch (eventType) {
    case "confirmed":
      return `התור שלך ב-${businessName} אושר לתאריך ${date} בשעה ${time}.`;
    case "cancelled":
      return `התור שלך ב-${businessName} לתאריך ${date} בשעה ${time} בוטל. לפרטים נוספים ניתן ליצור קשר עם העסק.`;
    case "rescheduled":
      return `התור שלך ב-${businessName} עודכן לתאריך ${date} בשעה ${time}.`;
  }
}

/** @deprecated Use buildAppointmentSmsMessage("confirmed", ...) */
export function buildAppointmentConfirmedMessage(
  appointment: Pick<Appointment, "appointmentDate" | "startTime">,
  service: Pick<Service, "name">,
  businessSettings: Pick<BusinessSettings, "businessName">
): string {
  return buildAppointmentSmsMessage(
    "confirmed",
    appointment,
    service,
    businessSettings
  );
}

async function sendViaTwilio(
  to: string,
  message: string
): Promise<SmsSendResult> {
  const config = getTwilioConfig();
  if (!config) {
    return {
      success: false,
      error: "Twilio credentials are not configured.",
    };
  }

  const normalizedTo = normalizePhoneNumber(to);
  const credentials = Buffer.from(
    `${config.accountSid}:${config.authToken}`
  ).toString("base64");

  const body = new URLSearchParams({
    From: config.fromNumber,
    To: normalizedTo,
    Body: message,
  });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return {
        success: false,
        error: `Twilio error (${response.status}): ${errorBody.slice(0, 200)}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send SMS via Twilio.",
    };
  }
}

export async function sendSms(
  to: string,
  message: string
): Promise<SmsSendResult> {
  const provider = process.env.SMS_PROVIDER?.trim().toLowerCase();

  if (provider === "twilio") {
    return sendViaTwilio(to, message);
  }

  if (!provider) {
    return {
      success: false,
      error: "SMS provider is not configured.",
    };
  }

  return {
    success: false,
    error: `Unsupported SMS provider: ${provider}`,
  };
}
