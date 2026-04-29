import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/shared/store/auth.store";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSocketEvent } from "@/shared/hooks/useSocketEvent";
import { useNotificationStore, type AppNotification } from "@/shared/store/notification.store";
import type { RealtimeEventEnvelope } from "./socket-contract";
import {
  getPaymentLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/modules/billing/utils/billing-copy";

type BillingRealtimePayment = {
  id?: string;
  dueDate?: string;
  currency?: string;
  balance?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  member?: {
    id?: string;
  } | null;
  paymentType?: {
    key?: string;
    name?: string;
  } | null;
};

type BillingRealtimeTransaction = {
  amount?: string;
  currency?: string;
  paymentMethod?: {
    key?: string;
    name?: string;
  } | null;
};

type BillingTransactionPayload = {
  payment?: BillingRealtimePayment | null;
  transaction?: BillingRealtimeTransaction | null;
};

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return "Ahora";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "medium",
  }).format(date);
};

const parseAmount = (value?: string | null) => Number(value ?? 0);

const isLikelyNewPaymentEvent = (
  payload: RealtimeEventEnvelope,
  payment?: BillingRealtimePayment | null,
) => {
  if (payload.action === "created") return true;
  if (!payment?.createdAt || !payment.updatedAt) return false;

  return payment.createdAt === payment.updatedAt;
};

const buildBillingNotification = (
  payload: RealtimeEventEnvelope,
  memberId: string | null,
  isCustomerPortal: boolean,
): AppNotification | null => {
  if (payload.domain !== "billing") {
    return null;
  }

  const paymentData = payload.data as BillingRealtimePayment | BillingTransactionPayload | null;
  const payment =
    payload.resource === "transaction"
      ? (paymentData as BillingTransactionPayload | null)?.payment ?? null
      : (paymentData as BillingRealtimePayment | null);

  if (isCustomerPortal && payment?.member?.id !== memberId) {
    return null;
  }

  if (payload.resource === "transaction") {
    const transaction = (paymentData as BillingTransactionPayload | null)?.transaction ?? null;
    const paymentName = getPaymentLabel(payment);
    const methodName = getPaymentMethodLabel(transaction?.paymentMethod);
    const amount = money(parseAmount(transaction?.amount), transaction?.currency ?? payment?.currency);

    return {
      id: payload.id,
      title: isCustomerPortal ? "Se registro un pago" : "Se registro un pago en cobros",
      description: `${amount} por ${methodName} aplicado a ${paymentName}.`,
      occurredAt: payload.occurredAt,
      read: false,
      scope: isCustomerPortal ? "customer" : "tenant",
      category: "billing",
    };
  }

  if (!payment) {
    return null;
  }

  const paymentName = getPaymentLabel(payment);
  const statusLabel = getPaymentStatusLabel(payment.status);
  const balance = money(parseAmount(payment.balance), payment.currency);
  const dueDate = formatDate(payment.dueDate);
  const title = isLikelyNewPaymentEvent(payload, payment)
    ? isCustomerPortal
      ? "Se registro un nuevo cobro"
      : "Se creo un nuevo cobro"
    : payment.status === "PAID"
      ? isCustomerPortal
        ? "Tu cobro ya figura como pagado"
        : "Se actualizo un cobro como pagado"
      : isCustomerPortal
        ? "Tu estado de cobros cambio"
        : "Se actualizo un cobro";

  return {
    id: payload.id,
    title,
    description: `${paymentName} · ${statusLabel.toLowerCase()} · vence ${dueDate} · saldo ${balance}.`,
    occurredAt: payload.occurredAt,
    read: false,
    scope: isCustomerPortal ? "customer" : "tenant",
    category: "billing",
  };
};

export const useRealtimeNotifications = () => {
  const { memberId, isCustomerPortal } = useAccessContext();
  const activeMembershipId = useAuthStore((state) => state.activeMembership?.id);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const resetNotifications = useNotificationStore((state) => state.reset);

  useEffect(() => {
    resetNotifications();
  }, [activeMembershipId, resetNotifications]);

  useSocketEvent<RealtimeEventEnvelope>("realtime.event", (payload) => {
    const notification = buildBillingNotification(payload, memberId, isCustomerPortal);

    if (!notification) {
      return;
    }

    addNotification(notification);
    toast.success(notification.title, {
      id: notification.id,
      duration: 4500,
    });
  });

  return {
    formatDateTime,
  };
};
