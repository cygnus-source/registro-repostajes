"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { ConfigMissing, LoadingScreen } from "./loading-screen";

/**
 * Protege su contenido: mientras se resuelve la sesión muestra un estado de
 * carga; si no hay usuario redirige a /login. El contenido protegido nunca se
 * renderiza sin usuario, así que no hay parpadeo.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) {
      router.replace("/login");
    }
  }, [configured, loading, user, router]);

  if (!configured) return <ConfigMissing />;
  if (loading) return <LoadingScreen />;
  if (!user) return <LoadingScreen message="Redirigiendo al login…" />;
  return <>{children}</>;
}
