import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  const baseProps = {
    label: "Total de Crianças",
    value: 42,
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  };

  it("renders the label", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText("Total de Crianças")).toBeInTheDocument();
  });

  it("renders the numeric value", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders optional sub text when provided", () => {
    render(<StatCard {...baseProps} sub="de 100 crianças" />);
    expect(screen.getByText("de 100 crianças")).toBeInTheDocument();
  });

  it("does not render sub text when not provided", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.queryByText("de 100 crianças")).not.toBeInTheDocument();
  });

  it("renders value 0 correctly", () => {
    render(<StatCard {...baseProps} value={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
