"use client";

import { Plus, Trash2, GripVertical, Info, Check } from "lucide-react";
import { useEffect } from "react";

const FIELD_TYPES = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
  { value: "file", label: "Document (PDF, etc.)" },
  { value: "select", label: "Liste déroulante" },
  { value: "checkbox", label: "Cases à cocher" },
];

export default function DynamicFieldBuilder({ fields, setFields }: any) {
  
  useEffect(() => {
    if (fields.length === 0) {
      setFields([{ label: "", type: "text", is_required: true, options: [] }]);
      return;
    }

    const lastField = fields[fields.length - 1];
    if (lastField.label && lastField.label.trim() !== "") {
      setFields([
        ...fields,
        { label: "", type: "text", is_required: true, options: [] }
      ]);
    }
  }, [fields, setFields]);

  const updateField = (index: number, key: string, value: any) => {
    const copy = [...fields];
    copy[index][key] = value;
    if (key === "type" && !["select", "checkbox"].includes(value)) {
      copy[index].options = [];
    }
    setFields(copy);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_: any, i: number) => i !== index));
    }
  };

  const addOption = (index: number) => {
    const copy = [...fields];
    copy[index].options = [...(copy[index].options || []), ""];
    setFields(copy);
  };

  const updateOption = (fIdx: number, oIdx: number, val: string) => {
    const copy = [...fields];
    copy[fIdx].options[oIdx] = val;
    setFields(copy);
  };

  const removeOption = (fIdx: number, oIdx: number) => {
    const copy = [...fields];
    copy[fIdx].options = copy[fIdx].options.filter((_: any, i: number) => i !== oIdx);
    setFields(copy);
  };

  // Styles Enterprise Edition
  const labelStyle = "text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2 block";
  const inputStyle = "w-full bg-white border border-slate-300 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700/20 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      {fields.map((field: any, index: number) => (
        <div
          key={index}
          className="relative bg-white border border-slate-200 rounded-md p-6 transition-all hover:border-slate-300 shadow-sm"
        >
          {/* Badge et Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <GripVertical size={14} className="text-slate-300" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Champ de saisie #{index + 1}
              </span>
            </div>
            {fields.length > 1 && field.label && (
              <button
                type="button"
                onClick={() => removeField(index)}
                className="text-slate-400 hover:text-red-600 p-1 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Libellé de la question</label>
              <input
                className={inputStyle}
                placeholder="Ex: Présentez votre solution en 2 phrases"
                value={field.label}
                onChange={e => updateField(index, "label", e.target.value)}
              />
            </div>

            <div>
              <label className={labelStyle}>Type de réponse attendue</label>
              <select
                className={inputStyle}
                value={field.type}
                onChange={e => updateField(index, "type", e.target.value)}
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Options de sélection */}
          {(field.type === "select" || field.type === "checkbox") && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className={labelStyle}>Options disponibles</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {(field.options || []).map((opt: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-md p-2 text-sm focus:bg-white focus:border-orange-700 outline-none"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e => updateOption(index, i, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index, i)}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(index)}
                  className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-700 border border-dashed border-orange-200 rounded-md p-2 hover:bg-orange-50 transition-all"
                >
                  <Plus size={14} strokeWidth={3} /> Ajouter un choix
                </button>
              </div>
            </div>
          )}

          {/* CHECKBOX OBLIGATOIRE - FIX ORANGE-700 */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:bg-orange-700 checked:border-orange-700 transition-all accent-orange-700"
                  checked={field.is_required}
                  onChange={e => updateField(index, "is_required", e.target.checked)}
                />
                <Check className="absolute w-3 h-3 text-white left-0.5 pointer-events-none hidden peer-checked:block" strokeWidth={4} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-tight text-slate-500 group-hover:text-orange-700 transition-colors">
                Marquer comme champ obligatoire
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}