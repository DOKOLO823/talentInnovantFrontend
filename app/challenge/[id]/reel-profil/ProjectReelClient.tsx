"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, ThumbsUp, MessageCircle, Share2,
  ChevronLeft, ChevronRight, X, Send, Star,
  MessageSquare, Facebook, Copy, FileText
} from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// --- SOUS-COMPOSANTS ---

function ExpandableText({ text, limit = 250 }: { text: string, limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (text.length <= limit) return <p className="text-gray-700 text-sm md:text-base leading-relaxed">{text}</p>;
  return (
    <div className="text-gray-700 text-sm md:text-base leading-relaxed">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-orange-700 font-bold hover:underline focus:outline-none text-xs md:text-sm"
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      </p>
    </div>
  );
}

function CommentItem({ comment }: any) {
  const { author, text, isJury, date } = comment;
  return (
    <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
      <div className="relative w-9 h-9 flex-shrink-0">
        <Image src="/assets/images/award.jpg" fill alt="Avatar" className="rounded-full object-cover" />
      </div>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-xs md:text-sm text-gray-900">{author.name}</p>
            {isJury && (
              <span className="flex items-center text-[9px] text-white bg-red-600 px-1.5 py-0.5 rounded-full font-medium">
                <Star size={8} className="mr-1" fill="white" /> Jury
              </span>
            )}
          </div>
          <span className="text-[9px] text-gray-400 italic">{date}</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-1">{author.role}</p>
        <p className="text-xs md:text-sm text-gray-700 mt-1 leading-snug">{text}</p>
      </div>
    </div>
  );
}

function ShareModal({ isOpen, onClose, projectTitle }: any) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Lien copié !');
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Partager</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-black transition"><X size={20}/></button>
        </div>
        <div className="flex gap-4 mb-6">
          <a href={`https://wa.me/?text=${encodeURIComponent(projectTitle + " " + shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-green-500 text-white rounded-2xl w-full flex justify-center hover:bg-green-600 transition shadow-lg shadow-green-100"><MessageSquare size={24} /></div>
            <span className="text-xs font-medium">WhatsApp</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-blue-600 text-white rounded-2xl w-full flex justify-center hover:bg-blue-700 transition shadow-lg shadow-blue-100"><Facebook size={24} /></div>
            <span className="text-xs font-medium">Facebook</span>
          </a>
        </div>
        <div className="flex border rounded-xl overflow-hidden bg-gray-50">
          <input type="text" readOnly value={shareUrl} className="flex-grow p-3 bg-transparent text-[10px] outline-none truncate" />
          <button onClick={handleCopy} className="bg-orange-700 text-white px-4 text-xs font-bold hover:bg-orange-800 transition">COPIER</button>
        </div>
      </motion.div>
    </div>
  );
}

// --- COMPOSANT PRINCIPAL ---

export default function ProjectReelClient({ projects, index: initialIndex }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const titre = searchParams.get('titre');
  const typeevaluation = searchParams.get('typeevaluation');
  const talentId = searchParams.get('talentId');
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [openComments, setOpenComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const projectQuery = searchParams.get('project');
    if (projectQuery) {
      const foundIndex = projects.findIndex((p: any) => p.id.toString() === projectQuery);
      if (foundIndex !== -1) {
        setCurrentIndex(foundIndex);
      }
    }
  }, [searchParams, projects]);

  const project = projects[currentIndex];

  const updateUrlAndIndex = (newIndex: number) => {
    // 1. On remonte immédiatement en haut de la page avant le changement d'état
    window.scrollTo(0, 0);
    
    setCurrentIndex(newIndex);
    const targetProject = projects[newIndex];
    
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('project', targetProject.id.toString());
    
    const newUrl = window.location.pathname + `?${newParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const renderResponse = (response: any) => {
    if (!response || !response.challenge_field || !response.value) return null;
    const { label, type } = response.challenge_field;
    const value = response.value;
    const fileUrl = value.startsWith('http') ? value : `${BACKEND_URL}/${value}`;

    switch (type) {
      case "text":
        return (
          <div className="mb-4 p-4 border-l-4 border-orange-700 bg-orange-50/30 rounded-r-xl">
            <p className="text-[10px] font-bold text-orange-800 uppercase mb-1 tracking-wider">{label}</p>
            <ExpandableText text={value} />
          </div>
        );
      case "file":
        if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</p>
              <img src={fileUrl} alt={label} className="rounded-xl w-full object-cover border shadow-sm" />
            </div>
          );
        }
        if (value.match(/\.(mp4|mov|webm)$/i)) {
          return (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</p>
              <video controls className="rounded-xl w-full bg-black max-h-[500px] shadow-lg"><source src={fileUrl} /></video>
            </div>
          );
        }
        return null;
      default: return null;
    }
  };

  if (!project) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            onClick={() => router.push(`/profil-talent/${talentId}`)} 
            className="p-1.5 hover:bg-gray-100 rounded-full flex-shrink-0 transition"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="font-bold text-xs md:text-sm truncate leading-tight uppercase tracking-tight">{titre}</h1>
            <p className="text-[9px] text-gray-400 uppercase font-bold">Détails de la soumission</p>
          </div>
        </div>
        <div className="flex-shrink-0 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg font-black text-[10px] whitespace-nowrap">
            PROJET {currentIndex + 1} / {projects.length}
        </div>
      </div>

      <div className="flex-grow pt-20 pb-32 px-4 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={project.id} 
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              onClick={() => router.push(`/profil-talent/${talentId}`)}
              className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-orange-200 hover:bg-orange-50/20 transition-all group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm group-hover:scale-105 transition">
                <Image src={'../'+project.author.avatar} fill alt="" className="object-cover" />
              </div>
              <div className="flex-grow">
                <h2 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-orange-700 transition">{project.author.name}</h2>
                <p className="text-[11px] text-gray-500">{project.author.role}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-orange-700" />
            </div>

            {(typeevaluation === "vote" || typeevaluation === "hybride") && (
              <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-800">
                <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-3 mb-3 text-center">
                  <div>
                    <p className="text-[9px] uppercase opacity-60 font-bold">Score de popularité</p>
                    <p className="text-xl font-black text-orange-500">{project.notefinale} <span className="text-[10px] text-orange-500">pts</span></p>
                  </div>
                  <div className="border-l border-white/10">
                    <p className="text-[9px] uppercase opacity-60 font-bold">Classement actuel</p>
                    <p className="text-xl font-black text-orange-500">{project.rank+'e' || '--'}</p>
                  </div>
                </div>
                {project.juryComment && (
                  <div>
                    <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Mot du jury :</p>
                    <p className="text-xs italic opacity-90 leading-relaxed">"{project.juryComment}"</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              {project.responses.map((r: any) => <div key={r.id}>{renderResponse(r)}</div>)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed right-3 md:right-8 bottom-28 md:bottom-32 flex flex-col gap-4 z-40">
        <button 
          onClick={() => setIsLiked(!isLiked)} 
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${isLiked ? 'text-orange-700' : 'text-gray-400'}`}
        >
          <div className={`p-3 md:p-3.5 rounded-full shadow-lg border border-orange-700 transition-colors ${isLiked ? 'bg-orange-700/80 text-white border-orange-700' : ' hover:bg-white/60'}`}>
            <ThumbsUp size={20} color="#c05621" className="md:size-6" fill={isLiked ? "currentColor" : "none"} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter drop-shadow-sm">Voter ({project.votesCount + (isLiked ? 1 : 0)})</span>
        </button>

        <button onClick={() => setOpenComments(true)} className="flex flex-col items-center gap-1 text-gray-500 transition-transform active:scale-90">
          <div className="p-3 md:p-3.5 rounded-full shadow-lg border border-orange-700 hover:bg-white/60 transition-colors">
            <MessageCircle size={20} color="#c05621" className="md:size-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter drop-shadow-sm">(100)</span>
        </button>

        <button onClick={() => setIsShareModalOpen(true)} className="flex flex-col items-center gap-1 text-gray-500 transition-transform active:scale-90">
          <div className="p-3 md:p-3.5 rounded-full shadow-lg border border-orange-700 hover:bg-white/60 transition-colors">
            <Share2 size={20} color="#c05621" className="md:size-6" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter drop-shadow-sm">(503)</span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white border-t px-4 py-3 md:py-5 flex gap-3 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full flex gap-3">
          <button 
            onClick={() => currentIndex > 0 && updateUrlAndIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 md:py-3 border rounded-xl font-bold text-xs md:text-sm transition-all hover:bg-gray-50 disabled:opacity-20 disabled:grayscale"
          >
            <ChevronLeft size={18} /> Précédent
          </button>
          <button 
            onClick={() => currentIndex < projects.length - 1 && updateUrlAndIndex(currentIndex + 1)}
            disabled={currentIndex === projects.length - 1}
            className="flex-1 flex items-center justify-center gap-1 py-2.5 md:py-3 bg-orange-700 text-white rounded-xl font-bold text-xs md:text-sm transition-all hover:bg-orange-800 shadow-md shadow-orange-100 disabled:opacity-20"
          >
            Suivant <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openComments && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="bg-white w-full max-w-2xl rounded-t-[32px] h-[80vh] flex flex-col relative shadow-2xl">
              <div className="p-5 flex justify-between items-center border-b">
                <h3 className="font-bold text-gray-900 md:text-lg">Avis de la communauté</h3>
                <button onClick={() => setOpenComments(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X size={20}/></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">
                <CommentItem comment={{ author: {name: "Expert Jury", role: "Directeur Tech"}, isJury: true, date: "Maintenant", text: "L'approche UX est intéressante, mais vérifiez la compatibilité mobile sur les anciens navigateurs." }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center gap-3">
                <div className="relative w-9 h-9 flex-shrink-0"><Image src="/assets/images/innov.jpg" fill className="rounded-full object-cover shadow-inner" alt="" /></div>
                <input 
                  type="text" 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  placeholder="Votre avis constructif..." 
                  className="flex-grow p-3 bg-gray-100 border-none rounded-full text-xs md:text-sm outline-none focus:ring-2 focus:ring-orange-700 transition" 
                />
                <button 
                  disabled={!newComment.trim()} 
                  className={`p-3 rounded-full transition-all ${!newComment.trim() ? 'bg-gray-100 text-gray-400' : 'bg-orange-700 text-white shadow-lg shadow-orange-200 hover:scale-105'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} projectTitle={project.author.name} />
    </div>
  );
}