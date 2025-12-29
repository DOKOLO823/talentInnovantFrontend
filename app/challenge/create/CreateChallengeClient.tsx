"use client";

import { useState } from "react";
import Stepper from "./Stepper";
import Step1ChallengeInfo from "./Step1ChallengeInfo";
import Step2FormSelector from "./Step2FormSelector";
import BackButton from "@/app/components/BackButton";
import Step2ChallengeForm from "@/app/components/challenge/Step2ChallengeForm";

export default function CreateChallengeClient({ domaines, jurys }: any) {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<"select" | "form">("select");

  const [challenge, setChallenge] = useState<any>({ site: "sur" });
  const [fields, setFields] = useState<any[]>([]);

  const isInternal = challenge.site === "sur";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <BackButton />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {isInternal && <Stepper step={step} />}

        <div className="mt-8 bg-white rounded-xl shadow-xl p-8">

          {step === 1 && (
            <Step1ChallengeInfo
              domaines={domaines}
              jurys={jurys}
              data={challenge}
              onChange={setChallenge}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && isInternal && subStep === "select" && (
            <Step2FormSelector
            onBack={() => setStep(1)}
              onEmpty={() => {
                setFields([]);
                setSubStep("form");
              }}
              onTemplate={(tplFields: any[]) => {
                setFields(tplFields);
                setSubStep("form");
              }}
            />
          )}

          {step === 2 && isInternal && subStep === "form" && (
            <Step2ChallengeForm
              fields={fields}
              setFields={setFields}
              onBack={() => setSubStep("select")}
              onSubmit={() => {
                console.log("CHALLENGE", challenge);
                console.log("FIELDS", fields);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
