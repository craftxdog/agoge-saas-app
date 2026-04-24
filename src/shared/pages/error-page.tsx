"use client";

import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError();

  let title = "Algo salió mal";
  let description = "Ha ocurrido un error inesperado.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description = error.data || description;
  }

  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center text-center px-6">

      <h1 className="text-5xl font-bold">{title}</h1>

      <p className="mt-4 text-muted-foreground max-w-md">
        {description}
      </p>

      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link to="/">Ir al inicio</Link>
        </Button>

        <Button variant="ghost" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
