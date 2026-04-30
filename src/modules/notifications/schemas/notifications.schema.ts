import { z } from "zod";
import type { CursorQuery } from "@/shared/api/types";

export const notificationSourceDataSchema = z
  .object({
    sourceDomain: z.string().optional(),
    sourceResource: z.string().optional(),
    sourceAction: z.string().optional(),
    entityId: z.string().nullable().optional(),
    payload: z.unknown().optional(),
  })
  .passthrough();

export const notificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  data: notificationSourceDataSchema.nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const notificationSummarySchema = z.object({
  unreadCount: z.number(),
  latestCreatedAt: z.string().nullable().optional(),
  recent: z.array(notificationSchema).default([]),
});

export const notificationListPayloadSchema = z.union([
  z.array(notificationSchema),
  z
    .object({
      items: z.array(notificationSchema),
    })
    .passthrough(),
]);

export type NotificationQuery = CursorQuery & {
  isRead?: boolean;
  type?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt";
};

export type NotificationItem = z.infer<typeof notificationSchema>;
export type NotificationSummary = z.infer<typeof notificationSummarySchema>;
