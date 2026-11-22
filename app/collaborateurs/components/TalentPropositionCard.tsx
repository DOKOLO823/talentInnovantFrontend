"use client";

// Emplacement : app/collaborateurs/components/TalentPropositionCard.tsx
// Carte talent : cover, photo, nom, profession, lieu, infos clés, bouton.
// Utilisée dans la grille de /collaborateurs (2 colonnes sur mobile) ET dans la
// liste horizontale de l'accueil.

import {
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  MessageSquare,
  UserPlus,
  X,
} from "lucide-react";
import apifile from "@/app/lib/apifile";
import domaines from "@/domaines.json";
import CollaborationRequestModal from "./CollaborationRequestModal";

// Limite de caractères de la bio affichée SUR LA CARTE (hauteur identique pour tous).
// La bio complète reste lisible dans la fenêtre « Bio » (clic sur la bio).
const BIO_PREVIEW_MAX = 90;
const truncateBio = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

const domaineNom = (id: any): string | undefined =>
  (domaines as any[]).find((d: any) => d.id == id)?.nom;

// Domaines secondaires : accepte des objets {id, nom} ou de simples ids
const secondaryNames = (raw: any): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((d: any) =>
      typeof d === "object" && d !== null
        ? d.nom || d.name || domaineNom(d.id ?? d.domaine_id)
        : domaineNom(d),
    )
    .filter(Boolean) as string[];
};

// Ligne défilable horizontalement : UNE seule ligne, sans barre visible, centrée tant qu'elle ne
// déborde pas, et qui ne dépasse jamais de la carte. Défilement tactile sur mobile, glisser à la
// souris sur ordinateur. Le padding intérieur garde les puces alignées avec le reste de la carte.
function ScrollRow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });

  const onMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    };
  };
  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    el.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
  };
  const stopDrag = () => {
    drag.current.active = false;
  };

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      className="w-full min-w-0 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="mx-auto flex w-max items-center gap-1.5 px-3 md:px-4">
        {children}
      </div>
    </div>
  );
}

