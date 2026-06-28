import { ConflictException, Injectable } from "@nestjs/common";
import { Client, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { normalizeCPF } from "./utils/cpf";

const DUPLICATE_CPF_MESSAGE =
  "Este CPF ja esta cadastrado.";
const DUPLICATE_EMAIL_MESSAGE =
  "Este e-mail ja esta cadastrado.";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const clients = await this.prisma.client.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: clients.map((client) => this.serializeClient(client)),
    };
  }

  async create(createClientDto: CreateClientDto) {
    const normalizedCPF = normalizeCPF(createClientDto.cpf);
    const normalizedEmail = createClientDto.email.trim().toLowerCase();

    const existingClient = await this.prisma.client.findFirst({
      where: {
        OR: [{ cpf: normalizedCPF }, { email: normalizedEmail }],
      },
    });

    if (existingClient) {
      throw new ConflictException(
        existingClient.cpf === normalizedCPF ? DUPLICATE_CPF_MESSAGE : DUPLICATE_EMAIL_MESSAGE,
      );
    }

    let client;

    try {
      client = await this.prisma.client.create({
        data: {
          fullName: createClientDto.fullName.trim(),
          cpf: normalizedCPF,
          email: normalizedEmail,
          favoriteColor: createClientDto.favoriteColor,
          observations: createClientDto.observations?.trim() || null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = Array.isArray(error.meta?.target) ? error.meta.target : [];

        throw new ConflictException(
          target.includes("email") ? DUPLICATE_EMAIL_MESSAGE : DUPLICATE_CPF_MESSAGE,
        );
      }

      throw error;
    }

    return {
      success: true,
      message: "Cadastro realizado com sucesso!",
      data: this.serializeClient(client),
    };
  }

  private serializeClient(client: Client) {
    return {
      id: client.id,
      fullName: client.fullName,
      cpf: client.cpf,
      email: client.email,
      favoriteColor: client.favoriteColor,
      observations: client.observations ?? undefined,
      createdAt: client.createdAt.toISOString(),
    };
  }
}
