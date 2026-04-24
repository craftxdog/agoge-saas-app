import { z } from "zod";

const optionalText = (schema: z.ZodString) =>
  z.union([schema, z.literal("")]).optional();

export const paymentStatuses = [
  "DRAFT",
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
  "REFUNDED",
] as const;

export const transactionStatuses = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
] as const;

export const paymentFrequencies = [
  "ONE_TIME",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
  "CUSTOM",
] as const;

export const paymentTypeSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  currency: z.string(),
  frequency: z.string(),
  isActive: z.boolean(),
  config: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paymentMethodSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  requiresReference: z.boolean(),
  isActive: z.boolean(),
  config: z.unknown().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const billingMemberSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export const paymentTransactionSchema = z.object({
  id: z.string(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  reference: z.string().nullable().optional(),
  paymentMethod: paymentMethodSchema.nullable().optional(),
  processedAt: z.string().nullable().optional(),
  metadata: z.unknown().optional(),
  createdAt: z.string(),
});

export const paymentSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().nullable().optional(),
  amount: z.string(),
  currency: z.string(),
  status: z.string(),
  dueDate: z.string(),
  paidAt: z.string().nullable().optional(),
  periodMonth: z.number().nullable().optional(),
  periodYear: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.unknown().optional(),
  member: billingMemberSchema,
  paymentType: paymentTypeSchema.nullable().optional(),
  paidAmount: z.string(),
  balance: z.string(),
  transactions: z.array(paymentTransactionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const billingSummarySchema = z.object({
  openPayments: z.number(),
  openBalance: z.string(),
  overduePayments: z.number(),
  overdueBalance: z.string(),
  paidThisMonth: z.string(),
});

export const createPaymentTypeSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
  name: z.string().min(2).max(160),
  description: optionalText(z.string().max(500)),
  amount: optionalText(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  currency: z.string().length(3).optional(),
  frequency: z.enum(paymentFrequencies).optional(),
  isActive: z.boolean().optional(),
});

export const createPaymentMethodSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/),
  name: z.string().min(2).max(160),
  description: optionalText(z.string().max(500)),
  requiresReference: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const createPaymentSchema = z.object({
  memberId: z.string().min(1),
  paymentTypeId: optionalText(z.string()),
  invoiceNumber: optionalText(z.string().max(80)),
  amount: optionalText(z.string().regex(/^\d+(\.\d{1,2})?$/)),
  currency: z.string().length(3).optional(),
  dueDate: z.string().min(1),
  periodMonth: z.coerce.number().int().min(1).max(12).optional(),
  periodYear: z.coerce.number().int().min(2000).max(2200).optional(),
  notes: optionalText(z.string().max(1000)),
});

export const updatePaymentSchema = z.object({
  status: z.enum(paymentStatuses).optional(),
  dueDate: z.string().optional(),
  notes: optionalText(z.string().max(1000)),
});

export const createTransactionSchema = z.object({
  paymentMethodId: optionalText(z.string()),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).optional(),
  status: z.enum(transactionStatuses).optional(),
  reference: optionalText(z.string().max(120)),
  processedAt: optionalText(z.string()),
});

export type PaymentType = z.infer<typeof paymentTypeSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentTransaction = z.infer<typeof paymentTransactionSchema>;
export type BillingSummary = z.infer<typeof billingSummarySchema>;
export type CreatePaymentType = z.infer<typeof createPaymentTypeSchema>;
export type UpdatePaymentType = Partial<CreatePaymentType>;
export type CreatePaymentMethod = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethod = Partial<CreatePaymentMethod>;
export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;
export type CreatePaymentTransaction = z.infer<typeof createTransactionSchema>;
export type PaymentStatus = (typeof paymentStatuses)[number];
export type PaymentTransactionStatus = (typeof transactionStatuses)[number];

export type BillingCatalogQuery = {
  isActive?: boolean;
  search?: string;
};

export type PaymentQuery = {
  status?: PaymentStatus;
  memberId?: string;
  paymentTypeId?: string;
  dueFrom?: string;
  dueTo?: string;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "dueDate" | "status";
  sortDirection?: "asc" | "desc";
};

export type PaymentTransactionQuery = {
  status?: PaymentTransactionStatus;
};
