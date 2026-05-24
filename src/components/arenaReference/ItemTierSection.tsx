import ItemCard from "./ItemCard";
import type { ClassifiedArenaItem } from "./itemMetadata";

export interface ItemTierGroup {
  cost: number;
  label: string;
  items: ClassifiedArenaItem[];
}

interface ItemTierSectionProps {
  tier: ItemTierGroup;
  version: string;
}

const ItemTierSection = ({ tier, version }: ItemTierSectionProps) => (
  <section
    aria-labelledby={`item-tier-${tier.cost}`}
    className="flex flex-col gap-3"
  >
    <header className="flex items-center gap-2">
      <h2
        id={`item-tier-${tier.cost}`}
        className="t-h2 text-fg"
      >
        {tier.label}
      </h2>
      <span className="t-stat rounded-full border border-border px-2 py-0.5">
        {tier.items.length}
      </span>
    </header>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-2.5">
      {tier.items.map((item) => (
        <ItemCard key={item.id} item={item} version={version} />
      ))}
    </div>
  </section>
);

export default ItemTierSection;
