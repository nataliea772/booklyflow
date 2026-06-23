import type { BusinessSettings } from "@/lib/types";
import { normalizeSocialUrl } from "@/lib/social-links";

export const DEFAULT_WHATSAPP_MESSAGE = "שלום, אשמח לקבוע תור";

/** Digits-only WhatsApp format (972...) without leading +. */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("972")) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return `972${digits.slice(1)}`;
  }

  return digits;
}

export function buildTelLink(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");
  return `tel:${digits || trimmed}`;
}

export function buildWhatsAppLink(
  phone: string,
  message = DEFAULT_WHATSAPP_MESSAGE
): string {
  const normalized = normalizeWhatsAppPhone(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function buildNavigationLink(
  settings: Pick<BusinessSettings, "wazeUrl" | "locationUrl">
): string | null {
  const wazeUrl = settings.wazeUrl?.trim();
  if (wazeUrl) {
    return wazeUrl;
  }

  const locationUrl = settings.locationUrl?.trim();
  if (locationUrl) {
    return locationUrl;
  }

  return null;
}

export function resolveWhatsAppPhone(
  settings: Pick<BusinessSettings, "whatsappPhone" | "phone">
): string | null {
  const whatsappPhone = settings.whatsappPhone?.trim();
  if (whatsappPhone) {
    return whatsappPhone;
  }

  const phone = settings.phone?.trim();
  return phone || null;
}

export function hasPublicContactActions(
  settings: Pick<
    BusinessSettings,
    | "phone"
    | "whatsappPhone"
    | "wazeUrl"
    | "locationUrl"
    | "facebookUrl"
    | "instagramUrl"
  >
): boolean {
  return Boolean(
    settings.phone?.trim() ||
      settings.whatsappPhone?.trim() ||
      settings.wazeUrl?.trim() ||
      settings.locationUrl?.trim() ||
      settings.facebookUrl?.trim() ||
      settings.instagramUrl?.trim()
  );
}

export type PublicContactAction = {
  id: "phone" | "navigation" | "whatsapp" | "facebook" | "instagram";
  ariaLabel: string;
  href: string;
  external?: boolean;
};

export function buildPublicContactActions(
  settings: Pick<
    BusinessSettings,
    | "phone"
    | "whatsappPhone"
    | "wazeUrl"
    | "locationUrl"
    | "facebookUrl"
    | "instagramUrl"
  >
): PublicContactAction[] {
  const actions: PublicContactAction[] = [];

  const whatsappPhone = resolveWhatsAppPhone(settings);
  if (whatsappPhone) {
    actions.push({
      id: "whatsapp",
      ariaLabel: "שליחת הודעת WhatsApp",
      href: buildWhatsAppLink(whatsappPhone),
      external: true,
    });
  }

  const instagramUrl = normalizeSocialUrl(
    settings.instagramUrl ?? "",
    "instagram"
  );
  if (instagramUrl) {
    actions.push({
      id: "instagram",
      ariaLabel: "פתיחת Instagram",
      href: instagramUrl,
      external: true,
    });
  }

  const facebookUrl = normalizeSocialUrl(settings.facebookUrl ?? "", "facebook");
  if (facebookUrl) {
    actions.push({
      id: "facebook",
      ariaLabel: "פתיחת Facebook",
      href: facebookUrl,
      external: true,
    });
  }

  const navigationUrl = buildNavigationLink(settings);
  if (navigationUrl) {
    actions.push({
      id: "navigation",
      ariaLabel: "ניווט ב-Waze",
      href: navigationUrl,
      external: true,
    });
  }

  const phone = settings.phone?.trim();
  if (phone) {
    actions.push({
      id: "phone",
      ariaLabel: "התקשרות לעסק",
      href: buildTelLink(phone),
    });
  }

  return actions;
}
