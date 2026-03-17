"use client";

import React, { useState, useEffect, use } from "react";
import {
  Heart,
  Share2,
  FileText,
  Loader2,
  Calendar,
  Download,
  Briefcase,
  Copy,
  Facebook,
  Send,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useAuth } from "@/app/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import BackButton from "@/app/components/BackButton";
import Link from "next/link";

// --- COMPOSANT MODAL ---
interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoginRequiredModal({ isOpen, onClose }: LoginRequiredModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Connexion requise</h2>
          <p className="text-gray-600">
            Vous devez être connecté pour interagir avec cette annonce.
          </p>
          <div className="flex gap-3 pt-4">
            <Link
              href="/auth/register-talent"
              className="flex-1 py-2.5 text-center font-medium rounded-lg border border-orange-700 text-orange-700 hover:bg-orange-50 transition"
            >
              S&apos;inscrire
            </Link>
            <Link
              href="/auth/login"
              className="flex-1 py-2.5 text-center font-medium rounded-lg bg-orange-700 text-white hover:bg-orange-800 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PAGE PRINCIPALE ---
interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnnonceDetailClient({ params }: PageProps) {
  const { id } = use(params);
  const { user } = useAuth();

  const [annonce, setAnnonce] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isParticipating, setIsParticipating] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);

  const [likeLoading, setLikeLoading] = useState(false);
  const [participationLoading, setParticipationLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // État pour le modal de connexion
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id, user]);

  const fetchDetails = async () => {
    try {
      const res = await apiFetch(`/annonces/${id}`);
      if (res.statut === 200) {
        const data = res.data;
        setAnnonce(data);
        setLikesCount(data.likes_count || 0);
        setParticipantsCount(data.participants_count || 0);
        setSharesCount(data.partageurs_count || 0);
        if (user) {
          setIsLiked(data.likeurs?.some((l: any) => l.id === user.id));
          setIsParticipating(
            data.participants?.some((p: any) => p.id === user.id),
          );
        }
      }
    } catch (error) {
      //   toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setLikeLoading(true);
    try {
      const res = await apiFetch(`/annonces/${id}/like`, { method: "POST" });
      if (res.statut === 200) {
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (e) {
      toast.error("Action impossible");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleParticiper = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (isParticipating) return;
    setParticipationLoading(true);
    try {
      const res = await apiFetch(`/annonces/${id}/participer`, {
        method: "POST",
      });
      if (res.statut === 200) {
        setIsParticipating(true);
        setParticipantsCount((prev) => prev + 1);
        toast.success("Réservation confirmée");
      }
    } catch (e) {
      toast.error("Erreur lors de l'inscription");
    } finally {
      setParticipationLoading(false);
    }
  };

  const handleOpenShare = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setShowShareMenu(!showShareMenu);
  };

  const registerShare = async () => {
    try {
      await apiFetch(`/annonces/${id}/partager`, { method: "POST" });
      setSharesCount((prev) => prev + 1);
    } catch (e) {}
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
    registerShare();
    setShowShareMenu(false);
  };

  const shareSocial = (platform: "wa" | "fb") => {
    const url = window.location.href;
    const links = {
      wa: `https://api.whatsapp.com/send?text=${encodeURIComponent(annonce.titre + " " + url)}`,
      fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    window.open(links[platform], "_blank");
    registerShare();
    setShowShareMenu(false);
  };

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-orange-700" size={42} />
      </div>
    );

  if (!annonce)
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <p className="text-slate-400 font-bold">Annonce introuvable.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-orange-700 text-white rounded-lg font-bold hover:bg-orange-800 transition-colors"
        >
          Actualiser
        </button>
      </div>
    );

  const entreprise = annonce.user?.entreprise;
  const MAX_CONTENT_LENGTH = 500;
  const isLongContent = annonce.contenu?.length > MAX_CONTENT_LENGTH;
  const displayContent =
    isLongContent && !isDescExpanded
      ? annonce.contenu.substring(0, MAX_CONTENT_LENGTH) + "..."
      : annonce.contenu;

  return (
    <div className="min-h-screen bg-white pb-20">
      <Toaster position="top-right" />
      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <BackButton />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center flex-wrap gap-3">
            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[11px] font-black uppercase tracking-tighter rounded border border-orange-100">
              {annonce.categorie?.nom}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-sm flex items-center gap-1 font-medium">
              <Calendar size={14} /> publié le :{" "}
              {new Date(annonce.created_at).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1
            className={`font-black text-slate-900 mb-8 leading-tight tracking-tight text-2xl md:text-4xl`}
          >
            {annonce.titre}
          </h1>

          {annonce.image && (
            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm mb-10 bg-slate-50">
              <img
                src={`${apifile}/${annonce.image}`}
                className="w-full h-auto max-h-[600px] object-cover"
                alt={annonce.titre}
              />
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-[17px] mb-4 whitespace-pre-line">
            {displayContent}
          </div>

          {isLongContent && (
            <button
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="mb-12 flex items-center gap-2 text-orange-700 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              {isDescExpanded ? (
                <>
                  <ChevronUp size={16} /> Voir moins
                </>
              ) : (
                <>
                  <ChevronDown size={16} /> Lire la suite
                </>
              )}
            </button>
          )}

          <div className="space-y-4">
            {annonce.pdf && (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all hover:border-slate-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-red-500 border border-slate-100">
                    <FileText size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 italic">
                      Document joint
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Fichier PDF à consulter
                    </p>
                  </div>
                </div>
                <a
                  href={`${apifile}/${annonce.pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[11px] font-black hover:bg-orange-700 transition-all shadow-lg uppercase tracking-widest"
                >
                  <Download size={16} /> Consulter le PDF
                </a>
              </div>
            )}
            {annonce.lien && (
              <div className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-orange-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-orange-600 border border-orange-50">
                    <ExternalLink size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 italic">
                      Lien externe
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Ressource complémentaire
                    </p>
                  </div>
                </div>
                <a
                  href={annonce.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-700 text-white px-6 py-3 rounded-xl text-[11px] font-black hover:bg-slate-900 transition-all shadow-lg uppercase tracking-widest"
                >
                  Ouvrir le lien
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">
                  {sharesCount}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Partage(s)
                </p>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">
                  {likesCount}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  J'aime(s)
                </p>
              </div>
              <div className="h-8 w-[1px] bg-slate-100"></div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">
                  {participantsCount}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Inscrit(s)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 font-black text-[11px] uppercase tracking-wider transition-all ${isLiked ? "bg-orange-700 border-orange-700 text-white shadow-md" : "bg-white border-slate-100 text-slate-500 hover:border-orange-200"}`}
              >
                {likeLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                )}
                {isLiked ? "Aimé" : "J'aime"}
              </button>

              <div className="relative flex-1">
                <button
                  onClick={handleOpenShare}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 border-2 border-slate-100 text-slate-600 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-slate-100"
                >
                  <Share2 size={18} /> Partager
                </button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-3 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 overflow-hidden"
                    >
                      <button
                        onClick={copyToClipboard}
                        className="w-full p-4 flex items-center gap-3 text-sm font-bold hover:bg-slate-50 border-b border-slate-50 text-slate-700"
                      >
                        <Copy size={16} className="text-slate-400" /> Copier le
                        lien
                      </button>
                      <button
                        onClick={() => shareSocial("wa")}
                        className="w-full p-4 flex items-center gap-3 text-sm font-bold hover:bg-green-50 text-green-600 border-b border-slate-50"
                      >
                        <Send size={16} /> WhatsApp
                      </button>
                      <button
                        onClick={() => shareSocial("fb")}
                        className="w-full p-4 flex items-center gap-3 text-sm font-bold hover:bg-blue-50 text-blue-600"
                      >
                        <Facebook size={16} /> Facebook
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {annonce.categorie?.nom === "Événement" && (
              <div className="mb-8">
                <button
                  disabled={isParticipating || participationLoading}
                  onClick={handleParticiper}
                  className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] ${
                    isParticipating
                      ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                      : "bg-slate-900 text-white hover:bg-orange-700"
                  }`}
                >
                  {participationLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isParticipating ? (
                    <>
                      <CheckCircle size={18} /> Inscription validée
                    </>
                  ) : (
                    "Confirmer ma présence"
                  )}
                </button>
              </div>
            )}

            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
                Publié par :
              </h4>
              <Link
                href={`/profil-entreprise/${annonce?.user?.id}`}
                className="flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-inner uppercase overflow-hidden border border-slate-100">
                  {annonce?.user?.pp ? (
                    <img
                      src={`${apifile}/${annonce.user.pp}`}
                      alt={entreprise?.nom}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span>{entreprise?.nom?.substring(0, 1) || "E"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 truncate uppercase tracking-tight text-base">
                    {entreprise?.nom || "Entreprise"}
                  </p>
                  <p className="flex items-center text-slate-500 text-xs font-bold mt-1">
                    <Briefcase size={14} className="text-orange-600 mr-1.5" />
                    <span className="line-clamp-1">
                      {entreprise?.service ||
                        entreprise?.domaine ||
                        "Partenaire officiel"}
                    </span>
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
