import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChildPagination } from "./child-pagination";

describe("ChildPagination", () => {
  it("displays current page and total pages", () => {
    render(<ChildPagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  it("disables the previous button on page 1", () => {
    render(<ChildPagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Página anterior")).toBeDisabled();
  });

  it("enables the previous button when not on page 1", () => {
    render(<ChildPagination page={2} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Página anterior")).not.toBeDisabled();
  });

  it("disables the next button on the last page", () => {
    render(<ChildPagination page={5} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Próxima página")).toBeDisabled();
  });

  it("enables the next button when not on the last page", () => {
    render(<ChildPagination page={1} totalPages={5} onPageChange={vi.fn()} />);
    expect(screen.getByLabelText("Próxima página")).not.toBeDisabled();
  });

  it("calls onPageChange with page + 1 when next is clicked", async () => {
    const onPageChange = vi.fn();
    render(<ChildPagination page={2} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Próxima página"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with page - 1 when previous is clicked", async () => {
    const onPageChange = vi.fn();
    render(<ChildPagination page={3} totalPages={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByLabelText("Página anterior"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
