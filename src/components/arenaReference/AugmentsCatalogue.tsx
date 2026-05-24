import { useMemo } from "react";
import { useAugmentsQuery } from "../../hooks/queries";
import type { augmentsData } from "../../types";
import AugmentTierSection from "./AugmentTierSection";
import { CatalogueSkeleton, CatalogueState } from "./CatalogueFeedback";
import { isDisplayAugment } from "./augmentRules";

interface AugmentsCatalogueProps {
  search: string;
}

const TIER_NAMES: Record<number, string> = {
  0: "Silver",
  1: "Gold",
  2: "Prismatic",
};

const AugmentsCatalogue = ({ search }: AugmentsCatalogueProps) => {
  const {
    data: augments = [],
    isError,
    isLoading,
    refetch,
  } = useAugmentsQuery();
  const normalizedSearch = search.trim().toLocaleLowerCase();

  const displayAugments = useMemo(
    () => augments.filter(isDisplayAugment),
    [augments],
  );
  const tierGroups = useMemo(() => {
    const groups = new Map<number, augmentsData[]>();

    displayAugments
      .filter((augment) =>
        augment.name.toLocaleLowerCase().includes(normalizedSearch),
      )
      .forEach((augment) => {
        const tier = groups.get(augment.rarity) ?? [];
        tier.push(augment);
        groups.set(augment.rarity, tier);
      });

    return Array.from(groups.entries())
      .sort(([rarityA], [rarityB]) => rarityB - rarityA)
      .map(([rarity, entries]) => ({
        rarity,
        name: TIER_NAMES[rarity] ?? `Tier ${rarity}`,
        augments: entries.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [displayAugments, normalizedSearch]);
  const visibleCount = tierGroups.reduce(
    (total, tier) => total + tier.augments.length,
    0,
  );

  if (isLoading) return <CatalogueSkeleton grouped label="Loading augments" />;
  if (isError) {
    return (
      <CatalogueState
        title="Could not load augments"
        body="The Arena augment list is unavailable right now."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }
  if (displayAugments.length === 0) {
    return (
      <CatalogueState
        title="No augments available"
        body="No Arena augments were returned."
      />
    );
  }
  if (visibleCount === 0) {
    return (
      <CatalogueState
        title="No matching augments"
        body={`No augments match "${search.trim()}".`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <p className="t-meta text-fg-muted">
        Showing {visibleCount} of {displayAugments.length} augments
      </p>
      {tierGroups.map((tier) => (
        <AugmentTierSection key={tier.rarity} tier={tier} />
      ))}
    </div>
  );
};

export default AugmentsCatalogue;
