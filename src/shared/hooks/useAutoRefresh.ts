import { useEffect } from "react";
import { refreshToken } from "@/shared/api/refreshToken";
import { getTokenExpiration } from "@/shared/utils/helperJWT";
import { getToken, setToken } from "@/shared/api/auth-token";

export const useAutoRefresh = () => {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const setup = () => {
      const token = getToken();
      if (!token) return;

      const exp = getTokenExpiration(token);
      const now = Date.now();

      const timeout = exp - now - 60_000;

      if (timeout <= 0) return;

      timer = setTimeout(async () => {
        try {
          const newToken = await refreshToken(); // ahora sí válido
          setToken(newToken);

          setup(); //reprogramar
        } catch (e) {
          console.error("Auto refresh failed", e);
        }
      }, timeout);
    };

    setup();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);
};
