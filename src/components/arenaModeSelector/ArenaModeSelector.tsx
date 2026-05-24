import type { ArenaModeSelection } from "../../types";
import { ARENA_MODE_OPTIONS } from "../../utils/arenaModes";

interface ArenaModeSelectorProps {
  value: ArenaModeSelection;
  onChange: (value: ArenaModeSelection) => void;
  className?: string;
  variant?: "pills" | "segmented";
}

const ArenaModeSelector = ({
  value,
  onChange,
  className = "",
  variant = "pills",
}: ArenaModeSelectorProps) => (
  <div
    className={`flex ${
      variant === "segmented"
        ? "w-fit flex-nowrap gap-1 rounded-lg border border-border bg-surface p-1"
        : "flex-wrap gap-2"
    } ${className}`.trim()}
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
          className={`t-label border px-3 py-1.5 transition-colors hover:cursor-pointer ${
            variant === "segmented"
              ? `rounded-md ${
                  selected
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-transparent bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg"
                }`
              : `rounded-full ${
                  selected
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border bg-surface text-fg-muted hover:border-border-strong hover:bg-surface-hover hover:text-fg"
                }`
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default ArenaModeSelector;
