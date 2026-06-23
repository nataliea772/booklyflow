import { describe, expect, it } from "vitest";
import { formatDurationHebrew } from "@/lib/time-format";

describe("formatDurationHebrew", () => {
  it("formats minutes under an hour", () => {
    expect(formatDurationHebrew(30)).toBe("30 דק׳");
    expect(formatDurationHebrew(45)).toBe("45 דק׳");
  });

  it("formats whole hours and common combinations", () => {
    expect(formatDurationHebrew(60)).toBe("שעה");
    expect(formatDurationHebrew(75)).toBe("שעה ורבע");
    expect(formatDurationHebrew(90)).toBe("שעה וחצי");
    expect(formatDurationHebrew(120)).toBe("שעתיים");
    expect(formatDurationHebrew(150)).toBe("שעתיים וחצי");
    expect(formatDurationHebrew(180)).toBe("3 שעות");
    expect(formatDurationHebrew(210)).toBe("3 שעות וחצי");
  });

  it("formats other minute remainders", () => {
    expect(formatDurationHebrew(105)).toBe("שעה ו־45 דק׳");
    expect(formatDurationHebrew(135)).toBe("שעתיים ורבע");
  });
});
