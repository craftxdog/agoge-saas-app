import { api } from "./client";
import type { AxiosRequestConfig } from "axios";

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await api.get<T>(url, config);
    return res.data;
  },

  post: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const res = await api.post<T>(url, body);
    return res.data;
  },

  postForm: async <T>(url: string, formData: FormData): Promise<T> => {
    const res = await api.post<T>(url, formData);
    return res.data;
  },

  patch: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const res = await api.patch<T>(url, body);
    return res.data;
  },

  put: async <T, B = unknown>(url: string, body?: B): Promise<T> => {
    const res = await api.put<T>(url, body);
    return res.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await api.delete<T>(url);
    return res.data;
  },
};
