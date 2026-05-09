import { memo } from "react";
import type { championStatsDto } from "../../types";
import { getWinrate } from "../../hooks/useStatsAggregator";
import { getChampionLoadingArtUrl } from "../../championIcon";
import ChampionStageProgress from "./ChampionStageProgress";

type ChampionCardGridProps = {
  champions: championStatsDto[];
  startRank: number;
  clickCallback: (champion: championStatsDto) => void;
};

const ChampionCardGrid = ({
  champions,
  startRank,
  clickCallback,
}: ChampionCardGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-2">
      {champions.map((champion, idx) => (
        <ChampionCard
          key={champion.id}
          rank={startRank + idx}
          champion={champion}
          clickCallback={clickCallback}
        />
      ))}
    </div>
  );
};

type ChampionCardProps = {
  rank: number;
  champion: championStatsDto;
  clickCallback: (champion: championStatsDto) => void;
};

const ChampionCard = memo(
  ({ rank, champion, clickCallback }: ChampionCardProps) => {
    const played = champion.timesPlayed;
    const avg =
      played > 0 ? Math.ceil(champion.placementAvg * 100) / 100 : "-";
    const wr = played > 0 ? getWinrate(champion.placements) + "%" : "-";
    const isComplete = champion.stage >= 3;

    return (
      <button
        type="button"
        onClick={() => clickCallback(champion)}
        className={`relative aspect-[3/4] rounded-md overflow-hidden border transition-all group cursor-pointer hover:ring-2 hover:ring-accent ${
          isComplete
            ? "border-success/50 shadow-[0_0_0_1px_var(--color-success-ring-shadow)]"
            : "border-transparent"
        }`}
      >
        <img
          src={getChampionLoadingArtUrl(champion.id)}
          alt={champion.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-media-scrim via-media-scrim/55 to-transparent" />
        <div className="absolute top-1 left-1 text-on-media/90 text-xs font-bold bg-media-scrim/45 rounded-full px-1.5 py-0.5">
          #{rank}
        </div>
        {isComplete && (
          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-media-scrim/55 p-0.5">
            <ChampionStageProgress stage={champion.stage} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-1.5 flex flex-col gap-1 text-on-media text-left">
          <p className="font-bold text-base truncate">{champion.name}</p>
          <div className="flex flex-wrap gap-1 text-[11px]">
            <CardStat label="P" value={String(played)} />
            <CardStat label="A" value={String(avg)} />
            <CardStat label="WR" value={wr} />
          </div>
        </div>
      </button>
    );
  }
);

const CardStat = ({ label, value }: { label: string; value: string }) => (
  <span className="bg-media-scrim/45 rounded px-1 py-[1px]">
    <span className="opacity-70">{label} </span>
    <span className="font-semibold">{value}</span>
  </span>
);

export default ChampionCardGrid;
