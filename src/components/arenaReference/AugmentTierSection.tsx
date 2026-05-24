import type { augmentsData } from "../../types";
import AugmentCard from "./AugmentCard";

export interface AugmentTierGroup {
  rarity: number;
  name: string;
  augments: augmentsData[];
}

interface AugmentTierSectionProps {
  tier: AugmentTierGroup;
}

const AugmentTierSection = ({ tier }: AugmentTierSectionProps) => (
  <section
    aria-labelledby={`augment-tier-${tier.rarity}`}
    className="flex flex-col gap-3"
  >
    <header className="flex items-center gap-2">
      <h2
        id={`augment-tier-${tier.rarity}`}
        className="text-lg font-semibold text-fg"
      >
        {tier.name}
      </h2>
      <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold">
        {tier.augments.length}
      </span>
    </header>

    <div className="grid grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))] gap-2.5">
      {tier.augments.map((augment) => (
        <AugmentCard key={augment.id} augment={augment} />
      ))}
    </div>
  </section>
);

export default AugmentTierSection;
