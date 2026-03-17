import {
  MoreVertical,
  Users,
  MessageSquare,
  Share2,
  Heart,
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  Megaphone,
  Maximize2,
  X,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { toast } from "react-hot-toast";
import apifile from "@/app/lib/apifile";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AnnonceCard({
  annonce,
  onEdit,
  onDeleteSuccess,
  currentUserId,
}: any) {
  const [showMenu, setShowMenu] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Pour l'état de chargement
  const router = useRouter();
  //   console.log(annonce);

  // États pour le Zoom et l'extension du texte
  const [showZoom, setShowZoom] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiFetch(`/annonces/${annonce.id}`, { method: "DELETE" });
      toast.success("Annonce supprimée");
      onDeleteSuccess();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* MENU 3 POINTS */}
      {currentUserId === annonce.user_id && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <MoreVertical size={18} className="text-gray-700" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-50 p-2 animate-in fade-in zoom-in duration-200 z-20">
              <button
                onClick={() => {
                  onEdit();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Edit3 size={16} /> Modifier
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true); // Ouvre le nouveau modal
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} /> Supprimer
              </button>
            </div>
          )}
        </div>
      )}

      {/* IMAGE DE COUVERTURE */}
      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
        {annonce.image ? (
          <img
            src={apifile + "/" + annonce.image}
            alt={annonce.titre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
            <Megaphone size={48} />
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
          {annonce.categorie?.nom}
        </div>

        {/* BOUTON ZOOM */}
        <button
          onClick={() => setShowZoom(true)}
          className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-gray-700 hover:text-orange-700 transition-all group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* CONTENU CARD */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {annonce.titre}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-2 flex-1">
          {annonce.contenu}
        </p>

        <div className="flex items-center gap-2 text-gray-500 mb-3">
          <Calendar size={14} className="text-orange-600" />
          <span className="text-[11px] font-medium italic">
            Publié le :{" "}
            {new Date(annonce.created_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {/* BOUTON VOIR DETAILS */}
        <Link
          href={`/annonce/${annonce.id}`}
          className="flex border border-orange-700 rounded-lg p-2 text-center  flex-row justify-center hover:bg-orange-700 hover:text-white items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all mb-4"
        >
          Voir l'annonce <ChevronRight size={14} />
        </Link>

        {/* PIÈCES JOINTES */}
        {/* <div className="flex gap-2 mb-4">
          {annonce.pdf && (
            <a
              href={apifile + "/" + annonce.pdf}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <FileText size={14} /> PDF
            </a>
          )}
          {annonce.lien && (
            <a
              href={annonce.lien}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <ExternalLink size={14} /> Lien
            </a>
          )}
        </div> */}

        {/* STATISTIQUES */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-1.5">
              <Heart
                size={16}
                className={
                  annonce.likes_count > 0 ? "text-red-500 fill-red-500" : ""
                }
              />
              <span className="text-xs font-bold">{annonce.likes_count}</span>
            </div>
            {/* <div className="flex items-center gap-1.5">
              <MessageSquare size={16} />
              <span className="text-xs font-bold">
                {annonce.commentaires_count}
              </span>
            </div> */}
            <div className="flex items-center gap-1.5">
              <Share2 size={16} />
              <span className="text-xs font-bold">
                {annonce.partages_count}
              </span>
            </div>
          </div>

          {annonce.participants_count !== undefined && (
            <button
              onClick={() => setShowParticipants(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-slate-200"
            >
              <Users size={14} />
              <span className="text-xs font-bold">
                {annonce.participants_count} inscrits
              </span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL ZOOM */}
      <AnimatePresence>
        {showZoom && (
          <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* Croix de fermeture sécurisée pour images blanches */}
              <button
                onClick={() => setShowZoom(false)}
                className="absolute top-6 right-6 z-20 p-2.5 bg-slate-900/50 hover:bg-slate-900/80 text-white backdrop-blur-md rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto custom-scrollbar">
                <div className="h-80 w-full bg-slate-100">
                  {annonce.image ? (
                    <img
                      src={apifile + "/" + annonce.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <Megaphone size={64} />
                    </div>
                  )}
                </div>

                <div className="py-10 px-6 md:px-10">
                  <span className="px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                    {annonce.categorie?.nom}
                  </span>

                  <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                    {annonce.titre}
                  </h2>

                  <div className="space-y-4">
                    <p
                      className={`text-slate-600 leading-relaxed font-medium ${!isExpanded ? "line-clamp-4" : ""}`}
                    >
                      {annonce.contenu}
                    </p>

                    {/* Gestion de l'affichage dynamique basé sur la taille du texte */}
                    {annonce.contenu?.length > 200 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-orange-700 text-[10px] font-black uppercase tracking-wider hover:underline flex items-center gap-1"
                      >
                        {isExpanded
                          ? "Voir moins"
                          : "Lire toute la description"}
                      </button>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col md:flex-row w-full gap-4">
                    {annonce.pdf && (
                      <a
                        href={apifile + "/" + annonce.pdf}
                        target="_blank"
                        className="flex justify-center items-center w-full md:w-auto gap-3 px-8 py-3 bg-red-50 text-red-700 rounded-2xl font-bold hover:bg-red-100 transition-all text-sm"
                      >
                        <FileText size={18} /> Consulter le PDF
                      </a>
                    )}
                    {annonce.lien && (
                      <a
                        href={annonce.lien}
                        target="_blank"
                        className="flex justify-center items-center w-full md:w-auto gap-3 px-10 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all text-sm"
                      >
                        <ExternalLink size={18} /> Ouvrir le lien
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PARTICIPANTS */}
      {showParticipants && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-black">Liste des inscrits</h4>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-black font-bold"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {annonce.participants?.length > 0 ? (
                annonce.participants.map((p: any) => (
                  <div
                    onClick={() => router.push("/profil-talent/" + p?.id)}
                    key={p.id}
                    className="flex items-center cursor-pointer gap-4 p-3 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100"
                  >
                    {/* Affichage de la PP ou Image par défaut */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img
                        src={
                          p.pp ? `${apifile}/${p.pp}` : "/assets/images/pp2.png"
                        }
                        alt={p.name}
                        className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e: any) => {
                          e.target.src = "/assets/images/pp2.png";
                        }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 leading-tight line-clamp-1">
                        {p?.infos?.nom || "Utilisateur"}
                      </span>
                      {/* Affichage Profession ou "Innovateurs" */}
                      <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide line-clamp-2">
                        {p?.infos?.profession || "Innovateur"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Users size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-gray-400 font-medium">
                    Aucun inscrit pour le moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Card Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Supprimer l'annonce ?
              </h3>
              <p className="text-slate-500 font-medium mb-8">
                Cette action est irréversible. Toutes les données liées à cette
                annonce seront définitivement perdues.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
