const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSiteUrl(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (fallbackOrigin?.trim()) {
    return fallbackOrigin.trim().replace(/\/$/, "");
  }

  return DEFAULT_SITE_URL;
}

export function buildReviewLink(
  appointmentId: string,
  siteUrl?: string
): string {
  const base = getSiteUrl(siteUrl);
  return `${base}/review/${encodeURIComponent(appointmentId.trim())}`;
}
