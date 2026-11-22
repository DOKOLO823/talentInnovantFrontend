"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserX,
  Check,
  Clock,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import BackButton from "../components/BackButton";
import { SkeletonSweepStyles } from "../components/TalentSkeleton";
import { prefetchPropositions } from "../lib/propositionsCache";

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
  <div className="flex flex-col items-center justify-center py-16 text-center px-6 bg-white border-2 border-dashed border-slate-200 rounded-3xl">
    <div className="bg-slate-100 p-5 rounded-full mb-4">
      <UserX size={40} className="text-slate-400" />
    </div>
    <p className="text-slate-500 font-medium mb-4 max-w-md">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-orange-700 text-white rounded-full text-sm font-bold hover:bg-orange-800 transition-colors flex items-center gap-2"
      >
        <Clock size={16} /> Actualiser la liste
      </button>
    )}
  </div>
);

function SkeletonCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <SkeletonSweepStyles />
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="ti-skel-card bg-white border border-slate-200 rounded-2xl p-5"
          style={{ ["--d" as any]: `${(i % 3) * 0.15}s` }}
        >
          <div className="flex gap-4 items-center mb-4">
            <div className="w-14 h-14 bg-slate-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-14 bg-slate-200 rounded-xl" />
            <div className="h-14 bg-slate-200 rounded-xl" />
            <div className="h-14 bg-slate-200 rounded-xl" />
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
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(":", "h")
  );
};

