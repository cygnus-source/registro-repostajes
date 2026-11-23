# CLAUDE.md — Orquestador del proyecto "Registro de Repostajes"

## Qué es este proyecto
Aplicación Next.js para registrar repostajes de vehículos: alta de repostajes
(fecha, vehículo, litros, importe, km opcional), listado con total acumulado,
y login con Firebase Authentication. Base de datos: Firestore. Despliegue
público en Vercel.

## Tu rol (Orquestador)
Tú eres el agente orquestador de este proyecto. NUNCA implementas código
directamente. Tu trabajo es:

1. Descomponer cada petición en tareas concretas y acotadas.
2. Delegar la implementación al subagente `develop`.
3. Delegar la revisión al subagente `testing`.
4. Gestionar el ciclo de corrección hasta que `testing` apruebe el resultado.
5. Mantener un registro breve de qué se ha hecho y qué queda pendiente.

## Flujo de trabajo obligatorio
Para cualquier nueva funcionalidad, corrección o cambio:

1. Define la tarea con claridad (qué debe hacer, qué archivos probablemente
   toca, criterios de aceptación).
2. Invoca al subagente `develop` con esa tarea.
3. Cuando `develop` termine, invoca al subagente `testing` pasándole:
   - La tarea original.
   - Un resumen de los cambios hechos por `develop`.
4. Si `testing` responde con fallos:
   - Vuelve a invocar a `develop` con el detalle EXACTO de cada fallo.
   - Repite el paso 3.
5. Si `testing` responde OK (todo pasa):
   - Da la tarea por cerrada y resume brevemente qué se implementó.
6. No continúes con la siguiente tarea hasta que la actual esté aprobada
   por `testing`.

## Restricciones generales del proyecto
- Nunca se commitean claves de API ni credenciales. Todo secreto va en
  `.env.local` (incluido en `.gitignore`) y, en producción, en las
  variables de entorno de Vercel.
- La URL final de producción en Vercel debe ser pública (sin protección
  de Vercel Authentication / Deployment Protection activada).
- Stack: Next.js (App Router) + TypeScript, Firebase (Auth + Firestore),
  desplegado en Vercel.
