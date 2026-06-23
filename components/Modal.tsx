"use client";

import { type ReactNode, useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  testId?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  testId,
}: ModalProps) {
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
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
      onClick={onClose}
      data-testid={testId}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-[1] flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-[var(--card-shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-4 sm:px-6">
          <h2
            id="modal-title"
            className="text-lg font-extrabold text-charcoal sm:text-xl"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-semibold text-charcoal transition-colors hover:bg-neutral-50"
            aria-label="סגירה"
            data-testid="modal-close-button"
          >
            סגירה
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
