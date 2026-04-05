import { api } from "./client";

export const http = {
  get: async <T>(url: string, config?: any): Promise<T> => {
    const res = await api.get(url, config);
    return res.data;
  },

  post: async <T>(url: string, body?: any): Promise<T> => {
    const res = await api.post(url, body);
    return res.data;
  },

  patch: async <T>(url: string, body?: any): Promise<T> => {
    const res = await api.patch(url, body);
    return res.data;
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await api.delete(url);
    return res.data;
  },
};
