"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface AutocompleteProps<Option> {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  getOptionLabel: (option: Option) => string;
  getOptionValue: (option: Option) => string;
  filterOptions?: (query: string, options: Option[]) => Option[];
  renderOption?: (option: Option, selected: boolean, active: boolean) => React.ReactNode;
  renderLeading?: (option: Option) => React.ReactNode;
  placeholder?: string;
  error?: string;
  inputId?: string;
  ariaLabel?: string;
}

export default function Autocomplete<Option>({
  value,
  onChange,
  options,
  getOptionLabel,
  getOptionValue,
  filterOptions,
  renderOption,
  renderLeading,
  placeholder,
  error,
  inputId,
  ariaLabel,
}: AutocompleteProps<Option>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => getOptionValue(o) === value);

  const filtered = useMemo(
    () =>
      filterOptions
        ? filterOptions(query, options)
        : query === ""
          ? options
          : options.filter((o) =>
              getOptionLabel(o).toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            ),
    [query, options, filterOptions, getOptionLabel],
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filtered.length]);

  useEffect(() => {
    if (!selected) setQuery("");
  }, [selected]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const select = (option: Option) => {
    onChange(getOptionValue(option));
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          select(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const listboxId = inputId ? `${inputId}-listbox` : undefined;

  return (
    <div className={`autocomplete ${error ? "autocomplete--error" : ""}`}>
      <div className="autocomplete__input-wrapper">
        {selected && renderLeading && renderLeading(selected)}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-activedescendant={
            highlightedIndex >= 0 && listboxId
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          className={`input ${error ? "input--error" : ""}`}
          placeholder={selected ? getOptionLabel(selected) : placeholder}
          value={open ? query : selected ? getOptionLabel(selected) : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (selected) onChange("");
          }}
          onFocus={() => {
            setOpen(true);
            if (selected) {
              setQuery(getOptionLabel(selected));
              onChange("");
            }
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          type="button"
          className="autocomplete__toggle"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          aria-label={ariaLabel || "Abrir lista"}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul ref={listRef} id={listboxId} role="listbox" className="autocomplete__list">
          {filtered.map((option, index) => {
            const active = index === highlightedIndex;
            const sel = getOptionValue(option) === value;
            return (
              <li
                key={getOptionValue(option)}
                id={listboxId ? `${listboxId}-option-${index}` : undefined}
                role="option"
                aria-selected={sel}
                className={`autocomplete__option ${active ? "autocomplete__option--active" : ""}`}
                onMouseDown={() => select(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {renderOption
                  ? renderOption(option, sel, active)
                  : <span className="color-label">{getOptionLabel(option)}</span>
                }
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}