import type { championStatsDto } from "../../types";
import { getWinrate } from "../../hooks/useStatsAggregator";

export type ChampionFilters = {
  showCompleted: boolean;
  showNotPlayed: boolean;
  stageFilter: ChampionStageFilter;
  minPlayedRequired: number;
  maxPlayedAllowed: number;
  minWinrateRequired: number;
  maxAvgPlacement: number;
};

export type ChampionStageFilter =
  | "ALL"
  | "NOT_PLAYED"
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "UNFINISHED";

export const DEFAULT_CHAMPION_FILTERS: ChampionFilters = {
  showCompleted: true,
  showNotPlayed: true,
  stageFilter: "ALL",
  minPlayedRequired: 0,
  maxPlayedAllowed: 0,
  minWinrateRequired: 0,
  maxAvgPlacement: 0,
};

const matchesStageFilter = (
  champion: championStatsDto,
  stageFilter: ChampionStageFilter
): boolean => {
  switch (stageFilter) {
    case "NOT_PLAYED":
      return champion.timesPlayed === 0;
    case "STAGE_1":
      return champion.stage === 1;
    case "STAGE_2":
      return champion.stage === 2;
    case "STAGE_3":
      return champion.stage >= 3;
    case "UNFINISHED":
      return champion.stage < 3;
    case "ALL":
    default:
      return true;
  }
};

export const hasActiveChampionFilters = (filters: ChampionFilters): boolean =>
  !filters.showCompleted ||
  !filters.showNotPlayed ||
  filters.stageFilter !== "ALL" ||
  filters.minPlayedRequired > 0 ||
  filters.maxPlayedAllowed > 0 ||
  filters.minWinrateRequired > 0 ||
  filters.maxAvgPlacement > 0;

export const applyChampionFilters = (
  champions: championStatsDto[],
  filters: ChampionFilters
): championStatsDto[] => {
  const {
    showCompleted,
    showNotPlayed,
    stageFilter,
    minPlayedRequired,
    maxPlayedAllowed,
    minWinrateRequired,
    maxAvgPlacement,
  } = filters;
  if (!hasActiveChampionFilters(filters)) return champions;
  return champions.filter((c) => {
    if (!showCompleted && c.stage >= 3) return false;
    if (!showNotPlayed && c.timesPlayed === 0) return false;
    if (!matchesStageFilter(c, stageFilter)) return false;
    if (minPlayedRequired && c.timesPlayed < minPlayedRequired) return false;
    if (maxPlayedAllowed && c.timesPlayed > maxPlayedAllowed) return false;
    if (minWinrateRequired && getWinrate(c.placements) < minWinrateRequired) {
      return false;
    }
    if (
      maxAvgPlacement &&
      (c.timesPlayed === 0 || c.placementAvg > maxAvgPlacement)
    ) {
      return false;
    }
    return true;
  });
};
