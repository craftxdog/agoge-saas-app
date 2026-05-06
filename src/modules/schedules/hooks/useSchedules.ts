import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  businessHourSchema,
  dayScheduleSchema,
  locationSchema,
  memberScheduleSchema,
  scheduleExceptionSchema,
  type BusinessHourQuery,
  type CreateBusinessHour,
  type CreateLocation,
  type CreateMemberSchedule,
  type CreateScheduleException,
  type DayScheduleQuery,
  type LocationQuery,
  type MemberScheduleQuery,
  type ScheduleExceptionQuery,
  type UpdateBusinessHour,
  type UpdateLocation,
  type UpdateMemberSchedule,
  type UpdateScheduleException,
} from "../schemas/schedules.schema";
import { schedulesService } from "../services/schedules.service";

export const schedulesKeys = {
  all: ["schedules"] as const,
  day: (query?: DayScheduleQuery) => [...schedulesKeys.all, "day", query] as const,
  locations: (query?: LocationQuery) =>
    [...schedulesKeys.all, "locations", query] as const,
  businessHours: (query?: BusinessHourQuery) =>
    [...schedulesKeys.all, "business-hours", query] as const,
  exceptions: (query?: ScheduleExceptionQuery) =>
    [...schedulesKeys.all, "exceptions", query] as const,
  memberSchedules: (memberId?: string, query?: MemberScheduleQuery) =>
    [...schedulesKeys.all, "member-schedules", memberId, query] as const,
  currentMemberSchedules: (query?: MemberScheduleQuery) =>
    [...schedulesKeys.all, "current-member-schedules", query] as const,
};

export const useDaySchedule = (
  query?: DayScheduleQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.day(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await schedulesService.getDaySchedule(query);
      return dayScheduleSchema.parse(res.data);
    },
  });

export const useLocations = (
  query?: LocationQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.locations(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await schedulesService.listLocations(query);
      return locationSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
  });

export const useBusinessHours = (
  query?: BusinessHourQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.businessHours(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await schedulesService.listBusinessHours(query);
      return businessHourSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 3,
  });

export const useScheduleExceptions = (
  query?: ScheduleExceptionQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.exceptions(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await schedulesService.listExceptions(query);
      return scheduleExceptionSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 3,
  });

export const useMemberSchedules = (
  memberId?: string,
  query?: MemberScheduleQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.memberSchedules(memberId, query),
    enabled: Boolean(memberId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await schedulesService.listMemberSchedules(memberId!, query);
      return memberScheduleSchema.array().parse(res.data);
    },
  });

export const useCurrentMemberSchedules = (
  query?: MemberScheduleQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: schedulesKeys.currentMemberSchedules(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await schedulesService.listCurrentMemberSchedules(query);
      return memberScheduleSchema.array().parse(res.data);
    },
  });

const invalidateSchedules = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: schedulesKeys.all });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLocation) => schedulesService.createLocation(data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Sede creada.");
    },
    onError: () => toast.error("No pudimos crear la sede."),
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, data }: { locationId: string; data: UpdateLocation }) =>
      schedulesService.updateLocation(locationId, data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Sede actualizada.");
    },
    onError: () => toast.error("No pudimos actualizar la sede."),
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => schedulesService.deleteLocation(locationId),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Sede eliminada o desactivada.");
    },
    onError: () => toast.error("No pudimos eliminar la sede."),
  });
};

export const useCreateBusinessHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBusinessHour) =>
      schedulesService.createBusinessHour(data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Horario creado.");
    },
    onError: () => toast.error("No pudimos crear el horario."),
  });
};

export const useReplaceBusinessHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hours: CreateBusinessHour[]) =>
      schedulesService.replaceBusinessHours(hours),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Semana de horarios reemplazada.");
    },
    onError: () => toast.error("No pudimos reemplazar los horarios."),
  });
};

export const useUpdateBusinessHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessHourId,
      data,
    }: {
      businessHourId: string;
      data: UpdateBusinessHour;
    }) => schedulesService.updateBusinessHour(businessHourId, data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Horario actualizado.");
    },
    onError: () => toast.error("No pudimos actualizar el horario."),
  });
};

export const useDeleteBusinessHour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (businessHourId: string) =>
      schedulesService.deleteBusinessHour(businessHourId),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Horario eliminado.");
    },
    onError: () => toast.error("No pudimos eliminar el horario."),
  });
};

export const useCreateScheduleException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateScheduleException) =>
      schedulesService.createException(data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Excepcion creada.");
    },
    onError: () => toast.error("No pudimos crear la excepcion."),
  });
};

export const useUpdateScheduleException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      exceptionId,
      data,
    }: {
      exceptionId: string;
      data: UpdateScheduleException;
    }) => schedulesService.updateException(exceptionId, data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Excepcion actualizada.");
    },
    onError: () => toast.error("No pudimos actualizar la excepcion."),
  });
};

export const useDeleteScheduleException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exceptionId: string) => schedulesService.deleteException(exceptionId),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Excepcion eliminada.");
    },
    onError: () => toast.error("No pudimos eliminar la excepcion."),
  });
};

export const useCreateMemberSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: CreateMemberSchedule;
    }) => schedulesService.createMemberSchedule(memberId, data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Disponibilidad creada.");
    },
    onError: () => toast.error("No pudimos crear la disponibilidad."),
  });
};

export const useReplaceMemberSchedules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      schedules,
    }: {
      memberId: string;
      schedules: CreateMemberSchedule[];
    }) => schedulesService.replaceMemberSchedules(memberId, schedules),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Disponibilidad reemplazada.");
    },
    onError: () => toast.error("No pudimos reemplazar la disponibilidad."),
  });
};

export const useUpdateMemberSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      scheduleId,
      data,
    }: {
      scheduleId: string;
      data: UpdateMemberSchedule;
    }) => schedulesService.updateMemberSchedule(scheduleId, data),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Disponibilidad actualizada.");
    },
    onError: () => toast.error("No pudimos actualizar la disponibilidad."),
  });
};

export const useDeleteMemberSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) =>
      schedulesService.deleteMemberSchedule(scheduleId),
    onSuccess: async () => {
      await invalidateSchedules(queryClient);
      toast.success("Disponibilidad eliminada.");
    },
    onError: () => toast.error("No pudimos eliminar la disponibilidad."),
  });
};
