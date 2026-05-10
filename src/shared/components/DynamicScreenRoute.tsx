import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/shared/hooks/useAuth";
import { useNavigationContext } from "@/shared/providers/navigation-provider";
import CustomScreenPage from "@/shared/pages/custom-screen";
import NotFoundPage from "@/shared/pages/not-found";

export function DynamicScreenRoute() {
  const location = useLocation();
  const { isHydrated, isAuthenticated, activeMembership } = useAuth();
  const { findScreen, isLoading } = useNavigationContext();

  if (!isHydrated) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!activeMembership) {
    return <Navigate to="/app" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner className="h-7 w-7" />
        <p className="text-sm text-muted-foreground">
          Validando acceso y navegacion...
        </p>
      </div>
    );
  }

  const screen = findScreen(location.pathname);

  if (!screen) {
    return <NotFoundPage />;
  }

  return <CustomScreenPage screen={screen} />;
}
