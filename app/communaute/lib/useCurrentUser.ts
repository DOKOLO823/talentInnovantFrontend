"use client";

// Emplacement : app/communaute/lib/useCurrentUser.ts
import { useEffect, useState } from "react";

export interface CurrentUser {
  id: number;
  pp: string | null;
  statut: string | null;
  name: string;
}

/** Utilisateur connecté, lu dans le localStorage (même source que la navbar) */
export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      const u = raw ? JSON.parse(raw)?.user : null;
      if (u) {
        setUser({
          id: u.id,
          pp: u.pp ?? null,
          statut: u.statut ?? null,
          name: u.talent?.nom ?? u.name ?? "",
        });
      }
    } catch {}
  }, []);

  return user;
}