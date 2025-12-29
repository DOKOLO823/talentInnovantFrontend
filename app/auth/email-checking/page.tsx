"use client";

import { motion } from "framer-motion";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

// Composant interne contenant la logique useSearchParams
function EmailCheckingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!id || !token) return;

    const verifyEmail = async () => {
      try {
        const res = await apiFetch(`/verify-email/${id}/${token}`, {
          method: "GET",
        });
        console.log("Réponse vérification email :", res);

        if (res.statut === 200 || res.statut === 300) {
          setAuth({
            token: res.token,
            user: res.user,
            talent: res.talent
          });

          if (res?.user?.statut === "talent") {
            router.replace("/home-talent");
          } else {
            router.replace("/home-entreprise");
          }
        }
      } catch (error) {
        console.error("Erreur vérification email :", error);
      }
    };

    verifyEmail();
  }, [id, token, router, setAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <motion.div
        className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <h3 className="text-xl font-medium text-gray-700 mt-6">
        Vérification en cours...
      </h3>

      <p className="text-gray-500 text-sm mt-2">
        Cela ne prendra que quelques secondes.
      </p>
    </div>
  );
}

// Composant principal exporté
export default function EmailChecking() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    }>
      <EmailCheckingContent />
    </Suspense>
  );
}