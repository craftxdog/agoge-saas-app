"use client";

import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-sidebar-foreground/55">
        Navegacion
      </SidebarGroupLabel>
      <SidebarMenu>
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
                    "h-14 rounded-[1.2rem] border border-transparent px-3.5 text-[15px] font-medium tracking-[0.01em] transition-all duration-200 [&>svg]:size-5" +
                    (isParentActive
                      ? " border-sidebar-primary/20 bg-[linear-gradient(135deg,rgba(79,143,131,0.18),rgba(255,255,255,0.96))] text-sidebar-foreground shadow-[0_12px_30px_rgba(60,88,80,0.12)]"
                      : " hover:border-sidebar-border/70 hover:bg-white/70")
                  }
                >
                  <Link to={item.url}>
                    {item.icon && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-2xl border border-sidebar-border/70 bg-white/80 text-sidebar-foreground shadow-sm">
                        <item.icon />
                      </span>
                    )}
                    <span>{item.title}</span>
                    {isParentActive ? (
                      <Badge className="ml-auto rounded-full bg-sidebar-primary/12 px-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary shadow-none">
                        Aqui
                      </Badge>
                    ) : null}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>

                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    isActive={isParentActive}
                    size="lg"
                    className={
                      "h-14 rounded-[1.2rem] border border-transparent px-3.5 text-[15px] font-medium tracking-[0.01em] transition-all duration-200 [&>svg]:size-5" +
                      (isParentActive
                        ? " border-sidebar-primary/20 bg-[linear-gradient(135deg,rgba(79,143,131,0.18),rgba(255,255,255,0.96))] text-sidebar-foreground shadow-[0_12px_30px_rgba(60,88,80,0.12)]"
                        : " hover:border-sidebar-border/70 hover:bg-white/70")
                    }
                  >
                    {item.icon && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-2xl border border-sidebar-border/70 bg-white/80 text-sidebar-foreground shadow-sm">
                        <item.icon />
                      </span>
                    )}
                    <span>{item.title}</span>

                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out">
                  <SidebarMenuSub>
                    {item.items?.map((subItem: SidebarNavItem) => {
                      const isSubActive = isItemActive(subItem.url);

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link
                              to={subItem.url}
                              className={
                                "flex items-center gap-2 rounded-xl px-2 py-1.5 text-[14px]" +
                                (isSubActive ? " font-semibold text-primary" : "")
                              }
                            >
                              {subItem.icon && (
                                <span className="grid size-7 place-items-center rounded-xl bg-sidebar-primary/8 text-primary">
                                  <subItem.icon className="size-4" />
                                </span>
                              )}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>

              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
