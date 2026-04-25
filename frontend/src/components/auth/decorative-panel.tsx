import { Shield } from "lucide-react";
import { CityLogo } from "@/components/layout/city-logo";

export function DecorativePanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-[#0b2d5e] relative overflow-hidden flex-col">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />
      <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
        <svg
          viewBox="0 0 400 120"
          className="w-full text-[#0d3572]"
          fill="currentColor"
        >
          <path d="M0,60 C100,100 300,20 400,60 L400,120 L0,120 Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full items-center justify-center p-16 text-center">
        <div className="w-28 h-28 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mb-8 backdrop-blur-sm">
          <CityLogo className="w-16 h-16 text-white" />
        </div>

        <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
          Painel
          <br />
          Social
        </h1>
        <p className="text-white/60 text-base mb-2 tracking-wide uppercase text-sm font-medium">
          Prefeitura do Rio de Janeiro
        </p>
        <p className="text-white/40 text-sm max-w-xs leading-relaxed mt-4">
          Sistema integrado de acompanhamento de crianças em situação de
          vulnerabilidade social
        </p>

        <div className="mt-16 flex items-center gap-2 text-white/30 text-xs">
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          Acesso restrito a técnicos autorizados
        </div>
      </div>
    </div>
  );
}
