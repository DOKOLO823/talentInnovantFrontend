"use client";

// steps/StepInfo.tsx  (aussi nommé StepDetailsChallenge)
// ── Règles, Récompenses, Objectifs, Profils recherchés ──
// Critères d'évaluation ont été déplacés dans StepOrganisation

import { useState } from "react";
import {
  Plus,
  Trash2,
  Info,
  AlertCircle,
  Loader2,
  ListOrdered,
  Trophy,
  Target,
  UserSearch,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface StepInfoProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void; // "continuer" (si internal → step formulaire, sinon submit)
  onSubmit: () => void; // submit direct (challenge externe)
  onBack: () => void;
  isSubmitting: boolean;
  forCreate?: boolean;
}

// ── Styles ──
const labelStyle =
  "block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2";
const inputStyle =
  "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all";
const cardStyle =
  "bg-white border border-slate-200 rounded-md p-6 shadow-sm space-y-4";
const sectionTitle =
  "text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4";
const errStyle =
  "flex items-center gap-1 text-red-600 text-[10px] font-bold mt-1";

// ── Composant liste dynamique réutilisable ──
function DynamicList({
  label,
  icon,
  items,
  onChange,
  placeholder,
  maxLength = 500,
  error,
}: {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  maxLength?: number;
  error?: string;
}) {
  const updateItem = (idx: number, val: string) => {
    const copy = [...items];
    copy[idx] = val;
    onChange(copy);
  };

  const addItem = () => onChange([...items, ""]);

  const removeItem = (idx: number) =>
    onChange(items.filter((_, i) => i !== idx));

  return (
    <div className={cardStyle}>
      <h3 className={sectionTitle}>
        {icon} {label}
      </h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-[10px] font-black text-slate-400 mt-3 w-5 shrink-0">
              {idx + 1}.
            </span>
            <textarea
              rows={2}
              maxLength={maxLength}
              className={`${inputStyle} resize-none flex-1 ${error ? "border-red-300" : ""}`}
              placeholder={placeholder}
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="mt-1 p-0 md:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-orange-400 text-slate-500 hover:text-orange-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>
      {error && (
        <p className={errStyle}>
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
export default function StepInfo({
  data,
  onChange,
  onNext,
  onSubmit,
  onBack,
  isSubmitting,
  forCreate,
}: StepInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isInterne = data.site?.toLowerCase() === "talent innovant";

  const update = (key: string, value: any) => {
    if (errors[key])
      setErrors((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    onChange({ ...data, [key]: value });
  };

  // Listes dynamiques — initialisation avec au moins 1 élément vide
  const regles = data.regles?.length ? data.regles : [""];
  const recompenses = data.recompenses?.length ? data.recompenses : [""];
  const objectifs = data.objectifs?.length ? data.objectifs : [""];
  const profils = data.profils?.length ? data.profils : [""];
  const searchParams = useSearchParams();
  const lieuParam = searchParams.get("lieu");

  // ── Validation ──
  const handleContinue = () => {
    const newErrors: Record<string, string> = {};

    // Au moins une règle renseignée
    const reglesFilled = (data.regles ?? []).filter((r: string) => r.trim());
    if (reglesFilled.length === 0 && lieuParam != "externe") {
      newErrors.regles = "Veuillez renseigner au moins une règle.";
    }

    // Au moins une récompense
    const recompFilled = (data.recompenses ?? []).filter((r: string) =>
      r.trim(),
    );
    if (recompFilled.length === 0) {
      newErrors.recompenses = "Veuillez renseigner au moins une récompense.";
    }

    // Longueurs max
    const tooLongRegle = (data.regles ?? []).find(
      (r: string) => r.length > 500,
    );
    if (tooLongRegle) newErrors.regles = "Une règle dépasse 500 caractères.";

    const tooLongRecomp = (data.recompenses ?? []).find(
      (r: string) => r.length > 500,
    );
    if (tooLongRecomp)
      newErrors.recompenses = "Une récompense dépasse 500 caractères.";

    const tooLongObjectif = (data.objectifs ?? []).find(
      (o: string) => o.length > 500,
    );
    if (tooLongObjectif)
      newErrors.objectifs = "Un objectif dépasse 500 caractères.";

    const tooLongProfil = (data.profils ?? []).find(
      (p: string) => p.length > 300,
    );
    if (tooLongProfil) newErrors.profils = "Un profil dépasse 300 caractères.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    // Si interne → formulaire dynamique (step 2) ; si externe → soumettre
    if (isInterne) {
      onNext();
    } else {
      onSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* ── En-tête ── */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Info size={20} className="text-slate-400" /> Détails du challenge
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Règles, récompenses, objectifs et profils recherchés.
        </p>
      </div>

      {/* ── RÈGLES ── */}
      <DynamicList
        label="Règles du challenge"
        icon={<ListOrdered size={16} className="text-orange-700" />}
        items={regles}
        onChange={(items) => update("regles", items)}
        placeholder="Ex: Le projet doit être inédit et non commercialisé..."
        maxLength={500}
        error={errors.regles}
      />

      {/* ── RÉCOMPENSES ── */}
      <DynamicList
        label="Récompenses"
        icon={<Trophy size={16} className="text-orange-700" />}
        items={recompenses}
        onChange={(items) => update("recompenses", items)}
        placeholder="Ex: 1er prix : 500 000 FCFA + Trophée..."
        maxLength={500}
        error={errors.recompenses}
      />

      {/* ── OBJECTIFS ── */}
      <DynamicList
        label="Objectifs du challenge"
        icon={<Target size={16} className="text-orange-700" />}
        items={objectifs}
        onChange={(items) => update("objectifs", items)}
        placeholder="Ex: Identifier les meilleurs talents en intelligence artificielle..."
        maxLength={500}
        error={errors.objectifs}
      />

      {/* ── PROFILS RECHERCHÉS ── */}
      <DynamicList
        label="Profils recherchés"
        icon={<UserSearch size={16} className="text-orange-700" />}
        items={profils}
        onChange={(items) => update("profils", items)}
        placeholder="Ex: Étudiants en informatique, Développeurs freelance..."
        maxLength={300}
        error={errors.profils}
      />

      {/* ── DÉTAILS SUPPLÉMENTAIRES ── */}
      <div className={cardStyle}>
        <div>
          <label className={labelStyle}>
            Détails supplémentaires (optionnel)
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            className={`${inputStyle} resize-none`}
            placeholder="Informations complémentaires, ressources utiles, contacts..."
            value={data.details || ""}
            onChange={(e) => update("details", e.target.value)}
          />
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            {(data.details || "").length}/1000
          </p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex justify-between items-center gap-x-1 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[10px] md:text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          ← Précédent
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className="bg-orange-700 text-white px-4 md:px-8 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all shadow-md active:scale-[0.98] flex items-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Publication...
            </>
          ) : isInterne ? (
            "Configurer le formulaire →"
          ) : (
            "Publier le challenge →"
          )}
        </button>
      </div>
    </div>
  );
}
