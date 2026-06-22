"use client";

import { type FormEvent, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ImageUploadField from "@/components/ImageUploadField";
import ServiceImage from "@/components/ServiceImage";
import {
  SERVICE_DELETE_FAILED_MESSAGE,
  SERVICE_DELETE_HAS_APPOINTMENTS_MESSAGE,
  useServices,
} from "@/hooks/useServices";
import { formatPrice } from "@/lib/i18n";
import type { Service } from "@/lib/types";

type ServiceFormMode = "add" | "edit";

const SERVICE_UPDATE_ERROR =
  "לא הצלחנו לעדכן את השירות. בדקי הרשאות Supabase ונסי שוב.";
const SERVICE_CREATE_ERROR =
  "לא הצלחנו להוסיף את השירות. ודאי שאת מחוברת כמנהל ונסי שוב.";
const SERVICE_DELETE_CONFIRM =
  "האם למחוק את השירות? פעולה זו לא ניתנת לשחזור.";

export default function ServicesPage() {
  const {
    services,
    isReady,
    usesDatabase,
    addService,
    updateService,
    deactivateService,
    reactivateService,
    deleteService,
  } = useServices();

  const [formMode, setFormMode] = useState<ServiceFormMode>("add");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeCount = services.filter((service) => service.isActive).length;

  function resetForm() {
    setFormMode("add");
    setEditingService(null);
    setImageFile(null);
    setActionError(null);
  }

  function startEdit(service: Service) {
    setFormMode("edit");
    setEditingService(service);
    setImageFile(null);
    setActionError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const input = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      durationMinutes: Number(formData.get("duration")),
      price: Number(formData.get("price")),
      imageFile: usesDatabase ? imageFile : undefined,
    };

    const result =
      formMode === "edit" && editingService
        ? await updateService(editingService.id, input)
        : await addService(input);

    setIsSubmitting(false);

    if (!result) {
      setActionError(
        formMode === "edit" ? SERVICE_UPDATE_ERROR : SERVICE_CREATE_ERROR
      );
      return;
    }

    form.reset();
    resetForm();
  }

  async function handleToggleActive(service: Service) {
    setActionError(null);
    setTogglingId(service.id);

    const result = service.isActive
      ? await deactivateService(service.id)
      : await reactivateService(service.id);

    setTogglingId(null);

    if (!result) {
      setActionError(SERVICE_UPDATE_ERROR);
      return;
    }

    if (editingService?.id === service.id) {
      setEditingService(result);
    }
  }

  async function handleDelete(service: Service) {
    setActionError(null);

    if (!window.confirm(SERVICE_DELETE_CONFIRM)) {
      return;
    }

    setDeletingId(service.id);

    const result = await deleteService(service.id);

    setDeletingId(null);

    if (result.ok) {
      if (editingService?.id === service.id) {
        resetForm();
      }
      return;
    }

    setActionError(
      result.reason === "has_appointments"
        ? SERVICE_DELETE_HAS_APPOINTMENTS_MESSAGE
        : SERVICE_DELETE_FAILED_MESSAGE
    );
  }

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[50vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  return (
    <>
      <section className="page-header-bg">
        <div className="page-container relative py-14 sm:py-16 lg:py-20">
          <AdminNav />
          <Badge variant="primary" className="mb-5">
            שירותים
          </Badge>
          <h1 className="display-section">ניהול שירותים</h1>
          <p className="lead mt-4 max-w-2xl">
            הגדרת השירותים שהלקוחות שלכם יכולים להזמין.
          </p>
        </div>
      </section>

      <div className="page-container py-12 sm:py-16 lg:py-20">
        {actionError && (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {actionError}
          </p>
        )}

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {services.length === 0 ? (
              <EmptyState
                icon="✨"
                title="עדיין לא הוגדרו שירותים"
                description="הוסיפו את השירות הראשון שלכם כדי לאפשר ללקוחות להזמין תורים אונליין."
              />
            ) : (
              <Card glass accent="primary" padding="lg">
                <CardHeader
                  title="כל השירותים"
                  description={`${activeCount} פעילים · ${services.length} סה״כ`}
                  action={
                    <Badge variant="neutral">{services.length} שירותים</Badge>
                  }
                />

                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`list-card ${!service.isActive ? "opacity-75" : ""}`}
                      data-testid={`service-row-${service.id}`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-4">
                            <ServiceImage
                              name={service.name}
                              imageUrl={service.imageUrl}
                              seed={service.id}
                              size="sm"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-bold text-[#111827]">
                                  {service.name}
                                </p>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    service.isActive
                                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                      : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
                                  }`}
                                  data-testid={`service-status-${service.id}`}
                                >
                                  {service.isActive ? "פעיל" : "לא פעיל"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm leading-relaxed text-muted">
                                {service.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                            <span className="inline-flex rounded-xl bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/10">
                              {service.durationMinutes} דק׳
                            </span>
                            <span className="text-xl font-bold text-[#111827]">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 border-t border-primary/8 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(service)}
                            data-testid={`service-edit-${service.id}`}
                          >
                            עריכה
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={togglingId === service.id}
                            onClick={() => handleToggleActive(service)}
                            data-testid={`service-toggle-${service.id}`}
                          >
                            {togglingId === service.id
                              ? "מעדכן…"
                              : service.isActive
                                ? "השבתה"
                                : "הפעלה מחדש"}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            disabled={deletingId === service.id}
                            onClick={() => handleDelete(service)}
                            data-testid={`service-delete-${service.id}`}
                          >
                            {deletingId === service.id ? "מוחק…" : "מחיקה"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <Card
              elevated
              accent="secondary"
              padding="lg"
              className="surface-premium lg:sticky lg:top-28"
            >
              <CardHeader
                title={formMode === "edit" ? "עריכת שירות" : "הוספת שירות"}
                description={
                  formMode === "edit"
                    ? `עדכון: ${editingService?.name ?? ""}`
                    : usesDatabase
                      ? "שירות חדש יישמר במערכת ויוצג ללקוחות."
                      : "הוסיפו שירות חדש לרשימה."
                }
                action={
                  formMode === "edit" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                    >
                      ביטול
                    </Button>
                  ) : undefined
                }
              />

              <form
                key={editingService?.id ?? "add"}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    שם השירות
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={editingService?.name ?? ""}
                    placeholder="לדוגמה: ייעוץ עסקי"
                    className="input-field"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2.5 block text-sm font-bold text-[#111827]"
                  >
                    תיאור
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    defaultValue={editingService?.description ?? ""}
                    placeholder="תיאור קצר של השירות"
                    className="input-field resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="duration"
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
                    >
                      משך (דק׳)
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      required
                      min={5}
                      step={5}
                      defaultValue={editingService?.durationMinutes ?? ""}
                      placeholder="30"
                      className="input-field ltr-value"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2.5 block text-sm font-bold text-[#111827]"
                    >
                      מחיר (₪)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min={0}
                      step={1}
                      defaultValue={
                        editingService?.price !== undefined
                          ? editingService.price
                          : ""
                      }
                      placeholder="50"
                      className="input-field ltr-value"
                    />
                  </div>
                </div>

                {usesDatabase && (
                  <ImageUploadField
                    label={
                      formMode === "edit"
                        ? "תמונת שירות (החלפה אופציונלית)"
                        : "תמונת שירות (אופציונלי)"
                    }
                    hint="תוצג בדף ההזמנה. PNG או JPG, עד 5MB."
                    currentUrl={editingService?.imageUrl}
                    onFileSelect={setImageFile}
                    disabled={isSubmitting}
                  />
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid={
                    formMode === "edit"
                      ? "service-update-button"
                      : "service-add-button"
                  }
                >
                  {isSubmitting
                    ? "שומר…"
                    : formMode === "edit"
                      ? "שמירת שינויים"
                      : "+ הוספת שירות"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
