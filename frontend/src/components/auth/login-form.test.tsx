import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  it("renders the email input", () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("renders the password input", () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("calls onLogin with email and password on submit", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText("E-mail"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Senha"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("user@example.com", "secret123");
    });
  });

  it("shows loading state while submitting", async () => {
    const onLogin = vi.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );
    render(<LoginForm onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText("E-mail"), "u@e.com");
    await userEvent.type(screen.getByLabelText("Senha"), "pass");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByText("Entrando...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("displays the error message when error prop is provided", () => {
    render(
      <LoginForm
        onLogin={vi.fn()}
        error="Credenciais inválidas. Verifique e-mail e senha."
      />
    );
    expect(
      screen.getByRole("alert")
    ).toHaveTextContent("Credenciais inválidas. Verifique e-mail e senha.");
  });

  it("does not show error alert when no error prop", () => {
    render(<LoginForm onLogin={vi.fn()} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
