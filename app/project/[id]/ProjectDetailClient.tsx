"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Send,
  ThumbsUp,
  Share2,
  MessageCircle,
  Trophy,
  Star,
  X,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Copy,
  Facebook,
  MessageSquare,
} from "lucide-react";
import BackButton from "@/app/components/BackButton";

// NOTE: L'URL de base pour les fichiers est lue depuis l'environnement.
// Assurez-vous que process.env.NEXT_PUBLIC_BACKEND_URL est défini côté serveur.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

// ---------------------- DONNÉES FACTICES POUR L'ÉTAT INITIAL CLIENT ----------------------

// Les données d'interaction client comme les commentaires peuvent être initialisées ici.
// Pour les données du projet lui-même, nous utilisons la prop `project`.
const FAKE_COMMENTS_DATA = [
  {
    id: 1,
    author: {
      name: "Dr. Marie Dubois",
      role: "Jury / Expert en Énergie",
      avatar: "../../assets/images/award.jpg",
      isJury: true,
    },
    text: "Une approche très prometteuse de l'optimisation. Excellent travail!",
  },
  {
    id: 2,
    author: {
      name: "Koffi L.",
      role: "Développeur Front-end",
      avatar: "../../assets/images/award.jpg",
      isJury: false,
    },
    text: "Vraiment inspirant. Hâte de voir la suite!",
  },
];

// ---------------------- COMPOSANTS UTILITAIRES ----------------------

/**
 * Composant pour afficher un commentaire détaillé.
 */
function CommentItem({ comment }: any) {
    const { author, text, isJury } = comment;
    return (
      <div className="flex gap-3 p-3 bg-white rounded-lg border border-gray-200">
        <Image src='../../assets/images/award.jpg' width={40} height={40} alt={`Avatar de ${author.name}`} className="rounded-full object-cover w-10 h-10 flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{author.name}</p>
            {isJury && (<span className="flex items-center text-xs text-white bg-red-600 px-2 py-0.5 rounded-full font-medium"><Star size={12} className="mr-1" fill="white" /> Jury</span>)}
          </div>
          <p className="text-xs text-gray-600 mb-1">{author.role}</p>
          <p className="text-gray-700 mt-1">{text}</p>
        </div>
      </div>
    );
}

/**
 * Fonction pour le rendu dynamique des réponses (texte, image, PDF, vidéo, etc.).
 */
