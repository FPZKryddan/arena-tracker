import { memo } from "react";
import type { championStatsDto } from "../../types";
import { getWinrate } from "../../hooks/useStatsAggregator";
import { getChampionLoadingArtUrl } from "../../championIcon";
import ChampionStageProgress from "./ChampionStageProgress";

type ChampionPodiumProps = {
  champions: championStatsDto[];
  clickCallback: (champion: championStatsDto) => void;
};

const ChampionPodium = ({
  champions,
  clickCallback,
}: ChampionPodiumProps) => {
  if (champions.length === 0) return null;

  const [first, second, third] = champions;

  return (
    <div className="flex flex-row items-end justify-center gap-2 sm:gap-3 w-full">
      {second && (
        <PodiumSlot
          rank={2}
          champion={second}
          clickCallback={clickCallback}
        />
      )}
      <PodiumSlot rank={1} champion={first} clickCallback={clickCallback} />
      {third && (
        <PodiumSlot
          rank={3}
          champion={third}
          clickCallback={clickCallback}
        />
      )}
    </div>
  );
};

type RankStyle = {
  height: string;
  ring: string;
  glow: string;
  badge: string;
  label: string;
};

const RANK_STYLES: Record<1 | 2 | 3, RankStyle> = {
  1: {
    height: "h-[260px] sm:h-[300px]",
    ring: "ring-2 ring-yellow-400",
    glow: "shadow-[0_0_24px_rgba(250,204,21,0.45)]",
    badge: "bg-yellow-400 text-black",
    label: "1st",
  },
  2: {
    height: "h-[220px] sm:h-[250px]",
    ring: "ring-2 ring-zinc-300",
    glow: "shadow-[0_0_18px_rgba(212,212,216,0.35)]",
    badge: "bg-zinc-300 text-black",
    label: "2nd",
  },
  3: {
    height: "h-[200px] sm:h-[225px]",
    ring: "ring-2 ring-amber-700",
    glow: "shadow-[0_0_16px_rgba(180,83,9,0.35)]",
    badge: "bg-amber-700 text-white",
    label: "3rd",
  },
};

type PodiumSlotProps = {
  rank: 1 | 2 | 3;
  champion: championStatsDto;
  clickCallback: (champion: championStatsDto) => void;
};

const PodiumSlot = memo(
  ({ rank, champion, clickCallback }: PodiumSlotProps) => {
    const style = RANK_STYLES[rank];
    const played = champion.timesPlayed;
    const avg =
      played > 0 ? Math.ceil(champion.placementAvg * 100) / 100 : "-";
    const wr = played > 0 ? getWinrate(champion.placements) + "%" : "-";

    return (
      <button
        type="button"
        onClick={() => clickCallback(champion)}
        className={`relative flex-1 min-w-0 ${style.height} rounded-lg overflow-hidden ${style.ring} ${style.glow} hover:scale-[1.02] transition-transform group cursor-pointer`}
      >
        <img
          src={getChampionLoadingArtUrl(champion.id)}
          alt={champion.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-transparent" />
        <div
          className={`absolute top-2 left-2 ${style.badge} text-[10px] font-bold rounded-full px-2 py-0.5`}
        >
          {style.label}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col gap-1.5 text-white text-left">
          <p className="font-bold text-sm truncate">{champion.name}</p>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <PodiumStat label="Played" value={String(played)} />
            <PodiumStat label="Avg" value={String(avg)} />
            <PodiumStat label="WR" value={wr} />
          </div>
          <div className="h-4 mt-0.5">
            <ChampionStageProgress stage={champion.stage} />
          </div>
        </div>
      </button>
    );
  }
);

const PodiumStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col leading-tight">
    <span className="opacity-70 text-[8px] uppercase tracking-wide">
      {label}
    </span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default ChampionPodium;
