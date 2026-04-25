"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/login-form";
import { DecorativePanel } from "@/components/auth/decorative-panel";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    try {
      const token = await login(email, password);
      setToken(token);
      router.push("/");
    } catch {
      setError("Credenciais inválidas. Verifique e-mail e senha.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <DecorativePanel />
      <LoginForm onLogin={handleLogin} error={error} />
    </div>
  );
}
