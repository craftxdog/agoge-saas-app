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
          "--sidebar-width": "19rem",
          "--header-height": "5.25rem",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="h-svh overflow-hidden bg-[linear-gradient(180deg,rgba(252,249,243,0.92),rgba(255,255,255,0.98))]">
        <SiteHeader />

        <main className="flex-1 overflow-auto px-6 pb-8 pt-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
