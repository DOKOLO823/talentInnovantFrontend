"use client";

// « Talents récemment actifs » : dropdown replié, chargé à la première ouverture.
// Modal explicatif une seule fois PAR UTILISATEUR et par navigateur (clé localStorage liée à l'id).

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ChevronDown,
  Crown,
  Medal,
  MessageCircle,
  Rocket,
  Star,
  Trophy,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import Avatar from "./common/Avatar";
import ExpandableText from "./common/ExpandableText";
import ModalShell from "./common/ModalShell";
import { CardRowSkeleton } from "./common/Skeletons";

const CRITERES = [
  { icon: Trophy, text: "Participer aux challenges d'innovation" },
  { icon: UserCheck, text: "Compléter votre profil" },
  { icon: Rocket, text: "Partager vos projets dans la Communauté" },
  {
    icon: MessageCircle,
    text: "Interagir avec les publications des autres talents",
  },
  { icon: CalendarCheck, text: "Participer régulièrement aux échanges" },
];

const infoKey = (userId?: number | string | null) =>
  userId ? `ti_talents_actifs_info_v1_${userId}` : null;

export default function TopTalentsRow() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [talents, setTalents] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiFetch("/communaute/top-talents", { method: "GET" });
      if (res?.statut === 200) setTalents(res.data || []);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) return;

    if (talents === null && !loading) load();

    const key = infoKey(user?.id);
    if (key) {
      try {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          setInfoOpen(true);
        }
      } catch {}
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-700" />
          <h2 className="text-base font-bold text-slate-900">
            Talents récemment actifs
          </h2>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {loading || talents === null ? (
            error ? null : (
              <CardRowSkeleton />
            )
          ) : null}

          {error ? (
            <div className="py-6 text-center">
              <p className="mb-3 text-sm text-slate-500">
                Impossible de charger le classement.
              </p>
              <button
                onClick={load}
                className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
              >
                Réessayer
              </button>
            </div>
          ) : talents && talents.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Aucun talent récemment actif pour le moment. Soyez le premier !
            </p>
          ) : (
            talents && (
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {talents.map((t, i) => {
                  const Icon =
                    i === 0 ? Crown : i === 1 ? Medal : i === 2 ? Star : null;
                  return (
                    <div
                      key={t.user_id ?? t.id}
                      className="w-48 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-center transition hover:shadow-md"
                    >
                      <Link
                        href={`/profil-talent/${t.user_id}`}
                        className="relative mx-auto inline-block"
                      >
                        <Avatar
                          pp={t.user?.pp}
                          name={t.nom}
                          size={56}
                          className="border-2 border-white shadow-md"
                        />
                        {Icon && (
                          <span className="absolute -bottom-1 -right-1 rounded-full border border-slate-100 bg-white p-1 shadow">
                            <Icon className="h-3.5 w-3.5 text-orange-600" />
                          </span>
                        )}
                      </Link>

                      <div className="mt-2 space-y-0.5">
                        <ExpandableText
                          lines={1}
                          className="text-sm font-bold text-slate-900"
                        >
                          {`${t.nom ?? ""} ${t.prenom ?? ""}`.trim()}
                        </ExpandableText>
                        <ExpandableText
                          lines={1}
                          className="text-xs text-slate-500"
                        >
                          {t.profession || "Innovateur"}
                        </ExpandableText>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                        {t.nombre_projets > 0 && (
                          <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                            {t.nombre_projets} projet
                            {t.nombre_projets > 1 ? "s" : ""}
                          </span>
                        )}
                        {t.nombre_challenges > 0 && (
                          <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                            {t.nombre_challenges} challenge
                            {t.nombre_challenges > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-center gap-1.5">
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-700">
                          <Trophy className="h-3 w-3" /> {t.point} pts
                        </span>
                        <span className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          {t.rang}
                        </span>
                      </div>

                      <Link
                        href={`/profil-talent/${t.user_id}`}
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-orange-700 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-700 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5" /> Voir le profil
                      </Link>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}

      <ModalShell
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Être mis en valeur"
        panelClassName="sm:max-w-md"
        zClass="z-[800]"
      >
        <div className="p-5">
          <p className="text-sm leading-relaxed text-slate-600">
            Les talents récemment actifs sont sélectionnés selon leur activité
            récente sur TALENT INNOVANT. Vous êtes valorisé notamment lorsque
            vous :
          </p>
          <ul className="mt-4 space-y-3">
            {CRITERES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                  <Icon size={16} />
                </span>
                <span className="pt-1 text-sm font-medium text-slate-800">
                  {text}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Plus votre activité est récente et régulière, plus vous gagnez en
            visibilité.
          </p>
          <button
            onClick={() => setInfoOpen(false)}
            className="mt-5 w-full rounded-xl bg-orange-700 py-3 text-sm font-bold text-white transition hover:bg-orange-800"
          >
            J'ai compris
          </button>
        </div>
      </ModalShell>
    </section>
  );
}
