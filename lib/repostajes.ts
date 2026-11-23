import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "./firebase";

export const REPOSTAJES_COLLECTION = "repostajes";

/** Datos de un repostaje ya validados, listos para guardar. */
export interface RepostajeInput {
  /** Fecha en formato ISO `YYYY-MM-DD`. */
  fecha: string;
  vehiculo: string;
  litros: number;
  importe: number;
  km: number | null;
}

/** Repostaje tal y como se lee de Firestore. */
export interface Repostaje extends RepostajeInput {
  id: string;
  uid: string;
  createdAt: Timestamp | null;
}

/** Valores en crudo del formulario (todos texto). */
export interface RepostajeFormValues {
  fecha: string;
  vehiculo: string;
  litros: string;
  importe: string;
  km: string;
}

export type RepostajeFormErrors = Partial<Record<keyof RepostajeFormValues, string>>;

export type ValidationResult =
  | { ok: true; data: RepostajeInput }
  | { ok: false; errors: RepostajeFormErrors };

const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!FECHA_REGEX.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** Convierte texto a número aceptando coma o punto decimal. Devuelve NaN si no es válido. */
export function parseNumber(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "" || !/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}

/** Validación pura (sin Firebase) de los datos del formulario. */
export function validateRepostaje(values: RepostajeFormValues): ValidationResult {
  const errors: RepostajeFormErrors = {};

  const fecha = values.fecha.trim();
  if (!fecha) {
    errors.fecha = "La fecha es obligatoria.";
  } else if (!isValidIsoDate(fecha)) {
    errors.fecha = "La fecha no es válida.";
  }

  const vehiculo = values.vehiculo.trim();
  if (!vehiculo) {
    errors.vehiculo = "El vehículo es obligatorio.";
  } else if (vehiculo.length > 100) {
    errors.vehiculo = "El vehículo no puede superar los 100 caracteres.";
  }

  const litros = parseNumber(values.litros);
  if (values.litros.trim() === "") {
    errors.litros = "Los litros son obligatorios.";
  } else if (Number.isNaN(litros) || litros <= 0) {
    errors.litros = "Los litros deben ser un número mayor que 0.";
  }

  const importe = parseNumber(values.importe);
  if (values.importe.trim() === "") {
    errors.importe = "El importe es obligatorio.";
  } else if (Number.isNaN(importe) || importe <= 0) {
    errors.importe = "El importe debe ser un número mayor que 0.";
  }

  // Km: solo dígitos (sin signo, decimales ni separadores de miles), para que
  // "120.000" no se interprete como 120 ni "-0" se envíe como double.
  let km: number | null = null;
  const kmRaw = values.km.trim();
  if (kmRaw !== "") {
    if (!/^\d+$/.test(kmRaw)) {
      errors.km = "Los km deben ser un número entero mayor o igual que 0.";
    } else {
      const parsedKm = Number(kmRaw);
      if (!Number.isSafeInteger(parsedKm)) {
        // Fuera de rango, Firestore lo guardaría como double y la regla `km is int` lo rechazaría.
        errors.km = "Los km introducidos son demasiado grandes.";
      } else {
        km = parsedKm;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, data: { fecha, vehiculo, litros, importe, km } };
}

/** Guarda un repostaje del usuario indicado. */
export async function addRepostaje(uid: string, data: RepostajeInput): Promise<string> {
  const ref = await addDoc(collection(getDb(), REPOSTAJES_COLLECTION), {
    uid,
    fecha: data.fecha,
    vehiculo: data.vehiculo,
    litros: data.litros,
    importe: data.importe,
    km: data.km,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Ordena por fecha descendente y, a igual fecha, por creación descendente. */
export function sortRepostajes(items: Repostaje[]): Repostaje[] {
  // Los documentos aún sin createdAt (escritura pendiente) se consideran los más recientes.
  const createdMs = (r: Repostaje) =>
    r.createdAt ? r.createdAt.toMillis() : Number.MAX_SAFE_INTEGER;
  return [...items].sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return createdMs(b) - createdMs(a);
  });
}

/**
 * Se suscribe en tiempo real a los repostajes del usuario.
 * Solo se filtra por uid (sin orderBy) para no requerir un índice compuesto;
 * el orden se aplica en cliente.
 */
export function subscribeRepostajes(
  uid: string,
  onData: (items: Repostaje[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = query(collection(getDb(), REPOSTAJES_COLLECTION), where("uid", "==", uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const d = doc.data({ serverTimestamps: "estimate" });
        const item: Repostaje = {
          id: doc.id,
          uid: String(d.uid),
          fecha: String(d.fecha ?? ""),
          vehiculo: String(d.vehiculo ?? ""),
          litros: Number(d.litros ?? 0),
          importe: Number(d.importe ?? 0),
          km: typeof d.km === "number" ? d.km : null,
          createdAt: (d.createdAt as Timestamp | undefined) ?? null,
        };
        return item;
      });
      onData(sortRepostajes(items));
    },
    onError,
  );
}

export interface Totales {
  importe: number;
  litros: number;
}

export function calcularTotales(items: Pick<Repostaje, "importe" | "litros">[]): Totales {
  return items.reduce<Totales>(
    (acc, r) => ({ importe: acc.importe + r.importe, litros: acc.litros + r.litros }),
    { importe: 0, litros: 0 },
  );
}

const eurFormatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const litrosFormatter = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const kmFormatter = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const precioLitroFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export const formatEur = (n: number) => eurFormatter.format(n);
export const formatLitros = (n: number) => `${litrosFormatter.format(n)} L`;
export const formatKm = (n: number | null) =>
  n === null ? "—" : `${kmFormatter.format(n)} km`;
export const formatPrecioLitro = (importe: number, litros: number) =>
  litros > 0 ? `${precioLitroFormatter.format(importe / litros)}/L` : "—";

/** Formatea `YYYY-MM-DD` como `dd/mm/aaaa` sin pasar por zonas horarias. */
export function formatFecha(fecha: string): string {
  if (!FECHA_REGEX.test(fecha)) return fecha;
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

/** Fecha de hoy en formato `YYYY-MM-DD` según la hora local. */
export function todayIso(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}
