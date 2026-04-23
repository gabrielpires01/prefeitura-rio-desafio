"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Shield } from "lucide-react";
import { login } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      setToken(token);
      router.push("/");
    } catch {
      setError("Credenciais inválidas. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Decorative left panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0b2d5e] relative overflow-hidden flex-col">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 400 120" className="w-full text-[#0d3572]" fill="currentColor">
            <path d="M0,60 C100,100 300,20 400,60 L400,120 L0,120 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full items-center justify-center p-16 text-center">
          {/* Seal */}
          <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-8 backdrop-blur-sm">
            <svg viewBox="0 0 100 100" className="w-18 h-18 w-16 h-16 text-white" fill="none">
              <circle cx="50" cy="18" r="9" fill="currentColor" opacity="0.9" />
              <path d="M8 82 Q28 38 50 48 Q72 58 92 82 Z" fill="currentColor" opacity="0.5" />
              <path d="M15 82 Q35 52 50 58 Q65 64 85 82 Z" fill="currentColor" opacity="0.75" />
              <path d="M24 82 Q40 62 50 65 Q60 68 76 82 Z" fill="currentColor" opacity="0.95" />
            </svg>
          </div>

          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Painel<br />Social
          </h1>
          <p className="text-white/60 text-base mb-2 tracking-wide uppercase text-sm font-medium">
            Prefeitura do Rio de Janeiro
          </p>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed mt-4">
            Sistema integrado de acompanhamento de crianças em situação de vulnerabilidade social
          </p>

          <div className="mt-16 flex items-center gap-2 text-white/30 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Acesso restrito a técnicos autorizados
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-10 h-10 text-white" fill="none">
                <circle cx="50" cy="18" r="9" fill="currentColor" opacity="0.9" />
                <path d="M8 82 Q28 38 50 48 Q72 58 92 82 Z" fill="currentColor" opacity="0.5" />
                <path d="M15 82 Q35 52 50 58 Q65 64 85 82 Z" fill="currentColor" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold">Painel Social</h1>
            <p className="text-muted-foreground text-sm">Prefeitura do Rio de Janeiro</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold">Entrar</h2>
            <p className="text-muted-foreground text-sm mt-1">Acesse com suas credenciais de técnico</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground/60 transition-shadow"
                )}
                placeholder="tecnico@prefeitura.rio"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cn(
                  "w-full px-3.5 py-2.5 rounded-lg border bg-background text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "placeholder:text-muted-foreground/60 transition-shadow"
                )}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg",
                "font-medium text-sm hover:bg-primary/90 disabled:opacity-60",
                "flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
