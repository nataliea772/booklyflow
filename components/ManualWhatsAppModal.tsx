"use client";

import { useEffect } from "react";
import Button from "@/components/Button";

type ManualWhatsAppModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description: string;
  whatsappLink?: string;
  actionLabel?: string;
};

export default function ManualWhatsAppModal({
  open,
  onClose,
  title = "שליחה ב-WhatsApp",
  description,
  whatsappLink,
  actionLabel = "שליחה ב-WhatsApp",
}: ManualWhatsAppModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
      onClick={onClose}
      data-testid="manual-whatsapp-modal-overlay"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-whatsapp-modal-title"
        className="relative z-[1] w-full max-w-md rounded-3xl border border-black/15 bg-white p-6 shadow-[var(--card-shadow-lg)] sm:p-8"
        onClick={(event) => event.stopPropagation()}
        data-testid="manual-whatsapp-modal"
      >
        <h2
          id="manual-whatsapp-modal-title"
          className="text-center text-xl font-extrabold text-charcoal"
          data-testid="manual-whatsapp-modal-title"
        >
          {title}
        </h2>

        <p
          className="mt-4 text-center text-sm leading-relaxed text-muted sm:text-base"
          data-testid="manual-whatsapp-modal-description"
        >
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-charcoal px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-black/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg sm:w-auto"
              data-testid="manual-whatsapp-send-button"
            >
              {actionLabel}
            </a>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={onClose}
            data-testid="manual-whatsapp-close-button"
          >
            סגירה
          </Button>
        </div>
      </div>
    </div>
  );
}
