import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Building2,
  CircleUserRound,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormError } from "@/components/atoms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type RegisterOrganizationFormValues,
  registerOrganizationSchema,
  type RegisterOrganizationSchema,
} from "@/modules/auth/schemas/auth.schema";
import { useRegisterOrganization } from "@/shared/hooks/useRegisterOrganization";

const passwordTips = [
  "12+ caracteres",
  "Mayuscula y minuscula",
  "Numero y simbolo",
];

export function RegisterForm() {
  const { mutate, isPending } = useRegisterOrganization();

  const form = useForm<
    RegisterOrganizationFormValues,
    unknown,
    RegisterOrganizationSchema
  >({
    resolver: zodResolver(registerOrganizationSchema),
    defaultValues: {
      organizationName: "",
      organizationSlug: "",
      timezone: "America/Managua",
      locale: "es-NI",
      currency: "USD",
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      phone: "",
      documentId: "",
    },
  });

  const onSubmit = (data: RegisterOrganizationSchema) => {
    const { confirmPassword, ...payload } = data;
    void confirmPassword;
    mutate(payload);
  };

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4 rounded-3xl border bg-white/62 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Organizacion</h2>
            <p className="text-sm text-muted-foreground">
              Crea el tenant principal de tu academia.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="organizationName"
            label="Nombre"
            placeholder="Agoge Academy"
            register={form.register("organizationName")}
            error={form.formState.errors.organizationName?.message}
          />
          <Field
            id="organizationSlug"
            label="Slug"
            placeholder="agoge-academy"
            register={form.register("organizationSlug")}
            error={form.formState.errors.organizationSlug?.message}
          />
          <Field
            id="currency"
            label="Moneda"
            placeholder="USD"
            register={form.register("currency")}
            error={form.formState.errors.currency?.message}
          />
          <Field
            id="timezone"
            label="Zona horaria"
            placeholder="America/Managua"
            register={form.register("timezone")}
            error={form.formState.errors.timezone?.message}
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border bg-white/62 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CircleUserRound className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Cuenta fundadora</h2>
            <p className="text-sm text-muted-foreground">
              Este usuario recibira el rol administrador inicial.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="Nombre"
            placeholder="Alex"
            register={form.register("firstName")}
            error={form.formState.errors.firstName?.message}
          />
          <Field
            id="lastName"
            label="Apellido"
            placeholder="Founder"
            register={form.register("lastName")}
            error={form.formState.errors.lastName?.message}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="fundador@academia.com"
            icon={<Mail className="size-4" />}
            register={form.register("email")}
            error={form.formState.errors.email?.message}
          />
          <Field
            id="username"
            label="Usuario"
            placeholder="fundador"
            register={form.register("username")}
            error={form.formState.errors.username?.message}
          />
          <Field
            id="phone"
            label="Telefono"
            placeholder="+50588889999"
            register={form.register("phone")}
            error={form.formState.errors.phone?.message}
          />
          <Field
            id="documentId"
            label="Documento"
            placeholder="001-010190-0001A"
            register={form.register("documentId")}
            error={form.formState.errors.documentId?.message}
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border bg-white/62 p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Seguridad</h2>
            <p className="text-sm text-muted-foreground">
              La API exige una contrasena fuerte desde el registro.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="password"
            label="Password"
            type="password"
            placeholder="SaaS-ready-password-2026!"
            register={form.register("password")}
            error={form.formState.errors.password?.message}
          />
          <Field
            id="confirmPassword"
            label="Confirmar password"
            type="password"
            placeholder="Repite tu password"
            register={form.register("confirmPassword")}
            error={form.formState.errors.confirmPassword?.message}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {passwordTips.map((tip) => (
            <span
              key={tip}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              <BadgeCheck className="size-3.5" />
              {tip}
            </span>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-12 rounded-2xl text-base"
      >
        {isPending && <Loader2 className="animate-spin" />}
        Crear mi organizacion
      </Button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  icon?: ReactNode;
  register: UseFormRegisterReturn;
  error?: string;
};

function Field({
  id,
  label,
  placeholder,
  type = "text",
  icon,
  register,
  error,
}: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          className={icon ? "h-12 rounded-2xl bg-white/80 pl-10" : "h-12 rounded-2xl bg-white/80"}
          {...register}
        />
      </div>
      <FormError message={error} />
    </div>
  );
}
