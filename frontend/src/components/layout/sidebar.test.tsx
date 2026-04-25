import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./sidebar";

describe("Sidebar", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onLogout: vi.fn(),
  };

  it("renders the brand name", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("Painel Social")).toBeInTheDocument();
  });

  it("renders Dashboard nav link", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("renders Crianças nav link", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Crianças" })).toBeInTheDocument();
  });

  it("renders the logout button", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByLabelText("Sair")).toBeInTheDocument();
  });

  it("calls onLogout when logout button is clicked", async () => {
    const onLogout = vi.fn();
    render(<Sidebar {...defaultProps} onLogout={onLogout} />);
    await userEvent.click(screen.getByLabelText("Sair"));
    expect(onLogout).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    render(<Sidebar {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Fechar menu"));
    expect(onClose).toHaveBeenCalled();
  });

  it("marks the active route with aria-current", () => {
    render(<Sidebar {...defaultProps} />);
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("Dashboard link points to /", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/");
  });

  it("Crianças link points to /children", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByRole("link", { name: "Crianças" })).toHaveAttribute("href", "/children");
  });
});
