"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  MessageSquare,
  Send,
  MapPin,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import domaines from "@/domaines.json";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import BackButton from "../components/BackButton";
import BackToTop from "../components/BackToTop";

const CAMEROON_GEO: any = {
  Adamaoua: ["Ngaoundéré", "Tignère", "Meiganga", "Banyo", "Tibati"],
  Centre: ["Yaoundé", "Obala", "Mfou", "Mbalmayo", "Akonolinga", "Eseka"],
  Est: ["Bertoua", "Batouri", "Garoua-Boulaï", "Abong-Mbang"],
  "Extrême-Nord": ["Maroua", "Kousseri", "Mokolo", "Mora", "Yagoua"],
  Littoral: ["Douala", "Nkongsamba", "Edea", "Manjo", "Loum"],
  Nord: ["Garoua", "Guider", "Poli", "Figuil"],
  "Nord-Ouest": ["Bamenda", "Kumbo", "Ndop", "Wum"],
  Ouest: ["Bafoussam", "Dschang", "Foumban", "Bangangté", "Mbouda", "Baham"],
  Sud: ["Ebolowa", "Kribi", "Ambam", "Sangmelima"],
  "Sud-Ouest": ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko"],
};

const SkeletonCard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white border p-4 rounded-2xl animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-3xl" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="mt-4 h-20 bg-gray-100 rounded-xl w-full" />
      </div>
    ))}
  </div>
);

