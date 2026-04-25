import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertBanner } from "./alert-banner";

describe("AlertBanner", () => {
  it("renders nothing when totalAlerts is 0", () => {
    const { container } = render(<AlertBanner totalAlerts={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders with singular form for 1 alert", () => {
    render(<AlertBanner totalAlerts={1} />);
    expect(screen.getByText(/1 criança necessita de atenção/)).toBeInTheDocument();
  });

  it("renders with plural form for multiple alerts", () => {
    render(<AlertBanner totalAlerts={5} />);
    expect(screen.getByText(/5 crianças necessitam de atenção/)).toBeInTheDocument();
  });

  it("renders the subtitle message", () => {
    render(<AlertBanner totalAlerts={3} />);
    expect(
      screen.getByText("Casos com alertas ativos aguardando revisão técnica")
    ).toBeInTheDocument();
  });
});
