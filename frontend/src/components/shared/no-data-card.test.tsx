import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoDataCard } from "./no-data-card";

describe("NoDataCard", () => {
  it("displays the area name in the message", () => {
    render(<NoDataCard area="Saúde" />);
    expect(screen.getByText("Sem dados em Saúde")).toBeInTheDocument();
  });

  it("renders a generic message about missing records", () => {
    render(<NoDataCard area="Educação" />);
    expect(
      screen.getByText("Esta criança não possui registros nesta área")
    ).toBeInTheDocument();
  });

  it("works for any area name", () => {
    render(<NoDataCard area="Assistência Social" />);
    expect(screen.getByText("Sem dados em Assistência Social")).toBeInTheDocument();
  });
});
