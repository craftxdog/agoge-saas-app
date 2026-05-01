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
- Al abrir el centro, las alertas se consideran vistas para el badge visual.
- La lista visible muestra solo notificaciones pendientes o nuevas.
- Cuando ya no hay pendientes, el panel muestra el mensaje:
  `No tienes notificaciones recientes.`
- Se mantuvo el acceso a la bandeja completa para historial persistente.

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

## Archivos tocados

- `src/components/site-header.tsx`
- `src/components/app-sidebar.tsx`
- `src/components/nav-main.tsx`
- `src/components/nav-user.tsx`
- `src/components/organisms/header-notification-center.tsx`
- `src/components/organisms/header-organization-switcher.tsx`
- `src/modules/dashboard/Dashboard.tsx`
- `src/modules/settings/pages/CompanySettingsPage.tsx`
- `src/modules/notifications/hooks/useNotifications.ts`
- `src/shared/store/notification.store.ts`

## Validacion

- `npm run build`
- `npm run lint`

Nota: `lint` mantiene una advertencia existente en `src/components/data-table.tsx`
por `useReactTable()` y React Compiler. No fue introducida por este refresh.
