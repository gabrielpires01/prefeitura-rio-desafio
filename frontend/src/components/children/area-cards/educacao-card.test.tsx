import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EducacaoCard } from "./educacao-card";
import type { Educacao } from "@/types";

const educacaoSemAlertas: Educacao = {
  escola: "Escola Municipal João XXIII",
  frequencia_percent: 90,
  alertas: [],
};

const educacaoComAlertas: Educacao = {
  escola: null,
  frequencia_percent: 60,
  alertas: ["frequencia_baixa", "matricula_pendente"],
};

describe("EducacaoCard", () => {
  it("renders the Educação section heading", () => {
    render(<EducacaoCard educacao={educacaoSemAlertas} />);
    expect(screen.getByText("Educação")).toBeInTheDocument();
  });

  it("shows 'Sem alertas' when there are no alerts", () => {
    render(<EducacaoCard educacao={educacaoSemAlertas} />);
    expect(screen.getByText("Sem alertas")).toBeInTheDocument();
  });

  it("shows alert count when there are alerts", () => {
    render(<EducacaoCard educacao={educacaoComAlertas} />);
    expect(screen.getByText("2 alertas")).toBeInTheDocument();
  });

  it("displays the school name when provided", () => {
    render(<EducacaoCard educacao={educacaoSemAlertas} />);
    expect(screen.getByText("Escola Municipal João XXIII")).toBeInTheDocument();
  });

  it("displays 'Não informada' when school is null", () => {
    render(<EducacaoCard educacao={educacaoComAlertas} />);
    expect(screen.getByText("Não informada")).toBeInTheDocument();
  });

  it("displays the frequency percentage", () => {
    render(<EducacaoCard educacao={educacaoSemAlertas} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
  });

  it("displays '—' when frequency is null", () => {
    render(
      <EducacaoCard educacao={{ ...educacaoSemAlertas, frequencia_percent: null }} />
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders a progress bar for frequency", () => {
    render(<EducacaoCard educacao={educacaoSemAlertas} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renders an AlertBadge for each alert", () => {
    render(<EducacaoCard educacao={educacaoComAlertas} />);
    expect(screen.getByText("Frequência baixa")).toBeInTheDocument();
    expect(screen.getByText("Matrícula pendente")).toBeInTheDocument();
  });
});
