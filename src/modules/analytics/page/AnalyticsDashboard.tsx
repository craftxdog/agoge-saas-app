import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/shared/hooks/useAuth";
import { formatSystemLabel } from "@/shared/utils/labels";
import { CustomerAnalyticsView } from "../components/CustomerAnalyticsView";
import { useAnalyticsDashboard } from "../hooks/useAnalyticsDashboard";
import {
  useAnalyticsCatalog,
  useAnalyticsMembers,
  useAnalyticsOperations,
  useAnalyticsRevenue,
} from "../hooks/useAnalyticsResources";
import type { AnalyticsGroupBy } from "../schemas/analytics.schema";

const chartColors = ["#4f8f83", "#d99a5f", "#6f91b8", "#b56f6f", "#7b8f64"];

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const compact = (value: number) =>
  new Intl.NumberFormat("es-NI", { notation: "compact" }).format(value);

const formatBucket = (bucket: string) => {
  const date = new Date(bucket);
  if (Number.isNaN(date.getTime())) return bucket;
  return new Intl.DateTimeFormat("es-NI", {
    month: "short",
    day: "numeric",
  }).format(date);
};

type AnalyticsDashboardProps = {
  surface?: "tenant" | "self";
};

export const AnalyticsDashboard = ({
  surface = "tenant",
}: AnalyticsDashboardProps) => {
  const { activeMembership, hasPermission } = useAuth();
  const canReadTenantAnalytics = hasPermission("analytics.read");
  const [groupBy, setGroupBy] = useState<AnalyticsGroupBy>("day");
  const [activeTab, setActiveTab] = useState("overview");
  const query = { groupBy, top: 6 };
  const dashboard = useAnalyticsDashboard(query, {
    enabled: canReadTenantAnalytics,
  });
  const revenue = useAnalyticsRevenue(query, {
    enabled: canReadTenantAnalytics && activeTab === "revenue",
  });
  const members = useAnalyticsMembers(query, {
    enabled: canReadTenantAnalytics && activeTab === "members",
  });
  const operations = useAnalyticsOperations(query, {
    enabled: canReadTenantAnalytics && activeTab === "operations",
  });
  const catalog = useAnalyticsCatalog({
    enabled: canReadTenantAnalytics && activeTab === "catalog",
  });

  if (surface === "self") {
    return <CustomerAnalyticsView />;
  }

  if (!canReadTenantAnalytics) {
    return null;
  }

  const data = dashboard.data;
  const currency =
    data?.revenue.collected.currency ??
    activeMembership?.organization.defaultCurrency ??
    "USD";

  if (dashboard.isLoading) return <AnalyticsSkeleton />;

  if (dashboard.isError || !data) {
    return (
      <Card className="rounded-[2rem]">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <AlertTriangle className="size-10 text-destructive" />
          <div>
            <h2 className="text-xl font-semibold">No pudimos cargar analytics</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifica que el backend este corriendo, que el tenant tenga el
              modulo analytics habilitado y que tu usuario tenga `analytics.read`.
            </p>
          </div>
          <Button onClick={() => dashboard.refetch()} className="rounded-full">
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const trend = data.revenue.trend.map((point) => ({
    name: formatBucket(point.bucket),
    facturado: point.invoicedAmount,
    cobrado: point.collectedAmount,
    nuevos: point.newMembers,
    invitaciones: point.invitations,
  }));
  const memberTrend = data.members.trend.map((point) => ({
    name: formatBucket(point.bucket),
    nuevos: point.newMembers,
    invitaciones: point.invitations,
  }));

  const paymentStatus = data.revenue.statusBreakdown.map((item) => ({
    name: item.label,
    value: item.count,
  }));
  const hasMemberGrowth = data.members.trend.some(
    (point) => point.newMembers > 0 || point.invitations > 0,
  );

  return (
    <section className="grid gap-8">
      <div className="flex flex-col justify-between gap-4 rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.15),_rgba(217,154,95,0.12))] p-7 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Analitica ejecutiva
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Salud financiera, crecimiento y operacion del tenant.
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Datos generados desde la API para {activeMembership?.organization.name}.
            Ultima actualizacion:{" "}
            {new Intl.DateTimeFormat("es-NI", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(data.generatedAt))}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as AnalyticsGroupBy)}
          >
            <SelectTrigger className="h-11 min-w-36 rounded-full bg-white/70">
              <SelectValue placeholder="Agrupar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diario</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
              <SelectItem value="month">Mensual</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="h-11 rounded-full bg-white/70"
            onClick={() => dashboard.refetch()}
          >
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Facturado"
          value={money(data.revenue.invoiced.amount, currency)}
          icon={BadgeDollarSign}
        />
        <MetricCard
          label="Cobrado"
          value={money(data.revenue.collected.amount, currency)}
          helper={`${data.revenue.collectionRate.percentage.toFixed(1)}% de recuperacion`}
          icon={CheckCircle2}
        />
        <MetricCard
          label="Miembros activos"
          value={compact(data.members.activeMembers)}
          helper={`${data.members.newMembers} nuevos en el rango`}
          icon={UsersRound}
        />
        <MetricCard
          label="Cobertura horarios"
          value={`${data.operations.scheduleCoverageRate.percentage.toFixed(1)}%`}
          helper={`${data.operations.scheduledMembers} miembros con agenda`}
          icon={CalendarClock}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="overview" className="rounded-xl px-4 py-2">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-xl px-4 py-2">
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="members" className="rounded-xl px-4 py-2">
            Miembros
          </TabsTrigger>
          <TabsTrigger value="operations" className="rounded-xl px-4 py-2">
            Operaciones
          </TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-xl px-4 py-2">
            Catalogo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartPanel title="Ingresos por periodo">
          <ResponsiveContainer width="100%" height={330}>
            <AreaChart data={trend} margin={{ left: 0, right: 8 }}>
              <defs>
                <linearGradient id="collected" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#4f8f83" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#4f8f83" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="invoiced" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#d99a5f" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#d99a5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => compact(Number(value))}
              />
              <Tooltip formatter={(value) => money(Number(value), currency)} />
              <Legend verticalAlign="top" height={32} />
              <Area
                type="monotone"
                dataKey="facturado"
                stroke="#d99a5f"
                fill="url(#invoiced)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cobrado"
                stroke="#4f8f83"
                fill="url(#collected)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Estado de cobros">
          <ResponsiveContainer width="100%" height={330}>
            <PieChart>
              <Pie
                data={paymentStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {paymentStatus.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Crecimiento de miembros">
          {hasMemberGrowth ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={32} />
                <Bar dataKey="nuevos" fill="#4f8f83" radius={[10, 10, 0, 0]} />
                <Bar
                  dataKey="invitaciones"
                  fill="#d99a5f"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              title="Aun no hay crecimiento en este rango"
              description="Cuando agregues miembros o acepten invitaciones, la API empezara a poblar esta serie."
            />
          )}
        </ChartPanel>

        <ChartPanel title="Top conceptos de pago">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenue.topPaymentTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => compact(Number(value))}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => money(Number(value), currency)} />
              <Bar dataKey="amount" fill="#6f91b8" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle>Operacion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <OperationRow label="Sedes activas" value={data.operations.activeLocations} />
            <OperationRow
              label="Ventanas de horario"
              value={data.operations.businessHourWindows}
            />
            <OperationRow
              label="Notificaciones sin leer"
              value={data.operations.unreadNotifications}
            />
            <OperationRow label="Eventos auditados" value={data.operations.auditEvents} />
            <OperationRow
              label="Modulos habilitados"
              value={data.operations.enabledModulesCount}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle>Insights accionables</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.insights.length ? (
              data.insights.map((insight) => (
                <div
                  key={`${insight.metricKey}-${insight.title}`}
                  className="rounded-2xl border bg-white/60 p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {insight.severity}
                  </span>
                  <h3 className="mt-2 font-semibold">{insight.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {insight.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay insights criticos para este rango.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="revenue">
          <EndpointCard
            title="Analitica de ingresos"
            isLoading={revenue.isLoading}
            empty={!revenue.data}
          >
            {revenue.data && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Facturado"
                  value={money(revenue.data.invoiced.amount, revenue.data.invoiced.currency)}
                  icon={BadgeDollarSign}
                />
                <MetricCard
                  label="Cobrado"
                  value={money(revenue.data.collected.amount, revenue.data.collected.currency)}
                  icon={CheckCircle2}
                />
                <MetricCard
                  label="Pendiente"
                  value={money(revenue.data.outstanding.amount, revenue.data.outstanding.currency)}
                  icon={BarChart3}
                />
                <MetricCard
                  label="Vencido"
                  value={money(revenue.data.overdue.amount, revenue.data.overdue.currency)}
                  icon={AlertTriangle}
                />
                <ListMetricCard
                  title="Desglose por estado"
                  items={revenue.data.statusBreakdown.map((item) => ({
                    label: item.label,
                    value: item.count,
                  }))}
                />
                <ListMetricCard
                  title="Cobrado por metodo"
                  items={revenue.data.collectedByMethod.map((item) => ({
                    label: item.label,
                    value: money(item.amount, item.currency),
                  }))}
                />
              </div>
            )}
          </EndpointCard>
        </TabsContent>

        <TabsContent value="members">
          <EndpointCard
            title="Analitica de miembros"
            isLoading={members.isLoading}
            empty={!members.data}
          >
            {members.data && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Miembros actuales" value={compact(members.data.currentMembers)} icon={UsersRound} />
                <MetricCard label="Miembros activos" value={compact(members.data.activeMembers)} icon={UsersRound} />
                <MetricCard label="Invitados" value={compact(members.data.invitedMembers)} icon={UsersRound} />
                <MetricCard
                  label="Tasa de aceptacion"
                  value={`${members.data.invitationAcceptanceRate.percentage.toFixed(1)}%`}
                  icon={CheckCircle2}
                />
                <ListMetricCard
                  title="Desglose por estado"
                  items={members.data.statusBreakdown.map((item) => ({
                    label: item.label,
                    value: item.count,
                  }))}
                />
              </div>
            )}
          </EndpointCard>
        </TabsContent>

        <TabsContent value="operations">
          <EndpointCard
            title="Analitica operativa"
            isLoading={operations.isLoading}
            empty={!operations.data}
          >
            {operations.data && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Sedes" value={operations.data.totalLocations} icon={CalendarClock} />
                <MetricCard label="Sedes activas" value={operations.data.activeLocations} icon={CalendarClock} />
                <MetricCard label="Miembros agendados" value={operations.data.scheduledMembers} icon={UsersRound} />
                <MetricCard
                  label="Cobertura"
                  value={`${operations.data.scheduleCoverageRate.percentage.toFixed(1)}%`}
                  icon={CheckCircle2}
                />
                <ListMetricCard
                  title="Acciones de auditoria"
                  items={operations.data.topAuditActions.map((item) => ({
                    label: item.label,
                    value: item.count,
                  }))}
                />
                <ListMetricCard
                  title="Modulos habilitados"
                  items={operations.data.enabledModules.map((item) => ({
                    label: formatSystemLabel(item),
                    value: "activo",
                  }))}
                />
              </div>
            )}
          </EndpointCard>
        </TabsContent>

        <TabsContent value="catalog">
          <EndpointCard
            title="Catalogo analitico"
            isLoading={catalog.isLoading}
            empty={!catalog.data}
          >
            {catalog.data && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ListMetricCard
                  title="Conceptos de cobro"
                  items={catalog.data.paymentTypes.map((item) => ({
                    label: item.label,
                    value: item.key,
                  }))}
                />
                <ListMetricCard
                  title="Metodos de pago"
                  items={catalog.data.paymentMethods.map((item) => ({
                    label: item.label,
                    value: item.key,
                  }))}
                />
                <ListMetricCard
                  title="Sedes"
                  items={catalog.data.locations.map((item) => ({
                    label: item.label,
                    value: item.key,
                  }))}
                />
                <ListMetricCard
                  title="Monedas y modulos"
                  items={[
                    ...catalog.data.currencies.map((item) => ({
                      label: item,
                      value: "currency",
                    })),
                    ...catalog.data.enabledModules.map((item) => ({
                      label: item,
                      value: "module",
                    })),
                  ]}
                />
              </div>
            )}
          </EndpointCard>
        </TabsContent>
      </Tabs>
    </section>
  );
};

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-[1.5rem]">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          {helper && <p className="mt-2 text-sm text-muted-foreground">{helper}</p>}
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function ChartPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function OperationRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function EmptyChartState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid h-[300px] place-items-center rounded-3xl border border-dashed bg-muted/35 p-8 text-center">
      <div className="max-w-sm">
        <UsersRound className="mx-auto size-10 text-primary" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <section className="grid gap-6">
      <Skeleton className="h-48 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Skeleton className="h-[430px] rounded-[1.75rem]" />
        <Skeleton className="h-[430px] rounded-[1.75rem]" />
      </div>
    </section>
  );
}

function EndpointCard({
  title,
  isLoading,
  empty,
  children,
}: {
  title: string;
  isLoading: boolean;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-[1.5rem]" />
            ))}
          </div>
        ) : empty ? (
          <p className="text-sm text-muted-foreground">
            No hay datos disponibles para este endpoint.
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function ListMetricCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string | number }[];
}) {
  return (
    <Card className="rounded-[1.5rem] xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length ? (
          items.slice(0, 8).map((item) => (
            <div key={`${title}-${item.label}`} className="flex items-center justify-between rounded-2xl bg-muted/55 px-4 py-3">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sin elementos.</p>
        )}
      </CardContent>
    </Card>
  );
}
