import axios from "axios";


export const baseURL = "/api"

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

