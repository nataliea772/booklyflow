"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { formatTimeLabel, getServiceName } from "@/lib/availability";
import { canDeleteAppointment } from "@/lib/appointment-delete";
import { formatDisplayDate, appointmentStatusLabels } from "@/lib/i18n";
import {
  WHATSAPP_MANUAL_TEMPLATE_LABELS,
  buildWhatsAppManualTemplateLink,
  hasCustomerPhoneForWhatsApp,
  type WhatsAppManualTemplateType,
} from "@/lib/whatsapp-manual-templates";
import type { Appointment, AppointmentStatus, BusinessSettings, Service } from "@/lib/types";

type AppointmentDetailsModalProps = {
  appointment: Appointment | null;
  services: Service[];
  businessSettings: Pick<BusinessSettings, "businessName">;
  open: boolean;
  onClose: () => void;
  onConfirm: (appointmentId: string) => void;
  onCancel: (appointmentId: string) => void;
  onComplete: (appointmentId: string) => void;
  onDelete: (appointmentId: string) => void;
  onEdit: (appointmentId: string) => void;
  confirmingId?: string | null;
  deletingId?: string | null;
};

const TEMPLATE_ORDER: WhatsAppManualTemplateType[] = [
  "confirmation",
  "reminder",
  "review_request",
  "general",
];

export default function AppointmentDetailsModal({
  appointment,
  services,
  businessSettings,
  open,
  onClose,
  onConfirm,
  onCancel,
  onComplete,
  onDelete,
  onEdit,
  confirmingId,
  deletingId,
}: AppointmentDetailsModalProps) {
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);

  const service = useMemo(() => {
    if (!appointment) {
      return null;
    }

    return services.find((item) => item.id === appointment.serviceId) ?? null;
  }, [appointment, services]);

  if (!appointment) {
    return null;
  }

  const canConfirm = appointment.status === "pending";
  const canComplete =
    appointment.status === "confirmed" || appointment.status === "pending";
  const canCancel =
    appointment.status === "pending" || appointment.status === "confirmed";
  const canDelete = canDeleteAppointment(appointment.status);
  const hasPhone = hasCustomerPhoneForWhatsApp(appointment);

  function handleWhatsAppTemplate(templateType: WhatsAppManualTemplateType) {
    if (!appointment || !service) {
      return;
    }

    const href = buildWhatsAppManualTemplateLink(
      templateType,
      appointment,
      service,
      businessSettings,
      window.location.origin
    );

    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }

    setShowWhatsAppMenu(false);
  }

  function statusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-800 ring-amber-200/80";
      case "confirmed":
        return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
      case "cancelled":
        return "bg-red-50 text-red-700 ring-red-200/80";
      case "completed":
        return "bg-slate-50 text-slate-700 ring-slate-200/80";
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setShowWhatsAppMenu(false);
        onClose();
      }}
      title="פרטי תור"
      testId="appointment-details-modal"
    >
      <div className="space-y-6 text-right">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full px-4 py-2 text-xs font-bold ring-1 ring-inset ${statusBadgeClass(appointment.status)}`}
            data-testid="modal-appointment-status"
          >
            {appointmentStatusLabels[appointment.status]}
          </span>
          <Badge variant="neutral">
            {getServiceName(services, appointment.serviceId)}
          </Badge>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/8 bg-neutral-50/80 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">
              שם לקוחה
            </dt>
            <dd className="mt-1 text-base font-bold text-charcoal">
              {appointment.customerName}
            </dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-neutral-50/80 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">
              טלפון
            </dt>
            <dd className="mt-1 text-base font-bold text-charcoal ltr-value">
              {appointment.customerPhone || "—"}
            </dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-neutral-50/80 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">
              תאריך
            </dt>
            <dd className="mt-1 text-base font-bold text-charcoal">
              {formatDisplayDate(appointment.appointmentDate)}
            </dd>
          </div>
          <div className="rounded-2xl border border-black/8 bg-neutral-50/80 p-4">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">
              שעה
            </dt>
            <dd className="mt-1 text-base font-bold text-charcoal ltr-value">
              {formatTimeLabel(appointment.startTime)} –{" "}
              {formatTimeLabel(appointment.endTime)}
            </dd>
          </div>
        </dl>

        {appointment.notes && (
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <p className="text-xs font-bold text-muted">הערות לקוחה</p>
            <p className="mt-1 text-sm text-charcoal">{appointment.notes}</p>
          </div>
        )}

        {appointment.adminNote && (
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <p className="text-xs font-bold text-muted">הערת מנהל</p>
            <p className="mt-1 text-sm text-charcoal">{appointment.adminNote}</p>
          </div>
        )}

        {appointment.createdAt && (
          <p className="text-xs text-muted">
            נוצר: {formatDisplayDate(appointment.createdAt.slice(0, 10))}
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t border-black/8 pt-5">
          {canConfirm && (
            <Button
              size="sm"
              disabled={confirmingId === appointment.id}
              onClick={() => onConfirm(appointment.id)}
              data-testid="modal-confirm-appointment"
            >
              {confirmingId === appointment.id ? "מאשר…" : "אישור"}
            </Button>
          )}
          {canComplete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onComplete(appointment.id)}
              data-testid="modal-complete-appointment"
            >
              סימון כהושלם
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(appointment.id)}
              data-testid="modal-cancel-appointment"
            >
              ביטול
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onEdit(appointment.id);
              onClose();
            }}
            data-testid="modal-edit-appointment"
          >
            עריכה
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="outline"
              disabled={deletingId === appointment.id}
              onClick={() => onDelete(appointment.id)}
              data-testid="modal-delete-appointment"
              className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              {deletingId === appointment.id ? "מוחק…" : "מחיקת תור"}
            </Button>
          )}
        </div>

        {hasPhone && service && (
          <div className="rounded-2xl border border-black/8 bg-neutral-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-charcoal">WhatsApp</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowWhatsAppMenu((current) => !current)}
                data-testid="modal-whatsapp-menu-toggle"
              >
                {showWhatsAppMenu ? "סגירת תפריט" : "שליחת הודעה"}
              </Button>
            </div>

            {showWhatsAppMenu && (
              <ul
                className="mt-4 space-y-2"
                data-testid="modal-whatsapp-template-menu"
              >
                {TEMPLATE_ORDER.map((templateType) => (
                  <li key={templateType}>
                    <button
                      type="button"
                      onClick={() => handleWhatsAppTemplate(templateType)}
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-right text-sm font-semibold text-charcoal transition-colors hover:border-black/20 hover:bg-neutral-50"
                      data-testid={`modal-whatsapp-template-${templateType}`}
                    >
                      {WHATSAPP_MANUAL_TEMPLATE_LABELS[templateType]}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 w-full sm:w-auto"
              onClick={() => handleWhatsAppTemplate("reminder")}
              data-testid="modal-send-reminder-button"
            >
              שליחת תזכורת
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
