"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import { Loader2, Settings2, FormInput, Save, ArrowLeft } from "lucide-react";

// Importation des composants de steps
import Stepper from "../../create/Stepper";
import StepGeneralInfo from "../../create/StepperGlobal";
import StepPlanning from "../../create/steps/StepPlanning";
import StepOrganisation from "../../create/steps/StepOrganisation";
import StepDomaines from "../../create/steps/StepDomaines";
import StepDetailsChallenge from "../../create/steps/StepInfo";
import Step2ChallengeForm from "@/app/components/challenge/Step2ChallengeForm";

import domainesJSON from "@/domaines.json";

interface EditChallengeClientProps {
  challengeId: string;
}

export default function EditChallengeClient({
  challengeId,
}: EditChallengeClientProps) {
  const router = useRouter();

  // États de gestion de l'interface
  const [activeTab, setActiveTab] = useState<"infos" | "form">("infos");
  const [subStep, setSubStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États des données
  const [challenge, setChallenge] = useState<any>(null);
  const [jurys, setJurys] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  /**
   * Parse les données JSON ou les objets du backend pour les adapter aux composants de création
   */
  const parseBackendData = (val: any) => {
    if (!val) return [""];
    // Si c'est déjà un tableau, on le retourne
    if (Array.isArray(val)) return val;
    // Si c'est une chaîne JSON (comme votre champ 'principe')
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [val];
      }
    }
    // Si c'est un objet (comme vos champs 'recompense' ou 'critereevaluation')
    if (typeof val === "object") {
      return Object.values(val);
    }
    return [val];
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Note: l'endpoint est bien /challenge/${id} selon votre route Laravel
        const [challengeRes, jurysRes] = await Promise.all([
          apiFetch(`/challenge/${challengeId}`),
          apiFetch("/users"),
        ]);

        if (challengeRes.statut === 200) {
          const data = challengeRes.data;

          // Hydratation précise selon votre structure JSON fournie
          const hydratedChallenge = {
            ...data,
            // Conversion des objets/JSON strings en tableaux pour les inputs dynamiques
            principe: parseBackendData(data.principe),
            recompense: parseBackendData(data.recompense),
            critereevaluation: parseBackendData(data.critereevaluation),
            publiccible: parseBackendData(data.publiccible),
            nombregagnant: parseBackendData(data.nombregagnant),
            // Extraction des IDs des domaines depuis la relation pivot
            domaines: data.domaines?.map((d: any) => d.id) || [],
            // Mapping du type d'évaluation (ex: "hybride" -> "Hybride")
            typeevaluation: data.typeevaluation?.type
              ? data.typeevaluation.type.charAt(0).toUpperCase() +
                data.typeevaluation.type.slice(1)
              : "Jury",
            site: data.site || "Talent innovant",
            nombrecontribution: data.nombrecontribution,
            details: data?.details,
          };

          setChallenge(hydratedChallenge);
          setJurys(jurysRes?.data || []);

          // Hydratation du formulaire dynamique (fields)
          if (data.fields) {
            setFields(
              data.fields.map((f: any) => ({
                id: f.id,
                label: f.label,
                type: f.type,
                is_required: !!f.is_required,
                options: f.option ? parseBackendData(f.option) : [],
              })),
            );
          }
        } else {
          toast.error(
            challengeRes.message || "Impossible de charger le challenge",
          );
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
        toast.error("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [challengeId]);

  const getTypeEvaluationId = (type: string): string => {
    const mapping: Record<string, string> = {
      Jury: "1",
      Vote: "2",
      Hybride: "3",
      hybride: "3",
    };
    return mapping[type] || "1";
  };

  const handleUpdate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData();

    // 1. Champs simples
    const simpleFields = [
      "titre",
      "theme",
      "description",
      "datefininscription",
      "datelancement",
      "datefin",
      "site",
      "lieu",
      "region",
      "ville",
      "format",
      "nombrecontribution",
      "objectif",
      "details",
      "jury_id",
      "portee_id",
    ];

    simpleFields.forEach((key) => {
      if (challenge[key] !== undefined && challenge[key] !== null) {
        formData.append(key, challenge[key].toString());
      }
    });

    formData.append("is_official", challenge.is_official ? "1" : "0");
    formData.append(
      "typeevaluation_id",
      getTypeEvaluationId(challenge.typeevaluation),
    );

    // 2. Image
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    // 3. Tableaux
    const arrays = {
      nombregagnant: challenge.nombregagnant,
      principe: challenge.principe,
      recompense: challenge.recompense,
      critereevaluation: challenge.critereevaluation,
      publiccible: challenge.publiccible,
      domaines: challenge.domaines,
      nombrecontribution: challenge?.nombrecontribution,
      details: challenge?.details,
    };

    Object.entries(arrays).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item !== "" && item !== null)
            formData.append(`${key}[${index}]`, item.toString());
        });
      }
    });

    // 4. Formulaire dynamique
    fields.forEach((field, index) => {
      if (field.label) {
        if (field.id) {
          formData.append(`fields[${index}][id]`, field.id.toString());
        }

        formData.append(`fields[${index}][label]`, field.label);
        formData.append(`fields[${index}][type]`, field.type);
        formData.append(
          `fields[${index}][is_required]`,
          field.is_required ? "1" : "0",
        );
        if (field.options && field.options.length > 0) {
          field.options.forEach((opt: string, optIdx: number) => {
            if (opt)
              formData.append(`fields[${index}][options][${optIdx}]`, opt);
          });
        }
      }
    });

    try {
      const response = await apiFetch(`/challenge/update/${challengeId}`, {
        method: "POST",
        body: formData,
      });

      if (response.statut === 200 || response.statut === 201) {
        toast.success("Challenge mis à jour avec succès !");
        router.push("/home-entreprise/Challenges");
      } else {
        toast.error(response.message || "Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur réseau lors de la sauvegarde");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-orange-700" size={40} />
        <p className="text-slate-500 font-bold animate-pulse text-[10px] tracking-widest uppercase">
          Chargement des données du challenge...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Modifier le Challenge
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Challenge :{" "}
                <span className="text-orange-700">
                  {challenge.titre?.length > 30
                    ? challenge.titre?.substring(0, 30) + "..."
                    : challenge.titre}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-md text-xs font-black tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            METTRE À JOUR
          </button>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-t-xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab("infos")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${
              activeTab === "infos"
                ? "border-orange-700 text-orange-700 bg-orange-50/30"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings2 size={18} /> 1. Structure du Challenge
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${
              activeTab === "form"
                ? "border-orange-700 text-orange-700 bg-orange-50/30"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FormInput size={18} /> 2. Formulaire Candidat
          </button>
        </div>

        <div className="bg-white border-x border-b border-slate-200 rounded-b-xl shadow-sm p-6 md:p-12">
          {activeTab === "infos" ? (
            <div className="animate-in fade-in duration-500">
              <Stepper
                currentStep={1}
                currentSubStep={subStep}
                totalSubSteps={5}
                mainStepTitle="Mode Édition"
              />

              <div className="mt-12">
                {subStep === 1 && (
                  <StepGeneralInfo
                    data={challenge}
                    onChange={setChallenge}
                    photoFile={photoFile}
                    setPhotoFile={setPhotoFile}
                    onNext={() => setSubStep(2)}
                  />
                )}
                {subStep === 2 && (
                  <StepPlanning
                    data={challenge}
                    onChange={setChallenge}
                    onNext={() => setSubStep(3)}
                    onBack={() => setSubStep(1)}
                  />
                )}
                {subStep === 3 && (
                  <StepOrganisation
                    data={challenge}
                    onChange={setChallenge}
                    jurys={jurys}
                    onNext={() => setSubStep(4)}
                    onBack={() => setSubStep(2)}
                  />
                )}
                {subStep === 4 && (
                  <StepDomaines
                    data={challenge}
                    onChange={setChallenge}
                    domaines={domainesJSON}
                    onNext={() => setSubStep(5)}
                    onBack={() => setSubStep(3)}
                  />
                )}
                {subStep === 5 && (
                  <StepDetailsChallenge
                    data={challenge}
                    onChange={setChallenge}
                    onNext={() => setActiveTab("form")}
                    onBack={() => setSubStep(4)}
                    isSubmitting={isSubmitting}
                    onSubmit={handleUpdate}
                    forCreate={false}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="mb-10 p-5 bg-orange-50 border-l-4 border-orange-700 rounded-r-xl shadow-sm">
                <h4 className="text-orange-900 font-bold text-sm mb-1 uppercase tracking-tight">
                  Configuration du Formulaire
                </h4>
                <p className="text-orange-700 text-xs leading-relaxed">
                  Modifiez les questions posées aux candidats. Toute
                  modification ici remplacera les champs actuels lors de la
                  sauvegarde.
                </p>
              </div>

              <Step2ChallengeForm
                fields={fields}
                setFields={setFields}
                onBack={() => setActiveTab("infos")}
                onSubmit={handleUpdate}
                isSubmitting={isSubmitting}
                forCreate={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
