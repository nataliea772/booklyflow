"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import AdminNav from "@/components/AdminNav";
import AdminToast from "@/components/AdminToast";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import BusinessGalleryManager from "@/components/BusinessGalleryManager";
import ImageUploadField from "@/components/ImageUploadField";
import { PageLoadingState } from "@/components/LoadingSkeleton";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { HEBREW_WEEKDAYS } from "@/lib/appointment-edit";
import {
  MAX_BOOKING_WINDOW_DAYS,
  MIN_BOOKING_WINDOW_DAYS,
  normalizeBookingWindowDays,
} from "@/lib/booking-window";
import {
  normalizeSocialUrl,
  validateSocialUrl,
} from "@/lib/social-links";
import type { BusinessWorkingDay } from "@/lib/types";
import { createDefaultWorkingHours } from "@/lib/working-hours";
import {
  deleteImageByUrl,
  uploadBusinessImage,
} from "@/lib/supabase/storage";

type BusinessSettingsTab =
  | "details"
  | "hours"
  | "contact"
  | "branding"
  | "booking";

const BUSINESS_TABS: { id: BusinessSettingsTab; label: string }[] = [
  { id: "details", label: "פרטי העסק" },
  { id: "hours", label: "שעות פעילות" },
  { id: "contact", label: "קישורי קשר" },
  { id: "branding", label: "מיתוג ותמונות" },
  { id: "booking", label: "הגדרות הזמנה" },
];

