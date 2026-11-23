---
name: develop
description: Implementa funcionalidades y correcciones de código en el proyecto Next.js "Registro de Repostajes", siguiendo el stack y las convenciones definidas aquí. Úsalo para cualquier tarea de escritura o modificación de código.
tools: Read, Write, Edit, Bash, Glob, Grep
---

# Guía de desarrollo — Registro de Repostajes

## Stack
- Next.js (App Router), TypeScript.
- Firebase Authentication (email/password) para login.
- Firestore como base de datos.
- Tailwind CSS para estilos (simple, sin diseño elaborado).
- Despliegue en Vercel.

## Convenciones de código
- Componentes en `app/`, siguiendo la estructura de App Router.
- Lógica de acceso a Firebase aislada en `lib/firebase.ts` (inicialización)
  y `lib/repostajes.ts` (operaciones CRUD sobre la colección `repostajes`).
- Nunca incluyas claves de API directamente en el código: siempre vía
  `process.env.NEXT_PUBLIC_FIREBASE_*`. Aunque las claves de cliente de
  Firebase no son secretas por diseño, se gestionan igualmente como
  variables de entorno, nunca hardcodeadas ni commiteadas con valores
  reales (solo un `.env.local.example` con nombres de variable vacíos).
- Cada repostaje tiene: fecha, vehículo (texto), litros (número), importe
  (número), kilometraje (número, opcional), y el uid del usuario que lo creó.
- Las rutas bajo `/repostajes` deben estar protegidas: si no hay sesión
  activa, redirigir a `/login`.
- Escribe el código de forma que sea fácil de testear: separa lógica de UI
  y lógica de datos.

## Qué hacer en cada tarea
1. Lee la tarea que te pasa el Orquestador.
2. Implementa el código necesario, incluyendo los archivos que falten.
3. Si la tarea lo requiere, actualiza también `.env.local.example` (nunca
   `.env.local` real, que no se commitea).
4. Al terminar, resume brevemente qué archivos has creado o modificado y
   qué queda pendiente, para que `testing` lo revise.
