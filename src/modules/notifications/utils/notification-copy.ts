import type { NotificationItem } from "../schemas/notifications.schema";

const titleMap: Record<string, string> = {
  PAYMENT_CREATED: "Cobro creado",
  PAYMENT_UPDATED: "Cobro actualizado",
  PAYMENT_TRANSACTION_CREATED: "Pago registrado",
  SCHEDULE_EXCEPTION_CREATED: "Excepcion de horario creada",
  SCHEDULE_EXCEPTION_UPDATED: "Excepcion de horario actualizada",
  MEMBER_SCHEDULE_CREATED: "Disponibilidad registrada",
  MEMBER_SCHEDULE_UPDATED: "Disponibilidad actualizada",
  BUSINESS_HOUR_CREATED: "Horario operativo creado",
  BUSINESS_HOUR_UPDATED: "Horario operativo actualizado",
};

const domainMap: Record<string, string> = {
  billing: "Cobros",
  notifications: "Bandeja",
  schedules: "Horarios",
};

const humanize = (value?: string | null) => {
  if (!value) return "Sistema";

  return value
    .split(/[._-]/g)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
};

export const getNotificationTitle = (notification: Pick<NotificationItem, "type" | "title">) =>
  titleMap[notification.type] ??
  notification.title ??
  humanize(notification.type);

export const getNotificationDomainLabel = (domain?: string | null) =>
  domainMap[domain ?? ""] ?? humanize(domain);

export const getNotificationSourceLabel = (
  notification: Pick<NotificationItem, "data">,
) => {
  const domainLabel = getNotificationDomainLabel(notification.data?.sourceDomain);
  const resourceLabel = humanize(notification.data?.sourceResource);
  const actionLabel = humanize(notification.data?.sourceAction);

  return [domainLabel, resourceLabel, actionLabel].filter(Boolean).join(" · ");
};
