"use client";

import { useLayoutEffect, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from "react";
import {
  addRepostaje,
  todayIso,
  validateRepostaje,
  type RepostajeFormErrors,
  type RepostajeFormValues,
} from "@/lib/repostajes";

const emptyValues = (): RepostajeFormValues => ({
  fecha: todayIso(),
  vehiculo: "",
  litros: "",
  importe: "",
  km: "",
});

const inputClass =
  "mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:border-zinc-500";

export function RepostajeForm({ uid }: { uid: string }) {
  const [values, setValues] = useState<RepostajeFormValues>(emptyValues);
  const [errors, setErrors] = useState<RepostajeFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Si la ruta se oculta al navegar (Activity con cacheComponents), no conservar
  // mensajes de resultado obsoletos al volver.
  useLayoutEffect(() => {
    return () => {
      setSuccess(false);
      setSubmitError(null);
    };
  }, []);

  const handleChange =
    (field: keyof RepostajeFormValues) => (e: ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setErrors((errs) => ({ ...errs, [field]: undefined }));
      setSuccess(false);
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    const result = validateRepostaje(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await addRepostaje(uid, result.data);
      setValues(emptyValues());
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setSubmitError("No se ha podido guardar el repostaje. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    name: keyof RepostajeFormValues,
    label: string,
    props: InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={values[name]}
        onChange={handleChange(name)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={`${inputClass} ${errors[name] ? "border-red-400" : "border-zinc-300"}`}
        {...props}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold">Nuevo repostaje</h2>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {field("fecha", "Fecha", { type: "date", required: true })}
          {field("vehiculo", "Vehículo", {
            type: "text",
            required: true,
            maxLength: 100,
            placeholder: "Ej.: Seat Ibiza",
          })}
          {field("litros", "Litros", {
            type: "text",
            inputMode: "decimal",
            required: true,
            placeholder: "Ej.: 42,5",
          })}
          {field("importe", "Importe (€)", {
            type: "text",
            inputMode: "decimal",
            required: true,
            placeholder: "Ej.: 65,30",
          })}
          {field("km", "Km (opcional)", {
            type: "text",
            inputMode: "numeric",
            placeholder: "Ej.: 120500",
          })}
        </div>

        {submitError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </p>
        )}
        {success && (
          <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Repostaje guardado.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar repostaje"}
        </button>
      </form>
    </section>
  );
}
