import { z } from "zod";

export const dayOptions = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
] as const;

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Usa formato HH:mm");

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().nullable().optional(),
  timezone: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const businessHourSchema = z.object({
  id: z.string(),
  location: locationSchema.nullable().optional(),
  dayOfWeek: z.number(),
  dayName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  isClosed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const scheduleExceptionSchema = z.object({
  id: z.string(),
  location: locationSchema.nullable().optional(),
  date: z.string(),
  name: z.string(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  isClosed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const scheduleMemberSummarySchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const memberScheduleSchema = z.object({
  id: z.string(),
  member: scheduleMemberSummarySchema,
  location: locationSchema.nullable().optional(),
  dayOfWeek: z.number(),
  dayName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const dayScheduleSchema = z.object({
  date: z.string(),
  dayOfWeek: z.number(),
  dayName: z.string(),
  timezone: z.string(),
  location: locationSchema.nullable().optional(),
  businessHours: z.array(businessHourSchema),
  exceptions: z.array(scheduleExceptionSchema),
  memberSchedules: z.array(memberScheduleSchema),
  isClosed: z.boolean(),
});

export const createLocationSchema = z.object({
  name: z.string().min(2).max(160),
  address: z.string().max(255).optional(),
  timezone: z.string().max(80).optional(),
  isActive: z.boolean().optional(),
});

export const createBusinessHourSchema = z.object({
  locationId: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
  isClosed: z.boolean().optional(),
});

export const createScheduleExceptionSchema = z.object({
  locationId: z.string().optional(),
  date: z.string().min(1),
  name: z.string().min(1).max(160),
  startTime: z.union([timeSchema, z.literal("")]).optional(),
  endTime: z.union([timeSchema, z.literal("")]).optional(),
  isClosed: z.boolean().optional(),
});

export const createMemberScheduleSchema = z.object({
  locationId: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: timeSchema,
  endTime: timeSchema,
});

export type Location = z.infer<typeof locationSchema>;
export type BusinessHour = z.infer<typeof businessHourSchema>;
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>;
export type MemberSchedule = z.infer<typeof memberScheduleSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type CreateLocation = z.infer<typeof createLocationSchema>;
export type UpdateLocation = Partial<CreateLocation>;
export type CreateBusinessHour = z.infer<typeof createBusinessHourSchema>;
export type UpdateBusinessHour = Partial<
  Pick<CreateBusinessHour, "startTime" | "endTime" | "isClosed">
>;
export type CreateScheduleException = z.infer<typeof createScheduleExceptionSchema>;
export type UpdateScheduleException = Partial<
  Pick<CreateScheduleException, "name" | "startTime" | "endTime" | "isClosed">
>;
export type CreateMemberSchedule = z.infer<typeof createMemberScheduleSchema>;
export type UpdateMemberSchedule = Partial<
  Pick<CreateMemberSchedule, "startTime" | "endTime">
>;

export type LocationQuery = {
  isActive?: boolean;
  search?: string;
};

export type BusinessHourQuery = {
  locationId?: string;
  dayOfWeek?: number;
};

export type ScheduleExceptionQuery = {
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type MemberScheduleQuery = {
  locationId?: string;
  dayOfWeek?: number;
};

export type DayScheduleQuery = {
  locationId?: string;
  date?: string;
};

