import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertBadge } from "./alert-badge";

describe("AlertBadge", () => {
  it("renders the human-readable label for known alert types", () => {
    render(<AlertBadge alert="vacinas_atrasadas" />);
    expect(screen.getByText("Vacinas atrasadas")).toBeInTheDocument();
  });

  it("renders each known alert type correctly", () => {
    const cases = [
      ["consulta_atrasada", "Consulta atrasada"],
      ["frequencia_baixa", "Frequência baixa"],
      ["beneficio_suspenso", "Benefício suspenso"],
      ["cadastro_ausente", "Cadastro ausente"],
      ["cadastro_desatualizado", "Cadastro desatualizado"],
      ["matricula_pendente", "Matrícula pendente"],
    ] as const;

    cases.forEach(([key, label]) => {
      const { unmount } = render(<AlertBadge alert={key} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });

  it("renders the raw key when the alert type is unknown", () => {
    render(<AlertBadge alert="alerta_desconhecido" />);
    expect(screen.getByText("alerta_desconhecido")).toBeInTheDocument();
  });
});
