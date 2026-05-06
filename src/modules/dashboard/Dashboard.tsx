import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CreditCard,
  FolderKanban,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useBillingSummary,
  useMemberBillingSummary,
  useMemberPayments,
} from "@/modules/billing/hooks/useBilling";
import type { BillingSummary, Payment } from "@/modules/billing/schemas/billing.schema";
import {
  useAnalyticsDashboard,
  useSelfAnalyticsDashboard,
} from "@/modules/analytics/hooks/useAnalyticsDashboard";
import type { AnalyticsDashboard as AnalyticsDashboardData } from "@/modules/analytics/schemas/analytics.schema";
import { useActivity, useActivitySummary } from "@/modules/activity/hooks/useActivity";
import { useNotificationSummary } from "@/modules/notifications/hooks/useNotifications";
import { getNotificationTitle } from "@/modules/notifications/utils/notification-copy";
import { useCurrentMemberSchedules } from "@/modules/schedules/hooks/useSchedules";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSidebarRoutes } from "@/shared/hooks/useSidebarRoutes";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";
import { useNavigationContext } from "@/shared/providers/navigation-provider";
import { formatSystemLabel } from "@/shared/utils/labels";

type DashboardRoute = {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
  items?: DashboardRoute[];
};

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
  const { isCustomerPortal } = useAccessContext();
  const { defaultPath } = useNavigationContext();
  const sidebarRoutes = useSidebarRoutes();
  const switchOrganization = useSwitchOrganization();
  const visibleModules = sidebarRoutes as DashboardRoute[];
  const isCustomerExperience = isCustomerPortal;
  const canReadAnalytics = hasPermission("analytics.read");
  const canReadSelfAnalytics = hasPermission("analytics.self.read");
  const canReadBilling = hasPermission("billing.read");
  const canReadSelfBilling = hasPermission("billing.self.read");
  const canReadNotifications = hasPermission("notifications.read");
  const canReadSelfActivity = hasPermission("notifications.self.read");
  const canReadSelfSchedules = hasPermission("schedules.self.read");
  const analyticsHref =
    visibleModules.find((route) => route.url.includes("/analytics"))?.url ??
    defaultPath;
  const billingHref =
    visibleModules.find((route) => route.url.includes("/billing"))?.url ??
    defaultPath;
  const schedulesHref =
    visibleModules.find((route) => route.url.includes("/schedules"))?.url ??
    defaultPath;
  const usersHref =
    visibleModules.find((route) => route.url.includes("/users"))?.url ??
    defaultPath;
  const activityHref =
    visibleModules.find((route) => route.url.includes("/activity"))?.url ??
    defaultPath;

  const analyticsDashboard = useAnalyticsDashboard(
    { groupBy: "month" },
    { enabled: canReadAnalytics },
  );
  const selfAnalyticsDashboard = useSelfAnalyticsDashboard(
    { groupBy: "month", top: 6 },
    { enabled: isCustomerExperience && canReadSelfAnalytics },
  );
  const billingSummary = useBillingSummary({
    enabled: canReadBilling,
    staleTime: 1000 * 60,
  });
  const selfBillingSummary = useMemberBillingSummary({
    enabled: isCustomerExperience && canReadSelfBilling,
    staleTime: 1000 * 30,
  });
  const notificationSummary = useNotificationSummary({
    enabled: canReadNotifications,
  });
  const activitySummary = useActivitySummary({
    enabled: isCustomerExperience && canReadSelfActivity,
  });
  const activityFeed = useActivity(
    {
      limit: 4,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    {
      enabled: isCustomerExperience && canReadSelfActivity,
    },
  );
  const customerPayments = useMemberPayments(
    {
      sortBy: "dueDate",
      sortDirection: "desc",
      limit: 8,
    },
    { enabled: isCustomerExperience && canReadSelfBilling },
  );
  const customerSchedules = useCurrentMemberSchedules(undefined, {
    enabled: isCustomerExperience && canReadSelfSchedules,
  });

  const ownPayments = customerPayments.data?.items ?? [];
  const openPayments = ownPayments.filter(
    (payment) => !["PAID", "CANCELLED", "REFUNDED"].includes(payment.status),
  );
  const overduePayments = ownPayments.filter(
    (payment) => payment.status === "OVERDUE",
  );
  const nextDueDate = openPayments[0]?.dueDate;
  const dashboardData = analyticsDashboard.data;
  const personalActivity =
    activityFeed.data?.items ??
    selfAnalyticsDashboard.data?.activity.recentNotifications.map((item) => ({
      ...item,
    })) ??
    [];
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
      unreadActivity={activitySummary.data?.unreadCount ?? 0}
      payments={ownPayments}
      activityItems={personalActivity}
      modules={visibleModules}
      summary={selfBillingSummary.data}
      billingHref={billingHref}
      schedulesHref={schedulesHref}
      activityHref={activityHref}
    />
  ) : (
    <AdminDashboard
      organizationName={activeMembership.organization.name}
      firstName={user?.firstName ?? "Equipo"}
      roleLabel={activeMembership.roles
        .map((role) => formatSystemLabel(role))
        .join(" · ")}
      visibleModules={visibleModules}
      analyticsHref={analyticsHref}
      billingHref={billingHref}
      schedulesHref={schedulesHref}
      usersHref={usersHref}
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
  analyticsHref,
  billingHref,
  schedulesHref,
  usersHref,
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
  visibleModules: DashboardRoute[];
  analyticsHref: string;
  billingHref: string;
  schedulesHref: string;
  usersHref: string;
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
      href: billingHref,
    },
    {
      label: "Agenda operativa",
      value: operations ? `${operations.upcomingExceptions} excepcion(es)` : "Sin datos",
      helper: operations
        ? `${operations.activeLocations}/${operations.totalLocations} sedes activas`
        : "Analitica operativa no disponible",
      href: schedulesHref,
    },
    {
      label: "Actividad del equipo",
      value: members ? `${members.currentMembers} miembros actuales` : "Sin datos",
      helper: members
        ? `${members.pendingInvitations} invitacion(es) pendientes`
        : `${permissionsCount} permisos visibles en la sesion`,
      href: usersHref,
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
                <Link to={analyticsHref}>
                  Ver analitica completa
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to={billingHref}>Atender cobros</Link>
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
          <Card key={module.url} className="rounded-[1.35rem] border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <module.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Acceso operativo visible segun la navegacion autorizada por la API.
              </p>
              <Button asChild variant="outline" className="justify-between rounded-xl">
                <Link to={module.url}>
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
  unreadActivity,
  payments,
  activityItems,
  modules,
  summary,
  billingHref,
  schedulesHref,
  activityHref,
}: {
  firstName: string;
  openPayments: Payment[];
  overduePayments: Payment[];
  nextDueDate?: string;
  scheduleCount: number;
  unreadActivity: number;
  payments: Payment[];
  activityItems: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
  modules: DashboardRoute[];
  summary?: BillingSummary;
  billingHref: string;
  schedulesHref: string;
  activityHref: string;
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
                <Link to={billingHref}>Revisar mis cobros</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to={schedulesHref}>Ver mi agenda</Link>
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
            <MiniState
              label="Actividad nueva"
              value={`${unreadActivity} aviso(s)`}
              helper="Eventos personales pendientes por revisar"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
        <MetricCard
          label="Saldo abierto"
          value={formatCurrency(summary?.openBalance)}
          helper="Pendiente total de tu cuenta"
          icon={Wallet}
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
              Mi actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {activityItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.15rem] border border-border/70 bg-muted/15 px-4 py-4"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatDateTime(item.createdAt)}
                </p>
              </div>
            ))}

            {!activityItems.length ? (
              <div className="rounded-[1.15rem] border border-dashed p-4 text-sm text-muted-foreground">
                No tienes actividad personal reciente por ahora.
              </div>
            ) : null}

            <Button asChild variant="outline" className="justify-between rounded-xl">
              <Link to={activityHref}>
                Abrir mi actividad
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => (
          <Card key={module.url} className="rounded-[1.35rem] border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <module.icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Vista disponible segun los permisos activos de tu perfil.
              </p>
              <Button asChild variant="outline" className="justify-between rounded-xl">
                <Link to={module.url}>
                  Abrir seccion
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
