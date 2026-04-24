"use client";

import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
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

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0;
          const isParentActive =
            item.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.url);

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={
                    isParentActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : ""
                  }
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
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
                    className={
                      isParentActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : ""
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out">
                  <SidebarMenuSub>
                    {item.items?.map((subItem: SidebarNavItem) => {
                      const isSubActive =
                        location.pathname === subItem.url;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              className={`flex items-center gap-2 ${isSubActive
                                ? "text-primary font-medium"
                                : ""
                                }`}
                            >
                              {subItem.icon && (
                                <subItem.icon className="size-4" />
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
