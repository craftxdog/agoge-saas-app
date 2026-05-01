# System Integration Audit

Fecha: 2026-05-01

## Hallazgo principal

El modulo de `notifications` ya existe en frontend:

- ruta protegida en `/app/notifications`
- pagina administrativa completa
- dropdown de centro de actividad en header
- hooks de summary, listado y marcado como leido
- contratos HTTP para inbox persistente
- soporte realtime para invalidacion y toast

El problema no era ausencia total del modulo sino un acople incompleto entre
`settings/modules` y la sesion activa del usuario.

## Bug corregido hoy

Cuando un admin activaba o desactivaba modulos del tenant desde configuracion,
la UI de settings se actualizaba, pero `enabledModules` en `auth.store` podia
quedar stale hasta cambiar de organizacion o volver a iniciar sesion.

Impacto:

- el sidebar podia no reflejar modulos nuevos inmediatamente
- `ProtectedRoute` podia seguir bloqueando rutas aunque el modulo ya estuviera
  activo en backend
- casos como `notifications` se percibian como "no integrados"

Correccion aplicada:

- `useOrganizationModules()` ahora sincroniza `enabledModules` hacia la sesion
  activa
- `useUpdateOrganizationModule()` actualiza el cache y la sesion local al
  mutar un modulo

## Estado actual de notifications

Frontend:

- Admin / tenant:
  - inbox persistente en `/app/notifications`
  - campana con badge y centro de actividad
  - marcado individual y masivo como leido
- Cliente:
  - centro de actividad en header
  - fallback por cobros y realtime
  - no tiene una pagina completa de inbox dedicada

## Contrato API que el frontend ya espera

HTTP:

- `GET /notifications/summary`
- `GET /notifications`
- `PATCH /notifications/:notificationId/read`
- `PATCH /notifications/read-all`

Sesion / auth:

- `activeMembership.enabledModules`
- `activeMembership.permissions`

Realtime:

- evento `realtime.event`
- invalidaciones para:
  - `notifications.summary`
  - `notifications.inbox`
  - `billing.*`
  - `schedules.*`

## Gaps que aun dependen de backend

- generar notificaciones persistentes cuando se crea o actualiza un cobro
- emitir eventos socket al tenant y al miembro correcto
- definir si cliente tendra inbox propio persistente o solo centro de actividad
- asegurar que el `switchOrganization` y `me` devuelvan siempre `enabledModules`
  actualizados

## Conclusion honesta

En este workspace si puedo completar y endurecer el frontend, contratos,
guards, estados locales y UX. Pero la implementacion real de la API no esta en
este repositorio, asi que no puedo modificar aqui los handlers backend,
webhooks o emisiones socket del servidor.

Si me compartes el repo de la API, el siguiente paso correcto es implementar el
flujo end-to-end de notifications desde billing hasta inbox persistente y
realtime.
