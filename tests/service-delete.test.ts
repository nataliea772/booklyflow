import { describe, expect, it } from "vitest";
import {
  isServiceDeleteBlocked,
  SERVICE_DELETE_ERROR_CODES,
} from "@/lib/service-delete";

describe("isServiceDeleteBlocked", () => {
  it("blocks delete when the service has appointments", () => {
    expect(isServiceDeleteBlocked(true)).toBe(true);
  });

  it("allows delete when the service has no appointments", () => {
    expect(isServiceDeleteBlocked(false)).toBe(false);
  });
});

describe("SERVICE_DELETE_ERROR_CODES", () => {
  it("exposes stable error codes for delete outcomes", () => {
    expect(SERVICE_DELETE_ERROR_CODES.HAS_APPOINTMENTS).toBe("HAS_APPOINTMENTS");
    expect(SERVICE_DELETE_ERROR_CODES.INVALID_ID).toBe("INVALID_ID");
    expect(SERVICE_DELETE_ERROR_CODES.DELETE_FAILED).toBe("DELETE_FAILED");
  });
});
