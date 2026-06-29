import { ConflictException } from "@nestjs/common";
import { Client, Prisma, RainbowColor } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";

type PrismaMock = {
  client: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
  };
};

describe("ClientsService", () => {
  let service: ClientsService;
  let prisma: PrismaMock;

  const createClient = (overrides: Partial<Client> = {}): Client => ({
    id: "client-1",
    fullName: "John Doe",
    cpf: "52998224725",
    email: "john.doe@example.com",
    favoriteColor: RainbowColor.VERMELHO,
    observations: "Some observations",
    createdAt: new Date("2024-01-01T10:00:00.000Z"),
    updatedAt: new Date("2024-01-01T10:00:00.000Z"),
    ...overrides,
  });

  const createDto = (overrides: Partial<CreateClientDto> = {}): CreateClientDto => ({
    fullName: "John Doe",
    cpf: "529.982.247-25",
    email: "John.Doe@Example.com",
    favoriteColor: RainbowColor.VERMELHO,
    observations: "Some observations",
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      client: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    service = new ClientsService(prisma as unknown as PrismaService);
  });

  it("should list clients ordered by creation date and serialize the response", async () => {
    const createdAt = new Date("2024-02-10T15:30:00.000Z");

    prisma.client.findMany.mockResolvedValue([
      createClient({
        observations: null,
        createdAt,
      }),
    ]);

    await expect(service.findAll()).resolves.toEqual({
      success: true,
      data: [
        {
          id: "client-1",
          fullName: "John Doe",
          cpf: "52998224725",
          email: "john.doe@example.com",
          favoriteColor: RainbowColor.VERMELHO,
          observations: undefined,
          createdAt: createdAt.toISOString(),
        },
      ],
    });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });

  it("should create a client with normalized data", async () => {
    const createdAt = new Date("2024-03-01T12:00:00.000Z");
    const dto = createDto({
      fullName: "  John Doe  ",
      email: "  John.Doe@Example.com  ",
      observations: "  Important notes  ",
    });

    prisma.client.findFirst.mockResolvedValue(null);
    prisma.client.create.mockResolvedValue(
      createClient({
        fullName: "John Doe",
        cpf: "52998224725",
        email: "john.doe@example.com",
        observations: "Important notes",
        createdAt,
      }),
    );

    await expect(service.create(dto)).resolves.toEqual({
      success: true,
      message: "Cadastro realizado com sucesso!",
      data: {
        id: "client-1",
        fullName: "John Doe",
        cpf: "52998224725",
        email: "john.doe@example.com",
        favoriteColor: RainbowColor.VERMELHO,
        observations: "Important notes",
        createdAt: createdAt.toISOString(),
      },
    });

    expect(prisma.client.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { cpf: "52998224725" },
          { email: "john.doe@example.com" },
        ],
      },
    });

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        fullName: "John Doe",
        cpf: "52998224725",
        email: "john.doe@example.com",
        favoriteColor: RainbowColor.VERMELHO,
        observations: "Important notes",
      },
    });
  });

  it("should store null observations when they are omitted", async () => {
    const dto = createDto({ observations: undefined });

    prisma.client.findFirst.mockResolvedValue(null);
    prisma.client.create.mockResolvedValue(
      createClient({ observations: null }),
    );

    await service.create(dto);

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        observations: null,
      }),
    });
  });

  it("should throw a conflict when the CPF already exists", async () => {
    prisma.client.findFirst.mockResolvedValue(
      createClient({ cpf: "52998224725" }),
    );

    await expect(service.create(createDto())).rejects.toThrow(
      new ConflictException("Este CPF ja esta cadastrado."),
    );

    expect(prisma.client.create).not.toHaveBeenCalled();
  });

  it("should throw a conflict when the email already exists", async () => {
    prisma.client.findFirst.mockResolvedValue(
      createClient({
        cpf: "11111111111",
        email: "john.doe@example.com",
      }),
    );

    await expect(service.create(createDto())).rejects.toThrow(
      new ConflictException("Este e-mail ja esta cadastrado."),
    );

    expect(prisma.client.create).not.toHaveBeenCalled();
  });

  it.each([
    {
      target: ["email"],
      message: "Este e-mail ja esta cadastrado.",
    },
    {
      target: ["cpf"],
      message: "Este CPF ja esta cadastrado.",
    },
  ])(
    "should translate Prisma P2002 errors for $target",
    async ({ target, message }) => {
      prisma.client.findFirst.mockResolvedValue(null);
      prisma.client.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          clientVersion: "test",
          meta: { target },
        }),
      );

      await expect(service.create(createDto())).rejects.toThrow(
        new ConflictException(message),
      );
    },
  );

  it("should rethrow unexpected errors from Prisma", async () => {
    const error = new Error("database unavailable");

    prisma.client.findFirst.mockResolvedValue(null);
    prisma.client.create.mockRejectedValue(error);

    await expect(service.create(createDto())).rejects.toThrow(error);
  });
});
