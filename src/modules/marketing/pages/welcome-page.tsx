import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  LockKeyhole,
  PanelsTopLeft,
  UsersRound,
} from "lucide-react";
import { BrandMark } from "@/components/atoms/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const answers = [
  {
    question: "Que soluciona?",
    answer:
      "Centraliza miembros, cobros, horarios, permisos, analitica y auditoria para academias que hoy operan con hojas sueltas, chats y procesos manuales.",
    icon: PanelsTopLeft,
  },
  {
    question: "Como se usa?",
    answer:
      "Creas una organizacion, invitas al equipo, activas modulos y cada usuario ve solo las pantallas permitidas por su rol y tenant.",
    icon: UsersRound,
  },
  {
    question: "Para que sirve?",
    answer:
      "Sirve para operar una academia como negocio SaaS: cobrar mejor, coordinar disponibilidad, leer indicadores y proteger informacion sensible.",
    icon: BadgeDollarSign,
  },
  {
    question: "Como resuelve problemas?",
    answer:
      "Conecta datos operativos en un solo flujo: permisos por modulo, registros auditables, dashboards y una API versionada bajo /api/v1.",
    icon: LockKeyhole,
  },
];

const modules = [
  { label: "Miembros", icon: UsersRound },
  { label: "Cobros", icon: BadgeDollarSign },
  { label: "Horarios", icon: CalendarClock },
  { label: "Analitica", icon: BarChart3 },
];

export default function WelcomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[radial-gradient(circle_at_12%_18%,_rgba(111,162,154,0.26),_transparent_28%),radial-gradient(circle_at_88%_8%,_rgba(238,181,128,0.26),_transparent_24%),linear-gradient(135deg,_#fffaf2_0%,_#f2f8f5_48%,_#f8efe3_100%)] text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6">
        <BrandMark />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#solucion" className="hover:text-foreground">
            Solucion
          </a>
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <a href="#modulos" className="hover:text-foreground">
            Modulos
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link to="/register">Registrar</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <div className="animate-rise">
          <p className="mb-5 inline-flex rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur">
            SaaS operativo para academias modernas
          </p>
          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Gestiona tu academia con claridad, permisos y crecimiento real.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
            Agoge convierte la operacion diaria en una plataforma multi-tenant:
            una organizacion, varios roles, modulos dinamicos y datos listos
            para tomar decisiones.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-6">
              <Link to="/register">
                Crear organizacion
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full bg-white/70 px-6"
            >
              <Link to="/login">Entrar a mi cuenta</Link>
            </Button>
          </div>
        </div>

        <div id="modulos" className="animate-rise animation-delay-150 relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-3xl" />
          <Card className="relative overflow-hidden rounded-[2rem] border-white/70 bg-white/78 py-0 shadow-[var(--shadow-soft)] backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground/70">
                  Workspace activo
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold">
                  Agoge Academy
                </h2>
                <div className="mt-8 grid gap-3">
                  {modules.map((module) => (
                    <div
                      key={module.label}
                      className="flex items-center justify-between rounded-2xl bg-white/13 p-4 backdrop-blur"
                    >
                      <span className="flex items-center gap-3 font-medium">
                        <module.icon className="size-5" />
                        {module.label}
                      </span>
                      <CheckCircle2 className="size-5 text-emerald-100" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Permisos", "Tenants", "Auditoria"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border bg-white/70 p-4 text-sm font-semibold"
                  >
                    {item}
                    <p className="mt-2 text-2xl font-semibold text-primary">100%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="solucion" className="mx-auto w-full max-w-7xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {answers.map((item, index) => (
            <article
              key={item.question}
              className="animate-rise rounded-[1.75rem] border border-white/70 bg-white/72 p-6 shadow-sm backdrop-blur"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <h2 className="text-xl font-semibold">{item.question}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto grid w-full max-w-7xl gap-8 px-5 pb-24 lg:grid-cols-3"
      >
        {[
          "Registra tu organizacion y cuenta fundadora.",
          "La API entrega membresias, permisos y modulos habilitados.",
          "El frontend arma menus y pantallas dinamicas segun el usuario.",
        ].map((step, index) => (
          <div key={step} className="rounded-[1.75rem] border bg-card p-6 shadow-sm">
            <span className="text-sm font-semibold text-primary">
              Paso {index + 1}
            </span>
            <p className="mt-3 text-xl font-semibold leading-8">{step}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
