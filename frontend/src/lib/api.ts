import axios from "axios";
import type { Child, ChildListParams, ChildListResult, Summary } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export async function login(email: string, password: string): Promise<string> {
  const { data } = await api.post<{ token: string }>("/auth/token", { email, password });
  return data.token;
}

export async function getSummary(): Promise<Summary> {
  const { data } = await api.get<Summary>("/summary");
  return data;
}

export async function getChildren(params: ChildListParams = {}): Promise<ChildListResult> {
  const { data } = await api.get<ChildListResult>("/children", { params });
  return data;
}

export async function getChild(id: string): Promise<Child> {
  const { data } = await api.get<Child>(`/children/${id}`);
  return data;
}

export async function reviewChild(id: string): Promise<void> {
  await api.patch(`/children/${id}/review`);
}