export default function BusinessSettingsPage() {
  const { settings, isReady, usesDatabase, saveSettings } =
    useBusinessSettings();

  const [activeTab, setActiveTab] = useState<BusinessSettingsTab>("details");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [wazeUrl, setWazeUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [workingHours, setWorkingHours] = useState<BusinessWorkingDay[]>(
    createDefaultWorkingHours()
  );
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [bookingWindowDays, setBookingWindowDays] = useState(30);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(type: "success" | "error", message: string) {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2000);
  }

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setBusinessName(settings.businessName);
    setDescription(settings.description ?? "");
    setPhone(settings.phone ?? "");
    setWhatsappPhone(settings.whatsappPhone ?? "");
    setLocationUrl(settings.locationUrl ?? "");
    setWazeUrl(settings.wazeUrl ?? "");
    setFacebookUrl(settings.facebookUrl ?? "");
    setInstagramUrl(settings.instagramUrl ?? "");
    setEmail(settings.email ?? "");
    setAddress(settings.address ?? "");
    setWorkingHours(settings.workingHours);
    setBufferMinutes(settings.bufferMinutes);
    setBookingWindowDays(settings.bookingWindowDays ?? 30);
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

  async function persistSettings(
    payload: Parameters<typeof saveSettings>[0],
    successMessage = "השינויים נשמרו בהצלחה"
  ) {
    setIsSaving(true);

    try {
      const result = await saveSettings(payload);

      if (result.error) {
        showToast("error", "לא הצלחנו לשמור את השינויים");
        return false;
      }

      showToast("success", successMessage);
      return true;
    } catch {
      showToast("error", "לא הצלחנו לשמור את השינויים");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistSettings({
      businessName,
      description: description || null,
      email: email || null,
      address: address || null,
    });
  }

  async function handleHoursSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistSettings({ workingHours });
  }

  async function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await persistSettings({
      bufferMinutes,
      bookingWindowDays: normalizeBookingWindowDays(bookingWindowDays),
    });
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactError(null);

    const facebookError = facebookUrl.trim()
      ? validateSocialUrl(facebookUrl, "facebook")
      : null;
    const instagramError = instagramUrl.trim()
      ? validateSocialUrl(instagramUrl, "instagram")
      : null;

    if (facebookError || instagramError) {
      setContactError(facebookError ?? instagramError);
      return;
    }

    const normalizedFacebook = facebookUrl.trim()
      ? normalizeSocialUrl(facebookUrl, "facebook")
      : null;
    const normalizedInstagram = instagramUrl.trim()
      ? normalizeSocialUrl(instagramUrl, "instagram")
      : null;

    await persistSettings({
      phone: phone || null,
      whatsappPhone: whatsappPhone || null,
      locationUrl: locationUrl || null,
      wazeUrl: wazeUrl || null,
      facebookUrl: normalizedFacebook,
      instagramUrl: normalizedInstagram,
    });
  }

  async function handleBrandingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

      const result = await saveSettings({ logoUrl, coverImageUrl });

      if (result.error) {
        showToast("error", "לא הצלחנו לשמור את השינויים");
        return;
      }

      setLogoFile(null);
      setCoverFile(null);
      showToast("success", "השינויים נשמרו בהצלחה");
    } catch {
      showToast("error", "לא הצלחנו לשמור את השינויים");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isReady) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <PageLoadingState label="טוען הגדרות עסק…" />
      </>
    );
  }

  if (!usesDatabase) {
    return (
      <>
        <div className="page-container pt-4 sm:pt-6">
          <AdminNav />
        </div>
        <div className="page-container pb-12 sm:pb-16">
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
      <AdminToast
        type={toast?.type ?? "success"}
        message={toast?.message ?? ""}
        visible={toast !== null}
      />
      <div className="page-container pt-4 sm:pt-6">
        <AdminNav />
      </div>

      <div className="page-container pb-12 sm:pb-16">
        <div className="mb-8">
          <p className="section-eyebrow">הגדרות</p>
          <h1 className="mt-2 text-2xl font-extrabold text-charcoal sm:text-3xl">
            פרטי העסק
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">
            ניהול פרטים, שעות פעילות, קשר ומיתוג לדף ההזמנה הציבורי.
          </p>
        </div>

        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="קטגוריות הגדרות"
        >
          {BUSINESS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                activeTab === tab.id
                  ? "bg-charcoal text-white shadow-sm"
                  : "border border-black/10 bg-white text-charcoal hover:border-black/20"
              }`}
              data-testid={`business-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card glass accent="primary" padding="lg">
          {activeTab === "details" && (
            <>
              <CardHeader
                title="פרטי העסק"
                description="שם, תיאור ופרטי קשר בסיסיים שיוצגו ללקוחות."
              />
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                <div>
                  <label htmlFor="businessName" className="mb-2.5 block text-sm font-bold text-charcoal">
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
                  <label htmlFor="description" className="mb-2.5 block text-sm font-bold text-charcoal">
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
                <div>
                  <label htmlFor="email" className="mb-2.5 block text-sm font-bold text-charcoal">
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
                <div>
                  <label htmlFor="address" className="mb-2.5 block text-sm font-bold text-charcoal">
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
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "שומר…" : "שמירת פרטי העסק"}
                </Button>
              </form>
            </>
          )}

          {activeTab === "hours" && (
            <>
              <CardHeader
                title="שעות פעילות"
                description="הגדירו שעות שונות לכל יום — משפיע על זמינות בדף ההזמנה."
              />
              <form
                onSubmit={handleHoursSubmit}
                className="space-y-6"
                data-testid="working-hours-form"
              >
                <div className="space-y-3">
                  {HEBREW_WEEKDAYS.map((day) => {
                    const dayHours = workingHours.find(
                      (item) => item.dayOfWeek === day.value
                    );
                    if (!dayHours) return null;

                    return (
                      <div
                        key={day.value}
                        className="rounded-2xl border border-black/10 bg-white p-4"
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
                            <span className="text-base font-bold text-charcoal">
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
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "שומר…" : "שמירת שעות פעילות"}
                </Button>
              </form>
            </>
          )}

          {activeTab === "contact" && (
            <>
              <CardHeader
                title="קישורי קשר"
                description="הכפתורים והאייקונים יוצגו ללקוחות רק אם הוגדרו פרטים מתאימים."
              />
              <form
                onSubmit={handleContactSubmit}
                className="space-y-5"
                data-testid="contact-links-form"
              >
                {contactError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {contactError}
                  </p>
                )}
                <div>
                  <label htmlFor="contactPhone" className="mb-2.5 block text-sm font-bold text-charcoal">
                    טלפון להתקשרות
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="050-000-0000"
                    data-testid="contact-phone-input"
                  />
                </div>
                <div>
                  <label htmlFor="whatsappPhone" className="mb-2.5 block text-sm font-bold text-charcoal">
                    מספר WhatsApp
                  </label>
                  <input
                    id="whatsappPhone"
                    type="tel"
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="050-000-0000"
                    data-testid="whatsapp-phone-input"
                  />
                </div>
                <div>
                  <label htmlFor="locationUrl" className="mb-2.5 block text-sm font-bold text-charcoal">
                    קישור מיקום / Google Maps
                  </label>
                  <input
                    id="locationUrl"
                    type="url"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="https://maps.google.com/..."
                    data-testid="location-url-input"
                  />
                </div>
                <div>
                  <label htmlFor="wazeUrl" className="mb-2.5 block text-sm font-bold text-charcoal">
                    קישור Waze
                  </label>
                  <input
                    id="wazeUrl"
                    type="url"
                    value={wazeUrl}
                    onChange={(e) => setWazeUrl(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="https://waze.com/ul/..."
                    data-testid="waze-url-input"
                  />
                </div>
                <div>
                  <label htmlFor="facebookUrl" className="mb-2.5 block text-sm font-bold text-charcoal">
                    קישור Facebook
                  </label>
                  <input
                    id="facebookUrl"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="https://facebook.com/your-page"
                    data-testid="facebook-url-input"
                  />
                </div>
                <div>
                  <label htmlFor="instagramUrl" className="mb-2.5 block text-sm font-bold text-charcoal">
                    קישור Instagram
                  </label>
                  <input
                    id="instagramUrl"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="input-field ltr-value"
                    placeholder="https://instagram.com/your-page"
                    data-testid="instagram-url-input"
                  />
                </div>
                <p className="text-xs text-muted">
                  האייקונים יוצגו ללקוחות רק אם הוגדר קישור
                </p>
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "שומר…" : "שמירת קישורי קשר"}
                </Button>
              </form>
            </>
          )}

          {activeTab === "branding" && (
            <>
              <CardHeader
                title="מיתוג ותמונות"
                description="לוגו ותמונת כיסוי לדף ההזמנה."
              />
              <form onSubmit={handleBrandingSubmit} className="space-y-8">
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
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "שומר…" : "שמירת תמונות"}
                </Button>
              </form>

              <BusinessGalleryManager />
            </>
          )}

          {activeTab === "booking" && (
            <>
              <CardHeader
                title="הגדרות הזמנה"
                description="מרווח בין תורים וטווח ההזמנה הקדימה ללקוחות."
              />
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="max-w-xs">
                  <label htmlFor="bufferMinutes" className="mb-2.5 block text-sm font-bold text-charcoal">
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
                <div className="max-w-xs">
                  <label htmlFor="bookingWindowDays" className="mb-2.5 block text-sm font-bold text-charcoal">
                    פתיחת הזמנות קדימה
                  </label>
                  <input
                    id="bookingWindowDays"
                    type="number"
                    min={MIN_BOOKING_WINDOW_DAYS}
                    max={MAX_BOOKING_WINDOW_DAYS}
                    value={bookingWindowDays}
                    onChange={(e) =>
                      setBookingWindowDays(Number(e.target.value))
                    }
                    className="input-field ltr-value"
                    data-testid="booking-window-days-input"
                    required
                  />
                  <p className="mt-2 text-xs text-muted">
                    מספר הימים קדימה שבהם לקוחות יכולות לקבוע תור
                  </p>
                </div>
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? "שומר…" : "שמירת הגדרות הזמנה"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
