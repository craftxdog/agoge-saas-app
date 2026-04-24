import { Link } from "react-router-dom";
import { LoginForm } from "@/components/authenticacion/login-form";
import { AuthShell } from "@/components/organisms/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Entra a tu espacio de trabajo"
      description="Accede con tu usuario y, si ya conoces el slug, abre directamente la organizacion correcta."
      asideTitle="Todo tu centro operando desde una sola sesion."
      asideDescription="Agoge respeta el contexto de cada organizacion: modulos habilitados, permisos, roles y datos siempre se cargan por tenant."
      switchLabel="Aun no tienes cuenta?"
      switchTo="/register"
      switchAction="Crea tu organizacion"
    >
      <div className="grid gap-4">
        <LoginForm />
        <p className="text-sm text-muted-foreground">
          Tienes una invitacion?{" "}
          <Link className="font-semibold text-primary hover:underline" to="/accept-invitation">
            Aceptarla aqui
          </Link>
          .
        </p>
      </div>
    </AuthShell>
  );
}
