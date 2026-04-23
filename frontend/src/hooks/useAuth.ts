"use client";

export function useAuth() {
  const setToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    document.cookie = `token=${token}; path=/; max-age=${8 * 3600}; SameSite=Lax`;
  };

  const clearToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  };

  const logout = () => {
    clearToken();
    window.location.href = "/login";
  };

  return { setToken, clearToken, logout };
}
