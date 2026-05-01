import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FormActionRowProps = {
  isDirty: boolean;
  isPending?: boolean;
  onCancel: () => void;
  submitLabel: string;
  pendingLabel?: string;
  cancelLabel?: string;
  className?: string;
  submitDisabled?: boolean;
};

export function FormActionRow({
  isDirty,
  isPending = false,
  onCancel,
  submitLabel,
  pendingLabel,
  cancelLabel = "Cancelar",
  className,
  submitDisabled = false,
}: FormActionRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {isDirty ? (
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          disabled={isPending}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      ) : null}

      <Button
        type="submit"
        className="rounded-full"
        disabled={!isDirty || isPending || submitDisabled}
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        {isPending ? pendingLabel ?? submitLabel : submitLabel}
      </Button>
    </div>
  );
}
