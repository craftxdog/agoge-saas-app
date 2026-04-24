import type { OrganizationProfile } from "../schemas/settings.schema";

export type TenantBranding = NonNullable<OrganizationProfile["branding"]>;

const BRANDING_STORAGE_PREFIX = "agoge:tenant-branding:";
const BRANDING_ASSET_VERSION_PREFIX = "agoge:tenant-branding-version:";

const variableMap = {
  primaryColor: ["--primary", "--ring", "--sidebar-primary", "--chart-1"],
  secondaryColor: ["--secondary", "--sidebar-accent", "--chart-4"],
  accentColor: ["--accent", "--chart-2", "--chart-3"],
} satisfies Record<keyof Pick<TenantBranding, "primaryColor" | "secondaryColor" | "accentColor">, string[]>;

export const getStoredTenantBranding = (organizationId?: string | null) => {
  if (!organizationId) return null;

  try {
    const raw = localStorage.getItem(`${BRANDING_STORAGE_PREFIX}${organizationId}`);
    return raw ? (JSON.parse(raw) as TenantBranding) : null;
  } catch {
    return null;
  }
};

export const storeTenantBranding = (
  organizationId: string | undefined,
  branding: TenantBranding | null | undefined,
) => {
  if (!organizationId || !branding) return;
  localStorage.setItem(`${BRANDING_STORAGE_PREFIX}${organizationId}`, JSON.stringify(branding));
};

export const storeBrandAssetVersion = (
  organizationId: string | undefined,
  assetKind: "logo" | "icon",
  version = Date.now(),
) => {
  if (!organizationId) return;

  localStorage.setItem(
    `${BRANDING_ASSET_VERSION_PREFIX}${organizationId}:${assetKind}`,
    String(version),
  );
};

export const getStoredBrandAssetVersion = (
  organizationId: string | undefined,
  assetKind: "logo" | "icon",
) => {
  if (!organizationId) return null;

  const raw = localStorage.getItem(
    `${BRANDING_ASSET_VERSION_PREFIX}${organizationId}:${assetKind}`,
  );

  return raw ? Number(raw) : null;
};

export const resolveBrandAssetUrl = (
  assetUrl: string | null | undefined,
  version?: number | null,
) => {
  if (!assetUrl) return null;

  try {
    const url = new URL(assetUrl, window.location.origin);
    if (version) {
      url.searchParams.set("v", String(version));
    }
    return url.toString();
  } catch {
    return assetUrl;
  }
};

export const applyTenantBranding = (
  branding: TenantBranding | null | undefined,
  organizationId?: string,
) => {
  if (!branding) return;

  const root = document.documentElement;

  for (const [key, variables] of Object.entries(variableMap)) {
    const value = branding[key as keyof typeof variableMap];
    if (!value) continue;

    for (const variable of variables) {
      root.style.setProperty(variable, value);
    }
  }

  const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  const nextIconUrl = resolveBrandAssetUrl(
    branding.iconUrl,
    getStoredBrandAssetVersion(organizationId, "icon"),
  );

  if (favicon && nextIconUrl) {
    favicon.href = nextIconUrl;
  }
};

export const persistAndApplyTenantBranding = (
  organizationId: string | undefined,
  branding: TenantBranding | null | undefined,
) => {
  storeTenantBranding(organizationId, branding);
  applyTenantBranding(branding, organizationId);
};
