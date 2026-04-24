import {
  Activity,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CursorPagination } from "@/shared/components/CursorPagination";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  useAuditActorMemberLogs,
  useAuditActorUserLogs,
  useAuditCatalog,
  useAuditEntityLogs,
  useAuditLog,
  useAuditLogs,
  useAuditSummary,
} from "../hooks/useAudit";
import type { AuditLog } from "../schemas/audit.schema";

const today = new Date().toISOString().slice(0, 10);
const defaultFrom = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
  .toISOString()
  .slice(0, 10);

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(today);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [selectedLogId, setSelectedLogId] = useState("");
  const [entityHistory, setEntityHistory] = useState({ entityType: "", entityId: "" });
  const [actorHistory, setActorHistory] = useState({
    mode: "user" as "user" | "member",
    actorId: "",
  });
  const debouncedSearch = useDebouncedValue(search, 350);
  const logsPagination = useCursorPagination(20);
  const entityPagination = useCursorPagination(20);
  const actorPagination = useCursorPagination(20);

  const summary = useAuditSummary({ dateFrom, dateTo });
  const catalog = useAuditCatalog();
  const logs = useAuditLogs(
    {
      action: action || undefined,
      entityType: entityType || undefined,
      search: debouncedSearch || undefined,
      dateFrom: `${dateFrom}T00:00:00.000Z`,
      dateTo: `${dateTo}T23:59:59.999Z`,
      cursor: logsPagination.cursor,
      limit: logsPagination.limit,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { enabled: activeTab === "logs" },
  );
  const selectedLog = useAuditLog(selectedLogId || undefined, {
    enabled: Boolean(selectedLogId) && activeTab === "logs",
  });
  const entityLogs = useAuditEntityLogs(
    entityHistory.entityType || undefined,
    entityHistory.entityId || undefined,
    {
      action: action || undefined,
      dateFrom: `${dateFrom}T00:00:00.000Z`,
      dateTo: `${dateTo}T23:59:59.999Z`,
      cursor: entityPagination.cursor,
      limit: entityPagination.limit,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { enabled: activeTab === "entities" },
  );
  const actorUserLogs = useAuditActorUserLogs(
    actorHistory.mode === "user" ? actorHistory.actorId || undefined : undefined,
    {
      action: action || undefined,
      dateFrom: `${dateFrom}T00:00:00.000Z`,
      dateTo: `${dateTo}T23:59:59.999Z`,
      cursor: actorPagination.cursor,
      limit: actorPagination.limit,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { enabled: activeTab === "actors" && actorHistory.mode === "user" },
  );
  const actorMemberLogs = useAuditActorMemberLogs(
    actorHistory.mode === "member" ? actorHistory.actorId || undefined : undefined,
    {
      action: action || undefined,
      dateFrom: `${dateFrom}T00:00:00.000Z`,
      dateTo: `${dateTo}T23:59:59.999Z`,
      cursor: actorPagination.cursor,
      limit: actorPagination.limit,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    { enabled: activeTab === "actors" && actorHistory.mode === "member" },
  );

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(111,145,184,0.16),_rgba(79,143,131,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Trazabilidad y control
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Auditoria del tenant
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Consulta resumen, filtros, actividad global, historial por entidad y actividad por actor usando todos los endpoints del modulo audit.
        </p>
      </div>

      <FiltersCard
        dateFrom={dateFrom}
        dateTo={dateTo}
        search={search}
        action={action}
        entityType={entityType}
        actions={catalog.data?.actions ?? []}
        entityTypes={catalog.data?.entityTypes ?? []}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSearchChange={(value) => {
          setSearch(value);
          logsPagination.reset();
        }}
        onActionChange={(value) => {
          setAction(value);
          logsPagination.reset();
          entityPagination.reset();
          actorPagination.reset();
        }}
        onEntityTypeChange={(value) => {
          setEntityType(value);
          logsPagination.reset();
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2">Resumen</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl px-4 py-2">Logs</TabsTrigger>
          <TabsTrigger value="entities" className="rounded-xl px-4 py-2">Entidad</TabsTrigger>
          <TabsTrigger value="actors" className="rounded-xl px-4 py-2">Actor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Eventos"
              value={summary.data?.totalEvents ?? 0}
              helper="Total en el rango actual"
              icon={ShieldCheck}
            />
            <MetricCard
              label="Acciones distintas"
              value={summary.data?.byAction.length ?? 0}
              helper="Catalogadas por endpoint"
              icon={Activity}
            />
            <MetricCard
              label="Tipos de entidad"
              value={summary.data?.byEntityType.length ?? 0}
              helper="Miembros, roles, pagos, settings y mas"
              icon={Waypoints}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <DimensionCard title="Top acciones" items={summary.data?.byAction ?? []} />
            <DimensionCard title="Top entidades" items={summary.data?.byEntityType ?? []} />
            <Card className="rounded-[1.75rem] lg:col-span-1">
              <CardHeader>
                <CardTitle>Eventos recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollPanel heightClassName="max-h-[46vh]">
                  {summary.isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-20 rounded-2xl" />
                      ))
                    : (summary.data?.recentEvents ?? []).map((log) => (
                        <AuditLogRow
                          key={log.id}
                          log={log}
                          onViewEntity={(next) => {
                            entityPagination.reset();
                            setEntityHistory(next);
                            setActiveTab("entities");
                          }}
                          onViewActor={(next) => {
                            actorPagination.reset();
                            setActorHistory(next);
                            setActiveTab("actors");
                          }}
                          onSelectLog={setSelectedLogId}
                        />
                      ))}
                </ScrollPanel>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Trail global</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ScrollPanel>
                  {logs.isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 rounded-2xl" />
                      ))
                    : (logs.data?.items ?? []).map((log) => (
                        <AuditLogRow
                          key={log.id}
                          log={log}
                          onViewEntity={(next) => {
                            entityPagination.reset();
                            setEntityHistory(next);
                            setActiveTab("entities");
                          }}
                          onViewActor={(next) => {
                            actorPagination.reset();
                            setActorHistory(next);
                            setActiveTab("actors");
                          }}
                          onSelectLog={setSelectedLogId}
                        />
                      ))}
                  {!logs.isLoading && !logs.data?.items.length && (
                    <EmptyState text="No hay actividad para esos filtros." />
                  )}
                </ScrollPanel>
                <CursorPagination
                  meta={logs.data?.pagination}
                  limit={logsPagination.limit}
                  itemLabel="logs"
                  hasPreviousCursor={logsPagination.hasPreviousCursor}
                  onPrevious={logsPagination.goPrevious}
                  onNext={() => logsPagination.goNext(logs.data?.pagination?.nextCursor)}
                  onLimitChange={logsPagination.updateLimit}
                />
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Detalle del evento</CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedLogId ? (
                  <EmptyState text="Selecciona un log para cargar el endpoint de detalle." />
                ) : selectedLog.isLoading ? (
                  <Skeleton className="h-72 rounded-2xl" />
                ) : selectedLog.data ? (
                  <div className="grid gap-4">
                    <AuditHeader log={selectedLog.data} />
                    <JsonBlock title="Before" value={selectedLog.data.before} />
                    <JsonBlock title="After" value={selectedLog.data.after} />
                    <JsonBlock title="Metadata" value={selectedLog.data.metadata} />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entities">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Historial por entidad</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tipo de entidad">
                  <Input
                    className="h-11 rounded-2xl bg-white/70"
                    value={entityHistory.entityType}
                    onChange={(event) =>
                      setEntityHistory((current) => ({
                        ...current,
                        entityType: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="ID de entidad">
                  <Input
                    className="h-11 rounded-2xl bg-white/70"
                    value={entityHistory.entityId}
                    onChange={(event) =>
                      setEntityHistory((current) => ({
                        ...current,
                        entityId: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <ScrollPanel>
                {(entityLogs.data?.items ?? []).map((log) => (
                  <AuditLogRow
                    key={log.id}
                    log={log}
                    onViewEntity={setEntityHistory}
                    onViewActor={setActorHistory}
                    onSelectLog={setSelectedLogId}
                  />
                ))}
                {!entityLogs.isLoading &&
                  entityHistory.entityType &&
                  entityHistory.entityId &&
                  !entityLogs.data?.items.length && (
                    <EmptyState text="No hay trazas para esa entidad." />
                  )}
              </ScrollPanel>
              <CursorPagination
                meta={entityLogs.data?.pagination}
                limit={entityPagination.limit}
                itemLabel="logs de entidad"
                hasPreviousCursor={entityPagination.hasPreviousCursor}
                onPrevious={entityPagination.goPrevious}
                onNext={() =>
                  entityPagination.goNext(entityLogs.data?.pagination?.nextCursor)
                }
                onLimitChange={entityPagination.updateLimit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actors">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Historial por actor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <Field label="Modo">
                  <select
                    className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                    value={actorHistory.mode}
                    onChange={(event) =>
                      setActorHistory({
                        mode: event.target.value as "user" | "member",
                        actorId: "",
                      })
                    }
                  >
                    <option value="user">Actor user</option>
                    <option value="member">Actor member</option>
                  </select>
                </Field>
                <Field label="ID del actor">
                  <Input
                    className="h-11 rounded-2xl bg-white/70"
                    value={actorHistory.actorId}
                    onChange={(event) =>
                      setActorHistory((current) => ({
                        ...current,
                        actorId: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <ScrollPanel>
                {(actorHistory.mode === "user"
                  ? actorUserLogs.data?.items
                  : actorMemberLogs.data?.items
                )?.map((log) => (
                  <AuditLogRow
                    key={log.id}
                    log={log}
                    onViewEntity={setEntityHistory}
                    onViewActor={setActorHistory}
                    onSelectLog={setSelectedLogId}
                  />
                ))}
                {!actorUserLogs.isLoading &&
                  !actorMemberLogs.isLoading &&
                  actorHistory.actorId &&
                  !(actorHistory.mode === "user"
                    ? actorUserLogs.data?.items.length
                    : actorMemberLogs.data?.items.length) && (
                    <EmptyState text="No hay actividad para ese actor." />
                  )}
              </ScrollPanel>
              <CursorPagination
                meta={
                  actorHistory.mode === "user"
                    ? actorUserLogs.data?.pagination
                    : actorMemberLogs.data?.pagination
                }
                limit={actorPagination.limit}
                itemLabel="logs de actor"
                hasPreviousCursor={actorPagination.hasPreviousCursor}
                onPrevious={actorPagination.goPrevious}
                onNext={() =>
                  actorPagination.goNext(
                    actorHistory.mode === "user"
                      ? actorUserLogs.data?.pagination?.nextCursor
                      : actorMemberLogs.data?.pagination?.nextCursor,
                  )
                }
                onLimitChange={actorPagination.updateLimit}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function FiltersCard({
  dateFrom,
  dateTo,
  search,
  action,
  entityType,
  actions,
  entityTypes,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
  onActionChange,
  onEntityTypeChange,
}: {
  dateFrom: string;
  dateTo: string;
  search: string;
  action: string;
  entityType: string;
  actions: string[];
  entityTypes: string[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onEntityTypeChange: (value: string) => void;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardContent className="grid gap-4 p-5 md:grid-cols-5">
        <Field label="Desde">
          <Input className="h-11 rounded-2xl bg-white/70" type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
        </Field>
        <Field label="Hasta">
          <Input className="h-11 rounded-2xl bg-white/70" type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
        </Field>
        <Field label="Buscar">
          <Input className="h-11 rounded-2xl bg-white/70" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="accion, email, ip..." />
        </Field>
        <Field label="Accion">
          <select className="h-11 rounded-2xl border bg-white/70 px-3 text-sm" value={action} onChange={(event) => onActionChange(event.target.value)}>
            <option value="">Todas</option>
            {actions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Entidad">
          <select className="h-11 rounded-2xl border bg-white/70 px-3 text-sm" value={entityType} onChange={(event) => onEntityTypeChange(event.target.value)}>
            <option value="">Todas</option>
            {entityTypes.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-[1.5rem]">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function DimensionCard({
  title,
  items,
}: {
  title: string;
  items: { key: string; count: number }[];
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length ? (
          items.slice(0, 8).map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">{item.key}</span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))
        ) : (
          <EmptyState text="No hay datos en este rango." />
        )}
      </CardContent>
    </Card>
  );
}

function AuditLogRow({
  log,
  onViewEntity,
  onViewActor,
  onSelectLog,
}: {
  log: AuditLog;
  onViewEntity: (value: { entityType: string; entityId: string }) => void;
  onViewActor: (value: { mode: "user" | "member"; actorId: string }) => void;
  onSelectLog: (auditLogId: string) => void;
}) {
  const actorUserName = log.actorUser
    ? `${log.actorUser.firstName} ${log.actorUser.lastName}`
    : null;
  const actorMemberName = log.actorMember
    ? `${log.actorMember.user.firstName} ${log.actorMember.user.lastName}`
    : null;

  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{log.action}</p>
            <Badge variant="outline" className="rounded-full">{log.entityType}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat("es-NI", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(log.createdAt))}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {log.entityId && <span>Entidad: {log.entityId}</span>}
            {actorUserName && <span>Actor user: {actorUserName}</span>}
            {actorMemberName && <span>Actor member: {actorMemberName}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => onSelectLog(log.id)}>
            Ver detalle
          </Button>
          {log.entityId && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                onViewEntity({ entityType: log.entityType, entityId: log.entityId! })
              }
            >
              Entidad
            </Button>
          )}
          {log.actorUser?.id && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => onViewActor({ mode: "user", actorId: log.actorUser!.id })}
            >
              Actor user
            </Button>
          )}
          {log.actorMember?.id && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() =>
                onViewActor({ mode: "member", actorId: log.actorMember!.id })
              }
            >
              Actor member
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function AuditHeader({ log }: { log: AuditLog }) {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="rounded-full">{log.action}</Badge>
        <Badge variant="outline" className="rounded-full">{log.entityType}</Badge>
        {log.entityId && <Badge variant="outline" className="rounded-full">{log.entityId}</Badge>}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {new Intl.DateTimeFormat("es-NI", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(log.createdAt))}
      </p>
      {(log.actorUser || log.actorMember) && (
        <p className="mt-2 text-sm text-muted-foreground">
          Actor:{" "}
          {log.actorMember
            ? `${log.actorMember.user.firstName} ${log.actorMember.user.lastName}`
            : `${log.actorUser?.firstName} ${log.actorUser?.lastName}`}
        </p>
      )}
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-2xl border bg-muted/35 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <pre className="mt-3 overflow-auto rounded-xl bg-background p-3 text-xs leading-6">
        {JSON.stringify(value ?? null, null, 2)}
      </pre>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
