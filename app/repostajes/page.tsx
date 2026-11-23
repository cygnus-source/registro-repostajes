"use client";

import { useAuth } from "../_components/auth-provider";
import { RepostajeForm } from "./repostaje-form";
import { RepostajesList } from "./repostajes-list";

export default function RepostajesPage() {
  const { user, logout } = useAuth();

  // RequireAuth (layout) garantiza que aquí siempre hay usuario.
  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <h1 className="text-lg font-semibold">Registro de Repostajes</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-zinc-500 sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium hover:bg-zinc-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        {/* key: el formulario de un usuario nunca se reutiliza para otro */}
        <RepostajeForm key={`form-${user.uid}`} uid={user.uid} />
        {/* key: si cambia el usuario se reinicia la suscripción y su estado */}
        <RepostajesList key={user.uid} uid={user.uid} />
      </main>
    </div>
  );
}
