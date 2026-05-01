import { Bell, CheckCheck, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAnalyticsOperations } from "@/modules/analytics/hooks/useAnalyticsResources";
import { usePayments } from "@/modules/billing/hooks/useBilling";
import { getPaymentStatusLabel, getPaymentTypeLabel } from "@/modules/billing/utils/billing-copy";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationSummary,
} from "@/modules/notifications/hooks/useNotifications";
import { getNotificationTitle } from "@/modules/notifications/utils/notification-copy";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useRealtimeNotifications } from "@/shared/realtime/use-realtime-notifications";
import { useAuthStore } from "@/shared/store/auth.store";
import { useNotificationStore } from "@/shared/store/notification.store";

const LOCAL_READ_STORAGE_PREFIX = "agoge:notifications:local-read:";

const getLocalReadStorageKey = (
  organizationId?: string,
  scope: "customer" | "tenant" = "tenant",
) => `${LOCAL_READ_STORAGE_PREFIX}${scope}:${organizationId ?? "global"}`;

const getStoredLocalReadIds = (
  organizationId?: string,
  scope: "customer" | "tenant" = "tenant",
) => {
  if (!organizationId) return null;

  try {
    const raw = localStorage.getItem(getLocalReadStorageKey(organizationId, scope));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const storeLocalReadIds = (
  organizationId: string | undefined,
  ids: string[],
  scope: "customer" | "tenant" = "tenant",
) => {
  if (!organizationId) return;

  try {
    localStorage.setItem(
      getLocalReadStorageKey(organizationId, scope),
      JSON.stringify(ids),
    );
  } catch {
    return;
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
  }).format(date);
};

export function HeaderNotificationCenter() {
  const { activeMembership, permissions, enabledModules } = useAuthStore();
  const { isCustomerPortal, memberId } = useAccessContext();
  const { formatDateTime } = useRealtimeNotifications();
  const realtimeNotifications = useNotificationStore((state) => state.items);
  const markLocalAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllLocalAsRead = useNotificationStore((state) => state.markAllAsRead);
  const markAllInboxAsRead = useMarkAllNotificationsAsRead({
    showSuccessToast: false,
  });
  const markInboxItemAsRead = useMarkNotificationAsRead();
  const organizationId = activeMembership?.organization.id;
  const localScope = isCustomerPortal ? "customer" : "tenant";
  const localReadStorageKey = getLocalReadStorageKey(organizationId, localScope);
  const [localReadState, setLocalReadState] = useState(() => ({
    key: localReadStorageKey,
    ids: getStoredLocalReadIds(organizationId, localScope) ?? [],
  }));
  const localReadIds =
    localReadState.key === localReadStorageKey
      ? localReadState.ids
      : (getStoredLocalReadIds(organizationId, localScope) ?? []);

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
  const customerPayments = usePayments(
    {
      memberId: memberId ?? undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
      limit: 8,
    },
    {
      enabled: isCustomerPortal && Boolean(memberId),
      refetchInterval: 15000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );

  const unreadCount = canReadInbox
    ? notificationSummary.data?.unreadCount ?? 0
    : canReadAnalyticsOperations
      ? operations.data?.unreadNotifications ?? 0
      : 0;
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
          read: item.isRead || localReadIds.includes(item.id),
        }))
      : isCustomerPortal
        ? (customerPayments.data?.items ?? []).map((payment) => ({
            id: payment.id,
            title:
              payment.status === "PAID"
                ? "Tu cobro fue actualizado como pagado"
                : payment.status === "OVERDUE"
                  ? "Tu cobro requiere atencion"
                  : "Se registro un cobro en tu cuenta",
            description: `${getPaymentTypeLabel(payment.paymentType)} · ${getPaymentStatusLabel(
              payment.status,
            ).toLowerCase()} · vence ${formatDate(payment.dueDate)}`,
            occurredAt: payment.updatedAt ?? payment.createdAt,
            read: localReadIds.includes(payment.id),
          }))
        : realtimeNotifications
            .slice(0, 8)
            .map((item) => ({
              ...item,
              read: item.read || localReadIds.includes(item.id),
            }));
  const pendingNotifications = useMemo(
    () => recentNotifications.filter((notification) => !notification.read),
    [recentNotifications],
  );
  const badgeCount = canReadInbox ? unreadCount : pendingNotifications.length;
  const feedNotifications =
    pendingNotifications.length > 0
      ? pendingNotifications
      : !isCustomerPortal && badgeCount > 0
        ? recentNotifications
        : [];
  const summaryLabel = canReadInbox
    ? "Inbox compartido"
    : canReadAnalyticsOperations
      ? "Resumen operativo"
      : isCustomerPortal
        ? "Cobros de tu cuenta"
        : "Eventos en tiempo real";
  const isLoadingFeed = canReadInbox
    ? notificationSummary.isLoading
    : canReadAnalyticsOperations
      ? operations.isLoading
      : isCustomerPortal
        ? customerPayments.isLoading
        : false;

  const persistLocalReadIds = (nextIds: string[]) => {
    storeLocalReadIds(organizationId, nextIds, localScope);
    setLocalReadState({
      key: localReadStorageKey,
      ids: nextIds,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label="Abrir notificaciones"
          className="relative rounded-[1.25rem] border-border/70 bg-white/84 shadow-sm"
        >
          <Bell className="size-5" />
          {badgeCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-h-6 min-w-6 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
              {badgeCount > 9 ? "9+" : badgeCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.35rem] border border-border/70 p-0 shadow-[0_24px_60px_rgba(30,44,38,0.14)] sm:w-[360px]"
      >
        <div className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Centro de actividad</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isCustomerPortal
                  ? "Tus cambios recientes y movimiento relevante de cobros."
                  : "Actividad operativa y notificaciones de la organizacion activa."}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full">
              {badgeCount > 0 ? "Pendientes" : "Limpio"}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className="rounded-full">{summaryLabel}</Badge>
            <Badge variant="outline" className="rounded-full">
              {badgeCount > 0 ? `${badgeCount} nuevas` : "Bandeja limpia"}
            </Badge>
            {isCustomerPortal ? (
              <Badge variant="outline" className="rounded-full">
                Miembro {memberId ?? "sin contexto"}
              </Badge>
            ) : null}
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="grid gap-3 px-3 py-3">
          <div className="rounded-[1.1rem] border border-dashed border-border/70 bg-muted/20 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Estado del feed
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {badgeCount > 0
                    ? `${badgeCount} novedad${badgeCount === 1 ? "" : "es"} por revisar`
                    : "No tienes notificaciones recientes"}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
            </div>
          </div>

          <ScrollPanel
            className="pr-1"
            heightClassName="max-h-[22rem]"
          >
            {isLoadingFeed && !feedNotifications.length
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-[1.2rem] border bg-muted/35"
                  />
                ))
              : feedNotifications.map((item) => {
                  const isRealtimeOnly = !canReadInbox && !canReadAnalyticsOperations;
                  const canMarkItem = canReadInbox || isRealtimeOnly;
                  const isItemPending =
                    markInboxItemAsRead.isPending &&
                    markInboxItemAsRead.variables === item.id;

                  return (
                    <article
                      key={item.id}
                      className="rounded-[1.2rem] border border-border/70 bg-card px-3 py-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{item.title}</p>
                            {!item.read ? (
                              <Badge className="rounded-full">Nuevo</Badge>
                            ) : (
                              <Badge variant="outline" className="rounded-full">
                                Leida
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        {canMarkItem && !item.read ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-xl"
                            disabled={isItemPending}
                            onClick={() => {
                              if (canReadInbox) {
                                markInboxItemAsRead.mutate(item.id);
                                return;
                              }

                              markLocalAsRead(item.id);
                              persistLocalReadIds(
                                Array.from(new Set([...localReadIds, item.id])),
                              );
                            }}
                          >
                            {isItemPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCheck className="size-4" />
                            )}
                          </Button>
                        ) : null}
                      </div>

                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {formatDateTime(item.occurredAt)}
                      </p>
                    </article>
                  );
                })}

            {!isLoadingFeed && !feedNotifications.length ? (
              <div className="rounded-[1.2rem] border border-dashed p-4 text-sm text-muted-foreground">
                No tienes notificaciones recientes.
              </div>
            ) : null}
          </ScrollPanel>
        </div>

        <DropdownMenuSeparator />

        <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {badgeCount > 0
              ? "Las alertas nuevas permanecen visibles hasta marcarlas como leidas."
              : "Tu centro de actividad esta al dia."}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {canReadInbox ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                disabled={!pendingNotifications.length || markAllInboxAsRead.isPending}
                onClick={() => markAllInboxAsRead.mutate()}
              >
                <CheckCheck className="size-4" />
                Marcar todo
              </Button>
            ) : pendingNotifications.length ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  markAllLocalAsRead();
                  persistLocalReadIds(
                    Array.from(
                      new Set([
                        ...localReadIds,
                        ...pendingNotifications.map((item) => item.id),
                      ]),
                    ),
                  );
                }}
              >
                <CheckCheck className="size-4" />
                Marcar todo
              </Button>
            ) : null}

            {!isCustomerPortal && canReadInbox ? (
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/app/notifications">Abrir bandeja</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
