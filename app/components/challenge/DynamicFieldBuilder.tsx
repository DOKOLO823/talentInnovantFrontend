"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

const FIELD_TYPES = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
  { value: "file", label: "Document" },
  { value: "select", label: "Liste déroulante" },
  { value: "checkbox", label: "Cases à cocher" },
];

export default function DynamicFieldBuilder({
  fields,
  setFields,
}: any) {

  /* ===== AJOUT AUTO D’UN CHAMP ===== */
  useEffect(() => {
    if (fields.length === 0) {
      setFields([
        {
          label: "",
          type: "text",
          is_required: true,
          options: [],
        },
      ]);
      return;
    }

    const last = fields[fields.length - 1];
    if (last.label !== "") {
      setFields([
        ...fields,
        {
          label: "",
          type: "text",
          is_required: true,
          options: [],
        },
      ]);
    }
  }, [fields]);

  const updateField = (index: number, key: string, value: any) => {
    const copy = [...fields];
    copy[index][key] = value;

    // Reset options si le type n'en a pas besoin
    if (key === "type" && !["select", "checkbox"].includes(value)) {
      copy[index].options = [];
    }

    setFields(copy);
  };

  const removeField = (index: number) => {
    const copy = fields.filter((_: any, i: number) => i !== index);
    setFields(copy);
  };

  /* ===== OPTIONS ===== */
  const addOption = (index: number) => {
    const copy = [...fields];
    copy[index].options = [...(copy[index].options || []), ""];
    setFields(copy);
  };

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const copy = [...fields];
    copy[fieldIndex].options[optionIndex] = value;
    setFields(copy);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const copy = [...fields];
    copy[fieldIndex].options = copy[fieldIndex].options.filter(
      (_: any, i: number) => i !== optionIndex
    );
    setFields(copy);
  };

  return (
    <div className="space-y-6">

      {fields.map((field: any, index: number) => (
        <div
          key={index}
          className="relative bg-white border border-gray-400 rounded-2xl p-6 shadow-sm"
        >
          {/* SUPPRIMER */}
          {fields.length > 1 && (
            <button
              type="button"
              onClick={() => removeField(index)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* BASE */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Libellé du champ</label>
              <input
                className="input"
                placeholder="Ex : Titre du projet"
                value={field.label}
                onChange={e =>
                  updateField(index, "label", e.target.value)
                }
              />
            </div>

            <div>
              <label className="label">Type de champ</label>
              <select
                className="select"
                value={field.type}
                onChange={e =>
                  updateField(index, "type", e.target.value)
                }
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* OPTIONS POUR SELECT / CHECKBOX */}
          {(field.type === "select" || field.type === "checkbox") && (
            <div className="mt-6">
              <label className="label text-sm">
                Options ({field.type === "select" ? "choix unique" : "choix multiples"})
              </label>

              <div className="space-y-3 mt-3">
                {(field.options || []).map((opt: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="input flex-1"
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={e =>
                        updateOption(index, i, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index, i)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addOption(index)}
                className="add-btn mt-3"
              >
                <Plus size={14} /> Ajouter une option
              </button>
            </div>
          )}

          {/* OBLIGATOIRE */}
          <div className="mt-5 flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={e =>
                updateField(index, "is_required", e.target.checked)
              }
            />
            <span className="text-sm text-gray-600">
              Champ obligatoire
            </span>
          </div>
        </div>
      ))}

      {/* AIDE */}
      <p className="text-xs text-gray-400">
        Un nouveau champ apparaît automatiquement lorsque le précédent est renseigné.
      </p>
    </div>
  );
}
