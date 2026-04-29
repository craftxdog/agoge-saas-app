import {
  Bell,
  Building2,
  CalendarClock,
  CheckCheck,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAnalyticsOperations } from "@/modules/analytics/hooks/useAnalyticsResources";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import {
  getStoredBrandAssetVersion,
  getStoredTenantBranding,
  resolveBrandAssetUrl,
} from "@/modules/settings/utils/tenant-branding";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSocket } from "@/shared/hooks/useSocket";
import { useRealtimeNotifications } from "@/shared/realtime/use-realtime-notifications";
import { useAuthStore } from "@/shared/store/auth.store";
import { useNotificationStore } from "@/shared/store/notification.store";
import { Breadcrumbs } from "./breadcrumbs";

export function SiteHeader() {
  const { activeMembership, permissions, enabledModules } = useAuthStore();
  const { isCustomerPortal, memberId } = useAccessContext();
  const { isConnected, isEnabled } = useSocket();
  const { formatDateTime } = useRealtimeNotifications();
  const brandingQuery = useTenantBranding();
  const realtimeNotifications = useNotificationStore((state) => state.items);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );
  const canReadNotifications =
    !isCustomerPortal &&
    permissions.includes("analytics.read") &&
    enabledModules.includes("analytics");
  const operations = useAnalyticsOperations(
    { groupBy: "week" },
    { enabled: canReadNotifications },
  );

  const unreadCount = operations.data?.unreadNotifications ?? 0;
  const unreadRealtimeCount = realtimeNotifications.filter((item) => !item.read).length;
  const badgeCount = canReadNotifications
    ? unreadCount + unreadRealtimeCount
    : unreadRealtimeCount;
  const upcomingExceptions = operations.data?.upcomingExceptions ?? 0;
  const auditEvents = operations.data?.auditEvents ?? 0;
  const recentRealtimeNotifications = realtimeNotifications.slice(0, 5);
  const alertItems = [
    {
      key: "notifications",
      label: "Notificaciones sin leer",
      value: unreadCount,
      icon: Bell,
    },
    {
      key: "exceptions",
      label: "Excepciones proximas",
      value: upcomingExceptions,
      icon: CalendarClock,
    },
    {
      key: "audit",
      label: "Eventos de auditoria",
      value: auditEvents,
      icon: ShieldCheck,
    },
  ].filter((item) => item.value > 0);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/78 backdrop-blur-xl">
      <div className="flex min-h-(--header-height) items-center gap-4 px-5 lg:px-7">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="size-10 rounded-xl border border-border/70 bg-white/80 text-foreground shadow-sm" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Espacio de trabajo
            </p>
            <div className="mt-1">
              <Breadcrumbs />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-11 rounded-xl border-border/70 bg-white/82 px-3 shadow-sm"
              >
                <Bell className="size-4" />
                <span className="hidden text-sm font-medium sm:inline">Notificaciones</span>
                <span className="ml-1 grid min-w-6 place-items-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-foreground">
                  {badgeCount}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-[360px] rounded-[1.1rem] border border-border/70 p-0 shadow-[0_24px_60px_rgba(30,44,38,0.14)]"
            >
              <DropdownMenuLabel className="px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Centro de notificaciones</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isCustomerPortal
                        ? "Actividad reciente de tus cobros y sincronizacion en tiempo real."
                        : "Actividad reciente y estado operativo de la organizacion activa."}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {isEnabled
                      ? isConnected
                        ? "Tiempo real activo"
                        : "Reconectando"
                      : "Sin tiempo real"}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="grid gap-2 p-3">
                {canReadNotifications && operations.isLoading && !recentRealtimeNotifications.length ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl border bg-muted/35"
                    />
                  ))
                ) : recentRealtimeNotifications.length ? (
                  <>
                    {recentRealtimeNotifications.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-border/70 bg-card px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {!item.read ? <Badge className="rounded-full">Nuevo</Badge> : null}
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {formatDateTime(item.occurredAt)}
                        </p>
                      </div>
                    ))}
                    {!isCustomerPortal && canReadNotifications && alertItems.length ? (
                      <div className="grid gap-2 pt-1">
                        {alertItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-3"
                          >
                            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                              <item.icon className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Resumen operativo del tenant activo.
                              </p>
                            </div>
                            <Badge className="rounded-full">{item.value}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : isCustomerPortal ? (
                  <>
                    <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
                      <p className="text-sm font-medium">Portal del cliente</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Solo ves modulos y datos asociados a tu membresia activa.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
                      <p className="text-sm font-medium">Miembro activo</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {memberId ?? "Sin membresia activa"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
                      <p className="text-sm font-medium">Conexion</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {isEnabled
                          ? isConnected
                            ? "Socket conectado y sincronizando cambios de cobros y horarios."
                            : "Socket habilitado, esperando reconexion."
                          : "Tiempo real deshabilitado en esta configuracion."}
                      </p>
                    </div>
                  </>
                ) : canReadNotifications ? (
                  alertItems.length ? (
                    alertItems.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-3"
                      >
                        <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                          <item.icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">
                            Valor consolidado desde analytics/operations.
                          </p>
                        </div>
                        <Badge className="rounded-full">{item.value}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                      No hay alertas operativas pendientes.
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No hay actividad nueva para mostrar en este momento.
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {isEnabled
                    ? isConnected
                      ? "Sincronizado con Socket.IO."
                      : "Socket.IO intentando reconectar."
                    : "Socket.IO deshabilitado."}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="size-4" />
                  Marcar como revisado
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden items-center gap-3 rounded-xl border border-border/70 bg-white/82 px-3 py-2.5 shadow-sm md:flex">
            <span className="grid size-10 place-items-center overflow-hidden rounded-xl border border-border/70 bg-muted/30">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={activeMembership?.organization.name ?? "Tenant"}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2 className="size-4 text-primary" />
              )}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Organizacion activa
              </p>
              <p className="mt-0.5 text-sm font-semibold">
                {activeMembership?.organization.name ?? "Sin organizacion"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
