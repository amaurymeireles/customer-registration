import { RainbowColor } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { IsCPF } from "../../common/validators/is-cpf.validator";

export class CreateClientDto {
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MinLength(3, { message: "Nome completo deve ter pelo menos 3 caracteres." })
  @MaxLength(120, { message: "Nome muito longo." })
  fullName!: string;

  @IsString()
  @IsCPF({ message: "CPF invalido." })
  cpf!: string;

  @IsEmail({}, { message: "E-mail invalido." })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  email!: string;

  @IsEnum(RainbowColor, { message: "Cor favorita invalida." })
  favoriteColor!: RainbowColor;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @MaxLength(500, { message: "Observacoes muito longas." })
  observations?: string;
}
