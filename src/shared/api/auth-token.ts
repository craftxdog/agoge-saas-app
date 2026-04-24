export const AUTH_TOKEN_EVENT = "agoge:auth-token";

const emitAuthTokenEvent = (token: string | null) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTH_TOKEN_EVENT, {
      detail: { token },
    }),
  );
};

export const getToken = () => localStorage.getItem("token");

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
  emitAuthTokenEvent(token);
};

export const removeToken = () => {
  localStorage.removeItem("token");
  emitAuthTokenEvent(null);
};
