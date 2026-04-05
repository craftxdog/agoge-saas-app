import { useAuthStore } from "../store/auth.store";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
  };
};
