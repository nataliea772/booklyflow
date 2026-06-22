"use client";

import { type FormEvent, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import { useBlockedTimes } from "@/hooks/useBlockedTimes";
import {
  isSingleDayBlock,
  validateBlockedTimeInput,
} from "@/lib/blocked-times";
import { formatTimeLabel } from "@/lib/availability";
import { formatShortDate } from "@/lib/i18n";
import type { BlockedTime } from "@/lib/types";

type FormMode = "add" | "edit";

const REASON_SUGGESTIONS = ["חופשה", "יום סגור", "הפסקה", "אירוע פרטי"];

const SAVE_ERROR = "לא הצלחנו לשמור את החסימה. ודאי שאת מחוברת כמנהל ונסי שוב.";
const DELETE_CONFIRM = "האם למחוק את החסימה? פעולה זו לא ניתנת לשחזור.";

function formatBlockedDateLabel(blocked: BlockedTime): string {
  if (isSingleDayBlock(blocked)) {
    return formatShortDate(blocked.startDate);
  }

  return `${formatShortDate(blocked.startDate)} – ${formatShortDate(blocked.endDate)}`;
}

function formatBlockedTypeLabel(blocked: BlockedTime): string {
  const dateType = isSingleDayBlock(blocked) ? "תאריך יחיד" : "טווח תאריכים";

  if (blocked.isFullDay) {
    return `${dateType} · יום מלא`;
  }

  if (blocked.startTime && blocked.endTime) {
    return `${dateType} · ${formatTimeLabel(blocked.startTime)} – ${formatTimeLabel(blocked.endTime)}`;
  }

  return `${dateType} · טווח שעות`;
}

export default function BlockedTimesPage() {
  const {
    blockedTimes,
    isReady,
    usesDatabase,
    addBlockedTime,
    updateBlockedTime,
    removeBlockedTime,
  } = useBlockedTimes();

  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingBlocked, setEditingBlocked] = useState<BlockedTime | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFullDay, setIsFullDay] = useState(true);
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("16:00");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isMultiDayPartialBlock =
    !isFullDay && Boolean(startDate && endDate && startDate !== endDate);

  const sortedBlockedTimes = useMemo(
    () =>
      [...blockedTimes].sort((a, b) => {
        const dateCompare = a.startDate.localeCompare(b.startDate);
        if (dateCompare !== 0) {
          return dateCompare;
        }
        return a.createdAt.localeCompare(b.createdAt);
      }),
    [blockedTimes]
  );

  function resetForm() {
    setFormMode("add");
    setEditingBlocked(null);
    setStartDate("");
    setEndDate("");
    setIsFullDay(true);
    setStartTime("12:00");
    setEndTime("16:00");
    setReason("");
    setActionError(null);
  }

  function startEdit(blocked: BlockedTime) {
    setFormMode("edit");
    setEditingBlocked(blocked);
    setStartDate(blocked.startDate);
    setEndDate(blocked.endDate);
    setIsFullDay(blocked.isFullDay);
    setStartTime(blocked.startTime ?? "12:00");
    setEndTime(blocked.endTime ?? "16:00");
    setReason(blocked.reason ?? "");
    setActionError(null);
  }

  function handleStartDateChange(value: string) {
    setStartDate(value);
    if (!endDate || endDate < value) {
      setEndDate(value);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);

    const input = {
      startDate,
      endDate,
      isFullDay,
      startTime: isFullDay ? null : startTime,
      endTime: isFullDay ? null : endTime,
      reason: reason.trim() || null,
    };

    const validation = validateBlockedTimeInput(input);
    if (!validation.valid) {
      setActionError(validation.message);
      return;
    }

    setIsSubmitting(true);

    const result =
      formMode === "edit" && editingBlocked
        ? await updateBlockedTime(editingBlocked.id, input)
        : await addBlockedTime(input);

    setIsSubmitting(false);

    if (!result) {
      setActionError(SAVE_ERROR);
      return;
    }

    resetForm();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(DELETE_CONFIRM)) {
      return;
    }

    setDeletingId(id);
    const success = await removeBlockedTime(id);
    setDeletingId(null);

    if (!success) {
      setActionError("לא הצלחנו למחוק את החסימה.");
      return;
    }

    if (editingBlocked?.id === id) {
      resetForm();
    }
  }

  if (!isReady) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <div className="page-container flex min-h-[40vh] items-center justify-center pb-16">
          <div className="loader-premium" role="status" aria-label="טוען" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-container pt-4 sm:pt-6">
        <AdminNav />
      </div>

      <div className="page-container pb-16">
        <div className="mx-auto max-w-4xl space-y-8">
          {!usesDatabase && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              מצב הדגמה: חסימות נשמרות בזיכרון בלבד. חברי Supabase לשמירה
              קבועה.
            </p>
          )}

          <Card glass accent="primary" padding="lg">
            <CardHeader
              title={formMode === "add" ? "הוספת חסימה" : "עריכת חסימה"}
              description="בחרו טווח תאריכים, סוג חסימה וסיבה."
            />

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-testid="blocked-time-form"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="blockedStartDate"
                    className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                  >
                    מתאריך
                  </label>
                  <input
                    id="blockedStartDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="input-field ltr-value"
                    data-testid="blocked-date-input"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="blockedEndDate"
                    className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                  >
                    עד תאריך
                  </label>
                  <input
                    id="blockedEndDate"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field ltr-value"
                    data-testid="blocked-end-date-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2.5 flex items-center gap-3 text-sm font-bold text-[#1F2937]">
                  <input
                    type="checkbox"
                    checked={isFullDay}
                    onChange={(e) => setIsFullDay(e.target.checked)}
                    className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
                    data-testid="blocked-full-day-toggle"
                  />
                  יום מלא
                </label>
              </div>

              {!isFullDay && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="blockedStartTime"
                        className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                      >
                        שעת התחלה
                      </label>
                      <input
                        id="blockedStartTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="input-field ltr-value"
                        data-testid="blocked-start-time-input"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="blockedEndTime"
                        className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                      >
                        שעת סיום
                      </label>
                      <input
                        id="blockedEndTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="input-field ltr-value"
                        data-testid="blocked-end-time-input"
                        required
                      />
                    </div>
                  </div>

                  {isMultiDayPartialBlock && (
                    <p className="rounded-xl border border-primary/15 bg-primary-soft/30 px-4 py-3 text-sm text-[#1F2937]">
                      חסימת שעות תחול על כל יום בטווח שנבחר.
                    </p>
                  )}
                </>
              )}

              <div>
                <label
                  htmlFor="blockedReason"
                  className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                >
                  סיבה{" "}
                  <span className="font-normal text-muted">(אופציונלי)</span>
                </label>
                <input
                  id="blockedReason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="לדוגמה: חופשה, הפסקה, אירוע פרטי"
                  className="input-field"
                  data-testid="blocked-reason-input"
                  list="blocked-reason-suggestions"
                />
                <datalist id="blocked-reason-suggestions">
                  {REASON_SUGGESTIONS.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
                <div className="mt-3 flex flex-wrap gap-2">
                  {REASON_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setReason(suggestion)}
                      className="rounded-full border border-primary/15 bg-white px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {actionError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {actionError}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "שומר…" : "שמירת חסימה"}
                </Button>
                {formMode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={resetForm}
                  >
                    ביטול עריכה
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <Card glass padding="lg">
            <CardHeader
              title="חסימות קיימות"
              description={
                sortedBlockedTimes.length > 0
                  ? `${sortedBlockedTimes.length} חסימות רשומות`
                  : "עדיין לא הוגדרו חסימות."
              }
            />

            {sortedBlockedTimes.length === 0 ? (
              <EmptyState
                icon="🌴"
                title="אין חסימות עדיין"
                description="הוסיפי תאריכי חופשה, הפסקות או ימים סגורים כדי שלקוחות לא יוכלו להזמין בזמנים אלו."
              />
            ) : (
              <div className="space-y-3">
                {sortedBlockedTimes.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex flex-col gap-4 rounded-2xl border border-primary/10 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                    data-testid={`blocked-time-row-${blocked.id}`}
                  >
                    <div>
                      <p className="text-base font-bold text-[#1F2937]">
                        {formatBlockedDateLabel(blocked)}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {formatBlockedTypeLabel(blocked)}
                        {blocked.reason ? ` · ${blocked.reason}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(blocked)}
                        data-testid={`edit-blocked-time-${blocked.id}`}
                      >
                        עריכה
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={deletingId === blocked.id}
                        onClick={() => handleDelete(blocked.id)}
                        data-testid={`delete-blocked-time-${blocked.id}`}
                      >
                        {deletingId === blocked.id ? "מוחק…" : "מחיקה"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
