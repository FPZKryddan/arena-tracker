import type { championStatsDto } from "../../types";

export type ChampionFilters = {
  showCompleted: boolean;
  showNotPlayed: boolean;
  minPlayedRequired: number;
};

export const DEFAULT_CHAMPION_FILTERS: ChampionFilters = {
  showCompleted: true,
  showNotPlayed: true,
  minPlayedRequired: 0,
};

export const applyChampionFilters = (
  champions: championStatsDto[],
  filters: ChampionFilters
): championStatsDto[] => {
  const { showCompleted, showNotPlayed, minPlayedRequired } = filters;
  if (showCompleted && showNotPlayed && !minPlayedRequired) return champions;
  return champions.filter((c) => {
    if (!showCompleted && c.stage === 3) return false;
    if (!showNotPlayed && c.timesPlayed === 0) return false;
    if (minPlayedRequired && c.timesPlayed < minPlayedRequired) return false;
    return true;
  });
};
