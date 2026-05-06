import { BarChart3, Bell, CalendarClock, TriangleAlert, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelfAnalyticsDashboard } from "../hooks/useAnalyticsDashboard";

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export function CustomerAnalyticsView() {
  const dashboard = useSelfAnalyticsDashboard({ groupBy: "month", top: 6 });
  const data = dashboard.data;
  const currency = data?.collected.currency ?? data?.invoiced.currency ?? "USD";

  if (dashboard.isLoading) {
    return (
      <section className="grid gap-6">
        <Skeleton className="h-44 rounded-[2rem]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-[1.75rem]" />
          ))}
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="grid gap-6">
        <Card className="rounded-[1.75rem]">
          <CardContent className="p-8 text-sm text-muted-foreground">
            No pudimos cargar tu analitica personal por el momento.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Analitica personal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Tu resumen de pagos, agenda y actividad
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Esta vista resume solo tu comportamiento financiero y tu disponibilidad.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Wallet}
          label="Facturado"
          value={money(data.invoiced.amount, currency)}
          helper="Total emitido a tu cuenta"
        />
        <MetricCard
          icon={Wallet}
          label="Cobrado"
          value={money(data.collected.amount, currency)}
          helper="Pagos aplicados a tu cuenta"
        />
        <MetricCard
          icon={TriangleAlert}
          label="Pendiente"
          value={money(data.outstanding.amount, currency)}
          helper="Saldo abierto de tus cobros"
        />
        <MetricCard
          icon={Bell}
          label="Actividad"
          value={String(data.activity.unreadNotifications)}
          helper="Eventos personales sin leer"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5 text-primary" />
              Mi agenda resumida
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="rounded-2xl border bg-white/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ventanas registradas
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {data.schedules.availabilityWindows}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Dias con bloques:{" "}
                {data.schedules.scheduledDays.length
                  ? data.schedules.scheduledDays.join(", ")
                  : "ninguno"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Estado de cobros
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.paymentStatusBreakdown.length ? (
              data.paymentStatusBreakdown.map((item) => (
                <div key={item.key} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Conteo asociado a tu cuenta
                      </p>
                    </div>
                    <span className="text-2xl font-semibold">{item.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No hay datos de estado de cobros disponibles.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
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
