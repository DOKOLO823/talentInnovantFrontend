"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import BackButton from "@/app/components/BackButton";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const newErrors: any = {};

    /* -------- VALIDATION FRONT -------- */
    if (!email) {
      newErrors.email = "L'adresse email est requise.";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "L'adresse email n'est pas valide.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis.";
      valid = false;
    } else if (password.length < 4) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 4 caractères.";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    /* -------- LOGIN BACKEND -------- */
    try {
      setLoading(true);
      setErrors({});

      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // ❌ Identifiants incorrects
      // console.log(res)
      if (res?.statut === 404) {
        setErrors({ general: res.message });
        setLoading(false);
        return;
      }

      // ❌ Compte non activé
      if (res?.statut === 403) {
        setErrors({ general: res.message });
        setLoading(false);
        return;
      }

      // ✅ Login réussi
      if (res?.status === 200) {
        setAuth({
          token: res.token,
          user: res.user,
          talent: res.talent,
        });

        // 🔀 Redirection selon rôle
        if (res?.user?.statut === "talent") {
          router.replace("/home-talent");
        } else {
          router.replace("/home-entreprise");
        }
      }
    } catch (error) {
      setErrors({
        general: "Une erreur est survenue. Vérifiez votre connexion internet.",
      });
      setLoading(false);
    } finally {
    }
  };

  /* ---------------- UI STRICTEMENT IDENTIQUE ---------------- */

  return (
    <div className="h-full w-full bg-gray-50 pt-16">
      {/* <span className="relative top-3"> <BackButton m={0}/> </span> */}
      <div className="h-2/3 flex flex-col items-center justify-center px-3">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 py-8 relative">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Talent<span className="text-orange-700"> Innovant</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Heureux de vous revoir, connectez-vous à votre compte
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Global error */}
            {errors.general && (
              <p className="text-red-600 text-sm text-center">
                {errors.general}
              </p>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="exemple@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}

              <div className="text-right mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-orange-700 hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-600 transition shadow-lg disabled:opacity-60"
            >
              <LogIn size={18} />
              {loading ? "Connexion en cours..." : "Connexion"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <span className="flex-1 h-px bg-gray-300"></span>
            <span className="px-3 text-sm text-gray-500">ou</span>
            <span className="flex-1 h-px bg-gray-300"></span>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-700 text-sm">
            Vous n’avez pas de compte ?{" "}
            <Link
              href="/auth/register-talent"
              className="text-orange-700 hover:underline font-semibold"
            >
              S’inscrire
            </Link>
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
