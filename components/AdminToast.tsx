"use client";

type AdminToastProps = {
  message: string;
  type: "success" | "error";
  visible: boolean;
};

export default function AdminToast({ message, type, visible }: AdminToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
      role="status"
      aria-live="polite"
      data-testid="admin-save-toast"
    >
      <div
        className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur-md ${
          type === "success"
            ? "border border-emerald-200/80 bg-emerald-50/95 text-emerald-900"
            : "border border-red-200/80 bg-red-50/95 text-red-800"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
