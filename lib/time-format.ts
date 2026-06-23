function getHoursLabel(hours: number): string {
  if (hours === 1) {
    return "שעה";
  }

  if (hours === 2) {
    return "שעתיים";
  }

  return `${hours} שעות`;
}

/** Formats service duration minutes as natural Hebrew text. */
export function formatDurationHebrew(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דק׳`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return getHoursLabel(hours);
  }

  if (remainder === 15) {
    return `${getHoursLabel(hours)} ורבע`;
  }

  if (remainder === 30) {
    if (hours === 1) {
      return "שעה וחצי";
    }

    if (hours === 2) {
      return "שעתיים וחצי";
    }

    return `${hours} שעות וחצי`;
  }

  return `${getHoursLabel(hours)} ו־${remainder} דק׳`;
}
