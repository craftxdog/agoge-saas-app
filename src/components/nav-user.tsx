"use client";

import {
  IconBuildingCommunity,
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/shared/hooks/useLogout";
import { useAuthStore } from "@/shared/store/auth.store";
import { Link } from "react-router-dom";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, activeMembership } = useAuthStore();
  const logoutMutation = useLogout();

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? user.email[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const roleLabel = activeMembership?.roles.join(", ") || user.platformRole;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="" alt={user.email} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </span>
              </div>

              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm">
                  <span className="truncate font-medium">{user.email}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeMembership?.organization.name ?? "Sin tenant activo"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/app/profile">
                <IconUserCircle />
                Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">
                <IconBuildingCommunity />
                Organizacion
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/billing">
                <IconCreditCard />
                Cobros
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">
                <IconSettings />
                Configuracion
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="text-destructive"
            >
              <IconLogout />
              {logoutMutation.isPending ? "Cerrando..." : "Cerrar sesion"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
