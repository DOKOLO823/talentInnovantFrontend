"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, ThumbsUp, MessageCircle, Share2,
  ChevronLeft, ChevronRight, X, Send,
  Loader2, FileText, Download, Maximize2, File, MessageSquare, Facebook,
  CalendarClock,
  Lock,
  Trophy,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import Link from "next/link";
import ReadMore from "@/app/components/ReadMore";
import { API_BASE_URL } from "@/app/lib/api";

// --- Utilitaires ---
const apiRequest = async (endpoint: string, method: string = "GET", body?: any) => {
  const storedAuth = localStorage.getItem("auth");
  const token = storedAuth ? JSON.parse(storedAuth).token : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return response.json();
};

// --- NOUVEAU COMPOSANT : MODAL D'INSTRUCTION SWIPE ---
function SwipeInstructionModal({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-center"
    >
      <div className="max-w-xs w-full">
        {/* Animation de la main */}
        <div className="relative h-40 w-full flex items-center justify-center mb-8">
            <motion.div
                animate={{ 
                    x: [-60, 60, -60],
                    rotate: [-10, 10, -10]
                }}
                transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className="text-white"
            >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                </svg>
            </motion.div>
            
            {/* Flèches indicatives */}
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-30">
                <ChevronLeft size={40} className="text-white animate-pulse" />
                <ChevronRight size={40} className="text-white animate-pulse" />
            </div>
        </div>

        <h3 className="text-white text-xl font-black mb-2 uppercase tracking-tight">Navigation Fluide</h3>
        <span className="text-gray-300 text-sm mb-8 leading-relaxed">
          Balayez l'écran vers la <span className="text-orange-500 font-bold">gauche</span> ou la <span className="text-orange-500 font-bold">droite</span> pour passer d'un projet à l'autre.
        </span>

        <button 
          onClick={onComplete}
          className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
        >
          J'ai compris
        </button>
      </div>
    </motion.div>
  );
}

// --- Sous-composants existants ---
function ExpandableText({ text, limit = 250 }: { text: string, limit?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text?.length <= limit) return <p className="text-gray-700 text-[15px] leading-relaxed">{text}</p>;
  return (
    <div className="text-gray-700 text-[15px] leading-relaxed">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 text-orange-700 font-bold hover:underline text-xs md:text-sm">
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      </p>
    </div>
  );
}

