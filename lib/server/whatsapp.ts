import {
  buildAppointmentWhatsAppMessage,
  type WhatsAppEventType,
} from "@/lib/whatsapp-messages";

export type { WhatsAppEventType };

export type WhatsAppSendResult = {
  success: boolean;
  error?: string;
  reason?: "missing_credentials" | "provider_error";
};

type TwilioWhatsAppConfig = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
};

export { buildAppointmentWhatsAppMessage };

export function isWhatsAppConfigured(): boolean {
  return Boolean(getActiveWhatsAppProvider());
}

function getActiveWhatsAppProvider(): string | null {
  const provider = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (!provider) {
    return null;
  }

  if (provider === "twilio" && getTwilioWhatsAppConfig()) {
    return "twilio";
  }

  return null;
}

function getTwilioWhatsAppConfig(): TwilioWhatsAppConfig | null {
  const accountSid = process.env.WHATSAPP_ACCOUNT_SID?.trim();
  const authToken = process.env.WHATSAPP_AUTH_TOKEN?.trim();
  const fromNumber = process.env.WHATSAPP_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }

  return { accountSid, authToken, fromNumber };
}

/** Normalizes common Israeli/local formats to E.164 for Twilio WhatsApp. */
export function normalizeWhatsAppNumber(phone: string): string {
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

function formatWhatsAppAddress(number: string): string {
  const normalized = normalizeWhatsAppNumber(number);
  return normalized.startsWith("whatsapp:")
    ? normalized
    : `whatsapp:${normalized}`;
}

function missingCredentialsResult(): WhatsAppSendResult {
  return {
    success: false,
    reason: "missing_credentials",
    error: "WhatsApp provider is not configured.",
  };
}

async function sendViaTwilioWhatsApp(
  to: string,
  message: string
): Promise<WhatsAppSendResult> {
  const config = getTwilioWhatsAppConfig();
  if (!config) {
    return {
      success: false,
      reason: "missing_credentials",
      error: "Twilio WhatsApp credentials are not configured.",
    };
  }

  const credentials = Buffer.from(
    `${config.accountSid}:${config.authToken}`
  ).toString("base64");

  const body = new URLSearchParams({
    From: formatWhatsAppAddress(config.fromNumber),
    To: formatWhatsAppAddress(to),
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
        reason: "provider_error",
        error: `Twilio error (${response.status}): ${errorBody.slice(0, 200)}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      reason: "provider_error",
      error:
        error instanceof Error
          ? error.message
          : "Failed to send WhatsApp via Twilio.",
    };
  }
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<WhatsAppSendResult> {
  const provider = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();

  if (!provider) {
    return missingCredentialsResult();
  }

  if (provider === "twilio") {
    return sendViaTwilioWhatsApp(to, message);
  }

  return {
    success: false,
    reason: "provider_error",
    error: `Unsupported WhatsApp provider: ${provider}`,
  };
}
