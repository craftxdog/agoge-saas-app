# RBAC Navigation And Self-Service Flow

Fecha: 2026-05-05

## Objetivo

Eliminar reglas hardcodeadas del frontend para decidir que ve un usuario
customer o self-service, y mover esa gobernanza al contrato real de la API:

- `enabledModules`
- `permissions`
- `accessScope`
- `GET /rbac/navigation`

## Cambio aplicado

El frontend ya no depende de una lista fija tipo "customer solo puede ver
billing y schedules".

Ahora la UI sigue este orden:

1. El backend autentica la sesion tenant-scoped.
2. La sesion entrega modulos habilitados y permisos.
3. El backend expone la navegacion efectiva en `rbac/navigation`.
4. El sidebar, dashboard y rutas usan esa navegacion para pintar solo pantallas
   autorizadas.
5. Si el permiso es `tenant`, la vista consume endpoints operativos del tenant.
6. Si el permiso es `self`, la vista consume endpoints personales del miembro.

## Superficies separadas

### Tenant / operacion

- `notifications.read` -> `/app/notifications`
- `billing.read` -> `/app/billing/payments`
- `schedules.read` -> `/app/schedules/business-hours`
- `analytics.read` -> `/app/analytics/dashboard`

### Self-service / personal

- `notifications.self.read` -> `/app/activity`
- `billing.self.read` -> `/app/billing/me/payments`
- `schedules.self.read` -> `/app/schedules/me/availability`
- `analytics.self.read` -> `/app/analytics/me/dashboard`

## Flujo recomendado para admin

El admin no deberia "convertir" manualmente a un customer con permisos tenant.
Lo profesional es asignar permisos segun alcance:

- Si quiere que una persona vea datos de toda la organizacion:
  - usar permisos `tenant`
- Si quiere que vea solo su propia cuenta:
  - usar permisos `self`

Ejemplos:

- `billing.read`: ve cobros de todo el tenant
- `billing.self.read`: ve solo sus propios cobros
- `notifications.read`: usa inbox compartido del tenant
- `notifications.self.read`: usa actividad personal

## Resultado UX

- La campana del admin sigue leyendo `/notifications`
- La campana del cliente/self-service lee `/activity`
- El dashboard toma accesos rapidos desde `rbac/navigation`
- Las vistas de cliente ya no intentan cargar pantallas de sedes, inbox
  compartido ni analytics del tenant

## Notas pendientes de producto

Hay ideas de negocio que siguen siendo roadmap y requieren API adicional:

- solicitud de horarios por parte del cliente con aprobacion admin
- capacidad maxima del local por organizacion o por sede
- control de maquinas/aforo por bloque horario
- modulo contable

Esos flujos no deben resolverse con reglas hardcodeadas en frontend. Deben
salir de contratos y permisos nuevos en la API.
