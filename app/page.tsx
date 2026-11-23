"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./_components/auth-provider";
import { ConfigMissing, LoadingScreen } from "./_components/loading-screen";

/** Página raíz: redirige a /repostajes si hay sesión o a /login si no. */
export default function Home() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading) return;
    router.replace(user ? "/repostajes" : "/login");
  }, [configured, loading, user, router]);

  if (!configured) return <ConfigMissing />;
  return <LoadingScreen message="Redirigiendo…" />;
}
