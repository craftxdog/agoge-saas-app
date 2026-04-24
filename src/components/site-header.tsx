import {
  Bell,
  BellDot,
  Building2,
  CheckCheck,
  Sparkles,
  TriangleAlert,
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
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAnalyticsDashboard } from "@/modules/analytics/hooks/useAnalyticsDashboard";
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
  const canReadOperationalAlerts =
    permissions.includes("analytics.read") && enabledModules.includes("analytics");
  const notifications = useAnalyticsDashboard(
    { groupBy: "week" },
    { enabled: canReadOperationalAlerts },
  );
  const unreadCount = notifications.data?.operations.unreadNotifications ?? 0;
  const insights = notifications.data?.insights ?? [];

  return (
    <header className="z-20 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="flex min-h-(--header-height) items-center px-4 py-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="size-10 rounded-2xl border border-border/70 bg-white/70 text-foreground shadow-sm" />
          <Separator
            orientation="vertical"
            className="mx-1 hidden data-[orientation=vertical]:h-8 sm:block"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em]">
                Workspace
              </span>
            </div>
            <div className="mt-2 min-w-0">
              <Breadcrumbs />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-3">
          {canReadOperationalAlerts ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-12 rounded-2xl border-border/70 bg-white/75 px-4 shadow-sm"
                >
                  {unreadCount > 0 ? (
                    <BellDot className="size-5 text-primary" />
                  ) : (
                    <Bell className="size-5" />
                  )}
                  <span className="hidden text-sm font-semibold sm:inline">
                    Notificaciones
                  </span>
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1.5 -top-1.5 grid min-h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground shadow-lg">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[380px] rounded-[1.5rem] border border-border/70 p-0 shadow-[0_30px_80px_rgba(30,44,38,0.18)]"
              >
                <DropdownMenuLabel className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold">Alertas operativas</p>
                      <p className="text-sm font-normal text-muted-foreground">
                        Resumen desde analytics del tenant activo.
                      </p>
                    </div>
                    <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary shadow-none">
                      {unreadCount} sin leer
                    </Badge>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="max-h-[60vh] overflow-auto p-3">
                  {notifications.isLoading ? (
                    <div className="grid gap-3 p-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-22 animate-pulse rounded-[1.2rem] border bg-muted/50"
                        />
                      ))}
                    </div>
                  ) : insights.length ? (
                    <div className="grid gap-3">
                      {insights.map((item) => (
                        <div
                          key={`${item.metricKey}-${item.title}`}
                          className="rounded-[1.25rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,248,0.92))] p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                              <TriangleAlert className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold">{item.title}</p>
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[10px] uppercase tracking-[0.2em]"
                                >
                                  {item.severity}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.3rem] border border-dashed p-5 text-sm text-muted-foreground">
                      No hay alertas nuevas por ahora.
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator />

                <div className="flex items-center justify-between px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Monitoreo vivo listo para socket.io
                  </p>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <CheckCheck className="size-4" />
                    Revisado
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <div className="hidden items-center gap-3 rounded-[1.5rem] border border-border/70 bg-white/78 px-4 py-2.5 shadow-sm sm:flex">
            <span className="grid size-11 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-white/90">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={activeMembership?.organization.name ?? "Tenant"}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2 className="size-5 text-primary" />
              )}
            </span>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                Organizacion activa
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight">
                {activeMembership?.organization.name ?? "Sin tenant"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
