import { useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import {
  hasActiveChampionFilters,
  type ChampionFilters,
  type ChampionRoleFilter,
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
