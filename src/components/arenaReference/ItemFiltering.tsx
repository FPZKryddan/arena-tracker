import { useCallback, useState } from "react";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { IoClose } from "react-icons/io5";
import useClickOutside from "../../hooks/useClickOutside";
import GameStatIcon from "../common/GameStatIcon";
import {
  ITEM_ROLE_OPTIONS,
  type ArenaItemEffectKey,
  type ArenaItemRole,
  type ArenaItemStatKey,
  type ItemFilterOption,
} from "./itemMetadata";
import { hasActiveItemFilters, type ArenaItemFilters } from "./itemFilters";

interface ItemFilteringProps {
  filters: ArenaItemFilters;
  availableStats: readonly ItemFilterOption<ArenaItemStatKey>[];
  availableEffects: readonly ItemFilterOption<ArenaItemEffectKey>[];
  onFiltersChange: (filters: ArenaItemFilters) => void;
}

type SelectedFilter =
  | { group: "roles"; value: ArenaItemRole; label: string }
  | { group: "stats"; value: ArenaItemStatKey; label: string }
  | { group: "effects"; value: ArenaItemEffectKey; label: string };

const toggleValue = <TValue extends string>(
  values: TValue[],
  value: TValue,
): TValue[] =>
  values.includes(value)
    ? values.filter((selectedValue) => selectedValue !== value)
    : [...values, value];

const ItemFiltering = ({
  filters,
  availableStats,
  availableEffects,
  onFiltersChange,
}: ItemFilteringProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const dropdownRef = useClickOutside<HTMLDivElement>(isOpen, closeDropdown);
  const filtersAreActive = hasActiveItemFilters(filters);
  const selectedFilters: SelectedFilter[] = [
    ...ITEM_ROLE_OPTIONS.filter(({ value }) =>
      filters.roles.includes(value),
    ).map(({ value, label }) => ({ group: "roles" as const, value, label })),
    ...availableStats
      .filter(({ value }) => filters.stats.includes(value))
      .map(({ value, label }) => ({ group: "stats" as const, value, label })),
    ...availableEffects
      .filter(({ value }) => filters.effects.includes(value))
      .map(({ value, label }) => ({ group: "effects" as const, value, label })),
  ];

  const removeFilter = (filter: SelectedFilter): void => {
    onFiltersChange({
      ...filters,
      [filter.group]: filters[filter.group].filter(
        (selectedValue) => selectedValue !== filter.value,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="arena-item-filters-panel"
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer ${
              filtersAreActive
                ? "border-accent bg-accent text-accent-fg"
                : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg"
            }`}
            onClick={() => setIsOpen((open) => !open)}
          >
            <HiOutlineAdjustmentsHorizontal className="text-lg" />
            Filters
            {selectedFilters.length > 0 && (
              <span className="rounded-full bg-surface px-1.5 text-xs text-fg">
                {selectedFilters.length}
              </span>
            )}
          </button>

          {isOpen && (
            <section
              id="arena-item-filters-panel"
              aria-label="Item filters"
              className="absolute left-0 top-full z-20 mt-2 flex w-72 flex-col gap-4 rounded-lg border border-border bg-surface p-4 text-fg shadow-raised sm:w-[36rem]"
            >
              <p className="text-xs text-fg-muted">
                Items must match every selected filter.
              </p>
              <FilterGroup
                label="Roles"
                options={ITEM_ROLE_OPTIONS}
                selectedValues={filters.roles}
                onToggle={(role) =>
                  onFiltersChange({
                    ...filters,
                    roles: toggleValue(filters.roles, role),
                  })
                }
              />
              <FilterGroup
                label="Granted stats"
                options={availableStats}
                selectedValues={filters.stats}
                renderIcon={(stat) => <GameStatIcon stat={stat} />}
                onToggle={(stat) =>
                  onFiltersChange({
                    ...filters,
                    stats: toggleValue(filters.stats, stat),
                  })
                }
              />
              <FilterGroup
                label="Effects"
                options={availableEffects}
                selectedValues={filters.effects}
                onToggle={(effect) =>
                  onFiltersChange({
                    ...filters,
                    effects: toggleValue(filters.effects, effect),
                  })
                }
              />
            </section>
          )}
        </div>

        {filtersAreActive && (
          <button
            type="button"
            className="text-xs font-medium text-fg-muted transition-colors hover:text-fg"
            onClick={() =>
              onFiltersChange({ roles: [], stats: [], effects: [] })
            }
          >
            Clear filters
          </button>
        )}
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Active item filters">
          {selectedFilters.map((filter) => (
            <button
              key={`${filter.group}-${filter.value}`}
              type="button"
              aria-label={`Remove ${filter.label} filter`}
              className="flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-1 text-xs font-medium text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
              onClick={() => removeFilter(filter)}
            >
              {filter.group === "stats" && <GameStatIcon stat={filter.value} />}
              {filter.label}
              <IoClose className="text-sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface FilterGroupProps<TValue extends string> {
  label: string;
  options: readonly ItemFilterOption<TValue>[];
  selectedValues: TValue[];
  onToggle: (value: TValue) => void;
  renderIcon?: (value: TValue) => React.ReactNode;
}

const FilterGroup = <TValue extends string>({
  label,
  options,
  selectedValues,
  onToggle,
  renderIcon,
}: FilterGroupProps<TValue>) => (
  <section className="flex flex-col gap-2">
    <legend className="text-xs font-semibold uppercase text-fg-subtle">
      {label}
    </legend>
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label: optionLabel }) => {
        const selected = selectedValues.includes(value);

        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              selected
                ? "border-accent bg-accent text-accent-fg"
                : "border-border bg-surface-elevated text-fg-muted hover:border-border-strong hover:text-fg"
            }`}
            onClick={() => onToggle(value)}
          >
            {renderIcon?.(value)}
            {optionLabel}
          </button>
        );
      })}
    </div>
  </section>
);

export default ItemFiltering;