export default function SearchCollaborators() {
  const [filters, setFilters] = useState({
    domaine: "",
    region: "",
    ville: "",
    searchBy: "nom",
    query: "",
  });

  const [allTalents, setAllTalents] = useState<any[]>([]);
  const [userRelations, setUserRelations] = useState({
    envoyees: [] as number[],
    recues: [] as number[],
    actives: [] as number[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/reseau/propositions", { method: "GET" });
      if (res?.statut === 200) {
        setUserRelations({
          envoyees: res.data.ids_demandes_envoyees || [],
          recues: res.data.ids_demandes_recues || [],
          actives: res.data.ids_collaborations_actives || [],
        });
        setAllTalents(res.data.talents || []);
      }
    } catch (error) {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  // FILTRAGE AMÉLIORÉ ICI
  const filteredTalents = useMemo(() => {
    return allTalents.filter((t: any) => {
      const matchDomaine = !filters.domaine || t.domaine_id == filters.domaine;
      const matchRegion =
        !filters.region || t.talent?.region === filters.region;
      const matchVille = !filters.ville || t.talent?.ville === filters.ville;

      const q = filters.query.toLowerCase().trim();
      let matchQuery = true;

      if (q) {
        if (filters.searchBy === "nom") {
          // On combine Nom et Prénom dans une seule chaîne pour chercher dedans
          const fullName =
            `${t.talent?.nom || ""} ${t.talent?.prenom || ""}`.toLowerCase();
          // Logique par mots-clés : on sépare la recherche par espaces
          // et on vérifie si chaque mot tapé existe dans le nom complet
          const searchTerms = q.split(/\s+/);
          matchQuery = searchTerms.every((term) => fullName.includes(term));
        } else if (filters.searchBy === "profession") {
          matchQuery = t.talent?.profession?.toLowerCase().includes(q);
        } else if (filters.searchBy === "competence") {
          matchQuery = t.talent?.competence?.toLowerCase().includes(q);
        }
      }

      return matchDomaine && matchRegion && matchVille && matchQuery;
    });
  }, [allTalents, filters]);

  const activeFiltersLabel = useMemo(() => {
    const parts = [];
    if (filters.domaine) {
      const d = domaines.find((dom: any) => dom.id == filters.domaine);
      if (d) parts.push(d.nom);
    }
    if (filters.region) parts.push(filters.region);
    if (filters.ville) parts.push(filters.ville);
    return parts;
  }, [filters]);

  // Ajoutez cette fonction à l'intérieur de SearchCollaborators
  const addSentRequest = (talentId: number) => {
    setUserRelations((prev) => ({
      ...prev,
      envoyees: [...prev.envoyees, talentId],
    }));
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Toaster position="top-center" />
      <div className="ml-3">
        <BackButton />
      </div>

      <header className="px-4 flex items-center gap-4 bg-white mt-8 mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          Trouver un collaborateur
        </h1>
      </header>

      <div className="px-4 space-y-4">
        {/* Sélecteurs */}
        <span className="text-[12px] pl-3 text-slate-500">Filtre :</span>
        <div className="flex gap-3 overflow-x-auto no-scrollbar scrollbar-hide pb-2">
          <div className="w-2/3 md:w-auto flex-shrink-0">
            <select
              className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              value={filters.domaine}
              onChange={(e) =>
                setFilters({ ...filters, domaine: e.target.value })
              }
            >
              <option value="">Tous les domaines</option>
              {domaines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px] flex-shrink-0">
            <select
              className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              value={filters.region}
              onChange={(e) =>
                setFilters({ ...filters, region: e.target.value, ville: "" })
              }
            >
              <option value="">Toutes les régions</option>
              {Object.keys(CAMEROON_GEO).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px] flex-shrink-0">
            <select
              className="w-full p-3 bg-slate-50 rounded-2xl border border-slate-300 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-50"
              value={filters.ville}
              disabled={!filters.region}
              onChange={(e) =>
                setFilters({ ...filters, ville: e.target.value })
              }
            >
              <option value="">Toutes les villes</option>
              {filters.region &&
                CAMEROON_GEO[filters.region].map((v: string) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
            </select>
          </div>
        </div>
        {/* Barre de recherche */}
        <div className="bg-white w-full md:w-1/2 border border-slate-100 p-5 rounded-[2.5rem] shadow-sm ">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder={`Rechercher par ${filters.searchBy}...`}
                className="w-full p-4 pl-12 bg-slate-50 border border-transparent rounded-2xl outline-none text-slate-900 focus:bg-white focus:border-orange-500 transition-all"
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
            </div>
            <div className="flex gap-2">
              {["nom", "profession", "competence"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters({ ...filters, searchBy: type })}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    filters.searchBy === type
                      ? "bg-orange-700 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Fil d'Ariane */}
        {activeFiltersLabel.length > 0 && (
          <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left-2">
            <Filter size={14} className="text-orange-600" />
            <div className="flex items-center text-[9px] md:text-xs flex-wrap font-bold text-slate-500 uppercase tracking-widest">
              {activeFiltersLabel.map((label, idx) => (
                <span key={idx} className="flex items-center">
                  {idx > 0 && (
                    <ChevronRight size={12} className="mx-1 text-slate-300" />
                  )}
                  <span
                    className={
                      idx === activeFiltersLabel.length - 1
                        ? "text-orange-700"
                        : ""
                    }
                  >
                    {label}
                  </span>
                </span>
              ))}
              <button
                onClick={() =>
                  setFilters({
                    domaine: "",
                    region: "",
                    ville: "",
                    searchBy: "nom",
                    query: "",
                  })
                }
                className="ml-4 text-[8px] text-slate-400 border border-slate-400 p-1 rounded-lg hover:text-red-500 transition-colors"
              >
                Effacer
              </button>
            </div>
          </div>
        )}
        <div className="pt-4 mt-5">
          {loading ? (
            <SkeletonCard />
          ) : filteredTalents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTalents.map((talent) => (
                <TalentPropositionCard
                  key={talent.id}
                  talent={talent}
                  relations={userRelations}
                  onSuccess={addSentRequest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
              <div className="text-slate-300 mb-2">
                <Search size={48} />
              </div>
              <p className="text-slate-400 font-medium mb-6">
                Aucun talent trouvé pour ces critères.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-orange-700 text-white rounded-2xl font-bold hover:bg-orange-800 transition-all active:scale-95 shadow-lg shadow-orange-700/20"
              >
                <RotateCcw size={18} />
                Actualiser la page
              </button>
            </div>
          )}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}

function TalentPropositionCard({
  talent,
  relations,
  onSuccess,
}: {
  talent: any;
  relations: any;
  onSuccess?: (talentId: number) => void;
}) {
  const [showBioModal, setShowBioModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const isEnAttente = relations.envoyees.includes(talent.id);
  const isRecu = relations.recues.includes(talent.id);
  const isActif = relations.actives.includes(talent.id);

  const getDisplayProfession = () => {
    if (talent.talent?.profession) return talent.talent.profession;
    const domaineLabel = domaines.find(
      (d: any) => d.id == talent.domaine_id,
    )?.nom;
    return domaineLabel || "Talent";
  };

  const city = talent.talent?.ville;
  const region = talent.talent?.region;
  const hasLocation = city || region;

  const handleSendRequest = async () => {
    if (!message.trim()) return toast.error("Le message est vide.");
    setSending(true);
    try {
      const res = await apiFetch("/reseau/collaborations/envoyer", {
        method: "POST",
        body: JSON.stringify({ recepteur_id: talent.id, message }),
      });
      if (res.statut === 200) {
        toast.success("Demande envoyée !");
        setShowRequestModal(false);
        setMessage("");
        setIsRequestSent(true);
      } else {
        toast.error(res.message || "Erreur");
      }
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  };

  const renderActionButton = () => {
    if (isActif)
      return (
        <div className="w-full mt-6 py-3 rounded-2xl font-bold bg-green-50 text-green-700 flex items-center justify-center gap-2 border border-green-100 text-sm">
          <CheckCircle2 size={16} /> Déjà collaborateur
        </div>
      );
    if (isEnAttente || isRequestSent)
      return (
        <div className="w-full mt-6 py-3 rounded-2xl font-bold bg-orange-50 text-orange-700 flex items-center justify-center gap-2 border border-orange-100 text-sm">
          <Clock size={16} /> En attente
        </div>
      );
    if (isRecu)
      return (
        <Link
          href="/reseau"
          className="w-full mt-6 py-3 rounded-2xl font-bold bg-blue-50 text-blue-700 flex items-center justify-center gap-2 border border-blue-100 text-sm"
        >
          <MessageSquare size={16} /> Voir la demande
        </Link>
      );

    return (
      <button
        disabled={!talent.disponible}
        onClick={() => setShowRequestModal(true)}
        className={`w-full mt-6 py-3 text-sm rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
          talent.disponible
            ? "bg-orange-700 text-white hover:bg-orange-800"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {/* <MessageSquare size={16} /> */}
        {talent.disponible ? "Demander une collaboration" : "Indisponible"}
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-100 hover:border-orange-200 transition-colors p-5 rounded-[2rem] shadow-sm flex flex-col h-full">
      <div className="flex gap-4 items-start mb-4">
        <Link
          href={`/profil-talent/${talent.id}`}
          className="relative shrink-0"
        >
          <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-lg">
            <img
              src={
                talent.pp ? `${apifile}/${talent.pp}` : "/assets/images/pp2.png"
              }
              className="w-full h-full object-cover"
              alt="Avatar"
            />
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${talent.disponible ? "bg-green-500" : "bg-red-400"}`}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profil-talent/${talent.id}`}>
            <h3 className="font-bold text-base text-slate-900 truncate">
              {talent.talent?.nom} {talent.talent?.prenom}
            </h3>
            <p className="text-orange-700 text-[10px] font-black uppercase tracking-tight line-clamp-2">
              {getDisplayProfession()}
            </p>
          </Link>
          {hasLocation && (
            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
              <MapPin size={10} />
              <span className="text-[10px] font-medium line-clamp-2">
                {city}
                {city && region ? ", " : ""}
                {region}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {talent.bio && (
          <div
            onClick={() => setShowBioModal(true)}
            className="bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors mb-3"
          >
            <p className="text-slate-600 text-[13px] italic line-clamp-3 leading-relaxed">
              " {talent.bio} "
            </p>
          </div>
        )}
        <div className="flex w-full flex-nowrap overflow-x-auto gap-2 no-scrollbar scrollbar-hide">
          {talent.talent?.competence?.split(",").map((s: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-white whitespace-nowrap text-slate-500 rounded-md text-[12px] font-bold border border-slate-400 flex-shrink-0"
            >
              {s.trim()}
            </span>
          ))}
        </div>
      </div>

      {renderActionButton()}

      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-20 h-20 rounded-[1.8rem] overflow-hidden shadow-lg mb-4 border-2 border-orange-100">
                    <img
                      src={
                        talent.pp
                          ? `${apifile}/${talent.pp}`
                          : "/assets/images/pp2.png"
                      }
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Nouvelle Collaboration
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                    Envoyez un message à{" "}
                    <span className="text-orange-700">
                      {" "}
                      {talent.talent?.nom}{" "}
                    </span>
                  </p>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre projet et ce que vous attendez de cette collaboration..."
                  className="w-full h-40 p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-orange-500 outline-none text-sm resize-none"
                />
                <button
                  onClick={handleSendRequest}
                  disabled={sending || !message.trim()}
                  className="w-full mt-6 py-4 bg-orange-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={20} /> Envoyer
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBioModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBioModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowBioModal(false)}
                className="absolute top-5 right-5 p-2 bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="text-orange-600" /> Bio de {talent.talent?.nom}
              </h3>
              <p className="text-slate-600 leading-relaxed italic text-sm">
                "{talent.bio}"
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {talent.talent?.competence
                  ?.split(",")
                  .map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-[11px] font-bold"
                    >
                      #{s.trim()}
                    </span>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
