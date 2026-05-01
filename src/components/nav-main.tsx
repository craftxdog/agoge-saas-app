"use client";

import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { SidebarNavItem } from "@/shared/types/SidebarNavItem";

export function NavMain({ items }: { items: SidebarNavItem[] }) {
  const location = useLocation();

  const isItemActive = (url: string) => {
    const normalized = url.replace(/\/+$/, "") || "/";
    const current = location.pathname.replace(/\/+$/, "") || "/";

    if (normalized === "/app") {
      return current === "/app";
    }

    return current === normalized || current.startsWith(`${normalized}/`);
  };

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Navegacion
      </SidebarGroupLabel>

      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const isParentActive = isItemActive(item.url);

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isParentActive}
                  size="lg"
                  className={
                    "h-10 rounded-xl px-2.5 text-[14px] font-medium [&>svg]:size-4" +
                    (isParentActive
                      ? " border border-sidebar-border/80 bg-white text-sidebar-foreground shadow-sm"
                      : " text-sidebar-foreground/88 hover:bg-white/75")
                  }
                >
                  <Link to={item.url}>
                    {item.icon ? (
                      <span
                        className={
                          "grid size-7 shrink-0 place-items-center rounded-lg" +
                          (isParentActive
                            ? " bg-primary/10 text-primary"
                            : " bg-muted/35 text-sidebar-foreground/75")
                        }
                      >
                        <item.icon />
                      </span>
                    ) : null}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={isParentActive}
                size="lg"
                className={
                  "h-10 rounded-xl px-2.5 text-[14px] font-medium [&>svg]:size-4" +
                  (isParentActive
                    ? " border border-sidebar-border/80 bg-white text-sidebar-foreground shadow-sm"
                    : " text-sidebar-foreground/88 hover:bg-white/75")
                }
              >
                {item.icon ? (
                  <span
                    className={
                      "grid size-7 shrink-0 place-items-center rounded-lg" +
                      (isParentActive
                        ? " bg-primary/10 text-primary"
                        : " bg-muted/35 text-sidebar-foreground/75")
                    }
                  >
                    <item.icon />
                  </span>
                ) : null}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto text-muted-foreground" />
              </SidebarMenuButton>

              <SidebarMenuSub className="mx-0 mt-1 border-l-0 px-0 py-0">
                {item.items?.map((subItem) => {
                  const isSubActive = isItemActive(subItem.url);

                  return (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isSubActive}
                        className={
                          "ml-9 h-9 rounded-lg px-3 text-[13px]" +
                          (isSubActive ? " bg-white text-primary shadow-sm" : "")
                        }
                      >
                        <Link to={subItem.url}>{subItem.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  );
                })}
              </SidebarMenuSub>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
