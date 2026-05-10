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
        <AugmentTooltip name={augmentData.name} rank={rank} pickCount={pickCount} />
      )}
    >
      <div className="rounded-md border border-border bg-surface/70 p-[8px] transition-colors hover:border-border-strong hover:bg-surface-hover">
        <div className="flex min-w-0 flex-row items-center gap-[8px]">
          <span className="w-[22px] shrink-0 text-center text-[11px] font-bold text-fg-muted">
            #{rank}
          </span>
          <AugmentIcon augmentData={augmentData} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold leading-[16px]">
              {augmentData.name}
            </p>
            <p className="mt-[2px] text-[11px] font-medium leading-[14px] tabular-nums text-fg-muted">
              {pickCount}
            </p>
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

const AugmentIcon = ({
  augmentData,
}: {
  augmentData: augmentsData;
}) => (
  <div className="h-[32px] w-[32px] shrink-0 overflow-hidden rounded-md border border-border bg-surface-elevated">
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
  <div className="max-w-[220px] whitespace-normal px-[10px] py-[8px]">
    <p className="text-[13px] font-bold leading-[17px]">{name}</p>
    <div className="mt-[5px] flex flex-row items-center gap-[8px] text-[11px] font-semibold text-fg-muted">
      <span>#{rank}</span>
      <span className="h-[3px] w-[3px] rounded-full bg-fg-subtle" />
      <span className="tabular-nums">{pickCount}</span>
    </div>
  </div>
);

export default FavoriteAugment;
