import {
  CalendarClock,
  Clock3,
  MapPin,
  RefreshCw,
  Sparkles,
  UserRoundCheck,
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useMembers } from "@/modules/users/hooks/useUsers";
import {
  dayOptions,
  type CreateBusinessHour,
  type CreateMemberSchedule,
} from "../schemas/schedules.schema";
import {
  useBusinessHours,
  useCreateBusinessHour,
  useCreateLocation,
  useCreateMemberSchedule,
  useCreateScheduleException,
  useDaySchedule,
  useDeleteBusinessHour,
  useDeleteLocation,
  useDeleteMemberSchedule,
  useDeleteScheduleException,
  useLocations,
  useMemberSchedules,
  useReplaceBusinessHours,
  useReplaceMemberSchedules,
  useScheduleExceptions,
  useUpdateBusinessHour,
  useUpdateLocation,
  useUpdateMemberSchedule,
  useUpdateScheduleException,
} from "../hooks/useSchedules";

const today = new Date().toISOString().slice(0, 10);

const baseLocationForm = {
  name: "",
  address: "",
  timezone: "America/Managua",
  isActive: true,
};

const baseHourForm: CreateBusinessHour = {
  locationId: "",
  dayOfWeek: 1,
  startTime: "06:00",
  endTime: "21:00",
  isClosed: false,
};

const baseExceptionForm = {
  locationId: "",
  date: today,
  name: "",
  startTime: "",
  endTime: "",
  isClosed: true,
};

const baseAvailabilityForm: CreateMemberSchedule = {
  locationId: "",
  dayOfWeek: 1,
  startTime: "06:00",
  endTime: "10:00",
};

const clean = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  ) as Partial<T>;

