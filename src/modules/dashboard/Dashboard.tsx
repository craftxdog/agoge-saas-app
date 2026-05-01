import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  CreditCard,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UsersRound,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useBillingSummary,
  usePayments,
} from "@/modules/billing/hooks/useBilling";
import type { BillingSummary, Payment } from "@/modules/billing/schemas/billing.schema";
import { useAnalyticsDashboard } from "@/modules/analytics/hooks/useAnalyticsDashboard";
import type { AnalyticsDashboard as AnalyticsDashboardData } from "@/modules/analytics/schemas/analytics.schema";
import { useNotificationSummary } from "@/modules/notifications/hooks/useNotifications";
import { getNotificationTitle } from "@/modules/notifications/utils/notification-copy";
import { useMemberSchedules } from "@/modules/schedules/hooks/useSchedules";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";
import { formatSystemLabel } from "@/shared/utils/labels";

const moduleCards = [
  {
    key: "users",
    permission: "users.read",
    title: "Miembros",
    description: "Directorio, invitaciones, roles y estados de membresia.",
    href: "/app/users",
    icon: UsersRound,
  },
  {
    key: "billing",
    permission: "billing.read",
    title: "Cobros",
    description: "Conceptos, facturas, metodos y transacciones.",
    href: "/app/billing",
    icon: BadgeDollarSign,
  },
  {
    key: "schedules",
    permission: "schedules.read",
    title: "Horarios",
    description: "Sedes, horas operativas y disponibilidad semanal.",
    href: "/app/schedules",
    icon: CalendarClock,
  },
  {
    key: "analytics",
    permission: "analytics.read",
    title: "Analitica",
    description: "KPIs, ingresos, crecimiento y operaciones.",
    href: "/app/analytics",
    icon: BarChart3,
  },
];

