"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Mail,
  Bell,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles, // Ajout de l'icône pour Monday Motivation
} from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import BackButton from "@/app/components/BackButton";
import toast, { Toaster } from "react-hot-toast";

export default function ParametresTalent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // États pour Challenges par mail
  const [receiveEmail, setReceiveEmail] = useState(false);
  const [toggling, setToggling] = useState(false);

  // États pour Monday Motivation
  const [mondayMotivation, setMondayMotivation] = useState(false);
  const [togglingMonday, setTogglingMonday] = useState(false);

  // États pour Disponibilité
  const [isAvailable, setIsAvailable] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  // Charger les infos du talent au montage
  useEffect(() => {
    fetchTalentSettings();
  }, []);

  const fetchTalentSettings = async () => {
    try {
      const res = await apiFetch("/talent-infos", { method: "GET" });
      if (res.statut == 200) {
        // Synchronisation des states avec la BD
        setReceiveEmail(res.talent.recevoirchallengemail == "oui");
        setMondayMotivation(res.talent.recevoirmondaymotivation == 1);
        setIsAvailable(res.user.disponible == 1);
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
      toast.error("Impossible de charger vos préférences.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmail = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await apiFetch("/parametres-talent/receiveemail", {
        method: "GET",
      });
      if (res.statut === 200) {
        setReceiveEmail(res.nouvelle_valeur === "oui");
        toast.success(res?.message, { duration: 5000 });
      } else {
        toast.error(res.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setToggling(false);
    }
  };

  // Nouvelle fonction pour Monday Motivation
  const handleToggleMondayMotivation = async () => {
    if (togglingMonday) return;
    setTogglingMonday(true);
    try {
      const res = await apiFetch("/parametres/monday-motivation/toggle", {
        method: "POST", // On utilise POST comme défini dans ta route
      });
      if (res.statut === 200) {
        setMondayMotivation(res.recevoirmondaymotivation);
        toast.success(res.message);
      } else {
        toast.error(res.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setTogglingMonday(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (togglingAvail) return;
    setTogglingAvail(true);
    try {
      const res = await apiFetch(
        "/reseau/collaborations/toggle-disponibilite",
        {
          method: "GET",
        },
      );
      if (res.statut === 200) {
        setIsAvailable(res.disponible == 1);
        toast.success(res.message);
      } else {
        toast.error(res.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur de connexion au serveur.");
    } finally {
      setTogglingAvail(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-orange-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse text-sm">
          Chargement de vos réglages...
        </p>
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 text-center">
          <AlertCircle className="text-orange-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-slate-800 mb-2">
            Accès refusé
          </h2>
          <p className="text-slate-500 mb-6">
            Veuillez vous connecter pour modifier vos paramètres.
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold"
          >
            Connexion
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 w-full flex flex-col items-center">
      <Toaster position="top-center" />

      <div className="w-full md:max-w-2xl pt-8 px-4">
        <div className="mb-6">
          <BackButton m={12} />
        </div>

        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Paramètres
          </h1>
          <p className="text-slate-500 font-medium">
            Gérez vos préférences et notifications
          </p>
        </header>

        <div className="space-y-6">
          {/* Section Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-4 px-2">
              <Bell size={18} className="text-orange-600" />
              <h2 className="text-xs font-black uppercase tracking-widest">
                Notifications
              </h2>
            </div>

            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {/* Carte Challenges */}
              <div className="p-6 flex items-center justify-between group transition-all">
                <div className="flex flex-col items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl transition-colors ${receiveEmail ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Mail size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Challenges par mail
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px] md:max-w-xs">
                      Être alerté dès qu'un nouveau challenge correspondant à
                      mon profil est publié.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleEmail}
                  disabled={toggling}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${receiveEmail ? "bg-orange-600" : "bg-slate-200"} ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <motion.span
                    animate={{ x: receiveEmail ? 28 : 4 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg"
                  >
                    {toggling ? (
                      <Loader2
                        className="animate-spin text-orange-600"
                        size={12}
                      />
                    ) : (
                      receiveEmail && (
                        <CheckCircle2 className="text-orange-600" size={14} />
                      )
                    )}
                  </motion.span>
                </button>
              </div>

              {/* Carte Monday Motivation */}
              <div className="p-6 flex items-center justify-between group transition-all">
                <div className="flex flex-col items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl transition-colors ${mondayMotivation ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Monday Motivation
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px] md:max-w-xs">
                      Recevoir chaque lundi matin un conseil exclusif pour
                      booster votre créativité et votre carrière.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleMondayMotivation}
                  disabled={togglingMonday}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${mondayMotivation ? "bg-orange-600" : "bg-slate-200"} ${togglingMonday ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <motion.span
                    animate={{ x: mondayMotivation ? 28 : 4 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg"
                  >
                    {togglingMonday ? (
                      <Loader2
                        className="animate-spin text-orange-600"
                        size={12}
                      />
                    ) : (
                      mondayMotivation && (
                        <CheckCircle2 className="text-orange-600" size={14} />
                      )
                    )}
                  </motion.span>
                </button>
              </div>
            </div>
          </section>

          {/* Section Visibilité Réseau */}
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <ShieldCheck size={18} className="text-orange-600" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700">
                Visibilité & Réseau
              </h2>
            </div>

            <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 flex items-center justify-between group transition-all">
                <div className="flex flex-col items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl transition-colors ${isAvailable ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Disponible pour collaboration
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px] md:max-w-xs">
                      Si désactivé, vous ne serez plus suggéré aux autres
                      talents comme collaborateur.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleAvailability}
                  disabled={togglingAvail}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isAvailable ? "bg-green-600" : "bg-slate-200"} ${togglingAvail ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <motion.span
                    animate={{ x: isAvailable ? 28 : 4 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg"
                  >
                    {togglingAvail ? (
                      <Loader2
                        className="animate-spin text-slate-600"
                        size={12}
                      />
                    ) : (
                      isAvailable && (
                        <CheckCircle2 className="text-green-600" size={14} />
                      )
                    )}
                  </motion.span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
