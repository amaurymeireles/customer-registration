import { fireEvent, render, screen } from "@testing-library/react";
import RegistrationForm from "./RegistrationForm";
import { useRegistrationForm } from "./hooks/useRegistrationForm";

jest.mock("./hooks/useRegistrationForm", () => ({
  useRegistrationForm: jest.fn(),
}));

const mockedUseRegistrationForm = jest.mocked(useRegistrationForm);

type HookState = ReturnType<typeof useRegistrationForm>;

function createHookState(
  overrides: Partial<HookState> = {}
): HookState {
  return {
    errors: {},
    feedbackMessage: "",
    form: {
      fullName: "",
      cpf: "",
      email: "",
      favoriteColor: "",
      observations: "",
    },
    handleCPFChange: jest.fn(),
    handleReturnToForm: jest.fn(),
    handleSubmit: jest.fn(),
    selectedColor: undefined,
    setField: jest.fn(),
    status: "idle",
    ...overrides,
  };
}


describe("RegistrationForm", () => {
  beforeEach(() => {
    mockedUseRegistrationForm.mockReturnValue(createHookState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the default form state", () => {
    render(<RegistrationForm />);

    expect(screen.getByText("Cadastro de Cliente")).not.toBeNull();
    expect(screen.getByLabelText(/Nome completo/i)).not.toBeNull();
    expect(screen.getByLabelText(/^CPF/)).not.toBeNull();
    expect(screen.getByLabelText(/E-mail/i)).not.toBeNull();
    expect(screen.getByLabelText(/Observações/i)).not.toBeNull();
    expect(screen.getByRole("button", { name: "Salvar cadastro" })).not.toBeNull();
  });

  it("wires field and submit handlers from the hook", () => {
    const hookState = createHookState();
    mockedUseRegistrationForm.mockReturnValue(hookState);

    render(<RegistrationForm />);

    fireEvent.change(screen.getByLabelText(/Nome completo/i), {
      target: { value: "Maria da Silva" },
    });
    fireEvent.change(screen.getByLabelText(/^CPF/), {
      target: { value: "52998224725" },
    });
    fireEvent.change(screen.getByLabelText(/E-mail/i), {
      target: { value: "maria@email.com" },
    });
    const combobox = screen.getByRole("combobox");
    fireEvent.change(combobox, { target: { value: "Azu" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: /Azul/i }));
    fireEvent.change(screen.getByLabelText(/Observações/i), {
      target: { value: "Alguma observacao" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar cadastro" }));

    expect(hookState.setField).toHaveBeenCalledWith("fullName", "Maria da Silva");
    expect(hookState.handleCPFChange).toHaveBeenCalledWith("52998224725");
    expect(hookState.setField).toHaveBeenCalledWith("email", "maria@email.com");
    expect(hookState.setField).toHaveBeenCalledWith("favoriteColor", "AZUL");
    expect(hookState.setField).toHaveBeenCalledWith("observations", "Alguma observacao");
    expect(hookState.handleSubmit).toHaveBeenCalled();
  });

  it("renders the api error state", () => {
    mockedUseRegistrationForm.mockReturnValue(
      createHookState({
        feedbackMessage: "Email ja cadastrado.",
        status: "error",
      })
    );

    render(<RegistrationForm />);

    const alert = screen.getByRole("alert");

    expect(alert.textContent).toContain("Email ja cadastrado.");
  });

  it("renders the success state and allows returning to the form", () => {
    const hookState = createHookState({
      feedbackMessage: "Cadastro salvo com sucesso.",
      status: "success",
    });
    mockedUseRegistrationForm.mockReturnValue(hookState);

    render(<RegistrationForm />);

    expect(screen.getByText("Cadastro realizado!")).not.toBeNull();
    expect(screen.getByText("Cadastro salvo com sucesso.")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Fazer outro cadastro" }));

    expect(hookState.handleReturnToForm).toHaveBeenCalled();
  });

  it("renders selected color feedback and loading state", () => {
    mockedUseRegistrationForm.mockReturnValue(
      createHookState({
        form: {
          fullName: "",
          cpf: "",
          email: "",
          favoriteColor: "AZUL",
          observations: "",
        },
        selectedColor: {
          value: "AZUL",
          label: "Azul",
          hex: "#0000FF",
        },
        status: "loading",
      })
    );

    render(<RegistrationForm />);

    const selectedColorMessage = screen.getByText(/Cor selecionada:/);

    expect(selectedColorMessage.textContent).toContain("Azul");

    const button = screen.getByRole("button", { name: /Salvando/i });

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
