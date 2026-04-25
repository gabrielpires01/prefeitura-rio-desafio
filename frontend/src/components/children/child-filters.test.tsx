import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildFilters, type Toggle } from "./child-filters";

const noop = () => {};

const defaultProps = {
  bairro: "",
  comAlertas: undefined as Toggle,
  revisado: undefined as Toggle,
  onBairroChange: noop,
  onComAlertasChange: noop,
  onRevisadoChange: noop,
  onClear: noop,
};

describe("ChildFilters", () => {
  it("renders the bairro select with default option", () => {
    render(<ChildFilters {...defaultProps} />);
    expect(screen.getByRole("combobox", { name: /bairro/i })).toBeInTheDocument();
    expect(screen.getByText("Todos os bairros")).toBeInTheDocument();
  });

  it("renders bairro options", () => {
    render(<ChildFilters {...defaultProps} />);
    expect(screen.getByText("Rocinha")).toBeInTheDocument();
    expect(screen.getByText("Maré")).toBeInTheDocument();
  });

  it("calls onBairroChange when a bairro is selected", async () => {
    const onBairroChange = vi.fn();
    render(<ChildFilters {...defaultProps} onBairroChange={onBairroChange} />);
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /bairro/i }),
      "Rocinha"
    );
    expect(onBairroChange).toHaveBeenCalledWith("Rocinha");
  });

  it("shows 'Todos' as alert toggle label when comAlertas is undefined", () => {
    render(<ChildFilters {...defaultProps} comAlertas={undefined} />);
    expect(screen.getByLabelText("Filtrar por alertas")).toHaveTextContent("Todos");
  });

  it("shows 'Com alertas' when comAlertas is true", () => {
    render(<ChildFilters {...defaultProps} comAlertas={true} />);
    expect(screen.getByLabelText("Filtrar por alertas")).toHaveTextContent("Com alertas");
  });

  it("shows 'Sem alertas' when comAlertas is false", () => {
    render(<ChildFilters {...defaultProps} comAlertas={false} />);
    expect(screen.getByLabelText("Filtrar por alertas")).toHaveTextContent("Sem alertas");
  });

  it("calls onComAlertasChange cycling through states when alert toggle clicked", async () => {
    const onComAlertasChange = vi.fn();
    render(
      <ChildFilters
        {...defaultProps}
        comAlertas={undefined}
        onComAlertasChange={onComAlertasChange}
      />
    );
    await userEvent.click(screen.getByLabelText("Filtrar por alertas"));
    expect(onComAlertasChange).toHaveBeenCalledWith(true);
  });

  it("calls onRevisadoChange when revisado toggle is clicked", async () => {
    const onRevisadoChange = vi.fn();
    render(
      <ChildFilters
        {...defaultProps}
        revisado={undefined}
        onRevisadoChange={onRevisadoChange}
      />
    );
    await userEvent.click(screen.getByLabelText("Filtrar por revisão"));
    expect(onRevisadoChange).toHaveBeenCalledWith(true);
  });

  it("does not show clear button when no filters are active", () => {
    render(<ChildFilters {...defaultProps} />);
    expect(screen.queryByText("Limpar")).not.toBeInTheDocument();
  });

  it("shows clear button when bairro filter is active", () => {
    render(<ChildFilters {...defaultProps} bairro="Rocinha" />);
    expect(screen.getByText("Limpar")).toBeInTheDocument();
  });

  it("shows clear button when comAlertas filter is active", () => {
    render(<ChildFilters {...defaultProps} comAlertas={true} />);
    expect(screen.getByText("Limpar")).toBeInTheDocument();
  });

  it("calls onClear when clear button is clicked", async () => {
    const onClear = vi.fn();
    render(<ChildFilters {...defaultProps} bairro="Rocinha" onClear={onClear} />);
    await userEvent.click(screen.getByText("Limpar"));
    expect(onClear).toHaveBeenCalled();
  });
});
