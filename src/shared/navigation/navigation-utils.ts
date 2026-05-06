import type {
  AccessModule,
  AccessScreen,
} from "@/modules/rbac/schemas/rbac.schema";

export type AuthorizedScreen = Omit<AccessScreen, "path"> & {
  path: string;
  fullPath: string;
  moduleKey: string;
  moduleName: string;
};

export type AuthorizedModule = Omit<AccessModule, "screens"> & {
  screens: AuthorizedScreen[];
  primaryPath: string | null;
};

export type NavigationRuntime = {
  modules: AuthorizedModule[];
  screens: AuthorizedScreen[];
  screenMap: Map<string, AuthorizedScreen>;
  moduleMap: Map<string, AuthorizedModule>;
  hasTenantAccess: boolean;
  hasSelfAccess: boolean;
  defaultPath: string;
};

export const normalizeAppPath = (value: string) => {
  const normalized = value.replace(/\/+$/, "") || "/";
  return normalized.startsWith("/app")
    ? normalized
    : `/app${normalized === "/" ? "" : normalized}`;
};

export const toAuthorizedAppPath = (path?: string | null) => {
  if (!path) return null;
  return normalizeAppPath(`/app${path}`);
};

export const createNavigationRuntime = (
  modules: AccessModule[] | undefined,
): NavigationRuntime => {
  const authorizedModules: AuthorizedModule[] = (modules ?? [])
    .map((module) => {
      const screens = module.screens
        .filter((screen): screen is AccessScreen & { path: string } =>
          Boolean(screen.path),
        )
        .map((screen) => ({
          ...screen,
          path: screen.path,
          fullPath: toAuthorizedAppPath(screen.path)!,
          moduleKey: module.key,
          moduleName: module.name,
        }));

      return {
        ...module,
        screens,
        primaryPath: screens[0]?.fullPath ?? null,
      };
    })
    .filter((module) => module.screens.length > 0);

  const screens = authorizedModules.flatMap((module) => module.screens);
  const screenMap = new Map(
    screens.map((screen) => [normalizeAppPath(screen.fullPath), screen]),
  );
  const moduleMap = new Map(
    authorizedModules.map((module) => [module.key, module]),
  );

  return {
    modules: authorizedModules,
    screens,
    screenMap,
    moduleMap,
    hasTenantAccess: screens.some((screen) => screen.accessScope === "tenant"),
    hasSelfAccess: screens.some((screen) => screen.accessScope === "self"),
    defaultPath: screens[0]?.fullPath ?? "/app",
  };
};
