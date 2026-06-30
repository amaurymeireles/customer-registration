"use client";

import ApiError from "./ApiError";
import { useRegistrationForm } from "@/app/hooks/useRegistrationForm";
import { RAINBOW_COLORS } from "@/types";

export default function RegistrationForm() {
  const {
    errors,
    feedbackMessage,
    form,
    handleCPFChange,
    handleReturnToForm,
    handleSubmit,
    selectedColor,
    setField,
    status,
  } = useRegistrationForm();

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
          Preencha seus dados abaixo. Esta interface envia o cadastro para a API e persiste os dados no banco.
        </p>
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
            onChange={(e) => setField("fullName", e.target.value)}
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
            onChange={(e) => setField("email", e.target.value)}
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
                    onChange={() => setField("favoriteColor", color.value)}
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
            onChange={(e) => setField("observations", e.target.value)}
          />
          <span className="char-count">
            {form.observations.length}/500
          </span>
        </div>

        {/* API error */}
        {status === "error" && <ApiError message={feedbackMessage} />}

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
