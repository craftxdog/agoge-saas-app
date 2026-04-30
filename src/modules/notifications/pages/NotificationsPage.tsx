import {
  Bell,
  CheckCheck,
  Clock3,
  Filter,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CursorPagination } from "@/shared/components/CursorPagination";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationSummary,
} from "../hooks/useNotifications";
import type { NotificationItem } from "../schemas/notifications.schema";
import {
  getNotificationSourceLabel,
  getNotificationTitle,
} from "../utils/notification-copy";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Sin actividad reciente";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const debouncedSearch = useDebouncedValue(search, 350);
  const pagination = useCursorPagination(20);
  const summary = useNotificationSummary();
  const notifications = useNotifications({
    cursor: pagination.cursor,
    limit: pagination.limit,
    sortBy: "createdAt",
    sortDirection: "desc",
    search: debouncedSearch || undefined,
    type: type || undefined,
    isRead:
      readFilter === "all" ? undefined : readFilter === "read",
  });
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAsRead = useMarkNotificationAsRead();
  const items = notifications.data?.items ?? [];
  const availableTypes = Array.from(new Set(items.map((item) => item.type))).sort();

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(214,142,73,0.18),_rgba(79,143,131,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Bandeja compartida
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Notificaciones del tenant
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Esta bandeja usa el inbox persistente del backend, se refresca con
          Socket.IO y comparte estado de lectura para la organizacion activa.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          icon={Bell}
          label="Sin leer"
          value={summary.data?.unreadCount ?? 0}
          helper="Pendientes para toda la organizacion activa"
        />
        <SummaryCard
          icon={Clock3}
          label="Ultima actividad"
          value={formatDateTime(summary.data?.latestCreatedAt)}
          helper="Marca temporal mas reciente del inbox"
        />
        <SummaryCard
          icon={CheckCheck}
          label="Recientes cargadas"
          value={summary.data?.recent.length ?? 0}
          helper="Preview actual para dropdowns y monitoreo"
        />
      </div>

      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-5 text-primary" />
                Historial operativo
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Filtra por estado, tipo y texto para revisar el inbox historico.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 rounded-full bg-white/70 pl-9"
                  placeholder="Buscar por titulo, mensaje o entidad..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    pagination.reset();
                  }}
                />
              </div>

              <select
                className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                value={readFilter}
                onChange={(event) => {
                  setReadFilter(event.target.value as "all" | "read" | "unread");
                  pagination.reset();
                }}
              >
                <option value="all">Todos los estados</option>
                <option value="unread">Solo sin leer</option>
                <option value="read">Solo leidas</option>
              </select>

              <select
                className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  pagination.reset();
                }}
              >
                <option value="">Todos los tipos</option>
                {availableTypes.map((itemType) => (
                  <option key={itemType} value={itemType}>
                    {getNotificationTitle({ type: itemType, title: itemType })}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                className="rounded-full"
                disabled={!summary.data?.unreadCount || markAllAsRead.isPending}
                onClick={() => markAllAsRead.mutate()}
              >
                <CheckCheck className="size-4" />
                {markAllAsRead.isPending ? "Marcando..." : "Marcar todo como leido"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            La lectura es compartida por la organizacion activa. Si alguien marca
            una notificacion como leida, el cambio se refleja en toda la sede
            gracias al endpoint persistente y al realtime.
          </div>

          <ScrollPanel>
            {notifications.isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-28 rounded-[1.5rem]" />
                ))
              : items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    isPending={
                      markAsRead.isPending && markAsRead.variables === item.id
                    }
                    onMarkAsRead={() => markAsRead.mutate(item.id)}
                  />
                ))}

            {!notifications.isLoading && !items.length ? (
              <div className="rounded-[1.5rem] border border-dashed p-6 text-sm text-muted-foreground">
                No encontramos notificaciones para esos filtros.
              </div>
            ) : null}
          </ScrollPanel>

          <CursorPagination
            meta={notifications.data?.pagination}
            limit={pagination.limit}
            itemLabel="notificaciones"
            hasPreviousCursor={pagination.hasPreviousCursor}
            onPrevious={pagination.goPrevious}
            onNext={() =>
              pagination.goNext(notifications.data?.pagination?.nextCursor)
            }
            onLimitChange={pagination.updateLimit}
          />
        </CardContent>
      </Card>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Bell;
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardContent className="flex items-start gap-4 p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-lg font-semibold leading-snug">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationRow({
  item,
  isPending,
  onMarkAsRead,
}: {
  item: NotificationItem;
  isPending: boolean;
  onMarkAsRead: () => void;
}) {
  const sourceLabel = getNotificationSourceLabel(item);

  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-card px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold">{getNotificationTitle(item)}</p>
            <Badge variant={item.isRead ? "outline" : "default"} className="rounded-full">
              {item.isRead ? "Leida" : "Nueva"}
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {sourceLabel}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
        </div>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <p className="text-xs text-muted-foreground">
            {formatDateTime(item.createdAt)}
          </p>
          {!item.isRead ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={onMarkAsRead}
            >
              <CheckCheck className="size-4" />
              {isPending ? "Marcando..." : "Marcar como leida"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
