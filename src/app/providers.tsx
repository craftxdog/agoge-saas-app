import { useMe } from "@/shared/hooks/useMe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

function AuthInitializer() {
  useMe();
  return null;
}