export function TalentPropositionCard({
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
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [coverOk, setCoverOk] = useState(true);

  // La page /collaborateurs et l'accueil n'utilisent pas les mêmes noms de clés
  const envoyees =
    relations?.envoyees ?? relations?.ids_demandes_envoyees ?? [];
  const recues = relations?.recues ?? relations?.ids_demandes_recues ?? [];
  const actives =
    relations?.actives ?? relations?.ids_collaborations_actives ?? [];

  const isEnAttente = envoyees.includes(talent.id);
  const isRecu = recues.includes(talent.id);
  const isActif = actives.includes(talent.id);

  const fullName =
    `${talent.talent?.nom ?? ""} ${talent.talent?.prenom ?? ""}`.trim() ||
    "Talent";
  const profession = talent.talent?.profession?.trim() || "Innovateur";
  const location = [talent.talent?.ville, talent.talent?.region]
    .filter(Boolean)
    .join(", ");
  const avatar = talent.pp
    ? `${apifile}/${talent.pp}`
    : "/assets/images/pp2.png";
  const cover = talent.pc ? `${apifile}/${talent.pc}` : null;
  const bio = talent.bio?.trim() || "";
  const bioPreview = truncateBio(bio, BIO_PREVIEW_MAX);

  // Compétences (sans pastilles vides)
  const skills: string[] =
    talent.talent?.competence
      ?.split(",")
      .map((s: string) => s.trim())
      .filter(Boolean) ?? [];

  // Info principale : compétences, sinon domaine principal (+ secondaires)
  const principal = domaineNom(talent.domaine_id);
  const secondaires = secondaryNames(
    talent.domaines_secondaires ?? talent.domainesSecondaires,
  ).filter((n) => n !== principal);
  const chips: string[] =
    skills.length > 0
      ? skills
      : ([principal, ...secondaires].filter(Boolean) as string[]);

  const hasChips = chips.length > 0;

  const renderActionButton = () => {
    const base =
      "w-full py-2 md:py-2.5 text-xs md:text-sm rounded-xl font-semibold flex items-center justify-center gap-1.5 transition";

    if (isActif)
      return (
        <div
          className={`${base} bg-green-50 text-green-700 border border-green-100`}
        >
          <CheckCircle2 size={14} /> Collaborateur
        </div>
      );
    if (isEnAttente || isRequestSent)
      return (
        <div
          className={`${base} bg-orange-50 text-orange-700 border border-orange-100`}
        >
          <Clock size={14} /> En attente
        </div>
      );
    if (isRecu)
      return (
        <Link
          href="/reseau"
          className={`${base} bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100`}
        >
          <MessageSquare size={14} /> Voir la demande
        </Link>
      );

    return (
      <button
        disabled={!talent.disponible}
        onClick={() => setShowRequestModal(true)}
        className={`${base} ${
          talent.disponible
            ? "bg-orange-700 text-white hover:bg-orange-800 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {talent.disponible ? (
          <>
            <UserPlus size={14} /> Collaborer
          </>
        ) : (
          "Indisponible"
        )}
      </button>
    );
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-orange-200 hover:shadow-md transition rounded-2xl flex flex-col h-full min-w-0">
      {/* Cover : orange-700 quand le talent n'en a pas */}
      <div className="relative h-16 md:h-20 rounded-t-2xl overflow-hidden bg-orange-700">
        {cover && coverOk && (
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setCoverOk(false)}
          />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 px-3 md:px-4 pb-3 md:pb-4 text-center">
        <Link href={`/profil-talent/${talent.id}`} className="block">
          <div className="relative w-fit mx-auto -mt-8 md:-mt-10">
            <img
              src={avatar}
              alt={fullName}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white bg-white shadow-sm"
            />
            <span
              title={talent.disponible ? "Disponible" : "Indisponible"}
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                talent.disponible ? "bg-green-500" : "bg-red-400"
              }`}
            />
          </div>

          {/* Hauteurs FIXES (2 lignes max) : la carte ne dépend plus de la longueur des textes */}
          <h3 className="mt-2 text-[13px] md:text-base font-bold text-slate-900 leading-snug line-clamp-2 h-[2.25rem] md:h-[2.75rem]">
            {fullName}
          </h3>
          <p className="mt-0.5 text-[11px] md:text-xs text-slate-600 leading-snug line-clamp-2 h-[1.9rem] md:h-[2.1rem]">
            {profession}
          </p>
        </Link>

        {/* Emplacement toujours réservé, même sans lieu renseigné */}
        <p className="mt-1.5 flex h-4 md:h-[1.125rem] items-center justify-center gap-1 text-[10.5px] md:text-xs text-slate-500">
          {location && (
            <>
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{location}</span>
            </>
          )}
        </p>

        {/* Infos clés : compétences > domaines > bio > message par défaut.
            Hauteur FIXE ; pleine largeur de la carte (les marges négatives annulent le padding,
            chaque élément le retrouve à l'intérieur). */}
        <div className="-mx-3 md:-mx-4 mt-3 flex h-10 md:h-[4.5rem] flex-none flex-col gap-2 overflow-hidden">
          {hasChips && (
            <ScrollRow>
              {chips.map((c, i) => (
                <span
                  key={i}
                  className="shrink-0 select-none whitespace-nowrap rounded-lg border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] md:text-[11px] font-semibold text-orange-700"
                >
                  {c}
                </span>
              ))}
            </ScrollRow>
          )}

          {bio && (
            <button
              onClick={() => setShowBioModal(true)}
              className={`${
                hasChips ? "hidden md:block" : "block"
              } mx-3 md:mx-4 text-slate-500 hover:text-slate-700 transition-colors`}
            >
              {/* line-clamp sur le <span> : sur le bouton, « md:block » l'annulait */}
              <span className="line-clamp-2 italic text-[11px] md:text-xs leading-relaxed">
                "{bioPreview}"
              </span>
            </button>
          )}

          {!hasChips && !bio && (
            <p className="mx-3 md:mx-4 text-[11px] md:text-xs text-slate-400">
              {talent.disponible
                ? "Ouvert aux collaborations"
                : "Profil en cours de complétion"}
            </p>
          )}
        </div>

        <div className="mt-auto pt-4">{renderActionButton()}</div>
      </div>

      {/* Demande de collaboration (fenêtre partagée avec le profil) */}
      <CollaborationRequestModal
        open={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        recipientId={talent.id}
        name={talent.talent?.nom}
        avatarUrl={avatar}
        onSent={() => {
          setIsRequestSent(true);
          onSuccess?.(talent.id);
        }}
      />

      <AnimatePresence>
        {showBioModal && (
          <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
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
              className="relative bg-white rounded-[2rem] w-full max-w-md p-7 shadow-2xl text-left"
            >
              <button
                onClick={() => setShowBioModal(false)}
                aria-label="Fermer"
                className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="text-orange-600" /> Bio de {talent.talent?.nom}
              </h3>
              <p className="text-slate-600 leading-relaxed italic text-sm">
                "{bio}"
              </p>
              {skills.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {skills.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-[11px] font-bold"
                    >
                      #{s}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
