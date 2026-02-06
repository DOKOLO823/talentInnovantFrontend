"use client";

import { useState } from "react";
import { Loader2, Eye, Rocket, ArrowLeft, ClipboardEdit } from "lucide-react";
import DynamicFieldBuilder from "./DynamicFieldBuilder";
import FormPreviewModal from "@/app/components/modals/FormPreviewModal";
import toast, { Toaster } from "react-hot-toast";

interface Step2ChallengeFormProps {
  fields: any[];
  setFields: (fields: any[]) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  forCreate: Boolean;
}

export default function Step2ChallengeForm({
  fields,
  setFields,
  onBack,
  onSubmit,
  isSubmitting,
  forCreate
}: Step2ChallengeFormProps) {
  const [openPreview, setOpenPreview] = useState(false);

  const handleSubmit = () => {
    const validFields = fields.filter((f) => f.label.trim() !== "");
    
    if (validFields.length === 0) {
      toast.error("Veuillez configurer au moins un champ de saisie.");
      return;
    }
    
    onSubmit();
  };

  const cardStyle = "bg-white border border-slate-200 rounded-md p-6 shadow-sm";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardEdit size={20} className="text-slate-400" />
          Conception du Formulaire
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Structurez les données requises pour la soumission des projets participants.
        </p>
      </div>

      {/* BUILDER AREA */}
      <div className={cardStyle}>
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-900">
            Configuration des champs de saisie
          </h3>
        </div>
        
        {/* Note: Assurez-vous que DynamicFieldBuilder utilise 'accent-orange-700' sur ses inputs checkbox */}
        <DynamicFieldBuilder fields={fields} setFields={setFields} />
      </div>

      {/* ACTION FOOTER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft size={14} />
          Retour aux paramètres
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setOpenPreview(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-md border border-slate-300 text-[12px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            disabled={isSubmitting}
          >
            <Eye size={16} />
            Aperçu
          </button>

         {forCreate &&  <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-w-[220px] bg-orange-700 hover:bg-orange-800 text-white px-8 py-2.5 rounded-md text-[12px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-orange-200" />
                Publication...
              </>
            ) : (
              <>
                <Rocket size={16} />
                Publier le challenge
              </>
            )}
          </button>}
        </div>
      </div>

      <FormPreviewModal
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        fields={fields.filter((f) => f.label.trim() !== "")}
      />
    </div>
  );
}