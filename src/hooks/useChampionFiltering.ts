import { useMemo, useState } from "react";
import type { championData } from "../types";
import useSorter from "./useChampionSorter";
import useFuzzy from "./useFuzzy";

function useChampionFiltering() {
  const [nameFilter, setNameFilter] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<
    ("played" | "top4" | "won")[]
  >([]);
  const [orderBy, setOrderBy] = useState<
    "name" | "progress" | "played" | "winrate" | "placementAvg"
  >("name");
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [minimumPlayed, setMinimumPlayed] = useState<number>(0);

  const { SortByName, SortByProgress } = useSorter();
  const fuzzySearch = useFuzzy();

  // update rendered data
  const sortedFilteredData = useMemo(() => {
    let toBeRenderedData = [...championData];
    if (nameFilter) {
      toBeRenderedData = fuzzySearch(championData, nameFilter);
    }

    if (orderBy === "name") {
      SortByName(toBeRenderedData, orderDirection);
    } else if (orderBy === "progress") {
      SortByProgress(toBeRenderedData, orderDirection);
    }

    return toBeRenderedData;
  }, [
    nameFilter,
    orderBy,
    orderDirection,
    fuzzySearch,
    SortByName,
    SortByProgress,
  ]);

  return sortedFilteredData;
}
