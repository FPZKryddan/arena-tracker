import { useMemo } from "react";
import { ChampionsContext } from "../contexts/ChampionsContext";
import type { championData, PlacementDto, PlayerStats } from "../types";
import useContextIfDefined from "./useContextIfDefined";

export const getTotalMatches = (placements: PlacementDto): number => {
  let total = 0;
  for (let i = 1; i <= 8; i++) {
    total += i in placements ? placements[i] : 0;
  }
  return total;
};

export const getWins = (placements: PlacementDto): number => {
  let total = 0;
  for (let i = 1; i <= 4; i++) {
    total += i in placements ? placements[i] : 0;
  }
  return total;
};

export const getLosses = (placements: PlacementDto): number => {
  let total = 0;
  for (let i = 5; i <= 8; i++) {
    total += i in placements ? placements[i] : 0;
  }
  return total;
};

export const getWinrate = (placements: PlacementDto): number => {
  const wins = getWins(placements);
  const total = getTotalMatches(placements);
  if (total === 0) return 0;
  return Math.ceil((wins / total) * 100);
};

export type ProgressStatus = {
  total: number;
  played: number;
  top4: number;
  won: number;
};

export const computeProgressStatusOfChampions = (
  champions: championData[],
  stats: PlayerStats,
): ProgressStatus => {
  let played = 0;
  let top4 = 0;
  let won = 0;
  for (const champion of champions) {
    const champStat = stats.championStats[champion.id];
    if (!champStat) continue;
    switch (champStat.stage) {
      case 1:
        played++;
        break;
      case 2:
        top4++;
        break;
      case 3:
        won++;
        break;
    }
  }
  return { total: champions.length, played, top4, won };
};

function useStatsAggregator() {
  const { champions } = useContextIfDefined(ChampionsContext);

  const getProgressStatusOfChampions = useMemo(
    () => (stats: PlayerStats) =>
      computeProgressStatusOfChampions(champions, stats),
    [champions],
  );

  return {
    getProgressStatusOfChampions,
    getTotalMatches,
    getWins,
    getLosses,
    getWinrate,
  };
}

export default useStatsAggregator;
