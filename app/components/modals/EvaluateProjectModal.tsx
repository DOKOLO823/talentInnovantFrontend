"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trophy, ArrowRight, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectToEvaluate } from "@/app/datas/ProjectToEvaluate";

/* ReadMore interne au modal pour les réponses longues */
function ResponseReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const limit = 250;
  if (text.length <= limit) return <p className="text-gray-800 leading-relaxed">{text}</p>;
  return (
    <p className="text-gray-800 leading-relaxed">
      {open ? text : text.slice(0, limit) + "..."}
      <button onClick={() => setOpen(!open)} className="ml-2 text-orange-700 font-bold text-xs uppercase tracking-tight">
        {open ? "Réduire" : "Lire la suite"}
      </button>
    </p>
  );
}

export default function EvaluateProjectModal({ initialProjectId, onClose }: any) {
  const router = useRouter();
  const [projects] = useState(ProjectToEvaluate);
  const initialIndex = projects.findIndex(p => p.id === initialProjectId);
  const [currentIndex, setCurrentIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [direction, setDirection] = useState(0);

  const project = projects[currentIndex];
  const isLast = currentIndex === projects.length - 1;

  const handleNext = () => {
    if (!note) return alert("Veuillez saisir une note.");
    if (!isLast) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setNote(""); 
      setComment("");
    } else {
      onClose();
    }
  };

  const renderResponse = (response: any) => {
    const { label, type } = response.challenge_field;
    const value = response.value;
    const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${value}`;

    switch (type) {
      case "text":
        return (
          <div className="mb-5 p-4 border-l-4 border-orange-700 bg-orange-50/50 rounded-r-xl">
            <p className="text-xs font-black uppercase text-orange-900 mb-1 tracking-wider">{label}</p>
            <ResponseReadMore text={value} />
          </div>
        );
      case "file":
        return (
          <div className="mb-5">
            <p className="text-sm font-bold mb-2 text-gray-700">{label}</p>
            {value.match(/\.(mp4|mov)$/i) ? (
               <video controls className="rounded-xl w-full max-h-[400px] border bg-black"><source src={fileUrl} /></video>
            ) : (
               <img src={fileUrl} className="rounded-xl w-full max-h-[400px] object-contain border bg-gray-50" alt={label} />
            )}
          </div>
        );
      default: return null;
    }
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-0 md:p-4 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-4xl h-full md:h-[95vh] flex flex-col md:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Trophy className="text-orange-600" size={24} />
            <span className="font-bold text-gray-900">Évaluation {currentIndex + 1}/{projects.length}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={project.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="p-6">
              
              {/* INFOS AUTEUR CLIQUABLES */}
              <div 
                className="flex items-center gap-4 p-4 rounded-2xl border bg-gray-50 hover:bg-orange-50 transition-colors cursor-pointer mb-8"
                onClick={() => router.push('/profil-talent/1')}
              >
                <Image src={project.author.avatar} width={60} height={60} alt="avatar" className="rounded-full h-14 w-14 object-cover border-2 border-white shadow-sm" />
                <div>
                  <p className="font-bold text-gray-900 text-lg">{project.author.name}</p>
                  <p className="text-sm text-gray-500">{project.author.role}</p>
                </div>
              </div>

              {/* RÉPONSES */}
              <div className="max-w-2xl mx-auto pb-10">
                {project.responses?.map((resp: any) => (
                  <div key={resp.id}>{renderResponse(resp)}</div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ÉVALUATION (AGRANDIE) */}
        <div className="p-6 border-t bg-gray-50 shadow-inner">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              {/* TEXTAREA PLUS GRAND */}
              <div className="md:col-span-2">
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none text-sm transition-all"
                  placeholder="Écrivez votre commentaire détaillé ici..."
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-full min-h-[60px] md:min-h-0 p-4 rounded-2xl border-2 border-gray-200 focus:border-orange-500 outline-none text-center text-3xl font-black text-orange-700 transition-all"
                  placeholder="Note"
                />
                {/* <p className="text-[10px] text-center mt-1 font-bold text-gray-400 uppercase tracking-widest">Score / 100</p> */}
              </div>
            </div>

            <button 
              onClick={handleNext} 
              className="w-full py-4 bg-orange-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-orange-800 transition-all shadow-xl shadow-orange-700/20"
            >
              {isLast ? <><CheckCircle size={22} /> Terminer la session</> : <><ArrowRight size={22} /> Enregistrer et projet suivant</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}