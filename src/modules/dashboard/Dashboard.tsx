import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  ChevronRight,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePayments } from "@/modules/billing/hooks/useBilling";
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
  const customerPayments = usePayments(
    {
      memberId: memberId ?? undefined,
      sortBy: "dueDate",
      sortDirection: "desc",
      limit: 12,
    },
    { enabled: Boolean(memberId) && isCustomerPortal },
  );
  const customerSchedules = useMemberSchedules(memberId ?? undefined, undefined);

  const visibleModules = moduleCards.filter((module) =>
    accessibleModules.includes(module.key) && hasPermission(module.permission),
  );
  const isCustomerExperience = isCustomerPortal;
  const ownPayments = customerPayments.data?.items ?? [];
  const openPayments = ownPayments.filter(
    (payment) => !["PAID", "CANCELLED", "REFUNDED"].includes(payment.status),
  );
  const overduePayments = ownPayments.filter((payment) => payment.status === "OVERDUE");
  const nextDueDate = openPayments[0]?.dueDate;

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
            Tu usuario pertenece a {memberships.length} organizacion(es). La API
            puede iniciar una sesion segmentada por organizacion enviando el slug o id de la
            organizacion en el login.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {memberships.map((membership) => (
            <Card key={membership.id} className="rounded-[1.5rem]">
              <CardContent className="grid gap-4 p-6">
                <div>
                  <p className="font-semibold">{membership.organization.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {membership.organization.slug} · {membership.roles.map((role) => formatSystemLabel(role)).join(", ")}
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

  return (
    <section className="grid gap-6">
      <div className="rounded-[1.6rem] border bg-card px-7 py-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              {activeMembership.organization.name}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {isCustomerExperience
                ? `Hola, ${user?.firstName}. Este es tu portal de cliente.`
                : `Bienvenido, ${user?.firstName}.`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {isCustomerExperience
                ? "Tu panel muestra solo los modulos y datos autorizados para autoservicio."
                : "Este espacio se adapta a la membresia activa, los modulos habilitados y los permisos que entrega la API."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
            <SummaryCard
              label={isCustomerExperience ? "Modulos visibles" : "Modulos activos"}
              value={visibleModules.length}
            />
            <SummaryCard
              label={isCustomerExperience ? "Cobros abiertos" : "Permisos"}
              value={isCustomerExperience ? openPayments.length : permissions.length}
            />
            <SummaryCard
              label={isCustomerExperience ? "Bloques agenda" : "Roles"}
              value={
                isCustomerExperience
                  ? (customerSchedules.data?.length ?? 0)
                  : activeMembership.roles.length
              }
            />
          </div>
        </div>
      </div>

      {isCustomerExperience ? (
        <div className="grid gap-4 md:grid-cols-3">
          <CustomerInsightCard
            label="Tus cobros pendientes"
            value={String(openPayments.length)}
            helper={
              nextDueDate
                ? `Proximo vencimiento: ${new Intl.DateTimeFormat("es-NI", {
                    dateStyle: "medium",
                  }).format(new Date(nextDueDate))}`
                : "No tienes vencimientos pendientes"
            }
          />
          <CustomerInsightCard
            label="Cobros vencidos"
            value={String(overduePayments.length)}
            helper="Solo incluye cargos asignados a tu membresia"
          />
          <CustomerInsightCard
            label="Disponibilidad cargada"
            value={String(customerSchedules.data?.length ?? 0)}
            helper="Bloques semanales visibles para tu usuario"
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleModules.map((module) => (
          <Card key={module.key} className="rounded-[1.35rem] border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <module.icon className="size-5" />
              </div>
              <CardTitle className="text-xl">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
              <Button asChild variant="outline" className="justify-between rounded-xl">
                <Link to={module.href}>
                  Abrir modulo
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!visibleModules.length && (
        <Card className="rounded-[1.35rem] border bg-card shadow-sm">
          <CardContent className="p-6">
            <p className="font-semibold">No hay modulos visibles para este rol</p>
            <p className="mt-2 text-sm text-muted-foreground">
              El dashboard ya esta filtrando por permisos reales. Si este usuario
              sera `customer`, conviene habilitar solo endpoints de autoservicio
              para no exponer datos globales de la organizacion.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[1.2rem] border bg-card shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function CustomerInsightCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[1.2rem] border bg-card shadow-sm">
      <CardContent className="p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
