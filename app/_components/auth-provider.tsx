"use client";

import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";

interface AuthContextValue {
  /** Usuario autenticado, o null si no hay sesión. */
  user: User | null;
  /** true mientras Firebase determina el estado inicial de la sesión. */
  loading: boolean;
  /** false si faltan las variables NEXT_PUBLIC_FIREBASE_*. */
  configured: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Se evalúa igual en servidor y cliente (variables inlineadas en build).
const CONFIGURED = isFirebaseConfigured();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Si Firebase no está configurado no hay nada que esperar.
  const [loading, setLoading] = useState<boolean>(CONFIGURED);

  useEffect(() => {
    if (!CONFIGURED) return;
    // Firebase se inicializa aquí, solo en el navegador.
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      setUser(current);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    if (!CONFIGURED) return;
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, configured: CONFIGURED, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return ctx;
}
