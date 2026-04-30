import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  PanelsTopLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { FormError } from "@/components/atoms/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginSchema,
  type LoginFormValues,
  type LoginSchema,
} from "@/modules/auth/schemas/auth.schema";
import { useLogin } from "@/shared/hooks/useLogin";

export function LoginForm() {
  const form = useForm<LoginFormValues, unknown, LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationSlug: "",
      rememberMe: true,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending } = useLogin({
    onFieldError: (field, message) => {
      form.setError(field, { type: "server", message });
    },
  });

  const onSubmit = (data: LoginSchema) => {
    form.clearErrors();
    mutate(data);
  };

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Correo electronico
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            autoComplete="email"
            className="h-12 rounded-2xl bg-white/80 pl-10"
            placeholder="fundador@academia.com"
            {...form.register("email")}
          />
        </div>
        <FormError message={form.formState.errors.email?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm font-semibold">
          Contrasena
        </Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="h-12 rounded-2xl bg-white/80 pl-10 pr-12"
            placeholder="Tu contrasena segura"
            {...form.register("password")}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <FormError message={form.formState.errors.password?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="organizationSlug" className="text-sm font-semibold">
          Organizacion
        </Label>
        <div className="relative">
          <PanelsTopLeft className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="organizationSlug"
            autoComplete="organization"
            className="h-12 rounded-2xl bg-white/80 pl-10"
            placeholder="agoge-academy (opcional)"
            {...form.register("organizationSlug")}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Si perteneces a varias organizaciones, puedes dejarlo vacio y elegir
          despues.
        </p>
        <FormError message={form.formState.errors.organizationSlug?.message} />
      </div>

      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-primary"
          {...form.register("rememberMe")}
        />
        Mantener mi sesion en este dispositivo
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-12 rounded-2xl text-base"
      >
        {isPending && <Loader2 className="animate-spin" />}
        Iniciar sesion
      </Button>
    </form>
  );
}
