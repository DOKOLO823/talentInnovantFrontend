import { useState, useEffect, useRef } from "react"; // Ajout de useRef
import { X, CheckCircle, Loader2, Send } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";

interface Challenge {
  id: number;
  title: string;
  image: string;
  entrepriseNom: string;
  entrepriseLogo: string;
  typeevaluation?: string;
  resultatdisponible?: string;
}

interface FormField {
  id: number;
  label: string;
  type: string;
  is_required: number;
  option: any;
}

interface ProjectSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
}

export default function ProjectSubmissionModal({
  isOpen,
  onClose,
  challenge,
}: ProjectSubmissionModalProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [submittedProjectId, setSubmittedProjectId] = useState<number | null>(
    null,
  );

  // Référence pour le conteneur scrollable
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le haut quand une erreur générale apparaît
  useEffect(() => {
    if (generalError && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [generalError]);

  const loadFields = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      const response = await apiFetch(`/challenges/champs/${challenge.id}`, {
        method: "GET",
      });

      if (response && response.statut === 200) {
        setFields(response.data.fields);
      } else {
        setGeneralError(
          response?.message || "Erreur lors du chargement des champs",
        );
      }
    } catch (error) {
      setGeneralError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fields.length === 0) {
      loadFields();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const value = formData[field.id];
      if (
        field.is_required &&
        (!value || (field.type === "file" && !value.name))
      ) {
        newErrors[field.id] = "Ce champ est requis";
      }
    });
    setErrors(newErrors);

    // Si erreurs locales, on scroll aussi vers le haut pour que l'utilisateur les voie
    if (Object.keys(newErrors).length > 0 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    setGeneralError("");

    const payload = new FormData();

    fields.forEach((field, index) => {
      payload.append(
        `responses[${index}][challenge_field_id]`,
        field.id.toString(),
      );
      payload.append(`responses[${index}][type]`, field.type);

      const value = formData[field.id];
      if (field.type === "file") {
        if (value instanceof File) {
          payload.append(`responses[${index}][value]`, value);
        }
      } else {
        payload.append(`responses[${index}][value]`, value || "");
      }
    });

    try {
      const response = await apiFetch(`/challenge/post/${challenge.id}`, {
        method: "POST",
        body: payload,
      });

      if (response && (response.statut === 200 || response.statut === 201)) {
        setSubmittedProjectId(response.data.id);
        setSuccess(true);
      } else if (response.statut === 422) {
        setGeneralError(response.errors || response.message);
      } else if (response.statut === 403) {
        setGeneralError(response.message);
      } else {
        setGeneralError(
          response?.message ||
            "Une erreur est survenue lors de l'enregistrement.",
        );
      }
    } catch (error) {
      setGeneralError("Erreur critique de connexion au serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: number, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field: FormField) => {
    const commonClasses =
      "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition duration-200 bg-white";
    const errorClasses = errors[field.id]
      ? "border-red-500 bg-red-50"
      : "border-gray-300";

    if (field.type === "file") {
      return (
        <div className="space-y-2">
          <input
            type="file"
            onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
            className={`${commonClasses} ${errorClasses} file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100`}
          />
          {formData[field.id] && (
            <p className="text-xs text-gray-500">
              Fichier sélectionné : {formData[field.id].name}
            </p>
          )}
        </div>
      );
    }

    if (field.type == "image" || field.type == "video") {
      return (
        <div className="space-y-2">
          <input
            type="file"
            accept={field.type === "image" ? "image/*" : "video/*"}
            onChange={(e) => handleInputChange(field.id, e.target.files?.[0])}
            className={`${commonClasses} ${errorClasses} file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100`}
          />
          {formData[field.id] && (
            <p className="text-xs text-gray-500">
              Fichier sélectionné : {formData[field.id].name}
            </p>
          )}
        </div>
      );
    }

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses} min-h-[100px] resize-y`}
            placeholder={`Votre réponse ici...`}
          />
        );
      case "option":
        return (
          <select
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          >
            <option value="">Sélectionner...</option>
            {JSON.parse(field.option)?.map((opt: string, idx: number) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={
              field.type === "email"
                ? "email"
                : field.type === "number"
                  ? "number"
                  : "text"
            }
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            placeholder={`Saisir ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({});
      setErrors({});
      setGeneralError("");
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const successLink = `/masoumission/${submittedProjectId}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={challenge.image}
              alt=""
              className="w-12 h-12 rounded-lg object-cover shadow-sm"
            />
            <div className="min-w-0">
              <h2 className="font-bold text-gray-900 truncate text-lg">
                {challenge.title}
              </h2>
              <p className="text-xs text-gray-500">Soumission de projet</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Ajout de la ref scrollContainerRef ici */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-6 custom-scrollbar"
        >
          {success ? (
            <div className="py-4 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-14 h-14 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  Soumission réussie !
                </h2>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Félicitations, votre post a été ajouté avec succès au
                  challenge. Cela vous a fait gagner des points sur Talent
                  Innovant.
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  Fermer
                </button>
                <a
                  href={successLink}
                  className="inline-flex flex flex-row justify-center items-center px-8 py-3 bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 transform hover:scale-105 transition duration-200 shadow-lg shadow-orange-700/20"
                >
                  Voir ma soumission
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
                  <p className="text-sm font-medium text-gray-500">
                    Chargement du formulaire...
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-400">
                  {generalError && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm font-medium">
                      {generalError}
                    </div>
                  )}

                  <form
                    className="space-y-5"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <p className="text-sm text-center pb-2">
                      Remplir le formulaire pour participer :
                    </p>
                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">
                          {field.label}{" "}
                          {field.is_required === 1 && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        {renderField(field)}
                        {errors[field.id] && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <X className="w-3 h-3" /> {errors[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        {!success && !loading && fields.length > 0 && (
          <div className="pt-4 px-4 md:pb-4 border-t bg-gray-50 flex flex-col-reverse md:flex-row flex-wrap gap-3">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-3 text-sm md:text-lg bg-orange-700 text-white rounded-xl font-bold hover:bg-orange-800 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-700/20"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {submitting ? "Soumission en cours..." : "Soumettre mon projet"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
