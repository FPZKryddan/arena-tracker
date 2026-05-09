import { useRef, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import type { ChampionFilters } from "./championFilters";

type ChampionFilteringProps = {
  filters: ChampionFilters;
  onFiltersChange: (filters: ChampionFilters) => void;
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
  const setMinPlayedRequired = (minPlayedRequired: number) =>
    onFiltersChange({ ...filters, minPlayedRequired });

  return (
    <>
      <div className="relative">
        <button
          className="rounded-lg p-1 bg-transparent outline-2 outline-border-strong text-fg-muted hover:text-fg hover:cursor-pointer hover:outline-fg transition-all duration-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <HiOutlineAdjustmentsHorizontal className=" text-lg" />
        </button>
        <div
          className={`absolute bg-surface-elevated text-fg border border-border rounded-2xl p-4 w-[250px] top-full left-1/2 -translate-x-1/2 z-20 mt-[8px] text-nowrap shadow-2xl
        ${isOpen ? "flex" : "hidden"}`}
        >
          <ul className="text-[12px] flex flex-col gap-2 w-full">
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
            <ChampionFilteringNumber
              label="Min times played"
              value={String(filters.minPlayedRequired)}
              updateValueCallback={setMinPlayedRequired}
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
      <div className="flex flex-row w-full justify-between items-center">
        <p className="text-wrap">{label}</p>
        <input
          name="checkbox"
          type="checkbox"
          checked={value}
          className="h-[22px] w-auto aspect-square rounded-2xl"
          onChange={(e) => updateValueCallback(e.target.checked)}
        />
      </div>
    </li>
  );
};

type ChampionFilteringNumberProps = {
  label: string;
  value: string;
  updateValueCallback: (value: number) => void;
};

const ChampionFilteringNumber = ({
  label,
  value,
  updateValueCallback,
}: ChampionFilteringNumberProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOnFocus = (): void => {
    inputRef.current?.select();
  };

  return (
    <li className="w-full">
      <div className="flex flex-row w-full justify-between items-center">
        <p className="text-wrap">{label}</p>
        <input
          type="number"
          ref={inputRef}
          value={value}
          className="w-12 border-b-2 border-border-strong px-0.5"
          onFocus={handleOnFocus}
          onChange={(e) => updateValueCallback(Number(e.target.value))}
        />
      </div>
    </li>
  );
};

export default ChampionFiltering;
