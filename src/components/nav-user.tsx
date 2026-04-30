"use client";

import {
  IconBell,
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
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useLogout } from "@/shared/hooks/useLogout";
import { useAuthStore } from "@/shared/store/auth.store";
import { formatSystemLabel } from "@/shared/utils/labels";
import { Link } from "react-router-dom";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, activeMembership, enabledModules, permissions } = useAuthStore();
  const { isCustomerPortal } = useAccessContext();
  const logoutMutation = useLogout();

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? user.email[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const roleLabel =
    activeMembership?.roles.length
      ? activeMembership.roles.map((role) => formatSystemLabel(role)).join(", ")
      : formatSystemLabel(user.platformRole);
  const menuItems = [
    {
      to: "/app/profile",
      label: "Perfil",
      icon: IconUserCircle,
      visible: true,
    },
    {
      to: "/app/billing",
      label: isCustomerPortal ? "Mis cobros" : "Cobros",
      icon: IconCreditCard,
      visible: true,
    },
    {
      to: "/app/notifications",
      label: "Notificaciones",
      icon: IconBell,
      visible:
        !isCustomerPortal &&
        enabledModules.includes("notifications") &&
        permissions.includes("notifications.read"),
    },
    {
      to: "/app/settings",
      label: "Organizacion",
      icon: IconBuildingCommunity,
      visible: !isCustomerPortal,
    },
    {
      to: "/app/settings",
      label: "Configuracion",
      icon: IconSettings,
      visible: !isCustomerPortal,
    },
  ].filter((item) => item.visible);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-16 rounded-[1.5rem] border border-sidebar-border/70 bg-white/75 px-3.5 shadow-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-10 w-10 rounded-2xl">
                <AvatarImage src="" alt={user.email} />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-[15px] font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                <span className="truncate text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
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
                    {activeMembership?.organization.name ?? "Sin organizacion activa"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link to={item.to}>
                    <item.icon />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
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
