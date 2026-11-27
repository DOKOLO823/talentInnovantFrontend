"use client";

// « Entreprises à l'honneur » : dropdown replié, chargé à la première ouverture.

import { useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, ChevronDown } from "lucide-react";
import apifile from "@/app/lib/apifile";
import { apiFetch } from "@/app/lib/api";
import ExpandableText from "./common/ExpandableText";
import { CardRowSkeleton } from "./common/Skeletons";

export default function TopEntreprisesRow() {
  const [open, setOpen] = useState(false);
  const [entreprises, setEntreprises] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await apiFetch("/communaute/top-entreprises", {
        method: "GET",
      });
      if (res?.statut === 200) setEntreprises(res.data || []);
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
    if (next && entreprises === null && !loading) load();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
      >
        <span className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-orange-700" />
          <h2 className="text-base font-bold text-slate-900">
            Entreprises à l'honneur
          </h2>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {loading && <CardRowSkeleton />}

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
          ) : entreprises && entreprises.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Aucune entreprise n'a publié de challenge récemment.
            </p>
          ) : (
            entreprises && (
              <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {entreprises.map((e) => (
                  <div
                    key={e.id}
                    className="w-48 shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-center transition hover:shadow-md"
                  >
                    <Link
                      href={`/profil-entreprise/${e.user_id}`}
                      className="mx-auto block w-fit"
                    >
                      <img
                        src={
                          e.user?.pp
                            ? `${apifile}/${e.user.pp}`
                            : "/assets/images/ppe.png"
                        }
                        alt={e.nom}
                        className="h-14 w-14 rounded-xl border-2 border-white object-cover shadow-md"
                      />
                    </Link>

                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="min-w-0 max-w-[130px]">
                        <ExpandableText
                          lines={1}
                          className="text-sm font-bold text-slate-900"
                        >
                          {e.nom}
                        </ExpandableText>
                      </div>
                      <CheckCircle2 className="h-4 w-4 shrink-0 fill-orange-700/10 text-orange-700" />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                      {e.nombre_challenges > 0 && (
                        <span className="rounded-full border border-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          {e.nombre_challenges} challenge
                          {e.nombre_challenges > 1 ? "s" : ""}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-400">
                        {e.point || 0} pts
                      </span>
                      <span className="rounded-lg border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                        {e.rang}
                      </span>
                    </div>

                    {e.dernier_challenge && (
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Dernier challenge : {e.dernier_challenge}
                      </p>
                    )}

                    <Link
                      href={`/profil-entreprise/${e.user_id}`}
                      className="mt-3 block rounded-xl bg-orange-700 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-800"
                    >
                      Voir l'entreprise
                    </Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
