"use client";

import { useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { Send, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- VALIDATION FRONT ---
    if (!message.trim()) {
      return toast.error("Le message ne peut pas être vide.");
    }

    if (message.length > 2000) {
      return toast.error("Votre message est trop long (max 2000 caractères).");
    }

    try {
      setLoading(true);

      const res = await apiFetch("/contact-admin", {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      if (res?.statut === 200) {
        toast.success(res.message, { duration: 6000 });
        setMessage(""); // Réinitialise le formulaire après succès
      } else {
        toast.error(res?.message || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err: any) {
      console.error("Erreur Contact:", err);
      if (err.message === "Unauthenticated.") {
        toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      } else {
        toast.error("Impossible de joindre le serveur.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-8 space-y-6 mt-10">
      <Toaster position="top-right" />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Nous <span className="text-orange-700">contacter</span>
        </h1>
        <p className="text-gray-500 text-sm">
          Une question ou une suggestion ? Notre équipe est à votre écoute.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col">
          <label
            htmlFor="message"
            className="text-sm font-semibold text-gray-700 mb-2"
          >
            Votre message
          </label>
          <textarea
            id="message"
            placeholder="Décrivez votre besoin ici..."
            rows={6}
            disabled={loading}
            className={`p-4 border rounded-xl outline-none transition focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-gray-50/50 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="text-right mt-1">
            <span
              className={`text-xs ${message.length > 2000 ? "text-red-500" : "text-gray-400"}`}
            >
              {message.length} / 2000
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-orange-700 hover:bg-orange-800 text-white font-bold px-6 md:px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-700/10 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Send size={18} />
          )}
          {loading ? "Envoi en cours..." : "Envoyer le message"}
        </button>
      </form>
    </div>
  );
}
