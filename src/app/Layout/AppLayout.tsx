import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import { useAutoRefresh } from "@/shared/hooks/useAutoRefresh";
import { useRealtimeQuerySync } from "@/shared/realtime/use-realtime-query-sync";
import { Outlet } from "react-router-dom";
import type { CSSProperties } from "react";

export const AppLayout = () => {
  useAutoRefresh();
  useTenantBranding();
  useRealtimeQuerySync();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "clamp(17rem, 20vw, 19rem)",
          "--header-height": "5.25rem",
        } as CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="h-svh overflow-hidden bg-[linear-gradient(180deg,rgba(252,249,243,0.92),rgba(255,255,255,0.98))]">
        <SiteHeader />

        <main className="flex-1 overflow-auto px-4 pb-8 pt-5 sm:px-5 lg:px-6 xl:px-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
