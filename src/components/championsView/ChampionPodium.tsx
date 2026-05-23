import { memo } from "react";
import type { championStatsDto } from "../../types";
import { getWinrate } from "../../hooks/useStatsAggregator";
import { getChampionLoadingArtUrl } from "../../championIcon";
import ChampionStageProgress from "./ChampionStageProgress";

type ChampionPodiumProps = {
  champions: championStatsDto[];
  clickCallback?: (champion: championStatsDto) => void;
  interactive?: boolean;
};

const ChampionPodium = ({
  champions,
  clickCallback,
  interactive = true,
}: ChampionPodiumProps) => {
  if (champions.length === 0) return null;

  const [first, second, third] = champions;

  return (
    <div className="flex w-full flex-row items-end justify-center gap-1.5 sm:gap-3">
      {second && (
        <PodiumSlot
          rank={2}
          champion={second}
          clickCallback={clickCallback}
          interactive={interactive}
        />
      )}
      <PodiumSlot
        rank={1}
        champion={first}
        clickCallback={clickCallback}
        interactive={interactive}
      />
      {third && (
        <PodiumSlot
          rank={3}
          champion={third}
          clickCallback={clickCallback}
          interactive={interactive}
        />
      )}
    </div>
  );
};

type RankStyle = {
  height: string;
  border: string;
  badge: string;
  label: string;
};

const RANK_STYLES: Record<1 | 2 | 3, RankStyle> = {
  1: {
    height: "h-64 sm:h-72",
    border: "border-placement-first",
    badge: "bg-placement-first text-placement-first-fg",
    label: "1st",
  },
  2: {
    height: "h-56 sm:h-64",
    border: "border-rank-second",
    badge: "bg-rank-second text-rank-second-fg",
    label: "2nd",
  },
  3: {
    height: "h-48 sm:h-56",
    border: "border-rank-third",
    badge: "bg-rank-third text-rank-third-fg",
    label: "3rd",
  },
};

type PodiumSlotProps = {
  rank: 1 | 2 | 3;
  champion: championStatsDto;
  clickCallback?: (champion: championStatsDto) => void;
  interactive: boolean;
};

const PodiumSlot = memo(
  ({ rank, champion, clickCallback, interactive }: PodiumSlotProps) => {
    const style = RANK_STYLES[rank];
    const played = champion.timesPlayed;
    const avg =
      played > 0 ? Math.ceil(champion.placementAvg * 100) / 100 : "-";
    const wr = played > 0 ? getWinrate(champion.placements) + "%" : "-";
    const isComplete = champion.stage >= 3;

    const className = `group relative min-w-0 flex-1 overflow-hidden rounded-md border ${style.height} ${style.border} transition-colors ${
      interactive ? "cursor-pointer hover:border-accent" : "cursor-default"
    } ${isComplete ? "outline outline-1 outline-success/60" : ""}`;
    const imageClassName = `absolute inset-0 h-full w-full object-cover object-top ${
      interactive ? "transition-transform duration-300 group-hover:scale-[1.03]" : ""
    }`;
    const content = (
      <>
        <img
          src={getChampionLoadingArtUrl(champion.id)}
          alt={champion.name}
          loading="lazy"
          decoding="async"
          className={imageClassName}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-media-scrim via-media-scrim/65 to-transparent" />
        <div
          className={`absolute left-2 top-2 rounded-sm ${style.badge} px-2 py-0.5 text-xs font-semibold`}
        >
          {style.label}
        </div>
        {isComplete && (
          <div className="absolute right-2 top-2 h-6 w-6 rounded-sm bg-media-scrim/55 p-0.5">
            <ChampionStageProgress stage={champion.stage} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1.5 p-1.5 text-left text-on-media sm:p-2">
          <p className="truncate text-sm font-semibold">
            {champion.name}
          </p>
          <div className="grid grid-cols-1 gap-0.5 text-xs sm:grid-cols-3 sm:gap-1">
            <PodiumStat label="Played" value={String(played)} />
            <PodiumStat label="Avg" value={String(avg)} />
            <PodiumStat label="WR" value={wr} />
          </div>
        </div>
      </>
    );

    if (!interactive) {
      return <div className={className}>{content}</div>;
    }

    return (
      <button
        type="button"
        onClick={() => clickCallback?.(champion)}
        className={className}
      >
        {content}
      </button>
    );
  }
);

const PodiumStat = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex min-w-0 items-center justify-between gap-1 rounded-sm bg-media-scrim/35 px-1 py-0.5 leading-tight sm:flex-col sm:items-start sm:justify-start sm:bg-transparent sm:px-0 sm:py-0">
    <span className="truncate uppercase opacity-70">
      {label}
    </span>
    <span className="truncate font-semibold tabular-nums">{value}</span>
  </div>
);

export default ChampionPodium;
