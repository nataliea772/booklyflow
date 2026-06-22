type BookingStepsProps = {
  currentStep: 1 | 2 | 3;
};

const steps = [
  { number: 1, label: "בחירת שירות" },
  { number: 2, label: "תאריך ושעה" },
  { number: 3, label: "פרטי לקוח" },
] as const;

export default function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <ol className="mb-10 grid gap-3 sm:grid-cols-3">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <li
            key={step.number}
            className={`relative overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-300 ${
              isActive
                ? "border-primary/25 bg-white shadow-[var(--card-shadow-lg)] ring-2 ring-primary/12"
                : isComplete
                  ? "border-emerald-200/80 bg-emerald-50/60"
                  : "border-primary/10 bg-white/50"
            }`}
          >
            {isActive && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-l from-[#6d28d9] to-[#8b5cf6]" />
            )}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                  isActive
                    ? "btn-gradient text-white shadow-md shadow-primary/30"
                    : isComplete
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-primary-soft text-primary"
                }`}
              >
                {isComplete ? "✓" : step.number}
              </span>
              <span
                className={`text-sm font-bold ${
                  isActive ? "text-[#111827]" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