export default function SchedulesPage() {
  const [locationSearch, setLocationSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [dayDate, setDayDate] = useState(today);
  const [dayLocationId, setDayLocationId] = useState("");
  const [hourForm, setHourForm] = useState(baseHourForm);
  const [locationForm, setLocationForm] = useState(baseLocationForm);
  const [exceptionForm, setExceptionForm] = useState(baseExceptionForm);
  const [memberId, setMemberId] = useState("");
  const [availabilityForm, setAvailabilityForm] = useState(baseAvailabilityForm);

  const locations = useLocations({
    search: locationSearch || undefined,
  });
  const daySchedule = useDaySchedule({
    date: dayDate,
    locationId: dayLocationId || undefined,
  });
  const businessHours = useBusinessHours({
    locationId: locationFilter || undefined,
  });
  const exceptions = useScheduleExceptions({
    locationId: locationFilter || undefined,
    dateFrom: today,
  });
  const members = useMembers({
    status: "ACTIVE",
    limit: 100,
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const memberSchedules = useMemberSchedules(memberId || undefined, {
    locationId: locationFilter || undefined,
  });

  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();
  const createBusinessHour = useCreateBusinessHour();
  const replaceBusinessHours = useReplaceBusinessHours();
  const updateBusinessHour = useUpdateBusinessHour();
  const deleteBusinessHour = useDeleteBusinessHour();
  const createException = useCreateScheduleException();
  const updateException = useUpdateScheduleException();
  const deleteException = useDeleteScheduleException();
  const createMemberSchedule = useCreateMemberSchedule();
  const replaceMemberSchedules = useReplaceMemberSchedules();
  const updateMemberSchedule = useUpdateMemberSchedule();
  const deleteMemberSchedule = useDeleteMemberSchedule();

  const locationOptions = locations.data ?? [];

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Operacion diaria
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Horarios, sedes y disponibilidad
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Gestiona todos los endpoints de schedules: agenda efectiva, sedes,
          horarios semanales, excepciones y disponibilidad de miembros.
        </p>
      </div>

      <Tabs defaultValue="day" className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="day" className="rounded-xl px-4 py-2">
            Dia
          </TabsTrigger>
          <TabsTrigger value="locations" className="rounded-xl px-4 py-2">
            Sedes
          </TabsTrigger>
          <TabsTrigger value="hours" className="rounded-xl px-4 py-2">
            Horarios
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="rounded-xl px-4 py-2">
            Excepciones
          </TabsTrigger>
          <TabsTrigger value="availability" className="rounded-xl px-4 py-2">
            Disponibilidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-5 text-primary" />
                Agenda efectiva del dia
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <ScheduleFilters
                date={dayDate}
                locationId={dayLocationId}
                locations={locationOptions}
                onDateChange={setDayDate}
                onLocationChange={setDayLocationId}
              />
              {daySchedule.isLoading ? (
                <Skeleton className="h-64 rounded-2xl" />
              ) : daySchedule.data ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  <MetricCard
                    label="Estado"
                    value={daySchedule.data.isClosed ? "Cerrado" : "Abierto"}
                    helper={`${daySchedule.data.dayName} · ${daySchedule.data.timezone}`}
                  />
                  <MetricCard
                    label="Ventanas de negocio"
                    value={daySchedule.data.businessHours.length}
                    helper="Incluye organizacion y sede"
                  />
                  <MetricCard
                    label="Disponibilidades"
                    value={daySchedule.data.memberSchedules.length}
                    helper="Miembros con horario ese dia"
                  />
                  <ListBlock
                    title="Horarios"
                    items={daySchedule.data.businessHours.map((hour) =>
                      `${hour.dayName}: ${hour.startTime}-${hour.endTime}${hour.isClosed ? " cerrado" : ""}`,
                    )}
                  />
                  <ListBlock
                    title="Excepciones"
                    items={daySchedule.data.exceptions.map((exception) =>
                      `${exception.name}: ${exception.isClosed ? "Cierre" : "Especial"} ${exception.startTime ?? ""}-${exception.endTime ?? ""}`,
                    )}
                  />
                  <ListBlock
                    title="Miembros disponibles"
                    items={daySchedule.data.memberSchedules.map((schedule) =>
                      `${schedule.member.firstName} ${schedule.member.lastName}: ${schedule.startTime}-${schedule.endTime}`,
                    )}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5 text-primary" />
                  Nueva sede
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createLocation.mutate(
                      clean(locationForm) as typeof locationForm,
                      { onSuccess: () => setLocationForm(baseLocationForm) },
                    );
                  }}
                >
                  <TextField
                    label="Nombre"
                    value={locationForm.name}
                    onChange={(value) =>
                      setLocationForm((current) => ({ ...current, name: value }))
                    }
                  />
                  <TextField
                    label="Direccion"
                    value={locationForm.address}
                    onChange={(value) =>
                      setLocationForm((current) => ({ ...current, address: value }))
                    }
                  />
                  <TextField
                    label="Zona horaria"
                    value={locationForm.timezone}
                    onChange={(value) =>
                      setLocationForm((current) => ({ ...current, timezone: value }))
                    }
                  />
                  <Button className="w-fit rounded-full" disabled={createLocation.isPending}>
                    Crear sede
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Sedes del tenant</CardTitle>
                  <Input
                    className="h-11 rounded-full bg-white/70"
                    placeholder="Buscar sede..."
                    value={locationSearch}
                    onChange={(event) => setLocationSearch(event.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {locations.isLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} className="h-24 rounded-2xl" />
                    ))
                  : locationOptions.map((location) => (
                      <div key={location.id} className="rounded-2xl border bg-white/60 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{location.name}</h3>
                              <Badge
                                variant={location.isActive ? "default" : "outline"}
                                className="rounded-full"
                              >
                                {location.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {location.address ?? "Sin direccion"} · {location.timezone}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full"
                              onClick={() =>
                                updateLocation.mutate({
                                  locationId: location.id,
                                  data: { isActive: !location.isActive },
                                })
                              }
                            >
                              {location.isActive ? "Desactivar" : "Activar"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full"
                              onClick={() => deleteLocation.mutate(location.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours">
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="size-5 text-primary" />
                  Horario semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createBusinessHour.mutate(clean(hourForm) as CreateBusinessHour);
                  }}
                >
                  <LocationSelect
                    value={hourForm.locationId ?? ""}
                    locations={locationOptions}
                    onChange={(value) =>
                      setHourForm((current) => ({ ...current, locationId: value }))
                    }
                  />
                  <DaySelect
                    value={hourForm.dayOfWeek}
                    onChange={(value) =>
                      setHourForm((current) => ({ ...current, dayOfWeek: value }))
                    }
                  />
                  <TimePair
                    start={hourForm.startTime}
                    end={hourForm.endTime}
                    onStart={(value) =>
                      setHourForm((current) => ({ ...current, startTime: value }))
                    }
                    onEnd={(value) =>
                      setHourForm((current) => ({ ...current, endTime: value }))
                    }
                  />
                  <label className="flex items-center gap-3 rounded-2xl border bg-white/60 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(hourForm.isClosed)}
                      onChange={(event) =>
                        setHourForm((current) => ({
                          ...current,
                          isClosed: event.target.checked,
                        }))
                      }
                    />
                    Esta ventana es de cierre
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button className="rounded-full" disabled={createBusinessHour.isPending}>
                      Agregar horario
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      disabled={replaceBusinessHours.isPending}
                      onClick={() =>
                        replaceBusinessHours.mutate(
                          [1, 2, 3, 4, 5].map((dayOfWeek) =>
                            clean({
                              ...hourForm,
                              dayOfWeek,
                              startTime: "06:00",
                              endTime: "21:00",
                              isClosed: false,
                            }) as CreateBusinessHour,
                          ),
                        )
                      }
                    >
                      <RefreshCw className="size-4" />
                      Reemplazar Lun-Vie
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <RecordsCard
              title="Horarios guardados"
              filter={
                <LocationSelect
                  label="Filtrar sede"
                  value={locationFilter}
                  locations={locationOptions}
                  onChange={setLocationFilter}
                />
              }
            >
              {businessHours.data?.map((hour) => (
                <RecordRow
                  key={hour.id}
                  title={`${hour.dayName} · ${hour.startTime}-${hour.endTime}`}
                  description={`${hour.location?.name ?? "Organizacion"} · ${hour.isClosed ? "Cierre" : "Apertura"}`}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          updateBusinessHour.mutate({
                            businessHourId: hour.id,
                            data: { isClosed: !hour.isClosed },
                          })
                        }
                      >
                        {hour.isClosed ? "Abrir" : "Cerrar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => deleteBusinessHour.mutate(hour.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  }
                />
              ))}
            </RecordsCard>
          </div>
        </TabsContent>

        <TabsContent value="exceptions">
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  Nueva excepcion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createException.mutate(clean(exceptionForm) as typeof exceptionForm);
                  }}
                >
                  <LocationSelect
                    value={exceptionForm.locationId}
                    locations={locationOptions}
                    onChange={(value) =>
                      setExceptionForm((current) => ({
                        ...current,
                        locationId: value,
                      }))
                    }
                  />
                  <TextField
                    label="Fecha"
                    type="date"
                    value={exceptionForm.date}
                    onChange={(value) =>
                      setExceptionForm((current) => ({ ...current, date: value }))
                    }
                  />
                  <TextField
                    label="Nombre"
                    value={exceptionForm.name}
                    onChange={(value) =>
                      setExceptionForm((current) => ({ ...current, name: value }))
                    }
                  />
                  <TimePair
                    start={exceptionForm.startTime}
                    end={exceptionForm.endTime}
                    onStart={(value) =>
                      setExceptionForm((current) => ({ ...current, startTime: value }))
                    }
                    onEnd={(value) =>
                      setExceptionForm((current) => ({ ...current, endTime: value }))
                    }
                  />
                  <label className="flex items-center gap-3 rounded-2xl border bg-white/60 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={exceptionForm.isClosed}
                      onChange={(event) =>
                        setExceptionForm((current) => ({
                          ...current,
                          isClosed: event.target.checked,
                        }))
                      }
                    />
                    Cierre o cierre parcial
                  </label>
                  <Button className="w-fit rounded-full" disabled={createException.isPending}>
                    Crear excepcion
                  </Button>
                </form>
              </CardContent>
            </Card>

            <RecordsCard title="Excepciones proximas">
              {exceptions.data?.map((exception) => (
                <RecordRow
                  key={exception.id}
                  title={`${exception.date} · ${exception.name}`}
                  description={`${exception.location?.name ?? "Organizacion"} · ${exception.isClosed ? "Cierre" : "Horario especial"} ${exception.startTime ?? ""}-${exception.endTime ?? ""}`}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          updateException.mutate({
                            exceptionId: exception.id,
                            data: { isClosed: !exception.isClosed },
                          })
                        }
                      >
                        {exception.isClosed ? "Especial" : "Cerrar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => deleteException.mutate(exception.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  }
                />
              ))}
            </RecordsCard>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRoundCheck className="size-5 text-primary" />
                  Disponibilidad de miembro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!memberId) return;
                    createMemberSchedule.mutate({
                      memberId,
                      data: clean(availabilityForm) as CreateMemberSchedule,
                    });
                  }}
                >
                  <MemberSelect
                    value={memberId}
                    members={members.data?.items ?? []}
                    onChange={setMemberId}
                  />
                  <LocationSelect
                    value={availabilityForm.locationId ?? ""}
                    locations={locationOptions}
                    onChange={(value) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        locationId: value,
                      }))
                    }
                  />
                  <DaySelect
                    value={availabilityForm.dayOfWeek}
                    onChange={(value) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        dayOfWeek: value,
                      }))
                    }
                  />
                  <TimePair
                    start={availabilityForm.startTime}
                    end={availabilityForm.endTime}
                    onStart={(value) =>
                      setAvailabilityForm((current) => ({
                        ...current,
                        startTime: value,
                      }))
                    }
                    onEnd={(value) =>
                      setAvailabilityForm((current) => ({ ...current, endTime: value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="rounded-full"
                      disabled={!memberId || createMemberSchedule.isPending}
                    >
                      Agregar disponibilidad
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      disabled={!memberId || replaceMemberSchedules.isPending}
                      onClick={() =>
                        replaceMemberSchedules.mutate({
                          memberId,
                          schedules: [1, 2, 3, 4, 5].map(
                            (dayOfWeek) =>
                              clean({
                                ...availabilityForm,
                                dayOfWeek,
                              }) as CreateMemberSchedule,
                          ),
                        })
                      }
                    >
                      Reemplazar Lun-Vie
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <RecordsCard title="Disponibilidad guardada">
              {memberSchedules.data?.map((schedule) => (
                <RecordRow
                  key={schedule.id}
                  title={`${schedule.dayName} · ${schedule.startTime}-${schedule.endTime}`}
                  description={`${schedule.member.firstName} ${schedule.member.lastName} · ${schedule.location?.name ?? "Todas las sedes"}`}
                  actions={
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          updateMemberSchedule.mutate({
                            scheduleId: schedule.id,
                            data: { startTime: availabilityForm.startTime, endTime: availabilityForm.endTime },
                          })
                        }
                      >
                        Usar horas del form
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full"
                        onClick={() => deleteMemberSchedule.mutate(schedule.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  }
                />
              ))}
              {!memberId && (
                <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                  Selecciona un miembro para cargar su disponibilidad.
                </p>
              )}
            </RecordsCard>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function ScheduleFilters({
  date,
  locationId,
  locations,
  onDateChange,
  onLocationChange,
}: {
  date: string;
  locationId: string;
  locations: { id: string; name: string }[];
  onDateChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <TextField label="Fecha" type="date" value={date} onChange={onDateChange} />
      <LocationSelect value={locationId} locations={locations} onChange={onLocationChange} />
    </div>
  );
}

function LocationSelect({
  label = "Sede",
  value,
  locations,
  onChange,
}: {
  label?: string;
  value: string;
  locations: { id: string; name: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Organizacion completa</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function MemberSelect({
  value,
  members,
  onChange,
}: {
  value: string;
  members: { id: string; user: { firstName: string; lastName: string; email: string } }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Miembro</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecciona un miembro</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.user.firstName} {member.user.lastName} · {member.user.email}
          </option>
        ))}
      </select>
    </div>
  );
}

function DaySelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Dia</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {dayOptions.map((day) => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        className="h-11 rounded-2xl bg-white/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TimePair({
  start,
  end,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField label="Inicio" type="time" value={start} onChange={onStart} />
      <TextField label="Fin" type="time" value={end} onChange={onEnd} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/60 p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border bg-white/60 p-5">
      <p className="font-semibold">{title}</p>
      <div className="mt-3 grid gap-2">
        {items.length ? (
          items.map((item) => (
            <p key={item} className="rounded-xl bg-muted/70 px-3 py-2 text-sm">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Sin datos para este dia.</p>
        )}
      </div>
    </div>
  );
}

function RecordsCard({
  title,
  filter,
  children,
}: {
  title: string;
  filter?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>{title}</CardTitle>
          {filter}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollPanel heightClassName="max-h-[56vh]">{children}</ScrollPanel>
      </CardContent>
    </Card>
  );
}

function RecordRow({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
    </div>
  );
}
