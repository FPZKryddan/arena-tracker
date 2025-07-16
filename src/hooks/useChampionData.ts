import { useCallback } from "react";
import type { championData } from "../types";
import useFetchData from "./useFetchData";

function useChampionData() {
  const { FetchChampionData } = useFetchData();

  const getChampions = useCallback(async (): Promise<championData[]> => {
    return await FetchChampionData();
  }, [FetchChampionData]);

  return {
    getChampions
  };
}

export default useChampionData;
