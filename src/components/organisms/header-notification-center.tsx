import { Bell, CheckCheck, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
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

type NotificationPreview = {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  read: boolean;
};

const SEEN_STORAGE_PREFIX = "agoge:notifications:seen:";

const getStoredSeenAt = (organizationId?: string) => {
  if (!organizationId) return null;

  try {
    return localStorage.getItem(`${SEEN_STORAGE_PREFIX}${organizationId}`);
  } catch {
    return null;
  }
};

const storeSeenAt = (organizationId: string | undefined, value: string) => {
  if (!organizationId) return;

  try {
    localStorage.setItem(`${SEEN_STORAGE_PREFIX}${organizationId}`, value);
  } catch {
    return;
  }
};

const isAfterSeenAt = (occurredAt: string, seenAt: string | null) => {
  if (!seenAt) return true;

  return new Date(occurredAt).getTime() > new Date(seenAt).getTime();
};

const getFreshUnreadCount = (
  notifications: NotificationPreview[],
  seenAt: string | null,
) =>
  notifications.filter(
    (notification) =>
      !notification.read && isAfterSeenAt(notification.occurredAt, seenAt),
  ).length;

const getPendingNotifications = (
  notifications: NotificationPreview[],
  seenAt: string | null,
) =>
  notifications.filter(
    (notification) =>
      !notification.read && isAfterSeenAt(notification.occurredAt, seenAt),
  );

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
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState<string | null>(() =>
    getStoredSeenAt(organizationId),
  );

  useEffect(() => {
    setSeenAt(getStoredSeenAt(organizationId));
  }, [organizationId]);

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
  const unreadRealtimeCount = realtimeNotifications.filter((item) => !item.read).length;
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
            read: false,
          }))
        : realtimeNotifications.slice(0, 8);
  const pendingNotifications = getPendingNotifications(recentNotifications, seenAt);
  const freshUnreadCount = getFreshUnreadCount(recentNotifications, seenAt);
  const badgeCount =
    !seenAt && (canReadInbox || canReadAnalyticsOperations)
      ? unreadCount
      : canReadInbox || canReadAnalyticsOperations
        ? freshUnreadCount
        : pendingNotifications.length;
  const summaryLabel = canReadInbox
    ? "Inbox compartido"
    : canReadAnalyticsOperations
      ? "Resumen operativo"
      : isCustomerPortal
        ? "Cobros de tu cuenta"
        : "Eventos en tiempo real";
  const latestActivityAt =
    notificationSummary.data?.latestCreatedAt ??
    recentNotifications[0]?.occurredAt ??
    new Date().toISOString();
  const shouldAutoSyncReadState =
    canReadInbox && unreadCount > 0 && !markAllInboxAsRead.isPending;
  const shouldClearLocalFeed =
    !isCustomerPortal && !canReadInbox && unreadRealtimeCount > 0;
  const isLoadingFeed = canReadInbox
    ? notificationSummary.isLoading
    : canReadAnalyticsOperations
      ? operations.isLoading
      : false;

  const markPanelAsSeen = () => {
    const nextSeenAt = latestActivityAt;
    setSeenAt(nextSeenAt);
    storeSeenAt(organizationId, nextSeenAt);

    if (shouldAutoSyncReadState) {
      markAllInboxAsRead.mutate();
    } else if (shouldClearLocalFeed) {
      markAllLocalAsRead();
    }
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          markPanelAsSeen();
        }
      }}
    >
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
            {isLoadingFeed && !pendingNotifications.length
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-[1.2rem] border bg-muted/35"
                  />
                ))
              : pendingNotifications.map((item) => {
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

            {!isLoadingFeed && !pendingNotifications.length ? (
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
              ? "Las alertas nuevas se limpian al abrirse o marcarlas como leidas."
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
                onClick={markAllLocalAsRead}
              >
                <CheckCheck className="size-4" />
                Limpiar feed
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
