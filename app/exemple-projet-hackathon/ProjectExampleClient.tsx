"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  Info,
  Lightbulb,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectExampleClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg md:text-xl truncate text-slate-800">
            Exemple de projet Hackathon
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Modèle de Soumission
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-4 leading-tight uppercase">
              HACKATHON DES DEVS DU GRAND NORD
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
              Découvrez comment structurer vos réponses pour le challenge sur la
              santé numérique.
            </p>
          </motion.div>

          {/* Details Cards */}
          <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* En-tête sobre */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Activity size={20} className="text-orange-700" />
                  Détails du projet
                </h3>
              </div>

              {/* Contenu structuré */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Problème */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
                    Problème à résoudre
                  </span>
                  <p className="text-slate-900 font-semibold text-lg leading-snug">
                    L’inaccessibilité des personnels de santé qualifiés dans les
                    zones reculées, accentuée par de longs délais d'attente et
                    des coûts de déplacement élevés pour les populations du
                    Grand Nord.
                  </p>
                </div>

                <hr className="border-slate-100" />

                {/* Solution */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
                    Solution proposée
                  </span>
                  <p className="text-slate-900 font-semibold text-lg leading-snug">
                    Développer une plateforme de télémédecine intégrée
                    permettant des consultations à distance, la prise de
                    rendez-vous en ligne et le suivi numérique des
                    prescriptions, réduisant ainsi la fracture sanitaire entre
                    ville et campagne.
                  </p>
                </div>

                <hr className="border-slate-100" />

                {/* Particularité */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">
                    Particularité (Proposition de valeur)
                  </span>
                  <p className="text-slate-900 font-bold text-lg leading-snug">
                    Intégration d'un assistant médical intelligent (IA) agissant
                    comme un médecin virtuel personnalisé, capable de réaliser
                    un pré-diagnostic instantané et d'orienter l'utilisateur
                    vers le spécialiste approprié selon l'urgence.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Video Demo */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[10px] font-black text-orange-700 uppercase tracking-wider ml-4">
              <CheckCircle size={14} className="text-orange-700" /> Vidéo démo
              du projet
            </label>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-video w-full h-96 md:h-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-black"
            >
              <video
                controls
                className="w-full h-full object-contain"
                poster="/assets/images/thumbnail-health.jpg"
              >
                <source src="../assets/videos/health.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </motion.div>
          </div>
        </section>

        {/* Action Card */}
        <section className="pb-10">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-orange-700 p-6 rounded-[2.5rem] shadow-xl text-white space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/30 text-white rounded-2xl flex items-center justify-center border border-orange-400/50">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight">
                  Prêt à coder ?
                </h3>
                <p className="text-xs text-orange-50/80">
                  Soumettez votre projet avant la date limite !
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/challenge/13")}
              className="w-full py-4 bg-white text-orange-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg active:scale-95"
            >
              Participer maintenant
            </button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
        Talent Innovant &copy; 2026
      </footer>
    </div>
  );
}
