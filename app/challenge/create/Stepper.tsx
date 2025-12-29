"use client";

export default function Stepper({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-10">
      {[
        { n: 1, label: "Informations" },
        { n: 2, label: "Formulaire" },
      ].map(s => (
        <div key={s.n} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
            ${step >= s.n ? "bg-orange-700 text-white" : "bg-gray-200 text-gray-500"}`}>
            {s.n}
          </div>
          <span className={step >= s.n ? "text-orange-700" : "text-gray-500"}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
