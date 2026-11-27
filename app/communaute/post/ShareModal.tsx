"use client";

// Partage : WhatsApp, Facebook, copie du lien. Le partage n'est compté que pour un utilisateur connecté,
// une seule fois par projet (décision du serveur).

import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import ModalShell from "../components//common/ModalShell";
import {
  CopyLinkIcon,
  FacebookIcon,
  WhatsAppIcon,
} from "../components/common/BrandIcons";
import { postUrl } from "../lib/Constants";
import { apiErrorMessage } from "../lib/notify";
import { useRequireAuth } from "../lib/useRequireAuth";

export default function ShareModal({
  open,
  onClose,
  postId,
  onShared,
}: {
  open: boolean;
  onClose: () => void;
  postId: number;
  onShared: (count: number) => void; // nouveau total renvoyé par le serveur
}) {
  const { isAuth } = useRequireAuth();
  const [message, setMessage] = useState("");

  const registerShare = async (silent: boolean) => {
    if (!isAuth) return; // un invité peut partager le lien mais ne génère aucun compteur
    try {
      const res = await apiFetch(`/communaute/posts/${postId}/partage`, {
        method: "POST",
      });
      if (res?.statut !== 200) throw res;
      onShared(res.partages_count);
      if (!silent) {
        toast.success(
          res.nouveau
            ? "Publication partagée."
            : "Vous avez déjà partagé cette publication.",
          { id: "share" },
        );
      }
    } catch (e) {
      toast.error(
        apiErrorMessage(e, "Le partage n'a pas pu être enregistré."),
        { id: "share" },
      );
    }
  };

  const share = (target: "whatsapp" | "facebook" | "copy") => {
    const url = postUrl(postId); // URL de la page de détail
    const text = message.trim();

    if (target === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(text ? `${text}\n\n${url}` : url)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else if (target === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}${
          text ? `&quote=${encodeURIComponent(text)}` : ""
        }`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      navigator.clipboard
        ?.writeText(url)
        .then(() => toast.success("Lien copié !"))
        .catch(() => toast.error("Impossible de copier le lien."));
    }

    registerShare(target === "copy");
    if (target !== "copy") onClose();
  };

  const options = [
    { key: "whatsapp", label: "WhatsApp", icon: <WhatsAppIcon /> },
    { key: "facebook", label: "Facebook", icon: <FacebookIcon /> },
    { key: "copy", label: "Copier le lien", icon: <CopyLinkIcon /> },
  ] as const;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Partager ce projet"
      panelClassName="sm:max-w-md"
      zClass="z-[820]"
    >
      <div className="p-5">
        <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Message (facultatif)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Ajoutez un mot à votre partage..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
        />

        <div className="mt-6 grid grid-cols-3 gap-3">
          {options.map((o) => (
            <button
              key={o.key}
              onClick={() => share(o.key)}
              className="group flex flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-slate-50"
            >
              <span className="transition-transform group-hover:scale-105 group-active:scale-95">
                {o.icon}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {o.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}
