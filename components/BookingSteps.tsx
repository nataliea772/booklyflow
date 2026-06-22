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
                ? "border-[#f9a8d4]/50 bg-gradient-to-bl from-[#fff1f7] to-[#fffafc] shadow-sm ring-1 ring-[#f9a8d4]/35"
                : isComplete
                  ? "border-rose/20 bg-[#fff1f7]/80"
                  : "border-rose/10 bg-white/80"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                  isActive
                    ? "btn-gradient text-white shadow-md"
                    : isComplete
                      ? "bg-rose text-white shadow-sm"
                      : "bg-[#fff1f7] text-charcoal"
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
