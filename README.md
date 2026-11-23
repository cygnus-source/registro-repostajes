# Registro de Repostajes

Aplicación Next.js (App Router + TypeScript) para registrar repostajes de
vehículos: alta de repostajes (fecha, vehículo, litros, importe y km opcional)
y listado con el total acumulado. Autenticación con Firebase Authentication
(email/contraseña) y datos en Firestore. Pensada para desplegarse en Vercel.

## Rutas

- `/` — redirige a `/repostajes` si hay sesión o a `/login` si no.
- `/login` — inicio de sesión (y creación de cuenta) con email y contraseña.
- `/repostajes` — zona protegida: formulario de alta y listado del usuario
  con total acumulado de importe y litros.

## Configuración

### 1. Crear el proyecto de Firebase

1. Entra en la [consola de Firebase](https://console.firebase.google.com/) y
   crea un proyecto nuevo.
2. En **Configuración del proyecto → General → Tus apps**, añade una app
   **Web** (`</>`). Firebase mostrará un objeto `firebaseConfig`; sus valores
   son los que usarás en las variables de entorno.

### 2. Habilitar Email/Password

En **Authentication → Método de inicio de sesión**, habilita el proveedor
**Correo electrónico/contraseña**. Los usuarios pueden crearse desde la propia
app (opción "Crear cuenta" en `/login`) o desde la consola de Firebase.

Para producción, añade el dominio de Vercel en **Authentication →
Configuración → Dominios autorizados**.

### 3. Crear la base de datos Firestore

En **Firestore Database**, crea una base de datos (modo producción) en la
región que prefieras. La colección `repostajes` se crea automáticamente al
guardar el primer repostaje.

### 4. Variables de entorno en local

Copia el archivo de ejemplo y rellena los valores con los de `firebaseConfig`:

```bash
cp .env.local.example .env.local
```

| Variable                                   | Campo de `firebaseConfig` |
| ------------------------------------------ | ------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | `apiKey`                  |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `authDomain`              |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `projectId`               |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `storageBucket`           |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId`       |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | `appId`                   |

`.env.local` está en `.gitignore`: **nunca** lo subas al repositorio ni
escribas claves en el código.

### 5. Aplicar las reglas de seguridad de Firestore

El archivo [`firestore.rules`](./firestore.rules) solo permite a un usuario
autenticado leer, crear, modificar y borrar sus propios repostajes
(`uid == request.auth.uid`). Aplícalas de una de estas formas:

- **Consola:** Firestore Database → Reglas → pega el contenido del archivo y
  pulsa **Publicar**.
- **Firebase CLI:** con un `firebase.json` que apunte a `firestore.rules`,
  ejecuta `firebase deploy --only firestore:rules`.

### 6. Ejecutar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. En **Settings → Environment Variables**, define las mismas seis variables
   `NEXT_PUBLIC_FIREBASE_*` (para Production y Preview) con los valores de tu
   proyecto de Firebase.
3. Despliega (o vuelve a desplegar tras añadir las variables: las
   `NEXT_PUBLIC_*` se incrustan en tiempo de build).
4. La URL de producción debe ser pública: en **Settings → Deployment
   Protection**, desactiva Vercel Authentication para producción.
5. Añade el dominio de Vercel a los dominios autorizados de Firebase
   Authentication (ver paso 2).

## Estructura

- `lib/firebase.ts` — inicialización perezosa de Firebase (solo en el
  navegador) a partir de las variables de entorno; expone `getFirebaseAuth()`
  y `getDb()`.
- `lib/repostajes.ts` — validación, alta, suscripción en tiempo real, totales
  y formateo de repostajes.
- `lib/auth-errors.ts` — mensajes de error de Auth en español.
- `app/_components/` — `AuthProvider`/`useAuth`, guardia `RequireAuth` y
  pantallas de carga.
- `app/login/`, `app/repostajes/` — páginas de la app.
- `firestore.rules` — reglas de seguridad de Firestore.

## Scripts

- `npm run dev` — servidor de desarrollo.
- `npm run build` — build de producción.
- `npm run lint` — ESLint.
