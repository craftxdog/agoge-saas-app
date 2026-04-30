import {
  Bell,
  Building2,
  CalendarClock,
  CheckCheck,
  ChevronsUpDown,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAnalyticsOperations } from "@/modules/analytics/hooks/useAnalyticsResources";
import {
  useMarkAllNotificationsAsRead,
  useNotificationSummary,
} from "@/modules/notifications/hooks/useNotifications";
import { getNotificationTitle } from "@/modules/notifications/utils/notification-copy";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import {
  getStoredBrandAssetVersion,
  getStoredTenantBranding,
  resolveBrandAssetUrl,
} from "@/modules/settings/utils/tenant-branding";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";
import { useSocket } from "@/shared/hooks/useSocket";
import { useRealtimeNotifications } from "@/shared/realtime/use-realtime-notifications";
import { useAuthStore } from "@/shared/store/auth.store";
import { useNotificationStore } from "@/shared/store/notification.store";
import { formatSystemLabel } from "@/shared/utils/labels";
import { Breadcrumbs } from "./breadcrumbs";

const getRealtimeBadge = (isEnabled: boolean, isConnected: boolean) => {
  if (!isEnabled) {
    return {
      icon: WifiOff,
      label: "Tiempo real deshabilitado",
      tone: "outline" as const,
    };
  }

  if (!isConnected) {
    return {
      icon: Wifi,
      label: "Reconectando tiempo real",
      tone: "outline" as const,
    };
  }

  return {
    icon: Wifi,
    label: "Tiempo real activo",
    tone: "default" as const,
  };
};

const getNotificationDataMessage = (
  canReadInbox: boolean,
  canReadAnalytics: boolean,
  isCustomerPortal: boolean,
  isEnabled: boolean,
  hasSummaryError: boolean,
  hasOperationsError: boolean,
) => {
  if (canReadInbox && hasSummaryError) {
    return "No pudimos leer /notifications/summary desde la API. Revisa si el modulo notifications esta habilitado y si la membresia tiene notifications.read.";
  }

  if (!canReadInbox && canReadAnalytics && hasOperationsError) {
    return "No pudimos leer analytics/operations desde la API. Solo veras actividad local que llegue por tiempo real.";
  }

  if (canReadInbox) {
    return "La campana usa /notifications/summary como fuente principal y Socket.IO para refrescar el inbox compartido.";
  }

  if (canReadAnalytics) {
    return "Este tenant aun esta mostrando el resumen operativo desde analytics/operations como respaldo del inbox.";
  }

  if (!isEnabled && !isCustomerPortal) {
    return "El tiempo real esta apagado y este perfil no tiene inbox operativo disponible.";
  }

  if (isCustomerPortal) {
    return "Esta vista depende de eventos realtime asociados a tu membresia activa.";
  }

  return "Solo se mostraran eventos locales que realmente entren por Socket.IO.";
};

