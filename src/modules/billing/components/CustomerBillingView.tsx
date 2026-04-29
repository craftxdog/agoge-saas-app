import { useState } from "react";
import {
  BadgeDollarSign,
  CalendarClock,
  CreditCard,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useAuth } from "@/shared/hooks/useAuth";
import {
  getBillingNoteLabel,
  getPaymentLabel,
  getPaymentMethodDescription,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getTransactionStatusLabel,
} from "../utils/billing-copy";
import {
  usePaymentMethods,
  usePayments,
} from "../hooks/useBilling";

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-NI", { dateStyle: "medium" }).format(date);
};

const parseAmount = (value?: string | null) => Number(value ?? 0);

const statusTone = (status: string) => {
  switch (status) {
    case "PAID":
      return "default";
    case "OVERDUE":
      return "destructive";
    default:
      return "outline";
  }
};

export function CustomerBillingView() {
  const { memberId } = useAccessContext();
  const { activeMembership } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const payments = usePayments(
    {
      memberId: memberId ?? undefined,
      status: selectedStatus === "ALL" ? undefined : (selectedStatus as never),
      sortBy: "dueDate",
      sortDirection: "desc",
      limit: 50,
    },
    {
      enabled: Boolean(memberId),
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  );
  const paymentMethods = usePaymentMethods(undefined, {
    enabled: Boolean(memberId),
  });

  const paymentItems = [...(payments.data?.items ?? [])].sort((left, right) => {
    const dueDateDiff =
      new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime();

    if (dueDateDiff !== 0) {
      return dueDateDiff;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
  const currency =
    paymentItems[0]?.currency ??
    activeMembership?.organization.defaultCurrency ??
    "USD";

  const openItems = paymentItems.filter(
    (payment) => !["PAID", "CANCELLED", "REFUNDED"].includes(payment.status),
  );
  const overdueItems = paymentItems.filter((payment) => payment.status === "OVERDUE");
  const paidItems = paymentItems.filter((payment) => payment.status === "PAID");
  const summary = {
    openBalance: openItems.reduce(
      (total, payment) => total + parseAmount(payment.balance),
      0,
    ),
    overdueBalance: overdueItems.reduce(
      (total, payment) => total + parseAmount(payment.balance),
      0,
    ),
    paidAmount: paidItems.reduce(
      (total, payment) => total + parseAmount(payment.paidAmount),
      0,
    ),
  };

  const nextDuePayment = [...openItems].sort(
    (left, right) =>
      new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime(),
  )[0];

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(217,154,95,0.18),_rgba(79,143,131,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Portal de cliente
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Tus cobros, vencimientos y pagos registrados
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Esta vista muestra solamente los cargos asociados a tu membresia activa
          dentro de {activeMembership?.organization.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={ReceiptText}
          label="Saldo pendiente"
          value={money(summary.openBalance, currency)}
          helper={`${paymentItems.filter((payment) => payment.balance !== "0").length} cobros con saldo`}
        />
        <SummaryCard
          icon={CalendarClock}
          label="Vencido"
          value={money(summary.overdueBalance, currency)}
          helper={
            nextDuePayment
              ? `Proximo vencimiento: ${formatDate(nextDuePayment.dueDate)}`
              : "No tienes vencimientos pendientes"
          }
        />
        <SummaryCard
          icon={BadgeDollarSign}
          label="Pagado"
          value={money(summary.paidAmount, currency)}
          helper="Acumulado en tus pagos cerrados"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Mis cobros</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Historial de facturas y cargos vinculados a tu cuenta.
              </p>
            </div>
            <select
              className="h-11 rounded-full border bg-white/70 px-4 text-sm"
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="OVERDUE">Vencidos</option>
              <option value="PARTIALLY_PAID">Parciales</option>
              <option value="PAID">Pagados</option>
            </select>
          </CardHeader>
          <CardContent className="grid gap-3">
            {payments.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))
            ) : paymentItems.length ? (
              paymentItems.map((payment) => (
                <div key={payment.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {getPaymentLabel(payment)}
                        </h3>
                        <Badge variant={statusTone(payment.status)}>
                          {getPaymentStatusLabel(payment.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Factura: {payment.invoiceNumber ?? "Sin numero"} · vence{" "}
                        {formatDate(payment.dueDate)}
                      </p>
                      {getBillingNoteLabel(payment.notes) ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          {getBillingNoteLabel(payment.notes)}
                        </p>
                      ) : null}
                    </div>
                    <div className="min-w-[148px] rounded-2xl bg-muted/45 px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Saldo
                      </p>
                      <p className="mt-2 text-xl font-semibold">
                        {money(parseAmount(payment.balance), payment.currency)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pagado {money(parseAmount(payment.paidAmount), payment.currency)}
                      </p>
                    </div>
                  </div>

                  {payment.transactions.length ? (
                    <div className="mt-4 grid gap-2 border-t border-dashed pt-4">
                      {payment.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex flex-col gap-1 rounded-xl bg-muted/35 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {getPaymentMethodLabel(transaction.paymentMethod)}
                            </p>
                            <p className="text-muted-foreground">
                              {transaction.reference ?? "Sin referencia"} ·{" "}
                              {formatDate(transaction.processedAt ?? transaction.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {money(parseAmount(transaction.amount), transaction.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {getTransactionStatusLabel(transaction.status)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                No hay cobros para mostrar con el filtro actual.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Metodos disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {paymentMethods.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl" />
              ))
            ) : paymentMethods.data?.length ? (
              paymentMethods.data.map((method) => (
                <div key={method.id} className="rounded-2xl border bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{getPaymentMethodLabel(method)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getPaymentMethodDescription(method)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {method.requiresReference ? "Con referencia" : "Libre"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                La organizacion no ha publicado metodos de pago visibles para tu cuenta.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof ReceiptText;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[1.4rem]">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
