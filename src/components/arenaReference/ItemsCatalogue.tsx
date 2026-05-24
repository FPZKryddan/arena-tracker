import { useMemo, useState } from "react";
import { useItemDataQuery } from "../../hooks/queries";
import useDdragonVersion from "../../hooks/useDdragonVersion";
import { CatalogueSkeleton, CatalogueState } from "./CatalogueFeedback";
import ItemFiltering from "./ItemFiltering";
import ItemTierSection from "./ItemTierSection";
import {
  DEFAULT_ARENA_ITEM_FILTERS,
  hasActiveItemFilters,
  matchesItemFilters,
} from "./itemFilters";
import { ITEM_EFFECT_OPTIONS, ITEM_STAT_OPTIONS } from "./itemMetadata";
import { classifyArenaItem } from "./itemRoleRules";
import { ITEM_TIERS, isPurchasableArenaItem } from "./itemShopRules";

interface ItemsCatalogueProps {
  search: string;
}

const ItemsCatalogue = ({ search }: ItemsCatalogueProps) => {
  const [filters, setFilters] = useState(DEFAULT_ARENA_ITEM_FILTERS);
  const { data: items = {}, isError, isLoading, refetch } = useItemDataQuery();
  const ddragonVersion = useDdragonVersion();
  const normalizedSearch = search.trim().toLocaleLowerCase();

  const arenaItems = useMemo(
    () =>
      Object.entries(items)
        .filter(([, item]) => isPurchasableArenaItem(item))
        .map(([itemId, item]) =>
          classifyArenaItem({ ...item, id: Number(itemId) }),
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );
  const availableStats = useMemo(
    () =>
      ITEM_STAT_OPTIONS.filter(({ value }) =>
        arenaItems.some((item) => item.statKeys.has(value)),
      ),
    [arenaItems],
  );
  const availableEffects = useMemo(
    () =>
      ITEM_EFFECT_OPTIONS.filter(({ value }) =>
        arenaItems.some((item) => item.effectKeys.has(value)),
      ),
    [arenaItems],
  );
  const visibleItems = useMemo(
    () =>
      arenaItems.filter(
        (item) =>
          item.name.toLocaleLowerCase().includes(normalizedSearch) &&
          matchesItemFilters(item, filters),
      ),
    [arenaItems, filters, normalizedSearch],
  );
  const tierGroups = useMemo(
    () =>
      ITEM_TIERS.map(({ cost, label }) => ({
        cost,
        label,
        items: visibleItems.filter((item) => item.gold?.total === cost),
      })).filter((tier) => tier.items.length > 0),
    [visibleItems],
  );
  const visibleCount = visibleItems.length;
  const filtersAreActive = hasActiveItemFilters(filters);

  if (isLoading) return <CatalogueSkeleton grouped label="Loading items" />;
  if (isError) {
    return (
      <CatalogueState
        title="Could not load items"
        body="The Arena item list is unavailable right now."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }
  if (arenaItems.length === 0) {
    return (
      <CatalogueState
        title="No items available"
        body="No purchasable Arena items were returned."
      />
    );
  }
  return (
    <div className="flex flex-col gap-5">
      <ItemFiltering
        filters={filters}
        availableStats={availableStats}
        availableEffects={availableEffects}
        onFiltersChange={setFilters}
      />

      {visibleCount === 0 ? (
        <CatalogueState
          title="No matching items"
          body={
            filtersAreActive && normalizedSearch
              ? "No items match your search and selected filters."
              : filtersAreActive
                ? "No items match the selected filters."
                : `No items match "${search.trim()}".`
          }
        />
      ) : (
        <div className="flex flex-col gap-7">
          <p className="t-meta text-fg-muted">
            Showing {visibleCount} of {arenaItems.length} items
          </p>
          {tierGroups.map((tier) => (
            <ItemTierSection
              key={tier.cost}
              tier={tier}
              version={ddragonVersion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsCatalogue;
