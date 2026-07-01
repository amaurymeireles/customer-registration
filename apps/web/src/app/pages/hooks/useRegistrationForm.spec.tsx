import { act, renderHook, waitFor } from "@testing-library/react";
import { useRegistrationForm } from "./useRegistrationForm";

describe("useRegistrationForm", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("returns the initial form state", () => {
    const { result } = renderHook(() => useRegistrationForm());

    expect(result.current.form).toEqual({
      fullName: "",
      cpf: "",
      email: "",
      favoriteColor: "",
      observations: "",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.status).toBe("idle");
    expect(result.current.feedbackMessage).toBe("");
    expect(result.current.selectedColor).toBeUndefined();
  });

  it("formats the cpf when handleCPFChange is called", () => {
    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.handleCPFChange("12345678901");
    });

    expect(result.current.form.cpf).toBe("123.456.789-01");
  });

  it("validates required fields before submitting", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const { result } = renderHook(() => useRegistrationForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.errors).toEqual({
      fullName: "Informe o nome completo (mín. 3 caracteres).",
      cpf: "CPF inválido. Verifique o número digitado.",
      email: "Informe um e-mail válido.",
      favoriteColor: "Selecione uma cor favorita.",
    });
  });

  it("submits successfully and resets the form", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Cadastro salvo com sucesso.",
        data: {
          id: "client-1",
          fullName: "Maria da Silva",
          cpf: "529.982.247-25",
          email: "maria@email.com",
          favoriteColor: "AZUL",
          observations: "Observacao",
          createdAt: "2026-06-30T12:00:00.000Z",
        },
      }),
    }) as typeof fetch;

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.setField("fullName", "Maria da Silva");
      result.current.handleCPFChange("52998224725");
      result.current.setField("email", "maria@email.com");
      result.current.setField("favoriteColor", "AZUL");
      result.current.setField("observations", "Observacao");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/clients"),
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: "Maria da Silva",
          cpf: "529.982.247-25",
          email: "maria@email.com",
          favoriteColor: "AZUL",
          observations: "Observacao",
        }),
      })
    );
    expect(result.current.feedbackMessage).toBe("Cadastro salvo com sucesso.");
    expect(result.current.form).toEqual({
      fullName: "",
      cpf: "",
      email: "",
      favoriteColor: "",
      observations: "",
    });
    expect(result.current.errors).toEqual({});
  });

  it("sets an error state when the api returns a failure response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        success: false,
        message: "Email ja cadastrado.",
        data: null,
      }),
    }) as typeof fetch;

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.setField("fullName", "Maria da Silva");
      result.current.handleCPFChange("52998224725");
      result.current.setField("email", "maria@email.com");
      result.current.setField("favoriteColor", "AZUL");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.feedbackMessage).toBe("Email ja cadastrado.");
  });

  it("returns to the form state after a successful submission", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "Cadastro salvo com sucesso.",
        data: {
          id: "client-1",
          fullName: "Maria da Silva",
          cpf: "529.982.247-25",
          email: "maria@email.com",
          favoriteColor: "AZUL",
          createdAt: "2026-06-30T12:00:00.000Z",
        },
      }),
    }) as typeof fetch;

    const { result } = renderHook(() => useRegistrationForm());

    act(() => {
      result.current.setField("fullName", "Maria da Silva");
      result.current.handleCPFChange("52998224725");
      result.current.setField("email", "maria@email.com");
      result.current.setField("favoriteColor", "AZUL");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    act(() => {
      result.current.handleReturnToForm();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.feedbackMessage).toBe("");
  });
});
