import axios from "axios";

export const baseURL = import.meta.env.VITE_API_URL ?? "/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});
