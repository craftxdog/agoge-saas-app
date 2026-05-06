import { Ban, Compass, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigationContext } from "@/shared/providers/navigation-provider";

export default function RestrictedPage() {
  const location = useLocation();
  const { defaultPath } = useNavigationContext();
  const requestedPath =
    typeof location.state === "object" &&
    location.state &&
    "from" in location.state
      ? String(location.state.from)
      : null;

  return (
    <section className="grid gap-6">
      <Card className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(217,154,95,0.14),_rgba(111,145,184,0.12))] shadow-sm">
        <CardContent className="grid gap-6 p-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <span className="grid size-16 place-items-center rounded-[1.75rem] bg-white/85 text-primary shadow-sm">
            <ShieldAlert className="size-8" />
          </span>

          <div className="grid gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                Acceso restringido
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
                Esta ruta existe, pero no esta autorizada para tu membership activa.
              </h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                La API no devolvio esta pantalla dentro de{" "}
                <code>GET /api/v1/rbac/navigation</code>, asi que el frontend no la
                puede tratar como una vista visible para tu contexto actual.
              </p>
            </div>

            {requestedPath ? (
              <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-white/70 px-4 py-3 text-sm text-muted-foreground">
                Ruta solicitada:{" "}
                <span className="font-medium text-foreground">{requestedPath}</span>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link to={defaultPath}>
                  <Compass className="size-4" />
                  Ir a una vista autorizada
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/app">
                  <Ban className="size-4" />
                  Volver al dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
