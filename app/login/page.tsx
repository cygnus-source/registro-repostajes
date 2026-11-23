"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "../_components/auth-provider";
import { ConfigMissing, LoadingScreen } from "../_components/loading-screen";

type Mode = "login" | "registro";

/**
 * Con `cacheComponents`, Next.js no desmonta las páginas al navegar: las
 * oculta con <Activity> y conserva su estado. Por eso el estado del formulario
 * NO vive en la página (que se conserva entre login → /repostajes → logout →
 * /login), sino en <LoginForm>, que solo se monta cuando no hay sesión. Al
 * iniciar sesión se desmonta y, tras cerrar sesión, se vuelve a montar limpio.
 */
export default function LoginPage() {
  const { user, loading, configured } = useAuth();
  const router = useRouter();

  // Si ya hay sesión (o se acaba de iniciar), ir a /repostajes.
  useEffect(() => {
    if (!loading && user) {
      router.replace("/repostajes");
    }
  }, [loading, user, router]);

  if (!configured) return <ConfigMissing />;
  if (loading || user) return <LoadingScreen />;
  return <LoginForm />;
}

function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si la página se oculta (navegación a otra ruta sin desmontar), no conservar
  // la contraseña ni un envío/errores en curso.
  useLayoutEffect(() => {
    return () => {
      setPassword("");
      setError(null);
      setSubmitting(false);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Introduce tu email y tu contraseña.");
      return;
    }

    setSubmitting(true);
    try {
      const auth = getFirebaseAuth();
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      }
      // La redirección la hace LoginPage al actualizarse `user`.
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      // Nunca depender de la redirección/desmontaje para salir de "Entrando…".
      setSubmitting(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Registro de Repostajes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {isLogin ? "Inicia sesión para continuar." : "Crea una cuenta nueva."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            {submitting
              ? isLogin
                ? "Entrando…"
                : "Creando cuenta…"
              : isLogin
                ? "Iniciar sesión"
                : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? "registro" : "login");
              setError(null);
            }}
            className="font-medium text-zinc-900 underline"
          >
            {isLogin ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </main>
  );
}
