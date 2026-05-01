# Frontend SaaS Refresh

Fecha: 2026-04-30

## Objetivo

Elevar la experiencia de `navbar`, `centro de notificaciones` y `dashboard`
hacia una UI mas limpia, compacta y orientada a decisiones de negocio.

## Cambios principales

### Navegacion

- El `header` se simplifico para funcionar como barra de trabajo compacta.
- Se elimino la duplicacion visual entre sidebar y header.
- El selector de organizacion se redujo a un control compacto y responsivo.
- El sidebar ahora usa menos ancho visual, menos padding y menos altura por item.

### Centro de notificaciones

- El icono ahora muestra solo pendientes reales.
- Abrir la campana ya no limpia ni oculta las novedades por si solo.
- La lista visible muestra solo notificaciones pendientes o nuevas.
- Cuando ya no hay pendientes, el panel muestra el mensaje:
  `No tienes notificaciones recientes.`
- Se mantuvo el acceso a la bandeja completa para historial persistente.
- En portal cliente se agrego un fallback basado en `billing/payments` para que
  el usuario vea actividad de cobros aunque el socket no este activo.
- El parser realtime de billing ahora acepta `member.id` y `memberId` para ser
  mas tolerante con el payload emitido por backend.

### Cobros

- La fecha de vencimiento ahora usa un campo mas guiado con popover tipo
  shadcn y acciones rapidas.
- El calendario soporta `Limpiar` sin romper la pagina cuando la fecha queda
  vacia temporalmente.
- `periodMonth` y `periodYear` se sincronizan automaticamente desde la fecha.
- La seleccion de miembro paso de `select` plano a una busqueda guiada con
  confirmacion visual del cliente seleccionado.
- El miembro seleccionado se conserva visualmente aunque la lista filtrada ya
  no lo devuelva, evitando el falso mensaje de "No encontramos miembros".
- Se agrego busqueda local en la lista de cobros.
- Se agrego un flujo de `anular cobro` para errores operativos:
  - no borra el registro
  - lo deja `CANCELLED`
  - preserva trazabilidad
- El frontend reconoce permisos finos futuros como `billing.cancel` y
  `billing.override`, aunque hoy el control principal sigue siendo
  `billing.write`.

### Dashboard

- El dashboard administrativo ahora prioriza:
  - caja y cobranza
  - riesgo operativo
  - actividad reciente
  - accesos rapidos
- El dashboard de cliente ahora prioriza:
  - cobros pendientes
  - vencimientos
  - agenda visible
  - autoservicio

## Sobre "tiempo real"

Antes se mostraba el estado tecnico de realtime en la UI. Ese dato venia del
socket de la app y depende de la configuracion `VITE_SOCKET_ENABLED`.

Decidimos quitar ese mensaje del navbar porque:

- no es informacion primaria para el usuario
- genera ruido cuando la persona necesita contexto de negocio
- debe vivir como estado tecnico, no como mensaje principal de navegacion

El tiempo real sigue siendo util para sincronizar:

- nuevas notificaciones
- cambios de cobros
- eventos operativos
- invalidaciones de queries activas

### Nota importante

El repositorio documenta `VITE_SOCKET_ENABLED=false` por defecto en `README.md`.
Si esa variable no se activa, el socket no se conecta y las notificaciones live
no van a entrar por realtime aunque el frontend ya soporte ese flujo.

## Archivos tocados

- `src/components/site-header.tsx`
- `src/components/app-sidebar.tsx`
- `src/components/nav-main.tsx`
- `src/components/nav-user.tsx`
- `src/components/organisms/header-notification-center.tsx`
- `src/components/organisms/header-organization-switcher.tsx`
- `src/modules/billing/components/BillingDateField.tsx`
- `src/modules/billing/components/MemberLookupField.tsx`
- `src/modules/billing/pages/BillingPage.tsx`
- `src/modules/dashboard/Dashboard.tsx`
- `src/modules/settings/pages/CompanySettingsPage.tsx`
- `src/modules/notifications/hooks/useNotifications.ts`
- `src/shared/store/notification.store.ts`

## Validacion

- `npm run build`
- `npm run lint`

Nota: `lint` mantiene una advertencia existente en `src/components/data-table.tsx`
por `useReactTable()` y React Compiler. No fue introducida por este refresh.
