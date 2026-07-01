import { isValidCPF, formatCPF } from "./cpf";

describe("isValidCPF", () => {
  it("rejects empty string", () => {
    expect(isValidCPF("")).toBe(false);
  });

  it("rejects too short", () => {
    expect(isValidCPF("123")).toBe(false);
  });

  it("rejects all identical digits", () => {
    expect(isValidCPF("111.111.111-11")).toBe(false);
    expect(isValidCPF("00000000000")).toBe(false);
  });

  it("rejects CPF with invalid check digits", () => {
    expect(isValidCPF("123.456.789-00")).toBe(false);
  });

  it("accepts a known valid CPF (unformatted)", () => {
    expect(isValidCPF("52998224725")).toBe(true);
  });

  it("accepts a known valid CPF (formatted)", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("accepts another valid CPF", () => {
    expect(isValidCPF("746.824.890-70")).toBe(true);
  });

  it("strips non-digit characters", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
  });

  it("rejects CPF with letters", () => {
    expect(isValidCPF("abc.def.ghi-jk")).toBe(false);
  });
});

describe("formatCPF", () => {
  it("formats 11 digits", () => {
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("formats partial input progressively", () => {
    expect(formatCPF("529")).toBe("529");
    expect(formatCPF("5299")).toBe("529.9");
    expect(formatCPF("529982")).toBe("529.982");
    expect(formatCPF("5299822")).toBe("529.982.2");
    expect(formatCPF("52998224725")).toBe("529.982.247-25");
  });

  it("strips non-digits", () => {
    expect(formatCPF("529.982.247-25")).toBe("529.982.247-25");
  });

  it("truncates beyond 11 digits", () => {
    expect(formatCPF("52998224725123")).toBe("529.982.247-25");
  });

  it("handles empty string", () => {
    expect(formatCPF("")).toBe("");
  });
});
