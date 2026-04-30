import {
  Building2,
  CheckCircle2,
  Compass,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";
import { formatSystemLabel } from "@/shared/utils/labels";

export default function ProfilePage() {
  const { user, activeMembership, memberships, permissions, enabledModules } =
    useAuth();
  const switchOrganization = useSwitchOrganization();

  if (!user) return null;

  return (
    <section className="grid gap-8">
      <div className="rounded-[2rem] border bg-[linear-gradient(135deg,_rgba(79,143,131,0.16),_rgba(217,154,95,0.12))] p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Perfil de usuario
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              {user.email}
            </p>
          </div>

          <div className="grid size-24 place-items-center rounded-[2rem] bg-primary text-4xl font-semibold text-primary-foreground shadow-[var(--shadow-soft)]">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Usuario" value={user.username ?? "Sin usuario"} />
            <InfoRow label="Rol de plataforma" value={formatSystemLabel(user.platformRole)} />
            <InfoRow
              label="Organizacion activa"
              value={activeMembership?.organization.name ?? "Sin organizacion activa"}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Organizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {memberships.map((membership) => {
              const isActive = membership.id === activeMembership?.id;
              const isCustomer = membership.roles.includes("customer");

              return (
                <div
                  key={membership.id}
                  className="flex flex-col gap-3 rounded-2xl border bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {membership.organization.name}
                      </h3>
                      {isActive && (
                        <Badge className="rounded-full">
                          <CheckCircle2 className="size-3" />
                          Activa
                        </Badge>
                      )}
                      {isCustomer && (
                        <Badge variant="outline" className="rounded-full">
                          <Compass className="size-3" />
                          Portal de cliente
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {membership.organization.slug} ·{" "}
                      {membership.organization.defaultCurrency}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {membership.roles.map((role) => (
                      <Badge key={role} variant="outline" className="rounded-full">
                        {formatSystemLabel(role)}
                      </Badge>
                    ))}
                    {!isActive && (
                      <Button
                        size="sm"
                        className="rounded-full"
                        disabled={switchOrganization.isPending}
                        onClick={() =>
                          switchOrganization.mutate(membership.organization.id)
                        }
                      >
                        Entrar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TokenCard
          title="Permisos"
          icon={KeyRound}
          items={permissions}
          empty="No hay permisos asignados en el tenant activo."
        />
        <TokenCard
          title="Modulos habilitados"
          icon={ShieldCheck}
          items={enabledModules}
          empty="No hay modulos habilitados para esta membresia."
        />
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function TokenCard({
  title,
  icon: Icon,
  items,
  empty,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: string[];
  empty: string;
}) {
  return (
    <Card className="rounded-[1.75rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item} variant="outline" className="rounded-full">
                {formatSystemLabel(item)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
