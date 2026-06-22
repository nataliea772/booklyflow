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
                ? "border-[#F9A8D4]/50 bg-gradient-to-bl from-[#FDF4FF] to-[#FFFDF8] shadow-sm ring-1 ring-[#E9D5FF]"
                : isComplete
                  ? "border-[#F9A8D4]/35 bg-[#FFF1F5]/80"
                  : "border-[rgba(190,24,93,0.08)] bg-white/70"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                  isActive
                    ? "btn-gradient text-white shadow-md"
                    : isComplete
                      ? "bg-[#BE185D] text-white shadow-sm"
                      : "bg-[#FDF4FF] text-[#581C87]"
                }`}
              >
                {isComplete ? "✓" : step.number}
              </span>
              <span
                className={`text-xs font-bold sm:text-sm ${
                  isActive ? "text-[#581C87]" : "text-[#6B7280]"
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
