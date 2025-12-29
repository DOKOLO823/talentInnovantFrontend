"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical, Edit, Trash2, Flag, Share2, MessageCircle,
  ThumbsUp, Maximize2, Trophy, Flame, ChevronDown, ChevronUp,
  X, MessageSquare, Facebook, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ================= COMPOSANTS AUXILIAIRES ================= */

function ReadMore({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const limit = 120;
  if (!text) return null;
  return (
    <p className="text-gray-700 text-sm leading-relaxed">
      {open || text.length <= limit ? text : text.slice(0, limit) + "..."}
      {text.length > limit && (
        <button onClick={() => setOpen(!open)} className="ml-1 text-orange-600 font-medium">
          {open ? "voir moins" : "voir plus"}
        </button>
      )}
    </p>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">Supprimer le projet ?</h3>
        <p className="text-gray-600 text-sm mb-6">Cette action est irréversible. Voulez-vous vraiment continuer ?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl font-medium">Annuler</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium">Supprimer</button>
        </div>
      </motion.div>
    </div>
  );
}

function ShareModal({ isOpen, onClose, projectTitle }: any) {
  if (!isOpen) return null;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const handleCopy = () => { navigator.clipboard.writeText(shareUrl); alert("Lien copié !"); onClose(); };
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Partager</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="flex gap-4 mb-6">
          <a href={`https://wa.me/?text=${encodeURIComponent(projectTitle + " " + shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-green-500 text-white rounded-2xl w-full flex justify-center"><MessageSquare /></div>
            <span className="text-xs">WhatsApp</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-blue-600 text-white rounded-2xl w-full flex justify-center"><Facebook /></div>
            <span className="text-xs">Facebook</span>
          </a>
        </div>
        <div className="flex border rounded-xl overflow-hidden">
          <input readOnly value={shareUrl} className="flex-1 p-3 text-xs truncate outline-none" />
          <button onClick={handleCopy} className="bg-orange-700 text-white px-4 text-xs font-bold">COPIER</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ================= COMPOSANT PRINCIPAL ================= */

export default function ProjectCard({ project, challenge }: any) {
  const [openMenu, setOpenMenu] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const router = useRouter();
  const params = useParams();
  const idchallenge = params.id;

  const handleReport = () => {
    setOpenMenu(false);
    alert(`Signalement effectué pour le projet ID : ${project.id}`);
  };

  const handleNavigateToReel = () => {
    const query = new URLSearchParams({
      project: project.id.toString(),
      titre: challenge?.title || "Challenge",
      typeevaluation: challenge?.typeevaluation || "vote",
      resultatdisponible: challenge?.resultatdisponible?.toString() || "false"
    }).toString();
    router.push(`/challenge/${idchallenge}/reel?${query}`);
  };

  const visibleResponses = showAllFields ? project.responses : project.responses.slice(0, 2);

  return (
    <div className="relative bg-white rounded-2xl shadow border w-full max-w-xl mx-auto flex flex-col mb-6">
      
      {/* HEADER */}
      <div className="flex justify-between p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => router.push('/profil-talent/1')}
        >
          <Image src={project.author.avatar} width={44} height={44} alt="avatar" className="rounded-full object-cover aspect-square" />
          <div>
            <p className="font-semibold hover:text-orange-600 transition-colors">{project.author.name}</p>
            <p className="text-sm text-gray-600">{project.author.role}</p>
          </div>
        </div>
        <div className="relative">
          <MoreVertical className="cursor-pointer" onClick={() => setOpenMenu(!openMenu)} />
          {openMenu && (
            <div className="absolute right-0 bg-white border shadow-xl rounded-xl w-44 z-20 py-1">
              <button className="flex items-center gap-2 p-3 w-full hover:bg-gray-50 text-sm transition"><Edit size={16} /> Modifier</button>
              <button onClick={() => { setShowConfirmDelete(true); setOpenMenu(false); }} className="flex items-center gap-2 p-3 w-full hover:bg-red-50 text-red-600 text-sm transition"><Trash2 size={16} /> Supprimer</button>
              <button onClick={handleReport} className="flex items-center gap-2 p-3 w-full hover:bg-gray-50 text-sm transition"><Flag size={16} /> Signaler</button>
            </div>
          )}
        </div>
      </div>

      {/* RANG / SCORE */}
      <div className="px-4 flex gap-2 text-[11px] text-gray-500 font-bold tracking-tight">
        <span className="flex items-center gap-1"><Trophy size={10} className="text-yellow-500" /> Rang provisoire : <b className="text-gray-900">{project.rank}e</b></span>
        <span className="flex items-center gap-1"><Flame size={10} className="text-orange-600" /> Score provisoire : <b className="text-gray-900">{project.notefinale ?? ''}</b></span>
        
      </div>

      {/* CONTENT */}
      <div className={`px-4 mt-3 transition-all ${showAllFields ? "max-h-[300px] overflow-y-auto" : ""}`}>
        {visibleResponses.map((r: any) => (
          <div key={r.id} className="mb-4">
            <p className="font-bold text-sm text-gray-950 mb-1">{r.challenge_field.label}</p>
            {r.challenge_field.type === "text" ? <ReadMore text={r.value} /> : 
             r.value.match(/\.(mp4|mov)$/i) ? <video controls className="rounded-xl w-full max-h-52 bg-black shadow-inner"><source src={r.value} /></video> : null}
          </div>
        ))}
      </div>

      {/* VOIR PLUS */}
      {project.responses.length > 2 && (
        <button onClick={() => setShowAllFields(!showAllFields)} className="text-orange-700 text-sm font-bold flex items-center justify-center gap-1 py-2 hover:bg-orange-50 transition">
          {showAllFields ? <><ChevronUp size={18} /> Voir moins</> : <><ChevronDown size={18} /> Voir plus</>}
        </button>
      )}

      {/* FOOTER RESPONSIVE COLONNE MOBILE / LIGNE DESKTOP */}
      <div className="border-t px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50/50 rounded-b-2xl">
        <button 
          onClick={() => setHasVoted(!hasVoted)} 
          className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
            hasVoted ? "bg-orange-700 text-white" : "bg-white border border-gray-200 text-gray-700"
          }`}
        >
          <ThumbsUp size={16} fill={hasVoted ? "white" : "none"} /> Je vote ({project.votesCount || 0})
        </button>

        <div className="flex justify-between sm:justify-end items-center gap-6 px-2 sm:px-0">
          <button onClick={handleNavigateToReel} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-700 font-medium transition">
            <MessageCircle size={20} /> <span className="text-sm">12</span>
          </button>

          <button onClick={() => setOpenShare(true)} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-700 font-medium transition">
            <Share2 size={17} /> <span className="text-sm">503</span>
          </button>

          <Maximize2 className="text-orange-700 cursor-pointer hover:scale-110 transition active:scale-95" size={20} onClick={handleNavigateToReel} />
        </div>
      </div>

      <ShareModal isOpen={openShare} onClose={() => setOpenShare(false)} projectTitle={project.author.name} />
      <ConfirmationModal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} onConfirm={() => { console.log("Supprimé"); setShowConfirmDelete(false); }} />
    </div>
  );
}