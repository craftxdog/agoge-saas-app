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
import { useAuth } from "@/shared/hooks/useAuth";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";

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
    enabledModules,
    permissions,
    hasPermission,
  } = useAuth();
  const switchOrganization = useSwitchOrganization();

  const visibleModules = moduleCards.filter((module) =>
    enabledModules.includes(module.key) && hasPermission(module.permission),
  );
  const isCustomerExperience =
    activeMembership?.roles.includes("customer") &&
    !permissions.includes("users.read");

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
            puede iniciar una sesion tenant-scoped enviando el slug o id de la
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
                    {membership.organization.slug} · {membership.roles.join(", ")}
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
    <section className="grid gap-8">
      <div className="overflow-hidden rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(111,162,154,0.16),_rgba(238,181,128,0.14))] p-8 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            {activeMembership.organization.name}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
            {isCustomerExperience
              ? `Hola, ${user?.firstName}. Este es tu portal de cliente.`
              : `Bienvenido, ${user?.firstName}. Tu workspace ya esta conectado al modelo SaaS.`}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {isCustomerExperience
              ? "Tu inicio se adapta a los permisos reales de tu membresia para mostrar solo pagos, agenda y funciones de autoservicio autorizadas."
              : "El menu se construye con los modulos y permisos que vienen en tu membresia activa."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Modulos activos" value={enabledModules.length} />
        <SummaryCard label="Permisos" value={permissions.length} />
        <SummaryCard label="Roles" value={activeMembership.roles.length} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleModules.map((module) => (
          <Card key={module.key} className="rounded-[1.5rem]">
            <CardHeader>
              <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <module.icon className="size-5" />
              </div>
              <CardTitle>{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
              <Button asChild variant="outline" className="justify-between rounded-full">
                <Link to={module.href}>
                  Abrir
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!visibleModules.length && (
        <Card className="rounded-[1.5rem]">
          <CardContent className="p-6">
            <p className="font-semibold">No hay modulos visibles para este rol</p>
            <p className="mt-2 text-sm text-muted-foreground">
              El dashboard ya esta filtrando por permisos reales. Si este usuario
              sera `customer`, conviene habilitar solo endpoints de autoservicio
              para no exponer datos globales del tenant.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[1.5rem]">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
        <ShieldCheck className="size-9 text-primary" />
      </CardContent>
    </Card>
  );
}
