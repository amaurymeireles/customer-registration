// create-client.dto.spec.ts

import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RainbowColor } from "@prisma/client";

import { CreateClientDto } from "./create-client.dto";

describe("CreateClientDto", () => {
  const validPayload = {
    fullName: "John Doe",
    cpf: "52998224725",
    email: "john.doe@example.com",
    favoriteColor: RainbowColor.VERMELHO,
    observations: "Some observations",
  };

  const validateDto = async (payload: Partial<CreateClientDto>) => {
    const dto = plainToInstance(CreateClientDto, payload);
    return validate(dto);
  };

  it("should validate a valid payload", async () => {
    const errors = await validateDto(validPayload);

    expect(errors).toHaveLength(0);
  });

  it("should trim fullName", async () => {
    const dto = plainToInstance(CreateClientDto, {
      ...validPayload,
      fullName: "   John Doe   ",
    });

    expect(dto.fullName).toBe("John Doe");
  });

  it("should trim email", async () => {
    const dto = plainToInstance(CreateClientDto, {
      ...validPayload,
      email: "  john@example.com  ",
    });

    expect(dto.email).toBe("john@example.com");
  });

  it("should trim observations", async () => {
    const dto = plainToInstance(CreateClientDto, {
      ...validPayload,
      observations: "   Hello world   ",
    });

    expect(dto.observations).toBe("Hello world");
  });

  it("should reject an invalid CPF", async () => {
    const errors = await validateDto({
      ...validPayload,
      cpf: "12345678900",
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isCPF).toBe("CPF invalido.");
  });

  it("should reject an invalid email", async () => {
    const errors = await validateDto({
      ...validPayload,
      email: "invalid-email",
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isEmail).toBe("E-mail invalido.");
  });

  it("should reject a short full name", async () => {
    const errors = await validateDto({
      ...validPayload,
      fullName: "Jo",
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.minLength).toBe(
      "Nome completo deve ter pelo menos 3 caracteres.",
    );
  });

  it("should reject a full name longer than 120 characters", async () => {
    const errors = await validateDto({
      ...validPayload,
      fullName: "A".repeat(121),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.maxLength).toBe("Nome muito longo.");
  });

  it("should reject observations longer than 500 characters", async () => {
    const errors = await validateDto({
      ...validPayload,
      observations: "A".repeat(501),
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.maxLength).toBe(
      "Observacoes muito longas.",
    );
  });

  it("should reject an invalid favorite color", async () => {
    const errors = await validateDto({
      ...validPayload,
      favoriteColor: "PURPLE" as RainbowColor,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isEnum).toBe(
      "Cor favorita invalida.",
    );
  });

  it("should allow observations to be omitted", async () => {
    const errors = await validateDto({
      fullName: validPayload.fullName,
      cpf: validPayload.cpf,
      email: validPayload.email,
      favoriteColor: validPayload.favoriteColor,
    });

    expect(errors).toHaveLength(0);
  });

  it("should reject missing required fields", async () => {
    const errors = await validateDto({});

    expect(errors).toHaveLength(4);

    const properties = errors.map((e) => e.property);

    expect(properties).toEqual(
      expect.arrayContaining([
        "fullName",
        "cpf",
        "email",
        "favoriteColor",
      ]),
    );
  });
});
