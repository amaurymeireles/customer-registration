import { render, screen } from "@testing-library/react";
import ApiError from "./ApiError";

describe("ApiError", () => {
  it("renders the message inside an alert", () => {
    render(<ApiError message="Nao foi possivel salvar os dados." />);

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain("Nao foi possivel salvar os dados.");
  });

  it("renders the decorative error icon", () => {
    const { container } = render(<ApiError message="Erro" />);

    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });
});
