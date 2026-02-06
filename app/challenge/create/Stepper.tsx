"use client";

import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepperProps {
  currentStep: number;
  currentSubStep?: number;
  totalSubSteps?: number;
  mainStepTitle?: string;
}

export default function Stepper({ 
  currentStep, 
  currentSubStep, 
  totalSubSteps,
  mainStepTitle 
}: StepperProps) {
  
  const mainSteps: Step[] = [
    { 
      number: 1, 
      title: "Configuration", 
      description: "Paramètres du challenge" 
    },
    { 
      number: 2, 
      title: "Formulaire", 
      description: "Champs de participation" 
    },
  ];

  return (
    <div className="w-full mb-10">
      {/* STEPPER PRINCIPAL STYLE 'CORPORATE' */}
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-10">
        {mainSteps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center relative z-10">
                {/* Cercle d'étape */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    text-sm font-black transition-all duration-500 border-2
                    ${
                      isCompleted
                        ? "bg-orange-700 border-orange-700 text-white shadow-sm"
                        : isActive
                        ? "bg-white border-orange-700 text-orange-700 ring-4 ring-orange-700/10"
                        : "bg-white border-slate-200 text-slate-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    `0${step.number}`
                  )}
                </div>
                
                {/* Labels */}
                <div className="absolute top-12 text-center min-w-[140px]">
                  <p className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                    isActive || isCompleted ? "text-slate-900" : "text-slate-400"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter mt-0.5 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Ligne de connexion fine */}
              {index < mainSteps.length - 1 && (
                <div className="flex-1 h-[1px] mx-6 bg-slate-200 relative -mt-5">
                  <div
                    className={`
                      absolute inset-0 bg-orange-700 transition-all duration-700 ease-in-out
                      ${isCompleted ? "w-full" : "w-0"}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BARRE DE PROGRESSION SECONDAIRE (SUB-STEPS) */}
      {currentStep === 1 && totalSubSteps && currentSubStep && (
        <div className="max-w-xl mx-auto mt-16">
          <div className="bg-white border border-slate-200 rounded-md p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-700 animate-pulse" />
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {mainStepTitle || `Module ${currentSubStep} / ${totalSubSteps}`}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {Math.round((currentSubStep / totalSubSteps) * 100)}%
              </span>
            </div>
            
            {/* Track de progression */}
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-700 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                style={{ width: `${(currentSubStep / totalSubSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}