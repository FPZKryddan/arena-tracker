import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
  hasActiveChampionFilters,
  type ChampionFilters,
  type ChampionRoleFilter,
  type ChampionStageFilter,
} from "./championFilters";

type ChampionFilteringProps = {
  filters: ChampionFilters;
  maxTimesPlayed: number;
  onFiltersChange: (filters: ChampionFilters) => void;
};

const STAGE_FILTER_OPTIONS: { label: string; value: ChampionStageFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Not played", value: "NOT_PLAYED" },
  { label: "Played", value: "STAGE_1" },
  { label: "Top 4", value: "STAGE_2" },
  { label: "Stage 3", value: "STAGE_3" },
  { label: "Unfinished", value: "UNFINISHED" },
];

const ROLE_FILTER_OPTIONS: { label: string; value: ChampionRoleFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Assassin", value: "Assassin" },
  { label: "Fighter", value: "Fighter" },
  { label: "Mage", value: "Mage" },
  { label: "Marksman", value: "Marksman" },
  { label: "Support", value: "Support" },
  { label: "Tank", value: "Tank" },
];

const toFilterNumber = (value: string): number => {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return 0;
  return Math.max(0, nextValue);
};

const ChampionFiltering = ({
  filters,
  maxTimesPlayed,
  onFiltersChange,
}: ChampionFilteringProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const setShowCompleted = (showCompleted: boolean) =>
    onFiltersChange({ ...filters, showCompleted });
  const setShowNotPlayed = (showNotPlayed: boolean) =>
    onFiltersChange({ ...filters, showNotPlayed });
  const setStageFilter = (stageFilter: ChampionStageFilter) =>
    onFiltersChange({ ...filters, stageFilter });
  const setRoleFilter = (roleFilter: ChampionRoleFilter) =>
    onFiltersChange({ ...filters, roleFilter });
  const setPlayedRange = (
    minPlayedRequired: number,
    maxPlayedAllowed: number
  ) => onFiltersChange({ ...filters, minPlayedRequired, maxPlayedAllowed });
  const setMinWinrateRequired = (minWinrateRequired: number) =>
    onFiltersChange({ ...filters, minWinrateRequired });
  const setMaxAvgPlacement = (maxAvgPlacement: number) =>
    onFiltersChange({ ...filters, maxAvgPlacement });
  const filtersAreActive = hasActiveChampionFilters(filters);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          aria-label="Open champion filters"
          className={`rounded-md border p-1 transition-colors hover:cursor-pointer ${
            filtersAreActive
              ? "border-accent bg-accent text-accent-fg"
              : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiOutlineAdjustmentsHorizontal className=" text-lg" />
        </button>
        <div
          className={`absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-lg border border-border bg-surface p-4 text-fg
        ${isOpen ? "flex" : "hidden"}`}
        >
          <ul className="text-xs flex flex-col gap-3 w-full">
            <ChampionFilteringCheckbox
              label="Show completed champions?"
              value={filters.showCompleted}
              updateValueCallback={setShowCompleted}
            />
            <ChampionFilteringCheckbox
              label="Show not played champions?"
              value={filters.showNotPlayed}
              updateValueCallback={setShowNotPlayed}
            />
            <ChampionFilteringSelect
              label="Stage"
              value={filters.stageFilter}
              options={STAGE_FILTER_OPTIONS}
              updateValueCallback={setStageFilter}
            />
            <ChampionFilteringSelect
              label="Role"
              value={filters.roleFilter}
              options={ROLE_FILTER_OPTIONS}
              updateValueCallback={setRoleFilter}
            />
            <ChampionFilteringRange
              label="Times played"
              minValue={filters.minPlayedRequired}
              maxValue={filters.maxPlayedAllowed}
              rangeMax={maxTimesPlayed}
              updateValueCallback={setPlayedRange}
            />
            <ChampionFilteringNumber
              label="Min winrate %"
              value={String(filters.minWinrateRequired)}
              updateValueCallback={setMinWinrateRequired}
            />
            <ChampionFilteringNumber
              label="Max avg place"
              value={String(filters.maxAvgPlacement)}
              step="0.1"
              updateValueCallback={setMaxAvgPlacement}
            />
          </ul>
        </div>
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full bg-transparent z-10 ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
};

type ChampionFilteringSelectProps<TValue extends string> = {
  label: string;
  value: TValue;
  options: { label: string; value: TValue }[];
  updateValueCallback: (value: TValue) => void;
};

const ChampionFilteringSelect = <TValue extends string,>({
  label,
  value,
  options,
  updateValueCallback,
}: ChampionFilteringSelectProps<TValue>) => {
  return (
    <li className="w-full">
      <label className="flex flex-row w-full justify-between items-center gap-3">
        <span className="text-wrap">{label}</span>
        <select
          value={value}
          className="w-32 rounded-md border border-border bg-surface-elevated px-2 py-1 text-fg outline-none focus:border-accent"
          onChange={(e) => updateValueCallback(e.target.value as TValue)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </li>
  );
};

type ChampionFilteringCheckboxProps = {
  label: string;
  value: boolean;
  updateValueCallback: (value: boolean) => void;
};

const ChampionFilteringCheckbox = ({
  label,
  value,
  updateValueCallback,
}: ChampionFilteringCheckboxProps) => {
  return (
    <li className="w-full">
      <label className="flex flex-row w-full justify-between items-center gap-3">
        <span className="text-wrap">{label}</span>
        <input
          name="checkbox"
          type="checkbox"
          checked={value}
          className="h-4 w-4 accent-accent"
          onChange={(e) => updateValueCallback(e.target.checked)}
        />
      </label>
    </li>
  );
};

type ChampionFilteringRangeProps = {
  label: string;
  minValue: number;
  maxValue: number;
  rangeMax: number;
  updateValueCallback: (minValue: number, maxValue: number) => void;
};

const ChampionFilteringRange = ({
  label,
  minValue,
  maxValue,
  rangeMax,
  updateValueCallback,
}: ChampionFilteringRangeProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeThumbRef = useRef<"min" | "max" | null>(null);
  const rangeMaxValue = Number.isFinite(rangeMax)
    ? Math.max(0, Math.floor(rangeMax))
    : 0;
  const displayedMaxValue =
    maxValue === 0
      ? rangeMaxValue
      : Math.min(Math.max(0, Math.floor(maxValue)), rangeMaxValue);
  const displayedMinValue = Math.min(
    Math.max(0, Math.floor(minValue)),
    displayedMaxValue
  );
  const minPercent =
    rangeMaxValue > 0 ? (displayedMinValue / rangeMaxValue) * 100 : 0;
  const maxPercent =
    rangeMaxValue > 0 ? (displayedMaxValue / rangeMaxValue) * 100 : 0;
  const midpointPercent = (minPercent + maxPercent) / 2;
  const disabled = rangeMaxValue === 0;

  const toStoredMaxValue = (value: number): number =>
    value >= rangeMaxValue ? 0 : value;

  const updateMinValue = (value: number): void => {
    const nextMinValue = Math.min(Math.max(0, value), displayedMaxValue);
    updateValueCallback(nextMinValue, toStoredMaxValue(displayedMaxValue));
  };

  const updateMaxValue = (value: number): void => {
    const nextMaxValue = Math.max(
      Math.min(rangeMaxValue, value),
      displayedMinValue
    );
    updateValueCallback(displayedMinValue, toStoredMaxValue(nextMaxValue));
  };

  const handleMinChange = (value: string): void => {
    updateMinValue(Math.floor(toFilterNumber(value)));
  };

  const handleMaxChange = (value: string): void => {
    updateMaxValue(Math.floor(toFilterNumber(value)));
  };

  const getValueFromPointer = (clientX: number): number => {
    const track = trackRef.current;
    if (!track || rangeMaxValue === 0) return 0;
    const rect = track.getBoundingClientRect();
    const percent = Math.min(
      Math.max((clientX - rect.left) / rect.width, 0),
      1
    );
    return Math.round(percent * rangeMaxValue);
  };

  const getClosestThumb = (value: number): "min" | "max" => {
    const minDistance = Math.abs(value - displayedMinValue);
    const maxDistance = Math.abs(value - displayedMaxValue);
    return minDistance <= maxDistance ? "min" : "max";
  };

  const updateThumbValue = (thumb: "min" | "max", value: number): void => {
    if (thumb === "min") {
      updateMinValue(value);
      return;
    }
    updateMaxValue(value);
  };

  const getThumbFromTarget = (target: EventTarget): "min" | "max" | null => {
    if (!(target instanceof HTMLInputElement)) return null;
    if (target.ariaLabel?.startsWith("Minimum")) return "min";
    if (target.ariaLabel?.startsWith("Maximum")) return "max";
    return null;
  };

  const handlePointerDown = (
    e: ReactPointerEvent<HTMLDivElement>
  ): void => {
    if (disabled) return;
    const nextValue = getValueFromPointer(e.clientX);
    const nextThumb = getThumbFromTarget(e.target) ?? getClosestThumb(nextValue);
    activeThumbRef.current = nextThumb;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateThumbValue(nextThumb, nextValue);
    e.preventDefault();
  };

  const handlePointerMove = (
    e: ReactPointerEvent<HTMLDivElement>
  ): void => {
    if (!activeThumbRef.current) return;
    updateThumbValue(activeThumbRef.current, getValueFromPointer(e.clientX));
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>): void => {
    activeThumbRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleMinKeyDown = (
    e: ReactKeyboardEvent<HTMLInputElement>
  ): void => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        updateMinValue(displayedMinValue - 1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        updateMinValue(displayedMinValue + 1);
        break;
      case "Home":
        updateMinValue(0);
        break;
      case "End":
        updateMinValue(displayedMaxValue);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const handleMaxKeyDown = (
    e: ReactKeyboardEvent<HTMLInputElement>
  ): void => {
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        updateMaxValue(displayedMaxValue - 1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        updateMaxValue(displayedMaxValue + 1);
        break;
      case "Home":
        updateMaxValue(displayedMinValue);
        break;
      case "End":
        updateMaxValue(rangeMaxValue);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  return (
    <li className="w-full">
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-3">
          <span className="text-wrap">{label}</span>
          <span className="rounded-sm border border-border bg-surface-elevated px-1.5 py-1 text-right text-fg-muted">
            {displayedMinValue} - {displayedMaxValue}
          </span>
        </div>
        <div
          ref={trackRef}
          className={`relative h-6 ${disabled ? "opacity-50" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          <input
            type="range"
            aria-label={`Minimum ${label.toLowerCase()}`}
            min="0"
            max={rangeMaxValue}
            step="1"
            value={displayedMinValue}
            disabled={disabled}
            className="champion-filter-range-input"
            style={{
              clipPath: `inset(0 ${100 - midpointPercent}% 0 0)`,
              zIndex: displayedMinValue >= displayedMaxValue ? 3 : 2,
            }}
            onChange={(e) => handleMinChange(e.target.value)}
            onKeyDown={handleMinKeyDown}
          />
          <input
            type="range"
            aria-label={`Maximum ${label.toLowerCase()}`}
            min="0"
            max={rangeMaxValue}
            step="1"
            value={displayedMaxValue}
            disabled={disabled}
            className="champion-filter-range-input"
            style={{
              clipPath: `inset(0 0 0 ${midpointPercent}%)`,
              zIndex: 3,
            }}
            onChange={(e) => handleMaxChange(e.target.value)}
            onKeyDown={handleMaxKeyDown}
          />
        </div>
      </div>
    </li>
  );
};

type ChampionFilteringNumberProps = {
  label: string;
  value: string;
  step?: string;
  updateValueCallback: (value: number) => void;
};

const ChampionFilteringNumber = ({
  label,
  value,
  step = "1",
  updateValueCallback,
}: ChampionFilteringNumberProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOnFocus = (): void => {
    inputRef.current?.select();
  };

  return (
    <li className="w-full">
      <label className="flex flex-row w-full justify-between items-center gap-3">
        <span className="text-wrap">{label}</span>
        <input
          type="number"
          ref={inputRef}
          min="0"
          step={step}
          value={value}
          className="w-16 rounded-sm border border-border bg-surface-elevated px-1.5 py-1 text-right outline-none focus:border-accent"
          onFocus={handleOnFocus}
          onChange={(e) => updateValueCallback(toFilterNumber(e.target.value))}
        />
      </label>
    </li>
  );
};

export default ChampionFiltering;
