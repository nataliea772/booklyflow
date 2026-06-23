"use client";

import { useEffect, useMemo, useState } from "react";
import {
  canNavigateCalendarMonth,
  formatCalendarMonthKey,
  formatCalendarMonthTitle,
  generateMonthDays,
  getInitialCalendarMonth,
  HEBREW_WEEKDAY_LABELS,
  isCalendarDateDisabled,
  shiftCalendarMonth,
  type CalendarMonth,
} from "@/lib/booking-calendar";
import { getTodayDateString } from "@/lib/dates";

type BookingCalendarProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  minDate: string;
  maxDate: string;
  disabledDates?: string[];
  isDateDisabled?: (date: string) => boolean;
  className?: string;
};

export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  disabledDates,
  isDateDisabled,
  className = "",
}: BookingCalendarProps) {
  const today = getTodayDateString();
  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(() =>
    getInitialCalendarMonth(selectedDate, minDate)
  );

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    setVisibleMonth(getInitialCalendarMonth(selectedDate, minDate));
  }, [selectedDate, minDate]);

  const monthDays = useMemo(
    () => generateMonthDays(visibleMonth.year, visibleMonth.month),
    [visibleMonth]
  );

  const disableOptions = useMemo(
    () => ({ minDate, maxDate, disabledDates, isDateDisabled }),
    [minDate, maxDate, disabledDates, isDateDisabled]
  );

  const canGoPrev = canNavigateCalendarMonth(visibleMonth, -1, minDate, maxDate);
  const canGoNext = canNavigateCalendarMonth(visibleMonth, 1, minDate, maxDate);

  function handleSelect(date: string) {
    if (isCalendarDateDisabled(date, disableOptions)) {
      return;
    }

    onSelectDate(date);
  }

  return (
    <div
      className={`mx-auto w-full max-w-[32rem] rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:p-5 ${className}`}
      data-testid="booking-calendar"
      data-month={formatCalendarMonthKey(visibleMonth.year, visibleMonth.month)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVisibleMonth((current) => shiftCalendarMonth(current, -1))}
          disabled={!canGoPrev}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-lg font-bold text-charcoal transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="חודש קודם"
          data-testid="calendar-prev-month"
        >
          →
        </button>

        <h4
          className="text-base font-extrabold text-charcoal sm:text-lg"
          data-testid="booking-calendar-month-title"
        >
          {formatCalendarMonthTitle(visibleMonth.year, visibleMonth.month)}
        </h4>

        <button
          type="button"
          onClick={() => setVisibleMonth((current) => shiftCalendarMonth(current, 1))}
          disabled={!canGoNext}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-lg font-bold text-charcoal transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="חודש הבא"
          data-testid="calendar-next-month"
        >
          ←
        </button>
      </div>

      <div
        className="grid grid-cols-7 gap-1.5 sm:gap-2"
        role="grid"
        aria-label="לוח שנה לבחירת תאריך"
      >
        {HEBREW_WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-xs font-bold text-muted"
            role="columnheader"
          >
            {label}
          </div>
        ))}

        {monthDays.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-12"
                aria-hidden="true"
              />
            );
          }

          const disabled = isCalendarDateDisabled(date, disableOptions);
          const isSelected = selectedDate === date;
          const isToday = date === today;

          return (
            <button
              key={date}
              type="button"
              role="gridcell"
              disabled={disabled}
              onClick={() => handleSelect(date)}
              data-testid={`calendar-day-${date}`}
              aria-label={date}
              aria-selected={isSelected}
              className={`min-h-12 rounded-xl border text-sm font-bold transition-all duration-200 sm:min-h-[3rem] sm:text-base ${
                isSelected
                  ? "border-charcoal bg-charcoal text-white shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-transparent bg-neutral-100 text-neutral-400"
                    : "border-black/10 bg-white text-charcoal hover:border-black/25 hover:bg-neutral-50"
              } ${isToday && !isSelected ? "ring-2 ring-black/15 ring-offset-1" : ""}`}
            >
              {parseInt(date.slice(8, 10), 10)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
