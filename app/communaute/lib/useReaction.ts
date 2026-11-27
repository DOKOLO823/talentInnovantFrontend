"use client";

import { useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import { apiErrorMessage } from "./notify";
import { useRequireAuth } from "./useRequireAuth";
import type { ReactionState } from "./Types";
import type { ReactionType } from "./Constants";

/** Réaction avec mise à jour immédiate, puis alignement sur la réponse réelle du serveur (retour arrière si échec). */
export function useReaction(
  state: ReactionState,
  onChange: (next: ReactionState) => void,
  endpoint: string,
) {
  const { requireAuth } = useRequireAuth();
  const stateRef = useRef(state);
  stateRef.current = state;
  const busy = useRef(false);

  const react = useCallback(
    async (type: ReactionType) => {
      if (!requireAuth("Connectez-vous pour réagir.")) return;
      if (busy.current) return;
      busy.current = true;

      const prev = stateRef.current;
      const retrait = prev.ma_reaction === type;
      onChange({
        ...prev,
        ma_reaction: retrait ? null : type,
        reactions_count: prev.reactions_count + (retrait ? -1 : prev.ma_reaction ? 0 : 1),
      });

      try {
        const res = await apiFetch(endpoint, { method: "POST", body: JSON.stringify({ type }) });
        if (res?.statut !== 200) throw res;
        onChange({
          ma_reaction: res.ma_reaction,
          reactions_count: res.reactions_count,
          reactions_resume: res.reactions_resume,
        });
        toast.success(
          res.ma_reaction === null ? "Réaction retirée." : prev.ma_reaction ? "Réaction modifiée." : "Réaction ajoutée.",
          { id: "reaction", duration: 1800 },
        );
      } catch (e) {
        onChange(prev);
        toast.error(apiErrorMessage(e, "Votre réaction n'a pas pu être enregistrée."), { id: "reaction" });
      } finally {
        busy.current = false;
      }
    },
    [endpoint, onChange, requireAuth],
  );

  return { react };
}