"use client";

import {
  Info,
  MapPin,
  Users,
  Target,
  Search,
  Check,
  ChevronDown,
  User,
  Briefcase,
  Settings2,
  Shield,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useSearchParams } from "next/navigation";

// Données géographiques
const CAMEROON_GEO: Record<string, string[]> = {
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

interface StepOrganisationProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  jurys: Array<{ id: number; name: string }>;
  onBack: () => void;
}

export default function StepOrganisation({
  data,
  onChange,
  onNext,
  onBack,
}: StepOrganisationProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const lieuParam = useSearchParams().get("lieu"); // 'interne' ou 'externe'
  // Si data.id existe, c'est une modification. Sinon, c'est une création.
  const isModification = !!data.id;

  // Déterminer si le select doit être verrouillé
  const isCanalDisabled =
    !isModification && (lieuParam === "interne" || lieuParam === "externe");

  // Utilise un useEffect pour forcer la valeur du canal lors du premier rendu si nous sommes en mode création :
  useEffect(() => {
    if (!isModification) {
      if (lieuParam === "interne") {
        update("site", "talent innovant");
      } else if (lieuParam === "externe") {
        // On met un espace ou une valeur vide pour forcer l'affichage de l'input URL
        update("site", "");
      }
    }
  }, [lieuParam, isModification]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch("/users", { method: "GET" });
        if (res.statut === 200) {
          setUsers(res.users);
        }
      } catch (error) {
        console.error("Erreur users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const update = (key: string, value: any) =>
    onChange({ ...data, [key]: value });

  // Gère le changement de lieu (réinitialise géo si "en ligne")
  const handleLieuChange = (val: string) => {
    const newData = { ...data, lieu: val };
    if (val === "en ligne") {
      newData.region = "";
      newData.ville = "";
    }
    onChange(newData);
  };

  // Gère le changement de région (réinitialise la ville)
  const handleRegionChange = (val: string) => {
    onChange({ ...data, region: val, ville: "" });
  };

  const handleTypeChange = (val: string) => {
    const newData = { ...data, typeevaluation: val };
    newData.nombregagnant = val === "Hybride" ? ["", ""] : [""];
    if (val === "Vote") newData.jury_id = null;
    onChange(newData);
  };

  // Styles Enterprise
  const labelStyle =
    "block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2";
  const inputStyle =
    "w-full bg-white border border-slate-400 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all";
  const cardStyle = "bg-white border border-slate-200 rounded-md p-6 shadow-sm";
  const sectionTitle =
    "text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4";

  const filteredUsers = users.filter((u) => {
    const name =
      u.statut === "talent"
        ? `${u.talent?.nom} ${u.talent?.prenom}`
        : u.entreprise?.nom;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedJury = users.find((u) => u.id == data.jury_id);
  const showUrlInput = data.site !== "talent innovant";

  // CONDITION GÉOGRAPHIQUE
  const showGeo =
    data.lieu === "en presentiel" ||
    data.lieu == "presentiel" ||
    data.lieu === "hybride";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings2 size={20} className="text-slate-400" />
          Paramètres d'organisation
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configurez la visibilité et le protocole d'évaluation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CONFIGURATION ACCÈS */}
        <section className={cardStyle}>
          <h3 className={sectionTitle}>
            <Shield size={16} className="text-orange-700" /> Accès & Visibilité
          </h3>
          <div className="space-y-6">
            {/* LIEU DE DEROULEMENT */}
            <div className="space-y-1">
              <label className={labelStyle}>Lieu de déroulement</label>
              <select
                className={inputStyle}
                value={data.lieu || ""}
                onChange={(e) => handleLieuChange(e.target.value)}
              >
                <option value="" disabled>
                  Sélectionner le lieu
                </option>
                <option value="en ligne">En ligne</option>
                <option value="presentiel">En présentiel</option>
                <option value="hybride">Hybride</option>
              </select>
            </div>

            {/* SELECTION RÉGION ET VILLE (CONDITIONNELLE) */}
            {showGeo && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/50 rounded-lg border border-orange-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orange-800 uppercase">
                    Région
                  </label>
                  <select
                    className={inputStyle}
                    value={data.region || ""}
                    onChange={(e) => handleRegionChange(e.target.value)}
                  >
                    <option value="">Choisir...</option>
                    {Object.keys(CAMEROON_GEO).map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orange-800 uppercase">
                    Ville
                  </label>
                  <select
                    className={inputStyle}
                    value={data.ville || ""}
                    onChange={(e) => update("ville", e.target.value)}
                    disabled={!data.region}
                  >
                    <option value="">Choisir...</option>
                    {data.region &&
                      CAMEROON_GEO[data.region].map((ville) => (
                        <option key={ville} value={ville}>
                          {ville}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* CANAL DE PARTICIPATION */}
            {/* CANAL DE PARTICIPATION */}
            <div className="space-y-1">
              <label className={labelStyle}>
                Canal de participation
                {/* {isCanalDisabled && (
                  <span className="ml-2 text-[9px] text-orange-600">
                    (Fixé par le type de challenge)
                  </span>
                )} */}
              </label>
              <select
                className={`${inputStyle} ${isCanalDisabled ? "bg-slate-100 cursor-not-allowed opacity-75 font-medium" : ""}`}
                value={
                  data.site === "talent innovant" || !data.site
                    ? "talent innovant"
                    : "hors talent innovant"
                }
                disabled={isCanalDisabled} // Verrouillage ici
                onChange={(e) => {
                  const val = e.target.value;
                  update(
                    "site",
                    val === "talent innovant" ? "talent innovant" : "",
                  );
                }}
              >
                <option value="talent innovant">
                  Plateforme Talent Innovant (In-app)
                </option>
                <option value="hors talent innovant">
                  Formulaire Externe (Lien URL)
                </option>
              </select>

              {isCanalDisabled && (
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Le canal est prédéfini pour un challenge {lieuParam}{" "}
                  {`(${lieuParam == "interne" ? "sur" : "hors"} talent innovant)`}
                  .
                </p>
              )}
            </div>

            {showUrlInput && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className={labelStyle}>
                  Lien de participation (URL)
                </label>
                <div className="relative">
                  <LinkIcon
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="url"
                    placeholder="https://exemple.com/formulaire"
                    className={`${inputStyle} pl-9`}
                    value={data.site === "talent innovant" ? "" : data.site}
                    onChange={(e) => update("site", e.target.value)}
                    // autoFocus
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className={labelStyle}>Portée du challenge</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 p-1 rounded-md">
                {[
                  { id: 1, label: "Public" },
                  { id: 2, label: "Privé" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update("portee_id", p.id)}
                    className={`py-2 text-[11px] font-black uppercase tracking-widest rounded transition-all ${
                      data.portee_id === p.id
                        ? "bg-orange-700 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MODE D'ÉVALUATION */}
        <section className={cardStyle}>
          <h3 className={sectionTitle}>
            <Users size={16} className="text-orange-700" /> Système de notation
          </h3>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className={labelStyle}>Méthode de sélection</label>
              <select
                className={inputStyle}
                value={data.typeevaluation || "Jury"}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="Jury">Comité d'experts (Jury)</option>
                <option value="Vote">Audience publique (Vote)</option>
                <option value="Hybride">Mixte (Vote + Jury)</option>
              </select>
            </div>

            {data.typeevaluation !== "Vote" && (
              <div className="relative space-y-1">
                <label className={labelStyle}>Jury référent</label>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`${inputStyle} flex items-center justify-between text-left`}
                >
                  {selectedJury ? (
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={
                          selectedJury.pp
                            ? `${apifile}/${selectedJury?.pp}`
                            : "../assets/images/pp2.png"
                        }
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        alt=""
                      />
                      <span className="truncate font-bold text-xs">
                        {selectedJury.statut === "talent"
                          ? `${selectedJury.talent?.nom} ${selectedJury.talent?.prenom}`
                          : selectedJury.entreprise?.nom}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">
                      Sélectionner un membre...
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-xl overflow-hidden ring-1 ring-black/5">
                    <div className="p-2 bg-slate-50 border-b border-slate-200">
                      <div className="relative">
                        <Search
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={12}
                        />
                        <input
                          className="w-full bg-white border border-slate-200 rounded p-1.5 pl-8 text-[11px] outline-none focus:border-orange-700"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            update("jury_id", u.id);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-orange-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                        >
                          <img
                            src={
                              u.pp
                                ? `${apifile}/${u.pp}`
                                : "../assets/images/pp2.png"
                            }
                            className="w-6 h-6 rounded-full object-cover"
                            alt=""
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 line-clamp-1">
                              {u.statut === "talent"
                                ? `${u.talent?.nom ? u.talent?.nom : ""} ${u.talent?.prenom ? u.talent?.prenom : ""}`
                                : u.entreprise?.nom
                                  ? u.entreprise?.nom
                                  : ""}
                            </p>
                            <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter italic line-clamp-1">
                              {u.statut === "talent"
                                ? `${u.talent?.profession ? u.talent?.profession : ""}`
                                : u.entreprise?.service
                                  ? u.entreprise?.service
                                  : ""}
                            </p>
                          </div>
                          {data.jury_id === u.id && (
                            <Check size={14} className="text-orange-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* RECOMPENSES ET LIMITES */}
      <section className={cardStyle}>
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <label className={labelStyle}>
              Quotas de lauréats (Nombre de gagnants)
            </label>
            {data.typeevaluation === "Hybride" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Préselections (Vote)
                  </p>
                  <input
                    type="number"
                    className={inputStyle}
                    value={data.nombregagnant?.[0] || ""}
                    onChange={(e) => {
                      const copy = [...(data.nombregagnant || ["", ""])];
                      copy[0] = e.target.value;
                      update("nombregagnant", copy);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    Nombre gagnants Finaux
                  </p>
                  <input
                    type="number"
                    className={inputStyle}
                    value={data.nombregagnant?.[1] || ""}
                    onChange={(e) => {
                      const copy = [...(data.nombregagnant || ["", ""])];
                      copy[1] = e.target.value;
                      update("nombregagnant", copy);
                    }}
                  />
                </div>
              </div>
            ) : (
              <input
                type="number"
                className={inputStyle}
                placeholder="Ex: 3"
                value={data.nombregagnant?.[0] || ""}
                onChange={(e) => update("nombregagnant", [e.target.value])}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className={labelStyle}>
              Nombre de soumission par participant
            </label>
            <input
              type="number"
              className={inputStyle}
              value={data.nombrecontribution || 1}
              onChange={(e) =>
                update("nombrecontribution", parseInt(e.target.value))
              }
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              Nb: nombre maximum de projets par participant
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          className="bg-orange-700 text-white px-8 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all shadow-md active:scale-[0.98]"
        >
          Continuer vers les domaines
        </button>
      </div>
    </div>
  );
}
