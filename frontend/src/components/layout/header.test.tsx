import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

describe("Header", () => {
  it("renders the menu open button", () => {
    render(<Header theme="light" onMenuOpen={vi.fn()} onThemeToggle={vi.fn()} />);
    expect(screen.getByLabelText("Abrir menu")).toBeInTheDocument();
  });

  it("renders the theme toggle button", () => {
    render(<Header theme="light" onMenuOpen={vi.fn()} onThemeToggle={vi.fn()} />);
    expect(screen.getByLabelText("Alternar tema")).toBeInTheDocument();
  });

  it("calls onMenuOpen when menu button is clicked", async () => {
    const onMenuOpen = vi.fn();
    render(<Header theme="light" onMenuOpen={onMenuOpen} onThemeToggle={vi.fn()} />);
    await userEvent.click(screen.getByLabelText("Abrir menu"));
    expect(onMenuOpen).toHaveBeenCalled();
  });

  it("calls onThemeToggle when theme button is clicked", async () => {
    const onThemeToggle = vi.fn();
    render(<Header theme="light" onMenuOpen={vi.fn()} onThemeToggle={onThemeToggle} />);
    await userEvent.click(screen.getByLabelText("Alternar tema"));
    expect(onThemeToggle).toHaveBeenCalled();
  });

  it("renders the brand name", () => {
    render(<Header theme="light" onMenuOpen={vi.fn()} onThemeToggle={vi.fn()} />);
    expect(screen.getByText("Painel Social")).toBeInTheDocument();
  });
});
