import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNavigationContext } from "@/shared/providers/navigation-provider";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AuthorizedScreenRoute = ({
  children,
  path,
}: PropsWithChildren<{ path: string }>) => {
  const location = useLocation();
  const { isHydrated, isAuthenticated, activeMembership } = useAuth();
  const { hasAuthorizedPath, isLoading } = useNavigationContext();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!activeMembership) {
    return <Navigate to="/app" replace />;
  }

  if (isLoading) {
    return <AppRouteLoader />;
  }

  if (!hasAuthorizedPath(path)) {
    return (
      <Navigate
        to="/app/restricted"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
};

export const ModuleLandingRoute = ({ moduleKey }: { moduleKey: string }) => {
  const location = useLocation();
  const { isHydrated, isAuthenticated, activeMembership } = useAuth();
  const { getModulePrimaryPath, isLoading } = useNavigationContext();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!activeMembership) {
    return <Navigate to="/app" replace />;
  }

  if (isLoading) {
    return <AppRouteLoader />;
  }

  const targetPath = getModulePrimaryPath(moduleKey);

  if (!targetPath) {
    return (
      <Navigate
        to="/app/restricted"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Navigate to={targetPath} replace />;
};

function AppRouteLoader() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Spinner className="h-7 w-7" />
      <p className="text-sm text-muted-foreground">
        Validando acceso y navegacion...
      </p>
    </div>
  );
}
