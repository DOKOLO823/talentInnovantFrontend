"use client";

import { useCallback, useEffect, useState } from "react";
import { promptLogin } from "./notify";

/** Même source que apiFetch : le jeton dans localStorage("auth") */
export function useRequireAuth() {
  const [isAuth, setIsAuth] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setIsAuth(!!JSON.parse(localStorage.getItem("auth") || "null")?.token);
    } catch {
      setIsAuth(false);
    }
    setReady(true);
  }, []);

  /** true si connecté ; sinon affiche l'invitation à se connecter et retourne false */
  const requireAuth = useCallback(
    (message?: string) => {
      if (isAuth) return true;
      promptLogin(message);
      return false;
    },
    [isAuth],
  );

  return { isAuth, ready, requireAuth };
}