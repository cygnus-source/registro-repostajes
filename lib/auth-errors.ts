/** Traduce los códigos de error de Firebase Auth a mensajes legibles en español. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-login-credentials": "Email o contraseña incorrectos.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/invalid-email": "El email no tiene un formato válido.",
  "auth/missing-email": "Introduce tu email.",
  "auth/missing-password": "Introduce tu contraseña.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/too-many-requests":
    "Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.",
  "auth/network-request-failed":
    "Error de red. Comprueba tu conexión e inténtalo de nuevo.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/operation-not-allowed":
    "El acceso con email y contraseña no está habilitado en Firebase.",
  "auth/invalid-api-key":
    "La configuración de Firebase no es válida. Revisa las variables de entorno.",
};

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  return (
    MESSAGES[code] ?? "No se ha podido completar la operación. Inténtalo de nuevo."
  );
}
