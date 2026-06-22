"use client";

import { type FormEvent, useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ImageUploadField from "@/components/ImageUploadField";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { HEBREW_WEEKDAYS } from "@/lib/appointment-edit";
import type { BusinessWorkingDay } from "@/lib/types";
import { createDefaultWorkingHours } from "@/lib/working-hours";
import {
  deleteImageByUrl,
  uploadBusinessImage,
} from "@/lib/supabase/storage";

export default function BusinessSettingsPage() {
  const { settings, isReady, usesDatabase, saveSettings } =
    useBusinessSettings();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6d28d9");
  const [workingHours, setWorkingHours] = useState<BusinessWorkingDay[]>(
    createDefaultWorkingHours()
  );
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setBusinessName(settings.businessName);
    setDescription(settings.description ?? "");
    setPhone(settings.phone ?? "");
    setEmail(settings.email ?? "");
    setAddress(settings.address ?? "");
    setPrimaryColor(settings.primaryColor ?? "#6d28d9");
    setWorkingHours(settings.workingHours);
    setBufferMinutes(settings.bufferMinutes);
  }, [settings]);

  function updateDayHours(
    dayOfWeek: number,
    patch: Partial<Pick<BusinessWorkingDay, "isOpen" | "startHour" | "endHour">>
  ) {
    setWorkingHours((current) =>
      current.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day
      )
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      let logoUrl = settings.logoUrl ?? null;
      let coverImageUrl = settings.coverImageUrl ?? null;

      if (logoFile) {
        if (settings.logoUrl) {
          await deleteImageByUrl(settings.logoUrl);
        }
        logoUrl = await uploadBusinessImage(logoFile, "logo");
      }

      if (coverFile) {
        if (settings.coverImageUrl) {
          await deleteImageByUrl(settings.coverImageUrl);
        }
        coverImageUrl = await uploadBusinessImage(coverFile, "cover");
      }

      const result = await saveSettings({
        businessName,
        description: description || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        primaryColor: primaryColor || null,
        logoUrl,
        coverImageUrl,
        workingHours,
        bufferMinutes,
      });

      if (result.error) {
        setErrorMessage(result.error);
        return;
      }

      setLogoFile(null);
      setCoverFile(null);
      setSuccessMessage("פרטי העסק נשמרו בהצלחה.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "שגיאה בשמירת הפרטים."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  if (!usesDatabase) {
    return (
      <>
        <section className="page-header-bg">
          <div className="page-container relative py-14 sm:py-16 lg:py-20">
            <AdminNav />
            <Badge variant="primary" className="mb-5">
              מיתוג
            </Badge>
            <h1 className="display-section">פרטי העסק</h1>
          </div>
        </section>
        <div className="page-container py-12 sm:py-16">
          <EmptyState
            icon="🏢"
            title="מיתוג עסקי זמין עם Supabase"
            description="חברו את הפרויקט ל-Supabase כדי להעלות לוגו, תמונת כיסוי ופרטי עסק שיוצגו בדף ההזמנה."
          />
        </div>
      </>
    );
  }

  return (
    <>
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            מיתוג
          </Badge>
          <h1 className="display-section">פרטי העסק</h1>
          <p className="lead mt-4 max-w-2xl">
            התאימו את דף ההזמנה עם לוגו, תמונת כיסוי ופרטי קשר — כך שהלקוחות
            ירגישו שזה העסק שלכם.
          </p>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
          <Card glass accent="primary" padding="lg">
            <CardHeader
              title="פרטים ומיתוג"
              description="המידע יוצג בראש דף ההזמנה הציבורי."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="businessName"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  שם העסק
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field"
                  placeholder="שם העסק שלכם"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  תיאור קצר
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                  placeholder="ספרו בקצרה על העסק..."
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    טלפון
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="050-000-0000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    אימייל
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="hello@business.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  כתובת
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="רחוב, עיר"
                />
              </div>

              <div>
                <label
                  htmlFor="primaryColor"
                  className="mb-2.5 block text-sm font-bold text-[#111827]"
                >
                  צבע מותג
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-12 w-16 cursor-pointer rounded-xl border border-primary/15 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="input-field ltr-value flex-1"
                    placeholder="#6d28d9"
                  />
                </div>
              </div>

              {successMessage && (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? "שומר…" : "שמירת פרטי העסק"}
              </Button>
            </form>
          </Card>

          <Card glass accent="secondary" padding="lg">
            <CardHeader
              title="שעות פעילות לפי יום"
              description="הגדירו שעות שונות לכל יום בשבוע — משפיע על זמינות בדף ההזמנה."
            />

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              data-testid="working-hours-form"
            >
              <div className="space-y-3">
                {HEBREW_WEEKDAYS.map((day) => {
                  const dayHours = workingHours.find(
                    (item) => item.dayOfWeek === day.value
                  );
                  if (!dayHours) {
                    return null;
                  }

                  return (
                    <div
                      key={day.value}
                      className="rounded-2xl border border-primary/10 bg-white/80 p-4"
                      data-testid={`working-day-row-${day.value}`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateDayHours(day.value, {
                                isOpen: !dayHours.isOpen,
                              })
                            }
                            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                              dayHours.isOpen
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                            }`}
                            data-testid={`working-day-toggle-${day.value}`}
                          >
                            {dayHours.isOpen ? "פתוח" : "סגור"}
                          </button>
                          <span className="text-base font-bold text-[#1F2937]">
                            {day.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted">
                              התחלה
                            </label>
                            <input
                              type="time"
                              value={dayHours.startHour}
                              disabled={!dayHours.isOpen}
                              onChange={(e) =>
                                updateDayHours(day.value, {
                                  startHour: e.target.value,
                                })
                              }
                              className="input-field ltr-value"
                              data-testid={`working-day-start-${day.value}`}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-muted">
                              סיום
                            </label>
                            <input
                              type="time"
                              value={dayHours.endHour}
                              disabled={!dayHours.isOpen}
                              onChange={(e) =>
                                updateDayHours(day.value, {
                                  endHour: e.target.value,
                                })
                              }
                              className="input-field ltr-value"
                              data-testid={`working-day-end-${day.value}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="max-w-xs">
                <label
                  htmlFor="bufferMinutes"
                  className="mb-2.5 block text-sm font-bold text-[#1F2937]"
                >
                  מרווח בין תורים בדקות
                </label>
                <input
                  id="bufferMinutes"
                  type="number"
                  min={0}
                  step={5}
                  value={bufferMinutes}
                  onChange={(e) => setBufferMinutes(Number(e.target.value))}
                  className="input-field ltr-value"
                  data-testid="buffer-minutes-input"
                  required
                />
              </div>

              <Button type="submit" size="lg" disabled={isSaving}>
                {isSaving ? "שומר…" : "שמירת שעות פעילות"}
              </Button>
            </form>
          </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card glass accent="secondary" padding="lg">
              <CardHeader
                title="תמונות מיתוג"
                description="לוגו ותמונת כיסוי לדף ההזמנה."
              />
              <div className="space-y-8">
                <ImageUploadField
                  label="לוגו העסק"
                  hint="PNG או JPG, עד 5MB. מומלץ ריבוע."
                  currentUrl={settings.logoUrl}
                  onFileSelect={setLogoFile}
                  disabled={isSaving}
                />
                <ImageUploadField
                  label="תמונת כיסוי"
                  hint="תמונה רחבה לראש דף ההזמנה."
                  currentUrl={settings.coverImageUrl}
                  previewAspect="cover"
                  onFileSelect={setCoverFile}
                  disabled={isSaving}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
