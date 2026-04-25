"use client";
import { Menu, Moon, Sun } from "lucide-react";

interface HeaderProps {
  theme: "light" | "dark";
  onMenuOpen: () => void;
  onThemeToggle: () => void;
}

export function Header({ theme, onMenuOpen, onThemeToggle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-30">
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="lg:hidden flex items-center gap-2">
        <span className="font-display font-bold text-sm">Painel Social</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={onThemeToggle}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        aria-label="Alternar tema"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Moon className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </header>
  );
}
