import type { ArenaModeSelection } from "../../types";
import { ARENA_MODE_OPTIONS } from "../../utils/arenaModes";

interface ArenaModeSelectorProps {
  value: ArenaModeSelection;
  onChange: (value: ArenaModeSelection) => void;
  className?: string;
}

const ArenaModeSelector = ({
  value,
  onChange,
  className = "",
}: ArenaModeSelectorProps) => (
  <div
    className={`flex flex-wrap gap-2 ${className}`.trim()}
    role="group"
    aria-label="Arena mode"
  >
    {ARENA_MODE_OPTIONS.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(option.value)}
          className={`t-label rounded-full border px-3 py-1.5 transition-colors hover:cursor-pointer ${
            selected
              ? "border-accent bg-accent text-accent-fg"
              : "border-border bg-surface text-fg-muted hover:border-border-strong hover:bg-surface-hover hover:text-fg"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default ArenaModeSelector;
