export type SocialPlatform = "facebook" | "instagram";

const PLATFORM_HOSTS: Record<SocialPlatform, string[]> = {
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com"],
  instagram: ["instagram.com", "www.instagram.com"],
};

export function normalizeSocialUrl(
  value: string,
  platform?: SocialPlatform
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let url = trimmed;

  if (!/^https?:\/\//i.test(url)) {
    if (url.startsWith("//")) {
      url = `https:${url}`;
    } else if (platform === "instagram") {
      url = url.startsWith("instagram.com")
        ? `https://${url}`
        : `https://instagram.com/${url.replace(/^@/, "")}`;
    } else if (platform === "facebook") {
      url = url.startsWith("facebook.com") || url.startsWith("fb.com")
        ? `https://${url}`
        : `https://facebook.com/${url.replace(/^@/, "")}`;
    } else if (/^(facebook|instagram)\.com/i.test(url)) {
      url = `https://${url}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    if (platform) {
      const host = parsed.hostname.toLowerCase();
      const allowed = PLATFORM_HOSTS[platform];
      if (!allowed.some((candidate) => host === candidate || host.endsWith(`.${candidate}`))) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function validateSocialUrl(
  value: string,
  platform: SocialPlatform
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = normalizeSocialUrl(trimmed, platform);
  if (!normalized) {
    return platform === "facebook"
      ? "נא להזין קישור Facebook תקין (https://facebook.com/...)"
      : "נא להזין קישור Instagram תקין (https://instagram.com/...)";
  }

  return null;
}
