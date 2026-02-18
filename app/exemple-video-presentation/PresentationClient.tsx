"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Play, Info, Lightbulb, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PresentationClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Mobile & Desktop */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-lg md:text-xl truncate">
            Exemple de présentation
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {/* Hero Section & Video */}
        <section className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Guide Vidéo
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
              Comment présenter votre projet ?
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto">
              Inspirez-vous de cet exemple pour réussir votre soumission au
              challenge ENSPM AWARDS INNOVATION CHALLENGE.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-3"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <h3 className="font-bold text-slate-800">Les points clés</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-green-500 mt-0.5 shrink-0"
                />
                Présentez clairement le problème.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-green-500 mt-0.5 shrink-0"
                />
                Présentez la solution que vous proposez (même sans prototype)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle
                  size={16}
                  className="text-green-500 mt-0.5 shrink-0"
                />
                Donnez la particularité (Proposition de valeur) de votre
                solution
              </li>
            </ul>
          </motion.div>

          {/* Video Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative group aspect-video w-full h-84 md:h-auto rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-black"
          >
            <video
              controls
              className="w-full h-full object-contain"
              poster="/assets/images/thumbnail-video.jpg" // Optionnel : ajoute une miniature
            >
              <source src="../assets/videos/exemple.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </motion.div>
        </section>

        {/* Instructions Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-orange-700 p-6 rounded-[2rem] shadow-lg text-white space-y-3"
          >
            <div className="w-10 h-10 bg-orange-500/30 text-white rounded-xl flex items-center justify-center border border-orange-400/50">
              <Info size={20} />
            </div>
            <h3 className="font-bold">Format requis</h3>
            <p className="text-sm text-orange-50/80">
              Votre vidéo ne doit pas dépasser 3 minutes. Soyez bref, créatif et
              convaincant !
            </p>
            <button
              onClick={() => router.push("/challenge/14")}
              className="w-full py-3 bg-white text-orange-700 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-orange-50 transition-colors"
            >
              Participer maintenant
            </button>
          </motion.div>
        </section>
      </main>

      {/* Footer simple */}
      <footer className="py-10 text-center text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
        Talent Innovant &copy; 2026
      </footer>
    </div>
  );
}
