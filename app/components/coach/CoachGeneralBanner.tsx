"use client";

// components/coach/CoachGeneralBanner.tsx
// À intégrer dans la HomePage entre les stats et les tabs

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import CoachModal, { PredefinedCard } from "./CoachModal";

interface CoachGeneralBannerProps {
  userName?: string;
  userDomain?: string;
  userCompetences?: string;
}

export default function CoachGeneralBanner({
  userName = "Talent",
  userDomain,
  userCompetences,
}: CoachGeneralBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) setCurrentUser(JSON.parse(auth).user);
  }, []);

  const predefinedCards: PredefinedCard[] = [
    {
      id: "idees",
      emoji: "💡",
      title: "Générer des idées de projets",
      description: `Obtenir 5 idées de projets innovants adaptées à votre domaine ${userDomain ? `(${userDomain})` : ""} et au contexte africain, avec leur potentiel et les ressources nécessaires.`,
      buildPrompt: () =>
        `Génère-moi 5 idées de projets innovants adaptés à mon domaine principal (${userDomain || "non défini"}) et à mes compétences (${userCompetences || "non définies"}). Pour chaque idée, donne : le nom du projet, le problème résolu avec une statistique africaine fiable, la cible, la solution proposée, et les ressources minimales pour démarrer. Tout doit être adapté au contexte africain.`,
    },
    {
      id: "structurer",
      emoji: "🏗️",
      title: "Structurer mon idée de projet",
      description:
        "Décrivez votre idée en quelques mots et obtenez une structure complète : problème, cible, solution, proposition de valeur, bénéfices — adapté au contexte africain.",
      hasInput: true,
      inputPlaceholder:
        "Ex: Je veux créer une app qui connecte les agriculteurs aux marchés locaux...",
      inputMaxLength: 400,
      buildPrompt: (input) =>
        `Structure l'idée de projet suivante pour le contexte africain : "${input}". Présente une analyse complète incluant : 1- Le problème (avec au moins 1 statistique africaine fiable), 2- La cible précise, 3- La solution proposée, 4- Le produit ou service, 5- La proposition de valeur unique, 6- Les bénéfices pour les utilisateurs, 7- Les ressources minimales pour démarrer en Afrique, 8- Les 3 principaux risques et comment les atténuer.`,
    },
    {
      id: "challenges",
      emoji: "🏆",
      title: "Challenges adaptés à mon profil",
      description:
        "Découvrez les challenges en cours qui correspondent le mieux à votre domaine, vos compétences et vos ambitions, avec les liens directs.",
      buildPrompt: () =>
        `En fonction de mon profil (domaine: ${userDomain || "non défini"}, compétences: ${userCompetences || "non définies"}), recommande-moi les challenges de la plateforme les plus adaptés à ma situation. Pour chaque challenge recommandé, explique pourquoi il me correspond, ce que je dois préparer, et donne le lien de participation. Classe-les du plus adapté au moins adapté.`,
    },
    {
      id: "jury",
      emoji: "🎯",
      title: "Simuler un jury d'évaluation de projet",
      description:
        "Décrivez votre projet et entraînez-vous face à un jury virtuel. Répondez aux questions par leur numéro (1-, 2-...) et obtenez une note /20 avec les axes d'amélioration.",
      hasInput: true,
      inputPlaceholder:
        "Ex: Application de gestion des stocks pour les PME africaines...",
      inputMaxLength: 400,
      buildPrompt: (input) =>
        `Je veux m'entraîner à défendre mon projet devant un jury. Mon projet : "${input}". Joue le rôle d'un jury d'experts africains exigeants. Commence par poser 5 questions numérotées (1-, 2-, 3-, 4-, 5-) sur mon projet, en couvrant : la pertinence du problème, la viabilité de la solution, le modèle économique, la compétitivité et les risques. J'y répondrai ensuite.`,
    },
    {
      id: "pitch",
      emoji: "🎤",
      title: "Maîtriser les techniques de pitch",
      description:
        "Apprenez les meilleures méthodes pour convaincre un jury en 3 minutes : structure, storytelling, gestion du stress et erreurs à éviter.",
      buildPrompt: () =>
        `Explique-moi les meilleures techniques de pitch pour convaincre un jury d'experts lors d'un challenge d'innovation en Afrique. Couvre : 1- La structure idéale d'un pitch de 3 minutes, 2- Les techniques de storytelling efficaces, 3- Comment présenter les chiffres et données, 4- La gestion du stress et du langage corporel, 5- Les 5 erreurs fatales à éviter, 6- Un exemple de phrase d'accroche puissante. Donne des conseils pratiques et adaptés au contexte africain.`,
    },
    {
      id: "competences",
      emoji: "📈",
      title: "Plan de montée en compétences",
      description:
        "Obtenez un plan personnalisé pour développer les compétences les plus demandées dans votre domaine sur le marché africain.",
      buildPrompt: () =>
        `Crée-moi un plan de montée en compétences sur 3 mois adapté à mon profil (domaine: ${userDomain || "non défini"}, compétences actuelles: ${userCompetences || "non définies"}). Inclus : 1- Les 5 compétences les plus demandées dans mon domaine en Afrique, 2- Les ressources gratuites ou accessibles pour chacune (plateformes, chaînes YouTube, livres), 3- Un planning hebdomadaire réaliste, 4- Les indicateurs pour mesurer ma progression.`,
    },
    {
      id: "mvp",
      emoji: "🚀",
      title: "Valider mon idée (MVP)",
      description:
        "Décrivez votre projet et obtenez une stratégie pour tester rapidement votre idée avec zéro ou peu de ressources.",
      hasInput: true,
      inputPlaceholder:
        "Décrivez brièvement votre idée de projet ou produit...",
      inputMaxLength: 350,
      buildPrompt: (input) =>
        `Aide-moi à créer un MVP (Minimum Viable Product) pour valider rapidement mon idée : "${input}". Donne-moi : 1- La version minimale à tester (quelles fonctionnalités sont vraiment indispensables), 2- Une méthode de test avec 0 ou très peu de budget, 3- Les questions clés à valider auprès des premiers utilisateurs, 4- Les métriques à suivre, 5- Le délai réaliste pour avoir un premier retour marché. Tout doit être faisable dans le contexte africain.`,
    },
  ];

  return (
    <>
      {/* Bannière d'invitation - Style Professionnel & Branding Orange-700 */}
      <div className="mx-5 md:mx-28 my-8 bg-white border border-gray-100 border-l-4 border-l-orange-700 rounded-xl p-6 shadow-sm flex flex-col md:justify-center items-center gap-6 relative overflow-hidden">
        {/* Touche de branding discrète en arrière-plan */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-60" />

        {/* Illustration Iconographique avec contour orange-700 */}
        <div className="relative w-16 h-16 md:w-16 md:h-16 bg-orange-700 border-2 border-orange-700 rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <Bot size={32} className="text-white" />
        </div>

        {/* Texte original avec hiérarchie améliorée */}
        <div className="flex-1 text-center z-10">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center justify-center md:justify-center gap-2">
            Propulsez votre projet avec l'IA
          </h3>
          <p className="text-sm text-gray-700 mt-2 max-w-2xl leading-relaxed">
            Besoin d'un mentor pour structurer votre idée et surclasser la
            compétition ? Échangez avec notre{" "}
            <strong className="text-black">Coach Virtuel</strong> et faites la
            différence dès maintenant.
          </p>
        </div>

        {/* Bouton Orange-700 avec texte original */}
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 px-6 py-3.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl text-sm transition-all duration-300 active:scale-95 shadow-lg shadow-orange-100 flex items-center gap-3"
        >
          <Bot size={18} />
          <span>Consulter le Coach</span>
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <CoachModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            mode="general"
            userName={userName}
            predefinedCards={predefinedCards}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>
    </>
  );
}
