"use client";

import { useState } from "react";
import { ArrowLeft, Mail, Loader2, RefreshCw } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import BackButton from "@/app/components/BackButton";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Veuillez entrer votre email");

    try {
      setLoading(true);
      const res = await apiFetch("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (res?.statut === 200) {
        setIsSent(true);
        toast.success("Lien envoyé avec succès !");
      } else {
        toast.error(res?.message || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const res = await apiFetch("/resend-link-forgot", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (res?.statut === 200) {
        toast.success("Lien renvoyé !");
      } else {
        toast.error(res?.message || "Erreur lors du renvoi");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      <Toaster />
      <span className="relative top-3"> <BackButton m={0}/> </span>
      
      <div className="flex-1 flex items-center justify-center px-3">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Talent<span className="text-orange-700"> Innovant</span>
            </h1>
            {!isSent ? (
              <p className="text-gray-500 mt-2 text-sm">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            ) : (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm">
                Un lien a été envoyé à <b>{email}</b>. Vérifiez vos spams si besoin.
              </div>
            )}
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
                  placeholder="exemple@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 flex items-center justify-center gap-2 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-lg disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={18} />}
                Envoyer le lien
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 flex items-center justify-center gap-2 border-2 border-orange-700 text-orange-700 font-semibold rounded-xl hover:bg-orange-50 transition disabled:opacity-50"
              >
                {resending ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={18} />}
                Renvoyer le lien
              </button>
              
              <button 
                onClick={() => setIsSent(false)}
                className="w-full text-center text-sm text-gray-500 hover:underline"
              >
                Utiliser une autre adresse email
              </button>
            </div>
          )}

          <p className="p-2 w-full flex flex-row justify-center mt-6">
            <a href="/auth/login" className="text-orange-700 text-xs flex flex-row items-center gap-x-2 hover:underline font-semibold">
              <ArrowLeft size={15}/> Retour à la connexion
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}