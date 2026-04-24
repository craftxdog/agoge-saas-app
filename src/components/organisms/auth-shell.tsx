import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/atoms/brand-mark";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  asideTitle: string;
  asideDescription: string;
  switchLabel: string;
  switchTo: string;
  switchAction: string;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  asideTitle,
  asideDescription,
  switchLabel,
  switchTo,
  switchAction,
  className,
}: AuthShellProps) {
  return (
    <main className="min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(111,162,154,0.22),_transparent_34%),linear-gradient(135deg,_#fffaf2_0%,_#eef7f4_48%,_#f6efe4_100%)] px-5 py-6 text-foreground">
      <div className="mx-auto grid min-h-[calc(100svh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden rounded-[2rem] border border-white/70 bg-primary/90 p-10 text-primary-foreground shadow-[var(--shadow-soft)] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-24 left-12 size-72 rounded-full bg-amber-100/20 blur-3xl" />

          <BrandMark className="relative text-primary-foreground [&_span_span:last-child]:text-primary-foreground/70" />

          <div className="relative max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
              SaaS multi-organizacion
            </p>
            <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight">
              {asideTitle}
            </h2>
            <p className="mt-6 text-base leading-7 text-primary-foreground/78">
              {asideDescription}
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-3 text-sm">
            {["Roles", "Cobros", "Agenda"].map((item) => (
              <div key={item} className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section
          className={cn(
            "flex items-center justify-center rounded-[2rem] border border-white/70 bg-white/78 p-5 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-8",
            className,
          )}
        >
          <div className="w-full max-w-xl">
            <div className="mb-10 flex items-center justify-between gap-4">
              <BrandMark compact className="lg:hidden" />
              <p className="ml-auto text-sm text-muted-foreground">
                {switchLabel}{" "}
                <Link className="font-semibold text-primary hover:underline" to={switchTo}>
                  {switchAction}
                </Link>
              </p>
            </div>

            <div className="mb-8">
              <h1 className="font-display text-4xl font-semibold tracking-tight">
                {title}
              </h1>
              <p className="mt-3 text-balance text-muted-foreground">{description}</p>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
