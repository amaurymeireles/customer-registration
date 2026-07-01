"use client";

import Autocomplete from "../../lib/components/Autocomplete";
import { RAINBOW_COLORS, RainbowColor, RainbowColorOption } from "@/types";

interface ColorAutocompleteProps {
  value: RainbowColor | "";
  onChange: (value: RainbowColor | "") => void;
  error?: string;
}

export default function ColorAutocomplete({ value, onChange, error }: ColorAutocompleteProps) {
  return (
    <Autocomplete<RainbowColorOption>
      value={value}
      onChange={(v) => onChange(v as RainbowColor | "")}
      options={RAINBOW_COLORS}
      getOptionLabel={(o) => o.label}
      getOptionValue={(o) => o.value}
      placeholder="Selecione uma cor..."
      ariaLabel="Selecione sua cor favorita"
      inputId="color-autocomplete"
      error={error}
      renderLeading={(o) => (
        <span className="autocomplete__swatch" style={{ background: o.hex }} />
      )}
      renderOption={(o) => (
        <>
          <span className="color-swatch" style={{ background: o.hex }} />
          <span className="color-label">{o.label}</span>
        </>
      )}
    />
  );
}