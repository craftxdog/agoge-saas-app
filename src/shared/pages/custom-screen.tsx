import { ExternalLink, FileText, LayoutPanelTop, Rows3 } from "lucide-react";
import type { AuthorizedScreen } from "@/shared/navigation/navigation-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CustomScreenProps = {
  screen: AuthorizedScreen;
};

type ScreenConfig = {
  description?: string;
  url?: string;
  src?: string;
  endpoint?: string;
  method?: string;
};

const readConfig = (value: unknown): ScreenConfig => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as ScreenConfig;
};

export default function CustomScreenPage({ screen }: CustomScreenProps) {
  const config = readConfig(screen.config);
  const externalUrl = config.url ?? config.src;
  const type = screen.type.toUpperCase();

  if (type === "EMBED" && externalUrl) {
    return (
      <section className="grid gap-6">
        <ScreenHero screen={screen} description={config.description} />
        <div className="overflow-hidden rounded-[1.75rem] border bg-white shadow-sm">
          <iframe
            src={externalUrl}
            title={screen.title}
            className="h-[72vh] w-full"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <ScreenHero screen={screen} description={config.description} />
      <Card className="rounded-[1.75rem]">
        <CardContent className="grid gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              {type === "FORM" ? (
                <Rows3 className="size-5" />
              ) : type === "EXTERNAL_LINK" ? (
                <ExternalLink className="size-5" />
              ) : (
                <FileText className="size-5" />
              )}
            </span>
            <div>
              <h2 className="font-semibold">{screen.title}</h2>
              <p className="text-sm text-muted-foreground">
                {screen.path} · {screen.requiredPermissionKey ?? "sin permiso requerido"}
              </p>
            </div>
          </div>

          {type === "EXTERNAL_LINK" && externalUrl ? (
            <Button asChild className="w-fit rounded-full">
              <a href={externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Abrir enlace
              </a>
            </Button>
          ) : null}

          {type === "FORM" && config.endpoint ? (
            <div className="rounded-2xl border bg-white/70 p-4 text-sm text-muted-foreground">
              {config.method ?? "POST"} {config.endpoint}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

function ScreenHero({
  screen,
  description,
}: {
  screen: AuthorizedScreen;
  description?: string;
}) {
  return (
    <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
        <LayoutPanelTop className="size-4" />
        {screen.moduleName}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        {screen.title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