export default function ReseauPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("collaboration");
  const [subTab, setSubTab] = useState("actives");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [isOpeningCollab, startOpeningCollab] = useTransition();

  const contentRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = chargement, false = non co

  // Précharge la page « Trouver un collaborateur » dès l'arrivée ici
  useEffect(() => {
    router.prefetch("/collaborateurs");
  }, [router]);

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
    <div className="min-h-screen bg-slate-50 pb-20">
      <Toaster position="top-center" />
      <div className="max-w-6xl mx-auto">
        <div className="ml-4 pt-2">
          <BackButton />
        </div>

        <header className="px-4 mt-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mon réseau
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vos collaborations et vos demandes, au même endroit.
          </p>
        </header>

        {/* NOTIFICATION RESPONSIVE */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mx-4 mt-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-5 bg-orange-50 border border-orange-100 rounded-2xl">
                <div className="flex items-start gap-4 flex-1 w-full text-left">
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
                    <p className="text-[13px] text-slate-600 mt-1">
                      Vous avez {unreadCount} demande
                      {unreadCount > 1 ? "s" : ""} de collaboration à consulter.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSubTab("recues");
                    setShouldScroll(true);
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-orange-700 hover:bg-orange-800 text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all shadow-sm whitespace-nowrap"
                >
                  {unreadCount > 1 ? "Voir les demandes" : "Voir la demande"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex p-1.5 bg-slate-200/70 mx-4 mt-5 rounded-2xl">
          {["collaboration", "mentorat"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === t
                  ? "bg-white text-orange-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
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
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                Bâtissez votre équipe : connectez-vous aux talents dont les
                compétences complètent votre projet.
              </p>

              {/* Ouverture immédiate : page préchargée + données lancées au survol/toucher */}
              <button
                type="button"
                onPointerEnter={prefetchPropositions}
                onTouchStart={prefetchPropositions}
                onFocus={prefetchPropositions}
                onClick={() => {
                  prefetchPropositions();
                  startOpeningCollab(() => router.push("/collaborateurs"));
                }}
                disabled={isOpeningCollab}
                className="w-full md:w-auto md:min-w-[340px] py-3.5 px-6 text-sm bg-orange-700 hover:bg-orange-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 mb-6 shadow-sm active:scale-[0.98] transition disabled:opacity-80"
              >
                {isOpeningCollab ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Search size={20} />
                )}
                {isOpeningCollab
                  ? "Ouverture..."
                  : "Trouver de nouveaux collaborateurs"}
              </button>

              <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide pb-4 mb-2">
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
                      setShouldScroll(true);
                    }}
                    className={`relative px-5 py-2 rounded-full whitespace-nowrap text-sm font-semibold border transition-all ${
                      subTab === b.id
                        ? "bg-orange-700 border-orange-700 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-700"
                    }`}
                  >
                    {b.label}

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
                    <div className="mt-4 mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Recherche par nom..."
                          className="w-full py-3.5 pl-12 pr-4 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-orange-500 transition"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                      </div>
                    </div>
                    {loading ? (
                      <SkeletonCard />
                    ) : filteredData.length === 0 && !loading ? (
                      <EmptyState
                        message="Vous n'avez aucune collaboration active. C'est peut-être un probleme de connexion internet."
                        onRetry={fetchData}
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
                        onRetry={fetchData}
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
                        onRetry={fetchData}
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
              <p className="p-4 text-slate-600 text-sm mb-2 leading-relaxed">
                Ne restez pas seul face à vos défis : bénéficiez de
                l'accompagnement d'experts et de conseils stratégiques pour
                transformer vos idées en succès.
              </p>
              <motion.div
                key="mentor"
                className="mx-4 p-12 text-center text-slate-500 bg-white border-2 border-dashed border-slate-200 rounded-3xl"
              >
                Aucun mentor pour le moment. Restez à l'écoute !
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex gap-4 mb-4">
        <Link
          href={`/profil-talent/${sender?.id}`}
          className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-orange-100"
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
          <p className="text-[11px] font-semibold text-orange-700 uppercase tracking-wide truncate">
            {sender?.talent?.profession || "Talent"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Envoyé le {formatDateFr(request.created_at)}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100 flex-1">
        <p
          className={`text-slate-600 italic text-sm leading-relaxed ${!isExpanded ? "line-clamp-4" : ""}`}
        >
          "{request.message || "Bonjour, j'aimerais collaborer avec vous."}"
        </p>
        {request.message && request.message.length > 80 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-700 text-[11px] font-bold mt-2 underline"
          >
            {isExpanded ? "Voir moins" : "Voir plus"}
          </button>
        )}
      </div>

      {request.est_accepte ? (
        <div className="w-full py-3 rounded-xl bg-green-50 text-green-700 font-bold text-xs flex items-center justify-center gap-2 border border-green-100">
          <Check size={14} /> Vous êtes déjà collaborateurs
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            disabled={loadingAction !== null}
            onClick={() => handleAction("refuser")}
            className="flex-1 py-3 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-bold text-sm flex items-center justify-center transition"
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
            className="flex-[2] py-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
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
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col h-full">
      <div className="flex gap-4 items-start mb-4">
        <Link href={`/profil-talent/${talent.id}`} className="shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-100">
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
          <p className="text-orange-700 text-[11px] font-semibold uppercase tracking-wide truncate">
            {talent.talent?.profession || "Talent"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            Envoyé le {formatDateFr(request.created_at)}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
          <p
            className={`text-slate-600 text-sm italic leading-relaxed ${!isExpanded ? "line-clamp-4" : ""}`}
          >
            "{request.message}"
          </p>
          {request.message && request.message.length > 60 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-700 text-[11px] font-bold mt-1 underline"
            >
              {isExpanded ? "Voir moins" : "Voir plus"}
            </button>
          )}
        </div>
      </div>

      {request.est_accepte ? (
        <div className="w-full mt-2 py-3 rounded-xl font-bold bg-green-50 text-green-700 flex items-center justify-center gap-2 border border-green-100 text-sm">
          <Check size={16} /> Collaboration acceptée
        </div>
      ) : (
        <div className="w-full mt-2 py-3 rounded-xl font-bold bg-orange-50 text-orange-700 flex items-center justify-center gap-2 border border-orange-100 text-sm">
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
    if (num === null || num === undefined) return "";
    let cleaned = String(num).replace(/\D/g, "");
    if (!cleaned) return "";

    // Gestion de l'indicatif Cameroun (237)
    if (!cleaned.startsWith("237")) {
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      cleaned = "237" + cleaned;
    }

    return cleaned;
  };

  const formattedPhone = formatWhatsAppNumber(person.telephone);

  const message = `Bonjour ${person.prenom}, nous sommes collaborateurs sur TALENT INNOVANT. Je viens vers toi pour discuter d'un projet. Es-tu disponible pour échanger ?`;
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

  const tile =
    "flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-95";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition h-full">
      <div className="flex gap-4 items-center mb-5">
        <Link
          href={`/profil-talent/${person.partner_id || person.id}`}
          className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-100 shrink-0"
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
          <p className="text-orange-700 text-[11px] font-semibold uppercase tracking-wide line-clamp-2">
            {person.profession || "Innovateur"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${tile} hover:bg-green-50 hover:border-green-100`}
        >
          <img
            src="/assets/images/zap.png"
            alt="WhatsApp"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
            Discuter sur WhatsApp
          </span>
        </a>

        <a
          href={`tel:${person.telephone}`}
          className={`${tile} hover:bg-blue-50 hover:border-blue-100`}
        >
          <img
            src="/assets/images/call.png"
            alt="Appeler"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
            Appeler
          </span>
        </a>

        <a
          href={`sms:${person.telephone}?body=${encodedMessage}`}
          className={`${tile} hover:bg-orange-50 hover:border-orange-100`}
        >
          <img
            src="/assets/images/sms.png"
            alt="SMS"
            className="w-8 h-8 object-contain"
          />
          <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
            Envoyer un SMS
          </span>
        </a>
      </div>
    </div>
  );
}
