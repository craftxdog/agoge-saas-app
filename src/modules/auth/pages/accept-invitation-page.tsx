import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Ticket } from "lucide-react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "@/components/organisms/auth-shell";
import { FormError } from "@/components/atoms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptInvitationSchema,
  type AcceptInvitation,
} from "@/modules/users/schemas/users.schema";
import { useAcceptInvitation } from "@/modules/users/hooks/useUsers";

type AcceptInvitationForm = AcceptInvitation;

export default function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useAcceptInvitation();
  const tokenFromQuery = params.get("token") ?? "";

  const form = useForm<AcceptInvitationForm>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token: tokenFromQuery,
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      phone: "",
      documentId: "",
      address: "",
    },
  });

  const successMessage = useMemo(() => {
    if (!mutation.data?.data) return null;

    return `${mutation.data.data.member.user.firstName} ${mutation.data.data.member.user.lastName} ya pertenece a esta organizacion.`;
  }, [mutation.data?.data]);

  return (
    <AuthShell
      title="Aceptar invitacion"
      description="Completa tus datos para activar tu acceso a la organizacion y entrar al SaaS con tu propia cuenta."
      asideTitle="Invitaciones listas para incorporarte sin friccion."
      asideDescription="Este flujo usa el endpoint publico de aceptacion de invitaciones y crea o vincula tu cuenta a la organizacion correspondiente."
      switchLabel="Ya tienes acceso?"
      switchTo="/login"
      switchAction="Inicia sesion"
    >
      <form
        className="grid gap-4"
        onSubmit={form.handleSubmit((data) =>
          mutation.mutate(data, {
            onSuccess: () => {
              window.setTimeout(() => navigate("/login"), 900);
            },
          }),
        )}
      >
        <Field
          id="token"
          label="Token de invitacion"
          icon={<Ticket className="size-4 text-primary" />}
          error={form.formState.errors.token?.message}
        >
          <Input
            id="token"
            className="h-12 rounded-2xl bg-white/70"
            placeholder="Pega tu token"
            {...form.register("token")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="firstName"
            label="Nombre"
            error={form.formState.errors.firstName?.message}
          >
            <Input
              id="firstName"
              className="h-12 rounded-2xl bg-white/70"
              {...form.register("firstName")}
            />
          </Field>
          <Field
            id="lastName"
            label="Apellido"
            error={form.formState.errors.lastName?.message}
          >
            <Input
              id="lastName"
              className="h-12 rounded-2xl bg-white/70"
              {...form.register("lastName")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="username"
            label="Usuario"
            error={form.formState.errors.username?.message}
          >
            <Input
              id="username"
              className="h-12 rounded-2xl bg-white/70"
              placeholder="Opcional"
              {...form.register("username")}
            />
          </Field>
          <Field
            id="password"
            label="Contrasena"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              className="h-12 rounded-2xl bg-white/70"
              {...form.register("password")}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="phone"
            label="Telefono"
            error={form.formState.errors.phone?.message}
          >
            <Input
              id="phone"
              className="h-12 rounded-2xl bg-white/70"
              {...form.register("phone")}
            />
          </Field>
          <Field
            id="documentId"
            label="Documento"
            error={form.formState.errors.documentId?.message}
          >
            <Input
              id="documentId"
              className="h-12 rounded-2xl bg-white/70"
              {...form.register("documentId")}
            />
          </Field>
        </div>

        <Field
          id="address"
          label="Direccion"
          error={form.formState.errors.address?.message}
        >
          <Input
            id="address"
            className="h-12 rounded-2xl bg-white/70"
            {...form.register("address")}
          />
        </Field>

        {successMessage && (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-4" />
              Invitacion aceptada
            </div>
            <p className="mt-2">{successMessage}</p>
          </div>
        )}

        <Button
          type="submit"
          className="h-12 rounded-full"
          disabled={mutation.isPending}
        >
          Aceptar invitacion
          <ArrowRight className="size-4" />
        </Button>

        <p className="text-sm text-muted-foreground">
          Si ya tienes cuenta y solo quieres entrar, vuelve a{" "}
          <Link className="font-semibold text-primary hover:underline" to="/login">
            iniciar sesion
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}

function Field({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
      <FormError message={error} />
    </div>
  );
}
