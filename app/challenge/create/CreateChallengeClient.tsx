"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import Stepper from "./Stepper";
import BackButton from "@/app/components/BackButton";

// Importation des composants de steps
import StepGeneralInfo from "./StepperGlobal";
import StepPlanning from "./steps/StepPlanning";
import StepOrganisation from "./steps/StepOrganisation";
import StepDomaines from "./steps/StepDomaines";
import StepDetailsChallenge from "./steps/StepInfo"; // Votre page "Détails structurels"
import Step2FormSelector from "./Step2FormSelector";
import Step2ChallengeForm from "@/app/components/challenge/Step2ChallengeForm";

import domainesJSON from "@/domaines.json";
import { details } from "framer-motion/client";

interface CreateChallengeClientProps {
  jurys: Array<{ id: number; name: string }>;
}

export default function CreateChallengeClient({
  jurys,
}: CreateChallengeClientProps) {
  const router = useRouter();

  const [mainStep, setMainStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [formSubStep, setFormSubStep] = useState<"select" | "form">("select");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [challenge, setChallenge] = useState<any>({
    site: "talent innovant", // Garder cette valeur exacte
    typeevaluation: "Jury",
    nombregagnant: [""],
    limite_soumissions: 1,
    portee_id: 1,
    is_official: false,
    domaines: [],
    // Initialisation des tableaux pour éviter les erreurs de mapping
    principe: [""],
    recompense: [""],
    critereevaluation: [""],
    publiccible: [""],
  });

  const [fields, setFields] = useState<any[]>([]);

  // Correction ici : la condition doit matcher la valeur de l'input site
  const isInternal = challenge.site?.toLowerCase() === "talent innovant";
  const totalSubSteps = 5;

  const subStepTitles: Record<number, string> = {
    1: "Informations générales",
    2: "Planning et dates",
    3: "Organisation et évaluation",
    4: "Domaines du challenge",
    5: "Règles et récompenses",
  };

  // ==================== NAVIGATION ====================

  const goToNextSubStep = () => {
    if (subStep < totalSubSteps) {
      setDirection("forward");
      setSubStep(subStep + 1);
    } else {
      // Si on arrive au bout du Step 1
      if (isInternal) {
        setDirection("forward");
        setMainStep(2); // On passe à la configuration du formulaire
        setFormSubStep("select");
      } else {
        handleSubmit(); // Publication directe
      }
    }
  };

  const goToPreviousSubStep = () => {
    if (subStep > 1) {
      setDirection("backward");
      setSubStep(subStep - 1);
    }
  };

  const goBackToStep1 = () => {
    setDirection("backward");
    setMainStep(1);
    setSubStep(totalSubSteps);
  };

  // ==================== SOUMISSION (API) ====================

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // ── Champs de base ──
      formData.append("titre", challenge.titre || "");
      formData.append("theme", challenge.theme || "");
      formData.append("description", challenge.description || "");
      formData.append("datefininscription", challenge.datefininscription || "");
      formData.append("datelancement", challenge.datelancement || "");
      formData.append("datefin", challenge.datefin || "");
      formData.append("site", challenge.site || "talent innovant");
      formData.append("is_official", challenge.is_official ? "1" : "0");
      formData.append(
        "typeevaluation_id",
        getTypeEvaluationId(challenge.typeevaluation),
      );
      formData.append("portee_id", (challenge.portee_id ?? 1).toString());
      formData.append(
        "nombrecontribution",
        (challenge.nombrecontribution || 1).toString(),
      );
      formData.append("details", challenge.details || "");

      if (challenge.pack) formData.append("pack", challenge.pack);
      if (challenge.jury_id)
        formData.append("jury_id", challenge.jury_id.toString());
      if (challenge.lieu) formData.append("lieu", challenge.lieu);
      if (challenge.region) formData.append("region", challenge.region);
      if (challenge.ville) formData.append("ville", challenge.ville);
      if (challenge.format) formData.append("format", challenge.format);

      if (photoFile) formData.append("photo", photoFile);

      // ── Helper pour tableaux ──
      const appendArray = (key: string, data: any[]) => {
        if (!data || !Array.isArray(data)) return;
        const clean = data.filter((item) => item && String(item).trim() !== "");
        clean.forEach((item, idx) =>
          formData.append(`${key}[${idx}]`, String(item)),
        );
      };

      // ── Tableaux simples ──
      appendArray("nombregagnant", challenge.nombregagnant);
      appendArray("domaines", challenge.domaines);

      // ── NOUVELLES TABLES ──

      // Jurys (multi)
      if (challenge.jurys && Array.isArray(challenge.jurys)) {
        challenge.jurys.forEach((juryId: number, idx: number) => {
          formData.append(`jurys[${idx}]`, String(juryId));
        });
      }

      // Régions
      if (challenge.regions && Array.isArray(challenge.regions)) {
        challenge.regions.forEach((region: string, idx: number) => {
          if (region.trim()) formData.append(`regions[${idx}]`, region);
        });
      }

      // Règles
      const reglesClean = (challenge.regles ?? []).filter(
        (r: string) => r && r.trim(),
      );
      reglesClean.forEach((regle: string, idx: number) => {
        formData.append(`regles[${idx}]`, regle);
      });

      // Récompenses
      const recompClean = (challenge.recompenses ?? []).filter(
        (r: string) => r && r.trim(),
      );
      recompClean.forEach((r: string, idx: number) => {
        formData.append(`recompenses[${idx}]`, r);
      });

      // Objectifs
      const objectifsClean = (challenge.objectifs ?? []).filter(
        (o: string) => o && o.trim(),
      );
      objectifsClean.forEach((o: string, idx: number) => {
        formData.append(`objectifs[${idx}]`, o);
      });

      // Profils recherchés
      const profilsClean = (challenge.profils ?? []).filter(
        (p: string) => p && p.trim(),
      );
      profilsClean.forEach((p: string, idx: number) => {
        formData.append(`profils[${idx}]`, p);
      });

      // Critères avec coefficients
      if (challenge.criteres && Array.isArray(challenge.criteres)) {
        challenge.criteres
          .filter((c: any) => c.libelle && c.libelle.trim())
          .forEach((critere: any, idx: number) => {
            formData.append(`criteres[${idx}][libelle]`, critere.libelle);
            formData.append(
              `criteres[${idx}][coefficient]`,
              String(critere.coefficient ?? 1),
            );
          });
      }

      // ── Formulaire dynamique (Step 2) ──
      if (isInternal) {
        const cleanedFields = fields.filter(
          (f) => f.label && f.label.trim() !== "",
        );
        cleanedFields.forEach((field, index) => {
          formData.append(`fields[${index}][label]`, field.label);
          formData.append(`fields[${index}][type]`, field.type);
          formData.append(
            `fields[${index}][is_required]`,
            field.is_required ? "1" : "0",
          );
          if (field.options?.length) {
            const cleanOpts = field.options.filter(
              (o: string) => o && o.trim(),
            );
            cleanOpts.forEach((opt: string, optIdx: number) => {
              formData.append(`fields[${index}][options][${optIdx}]`, opt);
            });
          }
        });
      }

      const response = await apiFetch("/challenges", {
        method: "POST",
        body: formData,
      });

      if (response.statut === 200 || response.status === true) {
        toast.success("Challenge publié avec succès !");
        router.push("/home-entreprise/Challenges");
      } else {
        toast.error(response.message || "Erreur lors de la publication");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur réseau");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeEvaluationId = (type: string): string => {
    const mapping: Record<string, string> = {
      Jury: "2",
      Vote: "1",
      Hybride: "3",
    };
    return mapping[type] || "2";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <BackButton />
          {/* Affichage du Badge Mode */}
          {/* <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${isInternal ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                Mode: {isInternal ? 'Interne (Formulaire Talent)' : 'Externe'}
            </span> */}
        </div>

        <Stepper
          currentStep={mainStep}
          currentSubStep={mainStep === 1 ? subStep : undefined}
          totalSubSteps={totalSubSteps}
          mainStepTitle={
            mainStep === 1 ? subStepTitles[subStep] : "Configuration Formulaire"
          }
        />

        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-8 md:p-12 animate-fadeIn">
          {/* STEP 1 : LE TUNNEL D'INFOS (5 SOUS-ETAPES) */}
          {mainStep === 1 && (
            <>
              {subStep === 1 && (
                <StepGeneralInfo
                  data={challenge}
                  onChange={setChallenge}
                  photoFile={photoFile}
                  setPhotoFile={setPhotoFile}
                  photoPreview={photoPreview}
                  setPhotoPreview={setPhotoPreview}
                  onNext={() =>
                    challenge.titre && challenge.description
                      ? goToNextSubStep()
                      : toast.error("Titre et Description requis")
                  }
                />
              )}

              {subStep === 2 && (
                <StepPlanning
                  data={challenge}
                  onChange={setChallenge}
                  onNext={goToNextSubStep}
                  onBack={goToPreviousSubStep}
                />
              )}

              {subStep === 3 && (
                <StepOrganisation
                  data={challenge}
                  onChange={setChallenge}
                  // jurys={jurys}
                  onNext={goToNextSubStep}
                  onBack={goToPreviousSubStep}
                />
              )}

              {subStep === 4 && (
                <StepDomaines
                  data={challenge}
                  onChange={setChallenge}
                  domaines={domainesJSON}
                  onNext={goToNextSubStep}
                  onBack={goToPreviousSubStep}
                />
              )}

              {subStep === 5 && (
                <StepDetailsChallenge
                  data={challenge}
                  onChange={setChallenge}
                  onNext={goToNextSubStep} // Déclenche goToNextSubStep qui arbitre selon isInternal
                  onSubmit={handleSubmit}
                  onBack={goToPreviousSubStep}
                  isSubmitting={isSubmitting}
                  forCreate={true}
                />
              )}
            </>
          )}

          {/* STEP 2 : FORMULAIRE (UNIQUEMENT SI INTERNAL) */}
          {mainStep === 2 && isInternal && (
            <>
              {formSubStep === "select" && (
                <Step2FormSelector
                  onBack={goBackToStep1}
                  onEmpty={() => {
                    setFields([]);
                    setFormSubStep("form");
                  }}
                  onTemplate={(tplFields: any[]) => {
                    setFields(tplFields);
                    setFormSubStep("form");
                  }}
                />
              )}

              {formSubStep === "form" && (
                <Step2ChallengeForm
                  fields={fields}
                  setFields={setFields}
                  onBack={() => setFormSubStep("select")}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  forCreate={true}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
