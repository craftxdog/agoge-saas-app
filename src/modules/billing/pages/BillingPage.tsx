import type { ReactNode } from "react";
import {
  Banknote,
  CreditCard,
  FileText,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CursorPagination } from "@/shared/components/CursorPagination";
import { ScrollPanel } from "@/shared/components/ScrollPanel";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCursorPagination } from "@/shared/hooks/useCursorPagination";
import { useMembers } from "@/modules/users/hooks/useUsers";
import {
  paymentFrequencies,
  paymentStatuses,
  transactionStatuses,
  type CreatePayment,
  type CreatePaymentMethod,
  type CreatePaymentTransaction,
  type CreatePaymentType,
  type Payment,
  type PaymentStatus,
} from "../schemas/billing.schema";
import {
  useBillingSummary,
  useCreatePayment,
  useCreatePaymentMethod,
  useCreatePaymentTransaction,
  useCreatePaymentType,
  useDeletePaymentMethod,
  useDeletePaymentType,
  usePayment,
  usePaymentMethods,
  usePayments,
  usePaymentTransactions,
  usePaymentTypes,
  useUpdatePayment,
  useUpdatePaymentMethod,
  useUpdatePaymentType,
} from "../hooks/useBilling";

const today = new Date().toISOString().slice(0, 10);
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const typeDefaults: CreatePaymentType = {
  key: "",
  name: "",
  description: "",
  amount: "",
  currency: "NIO",
  frequency: "MONTHLY",
  isActive: true,
};

const methodDefaults: CreatePaymentMethod = {
  key: "",
  name: "",
  description: "",
  requiresReference: false,
  isActive: true,
};

const paymentDefaults: CreatePayment = {
  memberId: "",
  paymentTypeId: "",
  invoiceNumber: "",
  amount: "",
  currency: "NIO",
  dueDate: today,
  periodMonth: currentMonth,
  periodYear: currentYear,
  notes: "",
};

const transactionDefaults: CreatePaymentTransaction = {
  paymentMethodId: "",
  amount: "",
  currency: "NIO",
  status: "SUCCEEDED",
  reference: "",
  processedAt: "",
};

