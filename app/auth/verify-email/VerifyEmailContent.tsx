"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { apiFetch } from "@/app/lib/api";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleResendLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const emailToSend = email.trim();
    if (!emailToSend) {
      setErrorMessage("Veuillez entrer votre adresse email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToSend)) {
      setErrorMessage("Veuillez entrer une adresse email valide");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await apiFetch("/resend-link-verify", {
        method: "POST",
        body: JSON.stringify({ email: emailToSend }),
      });

      if (response.statut === 200) {
        setSuccessMessage(response.message || "Lien renvoyé avec succès !");
        setShowEmailInput(false);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickResend = () => {
    if (email) {
      handleResendLink();
    } else {
      setShowEmailInput(true);
    }
  };

  function maskEmail(varEmail: string): string {
    if (!varEmail || !varEmail.includes("@")) return varEmail;

    const [localPart, domain] = varEmail.split("@");

    if (localPart.length <= 2) {
      return `${localPart[0]}*@${domain}`;
    }

    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    const masked = "*".repeat(localPart.length - 2);

    return `${firstChar}${masked}${lastChar}@${domain}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="h-16 w-16 flex items-center justify-center bg-orange-100 rounded-full"
          >
            <Mail className="text-orange-600" size={32} />
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800">
          Vérifiez votre email
        </h2>
        <p className="text-gray-600 text-center mt-3 leading-relaxed">
          Nous vous avons envoyé un mail contenant un lien d'activation
          {emailFromUrl && (
            <>
              {" "}
              à{" "}
              <span className="font-semibold text-gray-800">
                {maskEmail(emailFromUrl)}
              </span>
            </>
          )}
          . Consultez votre boîte mail pour finaliser votre inscription.
        </p>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        {showEmailInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleResendLink}
            className="mt-6 space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="flex-1 px-4 py-3 border rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg"
              >
                {loading ? "Envoi..." : "Renvoyer"}
              </button>
            </div>
          </motion.form>
        )}

        {!showEmailInput && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Pas reçu ?{" "}
            <button
              onClick={handleQuickResend}
              className="text-orange-600 font-semibold"
            >
              {loading ? "Envoi..." : "Renvoyer le lien"}
            </button>
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-gray-300"></span>
          <span className="text-gray-400 text-sm">ou</span>
          <span className="flex-1 h-px bg-gray-300"></span>
        </div>

        <div className="text-center">
          <a href="/auth/login" className="text-orange-600 font-medium text-sm">
            Retour à la connexion
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
