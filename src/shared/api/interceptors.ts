import { api, baseURL } from "./client";
import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { getToken, setToken, removeToken } from "./auth-token";

type RefreshResponse = {
  success: boolean;
  data: {
    tokens: {
      accessToken: string;
    };
  };
};

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    const headers = new AxiosHeaders(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = originalRequest?.url || "";

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register-organization") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            const headers = new AxiosHeaders(originalRequest.headers);
            headers.set("Authorization", `Bearer ${token}`);
            originalRequest.headers = headers;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post<RefreshResponse>(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = res.data.data.tokens.accessToken;

      setToken(newToken);

      processQueue(null, newToken);

      const headers = new AxiosHeaders(originalRequest.headers);
      headers.set("Authorization", `Bearer ${newToken}`);
      originalRequest.headers = headers;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);

      removeToken();
      window.location.href = "/login";

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
