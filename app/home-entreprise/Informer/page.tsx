"use client";

import { useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { Send, Loader2, Mail, Info } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function InformerPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation de l'adresse email
    if (!email.trim()) {
      return toast.error("Veuillez saisir une adresse email.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return toast.error("Veuillez saisir une adresse email valide.");
    }

    // Validation du message
    if (!message.trim()) {
      return toast.error("Le message ne peut pas être vide.");
    }

    if (message.length > 5000) {
      return toast.error("Le message ne doit pas dépasser 5000 caractères.");
    }

    try {
      setLoading(true);

      const res = await apiFetch("/admin/informer-utilisateur", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          message: message,
        }),
      });

      if (res?.statut === 200) {
        toast.success(res.message || "Email envoyé avec succès.", {
          duration: 6000,
        });

        // IMPORTANT :
        // On conserve volontairement l'adresse et le message.
        // L'administrateur peut les consulter ou les réutiliser.
      } else {
        toast.error(res?.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err: any) {
      console.error("Erreur envoi email :", err);

      if (err.message === "Unauthenticated.") {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      } else if (err.message) {
        toast.error(err.message);
      } else {
        toast.error("Impossible de joindre le serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 md:p-8 space-y-6 mt-10">
      <Toaster position="top-right" />

      {/* En-tête */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Mail className="text-orange-700" size={21} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Informer un <span className="text-orange-700">utilisateur</span>
          </h1>
        </div>

        <p className="text-gray-500 text-sm">
          Envoyez directement un email à un utilisateur de TALENT INNOVANT.
        </p>
      </div>

      {/* Information */}
      <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
        <Info className="text-orange-700 shrink-0 mt-0.5" size={19} />

        <p className="text-sm text-gray-700 leading-relaxed">
          Ce formulaire permet d'envoyer un message directement à une adresse
          email. Aucun message n'est enregistré dans la base de données.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Adresse email */}
        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700 mb-2"
          >
            Adresse email du destinataire
          </label>

          <input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50/50 disabled:opacity-50"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-gray-700 mb-2"
          >
            Votre message
          </label>

          <textarea
            id="message"
            placeholder="Rédigez votre message ici..."
            rows={9}
            disabled={loading}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50/50 resize-y disabled:opacity-50"
          />

          <div className="text-right mt-1">
            <span
              className={`text-xs ${
                message.length > 5000 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {message.length} / 5000
            </span>
          </div>
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-orange-700 hover:bg-orange-800 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-orange-700/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={18} />
          )}

          {loading ? "Envoi en cours..." : "Envoyer l'email"}
        </button>
      </form>
    </div>
  );
}
