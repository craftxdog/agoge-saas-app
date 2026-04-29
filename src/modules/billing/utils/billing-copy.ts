type NamedEntity = {
  key?: string | null;
  name?: string | null;
};

type DescribedEntity = NamedEntity & {
  description?: string | null;
};

type PaymentLike = {
  paymentType?: NamedEntity | null;
};

type TransactionLike = {
  paymentMethod?: NamedEntity | null;
};

const paymentStatusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  PARTIALLY_PAID: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const transactionStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  SUCCEEDED: "Completado",
  FAILED: "Fallido",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const paymentTypeLabels: Record<string, string> = {
  enrollment: "Inscripcion",
  "enrollment-fee": "Inscripcion",
  membership: "Membresia",
  "monthly-membership": "Membresia mensual",
  "personal-training": "Entrenamiento personal",
  "drop-in": "Clase suelta",
  "day-pass": "Pase diario",
  "manual-payment": "Cobro manual",
};

const paymentTypeNameLabels: Record<string, string> = {
  "enrollment fee": "Inscripcion",
  "monthly membership": "Membresia mensual",
  "personal training": "Entrenamiento personal",
  membership: "Membresia",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Tarjeta",
  cash: "Efectivo",
  transfer: "Transferencia",
  "bank-transfer": "Transferencia bancaria",
};

const paymentMethodNameLabels: Record<string, string> = {
  card: "Tarjeta",
  cash: "Efectivo",
  transfer: "Transferencia",
  "bank transfer": "Transferencia bancaria",
};

const descriptionLabels: Record<string, string> = {
  "card-present and online card collections.": "Cobros con tarjeta presenciales y en linea.",
  "cash payments registered at front desk.": "Pagos en efectivo registrados en recepcion.",
  "bank transfer collections.": "Cobros por transferencia bancaria.",
};

const noteLabels: Record<string, string> = {
  "membership renewed at front desk.": "Membresia renovada en recepcion.",
  "additional personal training package.": "Paquete adicional de entrenamiento personal.",
};

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

export const getPaymentStatusLabel = (status?: string | null) =>
  paymentStatusLabels[status ?? ""] ?? status ?? "Sin estado";

export const getTransactionStatusLabel = (status?: string | null) =>
  transactionStatusLabels[status ?? ""] ?? status ?? "Sin estado";

export const getPaymentTypeLabel = (
  paymentType?: NamedEntity | null,
) => {
  const key = normalize(paymentType?.key);
  const name = normalize(paymentType?.name);

  return (
    paymentTypeLabels[key] ??
    paymentTypeNameLabels[name] ??
    paymentType?.name ??
    "Cobro personalizado"
  );
};

export const getPaymentLabel = (payment?: PaymentLike | null) =>
  getPaymentTypeLabel(payment?.paymentType);

export const getPaymentMethodLabel = (
  paymentMethod?: NamedEntity | null,
) => {
  const key = normalize(paymentMethod?.key);
  const name = normalize(paymentMethod?.name);

  return (
    paymentMethodLabels[key] ??
    paymentMethodNameLabels[name] ??
    paymentMethod?.name ??
    "Metodo sin nombre"
  );
};

export const getPaymentMethodDescription = (
  paymentMethod?: DescribedEntity | null,
) => {
  const description = paymentMethod?.description?.trim();

  if (!description) {
    return "Metodo habilitado por la organizacion.";
  }

  return descriptionLabels[normalize(description)] ?? description;
};

export const getBillingNoteLabel = (notes?: string | null) => {
  const value = notes?.trim();

  if (!value) return null;

  return noteLabels[normalize(value)] ?? value;
};

export const getTransactionMethodLabel = (
  transaction?: TransactionLike | null,
) => getPaymentMethodLabel(transaction?.paymentMethod);