const clean = <T extends Record<string, unknown>>(payload: T) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== ""),
  ) as Partial<T>;

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("payments");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>();
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [paymentForm, setPaymentForm] = useState(paymentDefaults);
  const [typeForm, setTypeForm] = useState(typeDefaults);
  const [methodForm, setMethodForm] = useState(methodDefaults);
  const [transactionForm, setTransactionForm] = useState(transactionDefaults);
  const [paymentNotes, setPaymentNotes] = useState("");
  const paymentsPagination = useCursorPagination(20);
  const debouncedCatalogSearch = useDebouncedValue(catalogSearch, 350);

  const summary = useBillingSummary();
  const members = useMembers({
    status: "ACTIVE",
    limit: 100,
    sortBy: "createdAt",
    sortDirection: "desc",
  }, {
    enabled: activeTab === "payments",
  });
  const paymentTypes = usePaymentTypes({
    search: debouncedCatalogSearch || undefined,
  }, {
    enabled: activeTab === "payments" || activeTab === "types",
  });
  const paymentMethods = usePaymentMethods({
    search: debouncedCatalogSearch || undefined,
  }, {
    enabled: activeTab === "transactions" || activeTab === "methods",
  });
  const payments = usePayments({
    status: paymentStatus,
    cursor: paymentsPagination.cursor,
    limit: paymentsPagination.limit,
    sortBy: "dueDate",
    sortDirection: "desc",
  }, {
    enabled: activeTab === "payments" || activeTab === "transactions",
  });
  const paymentDetail = usePayment(selectedPaymentId || undefined, {
    enabled: activeTab === "transactions",
  });
  const transactions = usePaymentTransactions(selectedPaymentId || undefined, undefined, {
    enabled: activeTab === "transactions",
  });
  const createPaymentType = useCreatePaymentType();
  const updatePaymentType = useUpdatePaymentType();
  const deletePaymentType = useDeletePaymentType();
  const createPaymentMethod = useCreatePaymentMethod();
  const updatePaymentMethod = useUpdatePaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const createTransaction = useCreatePaymentTransaction();

  const typeOptions = paymentTypes.data ?? [];
  const methodOptions = paymentMethods.data ?? [];
  const memberOptions = members.data?.items ?? [];
  const selectedPayment =
    paymentDetail.data ?? payments.data?.items.find((payment) => payment.id === selectedPaymentId);

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(217,154,95,0.18),_rgba(79,143,131,0.12))] p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Billing operativo
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Cobros, conceptos, metodos y transacciones
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Administra todos los endpoints del modulo billing con selects guiados
          para miembros, conceptos de cobro y metodos de pago.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Balance abierto"
          value={summary.data?.openBalance ?? "0.00"}
          helper={`${summary.data?.openPayments ?? 0} cobros abiertos`}
        />
        <SummaryCard
          label="Vencido"
          value={summary.data?.overdueBalance ?? "0.00"}
          helper={`${summary.data?.overduePayments ?? 0} cobros vencidos`}
        />
        <SummaryCard
          label="Pagado este mes"
          value={summary.data?.paidThisMonth ?? "0.00"}
          helper="Transacciones exitosas del mes"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start rounded-2xl bg-muted/70 p-1">
          <TabsTrigger value="payments" className="rounded-xl px-4 py-2">
            Cobros
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-xl px-4 py-2">
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="types" className="rounded-xl px-4 py-2">
            Conceptos
          </TabsTrigger>
          <TabsTrigger value="methods" className="rounded-xl px-4 py-2">
            Metodos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="size-5 text-primary" />
                  Nuevo cobro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    createPayment.mutate(clean(paymentForm) as CreatePayment, {
                      onSuccess: () => setPaymentForm(paymentDefaults),
                    });
                  }}
                >
                  <MemberSelect
                    value={paymentForm.memberId}
                    members={memberOptions}
                    onChange={(value) =>
                      setPaymentForm((current) => ({ ...current, memberId: value }))
                    }
                  />
                  <PaymentTypeSelect
                    value={paymentForm.paymentTypeId ?? ""}
                    types={typeOptions}
                    onChange={(value) => {
                      const selectedType = typeOptions.find((type) => type.id === value);
                      setPaymentForm((current) => ({
                        ...current,
                        paymentTypeId: value,
                        amount: selectedType?.amount ?? current.amount,
                        currency: selectedType?.currency ?? current.currency,
                      }));
                    }}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Monto"
                      value={paymentForm.amount ?? ""}
                      onChange={(value) =>
                        setPaymentForm((current) => ({ ...current, amount: value }))
                      }
                    />
                    <TextField
                      label="Moneda"
                      value={paymentForm.currency ?? "NIO"}
                      onChange={(value) =>
                        setPaymentForm((current) => ({
                          ...current,
                          currency: value.toUpperCase(),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <TextField
                      label="Vence"
                      type="date"
                      value={paymentForm.dueDate}
                      onChange={(value) =>
                        setPaymentForm((current) => ({ ...current, dueDate: value }))
                      }
                    />
                    <TextField
                      label="Mes"
                      type="number"
                      value={String(paymentForm.periodMonth ?? "")}
                      onChange={(value) =>
                        setPaymentForm((current) => ({
                          ...current,
                          periodMonth: Number(value),
                        }))
                      }
                    />
                    <TextField
                      label="Anio"
                      type="number"
                      value={String(paymentForm.periodYear ?? "")}
                      onChange={(value) =>
                        setPaymentForm((current) => ({
                          ...current,
                          periodYear: Number(value),
                        }))
                      }
                    />
                  </div>
                  <TextField
                    label="Factura"
                    value={paymentForm.invoiceNumber ?? ""}
                    onChange={(value) =>
                      setPaymentForm((current) => ({
                        ...current,
                        invoiceNumber: value,
                      }))
                    }
                  />
                  <Textarea
                    className="min-h-24 rounded-2xl bg-white/70"
                    placeholder="Notas internas del cobro"
                    value={paymentForm.notes ?? ""}
                    onChange={(event) =>
                      setPaymentForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                  />
                  <Button className="w-fit rounded-full" disabled={createPayment.isPending}>
                    Crear cobro
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      Cobros
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {payments.data?.pagination?.count ?? 0} cobros en esta vista
                    </p>
                  </div>
                  <select
                    className="h-11 rounded-full border bg-white/70 px-4 text-sm"
                    value={paymentStatus ?? ""}
                    onChange={(event) =>
                      {
                        setPaymentStatus(
                          event.target.value
                            ? (event.target.value as PaymentStatus)
                            : undefined,
                        );
                        paymentsPagination.reset();
                      }
                    }
                  >
                    <option value="">Todos</option>
                    {paymentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ScrollPanel>
                  {payments.isLoading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <PaymentRowSkeleton key={index} />
                      ))
                    : (payments.data?.items ?? []).map((payment) => (
                        <PaymentRow
                          key={payment.id}
                          payment={payment}
                          selected={selectedPaymentId === payment.id}
                          onSelect={() => {
                            setSelectedPaymentId(payment.id);
                            setTransactionForm((current) => ({
                              ...current,
                              amount: payment.balance,
                              currency: payment.currency,
                            }));
                            setPaymentNotes(payment.notes ?? "");
                          }}
                        />
                      ))}
                </ScrollPanel>

                <CursorPagination
                  meta={payments.data?.pagination}
                  limit={paymentsPagination.limit}
                  itemLabel="cobros"
                  hasPreviousCursor={paymentsPagination.hasPreviousCursor}
                  onPrevious={paymentsPagination.goPrevious}
                  onNext={() =>
                    paymentsPagination.goNext(payments.data?.pagination?.nextCursor)
                  }
                  onLimitChange={paymentsPagination.updateLimit}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="size-5 text-primary" />
                  Registrar transaccion
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <PaymentSelect
                  value={selectedPaymentId}
                  payments={payments.data?.items ?? []}
                  onChange={(value) => {
                    setSelectedPaymentId(value);
                    const payment = payments.data?.items.find((item) => item.id === value);
                    if (payment) {
                      setTransactionForm((current) => ({
                        ...current,
                        amount: payment.balance,
                        currency: payment.currency,
                      }));
                      setPaymentNotes(payment.notes ?? "");
                    }
                  }}
                />

                {selectedPayment && (
                  <div className="rounded-2xl border bg-white/60 p-4">
                    <p className="font-semibold">
                      {selectedPayment.member.firstName} {selectedPayment.member.lastName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Balance {selectedPayment.balance} {selectedPayment.currency} · Estado {selectedPayment.status}
                    </p>
                  </div>
                )}

                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!selectedPaymentId) return;
                    createTransaction.mutate({
                      paymentId: selectedPaymentId,
                      data: clean(transactionForm) as CreatePaymentTransaction,
                    });
                  }}
                >
                  <PaymentMethodSelect
                    value={transactionForm.paymentMethodId ?? ""}
                    methods={methodOptions}
                    onChange={(value) =>
                      setTransactionForm((current) => ({
                        ...current,
                        paymentMethodId: value,
                      }))
                    }
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      label="Monto"
                      value={transactionForm.amount}
                      onChange={(value) =>
                        setTransactionForm((current) => ({
                          ...current,
                          amount: value,
                        }))
                      }
                    />
                    <TextField
                      label="Moneda"
                      value={transactionForm.currency ?? "NIO"}
                      onChange={(value) =>
                        setTransactionForm((current) => ({
                          ...current,
                          currency: value.toUpperCase(),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Estado</Label>
                    <select
                      className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                      value={transactionForm.status ?? "SUCCEEDED"}
                      onChange={(event) =>
                        setTransactionForm((current) => ({
                          ...current,
                          status: event.target.value as CreatePaymentTransaction["status"],
                        }))
                      }
                    >
                      {transactionStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <TextField
                    label="Referencia"
                    value={transactionForm.reference ?? ""}
                    onChange={(value) =>
                      setTransactionForm((current) => ({
                        ...current,
                        reference: value,
                      }))
                    }
                  />
                  <Button
                    className="w-fit rounded-full"
                    disabled={!selectedPaymentId || createTransaction.isPending}
                  >
                    Registrar pago
                  </Button>
                </form>

                <div className="rounded-2xl border bg-white/60 p-4">
                  <p className="font-semibold">Actualizar cobro seleccionado</p>
                  <div className="mt-3 grid gap-3">
                    <select
                      className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
                      value={selectedPayment?.status ?? ""}
                      onChange={(event) => {
                        if (!selectedPaymentId) return;
                        updatePayment.mutate({
                          paymentId: selectedPaymentId,
                          data: { status: event.target.value as PaymentStatus },
                        });
                      }}
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      className="min-h-24 rounded-2xl bg-white/70"
                      placeholder="Notas del cobro"
                      value={paymentNotes}
                      onChange={(event) => setPaymentNotes(event.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit rounded-full"
                      disabled={!selectedPaymentId || updatePayment.isPending}
                      onClick={() =>
                        updatePayment.mutate({
                          paymentId: selectedPaymentId,
                          data: { notes: paymentNotes },
                        })
                      }
                    >
                      Guardar notas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem]">
              <CardHeader>
                <CardTitle>Transacciones del cobro</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <ScrollPanel heightClassName="max-h-[52vh]">
                  {(transactions.data ?? selectedPayment?.transactions ?? []).map((transaction) => (
                    <div key={transaction.id} className="rounded-2xl border bg-white/60 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">
                            {transaction.amount} {transaction.currency}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {transaction.paymentMethod?.name ?? "Sin metodo"} · {transaction.reference ?? "Sin referencia"}
                          </p>
                        </div>
                        <Badge className="w-fit rounded-full">{transaction.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {!selectedPaymentId && (
                    <p className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
                      Selecciona un cobro para ver sus transacciones.
                    </p>
                  )}
                </ScrollPanel>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="types">
          <CatalogSection
            title="Conceptos de pago"
            icon={<WalletCards className="size-5 text-primary" />}
            search={catalogSearch}
            onSearch={setCatalogSearch}
            form={
              <CatalogForm
                kind="type"
                values={typeForm}
                onChange={setTypeForm}
                onSubmit={() =>
                  createPaymentType.mutate(clean(typeForm) as CreatePaymentType, {
                    onSuccess: () => setTypeForm(typeDefaults),
                  })
                }
              />
            }
          >
            {typeOptions.map((type) => (
              <CatalogRow
                key={type.id}
                title={type.name}
                description={`${type.key} · ${type.amount ?? "Sin monto"} ${type.currency} · ${type.frequency}`}
                active={type.isActive}
                onToggle={() =>
                  updatePaymentType.mutate({
                    paymentTypeId: type.id,
                    data: { isActive: !type.isActive },
                  })
                }
                onDelete={() => deletePaymentType.mutate(type.id)}
              />
            ))}
          </CatalogSection>
        </TabsContent>

        <TabsContent value="methods">
          <CatalogSection
            title="Metodos de pago"
            icon={<CreditCard className="size-5 text-primary" />}
            search={catalogSearch}
            onSearch={setCatalogSearch}
            form={
              <CatalogForm
                kind="method"
                values={methodForm}
                onChange={setMethodForm}
                onSubmit={() =>
                  createPaymentMethod.mutate(clean(methodForm) as CreatePaymentMethod, {
                    onSuccess: () => setMethodForm(methodDefaults),
                  })
                }
              />
            }
          >
            {methodOptions.map((method) => (
              <CatalogRow
                key={method.id}
                title={method.name}
                description={`${method.key} · ${method.requiresReference ? "Requiere referencia" : "Referencia opcional"}`}
                active={method.isActive}
                onToggle={() =>
                  updatePaymentMethod.mutate({
                    paymentMethodId: method.id,
                    data: { isActive: !method.isActive },
                  })
                }
                onDelete={() => deletePaymentMethod.mutate(method.id)}
              />
            ))}
          </CatalogSection>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PaymentRowSkeleton() {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-72 max-w-full rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <Card className="rounded-[1.5rem]">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function PaymentRow({
  payment,
  selected,
  onSelect,
}: {
  payment: Payment;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`rounded-2xl border p-4 text-left transition ${
        selected ? "border-primary bg-primary/10" : "bg-white/60 hover:bg-muted/60"
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">
              {payment.member.firstName} {payment.member.lastName}
            </p>
            <Badge className="rounded-full">{payment.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {payment.paymentType?.name ?? "Cobro manual"} · vence {new Date(payment.dueDate).toLocaleDateString("es-NI")}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-semibold">
            {payment.balance} {payment.currency}
          </p>
          <p className="text-xs text-muted-foreground">Pagado {payment.paidAmount}</p>
        </div>
      </div>
    </button>
  );
}

function MemberSelect({
  value,
  members,
  onChange,
}: {
  value: string;
  members: { id: string; user: { firstName: string; lastName: string; email: string } }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Miembro</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecciona miembro</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.user.firstName} {member.user.lastName} · {member.user.email}
          </option>
        ))}
      </select>
    </div>
  );
}

function PaymentTypeSelect({
  value,
  types,
  onChange,
}: {
  value: string;
  types: { id: string; name: string; amount?: string | null; currency: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Concepto</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Manual o sin concepto</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name} · {type.amount ?? "sin monto"} {type.currency}
          </option>
        ))}
      </select>
    </div>
  );
}

function PaymentMethodSelect({
  value,
  methods,
  onChange,
}: {
  value: string;
  methods: { id: string; name: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Metodo</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin metodo especifico</option>
        {methods.map((method) => (
          <option key={method.id} value={method.id}>
            {method.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function PaymentSelect({
  value,
  payments,
  onChange,
}: {
  value: string;
  payments: Payment[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>Cobro</Label>
      <select
        className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Selecciona un cobro</option>
        {payments.map((payment) => (
          <option key={payment.id} value={payment.id}>
            {payment.member.firstName} {payment.member.lastName} · {payment.balance} {payment.currency}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input
        type={type}
        className="h-11 rounded-2xl bg-white/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CatalogSection({
  title,
  icon,
  search,
  onSearch,
  form,
  children,
}: {
  title: string;
  icon: ReactNode;
  search: string;
  onSearch: (value: string) => void;
  form: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            Nuevo registro
          </CardTitle>
        </CardHeader>
        <CardContent>{form}</CardContent>
      </Card>
      <Card className="rounded-[1.75rem]">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{title}</CardTitle>
            <Input
              className="h-11 rounded-full bg-white/70"
              placeholder="Buscar..."
              value={search}
              onChange={(event) => onSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollPanel heightClassName="max-h-[56vh]">{children}</ScrollPanel>
        </CardContent>
      </Card>
    </div>
  );
}

function CatalogForm({
  kind,
  values,
  onChange,
  onSubmit,
}: {
  kind: "type" | "method";
  values: CreatePaymentType | CreatePaymentMethod;
  onChange: (values: never) => void;
  onSubmit: () => void;
}) {
  const current = values as Record<string, string | boolean | undefined>;
  const update = (key: string, value: string | boolean) =>
    onChange({ ...values, [key]: value } as never);

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <TextField
        label="Key"
        value={String(current.key ?? "")}
        onChange={(value) => update("key", value)}
      />
      <TextField
        label="Nombre"
        value={String(current.name ?? "")}
        onChange={(value) => update("name", value)}
      />
      <TextField
        label="Descripcion"
        value={String(current.description ?? "")}
        onChange={(value) => update("description", value)}
      />
      {kind === "type" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Monto"
              value={String(current.amount ?? "")}
              onChange={(value) => update("amount", value)}
            />
            <TextField
              label="Moneda"
              value={String(current.currency ?? "NIO")}
              onChange={(value) => update("currency", value.toUpperCase())}
            />
          </div>
          <div className="grid gap-2">
            <Label>Frecuencia</Label>
            <select
              className="h-11 rounded-2xl border bg-white/70 px-3 text-sm"
              value={String(current.frequency ?? "MONTHLY")}
              onChange={(event) => update("frequency", event.target.value)}
            >
              {paymentFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <label className="flex items-center gap-3 rounded-2xl border bg-white/60 p-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(current.requiresReference)}
            onChange={(event) => update("requiresReference", event.target.checked)}
          />
          Requiere referencia
        </label>
      )}
      <label className="flex items-center gap-3 rounded-2xl border bg-white/60 p-3 text-sm">
        <input
          type="checkbox"
          checked={Boolean(current.isActive)}
          onChange={(event) => update("isActive", event.target.checked)}
        />
        Activo
      </label>
      <Button className="w-fit rounded-full">Guardar</Button>
    </form>
  );
}

function CatalogRow({
  title,
  description,
  active,
  onToggle,
  onDelete,
}: {
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white/60 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{title}</p>
            <Badge variant={active ? "default" : "outline"} className="rounded-full">
              {active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={onToggle}>
            {active ? "Desactivar" : "Activar"}
          </Button>
          <Button size="sm" variant="destructive" className="rounded-full" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}
