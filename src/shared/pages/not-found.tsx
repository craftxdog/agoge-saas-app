"use client";

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[80vh] flex-col items-center justify-center text-center px-6">

      {/* CODE */}
      <h1 className="text-7xl font-bold tracking-tight">404</h1>

      {/* TITLE */}
      <p className="mt-4 text-lg font-medium">
        Página no encontrada
      </p>

      {/* DESCRIPTION */}
      <p className="mt-2 text-muted-foreground max-w-md">
        La página que buscas no existe o fue movida.
        Verifica la URL o regresa al inicio.
      </p>

      {/* ACTIONS */}
      <div className="mt-6 flex items-center gap-3">
        <Button asChild>
          <Link to="/">
            <IconHome className="mr-2 size-4" />
            Ir al Dashboard
          </Link>
        </Button>

        <Button
          variant="ghost"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
        >
          <IconArrowLeft className="mr-2 size-4" />
          Volver atrás
        </Button>
      </div>
    </div>
  );
}
