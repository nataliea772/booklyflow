import { expect, type Page } from "@playwright/test";

export const E2E_USE_SUPABASE_AUTH =
  process.env.E2E_USE_SUPABASE_AUTH === "true";

export const hasAdminCredentials = Boolean(
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
);

export function getAdminAuthSkipReason(): string | undefined {
  if (E2E_USE_SUPABASE_AUTH && !hasAdminCredentials) {
    return "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for admin tests when E2E_USE_SUPABASE_AUTH=true";
  }

  return undefined;
}

export async function loginAsAdminIfRequired(page: Page) {
  if (!E2E_USE_SUPABASE_AUTH || !hasAdminCredentials) {
    return;
  }

  await page.goto("/login");
  await page
    .getByTestId("login-email-input")
    .fill(process.env.E2E_ADMIN_EMAIL!);
  await page
    .getByTestId("login-password-input")
    .fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByTestId("login-submit-button").click();
  await expect(page).toHaveURL(/\/admin$/);
}
