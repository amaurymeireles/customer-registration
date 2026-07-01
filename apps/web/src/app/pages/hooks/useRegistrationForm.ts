"use client";

import { useState } from "react";
import { formatCPF } from "@/app/lib/cpf";
import {
  getCpfError,
  getEmailError,
  getFavoriteColorError,
  getFullNameError,
} from "./registrationFormValidation";
import {
  ApiResponse,
  RAINBOW_COLORS,
  RainbowColor,
  RegisteredClient,
} from "@/types";

interface FormState {
  fullName: string;
  cpf: string;
  email: string;
  favoriteColor: RainbowColor | "";
  observations: string;
}

interface FieldErrors {
  fullName?: string;
  cpf?: string;
  email?: string;
  favoriteColor?: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const CLIENTS_ENDPOINT = `${API_BASE_URL}/api/clients`;

const INITIAL_FORM: FormState = {
  fullName: "",
  cpf: "",
  email: "",
  favoriteColor: "",
  observations: "",
};

export function useRegistrationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const validate = () => {
    const next: FieldErrors = {};
    const fullNameError = getFullNameError(form.fullName);
    const cpfError = getCpfError(form.cpf);
    const emailError = getEmailError(form.email);
    const favoriteColorError = getFavoriteColorError(form.favoriteColor);

    if (fullNameError) next.fullName = fullNameError;
    if (cpfError) next.cpf = cpfError;
    if (emailError) next.email = emailError;
    if (favoriteColorError) next.favoriteColor = favoriteColorError;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCPFChange = (value: string) => {
    setField("cpf", formatCPF(value));
  };

  const handleReturnToForm = () => {
    setStatus("idle");
    setFeedbackMessage("");
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const response = await fetch(CLIENTS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          cpf: form.cpf,
          email: form.email.trim(),
          favoriteColor: form.favoriteColor,
          observations: form.observations.trim() || undefined,
        }),
      });

      const payload = (await response.json()) as ApiResponse<RegisteredClient>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Nao foi possivel salvar os dados.");
      }

      setStatus("success");
      setFeedbackMessage(payload.message || "Cadastro salvo com sucesso.");
      setForm(INITIAL_FORM);
      setErrors({});
    } catch (error) {
      setStatus("error");
      setFeedbackMessage(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar os dados para a API. Verifique se ela esta em execucao e tente novamente."
      );
    }
  };

  const selectedColor = RAINBOW_COLORS.find((color) => color.value === form.favoriteColor);

  return {
    errors,
    feedbackMessage,
    form,
    handleCPFChange,
    handleReturnToForm,
    handleSubmit,
    selectedColor,
    setField,
    status,
  };
}
