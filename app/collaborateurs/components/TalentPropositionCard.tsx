import { apiFetch } from "@/app/lib/api";
import apifile from "@/app/lib/apifile";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";
import domaines from "@/domaines.json";
import Link from "next/link";

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
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);

  const isEnAttente = relations?.envoyees?.includes(talent.id);
  const isRecu = relations?.recues?.includes(talent.id);
  const isActif = relations?.actives?.includes(talent.id);

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
