import { cn } from "@/lib/utils";

type FormErrorProps = {
  message?: string;
  className?: string;
};

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p className={cn("text-sm font-medium text-destructive", className)}>
      {message}
    </p>
  );
}
