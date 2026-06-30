import { isValidCPF } from "@/app/lib/cpf";
import { RainbowColor } from "@/types";

export function getFullNameError(fullName: string) {
  const normalizedFullName = fullName.trim();

  if (!normalizedFullName || normalizedFullName.length < 3) {
    return "Informe o nome completo (mín. 3 caracteres).";
  }
}

export function getCpfError(cpf: string) {
  if (!isValidCPF(cpf)) {
    return "CPF inválido. Verifique o número digitado.";
  }
}

export function getEmailError(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um e-mail válido.";
  }
}

export function getFavoriteColorError(favoriteColor: RainbowColor | "") {
  if (!favoriteColor) {
    return "Selecione uma cor favorita.";
  }
}
