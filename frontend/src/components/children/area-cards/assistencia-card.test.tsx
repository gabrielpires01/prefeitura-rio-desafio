import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AssistenciaCard } from "./assistencia-card";
import type { AssistenciaSocial } from "@/types";

const assistenciaSemAlertas: AssistenciaSocial = {
  cad_unico: true,
  beneficio_ativo: true,
  alertas: [],
};

const assistenciaComAlertas: AssistenciaSocial = {
  cad_unico: false,
  beneficio_ativo: false,
  alertas: ["cadastro_ausente", "beneficio_suspenso"],
};

describe("AssistenciaCard", () => {
  it("renders the Assistência Social section heading", () => {
    render(<AssistenciaCard assistencia={assistenciaSemAlertas} />);
    expect(screen.getByText("Assistência Social")).toBeInTheDocument();
  });

  it("shows 'Sem alertas' when there are no alerts", () => {
    render(<AssistenciaCard assistencia={assistenciaSemAlertas} />);
    expect(screen.getByText("Sem alertas")).toBeInTheDocument();
  });

  it("shows alert count when there are alerts", () => {
    render(<AssistenciaCard assistencia={assistenciaComAlertas} />);
    expect(screen.getByText("2 alertas")).toBeInTheDocument();
  });

  it("shows 'Cadastrado' when cad_unico is true", () => {
    render(<AssistenciaCard assistencia={assistenciaSemAlertas} />);
    expect(screen.getByText("Cadastrado")).toBeInTheDocument();
  });

  it("shows 'Não cadastrado' when cad_unico is false", () => {
    render(<AssistenciaCard assistencia={assistenciaComAlertas} />);
    expect(screen.getByText("Não cadastrado")).toBeInTheDocument();
  });

  it("shows 'Sim' when benefit is active", () => {
    render(<AssistenciaCard assistencia={assistenciaSemAlertas} />);
    expect(screen.getByText("Sim")).toBeInTheDocument();
  });

  it("shows 'Não' when benefit is not active", () => {
    render(<AssistenciaCard assistencia={assistenciaComAlertas} />);
    expect(screen.getByText("Não")).toBeInTheDocument();
  });

  it("renders an AlertBadge for each alert", () => {
    render(<AssistenciaCard assistencia={assistenciaComAlertas} />);
    expect(screen.getByText("Cadastro ausente")).toBeInTheDocument();
    expect(screen.getByText("Benefício suspenso")).toBeInTheDocument();
  });
});
