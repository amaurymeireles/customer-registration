"use client";

import { useEffect, useState } from "react";
import { ApiResponse, RAINBOW_COLORS, RainbowColor, RegisteredClient } from "@/types";
import { formatCPF, isValidCPF } from "@/app/lib/cpf";

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

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [registrations, setRegistrations] = useState<RegisteredClient[]>([]);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(true);

  useEffect(() => {
    void loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setIsLoadingRegistrations(true);

    try {
      const response = await fetch(CLIENTS_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await response.json()) as ApiResponse<RegisteredClient[]>;

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Nao foi possivel carregar os cadastros.");
      }

      setRegistrations(payload.data);
    } catch {
      setRegistrations([]);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!form.fullName.trim() || form.fullName.trim().length < 3) {
      next.fullName = "Informe o nome completo (mín. 3 caracteres).";
    }
    if (!isValidCPF(form.cpf)) {
      next.cpf = "CPF inválido. Verifique o número digitado.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Informe um e-mail válido.";
    }
    if (!form.favoriteColor) {
      next.favoriteColor = "Selecione uma cor favorita.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCPFChange = (value: string) => {
    setForm((prev) => ({ ...prev, cpf: formatCPF(value) }));
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

      setRegistrations((prev) => [payload.data, ...prev]);
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

  const selectedColor = RAINBOW_COLORS.find((c) => c.value === form.favoriteColor);

  if (status === "success") {
    return (
      <div className="success-card">
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#16a34a" fillOpacity="0.12" />
            <path
              d="M14 24l8 8 12-14"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="success-title">Cadastro realizado!</h2>
        <p className="success-message">{feedbackMessage}</p>
        <p className="success-sub">
          Os dados foram enviados para a API e persistidos no banco de dados.
        </p>
        <button type="button" className="secondary-btn" onClick={handleReturnToForm}>
          Fazer outro cadastro
        </button>
      </div>
    );
  }

  return (
    <div className="form-card">
      <div className="form-header">
        <div className="rainbow-bar" aria-hidden="true">
          {RAINBOW_COLORS.map((c) => (
            <span key={c.value} style={{ background: c.hex }} />
          ))}
        </div>
        <h1 className="form-title">Cadastro de Cliente</h1>
        <p className="form-subtitle">
          Preencha seus dados abaixo. Esta interface envia o cadastro para a API e carrega os registros salvos no banco.
        </p>
        <div className="storage-note">
          <p>
            {isLoadingRegistrations
              ? "Carregando cadastros da API..."
              : registrations.length > 0
                ? `${registrations.length} cadastro(s) carregado(s) da API.`
                : "Nenhum cadastro encontrado na API ainda."}
          </p>
          <button type="button" className="storage-action" onClick={() => void loadRegistrations()}>
            Atualizar lista
          </button>
        </div>
      </div>

      <div className="form-body">
        {/* Full name */}
        <div className="field">
          <label htmlFor="fullName" className="label">
            Nome completo <span className="required">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className={`input ${errors.fullName ? "input--error" : ""}`}
            placeholder="Ex.: Maria da Silva"
            value={form.fullName}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullName: e.target.value }))
            }
          />
          {errors.fullName && (
            <span className="error-msg">{errors.fullName}</span>
          )}
        </div>

        {/* CPF */}
        <div className="field">
          <label htmlFor="cpf" className="label">
            CPF <span className="required">*</span>
          </label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={`input ${errors.cpf ? "input--error" : ""}`}
            placeholder="000.000.000-00"
            value={form.cpf}
            maxLength={14}
            onChange={(e) => handleCPFChange(e.target.value)}
          />
          {errors.cpf && <span className="error-msg">{errors.cpf}</span>}
        </div>

        {/* Email */}
        <div className="field">
          <label htmlFor="email" className="label">
            E-mail <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? "input--error" : ""}`}
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) =>
              setForm((p) => ({ ...p, email: e.target.value }))
            }
          />
          {errors.email && <span className="error-msg">{errors.email}</span>}
        </div>

        {/* Favorite color */}
        <div className="field">
          <label className="label">
            Cor favorita <span className="required">*</span>
          </label>
          <div
            className={`color-grid ${errors.favoriteColor ? "color-grid--error" : ""}`}
            role="radiogroup"
            aria-label="Selecione sua cor favorita"
          >
            {RAINBOW_COLORS.map((color) => {
              const checked = form.favoriteColor === color.value;
              return (
                <label
                  key={color.value}
                  className={`color-option ${checked ? "color-option--selected" : ""}`}
                  style={
                    checked
                      ? {
                          borderColor: color.hex,
                          boxShadow: `0 0 0 3px ${color.hex}33`,
                        }
                      : {}
                  }
                >
                  <input
                    type="radio"
                    name="favoriteColor"
                    value={color.value}
                    checked={checked}
                    onChange={() =>
                      setForm((p) => ({
                        ...p,
                        favoriteColor: color.value,
                      }))
                    }
                    className="sr-only"
                  />
                  <span
                    className="color-swatch"
                    style={{ background: color.hex }}
                    aria-hidden="true"
                  />
                  <span className="color-label">{color.label}</span>
                </label>
              );
            })}
          </div>
          {selectedColor && (
            <p className="color-selected-msg">
              Cor selecionada:{" "}
              <strong style={{ color: selectedColor.hex }}>
                {selectedColor.label}
              </strong>
            </p>
          )}
          {errors.favoriteColor && (
            <span className="error-msg">{errors.favoriteColor}</span>
          )}
        </div>

        {/* Observations */}
        <div className="field">
          <label htmlFor="observations" className="label">
            Observações{" "}
            <span className="optional">(opcional)</span>
          </label>
          <textarea
            id="observations"
            className="textarea"
            placeholder="Informações adicionais, se necessário..."
            rows={3}
            maxLength={500}
            value={form.observations}
            onChange={(e) =>
              setForm((p) => ({ ...p, observations: e.target.value }))
            }
          />
          <span className="char-count">
            {form.observations.length}/500
          </span>
        </div>

        {/* API error */}
        {status === "error" && (
          <div className="api-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7.5" stroke="#dc2626" />
              <path d="M8 4v4M8 11v1" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {feedbackMessage}
          </div>
        )}

        <button
          type="button"
          className={`submit-btn ${status === "loading" ? "submit-btn--loading" : ""}`}
          onClick={handleSubmit}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Salvando...
            </>
          ) : (
            "Salvar cadastro"
          )}
        </button>

        <p className="required-note">
          <span className="required">*</span> Campos obrigatórios
        </p>

        {registrations.length > 0 && (
          <div className="registrations-list">
            <div className="registrations-list__header">
              <h2>Ultimos cadastros</h2>
              <span>{registrations.length} registro(s)</span>
            </div>
            <ul className="registrations-list__items">
              {registrations.slice(0, 5).map((client) => (
                <li key={client.id} className="registrations-list__item">
                  <div>
                    <strong>{client.fullName}</strong>
                    <p>{client.email}</p>
                  </div>
                  <span>{new Date(client.createdAt).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
