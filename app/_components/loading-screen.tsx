export function LoadingScreen({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8" role="status" aria-live="polite">
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}

export function ConfigMissing() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Firebase no está configurado</p>
        <p className="mt-1">
          Define las variables <code>NEXT_PUBLIC_FIREBASE_*</code> en <code>.env.local</code>{" "}
          (local) o en las variables de entorno de Vercel. Consulta el README.
        </p>
      </div>
    </div>
  );
}
