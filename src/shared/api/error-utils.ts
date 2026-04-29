import { AxiosError } from "axios";

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

const normalizeMessage = (value: unknown) => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(". ");
  return "";
};

export const getApiErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    const message =
      normalizeMessage(payload?.message) ||
      normalizeMessage(payload?.error) ||
      error.message;

    return {
      status: error.response?.status ?? null,
      message,
      isNetworkError: !error.response,
    };
  }

  if (error instanceof Error) {
    return {
      status: null,
      message: error.message,
      isNetworkError: false,
    };
  }

  return {
    status: null,
    message: "",
    isNetworkError: false,
  };
};
