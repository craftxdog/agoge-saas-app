import { Building2, ChevronsUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useSwitchOrganization } from "@/shared/hooks/useSwitchOrganization";
import { useNavigationContext } from "@/shared/providers/navigation-provider";
import { useAuthStore } from "@/shared/store/auth.store";
import { formatSystemLabel } from "@/shared/utils/labels";

export function HeaderOrganizationSwitcher() {
  const { activeMembership, memberships } = useAuthStore();
  const { isCustomerPortal } = useAccessContext();
  const { getModulePrimaryPath, defaultPath } = useNavigationContext();
  const switchOrganization = useSwitchOrganization();
  const organizationName = activeMembership?.organization.name ?? "Sin organizacion";
  const hasMultipleMemberships = memberships.length > 1;
  const organizationPath = getModulePrimaryPath("settings") ?? defaultPath;

  if (!hasMultipleMemberships) {
    return (
      <Button
        asChild={!isCustomerPortal}
        variant="outline"
        size="sm"
        className="h-9 max-w-[13rem] rounded-full border-border/70 bg-white/82 px-3 text-sm shadow-sm"
      >
        {isCustomerPortal ? (
          <span className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            <span className="truncate">{organizationName}</span>
          </span>
        ) : (
          <Link to={organizationPath} className="inline-flex items-center gap-2">
            <Building2 className="size-4" />
            <span className="truncate">{organizationName}</span>
          </Link>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[14rem] rounded-full border-border/70 bg-white/82 px-3 text-sm shadow-sm"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate">{organizationName}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(22rem,calc(100vw-1.5rem))] rounded-[1.1rem] border border-border/70 p-0 shadow-[0_24px_60px_rgba(30,44,38,0.14)]"
      >
        <DropdownMenuLabel className="px-4 py-4">
          <p className="text-sm font-semibold">Cambiar organizacion</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Cambia el contexto activo, permisos y datos visibles de la sesion.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={activeMembership?.organization.id ?? ""}
          onValueChange={(organizationId) => {
            if (
              organizationId &&
              organizationId !== activeMembership?.organization.id
            ) {
              switchOrganization.mutate(organizationId);
            }
          }}
        >
          <div className="grid gap-1 p-2">
            {memberships.map((membership) => (
              <DropdownMenuRadioItem
                key={membership.id}
                value={membership.organization.id}
                disabled={switchOrganization.isPending}
                className="rounded-xl py-3"
              >
                <div className="grid gap-0.5">
                  <span className="font-medium">
                    {membership.organization.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {membership.organization.slug} ·{" "}
                    {membership.roles
                      .map((role) => formatSystemLabel(role))
                      .join(", ")}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </div>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