const formatCurrency = (value: string | number | undefined, currency = "USD") =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Sin actividad";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function Dashboard() {
  const {
    user,
    activeMembership,
    memberships,
    permissions,
    hasPermission,
  } = useAuth();
  const {
    isCustomerPortal,
    memberId,
    visibleModules: accessibleModules,
  } = useAccessContext();
  const switchOrganization = useSwitchOrganization();
  const visibleModules = moduleCards.filter((module) =>
    accessibleModules.includes(module.key) && hasPermission(module.permission),
  );
  const isCustomerExperience = isCustomerPortal;
  const canReadAnalytics =
    !isCustomerExperience &&
    accessibleModules.includes("analytics") &&
    hasPermission("analytics.read");
  const canReadBilling =
    !isCustomerExperience &&
    accessibleModules.includes("billing") &&
    hasPermission("billing.read");
  const canReadNotifications =
    !isCustomerExperience &&
    accessibleModules.includes("notifications") &&
    hasPermission("notifications.read");

  const analyticsDashboard = useAnalyticsDashboard(
    { groupBy: "month" },
    { enabled: canReadAnalytics },
  );
  const billingSummary = useBillingSummary({
    enabled: canReadBilling,
    staleTime: 1000 * 60,
  });
  const notificationSummary = useNotificationSummary({
    enabled: canReadNotifications,
  });
  const customerPayments = usePayments(
    {
      memberId: memberId ?? undefined,
      sortBy: "dueDate",
      sortDirection: "desc",
      limit: 8,
    },
    { enabled: Boolean(memberId) && isCustomerPortal },
  );
  const customerSchedules = useMemberSchedules(memberId ?? undefined, undefined);

  const ownPayments = customerPayments.data?.items ?? [];
  const openPayments = ownPayments.filter(
    (payment) => !["PAID", "CANCELLED", "REFUNDED"].includes(payment.status),
  );
  const overduePayments = ownPayments.filter(
    (payment) => payment.status === "OVERDUE",
  );
  const nextDueDate = openPayments[0]?.dueDate;
  const dashboardData = analyticsDashboard.data;
  const adminNotifications =
    notificationSummary.data?.recent?.map((item) => ({
      id: item.id,
      title: getNotificationTitle(item),
      message: item.message,
      occurredAt: item.createdAt,
      isRead: item.isRead,
    })) ??
    dashboardData?.operations.recentNotifications.map((item) => ({
      id: item.id,
      title: getNotificationTitle(item),
      message: item.message,
      occurredAt: item.createdAt,
      isRead: item.isRead,
    })) ??
    [];

  if (!activeMembership) {
    return (
      <section className="grid gap-6">
        <div className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Sesion sin organizacion activa
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Selecciona una organizacion para cargar tus modulos.
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Tu usuario pertenece a {memberships.length} organizacion(es). La sesion
            tenant-scoped define permisos, datos y notificaciones visibles.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => (
            <Card key={membership.id} className="rounded-[1.5rem]">
              <CardContent className="grid gap-4 p-6">
                <div>
                  <p className="font-semibold">{membership.organization.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {membership.organization.slug} ·{" "}
                    {membership.roles
                      .map((role) => formatSystemLabel(role))
                      .join(", ")}
                  </p>
                </div>
                <Button
                  className="w-fit rounded-full"
                  disabled={switchOrganization.isPending}
                  onClick={() =>
                    switchOrganization.mutate(membership.organization.id)
                  }
                >
                  Entrar a esta organizacion
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return isCustomerExperience ? (
    <CustomerDashboard
      firstName={user?.firstName ?? "Usuario"}
      openPayments={openPayments}
      overduePayments={overduePayments}
      nextDueDate={nextDueDate}
      scheduleCount={customerSchedules.data?.length ?? 0}
      payments={ownPayments}
      modules={visibleModules}
    />
  ) : (
    <AdminDashboard
      organizationName={activeMembership.organization.name}
      firstName={user?.firstName ?? "Equipo"}
      roleLabel={activeMembership.roles
        .map((role) => formatSystemLabel(role))
        .join(" · ")}
      visibleModules={visibleModules}
      permissionsCount={permissions.length}
      analyticsDashboard={dashboardData}
      analyticsLoading={analyticsDashboard.isLoading}
      billingSummary={billingSummary.data}
      notifications={adminNotifications}
      unreadNotifications={notificationSummary.data?.unreadCount ?? 0}
    />
  );
}

function AdminDashboard({
  organizationName,
  firstName,
  roleLabel,
  visibleModules,
  permissionsCount,
  analyticsDashboard,
  analyticsLoading,
  billingSummary,
  notifications,
  unreadNotifications,
}: {
  organizationName: string;
  firstName: string;
  roleLabel: string;
  visibleModules: typeof moduleCards;
  permissionsCount: number;
  analyticsDashboard?: AnalyticsDashboardData;
  analyticsLoading: boolean;
  billingSummary?: BillingSummary;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    occurredAt: string;
    isRead: boolean;
  }>;
  unreadNotifications: number;
}) {
  const revenue = analyticsDashboard?.revenue;
  const operations = analyticsDashboard?.operations;
  const members = analyticsDashboard?.members;
  const executiveCards = [
    {
      label: "Facturado",
      value: revenue
        ? formatCurrency(revenue.invoiced.amount, revenue.invoiced.currency)
        : billingSummary
          ? formatCurrency(billingSummary.openBalance)
          : "Cargando...",
      helper: "Volumen del periodo en curso",
      icon: Wallet,
    },
    {
      label: "Cobrado",
      value: revenue
        ? formatCurrency(revenue.collected.amount, revenue.collected.currency)
        : billingSummary
          ? formatCurrency(billingSummary.paidThisMonth)
          : "Cargando...",
      helper: "Ingresos realmente capturados",
      icon: CreditCard,
    },
    {
      label: "Pendiente",
      value: revenue
        ? formatCurrency(revenue.outstanding.amount, revenue.outstanding.currency)
        : billingSummary
          ? formatCurrency(billingSummary.openBalance)
          : "Cargando...",
      helper: "Saldo abierto por gestionar",
      icon: TriangleAlert,
    },
    {
      label: "Cobertura",
      value: revenue ? `${revenue.collectionRate.percentage.toFixed(1)}%` : "Cargando...",
      helper: "Tasa de cobro del periodo",
      icon: TrendingUp,
    },
  ];
  const focusItems = [
    {
      label: "Alertas de cobro",
      value: billingSummary
        ? `${billingSummary.overduePayments} vencido(s)`
        : "Sin resumen aun",
      helper: billingSummary
        ? `Saldo comprometido ${formatCurrency(billingSummary.overdueBalance)}`
        : "Conecta billing summary para priorizar cobranza",
      href: "/app/billing",
    },
    {
      label: "Agenda operativa",
      value: operations ? `${operations.upcomingExceptions} excepcion(es)` : "Sin datos",
      helper: operations
        ? `${operations.activeLocations}/${operations.totalLocations} sedes activas`
        : "Analitica operativa no disponible",
      href: "/app/schedules",
    },
    {
      label: "Actividad del equipo",
      value: members ? `${members.currentMembers} miembros actuales` : "Sin datos",
      helper: members
        ? `${members.pendingInvitations} invitacion(es) pendientes`
        : `${permissionsCount} permisos visibles en la sesion`,
      href: "/app/users",
    },
  ];

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.95fr]">
        <Card className="overflow-hidden rounded-[1.8rem] border-0 bg-[linear-gradient(135deg,rgba(79,143,131,0.16),rgba(217,154,95,0.14),rgba(255,255,255,0.96))] shadow-sm">
          <CardContent className="p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full">Panel ejecutivo</Badge>
              <Badge variant="outline" className="rounded-full">
                {organizationName}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {roleLabel}
              </Badge>
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {firstName}, aqui esta lo importante para operar hoy.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              Este dashboard prioriza caja, riesgo operativo y actividad reciente
              para que tomes decisiones rapido sin perderte en modulos.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link to="/app/analytics">
                  Ver analitica completa
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/app/billing">Atender cobros</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Estado de la organizacion
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <MiniState
              label="Modulos visibles"
              value={String(visibleModules.length)}
              helper="Solo lo realmente autorizado para esta membresia"
            />
            <MiniState
              label="Notificaciones sin leer"
              value={String(unreadNotifications)}
              helper="Centro operativo compartido del tenant"
            />
            <MiniState
              label="Ultimo corte"
              value={analyticsDashboard ? formatDateTime(analyticsDashboard.generatedAt) : "Pendiente"}
              helper={
                analyticsLoading
                  ? "Cargando consolidado..."
                  : "Resumen generado con datos disponibles de API"
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.6rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="size-5 text-primary" />
              Foco operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {focusItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-base font-semibold text-foreground">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.helper}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.6rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="size-5 text-primary" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {notifications.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {!item.isRead ? (
                    <Badge className="rounded-full">Nuevo</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatDateTime(item.occurredAt)}
                </p>
              </div>
            ))}

            {!notifications.length ? (
              <div className="rounded-[1.15rem] border border-dashed p-4 text-sm text-muted-foreground">
                No hay actividad reciente para mostrar en este momento.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleModules.map((module) => (
          <Card key={module.key} className="rounded-[1.35rem] border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <module.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
              <Button asChild variant="outline" className="justify-between rounded-xl">
                <Link to={module.href}>
                  Abrir modulo
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CustomerDashboard({
  firstName,
  openPayments,
  overduePayments,
  nextDueDate,
  scheduleCount,
  payments,
  modules,
}: {
  firstName: string;
  openPayments: Payment[];
  overduePayments: Payment[];
  nextDueDate?: string;
  scheduleCount: number;
  payments: Payment[];
  modules: typeof moduleCards;
}) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        <Card className="overflow-hidden rounded-[1.8rem] border-0 bg-[linear-gradient(135deg,rgba(79,143,131,0.16),rgba(255,255,255,0.96))] shadow-sm">
          <CardContent className="p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full">Portal personal</Badge>
              <Badge variant="outline" className="rounded-full">
                Autoservicio
              </Badge>
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Hola, {firstName}. Aqui tienes un resumen claro de tu cuenta.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Reunimos tus cobros pendientes, tu agenda visible y los accesos mas
              importantes para que resuelvas todo rapido.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link to="/app/billing">Revisar mis cobros</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/app/schedules">Ver mi agenda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="size-5 text-primary" />
              Tu estado actual
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <MiniState
              label="Proximo vencimiento"
              value={nextDueDate ? formatDate(nextDueDate) : "Sin pendientes"}
              helper="Fecha mas cercana de tus cargos abiertos"
            />
            <MiniState
              label="Agenda visible"
              value={`${scheduleCount} bloque(s)`}
              helper="Disponibilidad y horarios asociados a tu usuario"
            />
            <MiniState
              label="Accesos habilitados"
              value={`${modules.length} modulo(s)`}
              helper="Solo informacion autorizada para tu perfil"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Cobros pendientes"
          value={String(openPayments.length)}
          helper="Cargos aun abiertos en tu cuenta"
          icon={Wallet}
        />
        <MetricCard
          label="Cobros vencidos"
          value={String(overduePayments.length)}
          helper="Requieren atencion prioritaria"
          icon={TriangleAlert}
        />
        <MetricCard
          label="Bloques de agenda"
          value={String(scheduleCount)}
          helper="Horarios visibles para tu membresia"
          icon={CalendarClock}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.6rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-primary" />
              Tus cobros recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {payments.slice(0, 4).map((payment) => (
              <div
                key={payment.id}
                className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {payment.paymentType?.name ?? payment.invoiceNumber ?? "Cobro"}
                  </p>
                  <Badge variant="outline" className="rounded-full">
                    {formatSystemLabel(payment.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vence {formatDate(payment.dueDate)} · saldo{" "}
                  {formatCurrency(payment.balance, payment.currency)}
                </p>
              </div>
            ))}

            {!payments.length ? (
              <div className="rounded-[1.15rem] border border-dashed p-4 text-sm text-muted-foreground">
                No tienes cobros recientes cargados en este momento.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[1.6rem] border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FolderKanban className="size-5 text-primary" />
              Accesos rapidos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {modules.map((module) => (
              <Link
                key={module.key}
                to={module.href}
                className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{module.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Wallet;
}) {
  return (
    <Card className="rounded-[1.35rem] border bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function MiniState({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}
