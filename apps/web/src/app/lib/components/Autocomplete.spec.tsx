import { fireEvent, render, screen } from "@testing-library/react";
import Autocomplete from "./Autocomplete";

const OPTIONS = [
  { value: "R", label: "Red" },
  { value: "G", label: "Green" },
  { value: "B", label: "Blue" },
];

function renderAutocomplete(overrides: Record<string, unknown> = {}) {
  const props = {
    value: "",
    onChange: jest.fn(),
    options: OPTIONS,
    getOptionLabel: (o: { label: string }) => o.label,
    getOptionValue: (o: { value: string }) => o.value,
    placeholder: "Pick a color...",
    inputId: "test-autocomplete",
    ...overrides,
  };
  return { ...render(<Autocomplete {...props} />), props };
}

function openDropdown() {
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  return input;
}

describe("Autocomplete", () => {
  describe("rendering", () => {
    it("shows the placeholder when no value is selected", () => {
      renderAutocomplete();
      expect(screen.getByPlaceholderText("Pick a color...")).not.toBeNull();
    });

    it("shows the selected label when a value is provided", () => {
      renderAutocomplete({ value: "G" });
      expect(screen.getByDisplayValue("Green")).not.toBeNull();
    });

    it("renders a combobox with aria attributes", () => {
      renderAutocomplete();
      const input = screen.getByRole("combobox");
      expect(input.getAttribute("aria-expanded")).toBe("false");
      expect(input.getAttribute("aria-controls")).toBe("test-autocomplete-listbox");
    });
  });

  describe("dropdown open/close", () => {
    it("opens the list on ArrowDown", () => {
      renderAutocomplete();
      openDropdown();
      expect(screen.getByRole("listbox")).not.toBeNull();
    });

    it("closes the list on Escape", () => {
      renderAutocomplete();
      openDropdown();
      expect(screen.getByRole("listbox")).not.toBeNull();

      fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  describe("filtering", () => {
    it("shows all options when query is empty", () => {
      renderAutocomplete();
      openDropdown();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("filters options as the user types", () => {
      renderAutocomplete();
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "Bl" } });
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(1);
      expect(options[0].textContent).toBe("Blue");
    });

    it("shows no list when filter matches nothing", () => {
      renderAutocomplete();
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "zzz" } });
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("uses custom filterOptions if provided", () => {
      const filterOptions = jest.fn().mockReturnValue([OPTIONS[0]]);
      renderAutocomplete({ filterOptions });
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "anything" } });
      expect(filterOptions).toHaveBeenCalledWith("anything", OPTIONS);
      expect(screen.getAllByRole("option")).toHaveLength(1);
    });
  });

  describe("selection", () => {
    it("calls onChange with the selected value on click", () => {
      const onChange = jest.fn();
      renderAutocomplete({ onChange });
      openDropdown();
      fireEvent.mouseDown(screen.getByRole("option", { name: "Green" }));
      expect(onChange).toHaveBeenCalledWith("G");
    });

    it("calls onChange with the selected value on Enter", () => {
      const onChange = jest.fn();
      renderAutocomplete({ onChange });
      openDropdown();
      const input = screen.getByRole("combobox");
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(onChange).toHaveBeenCalledWith("R");
    });

    it("clears the selection when typing after a value is selected", () => {
      const onChange = jest.fn();
      renderAutocomplete({ onChange, value: "G" });
      const input = screen.getByRole("combobox");
      fireEvent.change(input, { target: { value: "Z" } });
      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("keyboard navigation", () => {
    it("moves highlight on ArrowDown", () => {
      renderAutocomplete();
      openDropdown();
      const input = screen.getByRole("combobox");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(screen.getAllByRole("option")[0].className).toContain("autocomplete__option--active");

      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(screen.getAllByRole("option")[1].className).toContain("autocomplete__option--active");
    });

    it("wraps back to first option on ArrowDown past the end", () => {
      renderAutocomplete();
      const input = openDropdown();
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(screen.getAllByRole("option")[0].className).toContain("autocomplete__option--active");
    });

    it("moves highlight backward on ArrowUp", () => {
      renderAutocomplete();
      const input = openDropdown();
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "ArrowUp" });
      expect(screen.getAllByRole("option")[1].className).toContain("autocomplete__option--active");
    });
  });

  describe("ARIA", () => {
    it("sets aria-activedescendant when an option is highlighted", () => {
      renderAutocomplete();
      const input = openDropdown();
      fireEvent.keyDown(input, { key: "ArrowDown" });
      expect(input.getAttribute("aria-activedescendant")).toBe(
        "test-autocomplete-listbox-option-0",
      );
    });

    it("sets aria-selected on the matching option", () => {
      renderAutocomplete({ value: "B" });
      openDropdown();
      const options = screen.getAllByRole("option");
      expect(options[0].getAttribute("aria-selected")).toBe("false");
      expect(options[2].getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("error state", () => {
    it("applies error class when error prop is set", () => {
      const { container } = renderAutocomplete({ error: "Required" });
      expect(container.firstChild?.className).toContain("autocomplete--error");
    });
  });
});
