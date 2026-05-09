import { useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
  hasActiveChampionFilters,
  type ChampionFilters,
  type ChampionStageFilter,
} from "./championFilters";

type ChampionFilteringProps = {
  filters: ChampionFilters;
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

const toFilterNumber = (value: string): number => {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return 0;
  return Math.max(0, nextValue);
};

const ChampionFiltering = ({
  filters,
  onFiltersChange,
}: ChampionFilteringProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const setShowCompleted = (showCompleted: boolean) =>
    onFiltersChange({ ...filters, showCompleted });
  const setShowNotPlayed = (showNotPlayed: boolean) =>
    onFiltersChange({ ...filters, showNotPlayed });
  const setStageFilter = (stageFilter: ChampionStageFilter) =>
    onFiltersChange({ ...filters, stageFilter });
  const setMinPlayedRequired = (minPlayedRequired: number) =>
    onFiltersChange({ ...filters, minPlayedRequired });
  const setMaxPlayedAllowed = (maxPlayedAllowed: number) =>
    onFiltersChange({ ...filters, maxPlayedAllowed });
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
          className={`rounded-lg p-1 bg-transparent outline-2 hover:cursor-pointer transition-all duration-100 ${
            filtersAreActive
              ? "outline-accent text-accent"
              : "outline-border-strong text-fg-muted hover:text-fg hover:outline-fg"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiOutlineAdjustmentsHorizontal className=" text-lg" />
        </button>
        <div
          className={`absolute bg-surface-elevated text-fg border border-border rounded-2xl p-4 w-[280px] top-full left-1/2 -translate-x-1/2 z-20 mt-[8px] text-nowrap shadow-2xl
        ${isOpen ? "flex" : "hidden"}`}
        >
          <ul className="text-[12px] flex flex-col gap-3 w-full">
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
            <ChampionFilteringNumber
              label="Min times played"
              value={String(filters.minPlayedRequired)}
              updateValueCallback={setMinPlayedRequired}
            />
            <ChampionFilteringNumber
              label="Max times played"
              value={String(filters.maxPlayedAllowed)}
              updateValueCallback={setMaxPlayedAllowed}
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
          isOpen ? "block" : "hidden       "
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
};

type ChampionFilteringSelectProps = {
  label: string;
  value: ChampionStageFilter;
  options: { label: string; value: ChampionStageFilter }[];
  updateValueCallback: (value: ChampionStageFilter) => void;
};

const ChampionFilteringSelect = ({
  label,
  value,
  options,
  updateValueCallback,
}: ChampionFilteringSelectProps) => {
  return (
    <li className="w-full">
      <label className="flex flex-row w-full justify-between items-center gap-3">
        <span className="text-wrap">{label}</span>
        <select
          value={value}
          className="w-32 rounded-md border border-border-strong bg-surface px-2 py-1 text-fg outline-none"
          onChange={(e) =>
            updateValueCallback(e.target.value as ChampionStageFilter)
          }
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
          className="h-[22px] w-auto aspect-square rounded-2xl"
          onChange={(e) => updateValueCallback(e.target.checked)}
        />
      </label>
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
          className="w-16 border-b-2 border-border-strong bg-transparent px-0.5 text-right outline-none"
          onFocus={handleOnFocus}
          onChange={(e) => updateValueCallback(toFilterNumber(e.target.value))}
        />
      </label>
    </li>
  );
};

export default ChampionFiltering;
