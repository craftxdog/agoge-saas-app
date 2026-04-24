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
import { useAuthStore } from "@/shared/store/auth.store";
import { Breadcrumbs } from "./breadcrumbs";

export function SiteHeader() {
  const { activeMembership, permissions, enabledModules } = useAuthStore();
  const brandingQuery = useTenantBranding();
  const branding =
    brandingQuery.data ?? getStoredTenantBranding(activeMembership?.organization.id);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(activeMembership?.organization.id, "icon"),
  );
  const canReadNotifications =
    permissions.includes("analytics.read") && enabledModules.includes("analytics");
  const operations = useAnalyticsOperations(
    { groupBy: "week" },
    { enabled: canReadNotifications },
  );

  const unreadCount = operations.data?.unreadNotifications ?? 0;
  const upcomingExceptions = operations.data?.upcomingExceptions ?? 0;
  const auditEvents = operations.data?.auditEvents ?? 0;
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
              Workspace
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
                  {canReadNotifications ? unreadCount : 0}
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
                      Estado operativo del tenant activo.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {canReadNotifications ? "API conectada" : "Sin acceso"}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <div className="grid gap-2 p-3">
                {operations.isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-xl border bg-muted/35"
                    />
                  ))
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
                            Valor consolidado desde `analytics/operations`.
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
                    Este usuario no tiene permiso para leer notificaciones operativas.
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Listo para realtime con `socket.io`.
                </p>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <CheckCheck className="size-4" />
                  Revisado
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
                {activeMembership?.organization.name ?? "Sin tenant"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
