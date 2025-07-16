import type { championStatsDto, Orders } from "../types";
import useStatsAggregator from "./useStatsAggregator";

function useChampionSorter() {
  const { getWinrate } = useStatsAggregator();

  const SortByName = (
    data: championStatsDto[],
    order: Orders
  ): championStatsDto[] => {
    if (order === "ASC") {
      return [...data].sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      );
    }

    return [...data].sort((a, b) =>
      b.name.toLocaleLowerCase().localeCompare(a.name.toLocaleLowerCase())
    );
  };

  const SortByProgress = (
    data: championStatsDto[],
    order: Orders
  ): championStatsDto[] => {
    if (order === "ASC") {
      return [...data].sort((a, b) => b.stage - a.stage);
    }

    return [...data].sort((a, b) => a.stage - b.stage);
  };

  const SortByTimesPlayed = (
    data: championStatsDto[],
    order: Orders
  ): championStatsDto[] => {
    if (order === "ASC") {
      return [...data].sort((a, b) => b.timesPlayed - a.timesPlayed);
    }

    return [...data].sort((a, b) => a.timesPlayed - b.timesPlayed);
  };

  const SortByAvgPlacement = (
    data: championStatsDto[],
    order: Orders
  ): championStatsDto[] => {
    if (order === "ASC") {
      return [...data].sort((a, b) => b.placementAvg - a.placementAvg);
    }

    return [...data].sort((a, b) => a.placementAvg - b.placementAvg);
  };

  const SortByWinrate = (
    data: championStatsDto[],
    order: Orders
  ): championStatsDto[] => {
    if (order === "ASC") {
      return [...data].sort(
        (a, b) => getWinrate(b.placements) - getWinrate(a.placements)
      );
    }

    return [...data].sort(
      (a, b) => getWinrate(a.placements) - getWinrate(b.placements)
    );
  };

  return {
    SortByName,
    SortByProgress,
    SortByTimesPlayed,
    SortByWinrate,
    SortByAvgPlacement,
  };
}

export default useChampionSorter;
