"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  ArrowRight,
  MoreVertical,
  Loader2,
  X,
  FileText,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import CreateOpportunityModal from "../entreprise/CreateOpportunityModal";
import { useRouter } from "next/navigation";

// --- MODAL APERÇU (IMAGE/PDF) ---
const PreviewModal = ({ isOpen, onClose, url, type, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="relative w-full h-full max-w-4xl bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <span className="text-xs font-bold text-gray-600 truncate px-2">
            {title}
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 flex justify-center">
          {type === "image" ? (
            <img src={url} alt={title} className="object-contain max-h-full" />
          ) : (
            <iframe
              src={`${url}#view=FitH`}
              className="w-full h-full border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODAL ALERTE LIEN EXTERNE ---
const ExternalLinkModal = ({ isOpen, onClose, url }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ExternalLink size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Lien externe</h3>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Vous allez être redirigé vers une plateforme externe pour postuler.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={url}
            target="_blank"
            onClick={onClose}
            className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl text-sm transition-all hover:bg-orange-700"
          >
            Continuer
          </a>
          <button
            onClick={onClose}
            className="py-2 text-xs font-bold text-gray-400"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export function OpportuniteCard({ opp }: { opp: any }) {
  const { user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showExternalAlert, setShowExternalAlert] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [likes, setLikes] = useState(opp.like || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false); // État pour le petit loader du like
  const router = useRouter();

  const isExpired = opp.delaicandidature
    ? new Date(opp.delaicandidature) < new Date(new Date().setHours(0, 0, 0, 0))
    : false;

  useEffect(() => {
    if (user?.id && opp.ids_likeurs) {
      setIsLiked(opp.ids_likeurs.map(Number).includes(Number(user.id)));
    }
  }, [user, opp.ids_likeurs]);

  if (isDeleted) return null;

  const formatDateHumain = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const fullUrl =
    opp.lien?.startsWith("http") || opp.format == "lien"
      ? opp.lien
      : `${apifile}/${opp.lien}`;
  const isFile =
    opp.format === "pdf" || opp.format === "image" || opp.format === "document";

  const handleAction = () => {
    if (isFile) setShowPreview(true);
    else setShowExternalAlert(true);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.id) return toast.error("Connectez-vous");
    if (loadingLike) return;

    setLoadingLike(true);
    try {
      const res = await apiFetch(`/opportunite/like/${opp.id}`, {
        method: "GET",
      });
      if (res?.statut === 200) {
        setLikes(res.likes_total);
        setIsLiked(!isLiked);
      }
    } catch (error) {
      toast.error("Erreur");
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <>
      <div className="group bg-white border border-gray-400 rounded-[2rem] p-4 w-full flex flex-col h-full transition-all hover:shadow-lg">
        {/* MEDIA SECTION */}
        <div
          onClick={handleAction}
          className="relative h-36 w-full shrink-0 rounded-[1.5rem] overflow-hidden mb-4 bg-gray-50 border border-gray-100 cursor-pointer"
        >
          {opp.format === "image" ? (
            <Image
              src={fullUrl}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              alt={opp.titre}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <FileText size={36} strokeWidth={1.5} />
              <span className="text-[9px] font-bold uppercase mt-2 tracking-widest opacity-60">
                {opp.format || "DOC"}
              </span>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase shadow-lg">
              {opp.type}
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2">
              {opp.titre}
            </h3>
            {Number(user?.id) === Number(opp.user?.id) && (
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400"
                >
                  <MoreVertical size={18} />
                </button>
                {openMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[100]">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setOpenMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 size={14} /> Modifier
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true);
                        setOpenMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <p className="text-[10px] font-bold text-orange-700 mb-3 uppercase tracking-wider">
            {opp.domaine?.nom || opp.domaine}
          </p>

          <p className="text-xs leading-relaxed text-gray-500 line-clamp-3 mb-5 font-medium">
            {opp.description}
          </p>

          <div className="flex items-center gap-2 text-[10px] font-bold mb-5 text-gray-400">
            <Clock
              size={14}
              className={isExpired ? "text-red-500" : "text-orange-700"}
            />
            <div className="flex items-center gap-1.5">
              <span>
                Date limite :{" "}
                <span className={isExpired ? "text-red-500" : "text-gray-900"}>
                  {formatDateHumain(opp.delaicandidature)}
                </span>
              </span>
              {isExpired && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[8px] uppercase tracking-tighter animate-pulse">
                  Expiré
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all ${isLiked ? "bg-orange-50 border-orange-100 text-orange-700" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"}`}
            >
              {loadingLike ? (
                <Loader2 size={18} className="animate-spin text-orange-700" />
              ) : (
                <Heart
                  size={18}
                  className={isLiked ? "fill-orange-700 text-orange-700" : ""}
                />
              )}
              <span className="font-bold text-xs">{likes}</span>
            </button>
            <button
              onClick={handleAction}
              className="flex-1 bg-orange-700 hover:bg-orange-800 text-white py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm tracking-widest"
            >
              DÉTAILS <ArrowRight size={14} />
            </button>
          </div>

          {/* CORPORATE FOOTER MODIFIÉ */}
          <div
            onClick={() => router.push(`/profil-entreprise/${opp?.user?.id}`)}
            className="flex items-center gap-2 pt-3 border-t border-gray-50 cursor-pointer"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
              <Image
                src={
                  opp.user?.pp
                    ? `${apifile}/${opp.user.pp}`
                    : "../assets/images/ppe.png"
                }
                fill
                className="object-cover"
                alt="logo"
                unoptimized
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-gray-400 leading-none mb-1">
                Publié par
              </span>
              <span className="text-[11px] font-bold text-gray-700 truncate leading-none">
                {opp.user?.entreprise?.nom || "Entreprise"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <CreateOpportunityModal
            onClose={() => setShowEditModal(false)}
            initialData={opp}
            onSuccess={() => window.location.reload()}
          />
        )}
      </AnimatePresence>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={fullUrl}
        type={opp.format === "image" ? "image" : "pdf"}
        title={opp.titre}
      />
      <ExternalLinkModal
        isOpen={showExternalAlert}
        onClose={() => setShowExternalAlert(false)}
        url={fullUrl}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-medium">
              Cette offre sera définitivement retirée.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 text-xs font-bold text-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  apiFetch(`/opportunite/delete/${opp.id}`, {
                    method: "GET",
                  }).then(() => {
                    setIsDeleted(true);
                    setShowDeleteModal(false);
                  })
                }
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
