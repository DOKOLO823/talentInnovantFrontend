"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/app/components/BackButton";

export default function RegisterEntreprise() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirm: "",
    domaine: "",
    service: "",
    description: "",
    horaire: "",
    siteweb: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
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

    if (!form.domaine) err.domaine = "Domaine requis";

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

  const handleSubmit = () => {
    if (!validateStep2()) return;

    console.log("ENTREPRISE:", form);
    // API call plus tard
    window.location.href = "/home-entreprise";
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full h-full bg-gray-50">
     <span className="relative top-8">
       <BackButton/>
     </span>
      <div className="min-h-screen flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-xl shadow-lg rounded-2xl p-8">

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
          {/* ---------------- STEP 1 ---------------- */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 mt-6">

                <Input label="Nom de l'entreprise" value={form.nom} onChange={(v:any) => handleChange("nom", v)} error={errors.nom} />
                <Input label="Email professionnel" type="email" value={form.email} onChange={(v:any) => handleChange("email", v)} error={errors.email} />
                <Input label="Mot de passe" type="password" value={form.password} onChange={(v:any) => handleChange("password", v)} error={errors.password} />
                <Input label="Confirmer mot de passe" type="password" value={form.confirm} onChange={(v:any) => handleChange("confirm", v)} error={errors.confirm} />
                <Input label="Domaine d’activité" value={form.domaine} onChange={(v:any) => handleChange("domaine", v)} error={errors.domaine} />

                <button
                  onClick={goNext}
                  className="w-full bg-orange-700 text-white py-3 rounded-lg mt-4"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {/* ---------------- STEP 2 ---------------- */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 mt-6">

                <Input label="Services offerts" value={form.service} onChange={(v:any) => handleChange("service", v)} error={errors.service} />

                <div>
                  <label className="block text-sm">Description de l’entreprise</label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-lg"
                    rows={4}
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <Input label="Horaire de travail" value={form.horaire} onChange={(v:any) => handleChange("horaire", v)} />
                <Input label="Site web" value={form.siteweb} onChange={(v:any) => handleChange("siteweb", v)} />

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={goBack}
                    className="px-5 py-3 border rounded-lg"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-3 bg-orange-700 text-white rounded-lg"
                  >
                    Créer le compte
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà une entreprise inscrite ?{" "}
          <a href="/auth/login" className="text-orange-700 font-medium">
            Se connecter
          </a>
        </p>
      </div>
    </div>

    </div>
  );
}

/* ---------------- SMALL INPUT COMPONENT ---------------- */
function Input({ label, value, onChange, type = "text", error }: any) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <input
        type={type}
        className="w-full mt-1 p-3 border rounded-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
