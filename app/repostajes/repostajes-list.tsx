"use client";

import { useEffect, useState } from "react";
import {
  calcularTotales,
  formatEur,
  formatFecha,
  formatKm,
  formatLitros,
  formatPrecioLitro,
  subscribeRepostajes,
  type Repostaje,
} from "@/lib/repostajes";

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: Repostaje[] };

export function RepostajesList({ uid }: { uid: string }) {
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    // Suscripción en tiempo real: los nuevos repostajes aparecen al guardarse.
    const unsubscribe = subscribeRepostajes(
      uid,
      (items) => setState({ status: "ready", items }),
      (err) => {
        console.error(err);
        setState({
          status: "error",
          message: "No se han podido cargar los repostajes. Recarga la página.",
        });
      },
    );
    return unsubscribe;
  }, [uid]);

  const items = state.status === "ready" ? state.items : [];
  const totales = calcularTotales(items);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-base font-semibold">Mis repostajes</h2>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Total acumulado</dt>
            <dd className="text-xl font-semibold" data-testid="total-importe">
              {formatEur(totales.importe)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Total litros</dt>
            <dd className="text-xl font-semibold" data-testid="total-litros">
              {formatLitros(totales.litros)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4">
        {state.status === "loading" && (
          <p className="text-sm text-zinc-500" role="status">
            Cargando repostajes…
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </p>
        )}
        {state.status === "ready" && items.length === 0 && (
          <p className="text-sm text-zinc-500">Todavía no has registrado ningún repostaje.</p>
        )}
        {state.status === "ready" && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 font-medium">Vehículo</th>
                  <th className="py-2 pr-4 text-right font-medium">Litros</th>
                  <th className="py-2 pr-4 text-right font-medium">Importe</th>
                  <th className="py-2 pr-4 text-right font-medium">€/L</th>
                  <th className="py-2 text-right font-medium">Km</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{formatFecha(r.fecha)}</td>
                    <td className="py-2 pr-4">{r.vehiculo}</td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      {formatLitros(r.litros)}
                    </td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap">
                      {formatEur(r.importe)}
                    </td>
                    <td className="py-2 pr-4 text-right whitespace-nowrap text-zinc-500">
                      {formatPrecioLitro(r.importe, r.litros)}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">{formatKm(r.km)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
