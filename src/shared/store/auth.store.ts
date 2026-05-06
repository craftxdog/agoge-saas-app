import { create } from "zustand";
import type {
  AuthMembership,
  AuthSession,
  AuthUser,
  MeSession,
} from "@/modules/auth/schemas/auth.schema";
import {
  getToken,
  removeToken,
  setToken as persistToken,
} from "@/shared/api/auth-token";

type SessionPayload = AuthSession | (MeSession & { tokens?: never });

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  activeMembership: AuthMembership | null;
  memberships: AuthMembership[];
  permissions: string[];
  enabledModules: string[];
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (session: AuthSession) => void;
  setSession: (session: SessionPayload, token?: string) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  syncActiveMembershipModules: (enabledModules: string[]) => void;
  hasPermission: (permission: string) => boolean;
  hasModule: (moduleKey: string) => boolean;
};

const normalizeSession = (session: SessionPayload, fallbackToken?: string) => {
  const activeMembership = session.activeMembership ?? null;
  const token = "tokens" in session ? session.tokens?.accessToken : fallbackToken;

  return {
    user: session.user,
    token: token ?? null,
    activeMembership,
    memberships: session.memberships,
    permissions: activeMembership?.permissions ?? [],
    enabledModules: activeMembership?.enabledModules ?? [],
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getToken(),
  activeMembership: null,
  memberships: [],
  permissions: [],
  enabledModules: [],
  isAuthenticated: false,
  isHydrated: false,

  login: (session) => {
    persistToken(session.tokens.accessToken);

    set({
      ...normalizeSession(session),
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  setSession: (session, token) => {
    const resolvedToken =
      token ?? ("tokens" in session ? session.tokens?.accessToken : undefined);

    if (resolvedToken) {
      persistToken(resolvedToken);
    }

    set({
      ...normalizeSession(session, resolvedToken ?? get().token ?? undefined),
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  setAccessToken: (token) =>
    set((state) => ({
      token,
      isAuthenticated: token ? state.isAuthenticated || Boolean(state.user) : false,
    })),

  logout: () => {
    removeToken();

    set({
      user: null,
      token: null,
      activeMembership: null,
      memberships: [],
      permissions: [],
      enabledModules: [],
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  setHydrated: (value) => set({ isHydrated: value }),

  syncActiveMembershipModules: (enabledModules) =>
    set((state) => {
      if (!state.activeMembership) {
        return state;
      }

      const nextActiveMembership = {
        ...state.activeMembership,
        enabledModules,
      };

      return {
        activeMembership: nextActiveMembership,
        memberships: state.memberships.map((membership) =>
          membership.id === nextActiveMembership.id
            ? nextActiveMembership
            : membership,
        ),
        enabledModules,
      };
    }),

  hasPermission: (permission) => get().permissions.includes(permission),

  hasModule: (moduleKey) => get().enabledModules.includes(moduleKey),
}));
