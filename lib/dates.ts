/** YYYY-MM-DD in local timezone context (UTC date slice). */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}
