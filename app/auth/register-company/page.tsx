"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/app/components/BackButton";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import domaines from "@/domaines.json"; // Importation de ta liste de domaines

export default function RegisterEntreprise() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirm: "",
    domaine_principal: "", // Harmonisé avec le backend
    service: "",
    description: "",
    horaire: "",
    siteweb: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  /* ---------------- VALIDATIONS ---------------- */

  const isProEmail = (email: string) => {
    const forbidden = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    const domain = email.split("@")[1];
    return domain && !forbidden.includes(domain);
  };

  const validateStep1 = () => {
    const err: any = {};
    if (!form.nom) err.nom = "Nom de l'entreprise requis";
    if (!form.email) err.email = "Email requis";
    else if (!isProEmail(form.email))
      err.email = "Veuillez utiliser un email professionnel";

    if (!form.password) err.password = "Mot de passe requis";
    if (form.password !== form.confirm)
      err.confirm = "Les mots de passe ne correspondent pas";

    if (!form.domaine_principal) err.domaine_principal = "Domaine requis";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    const err: any = {};
    if (!form.service) err.service = "Service requis";
    if (!form.description) err.description = "Description requise";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ---------------- NAVIGATION ---------------- */

  const goNext = () => {
    if (validateStep1()) setStep(2);
  };

  const goBack = () => setStep(1);

  /* ---------------- INTEGRATION API ---------------- */

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        statut: "entreprise",
        nom: form.nom,
        email: form.email,
        password: form.password,
        domaine_principal: parseInt(form.domaine_principal),
        service: form.service,
        description: form.description,
        horaire: form.horaire,
        siteweb: form.siteweb,
      };

      const response = await apiFetch("/inscription", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.statut === 200) {
        // toast.success("Inscription réussie !");
        router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
      } else if (response.statut === 422) {
        const backendErrors: any = {};
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            backendErrors[key] = response.errors[key][0];
          });
        }
        setErrors(backendErrors);
        toast.error(response.message || "Erreur de validation");
      } else {
        setErrorMessage(response.message || "Une erreur est survenue");
        toast.error("Erreur lors de l'inscription");
      }
    } catch (error: any) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50">
      <div className="relative top-8">
        <BackButton />
      </div>
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-xl shadow-lg rounded-2xl p-8 bg-white">
          
          {/* STEPPER */}
          <div className="flex justify-center mb-6 gap-3">
            <div className={`h-3 w-3 rounded-full ${step === 1 ? "bg-orange-700" : "bg-gray-300"}`} />
            <div className={`h-3 w-3 rounded-full ${step === 2 ? "bg-orange-700" : "bg-gray-300"}`} />
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-900">
            Inscription Entreprise
          </h2>
          <p className="text-center text-gray-500 text-sm mt-1">
            Créez le profil de votre entreprise
          </p>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-6"
              >
                <Input label="Nom de l'entreprise" value={form.nom} onChange={(v: any) => handleChange("nom", v)} error={errors.nom} />
                <Input label="Email professionnel" type="email" value={form.email} onChange={(v: any) => handleChange("email", v)} error={errors.email} />
                <Input label="Mot de passe" type="password" value={form.password} onChange={(v: any) => handleChange("password", v)} error={errors.password} />
                <Input label="Confirmer mot de passe" type="password" value={form.confirm} onChange={(v: any) => handleChange("confirm", v)} error={errors.confirm} />
                
                {/* SELECT DOMAINE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Votre domaine principal</label>
                  <select
                    className={`w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-700 outline-none transition-all ${
                      errors.domaine_principal ? "border-red-500" : "border-gray-300"
                    }`}
                    value={form.domaine_principal}
                    onChange={(e) => handleChange("domaine_principal", e.target.value)}
                  >
                    <option value="">Sélectionnez...</option>
                    {domaines.map((d) => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                  {errors.domaine_principal && <span className="text-red-500 text-xs mt-1 block">{errors.domaine_principal}</span>}
                </div>

                <button
                  onClick={goNext}
                  className="w-full bg-orange-700 hover:bg-orange-800 transition-colors text-white py-3 rounded-lg mt-4 font-bold"
                >
                  Continuer
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-6"
              >
                <Input label="Services offerts" value={form.service} onChange={(v: any) => handleChange("service", v)} error={errors.service} />

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description de l’entreprise</label>
                  <textarea
                    className={`w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-700 outline-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                  {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                </div>

                <Input label="Horaire de travail" value={form.horaire} onChange={(v: any) => handleChange("horaire", v)} />
                <Input label="Site web" value={form.siteweb} onChange={(v: any) => handleChange("siteweb", v)} />

                <div className="mt-6 flex justify-between gap-4 w-full">
                  <button
                    onClick={goBack}
                    disabled={loading}
                    className=" w-2/4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className=" w-3/4 py-3 text-sm md:text-lg bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Créer le compte"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-600 mt-6">
            Déjà une entreprise inscrite ?{" "}
            <a href="/auth/login" className="text-orange-700 font-medium hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", error }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        className={`w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-700 outline-none transition-all ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="text-red-500 text-xs mt-1 block">{error}</span>}
    </div>
  );
}