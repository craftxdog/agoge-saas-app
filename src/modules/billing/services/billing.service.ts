import { http } from "@/shared/api/http";
import type { ApiResponse } from "@/shared/api/types";
import type {
  BillingCatalogQuery,
  BillingSummary,
  CreatePayment,
  CreatePaymentMethod,
  CreatePaymentTransaction,
  CreatePaymentType,
  Payment,
  PaymentMethod,
  PaymentQuery,
  PaymentTransaction,
  PaymentTransactionQuery,
  PaymentType,
  UpdatePayment,
  UpdatePaymentMethod,
  UpdatePaymentType,
} from "../schemas/billing.schema";

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

export const billingService = {
  getMemberSummary: () =>
    http.get<ApiResponse<BillingSummary>>("/billing/me/summary"),

  getSummary: () => http.get<ApiResponse<BillingSummary>>("/billing/summary"),

  listPaymentTypes: (query?: BillingCatalogQuery) =>
    http.get<ApiResponse<PaymentType[]>>(
      withQuery("/billing/payment-types", query),
    ),

  createPaymentType: (data: CreatePaymentType) =>
    http.post<ApiResponse<PaymentType>, CreatePaymentType>(
      "/billing/payment-types",
      data,
    ),

  updatePaymentType: (paymentTypeId: string, data: UpdatePaymentType) =>
    http.patch<ApiResponse<PaymentType>, UpdatePaymentType>(
      `/billing/payment-types/${paymentTypeId}`,
      data,
    ),

  deletePaymentType: (paymentTypeId: string) =>
    http.delete<ApiResponse<PaymentType>>(
      `/billing/payment-types/${paymentTypeId}`,
    ),

  listPaymentMethods: (query?: BillingCatalogQuery) =>
    http.get<ApiResponse<PaymentMethod[]>>(
      withQuery("/billing/payment-methods", query),
    ),

  createPaymentMethod: (data: CreatePaymentMethod) =>
    http.post<ApiResponse<PaymentMethod>, CreatePaymentMethod>(
      "/billing/payment-methods",
      data,
    ),

  updatePaymentMethod: (paymentMethodId: string, data: UpdatePaymentMethod) =>
    http.patch<ApiResponse<PaymentMethod>, UpdatePaymentMethod>(
      `/billing/payment-methods/${paymentMethodId}`,
      data,
    ),

  deletePaymentMethod: (paymentMethodId: string) =>
    http.delete<ApiResponse<PaymentMethod>>(
      `/billing/payment-methods/${paymentMethodId}`,
    ),

  listPayments: (query?: PaymentQuery) =>
    http.get<ApiResponse<Payment[]>>(withQuery("/billing/payments", query)),

  listMemberPayments: (query?: PaymentQuery) =>
    http.get<ApiResponse<Payment[]>>(withQuery("/billing/me/payments", query)),

  createPayment: (data: CreatePayment) =>
    http.post<ApiResponse<Payment>, CreatePayment>("/billing/payments", data),

  getPayment: (paymentId: string) =>
    http.get<ApiResponse<Payment>>(`/billing/payments/${paymentId}`),

  getMemberPayment: (paymentId: string) =>
    http.get<ApiResponse<Payment>>(`/billing/me/payments/${paymentId}`),

  updatePayment: (paymentId: string, data: UpdatePayment) =>
    http.patch<ApiResponse<Payment>, UpdatePayment>(
      `/billing/payments/${paymentId}`,
      data,
    ),

  listTransactions: (paymentId: string, query?: PaymentTransactionQuery) =>
    http.get<ApiResponse<PaymentTransaction[]>>(
      withQuery(`/billing/payments/${paymentId}/transactions`, query),
    ),

  listMemberTransactions: (paymentId: string, query?: PaymentTransactionQuery) =>
    http.get<ApiResponse<PaymentTransaction[]>>(
      withQuery(`/billing/me/payments/${paymentId}/transactions`, query),
    ),

  createTransaction: (paymentId: string, data: CreatePaymentTransaction) =>
    http.post<ApiResponse<Payment>, CreatePaymentTransaction>(
      `/billing/payments/${paymentId}/transactions`,
      data,
    ),
};
