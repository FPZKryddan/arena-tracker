import type { augmentsData } from "../../types";
import Tooltip from "../Tooltip/Tooltip";

interface FavoriteAugmentProps {
  picked: number;
  rank: number;
  augmentData: augmentsData;
}

const BASE_ICON_URL = "https://raw.communitydragon.org/latest/game/";

const formatPickCount = (picked: number) =>
  `${picked} ${picked === 1 ? "pick" : "picks"}`;

const FavoriteAugment = ({
  picked,
  rank,
  augmentData,
}: FavoriteAugmentProps) => {
  const pickCount = formatPickCount(picked);

  return (
    <Tooltip
      renderContent={() => (
        <AugmentTooltip
          name={augmentData.name}
          rank={rank}
          pickCount={pickCount}
        />
      )}
    >
      <div className="rounded-md border border-border bg-surface/70 p-2 transition-colors hover:border-border-strong hover:bg-surface-hover">
        <div className="flex min-w-0 flex-row items-center gap-2">
          <span className="t-stat w-5 shrink-0 text-center text-fg-muted">
            #{rank}
          </span>
          <AugmentIcon augmentData={augmentData} />
          <div className="min-w-0 flex-1">
            <p className="t-label truncate">
              {augmentData.name}
            </p>
            <p className="t-stat mt-0.5 text-fg-muted">
              {pickCount}
            </p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

const AugmentIcon = ({ augmentData }: { augmentData: augmentsData }) => (
  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
    <img
      src={BASE_ICON_URL + augmentData.iconLarge}
      alt={augmentData.name}
      loading="lazy"
      decoding="async"
      className="relative h-full w-full rounded-md bg-surface-elevated"
    />
  </div>
);

const AugmentTooltip = ({
  name,
  rank,
  pickCount,
}: {
  name: string;
  rank: number;
  pickCount: string;
}) => (
  <div className="max-w-xs whitespace-normal px-2.5 py-2">
    <p className="t-label">{name}</p>
    <div className="mt-1 flex flex-row items-center gap-2 text-fg-muted">
      <span className="t-stat">#{rank}</span>
      <span className="h-0.5 w-0.5 rounded-full bg-fg-subtle" />
      <span className="t-stat">{pickCount}</span>
    </div>
  </div>
);

export default FavoriteAugment;
