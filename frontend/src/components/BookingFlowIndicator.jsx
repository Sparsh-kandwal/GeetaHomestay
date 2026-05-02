const steps = [
  { id: 1, label: "Browse" },
  { id: 2, label: "Details" },
  { id: 3, label: "Pay" },
  { id: 4, label: "Done" },
];

const BookingFlowIndicator = ({ currentStep = 1, compact = false }) => {
  return (
    <div
      className={`rounded-[24px] border border-[#d8d0c1] bg-white/88 shadow-[0_14px_30px_rgba(44,62,45,0.06)] ${
        compact ? "p-3" : "p-4 sm:p-5"
      }`}
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div key={step.id} className="min-w-0 text-center" title={step.label}>
              <div
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold sm:h-10 sm:w-10 sm:text-sm ${
                  isComplete
                    ? "border-[#1f5b52] bg-[#1f5b52] text-white"
                    : isActive
                      ? "border-[#c97953] bg-[#fff4ee] text-[#8b4e31]"
                      : "border-[#d8d0c1] bg-[#f9f4eb] text-[#8e8778]"
                }`}
              >
                {isComplete ? "✓" : step.id}
              </div>
              <p
                className={`mt-2 truncate text-[11px] font-semibold sm:text-xs ${
                  isActive || isComplete ? "text-[#17322e]" : "text-[#7c7567]"
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingFlowIndicator;
