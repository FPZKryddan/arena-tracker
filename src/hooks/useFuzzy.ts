import { useCallback } from "react";
import type { championData } from "../types";

// Custom hook for fuzzy searching implemented with help from: https://learnersbucket.com/examples/interview/implement-a-fuzzy-search-in-javascript/
function useFuzzy() {
  const fuzzySearch = useCallback((str: string, query: string) => {
    str = str.toLocaleLowerCase();
    query = query.toLocaleLowerCase();

    let i: number = 0;
    let lastSearched: number = -1;
    let current: string = query[i];
    while (current) {
      if (!~(lastSearched = str.indexOf(current, lastSearched + 1))) {
        return false;
      }
      current = query[++i];
    }

    return true;
  }, []);

  const search = useCallback((arr: championData[], query: string) => {
    return arr.filter((champion) => fuzzySearch(champion.name, query));
  }, [fuzzySearch]);

  return search;
}

export default useFuzzy;
