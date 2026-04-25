import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChildCard } from "./child-card";
import type { Child } from "@/types";

const baseChild: Child = {
  id: "abc-123",
  nome: "João da Silva",
  data_nascimento: "2018-06-15",
  bairro: "Rocinha",
  responsavel: "Maria da Silva",
  saude: { ultima_consulta: "2024-01-01", vacinas_em_dia: true, alertas: [] },
  educacao: { escola: "EM João XXIII", frequencia_percent: 90, alertas: [] },
  assistencia_social: { cad_unico: true, beneficio_ativo: true, alertas: [] },
  revisado: false,
  revisado_por: null,
  revisado_em: null,
};

describe("ChildCard", () => {
  it("renders the child name", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText("João da Silva")).toBeInTheDocument();
  });

  it("renders the child's bairro", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText(/Rocinha/)).toBeInTheDocument();
  });

  it("renders OK badge when child has no alerts", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders alert count badge when child has alerts", () => {
    const child: Child = {
      ...baseChild,
      saude: { ...baseChild.saude!, alertas: ["vacinas_atrasadas"] },
    };
    render(<ChildCard child={child} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.queryByText("OK")).not.toBeInTheDocument();
  });

  it("shows total alert count across all areas", () => {
    const child: Child = {
      ...baseChild,
      saude: { ...baseChild.saude!, alertas: ["vacinas_atrasadas"] },
      educacao: { ...baseChild.educacao!, alertas: ["frequencia_baixa"] },
    };
    render(<ChildCard child={child} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows 'Revisado' indicator when child is reviewed", () => {
    render(<ChildCard child={{ ...baseChild, revisado: true }} />);
    expect(screen.getByText("Revisado")).toBeInTheDocument();
  });

  it("does not show 'Revisado' indicator when child is not reviewed", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.queryByText("Revisado")).not.toBeInTheDocument();
  });

  it("links to the child detail page", () => {
    render(<ChildCard child={baseChild} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/children/abc-123");
  });

  it("renders area labels", () => {
    render(<ChildCard child={baseChild} />);
    expect(screen.getByText("Saúde")).toBeInTheDocument();
    expect(screen.getByText("Educ.")).toBeInTheDocument();
    expect(screen.getByText("Assist.")).toBeInTheDocument();
  });
});
