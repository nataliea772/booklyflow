"use client";

import { type FormEvent, useState } from "react";
import AdminNav from "@/components/AdminNav";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card, { CardHeader } from "@/components/Card";
import EmptyState from "@/components/EmptyState";
import ImageUploadField from "@/components/ImageUploadField";
import ServiceImage from "@/components/ServiceImage";
import { useServices } from "@/hooks/useServices";
import { formatPrice } from "@/lib/i18n";

export default function ServicesPage() {
  const { services, isReady, usesDatabase, addService } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function handleAddService(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await addService({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      durationMinutes: Number(formData.get("duration")),
      price: Number(formData.get("price")),
      imageFile: usesDatabase ? imageFile : undefined,
    });

    setIsSubmitting(false);

    if (!result) {
      setSubmitError("לא ניתן להוסיף את השירות. ודאו שאתם מחוברים כמנהל.");
      return;
    }

    form.reset();
    setImageFile(null);
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
                  description={`${services.length} שירותים פעילים`}
                  action={
                    <Badge variant="neutral">{services.length} סה״כ</Badge>
                  }
                />

                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="list-card">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <ServiceImage
                            name={service.name}
                            imageUrl={service.imageUrl}
                            seed={service.id}
                            size="sm"
                          />
                          <div>
                            <p className="text-lg font-bold text-[#111827]">
                              {service.name}
                            </p>
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
                title="הוספת שירות"
                description={
                  usesDatabase
                    ? "שירות חדש יישמר במערכת ויוצג ללקוחות."
                    : "הוסיפו שירות חדש לרשימה."
                }
              />

              <form onSubmit={handleAddService} className="space-y-6">
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
                      placeholder="50"
                      className="input-field ltr-value"
                    />
                  </div>
                </div>

                {usesDatabase && (
                  <ImageUploadField
                    label="תמונת שירות (אופציונלי)"
                    hint="תוצג בדף ההזמנה. PNG או JPG, עד 5MB."
                    onFileSelect={setImageFile}
                    disabled={isSubmitting}
                  />
                )}

                {submitError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "שומר…" : "+ הוספת שירות"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
