"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/app/lib/api";
import domaines from "@/domaines.json";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/BackButton";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    nom: "",
    email: "",
    password: "",
    confirm: "",
    telephone: "",
    domaine_principal: "",
    domaines_secondaires: [] as string[],
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    // Effacer le message d'erreur général
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateStep1 = () => {
    const err: any = {};

    if (!form.nom) err.nom = "Le nom est requis";
    if (!form.email) err.email = "L'email est requis";
    if (!form.password) err.password = "Mot de passe requis";
    if (form.password !== form.confirm)
      err.confirm = "Les mots de passe ne correspondent pas";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    const err: any = {};

    if (!form.domaine_principal)
      err.domaine_principal = "Choisissez votre domaine principal";

    if (form.domaines_secondaires.length > 3)
      err.domaines_secondaires = "Maximum 3 domaines secondaires";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const goBack = () => {
    setStep(1);
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        statut: "talent",
        nom: form.nom,
        email: form.email,
        password: form.password,
        telephone: form.telephone || null,
        domaine_principal: parseInt(form.domaine_principal),
        domaines_secondaires: form.domaines_secondaires.map((id) =>
          parseInt(id),
        ),
      };

      const response = await apiFetch("/inscription", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Si l'inscription réussit (statut 200)
      if (response.statut === 200) {
        setSuccessMessage(
          response.message ||
            "Inscription réussie. Vérifiez votre boite mail pour activer votre compte.",
        );
        // Redirection vers la page de vérification email avec l'email en paramètre
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(form.email)}`,
        );
      } else if (response.statut === 422) {
        // Erreurs de validation
        const backendErrors: any = {};
        if (response.errors) {
          Object.keys(response.errors).forEach((key) => {
            backendErrors[key] = response.errors[key][0];
          });
        }
        setErrors(backendErrors);
        setErrorMessage(response.message || "Erreur de validation");
      } else if (response.statut === 500) {
        // Erreur serveur
        setErrorMessage(
          response.message ||
            "Une erreur serveur est survenue. Veuillez réessayer.",
        );
      } else if (
        response.statut != 200 &&
        response.statut != 422 &&
        response.statut != 500
      ) {
        // Autres erreurs
        setErrorMessage(
          response.message || "Une erreur est survenue. Veuillez réessayer.",
        );
      }
      setLoading(false);
    } catch (error: any) {
      setLoading(false);

      // Gestion des erreurs en fonction du statut
    }
  };

  const secondaryOptions = domaines.filter(
    (d) => d.id.toString() !== form.domaine_principal,
  );

  const toggleSecondary = (domaineId: string) => {
    const selected = form.domaines_secondaires;
    if (selected.includes(domaineId)) {
      setForm({
        ...form,
        domaines_secondaires: selected.filter((d) => d !== domaineId),
      });
    } else if (selected.length < 3) {
      setForm({
        ...form,
        domaines_secondaires: [...selected, domaineId],
      });
    }
  };

  return (
    <div className="w-full h-full">
      <div className="min-h-screen flex flex-col bg-white items-center justify-center bg-gray-50 py-6">
        <span className="float-left w-full pl-4">
          {" "}
          <BackButton m={0} />{" "}
        </span>
        <div className="w-full max-w-lg shadow-lg rounded-2xl p-6">
          {/* STEP INDICATOR */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`h-3 w-3 rounded-full ${step === 1 ? "bg-orange-700" : "bg-gray-300"}`}
              />
              <div
                className={`h-3 w-3 rounded-full ${step === 2 ? "bg-orange-700" : "bg-gray-300"}`}
              />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Créez votre compte Talent
          </h2>
          <div className="w-full text-center text-xs relative -top-2">
            C'est simple et rapide !
          </div>

          {/* Message d'erreur général */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm text-center font-bold">
                {successMessage}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3 }}
              >
                {/* FORM STEP 1 */}
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-sm">Nom</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.nom}
                      onChange={(e) => handleChange("nom", e.target.value)}
                    />
                    {errors.nom && (
                      <span className="text-red-500 text-sm">{errors.nom}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm">Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                    {errors.email && (
                      <span className="text-red-500 text-sm">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm">Mot de passe</label>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    {errors.password && (
                      <span className="text-red-500 text-sm">
                        {errors.password}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm">
                      Confirmer mot de passe
                    </label>
                    <input
                      type="password"
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.confirm}
                      onChange={(e) => handleChange("confirm", e.target.value)}
                    />
                    {errors.confirm && (
                      <span className="text-red-500 text-sm">
                        {errors.confirm}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm">
                      Téléphone (Whatsapp de préférence)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 655624169"
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.telephone}
                      onChange={(e) =>
                        handleChange("telephone", e.target.value)
                      }
                    />
                    {errors.telephone && (
                      <span className="text-red-500 text-sm">
                        {errors.telephone}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={goNext}
                    className="w-full bg-orange-700 text-white py-3 rounded-lg mt-4 hover:bg-orange-600 transition"
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                {/* STEP 2 */}
                <div className="space-y-4 mt-6">
                  {/* DOMAINE PRINCIPAL */}
                  <div>
                    <label className="block text-sm font-medium">
                      Votre domaine principal
                    </label>
                    <select
                      className="w-full mt-1 p-3 border rounded-lg"
                      value={form.domaine_principal}
                      onChange={(e) =>
                        handleChange("domaine_principal", e.target.value)
                      }
                    >
                      <option value="">Sélectionnez...</option>
                      {domaines.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nom}
                        </option>
                      ))}
                    </select>
                    {errors.domaine_principal && (
                      <span className="text-red-500 text-sm">
                        {errors.domaine_principal}
                      </span>
                    )}
                  </div>

                  {/* DOMAINES SECONDAIRES */}
                  <div>
                    <label className="block text-sm font-medium">
                      Domaines secondaires (max 3)
                    </label>

                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                      {secondaryOptions.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => toggleSecondary(d.id.toString())}
                          className={`p-2 border rounded-lg text-sm ${
                            form.domaines_secondaires.includes(d.id.toString())
                              ? "bg-orange-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {d.nom}
                        </button>
                      ))}
                    </div>

                    {errors.domaines_secondaires && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.domaines_secondaires}
                      </span>
                    )}

                    {/* Selected */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Sélectionnés :</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {form.domaines_secondaires.map((domaineId) => {
                          const domaine = domaines.find(
                            (d) => d.id.toString() === domaineId,
                          );
                          return (
                            <span
                              key={domaineId}
                              className="px-3 py-1 bg-orange-700 text-white rounded-full text-xs"
                            >
                              {domaine?.nom}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={goBack}
                      disabled={loading}
                      className="py-1 w-1/4 px-2 md:px-5 md:py-3 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="text-md w-2/3 md:text-xl py-2 px-2 md:px-5 md:py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Création..." : "Créer mon compte"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-gray-600 mt-6">
            Vous avez déjà un compte ?{" "}
            <a
              href="/auth/login"
              className="text-orange-700 font-medium hover:underline"
            >
              Se connecter
            </a>
          </p>

          <p className="p-2 w-full flex flex-row justify-center mt-3">
            <a
              href="/"
              className="text-orange-700 text-xs flex flex-row items-center gap-x-2 hover:underline font-semibold"
            >
              <ArrowLeft size={15} /> Retour à l'accueil
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
