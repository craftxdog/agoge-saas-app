import { RegisterForm } from "@/components/authenticacion/register-form";
import { AuthShell } from "@/components/organisms/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu SaaS academico"
      description="Registra la organizacion, configura la base operativa y crea la cuenta fundadora en un solo flujo."
      asideTitle="Tu academia lista para crecer por modulos."
      asideDescription="El registro crea organizacion, usuario fundador, membresia activa, permisos iniciales, modulos habilitados y configuracion regional."
      switchLabel="Ya tienes una cuenta?"
      switchTo="/login"
      switchAction="Inicia sesion"
      className="items-start overflow-y-auto"
    >
      <RegisterForm />
    </AuthShell>
  );
}