export function SiteHeader() {
  const { activeMembership, memberships, permissions, enabledModules } = useAuthStore();
  const { isCustomerPortal, memberId } = useAccessContext();
  const { isConnected, isEnabled } = useSocket();
  const { formatDateTime } = useRealtimeNotifications();
  const switchOrganization = useSwitchOrganization();
  const brandingQuery = useTenantBranding();
  const realtimeNotifications = useNotificationStore((state) => state.items);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const markAllInboxAsRead = useMarkAllNotificationsAsRead();
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );
  const canReadInbox =
    !isCustomerPortal &&
    permissions.includes("notifications.read") &&
    enabledModules.includes("notifications");
  const canReadAnalyticsOperations =
    !isCustomerPortal &&
    permissions.includes("analytics.read") &&
    enabledModules.includes("analytics");
  const notificationSummary = useNotificationSummary({ enabled: canReadInbox });
  const operations = useAnalyticsOperations(
    { groupBy: "week" },
    { enabled: canReadAnalyticsOperations },
  );

  const unreadCount = canReadInbox
    ? notificationSummary.data?.unreadCount ?? 0
    : canReadAnalyticsOperations
      ? operations.data?.unreadNotifications ?? 0
      : 0;
  const unreadRealtimeCount = realtimeNotifications.filter((item) => !item.read).length;
  const badgeCount = canReadInbox || canReadAnalyticsOperations
    ? unreadCount
    : unreadRealtimeCount;
  const upcomingExceptions = operations.data?.upcomingExceptions ?? 0;
  const auditEvents = operations.data?.auditEvents ?? 0;
  const recentRealtimeNotifications = realtimeNotifications.slice(0, 5);
  const recentNotifications = canReadInbox
    ? (notificationSummary.data?.recent ?? []).map((item) => ({
        id: item.id,
        title: getNotificationTitle(item),
        description: item.message,
        occurredAt: item.createdAt,
        read: item.isRead,
      }))
    : canReadAnalyticsOperations
      ? (operations.data?.recentNotifications ?? []).map((item) => ({
          id: item.id,
          title: getNotificationTitle(item),
          description: item.message,
          occurredAt: item.createdAt,
          read: item.isRead,
        }))
      : recentRealtimeNotifications;
  const realtimeStatus = getRealtimeBadge(isEnabled, isConnected);
  const hasMultipleMemberships = memberships.length > 1;
  const roleLabel =
    activeMembership?.roles?.length
      ? activeMembership.roles.map((role) => formatSystemLabel(role)).join(" · ")
      : "Sin rol activo";
  const notificationDataMessage = getNotificationDataMessage(
    canReadInbox,
    canReadAnalyticsOperations,
    isCustomerPortal,
    isEnabled,
    notificationSummary.isError,
    operations.isError,
  );
  const headerPills = [
    {
      key: "rol",
      icon: ShieldCheck,
      label: "Rol",
      value: roleLabel,
    },
    {
      key: "modulos",
      icon: Layers3,
      label: "Modulos",
      value: `${enabledModules.length} activos`,
    },
    {
      key: "permisos",
      icon: Sparkles,
      label: "Permisos",
      value: `${permissions.length} visibles`,
    },
    {
      key: "fuente-notificaciones",
      icon: Bell,
      label: "Bandeja",
      value: canReadInbox
        ? "Inbox compartido"
        : canReadAnalyticsOperations
          ? "Analytics operativo"
          : "Realtime local",
    },
    {
      key: "sedes",
      icon: Building2,
      label: "Sedes",
      value: `${memberships.length} disponibles`,
    },
  ];
  const alertItems = [
    {
      key: "notifications",
      label: "Notificaciones sin leer",
      value: unreadCount,
      icon: Bell,
      helper: canReadInbox
        ? "Conteo real del inbox compartido."
        : "Conteo resumido por analytics/operations.",
    },
    {
      key: "exceptions",
      label: "Excepciones proximas",
      value: upcomingExceptions,
      icon: CalendarClock,
      helper: "Alertas de agenda por organizacion activa.",
    },
    {
      key: "audit",
      label: "Eventos de auditoria",
      value: auditEvents,
      icon: ShieldCheck,
      helper: "Actividad operativa consolidada.",
    },
  ].filter((item) => canReadAnalyticsOperations && item.value > 0);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-5 lg:px-7">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <SidebarTrigger className="mt-0.5 size-10 shrink-0 rounded-xl border border-border/70 bg-white/80 text-foreground shadow-sm" />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Espacio de trabajo
                </p>
                <Badge variant="outline" className="rounded-full">
                  {isCustomerPortal ? "Portal de cliente" : "Operacion SaaS"}
                </Badge>
                <Badge
                  variant={realtimeStatus.tone}
                  className="rounded-full px-2.5 py-1"
                >
                  <realtimeStatus.icon className="size-3.5" />
                  {realtimeStatus.label}
                </Badge>
              </div>

              <div className="mt-2 min-w-0">
                <Breadcrumbs />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end xl:w-auto xl:max-w-[42rem] xl:flex-nowrap">
            <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-border/70 bg-white/82 px-3 py-2.5 shadow-sm sm:max-w-[320px]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-border/70 bg-muted/30">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={activeMembership?.organization.name ?? "Organizacion"}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <Building2 className="size-4 text-primary" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Organizacion activa
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">
                    {activeMembership?.organization.name ?? "Sin organizacion"}
                  </p>
                </div>
              </div>

              {hasMultipleMemberships ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 w-full justify-between rounded-xl border-border/70 bg-background/80"
                    >
                      <span className="flex items-center gap-2">
                        <Building2 className="size-4" />
                        Cambiar sede
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {memberships.length} opciones
                        <ChevronsUpDown className="size-4" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className="w-[min(24rem,calc(100vw-1.5rem))] rounded-[1.1rem] border border-border/70 p-0 shadow-[0_24px_60px_rgba(30,44,38,0.14)]"
                  >
                    <DropdownMenuLabel className="px-4 py-4">
                      <p className="text-sm font-semibold">Cambiar organizacion activa</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Este cambio renueva tokens, permisos, modulos y contexto realtime para la sede seleccionada.
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={activeMembership?.organization.id ?? ""}
                      onValueChange={(organizationId) => {
                        if (
                          organizationId &&
                          organizationId !== activeMembership?.organization.id
                        ) {
                          switchOrganization.mutate(organizationId);
                        }
                      }}
                    >
                      <div className="grid gap-1 p-2">
                        {memberships.map((membership) => (
                          <DropdownMenuRadioItem
                            key={membership.id}
                            value={membership.organization.id}
                            disabled={switchOrganization.isPending}
                            className="rounded-xl py-3"
                          >
                            <div className="grid gap-0.5">
                              <span className="font-medium">
                                {membership.organization.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {membership.organization.slug} ·{" "}
                                {membership.roles.map((role) => formatSystemLabel(role)).join(", ")}
                              </span>
                            </div>
                          </DropdownMenuRadioItem>
                        ))}
                      </div>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Solo tienes una sede disponible en este momento.
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-11 w-full justify-between rounded-xl border-border/70 bg-white/82 px-3 shadow-sm sm:w-auto sm:justify-center"
                >
                  <span className="flex items-center gap-2">
                    <Bell className="size-4" />
                    <span className="text-sm font-medium">Notificaciones</span>
                  </span>
                  <span className="grid min-w-6 place-items-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-foreground sm:ml-2">
                    {badgeCount}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[min(23rem,calc(100vw-1.5rem))] rounded-[1.1rem] border border-border/70 p-0 shadow-[0_24px_60px_rgba(30,44,38,0.14)] sm:w-[380px]"
              >
                <DropdownMenuLabel className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Centro de notificaciones</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {isCustomerPortal
                          ? "Actividad reciente de tus cobros y cambios de agenda visibles para tu membresia."
                          : "Actividad reciente, alertas operativas y sincronizacion de la organizacion activa."}
                      </p>
                    </div>
                    <Badge variant={realtimeStatus.tone} className="rounded-full">
                      {realtimeStatus.label}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {canReadInbox
                        ? `Inbox ${unreadCount}`
                        : canReadAnalyticsOperations
                          ? `Analytics ${unreadCount}`
                          : `Realtime ${unreadRealtimeCount}`}
                    </Badge>
                    {isCustomerPortal ? (
                      <Badge variant="outline" className="rounded-full">
                        Miembro {memberId ?? "sin contexto"}
                      </Badge>
                    ) : null}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="grid gap-2 p-3">
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Fuente de datos
                    </p>
                    <p className="mt-1 text-sm text-foreground">{notificationDataMessage}</p>
                  </div>

                  {canReadInbox && notificationSummary.isError ? (
                    <div className="rounded-xl border border-dashed border-amber-300/70 bg-amber-50/80 px-3 py-3 text-sm text-amber-950">
                      El backend ya expone `/notifications/summary` y `/notifications`, pero esta membresia no pudo leer el resumen del inbox. Revisa modulo, permisos o sesion tenant-scoped.
                    </div>
                  ) : null}

                  {!canReadInbox && canReadAnalyticsOperations && operations.isError ? (
                    <div className="rounded-xl border border-dashed border-amber-300/70 bg-amber-50/80 px-3 py-3 text-sm text-amber-950">
                      El frontend ya consulta `analytics/operations`, pero si la API no expone ese endpoint o no envía `unreadNotifications`, esta campana no podra mostrar el resumen historico.
                    </div>
                  ) : null}

                  {(canReadInbox ? notificationSummary.isLoading : canReadAnalyticsOperations ? operations.isLoading : false) &&
                  !recentNotifications.length ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 animate-pulse rounded-xl border bg-muted/35"
                      />
                    ))
                  ) : recentNotifications.length ? (
                    <>
                      {recentNotifications.map((item) => (
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
                    </>
                  ) : null}

                  {!isCustomerPortal && canReadAnalyticsOperations && alertItems.length ? (
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
                              {item.helper}
                            </p>
                          </div>
                          <Badge className="rounded-full">{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!recentNotifications.length &&
                  (!canReadAnalyticsOperations || !alertItems.length) ? (
                    isCustomerPortal ? (
                      <>
                        <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
                          <p className="text-sm font-medium">Portal del cliente</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Solo ves datos y eventos asociados a tu membresia activa.
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-card px-3 py-3">
                          <p className="text-sm font-medium">Miembro activo</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {memberId ?? "Sin membresia activa"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                        No hay actividad nueva para mostrar en este momento.
                      </div>
                    )
                  ) : null}
                </div>

                <DropdownMenuSeparator />

                <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {isEnabled
                      ? isConnected
                        ? "Socket.IO sincronizado."
                        : "Socket.IO intentando reconectar."
                      : "Socket.IO deshabilitado."}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {canReadInbox ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          disabled={!unreadCount || markAllInboxAsRead.isPending}
                          onClick={() => markAllInboxAsRead.mutate()}
                        >
                          <CheckCheck className="size-4" />
                          Marcar todo como leido
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                          <Link to="/app/notifications">Abrir bandeja</Link>
                        </Button>
                      </>
                    ) : isCustomerPortal || !canReadAnalyticsOperations ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        disabled={!unreadRealtimeCount}
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="size-4" />
                        Marcar eventos locales
                      </Button>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {headerPills.map((pill) => (
            <HeaderPill
              key={pill.key}
              icon={pill.icon}
              label={pill.label}
              value={pill.value}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

function HeaderPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bell;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border/70 bg-white/72 px-3 py-2 text-sm shadow-sm">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}
