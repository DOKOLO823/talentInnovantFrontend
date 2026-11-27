"use client";

// Fenêtre « Ajouter un projet » ET « Modifier le projet » (prop post).
// Au clic sur Envoyer elle SE FERME aussitôt : l'envoi continue en arrière-plan (toast de progression).

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Link2, Play, X } from "lucide-react";
import apifile from "@/app/lib/apifile";
import ModalShell from "./common/ModalShell";
import Avatar from "./common/Avatar";
import { LIMITS } from "../lib/Constants";
import { useCurrentUser } from "../lib/useCurrentUser";
import type { NewPostData } from "../lib/postsApi";
import type { Post } from "../lib/Types";

const ACCEPTED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const mb = (bytes: number) => bytes / (1024 * 1024);

export default function AddPostModal({
  open,
  onClose,
  onSubmit,
  post = null,
  zClass = "z-[760]",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewPostData) => void;
  post?: Post | null; // présent = mode modification
  zClass?: string;
}) {
  const me = useCurrentUser();
  const edit = !!post;
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [lien, setLien] = useState("");
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [retirer, setRetirer] = useState<number[]>([]);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Modification : préremplissage à chaque ouverture
  useEffect(() => {
    if (!open || !post) return;
    setTitre(post.titre);
    setDescription(post.description);
    setLien(post.lien ?? "");
    setFichiers([]);
    setRetirer([]);
    setFileError("");
    setFormError("");
  }, [open, post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const existants = (post?.fichiers ?? []).filter(
    (f) => !retirer.includes(f.id),
  );

  const previews = useMemo(
    () =>
      fichiers.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
        video: f.type.startsWith("video/"),
      })),
    [fichiers],
  );
  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews],
  );

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFileError("");
    const next = [...fichiers];

    for (const f of Array.from(list)) {
      if (!ACCEPTED.includes(f.type)) {
        setFileError(
          `« ${f.name} » : format non accepté (JPG, PNG, WEBP, GIF, MP4, WEBM, MOV).`,
        );
        continue;
      }
      const isVideo = f.type.startsWith("video/");
      const maxImageMb =
        f.type === "image/gif" ? LIMITS.maxImageMb : LIMITS.maxImageMb * 4;
      if (!isVideo && mb(f.size) > maxImageMb) {
        setFileError(`« ${f.name} » est trop lourde (max ${maxImageMb} Mo).`);
        continue;
      }
      if (isVideo && mb(f.size) > LIMITS.maxVideoMb) {
        setFileError(`« ${f.name} » dépasse ${LIMITS.maxVideoMb} Mo.`);
        continue;
      }
      if (existants.length + next.length >= LIMITS.maxFiles) {
        setFileError(`Maximum ${LIMITS.maxFiles} fichiers par projet.`);
        break;
      }
      next.push(f);
    }

    const total = next.reduce((s, f) => s + mb(f.size), 0);
    if (total > LIMITS.maxTotalMb * 1.5) {
      setFileError(
        `Poids total trop élevé (max ${LIMITS.maxTotalMb} Mo après compression).`,
      );
      return;
    }
    setFichiers(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const reset = () => {
    setTitre("");
    setDescription("");
    setLien("");
    setFichiers([]);
    setRetirer([]);
    setFileError("");
    setFormError("");
  };

  const submit = () => {
    if (!titre.trim()) return setFormError("Donnez un titre à votre projet.");
    if (!description.trim()) return setFormError("Décrivez votre projet.");

    let lienFinal = lien.trim();
    if (lienFinal && !/^https?:\/\//i.test(lienFinal))
      lienFinal = `https://${lienFinal}`;
    if (lienFinal && !/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(lienFinal)) {
      return setFormError("Le lien n'est pas valide.");
    }

    onSubmit({ titre, description, lien: lienFinal, fichiers, retirer });
    if (!edit) reset();
    onClose();
  };

  const changed =
    !edit ||
    titre.trim() !== post!.titre ||
    description.trim() !== post!.description ||
    lien.trim() !== (post!.lien ?? "") ||
    fichiers.length > 0 ||
    retirer.length > 0;
  const canSend =
    titre.trim().length > 0 && description.trim().length > 0 && changed;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={edit ? "Modifier le projet" : "Ajouter un projet"}
      panelClassName="sm:max-w-xl"
      zClass={zClass}
    >
      <div className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <Avatar pp={me?.pp} name={me?.name} size={44} />
          <div>
            <p className="font-bold text-slate-900">{me?.name || "Vous"}</p>
            <p className="text-xs text-slate-500">
              Visible par toute la communauté
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              maxLength={LIMITS.titre}
              placeholder="Titre du projet *"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold outline-none transition focus:border-orange-500 focus:bg-white"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {titre.length}/{LIMITS.titre}
            </p>
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={LIMITS.description}
              rows={5}
              placeholder="Décrivez votre projet : l'idée, l'avancement, ce que vous recherchez... *"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] outline-none transition focus:border-orange-500 focus:bg-white"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {description.length}/{LIMITS.description}
            </p>
          </div>

          <div className="relative">
            <Link2
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              maxLength={500}
              placeholder="Lien vers le projet (facultatif)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:bg-white"
            />
          </div>

          <div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-600 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700"
            >
              <ImagePlus size={20} /> Ajouter des photos ou des vidéos
              (facultatif)
            </button>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Jusqu'à {LIMITS.maxFiles} fichiers · vidéos : {LIMITS.maxVideoMb}{" "}
              Mo max.
            </p>
            {fileError && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {fileError}
              </p>
            )}

            {(existants.length > 0 || previews.length > 0) && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {/* Fichiers déjà publiés (modification) */}
                {existants.map((f) => (
                  <div
                    key={`old-${f.id}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-200"
                  >
                    {f.type === "video" ? (
                      <>
                        <video
                          src={`${apifile}/${f.chemin}#t=0.1`}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play
                            size={22}
                            className="text-white"
                            fill="currentColor"
                          />
                        </span>
                      </>
                    ) : (
                      <img
                        src={`${apifile}/${f.chemin}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      aria-label="Retirer"
                      onClick={() => setRetirer((r) => [...r, f.id])}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1 text-white transition hover:bg-black"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                {/* Nouveaux fichiers */}
                {previews.map((p, i) => (
                  <div
                    key={p.url}
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-200"
                  >
                    {p.video ? (
                      <>
                        <video
                          src={`${p.url}#t=0.1`}
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play
                            size={22}
                            className="text-white"
                            fill="currentColor"
                          />
                        </span>
                      </>
                    ) : (
                      <img
                        src={p.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      aria-label="Retirer"
                      onClick={() =>
                        setFichiers((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/65 p-1 text-white transition hover:bg-black"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <p className="text-sm font-medium text-red-600">{formError}</p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-3 border-t border-slate-100 bg-white px-5 py-4">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!canSend}
          className="flex-[2] rounded-xl bg-orange-700 py-3 text-sm font-bold text-white transition hover:bg-orange-800 active:scale-[0.98] disabled:opacity-50"
        >
          {edit ? "Enregistrer" : "Envoyer"}
        </button>
      </div>
    </ModalShell>
  );
}
