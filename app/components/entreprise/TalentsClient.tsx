"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Loader2,
  Trophy,
  Crown,
  Medal,
  Star,
  Mail,
  Phone,
  X,
  ExternalLink,
  User,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TalentsClient() {
  const [innovators, setInnovators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTalent, setSelectedTalent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("auth");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }

    const fetchInnovators = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/talents/tous", { method: "GET" });
        if (res?.statut === 200) {
          const mappedTalents = res?.tous?.map((t: any) => ({
            id: t.user_id,
            name: `${t.nom} ${t.prenom || ""}`,
            email: t.user?.email || "",
            phone: t.user?.telephone || "",
            points: t.point || 0,
            rang: t.rang,
            profession: t.profession || "Innovateur",
            nombre_projets:
              t.nombre_projets ?? (t.user?.challengeposts_count || 0),
            avatar: t.user?.pp
              ? `${apifile}/${t.user.pp}`
              : "/assets/images/pp2.png",
          }));
          setInnovators(mappedTalents);
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInnovators();
  }, []);

  return (
    <div className="max-w-full overflow-hidden space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 mt-14 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Les Talents
        </h2>
        <p className="text-gray-500 mt-2">
          Découvrez les profils les plus performants de la plateforme.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Users className="w-5 h-5 text-orange-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Talents en tendances {!loading && "(" + innovators?.length + ")"}
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-700" />
            <p className="text-gray-500 font-medium">
              Chargement des profils...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {innovators.map((innovator, index) => (
              <TalentCard
                key={innovator.id}
                innovator={innovator}
                index={index}
                onContact={() => setSelectedTalent(innovator)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Contact */}
      <AnimatePresence>
        {selectedTalent && (
          <ContactModal
            talent={selectedTalent}
            onClose={() => setSelectedTalent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SOUS-COMPOSANT CARD ---
function TalentCard({ innovator, index, onContact }: any) {
  let SpecialIcon =
    index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Star : null;
  const route = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      {/* Badge Projets */}
      {innovator?.nombre_projets > 0 && (
        <div className="absolute top-4 right-4">
          <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-100">
            {innovator.nombre_projets} Projet(s)
          </span>
        </div>
      )}

      <div className="text-center">
        <Link
          href={"/profil-talent/" + innovator.id}
          className="relative inline-block mb-4"
        >
          <img
            src={innovator.avatar}
            alt={innovator.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          {SpecialIcon && (
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-lg border border-gray-50">
              <SpecialIcon className="w-5 h-5 text-orange-600" />
            </div>
          )}
        </Link>

        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate group-hover:text-orange-700 transition-colors">
          {innovator.name}
        </h3>
        <p className="text-sm text-gray-500 mb-4 font-medium h-5 truncate">
          {innovator.profession}
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 rounded-full">
            <Trophy className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-bold text-orange-700">
              {innovator.points} <span className="text-[10px]">pts</span>
            </span>
          </div>
          <span className="text-sm font-bold text-gray-600 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            {innovator.rang}
          </span>
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={onContact}
            className="w-full bg-orange-700 hover:bg-orange-800 text-white font-semibold rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <Mail className="w-4 h-4" />
            Contacter
          </button>

          <button
            onClick={() => route.push("/profil-talent/" + innovator.id)}
            className="w-full hover:bg-orange-700 text-orange-700 border border-orange-700 hover:text-white font-semibold rounded-xl py-2 px-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <User className="w-4 h-4" />
            Profil
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- SOUS-COMPOSANT MODAL ---
function ContactModal({ talent, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header Modal */}
        <div className="bg-orange-700 h-24 flex items-end justify-center">
          <img
            src={talent.avatar}
            alt={talent.name}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl translate-y-10"
          />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-14 pb-8 px-8 text-center">
          <h4 className="text-xl font-bold text-gray-900">{talent.name}</h4>
          <p className="text-orange-600 font-semibold text-sm mb-6">
            {talent.profession}
          </p>

          <div className="space-y-3">
            {/* Bouton Gmail */}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${talent.email}`}
              target="_blank"
              className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-orange-50 rounded-2xl group transition-all border border-gray-100 hover:border-orange-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition">
                  <Mail className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 font-medium">
                    Envoyer un Email
                  </p>
                  <p className="text-sm font-bold text-gray-700 truncate max-w-[180px]">
                    {talent.email}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-orange-500" />
            </a>

            {/* Bouton Téléphone */}
            <a
              href={`tel:${talent.phone}`}
              className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-green-50 rounded-2xl group transition-all border border-gray-100 hover:border-green-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400 font-medium">
                    Appeler directement
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    {talent.phone || "Non renseigné"}
                  </p>
                </div>
              </div>
              <Phone className="w-4 h-4 text-gray-300 group-hover:text-green-500 fill-current opacity-20" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="mt-8 text-gray-400 hover:text-gray-600 font-medium text-sm transition"
          >
            Fermer la fenêtre
          </button>
        </div>
      </motion.div>
    </div>
  );
}
