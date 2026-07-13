import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_TOKEN_KEY = "fruit-veg-token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    if (status === 401) {
      setAuthToken(null);
      window.location.href = "/login";
    } else if (status && status >= 400) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
