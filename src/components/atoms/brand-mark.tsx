import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTenantBranding } from "@/modules/settings/hooks/useTenantBranding";
import {
  getStoredBrandAssetVersion,
  getStoredTenantBranding,
  resolveBrandAssetUrl,
} from "@/modules/settings/utils/tenant-branding";
import { useAuthStore } from "@/shared/store/auth.store";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  to?: string;
};

export function BrandMark({ className, compact = false, to = "/" }: BrandMarkProps) {
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const organizationId = activeMembership?.organization.id;
  const organizationName = activeMembership?.organization.name;
  const brandingQuery = useTenantBranding();
  const branding = brandingQuery.data ?? getStoredTenantBranding(organizationId);
  const iconUrl = resolveBrandAssetUrl(
    branding?.iconUrl,
    getStoredBrandAssetVersion(organizationId, "icon"),
  );
  const logoUrl = resolveBrandAssetUrl(
    branding?.logoUrl,
    getStoredBrandAssetVersion(organizationId, "logo"),
  );
  const compactAssetUrl = iconUrl ?? logoUrl;
  const primaryColor = branding?.primaryColor ?? "var(--primary)";

  return (
    <Link to={to} className={cn("group inline-flex items-center gap-3", className)}>
      <span
        className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10 text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:-rotate-2"
        style={{
          backgroundColor: iconUrl ? "color-mix(in srgb, white 78%, var(--primary) 22%)" : primaryColor,
        }}
      >
        {compactAssetUrl ? (
          <img
            src={compactAssetUrl}
            alt={organizationName ?? "Agoge"}
            className="h-full w-full object-contain p-1.5"
          />
        ) : (
          <span className="text-lg font-semibold">
            {(organizationName ?? "Agoge").charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          {logoUrl ? (
            <span className="flex h-11 items-center">
              <img
                src={logoUrl}
                alt={organizationName ?? "Agoge"}
                className="h-full max-w-[180px] object-contain object-left"
              />
            </span>
          ) : (
            <span className="block truncate font-display text-lg font-semibold tracking-tight">
              {organizationName ?? "Agoge"}
            </span>
          )}
          <span className="block truncate text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {organizationName ? "Tenant activo" : "Academy SaaS"}
          </span>
        </span>
      )}
    </Link>
  );
}
