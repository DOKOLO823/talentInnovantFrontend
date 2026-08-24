"use client";

// steps/StepOrganisation.tsx — COMPLET avec multi-jurys, régions, critères+coef, validation étape

import { useState, useEffect } from "react";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ChevronDown,
  Check,
  Settings2,
  Shield,
  Users,
  Plus,
  Trash2,
  AlertCircle,
  MapPin,
  Scale,
  Link as LinkIcon,
  Info,
  Megaphone,
} from "lucide-react";
import toast from "react-hot-toast";
import { li } from "framer-motion/client";

// ── Données géographiques ──
const CAMEROON_REGIONS = [
  "Adamaoua",
  "Centre",
  "Est",
  "Extrême-Nord",
  "Littoral",
  "Nord",
  "Nord-Ouest",
  "Ouest",
  "Sud",
  "Sud-Ouest",
];

const CAMEROON_GEO: Record<string, string[]> = {
  Adamaoua: ["Ngaoundéré", "Tignère", "Meiganga", "Banyo", "Tibati"],
  Centre: ["Yaoundé", "Obala", "Mfou", "Mbalmayo", "Akonolinga", "Eseka"],
  Est: ["Bertoua", "Batouri", "Garoua-Boulaï", "Abong-Mbang"],
  "Extrême-Nord": ["Maroua", "Kousseri", "Mokolo", "Mora", "Yagoua"],
  Littoral: ["Douala", "Nkongsamba", "Edea", "Manjo", "Loum"],
  Nord: ["Garoua", "Guider", "Poli", "Figuil"],
  "Nord-Ouest": ["Bamenda", "Kumbo", "Ndop", "Wum"],
  Ouest: ["Bafoussam", "Dschang", "Foumban", "Bangangté", "Mbouda"],
  Sud: ["Ebolowa", "Kribi", "Ambam", "Sangmelima"],
  "Sud-Ouest": ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko"],
};

const PACK_MAX_REGIONS: Record<string, number> = {
  starter: 1,
  standard: 3,
  avance: 6,
  premium: 10,
};

interface StepOrganisationProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  jurys?: any[];
}

// ── Styles communs ──
const labelStyle =
  "block text-[11px] font-black uppercase tracking-wider text-slate-900 mb-2";
const inputStyle =
  "w-full bg-white border border-slate-400 rounded-md p-2.5 text-sm focus:border-orange-700 focus:ring-1 focus:ring-orange-700 outline-none transition-all";
const cardStyle = "bg-white border border-slate-200 rounded-md p-6 shadow-sm";
const sectionTitle =
  "text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4";
const errStyle =
  "flex items-center gap-1 text-red-600 text-[10px] font-bold mt-1";

