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
    <ol className="mb-8 grid gap-2 sm:grid-cols-3 sm:gap-3">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isComplete = step.number < currentStep;

        return (
          <li
            key={step.number}
            className={`rounded-2xl border px-3 py-3 transition-all duration-300 sm:px-4 sm:py-3.5 ${
              isActive
                ? "border-black/20 bg-neutral-50 shadow-sm ring-1 ring-black/10"
                : isComplete
                  ? "border-black/10 bg-neutral-50/80"
                  : "border-black/8 bg-white/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                  isActive
                    ? "bg-charcoal text-white shadow-sm"
                    : isComplete
                      ? "bg-charcoal text-white shadow-sm"
                      : "bg-neutral-100 text-charcoal"
                }`}
              >
                {isComplete ? "✓" : step.number}
              </span>
              <span
                className={`text-xs font-bold sm:text-sm ${
                  isActive ? "text-charcoal" : "text-muted"
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
