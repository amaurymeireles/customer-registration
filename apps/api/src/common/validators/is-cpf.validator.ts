import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import { isValidCPF } from "../utils/cpf";

export function IsCPF(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isCPF",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === "string" && isValidCPF(value);
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property ?? "cpf"} invalido.`;
        },
      },
    });
  };
}
