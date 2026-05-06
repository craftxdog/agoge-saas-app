import {
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAccessContext } from "@/shared/hooks/useAccessContext";
import { useNavigationContext } from "@/shared/providers/navigation-provider";
import { useAuthStore } from "@/shared/store/auth.store";
import { formatSystemLabel } from "@/shared/utils/labels";
import { HeaderNotificationCenter } from "@/components/organisms/header-notification-center";
import { HeaderOrganizationSwitcher } from "@/components/organisms/header-organization-switcher";
import { Breadcrumbs } from "./breadcrumbs";

export function SiteHeader() {
  const { activeMembership } = useAuthStore();
  const { isCustomerPortal } = useAccessContext();
  const { modules } = useNavigationContext();
  const roleLabel =
    activeMembership?.roles?.length
      ? activeMembership.roles.map((role) => formatSystemLabel(role)).join(" · ")
      : "Sin rol activo";

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-5 lg:px-7">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className="size-9 shrink-0 rounded-full border border-border/70 bg-white/82 text-foreground shadow-sm" />

          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                {isCustomerPortal ? "Portal cliente" : "Workspace SaaS"}
              </Badge>
              <Badge variant="outline" className="hidden rounded-full px-2.5 py-0.5 text-[11px] sm:inline-flex">
                <ShieldCheck className="size-3.5" />
                {roleLabel}
              </Badge>
              <Badge variant="outline" className="hidden rounded-full px-2.5 py-0.5 text-[11px] lg:inline-flex">
                <Sparkles className="size-3.5" />
                {modules.length} modulos visibles
              </Badge>
            </div>
            <Breadcrumbs />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <HeaderOrganizationSwitcher />
          <HeaderNotificationCenter />
        </div>
      </div>
    </header>
  );
}
