/** Digits-only WhatsApp format (972...) without leading + for wa.me links. */
export function normalizeWhatsAppPhoneForWaMe(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("972")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `972${digits.slice(1)}`;
  }

  return digits;
}

export function buildManualWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizeWhatsAppPhoneForWaMe(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}
