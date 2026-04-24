import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  BusinessHour,
  BusinessHourQuery,
  CreateBusinessHour,
  CreateLocation,
  CreateMemberSchedule,
  CreateScheduleException,
  DaySchedule,
  DayScheduleQuery,
  Location,
  LocationQuery,
  MemberSchedule,
  MemberScheduleQuery,
  ScheduleException,
  ScheduleExceptionQuery,
  UpdateBusinessHour,
  UpdateLocation,
  UpdateMemberSchedule,
  UpdateScheduleException,
} from "../schemas/schedules.schema";

const toSearchParams = (
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) => {
  const params = toSearchParams(query);
  return params ? `${path}?${params}` : path;
};

export const schedulesService = {
  getDaySchedule: (query?: DayScheduleQuery) =>
    http.get<ApiResponse<DaySchedule>>(withQuery("/schedules/day", query)),

  listLocations: (query?: LocationQuery) =>
    http.get<ApiResponse<Location[]>>(withQuery("/schedules/locations", query)),

  createLocation: (data: CreateLocation) =>
    http.post<ApiResponse<Location>, CreateLocation>("/schedules/locations", data),

  updateLocation: (locationId: string, data: UpdateLocation) =>
    http.patch<ApiResponse<Location>, UpdateLocation>(
      `/schedules/locations/${locationId}`,
      data,
    ),

  deleteLocation: (locationId: string) =>
    http.delete<ApiResponse<Location>>(`/schedules/locations/${locationId}`),

  listBusinessHours: (query?: BusinessHourQuery) =>
    http.get<ApiResponse<BusinessHour[]>>(
      withQuery("/schedules/business-hours", query),
    ),

  createBusinessHour: (data: CreateBusinessHour) =>
    http.post<ApiResponse<BusinessHour>, CreateBusinessHour>(
      "/schedules/business-hours",
      data,
    ),

  replaceBusinessHours: (hours: CreateBusinessHour[]) =>
    http.put<ApiResponse<BusinessHour[]>, { hours: CreateBusinessHour[] }>(
      "/schedules/business-hours",
      { hours },
    ),

  updateBusinessHour: (businessHourId: string, data: UpdateBusinessHour) =>
    http.patch<ApiResponse<BusinessHour>, UpdateBusinessHour>(
      `/schedules/business-hours/${businessHourId}`,
      data,
    ),

  deleteBusinessHour: (businessHourId: string) =>
    http.delete<ApiResponse<BusinessHour>>(
      `/schedules/business-hours/${businessHourId}`,
    ),

  listExceptions: (query?: ScheduleExceptionQuery) =>
    http.get<ApiResponse<ScheduleException[]>>(
      withQuery("/schedules/exceptions", query),
    ),

  createException: (data: CreateScheduleException) =>
    http.post<ApiResponse<ScheduleException>, CreateScheduleException>(
      "/schedules/exceptions",
      data,
    ),

  updateException: (exceptionId: string, data: UpdateScheduleException) =>
    http.patch<ApiResponse<ScheduleException>, UpdateScheduleException>(
      `/schedules/exceptions/${exceptionId}`,
      data,
    ),

  deleteException: (exceptionId: string) =>
    http.delete<ApiResponse<ScheduleException>>(
      `/schedules/exceptions/${exceptionId}`,
    ),

  listMemberSchedules: (memberId: string, query?: MemberScheduleQuery) =>
    http.get<ApiResponse<MemberSchedule[]>>(
      withQuery(`/schedules/members/${memberId}/availability`, query),
    ),

  createMemberSchedule: (memberId: string, data: CreateMemberSchedule) =>
    http.post<ApiResponse<MemberSchedule>, CreateMemberSchedule>(
      `/schedules/members/${memberId}/availability`,
      data,
    ),

  replaceMemberSchedules: (memberId: string, schedules: CreateMemberSchedule[]) =>
    http.put<ApiResponse<MemberSchedule[]>, { schedules: CreateMemberSchedule[] }>(
      `/schedules/members/${memberId}/availability`,
      { schedules },
    ),

  updateMemberSchedule: (scheduleId: string, data: UpdateMemberSchedule) =>
    http.patch<ApiResponse<MemberSchedule>, UpdateMemberSchedule>(
      `/schedules/availability/${scheduleId}`,
      data,
    ),

  deleteMemberSchedule: (scheduleId: string) =>
    http.delete<ApiResponse<MemberSchedule>>(
      `/schedules/availability/${scheduleId}`,
    ),
};

