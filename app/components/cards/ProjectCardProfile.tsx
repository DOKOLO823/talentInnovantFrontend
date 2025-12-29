"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MoreVertical, Edit, Trash2, Flag, Share2, MessageCircle,
  Maximize2, Trophy, Flame, ChevronDown, ChevronUp,
  X, MessageSquare, Facebook, AlertTriangle, PencilLine
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
        <div className="flex gap-4 mb-6 text-center">
          <a href={`https://wa.me/?text=${encodeURIComponent(projectTitle + " " + shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-green-500 text-white rounded-2xl w-full flex justify-center"><MessageSquare /></div>
            <span className="text-xs">WhatsApp</span>
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="flex-1 flex flex-col items-center gap-2">
            <div className="p-4 bg-blue-600 text-white rounded-2xl w-full flex justify-center"><Facebook /></div>
            <span className="text-xs">Facebook</span>
          </a>
        </div>
        <div className="flex border rounded-xl overflow-hidden mt-4">
          <input readOnly value={shareUrl} className="flex-1 p-3 text-xs truncate outline-none" />
          <button onClick={handleCopy} className="bg-orange-700 text-white px-4 text-xs font-bold">COPIER</button>
        </div>
      </motion.div>
    </div>
  );
}

function EditScoreModal({ isOpen, onClose, project, onSave }: any) {
  const [newScore, setNewScore] = useState(project.notefinale || "");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleValidate = () => {
    if (newScore === "" || newScore === null) {
      setError("La note est obligatoire");
      return;
    }
    const val = parseFloat(newScore);
    if (isNaN(val)) {
      setError("Veuillez entrer un nombre valide");
      return;
    }
    setError("");
    onSave(project.id, val);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Modifier la note</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-2xl">
          <Image src={project.author.avatar} width={50} height={50} alt="avatar" className="rounded-full object-cover h-12 w-12" />
          <div>
            <p className="font-bold text-sm">{project.author.name}</p>
            <p className="text-xs text-gray-500">{project.author.role}</p>
          </div>
        </div>
        <div className="mb-6">
          <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nouvelle Note</label>
          <input 
            type="number" step="any" value={newScore}
            onChange={(e) => { setNewScore(e.target.value); setError(""); }}
            className={`w-full p-4 rounded-xl border-2 outline-none text-xl font-bold text-center ${error ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-orange-500'}`}
          />
          {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{error}</p>}
        </div>
        <button onClick={handleValidate} className="w-full py-4 bg-orange-700 text-white rounded-2xl font-bold active:scale-95 transition-transform">
          Confirmer la modification
        </button>
      </motion.div>
    </div>
  );
}

/* ================= COMPOSANT PRINCIPAL ================= */

