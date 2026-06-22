/** True when a service must not be hard-deleted because it has linked appointments. */
export function isServiceDeleteBlocked(hasAppointments: boolean): boolean {
  return hasAppointments;
}

export const SERVICE_DELETE_ERROR_CODES = {
  HAS_APPOINTMENTS: "HAS_APPOINTMENTS",
  INVALID_ID: "INVALID_ID",
  DELETE_FAILED: "DELETE_FAILED",
} as const;

export type ServiceDeleteErrorCode =
  (typeof SERVICE_DELETE_ERROR_CODES)[keyof typeof SERVICE_DELETE_ERROR_CODES];

export type DeleteServiceResult =
  | { success: true }
  | { success: false; error: ServiceDeleteErrorCode };