function FileRenderer({ value, type, label }: { value: string; type: string; label: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  if (!value) return null;
  const fullUrl = value.startsWith('http') ? value : `${apifile}/${value}`;
  const isImage = value.match(/\.(jpg|jpeg|png|webp|gif)$/i) || type === "image";
  const isVideo = value.match(/\.(mp4|mov|webm)$/i) || type === "video";
  const isPDF = /\.pdf$/i.test(value);
  const isDoc = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(value);
  const isPreviewable = isPDF || isDoc;

  if (type === "text" || type === "textarea" || type === "option") return <ExpandableText text={value} />;

  if (isVideo) return (
    <div className="mb-4 h-[450px]">
      <video controls className="rounded-2xl w-full h-full aspect-video bg-black shadow-lg object-contain border border-slate-100">
        <source src={fullUrl} />
      </video>
    </div>
  );

  if (isImage) return (
    <div className="mb-4 h-[450px]">
      <img src={fullUrl} className="rounded-2xl w-full h-full object-cover border border-slate-100 bg-white shadow-sm" alt={label} />
    </div>
  );

  if (isPreviewable) return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
            {isPDF ? <FileText size={14} /> : <File size={14} />}
          </div>
          <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px]">Aperçu Document</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsFullscreen(true)} className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-md transition-all flex items-center gap-1">
            <Maximize2 size={16} /> <span className="text-[10px] font-bold uppercase">Plein écran</span>
          </button>
          <a href={fullUrl} download className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-md"><Download size={16} /></a>
        </div>
      </div>
      <div className="relative w-full h-[380px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <iframe src={isPDF ? `${fullUrl}#toolbar=0` : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`} className="w-full h-full border-none" title={label} />
      </div>
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFullscreen(false)} className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full h-full bg-white md:rounded-3xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="font-bold text-sm text-slate-700">{label}</span>
                <button onClick={() => setIsFullscreen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500"><X size={20} /></button>
              </div>
              <iframe src={isPDF ? fullUrl : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`} className="w-full flex-1 border-none" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg"><File size={18} /></div>
        <span className="text-xs font-bold text-slate-700 truncate">{label}</span>
      </div>
      <a href={fullUrl} download className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all">
        <Download size={14} /> Télécharger
      </a>
    </div>
  );
}

function CommentItem({ comment, challenge }: any) {
  const { user, commentaire, date } = comment;
  const [isExpanded, setIsExpanded] = useState(false);
  const charLimit = 340;
  const isLongText = commentaire?.length > charLimit;

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const compensatedThen = new Date(then.getTime() + 3600000);
    const diffInMs = now.getTime() - compensatedThen.getTime();
    const diffInSec = Math.floor(diffInMs / 1000);
    if (diffInSec < 5) return "À l'instant";
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `Il y a ${diffInMin} min`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `Il y a ${diffInMonths} mois`;
    return then.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year:'numeric' });
  };

  return (
    <div className="shadow-sm p-2">
      <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100">
        <Link href={'/profil-talent/' + user?.id} className="relative w-9 h-9 flex-shrink-0">
          <Image src={user?.pp ? `${apifile}/${user.pp}` : "../../assets/images/pp2.png"} fill alt="Avatar" className="rounded-full object-cover" />
        </Link>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p className="font-bold text-xs md:text-sm text-gray-900 line-clamp-1">{user?.talent?.nom || user?.entreprise?.nom || user?.name || user?.email}</p>
            <span className="text-[9px] text-gray-400 font-medium">{getRelativeTime(date)}</span>
          </div>
          <p className="text-[10px] text-gray-500 line-clamp-1">{user?.talent?.profession || user?.statut || 'Participant'}</p>
        </div>
      </div>
      <div className="mt-2 text-[15px] md:text-sm text-gray-700 leading-relaxed">
        <p>{isLongText && !isExpanded ? `${commentaire.substring(0, charLimit)}...` : commentaire}</p>
        {isLongText && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-orange-700 font-bold text-[10px] mt-1 hover:underline">
            {isExpanded ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>
    </div>
  );
}

function ShareModal({ isOpen, onClose, projectTitle }: any) {
  const [shareText, setShareText] = useState("");
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const handleCopy = () => { navigator.clipboard.writeText(shareUrl); toast.success('Lien copié !'); };
  const handleShare = (platform: string) => {
    let url = '';
    const text = shareText ? `${shareText} ${projectTitle} ` : projectTitle + ' ';
    if (platform === 'whatsapp') url = `https://wa.me/?text=${encodeURIComponent(text + shareUrl)}`;
    else if (platform === 'facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Partager</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
        </div>
        <textarea value={shareText} onChange={(e) => setShareText(e.target.value)} placeholder="Message optionnel..." className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none" rows={2} />
        <div className="flex gap-4 mb-6">
          <button onClick={() => handleShare('whatsapp')} className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-green-500 text-white rounded-2xl w-full flex justify-center shadow-lg shadow-green-100"><MessageSquare size={24} /></div>
            <span className="text-xs font-medium">WhatsApp</span>
          </button>
          <button onClick={() => handleShare('facebook')} className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-blue-600 text-white rounded-2xl w-full flex justify-center shadow-lg shadow-blue-100"><Facebook size={24} /></div>
            <span className="text-xs font-medium">Facebook</span>
          </button>
        </div>
        <div className="flex border rounded-xl overflow-hidden bg-gray-50">
          <input type="text" readOnly value={shareUrl} className="flex-grow p-3 bg-transparent text-[10px] outline-none truncate" />
          <button onClick={handleCopy} className="bg-orange-700 text-white px-4 text-xs font-bold">COPIER</button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Composant Principal ---
export default function ProjectReelClient({ challenge, initialProjectId }: any) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [loadcomment, setLoadComment] = useState(false);
  const [loadCountComment, setLoadCountComment] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // --- NOUVEAUX ETATS POUR LE FILTRE ---
  const [filterMode, setFilterMode] = useState<"final" | "all">("all");
  const [isSwitchingFilter, setIsSwitchingFilter] = useState(false);

  // --- NOUVEL ÉTAT : Pour savoir si on doit afficher les projets ---
  const [shouldShowProjects, setShouldShowProjects] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setCurrentUser(JSON.parse(storedAuth).user);
    }
  }, []);

  const handleCompleteHint = () => {
    setShowSwipeHint(false);
    localStorage.setItem("hasSeenSwipeHint", "true");
  };

  const getEndpoint = () => {
    const isHybride = challenge?.typeevaluation?.type === 'hybride';
    const isJury = challenge?.typeevaluation?.type === 'jury';
    const resDispo = challenge?.resultatdisponible == 1;

    if (isHybride) {
      if (resDispo) {
        return filterMode === "final" 
          ? `/posts/listepostsnotes/${challenge.id}` 
          : `/challenge/posts/${challenge.id}`;
      }
      return `/challenge/posts/${challenge.id}`;
    }

    if (isJury) {
      return resDispo 
        ? `/posts/listepostsnotes/${challenge.id}` 
        : `/challenge/posts/${challenge.id}`;
    }

    return `/challenge/posts/${challenge.id}`;
  };

  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setIsSwitchingFilter(true);
    const storedAuth = localStorage.getItem("auth");
    const token = storedAuth ? JSON.parse(storedAuth).token : null;
    const user = storedAuth ? JSON.parse(storedAuth).user : null;
    
    try {
      const res = await fetch(`${API_BASE_URL}${getEndpoint()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const fetchedPosts = data?.posts || data?.data || [];
      setProjects(fetchedPosts);

      if (fetchedPosts?.length > 0) {
        let index = 0;
        if (loading && initialProjectId) {
          const found = fetchedPosts.findIndex((p: any) => p?.id.toString() === initialProjectId);
          if (found !== -1) index = found;
        }
        setCurrentIndex(index);
        setCurrentProject(fetchedPosts[index]);
        loadProjectDetails(fetchedPosts[index].id);
        checkLikeStatus(fetchedPosts[index], user);
      } else {
        setCurrentProject(null);
      }
    } catch (e) {
      toast.error("Erreur de chargement des projets");
    } finally {
      setLoading(false);
      setIsSwitchingFilter(false);
    }
  };

  useEffect(() => {
    if (challenge?.id) {
      fetchProjects();
    }
  }, [challenge?.id, filterMode]);

  // --- NOUVEL EFFET : Vérifier si on doit montrer l'animation de swipe ---
  useEffect(() => {
    // Vérifier toutes les conditions qui bloquent l'affichage des projets
    const isBeforeSubmissionEnd = challenge && new Date(challenge?.datefininscription) > new Date() && challenge?.typeevaluation?.type !== 'jury';
    const isPrivateAndNotOwner = challenge && challenge?.portee?.portee === 'privee' && challenge?.user_id !== currentUser?.id;
    const noUser = !currentUser;
    const noProjects = projects?.length === 0;
    
    // Si AUCUNE de ces conditions ne bloque, on peut montrer les projets
    const canShowProjects = !isBeforeSubmissionEnd && !isPrivateAndNotOwner && !noUser && !noProjects && !loading;
    
    setShouldShowProjects(canShowProjects);
    
    // Si on peut montrer les projets ET qu'on n'a jamais vu l'animation
    if (canShowProjects && !loading) {
      const hasSeenSwipeHint = localStorage.getItem("hasSeenSwipeHint");
      if (!hasSeenSwipeHint) {
        setShowSwipeHint(true);
      }
    }
  }, [challenge, currentUser, projects, loading]);

  const loadProjectDetails = async (projectId: number) => {
    try {
      const data = await apiRequest(`/challenge/post/details/${projectId}`);
      if (data.statut === 200) {
        setComments(data.post.commentaires || []);
        setTotalComments(data.totalCommentaires || 0);
        setLoadCountComment(true);
      }
    } catch (e) { console.error(e); }
  };

  const checkLikeStatus = (project: any, user: any) => {
    if (user && project?.likeurs) {
      const liked = project.likeurs.some((liker: any) => {
        return Number(liker.id) === Number(user.id);
      });
      setIsLiked(liked);
    } else {
      setIsLiked(false);
    }
    setLikesCount(project?.like || 0);
    setShareCount(project?.partage || 0);
  };

  const updateUrlAndIndex = (newIndex: number, newDir: number) => {
    setDirection(newDir);
    const target = projects[newIndex];
    setCurrentIndex(newIndex);
    setCurrentProject(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('project', target.id.toString());
    window.history.replaceState({}, '', url.toString());
    loadProjectDetails(target.id);
    checkLikeStatus(target, currentUser);
  };

  const handleNext = () => {
    if (currentIndex < projects?.length - 1) {
      updateUrlAndIndex(currentIndex + 1, 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      updateUrlAndIndex(currentIndex - 1, -1);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return toast.error("Connectez-vous pour voter");
    setActionLoading(true);
    try {
      const data = await apiRequest(`/challenge/post/like/${currentProject?.id}`);
      if (data.statut == 200) {
        setIsLiked(!isLiked);
        setLikesCount(data.likes);
        setProjects(projects.map(p => p?.id === currentProject?.id ? { ...p, like: data.likes } : p));
        toast.success(data?.message)
      } else if (data.statut == 403) {
        toast.error(data.message);
      }
    } catch (e) { toast.error("Erreur de connexion"); }
    finally { setActionLoading(false); }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    const commentTxt = newComment;
    setNewComment("");
    setLoadComment(true);
    try {
      const data = await apiRequest(`/challenge/post/commenter/${currentProject?.id}`, "POST", { commentaire: commentTxt });
      if (data.statut == 200) {
        setComments([{ id: Date.now(), user: currentUser, commentaire: commentTxt, date: new Date().toISOString() }, ...comments]);
        setTotalComments(prev => prev + 1);
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else if (data.statut == 403) {
        toast.error(data.message);
      }
      setLoadComment(false);
    } catch (e) { toast.error("Erreur"); setLoadComment(false); }
  };

  if(challenge && new Date(challenge?.datefininscription) > new Date() && challenge?.typeevaluation?.type!='jury' ) {
    const formattedDate = challenge?.datefininscription 
      ? new Date(challenge.datefininscription).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : "la date de fin";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-center">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <CalendarClock size={48} className="text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Projets en cours de soumission</h2>
        <span className="text-slate-600 max-w-md leading-relaxed mb-8">
          Pour garantir l'équité entre les talents, les projets deviennent visibles dès la clôture des soumissions. 
          <br />
          <span className="font-semibold text-slate-900">Rendez-vous le {formattedDate}.</span>
        </span>
        <button onClick={() => router.back()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <ArrowLeft size={18} /> Retour
        </button>
      </div>
    );
  }

  if(challenge && challenge?.portee?.portee=='privee' && challenge?.user_id!=currentUser?.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-6 text-center">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <Lock size={48} className="text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Challenge privé</h2>
        <p className="text-slate-600 max-w-md leading-relaxed mb-8">
         Seul les organisateurs peuvent voir les projets de ce challenge car il est privé. 
        </p>
        <button onClick={() => router.back()} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <ArrowLeft size={18} /> Retour
        </button>
      </div>
    );
  }
  
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-700"></div>
    </div>
  );

  if(!currentUser){
     return (
      <div className="w-full h-full flex flex-row items-center justify-center relative top-32 p-2">
        <div className="p-10 bg-orange-50 rounded-2xl text-center border-2 border-dashed border-orange-200">
          <Lock className="mx-auto mb-3 text-orange-600" size={32} />
          <p className="font-bold text-black mb-6">Connectez-vous pour voir les projets.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/login" className="px-6 py-2.5 bg-orange-700 text-white rounded-full font-bold text-sm hover:bg-orange-800 transition-colors w-full sm:w-auto">Se connecter</Link>
            <Link href="/auth/register-talent" className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors w-full sm:w-auto">S'inscrire</Link>
          </div>
        </div>
      </div>
     )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col overflow-x-hidden">
      <Toaster />
      {/* AFFICHER L'ANIMATION SEULEMENT SI shouldShowProjects EST TRUE */}
      <AnimatePresence>
        {showSwipeHint && shouldShowProjects && <SwipeInstructionModal onComplete={handleCompleteHint} />}
      </AnimatePresence>
      
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={22} /></button>
            <div className="min-w-0">
              <h1 className="font-bold text-xs md:text-sm truncate uppercase">{challenge.titre}</h1>
              <p className="text-[10px] text-gray-600 font-bold">Projet {currentIndex + 1} / {projects?.length}</p>
            </div>
          </div>
          <div className="flex-shrink-0 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg font-black text-[10px]">
            {projects?.length > 0 ? Math.round(((currentIndex + 1) / projects?.length) * 100) : 0}%
          </div>
        </div>

        {/* --- SYSTEME DE FILTRE --- */}
        {challenge?.typeevaluation?.type === 'hybride' && challenge?.resultatdisponible == 1 && (
          <div className="px-4 pb-2">
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button 
                onClick={() => setFilterMode("final")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${filterMode === "final" ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-700"}`}
              >
                <Trophy size={14} /> Projets Finalistes
              </button>
              <button 
                onClick={() => setFilterMode("all")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all ${filterMode === "all" ? "bg-white text-orange-700 shadow-sm" : "text-gray-600 hover:text-gray-700"}`}
              >
                <Users size={14} /> Tous les projets
              </button>
            </div>
            <div className="text-center p-0.5 text-[11px] italic"> {filterMode=='final' ? 'Le classement est basé sur les notes du jury' : 'Le classement est basé sur les scores de popularité'} </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-grow pt-32 pb-32 px-4 max-w-2xl mx-auto w-full relative">
        {isSwitchingFilter ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <Loader2 className="animate-spin text-orange-700" size={32} />
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chargement des projets...</p>
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Aucun projet trouvé</h2>
            <button onClick={() => router.back()} className="text-orange-700 font-bold underline">Retour</button>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentProject?.id}
              custom={direction}
              variants={{
                enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(e, { offset }) => {
                if (offset.x < -100) handleNext();
                else if (offset.x > 100) handlePrev();
              }}
              className="cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {/* Profil Talent */}
              <div onClick={() => router.push(`/profil-talent/${currentProject?.user?.id}`)} className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
                  <Image src={currentProject?.user?.pp ? apifile+'/'+currentProject?.user?.pp : '../../assets/images/pp2.png'} fill alt="Avatar" className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow w-2/3">
                  <span className="font-bold text-sm line-clamp-1">{currentProject?.user?.talent?.nom || currentProject?.user?.name || currentProject?.user?.email}</span>
                  <p className="text-[11px] text-gray-500 line-clamp-1">{currentProject?.user?.talent?.profession}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>

              {/* Score, rang et commentaire jury */}
              {((challenge?.typeevaluation?.type == 'jury' && challenge?.resultatdisponible == 1) || (challenge?.typeevaluation?.type != 'jury')) && (
                <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl shadow-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="border-r border-white/10">
                      <p className="text-[9px] uppercase opacity-60">
                        Rang {(challenge?.typeevaluation?.type == 'jury' || (challenge?.typeevaluation?.type != 'jury' && challenge?.resultatdisponible == 1)) ? 'final' : 'provisoire'}
                      </p>
                      <p className=" font-black text-orange-500">{currentProject?.rang || '--'}</p>
                    </div>

                    <div>
                      <p className="text-[9px] uppercase opacity-60">
                        {(challenge?.typeevaluation?.type === 'jury' && challenge?.resultatdisponible == 1) || (challenge?.typeevaluation?.type === 'hybride' && filterMode === 'final') 
                          ? 'Note finale' 
                          : 'Score de popularité'}
                      </p>
                      <div className=" font-black text-orange-500">
                        { (challenge?.typeevaluation?.type === 'jury' && challenge?.resultatdisponible == 1) || (challenge?.typeevaluation?.type === 'hybride' && filterMode === 'final')
                          ? <div><span>{currentProject?.notefinale?.toFixed(2)}</span><span className="text-[10px]"> /20</span></div>
                          : currentProject?.score?.toFixed(2)
                        }
                      </div>
                    </div>
                  </div>

                  {currentProject?.commentairejury?.[0]?.commentairejury && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-[9px] font-black uppercase text-orange-500 mb-1 tracking-widest text-center">Le mot du jury</p>
                      <ReadMore text={currentProject.commentairejury[0].commentairejury} />
                    </div>
                  )}
                </div>
              )}

              {/* Réponses du formulaire */}
              <div className="space-y-6">
                {currentProject?.responses?.map((r: any) => (
                  <div key={r?.id}>
                    <p className="text-[12px] font-bold uppercase mb-2 text-black">{r.challenge_field.label}</p>
                    <FileRenderer value={r.value} type={r.challenge_field.type} label={r.challenge_field.label} />
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Barre de Navigation (Boutons visibles uniquement sur PC) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t px-4 py-3 z-40">
        <div className="max-w-2xl mx-auto flex gap-3">
            {/* BOUTONS : Uniquement sur Desktop */}
            <div className="hidden lg:flex w-full gap-3">
                <button 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0 || projects?.length <= 1} 
                    className="flex-1 flex items-center justify-center gap-1 py-3 border rounded-xl font-bold text-xs active:bg-gray-50 transition-colors disabled:opacity-30"
                >
                    <ChevronLeft size={18} /> Précédent
                </button>
                <button 
                    onClick={handleNext} 
                    disabled={currentIndex === projects?.length - 1 || projects?.length <= 1} 
                    className="flex-1 flex items-center justify-center gap-1 py-3 bg-orange-700 text-white rounded-xl font-bold text-xs active:bg-orange-800 transition-colors disabled:opacity-30"
                >
                    Suivant <ChevronRight size={18} />
                </button>
            </div>
            
            {/* SUR MOBILE : On peut mettre un petit indicateur discret ou rien du tout car on a le modal */}
            <div className="lg:hidden w-full text-center py-1">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Faites glisser pour naviguer</p>
            </div>
        </div>
      </div>

      {/* Actions Flottantes */}
      <div className="fixed right-3 bottom-28 flex flex-col gap-4 z-40">
        <button onClick={handleLike} disabled={actionLoading || projects?.length === 0} className={`flex flex-col items-center gap-1 ${isLiked ? 'text-orange-700' : 'text-black'}`}>
          <div className={`p-3 rounded-full shadow-lg border bg-white ${isLiked ? 'border-orange-700' : 'border-black'}`}>
            {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <ThumbsUp size={20} fill={isLiked ? "currentColor" : "none"} />}
          </div>
          <span className="text-[9px] font-bold">Voter ({likesCount})</span>
        </button>
        <button onClick={() => setOpenComments(true)} disabled={projects?.length === 0} className="flex flex-col items-center gap-1">
          <div className="p-3 rounded-full shadow-lg border border-black bg-white"><MessageCircle size={20} /></div>
          <span className="text-[9px] font-bold bg-white rounded-xl p-0.5">({loadCountComment ? totalComments : '...'})</span>
        </button>
        <button onClick={() => setIsShareModalOpen(true)} disabled={projects?.length === 0} className="flex flex-col items-center gap-1">
          <div className="p-3 rounded-full shadow-lg border border-black bg-white"><Share2 size={20} /></div>
          <span className="text-[9px] font-bold bg-white rounded-xl p-0.5">({shareCount})</span>
        </button>
      </div>

      {/* Modal Commentaires */}
      <AnimatePresence>
        {openComments && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-white w-full max-w-2xl rounded-t-[32px] h-[75vh] flex flex-col">
              <div className="p-5 flex justify-between items-center shadow-sm">
                <h3 className="font-bold text-gray-800">Avis ({totalComments})</h3>
                <button onClick={() => setOpenComments(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3">
                {comments && [...comments].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((c) => (
                  <CommentItem key={c?.id} comment={c} challenge={challenge} />
                ))}
              </div>
              
              <div className="p-4 bg-white border-t flex items-center gap-3">
  <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-200 mt-1">
    <Image 
      src={!currentUser?.pp ? `${apifile}/${currentUser.pp}` : "../../assets/images/pp2.png"} 
      fill 
      alt="Avatar" 
      className="object-cover" 
    />
  </div>
  <textarea 
    value={newComment} 
    onChange={(e) => setNewComment(e.target.value)} 
    placeholder="Votre avis..." 
    className="flex-grow p-3 bg-gray-100 rounded-2xl text-sm outline-none resize-none" 
    rows={2} 
  />
  {loadcomment ? (
    <Loader2 className="animate-spin text-orange-700 " />
  ) : (
    newComment.trim() && (
      <button onClick={handleComment} className="p-3 bg-orange-700 text-white rounded-full">
        <Send size={18} />
      </button>
    )
  )}
</div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} projectTitle={`${currentProject?.user?.talent?.nom || currentProject?.user?.name}`} />
    </div>
  );
}