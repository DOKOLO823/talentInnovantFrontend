"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Trash2,
  User,
  FileText,
  File,
  Maximize2,
  Download,
  X,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext"; // Ajustez selon votre context
import BackButton from "@/app/components/BackButton"; // Votre composant existant
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";

// --- SOUS-COMPOSANTS ---

function ExpandableText({
  text,
  limit = 250,
}: {
  text: string;
  limit?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  if (text.length <= limit)
    return <p className="text-gray-700 text-[15px] leading-relaxed">{text}</p>;
  return (
    <div className="text-gray-700 text-[15px] leading-relaxed">
      <p>
        {isExpanded ? text : `${text.substring(0, limit)}...`}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-orange-700 font-bold hover:underline text-xs md:text-sm"
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      </p>
    </div>
  );
}

function FileRenderer({
  value,
  type,
  label,
}: {
  value: string;
  type: string;
  label: string;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Arrêter la vidéo si elle sort de l'écran (Scroll)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.1 }, // S'active dès que la vidéo est presque hors vue
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    // 2. Empêcher plusieurs lectures simultanées
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((vid) => {
      if (vid !== e.currentTarget) {
        vid.pause();
      }
    });
  };

  if (!value) return null;

  const fullUrl = value.startsWith("http") ? value : `${apifile}/${value}`;

  const isImage =
    value.match(/\.(jpg|jpeg|png|webp|gif)$/i) || type === "image";
  const isVideo = value.match(/\.(mp4|mov|webm)$/i) || type === "video";
  const isPDF = /\.pdf$/i.test(value);
  const isDoc = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(value);
  const isPreviewable = isPDF || isDoc;

  if (["text", "textarea", "option", "select"].includes(type)) {
    return <ExpandableText text={value} />;
  }

  if (isVideo) {
    return (
      <div className="mb-4">
        <video
          ref={videoRef}
          controls
          onPlay={handlePlay}
          controlsList="nodownload" // Enlève le menu téléchargement
          onContextMenu={(e) => e.preventDefault()} // Bloque le clic droit
          className="rounded-2xl w-full h-[400px] aspect-video bg-black shadow-lg object-contain border border-slate-100"
        >
          <source src={fullUrl} />
        </video>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="mb-4">
        <img
          src={fullUrl}
          className="rounded-2xl w-full h-[400px] object-cover border border-slate-100 bg-white shadow-sm"
          alt={label}
        />
      </div>
    );
  }

  if (isPreviewable) {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              {isPDF ? <FileText size={14} /> : <File size={14} />}
            </div>
            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[180px] relative -left-1">
              Aperçu Document
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 hover:bg-orange-50 text-orange-600 rounded-md transition-all flex items-center gap-1"
              title="Voir en grand"
            >
              <Maximize2 size={16} />
              <span className="text-[10px] font-bold uppercase">
                Plein écran
              </span>
            </button>
            <a
              href={fullUrl}
              download
              className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-md"
            >
              <Download size={16} />
            </a>
          </div>
        </div>

        <div className="relative w-full h-[380px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
          <iframe
            src={
              isPDF
                ? `${fullUrl}#toolbar=0`
                : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
            }
            className="w-full h-full border-none"
            title={label}
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 pointer-events-none transition-all" />
        </div>

        <AnimatePresence>
          {isFullscreen && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 md:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFullscreen(false)}
                className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full h-full bg-white md:rounded-3xl overflow-hidden flex flex-col"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <span className="font-bold text-sm text-slate-700">
                    {label}
                  </span>
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                <iframe
                  src={
                    isPDF
                      ? fullUrl
                      : `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`
                  }
                  className="w-full flex-1 border-none"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
          <File size={18} />
        </div>
        <span className="text-xs font-bold text-slate-600 truncate">
          {label}
        </span>
      </div>
      <a
        href={fullUrl}
        download
        className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all"
      >
        <Download size={14} /> Télécharger
      </a>
    </div>
  );
}

// --- PAGE PRINCIPALE ---

export default function SubmissionDetailClient({ postId }: { postId: string }) {
  const router = useRouter();
  const { user } = useAuth(); // Votre système d'auth
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const res = await apiFetch(`/challenge/post/details/${postId}`, {
        method: "GET",
      });
      if (res.statut === 200) {
        setData(res.post);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/challenge/post/delete/${postId}`, {
        method: "GET",
      });
      if (res.statut == 200) {
        router.back();
        toast.success(res?.message, { duration: 6000 });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-orange-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse text-sm">
          Chargement de votre soumission...
        </p>
      </div>
    );

  // Vérification Connexion
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">
            Accès restreint
          </h2>
          <p className="text-slate-500 text-[15px] mb-8">
            Vous devez être connecté pour voir les détails de cette soumission.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register-talent"
              className="w-full border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );

  // Vérification Propriétaire (sauf si admin)
  if (data && data.user_id !== user.id && user.role !== "admin")
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-2">Oups !</h2>
          <p className="text-slate-500 text-[15px]">
            Cette soumission ne vous appartient pas.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 text-orange-600 font-bold underline"
          >
            Retourner en arrière
          </button>
        </div>
      </div>
    );

  //   on verifie si le poste exite
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-2">Oups !</h2>
          <p className="text-slate-500 text-[15px]">Ce post a été supprimé.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 text-orange-600 font-bold underline"
          >
            Retourner en arrière
          </button>
        </div>
      </div>
    );

  const isDeadlinePassed = data?.challenge?.datefininscription
    ? new Date(data.challenge.datefininscription) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 w-full flex flex-row justify-center items-center">
      <div className=" w-full md:max-w-3/4 lg:max-w-2/4 pt-6">
        <Toaster />
        <BackButton />

        {/* Bloc Challenge Parent */}
        <Link
          href={`/challenge/${data?.challenge?.id}`}
          className="block mb-8 bg-white p-4 mx-1 border border-slate-100 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-full">
              <div className="relative w-12 h-12 rounded-full bg-slate-100 border border-slate-50">
                <img
                  src={
                    data?.challenge?.photo
                      ? `${apifile}/${data?.challenge?.photo}`
                      : "../assets/images/award.jpg"
                  }
                  alt="photo challenge"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="w-8/9">
                <p className="text-[10px] font-black text-orange-600 tracking-widest mb-0.5">
                  Challenge correspondant :
                </p>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                  {data?.challenge?.titre}
                </h3>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                  <span>Voir le challenge</span> <ExternalLink size={12} />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation & Titre */}
        <div className="flex items-center justify-between px-6 relative -top-2 mb-7">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Ma soumission
            </h1>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Profil Talent */}
        <div className="flex items-center gap-4 mb-2 px-2 mx-6">
          <img
            src={
              data?.user?.pp
                ? `${apifile}/${data.user.pp}`
                : "../assets/images/pp2.png"
            }
            alt="Avatar"
            className="object-cover h-12 w-12"
          />

          <div>
            <h2 className="text-lg text-slate-900 font-semibold leading-none mb-1 line-clamp-1">
              {data?.user?.talent?.nom || data?.user?.name || "Talent"}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider italic line-clamp-1">
              {data?.user?.talent?.profession || "Innovateur"}
            </p>
          </div>
        </div>

        {/* Liste des Réponses (Post) */}
        <div className="space-y-8 bg-white p-6 md:p-10 border border-slate-100 shadow-sm">
          {data?.responses?.map((res: any) => (
            <div key={res.id} className="flex flex-col gap-3">
              <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">
                {res.challenge_field.label}
              </label>
              <FileRenderer
                value={res.value}
                type={res.challenge_field.type}
                label={res.challenge_field.label}
              />
            </div>
          ))}

          {/* Message de fin d'inscription */}
          {!isDeadlinePassed && data?.challenge?.datefininscription && (
            <div className="mt-12 p-6 rounded-[32px] text-center">
              <p className=" text-xs font-medium leading-relaxed">
                <span className="font-bold underline">NB</span> : Les
                soumissions des autres participants seront visibles dès la fin
                des inscriptions soit le : <br />
                <span className="text-orange-700 font-bold">
                  {new Date(data.challenge.datefininscription)
                    .toLocaleString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .replace(":", "h")}
                </span>
                {data?.challenge?.typeevaluation_id != 2 &&
                  " (Date à laquelle commencent les votes de projets)"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm p-8 rounded-[32px] shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Supprimer le projet ?
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                Cette action est irréversible. Vos points liés à cette
                soumission seront déduits.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
