export type RainbowColor =
  | "VERMELHO"
  | "LARANJA"
  | "AMARELO"
  | "VERDE"
  | "AZUL"
  | "ANIL"
  | "VIOLETA";

export interface RainbowColorOption {
  value: RainbowColor;
  label: string;
  hex: string;
}

export const RAINBOW_COLORS: RainbowColorOption[] = [
  { value: "VERMELHO", label: "Vermelho", hex: "#FF0000" },
  { value: "LARANJA", label: "Laranja", hex: "#FF7F00" },
  { value: "AMARELO", label: "Amarelo", hex: "#FFFF00" },
  { value: "VERDE", label: "Verde", hex: "#00AA00" },
  { value: "AZUL", label: "Azul", hex: "#0000FF" },
  { value: "ANIL", label: "Anil", hex: "#4B0082" },
  { value: "VIOLETA", label: "Violeta", hex: "#8B00FF" },
];

export interface ClientFormData {
  fullName: string;
  cpf: string;
  email: string;
  favoriteColor: RainbowColor;
  observations?: string;
}

export interface RegisteredClient extends ClientFormData {
  id: string;
  createdAt: string;
}
