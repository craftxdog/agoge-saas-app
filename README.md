# Agoge SaaS App

Frontend multi-tenant construido con `React 19`, `TypeScript`, `Vite`, `TanStack Query` y `Socket.IO` para operar academias, clubes o centros con contexto por organización, permisos por membresía y portal de cliente.

## Qué resuelve

- Sesión con contexto tenant-aware y cambio de organización.
- Módulos administrativos para `usuarios`, `cobros`, `horarios`, `analytics`, `rbac`, `settings` y `audit`.
- Portal `customer` con vistas limitadas a sus propios cobros y disponibilidad.
- Sincronización en tiempo real con la API mediante `Socket.IO`.
- Branding por organización con assets y colores persistidos en cliente.

## Stack principal

- `React 19` + `React Router 7`
- `TypeScript`
- `Vite 8`
- `Tailwind CSS 4`
- `TanStack Query 5`
- `React Hook Form` + `Zod`
- `Socket.IO Client`
- `Zustand`

## Módulos activos en la app

| Módulo | Ruta | Uso principal |
| --- | --- | --- |
| Marketing | `/` | Entrada pública y navegación inicial |
| Login / Registro | `/login`, `/register` | Acceso y alta inicial de organización |
| Dashboard | `/app` | Resumen según rol y membresía activa |
| Perfil | `/app/profile` | Datos de usuario y memberships |
| Usuarios | `/app/users` | Miembros, invitaciones y estados |
| Cobros | `/app/billing` | Facturas, conceptos, métodos y transacciones |
| Horarios | `/app/schedules` | Sedes, horas operativas, excepciones y disponibilidad |
| Analítica | `/app/analytics` | KPIs y métricas operativas |
| RBAC | `/app/rbac` | Roles, permisos y matriz de acceso |
| Configuración | `/app/settings` | Perfil de organización, branding, módulos y pantallas |
| Auditoría | `/app/audit` | Trazabilidad de eventos |

## Experiencia por rol

### Administración

- Accede a todos los módulos habilitados por organización.
- Puede crear cobros, registrar pagos, administrar miembros y configurar el tenant.
- Recibe notificaciones operativas y eventos en tiempo real.

### Cliente

- Solo ve módulos permitidos por su membresía activa.
- Tiene portal de autoservicio para revisar cobros, vencimientos, pagos y disponibilidad.
- La navegación, el header y las notificaciones se adaptan a su alcance.

## Arquitectura rápida

```text
src/
  app/                  router, layout y providers globales
  components/           shell visual, auth UI y piezas reutilizables
  modules/              dominios funcionales por vertical
  shared/
    api/                cliente HTTP, interceptores y tokens
    auth/               reglas de acceso tenant/customer
    hooks/              hooks compartidos
    realtime/           contrato Socket.IO, provider y sincronización
    store/              estado global con Zustand
```

## Flujo de autenticación

1. El login envía `email`, `password` y opcionalmente `organizationSlug`.
2. La API responde con `user`, `memberships`, `activeMembership` y `tokens`.
3. El frontend persiste el `accessToken`, hidrata la sesión y resuelve permisos desde la membresía activa.
4. Si existe contexto tenant, el socket se sincroniza con `/realtime`.

## Realtime

La app escucha el namespace `/realtime` y consume:

- `realtime.connected`
- `realtime.context`
- `realtime.event`
- `realtime.error`

Los eventos de dominio invalidan queries activas y refrescan vistas como cobros, horarios, analytics y navegación del cliente. La campana del header también muestra actividad reciente de cobros.

## Variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Variables disponibles:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_SOCKET_PATH=/socket.io
VITE_SOCKET_ENABLED=false
```

## Comandos útiles

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Desarrollo local

1. Levanta la API en `http://localhost:3001`.
2. Activa `VITE_SOCKET_ENABLED=true` si vas a probar realtime.
3. Inicia la app con `npm run dev`.
4. Abre `http://localhost:5173`.

## Estado de calidad

- `npm run build` debe pasar antes de subir cambios.
- `npm run lint` hoy mantiene una advertencia conocida en `src/components/data-table.tsx` por `useReactTable` y React Compiler.

## Integración esperada con la API

Este frontend está diseñado para trabajar con el backend `agoge-academy-api` y su contrato actual:

- Autenticación con JWT y cookies `refresh`.
- Contexto por organización y membresía.
- Endpoints de billing, schedules, users, settings, audit, analytics y rbac.
- Realtime por Socket.IO con eventos de invalidación por dominio.

## Git y ramas

La operación diaria esperada en este repo es:

- `develop` como rama de integración.
- `main` como rama lista para release.
- ramas `codex/*` para trabajo puntual o refactors asistidos.

Cuando se cierra una tarea, conviene dejar `develop` y `main` sincronizadas si el cambio ya está validado para release.
