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
          "--sidebar-width": "calc(var(--spacing) * 84)",
          "--header-height": "calc(var(--spacing) * 18)",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,143,131,0.08),transparent_28%),linear-gradient(180deg,rgba(255,251,244,0.88),rgba(255,255,255,0.96))]">
        <SiteHeader />

        <main className="flex-1 overflow-auto px-6 pb-8 pt-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
