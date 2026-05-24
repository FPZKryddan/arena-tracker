import { getCdragonAugmentIconUrl } from "../../utils/assetUrls";
import type { augmentsData } from "../../types";
import Tooltip from "../Tooltip/Tooltip";

interface AugmentCardProps {
  augment: augmentsData;
}

const AugmentCard = ({ augment }: AugmentCardProps) => (
  <Tooltip renderContent={() => <AugmentTooltip augment={augment} />}>
    <article className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-resting transition-colors hover:border-border-strong hover:bg-surface-hover">
      <div className="m-1 h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
        <img
          src={getCdragonAugmentIconUrl(augment.iconLarge)}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full rounded-md object-cover"
        />
      </div>
      <h3 className="t-h2 min-w-0">
        {augment.name}
      </h3>
    </article>
  </Tooltip>
);

const AugmentTooltip = ({ augment }: AugmentCardProps) => (
  <div className="flex max-w-sm items-start gap-3 whitespace-normal px-3 py-2.5">
    <div className="m-1 h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
      <img
        src={getCdragonAugmentIconUrl(augment.iconLarge)}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full rounded-md object-cover"
      />
    </div>
    <div className="min-w-0">
      <p className="t-h2">{augment.name}</p>
      <p className="t-body-sm mt-1 text-fg-muted">
        {augment.desc}
      </p>
    </div>
  </div>
);

export default AugmentCard;
