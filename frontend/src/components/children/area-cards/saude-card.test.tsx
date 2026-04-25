import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaudeCard } from "./saude-card";
import type { Saude } from "@/types";

const saudeSemAlertas: Saude = {
  ultima_consulta: "2024-01-15",
  vacinas_em_dia: true,
  alertas: [],
};

const saudeComAlertas: Saude = {
  ultima_consulta: null,
  vacinas_em_dia: false,
  alertas: ["vacinas_atrasadas", "consulta_atrasada"],
};

describe("SaudeCard", () => {
  it("renders the Saúde section heading", () => {
    render(<SaudeCard saude={saudeSemAlertas} />);
    expect(screen.getByText("Saúde")).toBeInTheDocument();
  });

  it("shows 'Sem alertas' when there are no alerts", () => {
    render(<SaudeCard saude={saudeSemAlertas} />);
    expect(screen.getByText("Sem alertas")).toBeInTheDocument();
  });

  it("shows alert count when there are alerts", () => {
    render(<SaudeCard saude={saudeComAlertas} />);
    expect(screen.getByText("2 alertas")).toBeInTheDocument();
  });

  it("shows singular 'alerta' for a single alert", () => {
    render(<SaudeCard saude={{ ...saudeComAlertas, alertas: ["vacinas_atrasadas"] }} />);
    expect(screen.getByText("1 alerta")).toBeInTheDocument();
  });

  it("displays the last consultation date (not empty)", () => {
    render(<SaudeCard saude={saudeSemAlertas} />);
    const dateText = screen.queryByText("—");
    expect(dateText).not.toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("displays '—' when last consultation is null", () => {
    render(<SaudeCard saude={saudeComAlertas} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("displays 'Sim' when vaccines are up to date", () => {
    render(<SaudeCard saude={saudeSemAlertas} />);
    expect(screen.getByText("Sim")).toBeInTheDocument();
  });

  it("displays 'Não' when vaccines are not up to date", () => {
    render(<SaudeCard saude={saudeComAlertas} />);
    expect(screen.getByText("Não")).toBeInTheDocument();
  });

  it("renders an AlertBadge for each alert", () => {
    render(<SaudeCard saude={saudeComAlertas} />);
    expect(screen.getByText("Vacinas atrasadas")).toBeInTheDocument();
    expect(screen.getByText("Consulta atrasada")).toBeInTheDocument();
  });

  it("renders no alert badges when there are no alerts", () => {
    render(<SaudeCard saude={saudeSemAlertas} />);
    expect(screen.queryByText("Vacinas atrasadas")).not.toBeInTheDocument();
  });
});
