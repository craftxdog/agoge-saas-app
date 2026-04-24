import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CursorPaginationMeta } from "@/shared/api/types";

const pageSizeOptions = [10, 20, 50, 100];

type CursorPaginationProps = {
  meta?: CursorPaginationMeta;
  limit: number;
  itemLabel: string;
  hasPreviousCursor?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onLimitChange: (limit: number) => void;
};

export function CursorPagination({
  meta,
  limit,
  itemLabel,
  hasPreviousCursor = false,
  onPrevious,
  onNext,
  onLimitChange,
}: CursorPaginationProps) {
  if (!meta) return null;

  const count = meta?.count ?? 0;

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Mostrando {count} {itemLabel}
        </p>
        <p className="text-xs text-muted-foreground">
          Navegacion cursor-based sincronizada con la API.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tamaño
          </span>
          <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
            <SelectTrigger className="h-10 w-[92px] rounded-full bg-white/80">
              <SelectValue placeholder="Límite" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!hasPreviousCursor}
            onClick={onPrevious}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={!meta?.hasNextPage}
            onClick={onNext}
          >
            Siguiente
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
