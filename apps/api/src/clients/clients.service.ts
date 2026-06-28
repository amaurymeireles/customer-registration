import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { normalizeCPF } from "../common/utils/cpf";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const normalizedCPF = normalizeCPF(createClientDto.cpf);

    const existingClient = await this.prisma.client.findUnique({
      where: { cpf: normalizedCPF },
    });

    if (existingClient) {
      throw new ConflictException(
        "Este CPF ja esta cadastrado. Cada cliente pode se cadastrar apenas uma vez.",
      );
    }

    let client;

    try {
      client = await this.prisma.client.create({
        data: {
          fullName: createClientDto.fullName.trim(),
          cpf: normalizedCPF,
          email: createClientDto.email.trim().toLowerCase(),
          favoriteColor: createClientDto.favoriteColor,
          observations: createClientDto.observations?.trim() || null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException(
          "Este CPF ja esta cadastrado. Cada cliente pode se cadastrar apenas uma vez.",
        );
      }

      throw error;
    }

    return {
      success: true,
      message: "Cadastro realizado com sucesso!",
      data: {
        id: client.id,
        fullName: client.fullName,
        cpf: client.cpf,
        email: client.email,
        favoriteColor: client.favoriteColor,
        observations: client.observations ?? undefined,
        createdAt: client.createdAt.toISOString(),
      },
    };
  }
}