const renderResponse = (response: any) => {
    if (!response || !response.challenge_field || !response.value) return null;

    const label = response.challenge_field.label;
    const type = response.challenge_field.type;
    const value = response.value;
    const fileUrl = `${BACKEND_URL}/${value}`;

    switch (type) {
      case "text":
        return (<div className="mb-4 p-3 border-l-4 border-orange-700 bg-orange-50/50 rounded"><p className="text-sm font-semibold text-gray-800">{label}</p><p className="text-gray-700 break-words">{value}</p></div>);
      case "file":
        // 1. Image
        if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return (<div className="mb-4"><p className="text-sm font-semibold text-gray-800">{label}</p><img src={fileUrl} alt={`Image pour ${label}`} className="rounded-lg w-full max-h-96 object-contain border shadow-sm"/></div>);
        }
        // 2. Vidéo
        if (value.match(/\.(mp4|mov|webm)$/i)) {
          return (<div className="mb-4"><p className="text-sm font-semibold text-gray-800">{label}</p><video controls className="rounded-lg w-full max-h-96 border shadow-sm"><source src={fileUrl} />Votre navigateur ne supporte pas la balise vidéo.</video></div>);
        }
        // 3. Document PDF
        if (value.endsWith(".pdf")) {
            return (<div className="mb-4 p-3 border rounded-lg bg-gray-50"><p className="text-sm font-semibold text-gray-800">{label}</p><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline flex items-center gap-1 hover:text-orange-800">📄 Ouvrir le PDF</a></div>);
          }
        // 4. Document Word
        if (value.match(/\.(doc|docx)$/i)) {
            return (<div className="mb-4 p-3 border rounded-lg bg-gray-50"><p className="text-sm font-semibold text-gray-800">{label}</p><a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-orange-700 underline flex items-center gap-1 hover:text-orange-800">📝 Télécharger le fichier Word</a></div>);
          }
        return null;
      default:
        return null;
    }
};

/**
 * Modale de Partage (avec liens sociaux).
 */
function ShareModal({ isOpen, onClose, projectTitle }: any) {
    const shareUrl = useMemo(() => {
        return typeof window !== 'undefined' ? window.location.href : 'URL du projet';
    }, [isOpen]);
    
    const shareText = encodeURIComponent(`Découvrez ce super projet : "${projectTitle}" sur notre plateforme. Votez ici : ${shareUrl}`);
    
    const whatsappUrl = `https://wa.me/?text=${shareText}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    
    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            alert('Lien copié !');
        } else {
            alert('Erreur: La copie n\'est pas supportée par votre navigateur.');
        }
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-xl font-bold">Partager le Projet</h3>
            <button onClick={onClose} aria-label="Fermer">
              <X size={24} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>
          
          <div className="flex justify-around gap-4 mb-6">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition w-1/3">
              <MessageSquare size={24} />
              <span className="text-sm mt-1">WhatsApp</span>
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition w-1/3">
              <Facebook size={24} />
              <span className="text-sm mt-1">Facebook</span>
            </a>
          </div>
          
          <p className="mb-2 text-gray-700 font-semibold">
            Ou Copier le lien :
          </p>
          
          <div className="flex border rounded-lg overflow-hidden mb-4">
            <input type="text" readOnly value={shareUrl} className="flex-grow p-3 bg-gray-50 text-sm border-r focus:outline-none min-w-0" />
            <button onClick={handleCopy} className="bg-orange-700 text-white px-4 hover:bg-orange-800 transition flex items-center gap-1 flex-shrink-0">
              <Copy size={18} /> Copier
            </button>
          </div>

        </div>
      </div>
    );
}

// ---------------------- COMPOSANT PRINCIPAL ----------------------

export default function ProjectDetailClient({ project }: any) {
  // 🚨 Initialisation des données avec les props passées du serveur, avec des valeurs par défaut
  const initialProject = {
    isResultPublished: false,
    hasVoted: false,
    votesCount: 0,
    commentCount: 0,
    juryComment: null,
    rank: null,
    points: null,
    totalPosts: null,
    responses: [],
    author: { id: '0', name: 'Inconnu', role: 'Participant', avatar: '../../assets/images/innov.jpg' },
    ...project,
  };

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(FAKE_COMMENTS_DATA); 
  const [hasVoted, setHasVoted] = useState(initialProject.hasVoted);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const isResultPublished = initialProject.isResultPublished;
  const projectAuthorId = initialProject.author.id || '2';

  const handleSend = () => {
    if (!newComment.trim()) return;
    const submittedComment = {
      id: Date.now(),
      author: {
        name: "Vous",
        role: "Utilisateur Actuel",
        avatar: "../../assets/images/innov.jpg",
        isJury: false,
      },
      text: newComment.trim(),
    };
    setComments([submittedComment, ...comments]);
    setNewComment("");
  };

  const handleVote = () => {
    setHasVoted((prev: boolean) => !prev);
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <BackButton/>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 bg-white shadow-xl rounded-b-xl">
        
        {/* TITRE ET INFOS AUTEUR */}
        <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{initialProject.title}</h1>
            <div className="relative flex-shrink-0">
                <MoreVertical className="cursor-pointer text-gray-700 hover:text-gray-900" onClick={() => setOpenMenu(!openMenu)}/>
                {openMenu && (
                    <div className="absolute right-0 mt-2 bg-white shadow-xl border rounded-lg w-40 p-2 z-20">
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"><Edit size={16} /> Modifier</div>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer text-red-600"><Trash2 size={16} /> Supprimer</div>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"><Flag size={16} /> Signaler</div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Link href={`/profil/${projectAuthorId}`} className="flex items-center gap-3 group">
                <Image
                    src="../../assets/images/innov.jpg"
                    alt={initialProject.author.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer group-hover:ring-2 ring-orange-400 transition"
                />
                <div>
                    <p className="font-semibold text-lg text-gray-900 group-hover:text-orange-700 transition">
                        {initialProject.author.name}
                    </p>
                    <p className="text-sm text-gray-500">{initialProject.author.role}</p>
                </div>
            </Link>
        </div>

        {/* =============================== */}
        {/* ESPACE RANG ET POINTS */}
        {/* =============================== */}
        {isResultPublished && initialProject.rank !== null && (
            <div className="flex justify-between items-center p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl shadow-md">
                <div className="flex items-center gap-3">
                    <Trophy size={32} className="text-orange-600 flex-shrink-0" fill="#f97316"/>
                    <div>
                        <p className="text-sm font-semibold text-gray-600">CLASSEMENT FINAL</p>
                        <p className="text-4xl font-extrabold text-orange-700 leading-none">
                            {initialProject.rank}
                            <span className="text-base text-gray-500 font-normal">/{initialProject.totalPosts}</span>
                            <span className="text-xl font-bold ml-3 text-green-700">| {initialProject.points} POINTS</span>
                        </p>
                    </div>
                </div>
            </div>
        )}
        
        {/* CONTENU DYNAMIQUE DU PROJET */}
        <div className="space-y-6 pb-6">
            {initialProject.responses && initialProject.responses.length > 0 ? (
                initialProject.responses.map((resp: any) => (
                    <div key={resp.id}>{renderResponse(resp)}</div>
                ))
            ) : (
                <p className="text-gray-500 italic">Aucun contenu de projet complet à afficher.</p>
            )}
        </div>


        {/* BARRE D'ACTIONS */}
        <div className="flex items-center justify-between border-y py-4 mb-8">
          {!isResultPublished ? (
            <div className="flex items-center justify-around w-full">
              {/* Bouton Vote */}
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                  hasVoted
                    ? "bg-orange-700 text-white hover:bg-orange-800 border-orange-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
                onClick={handleVote}
              >
                <ThumbsUp size={18} fill={hasVoted ? "white" : "none"} />
                Je vote <span className="text-sm font-semibold">({initialProject.votesCount + (hasVoted ? 1 : 0)})</span>
              </button>

              <button 
                className="flex items-center gap-2 text-gray-700 hover:text-orange-700 transition"
                onClick={handleShare}
              >
                <Share2 size={20} /> Partager
              </button>

              <div className="flex items-center gap-2 text-gray-700">
                <MessageCircle size={20} /> <span className="text-sm">({comments.length})</span>
              </div>
            </div>
          ) : <div className="text-sm text-gray-500 italic">Les votes sont clos et les résultats publiés.</div>}
        </div>

        {/* =============================== */}
        {/* ESPACE COMMENTAIRE DU JURY */}
        {/* =============================== */}
        {isResultPublished && initialProject.juryComment && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-red-700 flex items-center gap-2">
                <Star fill="#b91c1c" className="text-red-700" size={24} /> Avis Officiel du Jury
            </h2>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-inner">
              <p className="text-gray-800 italic leading-relaxed">
                “{initialProject.juryComment}”
              </p>
            </div>
          </div>
        )}

        {/* COMMENTAIRES VISITEURS */}
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Espace Commentaires ({comments.length})
        </h2>

        <div className="space-y-4">
          {comments.map((c: any) => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      </div>
      
      {/* INPUT COMMENTAIRE FIXE (OPTIMISÉ MOBILE) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40 p-4">
        <div className="flex items-center max-w-3xl mx-auto gap-3 w-full">
          <Image
            src="../../assets/images/innov.jpg"
            width={40}
            height={40}
            alt="Votre avatar"
            className="rounded-full object-cover w-10 h-10 flex-shrink-0"
          />
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Écrivez un commentaire..."
            className="
              flex-grow p-3 border border-gray-300 rounded-full 
              focus:ring-2 focus:ring-orange-700 focus:border-orange-700 
              transition duration-150 min-w-0 text-sm
            "
          />
          <button
            onClick={handleSend}
            disabled={newComment.trim() === ""}
            className={`
              p-3 rounded-full transition-colors flex items-center justify-center flex-shrink-0
              ${
                newComment.trim() === ""
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-700 text-white hover:bg-orange-800"
              }
            `}
            aria-label="Envoyer le commentaire"
          >
            <Send size={20} /> 
          </button>
        </div>
      </div>
      
      {/* MODALE DE PARTAGE */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        projectTitle={initialProject.title}
      />

    </div>
  );
}