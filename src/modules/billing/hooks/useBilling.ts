import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  billingSummarySchema,
  paymentMethodSchema,
  paymentSchema,
  paymentTransactionSchema,
  paymentTypeSchema,
  type BillingCatalogQuery,
  type CreatePayment,
  type CreatePaymentMethod,
  type CreatePaymentTransaction,
  type CreatePaymentType,
  type PaymentQuery,
  type PaymentTransactionQuery,
  type UpdatePayment,
  type UpdatePaymentMethod,
  type UpdatePaymentType,
} from "../schemas/billing.schema";
import { billingService } from "../services/billing.service";

export const billingKeys = {
  all: ["billing"] as const,
  summary: () => [...billingKeys.all, "summary"] as const,
  paymentTypes: (query?: BillingCatalogQuery) =>
    [...billingKeys.all, "payment-types", query] as const,
  paymentMethods: (query?: BillingCatalogQuery) =>
    [...billingKeys.all, "payment-methods", query] as const,
  payments: (query?: PaymentQuery) =>
    [...billingKeys.all, "payments", query] as const,
  payment: (paymentId?: string) =>
    [...billingKeys.all, "payment", paymentId] as const,
  transactions: (paymentId?: string, query?: PaymentTransactionQuery) =>
    [...billingKeys.all, "transactions", paymentId, query] as const,
};

export const useBillingSummary = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: billingKeys.summary(),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await billingService.getSummary();
      return billingSummarySchema.parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

export const usePaymentTypes = (
  query?: BillingCatalogQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: billingKeys.paymentTypes(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await billingService.listPaymentTypes(query);
      return paymentTypeSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const usePaymentMethods = (
  query?: BillingCatalogQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: billingKeys.paymentMethods(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await billingService.listPaymentMethods(query);
      return paymentMethodSchema.array().parse(res.data);
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

export const usePayments = (
  query?: PaymentQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: billingKeys.payments(query),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await billingService.listPayments(query);
      return {
        items: paymentSchema.array().parse(res.data),
        pagination: res.meta.pagination,
      };
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

export const usePayment = (paymentId?: string, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: billingKeys.payment(paymentId),
    enabled: Boolean(paymentId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await billingService.getPayment(paymentId!);
      return paymentSchema.parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

export const usePaymentTransactions = (
  paymentId?: string,
  query?: PaymentTransactionQuery,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: billingKeys.transactions(paymentId, query),
    enabled: Boolean(paymentId) && (options?.enabled ?? true),
    queryFn: async () => {
      const res = await billingService.listTransactions(paymentId!, query);
      return paymentTransactionSchema.array().parse(res.data);
    },
    refetchOnWindowFocus: false,
  });

const invalidateBilling = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: billingKeys.all });
  await queryClient.invalidateQueries({ queryKey: ["analytics"] });
};

export const useCreatePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentType) => billingService.createPaymentType(data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Concepto creado.");
    },
    onError: () => toast.error("No pudimos crear el concepto."),
  });
};

export const useUpdatePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentTypeId,
      data,
    }: {
      paymentTypeId: string;
      data: UpdatePaymentType;
    }) => billingService.updatePaymentType(paymentTypeId, data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Concepto actualizado.");
    },
    onError: () => toast.error("No pudimos actualizar el concepto."),
  });
};

export const useDeletePaymentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentTypeId: string) =>
      billingService.deletePaymentType(paymentTypeId),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Concepto eliminado o archivado.");
    },
    onError: () => toast.error("No pudimos eliminar el concepto."),
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentMethod) =>
      billingService.createPaymentMethod(data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Metodo creado.");
    },
    onError: () => toast.error("No pudimos crear el metodo."),
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentMethodId,
      data,
    }: {
      paymentMethodId: string;
      data: UpdatePaymentMethod;
    }) => billingService.updatePaymentMethod(paymentMethodId, data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Metodo actualizado.");
    },
    onError: () => toast.error("No pudimos actualizar el metodo."),
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      billingService.deletePaymentMethod(paymentMethodId),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Metodo eliminado o archivado.");
    },
    onError: () => toast.error("No pudimos eliminar el metodo."),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayment) => billingService.createPayment(data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Cobro creado.");
    },
    onError: () => toast.error("No pudimos crear el cobro."),
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: UpdatePayment }) =>
      billingService.updatePayment(paymentId, data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Cobro actualizado.");
    },
    onError: () => toast.error("No pudimos actualizar el cobro."),
  });
};

export const useCreatePaymentTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: CreatePaymentTransaction;
    }) => billingService.createTransaction(paymentId, data),
    onSuccess: async () => {
      await invalidateBilling(queryClient);
      toast.success("Transaccion registrada.");
    },
    onError: () => toast.error("No pudimos registrar la transaccion."),
  });
};
