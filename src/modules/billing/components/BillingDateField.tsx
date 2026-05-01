import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const formatDate = (value: string) => {
  if (!value) return "Selecciona una fecha";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Selecciona una fecha";

  return new Intl.DateTimeFormat("es-NI", {
    dateStyle: "full",
  }).format(date);
};

const getMonthLabel = (value: string) => {
  if (!value) return "Sin periodo detectado";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin periodo detectado";

  return new Intl.DateTimeFormat("es-NI", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const toInputDate = (value: Date) => value.toISOString().slice(0, 10);

const endOfMonth = (base: Date) =>
  new Date(base.getFullYear(), base.getMonth() + 1, 0);

type BillingDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function BillingDateField({
  label,
  value,
  onChange,
}: BillingDateFieldProps) {
  const today = new Date();
  const quickDates = [
    { label: "Hoy", value: toInputDate(today) },
    {
      label: "En 7 dias",
      value: toInputDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
    },
    { label: "Fin de mes", value: toInputDate(endOfMonth(today)) },
  ];

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-14 w-full justify-between rounded-[1.15rem] border-border/70 bg-white/78 px-4 py-3 text-left shadow-none"
          >
            <div>
              <p className="text-sm font-semibold">{formatDate(value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Periodo detectado: {getMonthLabel(value)}
              </p>
            </div>
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[22rem] rounded-[1.25rem] p-4">
          <div className="grid gap-4">
            <div>
              <p className="text-sm font-semibold">Fecha de vencimiento</p>
              <p className="mt-1 text-xs text-muted-foreground">
                El mes y el anio del periodo se sincronizan automaticamente.
              </p>
            </div>

            <Input
              type="date"
              className="h-11 rounded-xl bg-white/80"
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              {quickDates.map((option) => (
                <Button
                  key={option.label}
                  type="button"
                  size="sm"
                  variant={value === option.value ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => onChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}

              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => onChange("")}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
