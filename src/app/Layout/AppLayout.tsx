import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh";
import { Outlet } from "react-router-dom";
import type { CSSProperties } from "react";

export const AppLayout = () => {
  useAutoRefresh();
  useTenantBranding();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
