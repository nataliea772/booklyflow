import { expect, test, type Page } from "@playwright/test";
import { appointmentStatusLabels } from "../../lib/i18n";
import {
  getAdminAuthSkipReason,
  loginAsAdminIfRequired,
} from "./helpers/auth";

const STORAGE_KEYS = [
  "booklyflow-appointments",
  "booklyflow-appointment-status-overrides",
  "booklyflow-appointment-edits",
];

const E2E_SERVICE_ID = "5";
const WORKING_DAYS = [0, 1, 2, 3, 4];

async function clearAppStorage(page: Page) {
  await page.goto("/");
  await page.evaluate((keys) => {
    keys.forEach((key) => window.localStorage.removeItem(key));
  }, STORAGE_KEYS);
}

/** Returns the next Sun–Thu date at least 7 days out (avoids mock "today" noise). */
function getE2EWorkingDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);

  while (!WORKING_DAYS.includes(date.getDay())) {
    date.setDate(date.getDate() + 1);
  }

  return date.toISOString().split("T")[0];
}

async function fillBookingForm(
  page: Page,
  options: {
    customerName: string;
    phone: string;
    notes: string;
  }
) {
  await page.getByTestId("customer-name-input").fill(options.customerName);
  await page.getByTestId("phone-input").fill(options.phone);
  await page.getByTestId("notes-input").fill(options.notes);

  const emailInput = page.getByTestId("customer-email-input");
  if (await emailInput.count()) {
    await emailInput.fill("automation@example.com");
  }
}

async function selectServiceAndDate(page: Page, appointmentDate: string) {
  await page.getByTestId("service-select").selectOption(E2E_SERVICE_ID);
  await page.getByTestId("date-input").fill(appointmentDate);
  await expect(page.getByTestId(/^time-slot-/).first()).toBeVisible();
}

test.describe("BooklyFlow booking flow", () => {
  test("books an appointment and confirms it in admin", async ({ page }) => {
    const skipReason = getAdminAuthSkipReason();
    test.skip(Boolean(skipReason), skipReason);

    const appointmentDate = getE2EWorkingDate();

    await clearAppStorage(page);
    await loginAsAdminIfRequired(page);

    await page.goto("/admin");
    const weekBefore = Number(
      await page
        .getByTestId("dashboard-stat-week-value")
        .innerText()
    );

    await page.goto("/book");

    await selectServiceAndDate(page, appointmentDate);

    const firstSlot = page.getByTestId(/^time-slot-/).first();
    const slotTestId = await firstSlot.getAttribute("data-testid");
    expect(slotTestId).toBeTruthy();

    await firstSlot.click();

    await fillBookingForm(page, {
      customerName: "Automation Tester",
      phone: "0501234567",
      notes: "Created by Playwright E2E test",
    });

    await page.getByTestId("submit-booking-button").click();
    await page.waitForURL(/\/thank-you/);
    await expect(page.getByTestId("booking-success-message")).toBeVisible();
    await expect(page.getByTestId("booking-success-message")).toContainText(
      "תודה, הבקשה לתור התקבלה"
    );

    await page.goto("/admin/appointments");
    await expect(page.getByText("Automation Tester")).toBeVisible();

    const appointmentRow = page
      .locator('[data-testid^="appointment-row-"]')
      .filter({ hasText: "Automation Tester" });
    await expect(appointmentRow).toBeVisible();

    const rowTestId = await appointmentRow.getAttribute("data-testid");
    const appointmentId = rowTestId?.replace("appointment-row-", "");
    expect(appointmentId).toBeTruthy();

    await expect(
      page.getByTestId(`status-badge-${appointmentId}`)
    ).toContainText(appointmentStatusLabels.pending);

    await page.getByTestId(`confirm-appointment-${appointmentId}`).click();

    await expect(
      page.getByTestId(`status-badge-${appointmentId}`)
    ).toContainText(appointmentStatusLabels.confirmed);

    await page.goto("/admin");
    await expect(page.getByTestId("dashboard-stat-today")).toBeVisible();
    await expect(page.getByTestId("dashboard-stat-week")).toBeVisible();
    await expect(page.getByTestId("dashboard-stat-revenue")).toBeVisible();
    await expect(page.getByTestId("dashboard-stat-popular-service")).toBeVisible();

    const weekAfter = Number(
      await page.getByTestId("dashboard-stat-week-value").innerText()
    );

    expect(weekAfter).toBe(weekBefore + 1);
  });

  test("prevents double booking for the same service, date, and time", async ({
    page,
  }) => {
    const appointmentDate = getE2EWorkingDate();

    await clearAppStorage(page);
    await page.goto("/book");

    await selectServiceAndDate(page, appointmentDate);

    const firstSlot = page.getByTestId(/^time-slot-/).first();
    const slotTestId = await firstSlot.getAttribute("data-testid");
    expect(slotTestId).toBeTruthy();

    await firstSlot.click();

    await fillBookingForm(page, {
      customerName: "Double Booking Tester",
      phone: "0509876543",
      notes: "First booking for double-booking prevention test",
    });

    await page.getByTestId("submit-booking-button").click();
    await page.waitForURL(/\/thank-you/);
    await expect(page.getByTestId("booking-success-message")).toBeVisible();

    await page.getByTestId("book-another-button").click();
    await page.waitForURL(/\/book/);

    await selectServiceAndDate(page, appointmentDate);

    await expect(page.getByTestId(slotTestId!)).toHaveCount(0);
  });
});
