"use client";

// components/coach/ChallengeMoreOptions.tsx
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MoreHorizontal,
  Share2,
  Heart,
  HeartOff,
  Bot,
  Loader2,
  ChevronDown,
  X, // Ajout de l'icône X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import CoachModal, { PredefinedCard } from "@/app/components/coach/CoachModal";

interface ChallengeMoreOptionsProps {
  challenge: any;
  currentUser: any;
  challengeId: string | number;
  suiveurs_ids: number[];
  onShare: () => void;
  userName?: string;
  userDomain?: string;
  userCompetences?: string;
  isCompany?: boolean; // Ajout de la prop isCompany
}

export default function ChallengeMoreOptions({
  challenge,
  currentUser,
  challengeId,
  suiveurs_ids,
  onShare,
  userName = "Talent",
  userDomain,
  userCompetences,
  isCompany,
}: ChallengeMoreOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(
    currentUser ? suiveurs_ids.includes(currentUser.id) : false,
  );
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFavorite = async () => {
    if (!currentUser) {
      toast.error("Connectez-vous pour ajouter aux favoris.");
      return;
    }
    setLoadingFavorite(true);
    // On ne ferme pas le menu ici pour que l'utilisateur voit le changement d'état si besoin,
    // ou on le ferme après le succès. Ici on le ferme après pour une meilleure UX.
    try {
      if (isFavorite) {
        const res = await apiFetch(`/challenge/neplussuivre/${challengeId}`, {
          method: "GET",
        });
        if (res?.statut === 200 || res?.status === 200) {
          setIsFavorite(false);
          toast.success("Retiré de vos favoris.");
          setIsOpen(false);
        } else {
          toast.error(res?.message || "Erreur.");
        }
      } else {
        const res = await apiFetch(`/challenge/suivre`, {
          method: "POST",
          body: JSON.stringify({ challenge_id: Number(challengeId) }),
        });
        if (
          res?.statut === 201 ||
          res?.statut === 200 ||
          res?.status === 201 ||
          res?.status === 200
        ) {
          setIsFavorite(true);
          toast.success("Ajouté à vos favoris ! ⭐");
          setIsOpen(false);
        } else {
          toast.error(res?.message || "Erreur.");
        }
      }
    } catch (e) {
      toast.error("Une erreur est survenue.");
    } finally {
      setLoadingFavorite(false);
    }
  };

  const predefinedCards: PredefinedCard[] = [
    {
      id: "idees_challenge",
      emoji: "💡",
      title: "Générer des idées pour ce challenge",
      description: `Obtenir 3 à 5 idées de projets pertinentes, innovantes et adaptées aux critères et au thème de **${challenge?.titre}**.`,
      buildPrompt: () =>
        `Propose-moi 3 à 5 idées de projets innovants et pertinents pour le challenge "${challenge?.titre}" dont le thème est "${challenge?.theme}". Pour chaque idée, détaille : le nom du projet, le problème africain résolu avec une donnée chiffrée, la solution proposée, pourquoi cette idée répond précisément aux critères de ce challenge, et le profil d'équipe idéal. Classe-les du plus original au plus classique.`,
    },
    {
      id: "structurer_challenge",
      emoji: "🏗️",
      title: "Structurer mon idée pour ce challenge",
      description:
        "Décrivez votre idée brute et obtenez une structure complète qui respecte exactement le format et les critères de ce challenge.",
      hasInput: true,
      inputPlaceholder: `Ex: Je veux créer une solution pour... (en lien avec ${challenge?.theme || "le thème du challenge"})`,
      inputMaxLength: 450,
      buildPrompt: (input) =>
        `Structure l'idée suivante pour qu'elle soit parfaitement adaptée au challenge "${challenge?.titre}" : "${input}". Respecte le format exact du formulaire de soumission du challenge et ses critères d'évaluation. Pour chaque champ du formulaire, donne un contenu précis, convaincant et différenciant. Inclus aussi les forces de cette idée par rapport aux critères du jury.`,
    },
    {
      id: "jury_challenge",
      emoji: "🎯",
      title: "Simuler le jury de ce challenge",
      description:
        "Entraînez-vous face à un jury qui connaît tous les détails de ce challenge. Répondez par numéro (1-, 2-...) et recevez votre note /20.",
      hasInput: true,
      inputPlaceholder: "Décrivez brièvement votre projet pour ce challenge...",
      inputMaxLength: 400,
      buildPrompt: (input) =>
        `Je veux simuler le passage devant le jury du challenge "${challenge?.titre}". Mon projet : "${input}". Joue le rôle du jury de ce challenge, en connaissant parfaitement ses critères d'évaluation et son thème. Commence par poser 5 questions numérotées (1-, 2-, 3-, 4-, 5-) précises et exigeantes, directement liées aux critères de ce challenge. Sois rigoureux et réaliste.`,
    },
    {
      id: "ameliorer_challenge",
      emoji: "✨",
      title: "Améliorer une idée déjà structurée",
      description:
        "Soumettez votre idée déjà structurée et obtenez une analyse forces/faiblesses + la version améliorée au format du challenge.",
      hasInput: true,
      inputPlaceholder:
        "Collez ici votre idée déjà structurée (titre, description, solution, etc.)...",
      inputMaxLength: 800,
      buildPrompt: (input) =>
        `Analyse et améliore l'idée de projet suivante dans le contexte du challenge "${challenge?.titre}" : \n\n${input}\n\nFais une analyse en 3 parties : 1- FORCES (ce qui est bien aligné avec les critères du challenge), 2- FAIBLESSES (ce qui peut être renforcé ou manque), 3- VERSION AMÉLIORÉE (réécriture complète et optimisée de chaque champ du formulaire de soumission du challenge). Sois concret et actionnable.`,
    },
    {
      id: "pitch_challenge",
      emoji: "🎤",
      title: "Préparer mon pitch pour ce challenge",
      description:
        "Construisez un pitch de 3 minutes adapté au format et aux attentes du jury de ce challenge spécifique.",
      hasInput: true,
      inputPlaceholder:
        "Nom de votre projet et idée principale en une phrase...",
      inputMaxLength: 200,
      buildPrompt: (input) =>
        `Aide-moi à construire un pitch de 3 minutes pour défendre mon projet "${input}" devant le jury du challenge "${challenge?.titre}". Structure le pitch en : 1- Accroche percutante (15 sec), 2- Problème (30 sec), 3- Solution (45 sec), 4- Démonstration ou preuves (30 sec), 5- Business model ou impact (30 sec), 6- Appel à l'action (10 sec). Adapte le contenu aux critères et au thème de ce challenge. Donne aussi 3 conseils pour convaincre ce jury en particulier.`,
    },
    {
      id: "ressources_challenge",
      emoji: "🛠️",
      title: "Ressources pour préparer mon dossier",
      description:
        "Obtenez des recommandations concrètes d'outils gratuits, de templates et d'astuces pour produire un dossier de qualité professionnelle.",
      buildPrompt: () =>
        `Pour le challenge "${challenge?.titre}", donne-moi une liste d'outils gratuits et de ressources concrètes pour : 1- Créer des maquettes ou prototypes (si applicable), 2- Rédiger une présentation professionnelle, 3- Produire des visuels ou une vidéo de qualité avec peu de moyens, 4- Trouver des données et statistiques africaines fiables pour étayer mon projet, 5- Collaborer en équipe à distance. Priorise les outils accessibles en Afrique et gratuits.`,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Toaster />
      {/* Bouton principal "Plus d'options" */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-400 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-black transition-all active:scale-95"
      >
        <MoreHorizontal size={18} />
        <span className="text-sm font-medium">Options</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Menu déroulant centré automatiquement */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay pour flouter/assombrir le fond si nécessaire et capturer le clic */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 z-40 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-xs bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Bouton de fermeture X en haut à droite */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors z-50 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

              {/* S'entraîner avec le coach */}
              {!isCompany && (
                <button
                  onClick={() => {
                    setShowCoachModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-4 mt-6 hover:bg-orange-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors shrink-0">
                    <Bot size={20} className="text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      S'entraîner avec le Coach IA
                    </p>
                    <p className="text-xs text-gray-500">
                      Préparez ce challenge avec l'IA
                    </p>
                  </div>
                </button>
              )}

              <div className="h-px bg-gray-100 mx-3" />

              {/* Partager */}
              <button
                onClick={() => {
                  onShare();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                  <Share2 size={20} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Partager</p>
                  <p className="text-xs text-gray-500">Partagez ce challenge</p>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-3" />

              {/* Favoris */}
              {!isCompany && (
                <button
                  onClick={handleFavorite}
                  disabled={loadingFavorite}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isFavorite ? "bg-red-50 group-hover:bg-red-100" : "bg-gray-100 group-hover:bg-gray-200"}`}
                  >
                    {loadingFavorite ? (
                      <Loader2
                        size={20}
                        className="animate-spin text-orange-700"
                      />
                    ) : isFavorite ? (
                      <HeartOff size={20} className="text-red-500" />
                    ) : (
                      <Heart size={20} className="text-gray-700" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${isFavorite ? "text-red-600" : "text-gray-800"}`}
                    >
                      {isFavorite
                        ? "Retirer des favoris"
                        : "Ajouter aux favoris"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFavorite
                        ? "Ne plus suivre ce challenge"
                        : "Sauvegarder pour plus tard"}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Coach Challenge */}
      <AnimatePresence>
        {showCoachModal && (
          <CoachModal
            isOpen={showCoachModal}
            onClose={() => setShowCoachModal(false)}
            mode="challenge"
            userName={userName}
            challengeId={Number(challengeId)}
            challengeName={challenge?.titre}
            predefinedCards={predefinedCards}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