export default function ProjectCardProfile({ project, challenge }: any) {
  const [openMenu, setOpenMenu] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditScore, setShowEditScore] = useState(false);

  const router = useRouter();
  const params = useParams();
  const idchallenge = project.challenge?.id;

  const handleSaveScore = (projectId: any, score: number) => {
    console.log(`Note modifiée à ${score} pour le projet ID ${projectId}`);
    setShowEditScore(false);
  };

  const handleNavigateToReel = () => {
    const query = new URLSearchParams({
      project: project.id.toString(),
      talentId: project.author.id,
      titre: project?.challenge?.name || "Challenge",
      typeevaluation: project?.challenge?.typeevaluation || "vote",
      resultatdisponible: project?.challenge?.resultatdisponible?.toString() || "non"
    }).toString();
    router.push(`/challenge/${idchallenge}/reel-profil?${query}`);
  };

  const visibleResponses = showAllFields ? project.responses : (project.responses?.slice(0, 2) || []);

  const renderResponse = (r: any) => {
    const label = r.challenge_field.label;
    const type = r.challenge_field.type;
    const value = r.value;
    const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${value}`;

    if (type === "text") return <div className="mb-4"><p className="font-bold text-sm text-gray-950 mb-1">{label}</p><ReadMore text={value} /></div>;
    
    return (
      <div className="mb-4">
        <p className="font-bold text-sm text-gray-950 mb-1">{label}</p>
        {value.match(/\.(jpg|jpeg|png)$/i) ? (
          <img src={fileUrl} className="rounded-xl w-full max-h-60 object-cover border" />
        ) : value.match(/\.(mp4|mov)$/i) ? (
          <video controls className="rounded-xl w-full max-h-60 bg-black"><source src={fileUrl} /></video>
        ) : value.endsWith(".pdf") ? (
          <a href={fileUrl} target="_blank" className="text-orange-700 underline text-sm">📄 Ouvrir le PDF</a>
        ) : (
          <a href={fileUrl} target="_blank" className="text-orange-700 underline text-sm">📝 Télécharger le fichier</a>
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-white rounded-2xl shadow border w-full max-w-xl mx-auto flex flex-col mb-6 p-1">
      
      {/* HEADER USER & DROPDOWN */}
      <div className="flex justify-between p-4 pb-2">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profil-talent/${project.author.id}`)}>
          <Image src={project.author.avatar} width={44} height={44} alt="avatar" className="rounded-full object-cover aspect-square" />
          <div>
            <p className="font-semibold hover:text-orange-600 transition-colors">{project.author.name}</p>
            <p className="text-sm text-gray-600">{project.author.role}</p>
          </div>
        </div>
        <div className="relative">
          <MoreVertical className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setOpenMenu(!openMenu)} />
          {openMenu && (
            <div className="absolute right-0 bg-white border shadow-xl rounded-xl w-44 z-20 py-1">
              <button className="flex items-center gap-2 p-3 w-full hover:bg-gray-50 text-sm transition"><Edit size={16} /> Modifier</button>
              <button onClick={() => { setShowConfirmDelete(true); setOpenMenu(false); }} className="flex items-center gap-2 p-3 w-full hover:bg-red-50 text-red-600 text-sm transition"><Trash2 size={16} /> Supprimer</button>
              <button onClick={() => setOpenMenu(false)} className="flex items-center gap-2 p-3 w-full hover:bg-gray-50 text-sm transition"><Flag size={16} /> Signaler</button>
            </div>
          )}
        </div>
      </div>

      {/* RANG / SCORE */}
      <div className="px-4 flex items-center gap-6 text-gray-500 font-bold tracking-tight mb-2">
        {project.rank && (
          <span className="flex items-center gap-1 text-xs"><Trophy size={14} className="text-yellow-500" /> Rang final : <b className="text-gray-900">{project.rank}e</b></span>
        )}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs"><Flame size={14} className="text-orange-600" /> Note finale : <b className="text-gray-900">{project.notefinale ?? 'N/A'}</b></span>
          <button onClick={() => setShowEditScore(true)} className="p-1.5 bg-gray-100 text-orange-700 hover:bg-orange-100 rounded-lg transition-all">
            <PencilLine size={14} />
          </button>
        </div>
      </div>

      {/* INFOS DU CHALLENGE LIÉ */}
      {project.challenge && (
        <div className="px-4">
          <Link href={`/challenge/${project.challenge.id}`} className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-100">
            <Image src={project.challenge.image} width={40} height={40} alt="challenge" className="rounded-lg object-cover" />
            <div>
              <p className="text-sm font-bold text-gray-800">{project.challenge.name}</p>
              <p className="text-xs text-gray-500 font-medium">Voir le challenge</p>
            </div>
          </Link>
        </div>
      )}

      {/* CONTENT (RESPONSES) */}
      <div className={`px-4 mt-2 transition-all ${showAllFields ? "max-h-[400px] overflow-y-auto" : ""}`}>
        {visibleResponses.map((r: any) => (
          <div key={r.id}>{renderResponse(r)}</div>
        ))}
      </div>

      {/* VOIR PLUS (ACCORDEON) */}
      {project.responses?.length > 2 && (
        <button onClick={() => setShowAllFields(!showAllFields)} className="text-orange-700 text-sm font-bold flex items-center justify-center gap-1 py-3 hover:bg-orange-50 transition border-t border-b border-gray-50">
          {showAllFields ? <><ChevronUp size={18} /> Voir moins</> : <><ChevronDown size={18} /> Voir plus de détails</>}
        </button>
      )}

      {/* FOOTER */}
      <div className="px-4 py-3 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
        <span className="text-xs font-bold text-gray-500">{project.votesCount || 0} vote(s)</span>
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 text-gray-600 hover:text-orange-700 transition">
            <MessageCircle size={20} onClick={handleNavigateToReel} /> <span className="text-sm font-medium">12</span>
          </button>
          <button onClick={() => setOpenShare(true)} className="flex items-center gap-1.5 text-gray-600 hover:text-orange-700 transition">
            <Share2 size={18} />
          </button>
          <Maximize2 className="text-orange-700 cursor-pointer hover:scale-110 transition" size={20} onClick={handleNavigateToReel} />
        </div>
      </div>

      <ShareModal isOpen={openShare} onClose={() => setOpenShare(false)} projectTitle={project.author.name} />
      <ConfirmationModal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} onConfirm={() => setShowConfirmDelete(false)} />
      <EditScoreModal isOpen={showEditScore} onClose={() => setShowEditScore(false)} project={project} onSave={handleSaveScore} />
    </div>
  );
}