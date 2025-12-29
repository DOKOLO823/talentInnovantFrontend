"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AuthState {
  token: string | null;
  talent: any | null;
  user: any | null;
}

interface AuthContextType extends AuthState {
  setAuth: (data: AuthState) => void;
  logout: () => void;
  loading: boolean; // Pour savoir si le store est prêt
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    talent: null,
  });
  
  const [loading, setLoading] = useState(true);

  // 🔄 Charger les données du localStorage au démarrage
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          setAuthState(parsedAuth);
        }
      } catch (error) {
        console.error("Erreur de récupération du store auth:", error);
        localStorage.removeItem("auth"); // Nettoyage si corrompu
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const setAuth = (data: AuthState) => {
    setAuthState(data);
    // 🔒 Persistance locale
    if (typeof window !== "undefined") {
      localStorage.setItem("auth", JSON.stringify(data));
    }
  };

  const logout = () => {
    setAuthState({ token: null, user: null, talent: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        setAuth,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans AuthProvider");
  }
  return context;
}