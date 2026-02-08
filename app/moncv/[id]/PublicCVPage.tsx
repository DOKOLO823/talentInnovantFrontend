"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Lock,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function PublicCVPage() {
  const { id } = useParams();
  const [cv, setCv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Récupération de l'utilisateur connecté pour tester les restrictions
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setCurrentUser(JSON.parse(storedAuth).user);
    }

    const fetchCv = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/cv/details/${id}`, { method: "GET" });
        if (res?.statut === 200) {
          setCv(res.cv);
        } else {
          setError(res?.message || "Impossible de charger le CV");
        }
      } catch (err) {
        setError(
          "Une erreur est survenue lors de la récupération du document.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCv();
  }, [id]);

  // LOGIQUE DE RESTRICTION DE VISIBILITÉ
  const checkVisibility = () => {
    if (!cv) return false;

    const isOwner = currentUser?.id === cv.talent?.user_id;
    const isEntreprise = currentUser?.statut === "entreprise";

    if (isOwner) return true; // Le propriétaire voit toujours
    if (cv.visibilite === "monde") return true; // Public
    if (cv.visibilite === "entreprise" && isEntreprise) return true; // Entreprise autorisée

    return false; // Par défaut : restreint
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-700 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">
          Chargement du CV...
        </p>
      </div>
    );
  }

  // AFFICHAGE SI ERREUR OU ACCÈS REFUSÉ
  if (error || !cv || !checkVisibility()) {
    const isRestricted = cv && !checkVisibility();
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white p-6 text-center">
        <div
          className={`p-6 rounded-full mb-6 ${isRestricted ? "bg-orange-50" : "bg-red-50"}`}
        >
          {isRestricted ? (
            <Lock className="text-orange-600" size={48} />
          ) : (
            <AlertCircle className="text-red-500" size={48} />
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {isRestricted ? "Accès restreint" : "CV inaccessible"}
        </h1>
        <p className="text-slate-500 max-w-md mb-8">
          {isRestricted
            ? `Ce CV est configuré en mode "${cv.visibilite}". Vous n'avez pas les autorisations nécessaires pour le consulter.`
            : error || "Ce CV n'est pas disponible actuellement."}
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition shadow-lg"
          >
            Retour à l'accueil
          </Link>
          {isRestricted && !currentUser && (
            <Link href="/login" className="text-orange-700 font-bold text-sm">
              Connectez-vous pour vérifier vos accès
            </Link>
          )}
        </div>
      </div>
    );
  }

  const talentName = cv.talent?.nom || cv.talent?.user?.name || "TALENT";

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col overflow-hidden">
      {/* BARRE D'OUTILS */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-50 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() =>
              (window.location.href = "/profil-talent/" + cv?.talent?.user_id)
            }
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            title="Retour"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col min-w-0">
            <h1 className="text-slate-900 font-black text-sm md:text-base uppercase tracking-tight line-clamp-1">
              CV DE {talentName}
            </h1>
            <div className="flex items-center gap-3">
              {/* Badge de visibilité indicatif */}
              <span className="hidden md:flex items-center gap-1 text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">
                {cv.visibilite === "entreprise" ? (
                  <Building2 size={10} />
                ) : null}
                Accès {cv.visibilite}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ZONE D'AFFICHAGE */}
      <main className="flex-1 w-full bg-slate-100 relative flex justify-center overflow-hidden z-40">
        <iframe
          src={`${apifile}/${cv.lien}#toolbar=1&view=FitH`}
          className="w-full h-auto border-none z-40"
          title={`CV DE ${talentName}`}
        />
      </main>

      {/* FILIGRANE MODIFIÉ AVEC Z-INDEX */}
      {/* <a 
          href="https://talentinnovant.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative bottom-3 flex flex-row items-center w-full gap-2 group cursor-pointer select-none z-50"
        >
          <div className="flex flex-col items-center w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] group-hover:text-orange-700 transition-colors">Propulsé par</span>
            <span className="text-lg font-black text-slate-300 flex items-center italic tracking-tighter group-hover:text-slate-400 transition-colors">
              talentinnovant<span className="text-orange-500/50 group-hover:text-orange-500">.com</span>
               &nbsp;&nbsp;<ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
            </span>
          </div>
         
        </a> */}

      <style jsx global>{`
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
