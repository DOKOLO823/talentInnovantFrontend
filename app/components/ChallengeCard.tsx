"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Trophy,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Eye,
  X,
  Globe,
  LogIn,
  UserPlus,
  ExternalLink,
  Settings,
} from "lucide-react";
import ProjectSubmissionModal from "./modals/ProjectSubmissionModal";

interface Challenge {
  id: number;
  user_id: number; // Ajouté pour la vérification du créateur
  title: string;
  image: string;
  locationType: string;
  site: string;
  startDate: string;
  endDate: string;
  endInscription: string;
  participants: number;
  rewards: string[];
  categories: string[];
  inscriptionEnd: string;
  entrepriseNom: string;
  entrepriseLogo: string;
  entrepriseId: number;
}

// 1. Modal Interstitielle (Redirection Externe)
const ExternalRedirectModal = ({ isOpen, onClose, onConfirm, url }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-4 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="w-10 h-10 text-orange-700" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            Challenge Externe
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Ce challenge se déroule en dehors de{" "}
            <strong>TALENT INNOVANT</strong>. Vous allez être redirigé vers la
            plateforme du challenge pour soumettre votre candidature.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="flex items-center justify-center gap-2 w-full py-4 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200"
            >
              Continuer vers le challenge
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="py-3 text-gray-600 font-bold hover:text-gray-600 transition"
            >
              Rester ici
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginRequiredModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Vous devez être connecté pour participer à ce challenge et soumettre
            votre projet.
          </p>

          <div className="space-y-3">
            <a
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200"
            >
              Se connecter
            </a>
            <a
              href="/auth/register-talent"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-100 hover:border-orange-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              <UserPlus className="w-4 h-4" />
              S'inscrire gratuitement
            </a>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openRewards, setOpenRewards] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);

  // Récupération de l'utilisateur au montage
  useEffect(() => {
    const authItem = localStorage.getItem("auth");
    if (authItem) {
      const authData = JSON.parse(authItem);
      setCurrentUser(authData.user);
    }
  }, []);

  const isOwner = currentUser?.id == challenge?.user_id;

  const delayInfo = useMemo(() => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    const endInscription = new Date(challenge.endInscription);
    const diffStart = start.getTime() - now.getTime();
    const diffEnd = end.getTime() - now.getTime();
    const diffEndInscription = endInscription.getTime() - now.getTime();

    const daysStart = Math.ceil(diffStart / (1000 * 60 * 60 * 24));
    const daysEnd = Math.ceil(diffEnd / (1000 * 60 * 60 * 24));
    const daysEndInscription = Math.ceil(
      diffEndInscription / (1000 * 60 * 60 * 24),
    );

    if (diffStart > 0) {
      return {
        text: `Début dans ${daysStart} jour${daysStart > 1 ? "s" : ""}`,
        color: "text-orange-700",
      };
    } else if (diffEndInscription > 0) {
      return {
        text: `Plus que ${daysEndInscription} jour${daysEndInscription > 1 ? "s" : ""} avant la fin des inscriptions`,
        color: "text-orange-700",
      };
    } else if (diffEnd > 0) {
      return {
        text: `Plus que ${daysEnd} jour${daysEnd > 1 ? "s" : ""} avant la fin du challenge`,
        color: "text-orange-700",
      };
    } else {
      const pastDays = Math.abs(daysEnd);
      return {
        text: `Terminé il y a ${pastDays} jour${pastDays > 1 ? "s" : ""}`,
        color: "text-gray-500",
      };
    }
  }, [challenge.startDate, challenge.endInscription, challenge.endDate]);

  const handleParticipate = () => {
    const auth = localStorage.getItem("auth");
    if (!auth) {
      setShowLoginModal(true);
      return;
    }

    if (challenge.site?.toLowerCase() == "talent innovant") {
      setShowSubmissionModal(true);
    } else {
      setShowExternalModal(true);
    }
  };

  const confirmExternalRedirect = () => {
    let url = challenge.site;
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    setShowExternalModal(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Non défini";
    const date = new Date(dateString.split(" ")[0]);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs flex flex-col">
        <div className="bg-black text-white py-1 px-3 flex items-center justify-center gap-2 text-[10px] font-bold capitalise tracking-wider">
          <div className="flex flex-row justify-center items-center gap-1">
            <MapPin className="w-2.5 h-2.5" />
            <span> {challenge?.locationType}</span>
          </div>
          <span className="opacity-40">•</span>
          <div className="flex items-center gap-1">
            <Globe className="w-2.5 h-2.5" />
            {challenge?.site?.toLocaleLowerCase() == "talent innovant" ? (
              <span>Sur Talent Innovant</span>
            ) : (
              <span>Hors Talent Innovant</span>
            )}
          </div>
        </div>

        <div className="relative h-32 w-full group overflow-hidden">
          <img
            src={challenge.image}
            alt={challenge.title}
            className="w-full h-full object-cover"
          />

          <div
            className={`absolute inset-0 z-10 transition-all duration-500 ease-in-out ${openRewards ? "bg-black/90 backdrop-blur-md" : "bg-transparent"}`}
          >
            {challenge?.rewards[0] != "Prix non défini" ? (
              <div
                onClick={() => setOpenRewards(!openRewards)}
                className="p-1.5 cursor-pointer relative z-20"
              >
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-2xl border border-white/10 px-3 py-2 rounded-lg transition-all hover:bg-black/60">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span className="text-white font-bold text-xs truncate uppercase tracking-tight">
                      {challenge?.rewards[0]}
                    </span>
                  </div>

                  {openRewards ? (
                    <ChevronUp className="w-4 h-4 text-white shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white shrink-0" />
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
            <div
              className={`px-2 pb-3 overflow-y-auto transition-all duration-500 ${openRewards ? "opacity-100 h-[calc(100%-55px)]" : "opacity-0 h-0 invisible"}`}
            >
              <ul className="">
                {challenge?.rewards?.map((reward, index) => (
                  <li
                    key={index}
                    className="text-white text-[11px] flex items-start gap-2 bg-white/5 px-2 py-1 border  mb-2 border-gray-100 border-b-1 rounded"
                  >
                    <span className="text-yellow-400 font-bold">
                      {index + 1}-
                    </span>
                    <span className="leading-tight">{reward}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {!openRewards && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="absolute bottom-2 right-2 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded text-white transition-all shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          <div
            className={`absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-center space-y-2 text-white text-xs transition-all duration-300 ${showDetails ? "opacity-100" : "opacity-0 invisible"}`}
          >
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-white">
                Début du challenge : {formatDate(challenge.startDate)}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-white">
                Fin du challenge : {formatDate(challenge.endDate)}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-white">
                Fin des inscriptions : {formatDate(challenge.endInscription)}
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 overflow-hidden">
            {challenge.title}
          </h3>

          <button
            onClick={() =>
              router.push(`/profil-entreprise/${challenge?.entrepriseId}`)
            }
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-orange-600 transition text-left"
          >
            <span> Publié par :</span>
            <img
              src={
                challenge.entrepriseLogo
                  ? challenge.entrepriseLogo
                  : "../assets/images/ppe.png"
              }
              alt="Entreprise"
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="font-medium truncate">
              {challenge?.entrepriseNom?.length > 23
                ? `${challenge?.entrepriseNom?.substring(0, 23)}...`
                : challenge?.entrepriseNom}
            </span>
          </button>

          <div className="flex flex-row justify-start items-center overflow-x-auto gap-2 w-full scrollbar-hide">
            {challenge.categories.map((cat) => (
              <div
                key={cat}
                className="text-xs font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 whitespace-nowrap flex-shrink-0"
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 text-sm border-b pb-2">
            {challenge?.participants > 0 && (
              <>
                <Users className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-orange-700">
                  {challenge?.participants}
                </span>
                <span className="text-gray-600">participant(s)</span>
              </>
            )}
          </div>

          <div className={`text-[13px] font-bold py-1 ${delayInfo.color}`}>
            {delayInfo.text}
          </div>

          <div className="flex gap-2 mt-auto">
            {isOwner ? (
              <button
                onClick={() => router.push(`/challenge/${challenge.id}`)}
                className="w-full text-xs py-3 flex items-center justify-center gap-2 font-bold rounded-lg text-white bg-orange-700 hover:bg-orange-600 transition shadow-lg shadow-slate-100"
              >
                <Settings className="w-4 h-4" />
                Gérer le challenge
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push(`/challenge/${challenge.id}`)}
                  className="flex-1 text-[11px] py-2 text-center font-medium rounded-lg text-white bg-orange-700 hover:bg-orange-600 transition"
                >
                  Voir le challenge
                </button>
                <button
                  onClick={handleParticipate}
                  className="flex-1 text-[11px] py-2 text-center text-orange-700 font-medium rounded-lg hover:bg-orange-700 hover:text-white border border-orange-700 transition flex items-center justify-center gap-1"
                >
                  Participer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <ExternalRedirectModal
        isOpen={showExternalModal}
        onClose={() => setShowExternalModal(false)}
        onConfirm={confirmExternalRedirect}
        url={challenge.site}
      />
      <ProjectSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        challenge={challenge}
      />
    </>
  );
}
