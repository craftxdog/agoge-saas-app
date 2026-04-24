import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  useBusinessHours,
  useLocations,
  useMemberSchedules,
  useScheduleExceptions,
} from "../hooks/useSchedules";

const resolveTenantDateParts = (timezone = "America/Managua") => {
  const now = new Date();
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  })
    .format(now)
    .toLowerCase();

  const year = dateParts.find((part) => part.type === "year")?.value ?? "1970";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "01";
  const day = dateParts.find((part) => part.type === "day")?.value ?? "01";
  const dayOfWeekMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  } as const;

  return {
    today: `${year}-${month}-${day}`,
    dayName: weekday,
    dayOfWeek: dayOfWeekMap[weekday as keyof typeof dayOfWeekMap] ?? 0,
  };
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "full",
  }).format(date);
};

export function CustomerSchedulesView() {
  const { memberId } = useAccessContext();
  const { activeMembership } = useAuth();
  const [locationId, setLocationId] = useState("");
  const tenantTimezone = activeMembership?.organization.timezone ?? "America/Managua";
  const { today, dayName, dayOfWeek } = resolveTenantDateParts(tenantTimezone);
  const locations = useLocations({ isActive: true });
  const businessHours = useBusinessHours({
    locationId: locationId || undefined,
    dayOfWeek,
  });
  const exceptions = useScheduleExceptions({
    locationId: locationId || undefined,
    dateFrom: today,
    dateTo: today,
  });
  const weeklyMemberSchedules = useMemberSchedules(memberId ?? undefined, {
    locationId: locationId || undefined,
  });
  const todayMemberSchedules = useMemberSchedules(memberId ?? undefined, {
    locationId: locationId || undefined,
    dayOfWeek,
  });

  const weeklyAvailability = weeklyMemberSchedules.data ?? [];
  const todayAvailability = todayMemberSchedules.data ?? [];
  const businessHourItems = businessHours.data ?? [];
  const exceptionItems = exceptions.data ?? [];
  const isClosedToday =
    exceptionItems.some((item) => item.isClosed) ||
    !businessHourItems.some((item) => !item.isClosed);

  const locationOptions = locations.data ?? [];

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Portal de cliente
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Tus horarios y la operacion de hoy
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Consulta tu disponibilidad registrada, las horas operativas del dia y
          cualquier excepcion activa en {activeMembership?.organization.name}.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Agenda efectiva</p>
          <p className="text-sm text-muted-foreground">{formatDate(today)}</p>
        </div>
        <select
          className="h-11 rounded-full border bg-white/70 px-4 text-sm"
          value={locationId}
          onChange={(event) => setLocationId(event.target.value)}
        >
          <option value="">Todas las sedes</option>
          {locationOptions.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={UserRoundCheck}
          label="Tu disponibilidad hoy"
          value={String(todayAvailability.length)}
          helper={
            todayAvailability.length
              ? todayAvailability.map((item) => `${item.startTime}-${item.endTime}`).join(", ")
              : "No tienes bloques registrados para hoy"
          }
        />
        <MetricCard
          icon={Clock3}
          label="Ventanas operativas"
          value={String(businessHourItems.length)}
          helper={
            isClosedToday
              ? "La operacion de hoy figura cerrada"
              : `${tenantTimezone} · jornada activa`
          }
        />
        <MetricCard
          icon={CalendarDays}
          label="Excepciones proximas"
          value={String(exceptions.data?.length ?? 0)}
          helper="Cierres o ajustes especiales informados por la organizacion"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundCheck className="size-5 text-primary" />
              Mi agenda semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {weeklyMemberSchedules.isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl" />
              ))
            ) : weeklyAvailability.length ? (
              weeklyAvailability.map((item) => (
                <div key={item.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{item.dayName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.location?.name ?? "Sin sede"} · {item.startTime} - {item.endTime}
                      </p>
                    </div>
                    <Badge variant="outline">{item.location?.timezone ?? "Horario local"}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                Tu usuario no tiene disponibilidad semanal registrada todavia.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                Horarios operativos del dia
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {businessHours.isLoading ? (
                <Skeleton className="h-40 rounded-2xl" />
              ) : businessHourItems.length ? (
                businessHourItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {item.location?.name ?? "Operacion general"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.startTime} - {item.endTime}
                        </p>
                      </div>
                      <Badge variant={item.isClosed ? "destructive" : "outline"}>
                        {item.isClosed ? "Cerrado" : "Abierto"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No hay horario operativo publicado para el filtro actual.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Excepciones y avisos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {exceptions.isLoading || businessHours.isLoading ? (
                <Skeleton className="h-40 rounded-2xl" />
              ) : exceptionItems.length ? (
                exceptionItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.location?.name ?? "Operacion general"} · {item.date}
                        </p>
                      </div>
                      <Badge variant={item.isClosed ? "destructive" : "outline"}>
                        {item.isClosed
                          ? "Cierre"
                          : `${item.startTime ?? "--"} - ${item.endTime ?? "--"}`}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No hay excepciones activas reportadas en este momento.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>{`Tu disponibilidad de ${dayName}`}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {todayMemberSchedules.isLoading ? (
                <Skeleton className="h-32 rounded-2xl" />
              ) : todayAvailability.length ? (
                todayAvailability.map((item) => (
                  <div key={item.id} className="rounded-2xl border bg-white/70 p-4">
                    <p className="font-semibold">
                      {item.location?.name ?? "Sin sede asignada"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  No tienes bloques de disponibilidad cargados para hoy.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
  icon: typeof UserRoundCheck;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[1.4rem]">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
