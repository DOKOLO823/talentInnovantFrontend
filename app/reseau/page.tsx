"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Phone,
  Send,
  UserX,
  Check,
  X,
  Clock,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import BackButton from "../components/BackButton";

import { LogIn, UserPlus } from "lucide-react"; // Assure-toi d'ajouter ces imports

const LoginRequiredModal = ({ isOpen }: { isOpen: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300 relative">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-orange-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-3">
            Connexion requise
          </h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Connectez-vous pour accéder à votre réseau : gérez vos
            collaborations, trouvez des partenaires pour votre projet et
            échangez avec d'autres talents.
          </p>
          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-4 bg-orange-700 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-200"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register-talent"
              className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-slate-100 hover:border-orange-200 text-slate-700 font-bold rounded-2xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Composants Internes ---

const EmptyState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-6">
    <div className="bg-gray-100 p-6 rounded-full mb-4">
      <UserX size={48} className="text-gray-400" />
    </div>
    <p className="text-gray-500 font-medium mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-orange-700 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
      >
        <Clock size={16} /> Actualiser la liste
      </button>
    )}
  </div>
);

function SkeletonCard() {
  return (
    // On ajoute grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-gray-50 border rounded-3xl p-5 animate-pulse"
        >
          <div className="flex gap-4 items-center mb-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

const formatDateFr = (dateString: string) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " à " +
    date
      .toLocaleTimeString("fr-FR", {
        hour: "2-digit", // Correction ici : '2-digit' au lieu de '2h-digit'
        minute: "2-digit",
      })
      .replace(":", "h")
  );
};

