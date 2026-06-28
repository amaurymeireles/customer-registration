"use client";

import { useEffect, useState } from "react";
import { RAINBOW_COLORS, RainbowColor, RegisteredClient } from "@/types";
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
const STORAGE_KEY = "client-registration:entries";

const INITIAL_FORM: FormState = {
  fullName: "",
  cpf: "",
  email: "",
  favoriteColor: "",
  observations: "",
};

function readRegistrations(): RegisteredClient[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawEntries = window.localStorage.getItem(STORAGE_KEY);
    return rawEntries ? (JSON.parse(rawEntries) as RegisteredClient[]) : [];
  } catch {
    return [];
  }
}

export default function RegistrationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setSavedCount(readRegistrations().length);
  }, []);

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

  const handleClearRegistrations = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSavedCount(0);
    setStatus("idle");
    setFeedbackMessage("");
  };

  const handleReturnToForm = () => {
    setStatus("idle");
    setFeedbackMessage("");
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setStatus("loading");
    setFeedbackMessage("");

    try {
      const registrations = readRegistrations();
      const normalizedCPF = form.cpf.replace(/\D/g, "");

      if (registrations.some((client) => client.cpf === normalizedCPF)) {
        setStatus("error");
        setFeedbackMessage(
          "Este CPF ja esta salvo neste navegador. Limpe os cadastros locais para testar novamente."
        );
      } else {
        const nextRegistration: RegisteredClient = {
          id: crypto.randomUUID(),
          fullName: form.fullName.trim(),
          cpf: normalizedCPF,
          email: form.email.trim(),
          favoriteColor: form.favoriteColor as RainbowColor,
          observations: form.observations.trim() || undefined,
          createdAt: new Date().toISOString(),
        };

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([nextRegistration, ...registrations])
        );

        setSavedCount(registrations.length + 1);
        setStatus("success");
        setFeedbackMessage("Cadastro salvo com sucesso neste navegador.");
        setForm(INITIAL_FORM);
        setErrors({});
      }
    } catch {
      setStatus("error");
      setFeedbackMessage(
        "Nao foi possivel salvar os dados localmente. Verifique as permissoes do navegador e tente novamente."
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
          Os dados ficaram armazenados localmente neste dispositivo, sem API ou banco de dados.
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
          Preencha seus dados abaixo. Nesta versao frontend-only, os cadastros ficam salvos apenas neste navegador.
        </p>
        <div className="storage-note">
          <p>
            {savedCount > 0
              ? `${savedCount} cadastro(s) salvo(s) localmente neste navegador.`
              : "Nenhum cadastro salvo localmente ainda."}
          </p>
          <button type="button" className="storage-action" onClick={handleClearRegistrations}>
            Limpar cadastros locais
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
      </div>
    </div>
  );
}
