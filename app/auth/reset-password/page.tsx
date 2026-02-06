"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import toast from "react-hot-toast";

// 1. On crée un composant interne qui contient toute ta logique actuelle
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      toast.error("Lien de réinitialisation invalide ou expiré.");
    }
  }, [email, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Le mot de passe doit faire au moins 6 caractères");
    }

    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    try {
      setLoading(true);
      const res = await apiFetch("/change-password", {
        method: "POST",
        body: JSON.stringify({ email, token, password }),
      });

      if (res?.statut === 200) {
        toast.success("Mot de passe modifié avec succès !");
        setTimeout(() => router.replace("/auth/login"), 2000);
      } else {
        toast.error(res?.message || "Lien invalide ou expiré");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Nouveau <span className="text-orange-700">Mot de passe</span>
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Créez un mot de passe robuste pour protéger votre compte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full py-3 flex items-center justify-center gap-2 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-lg disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          Réinitialiser le mot de passe
        </button>
      </form>
    </div>
  );
}

// 2. Le composant exporté par défaut utilise Suspense pour Next.js
export default function ResetPasswordPage() {
  return (
    <div className="h-screen w-full bg-gray-50 flex items-center justify-center px-3">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-orange-700" size={40} />
            <p className="text-gray-500">Chargement du formulaire...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