export default function ReseauPage() {
  const [activeTab, setActiveTab] = useState("collaboration");
  const [subTab, setSubTab] = useState("actives");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = chargement, false = non co

  useEffect(() => {
    // Vérification de la connexion
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.user) {
          setIsAuth(true);
          fetchData(); // On ne lance l'API que si connecté
        } else {
          setIsAuth(false);
          setLoading(false);
        }
      } catch (e) {
        setIsAuth(false);
        setLoading(false);
      }
    } else {
      setIsAuth(false);
      setLoading(false);
    }
  }, [activeTab, subTab]);

  useEffect(() => {
    // Si shouldScroll est faux, on ne fait absolument rien
    if (!shouldScroll) return;

    // 1. Scroll Horizontal
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    // 2. Scroll Vertical
    if (contentRef.current) {
      const yOffset = -120;
      const y =
        contentRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    // Optionnel : on remet à false après le scroll si on veut
    // que seul le changement de tab déclenche le scroll
    setShouldScroll(false);
  }, [subTab, shouldScroll]);

  const fetchData = async () => {
    if (localStorage.getItem("auth") === null) return;
    setLoading(true);
    try {
      let endpoint = "";
      if (subTab === "actives") endpoint = "/reseau/collaborations/actives";
      if (subTab === "recues") endpoint = "/reseau/collaborations/recues";
      if (subTab === "envoyees") endpoint = "/reseau/collaborations/envoyees";

      const res = await apiFetch(endpoint, { method: "GET" });
      if (res?.statut === 200) {
        setData(res.data || []);
        if (res.nb_non_lues !== undefined) setUnreadCount(res.nb_non_lues);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    // Pour les collaborations actives, le nom est directement à la racine (item.nom)
    // Pour les demandes, c'est dans item.envoyeur...
    const name =
      item.nom ||
      item.envoyeur?.talent?.nom ||
      item.recepteur?.talent?.nom ||
      "";
    const surname =
      item.prenom ||
      item.envoyeur?.talent?.prenom ||
      item.recepteur?.talent?.prenom ||
      "";

    const fullName = `${name} ${surname}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  if (isAuth === false) {
    return (
      <div className="min-h-screen bg-slate-50">
        <BackButton />
        <LoginRequiredModal isOpen={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <Toaster position="top-center" />
      <div className="ml-4">
        <BackButton />
      </div>

      <header className="px-4 flex items-center gap-4 bg-white mt-8">
        <h1 className="text-xl font-bold text-slate-800">Mon Réseau</h1>
      </header>

      {/* NOTIFICATION PROFESSIONNELLE RESPONSIVE */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-4 mt-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              {/* Contenu : Badge + Texte */}
              <div className="flex items-start gap-4 flex-1 w-full text-left">
                {/* Badge circulaire professionnel */}
                <div className="flex items-center justify-center shrink-0 w-10 h-10 border-2 border-orange-700 bg-white rounded-full">
                  <span className="text-base font-black text-orange-700">
                    {unreadCount}
                  </span>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-[15px] text-slate-800 font-bold leading-tight">
                    Nouvelle{unreadCount > 1 ? "s" : ""} demande
                    {unreadCount > 1 ? "s" : ""} de collaboration
                  </p>
                  <p className="text-[13px] text-slate-500 mt-1">
                    Vous avez {unreadCount} demande{unreadCount > 1 ? "s" : ""}{" "}
                    de collaboration à consulter.
                  </p>
                </div>
              </div>

              {/* Action : S'adapte au nombre et à l'écran */}
              <button
                onClick={() => {
                  setSubTab("recues");
                  setShouldScroll(true); // Autorise le scroll
                }}
                className="w-full sm:w-auto px-8 py-3 bg-orange-700 text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-orange-700/10 whitespace-nowrap"
              >
                {unreadCount > 1 ? "Voir les demandes" : "Voir la demande"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex p-2 bg-gray-100 mx-4 mt-4 rounded-2xl">
        {["collaboration", "mentorat"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              activeTab === t
                ? "bg-white text-orange-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {t === "collaboration" ? "Collaboration" : "Mentorat"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "collaboration" ? (
          <motion.div
            key="collab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4"
          >
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              Bâtissez votre équipe : connectez-vous aux talents dont les
              compétences complètent votre projet.
            </p>

            <Link
              href="/collaborateurs"
              className="w-full md:w-1/2 lg:w-1/3 py-4 text-sm md:text-md bg-white text-orange-700 rounded-2xl font-bold flex items-center justify-center gap-2 mb-6 border border-orange-700"
            >
              <Search size={20} /> Trouver de nouveaux collaborateurs
            </Link>

            <div className="flex gap-3 overflow-x-auto no-scrollbar scrollbar-hide pb-4 mb-4">
              {[
                { id: "actives", label: "Collaborations actives" },
                { id: "recues", label: "Demandes reçues" },
                { id: "envoyees", label: "Demandes envoyées" },
              ].map((b) => (
                <button
                  key={b.id}
                  ref={subTab === b.id ? activeBtnRef : null}
                  onClick={() => {
                    setSubTab(b.id);
                    setShouldScroll(true); // Autorise le scroll
                  }}
                  className={`relative px-6 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition-all ${
                    subTab === b.id
                      ? "bg-orange-700 border-orange-700 text-white"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  {b.label}

                  {/* Le badge avec notification si count > 0 */}
                  {b.id === "recues" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-600 text-white text-[10px] items-center justify-center border-2 border-white">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div ref={contentRef} className="scroll-mt-28">
              {subTab === "actives" && (
                <>
                  <div className="mt-6 mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Recherche par nom..."
                        className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search
                        className="absolute left-4 top-4 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>
                  {loading ? (
                    <SkeletonCard />
                  ) : filteredData.length === 0 && !loading ? (
                    <EmptyState
                      message="Vous n'avez aucune collaboration active. C'est peut-être un probleme de connexion internet."
                      onRetry={fetchData} // <--- Appel de la fonction ici
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredData.map((item) => (
                        <ActiveCollabCard key={item.id} talent={item} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {subTab === "recues" && (
                <div className="space-y-4">
                  {loading ? (
                    <SkeletonCard />
                  ) : filteredData.length === 0 && !loading ? (
                    <EmptyState
                      message="Vous n'avez reçu aucune demande de collaboration. C'est peut-être un probleme de connexion internet."
                      onRetry={fetchData} // <--- Appel de la fonction ici
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredData.map((req) => (
                        <ReceivedRequestCard
                          key={req.id}
                          request={req}
                          onRefresh={fetchData}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {subTab === "envoyees" && (
                <div className="space-y-4">
                  {loading ? (
                    <SkeletonCard />
                  ) : filteredData.length === 0 && !loading ? (
                    <EmptyState
                      message="Vous n'avez envoyé aucune demande de collaboration. C'est peut-être un probleme de connexion internet."
                      onRetry={fetchData} // <--- Appel de la fonction ici
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredData.map((req) => (
                        <SentRequestCard key={req.id} request={req} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div>
            <p className="p-4 text-gray-600 text-sm mb-6 leading-relaxed">
              Ne restez pas seul face à vos défis : bénéficiez de
              l'accompagnement d'experts et de conseils stratégiques pour
              transformer vos idées en succès.
            </p>
            <motion.div key="mentor" className="p-12 text-center text-gray-500">
              Aucun mentor pour le moment. Restez à l'écoute !
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPOSANTS DE CARTES ---

function ReceivedRequestCard({
  request,
  onRefresh,
}: {
  request: any;
  onRefresh: () => void;
}) {
  const [loadingAction, setLoadingAction] = useState<
    "accepter" | "refuser" | null
  >(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const sender = request.envoyeur;

  const handleAction = async (action: "accepter" | "refuser") => {
    setLoadingAction(action);
    try {
      let res;
      if (action === "accepter") {
        res = await apiFetch(`/reseau/collaborations/accepter`, {
          method: "POST",
          body: JSON.stringify({ demande_id: request.id }),
        });
      } else {
        res = await apiFetch(`/reseau/collaborations/refuser/${request.id}`, {
          method: "GET",
        });
      }

      if (res?.statut === 200) {
        toast.success(res.message || "Action effectuée avec succès");
        onRefresh();
      } else {
        toast.error(res?.message || "Une erreur est survenue");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white border rounded-3xl p-5 shadow-sm">
      <div className="flex gap-4 mb-4">
        <Link
          href={`/profil-talent/${sender?.id}`}
          className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border"
        >
          <img
            src={
              sender?.pp ? `${apifile}/${sender.pp}` : "/assets/images/pp2.png"
            }
            className="w-full h-full object-cover"
            alt="pp"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate">
            {sender?.talent?.nom} {sender?.talent?.prenom}
          </h4>
          <p className="text-[10px] font-bold text-orange-600 uppercase">
            {sender?.talent?.profession || "Talent"}
          </p>
          {/* 1. AJOUT DE LA DATE ICI */}
          <p className="text-[10px] text-slate-500 mt-1">
            Envoyé le {formatDateFr(request.created_at)}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-dashed">
        <p
          className={`text-gray-600 italic leading-relaxed ${!isExpanded ? "line-clamp-4" : ""}`}
        >
          "{request.message || "Bonjour, j'aimerais collaborer avec vous."}"
        </p>
        {request.message && request.message.length > 80 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-700 text-[10px] font-bold mt-2 underline"
          >
            {isExpanded ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>

      {/* 2. LOGIQUE DES BOUTONS OU DU MESSAGE DE COLLAB ACTIVE */}
      {request.est_accepte ? (
        <div className="w-full py-3 rounded-xl bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center gap-2 border border-green-100">
          <Check size={14} /> Vous êtes déjà collaborateurs
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            disabled={loadingAction !== null}
            onClick={() => handleAction("refuser")}
            className="flex-1 py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm flex items-center justify-center"
          >
            {loadingAction === "refuser" ? (
              <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Refuser"
            )}
          </button>
          <button
            disabled={loadingAction !== null}
            onClick={() => handleAction("accepter")}
            className="flex-[2] py-3 rounded-xl bg-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2"
          >
            {loadingAction === "accepter" ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Check size={18} /> Accepter
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function SentRequestCard({ request }: { request: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const talent = request.recepteur;

  if (!talent) return null;

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm flex flex-col h-full">
      <div className="flex gap-4 items-start mb-4">
        <Link href={`/profil-talent/${talent.id}`} className="shrink-0">
          <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-lg">
            <img
              src={
                talent.pp ? `${apifile}/${talent.pp}` : "/assets/images/pp2.png"
              }
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-900 truncate">
            {talent.talent?.nom} {talent.talent?.prenom}
          </h3>
          <p className="text-orange-700 text-[10px] font-black uppercase">
            {talent.talent?.profession || "Talent"}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Envoyé le {formatDateFr(request.created_at)}
          </p>
        </div>
      </div>

      <div className="flex-1">
        {/* Affichage du message avec "Voir plus" */}
        <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 mb-3">
          <p
            className={`text-slate-600 text-[15px] italic leading-relaxed ${!isExpanded ? "line-clamp-4" : ""}`}
          >
            "{request.message}"
          </p>
          {request.message && request.message.length > 60 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-700 text-[10px] font-bold mt-1 underline"
            >
              {isExpanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>
      </div>

      {/* Statut Dynamique */}
      {request.est_accepte ? (
        <div className="w-full mt-4 py-3 rounded-2xl font-bold bg-green-50 text-green-700 flex items-center justify-center gap-2 border border-green-100 text-sm">
          <Check size={16} /> Collaboration acceptée
        </div>
      ) : (
        <div className="w-full mt-4 py-3 rounded-2xl font-bold bg-orange-50 text-orange-700 flex items-center justify-center gap-2 border border-orange-100 text-sm">
          <Clock size={16} /> En attente
        </div>
      )}
    </div>
  );
}

function ActiveCollabCard({ talent }: { talent: any }) {
  const person = talent;

  // --- FONCTION DE CORRECTION DU NUMÉRO ---
  const formatWhatsAppNumber = (num: any) => {
    // 1. Si la valeur est vide, nulle ou indéfinie, on retourne une chaîne vide
    if (num === null || num === undefined) return "";

    // 2. On force la conversion en String au cas où c'est un Number
    let cleaned = String(num).replace(/\D/g, "");

    // 3. Si après nettoyage il n'y a plus rien, on arrête
    if (!cleaned) return "";

    // 4. Gestion de l'indicatif Cameroun (237)
    if (!cleaned.startsWith("237")) {
      // Si l'utilisateur a saisi un 0 au début par réflexe (ex: 0690...), on l'enlève
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      cleaned = "237" + cleaned;
    }

    return cleaned;
  };

  const formattedPhone = formatWhatsAppNumber(person.telephone);

  // 1. Préparer la phrase personnalisée
  const message = `Bonjour ${person.prenom}, nous sommes collaborateurs sur TALENT INNOVANT. Je viens vers toi pour discuter d'un projet. Es-tu disponible pour échanger ?`;

  // 2. Encoder la phrase pour l'URL
  const encodedMessage = encodeURIComponent(message);

  // 3. Construire l'URL WhatsApp avec le numéro formaté
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm h-full">
      {/* ... reste du code (header de la carte) identique ... */}
      <div className="flex gap-4 items-center mb-6">
        <Link
          href={`/profil-talent/${person.partner_id || person.id}`}
          className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-50 shrink-0 shadow-sm"
        >
          <img
            src={
              person.pp ? `${apifile}/${person.pp}` : "/assets/images/pp2.png"
            }
            className="object-cover w-full h-full"
            alt="Profil"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate text-base">
            {person.nom} {person.prenom}
          </h4>
          <p className="text-orange-600 text-[11px] font-bold uppercase tracking-wide">
            {person.profession || "Innovateur"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* WhatsApp avec numéro corrigé */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl transition-all active:scale-95 hover:bg-green-50"
        >
          <img
            src="/assets/images/zap.png"
            alt="WhatsApp"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
            Discuter sur WhatsApp
          </span>
        </a>

        {/* Bouton Appeler - On peut garder le format original car le téléphone gère mieux le local */}
        <a
          href={`tel:${person.telephone}`}
          className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl transition-all active:scale-95 hover:bg-blue-50"
        >
          <img
            src="/assets/images/call.png"
            alt="Appeler"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
            Appeler
          </span>
        </a>

        {/* Bouton SMS */}
        <a
          href={`sms:${person.telephone}?body=${encodedMessage}`}
          className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-2xl transition-all active:scale-95 hover:bg-orange-50"
        >
          <img
            src="/assets/images/sms.png"
            alt="SMS"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[9px] font-bold text-slate-700 text-center leading-tight">
            Envoyer un SMS
          </span>
        </a>
      </div>
    </div>
  );
}
