"use client";

export default function StepperInternal({ step }: { step: number }) {
  const steps = ["Infos", "Planning", "Organisation", "Domaines"];

  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${step >= i ? "bg-orange-700 text-white" : "bg-gray-200 text-gray-500"}`}
          >
            {i + 1}
          </div>

          <span
            className={`ml-2 text-sm ${
              step >= i ? "text-orange-700" : "text-gray-500"
            }`}
          >
            {label}
          </span>

          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-4 bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
