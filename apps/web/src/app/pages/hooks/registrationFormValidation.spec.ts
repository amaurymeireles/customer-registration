import {
  getFullNameError,
  getCpfError,
  getEmailError,
  getFavoriteColorError,
} from "./registrationFormValidation";

describe("getFullNameError", () => {
  it("returns error for empty string", () => {
    expect(getFullNameError("")).toBe("Informe o nome completo (mín. 3 caracteres).");
  });

  it("returns error for whitespace-only", () => {
    expect(getFullNameError("   ")).toBe("Informe o nome completo (mín. 3 caracteres).");
  });

  it("returns error for too short", () => {
    expect(getFullNameError("ab")).toBe("Informe o nome completo (mín. 3 caracteres).");
  });

  it("returns undefined for valid name", () => {
    expect(getFullNameError("Maria da Silva")).toBeUndefined();
  });

  it("returns undefined for exactly 3 characters", () => {
    expect(getFullNameError("Lua")).toBeUndefined();
  });
});

describe("getCpfError", () => {
  it("returns error for empty string", () => {
    expect(getCpfError("")).toBe("CPF inválido. Verifique o número digitado.");
  });

  it("returns error for invalid CPF", () => {
    expect(getCpfError("123")).toBe("CPF inválido. Verifique o número digitado.");
  });

  it("returns undefined for valid CPF (unformatted)", () => {
    expect(getCpfError("52998224725")).toBeUndefined();
  });

  it("returns undefined for valid CPF (formatted)", () => {
    expect(getCpfError("529.982.247-25")).toBeUndefined();
  });
});

describe("getEmailError", () => {
  it("returns error for empty string", () => {
    expect(getEmailError("")).toBe("Informe um e-mail válido.");
  });

  it("returns error for missing @", () => {
    expect(getEmailError("email.com")).toBe("Informe um e-mail válido.");
  });

  it("returns error for missing domain", () => {
    expect(getEmailError("user@")).toBe("Informe um e-mail válido.");
  });

  it("returns error for missing TLD", () => {
    expect(getEmailError("user@domain")).toBe("Informe um e-mail válido.");
  });

  it("returns undefined for valid email", () => {
    expect(getEmailError("user@domain.com")).toBeUndefined();
  });

  it("returns undefined for email with subdomain", () => {
    expect(getEmailError("user@sub.domain.com.br")).toBeUndefined();
  });
});

describe("getFavoriteColorError", () => {
  it("returns error for empty string", () => {
    expect(getFavoriteColorError("")).toBe("Selecione uma cor favorita.");
  });

  it("returns undefined for a valid color", () => {
    expect(getFavoriteColorError("AZUL")).toBeUndefined();
  });
});