export default function StepOrganisation({
  data,
  onChange,
  onNext,
  onBack,
  jurys,
}: StepOrganisationProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isJuryOpen, setIsJuryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();
  const lieuParam = searchParams.get("lieu");
  const packParam = searchParams.get("pack") ?? "";
  const isModification = !!data.id;
  const isInterne = data.site == "talent innovant";
  const typechallenge = useSearchParams().get("typechallenge");
  // pour mode edit
  const effectiveTypechallenge = data.typechallenge || typechallenge;
  const [lienExterne, setLienExterne] = useState(
    data.site && data.site != "talent innovant" ? data.site : "",
  );

  const maxRegions = isInterne
    ? (PACK_MAX_REGIONS[packParam] ?? PACK_MAX_REGIONS[data.pack] ?? 1)
    : 0;

  const isCanalDisabled =
    !isModification && (lieuParam === "interne" || lieuParam === "externe");

  // diffuser challenge ?
  const isAlreadyDiffused = !!Number(data.infonewchallenge);

  // Initialisation canal selon param URL
  useEffect(() => {
    if (!isModification) {
      if (lieuParam == "interne") update("site", "talent innovant");
      else if (lieuParam == "externe") update("site", lienExterne);
    }
    if (packParam && !data.pack) update("pack", packParam);
  }, [lieuParam, isModification, packParam]);

  // Chargement des utilisateurs (jurys potentiels)
  useEffect(() => {
    apiFetch("/users", { method: "GET" })
      .then((res) => {
        if (res.statut === 200) setUsers(res.users);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: any) => {
    if (errors[key])
      setErrors((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    onChange({ ...data, [key]: value });
  };

  const handleLieuChange = (val: string) => {
    const newData = { ...data, lieu: val };
    if (val === "en ligne") {
      newData.region = "";
      newData.ville = "";
    }
    onChange(newData);
  };

  // 1. Déterminer l'ID courant de manière stricte
  const currentEvalId = Number(
    data.typeevaluation_id ||
      (typeof data.typeevaluation === "object"
        ? data.typeevaluation?.id
        : null) ||
      1,
  );

  // 2. Synchroniser l'état au premier rendu si typeevaluation_id est manquant dans data
  useEffect(() => {
    if (!data.typeevaluation_id) {
      const initialId =
        typeof data.typeevaluation === "object"
          ? data.typeevaluation?.id
          : data.typeevaluation === "Jury"
            ? 2
            : data.typeevaluation === "Hybride"
              ? 3
              : 1;

      onChange({
        ...data,
        typeevaluation_id: initialId,
      });
    }
  }, []);

  // 3. Fonction de mise à jour au clic
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);

    let stringValue = "Vote";
    if (selectedId === 2) stringValue = "Jury";
    if (selectedId === 3) stringValue = "Hybride";

    onChange({
      ...data,
      typeevaluation: stringValue,
      typeevaluation_id: selectedId, // CRUCIAL : Envoyé au state parent
    });
  };

  // ── Jurys (multi-sélection) ──
  const selectedJuryIds: number[] = data.jurys ?? [];

  const addJury = (userId: number) => {
    if (selectedJuryIds.includes(userId)) return;
    update("jurys", [...selectedJuryIds, userId]);
    setIsJuryOpen(false);
    setSearchTerm("");
  };

  const removeJury = (userId: number) => {
    update(
      "jurys",
      selectedJuryIds.filter((id) => id !== userId),
    );
  };

  // ── Régions ──
  const selectedRegions: string[] = data.regions ?? [];

  const toggleRegion = (region: string) => {
    if (isAlreadyDiffused) return; // ✅ verrouillé après diffusion

    if (selectedRegions.includes(region)) {
      update(
        "regions",
        selectedRegions.filter((r) => r !== region),
      );
    } else {
      if (selectedRegions.length >= maxRegions) {
        toast.error(
          `Le pack "${(packParam || data.pack || "sélectionné").toUpperCase()}" autorise au maximum ${maxRegions} région(s).`,
        );
        return;
      }
      update("regions", [...selectedRegions, region]);
    }
  };

  // ── Critères avec coefficients ──
  const criteres: { libelle: string; coefficient: number }[] =
    data.criteres ?? [];

  const addCritere = () =>
    update("criteres", [...criteres, { libelle: "", coefficient: 1 }]);

  const updateCritere = (idx: number, field: string, value: any) => {
    const copy = [...criteres];
    copy[idx] = { ...copy[idx], [field]: value };
    update("criteres", copy);
  };

  const removeCritere = (idx: number) => {
    update(
      "criteres",
      criteres.filter((_, i) => i !== idx),
    );
  };

  // ── Validation avant étape suivante ──
  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    if (!data.lieu) {
      newErrors.lieu = "Le lieu de déroulement est obligatoire.";
    }

    if (!data.portee_id) {
      newErrors.portee_id = "La portée du challenge est obligatoire.";
    }

    if (!data.typeevaluation) {
      newErrors.typeevaluation = "La méthode de sélection est obligatoire.";
    }

    if (
      data.typeevaluation !== "Vote" &&
      selectedJuryIds.length === 0 &&
      lieuParam != "externe"
    ) {
      newErrors.jurys = "Veuillez sélectionner au moins un jury.";
    }

    if (
      isInterne &&
      effectiveTypechallenge == "entreprise" &&
      data.diffuser !== false &&
      selectedRegions.length === 0
    ) {
      newErrors.regions =
        "Veuillez sélectionner au moins une région de diffusion.";
    }

    if (
      data.typeevaluation !== "Vote" &&
      criteres.length === 0 &&
      lieuParam != "externe"
    ) {
      newErrors.criteres = "Veuillez ajouter au moins un critère d'évaluation.";
    }

    if (criteres.some((c) => !c.libelle.trim()) && lieuParam != "externe") {
      newErrors.criteres = "Tous les critères doivent avoir un intitulé.";
    }

    // if (
    //   lienExterne &&
    //   !/^https?:\/\/\S+$/.test(lienExterne) &&
    //   lieuParam == "externe"
    // ) {
    //   newErrors.lienExterne =
    //     "Veuillez entrer une URL valide commençant par http:// ou https://";
    // }

    if (lienExterne?.length == 0 && lieuParam == "externe") {
      newErrors.lienExterne =
        "Le lien de participation est obligatoire pour un challenge externe.";
    }

    // if (
    //   data.typeevaluation === "Hybride" &&
    //   (!data.nombregagnant?.[0] || !data.nombregagnant?.[1])
    // ) {
    //   newErrors.nombregagnant =
    //     "Les deux quotas (présélections et finaux) sont requis pour le mode Hybride.";
    // }

    // if (!data.nombregagnant?.[0]) {
    //   newErrors.nombregagnant =
    //     newErrors.nombregagnant || "Le nombre de gagnants est obligatoire.";
    // }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    onNext();
  };

  // ── Filtrage utilisateurs ──
  const filteredUsers = users.filter((u) => {
    const name =
      u.statut === "talent"
        ? `${u.talent?.nom ?? ""} ${u.talent?.prenom ?? ""}`
        : (u.entreprise?.nom ?? "");
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const showGeo = ["en presentiel", "presentiel", "hybride"].includes(
    data.lieu ?? "",
  );
  const showUrlInput = data.site !== "talent innovant";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* ── En-tête ── */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings2 size={20} className="text-slate-400" /> Paramètres
          d'organisation
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configurez la visibilité et le protocole d'évaluation.
        </p>
        {(packParam || data.pack) && isInterne && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-orange-700">
            Pack : <span className="uppercase">{packParam || data.pack}</span>
            <span>· {maxRegions} région(s) max</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── ACCÈS & VISIBILITÉ ── */}
        <section className={cardStyle}>
          <h3 className={sectionTitle}>
            <Shield size={16} className="text-orange-700" /> Accès & Visibilité
          </h3>
          <div className="space-y-5">
            {/* Lieu */}
            <div>
              <label className={labelStyle}>Lieu de déroulement *</label>
              <select
                className={`${inputStyle} ${errors.lieu ? "border-red-400" : ""}`}
                value={data.lieu || ""}
                onChange={(e) => handleLieuChange(e.target.value)}
              >
                <option value="" disabled>
                  Sélectionner...
                </option>
                <option value="en ligne">En ligne</option>
                <option value="presentiel">En présentiel</option>
                <option value="hybride">Hybride</option>
              </select>
              {errors.lieu && (
                <p className={errStyle}>
                  <AlertCircle size={10} />
                  {errors.lieu}
                </p>
              )}
            </div>

            {/* Géo (présentiel/hybride) */}
            {showGeo && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                <div>
                  <label className="text-[10px] font-bold text-orange-800 uppercase">
                    Région
                  </label>
                  <select
                    className={inputStyle}
                    value={data.region || ""}
                    onChange={(e) =>
                      onChange({ ...data, region: e.target.value, ville: "" })
                    }
                  >
                    <option value="">Choisir...</option>
                    {Object.keys(CAMEROON_GEO).map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
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
                      CAMEROON_GEO[data.region]?.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Canal */}
            <div>
              <label className={labelStyle}>Canal de participation</label>
              <select
                className={`${inputStyle} ${isCanalDisabled ? "bg-slate-100 cursor-not-allowed opacity-75" : ""}`}
                value={
                  data.site === "talent innovant"
                    ? "talent innovant"
                    : "hors talent innovant"
                }
                disabled={isCanalDisabled}
                onChange={(e) =>
                  update(
                    "site",
                    e.target.value === "talent innovant"
                      ? "talent innovant"
                      : "",
                  )
                }
              >
                <option value="talent innovant">
                  Plateforme Talent Innovant
                </option>
                <option value="hors talent innovant">
                  Formulaire Externe (URL)
                </option>
              </select>
              {isCanalDisabled && (
                <p className="text-[10px] text-slate-400 italic mt-1">
                  Canal prédéfini pour un challenge {lieuParam}.
                </p>
              )}
            </div>

            {/* URL externe */}
            {showUrlInput && (
              <div>
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
                    value={data.site == "talent innovant" ? "" : lienExterne}
                    onChange={(e) => {
                      update("site", e.target.value);
                      setLienExterne(e.target.value);
                    }}
                  />
                </div>
                {errors.lienExterne && (
                  <p className={errStyle}>
                    <AlertCircle size={10} />
                    {errors.lienExterne}
                  </p>
                )}
              </div>
            )}

            {/* Portée */}
            <div>
              <label className={labelStyle}>Portée du challenge *</label>
              <div
                className={`grid grid-cols-2 gap-2 bg-slate-50 border p-1 rounded-md ${errors.portee_id ? "border-red-300" : "border-slate-200"}`}
              >
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
              {errors.portee_id && (
                <p className={errStyle}>
                  <AlertCircle size={10} />
                  {errors.portee_id}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── SYSTÈME DE NOTATION ── */}
        <section className={cardStyle}>
          <h3 className={sectionTitle}>
            <Users size={16} className="text-orange-700" /> Système de notation
          </h3>
          <div className="space-y-5">
            {/* Méthode */}
            <div>
              <label className={labelStyle}>Méthode de sélection *</label>
              <select
                className={`${inputStyle} ${errors.typeevaluation ? "border-red-400" : ""}`}
                value={currentEvalId}
                onChange={handleTypeChange}
              >
                <option value={2}>Comité d'experts (Jury)</option>
                <option value={1}>Audience publique (Vote)</option>
                <option value={3}>Mixte (Vote + Jury)</option>
              </select>
              {errors.typeevaluation && (
                <p className={errStyle}>
                  <AlertCircle size={10} />
                  {errors.typeevaluation}
                </p>
              )}
            </div>

            {/* MULTI-JURYS */}
            {data.typeevaluation !== "Vote" && isInterne && (
              <div>
                <label className={labelStyle}>Jurys référents *</label>

                {/* Liste des jurys sélectionnés */}
                {selectedJuryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedJuryIds.map((juryId) => {
                      const u = users.find((u) => u.id === juryId);
                      if (!u) return null;
                      const nom =
                        u.statut === "talent"
                          ? `${u.talent?.nom ?? ""} ${u.talent?.prenom ?? ""}`.trim()
                          : (u.entreprise?.nom ?? u.email);
                      return (
                        <div
                          key={juryId}
                          className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-orange-800"
                        >
                          <img
                            src={
                              u.pp
                                ? `${apifile}/${u.pp}`
                                : "../assets/images/pp2.png"
                            }
                            className="w-4 h-4 rounded-full object-cover"
                            alt=""
                          />
                          <span className="max-w-[120px] truncate">{nom}</span>
                          <button
                            onClick={() => removeJury(juryId)}
                            className="hover:text-red-600 transition-colors ml-1"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown de sélection */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsJuryOpen(!isJuryOpen)}
                    className={`${inputStyle} ${errors.jurys ? "border-red-400" : ""} flex items-center justify-between text-left`}
                  >
                    <span className="text-slate-400 text-sm">
                      {loading ? "Chargement..." : "Ajouter un jury..."}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${isJuryOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isJuryOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-xl overflow-hidden">
                      <div className="p-2 bg-slate-50 border-b">
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
                      <div className="max-h-52 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-4">
                            Aucun résultat
                          </p>
                        ) : (
                          filteredUsers.map((u) => {
                            const nom =
                              u.statut === "talent"
                                ? `${u.talent?.nom ?? ""} ${u.talent?.prenom ?? ""}`.trim()
                                : (u.entreprise?.nom ?? u.email);
                            const already = selectedJuryIds.includes(u.id);
                            return (
                              <div
                                key={u.id}
                                onClick={() => !already && addJury(u.id)}
                                className={`flex items-center gap-3 p-2.5 border-b border-slate-50 last:border-0 transition-colors
                                ${already ? "bg-orange-50 cursor-default" : "hover:bg-orange-50 cursor-pointer"}`}
                              >
                                <img
                                  src={
                                    u.pp
                                      ? `${apifile}/${u.pp}`
                                      : "../assets/images/pp2.png"
                                  }
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                  alt=""
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-slate-900 truncate">
                                    {nom}
                                  </p>
                                  <p className="text-[9px] text-slate-400 uppercase font-bold italic">
                                    {u.statut === "talent"
                                      ? (u.talent?.profession ?? "")
                                      : "Entreprise"}
                                  </p>
                                </div>
                                {already && (
                                  <Check
                                    size={14}
                                    className="text-orange-700 shrink-0"
                                  />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {errors.jurys && (
                  <p className={errStyle}>
                    <AlertCircle size={10} />
                    {errors.jurys}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── RÉGIONS (challenge interne uniquement) ── */}
      {isInterne && effectiveTypechallenge == "entreprise" && (
        <>
          {/* ── DIFFUSION AUTOMATIQUE ── */}
          <section className={cardStyle}>
            <h3 className={sectionTitle}>
              <Megaphone size={16} className="text-orange-700" /> Diffusion
              automatique
            </h3>

            <label
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isAlreadyDiffused
                  ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-70"
                  : data.diffuser !== false
                    ? "bg-orange-50 border-orange-200 cursor-pointer"
                    : "bg-slate-50 border-slate-200 cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={data.diffuser !== false}
                disabled={isAlreadyDiffused}
                onChange={(e) => update("diffuser", e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-orange-700 shrink-0 disabled:cursor-not-allowed cursor-pointer"
              />
              <div>
                <p
                  className={`text-sm font-bold ${
                    isAlreadyDiffused
                      ? "text-slate-500"
                      : data.diffuser !== false
                        ? "text-orange-900"
                        : "text-slate-500"
                  }`}
                >
                  {data.diffuser !== false
                    ? "Diffusion activée"
                    : "Diffusion désactivée"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Envoie un e-mail et une notification aux talents éligibles des
                  régions ciblées dès la publication du challenge.
                </p>
              </div>
            </label>

            {isAlreadyDiffused && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <Info size={14} className="text-orange-600 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700 font-medium">
                  Ce challenge a déjà été diffusé aux talents. Ce paramètre
                  ainsi que les régions ci-dessous ne sont plus modifiables.
                </p>
              </div>
            )}
          </section>

          {/* ── RÉGIONS DE DIFFUSION — masqué si diffusion désactivée ── */}
          {data.diffuser !== false && (
            <section className={cardStyle}>
              <h3 className={sectionTitle}>
                <MapPin size={16} className="text-orange-700" /> Régions de
                diffusion *
                <span className="ml-auto text-[10px] font-bold text-slate-400 normal-case">
                  {selectedRegions.length}/{maxRegions} sélectionnée(s)
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {CAMEROON_REGIONS.map((region) => {
                  const isSelected = selectedRegions.includes(region);
                  const isDisabled =
                    isAlreadyDiffused ||
                    (!isSelected && selectedRegions.length >= maxRegions);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      disabled={isDisabled}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                        isSelected
                          ? "bg-orange-700 text-white border-orange-700"
                          : isDisabled
                            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                            : "bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50"
                      }`}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
              {errors.regions && (
                <p className={`${errStyle} mt-3`}>
                  <AlertCircle size={10} />
                  {errors.regions}
                </p>
              )}
            </section>
          )}
        </>
      )}

      {/* ── CRITÈRES D'ÉVALUATION AVEC COEFFICIENTS ── */}
      {data.typeevaluation !== "Vote" && (
        <section className={cardStyle}>
          <h3 className={sectionTitle}>
            <Scale size={16} className="text-orange-700" /> Critères
            d'évaluation *
            <span className="text-[10px] font-normal text-slate-500 ml-2 normal-case">
              Note /20 × coefficient
            </span>
          </h3>

          <div className="space-y-3">
            {criteres.map((critere, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row justify-center items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <span className="text-[10px] font-black text-slate-400 w-5 shrink-0">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  placeholder={`Critère (ex: Originalité, Innovation…)`}
                  className={`${inputStyle} flex-1`}
                  value={critere.libelle}
                  onChange={(e) =>
                    updateCritere(idx, "libelle", e.target.value)
                  }
                />
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    Coef.
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="w-16 border border-slate-300 rounded-md p-1.5 text-sm text-center font-bold focus:border-orange-700 outline-none"
                    value={critere.coefficient ?? ""}
                    onChange={(e) =>
                      updateCritere(idx, "coefficient", e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCritere(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addCritere}
              className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-orange-400 text-slate-500 hover:text-orange-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus size={16} /> Ajouter un critère
            </button>
          </div>

          {/* {criteres.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 font-bold">
              📊 Formule :{" "}
              <span className="font-normal">Σ(Note × Coef) / Σ(Coef)</span> par
              jury → moyenne inter-jurys = note finale
            </div>
          )} */}

          {errors.criteres && (
            <p className={`${errStyle} mt-2`}>
              <AlertCircle size={10} />
              {errors.criteres}
            </p>
          )}
        </section>
      )}

      {/* ── QUOTAS ── */}
      <section className={cardStyle}>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <label className={labelStyle}>Quotas de lauréats</label>
            {data.typeevaluation === "Hybride" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Présélections (Vote)
                  </p>
                  <input
                    type="number"
                    className={`${inputStyle} ${errors.nombregagnant ? "border-red-400" : ""}`}
                    value={data.nombregagnant?.[0] || ""}
                    onChange={(e) => {
                      const c = [...(data.nombregagnant || ["", ""])];
                      c[0] = e.target.value;
                      update("nombregagnant", c);
                    }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                    Gagnants finaux
                  </p>
                  <input
                    type="number"
                    className={`${inputStyle} ${errors.nombregagnant ? "border-red-400" : ""}`}
                    value={data.nombregagnant?.[1] || ""}
                    onChange={(e) => {
                      const c = [...(data.nombregagnant || ["", ""])];
                      c[1] = e.target.value;
                      update("nombregagnant", c);
                    }}
                  />
                </div>
              </div>
            ) : (
              <input
                type="number"
                className={`${inputStyle} ${errors.nombregagnant ? "border-red-400" : ""}`}
                placeholder="Ex: 3"
                value={data.nombregagnant?.[0] || ""}
                onChange={(e) => update("nombregagnant", [e.target.value])}
              />
            )}
            {errors.nombregagnant && (
              <p className={errStyle}>
                <AlertCircle size={10} />
                {errors.nombregagnant}
              </p>
            )}
          </div>

          <div>
            <label className={labelStyle}>Soumissions par participant</label>
            <input
              type="number"
              className={inputStyle}
              value={data.nombrecontribution ?? ""}
              onChange={(e) => update("nombrecontribution", e.target.value)}
              // Remet 1 si le champ est laissé vide à la fin de la saisie
              onBlur={(e) => {
                if (e.target.value === "") update("nombrecontribution", 1);
              }}
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              Nombre max de projets par participant
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-[12px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-orange-700 text-white px-8 py-2.5 rounded-md text-sm font-bold hover:bg-orange-800 transition-all shadow-md active:scale-[0.98]"
        >
          Continuer vers les domaines →
        </button>
      </div>
    </div>
  );
}
