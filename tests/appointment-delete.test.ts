import { describe, expect, it } from "vitest";
import { canDeleteAppointment } from "@/lib/appointment-delete";

describe("canDeleteAppointment", () => {
  it("allows delete only for cancelled or completed appointments", () => {
    expect(canDeleteAppointment("cancelled")).toBe(true);
    expect(canDeleteAppointment("completed")).toBe(true);
    expect(canDeleteAppointment("pending")).toBe(false);
    expect(canDeleteAppointment("confirmed")).toBe(false);
  });
});
